
import { GoogleGenAI, Type } from "@google/genai";
import { TriageResult, RiskLevel, ProviderResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. CHAT PHASE: Real-time Investigator + Medication/Nutrition Hub + Recovery Companion
export const CHAT_SYSTEM_INSTRUCTION = `
You are DoctorCompass, a highly advanced Clinical & Biochemical Intelligence Unit.
You maintain a "Stackable Context" of the patient's health.

**CORE CAPABILITIES**:

1.  **SYMPTOM TRIAGE (Active Issues)**:
    *   Investigate root causes. Check location/weather context.
    *   *Stackable Context Rule*: Connect previous ailments to current ones.

2.  **RECOVERY COMPANION (Post-Care/Management)**:
    *   **Trigger**: If user says "I had an accident", "I was discharged", "I have a cast", or "How do I take care of X".
    *   **Action**: Shift focus from diagnosis to **MANAGEMENT**.
    *   **Inquiry Protocol**:
        *   Ask: "What specific procedure was done?"
        *   Ask: "What medications were prescribed?" (Names, dosage).
        *   Ask: "Did the doctor give specific instructions about water exposure or movement?"
    *   **Goal**: Gather info to generate a "Daily Care Routine" (Shower safety, bandage changes, sleep positioning).

3.  **MEDICINE & NUTRITION HUB**:
    *   Check Drug-Drug/Food interactions. Warn about CYP450 interactions.

**INTERACTION PROTOCOL**:
-   **Context Gathering**: Always confirm Age/Sex if not known.
-   **Safety First**: If a combination is deadly, start with "⚠️ HIGH RISK WARNING".
-   **Output Style**: Clear paragraph breaks. Bullet points.
-   **Disclaimer**: "Please verify with your pharmacist."

When you have enough info for a clinical report (Diagnosis OR Recovery Plan), remind the user they can click "Generate Medical Report".
`;

// 2. ANALYSIS PHASE: The "Super Smart" Doctor
const TRIAGE_SYSTEM_INSTRUCTION = `
You are a Senior Chief Medical Officer.
Your task is to generate a high-precision medical analysis based on the *entire* patient conversation history.

**Advanced Reasoning Requirements**:
1.  **Mode Detection**: Determine if this is a **NEW DIAGNOSIS** (Unknown symptoms) or **RECOVERY MANAGEMENT** (User already saw doctor/knows issue).
    - If Recovery: Set 'isRecoveryAnalysis' to true. Focus advice on maintenance, hygiene, and preventing relapse.
    - If Diagnosis: Set 'isRecoveryAnalysis' to false. Focus on risk stratification.
2.  **Medication Parsing**: Extract any mentioned medications into the 'medicationSchedule'.
3.  **Severity vs Urgency**: 
    - In Recovery Mode: "Urgent" means "Complications detected" (e.g. infection). "Self Care" means "Healing normally".

**Output Requirements**:
-   **Condition Name**: Precise clinical terminology (e.g. "Post-Operative Tibial Fracture Care").
-   **Daily Routine**: Create a structured Morning/Day/Night plan.

DISCLAIMER: Educational purpose only.
`;

export const analyzeSymptoms = async (chatHistory: { role: string; text: string }[]): Promise<TriageResult> => {
  const conversationText = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n');
  
  const prompt = `
  Perform a deep clinical review of this patient's *entire* conversation history.
  Look for patterns over time. Determine if this is a new issue or a recovery scenario.
  
  Patient Interview Transcript:
  ${conversationText}
  
  Generate a JSON response with the following schema.
  `;

  // Using Gemini 3 Pro for complex medical reasoning
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', 
    contents: prompt,
    config: {
      systemInstruction: TRIAGE_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      // Thinking budget for deep analysis
      thinkingConfig: { thinkingBudget: 2048 }, 
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: {
            type: Type.STRING,
            enum: [RiskLevel.URGENT, RiskLevel.CONSULT_SOON, RiskLevel.SELF_CARE],
            description: "The calculated risk level."
          },
          summary: {
            type: Type.STRING,
            description: "A summary of why this conclusion was reached."
          },
          specialist: {
            type: Type.STRING,
            description: "Recommended specialist."
          },
          recommendedTimeline: {
            type: Type.STRING,
            description: "Timeline for seeking care."
          },
          careAdvice: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Immediate actions."
          },
          disclaimer: {
            type: Type.STRING,
            description: "Medical disclaimer."
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              conditionName: { type: Type.STRING, description: "Scientific or common name of the likely condition." },
              description: { type: Type.STRING, description: "General description of the condition." },
              pathophysiology: { type: Type.STRING, description: "Detailed explanation of the biological mechanism." },
              typicalSymptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of standard symptoms." },
              causes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of general root causes." },
              
              personalizedRootCause: { type: Type.STRING, description: "Why this specifically happened to THIS user based on their chat history." },
              recurrenceLikelihood: { type: Type.STRING, description: "Likelihood of this happening again and why." },
              severityScore: { type: Type.INTEGER, description: "1 to 10 scale of clinical severity (damage/pain)." },
              severityExplanation: { type: Type.STRING, description: "Short explanation of the severity score." },
              contextType: { type: Type.STRING, enum: ['ACTIVE_ISSUE', 'HISTORICAL_CURIOSITY'], description: "Is this a current problem or a past query?" },
              
              // NEW FIELDS FOR RECOVERY
              isRecoveryAnalysis: { type: Type.BOOLEAN, description: "True if user is already treated/diagnosed and asking for care tips." },
              medicationSchedule: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          instruction: { type: Type.STRING },
                          timing: { type: Type.STRING }
                      },
                      required: ["name", "instruction", "timing"]
                  },
                  description: "List of medications mentioned or recommended."
              },
              dailyRoutine: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          timeOfDay: { type: Type.STRING },
                          task: { type: Type.STRING },
                          reason: { type: Type.STRING }
                      },
                      required: ["timeOfDay", "task", "reason"]
                  },
                  description: "Step by step daily care guide (e.g. hygiene, positioning)."
              },

              frequency: { type: Type.STRING, description: "How common is this?" },
              duration: { type: Type.STRING, description: "Typical duration." },
              complications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential complications if untreated." },
              treatments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Standard medical treatments." },
              remedies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Home remedies or OTC options." },
              prevention: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific actionable steps to prevent recurrence." },
              recovery: {
                type: Type.OBJECT,
                properties: {
                    canTreatAtHome: { type: Type.BOOLEAN, description: "Is home care sufficient?" },
                    homeRecoveryTime: { type: Type.STRING, description: "Estimated time to heal with home care." },
                    professionalRecoveryTime: { type: Type.STRING, description: "Estimated time to heal with professional intervention." },
                    criticality: { type: Type.STRING, description: "Severity assessment (e.g. Self-limiting, Progressive)." }
                },
                required: ["canTreatAtHome", "homeRecoveryTime", "professionalRecoveryTime", "criticality"]
              }
            },
            required: ["conditionName", "description", "pathophysiology", "typicalSymptoms", "causes", "personalizedRootCause", "recurrenceLikelihood", "severityScore", "severityExplanation", "contextType", "isRecoveryAnalysis", "medicationSchedule", "dailyRoutine", "frequency", "duration", "complications", "treatments", "remedies", "prevention", "recovery"]
          },
          symptomTable: {
            type: Type.ARRAY,
            description: "A list comparing user symptoms to the condition.",
            items: {
              type: Type.OBJECT,
              properties: {
                symptom: { type: Type.STRING },
                isPresent: { type: Type.BOOLEAN, description: "Did the user report this?" },
                notes: { type: Type.STRING, description: "Context specific to the user." }
              },
              required: ["symptom", "isPresent", "notes"]
            }
          }
        },
        required: ["riskLevel", "summary", "specialist", "recommendedTimeline", "careAdvice", "disclaimer", "analysis", "symptomTable"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate triage analysis.");
  }

  return JSON.parse(response.text) as TriageResult;
};

export const findProviders = async (specialist: string, lat?: number, lng?: number): Promise<ProviderResult> => {
  if (!lat || !lng) {
     return { text: "Location unavailable.", chunks: [] };
  }

  const prompt = `Find highly-rated ${specialist}s or appropriate medical facilities near me. List 3 options.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        googleMaps: {
          capabilities: {
             retrievalConfig: {
                latLng: {
                  latitude: lat,
                  longitude: lng
                }
             }
          }
        }
      }
    }
  });

  const text = response.text || "No specific providers found.";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return {
    text,
    chunks: chunks as any[] 
  };
};

export const streamChatResponse = async (history: { role: string; text: string }[], newMessage: string) => {
    const contents = [
        ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: newMessage }] }
    ];

    // Using 2.5 Flash for the Chat to support Google Search Grounding and faster interaction
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: CHAT_SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }], // Enable Access to Real-World Knowledge
            maxOutputTokens: 8000, // Significantly increased to prevent cutoff
        }
    });

    return response.text || "I'm having trouble understanding. Could you rephrase?";
};

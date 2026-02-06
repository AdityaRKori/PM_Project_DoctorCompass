
export enum RiskLevel {
  URGENT = 'URGENT',
  CONSULT_SOON = 'CONSULT_SOON',
  SELF_CARE = 'SELF_CARE'
}

export interface SymptomMatch {
  symptom: string;
  isPresent: boolean;
  notes: string;
}

export interface RecoveryOutlook {
  canTreatAtHome: boolean;
  homeRecoveryTime: string; // e.g. "5-7 days with strict rest"
  professionalRecoveryTime: string; // e.g. "Immediate relief after cauterization"
  criticality: string; // e.g. "Self-limiting" or "Progressive"
}

export interface MedicationItem {
  name: string;
  instruction: string;
  timing: string; // e.g. "Twice daily after food"
}

export interface RoutineStep {
  timeOfDay: string; // e.g. "Morning", "Before Shower", "Night"
  task: string;
  reason: string;
}

export interface DetailedAnalysis {
  conditionName: string;
  description: string;
  pathophysiology: string;
  typicalSymptoms: string[];
  causes: string[]; 
  personalizedRootCause: string;
  recurrenceLikelihood: string;
  severityScore: number;
  severityExplanation: string;
  contextType: 'ACTIVE_ISSUE' | 'HISTORICAL_CURIOSITY';
  
  // NEW: Recovery Specific Fields
  isRecoveryAnalysis: boolean; // Is this a post-care/management plan?
  medicationSchedule: MedicationItem[]; // List of prescribed or suggested meds
  dailyRoutine: RoutineStep[]; // Step by step care guide
  
  frequency: string;
  duration: string;
  complications: string[];
  treatments: string[];
  remedies: string[];
  prevention: string[];
  recovery: RecoveryOutlook; 
}

export interface TriageResult {
  riskLevel: RiskLevel;
  summary: string;
  specialist: string;
  recommendedTimeline: string;
  careAdvice: string[];
  disclaimer: string;
  analysis: DetailedAnalysis;
  symptomTable: SymptomMatch[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MapGroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets?: {
            snippet: string;
            authorAttribution?: {
                displayName: string;
            }
        }[]
    }
  }
}

export interface ProviderResult {
  text: string;
  chunks: MapGroundingChunk[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  conditionName: string;
  riskLevel: RiskLevel;
  summary: string;
  result: TriageResult;
}

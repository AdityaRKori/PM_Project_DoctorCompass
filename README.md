
# Public App Access
[**Click here to use DoctorCompass**](https://ai.studio/apps/drive/1mBHd1QvDnsn5mfB2ECJXIhKyksFTmjn7?fullscreenApplet=true)

---

<div align="center">
  <img src="img/Screenshot%202026-02-06%20133030.png" alt="DoctorCompass Logo" width="400"/>
  <h1>DoctorCompass</h1>
  <h3>"A care AI that guides you to the right medical advice"</h3>
</div>

---

## 🏥 The Problem Statement
In the age of information, people often turn to Google or general LLMs when they feel sick. This leads to **"Cyberchondria"**—unnecessary anxiety caused by misinterpreting medical information online.
*   **Search Engines** give listicles of cancer for a simple headache.
*   **Forums** provide anecdotal evidence that is often dangerous.
*   **General AI** lacks the clinical "thinking" context to stratify risk or manage recovery properly.
*   **Post-Care Confusion**: Patients discharged from hospitals often forget their care instructions or lose their paper slips, leading to readmissions or infections.

## 🎯 Objective
**DoctorCompass** is a specialized Medical Intelligence Agent designed to bridge the gap between "Dr. Google" and a real physician. It is a **Clinical Decision Support System (CDSS)** meant for triage, education, and recovery management. 

It does not just "chat"; it **investigates**, **analyzes**, and **plans**.

## 🧠 Methodology & Tech Stack
This project utilizes a **Product Management (PM) led approach** to solve healthcare navigation, prioritizing user safety, clarity, and actionable outcomes.

### 1. Stackable Context Engine
Unlike standard chatbots that treat every query as new, DoctorCompass maintains a "Patient State". If you mentioned a headache yesterday and a fever today, it connects the dots (e.g., Meningitis risk) rather than treating them separately.

### 2. Dual-Phase Intelligence
*   **Phase 1: Investigator (Gemini 2.5 Flash)**
    *   Fast, real-time interaction.
    *   Uses **Google Search Grounding** to check local outbreaks or weather-related health risks.
    *   Handles **Drug-Drug Interaction** checks instantly.
*   **Phase 2: Chief Medical Officer (Gemini 3 Pro Preview)**
    *   Triggered when the user requests a report.
    *   Uses **Reasoning Models** to "Think" through pathophysiology.
    *   Generates a clinical JSON schema with `severityScore`, `recurrenceLikelihood`, and `personalizedRootCause`.

### 3. Recovery Mode vs. Triage Mode
The AI detects the user's intent:
*   **Triage Mode**: For unknown symptoms. Focuses on Risk Stratification (Urgent vs. Self-Care).
*   **Recovery Mode**: For diagnosed patients. Focuses on **Daily Routines**, **Medication Schedules**, and **Hygiene**.

### 4. Location-Based Care
Integrates **Google Maps Grounding** to find specific specialists (e.g., "Orthopedic Surgeon") near the user's geolocation when high risk is detected.

---

## 🌳 Project Timeline & Features
*   **v1.0 (MVP)**: Basic Symptom Checker.
*   **v1.5**: Integration of Google Search for real-time validation.
*   **v2.0 (Current)**:
    *   Full UI Overhaul (Glassmorphism).
    *   **Recovery Mode**: Daily routine generation for post-op/injury care.
    *   **Medication Hub**: Safety checks for drug interactions.
    *   **Personalized Analysis**: "Why Me?" section explaining root causes.
*   **Future Roadmap**:
    *   Wearable integration (Apple Health/Fitbit).
    *   PDF Report Export for doctors.

---

## 📱 Product Tour & Advertisement

**Meet DoctorCompass.**

Stop guessing. Start navigating.

When you or a loved one is unwell, clarity is the only thing that matters. DoctorCompass is the first AI companion that understands *you*, not just your symptoms.

*   **⚠️ The Triage Engine**: Woke up with a strange rash? Chat with us. We'll assess the visual description, check your history, and tell you if it's "Benadryl and sleep" or "Emergency Room now".
*   **💊 The Safety Net**: Taking antibiotics? Ask us, *"Can I eat yogurt with this?"* or *"Can I take Tylenol too?"*. We check the biochemistry so you don't have to.
*   **❤️ The Recovery Pal**: Broken leg? We generate a **Day-to-Day Plan**:
    *   *Morning*: How to shower without wetting the cast.
    *   *Noon*: When to take your meds.
    *   *Night*: Best sleeping position for blood flow.

It's like having a doctor in your pocket, 24/7.

---

## 🔄 User Flow & Interface

### 1. Safety First
Before any interaction, we ensure the user understands this is a CDSS tool, not a human doctor.
<img src="img/Screenshot%202026-02-06%20133049.png" alt="Disclaimer Screen" width="600"/>

### 2. Contextual Investigation
The chat interface allows for natural language conversation. The AI remembers past context ("Stackable Context") and can perform quick drug interaction checks.
<img src="img/Screenshot%202026-02-06%20133139.png" alt="Chat Interface" width="800"/>

### 3. Deep Clinical Reasoning
When a report is requested, the system switches to **Gemini 3 Pro** to perform a deep "thinking" analysis of the entire conversation history.
<img src="img/Screenshot%202026-02-06%20133150.png" alt="Processing View" width="600"/>

---

## 📊 Comprehensive Medical Report

Once analyzed, the user is presented with a full medical dashboard.

### The Diagnosis & Risk Score
Immediate clarity on what is likely happening and how severe it is.
<img src="img/Screenshot%202026-02-06%20133232.png" alt="Report Top View" width="800"/>

### Deep Dive & Daily Routine
Understanding *why* it happened (Pathophysiology) and *what to do* hour-by-hour (Daily Care Routine).
<img src="img/Screenshot%202026-02-06%20133248.png" alt="Pathophysiology and Routine" width="800"/>

### Recovery Timeline & Treatments
Clear expectations on healing time and standard treatments.
<img src="img/Screenshot%202026-02-06%20133259.png" alt="Recovery Timeline" width="800"/>

### Symptom Matrix & Action Plan
A structured breakdown of symptoms and a geolocation-based map to find the right specialist nearby.
<img src="img/Screenshot%202026-02-06%20133307.png" alt="Symptom Matrix and Map" width="800"/>

---

> **PM Note**: This project demonstrates the application of **Generative AI in High-Stakes Environments**. By using "Thinking Models" (Gemini 3 Pro) for the final analysis and "Fast Models" (Flash) for chat, we optimize for both latency and accuracy—a critical balance in HealthTech product management.


import React, { useState, useEffect } from 'react';
import Disclaimer from './components/Disclaimer';
import ChatInterface from './components/ChatInterface';
import ProcessingView from './components/ProcessingView';
import TriageResult from './components/TriageResult';
import HistoryView from './components/HistoryView';
import { TriageResult as TriageResultType, HistoryItem, Message } from './types';
import { analyzeSymptoms } from './services/geminiService';
import { BackgroundLayout } from './components/BackgroundLayout';

type Step = 'disclaimer' | 'chat' | 'analyzing' | 'results' | 'history';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('disclaimer');
  const [result, setResult] = useState<TriageResultType | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  // Persistent Chat State
  const [messages, setMessages] = useState<Message[]>([]);

  // Load History & Chat on Mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('doctorcompass_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedChat = localStorage.getItem('doctorcompass_chat_memory');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error("Failed to parse chat memory", e);
      }
    } else {
      // Default welcome message if no history
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          text: "Hello. I am DoctorCompass, your personal medical intelligence hub. I remember our past conversations to help connect the dots.\n\nYou can ask me about:\n1. New Symptoms (I'll check against your history)\n2. Recovery & Aftercare (I'll help you manage your healing)\n3. Medication Interactions (Is X safe with Y?)\n\nHow can I help you right now?",
          timestamp: Date.now()
        }
      ]);
    }
  }, []);

  // Save Chat on Change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('doctorcompass_chat_memory', JSON.stringify(messages));
    }
  }, [messages]);

  const saveToHistory = (newResult: TriageResultType) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      conditionName: newResult.analysis.conditionName,
      riskLevel: newResult.riskLevel,
      summary: newResult.summary,
      result: newResult
    };

    const updatedHistory = [newItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('doctorcompass_history', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete all history?")) {
        setHistory([]);
        localStorage.removeItem('doctorcompass_history');
    }
  };

  const handleClearChat = () => {
    if (confirm("Start a fresh medical conversation? This will clear current context.")) {
      const resetMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: "Medical memory cleared. I am ready for a fresh assessment. What brings you in today?",
        timestamp: Date.now()
      };
      setMessages([resetMsg]);
      localStorage.removeItem('doctorcompass_chat_memory');
    }
  };

  const handleDisclaimerAccept = () => {
    setStep('chat');
  };

  const handleAnalysisRequest = async (history: { role: string; text: string }[]) => {
    setStep('analyzing');
    try {
      // Small delay to ensure the UI transition is felt (calming effect)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const triageData = await analyzeSymptoms(history);
      setResult(triageData);
      saveToHistory(triageData);
      setStep('results');
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("We encountered an issue analyzing your symptoms. Please try again.");
      setStep('chat');
    }
  };

  const handleReset = () => {
    setResult(null);
    setStep('chat'); // Go back to chat instead of disclaimer to keep flow
  };

  const handleViewHistory = () => {
    setStep('history');
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setResult(item.result);
    setStep('results');
  };

  return (
    <BackgroundLayout>
      <main className="min-h-screen">
        {step === 'disclaimer' && (
          <Disclaimer 
            onAccept={handleDisclaimerAccept} 
            onViewHistory={handleViewHistory}
            hasHistory={history.length > 0}
          />
        )}
        
        {step === 'chat' && (
          <ChatInterface 
            messages={messages} 
            setMessages={setMessages} 
            onAnalyze={handleAnalysisRequest}
            onClearChat={handleClearChat}
          />
        )}
        
        {step === 'analyzing' && <ProcessingView />}
        
        {step === 'results' && result && (
          <TriageResult result={result} onReset={handleReset} />
        )}

        {step === 'history' && (
          <HistoryView 
            history={history} 
            onSelect={handleSelectHistoryItem} 
            onBack={() => setStep('disclaimer')}
            onClear={handleClearHistory}
          />
        )}
      </main>
    </BackgroundLayout>
  );
};

export default App;

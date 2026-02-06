
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, User, Stethoscope, Globe, Sparkles, Pill, Utensils, Trash2 } from 'lucide-react';
import { Message } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { Logo } from './Logo';

interface ChatInterfaceProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onAnalyze: (history: { role: string; text: string }[]) => void;
  onClearChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, setMessages, onAnalyze, onClearChat }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await streamChatResponse(history, userMsg.text);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAnalysisTrigger = () => {
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    onAnalyze(history);
  };

  const handleQuickAction = (type: 'med' | 'food') => {
      if (type === 'med') {
          setInput("Check interaction: Can I take [Drug A] with [Drug B]? And is it safe with my symptoms?");
      } else {
          setInput("Nutrition check: Is it safe to eat [Food] while taking [Medicine]?");
      }
      // Focus input
      const inputEl = document.querySelector('input');
      inputEl?.focus();
  };

  // Helper to format AI text slightly better (Markdown-ish)
  const formatAIText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold headers (lines ending with :)
      if (line.trim().endsWith(':')) {
        return <p key={i} className="font-bold text-slate-800 mt-3 mb-1">{line}</p>;
      }
      // Bullet points
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        return (
          <div key={i} className="flex gap-2 ml-1 mb-1">
             <span className="text-teal-500 font-bold">•</span>
             <span className="flex-1">{line.replace(/^[\*\-]\s*/, '')}</span>
          </div>
        );
      }
      // Numbered lists
      if (/^\d+\./.test(line.trim())) {
         return (
             <div key={i} className="flex gap-2 ml-1 mb-1">
                 <span className="text-teal-600 font-bold min-w-[1.2rem]">{line.match(/^\d+\./)?.[0]}</span>
                 <span className="flex-1">{line.replace(/^\d+\.\s*/, '')}</span>
             </div>
         )
      }
      // Standard Paragraphs with better spacing
      return line.trim() ? <p key={i} className="mb-2 leading-7">{line}</p> : <div key={i} className="h-2"></div>;
    });
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-transparent">
      {/* Header - Glassmorphism */}
      <header className="px-6 py-4 border-b border-white/50 flex justify-between items-center shadow-sm z-20 sticky top-0 bg-white/70 backdrop-blur-md">
        <Logo />
        <div className="flex items-center gap-3">
            <button 
                onClick={onClearChat}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                title="Clear Chat Memory"
            >
                <Trash2 size={18} />
            </button>
            {messages.length > 2 && (
            <button
                onClick={handleAnalysisTrigger}
                className="flex items-center gap-2 bg-teal-600/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:scale-105 transition-all animate-pulse backdrop-blur-sm"
            >
                Generate Medical Report <ArrowRight size={16} />
            </button>
            )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 max-w-4xl mx-auto w-full scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md border-2 border-white ${
              msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-gradient-to-br from-teal-500 to-teal-700 text-white'
            }`}>
              {msg.role === 'user' ? <User size={22} /> : <Stethoscope size={22} />}
            </div>
            
            <div className={`relative max-w-[85%] md:max-w-[75%] p-6 rounded-3xl text-base shadow-sm backdrop-blur-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-slate-50 rounded-tr-none shadow-lg' 
                : 'bg-slate-50/95 border border-white/60 text-slate-700 rounded-tl-none shadow-md'
            }`}>
              {msg.role === 'model' ? (
                  <div className="text-slate-800 tracking-wide font-normal">
                      {formatAIText(msg.text)}
                  </div>
              ) : (
                  <p className="whitespace-pre-wrap leading-relaxed tracking-wide">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex gap-5 max-w-4xl mx-auto w-full">
             <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md relative overflow-hidden">
                <Stethoscope size={22} className="relative z-10" />
                <div className="absolute inset-0 bg-white/20 animate-ping"></div>
             </div>
             <div className="bg-white/80 border border-white/50 p-6 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                   <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce"></span>
                   <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce delay-75"></span>
                   <span className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce delay-150"></span>
                </div>
                <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                  <Globe size={14} className="animate-spin-slow" /> Consulting Medical Knowledge...
                </span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Glassmorphism */}
      <div className="p-5 border-t border-white/50 bg-white/70 backdrop-blur-md">
        
        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto w-full mb-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button 
                onClick={() => handleQuickAction('med')}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors whitespace-nowrap shadow-sm"
            >
                <Pill size={14} /> Drug Interaction Check
            </button>
            <button 
                onClick={() => handleQuickAction('food')}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors whitespace-nowrap shadow-sm"
            >
                <Utensils size={14} /> Nutrition Safety Check
            </button>
        </div>

        <div className="max-w-4xl mx-auto w-full flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe symptoms, or ask about meds/food..."
            className="flex-1 border border-white/60 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 bg-white/60 text-slate-900 placeholder:text-slate-400 transition-all shadow-inner backdrop-blur-sm text-base"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="bg-teal-600/90 text-white p-4 rounded-xl hover:bg-teal-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-600/20 active:scale-95 backdrop-blur-sm flex items-center justify-center w-16"
          >
            <Send size={24} />
          </button>
        </div>
        <div className="flex justify-center mt-2 gap-5 text-[10px] text-slate-400">
           <span className="flex items-center gap-1.5 font-medium"><Sparkles size={11} /> Stackable Context Active</span>
           <span className="flex items-center gap-1.5 font-medium"><Pill size={11} /> Meds & Nutrition Hub</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

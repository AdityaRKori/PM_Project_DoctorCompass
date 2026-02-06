import React from 'react';
import { Activity } from 'lucide-react';

const ProcessingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        <div className="absolute inset-0 bg-teal-400 rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-white/80 backdrop-blur-xl p-6 rounded-full shadow-lg z-10 border border-white/50">
           <Activity size={48} className="text-teal-600 animate-pulse" />
        </div>
      </div>
      <h2 className="mt-8 text-xl font-semibold text-slate-700">Analyzing Symptoms</h2>
      <p className="text-slate-500 mt-2">Consulting risk stratification engine...</p>
    </div>
  );
};

export default ProcessingView;

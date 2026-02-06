
import React from 'react';
import { ShieldCheck, History } from 'lucide-react';
import { Logo } from './Logo';

interface DisclaimerProps {
  onAccept: () => void;
  onViewHistory: () => void;
  hasHistory: boolean;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept, onViewHistory, hasHistory }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-slate-800">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/60">
        <div className="flex justify-center mb-8">
           <Logo size={48} className="scale-125" />
        </div>
        
        <div className="bg-amber-50/80 border-l-4 border-amber-500 p-5 mb-8 rounded-r backdrop-blur-sm">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            <ShieldCheck size={20} />
            Safety Disclaimer
          </h3>
          <ul className="text-sm text-amber-900 space-y-3 list-disc pl-4 leading-relaxed">
            <li>This is a <strong>clinical decision support demo</strong> for educational purposes.</li>
            <li>This tool <strong>DOES NOT</strong> replace a professional medical diagnosis.</li>
            <li><strong>DO NOT</strong> use for life-threatening emergencies. Call emergency services immediately if in danger.</li>
            <li>We do not store PII (Personally Identifiable Information).</li>
          </ul>
        </div>

        <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed px-4">
          By proceeding, you understand that DoctorCompass provides navigational guidance based on medical literature, not a definitive doctor's prescription.
        </p>

        <div className="space-y-3">
          <button
            onClick={onAccept}
            className="w-full bg-teal-600/90 hover:bg-teal-700/90 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-500/30 active:scale-95 backdrop-blur-sm"
          >
            I Understand & Agree
          </button>
          
          {hasHistory && (
            <button
              onClick={onViewHistory}
              className="w-full bg-white/50 hover:bg-white/80 text-slate-600 font-medium py-3 rounded-xl transition-all border border-slate-200 hover:border-teal-200 flex items-center justify-center gap-2"
            >
              <History size={18} /> View Previous Assessments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;

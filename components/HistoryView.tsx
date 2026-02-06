
import React from 'react';
import { HistoryItem, RiskLevel } from '../types';
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { Logo } from './Logo';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelect, onBack, onClear }) => {
  
  const getRiskIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.URGENT:
        return <AlertTriangle size={18} className="text-rose-600" />;
      case RiskLevel.CONSULT_SOON:
        return <Clock size={18} className="text-amber-500" />;
      case RiskLevel.SELF_CARE:
        return <CheckCircle size={18} className="text-emerald-600" />;
    }
  };

  const getRiskLabel = (level: RiskLevel) => {
    switch (level) {
        case RiskLevel.URGENT: return 'Urgent';
        case RiskLevel.CONSULT_SOON: return 'Consult Soon';
        case RiskLevel.SELF_CARE: return 'Self Care';
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-800">
      <nav className="px-6 py-4 border-b border-white/50 flex justify-between items-center shadow-sm sticky top-0 bg-white/70 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                <ArrowLeft size={20} />
            </button>
            <Logo size={24} />
        </div>
        {history.length > 0 && (
            <button onClick={onClear} className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                <Trash2 size={14} /> Clear History
            </button>
        )}
      </nav>

      <div className="max-w-3xl mx-auto w-full p-6 flex-1">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-800">
            <Clock className="text-teal-600" /> Assessment History
        </h2>

        {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 rounded-3xl border border-white/60">
                <Clock size={48} className="mb-4 opacity-50" />
                <p>No previous assessments found.</p>
                <button onClick={onBack} className="mt-4 text-teal-600 font-medium hover:underline">
                    Start a new assessment
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {history.map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="w-full text-left bg-white/80 backdrop-blur-sm p-5 rounded-xl border border-white/60 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-teal-700 transition-colors">
                                {item.conditionName}
                            </h3>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                item.riskLevel === RiskLevel.URGENT ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                item.riskLevel === RiskLevel.CONSULT_SOON ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                'bg-emerald-50 border-emerald-100 text-emerald-700'
                            }`}>
                                {getRiskIcon(item.riskLevel)}
                                {getRiskLabel(item.riskLevel)}
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                            {item.summary}
                        </p>
                        <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            <span className="flex items-center gap-1 text-teal-600 group-hover:translate-x-1 transition-transform">
                                View Report <ChevronRight size={12} />
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;

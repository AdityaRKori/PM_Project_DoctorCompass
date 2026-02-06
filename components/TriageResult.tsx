
import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, MapPin, CheckCircle, ExternalLink, RefreshCcw, BookOpen, Activity, AlertCircle, Pill, Search, Home, Hospital, Shield, Target, User, Gauge, History, CalendarCheck, Droplets, Sun, Moon, Sunrise } from 'lucide-react';
import { TriageResult as ITriageResult, RiskLevel, ProviderResult } from '../types';
import { findProviders } from '../services/geminiService';
import { Logo } from './Logo';

interface TriageResultProps {
  result: ITriageResult;
  onReset: () => void;
}

const TriageResult: React.FC<TriageResultProps> = ({ result, onReset }) => {
  const [providers, setProviders] = useState<ProviderResult | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [locationMode, setLocationMode] = useState<'auto' | 'manual'>('auto');
  const [manualCity, setManualCity] = useState('');
  const [locationStatus, setLocationStatus] = useState<string>('Detecting location...');

  const fetchProvidersByCoords = async (lat: number, lng: number) => {
    setLoadingMap(true);
    setLocationStatus('Finding best providers...');
    try {
      const data = await findProviders(result.specialist, lat, lng);
      setProviders(data);
      setLocationStatus('');
    } catch (e) {
      console.error(e);
      setLocationStatus('Could not load provider data.');
    } finally {
      setLoadingMap(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualCity.trim()) return;
    setLoadingMap(true);
    setLocationStatus(`Looking up "${manualCity}"...`);
    
    try {
      // Use free OpenStreetMap Nominatim API for geocoding
      const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualCity)}&format=json&limit=1`);
      const geoData = await geoResp.json();
      
      if (geoData && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);
        await fetchProvidersByCoords(lat, lon);
      } else {
        setLocationStatus('City not found. Please try again.');
        setLoadingMap(false);
      }
    } catch (e) {
      console.error(e);
      setLocationStatus('Connection failed. Try again.');
      setLoadingMap(false);
    }
  };

  useEffect(() => {
    // Initial attempt with browser geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchProvidersByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation denied/failed:", error);
          setLocationMode('manual');
          setLocationStatus(''); // Clear status to show input form
        }
      );
    } else {
      setLocationMode('manual');
      setLocationStatus('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.specialist]);

  const getRiskConfig = (level: RiskLevel, isRecovery: boolean) => {
    if (isRecovery) {
        // Special styling for Recovery Mode
        if (level === RiskLevel.URGENT) {
            // Complication detected in recovery
            return {
                color: 'bg-rose-600',
                bgColor: 'bg-rose-50/80',
                textColor: 'text-rose-800',
                borderColor: 'border-rose-200',
                icon: <AlertTriangle size={24} />,
                label: 'Recovery Complication Alert'
            };
        }
        return {
            color: 'bg-blue-600',
            bgColor: 'bg-blue-50/80',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200',
            icon: <CalendarCheck size={24} />,
            label: 'Recovery Roadmap Active'
        };
    }

    switch (level) {
      case RiskLevel.URGENT:
        return {
          color: 'bg-rose-600',
          bgColor: 'bg-rose-50/80',
          textColor: 'text-rose-800',
          borderColor: 'border-rose-200',
          icon: <AlertTriangle size={24} />,
          label: 'Urgent Attention Required'
        };
      case RiskLevel.CONSULT_SOON:
        return {
          color: 'bg-amber-500',
          bgColor: 'bg-amber-50/80',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
          icon: <Clock size={24} />,
          label: 'Medical Consult Recommended'
        };
      case RiskLevel.SELF_CARE:
        return {
          color: 'bg-emerald-600',
          bgColor: 'bg-emerald-50/80',
          textColor: 'text-emerald-800',
          borderColor: 'border-emerald-200',
          icon: <CheckCircle size={24} />,
          label: 'Self-Care Protocol'
        };
    }
  };

  const { analysis, symptomTable } = result;
  const config = getRiskConfig(result.riskLevel, analysis.isRecoveryAnalysis);

  return (
    <div className="min-h-screen bg-transparent text-slate-800 font-sans pb-12">
      {/* Navbar - Glass */}
      <nav className="bg-white/70 backdrop-blur-md border-b border-white/50 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <Logo size={28} />
        <button 
          onClick={onReset}
          className="text-sm font-medium text-slate-500 hover:text-teal-600 flex items-center gap-2 transition-colors"
        >
          <RefreshCcw size={16} /> New Assessment
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Top Risk/Recovery Banner */}
        <div className={`rounded-2xl border ${config.borderColor} ${config.bgColor} backdrop-blur-sm p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden`}>
           {analysis.contextType === 'HISTORICAL_CURIOSITY' && (
               <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl border-l border-b border-indigo-200 flex items-center gap-1">
                   <History size={10} /> Historical Analysis
               </div>
           )}
           <div className="flex items-start gap-4">
              <div className={`p-4 rounded-full ${config.color} text-white shadow-lg shadow-black/5`}>
                {config.icon}
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${config.textColor}`}>{config.label}</h1>
                <p className={`${config.textColor} opacity-90 mt-2 text-lg max-w-xl leading-relaxed`}>{result.summary}</p>
              </div>
           </div>
           <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Recommended Timeline</span>
              <span className={`font-bold ${config.textColor} bg-white/50 px-4 py-2 rounded-xl border border-white/50 shadow-sm`}>{result.recommendedTimeline}</span>
           </div>
        </div>

        {/* 1. Clinical Analysis (The "Brain" Section) */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100/50 px-6 py-4 flex items-center gap-2">
            <BookOpen className="text-teal-600" size={20} />
            <h2 className="font-bold text-slate-700">Clinical Analysis</h2>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h3 className="text-4xl font-bold text-slate-900 mb-3">{analysis.conditionName}</h3>
              <p className="text-lg text-slate-600 leading-loose font-light">{analysis.description}</p>
            </div>

            {/* SEVERITY METER */}
            <div className="mb-8 bg-slate-50 border border-slate-100 p-5 rounded-xl">
               <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-slate-700 flex items-center gap-2">
                       <Gauge size={18} /> {analysis.isRecoveryAnalysis ? 'Healing Progress' : 'Severity Score'}
                   </h4>
                   <span className="text-2xl font-black text-slate-700">{analysis.severityScore}/10</span>
               </div>
               <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden mb-2 relative">
                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 opacity-80"></div>
                   {/* Marker */}
                   <div 
                     className="absolute top-0 bottom-0 w-1 bg-white border-x border-slate-400 shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out"
                     style={{ left: `${(analysis.severityScore / 10) * 100}%` }}
                   ></div>
               </div>
               <p className="text-sm text-slate-500 text-right italic">{analysis.severityExplanation}</p>
            </div>

            {/* Pathophysiology */}
            <div className="mb-6 p-6 bg-blue-50/50 rounded-xl border border-blue-100/50 relative overflow-hidden group hover:bg-blue-50 transition-colors">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Activity size={120} />
               </div>
               <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
                 <Activity size={20} /> {analysis.isRecoveryAnalysis ? 'Recovery Mechanism' : 'Pathophysiology'}
               </h4>
               <p className="text-blue-800 leading-relaxed relative z-10">
                 {analysis.pathophysiology}
               </p>
            </div>

            {/* MEDICATION SCHEDULE (Specific for Recovery Mode or if meds present) */}
            {analysis.medicationSchedule && analysis.medicationSchedule.length > 0 && (
                <div className="mb-8 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <h4 className="font-bold text-indigo-900 mb-4 flex items-center gap-2 text-lg">
                        <Pill size={20} /> Prescribed Medication Plan
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        {analysis.medicationSchedule.map((med, idx) => (
                            <div key={idx} className="bg-white/60 p-4 rounded-lg border border-indigo-100 shadow-sm flex flex-col">
                                <span className="font-bold text-indigo-800 text-lg">{med.name}</span>
                                <span className="text-sm text-indigo-600 font-medium mb-2 uppercase tracking-wide flex items-center gap-1">
                                    <Clock size={12} /> {med.timing}
                                </span>
                                <p className="text-sm text-slate-600">{med.instruction}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DAILY ROUTINE (Recovery Mode) */}
            {analysis.dailyRoutine && analysis.dailyRoutine.length > 0 && (
                <div className="mb-8">
                     <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                        <CalendarCheck size={20} className="text-teal-600" /> Daily Care Routine
                    </h4>
                    <div className="space-y-4">
                        {analysis.dailyRoutine.map((step, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-sm">
                                    {step.timeOfDay.toLowerCase().includes('morn') ? <Sunrise size={20} /> : 
                                     step.timeOfDay.toLowerCase().includes('night') || step.timeOfDay.toLowerCase().includes('even') ? <Moon size={20} /> : <Sun size={20} />}
                                </div>
                                <div className="bg-white/50 flex-1 p-4 rounded-xl border border-slate-100">
                                    <h5 className="font-bold text-slate-800 text-sm mb-1">{step.timeOfDay}: {step.task}</h5>
                                    <p className="text-slate-600 text-sm">{step.reason}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Personalized Cause & Recurrence */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Why Me? */}
                <div className="p-6 bg-purple-50/50 rounded-xl border border-purple-100/50">
                    <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        <User size={18} /> Context
                    </h4>
                    <p className="text-purple-800 text-sm leading-relaxed">
                        {analysis.personalizedRootCause}
                    </p>
                </div>

                 {/* Recurrence */}
                 <div className="p-6 bg-orange-50/50 rounded-xl border border-orange-100/50">
                    <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                        <RefreshCcw size={18} /> Recurrence Probability
                    </h4>
                    <p className="text-orange-800 text-sm leading-relaxed mb-2 font-medium">
                        {analysis.recurrenceLikelihood}
                    </p>
                </div>
            </div>

            {/* RECOVERY OUTLOOK CARD */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className={`p-6 rounded-xl border backdrop-blur-sm ${analysis.recovery.canTreatAtHome ? 'bg-emerald-50/50 border-emerald-100/50' : 'bg-slate-50/50 border-slate-100/50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Home className={analysis.recovery.canTreatAtHome ? 'text-emerald-600' : 'text-slate-400'} size={20} />
                        <h4 className="font-bold text-slate-700">Home Recovery</h4>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{analysis.recovery.homeRecoveryTime}</div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Estimated duration</p>
                </div>

                <div className={`p-6 rounded-xl border backdrop-blur-sm ${!analysis.recovery.canTreatAtHome ? 'bg-indigo-50/50 border-indigo-100/50' : 'bg-slate-50/50 border-slate-100/50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                        <Hospital className={!analysis.recovery.canTreatAtHome ? 'text-indigo-600' : 'text-slate-400'} size={20} />
                        <h4 className="font-bold text-slate-700">Medical Intervention</h4>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 mb-1">{analysis.recovery.professionalRecoveryTime}</div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">With professional care</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {/* Left Column: Treatments/Remedies (If not fully covered by routine) */}
               <div>
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <Target size={20} className="text-teal-600" /> {analysis.isRecoveryAnalysis ? 'Care Focus' : 'Treatments'}
                  </h4>
                  <ul className="space-y-3">
                    {analysis.treatments.map((t, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
               </div>
               
               {/* Right Column: Prevention & Complications */}
               <div className="space-y-8">
                  {/* Prevention */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                       <Shield size={20} className="text-emerald-600" /> Prevention & Lifestyle
                    </h4>
                    <ul className="space-y-3">
                       {analysis.prevention.map((p, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                             {p}
                          </li>
                       ))}
                    </ul>
                  </div>

                  {/* Complications */}
                  <div>
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                        <AlertCircle size={20} className="text-rose-500" /> Potential Complications
                      </h4>
                      <ul className="space-y-3">
                        {analysis.complications.map((c, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. Symptom Table (The "Structured" Section) */}
        <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 overflow-hidden">
          <div className="bg-slate-50/50 border-b border-slate-100/50 px-6 py-4">
            <h2 className="font-bold text-slate-700">Symptom Analysis Matrix</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/50 border-b border-slate-200/50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-6 py-4">Symptom</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Clinical Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {symptomTable.length > 0 ? symptomTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.symptom}</td>
                    <td className="px-6 py-4">
                      {row.isPresent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100/80 text-rose-700 font-bold text-xs">
                           <AlertCircle size={12} /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/80 text-slate-400 font-medium text-xs">
                           Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 italic max-w-xs">{row.notes}</td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                            No active symptoms reported during recovery tracking.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Action Plan & Map */}
        <div className="grid md:grid-cols-2 gap-8">
           {/* Actions */}
           <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                 <CheckCircle className="text-teal-600" size={20} />
                 {analysis.isRecoveryAnalysis ? 'Recovery Checklist' : 'Action Plan'}
              </h3>
              <ul className="space-y-4">
                {result.careAdvice.map((advice, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-sm shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed pt-1">{advice}</p>
                  </li>
                ))}
              </ul>
           </section>

           {/* Map */}
           <section className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/60 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="text-indigo-600" size={20} />
                    Locate Care
                </h3>
                {locationMode === 'manual' && (
                    <button 
                        onClick={() => setLocationMode('manual')}
                        className="text-xs text-indigo-600 hover:underline"
                    >
                        Change Location
                    </button>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                {locationMode === 'manual' && (!providers || providers.chunks.length === 0) ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-xl">
                        <p className="text-sm text-slate-600 mb-3">Where are you located?</p>
                        <div className="flex gap-2 w-full max-w-xs">
                            <input 
                                type="text" 
                                placeholder="e.g. London, UK"
                                value={manualCity}
                                onChange={(e) => setManualCity(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70"
                            />
                            <button 
                                onClick={handleManualSearch}
                                disabled={loadingMap}
                                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                            >
                                <Search size={16} />
                            </button>
                        </div>
                        {locationStatus && <p className="text-xs text-slate-500 mt-2 animate-pulse">{locationStatus}</p>}
                    </div>
                ) : loadingMap ? (
                  <div className="h-full flex flex-col items-center justify-center min-h-[150px] text-slate-400">
                    <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs">{locationStatus || "Searching nearby..."}</p>
                  </div>
                ) : providers && providers.chunks.length > 0 ? (
                  <div className="space-y-3">
                    {providers.chunks.slice(0, 3).map((chunk, i) => chunk.maps ? (
                        <a 
                            key={i} 
                            href={chunk.maps.uri} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex flex-col p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group bg-white/50 shadow-sm"
                        >
                            <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-700 flex justify-between">
                                {chunk.maps.title}
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-50" />
                            </span>
                            {chunk.maps.placeAnswerSources?.reviewSnippets?.[0] && (
                                <span className="text-xs text-slate-400 mt-2 line-clamp-2 italic">
                                    "{chunk.maps.placeAnswerSources.reviewSnippets[0].snippet}"
                                </span>
                            )}
                        </a>
                    ) : null)}
                    <button 
                        onClick={() => { setProviders(null); setManualCity(''); setLocationMode('manual'); }}
                        className="text-xs text-slate-400 hover:text-indigo-600 w-full text-center mt-3 font-medium"
                    >
                        Search different location
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl text-slate-500 text-sm">
                     <p>{providers?.text || "No data found."}</p>
                     <button 
                        onClick={() => { setProviders(null); setLocationMode('manual'); }}
                        className="text-xs text-indigo-600 hover:underline mt-2"
                    >
                        Try manual search
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100/50 text-center">
                 <p className="text-[10px] text-slate-400">Powered by Google Maps • Locations are approximate</p>
              </div>
           </section>
        </div>

        {/* Disclaimer Footer */}
        <div className="text-center px-8 py-4">
           <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
             {result.disclaimer} This analysis uses generative AI to match symptoms with medical literature. It does not replace a doctor's diagnosis.
           </p>
        </div>

      </div>
    </div>
  );
};

export default TriageResult;

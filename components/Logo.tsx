
import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => {
  // Determine if we should show the full tagline based on size (hide for small navbar logos)
  const showFullTagline = size > 40;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center flex-shrink-0">
        {/* Background shape */}
        <div className="absolute bg-teal-600 rounded-lg opacity-10 rotate-45" style={{ width: size * 1.4, height: size * 1.4 }}></div>
        <div className="absolute bg-teal-600 rounded-lg opacity-20 rotate-12" style={{ width: size * 1.2, height: size * 1.2 }}></div>
        
        {/* Main Icon - Cross + Compass */}
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-teal-600 relative z-10"
        >
          <path d="M12 2L12 22" />
          <path d="M2 12L22 12" />
          <circle cx="12" cy="12" r="3" className="fill-white" />
          <path d="M12 12 L16 8" strokeWidth="2" />
        </svg>
      </div>
      <div className="flex flex-col leading-none justify-center">
        <span className="font-bold text-slate-800 tracking-tight" style={{ fontSize: size * 0.6 }}>DoctorCompass</span>
        <span className={`text-slate-500 font-medium tracking-wide ${showFullTagline ? 'mt-1' : ''}`} style={{ fontSize: showFullTagline ? size * 0.25 : size * 0.3 }}>
           {showFullTagline ? "A care AI that guides you to the right medical advice" : "Medical Intelligence"}
        </span>
      </div>
    </div>
  );
};

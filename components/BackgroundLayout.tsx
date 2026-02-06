
import React from 'react';

export const BackgroundLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-800 selection:bg-teal-200 font-sans">
       {/* Fixed Background Layers */}
       <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Base tint */}
          <div className="absolute inset-0 bg-slate-50/80"></div>
          
          {/* Clinical Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
                backgroundImage: `radial-gradient(#0f766e 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
            }}
          ></div>
          
          {/* Breathing Organic Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-300/20 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-indigo-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-blue-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
       </div>

       {/* Content Layer */}
       <div className="relative z-10 h-full">
         {children}
       </div>
       
       <style>{`
         @keyframes blob {
           0% { transform: translate(0px, 0px) scale(1); }
           33% { transform: translate(30px, -50px) scale(1.1); }
           66% { transform: translate(-20px, 20px) scale(0.9); }
           100% { transform: translate(0px, 0px) scale(1); }
         }
         .animate-blob {
           animation: blob 20s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
         }
         .animation-delay-2000 {
           animation-delay: 2s;
         }
         .animation-delay-4000 {
           animation-delay: 4s;
         }
       `}</style>
    </div>
  );
};

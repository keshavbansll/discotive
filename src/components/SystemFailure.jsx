import React, { useState } from "react";

const SystemFailure = ({
  errorType = "Execution Interrupted",
  errorMessage,
  resetBoundary,
}) => {
  const [reloading, setReloading] = useState(false);

  const handleRestore = () => {
    setReloading(true);
    // Short, elegant delay to feel deliberate
    setTimeout(() => {
      if (resetBoundary) {
        // If wrapped in the boundary, clear the error state
        resetBoundary();
      } else {
        // Hard refresh the browser to clear bad memory/states
        window.location.reload();
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden selection:bg-[#D4AF37] selection:text-black">
      {/* Extremely subtle, premium ambient light (Gold/Amber) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-b from-[#111111] to-transparent rounded-full blur-[120px] pointer-events-none opacity-50"></div>

      <div className="z-10 max-w-sm w-full text-center flex flex-col items-center space-y-10">
        {/* Minimalist Icon / Indicator */}
        <div className="w-12 h-12 border border-[#222222] bg-[#050505] rounded-2xl flex items-center justify-center shadow-2xl">
          <svg
            className="w-5 h-5 text-[#C0C0C0]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Succession / Corporate Copy */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#f5f5f7]">
            {errorType === "404_SECTOR_NOT_FOUND"
              ? "Trajectory Unknown"
              : errorType}
          </h1>
          <p className="text-[#a1a1aa] font-light leading-relaxed text-sm md:text-base max-w-[280px] mx-auto">
            {errorType === "404_SECTOR_NOT_FOUND"
              ? "This sector does not exist in the current execution map. Realign your coordinates."
              : "Momentum has been temporarily paused. A structural anomaly was detected in the current module."}
          </p>

          {/* Extremely subtle technical detail, barely visible */}
          {errorMessage && (
            <p className="text-[#222222] text-[10px] tracking-wider uppercase mt-8">
              {String(errorMessage).split("\n")[0].substring(0, 40)}...
            </p>
          )}
        </div>

        {/* Apple-style pill button */}
        <button
          onClick={handleRestore}
          disabled={reloading}
          className="group relative inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium tracking-wide text-black bg-[#f5f5f7] rounded-full transition-all duration-300 hover:scale-[1.02] hover:bg-white active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
          {reloading ? "Realigning..." : "Resume Execution"}
        </button>
      </div>
    </div>
  );
};

export default SystemFailure;

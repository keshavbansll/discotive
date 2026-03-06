import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GlobalLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;

    const simulateLoading = () => {
      // Realistic loading logic: jumps and stutters
      const jump =
        Math.random() > 0.5
          ? Math.floor(Math.random() * 15) + 5
          : Math.floor(Math.random() * 3) + 1;
      currentProgress += jump;

      // "Sticking" points (e.g., gets stuck at 85% for a moment)
      if (currentProgress > 85 && currentProgress < 95 && Math.random() > 0.3) {
        currentProgress -= jump - 1; // Pull it back slightly to simulate a hang
      }

      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setTimeout(() => {
          onComplete(); // Tell the app to unmount the loader
        }, 600); // Brief pause at 100% before fading out
        return;
      }

      setProgress(currentProgress);

      // Randomize the next tick interval to make it feel human/real network
      const nextTick = Math.floor(Math.random() * 250) + 50;
      setTimeout(simulateLoading, nextTick);
    };

    setTimeout(simulateLoading, 200);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        y: -20,
        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
      }}
      className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center text-white"
    >
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        <h1 className="text-3xl font-extrabold tracking-tighter">DISCOTIVE</h1>

        {/* Loading Bar Container */}
        <div className="w-full h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
          {/* Active Loading Bar */}
          <motion.div
            className="absolute top-0 left-0 h-full bg-white rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "tween", ease: "circOut", duration: 0.2 }}
          />
        </div>

        <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
          Loading Operating System... {progress}%
        </p>
      </div>
    </motion.div>
  );
};

export default GlobalLoader;

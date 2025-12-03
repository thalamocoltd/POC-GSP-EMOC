import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

interface ProcessingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const ProcessingOverlay = ({ isVisible, onComplete }: ProcessingOverlayProps) => {
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    "Processing your request...",
    "Analyzing patient details...",
    "Extracting information...",
    "Preparing form fields...",
    "Navigating to form..."
  ];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 400);

    const timeout = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-[#FAFAFA]/98 backdrop-blur-xl flex flex-col items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0A3D3C] via-[#1F73B7] to-[#8B6BBE] flex items-center justify-center shadow-[0_0_40px_rgba(139,107,190,0.4)]"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          <div className="mt-8 w-[300px] space-y-4 text-center">
             <motion.div
               key={statusIndex}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="text-lg font-medium text-[#1C1C1E]"
             >
               {statuses[statusIndex]}
             </motion.div>
             
             <div className="h-1 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#0A3D3C] to-[#1F73B7]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

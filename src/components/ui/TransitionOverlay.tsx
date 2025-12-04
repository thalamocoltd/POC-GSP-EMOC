import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";

interface TransitionOverlayProps {
  isVisible: boolean;
  message?: string;
}

export const TransitionOverlay = ({
  isVisible,
  message = "Loading..."
}: TransitionOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center"
        >
          <Loader2 className="w-12 h-12 text-[#006699] animate-spin mb-4" />
          <p className="text-[#1C1C1E] text-lg font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

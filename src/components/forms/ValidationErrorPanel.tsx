import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "../ui/utils";

interface ValidationErrorPanelProps {
  errors: Record<string, string>;
  fieldLabels: Record<string, string>;
  onErrorClick: (fieldId: string) => void;
  isVisible: boolean;
}

export const ValidationErrorPanel = ({
  errors,
  fieldLabels,
  onErrorClick,
  isVisible
}: ValidationErrorPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const errorCount = Object.keys(errors).length;
  const errorEntries = Object.entries(errors);

  // Reset collapsed state when errors change (new submission)
  useEffect(() => {
    if (errorCount > 0) {
      setIsCollapsed(false);
    }
  }, [errorCount]);

  const handleErrorClick = (fieldId: string) => {
    onErrorClick(fieldId);
  };

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="fixed right-6 top-20 z-40"
          style={{ width: '340px' }}
        >
          {/* Error Panel with Red Border */}
          <div className="bg-white rounded-lg shadow-xl border-2 border-red-600 overflow-hidden">
            {/* Header - Always Visible */}
            <button
              onClick={handleToggle}
              className="w-full px-4 py-3 flex items-center gap-3 bg-red-100 border-b-2 border-red-300 hover:bg-red-200 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md border-2 border-red-600 bg-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-red-700">
                  {errorCount} Validation Error{errorCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-red-600">
                  {isCollapsed ? "Click to expand" : "Click to collapse"}
                </p>
              </div>
              <div className="text-red-600 shrink-0">
                {isCollapsed ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                )}
              </div>
            </button>

            {/* Error List - Collapsible with Scroll */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="max-h-[450px] overflow-y-auto bg-white">
                    <div className="divide-y divide-red-200">
                      {errorEntries.map(([fieldId]) => (
                        <button
                          key={fieldId}
                          onClick={() => handleErrorClick(fieldId)}
                          className="w-full text-left px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors flex items-center gap-3"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                          <span className="flex-1">{fieldLabels[fieldId] || fieldId}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

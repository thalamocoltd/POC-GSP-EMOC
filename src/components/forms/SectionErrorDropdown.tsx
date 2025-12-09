import React, { useState } from "react";
import { ChevronDown, AlertCircle, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import { cn } from "../ui/utils";
import { motion, AnimatePresence } from "motion/react";

interface SectionErrorListProps {
  errors: Record<string, string>;
  fieldLabels: Record<string, string>;
  onErrorClick: (fieldId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const SectionErrorList: React.FC<SectionErrorListProps> = ({
  errors,
  fieldLabels,
  onErrorClick,
  isExpanded,
  onToggleExpand,
}) => {
  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="w-full">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors duration-150 cursor-pointer"
        >
          <ChevronDown
            className={cn(
              "w-3 h-3 text-red-600 transition-transform duration-200 shrink-0",
              isExpanded && "rotate-180"
            )}
          />
          <AlertCircle className="w-3 h-3 text-red-600 shrink-0" />
          <span className="text-xs font-medium text-red-700">
            {errorCount} {errorCount === 1 ? "error" : "errors"} in this section
          </span>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border border-red-200 border-t-0 rounded-b bg-red-50 max-h-60 overflow-y-auto"
            >
              <div className="divide-y divide-red-100 py-1 px-2">
                {Object.entries(errors).map(([fieldId, errorMessage]) => (
                  <Tooltip key={fieldId}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onErrorClick(fieldId)}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-red-100 transition-colors duration-150 flex items-start gap-1.5 group text-xs cursor-pointer"
                      >
                        <X className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-red-700 group-hover:text-red-900 leading-snug">
                            {fieldLabels[fieldId] || fieldId}
                          </p>
                          <p className="text-red-600 truncate leading-snug">
                            {errorMessage}
                          </p>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-800 text-white border-none max-w-xs text-xs">
                      {errorMessage}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
};

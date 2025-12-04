import React from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

interface StepLayoutProps {
  title: string;
  subtitle?: string;
  stepNumber: number;
  onBack: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  children: React.ReactNode;
  showNavigation?: boolean;
  nextLabel?: string;
  previousLabel?: string;
}

export const StepLayout = ({
  title,
  subtitle,
  stepNumber,
  onBack,
  onPrevious,
  onNext,
  children,
  showNavigation = true,
  nextLabel = "Next Step",
  previousLabel = "Previous Step"
}: StepLayoutProps) => {
  return (
    <div className="max-w-[860px] pb-32 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-[#68737D] hover:text-[#1C1C1E] flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-10">
          {/* Title */}
          <div>
            <h2 className="text-[24px] font-semibold text-[#1C1C1E] mb-1">{title}</h2>
            {subtitle && <p className="text-[#68737D] text-sm">{subtitle}</p>}
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Navigation Buttons */}
      {showNavigation && (
        <div className="fixed bottom-0 left-[72px] right-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] py-4 z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="mr-6 flex items-center justify-between gap-3" style={{ marginLeft: "370px" }}>
            <div className="flex gap-3">
              {onPrevious && (
                <Button
                  variant="outline"
                  className="border-[#D4D9DE] text-[#1C1C1E]"
                  onClick={onPrevious}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  {previousLabel}
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              {onNext && (
                <Button
                  className="bg-gradient-to-r from-[#1d3654] to-[#006699] hover:brightness-110 text-white shadow-md min-w-[140px]"
                  onClick={onNext}
                >
                  {nextLabel}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

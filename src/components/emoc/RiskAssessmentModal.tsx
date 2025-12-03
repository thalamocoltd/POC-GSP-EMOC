import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { RiskAssessment, LikelihoodValue, ImpactValue } from "../../types/emoc";
import { createRiskAssessment } from "../../lib/emoc-utils";

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: RiskAssessment) => void;
  title: string;
  initialValue?: RiskAssessment;
}

const LIKELIHOOD_LABELS: Record<LikelihoodValue, string> = {
  1: "Rare",
  2: "Unlikely", 
  3: "Possible",
  4: "Likely"
};

const IMPACT_LABELS: Record<ImpactValue, string> = {
  1: "Low",
  2: "Medium",
  3: "High",
  4: "Extreme"
};

// Risk matrix calculation with professional colors
const getRiskLevel = (likelihood: number, impact: number): { score: number; level: string; color: string } => {
  const score = likelihood * impact;
  // Professional minimal color scheme
  if (score <= 4) return { score, level: "Low", color: "bg-[#4CAF50]" }; // Green
  if (score <= 8) return { score, level: "Medium", color: "bg-[#FFC107]" }; // Amber
  if (score <= 12) return { score, level: "High", color: "bg-[#FF9800]" }; // Orange
  return { score, level: "Extreme", color: "bg-[#F44336]" }; // Red
};

export const RiskAssessmentModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title,
  initialValue 
}: RiskAssessmentModalProps) => {
  const [selectedLikelihood, setSelectedLikelihood] = useState<LikelihoodValue | null>(
    initialValue?.likelihood || null
  );
  const [selectedImpact, setSelectedImpact] = useState<ImpactValue | null>(
    initialValue?.impact || null
  );

  const currentAssessment = createRiskAssessment(selectedLikelihood, selectedImpact);
  const canSave = selectedLikelihood !== null && selectedImpact !== null;

  const handleSave = () => {
    if (!canSave) return;
    onSave(currentAssessment);
    onClose();
  };

  const handleCancel = () => {
    setSelectedLikelihood(initialValue?.likelihood || null);
    setSelectedImpact(initialValue?.impact || null);
    onClose();
  };

  // Get cell color based on risk level
  const getCellColor = (likelihood: number, impact: number) => {
    const { color } = getRiskLevel(likelihood, impact);
    return color;
  };

  const isCellSelected = (likelihood: number, impact: number) => {
    return selectedLikelihood === likelihood && selectedImpact === impact;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            Select a cell from the risk matrix to assess the risk level
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Risk Matrix Table */}
          <div className="overflow-x-auto flex justify-center">
            <table className="border-collapse" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-[#68737D] border-b-2 border-[#E5E7EB]" style={{ width: '110px' }}>
                    <div className="text-xs uppercase tracking-wide">Impact →</div>
                    <div className="text-xs uppercase tracking-wide">Likelihood ↓</div>
                  </th>
                  {[1, 2, 3, 4].map(impact => (
                    <th key={impact} className="p-3 text-center border-b-2 border-[#E5E7EB]" style={{ width: '110px' }}>
                      <div className="text-sm font-semibold text-[#1C1C1E]">
                        {IMPACT_LABELS[impact as ImpactValue]}
                      </div>
                      <div className="text-xs text-[#68737D] mt-0.5">{impact}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[4, 3, 2, 1].map(likelihood => (
                  <tr key={likelihood}>
                    <td className="p-3 border-r-2 border-[#E5E7EB] bg-[#F7F8FA]" style={{ width: '110px' }}>
                      <div className="text-sm font-semibold text-[#1C1C1E]">
                        {LIKELIHOOD_LABELS[likelihood as LikelihoodValue]}
                      </div>
                      <div className="text-xs text-[#68737D] mt-0.5">{likelihood}</div>
                    </td>
                    {[1, 2, 3, 4].map(impact => {
                      const { score, level } = getRiskLevel(likelihood, impact);
                      const cellColor = getCellColor(likelihood, impact);
                      const isSelected = isCellSelected(likelihood, impact);
                      
                      return (
                        <td key={impact} className="p-0 border border-[#E5E7EB]" style={{ width: '110px', height: '110px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLikelihood(likelihood as LikelihoodValue);
                              setSelectedImpact(impact as ImpactValue);
                            }}
                            className={cn(
                              "w-full h-full flex flex-col items-center justify-center gap-0.5 transition-all hover:opacity-90 relative",
                              cellColor,
                              isSelected && "ring-4 ring-[#1d3654] ring-inset"
                            )}
                          >
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                <svg className="w-3 h-3 text-[#1d3654]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <div className="text-2xl font-bold text-white drop-shadow-md">
                              {score}
                            </div>
                            <div className="text-xs font-semibold text-white/90">
                              {level}
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Risk Info */}
          {currentAssessment.level && (
            <div className="mt-6 p-4 bg-[#F7F8FA] rounded-lg border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#68737D] mb-1">Selected Risk Assessment</div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-semibold text-[#1C1C1E]">
                      {LIKELIHOOD_LABELS[selectedLikelihood!]} × {IMPACT_LABELS[selectedImpact!]}
                    </span>
                    <span className="text-[#68737D]">=</span>
                    <span className="text-2xl font-bold text-[#1C1C1E]">
                      {currentAssessment.score}
                    </span>
                    <span className={cn(
                      "px-3 py-1 rounded-lg font-bold text-sm text-white",
                      getCellColor(selectedLikelihood!, selectedImpact!)
                    )}>
                      {currentAssessment.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-[#D4D9DE]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="bg-gradient-to-r from-[#1d3654] to-[#006699] hover:brightness-110 text-white"
          >
            Save Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

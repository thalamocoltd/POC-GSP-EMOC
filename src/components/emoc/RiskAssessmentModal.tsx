import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../ui/utils";
import { RiskAssessment, LikelihoodValue, ImpactValue } from "../../types/emoc";
import { createRiskAssessment } from "../../lib/emoc-utils";
import { SEVERITY_DESCRIPTIONS, PROBABILITY_DESCRIPTIONS } from "../../lib/emoc-data";

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: RiskAssessment) => void;
  title: string;
  initialValue?: RiskAssessment;
}

// Risk code to inline style mapping - Professional minimal colors
const getRiskCodeStyle = (riskCode: string): React.CSSProperties => {
  if (riskCode.startsWith("L")) {
    return { backgroundColor: '#D1FAE5', color: '#065F46' }; // Green for L14-L16
  } else if (riskCode.startsWith("M")) {
    return { backgroundColor: '#FED7AA', color: '#9A3412' }; // Orange for M7-M13
  } else if (riskCode.startsWith("H")) {
    return { backgroundColor: '#FEE2E2', color: '#991B1B' }; // Red for H1-H6
  }
  return { backgroundColor: '#F3F4F6', color: '#374151' };
};

// Truncate text with tooltip
const TextWithTooltip = ({ text, maxLength = 60 }: { text: string; maxLength?: number }) => {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? text.substring(0, maxLength) + "..." : text;

  if (!isTruncated) {
    return <span className="text-xs leading-tight">{text}</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-gray-400 text-xs leading-tight">
            {displayText}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
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

  const handleCellClick = (likelihood: LikelihoodValue, impact: ImpactValue) => {
    setSelectedLikelihood(likelihood);
    setSelectedImpact(impact);
  };

  const isCellSelected = (likelihood: LikelihoodValue, impact: ImpactValue) => {
    return selectedLikelihood === likelihood && selectedImpact === impact;
  };

  // Get risk code for a cell
  const getRiskCode = (likelihood: LikelihoodValue, impact: ImpactValue): string => {
    const assessment = createRiskAssessment(likelihood, impact);
    return assessment.riskCode || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto" style={{ maxWidth: '90vw', width: '90vw', maxHeight: '95vh' }}>
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>
            Click on a risk code cell to select the risk level
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 overflow-x-auto">
          {/* Risk Matrix Table */}
          <table className="border-collapse w-full border border-[#333]" style={{ minWidth: '800px' }}>
            {/* Header Row 1: Section titles */}
            <thead>
              <tr className="bg-[#F0F0F0]">
                <td colSpan={5} className="border border-[#333] p-2 text-center font-bold text-sm bg-[#E8E8E8]">
                  CONSEQUENCE
                </td>
                <td colSpan={4} className="border border-[#333] p-2 text-center font-bold text-sm bg-[#E8E8E8]">
                  PROBABILITY OF OCCURRENCE
                </td>
              </tr>

              {/* Header Row 2: Column titles */}
              <tr className="bg-[#F0F0F0]">
                <td className="border border-[#333] p-2 text-center font-bold text-xs bg-[#E8E8E8]">Severity</td>
                <td className="border border-[#333] p-2 text-center font-bold text-xs bg-[#E8E8E8]">People</td>
                <td className="border border-[#333] p-2 text-center font-bold text-xs bg-[#E8E8E8]">Assets</td>
                <td className="border border-[#333] p-2 text-center font-bold text-xs bg-[#E8E8E8]">Environment/<br />Community</td>
                <td className="border border-[#333] p-2 text-center font-bold text-xs bg-[#E8E8E8]">Security</td>
                <td className="border border-[#333] p-2 text-center font-bold text-sm bg-[#E8E8E8]">A</td>
                <td className="border border-[#333] p-2 text-center font-bold text-sm bg-[#E8E8E8]">B</td>
                <td className="border border-[#333] p-2 text-center font-bold text-sm bg-[#E8E8E8]">C</td>
                <td className="border border-[#333] p-2 text-center font-bold text-sm bg-[#E8E8E8]">D</td>
              </tr>

              {/* Probability descriptions */}
              <tr className="bg-white">
                <td className="border border-[#333] p-2 text-xs bg-[#F8F8F8]"></td>
                <td colSpan={4} className="border border-[#333] p-2 text-xs bg-white"></td>
                <td className="border border-[#333] p-1 text-[10px] text-center">
                  <TextWithTooltip text={PROBABILITY_DESCRIPTIONS[0].description} maxLength={35} />
                </td>
                <td className="border border-[#333] p-1 text-[10px] text-center">
                  <TextWithTooltip text={PROBABILITY_DESCRIPTIONS[1].description} maxLength={35} />
                </td>
                <td className="border border-[#333] p-1 text-[10px] text-center">
                  <TextWithTooltip text={PROBABILITY_DESCRIPTIONS[2].description} maxLength={35} />
                </td>
                <td className="border border-[#333] p-1 text-[10px] text-center">
                  <TextWithTooltip text={PROBABILITY_DESCRIPTIONS[3].description} maxLength={35} />
                </td>
              </tr>
            </thead>

            {/* Data rows - Severity 1-4 */}
            <tbody>
              {[1, 2, 3, 4].map((severity) => {
                const severityDesc = SEVERITY_DESCRIPTIONS[severity - 1];
                return (
                  <tr key={`severity-${severity}`}>
                    {/* Severity label cell */}
                    <td className="border border-[#333] p-2 bg-[#F8F8F8] align-top text-center font-bold text-sm" style={{ minWidth: '40px', width: '40px' }}>
                      {severity}
                    </td>

                    {/* Consequence description cells */}
                    <td className="border border-[#333] p-2 text-[11px] align-top" style={{ minWidth: '85px', maxWidth: '120px' }}>
                      <TextWithTooltip text={severityDesc.people} maxLength={35} />
                    </td>
                    <td className="border border-[#333] p-2 text-[11px] align-top" style={{ minWidth: '85px', maxWidth: '120px' }}>
                      <TextWithTooltip text={severityDesc.assets} maxLength={35} />
                    </td>
                    <td className="border border-[#333] p-2 text-[11px] align-top" style={{ minWidth: '95px', maxWidth: '130px' }}>
                      <TextWithTooltip text={severityDesc.environmentCommunity} maxLength={35} />
                    </td>
                    <td className="border border-[#333] p-2 text-[11px] align-top" style={{ minWidth: '85px', maxWidth: '120px' }}>
                      <TextWithTooltip text={severityDesc.security} maxLength={35} />
                    </td>

                    {/* Risk code cells - with inline colors */}
                    {[1, 2, 3, 4].map((prob) => {
                      const riskCode = getRiskCode(prob as LikelihoodValue, severity as ImpactValue);
                      const isSelected = isCellSelected(prob as LikelihoodValue, severity as ImpactValue);
                      const riskStyle = getRiskCodeStyle(riskCode);

                      return (
                        <td
                          key={`cell-${prob}-${severity}`}
                          className="border border-[#333] p-0"
                          style={{ minWidth: '48px', height: '50px' }}
                        >
                          <button
                            type="button"
                            onClick={() => handleCellClick(prob as LikelihoodValue, severity as ImpactValue)}
                            style={riskStyle}
                            className={cn(
                              "w-full h-full flex items-center justify-center font-bold text-base transition-all hover:opacity-80 cursor-pointer relative",
                              isSelected && "ring-4 ring-[#1d3654] ring-inset shadow-lg"
                            )}
                            title={`Risk code ${riskCode}`}
                          >
                            {riskCode}
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md border border-[#1d3654]">
                                <svg className="w-3 h-3 text-[#1d3654]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Risk Summary - Simplified */}
        {currentAssessment.riskCode && (
          <div className="mt-3 p-3 bg-[#F7F8FA] rounded border border-[#E5E7EB]">
            <div className="text-[10px] text-[#68737D] mb-2 font-semibold">SELECTED RISK ASSESSMENT</div>
            <div
              style={getRiskCodeStyle(currentAssessment.riskCode)}
              className="inline-block px-4 py-2 rounded font-bold text-lg"
            >
              {currentAssessment.riskCode}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 mt-4">
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
            className="bg-gradient-to-r from-[#1d3654] to-[#006699] hover:brightness-110 text-white disabled:opacity-50"
          >
            Save Assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

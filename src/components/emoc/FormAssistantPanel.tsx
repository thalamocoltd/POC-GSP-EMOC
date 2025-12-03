import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Calculator, ArrowRight, Check, Bot, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { createRiskAssessment } from "../../lib/emoc-utils";

interface FormAssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: string | null;
  onAutoFill: (fieldId: string, value: any) => void;
}

interface AssistantResponse {
  title: string;
  content: React.ReactNode;
  autoFillValue?: any;
  formula?: string;
}

const MOCK_RESPONSES: Record<string, AssistantResponse> = {
  tpmLossTypeId: {
    title: "TPM Loss Type",
    content: (
      <div className="space-y-4">
        <p>TPM Loss Type indicates the category of production loss based on Total Productive Maintenance standards.</p>
        <p>Select from:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Reduced Speed:</strong> Partial capacity loss due to equipment limitations.</li>
          <li><strong>Shutdown:</strong> Complete stoppage for maintenance.</li>
          <li><strong>Quality Issue:</strong> Product defects or rework.</li>
          <li><strong>Equipment Failure:</strong> Unplanned breakdown.</li>
        </ul>
        <p>This classification helps calculate the exact loss elimination value.</p>
      </div>
    ),
    autoFillValue: "loss-4" // Reduced Speed
  },
  benefit: {
    title: "Benefit Description",
    content: (
      <div className="space-y-4">
        <p>Benefit describes the expected positive outcomes from this change. Focus on quantifiable improvements.</p>
        <p><strong>Key metrics to include:</strong></p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Increased production capacity</li>
          <li>Reduced downtime hours</li>
          <li>Cost savings (THB)</li>
          <li>Safety improvements</li>
        </ul>
        <p className="text-sm italic bg-blue-50 p-3 rounded border border-blue-100">
          Tip: Be specific with timeframes (e.g., "per month", "annually").
        </p>
      </div>
    ),
    autoFillValue: "Reduction in equipment downtime by 25% resulting in increased production capacity of 500 tons/month, estimated cost savings of 2.5M THB annually through improved operational efficiency and reduced maintenance requirements"
  },
  benefitValue: {
    title: "Benefit Value Calculation",
    content: (
      <div className="space-y-4">
        <p>Benefit Value represents the total financial gain expected from this change.</p>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="font-mono text-sm font-semibold text-[#1d3654] mb-2">Calculation Formula:</p>
          <p className="font-mono text-sm">(Current State Cost - Future State Cost) × Time Period</p>
        </div>
        <p>Ensure you include both direct savings (materials, energy) and indirect savings (maintenance hours, avoidance of loss).</p>
      </div>
    ),
    autoFillValue: 2500000
  },
  investment: {
    title: "Investment Cost",
    content: (
      <div className="space-y-4">
        <p>Investment includes all costs associated with implementing the change.</p>
        <p><strong>Include costs for:</strong></p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Equipment and materials purchase</li>
          <li>Installation and labor</li>
          <li>Engineering and design fees</li>
          <li>Testing and commissioning</li>
        </ul>
      </div>
    ),
    autoFillValue: 1200000
  },
  lengthOfChange: {
    title: "Length of Change",
    content: (
      <div className="space-y-4">
        <p>Specify the duration for which this change will be active.</p>
        <p>For <strong>Permanent</strong> changes, estimate the useful life of the modification.</p>
        <p>For <strong>Temporary</strong> changes, strictly define the start and end dates (typically &lt; 3 months).</p>
      </div>
    ),
    autoFillValue: { years: 2, months: 6, days: 0 }
  },
  priorityId: {
    title: "Priority of Change",
    content: (
      <div className="space-y-4">
        <p>Select the urgency level for this request based on safety and operational impact.</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Critical:</strong> Immediate safety threat or total production stoppage.</li>
          <li><strong>High:</strong> Significant risk or major efficiency loss.</li>
          <li><strong>Medium:</strong> Routine improvement or maintenance.</li>
          <li><strong>Low:</strong> Cosmetic or minor change.</li>
        </ul>
      </div>
    ),
    autoFillValue: "priority-2" // High
  }
};

// Risk Assessment Interactive Flow Components
const RiskAssessmentFlow = ({ onComplete }: { onComplete: (impact: number, likelihood: number) => void }) => {
  const [step, setStep] = useState(1);
  const [impact, setImpact] = useState<number | null>(null);
  const [likelihood, setLikelihood] = useState<number | null>(null);

  const IMPACT_OPTIONS = [
    { val: 1, label: "Very Low", desc: "Negligible impact" },
    { val: 2, label: "Low", desc: "Minor first aid or minor loss" },
    { val: 3, label: "Medium", desc: "Medical treatment or moderate loss" },
    { val: 4, label: "High", desc: "Lost time injury or major loss" },
    { val: 5, label: "Very High", desc: "Fatality or catastrophic loss" },
  ];

  const LIKELIHOOD_OPTIONS = [
    { val: 1, label: "Rare", desc: "Once in 10+ years" },
    { val: 2, label: "Unlikely", desc: "Once in 1-10 years" },
    { val: 3, label: "Possible", desc: "Once a year" },
    { val: 4, label: "Likely", desc: "Once a month" },
    { val: 5, label: "Almost Certain", desc: "Once a week" },
  ];

  if (step === 1) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
          <Bot className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Step 1/2:</strong> What is the <strong>Impact level</strong> of this change? Consider potential consequences on operations, safety, and business.
          </p>
        </div>
        <div className="grid gap-2">
          {IMPACT_OPTIONS.map((opt) => (
            <button
              key={opt.val}
              onClick={() => {
                setImpact(opt.val);
                setStep(2);
              }}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-[#006699] hover:bg-blue-50 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1d3654] group-hover:text-[#006699]">{opt.label} ({opt.val})</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#006699]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
          <Bot className="w-5 h-5 text-blue-600 mt-1 shrink-0" />
          <p className="text-sm text-blue-800">
            <strong>Step 2/2:</strong> What is the <strong>Likelihood</strong> of this risk occurring? Consider historical data.
          </p>
        </div>
        <div className="grid gap-2">
          {LIKELIHOOD_OPTIONS.map((opt) => (
            <button
              key={opt.val}
              onClick={() => {
                setLikelihood(opt.val);
                setStep(3);
                onComplete(impact!, opt.val);
              }}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-[#006699] hover:bg-blue-50 transition-all group"
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#1d3654] group-hover:text-[#006699]">{opt.label} ({opt.val})</span>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#006699]" />
              </div>
              <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in zoom-in duration-300 text-center py-6">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
        <Check className="w-6 h-6 text-green-600" />
      </div>
      <h3 className="text-lg font-bold text-[#1d3654]">Assessment Complete</h3>
      <p className="text-sm text-gray-600">
        Based on your selections (Impact: {impact}, Likelihood: {likelihood}), your Risk Level has been calculated.
      </p>
    </div>
  );
};

export const FormAssistantPanel = ({ isOpen, onClose, fieldId, onAutoFill }: FormAssistantPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [riskKey, setRiskKey] = useState(0); // To reset risk flow

  useEffect(() => {
    if (!isOpen) {
      // Reset states on close
      setIsSuccess(false);
      setIsLoading(false);
      setRiskKey(prev => prev + 1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAutoFill = (value: any) => {
    setIsLoading(true);
    setTimeout(() => {
      onAutoFill(fieldId!, value);
      setIsLoading(false);
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 1500); // 1.5s delay for realism
  };

  const isRiskField = fieldId === 'riskBeforeChange' || fieldId === 'riskAfterChange';
  const response = fieldId && !isRiskField ? MOCK_RESPONSES[fieldId] : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-[400px] md:w-[450px] bg-white shadow-2xl z-50 border-l border-[#E5E7EB] flex flex-col"
      >
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#E5E7EB] bg-gradient-to-r from-[#1d3654] to-[#006699] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-lg">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isRiskField ? (
             <div className="space-y-6">
                <h3 className="text-xl font-bold text-[#1d3654]">Risk Assessment Guide</h3>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                  I'll help you determine the risk level by asking about Impact and Likelihood.
                </div>
                
                <RiskAssessmentFlow 
                   key={riskKey}
                   onComplete={(impact, likelihood) => {
                      const assessment = createRiskAssessment(impact, likelihood);
                      handleAutoFill(assessment);
                   }} 
                />
             </div>
          ) : response ? (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-[#1d3654]">{response.title}</h3>
              
              <div className="prose prose-sm text-gray-600 max-w-none">
                {response.content}
              </div>

              <div className="border-t border-gray-100 pt-6 mt-2">
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm font-medium text-gray-500">Ready to proceed?</p>
                  {isSuccess ? (
                     <motion.div 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full border border-green-200 font-medium"
                     >
                       <Check className="w-5 h-5" />
                       Field filled successfully!
                     </motion.div>
                  ) : (
                    <Button
                      onClick={() => handleAutoFill(response.autoFillValue)}
                      disabled={isLoading}
                      className={cn(
                        "w-full h-12 bg-gradient-to-r from-[#1d3654] to-[#006699] hover:brightness-110 text-white shadow-lg text-base gap-2",
                        isLoading && "opacity-80"
                      )}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Let AI Fill This For Me
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">
              Select a field with the <Sparkles className="w-4 h-4 inline mx-1 text-[#006699]" /> icon to get assistance.
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

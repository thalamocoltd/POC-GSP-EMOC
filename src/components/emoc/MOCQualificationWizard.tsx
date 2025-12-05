import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, AlertCircle, Check, X, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Card } from "../ui/card";
import { cn } from "../ui/utils";

interface MOCQualificationWizardProps {
  onBack: () => void;
  onQualified: () => void;
  onNotQualified: () => void;
  isMobile?: boolean;
}

interface Question {
  id: string;
  question: string;
}

const QUALIFICATION_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "Is this change related to TPM Loss (Total Productive Maintenance loss - including equipment downtime, defects, or efficiency improvements)?",
  },
  {
    id: "q2",
    question: "Is this change related to Safety (worker safety, hazard mitigation, incident prevention, or safety system modifications)?",
  },
  {
    id: "q3",
    question: "Is this change related to Environment (environmental compliance, emissions reduction, waste management, or ecological impact)?",
  },
  {
    id: "q4",
    question: "Is this change related to Quality (product quality, specifications, consistency, or quality management system improvements)?",
  },
];

export const MOCQualificationWizard = ({
  onBack,
  onQualified,
  onNotQualified,
  isMobile = false
}: MOCQualificationWizardProps) => {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const handleAnswerChange = (questionId: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Reset validation error when user changes answers
    if (validationError) setValidationError(false);
  };

  const allQuestionsAnswered = QUALIFICATION_QUESTIONS.every(q => answers[q.id] !== undefined && answers[q.id] !== null);

  const checkQualification = () => {
    // Count 'Yes' answers - require at least 2 from 5 questions
    const yesCount = Object.values(answers).filter(a => a === true).length;
    return yesCount >= 2;
  };

  const handleNext = () => {
    const isQualified = checkQualification();

    if (isQualified) {
      onQualified();
    } else {
      setValidationError(true);
      setShowResult(true);
    }
  };

  const handleStartOver = () => {
    setAnswers({});
    setShowResult(false);
    setValidationError(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Left: Context Menu Stepper - Desktop only */}
      {!isMobile && (
        <aside className="fixed left-[72px] top-16 h-[calc(100vh-64px)] w-[300px] bg-white border-r border-[#E5E7EB] z-10 overflow-y-auto pb-20">
          <div className="p-6">
            <h3 className="text-xs font-semibold text-[#68737D] uppercase tracking-wider mb-6">
              MOC Steps
            </h3>
            <nav className="space-y-1">
              {/* Step 0: MOC Prescreening - Active */}
              <div className="mb-2">
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left relative",
                    "bg-[#EBF5FF] border-2 border-[#006699]"
                  )}
                  disabled
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                    "bg-[#006699] text-white font-semibold"
                  )}>
                    <span className="text-sm font-semibold">0</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "text-[14px] font-medium transition-colors block truncate",
                      "text-[#1C1C1E] font-semibold"
                    )}>
                      MOC Prescreening
                    </span>
                  </div>
                </button>
              </div>

              {/* Steps 1-4: Grayed out and non-clickable */}
              {[
                { step: 1, label: "Initiation" },
                { step: 2, label: "Review" },
                { step: 3, label: "Implementation" },
                { step: 4, label: "Closeout" }
              ].map((item) => (
                <div key={item.step} className="mb-2">
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left relative",
                      "opacity-60 cursor-not-allowed"
                    )}
                    disabled
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                      "bg-[#E5E7EB] text-[#9CA3AF]"
                    )}>
                      <span className="text-sm font-semibold">{item.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "text-[14px] font-medium transition-colors block truncate",
                        "text-[#9CA3AF]"
                      )}>
                        {item.label}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* Right: Prescreening Form */}
      <main
        className="flex-1 overflow-y-auto bg-[#F2F2F2] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {!showResult ? (
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#1C1C1E] mb-2">MOC Prescreening Form</h1>
              <p className="text-[#68737D]">
                Answer the following questions to determine if this change qualifies for the Management of Change process.
              </p>
            </div>

            {/* Questions Container */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 mb-8">
              <div className="space-y-8">
                {QUALIFICATION_QUESTIONS.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="pb-8 border-b border-[#E5E7EB] last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-6">
                      {/* Left: Question Number + Text */}
                      <div className="flex-1 flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md border-2 border-white"
                          style={{ backgroundColor: '#006699' }}
                        >
                          <span className="text-lg font-bold text-white">{index + 1}</span>
                        </div>
                        <Label className="text-[15px] font-medium text-[#1C1C1E] leading-relaxed pt-1.5">
                          {question.question}
                        </Label>
                      </div>

                      {/* Right: Yes/No Buttons */}
                      <div className="flex gap-2 shrink-0" style={{ minWidth: "180px" }}>
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(question.id, true)}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-1",
                            answers[question.id] === true
                              ? "border-[#006699] bg-[#EBF5FF] text-[#006699]"
                              : "border-[#E5E7EB] bg-white text-[#68737D] hover:border-[#D4D9DE]"
                          )}
                        >
                          <Check className="w-4 h-4" />
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(question.id, false)}
                          className={cn(
                            "flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-1",
                            answers[question.id] === false
                              ? "border-red-500 bg-red-50 text-red-500"
                              : "border-[#E5E7EB] bg-white text-[#68737D] hover:border-[#D4D9DE]"
                          )}
                        >
                          <X className="w-4 h-4" />
                          No
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-8 border-t border-[#E5E7EB] mt-8 pt-6">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="border-[#D4D9DE]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!allQuestionsAnswered}
                  className="bg-gradient-to-r from-[#1d3654] to-[#006699] hover:brightness-110 text-white px-8"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center py-12 bg-white rounded-xl border border-[#E5E7EB] p-8"
          >
            {validationError ? (
              <>
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#1C1C1E] mb-3">
                  Validation Failed
                </h2>
                <p className="text-[#68737D] mb-8 max-w-md mx-auto">
                  Minimum 2 "Yes" selections are required to proceed with the MOC initiation.
                  This change may not meet the criteria for a formal Management of Change process.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="border-[#D4D9DE]"
                  >
                    Back to Dashboard
                  </Button>
                  <Button
                    onClick={handleStartOver}
                    className="bg-white text-[#1d3654] border border-[#D4D9DE] hover:bg-gray-50 gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </Button>
                </div>
              </>
            ) : null}
          </motion.div>
        )}
      </main>
    </div>
  );
};

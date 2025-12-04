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
}

interface Question {
  id: string;
  question: string;
}

const QUALIFICATION_QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "Does this change involve modification to equipment, process, or procedure?",
  },
  {
    id: "q2",
    question: "Will this change affect safety systems or critical operations?",
  },
  {
    id: "q3",
    question: "Is this change temporary (less than 30 days)?",
  },
  {
    id: "q4",
    question: "Does this change require engineering review or approval?",
  }
];

export const MOCQualificationWizard = ({ 
  onBack, 
  onQualified, 
  onNotQualified 
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
    // Count 'Yes' answers
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
    <div className="max-w-[900px] pb-20 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      <Card className="border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#1d3654] to-[#006699] p-8 text-white">
          <h1 className="text-2xl font-bold mb-2">MOC Prescreening Form</h1>
          <p className="text-white/80">
            Answer the following questions to determine if this change qualifies as a Management of Change (MOC)
          </p>
        </div>

        <div className="p-8 sm:p-10 pt-6">
          {!showResult ? (
            <div className="space-y-6">
              {QUALIFICATION_QUESTIONS.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="pb-6 border-b border-[#E5E7EB] last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#EBF5FF] flex items-center justify-center shrink-0 mt-1">
                      <span className="font-semibold text-[#006699]">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <Label className="text-base font-medium text-[#1C1C1E] mb-4 block">
                        {question.question}
                      </Label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(question.id, true)}
                          className={cn(
                            "flex-1 px-6 py-4 rounded-xl border-2 transition-all font-medium",
                            answers[question.id] === true
                              ? "border-[#006699] bg-[#EBF5FF] text-[#006699] shadow-sm"
                              : "border-[#E5E7EB] bg-white text-[#68737D] hover:border-[#D4D9DE] hover:bg-[#F7F8FA]"
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Check className={cn(
                              "w-5 h-5",
                              answers[question.id] === true ? "opacity-100 text-green-600" : "opacity-40"
                            )} />
                            <span className={answers[question.id] === true ? "text-[#006699]" : ""}>Yes</span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(question.id, false)}
                          className={cn(
                            "flex-1 px-6 py-4 rounded-xl border-2 transition-all font-medium",
                            answers[question.id] === false
                              ? "border-[#006699] bg-[#EBF5FF] shadow-sm"
                              : "border-[#E5E7EB] bg-white text-[#68737D] hover:border-[#D4D9DE] hover:bg-[#F7F8FA]"
                          )}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <X className={cn(
                              "w-5 h-5",
                              answers[question.id] === false ? "opacity-100 text-red-600" : "opacity-40"
                            )} />
                            <span className={answers[question.id] === false ? "text-[#006699]" : ""}>No</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="flex justify-center gap-3 pt-4">
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
                <Button
                  variant="outline"
                  onClick={onQualified}
                  className="border-[#006699] text-[#006699] hover:bg-[#EBF5FF] px-6"
                >
                  Skip (Demo)
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
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
              ) : (
                /* Success State - Note: The 'Next' button handles onQualified directly if passed, 
                   so this part might not be reachable unless we wanted a success confirmation screen first.
                   But per requirement 'Replace submit button with Next', usually implies direct navigation 
                   if validation passes. 
                   However, if we want to show success feedback first:
                */
                <>
                   {/* Logic for success is handled in handleNext -> onQualified(). 
                       We only reach here if validation failed.
                       But keeping structure if we need it. */}
                </>
              )}
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
};

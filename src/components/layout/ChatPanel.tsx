import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, ArrowUp, ArrowRight, Check } from "lucide-react";
import { cn } from "../ui/utils";
import { useAI } from "../../context/AIContext";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

interface Message {
  id: string;
  role: "ai" | "user";
  content: string | React.ReactNode;
  timestamp: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'normal' | 'validation-error';
  errors?: Record<string, string>;
}

// Field interaction types
type FieldInteractionType = 'advice-only' | 'choices' | 'ask-and-fill';

// Mock responses for AI Field Assistant  
const FIELD_RESPONSES: Record<string, {
  text: string;
  value?: any;
  interactionType: FieldInteractionType;
  choices?: Array<{ label: string; value: any }>;
}> = {
  mocTitle: {
    text: "MOC Title should clearly communicate the essence of the change. Recommended format: Equipment/Area + Type of Change + Purpose\n\nExamples:\n- 'Upgrade Pump P-101 Motor to IE3 Standard'\n- 'Replace Heat Exchanger E-205 Tubes'\n- 'Install New Safety Valve on Tank T-301'\n\n✏️ The title helps reviewers quickly understand the scope and importance of your MOC.",
    interactionType: 'advice-only'
  },
  lengthOfChange: {
    text: "The duration type determines approval workflow and follow-up requirements. Choose the appropriate type:",
    interactionType: 'choices',
    choices: [
      { label: "Permanent - Indefinite change with no expiration date", value: "length-1" },
      { label: "Temporary - Short-term change (< 1 year) requires end date", value: "length-2" },
      { label: "Overriding - Emergency change for immediate safety action", value: "length-3" }
    ]
  },
  typeOfChange: {
    text: "The change type determines approvers and review procedures. Select the type that matches your work:",
    interactionType: 'choices',
    choices: [
      { label: "Plant Change - Physical facility or infrastructure modification", value: "type-1" },
      { label: "Maintenance Change - Equipment repair or replacement activities", value: "type-2" },
      { label: "Process Change - Production process or operating procedure modification", value: "type-3" }
    ]
  },
  priorityId: {
    text: "Priority level depends on impact to safety, environment, and production:",
    interactionType: 'choices',
    choices: [
      { label: "Normal - No immediate emergency, can be planned and scheduled", value: "priority-1" },
      { label: "Emergency - Requires immediate action for safety or critical operations", value: "priority-2" }
    ]
  },
  costEstimated: {
    text: "Estimated cost for this project including equipment, labor, and installation. This helps with approval decisions and budget allocation.\n\n💰 Do you have a cost estimate? Let me know, or I can fill in an example value (e.g., 500,000 THB).",
    interactionType: 'ask-and-fill',
    value: 500000
  },
  detailOfChange: {
    text: "Describe what will be changed in detail. Include technical specifications, standards, or relevant equipment information.\n\n📝 Tell me the details you want to change, or I can fill in an example for you.",
    interactionType: 'ask-and-fill',
    value: "Replace Pump P-101 motor from IE1 to IE3 efficiency class to improve efficiency and reduce energy consumption. Specifications: 75 kW, 380V, 50Hz"
  },
  reasonForChange: {
    text: "Explain the problem or improvement opportunity driving this change. Support with data such as failure records or increased costs.\n\n🤔 Tell me why this change is necessary, or I can fill in an example.",
    interactionType: 'ask-and-fill',
    value: "Current motor is over 15 years old with declining efficiency, resulting in 20% higher energy consumption vs. standard. Risk of failure causing production downtime."
  },
  scopeOfWork: {
    text: "Define work scope including key steps, required equipment, and estimated duration.\n\n🔧 Tell me the scope of work needed, or I can fill in an example.",
    interactionType: 'ask-and-fill',
    value: "1. Remove existing motor 2. Install new motor with coupling 3. Test operation 4. Perform alignment 5. Full load testing (Duration: 8 hours)"
  },
  benefitsValue: {
    text: "Select benefit categories from this change (multiple selections allowed):",
    interactionType: 'choices',
    choices: [
      { label: "Safety - Improve safety, reduce personnel risk", value: "benefit-1" },
      { label: "Environment - Reduce environmental impact, save resources", value: "benefit-2" },
      { label: "Community - Reduce community impact", value: "benefit-3" },
      { label: "Reputation - Enhance image and credibility", value: "benefit-4" },
      { label: "Law - Comply with regulations and requirements", value: "benefit-5" },
      { label: "Money - Cost savings or revenue increase", value: "benefit-6" }
    ]
  },
  expectedBenefits: {
    text: "Describe expected benefits with measurable metrics such as energy reduction, downtime decrease, etc.\n\n✨ Would you like me to fill in example benefits? (Future: will auto-calculate from form data)",
    interactionType: 'ask-and-fill',
    value: "Reduce electrical energy consumption by 15% (~45,000 kWh/year), saving 180,000 THB/year in electricity costs. Improve system reliability, reduce downtime by 95%."
  },
  estimatedValue: {
    text: "Annual benefit value calculated from cost savings, efficiency gains, or revenue increase.\n\n💵 Would you like me to fill in an estimated value? (Future: will auto-calculate from form data)",
    interactionType: 'ask-and-fill',
    value: 180000
  },
  riskBeforeChange: {
    text: "Let's assess the risk before implementing this change. I'll guide you through two steps:\n\n**Step 1:** First, select the likelihood (probability) of the risk occurring:",
    interactionType: 'choices',
    choices: [
      { label: "1 - Rare (Almost never happens)", value: { step: 'likelihood', likelihood: 1, likelihoodLabel: "Rare" } },
      { label: "2 - Unlikely (Could happen sometimes)", value: { step: 'likelihood', likelihood: 2, likelihoodLabel: "Unlikely" } },
      { label: "3 - Possible (Might happen often)", value: { step: 'likelihood', likelihood: 3, likelihoodLabel: "Possible" } },
      { label: "4 - Likely (Will probably happen)", value: { step: 'likelihood', likelihood: 4, likelihoodLabel: "Likely" } },
      { label: "5 - Almost Certain (Expected to happen)", value: { step: 'likelihood', likelihood: 5, likelihoodLabel: "Almost Certain" } }
    ]
  },
  riskAfterChange: {
    text: "Now let's assess the risk after implementing the change. This should typically be lower.\n\n**Step 1:** First, select the likelihood (probability) of the risk occurring:",
    interactionType: 'choices',
    choices: [
      { label: "1 - Rare (Almost never happens)", value: { step: 'likelihood', likelihood: 1, likelihoodLabel: "Rare" } },
      { label: "2 - Unlikely (Could happen sometimes)", value: { step: 'likelihood', likelihood: 2, likelihoodLabel: "Unlikely" } },
      { label: "3 - Possible (Might happen often)", value: { step: 'likelihood', likelihood: 3, likelihoodLabel: "Possible" } },
      { label: "4 - Likely (Will probably happen)", value: { step: 'likelihood', likelihood: 4, likelihoodLabel: "Likely" } },
      { label: "5 - Almost Certain (Expected to happen)", value: { step: 'likelihood', likelihood: 5, likelihoodLabel: "Almost Certain" } }
    ]
  }
};

export const ChatPanel = ({ isOpen, onClose, onCommand }: ChatPanelProps) => {
  const { activeFieldId, lastQuestion, triggerAutoFill, validationErrorsToReport, shouldAutoSubmitQuestion, setShouldAutoSubmitQuestion } = useAI();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello Chatree D. How can I assist you with GSP eMoC tasks today?",
      timestamp: "10:23 AM",
    },
  ]);

  // State for risk assessment wizard
  const [riskWizardState, setRiskWizardState] = useState<{
    fieldId: string | null;
    likelihood: number | null;
    likelihoodLabel: string | null;
  }>({
    fieldId: null,
    likelihood: null,
    likelihoodLabel: null
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(isOpen);

  // Function to calculate risk level from likelihood and impact
  const calculateRiskLevel = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    let level = "Low";

    if (score >= 20) level = "Extreme";
    else if (score >= 12) level = "High";
    else if (score >= 6) level = "Medium";
    else level = "Low";

    return { level, score };
  };

  // Function to get impact label
  const getImpactLabel = (impact: number) => {
    const labels = ["", "Negligible", "Minor", "Medium", "Major", "Catastrophic"];
    return labels[impact] || "Unknown";
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Handle validation errors
  useEffect(() => {
    if (validationErrorsToReport && Object.keys(validationErrorsToReport).length > 0) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "ai",
        content: "I've found some issues with your form submission.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'validation-error',
        errors: validationErrorsToReport
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [validationErrorsToReport]);

  // Scroll immediately when panel opens without animation
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Panel just opened - scroll immediately without animation
      setTimeout(() => {
        scrollToBottom("auto");
      }, 0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll smoothly when messages/typing changes
  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isTyping]);

  // Clean up field-specific context when panel closes
  useEffect(() => {
    if (!isOpen) {
      // Panel closed - clear stale state after brief delay
      const cleanupTimer = setTimeout(() => {
        setShouldAutoSubmitQuestion(false);
      }, 100);
      return () => clearTimeout(cleanupTimer);
    }
  }, [isOpen, setShouldAutoSubmitQuestion]);

  // Handle auto-question from AI Context
  useEffect(() => {
    // CRITICAL: Only auto-submit if explicitly triggered via "Ask AI" button
    if (isOpen && lastQuestion && activeFieldId && shouldAutoSubmitQuestion) {
      // Check if we already sent this question to avoid loops (simple check based on last message)
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "user" && lastMsg.content === lastQuestion) {
        setShouldAutoSubmitQuestion(false); // Reset flag even if duplicate
        return;
      }

      // Send user question
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: lastQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      // IMPORTANT: Reset flag immediately after processing
      setShouldAutoSubmitQuestion(false);

      // Generate AI Response
      setTimeout(() => {
        setIsTyping(false);
        const responseData = FIELD_RESPONSES[activeFieldId];

        if (responseData) {
          // For choices type, render choice buttons
          if (responseData.interactionType === 'choices' && responseData.choices) {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content: (
                <div className="space-y-3">
                  <p className="whitespace-pre-line">{responseData.text}</p>
                  <div className="flex flex-col gap-2">
                    {responseData.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const isRiskField = activeFieldId === 'riskBeforeChange' || activeFieldId === 'riskAfterChange';

                          // Handle risk assessment wizard (2-step process)
                          if (isRiskField && choice.value.step === 'likelihood') {
                            // Step 1: User selected likelihood, now ask for impact
                            setRiskWizardState({
                              fieldId: activeFieldId,
                              likelihood: choice.value.likelihood,
                              likelihoodLabel: choice.value.likelihoodLabel
                            });

                            setMessages(prev => [...prev, {
                              id: Date.now().toString(),
                              role: "ai",
                              content: (
                                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                                  <Check className="w-4 h-4" />
                                  Selected: {choice.value.likelihoodLabel}
                                </div>
                              ),
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }]);

                            // Show impact selection
                            setTimeout(() => {
                              setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                role: "ai",
                                content: (
                                  <div className="space-y-3">
                                    <p className="whitespace-pre-line"><strong>Step 2:</strong> Now select the impact (severity) if this risk occurs:</p>
                                    <div className="flex flex-col gap-2">
                                      {[
                                        { impact: 1, label: "1 - Negligible (Minimal effect)" },
                                        { impact: 2, label: "2 - Minor (Small impact)" },
                                        { impact: 3, label: "3 - Medium (Moderate impact)" },
                                        { impact: 4, label: "4 - Major (Serious impact)" },
                                        { impact: 5, label: "5 - Catastrophic (Severe impact)" }
                                      ].map((impactChoice) => (
                                        <button
                                          key={impactChoice.impact}
                                          onClick={() => {
                                            const { level, score } = calculateRiskLevel(choice.value.likelihood, impactChoice.impact);
                                            const impactLabel = getImpactLabel(impactChoice.impact);

                                            const riskValue = {
                                              level,
                                              score,
                                              likelihood: choice.value.likelihood,
                                              impact: impactChoice.impact,
                                              likelihoodLabel: choice.value.likelihoodLabel,
                                              impactLabel
                                            };

                                            triggerAutoFill(riskValue);
                                            setRiskWizardState({ fieldId: null, likelihood: null, likelihoodLabel: null });

                                            setMessages(prev => [...prev, {
                                              id: Date.now().toString(),
                                              role: "ai",
                                              content: (
                                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                                  <Check className="w-4 h-4" />
                                                  Risk calculated: <strong>{level}</strong> (Score: {score}) - {choice.value.likelihoodLabel} × {impactLabel}
                                                </div>
                                              ),
                                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            }]);
                                          }}
                                          className="text-left justify-start h-auto py-2 px-3 text-xs bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#006699] hover:text-[#006699] transition-colors"
                                        >
                                          <div className="flex items-center gap-2">
                                            <ArrowRight className="w-3 h-3 shrink-0" />
                                            <span className="whitespace-normal">{impactChoice.label}</span>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ),
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }]);
                            }, 300);
                          } else {
                            // Handle normal choices (non-risk fields)
                            triggerAutoFill(choice.value);
                            const isMultiSelect = activeFieldId === 'benefitsValue';
                            setMessages(prev => [...prev, {
                              id: Date.now().toString(),
                              role: "ai",
                              content: (
                                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                                  <Check className="w-4 h-4" />
                                  {isMultiSelect
                                    ? `Selected "${choice.label.split(' - ')[0]}". You can select more!`
                                    : `Selected "${choice.label.split(' - ')[0]}" and filled the form!`}
                                </div>
                              ),
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }]);
                          }
                        }}
                        className="text-left justify-start h-auto py-2 px-3 text-xs bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#006699] hover:text-[#006699] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <ArrowRight className="w-3 h-3 shrink-0" />
                          <span className="whitespace-normal">{choice.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiResponse]);
          }
          // For ask-and-fill type, show auto-fill button
          else if (responseData.interactionType === 'ask-and-fill' && responseData.value !== undefined) {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content: responseData.text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              action: {
                label: "Let AI Fill This For Me",
                onClick: () => {
                  triggerAutoFill(responseData.value);
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: "ai",
                    content: (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <Check className="w-4 h-4" /> Field updated successfully!
                      </div>
                    ),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
                }
              }
            };
            setMessages(prev => [...prev, aiResponse]);
          }
          // For advice-only type, just show text
          else {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              role: "ai",
              content: <p className="whitespace-pre-line">{responseData.text}</p>,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, aiResponse]);
          }
        } else {
          // Fallback
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "I can provide general information about this field, but I don't have specific recommendations yet.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      }, 1500);
    }
  }, [isOpen, lastQuestion, activeFieldId, shouldAutoSubmitQuestion]); // Removed messages from dependency to avoid loop

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    const lowerInput = userMessage.content.toLowerCase();

    // Simulate AI response logic
    setTimeout(() => {
      setIsTyping(false);

      let aiResponse: Message;

      if (lowerInput.includes("create request") || lowerInput.includes("new request")) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "I've extracted the details from your request. Please review the form before submission.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: {
            label: "Open Request Form",
            onClick: () => onCommand("autofill"),
          },
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "I understand. Is there anything specific about the MOC process you'd like to know?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Chat Panel - No backdrop, doesn't block content */}
          <motion.aside
            initial={{ x: 400, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              opacity: { duration: 0.2 }
            }}
            className="fixed right-6 top-20 h-[calc(100vh-112px)] w-full sm:w-[400px] bg-white z-40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl flex flex-col border border-[#E5E7EB] pointer-events-auto"
          >
            {/* Header */}
            <div className="h-[72px] px-6 border-b border-[#E5E7EB] flex items-center justify-between bg-white rounded-t-xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1d3654] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-[#1C1C1E]">AI Assistant</span>
                  <span className="text-[11px] text-[#006699] font-medium">Online • System Intelligence</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-[#1d3654] text-white rounded-tr-sm"
                        : msg.type === 'validation-error'
                        ? "bg-red-50 border border-red-200 rounded-tl-sm"
                        : "bg-white text-[#1C1C1E] border border-gray-100 rounded-tl-sm"
                    )}
                  >
                    {msg.type === 'validation-error' && msg.errors ? (
                      <div className="space-y-2">
                        <p className="whitespace-pre-line text-sm">{msg.content}</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {Object.entries(msg.errors).map(([fieldId, errorMsg]) => (
                            <li key={fieldId}>{errorMsg}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <>
                        {msg.content}
                        {msg.action && (
                          <button
                            type="button"
                            onClick={msg.action.onClick}
                            className="mt-3 flex items-center gap-1 text-[#006699] text-sm font-bold hover:underline bg-[#F0F7FA] px-3 py-2 rounded-lg w-full justify-center transition-colors hover:bg-[#E1F0F5]"
                          >
                            {msg.action.label} <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <span className="mt-1.5 text-[11px] text-gray-400 font-medium px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col max-w-[85%] mr-auto items-start">
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-[#006699] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
                        className="w-2 h-2 bg-[#006699] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
                        className="w-2 h-2 bg-[#006699] rounded-full"
                      />
                    </div>
                  </div>
                  <span className="mt-1.5 text-[11px] text-gray-400 font-medium px-1">
                    Thinking...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-[#E5E7EB] bg-white rounded-b-xl">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="w-full min-h-[56px] max-h-[120px] p-4 pr-12 bg-[#F7F9FC] border border-transparent focus:border-[#006699] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006699]/10 resize-none text-sm transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-[#1d3654] rounded-lg flex items-center justify-center text-white hover:bg-[#006699] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex justify-center">
                <p className="text-[10px] text-gray-400">
                  AI-generated responses should be verified by engineering or operations staff.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

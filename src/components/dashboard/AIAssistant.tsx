import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, MessageSquare, ChevronDown, Check, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAI } from "../../context/AIContext";

// Mock data for AI responses - Field labels for better UX
const FIELD_LABELS: Record<string, string> = {
  mocTitle: "MOC Title",
  areaId: "Location (Area)",
  unitId: "Unit",
  background: "Background",
  impact: "Impact",
  scopeOfWork: "Scope of Work",
  preliminaryReview: "Preliminary Review",
  tpmLossTypeId: "TPM Loss Type",
  benefit: "Benefit",
  benefitValue: "Benefit Value",
  investment: "Investment",
  lengthOfChange: "Length of Change",
  priorityId: "Priority",
  riskBeforeChange: "Risk Before Change",
  riskAfterChange: "Risk After Change"
};

// Mock data for AI responses
const FIELD_HELP_DATA: Record<string, { explanation: string; mockValue: any }> = {
  mocTitle: {
    explanation: "A clear title helps track the MOC. Include the equipment name and the nature of change.",
    mockValue: "Pump P-101A Efficiency Upgrade Project"
  },
  areaId: {
    explanation: "Select the plant area where the change will physically occur.",
    mockValue: "area-1"
  },
  unitId: {
    explanation: "Select the specific process unit. This determines the approvers.",
    mockValue: "unit-1-1"
  },
  background: {
    explanation: "Explain the current situation and why the change is proposed. Include data if possible.",
    mockValue: "Current pump P-101A efficiency has dropped below 60%, causing increased energy consumption and vibration issues."
  },
  impact: {
    explanation: "Describe what happens if we do (or don't do) this change. Consider safety, production, and environment.",
    mockValue: "Production capacity is limited during peak demand; risk of total failure is increasing."
  },
  scopeOfWork: {
    explanation: "List the specific physical works to be performed.",
    mockValue: "Replace impeller and wear rings; install new mechanical seal; upgrade motor to IE3 standard."
  },
  preliminaryReview: {
    explanation: "Add initial comments or constraints identified during early review.",
    mockValue: "Reviewed with Maintenance Manager; budget approved in principle. Requires shutdown window."
  },
  tpmLossTypeId: {
    explanation: "TPM Loss Types categorize efficiency losses. For an equipment upgrade request, 'Equipment Failure' is typically the primary loss to address.",
    mockValue: "loss-1"
  },
  benefit: {
    explanation: "Describe the tangible outcomes. Focus on quantifiable metrics like efficiency gains, cost savings, or safety improvements.",
    mockValue: "Expected to reduce equipment downtime by 15% annually, saving approximately 40 maintenance hours and preventing unplanned outages."
  },
  benefitValue: {
    explanation: "Estimate the financial value of the benefits over a one-year period. Include maintenance savings and production uptime value.",
    mockValue: 150000
  },
  investment: {
    explanation: "Total estimated cost for the project, including hardware, software, and labor costs.",
    mockValue: 45000
  },
  lengthOfChange: {
    explanation: "How long will this change be effective? For permanent modifications, you can leave this or specify the expected asset life.",
    mockValue: { years: 5, months: 0, days: 0 }
  },
  priorityId: {
    explanation: "Priority is determined by impact on safety, environment, and production. 'High' is appropriate for changes preventing significant loss.",
    mockValue: "priority-2"
  },
  riskBeforeChange: {
    explanation: "Assess the current risk level without the change. Consider the likelihood of failure and its impact severity.",
    mockValue: {
      level: "High",
      score: 12,
      likelihood: 3,
      impact: 4,
      likelihoodLabel: "Possible",
      impactLabel: "Major"
    }
  },
  riskAfterChange: {
    explanation: "Estimate the residual risk after implementation. The change should reduce likelihood or impact to an acceptable level.",
    mockValue: {
      level: "Low",
      score: 4,
      likelihood: 2,
      impact: 2,
      likelihoodLabel: "Unlikely",
      impactLabel: "Minor"
    }
  }
};

export const AIAssistant = () => {
  const {
    isChatOpen,
    setChatOpen,
    activeFieldId,
    lastQuestion,
    triggerAutoFill,
    messages,
    addMessage,
    setMessages,
    scrollToCallback,
    openAssistantForField,
    errorAutoFillCallback
  } = useAI();

  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Debug: Log messages when they change
  useEffect(() => {
    console.log("AIAssistant: messages updated", messages);
  }, [messages]);

  // Handle opening specific field help
  useEffect(() => {
    if (isChatOpen && activeFieldId && lastQuestion) {
      // Check if the last message is already this question to avoid dupes
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'user' && lastMsg.content === lastQuestion) return;

      addMessage({ role: 'user', content: lastQuestion });
      setIsTyping(true);

      // Simulate AI processing
      const timer = setTimeout(() => {
        const helpData = FIELD_HELP_DATA[activeFieldId];
        const responseText = helpData
          ? helpData.explanation
          : "I can help you with this field. Please provide more context on what you need.";

        addMessage({
          role: 'ai',
          content: responseText,
          showAction: !!helpData,
          actionFilled: false
        });
        setIsTyping(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isChatOpen, activeFieldId, lastQuestion]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleAutoFill = (index: number) => {
    if (!activeFieldId) return;

    const helpData = FIELD_HELP_DATA[activeFieldId];
    if (helpData) {
      triggerAutoFill(helpData.mockValue);

      // Update message state to show filled
      setMessages(prev => prev.map((msg, i) =>
        i === index ? { ...msg, actionFilled: true } : msg
      ));

      // Add success message
      setTimeout(() => {
        addMessage({ role: 'ai', content: "I've filled that field for you. Let me know if you need anything else!" });
      }, 500);
    }
  };

  const handleErrorAskAI = (fieldId: string) => {
    if (errorAutoFillCallback) {
      const fieldLabel = FIELD_LABELS[fieldId] || fieldId;
      openAssistantForField(
        fieldId,
        `How should I fill the ${fieldLabel} field?`,
        (val) => errorAutoFillCallback(fieldId, val)
      );
    }
  };

  if (!isChatOpen) {
    return (
      <Button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#1d3654] text-white shadow-xl hover:bg-[#006699] transition-all duration-300 hover:scale-105"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 top-0 z-50 w-[400px] bg-white shadow-2xl border-l border-gray-200 animate-in slide-in-from-right duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#1d3654] flex items-center justify-center text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#1d3654]">AI Assistant</h3>
            <p className="text-xs text-blue-500 font-medium flex items-center gap-1">
              <span className="block h-1.5 w-1.5 rounded-full bg-green-500"></span>
              Online • System Intelligence
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#F8FAFC] p-4 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' ? (
                <div className="h-8 w-8 rounded-full bg-[#1d3654] flex items-center justify-center text-white flex-shrink-0 mt-1">
                  <Sparkles className="h-4 w-4" />
                </div>
              ) : (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>US</AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[90%] space-y-2 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                <div className={`p-4 rounded-2xl shadow-sm border ${msg.role === 'user'
                  ? 'bg-[#006699] text-white rounded-tr-none border-transparent'
                  : 'bg-white text-gray-700 rounded-tl-none border-gray-100'
                  }`}>
                  {/* Content */}
                  {msg.type === 'validation-error' && msg.errors ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 font-semibold text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span>Found {Object.keys(msg.errors).length} issues</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex flex-col gap-2 mt-2">
                        {Object.entries(msg.errors).map(([field, error], i) => (
                          <div key={field} className="bg-red-50 p-2 rounded-lg border border-red-100 text-sm flex flex-col gap-2">
                            <button
                              onClick={() => scrollToCallback && scrollToCallback(field)}
                              className="text-left font-medium text-red-700 hover:underline flex items-start gap-2"
                            >
                              <span>{i + 1}.</span>
                              <span>{error}</span>
                            </button>
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleErrorAskAI(field)}
                                className="h-7 text-xs text-[#006699] hover:bg-blue-50 hover:text-[#006699]"
                              >
                                <Sparkles className="w-3 h-3 mr-1" /> Ask AI
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>

                {/* Action Button for AI */}
                {msg.showAction && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    {msg.actionFilled ? (
                      <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg inline-block">
                        <Check className="w-3 h-3" /> Field filled successfully
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAutoFill(idx)}
                        className="bg-white text-[#006699] border-[#006699] hover:bg-blue-50 text-xs h-8"
                      >
                        <Sparkles className="w-3 h-3 mr-2" />
                        Let AI Fill This For Me
                      </Button>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 block px-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-[#1d3654] flex items-center justify-center text-white flex-shrink-0 mt-1">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-1 flex items-center gap-2 pr-2">
            <Input
              placeholder="Ask anything..."
              className="border-none shadow-none bg-transparent focus-visible:ring-0 text-sm"
            />
            <Button size="icon" className="h-8 w-8 bg-[#1d3654] hover:bg-[#006699] rounded-lg">
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-2">
            AI-generated responses should be verified by operational staff.
          </p>
        </div>
      </div>
    </div>
  );
};

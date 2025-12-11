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
  lengthOfChange: "Length of Change",
  typeOfChange: "Type of Change",
  priorityId: "Priority of Change",
  areaId: "Area",
  unitId: "Unit",
  costEstimated: "Cost Estimated of Change",
  detailOfChange: "Detail of Change",
  reasonForChange: "Reason for Change",
  scopeOfWork: "Scope of Work",
  benefitsValue: "Benefits Value",
  expectedBenefits: "Expected Benefits",
  estimatedValue: "Estimated Value",
  riskBeforeChange: "Risk Assessment Before Change",
  riskAfterChange: "Risk Assessment After Change"
};

// Field interaction types
type FieldInteractionType =
  | 'advice-only' // Only give advice, no auto-fill
  | 'choices' // Show choices in chat to select
  | 'ask-and-fill' // Ask user and auto-fill with mock data
  | 'auto-fill'; // Direct auto-fill with mock data

// Mock data for AI responses
const FIELD_HELP_DATA: Record<string, {
  explanation: string;
  interactionType: FieldInteractionType;
  mockValue?: any;
  choices?: Array<{ label: string; value: any }>;
}> = {
  mocTitle: {
    explanation: "MOC Title should clearly communicate the essence of the change. Recommended format: Equipment/Area + Type of Change + Purpose\n\nExamples:\n- 'Upgrade Pump P-101 Motor to IE3 Standard'\n- 'Replace Heat Exchanger E-205 Tubes'\n- 'Install New Safety Valve on Tank T-301'\n\n✏️ The title helps reviewers quickly understand the scope and importance of your MOC.",
    interactionType: 'advice-only'
  },
  lengthOfChange: {
    explanation: "The duration type determines approval workflow and follow-up requirements. Choose the appropriate type:",
    interactionType: 'choices',
    choices: [
      { label: "Permanent - Indefinite change with no expiration date", value: "length-1" },
      { label: "Temporary - Short-term change (< 1 year) requires end date", value: "length-2" },
      { label: "More than 3 days - Override duration exceeding 3 days", value: "length-3" },
      { label: "Less than 3 days - Override duration less than 3 days", value: "length-4" }
    ]
  },
  typeOfChange: {
    explanation: "The change type determines approvers and review procedures. Select the type that matches your work:",
    interactionType: 'choices',
    choices: [
      { label: "Plant Change (Impact PSI Cat 1,2,3) - Physical facility or infrastructure modification", value: "type-1" },
      { label: "Maintenance Change - Equipment repair or replacement activities", value: "type-2" },
      { label: "Plant Change (No Impact PSI Cat 1,2,3) - Production process or operating procedure modification", value: "type-3" },
      { label: "Override - Emergency change with override approval required", value: "type-4" }
    ]
  },
  priorityId: {
    explanation: "Priority level depends on impact to safety, environment, and production:",
    interactionType: 'choices',
    choices: [
      { label: "Normal - No immediate emergency, can be planned and scheduled", value: "priority-1" },
      { label: "Emergency - Requires immediate action for safety or critical operations", value: "priority-2" }
    ]
  },

  costEstimated: {
    explanation: "Estimated cost for this project including equipment, labor, and installation. This helps with approval decisions and budget allocation.\n\n💰 Do you have a cost estimate? Let me know, or I can fill in an example value (e.g., 500,000 THB).",
    interactionType: 'ask-and-fill',
    mockValue: 500000
  },
  detailOfChange: {
    explanation: "Describe what will be changed in detail. Include technical specifications, standards, or relevant equipment information.\n\n📝 Tell me the details you want to change, or I can fill in an example for you.",
    interactionType: 'ask-and-fill',
    mockValue: "Replace Pump P-101 motor from IE1 to IE3 efficiency class to improve efficiency and reduce energy consumption. Specifications: 75 kW, 380V, 50Hz"
  },
  reasonForChange: {
    explanation: "Explain the problem or improvement opportunity driving this change. Support with data such as failure records or increased costs.\n\n🤔 Tell me why this change is necessary, or I can fill in an example.",
    interactionType: 'ask-and-fill',
    mockValue: "Current motor is over 15 years old with declining efficiency, resulting in 20% higher energy consumption vs. standard. Risk of failure causing production downtime."
  },
  scopeOfWork: {
    explanation: "Define work scope including key steps, required equipment, and estimated duration.\n\n🔧 Tell me the scope of work needed, or I can fill in an example.",
    interactionType: 'ask-and-fill',
    mockValue: "1. Remove existing motor 2. Install new motor with coupling 3. Test operation 4. Perform alignment 5. Full load testing (Duration: 8 hours)"
  },
  benefitsValue: {
    explanation: "Select benefit categories from this change (multiple selections allowed):",
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
    explanation: "Describe expected benefits with measurable metrics such as energy reduction, downtime decrease, etc.\n\n✨ Would you like me to fill in example benefits? (Future: will auto-calculate from form data)",
    interactionType: 'ask-and-fill',
    mockValue: "Reduce electrical energy consumption by 15% (~45,000 kWh/year), saving 180,000 THB/year in electricity costs. Improve system reliability, reduce downtime by 95%."
  },
  estimatedValue: {
    explanation: "Annual benefit value calculated from cost savings, efficiency gains, or revenue increase.\n\n💵 Would you like me to fill in an estimated value? (Future: will auto-calculate from form data)",
    interactionType: 'ask-and-fill',
    mockValue: 180000
  },
  riskBeforeChange: {
    explanation: "Assess risk in current situation (before change). Consider likelihood and severity of impact.\n\nSelect risk level:",
    interactionType: 'choices',
    choices: [
      { label: "Low Risk - Minimal impact (Score 1-4)", value: { level: "Low", score: 3, likelihood: 1, impact: 3, likelihoodLabel: "Rare", impactLabel: "Medium" } },
      { label: "Medium Risk - Moderate impact (Score 5-8)", value: { level: "Medium", score: 6, likelihood: 2, impact: 3, likelihoodLabel: "Unlikely", impactLabel: "Medium" } },
      { label: "High Risk - Significant impact (Score 9-16)", value: { level: "High", score: 12, likelihood: 3, impact: 4, likelihoodLabel: "Possible", impactLabel: "Major" } },
      { label: "Extreme Risk - Severe impact (Score > 16)", value: { level: "Extreme", score: 20, likelihood: 4, impact: 5, likelihoodLabel: "Likely", impactLabel: "Catastrophic" } }
    ]
  },
  riskAfterChange: {
    explanation: "Assess risk after implementing the change. Should be reduced compared to before.\n\nSelect expected residual risk level:",
    interactionType: 'choices',
    choices: [
      { label: "Low Risk - Minimal impact (Score 1-4)", value: { level: "Low", score: 2, likelihood: 1, impact: 2, likelihoodLabel: "Rare", impactLabel: "Minor" } },
      { label: "Medium Risk - Moderate impact (Score 5-8)", value: { level: "Medium", score: 6, likelihood: 2, impact: 3, likelihoodLabel: "Unlikely", impactLabel: "Medium" } },
      { label: "High Risk - Significant impact (Score 9-16)", value: { level: "High", score: 9, likelihood: 3, impact: 3, likelihoodLabel: "Possible", impactLabel: "Medium" } }
    ]
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

        // Determine what action buttons to show based on interaction type
        const showAutoFillButton = helpData?.interactionType === 'auto-fill' || helpData?.interactionType === 'ask-and-fill';
        const showChoices = helpData?.interactionType === 'choices';

        addMessage({
          role: 'ai',
          content: responseText,
          showAction: showAutoFillButton,
          actionFilled: false,
          fieldId: activeFieldId,
          interactionType: helpData?.interactionType,
          choices: helpData?.choices
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
    if (helpData && helpData.mockValue !== undefined) {
      triggerAutoFill(helpData.mockValue);

      // Update message state to show filled
      setMessages(prev => prev.map((msg, i) =>
        i === index ? { ...msg, actionFilled: true } : msg
      ));

      // Add success message
      setTimeout(() => {
        addMessage({ role: 'ai', content: "✅ ฉันได้กรอกข้อมูลในฟอร์มให้แล้ว! ต้องการความช่วยเหลืออะไรเพิ่มเติมไหม?" });
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

                {/* Action Buttons for AI - Different types */}
                {msg.role === 'ai' && !msg.actionFilled && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                    {/* Choices buttons */}
                    {msg.interactionType === 'choices' && msg.choices && (
                      <div className="flex flex-col gap-2">
                        {msg.choices.map((choice, choiceIdx) => (
                          <Button
                            key={choiceIdx}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (msg.fieldId) {
                                triggerAutoFill(choice.value);

                                // For benefitsValue, don't mark as filled (allow multiple selections)
                                const isMultiSelect = msg.fieldId === 'benefitsValue';

                                if (!isMultiSelect) {
                                  setMessages(prev => prev.map((m, i) =>
                                    i === idx ? { ...m, actionFilled: true } : m
                                  ));
                                }

                                setTimeout(() => {
                                  addMessage({
                                    role: 'ai',
                                    content: isMultiSelect
                                      ? `✅ Selected "${choice.label}". You can select more or ask me anything else!`
                                      : `✅ Selected "${choice.label}" and filled the form!`
                                  });
                                }, 300);
                              }
                            }}
                            className="text-left justify-start h-auto py-2 px-3 text-xs hover:bg-blue-50 hover:border-[#006699] hover:text-[#006699]"
                          >
                            <ArrowRight className="w-3 h-3 mr-2 shrink-0" />
                            <span className="whitespace-normal">{choice.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Auto-fill button */}
                    {msg.showAction && (msg.interactionType === 'auto-fill' || msg.interactionType === 'ask-and-fill') && (
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

                {/* Success message */}
                {msg.actionFilled && (
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-2 rounded-lg inline-block animate-in fade-in slide-in-from-top-2">
                    <Check className="w-3 h-3" /> Field filled successfully
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

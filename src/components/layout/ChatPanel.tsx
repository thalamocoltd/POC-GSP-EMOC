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
}

// Mock responses for AI Field Assistant
const FIELD_RESPONSES: Record<string, { text: string, value: any }> = {
  tpmLossTypeId: {
    text: "TPM Loss Type indicates the category of production loss based on Total Productive Maintenance standards. For this pump upgrade, it likely falls under 'Reduced Speed' or 'Equipment Failure'. I recommend 'Reduced Speed' (loss-4) as it addresses the efficiency gap.",
    value: "loss-4" 
  },
  benefit: {
    text: "Benefit describes the expected positive outcomes. Based on your inputs, I suggest focusing on: Increased production capacity, Reduced downtime, and Cost savings.",
    value: "Reduction in equipment downtime by 25% resulting in increased production capacity of 500 tons/month, estimated cost savings of 2.5M THB annually."
  },
  benefitValue: {
    text: "Benefit Value represents the total financial gain expected. Calculating based on 2.5M THB annual savings.",
    value: 2500000
  },
  investment: {
    text: "Investment includes all costs associated with implementation (equipment, labor, testing). Based on similar projects, I estimate ~1.2M THB.",
    value: 1200000
  },
  lengthOfChange: {
    text: "For a permanent pump upgrade, the length of change should cover the expected useful life or until the next major overhaul.",
    value: { years: 2, months: 6, days: 0 }
  },
  priorityId: {
    text: "Given the impact on production capacity, this should be treated as a High priority change.",
    value: "priority-2"
  },
  riskBeforeChange: {
    text: "I can help assess the risk. Based on 'Pump Upgrade' involving mechanical work and potential downtime, the Initial Risk is likely Medium (Impact 3, Likelihood 3).",
    value: { level: "Medium", score: 9, likelihood: 3, impact: 3, likelihoodLabel: "Possible", impactLabel: "Medium" }
  },
  riskAfterChange: {
    text: "After implementing the mitigation controls and the new pump, the Residual Risk should be lower.",
    value: { level: "Low", score: 4, likelihood: 2, impact: 2, likelihoodLabel: "Unlikely", impactLabel: "Low" }
  }
};

export const ChatPanel = ({ isOpen, onClose, onCommand }: ChatPanelProps) => {
  const { activeFieldId, lastQuestion, triggerAutoFill } = useAI();
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle auto-question from AI Context
  useEffect(() => {
    if (isOpen && lastQuestion && activeFieldId) {
      // Check if we already sent this question to avoid loops (simple check based on last message)
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "user" && lastMsg.content === lastQuestion) return;
      
      // Send user question
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: lastQuestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      // Generate AI Response
      setTimeout(() => {
        setIsTyping(false);
        const responseData = FIELD_RESPONSES[activeFieldId];
        
        if (responseData) {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: responseData.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: {
              label: "Let AI Fill This For Me",
              onClick: () => {
                triggerAutoFill(responseData.value);
                // Add success message
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
  }, [isOpen, lastQuestion, activeFieldId]); // Removed messages from dependency to avoid loop

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
          {/* Backdrop - No blur, just for click-to-close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          
          {/* Chat Panel */}
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
            className="fixed right-6 top-20 h-[calc(100vh-112px)] w-full sm:w-[400px] bg-white z-50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl flex flex-col border border-[#E5E7EB]"
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
                      : "bg-white text-[#1C1C1E] border border-gray-100 rounded-tl-sm"
                  )}
                >
                  {msg.content}
                  {msg.action && (
                    <button 
                      onClick={msg.action.onClick}
                      className="mt-3 flex items-center gap-1 text-[#006699] text-sm font-bold hover:underline bg-[#F0F7FA] px-3 py-2 rounded-lg w-full justify-center transition-colors hover:bg-[#E1F0F5]"
                    >
                      {msg.action.label} <ArrowRight className="w-4 h-4" />
                    </button>
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

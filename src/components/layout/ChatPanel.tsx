// ChatPanel with Claude API Integration
// This component handles real-time AI conversations with field-specific expert guidance

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  ArrowUp,
  ArrowRight,
  Check,
  Clock,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useAI } from "../../context/AIContext";
import useClaudeConversation from "../../hooks/useClaudeConversation";
import { ConversationMessage } from "../../types/claude";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
}

export const ChatPanel = ({ isOpen, onClose, onCommand }: ChatPanelProps) => {
  const {
    activeFieldId,
    lastQuestion,
    triggerAutoFill,
    validationErrorsToReport,
    shouldAutoSubmitQuestion,
    setShouldAutoSubmitQuestion,
    formContext,
  } = useAI();

  // Claude conversation hook
  const claudeConversation = useClaudeConversation(formContext);
  const {
    messages: claudeMessages,
    isLoading: claudeLoading,
    error: claudeError,
    startConversation,
    sendMessage,
    handleToolCall,
  } = claudeConversation;

  const [inputValue, setInputValue] = React.useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(isOpen);
  const prevActiveFieldRef = useRef(activeFieldId);
  const [isPendingAutoSubmit, setIsPendingAutoSubmit] = React.useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll when panel opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setTimeout(() => {
        scrollToBottom("auto");
      }, 0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom("smooth");
  }, [claudeMessages, claudeLoading]);

  // Reset conversation when switching to a different field
  useEffect(() => {
    if (activeFieldId && prevActiveFieldRef.current !== activeFieldId) {
      // Field changed, reset conversation
      claudeConversation.resetConversation?.();
      setInputValue("");
      setIsPendingAutoSubmit(false);
    }
    prevActiveFieldRef.current = activeFieldId;
  }, [activeFieldId, claudeConversation]);

  // Clean up when panel closes
  useEffect(() => {
    if (!isOpen) {
      const cleanupTimer = setTimeout(() => {
        setShouldAutoSubmitQuestion(false);
        setIsPendingAutoSubmit(false);
      }, 100);
      return () => clearTimeout(cleanupTimer);
    }
  }, [isOpen, setShouldAutoSubmitQuestion]);

  // Handle auto-submit from "Ask AI" button
  useEffect(() => {
    if (
      isOpen &&
      lastQuestion &&
      activeFieldId &&
      shouldAutoSubmitQuestion &&
      !isPendingAutoSubmit &&
      claudeMessages.length === 0
    ) {
      setIsPendingAutoSubmit(true);
      startConversation(activeFieldId, lastQuestion);
      setShouldAutoSubmitQuestion(false);
    }
  }, [isOpen, lastQuestion, activeFieldId, shouldAutoSubmitQuestion, isPendingAutoSubmit, claudeMessages.length, startConversation, setShouldAutoSubmitQuestion]);

  /**
   * Render a single message with appropriate styling and content
   */
  const renderMessage = (message: ConversationMessage) => {
    const isUser = message.role === "user";

    return (
      <div
        key={message.id}
        className={cn(
          "flex flex-col max-w-[85%] mb-4",
          isUser ? "ml-auto items-end" : "mr-auto items-start"
        )}
      >
        <div
          className={cn(
            "p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm",
            isUser
              ? "bg-[#1d3654] text-white rounded-tr-sm"
              : "bg-white text-[#1C1C1E] border border-gray-100 rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="mt-1.5 text-[11px] text-gray-400 font-medium px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    );
  };

  /**
   * Render Claude messages with tool call handling
   */
  const renderClaudeMessages = () => {
    return claudeMessages.map((message) => {
      // Handle tool calls from Claude
      if (message.toolCalls && message.toolCalls.length > 0) {
        return (
          <div key={message.id} className="flex flex-col gap-3 max-w-[85%] mb-4">
            {/* Show text response first */}
            {message.content && (
              <div className="p-4 rounded-2xl bg-white text-[#1C1C1E] border border-gray-100 rounded-tl-sm shadow-sm">
                <p className="whitespace-pre-wrap text-[14px]">
                  {message.content}
                </p>
              </div>
            )}

            {/* Render tool calls */}
            {message.toolCalls.map((toolCall, idx) => {
              const handled = handleToolCall(toolCall);
              if (!handled) return null;

              switch (handled.type) {
                // Render fill_field confirmation
                case "fill_field":
                  return (
                    <div
                      key={`tool-${idx}`}
                      className="p-4 rounded-2xl bg-green-50 border-2 border-green-300 rounded-tl-sm shadow-md max-w-full space-y-4 flex flex-col"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="font-bold text-green-900">
                            Ready to Fill
                          </span>
                        </div>
                        <p className="text-sm text-green-800 break-words">
                          {handled.reasoning}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Filling field with value:", handled.value);
                          triggerAutoFill(handled.value);
                          // Close chat after filling
                          setTimeout(() => onClose(), 300);
                        }}
                        className="w-full px-4 py-3 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors shadow-md cursor-pointer border border-green-700"
                      >
                        ✓ Fill Field with Value
                      </button>
                    </div>
                  );

                // Render choice buttons
                case "ask_followup":
                  return (
                    <div
                      key={`tool-${idx}`}
                      className="p-4 rounded-2xl bg-white border border-gray-200 rounded-tl-sm shadow-sm max-w-full space-y-2"
                    >
                      <p className="text-sm font-medium text-[#1C1C1E] mb-3">
                        {handled.question}
                      </p>
                      {handled.choices && (
                        <div className="flex flex-col gap-2">
                          {handled.choices.map((choice, choiceIdx) => (
                            <button
                              key={choiceIdx}
                              onClick={() => {
                                sendMessage(choice.label);
                              }}
                              className="text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-[#006699] hover:text-[#006699] transition-colors text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <ArrowRight className="w-3 h-3 shrink-0" />
                                <span className="whitespace-normal">
                                  {choice.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );

                // Render calculation breakdown
                case "show_calculation":
                  return (
                    <div
                      key={`tool-${idx}`}
                      className="p-4 rounded-2xl bg-blue-50 border border-blue-200 rounded-tl-sm shadow-sm max-w-full"
                    >
                      <h4 className="font-semibold text-blue-900 mb-3">
                        {handled.title}
                      </h4>

                      {/* Steps */}
                      <div className="space-y-2 mb-4">
                        {handled.steps.map((step, stepIdx) => (
                          <div
                            key={stepIdx}
                            className="p-2 bg-white rounded border border-blue-100"
                          >
                            <p className="text-xs text-gray-700 font-medium">
                              {step.description}
                            </p>
                            {step.formula && (
                              <p className="text-xs text-gray-600 font-mono mt-1">
                                {step.formula}
                              </p>
                            )}
                            <p className="text-sm font-semibold text-blue-900 mt-1">
                              = {step.result.toLocaleString()} {step.unit}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Final result */}
                      <div className="p-3 bg-white rounded border-2 border-blue-400 mb-3">
                        <p className="text-xs text-gray-600">Final Result</p>
                        <p className="text-lg font-bold text-blue-900">
                          {handled.finalResult.toLocaleString()} {handled.finalUnit}
                        </p>
                        {handled.confidenceLevel && (
                          <p className="text-xs text-gray-600 mt-1 capitalize">
                            Confidence: {handled.confidenceLevel}
                          </p>
                        )}
                      </div>

                      {/* Assumptions */}
                      {handled.assumptions && handled.assumptions.length > 0 && (
                        <div className="text-xs text-gray-700">
                          <p className="font-semibold mb-1">Assumptions:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            {handled.assumptions.map((assumption, assIdx) => (
                              <li key={assIdx} className="text-gray-600">
                                {assumption}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );

                // Render confirmation request
                case "request_confirmation":
                  return (
                    <div
                      key={`tool-${idx}`}
                      className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 rounded-tl-sm shadow-md max-w-full space-y-4 flex flex-col"
                    >
                      <div>
                        <p className="text-xs font-semibold text-amber-700 mb-2">
                          ✓ Ready to Fill
                        </p>
                        <p className="text-sm text-amber-900 break-words">
                          {handled.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          console.log("Confirming and filling with value:", handled.value);
                          triggerAutoFill(handled.value);
                          setTimeout(() => onClose(), 300);
                        }}
                        className="w-full px-4 py-3 bg-amber-600 text-white text-sm font-bold rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-md cursor-pointer border border-amber-700 background-green-600" style={{ backgroundColor: '#008f2bff' }}
                      >
                        ✓ Confirm and Fill
                      </button>

                      {handled.alternativeOptions &&
                        handled.alternativeOptions.length > 0 && (
                          <div className="border-t border-amber-200 pt-3">
                            <p className="text-xs font-semibold text-amber-800 mb-2">Other options:</p>
                            <div className="space-y-1">
                              {handled.alternativeOptions.map((opt, optIdx) => (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => {
                                    console.log("Filling alternative option:", opt.value);
                                    triggerAutoFill(opt.value);
                                    setTimeout(() => onClose(), 300);
                                  }}
                                  className="block w-full text-left px-3 py-2 text-xs text-amber-800 hover:bg-amber-100 rounded transition-colors cursor-pointer"
                                >
                                  {opt.label}: {opt.reason}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  );

                case "provide_guidance":
                  return (
                    <div
                      key={`tool-${idx}`}
                      className="p-4 rounded-2xl bg-purple-50 border border-purple-200 rounded-tl-sm shadow-sm max-w-full"
                    >
                      <p className="text-sm text-purple-900 whitespace-pre-wrap">
                        {handled.guidance}
                      </p>
                      {handled.examples && handled.examples.length > 0 && (
                        <div className="mt-3 text-xs text-purple-800 space-y-1">
                          <p className="font-semibold">Examples:</p>
                          {handled.examples.map((ex, exIdx) => (
                            <p key={exIdx}>• {ex}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        );
      }

      // Regular text message from Claude
      return renderMessage(message);
    });
  };

  /**
   * Handle user message submission
   */
  const handleSend = async () => {
    if (!inputValue.trim() || claudeLoading) return;

    // Support both field-specific and general conversations
    if (activeFieldId && claudeConversation.fieldId) {
      // Field-specific conversation
      await sendMessage(inputValue);
    } else if (!activeFieldId && claudeConversation.fieldId === null) {
      // General conversation (no field specified)
      // Initialize conversation if not already started
      if (claudeMessages.length === 1) {
        // Only have the initial greeting, start new conversation
        await sendMessage(inputValue, 'general');
      } else {
        // Continue existing conversation
        await sendMessage(inputValue, 'general');
      }
    }

    setInputValue("");
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
          {/* Chat Panel */}
          <motion.aside
            initial={{ x: 400, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 400, opacity: 0, scale: 0.95 }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
              opacity: { duration: 0.2 },
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
                  <span className="text-[15px] font-semibold text-[#1C1C1E]">
                    AI Expert Assistant
                  </span>
                  <span className="text-[11px] text-[#006699] font-medium">
                    {claudeLoading ? "Thinking..." : "Online • System Intelligence"}
                  </span>
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
            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#FAFAFA]">
              {/* Display Claude messages */}
              {renderClaudeMessages()}

              {/* Error state */}
              {claudeError && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 max-w-[85%]">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-xs text-red-800 mt-1">{claudeError}</p>
                      <button
                        onClick={() => {
                          if (activeFieldId && lastQuestion) {
                            startConversation(activeFieldId, lastQuestion);
                          }
                        }}
                        className="text-xs text-red-700 underline mt-2 hover:no-underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {claudeLoading && (
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
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.15,
                        }}
                        className="w-2 h-2 bg-[#006699] rounded-full"
                      />
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.6,
                          delay: 0.3,
                        }}
                        className="w-2 h-2 bg-[#006699] rounded-full"
                      />
                    </div>
                  </div>
                  <span className="mt-1.5 text-[11px] text-gray-400 font-medium px-1">
                    Claude is thinking...
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
                  placeholder={
                    activeFieldId
                      ? "Ask a follow-up question or type your answer..."
                      : "Ask anything..."
                  }
                  disabled={claudeLoading}
                  className="w-full min-h-[56px] max-h-[120px] p-4 pr-12 bg-[#F7F9FC] border border-transparent focus:border-[#006699] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006699]/10 resize-none text-sm transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || claudeLoading}
                  className="absolute bottom-3 right-3 w-8 h-8 bg-[#1d3654] rounded-lg flex items-center justify-center text-white hover:bg-[#006699] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex justify-center">
                <p className="text-[10px] text-gray-400">
                  AI-generated responses should be verified by engineering or
                  operations staff.
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatPanel;

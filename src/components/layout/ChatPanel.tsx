// ChatPanel with Claude API Integration
// This component handles real-time AI conversations with field-specific expert guidance

import React, { useEffect, useRef, useState } from "react";
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
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useAI } from "../../context/AIContext";
import useClaudeConversation from "../../hooks/useClaudeConversation";
import { ConversationMessage } from "../../types/claude";
import { InitiationFormData } from "../../types/emoc";
import { getBulkExtractPrompt } from "../../lib/bulkExtractPrompt";
import { CLAUDE_TOOLS } from "../../lib/claudeFunctionTools";
import claudeApiService from "../../services/claudeApiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "../ui/alert-dialog";
import { ProcessingOverlay } from "../ui/ProcessingOverlay";

/**
 * System prompt for "Ask" mode in Estimated Benefit
 * Prepended to user's question when they select "Ask" button
 */
const ESTIMATED_BENEFIT_SYSTEM_PROMPT = `You are an MoC (Management of Change) Financial Benefit Analyst for industrial plant operations in Thailand. Your task is to estimate the financial benefit value in Thai Baht (THB) based on the change request details provided.

**Input Analysis:**
Analyze the MoC request considering these benefit categories:

1. **Production Efficiency Gains**
   - Increased throughput/capacity (%)
   - Reduced cycle time
   - Higher yield rates
   - Additional production hours per year

2. **Cost Reduction**
   - Energy savings (kWh/year × THB rate)
   - Raw material reduction
   - Labor cost savings
   - Maintenance cost reduction
   - Waste/scrap reduction

3. **Quality Improvements**
   - Reduced defect rates × cost per defect
   - Lower rework costs
   - Reduced customer complaints/returns

4. **Safety & Compliance**
   - Avoided incident costs
   - Reduced insurance premiums
   - Avoided regulatory fines
   - Reduced downtime from safety issues

5. **Downtime Prevention**
   - Avoided production losses (hours × production value/hour)
   - Extended equipment lifespan
   - Reduced emergency repairs

**Calculation Methodology:**
- Annualize all benefits (calculate for 12 months)
- Use conservative estimates when ranges are provided
- Apply depreciation for equipment changes (typically 5-7 years payback)
- Exclude one-time implementation costs (focus on recurring benefits)
- State all assumptions clearly

**Output Requirements:**
Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "Summary": "Clear explanation of calculation methodology, key assumptions, benefit categories included, and formula used. Include specific numbers referenced in the calculation.",
  "BenefitValue": 0
}
\`\`\`

**Examples:**

Input: "Upgrade pump motor from 100HP to 150HP to increase flow rate by 20%, reducing batch time from 8 hours to 6.5 hours. Plant runs 300 batches/year. Each batch produces 1000 units at THB 50 margin per unit."
Output:
\`\`\`json
{
  "Summary": "Time savings: 1.5 hours × 300 batches = 450 hours saved annually. Additional capacity enables 56 extra batches per year (450÷8). Revenue gain: 56 batches × 1000 units × THB 50 margin = THB 2,800,000/year",
  "BenefitValue": 2800000
}
\`\`\`

Input: "Replace old cooling system to reduce energy consumption from 500kW to 350kW. System runs 24/7. Electricity cost THB 4/kWh."
Output:
\`\`\`json
{
  "Summary": "Energy savings: (500-350)kW × 8760 hours/year × THB 4/kWh = 150kW × 8760 × 4 = THB 5,256,000/year in reduced electricity costs",
  "BenefitValue": 5256000
}
\`\`\`

Now analyze the following MoC request and provide the benefit estimation:`;

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
    triggerBulkFill,
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

  // Quick Fill Mode State - Chat Style
  const [isQuickFillMode, setIsQuickFillMode] = useState(false);
  const [quickFillDescription, setQuickFillDescription] = useState('');
  const [quickFillMessages, setQuickFillMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'error';
    content: string;
    data?: any;
    timestamp: Date;
  }>>([]);
  const [isLoadingQuickFill, setIsLoadingQuickFill] = useState(false);
  const [isFillingForm, setIsFillingForm] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');
  const [lastExtractedData, setLastExtractedData] = useState<any>(null);

  // Estimated Benefit Mode State
  const [benefitConnectionId, setBenefitConnectionId] = useState<string | null>(null);
  const [benefitMessages, setBenefitMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'error';
    content: string;
    data?: { Summary: string; BenefitValue: number };
    timestamp: Date;
  }>>([]);
  const [isLoadingBenefit, setIsLoadingBenefit] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  /**
   * Format extracted data into friendly Thai summary paragraphs
   */
  const formatQuickFillSummary = (data: any): string => {
    const parts: string[] = [];

    // General Information
    const generalInfo = [];
    if (data.mocTitle) generalInfo.push(`📋 **Title:** ${data.mocTitle}`);
    if (data.priorityId) generalInfo.push(`⚠️ **Priority:** ${data.priorityId}`);
    if (data.typeOfChange) generalInfo.push(`🔧 **Type:** ${data.typeOfChange}`);
    if (data.lengthOfChange) generalInfo.push(`⏱️ **Duration:** ${data.lengthOfChange}`);
    if (generalInfo.length > 0) {
      parts.push('**General Information**\n' + generalInfo.join('\n'));
    }

    // Timeline
    const timeline = [];
    if (data.estimatedDurationStart) timeline.push(`📅 **Start:** ${data.estimatedDurationStart}`);
    if (data.estimatedDurationEnd) timeline.push(`📅 **End:** ${data.estimatedDurationEnd}`);
    if (timeline.length > 0) {
      parts.push('**Timeline**\n' + timeline.join('\n'));
    }

    // Financial
    const financial = [];
    if (data.estimatedCost !== undefined) financial.push(`💰 **Estimated Cost:** ${data.estimatedCost.toLocaleString()} THB`);
    if (data.estimatedBenefit !== undefined) financial.push(`💵 **Estimated Benefit:** ${data.estimatedBenefit.toLocaleString()} THB`);
    if (data.lossEliminateValue !== undefined) financial.push(`📉 **Loss Reduction:** ${data.lossEliminateValue.toLocaleString()} THB`);
    if (financial.length > 0) {
      parts.push('**Financial Information**\n' + financial.join('\n'));
    }

    // Benefits and Details
    const details = [];
    if (data.benefits && Array.isArray(data.benefits)) {
      details.push(`✅ **Benefits:** ${data.benefits.join(', ')}`);
    }
    if (data.expectedBenefits) details.push(`🎯 **Expected Outcomes:** ${data.expectedBenefits}`);
    if (data.detailOfChange) details.push(`📝 **Details:** ${data.detailOfChange}`);
    if (data.reasonForChange) details.push(`🔍 **Reason:** ${data.reasonForChange}`);
    if (details.length > 0) {
      parts.push('**Details & Benefits**\n' + details.join('\n'));
    }

    return parts.join('\n\n');
  };

  /**
   * Handle Quick Fill extraction with new API
   */
  const handleQuickFill = async () => {
    if (!quickFillDescription.trim() || quickFillDescription.length < 50) return;

    try {
      setIsLoadingQuickFill(true);
      setLastPrompt(quickFillDescription);

      // Add user message to chat
      const userMessage = {
        role: 'user' as const,
        content: quickFillDescription,
        timestamp: new Date(),
      };
      setQuickFillMessages(prev => [...prev, userMessage]);

      // Generate connection ID and call new API
      const connectionId = claudeApiService.generateConnectionId();
      const response = await claudeApiService.sendQuickFillRequest(
        quickFillDescription,
        connectionId
      );

      // Store extracted data
      setLastExtractedData(response.result);

      // Format friendly summary
      const summary = formatQuickFillSummary(response.result);

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant' as const,
        content: `I've analyzed your information! Here's what I found:\n\n${summary}`,
        data: response.result,
        timestamp: new Date(),
      };
      setQuickFillMessages(prev => [...prev, aiMessage]);

      // Clear input
      setQuickFillDescription('');

    } catch (error) {
      console.error('Quick Fill error:', error);

      // Add error message to chat
      const errorMessage = {
        role: 'error' as const,
        content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unable to process. Please try again.'}`,
        timestamp: new Date(),
      };
      setQuickFillMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingQuickFill(false);
    }
  };

  /**
   * Handle auto-fill form with extracted data (with animated progress)
   */
  const handleConfirmQuickFill = () => {
    if (!lastExtractedData) return;

    console.log('Starting auto-fill with data:', lastExtractedData);

    // Show full-screen processing overlay FIRST
    setIsFillingForm(true);

    // Small delay to let overlay show before triggering form fill
    setTimeout(() => {
      // Pass the entire object to triggerBulkFill
      // The form will handle iterating through fields
      console.log('Triggering bulk fill...');
      triggerBulkFill(lastExtractedData);
    }, 100);
  };

  /**
   * Handle processing overlay complete - close panel
   */
  const handleProcessingComplete = () => {
    // Reset state and close panel
    setIsFillingForm(false);
    setIsQuickFillMode(false);
    onClose();
  };

  /**
   * Handle editing the prompt (ปรับข้อมูล)
   */
  const handleEditPrompt = () => {
    setQuickFillDescription(lastPrompt);
    // Keep chat messages visible for context
  };

  /**
   * Handle retry with same prompt
   */
  const handleRetryQuickFill = () => {
    setQuickFillDescription(lastPrompt);
    handleQuickFill();
  };

  /**
   * Format conversation history for Estimated Benefit API
   */
  const formatBenefitConversation = (messages: typeof benefitMessages, newMessage: string): string => {
    const history = messages
      .map((msg: any) => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant') {
          return `AI: ${msg.content}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');

    return history ? `${history}\n\nUser: ${newMessage}` : `User: ${newMessage}`;
  };

  /**
   * Handle Estimated Benefit message submission
   */
  const handleBenefitSend = async () => {
    if (!inputValue.trim() || isLoadingBenefit || !benefitConnectionId) return;

    try {
      setIsLoadingBenefit(true);

      // Add user message to chat
      const userMessage = {
        role: 'user' as const,
        content: inputValue,
        timestamp: new Date(),
      };
      setBenefitMessages((prev: any) => [...prev, userMessage]);

      // Format conversation history (always use Prompt mode - send as-is)
      const conversationHistory = formatBenefitConversation(benefitMessages, inputValue);

      // Call new API (always send directly without system prompt)
      const response = await claudeApiService.sendEstimatedBenefitRequest(
        conversationHistory,
        benefitConnectionId
      );

      // Parse response
      const { Summary, BenefitValue } = response.result;

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant' as const,
        content: Summary,
        data: { Summary, BenefitValue },
        timestamp: new Date(),
      };
      setBenefitMessages((prev: any) => [...prev, aiMessage]);

      // Clear input
      setInputValue('');

    } catch (error) {
      console.error('Estimated Benefit API error:', error);

      // Add error message to chat
      const errorMessage = {
        role: 'error' as const,
        content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unable to process. Please try again.'}`,
        timestamp: new Date(),
      };
      setBenefitMessages((prev: any) => [...prev, errorMessage]);
    } finally {
      setIsLoadingBenefit(false);
    }
  };

  /**
   * Retry last message for Estimated Benefit
   */
  const handleBenefitRetry = () => {
    const lastUserMessage = [...benefitMessages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setInputValue(lastUserMessage.content);
    }
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

  // Initialize Estimated Benefit ConnectionId
  useEffect(() => {
    if (activeFieldId === 'estimatedBenefit' && !benefitConnectionId) {
      // Generate connection ID once when entering estimatedBenefit field
      const connectionId = claudeApiService.generateConnectionId();
      setBenefitConnectionId(connectionId);
    } else if (activeFieldId !== 'estimatedBenefit') {
      // Reset state when leaving estimatedBenefit field
      setBenefitConnectionId(null);
      setBenefitMessages([]);
    }
  }, [activeFieldId, benefitConnectionId]);

  /**
   * Render Estimated Benefit messages
   */
  const renderBenefitMessages = () => {
    return benefitMessages.map((msg: any, idx: number) => {
      const isUser = msg.role === 'user';
      const isError = msg.role === 'error';

      return (
        <div
          key={idx}
          className={cn(
            "flex flex-col max-w-[85%] mb-4",
            isUser ? "ml-auto items-end" : "mr-auto items-start"
          )}
        >
          <div
            className={cn(
              "p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap",
              isUser
                ? "bg-[#1d3654] text-white rounded-tr-sm"
                : isError
                  ? "bg-red-50 text-red-900 border border-red-200 rounded-tl-sm"
                  : "bg-white text-[#1C1C1E] border border-gray-100 rounded-tl-sm"
            )}
          >
            {msg.content}
          </div>
          <span className="mt-1.5 text-[11px] text-gray-400 font-medium px-1">
            {msg.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {/* Auto-fill button for successful responses */}
          {msg.role === 'assistant' && msg.data && (
            <div className="mt-3 w-full space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  💰 Calculated Benefit Value
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {msg.data.BenefitValue.toLocaleString()} THB
                </p>
              </div>
              <Button
                onClick={() => {
                  console.log("Filling estimatedBenefit with:", msg.data.BenefitValue);
                  if (triggerAutoFill && typeof triggerAutoFill === 'function') {
                    triggerAutoFill(msg.data.BenefitValue);
                    // Give the form time to update before closing
                    setTimeout(() => {
                      console.log("Auto-fill completed, closing panel");
                      onClose();
                    }, 500);
                  } else {
                    console.error("triggerAutoFill is not available");
                  }
                }}
                className="w-full bg-[#006699] hover:bg-[#005080] text-white font-medium"
                size="sm"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Fill Field with Value
              </Button>
            </div>
          )}

          {/* Retry button for errors */}
          {isError && (
            <Button
              onClick={() => handleBenefitRetry()}
              variant="outline"
              className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
              size="sm"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      );
    });
  };

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
            <div className="px-6 border-b border-[#E5E7EB] flex flex-col bg-white rounded-t-xl sticky top-0 z-10">
              <div className="h-[72px] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1d3654] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-semibold text-[#1C1C1E]">
                      {isQuickFillMode ? "Quick Fill" : "AI Expert Assistant"}
                    </span>
                    <span className="text-[11px] text-[#006699] font-medium">
                      {isQuickFillMode
                        ? "Extract structured data from description"
                        : claudeLoading ? "Thinking..." : "Online • System Intelligence"}
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

              {/* Mode Toggle */}
              <div className="pb-4 flex items-center gap-2 pt-3">
                <button
                  onClick={() => setIsQuickFillMode(false)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all",
                    !isQuickFillMode
                      ? "bg-[#006699] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setIsQuickFillMode(true)}
                  className={cn(
                    "flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all",
                    isQuickFillMode
                      ? "bg-[#006699] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  ⚡ Quick Fill
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#FAFAFA]">
              {activeFieldId === 'estimatedBenefit' ? (
                // ESTIMATED BENEFIT MODE
                <>
                  {renderBenefitMessages()}

                  {/* Loading State */}
                  {isLoadingBenefit && (
                    <div className="flex flex-col max-w-[85%] mr-auto items-start mb-4">
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
                        Calculating...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              ) : isQuickFillMode ? (
                // Quick Fill Mode - Chat Style UI
                <>
                  {/* Chat Messages */}
                  {quickFillMessages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    const isError = msg.role === 'error';

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "flex flex-col max-w-[85%] mb-4",
                          isUser ? "ml-auto items-end" : "mr-auto items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap",
                            isUser
                              ? "bg-[#1d3654] text-white rounded-tr-sm"
                              : isError
                                ? "bg-red-50 text-red-900 border border-red-200 rounded-tl-sm"
                                : "bg-white text-[#1C1C1E] border border-gray-100 rounded-tl-sm"
                          )}
                        >
                          {msg.content}
                        </div>
                        <span className="mt-1.5 text-[11px] text-gray-400 font-medium px-1">
                          {msg.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {/* Action Buttons for AI responses with data */}
                        {msg.role === 'assistant' && msg.data && (
                          <div className="mt-3 w-full">
                            <Button
                              onClick={handleConfirmQuickFill}
                              disabled={isFillingForm}
                              className="w-full bg-[#006699] hover:bg-[#005080] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              size="sm"
                            >
                              {isFillingForm ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Filling form...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Fill Form Now
                                </>
                              )}
                            </Button>
                          </div>
                        )}

                        {/* Retry Button for errors */}
                        {isError && (
                          <Button
                            onClick={handleRetryQuickFill}
                            variant="outline"
                            className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
                            size="sm"
                          >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Try Again
                          </Button>
                        )}
                      </div>
                    );
                  })}

                  {/* Loading State - Typing Indicator */}
                  {isLoadingQuickFill && (
                    <div className="flex flex-col max-w-[85%] mr-auto items-start mb-4">
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
                        Thinking...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              ) : (
                // Chat Mode - Display Claude messages
                <>
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
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-[#E5E7EB] bg-white rounded-b-xl space-y-3">
              {activeFieldId === 'estimatedBenefit' ? (
                // ESTIMATED BENEFIT MODE
                <>
                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      value={inputValue}
                      onChange={(e: any) => setInputValue(e.target.value)}
                      onKeyDown={(e: any) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleBenefitSend();
                        }
                      }}
                      placeholder="Provide detailed information for calculation... (e.g., Upgrade pump motor from 100HP to 150HP...)"
                      disabled={isLoadingBenefit}
                      className="w-full min-h-[56px] max-h-[120px] p-4 pr-12 bg-[#F7F9FC] border border-transparent focus:border-[#006699] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006699]/10 resize-none text-sm transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={handleBenefitSend}
                      disabled={!inputValue.trim() || isLoadingBenefit}
                      className="absolute bottom-3 right-3 w-8 h-8 bg-[#1d3654] rounded-lg flex items-center justify-center text-white hover:bg-[#006699] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isLoadingBenefit ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <p className="text-[10px] text-gray-400">
                      Provide calculation details and press Enter to calculate benefit
                    </p>
                  </div>
                </>
              ) : isQuickFillMode ? (
                // Quick Fill Input Area
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">
                      Describe your change:
                    </Label>
                    <div className="relative">
                      <textarea
                        value={quickFillDescription}
                        onChange={(e) => setQuickFillDescription(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            handleQuickFill();
                          }
                        }}
                        placeholder="Enter change details, e.g., 'Upgrade Gas Separation Membranes to improve efficiency...'"
                        disabled={isLoadingQuickFill}
                        className="w-full min-h-[80px] max-h-[160px] p-4 pr-12 bg-[#F7F9FC] border border-gray-300 focus:border-[#006699] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006699]/10 resize-none text-sm transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={handleQuickFill}
                        disabled={!quickFillDescription.trim() || quickFillDescription.length < 50 || isLoadingQuickFill}
                        className="absolute bottom-3 right-3 w-8 h-8 bg-[#1d3654] rounded-lg flex items-center justify-center text-white hover:bg-[#006699] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isLoadingQuickFill ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Character count */}
                  {quickFillDescription.length > 0 && quickFillDescription.length < 50 && (
                    <p className="text-xs text-amber-600">
                      Minimum 50 characters required ({quickFillDescription.length}/50)
                    </p>
                  )}
                  <div className="flex justify-center">
                    <p className="text-[10px] text-gray-400">
                      Press Cmd/Ctrl + Enter to send • AI responses should be verified
                    </p>
                  </div>
                </>
              ) : (
                // Chat Mode Input Area
                <>
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
                  <div className="flex justify-center">
                    <p className="text-[10px] text-gray-400">
                      AI-generated responses should be verified by engineering or
                      operations staff.
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.aside>

        </>
      )}

      {/* Full-Screen Processing Overlay for Auto-Fill */}
      <ProcessingOverlay
        isVisible={isFillingForm}
        onComplete={handleProcessingComplete}
        messages={[
          "Filling form fields...",
          "Validating data...",
          "Formatting information...",
          "Almost done...",
          "Complete!"
        ]}
      />
    </AnimatePresence>
  );
};

export default ChatPanel;

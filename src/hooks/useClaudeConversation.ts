// Hook for managing Claude API conversations with field context

import { useState, useCallback, useRef } from 'react';
import { claudeApiService } from '../services/claudeApiService';
import { getFieldPrompt } from '../lib/fieldPrompts';
import { CLAUDE_TOOLS } from '../lib/claudeFunctionTools';
import {
  ConversationMessage,
  ConversationState,
  UseClaudeConversationReturn,
  ClaudeMessage,
  ClaudeToolCallResult,
} from '../types/claude';
import { InitiationFormData } from '../types/emoc';

/**
 * Hook for managing multi-turn conversations with Claude API
 * Handles conversation state, message history, and tool calls
 */
export function useClaudeConversation(
  formContext: Partial<InitiationFormData>
): UseClaudeConversationReturn {
  const [state, setState] = useState<ConversationState>({
    fieldId: null,
    messages: [],
    isLoading: false,
    error: null,
    intermediateData: {},
  });

  // Keep conversation history ref for API calls
  const conversationHistoryRef = useRef<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);

  // Track if we're in the middle of starting a conversation
  const startingConversationRef = useRef(false);

  /**
   * Start a new conversation for a specific field
   */
  const startConversation = useCallback(
    (fieldId: string, initialQuestion: string) => {
      if (startingConversationRef.current) return;

      console.log('Starting conversation for field:', fieldId, 'Question:', initialQuestion);
      startingConversationRef.current = true;

      setState({
        fieldId,
        messages: [],
        isLoading: true,
        error: null,
        intermediateData: {},
      });

      conversationHistoryRef.current = [];

      // Immediately send the initial question
      setTimeout(() => {
        console.log('Sending initial question to Claude...');
        sendMessage(initialQuestion, fieldId);
        startingConversationRef.current = false;
      }, 0);
    },
    []
  );

  /**
   * Send a message to Claude and handle response
   */
  const sendMessage = useCallback(
    async (
      userMessage: string,
      fieldId?: string
    ): Promise<void> => {
      const currentFieldId = fieldId || state.fieldId;
      if (!currentFieldId) {
        console.error('No field ID specified for conversation');
        return;
      }

      // Validate API is ready
      if (!claudeApiService.isReady()) {
        setState((prev) => ({
          ...prev,
          error: 'Claude API is not configured. Please check your .env.local file.',
          isLoading: false,
        }));
        return;
      }

      // Add user message to history
      const newUserMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };

      conversationHistoryRef.current.push({
        role: 'user',
        content: userMessage,
      });

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, newUserMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Get field-specific system prompt
        const systemPrompt = getFieldPrompt(currentFieldId, formContext);

        // Call Claude API
        const response = await claudeApiService.sendMessage({
          messages: conversationHistoryRef.current,
          systemPrompt,
          tools: CLAUDE_TOOLS,
          maxTokens: 800, // Reduced from 2048 - Haiku is efficient
        });

        // Add assistant message to history (only if there's text content)
        // API doesn't allow empty messages except as final assistant message
        if (response.content.trim()) {
          conversationHistoryRef.current.push({
            role: 'assistant',
            content: response.content,
          });
        }

        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.content || '(Processing your request...)',
          timestamp: new Date(),
          toolCalls: response.toolCalls,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      } catch (error) {
        console.error('Claude API error:', error);

        // Handle ClaudeError objects (from claudeApiService)
        let errorMessage = 'An error occurred while processing your request';
        if (typeof error === 'object' && error !== null && 'userMessage' in error) {
          errorMessage = (error as any).userMessage;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [state.fieldId, formContext]
  );

  /**
   * Handle tool calls from Claude responses
   * Determines action needed based on tool type
   */
  const handleToolCall = useCallback((toolCall: ClaudeToolCallResult) => {
    const { name, input } = toolCall;

    switch (name) {
      case 'fill_field': {
        // Return structured data for auto-filling
        return {
          type: 'fill_field' as const,
          fieldId: input.fieldId,
          value: input.value,
          confidence: input.confidence,
          reasoning: input.reasoning,
        };
      }

      case 'ask_followup': {
        // Return question data for rendering choice buttons
        return {
          type: 'ask_followup' as const,
          question: input.question,
          questionType: input.questionType,
          choices: input.choices,
          context: input.context,
        };
      }

      case 'show_calculation': {
        // Return calculation breakdown for display
        return {
          type: 'show_calculation' as const,
          title: input.title,
          steps: input.steps,
          finalResult: input.finalResult,
          finalUnit: input.finalUnit,
          assumptions: input.assumptions,
          confidenceLevel: input.confidenceLevel,
        };
      }

      case 'request_confirmation': {
        // Return confirmation request data
        return {
          type: 'request_confirmation' as const,
          summary: input.summary,
          value: input.value,
          fieldId: input.fieldId,
          alternativeOptions: input.alternativeOptions,
        };
      }

      case 'provide_guidance': {
        // Return guidance for display
        return {
          type: 'provide_guidance' as const,
          fieldId: input.fieldId,
          guidance: input.guidance,
          examples: input.examples,
          suggestedFormat: input.suggestedFormat,
        };
      }

      default: {
        console.warn(`Unknown tool type: ${name}`);
        return null;
      }
    }
  }, []);

  /**
   * Store intermediate data (e.g., for multi-step wizards)
   */
  const updateIntermediateData = useCallback((key: string, value: any) => {
    setState((prev) => ({
      ...prev,
      intermediateData: {
        ...prev.intermediateData,
        [key]: value,
      },
    }));
  }, []);

  /**
   * Reset conversation state
   */
  const resetConversation = useCallback(() => {
    setState({
      fieldId: null,
      messages: [],
      isLoading: false,
      error: null,
      intermediateData: {},
    });
    conversationHistoryRef.current = [];
  }, []);

  /**
   * Add a message directly (useful for confirmations, errors, etc.)
   */
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const message: ConversationMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));

    conversationHistoryRef.current.push({
      role,
      content,
    });
  }, []);

  return {
    // State
    fieldId: state.fieldId,
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    intermediateData: state.intermediateData,

    // Methods
    startConversation,
    sendMessage,
    handleToolCall,
    updateIntermediateData,
    resetConversation,
    addMessage,
  };
}

export default useClaudeConversation;

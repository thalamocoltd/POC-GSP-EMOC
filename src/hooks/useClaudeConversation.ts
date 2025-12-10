// Hook for managing n8n webhook conversations with field context

import { useState, useCallback, useRef } from 'react';
import { claudeApiService } from '../services/claudeApiService';
import { ConversationMessage, ConversationState, UseClaudeConversationReturn } from '../types/claude';
import { InitiationFormData } from '../types/emoc';

/**
 * Hook for managing multi-turn conversations with n8n webhook
 * Handles conversation state and message history
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

  // Keep conversation history ref for state management
  const conversationHistoryRef = useRef<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);

  // Track if we're in the middle of starting a conversation
  const startingConversationRef = useRef(false);

  // Store connection ID for conversation session
  const connectionIdRef = useRef<number | null>(null);

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
      // Generate new connection ID for this conversation session
      connectionIdRef.current = claudeApiService.generateConnectionId();

      // Immediately send the initial question
      setTimeout(() => {
        console.log('Sending initial question to webhook...');
        sendMessage(initialQuestion, fieldId);
        startingConversationRef.current = false;
      }, 0);
    },
    []
  );

  /**
   * Send a message to webhook and handle response
   */
  const sendMessage = useCallback(
    async (userMessage: string, fieldId?: string): Promise<void> => {
      const currentFieldId = fieldId || state.fieldId;
      if (!currentFieldId) {
        console.error('No field ID specified for conversation');
        return;
      }

      if (!userMessage.trim()) {
        setState((prev) => ({
          ...prev,
          error: 'Message cannot be empty',
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
        // Use existing connection ID or generate new one
        const connectionId = connectionIdRef.current || claudeApiService.generateConnectionId();
        if (!connectionIdRef.current) {
          connectionIdRef.current = connectionId;
        }

        // Send message to webhook
        const aiResponse = await claudeApiService.sendChatMessage(userMessage, connectionId);

        // Add assistant message to history
        if (aiResponse.trim()) {
          conversationHistoryRef.current.push({
            role: 'assistant',
            content: aiResponse,
          });
        }

        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse || '(No response from server)',
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      } catch (error) {
        console.error('Webhook error:', error);

        let errorMessage = 'An error occurred while processing your request';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [state.fieldId]
  );

  /**
   * Handle tool calls - not used for simple webhook chat
   * Kept for backwards compatibility with existing type definitions
   */
  const handleToolCall = useCallback(() => {
    return null;
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
    connectionIdRef.current = null;
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

  /**
   * Generate a new connection ID
   * Can be used to start a new conversation thread
   */
  const generateNewConnectionId = useCallback(() => {
    connectionIdRef.current = claudeApiService.generateConnectionId();
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
    generateNewConnectionId,
  };
}

export default useClaudeConversation;

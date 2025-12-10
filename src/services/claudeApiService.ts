// Claude API Service for GSP eMoC Chat Integration

import Anthropic from '@anthropic-ai/sdk';
import {
  ClaudeApiCallParams,
  ClaudeApiResponse,
  ClaudeToolCallResult,
  ClaudeError,
  ClaudeErrorType,
} from '../types/claude';

interface MessageParam {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Service for communicating with Claude API
 * Handles API calls, streaming, error handling, and tool parsing
 */
class ClaudeApiService {
  private client: Anthropic;
  private apiKey: string;
  private isConfigured: boolean = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || '';
    this.isConfigured = this.validateApiKey();

    if (this.isConfigured) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true, // Demo only - remove in production
      });
    } else {
      console.warn(
        'Claude API not configured. Please set VITE_CLAUDE_API_KEY in .env.local'
      );
    }
  }

  /**
   * Validate API key format
   */
  validateApiKey(): boolean {
    if (!this.apiKey) {
      console.error('VITE_CLAUDE_API_KEY is not set');
      return false;
    }

    if (!this.apiKey.startsWith('sk-ant-')) {
      console.error('Invalid API key format. Should start with sk-ant-');
      return false;
    }

    return true;
  }

  /**
   * Check if Claude API is properly configured
   */
  isReady(): boolean {
    return this.isConfigured;
  }

  /**
   * Send a message to Claude and receive response with tool calls
   */
  async sendMessage(params: ClaudeApiCallParams): Promise<ClaudeApiResponse> {
    if (!this.isConfigured) {
      throw this.createError(
        'api_key_invalid',
        'Claude API is not configured',
        'Please set VITE_CLAUDE_API_KEY in environment variables.'
      );
    }

    try {
      // Wrap in timeout (30 seconds) to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => {
          reject(new Error('Claude API request timed out after 30 seconds'));
        }, 30000)
      );

      const response = await Promise.race([
        this.client.messages.create({
          model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-20250514',
          max_tokens: params.maxTokens || 4096,
          system: params.systemPrompt,
          messages: params.messages as MessageParam[],
          tools: params.tools || undefined,
          temperature: 0.7,
        }),
        timeoutPromise
      ]);

      // Parse response content
      const textContent = response.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');

      const toolCalls = response.content
        .filter((block: any) => block.type === 'tool_use')
        .map((block: any) => ({
          name: block.name,
          input: block.input,
        }));

      return {
        content: textContent,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        stopReason: response.stop_reason as 'end_turn' | 'tool_use' | 'max_tokens',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Stream a message from Claude with callback support
   */
  async streamMessage(params: {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    systemPrompt: string;
    tools?: any[];
    onChunk: (chunk: string) => void;
    onToolCall?: (toolCall: ClaudeToolCallResult) => void;
    onComplete: () => void;
    onError: (error: ClaudeError) => void;
  }): Promise<void> {
    if (!this.isConfigured) {
      params.onError(
        this.createError(
          'api_key_invalid',
          'Claude API is not configured',
          'Please set VITE_CLAUDE_API_KEY in environment variables.'
        )
      );
      return;
    }

    try {
      const stream = this.client.messages.stream({
        model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        system: params.systemPrompt,
        messages: params.messages,
        tools: params.tools || undefined,
        temperature: 0.7,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          params.onChunk(event.delta.text);
        } else if (
          event.type === 'content_block_start' &&
          event.content_block.type === 'tool_use'
        ) {
          // Tool use started
          if (params.onToolCall) {
            // Will be processed when tool_use content block delta occurs
          }
        } else if (event.type === 'message_stop') {
          params.onComplete();
        }
      }
    } catch (error) {
      const apiError = this.parseError(error);
      params.onError(apiError);
    }
  }

  /**
   * Parse tool calls from Claude response
   */
  parseToolCalls(content: any[]): ClaudeToolCallResult[] {
    return content
      .filter((block) => block.type === 'tool_use')
      .map((block) => ({
        name: block.name,
        input: block.input,
      }));
  }

  /**
   * Handle API errors and convert to user-friendly messages
   */
  private handleError(error: any): never {
    const apiError = this.parseError(error);
    throw apiError;
  }

  /**
   * Parse various error types from Claude API
   */
  private parseError(error: any): ClaudeError {
    if (error instanceof Anthropic.APIError) {
      // Handle rate limiting
      if (error.status === 429) {
        return this.createError(
          'rate_limit',
          'API rate limit exceeded',
          'Too many requests to Claude API. Please wait a moment and try again.'
        );
      }

      // Handle authentication errors
      if (error.status === 401) {
        return this.createError(
          'api_key_invalid',
          'Invalid API key',
          'Configuration error. Please contact system administrator.'
        );
      }

      // Handle server errors
      if (error.status >= 500) {
        return this.createError(
          'network_error',
          'Claude API server error',
          'The Claude API service is temporarily unavailable. Please try again later.'
        );
      }

      // Generic API error
      return this.createError(
        'invalid_response',
        `API Error (${error.status}): ${error.message}`,
        'An unexpected error occurred while communicating with Claude. You can continue filling the form manually.'
      );
    }

    if (error instanceof Anthropic.APIConnectionError) {
      return this.createError(
        'network_error',
        'Network connection error',
        'Unable to connect to Claude API. Please check your internet connection.'
      );
    }

    if (error instanceof Anthropic.RateLimitError) {
      return this.createError(
        'rate_limit',
        'Rate limit exceeded',
        'Too many requests. Please wait and try again.'
      );
    }

    if (error instanceof Anthropic.AuthenticationError) {
      return this.createError(
        'api_key_invalid',
        'Authentication failed',
        'Invalid API credentials. Please contact system administrator.'
      );
    }

    // Unknown error
    console.error('Unknown error in Claude API:', error);
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    return this.createError(
      'unknown_error',
      errorMessage,
      'An unexpected error occurred. You can continue filling the form manually.'
    );
  }

  /**
   * Create a structured error object
   */
  private createError(
    type: ClaudeErrorType,
    message: string,
    userMessage: string
  ): ClaudeError {
    const recoverable = type !== 'api_key_invalid';
    const retryable = type === 'rate_limit' || type === 'network_error';

    return {
      type,
      message,
      userMessage,
      recoverable,
      retryable,
    };
  }

  /**
   * Get error message suitable for UI display
   */
  getErrorMessage(error: ClaudeError): string {
    return error.userMessage;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: ClaudeError): boolean {
    return error.retryable;
  }
}

// Singleton instance
export const claudeApiService = new ClaudeApiService();

export default claudeApiService;

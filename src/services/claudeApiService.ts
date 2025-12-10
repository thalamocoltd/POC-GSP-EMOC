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
   * Generate a unique connection ID for Quick Fill API requests
   */
  generateConnectionId(): string {
    // Use crypto.randomUUID() if available, otherwise fallback to timestamp-based UUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback: Generate UUID v4-like string using timestamp and random numbers
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Send Quick Fill request to external API
   * @param prompt - User's description of the MOC request
   * @param connectionId - Unique connection ID for this request
   * @returns Parsed form data from API response
   */
  async sendQuickFillRequest(prompt: string, connectionId: string): Promise<any> {
    try {
      // Prepare request payload
      const payload = {
        prompt: JSON.stringify(prompt),
        connectionId: connectionId
      };

      // Call external API with 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Use absolute path to external server
      const response = await fetch('http://72.61.117.172:8090/api/Ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse the nested JSON response
      if (!data.response) {
        throw new Error('Invalid API response: missing response field');
      }

      // Parse the stringified JSON inside response.response
      const parsedResponse = JSON.parse(data.response);

      if (!parsedResponse.result) {
        throw new Error('Invalid API response: missing result field');
      }

      return {
        connectionId: parsedResponse.connectionId,
        result: parsedResponse.result
      };

    } catch (error: any) {
      // Handle abort/timeout
      if (error.name === 'AbortError') {
        throw new Error('การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง');
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new Error('ไม่สามารถประมวลผลข้อมูลจากเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
      }

      // Re-throw with original message or generic error
      throw new Error(error.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่อีกครั้ง');
    }
  }

  /**
   * Send Estimated Benefit request to external API (ask2 endpoint)
   * @param prompt - Formatted conversation history or system prompt + user message
   * @param connectionId - Unique connection ID for this session
   * @returns Parsed benefit calculation with Summary and BenefitValue
   */
  async sendEstimatedBenefitRequest(
    prompt: string,
    connectionId: string
  ): Promise<{ connectionId: string; result: { Summary: string; BenefitValue: number } }> {
    try {
      // Prepare request payload
      const payload = {
        prompt: prompt, // Send as plain string (NOT JSON.stringify)
        connectionId: connectionId
      };

      // Call external API with 60-second timeout (benefit calc may take longer)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // Use absolute path to external server
      const response = await fetch('http://72.61.117.172:8090/api/Ai/ask2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse the nested JSON response
      if (!data.response) {
        throw new Error('Invalid API response: missing response field');
      }

      // Parse the stringified JSON inside response.response
      const parsedResponse = JSON.parse(data.response);

      if (!parsedResponse.result) {
        throw new Error('Invalid API response: missing result field');
      }

      // Validate result structure
      if (!parsedResponse.result.Summary || typeof parsedResponse.result.BenefitValue !== 'number') {
        throw new Error('Invalid API response: missing Summary or BenefitValue');
      }

      return {
        connectionId: parsedResponse.connectionId,
        result: parsedResponse.result
      };

    } catch (error: any) {
      // Handle abort/timeout
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Benefit calculation is taking longer than expected. Please try again.');
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }

      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new Error('Unable to process server response. Please try again.');
      }

      // Re-throw with original message or generic error
      throw new Error(error.message || 'An unknown error occurred. Please try again.');
    }
  }

  // DEPRECATED: Old Quick Fill implementation using Claude API - kept for future reference
  /**
   * Send a message to Claude and receive response with tool calls
   * @param params - The API call parameters
   * @param modelOverride - Optional: Use specific model (e.g., for Haiku vs Sonnet comparison)
   * @deprecated Use sendQuickFillRequest() for Quick Fill feature. This method is preserved for future use.
   */
  async sendMessage(params: ClaudeApiCallParams, modelOverride?: string): Promise<ClaudeApiResponse> {
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
          model: modelOverride || import.meta.env.VITE_CLAUDE_MODEL || 'claude-sonnet-4-20250514',
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

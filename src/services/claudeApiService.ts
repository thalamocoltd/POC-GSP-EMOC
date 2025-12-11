// AI Service for GSP eMoC Chat Integration
// Handles Quick Fill, Estimated Benefit, and Chat modes with n8n webhook

/**
 * Service for communicating with external AI APIs
 * Handles Quick Fill requests, Estimated Benefit calculations, and chat messages
 */
class ClaudeApiService {

  /**
   * Generate a unique numeric connection ID for API requests
   */
  generateConnectionId(): number {
    return Date.now();
  }

  /**
   * Send Quick Fill request to external API
   * @param prompt - User's description of the MOC request
   * @param connectionId - Unique numeric connection ID for this request
   * @returns Parsed form data from API response
   */
  async sendQuickFillRequest(prompt: string, connectionId: number): Promise<any> {
    try {
      // Prepare request payload - backend expects 'prompt' field and connectionId as string
      const payload = {
        prompt: prompt,
        connectionId: connectionId.toString()
      };

      // Call external API with 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Use Vite proxy to avoid CORS issues in development
      const response = await fetch('/api/Ai/ask', {
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
   * @param connectionId - Unique numeric connection ID for this session
   * @returns Parsed benefit calculation with Summary and BenefitValue
   */
  async sendEstimatedBenefitRequest(
    prompt: string,
    connectionId: number
  ): Promise<{ connectionId: string; result: { Summary: string; BenefitValue: number } }> {
    try {
      // Prepare request payload - backend expects 'prompt' field and connectionId as string
      const payload = {
        prompt: prompt,
        connectionId: connectionId.toString()
      };

      // Call external API with 60-second timeout (benefit calc may take longer)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      // Use Vite proxy to avoid CORS issues in development
      const response = await fetch('/api/Ai/ask2', {
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

  /**
   * Send chat message to n8n webhook
   * @param userMessage - The user's message
   * @param connectionId - Unique numeric connection ID for this conversation
   * @returns AI response text from the result field
   */
  async sendChatMessage(userMessage: string, connectionId: number): Promise<string> {
    try {
      const webhookUrl =
        import.meta.env.VITE_N8N_WEBHOOK_URL ||
        'https://n8n.srv1155402.hstgr.cloud/webhook/7d36d1c1-aa69-4bd8-9897-f824de33e3e6';

      const payload = {
        chatInput: userMessage,
        connectionId: connectionId,
      };

      // Call webhook with 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle direct JSON response (no wrapper layer)
      // Response format: { connectionId: string, result: string }
      if (data.result) {
        return data.result;
      }

      // Fallback: try nested JSON pattern (in case of wrapper)
      if (data.response) {
        const parsedResponse = JSON.parse(data.response);
        if (parsedResponse.result) {
          return parsedResponse.result;
        }
      }

      throw new Error('Invalid API response: missing result field');

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
}

// Singleton instance
export const claudeApiService = new ClaudeApiService();

export default claudeApiService;

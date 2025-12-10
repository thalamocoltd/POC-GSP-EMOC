// Claude API Integration Types

// Message Types
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: Record<string, any> };

// Tool Definitions
export interface ClaudeToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface ClaudeToolCallResult {
  name: string;
  input: Record<string, any>;
}

// API Response Types
export interface ClaudeApiResponse {
  content: string;
  toolCalls?: ClaudeToolCallResult[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens';
}

// Conversation State
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ClaudeToolCallResult[];
}

export interface ConversationState {
  fieldId: string | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  intermediateData: Record<string, any>;
}

// Tool Call Handlers
export type ToolCallType = 'fill_field' | 'ask_followup' | 'show_calculation' | 'request_confirmation';

export interface FillFieldToolCall {
  type: 'fill_field';
  fieldId: string;
  value: any;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface AskFollowupToolCall {
  type: 'ask_followup';
  question: string;
  questionType: 'open-ended' | 'multiple-choice' | 'numeric' | 'yes-no';
  choices?: Array<{ label: string; value: any }>;
  context?: string;
}

export interface ShowCalculationToolCall {
  type: 'show_calculation';
  title: string;
  steps: Array<{
    description: string;
    formula?: string;
    result: number;
    unit: string;
  }>;
  finalResult: number;
  assumptions?: string[];
}

export interface RequestConfirmationToolCall {
  type: 'request_confirmation';
  summary: string;
  value: any;
  fieldId: string;
}

export type ToolCallHandler =
  | FillFieldToolCall
  | AskFollowupToolCall
  | ShowCalculationToolCall
  | RequestConfirmationToolCall;

// Field Prompt Configuration
export interface FieldPromptConfig {
  fieldId: string;
  systemPrompt: string;
  conversationObjectives: string[];
  outputFormat: 'text' | 'structured' | 'interactive';
  requiresCalculation: boolean;
  dependencies: string[];
}

// Error Handling
export type ClaudeErrorType =
  | 'api_key_invalid'
  | 'rate_limit'
  | 'network_error'
  | 'invalid_response'
  | 'tool_execution_error'
  | 'unknown_error';

export interface ClaudeError {
  type: ClaudeErrorType;
  message: string;
  userMessage: string;
  recoverable: boolean;
  retryable: boolean;
}

// API Request/Response
export interface ClaudeApiRequest {
  messages: ClaudeMessage[];
  systemPrompt: string;
  tools?: any[];
  maxTokens?: number;
  temperature?: number;
}

export interface ClaudeApiCallParams {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
  tools?: any[];
  maxTokens?: number;
}

// Hook Return Types
export interface UseClaudeConversationReturn {
  // State
  fieldId: string | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  intermediateData: Record<string, any>;

  // Methods
  startConversation: (fieldId: string, initialQuestion: string) => void;
  sendMessage: (userMessage: string, fieldId?: string) => Promise<ClaudeApiResponse | void>;
  handleToolCall: (toolCall: ClaudeToolCallResult) => ToolCallHandler | null;
  updateIntermediateData: (key: string, value: any) => void;
  resetConversation: () => void;
}

// Estimated Benefit API Types
export interface EstimatedBenefitRequest {
  prompt: string;
  connectionId: string;
}

export interface EstimatedBenefitResponse {
  response: string; // JSON stringified
}

export interface EstimatedBenefitResult {
  connectionId: string;
  result: {
    Summary: string;
    BenefitValue: number;
  };
}

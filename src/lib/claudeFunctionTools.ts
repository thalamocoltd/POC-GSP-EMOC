// Claude Function Calling Tools Schema for GSP eMoC

/**
 * Tool definitions for Claude to use when assisting with form fields
 * These tools define what Claude can do when interacting with users
 */
export const CLAUDE_TOOLS = [
  {
    name: 'fill_field',
    description:
      'Fill a form field with a calculated or recommended value. Use this when you have enough information to provide a value and the user has confirmed or when the calculation is complete.',
    input_schema: {
      type: 'object',
      properties: {
        fieldId: {
          type: 'string',
          description: 'The ID of the field to fill (e.g., "estimatedBenefit", "mocTitle")',
        },
        value: {
          description:
            'The value to fill into the field. Type varies by field (string, number, object, array).',
          oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'object' }, { type: 'array' }],
        },
        confidence: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description:
            'Your confidence level in this value (high for validated data, low for estimates)',
        },
        reasoning: {
          type: 'string',
          description: 'Brief explanation of why this value was chosen or how it was calculated',
        },
      },
      required: ['fieldId', 'value', 'confidence', 'reasoning'],
    },
  },
  {
    name: 'ask_followup',
    description: 'Ask the user a follow-up question to gather more information needed for calculation or guidance',
    input_schema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question to ask the user (should be clear and specific)',
        },
        questionType: {
          type: 'string',
          enum: ['open-ended', 'multiple-choice', 'numeric', 'yes-no'],
          description: 'Type of question for UI rendering and input handling',
        },
        choices: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: {
                type: 'string',
                description: 'Display text for the choice',
              },
              value: {
                description: 'The value to return if this choice is selected',
              },
            },
            required: ['label', 'value'],
          },
          description: 'For multiple-choice questions, provide the available options',
        },
        context: {
          type: 'string',
          description: 'Optional: Why you are asking this question (helps user understand)',
        },
      },
      required: ['question', 'questionType'],
    },
  },
  {
    name: 'show_calculation',
    description:
      'Display a detailed calculation breakdown to help the user understand how a value was derived',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the calculation (e.g., "Annual Energy Savings Calculation")',
        },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Description of what this step calculates',
              },
              formula: {
                type: 'string',
                description: 'The mathematical formula or calculation (optional)',
              },
              result: {
                type: 'number',
                description: 'The numerical result of this step',
              },
              unit: {
                type: 'string',
                description: 'Unit of measurement (e.g., "kWh", "THB", "hours")',
              },
            },
            required: ['description', 'result', 'unit'],
          },
          description: 'Step-by-step breakdown of the calculation',
        },
        finalResult: {
          type: 'number',
          description: 'The final calculated value',
        },
        finalUnit: {
          type: 'string',
          description: 'Unit of the final result (e.g., "THB/year", "kWh/year")',
        },
        assumptions: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'List of assumptions made during calculation (source of data, standard values, etc.)',
        },
        confidenceLevel: {
          type: 'string',
          enum: ['high', 'medium', 'low'],
          description: 'How confident you are in this calculation',
        },
      },
      required: ['title', 'steps', 'finalResult', 'finalUnit'],
    },
  },
  {
    name: 'request_confirmation',
    description: 'Ask user to confirm before filling a field with the calculated or recommended value',
    input_schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Summary of what will be filled and why (e.g., "Based on the calculation, the Estimated Benefit is 36,000 THB/year")',
        },
        value: {
          description: 'The value to be filled if confirmed',
        },
        fieldId: {
          type: 'string',
          description: 'The field ID that will be filled',
        },
        alternativeOptions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              value: {},
              reason: { type: 'string' },
            },
          },
          description: 'Optional: Alternative values if user wants conservative/optimistic estimates',
        },
      },
      required: ['summary', 'value', 'fieldId'],
    },
  },
  {
    name: 'provide_guidance',
    description:
      'Provide expert guidance on a field without immediately filling it (for advice-only fields)',
    input_schema: {
      type: 'object',
      properties: {
        fieldId: {
          type: 'string',
          description: 'The field this guidance applies to',
        },
        guidance: {
          type: 'string',
          description: 'The expert guidance to provide to the user',
        },
        examples: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: Examples relevant to GSP operations',
        },
        suggestedFormat: {
          type: 'string',
          description: 'Optional: Suggested format or structure for the response',
        },
      },
      required: ['fieldId', 'guidance'],
    },
  },
];

/**
 * Helper function to get tool definitions for API calls
 * Can be filtered by tool name if needed
 */
export function getToolDefinitions(toolNames?: string[]) {
  if (!toolNames) {
    return CLAUDE_TOOLS;
  }

  return CLAUDE_TOOLS.filter((tool) => toolNames.includes(tool.name));
}

/**
 * Type definitions for tool call results
 */
export interface FillFieldInput {
  fieldId: string;
  value: any;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

export interface AskFollowupInput {
  question: string;
  questionType: 'open-ended' | 'multiple-choice' | 'numeric' | 'yes-no';
  choices?: Array<{ label: string; value: any }>;
  context?: string;
}

export interface ShowCalculationInput {
  title: string;
  steps: Array<{
    description: string;
    formula?: string;
    result: number;
    unit: string;
  }>;
  finalResult: number;
  finalUnit: string;
  assumptions?: string[];
  confidenceLevel?: 'high' | 'medium' | 'low';
}

export interface RequestConfirmationInput {
  summary: string;
  value: any;
  fieldId: string;
  alternativeOptions?: Array<{
    label: string;
    value: any;
    reason: string;
  }>;
}

export interface ProvideGuidanceInput {
  fieldId: string;
  guidance: string;
  examples?: string[];
  suggestedFormat?: string;
}

/**
 * Type guard to check if a tool call is a specific type
 */
export function isFillFieldCall(input: any): input is FillFieldInput {
  return input && typeof input === 'object' && 'fieldId' in input && 'value' in input;
}

export function isAskFollowupCall(input: any): input is AskFollowupInput {
  return input && typeof input === 'object' && 'question' in input && 'questionType' in input;
}

export function isShowCalculationCall(input: any): input is ShowCalculationInput {
  return input && typeof input === 'object' && 'steps' in input && 'finalResult' in input;
}

export function isRequestConfirmationCall(input: any): input is RequestConfirmationInput {
  return input && typeof input === 'object' && 'summary' in input && 'fieldId' in input;
}

export function isProvideGuidanceCall(input: any): input is ProvideGuidanceInput {
  return input && typeof input === 'object' && 'fieldId' in input && 'guidance' in input;
}

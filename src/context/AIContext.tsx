import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InitiationFormData } from '../types/emoc';

export interface Message {
  role: 'ai' | 'user';
  content: string | React.ReactNode;
  showAction?: boolean;
  actionFilled?: boolean;
  type?: 'normal' | 'validation-error';
  errors?: Record<string, string>;
  fieldId?: string;
  interactionType?: 'advice-only' | 'choices' | 'ask-and-fill' | 'auto-fill';
  choices?: Array<{ label: string; value: any }>;
}

interface AIContextType {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  activeFieldId: string | null;
  setActiveFieldId: (id: string | null) => void;
  openAssistantForField: (fieldId: string, question: string, onAutoFill: (value: any) => void, formData?: Partial<InitiationFormData>) => void;
  triggerAutoFill: (value: any) => void;
  registerBulkFill: (callback: (data: any) => void) => void;
  triggerBulkFill: (data: any) => void;
  lastQuestion: string | null;
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  reportValidationErrors: (errors: Record<string, string>, scrollToField: (id: string) => void, onAutoFill: (field: string, value: any) => void) => void;
  reportValidationSuccess: () => void;
  scrollToCallback: ((id: string) => void) | null;
  errorAutoFillCallback: ((field: string, value: any) => void) | null;
  validationErrorsToReport: Record<string, string> | null;
  shouldAutoSubmitQuestion: boolean;
  setShouldAutoSubmitQuestion: (should: boolean) => void;
  formContext: Partial<InitiationFormData>;
  setFormContext: (context: Partial<InitiationFormData>) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [autoFillCallback, setAutoFillCallback] = useState<((value: any) => void) | null>(null);
  const [bulkFillCallback, setBulkFillCallback] = useState<((data: any) => void) | null>(null);
  const [scrollToCallback, setScrollToCallback] = useState<((id: string) => void) | null>(null);
  const [errorAutoFillCallback, setErrorAutoFillCallback] = useState<((field: string, value: any) => void) | null>(null);
  const [validationErrorsToReport, setValidationErrorsToReport] = useState<Record<string, string> | null>(null);
  const [shouldAutoSubmitQuestion, setShouldAutoSubmitQuestion] = useState(false);
  const [formContext, setFormContext] = useState<Partial<InitiationFormData>>({});
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! How can I assist you with your MOC requests or plant operations today?" }
  ]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const openAssistantForField = (fieldId: string, question: string, onAutoFill: (value: any) => void, formData?: Partial<InitiationFormData>) => {
    setActiveFieldId(fieldId);
    setLastQuestion(question);
    setAutoFillCallback(() => onAutoFill);
    setShouldAutoSubmitQuestion(true);
    if (formData) {
      setFormContext(formData);
    }
    setChatOpen(true);
  };

  const triggerAutoFill = (value: any) => {
    if (autoFillCallback) {
      const actualCallback = autoFillCallback();
      if (typeof actualCallback === 'function') {
        actualCallback(value);
      }
    }
  };

  const registerBulkFill = (callback: (data: any) => void) => {
    console.log('AIContext: registerBulkFill called');
    setBulkFillCallback(() => callback);
  };

  const triggerBulkFill = (data: any) => {
    console.log('AIContext: triggerBulkFill called with data:', data);
    if (bulkFillCallback) {
      const actualCallback = bulkFillCallback;
      if (typeof actualCallback === 'function') {
        console.log('AIContext: Executing bulk fill callback');
        actualCallback(data);
      } else {
        console.warn('AIContext: bulkFillCallback is not a function');
      }
    } else {
      console.warn('AIContext: No bulk fill callback registered');
    }
  };

  const reportValidationErrors = (errors: Record<string, string>, scrollToField: (id: string) => void, onAutoFill: (field: string, value: any) => void) => {
    console.log("AIContext: reportValidationErrors called with", errors);
    setScrollToCallback(() => scrollToField);
    setErrorAutoFillCallback(() => onAutoFill);

    // Open chat first
    setChatOpen(true);

    // Set validation errors to report - ChatPanel will listen to this
    setValidationErrorsToReport(errors);
  };

  const reportValidationSuccess = () => {
    addMessage({
      role: 'ai',
      content: "✅ All errors resolved! Ready to submit."
    });
  };

  return (
    <AIContext.Provider value={{
      isChatOpen,
      setChatOpen,
      activeFieldId,
      setActiveFieldId,
      openAssistantForField,
      triggerAutoFill,
      registerBulkFill,
      triggerBulkFill,
      lastQuestion,
      messages,
      addMessage,
      setMessages,
      reportValidationErrors,
      reportValidationSuccess,
      scrollToCallback,
      errorAutoFillCallback,
      validationErrorsToReport,
      shouldAutoSubmitQuestion,
      setShouldAutoSubmitQuestion,
      formContext,
      setFormContext
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Message {
  role: 'ai' | 'user';
  content: string | React.ReactNode;
  showAction?: boolean;
  actionFilled?: boolean;
  type?: 'normal' | 'validation-error';
  errors?: Record<string, string>;
}

interface AIContextType {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  activeFieldId: string | null;
  setActiveFieldId: (id: string | null) => void;
  openAssistantForField: (fieldId: string, question: string, onAutoFill: (value: any) => void) => void;
  triggerAutoFill: (value: any) => void;
  lastQuestion: string | null;
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  reportValidationErrors: (errors: Record<string, string>, scrollToField: (id: string) => void, onAutoFill: (field: string, value: any) => void) => void;
  reportValidationSuccess: () => void;
  scrollToCallback: ((id: string) => void) | null;
  errorAutoFillCallback: ((field: string, value: any) => void) | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [autoFillCallback, setAutoFillCallback] = useState<((value: any) => void) | null>(null);
  const [scrollToCallback, setScrollToCallback] = useState<((id: string) => void) | null>(null);
  const [errorAutoFillCallback, setErrorAutoFillCallback] = useState<((field: string, value: any) => void) | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hello! How can I assist you with your MOC requests or plant operations today?" }
  ]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const openAssistantForField = (fieldId: string, question: string, onAutoFill: (value: any) => void) => {
    setActiveFieldId(fieldId);
    setLastQuestion(question);
    setAutoFillCallback(() => onAutoFill);
    setChatOpen(true);
  };

  const triggerAutoFill = (value: any) => {
    if (autoFillCallback) {
      autoFillCallback(value);
    }
  };

  const reportValidationErrors = (errors: Record<string, string>, scrollToField: (id: string) => void, onAutoFill: (field: string, value: any) => void) => {
    console.log("AIContext: reportValidationErrors called with", errors);
    setScrollToCallback(() => scrollToField);
    setErrorAutoFillCallback(() => onAutoFill);

    // Open chat first
    setChatOpen(true);

    // Add message after chat is open
    const errorMessage = {
      role: 'ai' as const,
      content: "I've found some issues with your form submission.",
      type: 'validation-error' as const,
      errors: errors
    };

    console.log("AIContext: Adding message", errorMessage);

    // Use immediate state update
    setTimeout(() => {
      setMessages(prev => {
        console.log("AIContext: Previous messages", prev);
        const newMessages = [...prev, errorMessage];
        console.log("AIContext: New messages", newMessages);
        return newMessages;
      });
    }, 200);
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
      lastQuestion,
      messages,
      addMessage,
      setMessages,
      reportValidationErrors,
      reportValidationSuccess,
      scrollToCallback,
      errorAutoFillCallback
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

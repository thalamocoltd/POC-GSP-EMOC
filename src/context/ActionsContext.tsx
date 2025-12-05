"use client";

import React, { createContext, useContext, useState } from "react";

interface ActionsContextType {
  activeDialog: string | null;
  setActiveDialog: (dialog: string | null) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  processingMessages: string[];
  setProcessingMessages: (messages: string[]) => void;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export const ActionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessages, setProcessingMessages] = useState<string[]>([]);

  return (
    <ActionsContext.Provider
      value={{
        activeDialog,
        setActiveDialog,
        isProcessing,
        setIsProcessing,
        processingMessages,
        setProcessingMessages,
      }}
    >
      {children}
    </ActionsContext.Provider>
  );
};

export const useActions = () => {
  const context = useContext(ActionsContext);
  if (context === undefined) {
    throw new Error("useActions must be used within ActionsProvider");
  }
  return context;
};

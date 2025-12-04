import React, { useState } from "react";
import { motion } from "motion/react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ModuleMenu } from "./components/layout/ModuleMenu";
import { ChatPanel } from "./components/layout/ChatPanel";
import { Dashboard } from "./components/dashboard/Dashboard";
import { MOCQualificationWizard } from "./components/emoc/MOCQualificationWizard";
import { CreateRequestForm } from "./components/forms/CreateRequestForm";
import { ViewRequestForm } from "./components/forms/ViewRequestForm";
import { ComingSoon } from "./components/common/ComingSoon";
import { ProcessingOverlay } from "./components/ui/ProcessingOverlay";
import { ReviewApprovalStep } from "./components/forms/ReviewApprovalStep";
import { ImplementationStep } from "./components/forms/ImplementationStep";
import { CloseoutStep } from "./components/forms/CloseoutStep";
import { useIsMobile } from "./components/ui/use-mobile";
import { cn } from "./components/ui/utils";
import { LocationId } from "./components/dashboard/LocationSelector";
import { AIProvider, useAI } from "./context/AIContext";
import { ValidationErrorsProvider, useValidationErrors } from "./context/ValidationErrorsContext";
import { InitiationFormData } from "./types/emoc";

function AppContent() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isChatOpen, setChatOpen } = useAI();
  const { clearErrors: clearValidationErrors } = useValidationErrors();

  // Navigation State
  type PageType = "dashboard" | "qualification" | "create-request" | "view-request" | "coming-soon";
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [isAIAutofilled, setIsAIAutofilled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Location State
  const [currentLocation, setCurrentLocation] = useState<LocationId>("rayong");
  const [isSwitchingLocation, setIsSwitchingLocation] = useState(false);

  // MOC Navigation State
  const [currentMocStep, setCurrentMocStep] = useState<number>(1);
  const [mocFormData, setMocFormData] = useState<InitiationFormData | null>(null);
  const [mocMode, setMocMode] = useState<"create" | "view">("create");

  // Handlers
  const handleAICommand = (command: string) => {
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setIsAIAutofilled(true);
    setCurrentPage("create-request");
  };

  const handleCreateRequest = () => {
    setIsAIAutofilled(false);
    setMocMode("create");
    setCurrentMocStep(1);
    setMocFormData(null);
    setCurrentPage("qualification");
  };

  const handleViewRequest = (id: string) => {
    setCurrentViewId(id);
    setMocMode("view");
    setCurrentMocStep(1);
    setCurrentPage("view-request");
  };

  const handleQualificationQualified = () => {
    setCurrentPage("create-request");
  };

  const handleQualificationNotQualified = () => {
    setCurrentPage("dashboard");
  };

  const handleBackToDashboard = () => {
    clearValidationErrors();
    setCurrentPage("dashboard");
    setCurrentViewId(null);
    setCurrentMocStep(1);
    setMocFormData(null);
    setMocMode("create");
  };

  const handleStepTransition = (targetStep: number) => {
    if (targetStep < 1 || targetStep > 4) return;
    // Scroll to top for clear visual feedback
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentMocStep(targetStep);
  };

  const handleStepComplete = (stepNumber: number, data?: InitiationFormData) => {
    if (data) {
      setMocFormData((prev: InitiationFormData | null) => prev ? { ...prev, ...data } : data);
    }
    if (stepNumber < 4) {
      handleStepTransition(stepNumber + 1);
    }
  };

  const handleStepNavigation = (targetStep: number) => {
    if (mocMode === "view" && targetStep >= 1 && targetStep <= 4) {
      handleStepTransition(targetStep);
    }
  };

  const handleLocationChange = (newLocation: LocationId) => {
    if (newLocation === currentLocation) return;

    // Trigger switch effect
    setIsSwitchingLocation(true);

    // Simulate switching delay
    setTimeout(() => {
      setCurrentLocation(newLocation);
      setIsSwitchingLocation(false);
    }, 1500);
  };

  // Determine if showing module menu
  // Show menu for create and view pages
  const showModuleMenu = currentPage === "create-request" || currentPage === "view-request";

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans text-[#1C1C1E]">
      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(page) => {
          if (page === "dashboard") setCurrentPage("dashboard");
          else if (page === "qualification") handleCreateRequest();
          else setCurrentPage("coming-soon");
        }}
        currentPage={currentPage}
      />

      {/* Header */}
      <Header
        onChatToggle={() => setChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        currentPage={currentPage}
        showModuleMenu={showModuleMenu}
        isMobile={isMobile}
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
        viewingId={currentViewId}
      />

      {/* Module Menu */}
      {showModuleMenu && (
        <ModuleMenu
          isMobile={isMobile}
          currentStep={currentMocStep}
          isReadOnly={mocMode === "view"}
          onStepClick={mocMode === "view" ? handleStepNavigation : undefined}
        />
      )}

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setChatOpen(false)}
        onCommand={handleAICommand}
      />

      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isProcessing}
        onComplete={handleProcessingComplete}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          "pb-8",
          // Horizontal padding
          "px-6 md:px-8",
          // Z-index to stay above sidebar
          "relative z-20"
        )}
        style={{
          marginLeft: isMobile ? "0px" : showModuleMenu ? "370px" : "72px"
        }}
      >
        {/* Mobile Header Trigger */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 p-2 bg-white rounded-md shadow-sm mt-4"
          >
            <span className="sr-only">Open Menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        )}

        {currentPage === "dashboard" && (
          <Dashboard
            onCreateRequest={handleCreateRequest}
            onViewRequest={handleViewRequest}
            currentLocation={currentLocation}
            isSwitchingLocation={isSwitchingLocation}
          />
        )}

        {currentPage === "qualification" && (
          <MOCQualificationWizard
            onBack={handleBackToDashboard}
            onQualified={handleQualificationQualified}
            onNotQualified={handleQualificationNotQualified}
          />
        )}

        {currentPage === "create-request" && (
          <motion.div
            key={currentMocStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {currentMocStep === 1 && (
              <CreateRequestForm
                onBack={handleBackToDashboard}
                onSubmit={(data) => handleStepComplete(1, data)}
                isAIAutofilled={isAIAutofilled}
              />
            )}
            {currentMocStep === 2 && (
              <ReviewApprovalStep
                data={mocFormData}
                onPrevious={() => handleStepTransition(1)}
                onNext={() => handleStepComplete(2)}
                onBack={handleBackToDashboard}
              />
            )}
            {currentMocStep === 3 && (
              <ImplementationStep
                data={mocFormData}
                onPrevious={() => handleStepTransition(2)}
                onNext={() => handleStepComplete(3)}
                onBack={handleBackToDashboard}
              />
            )}
            {currentMocStep === 4 && (
              <CloseoutStep
                data={mocFormData}
                onPrevious={() => handleStepTransition(3)}
                onBack={handleBackToDashboard}
              />
            )}
          </motion.div>
        )}

        {currentPage === "view-request" && (
          <motion.div
            key={currentMocStep}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <ViewRequestForm
              id={currentViewId}
              step={currentMocStep}
              onBack={handleBackToDashboard}
              onStepChange={handleStepNavigation}
            />
          </motion.div>
        )}

        {currentPage === "coming-soon" && (
          <ComingSoon onBack={handleBackToDashboard} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AIProvider>
      <ValidationErrorsProvider>
        <AppContent />
      </ValidationErrorsProvider>
    </AIProvider>
  );
}

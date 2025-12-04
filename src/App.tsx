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
import { SearchPage } from "./components/pages/SearchPage";
import { ReportPage } from "./components/pages/ReportPage";
import { AdminPage } from "./components/pages/AdminPage";
import { ProcessingOverlay } from "./components/ui/ProcessingOverlay";
import { useIsMobile } from "./components/ui/use-mobile";
import { cn } from "./components/ui/utils";
import { LocationId } from "./components/dashboard/LocationSelector";
import { AIProvider, useAI } from "./context/AIContext";
import { ValidationErrorsProvider, useValidationErrors } from "./context/ValidationErrorsContext";
import { InitiationFormData } from "./types/emoc";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";

interface RequestData {
  mocNo: string;
  title: string;
}

function AppContent() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isChatOpen, setChatOpen } = useAI();
  const { clearErrors: clearValidationErrors } = useValidationErrors();

  // Navigation State
  type PageType = "dashboard" | "qualification" | "create-request" | "view-request" | "search" | "report" | "admin" | "coming-soon";
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [currentRequestData, setCurrentRequestData] = useState<RequestData | null>(null);
  const [isAIAutofilled, setIsAIAutofilled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Location State
  const [currentLocation, setCurrentLocation] = useState<LocationId>("rayong");
  const [isSwitchingLocation, setIsSwitchingLocation] = useState(false);
  const [isCreateFormDirty, setIsCreateFormDirty] = useState(false);
  const [pendingLocationChange, setPendingLocationChange] = useState<LocationId | null>(null);
  const [showLocationChangeDialog, setShowLocationChangeDialog] = useState(false);

  // MOC Navigation State
  const [currentMocStep, setCurrentMocStep] = useState<number>(0);
  const [mocFormData, setMocFormData] = useState<InitiationFormData | null>(null);
  const [mocMode, setMocMode] = useState<"create" | "view">("create");
  const [pendingAutofillPriority, setPendingAutofillPriority] = useState<"normal" | "emergency" | "">();

  // Handlers
  const handleAICommand = (command: string) => {
    setIsProcessing(true);

    // Extract priority from command (e.g., "autofill:normal" or "autofill:emergency")
    if (command.startsWith("autofill:")) {
      const priority = command.split(":")[1] as "normal" | "emergency";
      // Simulate processing delay
      setTimeout(() => {
        handleProcessingComplete(priority);
      }, 1500);
    } else if (command === "autofill") {
      // Fallback for old format without priority
      setTimeout(() => {
        handleProcessingComplete("normal");
      }, 1500);
    }
  };

  const handleProcessingComplete = (priority?: "normal" | "emergency") => {
    setIsProcessing(false);
    setIsAIAutofilled(true);
    setPendingAutofillPriority(priority || "");
    setCurrentPage("create-request");
  };

  const handleCreateRequest = () => {
    setIsAIAutofilled(false);
    setMocMode("create");
    setCurrentMocStep(0); // Start at step 0 (prescreening)
    setMocFormData(null);
    setCurrentPage("qualification");
  };

  const handleViewRequest = (mocNo: string, title: string, step?: number) => {
    setCurrentRequestData({ mocNo, title });
    setCurrentViewId(mocNo);
    setMocMode("view");
    setCurrentMocStep(step || 1);
    setCurrentPage("view-request");
  };

  const handleQualificationQualified = () => {
    setCurrentMocStep(1); // Move to step 1 after prescreening
    setCurrentPage("create-request");
  };

  const handleQualificationNotQualified = () => {
    setCurrentPage("dashboard");
  };

  const handleBackToDashboard = () => {
    clearValidationErrors();
    setCurrentPage("dashboard");
    setCurrentViewId(null);
    setCurrentRequestData(null);
    setCurrentMocStep(1);
    setMocFormData(null);
    setMocMode("create");
    setIsAIAutofilled(false);
    setPendingAutofillPriority("");
  };

  const handleStepTransition = (targetStep: number) => {
    if (targetStep < 0 || targetStep > 4) return; // Allow step 0
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
    // In view mode: allow navigation to any step
    if (mocMode === "view" && targetStep >= 0 && targetStep <= 4) {
      handleStepTransition(targetStep);
    }
    // In create mode: allow navigation to step 0 (MOC Prescreening)
    if (mocMode === "create" && targetStep === 0) {
      handleStepTransition(targetStep);
      setCurrentPage("qualification");
    }
  };

  const handleLocationChange = (newLocation: LocationId) => {
    if (newLocation === currentLocation) return;

    if (currentPage === "create-request" && isCreateFormDirty) {
      setPendingLocationChange(newLocation);
      setShowLocationChangeDialog(true);
    } else {
      executeLocationChange(newLocation);
    }
  };

  const executeLocationChange = (newLocation: LocationId) => {
    setIsSwitchingLocation(true);

    const needsNavigation = currentPage !== "dashboard";

    if (needsNavigation) {
      setCurrentPage("dashboard");
      clearValidationErrors();
      setCurrentViewId(null);
      setCurrentMocStep(1);
      setMocFormData(null);
      setMocMode("create");
      setIsCreateFormDirty(false);
    }

    setTimeout(() => {
      setCurrentLocation(newLocation);
      setIsSwitchingLocation(false);
    }, needsNavigation ? 1500 : 1000);
  };

  const handleConfirmLocationChange = () => {
    if (pendingLocationChange) {
      executeLocationChange(pendingLocationChange);
      setPendingLocationChange(null);
      setShowLocationChangeDialog(false);
    }
  };

  const handleCancelLocationChange = () => {
    setPendingLocationChange(null);
    setShowLocationChangeDialog(false);
  };

  const handleNavigate = (page: string) => {
    switch (page) {
      case "dashboard":
        handleBackToDashboard();
        break;
      case "qualification":
        handleCreateRequest();
        break;
      case "search":
      case "report":
      case "admin":
        setCurrentPage(page as PageType);
        break;
      default:
        // Stay on current page
        break;
    }
  };

  // Determine if showing module menu
  // Show menu for qualification, create and view pages
  const showModuleMenu = currentPage === "qualification" || currentPage === "create-request" || currentPage === "view-request";

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
          else if (page === "search") setCurrentPage("search");
          else if (page === "report") setCurrentPage("report");
          else if (page === "admin") setCurrentPage("admin");
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
        requestData={currentRequestData}
        onNavigate={handleNavigate}
      />

      {/* Module Menu */}
      {showModuleMenu && (
        <ModuleMenu
          isMobile={isMobile}
          currentStep={currentMocStep}
          isReadOnly={mocMode === "view"}
          onStepClick={handleStepNavigation}
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
            isMobile={isMobile}
          />
        )}

        {currentPage === "create-request" && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <CreateRequestForm
              onBack={handleBackToDashboard}
              onSubmit={(data) => handleStepComplete(1, data)}
              isAIAutofilled={isAIAutofilled}
              onFormDirtyChange={setIsCreateFormDirty}
              autofillPriority={pendingAutofillPriority as "normal" | "emergency" | undefined}
            />
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

        {currentPage === "search" && (
          <SearchPage onBack={handleBackToDashboard} />
        )}

        {currentPage === "report" && (
          <ReportPage onBack={handleBackToDashboard} />
        )}

        {currentPage === "admin" && (
          <AdminPage onBack={handleBackToDashboard} />
        )}

        {currentPage === "coming-soon" && (
          <ComingSoon onBack={handleBackToDashboard} />
        )}
      </main>

      {/* Location Change Confirmation Dialog */}
      <AlertDialog open={showLocationChangeDialog} onOpenChange={setShowLocationChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in your MOC request form. Changing location will return you to the dashboard and discard these changes. Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelLocationChange}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLocationChange}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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

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
import { ProcessSafetyInfoChecklistForm } from "./components/forms/ProcessSafetyInfoChecklistForm";
import { ComingSoon } from "./components/common/ComingSoon";
import { SearchPage } from "./components/pages/SearchPage";
import { ReportPage } from "./components/pages/ReportPage";
import { AdminPage } from "./components/pages/AdminPage";
import { WorkflowConfigPage } from "./components/admin/WorkflowConfigPage";
import { ProcessingOverlay } from "./components/ui/ProcessingOverlay";
import { useIsMobile } from "./components/ui/use-mobile";
import { cn } from "./components/ui/utils";
import { LocationId } from "./components/dashboard/LocationSelector";
import { AIProvider, useAI } from "./context/AIContext";
import { ValidationErrorsProvider, useValidationErrors } from "./context/ValidationErrorsContext";
import { ActionsProvider } from "./context/ActionsContext";
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

  // Form overlay state (for inline form display without navigation)
  const [activeFormOverlay, setActiveFormOverlay] = useState<"psi-checklist" | "preliminary-safety" | "she-assessment" | null>(null);
  const [scrollPosition, setScrollPosition] = useState<number>(0);

  // Admin sub-page state
  const [adminSubPage, setAdminSubPage] = useState<string | null>(null);

  // Location State
  const [currentLocation, setCurrentLocation] = useState<LocationId>("rayong");
  const [isSwitchingLocation, setIsSwitchingLocation] = useState(false);
  const [isCreateFormDirty, setIsCreateFormDirty] = useState(false);
  const [pendingLocationChange, setPendingLocationChange] = useState<LocationId | null>(null);
  const [showLocationChangeDialog, setShowLocationChangeDialog] = useState(false);

  // MOC Navigation State
  const [currentMocStep, setCurrentMocStep] = useState<number>(0);
  const [maxReachedStep, setMaxReachedStep] = useState<number>(0);
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
    setMaxReachedStep(0); // Reset max reached step
    setMocFormData(null);
    setCurrentPage("qualification");
  };

  const handleViewRequest = (mocNo: string, title: string, step?: number) => {
    setCurrentRequestData({ mocNo, title });
    setCurrentViewId(mocNo);
    setMocMode("view");
    setCurrentMocStep(step || 1);
    setMaxReachedStep(step || 1); // In view mode, allow navigation to all steps
    setCurrentPage("view-request");
  };

  const handleQualificationQualified = () => {
    setCurrentMocStep(1); // Move to step 1 after prescreening
    setMaxReachedStep(1); // Mark step 1 as reached
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
    setMaxReachedStep(0); // Reset max reached step
    setMocFormData(null);
    setMocMode("create");
    setIsAIAutofilled(false);
    setPendingAutofillPriority("");
    setActiveFormOverlay(null);
  };

  const handleNavigateToAssessmentForm = (formType: "psi-checklist" | "preliminary-safety" | "she-assessment") => {
    // Save current scroll position
    setScrollPosition(window.scrollY);
    // Show form overlay instead of changing page
    setActiveFormOverlay(formType);
    // Scroll to top when opening form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleBackToViewRequest = () => {
    // Close form overlay
    setActiveFormOverlay(null);
    // Restore scroll position after a short delay to allow render
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }, 100);
  };

  const handleStepTransition = (targetStep: number) => {
    if (targetStep < 0 || targetStep > 4) return; // Allow step 0
    // Scroll to top for clear visual feedback
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentMocStep(targetStep);
    // Update max reached step if we're moving forward
    if (targetStep > maxReachedStep) {
      setMaxReachedStep(targetStep);
    }
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
    // In create mode: allow navigation to step 0 or any step <= maxReachedStep
    if (mocMode === "create") {
      if (targetStep === 0) {
        handleStepTransition(targetStep);
        setCurrentPage("qualification");
      } else if (targetStep <= maxReachedStep && targetStep > 0) {
        // Allow back/forth navigation between visited steps (1-4)
        handleStepTransition(targetStep);
      }
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
      setMaxReachedStep(0); // Reset max reached step
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

  // Enhanced navigation for admin sub-pages
  const handleNavigate = (page: string, subPage?: string) => {
    if (page === "admin") {
      setCurrentPage("admin");
      setAdminSubPage(subPage || null);
      return;
    }
    setAdminSubPage(null);
    switch (page) {
      case "dashboard":
        handleBackToDashboard();
        break;
      case "qualification":
        handleCreateRequest();
        break;
      case "search":
      case "report":
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
        breadcrumbPath={
          currentPage === "admin" && adminSubPage === "workflow-config"
            ? [
              { label: "Admin", page: "admin" },
              { label: "Workflow Configuration", page: "admin", subPage: "workflow-config" }
            ]
            : currentPage === "admin"
              ? [{ label: "Admin", page: "admin" }]
              : undefined
        }
      />

      {/* Module Menu */}
      {showModuleMenu && (
        <ModuleMenu
          isMobile={isMobile}
          currentStep={currentMocStep}
          maxReachedStep={maxReachedStep}
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
          "pt-6 pb-8",
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
          <>
            {/* Show form overlay if active, otherwise show ViewRequestForm */}
            {activeFormOverlay === "psi-checklist" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProcessSafetyInfoChecklistForm
                  onBack={handleBackToViewRequest}
                  mocNumber={currentRequestData?.mocNo}
                  mocTitle={currentRequestData?.title}
                />
              </motion.div>
            ) : activeFormOverlay === "preliminary-safety" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ComingSoon
                  onBack={handleBackToViewRequest}
                  title="Preliminary Safety Assessment Form"
                  message="This form is currently under development"
                />
              </motion.div>
            ) : activeFormOverlay === "she-assessment" ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ComingSoon
                  onBack={handleBackToViewRequest}
                  title="SHE Assessment Check List Form"
                  message="This form is currently under development"
                />
              </motion.div>
            ) : (
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
                  onNavigateToForm={handleNavigateToAssessmentForm}
                />
              </motion.div>
            )}
          </>
        )}

        {currentPage === "search" && (
          <SearchPage onBack={handleBackToDashboard} />
        )}

        {currentPage === "report" && (
          <ReportPage onBack={handleBackToDashboard} />
        )}

        {currentPage === "admin" && (
          adminSubPage === "workflow-config" ? (
            <WorkflowConfigPage onBack={() => setAdminSubPage(null)} />
          ) : (
            <AdminPage onBack={handleBackToDashboard} setSubPage={setAdminSubPage} />
          )
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
        <ActionsProvider>
          <AppContent />
        </ActionsProvider>
      </ValidationErrorsProvider>
    </AIProvider>
  );
}

import React, { useState } from "react";
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
import { useIsMobile } from "./components/ui/use-mobile";
import { cn } from "./components/ui/utils";
import { LocationId } from "./components/dashboard/LocationSelector";
import { AIProvider, useAI } from "./context/AIContext";

function AppContent() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isChatOpen, setChatOpen } = useAI();

  // Navigation State
  type PageType = "dashboard" | "qualification" | "create-request" | "view-request" | "coming-soon";
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [isAIAutofilled, setIsAIAutofilled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Location State
  const [currentLocation, setCurrentLocation] = useState<LocationId>("rayong");
  const [isSwitchingLocation, setIsSwitchingLocation] = useState(false);

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
    setCurrentPage("qualification");
  };

  const handleViewRequest = (id: string) => {
    setCurrentViewId(id);
    setCurrentPage("view-request");
  };

  const handleQualificationQualified = () => {
    setCurrentPage("create-request");
  };

  const handleQualificationNotQualified = () => {
    setCurrentPage("dashboard");
  };

  const handleBackToDashboard = () => {
    setCurrentPage("dashboard");
    setCurrentViewId(null);
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
          currentStep={1} 
          isReadOnly={currentPage === "view-request"}
        />
      )}

      {/* Chat Panel */}
      <div className="relative z-50">
        <ChatPanel 
          isOpen={isChatOpen} 
          onClose={() => setChatOpen(false)}
          onCommand={handleAICommand}
        />
      </div>

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
          // Left margin
          isMobile
            ? "ml-0"
            : showModuleMenu
              ? "ml-[312px]"
              : "ml-[72px]"
        )}
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
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <CreateRequestForm
                onBack={handleBackToDashboard}
                isAIAutofilled={isAIAutofilled}
              />
          </div>
        )}

        {currentPage === "view-request" && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <ViewRequestForm
                id={currentViewId}
                onBack={handleBackToDashboard}
              />
          </div>
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
      <AppContent />
    </AIProvider>
  );
}

import React, { useState } from "react";
import { cn } from "../ui/utils";
import { Check, ChevronDown, ChevronRight, Circle, FileText, AlertCircle, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "../ui/tooltip";
import { useValidationErrors } from "../../context/ValidationErrorsContext";

interface ModuleMenuProps {
  isMobile?: boolean;
  currentStep?: number;
  isReadOnly?: boolean;
  onStepClick?: (step: number) => void;
}

interface SubItem {
  id: string;
  label: string;
  targetId: string;
}

interface MenuItem {
  id: string;
  label: string;
  step: number;
  subItems?: SubItem[];
}

// Mapping of field IDs to user-friendly labels
const FIELD_LABELS: Record<string, string> = {
  mocTitle: 'MOC Title',
  lengthOfChange: 'Length of Change',
  typeOfChange: 'Type of Change',
  priorityId: 'Priority of Change',
  areaId: 'Area',
  unitId: 'Unit',
  detailOfChange: 'Detail of Change',
  reasonForChange: 'Reason for Change',
  scopeOfWork: 'Scope of Work',
  benefitsValue: 'Benefits Value',
  expectedBenefits: 'Expected Benefits',
  costEstimated: 'Cost Estimated',
  estimatedValue: 'Estimated Value',
  riskBeforeChange: 'Risk Assessment (Before)',
  riskAfterChange: 'Risk Assessment (After)',
};

const menuItems: MenuItem[] = [
  {
    id: "1",
    label: "Initiation Request",
    step: 1,
    subItems: [
      { id: "1.1", label: "General Information", targetId: "section-general-info" },
      { id: "1.2", label: "Change Details", targetId: "section-change-details" },
      { id: "1.3", label: "Review of Change", targetId: "section-risk" },
      { id: "1.4", label: "Attachments", targetId: "section-attachments" },
      { id: "1.5", label: "Approval Tasks", targetId: "section-initiation-tasks" },
    ]
  },
  {
    id: "2",
    label: "Review & Approval",
    step: 2,
    subItems: [
      { id: "2.1", label: "General Information", targetId: "section-general-info" },
      { id: "2.2", label: "Approval Tasks", targetId: "section-review-tasks" },
    ]
  },
  {
    id: "3",
    label: "Implementation",
    step: 3,
    subItems: [
      { id: "3.1", label: "General Information", targetId: "section-general-info" },
      { id: "3.2", label: "Implementation Details", targetId: "section-implementation-details" },
      { id: "3.3", label: "Implementation Tasks", targetId: "section-implementation-tasks" },
    ]
  },
  {
    id: "4",
    label: "Closeout",
    step: 4,
    subItems: [
      { id: "4.1", label: "General Information", targetId: "section-general-info" },
      { id: "4.2", label: "Closeout Status", targetId: "section-closeout-status" },
      { id: "4.3", label: "Closeout Tasks", targetId: "section-closeout-tasks" },
    ]
  },
];

export const ModuleMenu = ({ isMobile, currentStep = 1, isReadOnly = false, onStepClick }: ModuleMenuProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["1"]);
  const [activeSection, setActiveSection] = useState<string>("1.1");
  const { errors, getSectionErrorCount, getSectionErrors } = useValidationErrors();

  if (isMobile) return null;

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const scrollToSection = (targetId: string, subId: string) => {
    setActiveSection(subId);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleScrollToField = (fieldId: string) => {
    // Find element by ID or data-field attribute
    const element = document.getElementById(`field-${fieldId}`) ||
      document.querySelector(`[data-field="${fieldId}"]`);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add red pulse animation to input element
      const inputElement = element.querySelector('input, select, textarea, [role="combobox"]');
      if (inputElement) {
        inputElement.classList.add('animate-pulse-red-border');
        setTimeout(() => {
          inputElement.classList.remove('animate-pulse-red-border');
        }, 2000);
      }
    }
  };

  const getStepStatus = (step: number): "completed" | "active" | "pending" => {
    if (isReadOnly) {
      // In view mode: all steps accessible, highlight current
      return step === currentStep ? "active" : "completed";
    }
    // In create mode: normal progression
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  return (
    <aside className="fixed left-[72px] top-16 h-[calc(100vh-64px)] w-[300px] bg-white border-r border-[#E5E7EB] z-10 overflow-y-auto pb-20 overflow-x-hidden pointer-events-auto" style={{ scrollbarGutter: 'stable' }}>
      <div className="p-6">
        <h3 className="text-xs font-semibold text-[#68737D] uppercase tracking-wider mb-6">
          MOC Steps
        </h3>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const status = getStepStatus(item.step);
            const isExpanded = expandedItems.includes(item.id);
            const isActiveStep = status === "active";

            return (
              <div key={item.id} className="mb-2">
                <button
                  onClick={() => {
                    if (isActiveStep) {
                      toggleExpand(item.id);
                    } else if (isReadOnly && status !== "pending") {
                      if (item.subItems) {
                        toggleExpand(item.id);
                      } else if (onStepClick) {
                        onStepClick(item.step);
                      }
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left relative",
                    status === "active"
                      ? "bg-[#EBF5FF] border-2 border-[#006699]"
                      : status === "completed"
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "hover:bg-gray-50 cursor-default opacity-60",
                    isReadOnly && status !== "pending" && !isActiveStep && "cursor-pointer",
                    // Disable steps 2-4 in create mode
                    !isReadOnly && item.step > 1 && "opacity-40 cursor-not-allowed pointer-events-none"
                  )}
                  disabled={(!isReadOnly && item.step > 1) || (!isReadOnly && status === "pending")}
                >
                  {/* Status Icon */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all",
                      status === "completed" && "bg-[#228F67] text-white",
                      status === "active" && "bg-[#006699] text-white font-semibold",
                      status === "pending" && "bg-[#E5E7EB] text-[#9CA3AF]"
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <span className="text-sm font-semibold">{item.step}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={cn(
                        "text-[14px] font-medium transition-colors block truncate",
                        status === "active" && "text-[#1C1C1E] font-semibold",
                        status === "completed" && "text-[#68737D]",
                        status === "pending" && "text-[#9CA3AF]"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>

                  {/* Expand Icon */}
                  {item.subItems && (isActiveStep || (isReadOnly && status !== "pending")) && (
                    <div className={cn(isActiveStep ? "text-[#006699]" : "text-gray-400")}>
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  )}
                </button>

                {/* Sub Items (Accordion) */}
                {item.subItems && isExpanded && (
                  <div className="ml-[22px] pl-4 border-l-2 border-[#EBF5FF] mt-2 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((sub) => {
                      const errorCount = getSectionErrorCount(sub.targetId);
                      const sectionErrors = getSectionErrors(sub.targetId);

                      return (
                        <div key={sub.id}>
                          <button
                            type="button"
                            onClick={() => scrollToSection(sub.targetId, sub.id)}
                            className={cn(
                              "w-full text-left py-1.5 px-2 rounded-md text-[13px] transition-colors flex items-center gap-2",
                              activeSection === sub.id
                                ? "text-[#006699] font-semibold bg-[#F0F9FF]"
                                : "text-[#68737D] hover:text-[#1C1C1E] hover:bg-gray-50"
                            )}
                          >
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              activeSection === sub.id ? "bg-[#006699]" : "bg-gray-300"
                            )} />
                            <span className="flex-1">{sub.label}</span>
                            {errorCount > 0 && (
                              <span
                                className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full shrink-0"
                                style={{ background: 'red' }}
                              >
                                {errorCount}
                              </span>
                            )}
                          </button>

                          {/* Error Items - Always Visible */}
                          {errorCount > 0 && (
                            <div className="pl-3 border-l-2 border-red-200 space-y-0" style={{ marginLeft: "28px", marginTop: "5px" }}>
                              {Object.entries(sectionErrors).map(([fieldId, errorMessage]) => (
                                <TooltipProvider key={fieldId}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => handleScrollToField(fieldId)}
                                        className="w-full text-left py-0.5 px-2 rounded text-[11px] transition-colors flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="w-2 h-2 text-red-500 shrink-0 flex-shrink-0" />
                                        <span className="truncate">
                                          {FIELD_LABELS[fieldId] || fieldId}
                                        </span>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="bottom"
                                      className="max-w-xs text-xs z-50 py-2 px-3"
                                      style={{
                                        backgroundColor: '#1e293b',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                                      }}
                                    >
                                      <div className="space-y-2">
                                        <p style={{ fontWeight: '600', color: '#ffffff' }}>{FIELD_LABELS[fieldId] || fieldId}</p>
                                        <p style={{ color: '#f1f5f9' }}>{errorMessage}</p>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

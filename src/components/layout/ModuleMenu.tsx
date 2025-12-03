import React, { useState } from "react";
import { cn } from "../ui/utils";
import { Check, ChevronDown, ChevronRight, Circle, FileText } from "lucide-react";

interface ModuleMenuProps {
  isMobile?: boolean;
  currentStep?: number;
  isReadOnly?: boolean;
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

const menuItems: MenuItem[] = [
  { 
    id: "1", 
    label: "Initiation Request", 
    step: 1,
    subItems: [
      { id: "1.1", label: "Basic Information", targetId: "section-basic-info" },
      { id: "1.2", label: "Background & Impact", targetId: "section-background" },
      { id: "1.3", label: "Loss & Benefit Analysis", targetId: "section-analysis" },
      { id: "1.4", label: "Additional Details", targetId: "section-additional" },
      { id: "1.5", label: "Risk Assessment", targetId: "section-risk" },
      { id: "1.6", label: "File Attachments", targetId: "section-files" },
    ]
  },
  { id: "2", label: "Review & Approval", step: 2 },
  { id: "3", label: "Implementation", step: 3 },
  { id: "4", label: "Closeout", step: 4 },
];

export const ModuleMenu = ({ isMobile, currentStep = 1, isReadOnly = false }: ModuleMenuProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(["1"]);
  const [activeSection, setActiveSection] = useState<string>("1.1");

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

  const getStepStatus = (step: number): "completed" | "active" | "pending" => {
    if (isReadOnly) return step === 1 ? "active" : "pending"; // View mode: Show structure
    if (step < currentStep) return "completed";
    if (step === currentStep) return "active";
    return "pending";
  };

  return (
    <aside className="fixed left-[72px] top-16 h-[calc(100vh-64px)] w-[240px] bg-white border-r border-[#E5E7EB] z-10 overflow-y-auto pb-20">
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
                  onClick={() => isActiveStep && toggleExpand(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left relative",
                    status === "active"
                      ? "bg-[#EBF5FF] border-2 border-[#006699]"
                      : status === "completed"
                      ? "hover:bg-gray-50"
                      : "hover:bg-gray-50 cursor-default opacity-60"
                  )}
                  disabled={status === "pending"}
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
                  {item.subItems && isActiveStep && (
                    <div className="text-[#006699]">
                       {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  )}
                </button>

                {/* Sub Items (Accordion) */}
                {item.subItems && isExpanded && isActiveStep && (
                  <div className="ml-[22px] pl-4 border-l-2 border-[#EBF5FF] mt-2 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => scrollToSection(sub.targetId, sub.id)}
                        className={cn(
                          "w-full text-left py-2 px-3 rounded-md text-[13px] transition-colors flex items-center gap-2",
                          activeSection === sub.id
                            ? "text-[#006699] font-semibold bg-[#F0F9FF]"
                            : "text-[#68737D] hover:text-[#1C1C1E] hover:bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          activeSection === sub.id ? "bg-[#006699]" : "bg-gray-300"
                        )} />
                        {sub.label}
                      </button>
                    ))}
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

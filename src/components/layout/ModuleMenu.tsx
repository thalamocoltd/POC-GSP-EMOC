import React from "react";
import { cn } from "../ui/utils";
import { Check } from "lucide-react";

interface ModuleMenuProps {
  isMobile?: boolean;
  currentStep?: number;
  isReadOnly?: boolean;
  onStepClick?: (step: number) => void;
}

interface MenuItem {
  id: string;
  label: string;
  step: number;
}

const menuItems: MenuItem[] = [
  {
    id: "0",
    label: "MOC Prescreening",
    step: 0,
  },
  {
    id: "1",
    label: "Initiation",
    step: 1,
  },
  {
    id: "2",
    label: "Review",
    step: 2,
  },
  {
    id: "3",
    label: "Implementation",
    step: 3,
  },
  {
    id: "4",
    label: "Closeout",
    step: 4,
  },
];

export const ModuleMenu = ({ isMobile, currentStep = 1, isReadOnly = false, onStepClick }: ModuleMenuProps) => {
  if (isMobile) return null;

  const getStepStatus = (step: number): "completed" | "active" | "pending" => {
    if (isReadOnly) {
      // In view mode: all steps accessible, highlight current
      return step === currentStep ? "active" : "completed";
    }
    // In create mode: step 0 is completed, then normal progression
    if (step === 0) return "completed";
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
            const isActiveStep = status === "active";

            return (
              <div key={item.id} className="mb-2">
                <button
                  onClick={() => {
                    // Allow navigation in view mode for completed/active steps
                    if (isReadOnly && status !== "pending") {
                      if (onStepClick) {
                        onStepClick(item.step);
                      }
                    }
                    // Allow navigation in create mode for step 0 (MOC Prescreening)
                    if (!isReadOnly && item.step === 0) {
                      if (onStepClick) {
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
                    !isReadOnly && item.step === 0 && "cursor-pointer hover:bg-gray-50",
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

                </button>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

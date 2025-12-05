"use client";

import React from "react";
import { cn } from "../ui/utils";
import { Check, Zap, UserCog, Clock, Users, XCircle, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { useActions } from "../../context/ActionsContext";

interface ModuleMenuProps {
  isMobile?: boolean;
  currentStep?: number;
  maxReachedStep?: number;
  isReadOnly?: boolean;
  onStepClick?: (step: number) => void;
  onChangeMOCChampion?: () => void;
  onExtendTemporary?: () => void;
  onChangeTeam?: () => void;
  onCancelMOC?: () => void;
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

export const ModuleMenu = ({ isMobile, currentStep = 1, maxReachedStep = 0, isReadOnly = false, onStepClick, onChangeMOCChampion, onExtendTemporary, onChangeTeam, onCancelMOC }: ModuleMenuProps) => {
  if (isMobile) return null;

  // Use context for dialog state management
  const { setActiveDialog, setProcessingMessages } = useActions();

  const getStepStatus = (step: number): "completed" | "active" | "pending" => {
    if (isReadOnly) {
      // In view mode: allow steps at or below current
      if (step === currentStep) return "active";
      if (step < currentStep) return "completed";
      return "pending";
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
                    // In view mode: allow steps at or below current; In create mode: allow step 0 or steps <= maxReachedStep
                    const canClickStep = isReadOnly ? (item.step <= currentStep) : (item.step <= maxReachedStep || item.step === 0);
                    if (canClickStep && onStepClick) {
                      onStepClick(item.step);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left relative",
                    status === "active"
                      ? "bg-[#EBF5FF] border-2 border-[#006699]"
                      : (isReadOnly ? (item.step <= currentStep) : (item.step <= maxReachedStep || item.step === 0))
                        ? "hover:bg-gray-50 cursor-pointer"
                        : "opacity-40 cursor-not-allowed"
                  )}
                  disabled={isReadOnly ? (item.step > currentStep) : (item.step > maxReachedStep && item.step !== 0)}
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

        {/* Actions Section - Only show in view mode (isReadOnly) */}
        {isReadOnly && (
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <Collapsible defaultOpen={true}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-semibold text-[#68737D] uppercase tracking-wider">
                    Actions
                  </h3>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1 h-6 w-6 hover:bg-gray-100">
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 data-[state=closed]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-2 mt-3">
                {/* Change MOC Champion */}
                <button
                  type="button"
                  onClick={() => setActiveDialog('changeMOCChampion')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg
                             bg-amber-50 border border-amber-200 hover:border-amber-300 hover:bg-amber-100
                             text-amber-900 transition-colors"
                >
                  <UserCog className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium text-xs">Change Champion</span>
                </button>

                {/* Extend Temporary */}
                <button
                  type="button"
                  onClick={() => setActiveDialog('extendTemporary')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg
                             bg-blue-50 border border-blue-200 hover:border-blue-300 hover:bg-blue-100
                             text-blue-900 transition-colors"
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium text-xs">Extend Temporary</span>
                </button>

                {/* Change Team */}
                <button
                  type="button"
                  onClick={() => setActiveDialog('changeTeam')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg
                             bg-purple-50 border border-purple-200 hover:border-purple-300 hover:bg-purple-100
                             text-purple-900 transition-colors"
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium text-xs">Change Team</span>
                </button>

                {/* Cancel MOC */}
                <button
                  type="button"
                  onClick={() => setActiveDialog('cancelMOC')}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg
                             bg-red-50 border border-red-200 hover:border-red-300 hover:bg-red-100
                             text-red-900 transition-colors"
                >
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate font-medium text-xs">Cancel MOC</span>
                </button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </aside>
  );
};

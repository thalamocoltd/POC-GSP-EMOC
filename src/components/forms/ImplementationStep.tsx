import React from "react";
import { StepLayout } from "./StepLayout";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { InitiationFormData } from "../../types/emoc";
import { Label } from "../ui/label";
import { Wrench, Calendar, CheckSquare } from "lucide-react";

interface ImplementationStepProps {
  data: InitiationFormData | null;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const ImplementationStep = ({
  data,
  onPrevious,
  onNext,
  onBack
}: ImplementationStepProps) => {
  return (
    <StepLayout
      title="Implementation"
      subtitle="Step 3 of 4 - MOC Implementation & Execution"
      stepNumber={3}
      onBack={onBack}
      onPrevious={onPrevious}
      onNext={onNext}
      nextLabel="Proceed to Closeout"
    >
      {/* General Information Section */}
      <GeneralInfoSection data={data} />

      {/* Implementation Details Section */}
      <section className="space-y-6">
        <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#006699]" />
          Implementation Details
        </h3>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#1C1C1E] mb-2">
                Implementation in Progress
              </h4>
              <p className="text-sm text-[#68737D] mb-4">
                The approved change is now being implemented according to the defined scope
                of work. All safety protocols and procedures are being followed.
              </p>

              {/* Mock Implementation Timeline */}
              <div className="space-y-3 mt-4">
                <Label className="text-[13px] font-medium text-[#68737D]">
                  Implementation Tasks
                </Label>
                <div className="space-y-2">
                  {[
                    {
                      task: "Pre-implementation safety briefing",
                      status: "Completed",
                      date: "Dec 1, 2025"
                    },
                    {
                      task: "Equipment shutdown and isolation",
                      status: "Completed",
                      date: "Dec 2, 2025"
                    },
                    {
                      task: "Physical modifications and installation",
                      status: "In Progress",
                      date: "Dec 3-5, 2025"
                    },
                    {
                      task: "Testing and commissioning",
                      status: "Pending",
                      date: "Dec 6, 2025"
                    },
                    {
                      task: "Documentation and handover",
                      status: "Pending",
                      date: "Dec 7, 2025"
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          item.status === "Completed"
                            ? "bg-green-500"
                            : item.status === "In Progress"
                            ? "bg-blue-500 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1C1C1E]">
                          {item.task}
                        </p>
                        <p className="text-xs text-[#68737D] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {item.date}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          item.status === "Completed"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : item.status === "In Progress"
                            ? "bg-blue-100 text-blue-700 border border-blue-300"
                            : "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Message */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-[#68737D]">
          <strong>Demo Mode:</strong> This is a mockup of the Implementation step. In a
          production environment, this would show actual implementation tasks, progress
          tracking, and field updates.
        </p>
      </div>
    </StepLayout>
  );
};

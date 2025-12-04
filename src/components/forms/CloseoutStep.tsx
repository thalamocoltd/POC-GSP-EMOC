import React from "react";
import { StepLayout } from "./StepLayout";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { InitiationFormData } from "../../types/emoc";
import { Label } from "../ui/label";
import { CheckCircle, FileCheck, Award } from "lucide-react";

interface CloseoutStepProps {
  data: InitiationFormData | null;
  onPrevious: () => void;
  onBack: () => void;
}

export const CloseoutStep = ({
  data,
  onPrevious,
  onBack
}: CloseoutStepProps) => {
  return (
    <StepLayout
      title="Closeout"
      subtitle="Step 4 of 4 - MOC Completion & Documentation"
      stepNumber={4}
      onBack={onBack}
      onPrevious={onPrevious}
      onNext={undefined} // No next button on final step
      showNavigation={true}
    >
      {/* General Information Section */}
      <GeneralInfoSection data={data} />

      {/* Closeout Status Section */}
      <section className="space-y-6">
        <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#006699]" />
          Closeout Status
        </h3>

        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#1C1C1E] mb-2">
                MOC Successfully Closed
              </h4>
              <p className="text-sm text-[#68737D] mb-4">
                This Management of Change has been successfully implemented and all closeout
                activities have been completed. All documentation has been archived and the
                change is now part of standard operations.
              </p>

              {/* Closeout Checklist */}
              <div className="space-y-3 mt-4">
                <Label className="text-[13px] font-medium text-[#68737D]">
                  Closeout Checklist
                </Label>
                <div className="space-y-2">
                  {[
                    "Post-implementation review completed",
                    "As-built drawings updated",
                    "Operating procedures revised",
                    "Training materials updated",
                    "Lessons learned documented",
                    "Change management database updated"
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-sm text-[#1C1C1E]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-[#006699]">14</div>
                  <div className="text-xs text-[#68737D] mt-1">Days to Complete</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-[#68737D] mt-1">Tasks Completed</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-xs text-[#68737D] mt-1">Safety Incidents</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Message */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-sm text-[#68737D]">
          <strong>Demo Mode:</strong> This is a mockup of the Closeout step. In a production
          environment, this would show actual closeout documentation, final reports, and
          archive status.
        </p>
      </div>
    </StepLayout>
  );
};

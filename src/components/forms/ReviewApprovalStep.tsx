import React from "react";
import { StepLayout } from "./StepLayout";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { InitiationFormData } from "../../types/emoc";
import { Label } from "../ui/label";
import { CheckCircle2, Clock, User } from "lucide-react";

interface ReviewApprovalStepProps {
  data: InitiationFormData | null;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const ReviewApprovalStep = ({
  data,
  onPrevious,
  onNext,
  onBack
}: ReviewApprovalStepProps) => {
  return (
    <StepLayout
      title="Review & Approval"
      subtitle="Step 2 of 4 - MOC Request Review Process"
      stepNumber={2}
      onBack={onBack}
      onPrevious={onPrevious}
      onNext={onNext}
      nextLabel="Proceed to Implementation"
    >
      {/* General Information Section */}
      <GeneralInfoSection data={data} />

      {/* Review Status Section */}
      <section className="space-y-6">
        <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#006699]" />
          Review Status
        </h3>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-[#1C1C1E] mb-2">
                Awaiting Review
              </h4>
              <p className="text-sm text-[#68737D] mb-4">
                This MOC request is currently pending review by the designated approvers.
                The review process typically takes 2-5 business days.
              </p>

              {/* Mock Reviewers */}
              <div className="space-y-3">
                <Label className="text-[13px] font-medium text-[#68737D]">
                  Assigned Reviewers
                </Label>
                <div className="space-y-2">
                  {[
                    {
                      name: "Sarah Johnson",
                      role: "Technical Manager",
                      status: "Pending"
                    },
                    {
                      name: "Michael Chen",
                      role: "Safety Officer",
                      status: "Pending"
                    },
                    {
                      name: "David Williams",
                      role: "Operations Lead",
                      status: "Pending"
                    }
                  ].map((reviewer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#1C1C1E]">
                          {reviewer.name}
                        </p>
                        <p className="text-xs text-[#68737D]">{reviewer.role}</p>
                      </div>
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                        {reviewer.status}
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
          <strong>Demo Mode:</strong> This is a mockup of the Review & Approval step.
          In a production environment, this would show actual review workflows, comments,
          and approval status.
        </p>
      </div>
    </StepLayout>
  );
};

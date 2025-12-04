import React from "react";
import { StepLayout } from "./StepLayout";
import { GeneralInfoSection } from "./GeneralInfoSection";
import { InitiationFormData } from "../../types/emoc";
import { TaskCardList } from "../workflow/TaskCardList";
import { REVIEW_TASKS } from "../../lib/workflow-demo-data";

interface ReviewTasksStepProps {
  data: InitiationFormData | null;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const ReviewTasksStep = ({
  data,
  onPrevious,
  onNext,
  onBack
}: ReviewTasksStepProps) => {
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

      {/* Review Tasks Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-[#1C1C1E] mb-2">Review Tasks</h3>
          <p className="text-sm text-[#68737D]">
            Review and approval tasks assigned to the relevant stakeholders
          </p>
        </div>

        <TaskCardList tasks={REVIEW_TASKS} stage="readonly" />
      </div>
    </StepLayout>
  );
};

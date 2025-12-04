import React from "react";
import { ClipboardCheck } from "lucide-react";

interface TaskSectionProps {
  title: string;
  description?: string;
  sectionId: string;
  children: React.ReactNode;
}

export const TaskSection = ({
  title,
  description,
  sectionId,
  children,
}: TaskSectionProps) => {
  return (
    <section
      id={sectionId}
      className="mt-12 pt-12 border-t border-[#E5E7EB] scroll-mt-24"
    >
      <div className="mb-6 flex items-start gap-3">
        <ClipboardCheck className="w-6 h-6 text-[#006699] flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-[#1C1C1E] mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-[#68737D]">{description}</p>
          )}
        </div>
      </div>

      <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-8">
        {children}
      </div>
    </section>
  );
};

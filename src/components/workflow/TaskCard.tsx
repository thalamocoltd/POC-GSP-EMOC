import React from "react";
import { Task, TaskCardStage } from "../../types/workflow";
import { cn } from "../ui/utils";
import { CheckCircle2, Clock, AlertCircle, User, Paperclip, Upload, Check, X, Save, RotateCcw } from "lucide-react";

interface TaskCardProps {
  task: Task;
  stage: TaskCardStage;
  itemNumber?: number;
}

export const TaskCard = ({ task, stage, itemNumber }: TaskCardProps) => {
  const isEditable = stage === "editable";
  const isReadOnly = stage === "readonly";
  const isDisabled = stage === "disabled";

  const getStatusBadge = () => {
    switch (task.status) {
      case "In Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
            <Clock className="w-3.5 h-3.5" />
            Not Started
          </span>
        );
    }
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden transition-all duration-200",
      isDisabled ? "bg-gray-50/50 opacity-60 border-gray-200" : "bg-white shadow-sm hover:shadow-md border-gray-200",
    )}>
      {/* HEADER */}
      <div className={cn(
        "px-6 py-5 border-b",
        isDisabled && "bg-gray-50",
        task.status === "In Progress" && !isDisabled && "bg-blue-50",
        task.status === "Completed" && !isDisabled && "bg-green-50",
        task.status === "Rejected" && !isDisabled && "bg-red-50",
        task.status === "Not Started" && !isDisabled && "bg-white"
      )}>
        {/* Item Number + Title Row */}
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <div className="flex items-baseline gap-2 flex-1 min-w-0">
            {itemNumber && (
              <span className="text-xs font-bold text-[#68737D] flex-shrink-0">
                Item {itemNumber}:
              </span>
            )}
            <h4 className="text-base font-semibold text-[#1C1C1E] break-words">{task.taskName}</h4>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center gap-2 text-xs text-[#68737D] flex-wrap">
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium">{task.assignedTo}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="font-medium">{task.role}</span>
          {!isDisabled && task.assignedOn && (
            <>
              <span className="text-gray-400">•</span>
              <span>Assigned {task.assignedOn}</span>
            </>
          )}
          {isReadOnly && task.completedOn && (
            <>
              <span className="text-gray-400">•</span>
              <span>Completed {task.completedOn}</span>
            </>
          )}
          {isDisabled && (
            <>
              <span className="text-gray-400">•</span>
              <span className="italic">Pending previous approval</span>
            </>
          )}
        </div>
      </div>

      {/* BODY */}
      {!isDisabled && (
        <div className="px-6 py-5 space-y-5 bg-white">
          {/* Comments */}
          <div>
            <label className="text-xs font-semibold text-[#1C1C1E] uppercase tracking-wide block mb-2">Comments {isEditable && <span className="text-red-500">*</span>}</label>
            {isEditable ? (
              <textarea
                className="w-full px-3 py-2.5 border border-[#D4D9DE] rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent bg-white transition-colors placeholder-gray-400"
                rows={4}
                value={task.comments}
                placeholder="Enter your approval decision and any comments..."
              />
            ) : (
              <div className="px-3 py-2.5 bg-[#F9FAFB] rounded-md border border-[#E5E7EB]">
                <p className="text-sm text-[#1C1C1E] whitespace-pre-wrap leading-relaxed">{task.comments || "No comments provided"}</p>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="text-xs font-semibold text-[#1C1C1E] uppercase tracking-wide block mb-2">Attachments</label>
            {isEditable ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-gradient-to-r from-[#1d3654] to-[#006699] text-white hover:brightness-110 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload File {task.attachments.length > 0 && <span className="ml-1">({task.attachments.length})</span>}
              </button>
            ) : (
              <div className="space-y-1.5">
                {task.attachments.length > 0 ? (
                  task.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="flex items-center gap-2 text-sm text-[#006699] hover:text-[#1d3654] font-medium hover:underline transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
                      {file}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-[#68737D] italic">No attachments</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER - Action Buttons */}
      {isEditable && task.actions.length > 0 && (
        <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center gap-3 flex-wrap">
          {task.actions.map((action) => {
            let classes = "bg-gray-600 hover:bg-gray-700 text-white";
            let icon = null;

            if (action === "Approve") {
              classes = "bg-green-600 hover:bg-green-700 text-white";
              icon = <Check className="w-4 h-4" />;
            } else if (action === "Reject") {
              classes = "bg-red-600 hover:bg-red-700 text-white";
              icon = <X className="w-4 h-4" />;
            } else if (action === "Save Draft") {
              classes = "bg-blue-600 hover:bg-blue-700 text-white";
              icon = <Save className="w-4 h-4" />;
            } else if (action === "Discard") {
              classes = "bg-gray-600 hover:bg-gray-700 text-white";
              icon = <RotateCcw className="w-4 h-4" />;
            }

            return (
              <button
                key={action}
                type="button"
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-md transition-colors shadow-sm",
                  classes
                )}
              >
                {icon}
                {action}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** @jsxImportSource react */
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
      <div
        className={cn(
          "border-b",
          isDisabled && "bg-gray-50",
          task.status === "In Progress" && !isDisabled && "bg-blue-50",
          task.status === "Completed" && !isDisabled && "bg-green-50",
          task.status === "Rejected" && !isDisabled && "bg-red-50",
          task.status === "Not Started" && !isDisabled && "bg-white"
        )}
        style={{ padding: "20px 24px" }}
      >
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
        <div className="space-y-4 bg-white" style={{ padding: "20px 24px" }}>
          {/* Comments */}
          <div>
            <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">Comments {isEditable && <span className="text-red-500">*</span>}</label>
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
            <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">Attachments</label>
            {isEditable ? (
              <div className="space-y-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-semibold rounded-md bg-gradient-to-r from-[#1d3654] to-[#006699] text-white hover:brightness-110 transition-all shadow-sm"
                  style={{ padding: "10px 16px" }}
                >
                  <Upload className="w-4 h-4" />
                  Upload File {task.attachments.length > 0 && <span className="ml-1">({task.attachments.length})</span>}
                </button>
                {task.attachments.length > 0 && (
                  <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                    {task.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 hover:bg-[#F7F8FA] transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Paperclip className="w-4 h-4 text-[#68737D] flex-shrink-0" />
                          <p className="text-sm text-[#1C1C1E] truncate">{file}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                {task.attachments.length > 0 ? (
                  <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                    {task.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 hover:bg-[#F7F8FA] transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-[#68737D] flex-shrink-0" />
                        <p className="text-sm text-[#1C1C1E] truncate">{file}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#D4D9DE] rounded-lg p-4 text-center">
                    <Paperclip className="w-5 h-5 text-[#A0ADB8] mx-auto mb-2" />
                    <p className="text-sm text-[#68737D]">No attachments</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER - Action Buttons */}
      {isEditable && task.actions.length > 0 && (
        <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center gap-2" style={{ padding: "16px 24px" }}>
          {task.actions.map((action) => {
            let buttonStyle = { backgroundColor: "#4B5563", color: "white" };
            let icon = null;

            if (action === "Approve") {
              buttonStyle.backgroundColor = "#16a34a";
              icon = <Check className="w-4 h-4" />;
            } else if (action === "Reject") {
              buttonStyle.backgroundColor = "#dc2626";
              icon = <X className="w-4 h-4" />;
            } else if (action === "Save Draft") {
              buttonStyle.backgroundColor = "#2563eb";
              icon = <Save className="w-4 h-4" />;
            } else if (action === "Discard") {
              buttonStyle.backgroundColor = "#4B5563";
              icon = <RotateCcw className="w-4 h-4" />;
            }

            return (
              <button
                key={action}
                type="button"
                className="inline-flex items-center justify-center gap-2.5 text-sm font-semibold rounded-md text-white transition-colors shadow-sm hover:brightness-110"
                style={{ ...buttonStyle, padding: "10px 18px" }}
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

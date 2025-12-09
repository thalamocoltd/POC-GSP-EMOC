/** @jsxImportSource react */
import React from "react";
import { Task, TaskCardStage } from "../../types/workflow";
import { cn } from "../ui/utils";
import { CheckCircle2, Clock, AlertCircle, User, Paperclip, Upload, Check, X, Save, RotateCcw } from "lucide-react";

interface TaskCardProps {
  task: Task;
  stage: TaskCardStage;
  itemNumber?: number;
  onClick?: (task: Task, formType?: string) => void;
}

export const TaskCard = ({ task, stage, itemNumber, onClick }: TaskCardProps) => {
  const isEditable = stage === "editable";
  const isReadOnly = stage === "readonly";
  const isDisabled = stage === "disabled";
  const isClickable = onClick !== undefined && !isDisabled;

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
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all duration-200",
        isDisabled ? "bg-gray-50/50 opacity-60 border-gray-200" : "bg-white shadow-sm hover:shadow-md border-gray-200",
        isClickable && !task.subTasks && "cursor-pointer hover:border-[#006699] hover:shadow-lg"
      )}
      onClick={isClickable && !task.subTasks ? () => onClick(task) : undefined}
    >
      {/* HEADER */}
      <div
        className={cn(
          "border-b border-gray-200",
          isDisabled && "bg-gray-50",
          task.status === "In Progress" && !isDisabled && "bg-blue-50/30",
          task.status === "Completed" && !isDisabled && "bg-green-50/30",
          task.status === "Rejected" && !isDisabled && "bg-red-50/30",
          task.status === "Not Started" && !isDisabled && "bg-gray-50/30"
        )}
        style={{ padding: "20px 24px" }}
      >
        {/* Title and Status Row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <h4 className="text-base font-semibold text-[#1C1C1E] break-words flex-1">
            {itemNumber ? `Item ${itemNumber}: ${task.taskName}` : task.taskName}
          </h4>
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>

        {/* Assigned To Info - Same style as title */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <User className="w-4 h-4 text-[#68737D] flex-shrink-0" />
            <span className="text-base font-semibold text-[#1C1C1E]">{task.assignedTo}</span>
            <span className="text-gray-300 select-none">•</span>
            <span className="text-sm text-[#9CA3AF]">{task.role}</span>
            {isDisabled && (
              <>
                <span className="text-gray-300 select-none">•</span>
                <span className="text-base font-semibold italic text-[#8B95A1]">Pending previous approval</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isDisabled && task.assignedOn && (
              <span className="text-sm text-[#68737D]">Assigned {task.assignedOn}</span>
            )}
            {isReadOnly && task.completedOn && (
              <span className="text-sm font-semibold text-green-600">Completed {task.completedOn}</span>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      {!isDisabled && (
        <div className="space-y-4 bg-white" style={{ padding: "20px 24px" }}>
          {/* SubTasks - Clickable Form Links */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div>
              <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">Status</label>
              <div className="space-y-2">
                {task.subTasks.map((subTask) => (
                  <div key={subTask.id} className="flex items-center justify-between py-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onClick) {
                          onClick(task, subTask.formType);
                        }
                      }}
                      className="text-sm text-[#006699] hover:text-[#004d7a] hover:underline font-medium transition-colors text-left"
                    >
                      {subTask.label}
                    </button>
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded",
                      subTask.status === "Completed" && "text-green-700 bg-green-50",
                      subTask.status === "Not Started" && "text-gray-600 bg-gray-100",
                      subTask.status === "In Progress" && "text-blue-700 bg-blue-50"
                    )}>
                      {subTask.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          {!task.subTasks && (
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
          )}

          {/* Attachments */}
          {!task.subTasks && (
            <div>
              <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">Attachments</label>
              {isEditable ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm font-semibold rounded-md bg-gradient-to-r from-[#1d3654] to-[#006699] text-white hover:brightness-110 transition-all duration-200 shadow-sm"
                    style={{ padding: "10px 18px" }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
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
          )}
        </div>
      )}

      {/* FOOTER - Action Buttons */}
      {isEditable && task.actions.length > 0 && (
        <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] flex items-center gap-3" style={{ padding: "16px 24px" }}>
          {task.actions.map((action) => {
            if (action === "Approve") {
              return (
                <button
                  key={action}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm cursor-pointer"
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(to right, #059669, #10b981)",
                    border: "none"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                >
                  <Check className="w-4 h-4" />
                  {action}
                </button>
              );
            } else if (action === "Reject") {
              return (
                <button
                  key={action}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm cursor-pointer"
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(to right, #dc2626, #ef4444)",
                    border: "none"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                >
                  <X className="w-4 h-4" />
                  {action}
                </button>
              );
            } else if (action === "Save Draft") {
              return (
                <button
                  key={action}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm cursor-pointer"
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(to right, #1d3654, #006699)",
                    border: "none"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                >
                  <Save className="w-4 h-4" />
                  {action}
                </button>
              );
            } else if (action === "Discard") {
              return (
                <button
                  key={action}
                  type="button"
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm cursor-pointer"
                  style={{
                    padding: "10px 18px",
                    background: "linear-gradient(to right, #6b7280, #9ca3af)",
                    border: "none"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.filter = "brightness(1)"}
                >
                  <RotateCcw className="w-4 h-4" />
                  {action}
                </button>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
};

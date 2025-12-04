import React from "react";
import { Task, TaskCardStage } from "../../types/workflow";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";

interface TaskCardProps {
  task: Task;
  stage: TaskCardStage;
}

export const TaskCard = ({ task, stage }: TaskCardProps) => {
  const isEditable = stage === "editable";
  const isReadOnly = stage === "readonly";
  const isDisabled = stage === "disabled";

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      isDisabled ? "bg-gray-50 opacity-60" : "bg-white shadow-sm hover:shadow-md transition-shadow"
    )}>
      {/* HEADER - 2 LINES */}
      <div className="p-4 border-b bg-gray-50/30">
        {/* Line 1: Task Name, Role, Dates, Status */}
        <div className="flex items-start gap-3 text-sm mb-2">
          <span className="font-semibold flex-1 text-gray-900">{task.taskName}</span>
          <span className="text-gray-600 whitespace-nowrap text-xs">{task.role}</span>
          {!isDisabled && task.assignedOn && (
            <span className="text-gray-500 text-xs whitespace-nowrap">Assigned: {task.assignedOn}</span>
          )}
          {isReadOnly && task.completedOn && (
            <span className="text-gray-500 text-xs whitespace-nowrap">Completed: {task.completedOn}</span>
          )}
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            task.status === "In Progress" && "bg-blue-100 text-blue-700",
            task.status === "Completed" && "bg-green-100 text-green-700",
            task.status === "Rejected" && "bg-red-100 text-red-700",
            task.status === "Not Started" && "bg-gray-100 text-gray-600"
          )}>
            {task.status}
          </span>
        </div>

        {/* Line 2: Assigned To */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Assigned To:</span> {task.assignedTo}
        </div>
      </div>

      {/* BODY - Hidden for disabled */}
      {!isDisabled && (
        <div className="p-4 space-y-4 border-b">
          {/* Comments */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Comments</label>
            {isEditable ? (
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                rows={3}
                value={task.comments}
                placeholder="Enter your comments..."
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg min-h-[60px]">
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.comments || "No comments"}</p>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Attachments</label>
            {isEditable ? (
              <div className="flex items-center gap-2">
                <button className="text-sm text-blue-600 hover:underline font-medium">
                  📎 Upload File
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {task.attachments.length > 0 ? (
                  task.attachments.map((file, idx) => (
                    <a key={idx} href="#" className="text-sm text-blue-600 hover:underline flex items-center gap-2 font-medium">
                      📎 {file}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No attachments</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER - Only for editable */}
      {isEditable && task.actions.length > 0 && (
        <div className="p-4 flex gap-2 flex-wrap">
          {task.actions.map((action) => (
            <Button
              key={action}
              className={cn(
                "text-sm font-medium",
                action === "Approve" && "bg-green-600 text-white hover:bg-green-700",
                action === "Reject" && "bg-red-600 text-white hover:bg-red-700",
                action === "Save Draft" && "bg-blue-600 text-white hover:bg-blue-700",
                action === "Discard" && "bg-gray-200 text-gray-700 hover:bg-gray-300"
              )}
            >
              {action}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

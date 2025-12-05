import React from "react";
import {
  Clock,
  Paperclip,
  Upload,
  Save,
  RotateCcw,
  Circle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { PerformTechReviewCardProps } from "../../../types/task-cards";

export const PerformTechReviewCard = ({
  itemNumber,
  taskName,
  role,
  assignedTo,
  assignedOn,
  status,
  documents,
  comments,
  attachments,
  onDocumentClick,
  onCommentsChange,
  onSubmit,
  onSaveDraft,
  onDiscard,
}: PerformTechReviewCardProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Not Started":
        return <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />;
      case "In Progress":
        return (
          <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-pulse" />
        );
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition-all duration-200">
      {/* HEADER */}
      <div className="border-b border-gray-200 bg-blue-50/30 p-6">
        {/* Title and Status Row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <h4 className="text-base font-semibold text-[#006699] break-words flex-1">
            Item {itemNumber}: {taskName}
          </h4>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
              <Clock className="w-3.5 h-3.5" />
              In Progress
            </span>
          </div>
        </div>

        {/* Assigned To Info */}
        <div className="flex items-center gap-2 flex-wrap text-sm">
          <span className="text-base font-semibold text-[#1C1C1E]">
            {assignedTo}
          </span>
          <span className="text-gray-400 select-none">•</span>
          <span className="text-base font-semibold text-[#1C1C1E]">{role}</span>
          <span className="text-gray-400 select-none">•</span>
          <span className="text-base font-semibold text-[#1C1C1E]">
            Assigned On {assignedOn}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="space-y-4 bg-white p-6">
        {/* Documents Section */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block">
            Documents to Review
          </label>

          <div className="space-y-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onDocumentClick(doc.id)}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-300 transition-all group text-left"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">{getStatusIcon(doc.status)}</div>

                {/* Document Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#006699] group-hover:underline truncate">
                    {doc.name}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {doc.status === "Not Started" && (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-300 whitespace-nowrap">
                      Not Started
                    </span>
                  )}
                  {doc.status === "In Progress" && (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300 whitespace-nowrap">
                      In Progress
                    </span>
                  )}
                  {doc.status === "Completed" && (
                    <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-300 whitespace-nowrap">
                      Completed
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">
            Comments
          </label>
          <textarea
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent bg-white transition-colors placeholder-gray-400"
            rows={4}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder="Enter any comments..."
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">
            Attachments
          </label>
          <div className="space-y-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md bg-gradient-to-r from-[#1d3654] to-[#006699] text-white hover:brightness-110 transition-all duration-200 shadow-sm px-4 py-2.5"
            >
              <Upload className="w-4 h-4" />
              Upload file
            </button>
            {attachments.length > 0 && (
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <p className="text-sm text-[#1C1C1E] truncate">{file}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER - Action Buttons */}
      <div className="bg-gray-50 border-t border-gray-200 flex items-center gap-3 p-4 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm px-4 py-2.5"
          style={{
            background: "linear-gradient(to right, #1d3654, #006699)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          onClick={onSubmit}
        >
          <Upload className="w-4 h-4" />
          Submit
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm px-4 py-2.5"
          style={{
            background: "linear-gradient(to right, #1d3654, #006699)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          onClick={onSaveDraft}
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm px-4 py-2.5"
          style={{
            background: "linear-gradient(to right, #6b7280, #9ca3af)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          onClick={onDiscard}
        >
          <RotateCcw className="w-4 h-4" />
          Discard
        </button>
      </div>
    </div>
  );
};

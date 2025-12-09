import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Paperclip,
  Upload,
  Save,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { AssignTechReviewTeamCardProps } from "../../../types/task-cards";
import { PeoplePicker } from "../../ui/people-picker";
import { Checkbox } from "../../ui/checkbox";
import { cn } from "../../ui/utils";

export const AssignTechReviewTeamCard = ({
  itemNumber,
  taskName,
  role,
  assignedTo,
  assignedOn,
  status,
  disciplines,
  availableTeamMembers,
  comments,
  attachments,
  onDisciplineChange,
  onNotApplicableChange,
  onCommentsChange,
  onSubmit,
  onSaveDraft,
  onDiscard,
}: AssignTechReviewTeamCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
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
      case "Not Started":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
            <Clock className="w-3.5 h-3.5" />
            Not Started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-300">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden shadow-sm transition-all duration-200",
      status === "Completed"
        ? "border-green-200 bg-green-50/50 hover:shadow-md"
        : "border-gray-200 bg-white hover:shadow-md"
    )}>
      {/* HEADER */}
      <div className={cn(
        "border-b p-6 cursor-pointer transition-colors",
        status === "Completed"
          ? "border-green-200 bg-green-50 hover:bg-green-100/50"
          : "border-gray-200 bg-blue-50/30 hover:bg-blue-100/30"
      )}
      onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {/* Title and Status Row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <h4 className="text-base font-semibold text-[#006699] break-words flex-1">
            Item {itemNumber}: {taskName}
          </h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge()}
            <ChevronDown className={cn("w-5 h-5 text-gray-600 transition-transform", isCollapsed ? "-rotate-90" : "")} />
          </div>
        </div>

        {/* Assigned To Info with Date on Right */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-semibold text-[#1C1C1E]">
              {assignedTo}
            </span>
            <span className="text-gray-400 select-none hidden">•</span>
            <span className="text-sm text-gray-500 hidden">{role}</span>
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            Assigned On {assignedOn}
          </span>
        </div>
      </div>

      {/* BODY - Only show if not "Not Started" */}
      {status !== "Not Started" && !isCollapsed && (
        <div className={cn(
          "space-y-4 p-6 bg-white"
        )}>
        {/* Technical Review Team Table */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block">
            Please specify Technical Review Team
          </label>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-48">
                    Discipline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 flex-1">
                    Team Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider text-center w-32">
                    Not Applicable
                  </th>
                </tr>
              </thead>
              <tbody>
                {disciplines.map((discipline, idx) => (
                  <tr
                    key={discipline.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Discipline Name */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <p className="text-sm font-medium text-[#1C1C1E]">
                        {discipline.name}
                      </p>
                    </td>

                    {/* People Picker */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <PeoplePicker
                        value={discipline.teamMember}
                        onChange={(personId) =>
                          onDisciplineChange(discipline.id, personId)
                        }
                        options={availableTeamMembers}
                        placeholder="Select a team member"
                        disabled={discipline.notApplicable}
                        className="mb-0"
                      />
                    </td>

                    {/* Not Applicable Checkbox */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Checkbox
                          checked={discipline.notApplicable}
                          onCheckedChange={(checked) =>
                            onNotApplicableChange(discipline.id, checked as boolean)
                          }
                          className="w-5 h-5"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-2.5">
            Comments
          </label>
          <textarea
            className={cn(
              "w-full px-3 py-2.5 border rounded-md text-sm resize-none transition-colors placeholder-gray-400",
              status === "In Progress"
                ? "border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                : "border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed opacity-75"
            )}
            rows={4}
            value={comments}
            onChange={(e) => onCommentsChange(e.target.value)}
            placeholder="Enter any comments..."
            disabled={status !== "In Progress"}
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
              className={cn(
                "inline-flex items-center gap-2 text-sm font-semibold rounded-md transition-all duration-200 shadow-sm px-4 py-2.5",
                status === "In Progress"
                  ? "bg-gradient-to-r from-[#1d3654] to-[#006699] text-white hover:brightness-110"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed opacity-75"
              )}
              disabled={status !== "In Progress"}
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
      )}

      {/* FOOTER - Action Buttons - Only show if "In Progress" */}
      {status === "In Progress" && !isCollapsed && (
        <div className="bg-gray-50 border-t border-gray-200 flex items-center gap-3 p-4 flex-wrap">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm px-4 py-2.5 cursor-pointer"
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
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm px-4 py-2.5 cursor-pointer"
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
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md text-white transition-all duration-200 shadow-sm px-4 py-2.5 cursor-pointer"
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
      )}
    </div>
  );
};

import React from "react";
import {
  Clock,
  Paperclip,
  Upload,
  Save,
  RotateCcw,
} from "lucide-react";
import { AssignTechReviewTeamCardProps } from "../../../types/task-cards";
import { PeoplePicker } from "../../ui/people-picker";
import { Checkbox } from "../../ui/checkbox";

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
        {/* Disciplines List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block mb-4">
            Please specify Technical Review Team
          </label>

          {disciplines.map((discipline) => (
            <div
              key={discipline.id}
              className="flex items-end gap-4 p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              {/* Discipline Name */}
              <div className="flex-none w-48">
                <p className="text-sm font-medium text-[#1C1C1E]">
                  {discipline.name}
                </p>
              </div>

              {/* People Picker */}
              <div className="flex-1 min-w-0">
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
              </div>

              {/* Not Applicable Checkbox */}
              <div className="flex-none flex items-center gap-2">
                <Checkbox
                  checked={discipline.notApplicable}
                  onCheckedChange={(checked) =>
                    onNotApplicableChange(discipline.id, checked as boolean)
                  }
                  className="w-5 h-5"
                />
                <label className="text-xs font-medium text-[#68737D] cursor-pointer select-none">
                  Not Applicable
                </label>
              </div>
            </div>
          ))}
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

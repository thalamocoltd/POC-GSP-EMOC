import React from "react";
import {
  Clock,
  Paperclip,
  Upload,
  Check,
  X,
} from "lucide-react";
import { ApproveTechReviewTeamCardProps } from "../../../types/task-cards";
import { PeoplePicker } from "../../ui/people-picker";

export const ApproveTechReviewTeamCard = ({
  itemNumber,
  taskName,
  role,
  assignedTo,
  assignedOn,
  status,
  approvalRows,
  availableTeamMembers,
  comments,
  attachments,
  onTeamMemberChange,
  onStatusChange,
  onRemarkChange,
  onCommentsChange,
}: ApproveTechReviewTeamCardProps) => {
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
        {/* Technical Review Team Table */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider block">
            Technical Review Team Approvals
          </label>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-40">
                    Discipline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-48">
                    TA Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-40">
                    Direct Manager
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-48">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {approvalRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    {/* Discipline Name */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <p className="text-sm font-medium text-[#1C1C1E]">
                        {row.discipline}
                      </p>
                    </td>

                    {/* TA Team (Editable People Picker) */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={row.taTeam}
                          readOnly
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                        />
                      </div>
                    </td>

                    {/* Direct Manager */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <p className="text-sm text-[#1C1C1E]">
                        {row.directManager}
                      </p>
                    </td>

                    {/* Status Buttons */}
                    <td className="px-4 py-3 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            row.status === "Approved"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-green-50"
                          }`}
                          onClick={() =>
                            onStatusChange(row.id, "Approved")
                          }
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Approved
                        </button>
                        <button
                          type="button"
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            row.status === "Rejected"
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-red-50"
                          }`}
                          onClick={() =>
                            onStatusChange(row.id, "Rejected")
                          }
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Rejected
                        </button>
                      </div>
                    </td>

                    {/* Remark */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.remark}
                        onChange={(e) =>
                          onRemarkChange(row.id, e.target.value)
                        }
                        placeholder="Please provide remark for reject"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                      />
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

      {/* NO FOOTER BUTTONS - As per specification */}
    </div>
  );
};

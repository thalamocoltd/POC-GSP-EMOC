import React from "react";
import { SeverityDescription, ProbabilityDescription } from "../../types/emoc";

export const SeverityDescriptionTable = ({
  data
}: {
  data: SeverityDescription[]
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-[#E5E7EB]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Severity Level</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">People</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Assets</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Environment/Community</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Security</th>
          </tr>
        </thead>
        <tbody>
          {data.map((desc, idx) => (
            <tr key={desc.level} className={idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}>
              <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E] border-r border-[#E5E7EB]">
                {desc.level}
              </td>
              <td className="px-4 py-3 text-sm text-[#68737D]">{desc.people}</td>
              <td className="px-4 py-3 text-sm text-[#68737D]">{desc.assets}</td>
              <td className="px-4 py-3 text-sm text-[#68737D]">{desc.environmentCommunity}</td>
              <td className="px-4 py-3 text-sm text-[#68737D]">{desc.security}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ProbabilityDescriptionTable = ({
  data
}: {
  data: ProbabilityDescription[]
}) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-[#E5E7EB]">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F7F8FA] border-b border-[#E5E7EB]">
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Level</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Label</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-[#1C1C1E]">Description</th>
          </tr>
        </thead>
        <tbody>
          {data.map((desc, idx) => (
            <tr key={desc.level} className={idx % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"}>
              <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E] border-r border-[#E5E7EB]">
                {desc.level}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E] border-r border-[#E5E7EB]">
                {desc.label}
              </td>
              <td className="px-4 py-3 text-sm text-[#68737D]">{desc.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import { FormTemplate } from "../../types/workflow-config";
import {
  getTypeOfChangeColor,
  getLengthOfChangeColor,
} from "../../lib/workflow-config-data";

interface FormTemplateListProps {
  templates: FormTemplate[];
  onEdit: (templateId: string) => void;
}

export const FormTemplateList = ({
  templates,
  onEdit,
}: FormTemplateListProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Workflow Form Templates
        </h2>
        <p className="text-sm text-gray-600">
          Select a form template to configure its workflow
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                  No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Form Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">
                  Type of Change
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                  Length of Change
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template, index) => (
                <tr
                  key={template.id}
                  className={cn(
                    "group transition-colors hover:bg-blue-50/50",
                    index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700">
                      {template.formNo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 block truncate">
                      {template.formName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        "shadow-none font-medium rounded-full px-3",
                        getTypeOfChangeColor(template.typeOfChange)
                      )}
                    >
                      {template.typeOfChange}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      className={cn(
                        "shadow-none font-medium rounded-full px-3",
                        getLengthOfChangeColor(template.lengthOfChange)
                      )}
                    >
                      {template.lengthOfChange}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(template.id)}
                      className="h-8"
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

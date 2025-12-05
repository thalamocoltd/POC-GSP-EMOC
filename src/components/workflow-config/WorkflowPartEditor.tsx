import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { FormTemplate, WorkflowPart } from "../../types/workflow-config";
import { PartDetailEditor } from "./PartDetailEditor";

interface WorkflowPartEditorProps {
  template: FormTemplate;
  onSave: (parts: WorkflowPart[]) => void;
  onDiscard: () => void;
  onEditPart: (partId: string) => void;
}

export const WorkflowPartEditor = ({
  template,
  onSave,
  onDiscard,
  onEditPart,
}: WorkflowPartEditorProps) => {
  const [localParts, setLocalParts] = useState<WorkflowPart[]>(template.parts);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  const editingPart = editingPartId
    ? localParts.find((p) => p.id === editingPartId)
    : null;

  const handleEditPart = (partId: string) => {
    setEditingPartId(partId);
  };

  const handleSavePart = (partId: string, items: any[]) => {
    setLocalParts(
      localParts.map((p) =>
        p.id === partId ? { ...p, items } : p
      )
    );
    setEditingPartId(null);
  };

  const handleCancelEdit = () => {
    setEditingPartId(null);
  };

  const handleSave = () => {
    onSave(localParts);
  };

  // Show PartDetailEditor if editing
  if (editingPart) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleCancelEdit}
            className="p-0 h-auto"
          >
            ← Back
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">
            Part {editingPart.partNo}: {editingPart.partName}
          </h2>
        </div>
        <PartDetailEditor
          part={editingPart}
          allParts={localParts}
          onSave={(items) => handleSavePart(editingPart.id, items)}
          onCancel={handleCancelEdit}
          onEditItem={() => { }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display-Only Fields */}
      <div className="p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wide">
              Type of Change
            </Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {template.typeOfChange}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wide">
              Length of Change
            </Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {template.lengthOfChange}
            </div>
          </div>
        </div>
      </div>

      {/* Parts Table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Workflow Parts
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                    Part No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Part Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {localParts.map((part, index) => (
                  <tr
                    key={part.id}
                    className={cn(
                      "group transition-colors hover:bg-blue-50/50",
                      index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">
                        {part.partNo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {part.partName}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPart(part.id)}
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

      {/* Page Buttons */}
      <div className="border-t pt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onDiscard}>
          Discard
        </Button>
        <Button
          className="bg-gradient-to-r from-[#1d3654] to-[#006699]"
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

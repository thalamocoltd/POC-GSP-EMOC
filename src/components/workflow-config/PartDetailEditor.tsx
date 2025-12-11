import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Plus } from "lucide-react";
import { cn } from "../ui/utils";
import { WorkflowPart, WorkflowItem } from "../../types/workflow-config";
import { generateId } from "../../lib/workflow-config-data";
import { ItemDetailEditor } from "./ItemDetailEditor";

interface PartDetailEditorProps {
  part: WorkflowPart;
  allParts: WorkflowPart[];
  onSave: (items: WorkflowItem[]) => void;
  onCancel: () => void;
  onEditItem: (itemId: string) => void;
}

export const PartDetailEditor = ({
  part,
  allParts,
  onSave,
  onCancel,
  onEditItem,
}: PartDetailEditorProps) => {
  const [localItems, setLocalItems] = useState<WorkflowItem[]>(part.items);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const editingItem = editingItemId
    ? localItems.find((i) => i.id === editingItemId)
    : null;

  const handleAddItem = () => {
    const newItem: WorkflowItem = {
      id: generateId("item"),
      itemNo: localItems.length + 1,
      title: "",
      description: "",
      itemTemplate: "Approve",
      role: "",
      attachments: [],
      actions: [],
      partId: part.id,
    };
    setLocalItems([...localItems, newItem]);
    setEditingItemId(newItem.id);
  };

  const handleEditItem = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleSaveItem = (item: WorkflowItem) => {
    setLocalItems(
      localItems.map((i) => (i.id === item.id ? item : i))
    );
    setEditingItemId(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setLocalItems(localItems.filter((i) => i.id !== itemId));
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleSave = () => {
    onSave(localItems);
  };

  // Show ItemDetailEditor if editing
  if (editingItem) {
    return (
      <ItemDetailEditor
        item={editingItem}
        partNo={part.partNo}
        partName={part.partName}
        allParts={allParts}
        onSave={handleSaveItem}
        onCancel={handleCancelEdit}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Display-Only Fields */}
      <div className="p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wide">
              Part No
            </Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {part.partNo}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wide">
              Part Name
            </Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {part.partName}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Part Items</h3>
          <Button variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {localItems.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                      Item No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                      Item Template
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {localItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "group transition-colors hover:bg-blue-50/50",
                        index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">
                          {item.itemNo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 font-medium block truncate max-w-xs">
                          {item.title || <span className="text-gray-400">Untitled</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="shadow-none font-medium bg-blue-100 text-blue-700 rounded-full px-3">
                          {item.itemTemplate}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 block truncate max-w-xs">
                          {item.role || <span className="text-gray-400">Not assigned</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item.id)}
                            className="h-8"
                          >
                            Edit
                          </Button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            <p className="mb-4">No items in this part yet</p>
            <Button variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        )}
      </div>

      {/* Page Buttons */}
      <div className="border-t pt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="bg-gradient-to-r from-[#1d3654] to-[#006699]"
          onClick={handleSave}
        >
          OK
        </Button>
      </div>
    </div>
  );
};

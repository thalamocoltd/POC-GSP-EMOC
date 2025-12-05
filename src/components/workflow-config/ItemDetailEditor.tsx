import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { X, Plus } from "lucide-react";
import { cn } from "../ui/utils";
import {
  WorkflowItem,
  WorkflowAction,
  WorkflowAttachment,
  ItemTemplateType,
} from "../../types/workflow-config";
import {
  ROLE_OPTIONS,
  ITEM_TEMPLATE_OPTIONS,
  ACTION_DISPLAY_OPTIONS,
  generateId,
} from "../../lib/workflow-config-data";

interface ItemDetailEditorProps {
  item: WorkflowItem;
  partNo: number;
  partName: string;
  allParts: Array<{ partNo: number; partName: string; items: WorkflowItem[] }>;
  onSave: (item: WorkflowItem) => void;
  onCancel: () => void;
}

export const ItemDetailEditor = ({
  item,
  partNo,
  partName,
  allParts,
  onSave,
  onCancel,
}: ItemDetailEditorProps) => {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    itemTemplate: item.itemTemplate,
    role: item.role,
  });

  const [attachments, setAttachments] = useState<WorkflowAttachment[]>(
    item.attachments
  );
  const [actions, setActions] = useState<WorkflowAction[]>(item.actions);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.itemTemplate) {
      newErrors.itemTemplate = "Item template is required";
    }
    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    // Validate attachments
    attachments.forEach((att, idx) => {
      if (!att.name.trim()) {
        newErrors[`attachment-${idx}-name`] = "Name required";
      }
      if (!att.templateUrl.trim()) {
        newErrors[`attachment-${idx}-url`] = "URL required";
      }
    });

    // Validate actions
    actions.forEach((act, idx) => {
      if (!act.label.trim()) {
        newErrors[`action-${idx}-label`] = "Label required";
      }
      if (!act.nextStep) {
        newErrors[`action-${idx}-next`] = "Next step required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const updatedItem: WorkflowItem = {
      ...item,
      title: formData.title,
      description: formData.description,
      itemTemplate: formData.itemTemplate,
      role: formData.role,
      attachments,
      actions,
    };

    onSave(updatedItem);
  };

  // Attachment handlers
  const addAttachment = () => {
    setAttachments([
      ...attachments,
      {
        id: generateId("attachment"),
        name: "",
        templateUrl: "",
        required: false,
      },
    ]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const updateAttachment = (
    id: string,
    field: keyof WorkflowAttachment,
    value: any
  ) => {
    setAttachments(
      attachments.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // Action handlers
  const addAction = () => {
    setActions([
      ...actions,
      {
        id: generateId("action"),
        display: "Approve",
        label: "",
        nextStep: "",
      },
    ]);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter((a) => a.id !== id));
  };

  const updateAction = (
    id: string,
    field: keyof WorkflowAction,
    value: any
  ) => {
    setActions(
      actions.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  // Get next step options
  const getNextStepOptions = () => {
    const options: { value: string; label: string }[] = [
      { value: "current", label: "Current Step" },
      { value: "next-item", label: "Next Item" },
      { value: "previous-item", label: "Previous Item" },
      { value: "next-part", label: "Next Part" },
      { value: "end", label: "End Workflow" },
    ];

    // Add specific items from current part
    const currentPart = allParts.find((p) => p.partNo === partNo);
    if (currentPart && currentPart.items.length > 0) {
      options.push({ value: "divider", label: "--- Items in this part ---" });
      currentPart.items.forEach((itm) => {
        if (itm.id !== item.id) {
          options.push({
            value: itm.id,
            label: `Item ${itm.itemNo}: ${itm.title}`,
          });
        }
      });
    }

    return options;
  };

  return (
    <div className="space-y-6">
      {/* Display-Only Fields */}
      <div className=" p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wide">
              Part No
            </Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {partNo}
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500 uppercase tracking-wide">
              Item No
            </Label>
            <div className="text-sm font-semibold text-gray-900 mt-1">
              {item.itemNo}
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-4">
        {/* Title */}
        <div>
          <Label className="text-[13px] font-medium text-[#1C1C1E]">
            Title <span className="text-[#D93F4C]">*</span>
          </Label>
          <Input
            className={cn(
              "h-11 mt-2 bg-gray-50 transition-all duration-500",
              errors.title
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-[#D4D9DE]"
            )}
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) {
                setErrors({ ...errors, title: "" });
              }
            }}
            placeholder="Enter item title"
          />
          {errors.title && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.title}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <Label className="text-[13px] font-medium text-[#1C1C1E]">
            Description
          </Label>
          <Textarea
            className="h-24 mt-2 bg-gray-50 border-[#D4D9DE]"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter item description"
          />
        </div>

        {/* Item Template */}
        <div>
          <Label className="text-[13px] font-medium text-[#1C1C1E]">
            Item Template <span className="text-[#D93F4C]">*</span>
          </Label>
          <Select
            value={formData.itemTemplate}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                itemTemplate: value as ItemTemplateType,
              })
            }
          >
            <SelectTrigger className="h-11 mt-2 bg-gray-50 border-[#D4D9DE]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ITEM_TEMPLATE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.itemTemplate && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.itemTemplate}
            </span>
          )}
        </div>

        {/* Role */}
        <div>
          <Label className="text-[13px] font-medium text-[#1C1C1E]">
            Role <span className="text-[#D93F4C]">*</span>
          </Label>
          <Select value={formData.role} onValueChange={(value) => {
            setFormData({ ...formData, role: value });
            if (errors.role) {
              setErrors({ ...errors, role: "" });
            }
          }}>
            <SelectTrigger className="h-11 mt-2 bg-gray-50 border-[#D4D9DE]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.role}
            </span>
          )}
        </div>
      </div>

      {/* Attachments Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Attachments</h3>
          <Button variant="outline" size="sm" onClick={addAttachment}>
            <Plus className="w-4 h-4 mr-2" />
            Add Attachment
          </Button>
        </div>

        {attachments.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Attachment Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Template URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-24">
                    Required
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attachments.map((att, idx) => (
                  <tr key={att.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Input
                        className="h-9 text-sm border-gray-200"
                        value={att.name}
                        onChange={(e) =>
                          updateAttachment(att.id, "name", e.target.value)
                        }
                        placeholder="Name"
                      />
                      {errors[`attachment-${idx}-name`] && (
                        <span className="text-xs text-red-500">
                          {errors[`attachment-${idx}-name`]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="h-9 text-sm border-gray-200"
                        value={att.templateUrl}
                        onChange={(e) =>
                          updateAttachment(att.id, "templateUrl", e.target.value)
                        }
                        placeholder="URL"
                      />
                      {errors[`attachment-${idx}-url`] && (
                        <span className="text-xs text-red-500">
                          {errors[`attachment-${idx}-url`]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={att.required}
                        onCheckedChange={(checked) =>
                          updateAttachment(att.id, "required", checked)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeAttachment(att.id)}
                        className="text-red-600 hover:text-red-700 focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            No attachments yet
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
          <Button variant="outline" size="sm" onClick={addAction}>
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </div>

        {actions.length > 0 ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Next Step
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-12">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {actions.map((act, idx) => (
                  <tr key={act.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Select value={act.display} onValueChange={(value) =>
                        updateAction(act.id, "display", value)
                      }>
                        <SelectTrigger className="h-9 text-sm border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_DISPLAY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        className="h-9 text-sm border-gray-200"
                        value={act.label}
                        onChange={(e) =>
                          updateAction(act.id, "label", e.target.value)
                        }
                        placeholder="Button label"
                      />
                      {errors[`action-${idx}-label`] && (
                        <span className="text-xs text-red-500">
                          {errors[`action-${idx}-label`]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={act.nextStep} onValueChange={(value) =>
                        updateAction(act.id, "nextStep", value)
                      }>
                        <SelectTrigger className="h-9 text-sm border-gray-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getNextStepOptions().map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              disabled={option.value === "divider"}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`action-${idx}-next`] && (
                        <span className="text-xs text-red-500">
                          {errors[`action-${idx}-next`]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeAction(act.id)}
                        className="text-red-600 hover:text-red-700 focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
            No actions yet
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

import React, { useState } from "react";
import { Button } from "../ui/button";
import { FormTemplateList } from "../workflow-config/FormTemplateList";
import { WorkflowPartEditor } from "../workflow-config/WorkflowPartEditor";
import { PartDetailEditor } from "../workflow-config/PartDetailEditor";
import { FormTemplate, WorkflowPart } from "../../types/workflow-config";
import { INITIAL_WORKFLOW_DATA } from "../../lib/workflow-config-data";

type SubPage = "list" | "parts" | "items" | null;

interface WorkflowConfigPageProps {
  onBack: () => void;
}

export const WorkflowConfigPage = ({ onBack }: WorkflowConfigPageProps) => {
  // Navigation state
  const [subPage, setSubPage] = useState<SubPage>("list");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);

  // Data state
  const [workflowData, setWorkflowData] = useState(INITIAL_WORKFLOW_DATA);

  // Get current data based on selection
  const selectedTemplate = selectedTemplateId
    ? workflowData.templates.find((t) => t.id === selectedTemplateId)
    : null;

  const selectedPart = selectedPartId
    ? workflowData.templates
        .flatMap((t) => t.parts)
        .find((p) => p.id === selectedPartId)
    : null;

  // Navigation handlers
  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setSubPage("parts");
  };

  const handleEditPart = (partId: string) => {
    setSelectedPartId(partId);
    setSubPage("items");
  };

  const handleBackToTemplateList = () => {
    setSubPage("list");
    setSelectedTemplateId(null);
    setSelectedPartId(null);
  };

  const handleBackToPartEditor = () => {
    setSubPage("parts");
    setSelectedPartId(null);
  };

  // Data update handlers
  const handleSaveParts = (templateId: string, parts: WorkflowPart[]) => {
    setWorkflowData((prev) => ({
      ...prev,
      templates: prev.templates.map((t) =>
        t.id === templateId ? { ...t, parts } : t
      ),
    }));
    handleBackToTemplateList();
  };

  const handleSaveItems = (partId: string, items: any[]) => {
    setWorkflowData((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => ({
        ...t,
        parts: t.parts.map((p) =>
          p.id === partId ? { ...p, items } : p
        ),
      })),
    }));
    handleBackToPartEditor();
  };

  const handleDiscardParts = () => {
    handleBackToTemplateList();
  };

  const handleCancelItemEdit = () => {
    handleBackToPartEditor();
  };

  // Render page content based on subPage state
  const renderContent = () => {
    if (subPage === "list") {
      return (
        <FormTemplateList
          templates={workflowData.templates}
          onEdit={handleEditTemplate}
        />
      );
    }

    if (subPage === "parts" && selectedTemplate) {
      return (
        <WorkflowPartEditor
          template={selectedTemplate}
          onSave={(parts) => handleSaveParts(selectedTemplate.id, parts)}
          onDiscard={handleDiscardParts}
          onEditPart={handleEditPart}
        />
      );
    }

    if (subPage === "items" && selectedPart && selectedTemplate) {
      return (
        <PartDetailEditor
          part={selectedPart}
          allParts={selectedTemplate.parts}
          onSave={(items) => handleSaveItems(selectedPart.id, items)}
          onCancel={handleCancelItemEdit}
          onEditItem={() => {}}
        />
      );
    }

    return null;
  };

  // Get page title
  const getPageTitle = (): string => {
    if (subPage === "parts" && selectedTemplate) {
      return `${selectedTemplate.formName}`;
    }
    if (subPage === "items" && selectedPart) {
      return `Part ${selectedPart.partNo}: ${selectedPart.partName}`;
    }
    return "Workflow Configuration";
  };

  // Show back button for non-list pages
  const showBackButton = subPage !== "list";

  return (
    <div className="pt-20 max-w-7xl mx-auto animate-in fade-in duration-500 px-6">
      <div className="mb-6 flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={showBackButton ? (subPage === "items" ? handleBackToPartEditor : handleBackToTemplateList) : onBack}
          className="p-0 h-auto"
        >
          ← Back
        </Button>
        <h1 className="text-2xl font-bold text-[#1d3654]">
          {getPageTitle()}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

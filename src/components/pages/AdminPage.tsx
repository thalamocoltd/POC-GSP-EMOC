
import React, { useState } from "react";
import { AdminMenuSection } from "../admin/AdminMenuSection";
import { WorkflowConfigPage } from "../admin/WorkflowConfigPage";

// Master data menu items
const masterItems = [
  {
    label: "Workflow Configuration",
    enabled: true,
    key: "workflow-config"
  },
  { label: "Areas & Units", enabled: true, key: "areas-units" },
  { label: "Technical Review Team", enabled: true, key: "technical-review-team" },
  { label: "TPM Loss Type", enabled: true, key: "tpm-loss-type" },
  { label: "Benefits Value Options", enabled: true, key: "benefits-value-options" },
  { label: "Cancellation Categories", enabled: true, key: "cancellation-categories" },
  { label: "Risk Assessment Criteria", enabled: true, key: "risk-assessment-criteria" }
];

const userItems = [
  { label: "User Management", enabled: false },
];
const groupItems = [
  { label: "Group Management", enabled: false },
];


interface AdminPageProps {
  onBack?: () => void;
  setSubPage?: (subPage: string | null) => void;
}

export const AdminPage = ({ onBack, setSubPage }: AdminPageProps) => {
  return (
    <div className="pt-20 animate-in fade-in duration-500 mt-8">
      <h1 className="text-2xl font-bold text-[#1d3654] mb-8">Admin Panel</h1>
      <AdminMenuSection
        title="Master Data"
        items={masterItems.map(item => ({
          ...item,
          onClick: item.enabled && typeof setSubPage === "function" ? () => setSubPage(item.key || "") : undefined
        }))}
      />
      <AdminMenuSection title="User" items={userItems} />
      <AdminMenuSection title="Group" items={groupItems} />
    </div>
  );
};



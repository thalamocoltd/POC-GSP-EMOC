
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
  { label: "Areas & Units", enabled: false },
  { label: "MOC Champions", enabled: false },
  { label: "Type of Change", enabled: false },
  { label: "TPM Loss Type", enabled: false },
  { label: "Priority Options", enabled: false },
  { label: "Benefits Value Options", enabled: false },
  { label: "Cancellation Categories", enabled: false },
  { label: "Length of Change Options", enabled: false },
  { label: "Risk Assessment Criteria", enabled: false }
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
    <div className="pt-20 max-w-2xl mx-auto animate-in fade-in duration-500">
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



import React from "react";
import { ReportKPISection } from "../reports/ReportKPISection";
import { ReportFilters } from "../reports/ReportFilters";
import { ReportCharts } from "../reports/ReportCharts";
import { ReportTable } from "../reports/ReportTable";

interface ReportPageProps {
  onBack: () => void;
}

export const ReportPage = ({ onBack }: ReportPageProps) => {
  return (
    <div className="pt-20 space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1d3654] mb-2">Reports & Dashboard</h1>
        <p className="text-gray-600">Comprehensive MOC analytics and insights</p>
      </div>

      {/* Filters */}
      <ReportFilters />

      {/* KPI Cards */}
      <ReportKPISection />

      {/* Charts */}
      <ReportCharts />

      {/* Detailed Table */}
      <ReportTable />
    </div>
  );
};

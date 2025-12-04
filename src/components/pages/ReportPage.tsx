import React from "react";
import { ArrowLeft, BarChart } from "lucide-react";
import { Button } from "../ui/button";

interface ReportPageProps {
  onBack: () => void;
}

export const ReportPage = ({ onBack }: ReportPageProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1d3654]">Reports & Dashboard</h1>
        <Button
          variant="outline"
          onClick={onBack}
          className="text-[#006699] border-[#006699] hover:bg-[#E6F4FF]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart className="w-8 h-8 text-[#006699]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1d3654] mb-2">Analytics Coming Soon</h2>
        <p className="text-gray-500">
          Comprehensive reports and analytics dashboards will be available here.
        </p>
      </div>
    </div>
  );
};

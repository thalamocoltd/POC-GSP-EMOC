import React from "react";
import { ShieldCheck } from "lucide-react";

interface AdminPageProps {
  onBack?: () => void;
}

export const AdminPage = ({ onBack }: AdminPageProps) => {
  return (
    <div className="pt-20 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-[#1d3654] mb-6">Admin Panel</h1>

      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-[#006699]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1d3654] mb-2">Admin Features Coming Soon</h2>
        <p className="text-gray-500">
          User management, permissions, and system configuration will be available here.
        </p>
      </div>
    </div>
  );
};

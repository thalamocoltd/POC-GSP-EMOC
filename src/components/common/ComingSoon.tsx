import React from "react";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "../ui/button";

interface ComingSoonProps {
  onBack: () => void;
  title?: string;
  message?: string;
}

export const ComingSoon = ({ onBack, title = "Coming Soon", message = "This module is currently under development. Please check back later for updates." }: ComingSoonProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-12 h-12 text-[#006699]" />
      </div>
      <h1 className="text-3xl font-bold text-[#1d3654] mb-2">{title}</h1>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        {message}
      </p>
      <Button
        onClick={onBack}
        className="bg-[#006699] hover:bg-[#005c8a] text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
    </div>
  );
};

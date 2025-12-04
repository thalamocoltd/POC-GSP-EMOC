import React, { useState } from "react";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SearchPageProps {
  onBack: () => void;
}

export const SearchPage = ({ onBack }: SearchPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1d3654]">Search MOC Requests</h1>
        <Button
          variant="outline"
          onClick={onBack}
          className="text-[#006699] border-[#006699] hover:bg-[#E6F4FF]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by MOC number, title, or description..."
            className="pl-10 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-8 text-center text-gray-500">
          <p>Search functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

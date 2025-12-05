import React, { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  XCircle
} from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getStepFromProcess, formatAssignedOnDate } from "../../lib/emoc-utils";
import { MOCK_MOC_REQUESTS, TYPE_OF_CHANGE_OPTIONS, LENGTH_OF_CHANGE_OPTIONS_ALL } from "../../lib/emoc-data";

interface SearchPageProps {
  onBack?: () => void;
}

export interface ToDoItem {
  id: string;
  mocNo: string;
  title: string;
  typeOfChange: string;
  lengthOfChange: string;
  task: string;
  champion: string;
  lastUpdate: string;
  process: "Review" | "Initiation" | "Implementation" | "Closeout";
  status: "In Progress" | "Completed" | "Rejected" | "Pending";
}

// Convert mock data to ToDoItem format with resolved names
const champions = ["John Smith", "Sarah Johnson", "Mike Chen", "Emma Davis", "Robert Brown", "Lisa Anderson"];

const mockSearchResults: ToDoItem[] = MOCK_MOC_REQUESTS.map((req, index) => {
  const typeOfChangeName = TYPE_OF_CHANGE_OPTIONS.find(t => t.id === req.typeOfChange)?.name || req.typeOfChange;
  const lengthOfChangeName = LENGTH_OF_CHANGE_OPTIONS_ALL.find(l => l.id === req.lengthOfChange)?.name || req.lengthOfChange;
  const status = index % 10 === 0 ? "Rejected" : index % 5 === 0 ? "Completed" : index % 3 === 0 ? "Pending" : "In Progress";

  return {
    id: req.id,
    mocNo: req.mocNo,
    title: req.title,
    typeOfChange: typeOfChangeName,
    lengthOfChange: lengthOfChangeName,
    task: req.task,
    champion: champions[index % champions.length],
    lastUpdate: `0${(index % 9) + 1}/12/2024 10:30`,
    process: req.process,
    status: status as "In Progress" | "Completed" | "Rejected" | "Pending"
  };
});

const getTypeOfChangeColor = (typeOfChange: string) => {
  switch (typeOfChange) {
    case "Plant Change (Impact PSI Cat 1,2,3)": return "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-200";
    case "Maintenance Change": return "bg-purple-100 text-purple-700 border-transparent hover:bg-purple-200";
    case "Process Change (No Impact PSI Cat 1,2,3)": return "bg-green-100 text-green-700 border-transparent hover:bg-green-200";
    case "Override": return "bg-red-100 text-red-700 border-transparent hover:bg-red-200";
    default: return "bg-gray-100 text-gray-600 border-transparent";
  }
};

const getLengthOfChangeColor = (lengthOfChange: string) => {
  switch (lengthOfChange) {
    case "Permanent": return "bg-green-100 text-green-700 border-transparent hover:bg-green-200";
    case "Temporary": return "bg-amber-100 text-amber-700 border-transparent hover:bg-amber-200";
    case "More than 3 days": return "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-200";
    case "Less than 3 days": return "bg-yellow-100 text-yellow-700 border-transparent hover:bg-yellow-200";
    default: return "bg-gray-100 text-gray-600 border-transparent";
  }
};

const getProcessColor = (process: string) => {
  switch (process) {
    case "Review": return "bg-blue-100 text-blue-700 border-transparent";
    case "Initiation": return "bg-purple-100 text-purple-700 border-transparent";
    case "Implementation": return "bg-orange-100 text-orange-700 border-transparent";
    case "Closeout": return "bg-green-100 text-green-700 border-transparent";
    default: return "bg-gray-100 text-gray-600 border-transparent";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500" />;
    case "In Progress":
      return <Circle className="w-4 h-4 text-amber-500 fill-amber-500" />;
    case "Rejected":
      return <XCircle className="w-4 h-4 text-red-500 fill-red-500" />;
    case "Pending":
      return <Circle className="w-4 h-4 text-gray-200 fill-gray-100" />;
    default:
      return null;
  }
};

export const SearchPage = ({ onBack }: SearchPageProps) => {
  const [showResults, setShowResults] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [criteriaValues, setCriteriaValues] = useState({
    mocNumber: "",
    mocTitle: "",
    typeOfChange: "all",
    lengthOfChange: "all",
    process: "all",
    assignedTo: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ToDoItem; direction: 'asc' | 'desc' } | null>(null);

  const handleCriteriaChange = (field: string, value: string) => {
    setCriteriaValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setShowResults(true);
  };

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...mockSearchResults];

    if (criteriaValues.mocNumber) {
      data = data.filter(item =>
        item.mocNo.toLowerCase().includes(criteriaValues.mocNumber.toLowerCase())
      );
    }

    if (criteriaValues.mocTitle) {
      data = data.filter(item =>
        item.title.toLowerCase().includes(criteriaValues.mocTitle.toLowerCase())
      );
    }

    if (criteriaValues.typeOfChange !== "all") {
      data = data.filter(item => item.typeOfChange.toLowerCase() === criteriaValues.typeOfChange.toLowerCase());
    }

    if (criteriaValues.lengthOfChange !== "all") {
      data = data.filter(item => item.lengthOfChange.toLowerCase() === criteriaValues.lengthOfChange.toLowerCase());
    }

    if (criteriaValues.process !== "all") {
      data = data.filter(item => item.process.toLowerCase() === criteriaValues.process);
    }

    if (criteriaValues.assignedTo) {
      data = data.filter(item =>
        item.assignedTo.toLowerCase().includes(criteriaValues.assignedTo.toLowerCase())
      );
    }

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [criteriaValues, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key: keyof ToDoItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="pt-20 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold text-[#1d3654] mb-6">Search MOC Requests</h1>

      {/* Search Criteria Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1d3654] mb-4">Search Criteria</h2>

        <div className="space-y-3">
          {/* All in 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">MOC Number</label>
              <Input
                placeholder="Enter MOC number..."
                className="border-gray-200 h-9"
                value={criteriaValues.mocNumber}
                onChange={(e) => handleCriteriaChange("mocNumber", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">MOC Title</label>
              <Input
                placeholder="Enter MOC title..."
                className="border-gray-200 h-9"
                value={criteriaValues.mocTitle}
                onChange={(e) => handleCriteriaChange("mocTitle", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type of Change</label>
              <Select value={criteriaValues.typeOfChange} onValueChange={(value) => handleCriteriaChange("typeOfChange", value)}>
                <SelectTrigger className="border-gray-200 h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Plant Change (Impact PSI Cat 1,2,3)">Plant Change (Impact PSI Cat 1,2,3)</SelectItem>
                  <SelectItem value="Maintenance Change">Maintenance Change</SelectItem>
                  <SelectItem value="Process Change (No Impact PSI Cat 1,2,3)">Process Change (No Impact PSI Cat 1,2,3)</SelectItem>
                  <SelectItem value="Override">Override</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Second Row - 3 Columns */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Length of Change</label>
              <Select value={criteriaValues.lengthOfChange} onValueChange={(value) => handleCriteriaChange("lengthOfChange", value)}>
                <SelectTrigger className="border-gray-200 h-9">
                  <SelectValue placeholder="All Lengths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Lengths</SelectItem>
                  <SelectItem value="Permanent">Permanent</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="More than 3 days">More than 3 days</SelectItem>
                  <SelectItem value="Less than 3 days">Less than 3 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Process/Part</label>
              <Select value={criteriaValues.process} onValueChange={(value) => handleCriteriaChange("process", value)}>
                <SelectTrigger className="border-gray-200 h-9">
                  <SelectValue placeholder="All Parts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parts</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="initiation">Initiation</SelectItem>
                  <SelectItem value="implementation">Implementation</SelectItem>
                  <SelectItem value="closeout">Closeout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned To</label>
              <Input
                placeholder="Enter assigned person..."
                className="border-gray-200 h-9"
                value={criteriaValues.assignedTo}
                onChange={(e) => handleCriteriaChange("assignedTo", e.target.value)}
              />
            </div>
          </div>

          {/* OK Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSearch}
              className="bg-[#006699] hover:bg-[#005c8a] text-white h-9"
            >
              OK
            </Button>
          </div>
        </div>
      </div>

      {/* Search Results Section */}
      {showResults && (
        <div className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1d3654]">Search Results</h2>

          {/* Results Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] border-b border-gray-200">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort('mocNo')}
                    >
                      <div className="flex items-center gap-2">
                        MOC No
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        MOC Title
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type of Change
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Length of Change
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[250px]">
                      Task
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort('champion')}
                    >
                      <div className="flex items-center gap-2">
                        MOC Champion
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort('lastUpdate')}
                    >
                      <div className="flex items-center gap-2">
                        Last Update
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr
                        key={item.id}
                        className={cn(
                          "group transition-colors hover:bg-blue-50/50",
                          index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                        )}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            type="button"
                            className="font-medium text-[#006699] hover:underline cursor-pointer focus:outline-none text-left"
                          >
                            {item.mocNo}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            className="text-sm text-[#006699] font-medium block truncate max-w-[250px] hover:underline cursor-pointer focus:outline-none text-left"
                          >
                            {item.title}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={cn("shadow-none font-medium rounded-full px-3", getTypeOfChangeColor(item.typeOfChange))}>
                            {item.typeOfChange}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={cn("shadow-none font-medium rounded-full px-3", getLengthOfChangeColor(item.lengthOfChange))}>
                            {item.lengthOfChange}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 w-[250px]">
                          <span className="text-sm text-gray-900 font-medium block truncate">
                            {item.task}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{formatAssignedOnDate(item.assignedOn)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={cn("shadow-none font-medium rounded-full px-3", getProcessColor(item.process))}>
                            {item.process}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No results found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {filteredData.length > 0 && (
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="h-8 w-8 text-gray-400 border-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum ? "bg-[#006699] hover:bg-[#005c8a] text-white" : "border-gray-200"}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="h-8 w-8 text-gray-400 border-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import {
  CheckCircle2,
  Circle,
  XCircle,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus
} from "lucide-react";
import { cn } from "../ui/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { getStepFromProcess } from "../../lib/emoc-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// --- Types ---
type ProcessType = "Review" | "Initiation" | "Implementation" | "Closeout";

// Order of processes for the progress tracker
// Updated order based on user feedback: Initiation -> Review -> Implementation -> Closeout
const PROCESS_ORDER: ProcessType[] = ["Initiation", "Review", "Implementation", "Closeout"];

interface MOCRecord {
  id: string;
  mocNo: string;
  title: string;
  typeOfChange: "Plant Change (Impact PSI Cat 1,2,3)" | "Maintenance Change" | "Process Change (No Impact PSI Cat 1,2,3)" | "Override";
  lengthOfChange: "Permanent" | "Temporary" | "More than 3 days" | "Less than 3 days";
  task: string;
  projectEngineer: string;
  lastUpdate: string;
  process: ProcessType;
  status: "In Progress" | "Completed" | "Rejected" | "Pending";
  description?: string;
}

// --- Mock Data Generator ---
const generateMockData = (): MOCRecord[] => {
  const typesOfChange: MOCRecord["typeOfChange"][] = [
    "Plant Change (Impact PSI Cat 1,2,3)",
    "Maintenance Change",
    "Process Change (No Impact PSI Cat 1,2,3)",
    "Override"
  ];
  const standardLengths = ["Permanent", "Temporary"];
  const overrideLengths = ["More than 3 days", "Less than 3 days"];

  const processes: ProcessType[] = ["Review", "Initiation", "Implementation", "Closeout"];
  const projectEngineers = ["John Smith", "Jane Doe", "Mike Ross", "Sarah Chen", "Paul Smith"];
  const tasks = [
    "Asset owner review and approve initiation",
    "Assign Project Manager",
    "Technical Review in Progress",
    "Implementation Planning",
    "Final Safety Assessment",
    "Closeout Verification"
  ];
  const mocTitles = [
    "Safety Interlocks Upgrade - Production Area A",
    "Equipment Preventive Maintenance Program",
    "Process Flow Optimization Initiative",
    "HVAC System Modernization - Utilities",
    "Compliance Documentation Update",
    "Production Efficiency Enhancement",
    "Environmental Control System Retrofit",
    "Quality Assurance Protocol Revision",
    "Emergency Response System Upgrade",
    "Equipment Calibration and Certification",
    "Safety Training Module Implementation",
    "Risk Assessment and Mitigation",
    "Storage Facility Reorganization",
    "Laboratory Equipment Upgrade",
    "Waste Management System Enhancement",
    "Production Line Reconfiguration",
    "Control System Software Update",
    "Safety Barrier Installation",
    "Maintenance Procedure Standardization",
    "Energy Efficiency Improvement Project"
  ];

  return Array.from({ length: 45 }).map((_, i) => {
    const procIndex = Math.floor(Math.random() * 4);
    // Ensure consistent status for demo
    const status = i % 10 === 0 ? "Rejected" : i % 5 === 0 ? "Completed" : "In Progress";

    const typeOfChange = typesOfChange[i % typesOfChange.length];
    const isOverride = typeOfChange === "Override";

    // Select appropriate length based on type
    let lengthOfChange: MOCRecord["lengthOfChange"];
    if (isOverride) {
      lengthOfChange = overrideLengths[i % overrideLengths.length] as MOCRecord["lengthOfChange"];
    } else {
      lengthOfChange = standardLengths[i % standardLengths.length] as MOCRecord["lengthOfChange"];
    }

    return {
      id: `moc-${i}`,
      mocNo: `MOC-2024-${(i + 100).toString()}`,
      title: mocTitles[i % mocTitles.length],
      typeOfChange,
      lengthOfChange,
      task: tasks[i % tasks.length],
      projectEngineer: projectEngineers[i % projectEngineers.length],
      lastUpdate: `${String((i % 9) + 1).padStart(2, '0')}/12/2024 10:30`,
      process: processes[procIndex],
      status: status,
      description: `Current stage: ${processes[procIndex]} - Waiting for approval from ${projectEngineers[i % projectEngineers.length]}`
    };
  });
};

const mockMOCs = generateMockData();

// --- Helpers ---
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

// Helper to get text color for process
const getProcessTextColor = (process: string) => {
  switch (process) {
    case "Review": return "text-blue-600";
    case "Initiation": return "text-purple-600";
    case "Implementation": return "text-orange-600";
    case "Closeout": return "text-green-600";
    default: return "text-gray-600";
  }
};

// Helper to render the 4-part progress icons
const ProgressTracker = ({ process, status }: { process: ProcessType, status: string }) => {
  const currentIndex = PROCESS_ORDER.indexOf(process);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Description on top */}
      <span className={cn("text-xs font-bold uppercase tracking-wider", getProcessTextColor(process))}>
        {process}
      </span>
      
      {/* Progress Icons */}
      <div className="flex items-center gap-2">
        {PROCESS_ORDER.map((step, index) => {
          let colorClass = "text-gray-200 fill-gray-100"; // Default/Pending
          let Icon = Circle; 

          if (index < currentIndex) {
            // Completed steps
            colorClass = "text-green-500 fill-green-500";
            Icon = CheckCircle2;
          } else if (index === currentIndex) {
            // Current step
            if (status === "Rejected") {
              colorClass = "text-red-500 fill-red-500";
               Icon = XCircle;
            } else if (status === "Completed") {
              colorClass = "text-green-500 fill-green-500";
               Icon = CheckCircle2;
            } else {
              colorClass = "text-amber-500 fill-amber-500"; // In Progress
              Icon = Circle; 
            }
          }

          return (
            <div key={step} className="relative group">
               <Icon className={cn("w-4 h-4", colorClass)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface MyMOCTableProps {
  onViewRequest?: (mocNo: string, title: string, step?: number) => void;
}

export const MyMOCTable = ({ onViewRequest }: MyMOCTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof MOCRecord; direction: 'asc' | 'desc' } | null>(null);
  const [filterTypeOfChange, setFilterTypeOfChange] = useState("all");
  const [filterLengthOfChange, setFilterLengthOfChange] = useState("all");
  const [filterPart, setFilterPart] = useState("all");

  // Filter & Sort
  const filteredData = useMemo(() => {
    let data = [...mockMOCs];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.mocNo.toLowerCase().includes(lowerTerm) ||
        item.title.toLowerCase().includes(lowerTerm) ||
        item.projectEngineer.toLowerCase().includes(lowerTerm) ||
        item.task.toLowerCase().includes(lowerTerm)
      );
    }

    if (filterTypeOfChange !== "all") {
      data = data.filter(item => item.typeOfChange.toLowerCase() === filterTypeOfChange.toLowerCase());
    }

    if (filterLengthOfChange !== "all") {
      data = data.filter(item => item.lengthOfChange.toLowerCase() === filterLengthOfChange.toLowerCase());
    }

    if (filterPart !== "all") {
      data = data.filter(item => item.process.toLowerCase() === filterPart.toLowerCase());
    }

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [searchTerm, sortConfig, filterTypeOfChange, filterLengthOfChange, filterPart]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key: keyof MOCRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#1d3654]">Related MOCs</h2>
            <p className="text-sm text-gray-500">Track and manage your MOC requests</p>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
             <div className="flex items-center gap-1.5">
               <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500" />
               <span>Completed</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Circle className="w-4 h-4 text-amber-500 fill-amber-500" />
               <span>In Progress</span>
             </div>
             <div className="flex items-center gap-1.5">
               <XCircle className="w-4 h-4 text-red-500 fill-red-500" />
               <span>Rejected</span>
             </div>
             <div className="flex items-center gap-1.5">
               <Circle className="w-4 h-4 text-gray-200 fill-gray-100" />
               <span>Pending</span>
             </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search MOC No, Title, Type..." 
              className="pl-10 bg-white border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={filterTypeOfChange} onValueChange={setFilterTypeOfChange}>
              <SelectTrigger className="w-[200px] border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Type of Change" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Plant Change (Impact PSI Cat 1,2,3)">Plant Change (Impact PSI Cat 1,2,3)</SelectItem>
                <SelectItem value="Maintenance Change">Maintenance Change</SelectItem>
                <SelectItem value="Process Change (No Impact PSI Cat 1,2,3)">Process Change (No Impact PSI Cat 1,2,3)</SelectItem>
                <SelectItem value="Override">Override</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterLengthOfChange} onValueChange={setFilterLengthOfChange}>
              <SelectTrigger className="w-[180px] border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Length of Change" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Lengths</SelectItem>
                <SelectItem value="Permanent">Permanent</SelectItem>
                <SelectItem value="Temporary">Temporary</SelectItem>
                <SelectItem value="More than 3 days">More than 3 days</SelectItem>
                <SelectItem value="Less than 3 days">Less than 3 days</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPart} onValueChange={setFilterPart}>
              <SelectTrigger className="w-[160px] border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="All Parts" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Parts</SelectItem>
                <SelectItem value="initiation">Initiation</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="implementation">Implementation</SelectItem>
                <SelectItem value="closeout">Closeout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
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
                      MOC No.
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
                    PART
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort('projectEngineer')}
                  >
                    <div className="flex items-center gap-2">
                      Project Engineer
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
                {paginatedData.map((moc, index) => (
                  <tr 
                    key={moc.id} 
                    className={cn(
                      "group transition-colors hover:bg-blue-50/50",
                      index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onViewRequest?.(moc.mocNo, moc.title, getStepFromProcess(moc.process))}
                        className="font-medium text-[#006699] hover:underline cursor-pointer focus:outline-none text-left"
                      >
                        {moc.mocNo}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onViewRequest?.(moc.mocNo, moc.title, getStepFromProcess(moc.process))}
                        className="text-sm text-[#006699] font-medium block truncate max-w-[250px] hover:underline cursor-pointer text-left focus:outline-none"
                      >
                        {moc.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={cn("shadow-none font-medium rounded-full px-3", getTypeOfChangeColor(moc.typeOfChange))}>
                        {moc.typeOfChange}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={cn("shadow-none font-medium rounded-full px-3", getLengthOfChangeColor(moc.lengthOfChange))}>
                        {moc.lengthOfChange}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 w-[250px]">
                      <span className="text-sm text-gray-900 font-medium block truncate">
                        {moc.task}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <ProgressTracker process={moc.process} status={moc.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-medium">{moc.projectEngineer}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{moc.lastUpdate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedData.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                 No MOCs found matching your filters.
              </div>
            )}
          </div>
        </div>

        {/* Pagination Controls */}
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
                 pageNum = currentPage - 3 + i;
                 if (pageNum > totalPages) pageNum = i + (totalPages - 4);
               }
               
               if (pageNum <= 0) return null;

               return (
                 <Button
                   key={pageNum}
                   variant={currentPage === pageNum ? "default" : "outline"}
                   size="icon"
                   onClick={() => setCurrentPage(pageNum)}
                   className={cn(
                     "h-8 w-8 font-mono", 
                     currentPage === pageNum ? "bg-[#006699] hover:bg-[#005c8a]" : "text-gray-600"
                   )}
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
      </div>
    </TooltipProvider>
  );
};

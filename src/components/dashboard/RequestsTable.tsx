import React, { useState, useMemo } from "react";
import { Badge } from "../ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  ArrowUpDown
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
import { getStepFromProcess } from "../../lib/emoc-utils";

export interface ToDoItem {
  id: string;
  mocNo: string;
  title: string;
  type: "Permanent" | "Temporary" | "Overriding";
  task: string;
  assignedTo: string;
  assignedOn: string;
  process: "Review" | "Initiation" | "Implementation" | "Closeout";
}

// --- Mock Data ---
const generateMockTodos = (): ToDoItem[] => {
  const processes: ToDoItem["process"][] = ["Review", "Initiation", "Implementation", "Closeout"];
  const types: ToDoItem["type"][] = ["Permanent", "Temporary", "Overriding"];
  const names = ["John Smith", "Sarah Johnson", "Mike Chen", "Emma Davis", "Robert Brown", "Lisa Anderson"];

  return Array.from({ length: 35 }).map((_, i) => ({
    id: `todo-${i}`,
    mocNo: `MOC-2024-${(i + 100).toString()}`,
    title: `Task ${i + 1}: ${["Safety Review", "Technical Check", "Manager Approval", "Document Verify"][i % 4]} for Unit ${i % 3 + 1}`,
    type: types[i % types.length],
    task: ["Review technical specs", "Approve risk assessment", "Verify installation", "Sign off closeout"][i % 4],
    assignedTo: names[i % names.length],
    assignedOn: `0${(i % 9) + 1}/12/2024 09:${(i * 10) % 60}`,
    process: processes[i % processes.length],
  }));
};

const mockToDoItems = generateMockTodos();

const getTypeColor = (type: string) => {
  switch (type) {
    case "Permanent": return "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-200";
    case "Temporary": return "bg-amber-100 text-amber-700 border-transparent hover:bg-amber-200";
    case "Overriding": return "bg-red-100 text-red-700 border-transparent hover:bg-red-200";
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

interface RequestsTableProps {
  onCreateRequest?: () => void;
  onViewRequest?: (id: string, step?: number) => void;
}

export const RequestsTable = ({ onCreateRequest, onViewRequest }: RequestsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ToDoItem; direction: 'asc' | 'desc' } | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [filterProcess, setFilterProcess] = useState("all");

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...mockToDoItems];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(item => 
        item.mocNo.toLowerCase().includes(lowerTerm) ||
        item.title.toLowerCase().includes(lowerTerm) ||
        item.assignedTo.toLowerCase().includes(lowerTerm) ||
        item.task.toLowerCase().includes(lowerTerm)
      );
    }

    if (filterType !== "all") {
      data = data.filter(item => item.type.toLowerCase() === filterType);
    }

    if (filterProcess !== "all") {
      data = data.filter(item => item.process.toLowerCase() === filterProcess);
    }

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [searchTerm, sortConfig, filterType, filterProcess]);

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
    <div className="space-y-6 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-gray-100">
         <div className="space-y-1">
           <h2 className="text-xl font-bold text-[#1d3654]">TO DO LIST</h2>
           <p className="text-sm text-gray-500">Pending tasks requiring your attention</p>
         </div>
         <div className="flex items-center gap-3">
           <Button
             onClick={onCreateRequest}
             className="bg-[#006699] hover:bg-[#005c8a] text-white shadow-md gap-2"
           >
             <Plus className="w-4 h-4" />
             Create New MOC
           </Button>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search MOC No, Title, Task, or Assigned To..." 
            className="pl-10 bg-white border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
             <SelectTrigger className="w-[150px] border-gray-200">
               <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-gray-400" />
                 <SelectValue placeholder="All Types" />
               </div>
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Types</SelectItem>
               <SelectItem value="permanent">Permanent</SelectItem>
               <SelectItem value="temporary">Temporary</SelectItem>
               <SelectItem value="overriding">Overriding</SelectItem>
             </SelectContent>
           </Select>

           <Select value={filterProcess} onValueChange={setFilterProcess}>
             <SelectTrigger className="w-[160px] border-gray-200">
               <div className="flex items-center gap-2">
                 <Filter className="w-4 h-4 text-gray-400" />
                 <SelectValue placeholder="All Processes" />
               </div>
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Processes</SelectItem>
               <SelectItem value="review">Review</SelectItem>
               <SelectItem value="initiation">Initiation</SelectItem>
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
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('assignedTo')}
                >
                   <div className="flex items-center gap-2">
                    Assigned To
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => handleSort('assignedOn')}
                >
                   <div className="flex items-center gap-2">
                    Assigned On
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Process
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "group transition-colors hover:bg-blue-50/50",
                    index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]/50"
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewRequest?.(item.mocNo, getStepFromProcess(item.process))}
                      className="font-medium text-[#006699] hover:underline cursor-pointer focus:outline-none text-left"
                    >
                      {item.mocNo}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onViewRequest?.(item.mocNo, getStepFromProcess(item.process))}
                      className="text-sm text-[#006699] font-medium block truncate max-w-[250px] hover:underline cursor-pointer focus:outline-none text-left"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn("shadow-none font-medium rounded-full px-3", getTypeColor(item.type))}>
                      {item.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                     <span className="text-sm text-gray-900 font-medium block truncate max-w-[250px]">
                      {item.task}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-medium">{item.assignedTo}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{item.assignedOn}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={cn("shadow-none font-medium rounded-full px-3", getProcessColor(item.process))}>
                      {item.process}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
             // Simple pagination logic 
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
  );
};

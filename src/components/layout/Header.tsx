import React from "react";
import { Sparkles, ChevronDown, Home, ChevronRight, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { cn } from "../ui/utils";
import { LocationSelector, LocationId } from "../dashboard/LocationSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface RequestData {
  mocNo: string;
  title: string;
}

interface HeaderProps {
  onChatToggle: () => void;
  isChatOpen: boolean;
  currentPage?: string;
  showModuleMenu?: boolean;
  isMobile?: boolean;
  currentLocation?: LocationId;
  onLocationChange?: (id: LocationId) => void;
  requestData?: RequestData | null;
  onNavigate: (page: string) => void;
}

export const Header = ({
  onChatToggle,
  isChatOpen,
  currentPage = "dashboard",
  showModuleMenu = false,
  isMobile = false,
  currentLocation = "rayong",
  onLocationChange,
  requestData,
  onNavigate
}: HeaderProps) => {
  // Don't show breadcrumb on dashboard
  const showBreadcrumb = currentPage !== "dashboard";
  
  // Calculate left offset for breadcrumb
  // Fixed: Always align with main content (72px) regardless of module menu
  const breadcrumbOffset = isMobile ? "ml-0" : "ml-[72px]";
  
  const getBreadcrumbTitle = () => {
    switch (currentPage) {
      case "create-request": return "Create New MoC";
      case "qualification": return "MOC Prescreening Form";
      case "view-request":
        return requestData
          ? `${requestData.mocNo} - ${requestData.title}`
          : "View Request";
      case "search": return "Search";
      case "report": return "Report";
      case "admin": return "Admin";
      case "coming-soon": return "Coming Soon";
      default: return "Dashboard";
    }
  };

  const handleHomeClick = () => {
    onNavigate("dashboard");
  };

  return (
    <header className="h-16 bg-[#F7F8FA] border-b border-[#D4D9DE] flex items-center sticky top-0 z-30 fixed left-0 right-0 transition-all duration-300">
      {/* Left: Location & Breadcrumbs - with proper spacing from sidebar */}
      <div className={cn("flex-1 flex items-center px-6", breadcrumbOffset)}>
        
        {/* Location Selector (Moved to Left) */}
        {onLocationChange && (
          <div className="mr-4 animate-in fade-in slide-in-from-left-2">
            <LocationSelector 
              variant="minimal"
              currentLocation={currentLocation}
              onLocationChange={onLocationChange}
            />
          </div>
        )}

        {showBreadcrumb && (
          <>
            <div className="h-6 w-px bg-[#D4D9DE] mr-4 hidden md:block" />
            <div className="flex items-center text-sm text-[#68737D] animate-in fade-in slide-in-from-left-4">
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 hover:text-[#1d3654] hover:bg-gray-100 px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </button>

              <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />

              <button
                onClick={() => onNavigate(currentPage)}
                className="font-semibold text-[#1d3654] px-2 py-1 rounded transition-colors hover:bg-gray-100 cursor-pointer max-w-[500px] truncate"
                title={getBreadcrumbTitle()}
              >
                {getBreadcrumbTitle()}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 px-6">
        
        {/* AI Assistant Button */}
        <button
          onClick={onChatToggle}
          className={cn(
            "flex items-center gap-3 px-3 py-1.5 rounded-full transition-all group",
            // Subtle button style: Gray background, no shadow (less prominent than Location)
            isChatOpen 
              ? "bg-[#1d3654] text-white shadow-sm" 
              : "bg-white border border-transparent hover:border-gray-200 hover:bg-gray-50 text-[#1d3654]"
          )}
        >
          <div className={cn(
             "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
             isChatOpen ? "bg-white/20" : "bg-[#E6F4FF]"
          )}>
            <Sparkles className={cn("w-4 h-4", isChatOpen ? "text-white" : "text-[#006699]")} />
          </div>
          <span className="hidden sm:inline text-sm font-semibold">AI Assistant</span>
        </button>

        <div className="h-8 w-px bg-[#D4D9DE] mx-1" />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none group">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm group-hover:scale-105 transition-transform bg-white">
                {/* Changed to generic user icon */}
                <AvatarFallback className="bg-[#F2F2F2] text-[#1d3654]">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start max-w-[200px]">
                <span className="text-sm font-bold text-[#1C1C1E] leading-none truncate max-w-full">Chatree Dechabumphen (พอญ.)</span>
                <span className="text-[11px] text-[#68737D] mt-1 truncate max-w-full">chatree.d@pttplc.com</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#68737D] hidden md:block group-hover:text-[#1C1C1E] transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Chatree Dechabumphen (พอญ.)</span>
                <span className="text-xs text-[#68737D] font-normal">chatree.d@pttplc.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

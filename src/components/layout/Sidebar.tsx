import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Plus,
  Search,
  ShieldCheck,
  BarChart,
} from "lucide-react";
import { cn } from "../ui/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  currentPage?: string;
  onNavigate?: (page: "dashboard" | "qualification" | "create-request" | "search" | "report" | "admin" | "coming-soon") => void;
}

export const Sidebar = ({ isMobile, isOpen, onClose, currentPage, onNavigate }: SidebarProps) => {
  const handleNavClick = (page: "dashboard" | "qualification" | "create-request" | "search" | "report" | "admin" | "coming-soon") => {
    if (onNavigate) onNavigate(page);
    if (isMobile && onClose) onClose();
  };

  // Mobile drawer handling
  const sidebarWidth = isMobile ? "280px" : "72px";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          translateX: isMobile && !isOpen ? "-100%" : "0%",
        }}
        transition={{
          duration: 0.25,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "fixed left-0 top-0 z-40 h-full bg-[#1d3654] text-white shadow-[2px_0_8px_rgba(0,0,0,0.15)] flex flex-col",
          isMobile && "w-[280px]" // Override width for mobile drawer
        )}
      >
        {/* Logo Section - aligned with header height */}
        <div className="h-16 flex items-center justify-center px-4 border-b border-[#2c4a6d] overflow-hidden shrink-0">
          <div className={cn("flex items-center gap-3", isMobile && "w-full")}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d3654] to-[#006699] border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white font-bold text-sm">PTT</span>
            </div>
            {isMobile && (
              <span className="text-lg font-semibold whitespace-nowrap">
                PTT GSP MoC
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-hidden">
          <NavItem
            icon={Home}
            label="Home"
            isActive={currentPage === "dashboard"}
            isMobile={isMobile}
            onClick={() => handleNavClick("dashboard")}
          />
          <NavItem
            icon={Plus}
            label="New MOC Request"
            isActive={currentPage === "qualification" || currentPage === "create-request"}
            isMobile={isMobile}
            onClick={() => handleNavClick("qualification")}
          />
          <NavItem
            icon={Search}
            label="Search"
            isMobile={isMobile}
            onClick={() => handleNavClick("search")}
          />
          <NavItem
            icon={BarChart}
            label="Report / Dashboard"
            isMobile={isMobile}
            onClick={() => handleNavClick("report")}
          />
          <NavItem
            icon={ShieldCheck}
            label="Admin"
            isMobile={isMobile}
            onClick={() => handleNavClick("admin")}
          />
        </nav>
      </motion.aside>
    </>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  isMobile?: boolean;
  badge?: string;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, isActive, isMobile, badge, onClick }: NavItemProps) => {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 py-3 transition-all duration-200 relative group cursor-pointer",
        isMobile ? "px-4" : "justify-center px-4",
        isActive
          ? "bg-[#2c4a6d] text-white border-l-4 border-white"
          : "text-[#B8C9C8] hover:bg-[#2c4a6d] hover:text-white border-l-4 border-transparent"
      )}
    >
      <div className="relative shrink-0">
        <Icon className={cn("w-6 h-6", isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100")} />
        {badge && (
          <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#D93F4C] rounded-full text-[10px] flex items-center justify-center text-white font-bold border border-[#1d3654]">
            {badge}
          </span>
        )}
      </div>

      {isMobile && (
        <span className="text-sm font-medium whitespace-nowrap">
          {label}
        </span>
      )}

      {isMobile && badge && (
        <span className="ml-auto bg-[#D93F4C] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {button}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={10}>
        <p className="text-sm font-medium">{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};

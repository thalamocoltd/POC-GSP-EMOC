import React, { useState, useRef, useEffect } from "react";
import { MapPin, ChevronUp, ChevronDown, Building2, Factory, Warehouse } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

export type LocationId = "rayong" | "khanom" | "eastern";

export interface LocationOption {
  id: LocationId;
  name: string;
  icon: React.ElementType;
}

export const locations: LocationOption[] = [
  { id: "rayong", name: "โรงแยกก๊าซธรรมชาติระยอง", icon: Factory },
  { id: "khanom", name: "โรงแยกก๊าซธรรมชาติขนอม", icon: Building2 },
  { id: "eastern", name: "คลังภาคตะวันออก", icon: Warehouse },
];

interface LocationSelectorProps {
  currentLocation: LocationId;
  onLocationChange: (id: LocationId) => void;
  variant?: "floating" | "header" | "minimal";
}

export const LocationSelector = ({ 
  currentLocation, 
  onLocationChange, 
  variant = "floating" 
}: LocationSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = locations.find(l => l.id === currentLocation) || locations[0];

  // Close click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFloating = variant === "floating";
  const isMinimal = variant === "minimal";

  return (
    <div 
      ref={containerRef}
      className={cn(
        isFloating ? "fixed bottom-6 right-24 z-40 flex flex-col items-end gap-2 animate-in slide-in-from-bottom duration-500 delay-200" : "relative"
      )}
    >
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[220px] absolute z-50 animate-in fade-in duration-200",
          isFloating
            ? "bottom-full right-0 mb-2 origin-bottom-right slide-in-from-bottom-4"
            : "top-full left-0 mt-2 origin-top-left" // Minimal/Header aligns left usually if on left side
        )}>
          <div className="text-xs font-semibold text-gray-400 px-3 py-2 uppercase tracking-wider">
            Select Location
          </div>
          <div className="space-y-1">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => {
                  onLocationChange(loc.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                  currentLocation === loc.id
                    ? "bg-[#F0F9FF] text-[#006699] font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <loc.icon className={cn("w-4 h-4", currentLocation === loc.id ? "text-[#006699]" : "text-gray-400")} />
                {loc.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className={cn(
          "flex items-center gap-3 transition-all duration-300",
          // Floating Style
          isFloating && "h-14 px-6 rounded-full shadow-xl border border-white/20 bg-white/90 backdrop-blur-md hover:bg-white text-[#1d3654] hover:scale-105",
          // Header (Old) Style
          variant === "header" && "h-auto py-1.5 px-3 rounded-full border border-gray-200 hover:border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:scale-105",
          // Minimal Style (New) - Matches AI Assistant
          isMinimal && cn(
            "px-3 py-1.5 h-auto rounded-full transition-all group",
            "bg-white border border-transparent hover:border-gray-200 hover:bg-gray-50 text-[#1d3654]",
            isOpen && "bg-gray-100"
          )
        )}
      >
        {/* Icon Wrapper */}
        <div className={cn(
          "flex items-center justify-center rounded-full shrink-0 transition-transform group-hover:scale-105",
          isFloating ? "w-8 h-8 bg-[#E6F4FF] text-[#006699]" : "",
          variant === "header" ? "w-8 h-8 bg-[#E6F4FF] text-[#006699]" : "",
          isMinimal ? cn("w-8 h-8", isOpen ? "bg-white/50" : "bg-[#E6F4FF]") : ""
        )}>
          <MapPin className={cn("w-4 h-4", isMinimal ? "text-[#006699]" : "")} />
        </div>

        {/* Text Content */}
        {isMinimal ? (
           // Minimal: Just Name
           <span className="hidden sm:inline text-sm font-semibold">{current.name}</span>
        ) : (
           // Standard: Label + Name
           <div className="flex flex-col items-start mr-1">
             <span className="text-[10px] text-gray-500 font-medium leading-none mb-0.5 uppercase tracking-wider">Current Location</span>
             <span className="text-sm font-bold leading-none text-[#1d3654]">{current.name}</span>
           </div>
        )}

        {/* Chevron */}
        {isFloating ? (
           <ChevronUp className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
        ) : (
           <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform duration-300", isOpen && "rotate-180")} />
        )}
      </Button>
    </div>
  );
};

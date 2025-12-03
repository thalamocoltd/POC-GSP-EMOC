import React from "react";
import { cn } from "../ui/utils";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  trend: string;
  trendDirection: "up" | "down";
  icon: LucideIcon;
  color: "blue" | "amber" | "purple" | "green" | "red";
}

const colorStyles = {
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconBg: "bg-blue-100",
    trendUp: "text-blue-600 bg-blue-50",
    trendDown: "text-blue-600 bg-blue-50"
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconBg: "bg-amber-100",
    trendUp: "text-emerald-600 bg-emerald-50",
    trendDown: "text-red-600 bg-red-50"
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    iconBg: "bg-purple-100",
    trendUp: "text-emerald-600 bg-emerald-50",
    trendDown: "text-red-600 bg-red-50"
  },
  green: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    iconBg: "bg-emerald-100",
    trendUp: "text-emerald-600 bg-emerald-50",
    trendDown: "text-red-600 bg-red-50"
  },
  red: {
    text: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-100",
    iconBg: "bg-red-100",
    trendUp: "text-emerald-600 bg-emerald-50",
    trendDown: "text-red-600 bg-red-50"
  }
};

export const StatsCard = ({ 
  label, 
  value, 
  trend, 
  trendDirection, 
  icon: Icon,
  color
}: StatsCardProps) => {
  const styles = colorStyles[color];

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100/80 hover:shadow-xl hover:border-transparent transition-all duration-300 hover:-translate-y-1 group h-full min-h-[160px] flex flex-col justify-between",
      )}
    >
      {/* Subtle Gradient Blob */}
      <div className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-3xl transition-transform group-hover:scale-150", styles.bg)} />
      
      <div className="relative z-10 flex justify-between items-start">
        <div className={cn("p-3 rounded-2xl transition-colors duration-300", styles.bg)}>
          <Icon className={cn("w-6 h-6", styles.text)} />
        </div>
        
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full",
          trendDirection === "up" ? styles.trendUp : styles.trendDown
        )}>
          {trendDirection === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>

      <div className="relative z-10 mt-4 space-y-1">
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight group-hover:scale-105 origin-left transition-transform duration-300">{value}</h3>
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
    </div>
  );
};

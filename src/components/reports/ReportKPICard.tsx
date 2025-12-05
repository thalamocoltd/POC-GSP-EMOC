import React from "react";
import { LucideIcon } from "lucide-react";

interface ReportKPICardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconColor?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

export const ReportKPICard: React.FC<ReportKPICardProps> = ({
    title,
    value,
    icon: Icon,
    iconColor = "#006699",
    trend
}) => {
    return (
        <div className="rounded-lg border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200 w-full" style={{ background: 'linear-gradient(to bottom right, #ffffff, #f9fafb)' }}>
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{title}</p>
                    <p className="text-2xl font-bold text-[#1d3654] mt-0.5">{value}</p>
                </div>
                {trend && (
                    <div className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${trend.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.value}
                    </div>
                )}
            </div>
        </div>
    );
};

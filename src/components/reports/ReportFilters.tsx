import React, { useState } from "react";
import { Button } from "../ui/button";
import { Calendar, Filter } from "lucide-react";

export const ReportFilters: React.FC = () => {
    const [dateRange, setDateRange] = useState("Last 6 months");
    const [status, setStatus] = useState("All");
    const [location, setLocation] = useState("All");

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Filters:</span>
                </div>

                {/* Date Range */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#006699]"
                    >
                        <option>Last 6 months</option>
                        <option>Last 3 months</option>
                        <option>Last month</option>
                        <option>This year</option>
                        <option>Custom range</option>
                    </select>
                </div>

                {/* Status */}
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#006699]"
                >
                    <option>All Statuses</option>
                    <option>Review</option>
                    <option>Initiation</option>
                    <option>Implementation</option>
                    <option>Closeout</option>
                </select>

                {/* Location */}
                <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#006699]"
                >
                    <option>All Locations</option>
                    <option>Rayong</option>
                    <option>Khanom</option>
                    <option>Eastern</option>
                </select>

                <Button variant="outline" size="sm" className="ml-auto">
                    Reset Filters
                </Button>
            </div>
        </div>
    );
};

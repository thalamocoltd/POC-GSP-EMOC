import React from "react";
import { BarChart, Bar, LineChart, Line, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MOCK_MOC_REQUESTS } from "../../lib/emoc-data";

export const ReportCharts: React.FC = () => {
    // Status distribution data
    const statusData = [
        { name: "Review", value: MOCK_MOC_REQUESTS.filter(r => r.process === "Review").length, color: "#f43f5e" },
        { name: "Initiation", value: MOCK_MOC_REQUESTS.filter(r => r.process === "Initiation").length, color: "#f59e0b" },
        { name: "Implementation", value: MOCK_MOC_REQUESTS.filter(r => r.process === "Implementation").length, color: "#3b82f6" },
        { name: "Closeout", value: MOCK_MOC_REQUESTS.filter(r => r.process === "Closeout").length, color: "#22c55e" }
    ];

    // Type distribution data
    const typeData = [
        { name: "Plant Change", value: MOCK_MOC_REQUESTS.filter(r => r.typeOfChange === "type-1").length, color: "#006699" },
        { name: "Maintenance", value: MOCK_MOC_REQUESTS.filter(r => r.typeOfChange === "type-2").length, color: "#8b5cf6" },
        { name: "Plant Change", value: MOCK_MOC_REQUESTS.filter(r => r.typeOfChange === "type-3").length, color: "#ec4899" },
        { name: "Override", value: MOCK_MOC_REQUESTS.filter(r => r.typeOfChange === "type-4").length, color: "#f59e0b" }
    ];

    // Area distribution
    const areaData = [
        { name: "Production A", value: MOCK_MOC_REQUESTS.filter(r => r.areaId === "area-1").length },
        { name: "Production B", value: MOCK_MOC_REQUESTS.filter(r => r.areaId === "area-2").length },
        { name: "Utilities", value: MOCK_MOC_REQUESTS.filter(r => r.areaId === "area-3").length },
        { name: "Storage", value: MOCK_MOC_REQUESTS.filter(r => r.areaId === "area-4").length },
        { name: "Laboratory", value: MOCK_MOC_REQUESTS.filter(r => r.areaId === "area-5").length }
    ];

    // Monthly trend (mock data)
    const trendData = [
        { month: "Jul", count: 4 },
        { month: "Aug", count: 6 },
        { month: "Sep", count: 8 },
        { month: "Oct", count: 7 },
        { month: "Nov", count: 5 },
        { month: "Dec", count: 5 }
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-2xl border border-gray-700 backdrop-blur-sm">
                    <p className="text-sm font-bold mb-1">{payload[0].name || payload[0].payload.name}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].fill || payload[0].color || '#3b82f6' }}></div>
                        <p className="text-base font-extrabold">{payload[0].value}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <>
            {/* First Row: 2 Charts */}
            <div className="mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
                {/* Status Bar Chart */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(to bottom right, #ffffff, rgba(239, 246, 255, 0.3), #ffffff)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#1d3654]">MOCs by Status</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Live Data</span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={statusData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                {statusData.map((entry, index) => (
                                    <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }} />
                            <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={60}>
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Type Pie Chart */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(to bottom right, #ffffff, rgba(250, 245, 255, 0.3), #ffffff)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#1d3654]">MOCs by Type</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Distribution</span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <defs>
                                {typeData.map((entry, index) => (
                                    <linearGradient key={index} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={typeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={110}
                                innerRadius={55}
                                fill="#8884d8"
                                dataKey="value"
                                paddingAngle={3}
                            >
                                {typeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} stroke="white" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Second Row: 2 Charts */}
            <div className="mb-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1.5rem' }}>
                {/* Area Bar Chart */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(to bottom right, #ffffff, rgba(240, 253, 250, 0.3), #ffffff)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#1d3654]">MOCs by Area</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">By Location</span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={areaData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#006699" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-15} textAnchor="end" height={60} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 8 }} />
                            <Bar dataKey="value" fill="url(#areaGradient)" radius={[12, 12, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Trend Chart */}
                <div className="rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(to bottom right, #ffffff, rgba(238, 242, 255, 0.3), #ffffff)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-[#1d3654]">Monthly Trend</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">6 Months</span>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#006699" />
                                    <stop offset="50%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="none"
                                fill="url(#areaFill)"
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="url(#lineGradient)"
                                strokeWidth={4}
                                dot={{ fill: '#fff', stroke: '#006699', strokeWidth: 3, r: 6 }}
                                activeDot={{ r: 8, fill: '#006699', stroke: '#fff', strokeWidth: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};

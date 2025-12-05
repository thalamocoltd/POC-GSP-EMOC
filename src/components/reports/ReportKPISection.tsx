import React from "react";
import { ReportKPICard } from "./ReportKPICard";
import { LayoutDashboard, Clock, CheckCircle2, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { MOCK_MOC_REQUESTS } from "../../lib/emoc-data";

export const ReportKPISection: React.FC = () => {
    // Calculate KPIs from mock data
    const total = MOCK_MOC_REQUESTS.length;
    const completed = MOCK_MOC_REQUESTS.filter(r => r.process === "Closeout").length;
    const inProgress = MOCK_MOC_REQUESTS.filter(r => r.process === "Implementation").length;
    const pending = MOCK_MOC_REQUESTS.filter(r => r.process === "Initiation" || r.process === "Review").length;

    const totalCost = MOCK_MOC_REQUESTS.reduce((sum, r) => sum + r.estimatedCost, 0);
    const totalBenefit = MOCK_MOC_REQUESTS.reduce((sum, r) => sum + r.estimatedBenefit, 0);

    const completionRate = Math.round((completed / total) * 100);
    const avgCloseTime = 12; // Mock average days

    return (
        <div className="mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
            <ReportKPICard
                title="Total MOCs"
                value={total}
                icon={LayoutDashboard}
                iconColor="#006699"
            />
            <ReportKPICard
                title="Completed"
                value={completed}
                icon={CheckCircle2}
                iconColor="#22c55e"
                trend={{ value: "12%", isPositive: true }}
            />
            <ReportKPICard
                title="In Progress"
                value={inProgress}
                icon={Clock}
                iconColor="#3b82f6"
            />
            <ReportKPICard
                title="Pending"
                value={pending}
                icon={AlertCircle}
                iconColor="#f59e0b"
            />
            <ReportKPICard
                title="Completion Rate"
                value={`${completionRate}%`}
                icon={TrendingUp}
                iconColor="#8b5cf6"
                trend={{ value: "5%", isPositive: true }}
            />
            <ReportKPICard
                title="Avg. Close Time"
                value={`${avgCloseTime}d`}
                icon={Clock}
                iconColor="#ec4899"
                trend={{ value: "2d", isPositive: false }}
            />
        </div>
    );
};

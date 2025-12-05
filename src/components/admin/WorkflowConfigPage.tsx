import React from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface WorkflowConfigPageProps {
    onBack: () => void;
}

export const WorkflowConfigPage = ({ onBack }: WorkflowConfigPageProps) => {
    return (
        <div className="pt-20 max-w-2xl mx-auto animate-in fade-in duration-500">
            <div className="mb-6 flex items-center gap-2">
                <Button variant="ghost" onClick={onBack}>
                    ← Back
                </Button>
                <h1 className="text-2xl font-bold text-[#1d3654]">Workflow Configuration</h1>
            </div>
            <Card className="p-8 border border-gray-200 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Configure Workflow</h2>
                <p className="text-gray-600 mb-2">This is a placeholder for workflow configuration settings.</p>
                {/* Add configuration form/controls here in the future */}
            </Card>
        </div>
    );
};

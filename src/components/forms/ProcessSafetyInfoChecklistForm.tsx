import React, { useState } from "react";
import { ArrowLeft, Save, Send, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";
import { PSIChecklistItem, PSIApprovalRow } from "../../types/emoc";

interface ProcessSafetyInfoChecklistFormProps {
    onBack: () => void;
    mocNumber?: string;
    mocTitle?: string;
}

export const ProcessSafetyInfoChecklistForm = ({
    onBack,
    mocNumber = "MOC-2025-001",
    mocTitle = "Heat Exchanger Replacement Project"
}: ProcessSafetyInfoChecklistFormProps) => {
    const [checklist, setChecklist] = useState<PSIChecklistItem[]>(initialChecklistData());

    const handleFieldChange = (id: string, field: keyof PSIChecklistItem, value: any) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleSubmit = () => {
        console.log("Submitting PSI Checklist:", checklist);
        // Add submission logic here
        onBack();
    };

    const handleSaveDraft = () => {
        console.log("Saving draft:", checklist);
        // Add save draft logic here
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto pb-32 pt-6 px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onBack}
                        className="text-[#68737D] hover:text-[#1C1C1E] flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to View Request
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-[#1d3654] to-[#006699] px-8 py-6">
                        <div className="mb-2">
                            <h1 className="text-2xl font-bold text-white">
                                Process Safety Information Checklist (PSI Checklist)
                            </h1>
                            <p className="text-white text-sm mt-1">
                                Document all process safety information requirements
                            </p>
                        </div>
                    </div>

                    {/* MOC Information Header */}
                    <div className="border-b border-gray-200 bg-gray-50 px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-[#68737D] uppercase tracking-wider">
                                    MOC Number:
                                </label>
                                <div className="text-base font-semibold text-[#1C1C1E]">
                                    {mocNumber}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-[#68737D] uppercase tracking-wider">
                                    MOC Title:
                                </label>
                                <div className="text-base font-semibold text-[#1C1C1E]">
                                    {mocTitle}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Detail Section */}
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#1C1C1E] flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-[#1d3654] to-[#006699] rounded-full"></span>
                                Action Detail
                            </h2>
                            <p className="text-sm text-[#68737D] mt-1 ml-3">
                                Complete the checklist for all Process Safety Information requirements
                            </p>
                        </div>

                        {/* Checklist Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-32">
                                            Required to Update
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300">
                                            PSI Document need to be updated?
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-64">
                                            Action by
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-64">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider w-48">
                                            Remark (specify Drawing No.)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {checklist.map((item, index) => (
                                        item.isCategory ? (
                                            <tr key={item.id} className="bg-blue-50">
                                                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-[#1C1C1E] border-b border-gray-300">
                                                    {item.label}
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr key={item.id} className={cn(
                                                "border-b border-gray-200 hover:bg-gray-50 transition-colors",
                                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                            )}>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`required-${item.id}`}
                                                                checked={item.requiredUpdate === "yes"}
                                                                onChange={() => handleFieldChange(item.id, "requiredUpdate", "yes")}
                                                                className="w-4 h-4 text-[#006699] focus:ring-2 focus:ring-[#006699] focus:ring-offset-1"
                                                            />
                                                            <span className="text-sm font-medium text-[#1C1C1E]">Yes</span>
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`required-${item.id}`}
                                                                checked={item.requiredUpdate === "no"}
                                                                onChange={() => handleFieldChange(item.id, "requiredUpdate", "no")}
                                                                className="w-4 h-4 text-[#006699] focus:ring-2 focus:ring-[#006699] focus:ring-offset-1"
                                                            />
                                                            <span className="text-sm font-medium text-[#1C1C1E]">No</span>
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className={cn(
                                                    "px-4 py-3 text-sm text-[#1C1C1E] border-r border-gray-200",
                                                    item.level === 1 && "pl-6",
                                                    item.level === 2 && "pl-10",
                                                    item.level === 3 && "pl-14"
                                                )}>
                                                    {item.label}
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <input
                                                        type="text"
                                                        value={item.actionBy}
                                                        onChange={(e) => handleFieldChange(item.id, "actionBy", e.target.value)}
                                                        placeholder="Enter name"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 border-r border-gray-200">
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleFieldChange(item.id, "status", e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent bg-white"
                                                    >
                                                        <option value="">Select Status</option>
                                                        <option value="Completed">Completed</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Cancel">Cancel</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="text"
                                                        value={item.remark}
                                                        onChange={(e) => handleFieldChange(item.id, "remark", e.target.value)}
                                                        placeholder="Enter remark"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                    />
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Document Approval Section */}
                    <div className="px-8 pb-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-[#1C1C1E] flex items-center gap-2">
                                <span className="w-1 h-6 bg-gradient-to-b from-[#1d3654] to-[#006699] rounded-full"></span>
                                Document Approval
                            </h2>
                            <p className="text-sm text-[#68737D] mt-1 ml-3">
                                Required approvals from relevant departments
                            </p>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300 w-64">
                                            {/* Empty first column */}
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300">
                                            Position
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider border-r border-gray-300">
                                            Signature
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-[#1C1C1E] uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {approvalRows.map((row, index) => (
                                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E] border-r border-gray-200">
                                                {row.unit}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-200">
                                                {row.name || (
                                                    <input
                                                        type="text"
                                                        placeholder="Enter name"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3 border-r border-gray-200">
                                                {row.position || (
                                                    <input
                                                        type="text"
                                                        placeholder="Enter position"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                    />
                                                )}
                                            </td>
                                            <td className={cn(
                                                "px-4 py-3 border-r border-gray-200",
                                                row.isDateMerged && "border-r-0"
                                            )}>
                                                {row.signature !== undefined ? row.signature : (
                                                    <input
                                                        type="text"
                                                        placeholder="Signature"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {row.dateField || (
                                                    <input
                                                        type="date"
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="border-b border-gray-200 bg-blue-50/30">
                                        <td className="px-4 py-3 text-sm font-bold text-[#1C1C1E] border-r border-gray-200">
                                            อนุมัติโดย
                                        </td>
                                        <td className="px-4 py-3 border-r border-gray-200">
                                            {/* Empty */}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-[#1C1C1E] border-r border-gray-200">
                                            ผจ.วก.
                                        </td>
                                        <td colSpan={2} className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-[#68737D]">Date:</span>
                                                <input
                                                    type="date"
                                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006699] focus:border-transparent"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gray-50 border-t border-gray-200 px-8 py-6 flex items-center justify-between gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="px-6 py-2.5"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleSaveDraft}
                                className="px-6 py-2.5"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Draft
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-[#1d3654] to-[#006699] text-white hover:brightness-110 px-6 py-2.5"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Approval rows data
const approvalRows: PSIApprovalRow[] = [
    { unit: "หน่วยงานต้นเรื่อง (____________)", name: "", position: "", signature: "", dateField: "" },
    { unit: "หน่วยงาน บง.วบก.", name: "", position: "", signature: "", dateField: "" },
    { unit: "หน่วยงาน บค.วบก.", name: "", position: "", signature: "", dateField: "" },
    { unit: "หน่วยงาน บฟ.วบก.", name: "", position: "", signature: "", dateField: "" },
    { unit: "หน่วยงาน วป.วบก.", name: "", position: "", signature: "", dateField: "" },
    { unit: "หน่วยงาน วผ.ทผก.", name: "", position: "", signature: "", dateField: "" },
];

// Initial checklist data structure (will be expanded with all categories)
function initialChecklistData(): PSIChecklistItem[] {
    return [
        // Category 1
        { id: "cat-1", label: "Category 1: Information of Hazardous Chemical", requiredUpdate: null, actionBy: "", status: "", remark: "", isCategory: true },
        { id: "1.1", label: "1.1: Safety Datasheet (SDS)/ Material Safety Datasheet (MSDS)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },

        // Category 2
        { id: "cat-2", label: "Category 2: Information of Process Technology", requiredUpdate: null, actionBy: "", status: "", remark: "", isCategory: true },
        { id: "2.1", label: "2.1: Process Flow Diagram (PFD)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "2.1.1", label: "Process Flow Diagram (PFD)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "2.1.2", label: "Utility Flow Diagram (UFD)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "2.2", label: "2.2: Process Descriptions and Process Chemistry", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "2.3", label: "2.3: Maximum Intended Inventories", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "2.4", label: "2.4: Safe Upper & Lower Limits (for such items as pressures, temperatures, flows or compositions)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "2.5", label: "2.5: An evaluation of the consequences of deviations (from safe upper & lower), including those affecting the safety and health of employees and troubleshooting", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },

        // Category 3
        { id: "cat-3", label: "Category 3: Information of Process Equipment", requiredUpdate: null, actionBy: "", status: "", remark: "", isCategory: true },
        { id: "3.1", label: "3.1: Materials / Document of Construction (items to be selected)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.1.1", label: "Initial Project Specifications (for new project)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.2", label: "Process Design Basis Engineering", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.3", label: "Process Datasheet", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.4", label: "Process Block Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.5", label: "Equipment Design Documents", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.6", label: "Equipment Datasheets/ Specification", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.7", label: "Equipment Lists", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.8", label: "Pump specifications/characteristics", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.9", label: "Piping stress analysis", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.10", label: "Piping system", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.1.11", label: "PSV Datasheet", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.2", label: "3.2: Piping and Instrumentation Diagrams (P&IDs)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.3", label: "3.3: Hazardous Area Classification (HAC), Electrical Classification", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.4", label: "3.4: Relief System Design and Design Basis", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.5", label: "3.5: Ventilation System Design (and HVAC) for CCB and Process Building", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.6", label: "3.6: List of Design Codes and Standards (Applied RAGAGEP (e.g. PTT ES, API, NFPA, etc.))", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.7", label: "3.7: Heat Material and Utility Balances (HMB)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.8", label: "3.8: Safety Interlocks System (Interlocks, detection or suppression systems)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.9", label: "3.9: Fire and Gas Detection & Alarm Systems (including firefighting systems)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.9.1", label: "System design & Maintenance (Gas detection system)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.9.2", label: "System design & Maintenance (Smoke detection System)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.9.3", label: "System design & Maintenance (Fire Alarm and Suppression system)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.9.4", label: "System design & Maintenance (Water Spray system)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "3.10", label: "3.10: Flare system", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "3.11", label: "3.11: Plot Plan / Plant Layout / Plant Location (Plant Area)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },

        // Category 4
        { id: "cat-4", label: "Category 4: PTTGSP Specific Requirement", requiredUpdate: null, actionBy: "", status: "", remark: "", isCategory: true },
        { id: "4.1", label: "4.1: Material Selection Diagram/ Material Flow Diagram/ Chemical-Material Compatibility", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.2", label: "4.2: Plot Plan / Plant Layout / Plant Location (Outside Plant Area)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.3", label: "4.3: Process Datasheet or Process design basis", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.4", label: "4.4: Operating & Maintenance Manuals (Vendor installation/operation/maintenance instruction - for M,E,I), Equipment Installation", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.5", label: "4.5: Piping and Underground Components (to be selected)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.5.1", label: "Piping Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.2", label: "Utilities", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.3", label: "General Arrangement (GA)/Layout Sections & Elevations Piping Detail [Isometric, Supports, Plans/Routing Layout]", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.4", label: "Utility Station and Eye Shower Location Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.5", label: "Pipe Support Detail", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.6", label: "Piping detail drawing for special parts, field fabrication parts", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.7", label: "Welding Procedure Specification (WPS)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.5.8", label: "Piping Tie-In Drawing (Includes Tie-in Schedules and Details)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6", label: "4.6: Detailed Civil and Structural Drawings (to be selected)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.6.1", label: "Civil Standard Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.2", label: "Plans & Elevation", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.3", label: "Sections & Details", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.4", label: "Road,Paving and Drainage Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.5", label: "Building Structure", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.6", label: "Building HVAC and Air Conditioning Ventilation System", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.7", label: "Building Electrical and Communication System", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.8", label: "Building Fire Protection System", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.9", label: "Control Building", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.10", label: "Structure Calculation Sheet", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.11", label: "Fireproofing System", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.12", label: "Piling Layout", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.13", label: "Cable Trench and Duct Bank", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.14", label: "Foundation Location Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.15", label: "Equipment Foundation Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.16", label: "Steel Structure Standard Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.17", label: "Steel Structure for Equipment", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.18", label: "Pipe Rack Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.19", label: "Steel Structure, Platform Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.20", label: "Local Platform and Support", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.21", label: "Building Architectural", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.22", label: "Building, Plumbing System", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.23", label: "Drainage System Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.24", label: "Earth/ Concrete Dike Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.25", label: "Pit and Pond Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.26", label: "Soil Investigation Report", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.6.27", label: "Civil/ Steel structure Calculation sheet", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7", label: "4.7: Equipment (to be selected)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.7.1", label: "Equipment Assembly Drawing/ General Arrangement", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.2", label: "Equipment Detail Drawing/ Cross Sectional Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.3", label: "Detailed Parts and Material Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.4", label: "Lubricant List", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.5", label: "Special Tool List", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.6", label: "Manufacturing Data Record (MDR) for Critical Equipment I.G Containing Equipment High Pressure, High Temp., Hazard Chemical)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.7", label: "Catalog / Manual", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.7.8", label: "Spare Part List", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8", label: "4.8: Instrumentations (to be selected)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.8.1", label: "Instrument Index", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.2", label: "Instrument Datasheet", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.3", label: "Instrument Key Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.4", label: "Instrument Location Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.5", label: "Instrument Loop Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.6", label: "Instrument Wiring Connection List", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.7", label: "Alarm & Trip Set Point", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.8", label: "Cause & Effect Diagrams", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.9", label: "System Configuration Architecture", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.10", label: "Instrument Grounding Philosophy Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.11", label: "Control Room Layout and Wiring Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.12", label: "Instrument Air Piping Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.13", label: "Instrument Schedule", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.14", label: "Instrument Panel Wiring & Outline Drawing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.15", label: "Instrument Typical Installation Detail", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.16", label: "Instrument Cable Layout/ Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.8.17", label: "Vendor Installation/ Operation/ Maintenance Instruction", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9", label: "4.9: Electricals (to be selected)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.9.1", label: "Electrical Equipment Datasheet", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.2", label: "Electrical Typical Installation Details", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.3", label: "Single Line Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.4", label: "Electrical Power Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.5", label: "Electrical Equipment Layout", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.6", label: "Schematic/Wiring Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.7", label: "Electrical Protective Relay Setting", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.8", label: "Main Cable Route", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.9", label: "Cable Schedule", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.10", label: "Earthing Plan/ Lightning Protection Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.11", label: "Cathodic Protection System", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.12", label: "Connection Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.13", label: "Communication System Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.14", label: "Load Balance Schedule", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.15", label: "Vendor Installation/ Operation/ Maintenance Instruction", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.16", label: "Lighting Plan", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.17", label: "Electrical Load List/ Load Schedule", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.18", label: "Electrical System Study Report", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.19", label: "Operation and Interlocking Logic Diagram", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.9.20", label: "Electrical Heat Tracing", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 1 },
        { id: "4.10", label: "4.10: Line Lists and Line Sizing / Line Schedule", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.11", label: "4.11: Application Software (DCS / PLC / HMI / Analyzers)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.12", label: "4.12: Vendor & Supplier Documentations & Drawings (Equipment List)", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.13", label: "4.13: Process Hazard Analysis (PHA) Reports / HAZOP", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.14", label: "4.14: QRA Report / Consequence Analysis Report / Top Risks", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.15", label: "4.15: SIL Study Report", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
        { id: "4.16", label: "4.16: BOWTIE Report", requiredUpdate: null, actionBy: "", status: "", remark: "", level: 0 },
    ];
}

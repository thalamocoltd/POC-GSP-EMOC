import React, { useEffect, useState } from "react";
import { ArrowLeft, Shield, Calendar, Paperclip, FileText, Clock, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { InitiationFormData } from "../../types/emoc";
import { AREA_OPTIONS, LENGTH_OF_CHANGE_OPTIONS, TYPE_OF_CHANGE_OPTIONS, PRIORITY_OPTIONS, BENEFITS_VALUE_OPTIONS, getUnitsByAreaId } from "../../lib/emoc-data";
import { formatFileSize } from "../../lib/emoc-utils";

interface ViewRequestFormProps {
  id: string | null;
  step: number;
  onBack: () => void;
  onStepChange?: (step: number) => void;
}

export const ViewRequestForm = ({ id, step, onBack, onStepChange }: ViewRequestFormProps) => {
  // Mock Data Loading
  const [data, setData] = useState<InitiationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setData({
        requesterName: "John Doe",
        requestDate: "03/12/2025 14:30",
        mocTitle: "Upgrade Production Line A Cooling System",
        lengthOfChange: "length-2", // Temporary
        typeOfChange: "type-1", // Plant Change
        priorityId: "priority-2", // Emergency
        areaId: "area-1",
        unitId: "unit-1-1",
        costEstimated: 800000,
        detailOfChange: "The current cooling system efficiency has dropped by 15% over the last quarter due to aging components.",
        reasonForChange: "Production output is limited during peak hours. Risk of overheating.",
        scopeOfWork: "Replace cooling pumps P-101A/B. Install new heat exchanger. Update control logic.",
        benefitsValue: ["benefit-1", "benefit-6"], // Safety, Money
        expectedBenefits: "Expected efficiency increase of 20%. Reduced maintenance costs.",
        estimatedValue: 1200000,
        riskBeforeChange: {
          likelihood: 3,
          impact: 3,
          score: 9,
          level: "Medium",
          likelihoodLabel: "Possible",
          impactLabel: "Moderate"
        },
        riskAfterChange: {
          likelihood: 1,
          impact: 3,
          score: 3,
          level: "Low",
          likelihoodLabel: "Rare",
          impactLabel: "Moderate"
        },
        attachments: [
          { id: "1", category: "Technical Information", fileName: "P&ID Diagram.pdf", fileSize: 2500000, fileType: "application/pdf", uploadedAt: new Date(), uploadedBy: "John Doe", url: "#" },
          { id: "2", category: "Technical Information", fileName: "Vendor Quote.pdf", fileSize: 1150000, fileType: "application/pdf", uploadedAt: new Date(), uploadedBy: "John Doe", url: "#" }
        ]
      });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading || !data) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"/></div>;
  }

  const getAreaName = (id: string) => AREA_OPTIONS.find(a => a.id === id)?.name || id;
  const getUnitName = (areaId: string, unitId: string) => getUnitsByAreaId(areaId).find(u => u.id === unitId)?.name || unitId;
  const getLengthOfChangeName = (id: string) => LENGTH_OF_CHANGE_OPTIONS.find(l => l.id === id)?.name || id;
  const getTypeOfChangeName = (id: string) => TYPE_OF_CHANGE_OPTIONS.find(t => t.id === id)?.name || id;
  const getPriorityName = (id: string) => PRIORITY_OPTIONS.find(p => p.id === id)?.name || id;
  const getBenefitsValueNames = (ids: string[]) => ids.map(id => BENEFITS_VALUE_OPTIONS.find(b => b.id === id)?.name || id).join(", ");

  const getRiskLevelConfig = (level: string | null) => {
    if (!level) return { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", badge: "bg-gray-100 text-gray-700" };
    const configs: Record<string, any> = {
      Low: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", badge: "bg-green-100 text-green-800 border-green-300" },
      Medium: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-800", badge: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      High: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-100 text-orange-800 border-orange-300" },
      Extreme: { bg: "bg-red-50", border: "border-red-300", text: "text-red-800", badge: "bg-red-100 text-red-800 border-red-300" }
    };
    return configs[level] || configs.Low;
  };

  const ReadOnlyField = ({ label, value, multiline = false }: { label: string, value: string | number, multiline?: boolean }) => (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-[#68737D]">{label}</Label>
      <div className={cn(
        "text-[#1C1C1E] text-sm font-medium px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200",
        multiline && "min-h-[60px] whitespace-pre-wrap"
      )}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="max-w-[860px] pb-32 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="text-[#68737D] hover:text-[#1C1C1E] flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-500">Status:</span>
           <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
             Pending Review
           </span>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-10">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1C1C1E] mb-1">{data.mocTitle}</h2>
            <p className="text-[#68737D] text-sm flex items-center gap-2">
              <span>{id}</span>
              <span>•</span>
              <span>Initiation Stage</span>
            </p>
          </div>

          {/* Step Title */}
          <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 mb-6">
            <p className="text-sm font-medium text-blue-800">
              {step === 1 && "Step 1: Initiation Request"}
              {step === 2 && "Step 2: Review & Approval"}
              {step === 3 && "Step 3: Implementation"}
              {step === 4 && "Step 4: Closeout"}
            </p>
          </div>

          {/* General Information */}
          <section id="section-general-info" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              General Information
            </h3>

            <div className="grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="Requester Name" value={data.requesterName} />
                <ReadOnlyField label="Request Date" value={data.requestDate} />
              </div>
              <ReadOnlyField label="MOC Title" value={data.mocTitle} />
              <ReadOnlyField label="Length of Change" value={getLengthOfChangeName(data.lengthOfChange)} />
              <ReadOnlyField label="Type of Change" value={getTypeOfChangeName(data.typeOfChange)} />
              {/* Enhanced Priority Field */}
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium text-[#68737D]">Priority of Change</Label>
                {(() => {
                  const priority = PRIORITY_OPTIONS.find(p => p.id === data.priorityId);
                  if (!priority) return <div className="text-sm text-gray-500">Unknown</div>;

                  const isEmergency = priority.name === "Emergency";

                  return (
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-3 rounded-lg border-2 font-bold text-base shadow-sm",
                      isEmergency
                        ? "bg-red-50 border-red-400 text-red-700 shadow-red-200/50"
                        : "bg-green-50 border-green-400 text-green-700 shadow-green-200/50"
                    )}>
                      {isEmergency ? (
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                      <span>{priority.name}</span>
                      {isEmergency && (
                        <span className="ml-2 px-2 py-0.5 bg-red-200 text-red-900 text-xs rounded-full font-bold">
                          URGENT
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="Area" value={getAreaName(data.areaId)} />
                <ReadOnlyField label="Unit" value={getUnitName(data.areaId, data.unitId)} />
              </div>
              <ReadOnlyField label="Cost Estimated of Change (THB)" value={data.costEstimated.toLocaleString()} />
            </div>
          </section>

          {/* Change Details */}
          <section id="section-change-details" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Change Details
            </h3>
            <div className="space-y-6">
              <ReadOnlyField label="Detail of Change" value={data.detailOfChange} multiline />
              <ReadOnlyField label="Reason for Change" value={data.reasonForChange} multiline />
              <ReadOnlyField label="Scope of Work" value={data.scopeOfWork} multiline />
              <ReadOnlyField label="Benefits Value" value={getBenefitsValueNames(data.benefitsValue)} />
              <ReadOnlyField label="Expected Benefits" value={data.expectedBenefits} multiline />
              <ReadOnlyField label="Estimated Value (Baht/year)" value={data.estimatedValue.toLocaleString()} />
            </div>
          </section>

          {/* Review of Change */}
          <section id="section-risk" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Risk Assessment
            </h3>

            <div className="space-y-4">
               {/* Risk Before */}
               <div>
                  <Label className="text-[13px] font-medium text-[#68737D] mb-2 block">Risk Assessment Before Change</Label>
                  {(() => {
                    const config = getRiskLevelConfig(data.riskBeforeChange.level);
                    return (
                      <div className={cn("p-5 border rounded-xl", config.bg, config.border)}>
                        <div className="flex items-center gap-3">
                          <span className={cn("px-4 py-2 rounded-lg font-bold text-base border-2", config.badge)}>
                            {data.riskBeforeChange.level || "N/A"}
                          </span>
                          <div>
                            <div className={cn("text-2xl font-bold", config.text)}>{data.riskBeforeChange.score}</div>
                            <div className="text-xs text-[#68737D]">Risk Score</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
               </div>

               {/* Risk After */}
               <div>
                  <Label className="text-[13px] font-medium text-[#68737D] mb-2 block">Risk Assessment After Change</Label>
                  {(() => {
                    const config = getRiskLevelConfig(data.riskAfterChange.level);
                    return (
                      <div className={cn("p-5 border rounded-xl", config.bg, config.border)}>
                        <div className="flex items-center gap-3">
                          <span className={cn("px-4 py-2 rounded-lg font-bold text-base border-2", config.badge)}>
                            {data.riskAfterChange.level || "N/A"}
                          </span>
                          <div>
                            <div className={cn("text-2xl font-bold", config.text)}>{data.riskAfterChange.score}</div>
                            <div className="text-xs text-[#68737D]">Risk Score</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
               </div>
            </div>
          </section>

          {/* Attachments */}
          <section id="section-attachments" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Attachments
            </h3>

            {data.attachments.length > 0 ? (
              <div className="grid gap-3">
                {data.attachments.map((file) => (
                  <div key={file.id} className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{file.fileName}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No documents attached</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

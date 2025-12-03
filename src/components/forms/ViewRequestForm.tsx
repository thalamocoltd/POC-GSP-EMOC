import React, { useEffect, useState } from "react";
import { ArrowLeft, Shield, Calendar, Paperclip, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { InitiationFormData } from "../../types/emoc";
import { AREA_OPTIONS, TPM_LOSS_TYPES, PRIORITY_OPTIONS, getUnitsByAreaId } from "../../lib/emoc-data";

interface ViewRequestFormProps {
  id: string | null;
  onBack: () => void;
}

export const ViewRequestForm = ({ id, onBack }: ViewRequestFormProps) => {
  // Mock Data Loading
  const [data, setData] = useState<InitiationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setData({
        mocTitle: "Upgrade Production Line A Cooling System",
        areaId: "1", // Rayong
        unitId: "101", // Unit 1
        background: "The current cooling system efficiency has dropped by 15% over the last quarter due to aging components.",
        impact: "Production output is limited during peak hours. Risk of overheating.",
        tpmLossTypeId: "1", // Breakdown Loss
        lossEliminateValue: 500000,
        scopeOfWork: "Replace cooling pumps P-101A/B. Install new heat exchanger. Update control logic.",
        benefit: "Expected efficiency increase of 20%. Reduced maintenance costs.",
        benefitValue: 1200000,
        lengthOfChange: { years: 0, months: 3, days: 0 },
        priorityId: "2", // High
        preliminaryReview: "Initial review by engineering team confirms feasibility.",
        investment: 800000,
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
        attachments: {
          technicalInformation: [{ id: "1", name: "P&ID Diagram.pdf", size: "2.4 MB", type: "application/pdf", url: "#" }],
          minuteOfMeeting: [],
          otherDocuments: [{ id: "2", name: "Vendor Quote.pdf", size: "1.1 MB", type: "application/pdf", url: "#" }]
        }
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
  const getLossTypeName = (id: string) => TPM_LOSS_TYPES.find(t => t.id === id)?.name || id;
  const getPriorityName = (id: string) => PRIORITY_OPTIONS.find(p => p.id === id)?.name || id;

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

          {/* Basic Information */}
          <section id="section-basic-info" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Basic Information
            </h3>
            
            <div className="grid gap-6">
              <ReadOnlyField label="MOC Title" value={data.mocTitle} />
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="Area" value={getAreaName(data.areaId)} />
                <ReadOnlyField label="Unit" value={getUnitName(data.areaId, data.unitId)} />
              </div>
            </div>
          </section>

          {/* Background & Impact */}
          <section id="section-background" className="space-y-6 scroll-mt-24">
             <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Background & Impact
            </h3>
            <div className="space-y-6">
              <ReadOnlyField label="Background" value={data.background} multiline />
              <ReadOnlyField label="Impact" value={data.impact} multiline />
              <ReadOnlyField label="Scope of Work" value={data.scopeOfWork} multiline />
            </div>
          </section>

          {/* Loss & Benefit Analysis */}
          <section id="section-analysis" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Loss & Benefit Analysis
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <ReadOnlyField label="TPM Loss Type" value={getLossTypeName(data.tpmLossTypeId)} />
              <ReadOnlyField label="Loss Eliminate Value (THB)" value={data.lossEliminateValue.toLocaleString()} />
            </div>

            <ReadOnlyField label="Benefit" value={data.benefit} multiline />

            <div className="grid sm:grid-cols-2 gap-6">
              <ReadOnlyField label="Benefit Value (THB)" value={data.benefitValue.toLocaleString()} />
              <ReadOnlyField label="Investment (THB)" value={data.investment.toLocaleString()} />
            </div>
          </section>

          {/* Additional Details */}
          <section id="section-additional" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Additional Details
            </h3>

            <ReadOnlyField label="Length of Change" value={`${data.lengthOfChange.years} Years, ${data.lengthOfChange.months} Months, ${data.lengthOfChange.days} Days`} />
            <ReadOnlyField label="Priority" value={getPriorityName(data.priorityId)} />
            <ReadOnlyField label="Preliminary Review" value={data.preliminaryReview} multiline />
          </section>

          {/* Risk Assessment */}
          <section id="section-risk" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Risk Assessment
            </h3>

            <div className="space-y-4">
               {/* Risk Before */}
               <div>
                  <Label className="text-[13px] font-medium text-[#68737D] mb-2 block">Risk Before Change</Label>
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
                  <Label className="text-[13px] font-medium text-[#68737D] mb-2 block">Risk After Change</Label>
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

          {/* File Attachments */}
          <section id="section-files" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              File Attachments
            </h3>
            
            {Object.entries(data.attachments).map(([category, files]) => (
               files.length > 0 && (
                 <div key={category}>
                   <h4 className="text-sm font-medium text-[#1C1C1E] mb-3 capitalize">
                     {category.replace(/([A-Z])/g, ' $1').trim()}
                   </h4>
                   <div className="grid gap-3">
                     {files.map((file: any) => (
                       <div key={file.id} className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                         <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center mr-3">
                           <FileText className="w-5 h-5 text-blue-600" />
                         </div>
                         <div className="flex-1">
                           <div className="text-sm font-medium text-gray-900">{file.name}</div>
                           <div className="text-xs text-gray-500">{file.size}</div>
                         </div>
                         <Button variant="ghost" size="sm" className="text-blue-600">
                           View
                         </Button>
                       </div>
                     ))}
                   </div>
                 </div>
               )
            ))}
            {Object.values(data.attachments).every(arr => arr.length === 0) && (
              <div className="text-sm text-gray-500 italic">No documents attached</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { ArrowLeft, Shield, Calendar, Paperclip, FileText, Clock, AlertTriangle, User, CheckCircle2, Wrench, CheckSquare, CheckCircle, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { InitiationFormData } from "../../types/emoc";
import { AREA_OPTIONS, LENGTH_OF_CHANGE_OPTIONS, TYPE_OF_CHANGE_OPTIONS, PRIORITY_OPTIONS, BENEFITS_VALUE_OPTIONS, TPM_LOSS_TYPE_OPTIONS, getUnitsByAreaId } from "../../lib/emoc-data";
import { formatFileSize } from "../../lib/emoc-utils";
import { PartProgressBar } from "../ui/PartProgressBar";
import { TaskCardList } from "../workflow/TaskCardList";
import { INITIATION_TASKS, REVIEW_TASKS, IMPLEMENTATION_TASKS, CLOSEOUT_TASKS } from "../../lib/workflow-demo-data";

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
        estimatedDurationStart: "2025-12-06",
        estimatedDurationEnd: "2025-12-08",
        tpmLossType: "tpm-1", // Safety
        lossEliminateValue: 800000,
        detailOfChange: "The current cooling system efficiency has dropped by 15% over the last quarter due to aging components.",
        reasonForChange: "Production output is limited during peak hours. Risk of overheating.",
        scopeOfWork: "Replace cooling pumps P-101A/B. Install new heat exchanger. Update control logic.",
        estimatedBenefit: 1200000,
        estimatedCost: 800000,
        benefits: ["benefit-1", "benefit-6"], // Safety, Money
        expectedBenefits: "Expected efficiency increase of 20%. Reduced maintenance costs. Prevent potential production shutdown.",
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
  const getBenefitNames = (ids: string[]) => ids.map(id => BENEFITS_VALUE_OPTIONS.find(b => b.id === id)?.name || id).join(", ");
  const getTPMLossTypeName = (id: string) => TPM_LOSS_TYPE_OPTIONS.find(t => t.id === id)?.name || id;

  // Get step-specific part name
  const getPartName = (stepNum: number) => {
    const parts = ["Initiation", "Review", "Implementation", "Closeout"];
    return parts[stepNum - 1] || "Unknown";
  };

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

          {/* Progress Bar */}
          {(step >= 1 && step <= 4) && (
            <div className="mb-8">
              <PartProgressBar currentPart={getPartName(step) as "Initiation" | "Review" | "Implementation" | "Closeout"} />
            </div>
          )}

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
              {data.lengthOfChange && (
                <ReadOnlyField label="Length of Change" value={getLengthOfChangeName(data.lengthOfChange)} />
              )}
              {data.typeOfChange && (
                <ReadOnlyField label="Type of Change" value={getTypeOfChangeName(data.typeOfChange)} />
              )}
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
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="Start Date" value={data.estimatedDurationStart} />
                <ReadOnlyField label="End Date" value={data.estimatedDurationEnd} />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="TPM Loss Type" value={getTPMLossTypeName(data.tpmLossType)} />
                <ReadOnlyField label="Loss Eliminate Value (THB)" value={data.lossEliminateValue.toLocaleString()} />
              </div>
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
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="Estimated Benefit (THB)" value={data.estimatedBenefit.toLocaleString()} />
                <ReadOnlyField label="Estimated Cost (THB)" value={data.estimatedCost.toLocaleString()} />
              </div>
              <ReadOnlyField label="Benefits" value={getBenefitNames(data.benefits)} />
              <ReadOnlyField label="Expected Benefits" value={data.expectedBenefits} multiline />
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

          {/* Step 2: Review Status Section */}
          {step === 2 && (
            <section id="section-review-status" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#006699]" />
                Review Status
              </h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[#1C1C1E] mb-2">Awaiting Review</h4>
                    <p className="text-sm text-[#68737D] mb-4">
                      This MOC request is currently pending review by the designated approvers.
                    </p>
                    <div className="space-y-3">
                      <Label className="text-[13px] font-medium text-[#68737D]">Assigned Reviewers</Label>
                      <div className="space-y-2">
                        {[
                          { name: "Sarah Johnson", role: "Technical Manager", status: "Pending" },
                          { name: "Michael Chen", role: "Safety Officer", status: "Pending" },
                          { name: "David Williams", role: "Operations Lead", status: "Pending" }
                        ].map((reviewer, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1C1C1E]">{reviewer.name}</p>
                              <p className="text-xs text-[#68737D]">{reviewer.role}</p>
                            </div>
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                              {reviewer.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 3: Implementation Details Section */}
          {step === 3 && (
            <section id="section-implementation-details" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#006699]" />
                Implementation Details
              </h3>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[#1C1C1E] mb-2">Implementation in Progress</h4>
                    <p className="text-sm text-[#68737D] mb-4">
                      The approved change is now being implemented according to the defined scope of work.
                    </p>
                    <div className="space-y-3 mt-4">
                      <Label className="text-[13px] font-medium text-[#68737D]">Implementation Tasks</Label>
                      <div className="space-y-2">
                        {[
                          { task: "Pre-implementation safety briefing", status: "Completed", date: "Dec 1, 2025" },
                          { task: "Equipment shutdown and isolation", status: "Completed", date: "Dec 2, 2025" },
                          { task: "Physical modifications and installation", status: "In Progress", date: "Dec 3-5, 2025" },
                          { task: "Testing and commissioning", status: "Pending", date: "Dec 6, 2025" },
                          { task: "Documentation and handover", status: "Pending", date: "Dec 7, 2025" }
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${
                              item.status === "Completed" ? "bg-green-500" :
                              item.status === "In Progress" ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-[#1C1C1E]">{item.task}</p>
                              <p className="text-xs text-[#68737D] flex items-center gap-1 mt-0.5">
                                <Calendar className="w-3 h-3" /> {item.date}
                              </p>
                            </div>
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                              item.status === "Completed" ? "bg-green-100 text-green-700 border border-green-300" :
                              item.status === "In Progress" ? "bg-blue-100 text-blue-700 border border-blue-300" :
                              "bg-gray-100 text-gray-700 border border-gray-300"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Step 4: Closeout Status Section */}
          {step === 4 && (
            <section id="section-closeout-status" className="space-y-6 scroll-mt-24">
              <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#006699]" />
                Closeout Status
              </h3>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-[#1C1C1E] mb-2">MOC Successfully Closed</h4>
                    <p className="text-sm text-[#68737D] mb-4">
                      This Management of Change has been successfully implemented and all closeout activities have been completed.
                    </p>
                    <div className="space-y-3 mt-4">
                      <Label className="text-[13px] font-medium text-[#68737D]">Closeout Checklist</Label>
                      <div className="space-y-2">
                        {[
                          "Post-implementation review completed",
                          "As-built drawings updated",
                          "Operating procedures revised",
                          "Training materials updated",
                          "Lessons learned documented",
                          "Change management database updated"
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-sm text-[#1C1C1E]">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-[#006699]">14</div>
                        <div className="text-xs text-[#68737D] mt-1">Days to Complete</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-green-600">100%</div>
                        <div className="text-xs text-[#68737D] mt-1">Tasks Completed</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                        <div className="text-2xl font-bold text-purple-600">0</div>
                        <div className="text-xs text-[#68737D] mt-1">Safety Incidents</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Task Cards Sections */}
          {step === 1 && (
            <section className="space-y-6 mt-10 pt-10 border-t border-[#F0F2F5]">
              <TaskCardList tasks={INITIATION_TASKS} partName="Initiation" />
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6 mt-10 pt-10 border-t border-[#F0F2F5]">
              <TaskCardList tasks={REVIEW_TASKS} partName="Review" />
            </section>
          )}

          {step === 3 && (
            <section className="space-y-6 mt-10 pt-10 border-t border-[#F0F2F5]">
              <TaskCardList tasks={IMPLEMENTATION_TASKS} partName="Implementation" />
            </section>
          )}

          {step === 4 && (
            <section className="space-y-6 mt-10 pt-10 border-t border-[#F0F2F5]">
              <TaskCardList tasks={CLOSEOUT_TASKS} partName="Closeout" />
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

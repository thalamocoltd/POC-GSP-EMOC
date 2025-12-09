import React, { useEffect, useState } from "react";
import { ArrowLeft, Shield, Calendar, Paperclip, FileText, Clock, AlertTriangle, User, CheckCircle2, Wrench, CheckSquare, CheckCircle, Award } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { InitiationFormData } from "../../types/emoc";
import { TaskStatus, TechnicalDiscipline, TechnicalReviewApprovalRow } from "../../types/task-cards";
import { AREA_OPTIONS, LENGTH_OF_CHANGE_OPTIONS_ALL, TYPE_OF_CHANGE_OPTIONS, PRIORITY_OPTIONS, BENEFITS_VALUE_OPTIONS, TPM_LOSS_TYPE_OPTIONS, getUnitsByAreaId, MOCK_MOC_REQUESTS } from "../../lib/emoc-data";
import { formatFileSize, createRiskAssessment, getRiskCodeStyle } from "../../lib/emoc-utils";
import { ProcessingOverlay } from "../ui/ProcessingOverlay";
import { ChangeMOCChampionDialog } from "./action-dialogs/ChangeMOCChampionDialog";
import { ExtendTemporaryDialog } from "./action-dialogs/ExtendTemporaryDialog";
import { ChangeTeamDialog } from "./action-dialogs/ChangeTeamDialog";
import { CancelMOCDialog } from "./action-dialogs/CancelMOCDialog";
import { useActions } from "../../context/ActionsContext";
import { InitiationApprovalCard } from "../workflow/task-cards/InitiationApprovalCard";
import { AssignProjectEngineerCard } from "../workflow/task-cards/AssignProjectEngineerCard";
import { ApproveWithPECard } from "../workflow/task-cards/ApproveWithPECard";
import { AssignTechReviewTeamCard } from "../workflow/task-cards/AssignTechReviewTeamCard";
import { ApproveTechReviewTeamCard } from "../workflow/task-cards/ApproveTechReviewTeamCard";
import { PerformTechReviewCard } from "../workflow/task-cards/PerformTechReviewCard";
import { AVAILABLE_PEOPLE, INITIATION_TASK_CARDS, REVIEW_TASK_CARDS, TECHNICAL_DISCIPLINES, TECHNICAL_REVIEW_APPROVALS, DOCUMENT_REVIEW_ITEMS } from "../../lib/task-card-data";

interface InProgressTask {
  id: string;
  taskName: string;
  step: number;
}

interface ViewRequestFormProps {
  id: string | null;
  step: number;
  onBack: () => void;
  onStepChange?: (step: number) => void;
  onNavigateToForm?: (formType: "psi-checklist" | "preliminary-safety" | "she-assessment") => void;
  onInProgressTasksChange?: (tasks: InProgressTask[]) => void;
}

export const ViewRequestForm = ({ id, step, onBack, onStepChange, onNavigateToForm, onInProgressTasksChange }: ViewRequestFormProps) => {
  // Mock Data Loading
  const [data, setData] = useState<InitiationFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Action dialog states from context
  const { activeDialog, setActiveDialog, isProcessing, setIsProcessing, processingMessages, setProcessingMessages } = useActions();

  // Task Card States - Initiation
  const [initiationTask1Comments, setInitiationTask1Comments] = useState("");
  const [initiationTask2SelectedEngineer, setInitiationTask2SelectedEngineer] = useState<string | null>(null);
  const [initiationTask2Comments, setInitiationTask2Comments] = useState("");
  const [initiationTask3Comments, setInitiationTask3Comments] = useState("");

  // Task Card States - Review
  const [reviewDisciplines, setReviewDisciplines] = useState(TECHNICAL_DISCIPLINES);
  const [reviewTask1Comments, setReviewTask1Comments] = useState("");
  const [reviewApprovalRows, setReviewApprovalRows] = useState(TECHNICAL_REVIEW_APPROVALS);
  const [reviewTask2Comments, setReviewTask2Comments] = useState("");
  const [reviewDocuments, setReviewDocuments] = useState(DOCUMENT_REVIEW_ITEMS);
  const [reviewTask3Comments, setReviewTask3Comments] = useState("");

  // Task Status Management - Initiation & Review
  const [initiationTaskStatuses, setInitiationTaskStatuses] = useState<TaskStatus[]>([
    "In Progress",
    "Not Started",
    "Not Started",
  ]);
  const [reviewTaskStatuses, setReviewTaskStatuses] = useState<TaskStatus[]>([
    "In Progress",
    "Not Started",
    "Not Started",
  ]);

  // Task Name Constants
  const INITIATION_TASK_NAMES = [
    "Initial Review and approve MOC Request",
    "Assign Project Engineer",
    "Review and Approve MOC Request",
  ];

  const REVIEW_TASK_NAMES = [
    "Assign Technical Review Team",
    "Approve Technical Review Team",
    "Perform Technical Review",
  ];

  // Helper function to get In Progress tasks for ModuleMenu
  interface InProgressTask {
    id: string;
    taskName: string;
    step: number;
  }

  const getInProgressTasks = (): InProgressTask[] => {
    const tasks: InProgressTask[] = [];

    if (step === 1) {
      initiationTaskStatuses.forEach((status: TaskStatus, index: number) => {
        if (status === "In Progress") {
          tasks.push({
            id: `initiation-task-${index + 1}`,
            taskName: INITIATION_TASK_NAMES[index],
            step: 1,
          });
        }
      });
    }

    if (step === 2) {
      reviewTaskStatuses.forEach((status: TaskStatus, index: number) => {
        if (status === "In Progress") {
          tasks.push({
            id: `review-task-${index + 1}`,
            taskName: REVIEW_TASK_NAMES[index],
            step: 2,
          });
        }
      });
    }

    return tasks;
  };

  // Notify parent component of in-progress tasks
  useEffect(() => {
    if (onInProgressTasksChange) {
      const tasks = getInProgressTasks();
      onInProgressTasksChange(tasks);
    }
  }, [initiationTaskStatuses, reviewTaskStatuses, step, onInProgressTasksChange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Find the corresponding mock data from MOCK_MOC_REQUESTS
      const mockRequest = MOCK_MOC_REQUESTS.find(req => req.mocNo === id);

      if (mockRequest) {
        const formData: InitiationFormData = {
          requesterName: mockRequest.requesterName,
          requestDate: mockRequest.requestDate,
          mocTitle: mockRequest.title,
          typeOfChange: mockRequest.typeOfChange,
          lengthOfChange: mockRequest.lengthOfChange,
          priorityId: mockRequest.priorityId,
          areaId: mockRequest.areaId,
          unitId: mockRequest.unitId,
          estimatedDurationStart: mockRequest.estimatedDurationStart,
          estimatedDurationEnd: mockRequest.estimatedDurationEnd,
          tpmLossType: mockRequest.tpmLossType,
          lossEliminateValue: mockRequest.lossEliminateValue,
          detailOfChange: mockRequest.detailOfChange,
          reasonForChange: mockRequest.reasonForChange,
          scopeOfWork: mockRequest.scopeOfWork,
          estimatedBenefit: mockRequest.estimatedBenefit,
          estimatedCost: mockRequest.estimatedCost,
          benefits: mockRequest.benefits,
          expectedBenefits: mockRequest.expectedBenefits,
          riskBeforeChange: createRiskAssessment(4, 3),
          riskAfterChange: createRiskAssessment(2, 2),
          attachments: [
            { id: "1", category: "Technical Information", fileName: "Technical_Specifications.pdf", fileSize: 2500000, fileType: "application/pdf", uploadedAt: new Date(), uploadedBy: mockRequest.requesterName, url: "#" },
            { id: "2", category: "Technical Information", fileName: "Analysis_Report.pdf", fileSize: 1800000, fileType: "application/pdf", uploadedAt: new Date(), uploadedBy: mockRequest.requesterName, url: "#" },
            { id: "3", category: "Minute of Meeting", fileName: "Meeting_Notes.pdf", fileSize: 750000, fileType: "application/pdf", uploadedAt: new Date(), uploadedBy: mockRequest.requesterName, url: "#" },
            { id: "4", category: "Other Documents", fileName: "Documentation.jpg", fileSize: 3500000, fileType: "image/jpeg", uploadedAt: new Date(), uploadedBy: mockRequest.requesterName, url: "#" }
          ]
        };
        setData(formData);
      } else {
        // Fallback to a default structure if MOC not found
        setData({
          requesterName: "Unknown",
          requestDate: new Date().toLocaleDateString(),
          mocTitle: `MOC Request: ${id}`,
          typeOfChange: "type-1",
          lengthOfChange: "length-1",
          priorityId: "priority-1",
          areaId: "area-1",
          unitId: "unit-1-1",
          estimatedDurationStart: "2025-12-10",
          estimatedDurationEnd: "2025-12-15",
          tpmLossType: "tpm-1",
          lossEliminateValue: 500000,
          detailOfChange: "Change details not available",
          reasonForChange: "Reason not available",
          scopeOfWork: "Scope not available",
          estimatedBenefit: 0,
          estimatedCost: 0,
          benefits: [],
          expectedBenefits: "Benefits not available",
          riskBeforeChange: createRiskAssessment(3, 2),
          riskAfterChange: createRiskAssessment(2, 2),
          attachments: []
        });
      }
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading || !data) {
    return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  }

  const getAreaName = (id: string) => AREA_OPTIONS.find(a => a.id === id)?.name || id;
  const getUnitName = (areaId: string, unitId: string) => getUnitsByAreaId(areaId).find(u => u.id === unitId)?.name || unitId;
  const getLengthOfChangeName = (id: string) => LENGTH_OF_CHANGE_OPTIONS_ALL.find(l => l.id === id)?.name || id;
  const getTypeOfChangeName = (id: string) => TYPE_OF_CHANGE_OPTIONS.find(t => t.id === id)?.name || id;
  const getPriorityName = (id: string) => PRIORITY_OPTIONS.find(p => p.id === id)?.name || id;
  const getBenefitNames = (ids: string[]) => ids.map(id => BENEFITS_VALUE_OPTIONS.find(b => b.id === id)?.name || id).join(", ");
  const getTPMLossTypeName = (id: string) => TPM_LOSS_TYPE_OPTIONS.find(t => t.id === id)?.name || id;

  // Get step-specific part name
  const getPartName = (stepNum: number) => {
    const parts = ["Initiation", "Review", "Implementation", "Closeout"];
    return parts[stepNum - 1] || "Unknown";
  };

  // Action handlers
  const handleActionSubmit = (actionType: string) => {
    setActiveDialog(null);
    setIsProcessing(true);
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
  };

  // Initiation Task Approve Handler
  const handleInitiationApprove = (taskIndex: number) => {
    setProcessingMessages([
      "Processing approval...",
      "Updating task status...",
      "Activating next task...",
      "Saving changes..."
    ]);
    setIsProcessing(true);

    setTimeout(() => {
      setInitiationTaskStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[taskIndex] = "Completed";
        if (taskIndex + 1 < newStatuses.length) {
          newStatuses[taskIndex + 1] = "In Progress";
        }
        return newStatuses;
      });

      // Scroll to next task
      if (taskIndex + 1 < initiationTaskStatuses.length) {
        const nextTaskElement = document.getElementById(`initiation-task-${taskIndex + 2}`);
        if (nextTaskElement) {
          nextTaskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 2100);
  };

  // Validation function for Item 1: At least one discipline must have team member assigned (not N/A)
  const validateAssignedDisciplines = (disciplines: TechnicalDiscipline[]): boolean => {
    return disciplines.some(d => d.teamMember !== null && !d.notApplicable);
  };

  // Transformation function: Build approval rows from assigned disciplines
  const buildApprovalRowsFromDisciplines = (disciplines: TechnicalDiscipline[]): TechnicalReviewApprovalRow[] => {
    return disciplines
      .filter(d => !d.notApplicable && d.teamMember !== null) // Exclude N/A even if team member selected
      .map(d => {
        const teamMember = AVAILABLE_PEOPLE.find(p => p.id === d.teamMember);
        return {
          id: `approval-${d.id}`,
          discipline: d.name,
          taTeam: teamMember?.name || '',
          directManager: d.directManager || '',
          status: null,
          remark: ''
        };
      });
  };

  // Review Task Approve Handler
  const handleReviewApprove = (taskIndex: number) => {
    // Item 1: Validate before submission
    if (taskIndex === 0) {
      if (!validateAssignedDisciplines(reviewDisciplines)) {
        alert('Please assign at least one team member to a discipline (without marking it as Not Applicable) before submitting.');
        return;
      }
    }

    setProcessingMessages([
      "Processing approval...",
      "Updating task status...",
      "Activating next task...",
      "Saving changes..."
    ]);
    setIsProcessing(true);

    setTimeout(() => {
      setReviewTaskStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[taskIndex] = "Completed";
        if (taskIndex + 1 < newStatuses.length) {
          newStatuses[taskIndex + 1] = "In Progress";
        }
        return newStatuses;
      });

      // Item 1: Sync assigned disciplines to Item 2 approval rows
      if (taskIndex === 0) {
        const filteredRows = buildApprovalRowsFromDisciplines(reviewDisciplines);
        setReviewApprovalRows(filteredRows);
      }

      // Scroll to next task
      if (taskIndex + 1 < reviewTaskStatuses.length) {
        const nextTaskElement = document.getElementById(`review-task-${taskIndex + 2}`);
        if (nextTaskElement) {
          nextTaskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 2100);
  };

  const handleTaskClick = (task: any, formType?: string) => {
    if (!onNavigateToForm) return;

    // If formType is provided (from subtask), use it directly
    if (formType) {
      if (formType === "psi-checklist") {
        onNavigateToForm("psi-checklist");
      } else if (formType === "preliminary-safety") {
        onNavigateToForm("preliminary-safety");
      } else if (formType === "she-assessment") {
        onNavigateToForm("she-assessment");
      }
      return;
    }

    // Otherwise, check task name
    const taskName = task.taskName.toLowerCase();

    if (taskName.includes("process safety information") || taskName.includes("psi checklist")) {
      onNavigateToForm("psi-checklist");
    } else if (taskName.includes("preliminary safety")) {
      onNavigateToForm("preliminary-safety");
    } else if (taskName.includes("she assessment")) {
      onNavigateToForm("she-assessment");
    }
  }; const ReadOnlyField = ({ label, value, multiline = false }: { label: string, value: string | number, multiline?: boolean }) => (
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
    <div className="max-w-4xl mx-auto pb-32 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-[#68737D] hover:text-[#1C1C1E] flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Status:</span>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
            Pending Review
          </span>
        </div>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden">
        <div className="p-8 sm:p-10 space-y-10">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1C1C1E] mb-1 truncate">{data.mocTitle}</h2>
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
              <div className="grid sm:grid-cols-2 gap-6">
                <ReadOnlyField label="Area" value={getAreaName(data.areaId)} />
                <ReadOnlyField label="Unit" value={getUnitName(data.areaId, data.unitId)} />
              </div>
              {(() => {
                const priority = PRIORITY_OPTIONS.find(p => p.id === data.priorityId);
                const isEmergency = priority?.name === "Emergency" || false;

                return (
                  <>
                    {/* Enhanced Priority Field */}
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-medium text-[#68737D]">Priority of Change</Label>
                      {!priority ? (
                        <div className="text-sm text-gray-500">Unknown</div>
                      ) : (
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
                      )}
                    </div>
                    {!isEmergency && data.typeOfChange && data.lengthOfChange && (
                      <div className="grid sm:grid-cols-2 gap-6">
                        <ReadOnlyField label="Type of Change" value={getTypeOfChangeName(data.typeOfChange)} />
                        <ReadOnlyField label="Length of Change" value={getLengthOfChangeName(data.lengthOfChange)} />
                      </div>
                    )}
                  </>
                );
              })()}
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
            </div>
          </section>

          {/* Estimated Benefit / Cost */}
          <section id="section-benefit-cost" className="space-y-6 scroll-mt-24">
            <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
              Estimated Benefit / Cost
            </h3>
            <div className="space-y-6">
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

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Risk Before */}
              <div>
                <Label className="text-[13px] font-medium text-[#68737D] mb-2 block">Risk Assessment Before Change</Label>
                {(() => {
                  const riskStyle = getRiskCodeStyle(data.riskBeforeChange.riskCode || "");
                  return (
                    <div className="p-5 border rounded-xl bg-[#F7F8FA] border-[#E5E7EB]">
                      <span
                        style={riskStyle}
                        className="inline-block px-4 py-2 rounded-lg font-bold text-lg"
                      >
                        {data.riskBeforeChange.riskCode || "N/A"}
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Risk After */}
              <div>
                <Label className="text-[13px] font-medium text-[#68737D] mb-2 block">Risk Assessment After Change</Label>
                {(() => {
                  const riskStyle = getRiskCodeStyle(data.riskAfterChange.riskCode || "");
                  return (
                    <div className="p-5 border rounded-xl bg-[#F7F8FA] border-[#E5E7EB]">
                      <span
                        style={riskStyle}
                        className="inline-block px-4 py-2 rounded-lg font-bold text-lg"
                      >
                        {data.riskAfterChange.riskCode || "N/A"}
                      </span>
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
              <div className="space-y-6">
                {["Technical Information", "Minute of Meeting", "Other Documents"].map((category: string) => {
                  const categoryFiles = data.attachments.filter((f: any) => f.category === category);
                  if (categoryFiles.length === 0) return null;

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[13px] font-medium text-[#1C1C1E]">{category}</label>
                        <span className="text-xs text-[#68737D] bg-gray-100 px-2 py-1 rounded">
                          {categoryFiles.length} file{categoryFiles.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="border border-[#E5E7EB] rounded-lg divide-y divide-[#E5E7EB]">
                        {categoryFiles.map((file: any) => (
                          <div key={file.id} className="flex items-center p-3 hover:bg-[#F7F8FA] transition-colors">
                            <FileText className="w-5 h-5 text-[#68737D] mr-3" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1C1C1E] truncate">{file.fileName}</p>
                              <p className="text-xs text-[#68737D]">{formatFileSize(file.fileSize)}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-[#006699] shrink-0 ml-2">
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No documents attached</div>
            )}
          </section>


        </div>
      </div>

      {/* Step 1: Initiation Approval Section */}
      {step === 1 && (
        <div className="overflow-hidden" margintop="30x" style={{ marginTop: '20px' }}>
          <div className="">
            {/* PartTasks Section */}
            <section id="part-tasks-step1" className="mt-8 space-y-6">


              {/* Task 1: Initial Review and approve MOC Request */}
              <div id="initiation-task-1">
                <InitiationApprovalCard
                  itemNumber={1}
                  taskName="Initial Review and approve MOC Request"
                  role="Direct Manager of Requester"
                  assignedTo="Chatree Dechabumphen (บค.วบก.)"
                  assignedOn="15/01/2024 10:00"
                  status={initiationTaskStatuses[0]}
                  comments={initiationTask1Comments}
                  attachments={[]}
                  onCommentsChange={setInitiationTask1Comments}
                  onApprove={() => handleInitiationApprove(0)}
                  onReject={() => console.log("Task 1 Rejected")}
                  onSaveDraft={() => console.log("Task 1 Draft Saved")}
                  onDiscard={() => console.log("Task 1 Discarded")}
                  onRevise={() => console.log("Task 1 Revised")}
                />
              </div>

              {/* Task 2: Assign Project Engineer */}
              <div id="initiation-task-2">
                <AssignProjectEngineerCard
                  itemNumber={2}
                  taskName="Assign Project Engineer"
                  role="Division Manager"
                  assignedTo="Chatree Dechabumphen (บค.วบก.)"
                  assignedOn="15/01/2024 11:00"
                  status={initiationTaskStatuses[1]}
                  selectedEngineer={initiationTask2SelectedEngineer}
                  availableEngineers={AVAILABLE_PEOPLE}
                  comments={initiationTask2Comments}
                  attachments={[]}
                  onEngineerChange={setInitiationTask2SelectedEngineer}
                  onCommentsChange={setInitiationTask2Comments}
                  onApprove={() => handleInitiationApprove(1)}
                  onReject={() => console.log("Task 2 Rejected")}
                  onSaveDraft={() => console.log("Task 2 Draft Saved")}
                  onDiscard={() => console.log("Task 2 Discarded")}
                  onRevise={() => console.log("Task 2 Revised")}
                />
              </div>

              {/* Task 3: Review and Approve MOC Request */}
              <div id="initiation-task-3">
                <ApproveWithPECard
                  itemNumber={3}
                  taskName="Review and Approve MOC Request"
                  role="VP Operation"
                  assignedTo={initiationTask2SelectedEngineer ? AVAILABLE_PEOPLE.find(p => p.id === initiationTask2SelectedEngineer)?.name || "TBD" : "TBD"}
                  assignedOn="15/01/2024 12:00"
                  status={initiationTaskStatuses[2]}
                  selectedEngineer={initiationTask2SelectedEngineer ? AVAILABLE_PEOPLE.find(p => p.id === initiationTask2SelectedEngineer)?.name || "Chatree Dechabumphen (บค.วบก.)" : "Chatree Dechabumphen (บค.วบก.)"}
                  comments={initiationTask3Comments}
                  attachments={[]}
                  onCommentsChange={setInitiationTask3Comments}
                  onApprove={() => handleInitiationApprove(2)}
                  onReject={() => console.log("Task 3 Rejected")}
                  onSaveDraft={() => console.log("Task 3 Draft Saved")}
                  onDiscard={() => console.log("Task 3 Discarded")}
                  onRevise={() => console.log("Task 3 Revised")}
                />
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Step 2: Review & Approval Section */}
      {step === 2 && (
        <div className="overflow-hidden" margintop="30x" style={{ marginTop: '20px' }}>
          <div className="">
            {/* PartTasks Section */}
            <section id="part-tasks-step2" className="mt-8 space-y-6">


              {/* Task 1: Assign Technical Review Team */}
              <div id="review-task-1">
                <AssignTechReviewTeamCard
                  itemNumber={1}
                  taskName="Assign Technical Review Team"
                  role="Project Engineer"
                  assignedTo="Chatree Dechabumphen (บค.วบก.)"
                  assignedOn="16/01/2024 09:30"
                  status={reviewTaskStatuses[0]}
                  disciplines={reviewDisciplines}
                  availableTeamMembers={AVAILABLE_PEOPLE}
                  comments={reviewTask1Comments}
                  attachments={[]}
                  onDisciplineChange={(disciplineId, teamMemberId) => {
                    setReviewDisciplines(prev =>
                      prev.map(d => d.id === disciplineId ? { ...d, teamMember: teamMemberId } : d)
                    );
                  }}
                  onNotApplicableChange={(disciplineId, notApplicable) => {
                    setReviewDisciplines(prev =>
                      prev.map(d => d.id === disciplineId ? { ...d, notApplicable } : d)
                    );
                  }}
                  onCommentsChange={setReviewTask1Comments}
                  onSubmit={() => handleReviewApprove(0)}
                  onSaveDraft={() => console.log("Task 1 Draft Saved")}
                  onDiscard={() => console.log("Task 1 Discarded")}
                />
              </div>

              {/* Task 2: Approve Technical Review Team */}
              <div id="review-task-2">
                <ApproveTechReviewTeamCard
                  itemNumber={2}
                  taskName="Approve Technical Review Team"
                  role="Relevant Managers"
                  assignedTo="Chatree Dechabumphen (บค.วบก.)"
                  assignedOn="16/01/2024 16:00"
                  status={reviewTaskStatuses[1]}
                  approvalRows={reviewApprovalRows}
                  availableTeamMembers={AVAILABLE_PEOPLE}
                  comments={reviewTask2Comments}
                  attachments={[]}
                  onTeamMemberChange={(rowId, teamMemberId) => {
                    setReviewApprovalRows(prev =>
                      prev.map(r => r.id === rowId ? { ...r, taTeam: AVAILABLE_PEOPLE.find(p => p.id === teamMemberId)?.name || r.taTeam } : r)
                    );
                  }}
                  onStatusChange={(rowId, status) => {
                    setReviewApprovalRows(prev =>
                      prev.map(r => r.id === rowId ? { ...r, status } : r)
                    );
                  }}
                  onRemarkChange={(rowId, remark) => {
                    setReviewApprovalRows(prev =>
                      prev.map(r => r.id === rowId ? { ...r, remark } : r)
                    );
                  }}
                  onCommentsChange={setReviewTask2Comments}
                  onApprove={() => handleReviewApprove(1)}
                  onReject={() => {
                    setReviewTaskStatuses(prev => {
                      const newStatuses = [...prev];
                      newStatuses[1] = "Rejected";
                      return newStatuses;
                    });
                  }}
                  onSaveDraft={() => console.log("Review Task 2: Save Draft")}
                  onDiscard={() => {
                    setReviewTaskStatuses(prev => {
                      const newStatuses = [...prev];
                      newStatuses[1] = "In Progress";
                      return newStatuses;
                    });
                  }}
                  onRevise={() => console.log("Review Task 2: Revise")}
                />
              </div>

              {/* Task 3: Perform Technical Review */}
              <div id="review-task-3">
                <PerformTechReviewCard
                  itemNumber={3}
                  taskName="Perform Technical Review"
                  role="Project Engineer"
                  assignedTo="Chatree Dechabumphen (บค.วบก.)"
                  assignedOn="16/01/2024 11:30"
                  status={reviewTaskStatuses[2]}
                  documents={reviewDocuments}
                  comments={reviewTask3Comments}
                  attachments={[]}
                  onDocumentClick={(documentId) => {
                    const doc = reviewDocuments.find(d => d.id === documentId);
                    if (doc && doc.formType) {
                      if (onNavigateToForm) {
                        onNavigateToForm(doc.formType);
                      }
                    }
                  }}
                  onCommentsChange={setReviewTask3Comments}
                  onSubmit={() => handleReviewApprove(2)}
                  onSaveDraft={() => console.log("Task 3 Draft Saved")}
                  onDiscard={() => console.log("Task 3 Discarded")}
                />
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Change MOC Champion Dialog */}
      <ChangeMOCChampionDialog
        isOpen={activeDialog === 'changeMOCChampion'}
        onClose={() => setActiveDialog(null)}
        onSubmit={(data) => {
          setProcessingMessages([
            "Processing change request...",
            "Notifying current champion...",
            "Updating responsibilities...",
            "Sending notification to new champion...",
            "Updating MOC records..."
          ]);
          handleActionSubmit('changeMOCChampion');
        }}
        currentChampion={data?.requesterName || "Current Champion"}
      />

      {/* Extend Temporary Dialog */}
      <ExtendTemporaryDialog
        isOpen={activeDialog === 'extendTemporary'}
        onClose={() => setActiveDialog(null)}
        onSubmit={() => {
          setProcessingMessages([
            "Processing extension request...",
            "Validating new timeline...",
            "Updating MOC schedule...",
            "Notifying stakeholders...",
            "Finalizing extension..."
          ]);
          handleActionSubmit('extendTemporary');
        }}
      />

      {/* Change Team Dialog */}
      <ChangeTeamDialog
        isOpen={activeDialog === 'changeTeam'}
        onClose={() => setActiveDialog(null)}
        onSubmit={(data) => {
          setProcessingMessages([
            "Processing team change...",
            "Transferring documentation...",
            "Updating area assignments...",
            "Notifying new team...",
            "Finalizing team transfer..."
          ]);
          handleActionSubmit('changeTeam');
        }}
        currentArea={getAreaName(data?.areaId || 'area-1')}
        currentUnit={getUnitName(data?.areaId || 'area-1', data?.unitId || 'unit-1-1')}
      />

      {/* Cancel MOC Dialog */}
      <CancelMOCDialog
        isOpen={activeDialog === 'cancelMOC'}
        onClose={() => setActiveDialog(null)}
        onSubmit={(data) => {
          setProcessingMessages([
            "Processing cancellation...",
            "Notifying all stakeholders...",
            "Archiving MOC documentation...",
            "Updating MOC status...",
            "Finalizing cancellation..."
          ]);
          handleActionSubmit('cancelMOC');
        }}
        mocNo={id || 'MOC-Unknown'}
        mocTitle={data?.mocTitle || 'Unknown MOC'}
      />

      {/* Processing Overlay */}
      <ProcessingOverlay
        isVisible={isProcessing}
        onComplete={handleProcessingComplete}
        messages={processingMessages}
      />
    </div>
  );
};

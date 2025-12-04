// eMoC System Data Types

export type WorkflowState = 
  | "Draft" 
  | "Submitted" 
  | "In Review" 
  | "Approved" 
  | "Rejected" 
  | "In Implementation" 
  | "Closed";

export type WorkflowStage = "Initiation" | "Review" | "Implementation" | "Closeout";

export type LikelihoodValue = 1 | 2 | 3 | 4;
export type ImpactValue = 1 | 2 | 3 | 4;
export type RiskScore = number;
export type RiskLevel = "Low" | "Medium" | "High" | "Extreme";

export interface RiskAssessment {
  likelihood: LikelihoodValue | null;
  likelihoodLabel: string;
  impact: ImpactValue | null;
  impactLabel: string;
  score: RiskScore;
  level: RiskLevel | null;
}

export type FileCategory = "Technical Information" | "Minute of Meeting" | "Other Documents";

export interface FileAttachment {
  id: string;
  category: FileCategory;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  uploadedBy: string;
  url?: string;
}

export interface AreaOption {
  id: string;
  name: string;
  units: UnitOption[];
}

export interface UnitOption {
  id: string;
  name: string;
  areaId: string;
}

export interface TPMLossTypeOption {
  id: string;
  name: string;
}

export interface PriorityOption {
  id: string;
  name: string;
  level: number;
}

export interface LengthOfChange {
  years: number;
  months: number;
  days: number;
}

export interface InitiationFormData {
  // Read-only fields
  requesterName: string;
  requestDate: string;

  // General Information
  mocTitle: string;
  areaId: string;
  unitId: string;
  priorityId: string;  // Default: "priority-1" (Normal)
  lengthOfChange?: string;  // Hidden if Emergency
  typeOfChange?: string;    // Hidden if Emergency or Overriding
  estimatedDurationStart: string;
  estimatedDurationEnd: string;
  tpmLossType: string;
  lossEliminateValue: number;

  // Change Details
  detailOfChange: string;
  reasonForChange: string;
  scopeOfWork: string;

  // Estimated Benefit / Cost
  estimatedBenefit: number;  // Replaces benefitsValue
  estimatedCost: number;     // Replaces costEstimated
  benefits: string[];        // Checkboxes
  expectedBenefits: string;

  // Review of Change
  riskBeforeChange: RiskAssessment;
  riskAfterChange: RiskAssessment;

  // Attachments
  attachments: FileAttachment[];
}

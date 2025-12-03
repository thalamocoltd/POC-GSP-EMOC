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
  mocTitle: string;
  areaId: string;
  unitId: string;
  background: string;
  impact: string;
  tpmLossTypeId: string;
  lossEliminateValue: number;
  scopeOfWork: string;
  benefit: string;
  benefitValue: number;
  lengthOfChange: LengthOfChange;
  priorityId: string;
  preliminaryReview: string;
  investment: number;
  riskBeforeChange: RiskAssessment;
  riskAfterChange: RiskAssessment;
  attachments: {
    technicalInformation: FileAttachment[];
    minuteOfMeeting: FileAttachment[];
    otherDocuments: FileAttachment[];
  };
}

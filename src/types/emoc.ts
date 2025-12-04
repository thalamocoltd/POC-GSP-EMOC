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

// NEW: Types for industry-standard risk assessment
export type LikelihoodLetter = "A" | "B" | "C" | "D";
export type SeverityLevel = "Minor" | "Moderate" | "Major" | "Catastrophic";
export type RiskCode = string;

export interface RiskAssessment {
  likelihood: LikelihoodValue | null;
  likelihoodLabel: string;
  likelihoodLetter?: LikelihoodLetter;  // NEW: A, B, C, D
  impact: ImpactValue | null;
  impactLabel: string;
  severityLevel?: SeverityLevel;  // NEW: Minor, Moderate, Major, Catastrophic
  score: RiskScore;
  level: RiskLevel | null;
  riskCode?: string;  // NEW: L1, M6, H12, E16
}

// NEW: Severity/Consequence descriptions
export interface SeverityDescription {
  level: SeverityLevel;
  numericValue: ImpactValue;
  people: string;
  assets: string;
  environmentCommunity: string;
  security: string;
}

// NEW: Probability descriptions
export interface ProbabilityDescription {
  level: LikelihoodLetter;
  numericValue: LikelihoodValue;
  label: string;
  description: string;
}

export type FileCategory =
  | "Technical Information"
  | "Minute of Meeting"
  | "Other Documents"
  | "Temp1"
  | "Temp2"
  | "Temp3";

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

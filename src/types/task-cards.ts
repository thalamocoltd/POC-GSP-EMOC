// Task Card Type Definitions for MOC Workflow

export type TaskStatus = "In Progress" | "Completed" | "Rejected" | "Not Started";
export type DocumentReviewStatus = "Not Started" | "In Progress" | "Completed";
export type ApprovalStatus = "Approved" | "Rejected" | null;

export interface PersonOption {
  id: string;
  name: string;
  role?: string;
}

export interface TaskCardBaseProps {
  itemNumber: number;
  taskName: string;
  role: string;
  assignedTo: string;
  assignedOn: string;
  status: TaskStatus;
}

export interface TechnicalDiscipline {
  id: string;
  name: string;
  teamMember: string | null;
  directManager?: string;
  notApplicable: boolean;
  status?: ApprovalStatus;
  remark?: string;
}

export interface DocumentReviewItem {
  id: string;
  name: string;
  status: DocumentReviewStatus;
  formType?: "psi-checklist" | "preliminary-safety" | "she-assessment" | "govt-verification";
}

export interface TechnicalReviewApprovalRow {
  id: string;
  discipline: string;
  taTeam: string;
  directManager: string;
  status: ApprovalStatus;
  remark: string;
}

export interface InitiationApprovalCardProps extends TaskCardBaseProps {
  comments: string;
  attachments: string[];
  onCommentsChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onRevise: () => void;
}

export interface AssignProjectEngineerCardProps extends TaskCardBaseProps {
  selectedEngineer: string | null;
  availableEngineers: PersonOption[];
  comments: string;
  attachments: string[];
  onEngineerChange: (engineerId: string) => void;
  onCommentsChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onRevise: () => void;
}

export interface ApproveWithPECardProps extends TaskCardBaseProps {
  selectedEngineer: string;
  comments: string;
  attachments: string[];
  onCommentsChange: (value: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onRevise: () => void;
}

export interface AssignTechReviewTeamCardProps extends TaskCardBaseProps {
  disciplines: TechnicalDiscipline[];
  availableTeamMembers: PersonOption[];
  comments: string;
  attachments: string[];
  onDisciplineChange: (disciplineId: string, teamMemberId: string | null) => void;
  onNotApplicableChange: (disciplineId: string, notApplicable: boolean) => void;
  onCommentsChange: (value: string) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
}

export interface ApproveTechReviewTeamCardProps extends TaskCardBaseProps {
  approvalRows: TechnicalReviewApprovalRow[];
  availableTeamMembers: PersonOption[];
  comments: string;
  attachments: string[];
  onTeamMemberChange: (rowId: string, teamMemberId: string) => void;
  onStatusChange: (rowId: string, status: ApprovalStatus) => void;
  onRemarkChange: (rowId: string, remark: string) => void;
  onCommentsChange: (value: string) => void;
}

export interface PerformTechReviewCardProps extends TaskCardBaseProps {
  documents: DocumentReviewItem[];
  comments: string;
  attachments: string[];
  onDocumentClick: (documentId: string) => void;
  onCommentsChange: (value: string) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
}

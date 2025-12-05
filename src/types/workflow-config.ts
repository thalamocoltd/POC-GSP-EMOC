// Workflow Configuration Types

export type ItemTemplateType =
  | "Approve"
  | "Review and Approve"
  | "Assign"
  | "Perform Technical Review"
  | "Custom";

export interface WorkflowAction {
  id: string;
  display: string;      // Approve, Reject, Save Draft, Discard, Revise, Submit
  label: string;        // Custom button label
  nextStep: string;     // Item ID or "next-part" or "end"
}

export interface WorkflowAttachment {
  id: string;
  name: string;
  templateUrl: string;
  required: boolean;
}

export interface WorkflowItem {
  id: string;
  itemNo: number;
  title: string;
  description: string;
  itemTemplate: ItemTemplateType;
  role: string;
  attachments: WorkflowAttachment[];
  actions: WorkflowAction[];
  partId: string;
}

export interface WorkflowPart {
  id: string;
  partNo: number;
  partName: string;     // Initiation, Review, Implementation, Closeout
  items: WorkflowItem[];
  templateId: string;
}

export interface FormTemplate {
  id: string;
  formNo: number;
  formName: string;
  typeOfChange: string;
  lengthOfChange: string;
  parts: WorkflowPart[];
}

export interface WorkflowTemplateData {
  templates: FormTemplate[];
}

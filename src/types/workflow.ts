export type TaskStatus = "In Progress" | "Completed" | "Rejected" | "Not Started";

export interface SubTask {
  id: string;
  label: string;
  formType: "psi-checklist" | "preliminary-safety" | "she-assessment";
  status: TaskStatus;
}

export interface Task {
  id: string;
  taskName: string;
  role: string;
  assignedTo: string;
  assignedOn: string | null;
  completedOn: string | null;
  status: TaskStatus;
  comments: string;
  attachments: string[];
  actions: string[];
  subTasks?: SubTask[];
}

export type TaskCardStage = "editable" | "readonly" | "disabled";

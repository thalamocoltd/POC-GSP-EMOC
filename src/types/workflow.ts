export type TaskStatus = "In Progress" | "Completed" | "Rejected" | "Not Started";

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
}

export type TaskCardStage = "editable" | "readonly" | "disabled";

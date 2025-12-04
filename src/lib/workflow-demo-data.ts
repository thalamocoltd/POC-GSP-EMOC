import { Task } from "../types/workflow";

export const INITIATION_TASKS: Task[] = [
  {
    id: "task-1-1",
    taskName: "Item 1: Initial Review and approve MOC Request",
    role: "Direct Manager of Requester",
    assignedTo: "Alice Johnson",
    assignedOn: "28/05/2024 14:30",
    completedOn: null,
    status: "In Progress",
    comments: "",
    attachments: [],
    actions: ["Approve", "Reject", "Save Draft", "Discard"]
  },
  {
    id: "task-1-2",
    taskName: "Item 2: Review and Approve MOC Request",
    role: "Division Manager",
    assignedTo: "Bob Smith",
    assignedOn: null,
    completedOn: null,
    status: "Not Started",
    comments: "",
    attachments: [],
    actions: []
  },
  {
    id: "task-1-3",
    taskName: "Item 3: Review and Approve MOC Request",
    role: "VP Operation",
    assignedTo: "Carol Davis",
    assignedOn: null,
    completedOn: null,
    status: "Not Started",
    comments: "",
    attachments: [],
    actions: []
  }
];

export const REVIEW_TASKS: Task[] = [
  {
    id: "task-2-1",
    taskName: "Item 1: Technical Review",
    role: "Technical Manager",
    assignedTo: "Mike Wilson",
    assignedOn: "30/05/2024 09:00",
    completedOn: null,
    status: "In Progress",
    comments: "Reviewing technical specifications...",
    attachments: [],
    actions: ["Approve", "Reject", "Save Draft", "Discard"]
  },
  {
    id: "task-2-2",
    taskName: "Item 2: Safety Review",
    role: "Safety Officer",
    assignedTo: "Sarah Johnson",
    assignedOn: null,
    completedOn: null,
    status: "Not Started",
    comments: "",
    attachments: [],
    actions: []
  }
];

export const IMPLEMENTATION_TASKS: Task[] = [
  {
    id: "task-3-1",
    taskName: "Item 1: Implementation Execution",
    role: "Project Manager",
    assignedTo: "David Lee",
    assignedOn: "02/06/2024 08:00",
    completedOn: null,
    status: "In Progress",
    comments: "Coordinating work with field team...",
    attachments: ["work-plan.pdf"],
    actions: ["Approve", "Reject", "Save Draft", "Discard"]
  },
  {
    id: "task-3-2",
    taskName: "Item 2: Testing & Commissioning",
    role: "Quality Assurance",
    assignedTo: "Emma Davis",
    assignedOn: null,
    completedOn: null,
    status: "Not Started",
    comments: "",
    attachments: [],
    actions: []
  }
];

export const CLOSEOUT_TASKS: Task[] = [
  {
    id: "task-4-1",
    taskName: "Item 1: Final Documentation Review",
    role: "Operations Manager",
    assignedTo: "Robert Chen",
    assignedOn: "10/06/2024 14:00",
    completedOn: null,
    status: "In Progress",
    comments: "Verifying all documentation is complete...",
    attachments: ["as-built-drawings.pdf"],
    actions: ["Approve", "Reject", "Save Draft", "Discard"]
  },
  {
    id: "task-4-2",
    taskName: "Item 2: Handover & Training",
    role: "Training Coordinator",
    assignedTo: "Lisa Martinez",
    assignedOn: null,
    completedOn: null,
    status: "Not Started",
    comments: "",
    attachments: [],
    actions: []
  }
];

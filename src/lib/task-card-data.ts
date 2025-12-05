import { PersonOption, TechnicalDiscipline, DocumentReviewItem, TechnicalReviewApprovalRow } from "../types/task-cards";

// Available People/Engineers List
export const AVAILABLE_PEOPLE: PersonOption[] = [
  { id: "p1", name: "Robert Chen", role: "Direct Manager" },
  { id: "p2", name: "Sarah Williams", role: "Division Manager" },
  { id: "p3", name: "David Thompson", role: "VP Operation" },
  { id: "p4", name: "Michael Anderson", role: "Project Engineer" },
  { id: "p5", name: "Thomas Wilson", role: "Electrical Engineering" },
  { id: "p6", name: "Jennifer Martinez", role: "Mechanical Engineering" },
  { id: "p7", name: "Ozaki Furugori", role: "Control & Instrument" },
  { id: "p8", name: "Emily Wong", role: "Manager" },
  { id: "p9", name: "Karen Williams", role: "Manager" },
  { id: "p10", name: "James Harris", role: "Senior Engineer" },
  { id: "p11", name: "Lisa Anderson", role: "Technical Lead" },
  { id: "p12", name: "Mark Johnson", role: "Maintenance Lead" },
  { id: "p13", name: "Susan Chen", role: "SHE Coordinator" },
  { id: "p14", name: "Peter Brown", role: "Operations Lead" },
];

// Technical Review Disciplines (8 total)
export const TECHNICAL_DISCIPLINES: TechnicalDiscipline[] = [
  {
    id: "d1",
    name: "Electrical Engineering",
    teamMember: "p5", // Thomas Wilson
    directManager: "Emily Wong",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d2",
    name: "Mechanical Engineering",
    teamMember: "p6", // Jennifer Martinez
    directManager: "Karen Williams",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d3",
    name: "Control & Instrument Engineering",
    teamMember: null,
    directManager: "",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d4",
    name: "Electrical Maintenance",
    teamMember: null,
    directManager: "",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d5",
    name: "Mechanical Maintenance",
    teamMember: null,
    directManager: "",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d6",
    name: "Control & Instrument Maintenance",
    teamMember: null,
    directManager: "",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d7",
    name: "Operation",
    teamMember: null,
    directManager: "",
    notApplicable: false,
    status: null,
    remark: "",
  },
  {
    id: "d8",
    name: "SHE",
    teamMember: null,
    directManager: "",
    notApplicable: true,
    status: null,
    remark: "",
  },
];

// Technical Review Approval Rows (for Approve Technical Review Team card)
export const TECHNICAL_REVIEW_APPROVALS: TechnicalReviewApprovalRow[] = [
  {
    id: "a1",
    discipline: "Electrical Engineering",
    taTeam: "Thomas Wilson",
    directManager: "Robert Chen",
    status: null,
    remark: "",
  },
  {
    id: "a2",
    discipline: "Mechanical Engineering",
    taTeam: "Jennifer Martinez",
    directManager: "Karen Williams",
    status: null,
    remark: "",
  },
  {
    id: "a3",
    discipline: "Control & Instrument Engineering",
    taTeam: "Ozaki Furugori",
    directManager: "Emily Wong",
    status: null,
    remark: "",
  },
  {
    id: "a4",
    discipline: "Electrical Maintenance",
    taTeam: "Mark Johnson",
    directManager: "Sarah Williams",
    status: null,
    remark: "",
  },
  {
    id: "a5",
    discipline: "Mechanical Maintenance",
    taTeam: "James Harris",
    directManager: "David Thompson",
    status: null,
    remark: "",
  },
  {
    id: "a6",
    discipline: "Control & Instrument Maintenance",
    taTeam: "Lisa Anderson",
    directManager: "Karen Williams",
    status: null,
    remark: "",
  },
  {
    id: "a7",
    discipline: "Operation",
    taTeam: "Peter Brown",
    directManager: "Sarah Williams",
    status: null,
    remark: "",
  },
  {
    id: "a8",
    discipline: "SHE",
    taTeam: "Susan Chen",
    directManager: "David Thompson",
    status: null,
    remark: "",
  },
];

// Document Review Items (for Perform Technical Review card)
export const DOCUMENT_REVIEW_ITEMS: DocumentReviewItem[] = [
  {
    id: "doc1",
    name: "Click to fill Preliminary Risk Assessment & PHA Review",
    status: "Not Started",
    formType: "preliminary-safety",
  },
  {
    id: "doc2",
    name: "Click to fill Process Safety Information (PSI) Checklist",
    status: "In Progress",
    formType: "psi-checklist",
  },
  {
    id: "doc3",
    name: "Click to fill Government Verification Check List",
    status: "Not Started",
    formType: "govt-verification",
  },
  {
    id: "doc4",
    name: "Click to fill SHE Assessment Check List",
    status: "Completed",
    formType: "she-assessment",
  },
];

// Initiation Task Card Data
export const INITIATION_TASK_CARDS = {
  task1: {
    itemNumber: 1,
    taskName: "Initial Review and approve MOC Request",
    role: "Direct Manager of Requester",
    assignedTo: "Robert Chen",
    assignedOn: "15/01/2024 10:00",
    status: "In Progress" as const,
    comments: "",
    attachments: [],
  },
  task2: {
    itemNumber: 2,
    taskName: "Assign Project Engineer",
    role: "Division Manager",
    assignedTo: "Sarah Williams",
    assignedOn: "15/01/2024 11:00",
    status: "In Progress" as const,
    selectedEngineer: "p4", // Michael Anderson
    comments: "",
    attachments: [],
  },
  task3: {
    itemNumber: 3,
    taskName: "Review and Approve MOC Request",
    role: "VP Operation",
    assignedTo: "David Thompson",
    assignedOn: "15/01/2024 12:00",
    status: "In Progress" as const,
    selectedEngineer: "Michael Anderson", // Display name
    comments: "",
    attachments: [],
  },
};

// Review Task Card Data
export const REVIEW_TASK_CARDS = {
  task1: {
    itemNumber: 1,
    taskName: "Assign Technical Review Team",
    role: "Project Engineer",
    assignedTo: "Michael Anderson",
    assignedOn: "16/01/2024 09:30",
    status: "In Progress" as const,
    disciplines: TECHNICAL_DISCIPLINES,
    comments: "",
    attachments: [],
  },
  task2: {
    itemNumber: 2,
    taskName: "Approve Technical Review Team",
    role: "Relevant Managers",
    assignedTo: "Multiple Managers",
    assignedOn: "16/01/2024 16:00",
    status: "In Progress" as const,
    approvalRows: TECHNICAL_REVIEW_APPROVALS,
    comments: "",
    attachments: [],
  },
  task3: {
    itemNumber: 3,
    taskName: "Perform Technical Review",
    role: "Project Engineer",
    assignedTo: "Michael Anderson",
    assignedOn: "16/01/2024 11:30",
    status: "In Progress" as const,
    documents: DOCUMENT_REVIEW_ITEMS,
    comments: "",
    attachments: [],
  },
};

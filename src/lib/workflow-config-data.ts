import {
  WorkflowTemplateData,
  FormTemplate,
  WorkflowPart,
  WorkflowItem,
  ItemTemplateType,
} from "../types/workflow-config";

// Constants
export const ROLE_OPTIONS = [
  "Direct Manager of Requester",
  "Division Manager",
  "VP Operation",
  "Project Engineer",
  "Relevant Managers",
  "Technical Review Team",
  "VP Area",
  "MoC Champion",
  "Asset Owner"
];

export const ITEM_TEMPLATE_OPTIONS: ItemTemplateType[] = [
  "Approve",
  "Review and Approve",
  "Assign",
  "Perform Technical Review",
  "Custom"
];

export const ACTION_DISPLAY_OPTIONS = [
  "Approve",
  "Reject",
  "Save Draft",
  "Discard",
  "Revise",
  "Submit"
];

// Helper function to generate unique IDs
let idCounter = 0;
export const generateId = (prefix: string = "item"): string => {
  return `${prefix}-${Date.now()}-${++idCounter}`;
};

// Prefilled items for Part 1: Initiation
const createInitiationItems = (partId: string): WorkflowItem[] => [
  {
    id: generateId("initiation-item"),
    itemNo: 1,
    title: "Initial Review and Approve MOC Request",
    description: "Direct manager reviews and approves the MOC request",
    itemTemplate: "Review and Approve",
    role: "Direct Manager of Requester",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Approve",
        label: "Approve",
        nextStep: "next-item"
      },
      {
        id: generateId("action"),
        display: "Reject",
        label: "Reject",
        nextStep: "end"
      }
    ],
    partId
  },
  {
    id: generateId("initiation-item"),
    itemNo: 2,
    title: "Assign Project Engineer",
    description: "Division manager assigns a Project Engineer",
    itemTemplate: "Assign",
    role: "Division Manager",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Approve and Assign",
        label: "Assign Engineer",
        nextStep: "next-item"
      },
      {
        id: generateId("action"),
        display: "Reject",
        label: "Reject",
        nextStep: "end"
      }
    ],
    partId
  },
  {
    id: generateId("initiation-item"),
    itemNo: 3,
    title: "Review and Approve MOC Request",
    description: "VP Operation reviews and provides final approval",
    itemTemplate: "Review and Approve",
    role: "VP Operation",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Approve",
        label: "Approve",
        nextStep: "next-part"
      },
      {
        id: generateId("action"),
        display: "Reject",
        label: "Reject",
        nextStep: "end"
      }
    ],
    partId
  }
];

// Prefilled items for Part 2: Review
const createReviewItems = (partId: string): WorkflowItem[] => [
  {
    id: generateId("review-item"),
    itemNo: 1,
    title: "Assign Technical Review Team",
    description: "Project Engineer assigns members of the technical review team",
    itemTemplate: "Assign",
    role: "Project Engineer",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Assign",
        label: "Assign Team",
        nextStep: "next-item"
      }
    ],
    partId
  },
  {
    id: generateId("review-item"),
    itemNo: 2,
    title: "Approve Technical Review Team",
    description: "Relevant managers review and approve the selected team",
    itemTemplate: "Approve",
    role: "Relevant Managers",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Approve",
        label: "Approve",
        nextStep: "next-item"
      },
      {
        id: generateId("action"),
        display: "Reject",
        label: "Request Changes",
        nextStep: "previous-item"
      }
    ],
    partId
  },
  {
    id: generateId("review-item"),
    itemNo: 3,
    title: "Perform Technical Review",
    description: "Project Engineer coordinates the technical review process",
    itemTemplate: "Perform Technical Review",
    role: "Project Engineer",
    attachments: [
      {
        id: generateId("attachment"),
        name: "Preliminary Safety Assessment",
        templateUrl: "/templates/preliminary-safety.pdf",
        required: true
      },
      {
        id: generateId("attachment"),
        name: "Process Safety Information Checklist",
        templateUrl: "/templates/psi-checklist.pdf",
        required: true
      },
      {
        id: generateId("attachment"),
        name: "SHE Assessment",
        templateUrl: "/templates/she-assessment.pdf",
        required: false
      }
    ],
    actions: [
      {
        id: generateId("action"),
        display: "Submit",
        label: "Submit Review",
        nextStep: "next-item"
      },
      {
        id: generateId("action"),
        display: "Save Draft",
        label: "Save Draft",
        nextStep: "current"
      }
    ],
    partId
  },
  {
    id: generateId("review-item"),
    itemNo: 4,
    title: "Review and Approve Technical Design Package",
    description: "Technical Review Team reviews and approves the design package",
    itemTemplate: "Approve",
    role: "Technical Review Team",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Approve",
        label: "Approve",
        nextStep: "next-item"
      },
      {
        id: generateId("action"),
        display: "Reject",
        label: "Reject",
        nextStep: "previous-item"
      }
    ],
    partId
  },
  {
    id: generateId("review-item"),
    itemNo: 5,
    title: "Review and Approve for Implementation",
    description: "VP Area provides final approval to proceed with implementation",
    itemTemplate: "Approve",
    role: "VP Area",
    attachments: [],
    actions: [
      {
        id: generateId("action"),
        display: "Approve",
        label: "Approve",
        nextStep: "next-part"
      },
      {
        id: generateId("action"),
        display: "Reject",
        label: "Reject",
        nextStep: "end"
      }
    ],
    partId
  }
];

// Create parts structure for each template
const createParts = (templateId: string): WorkflowPart[] => {
  const initiationPartId = generateId("part");
  const reviewPartId = generateId("part");
  const implementationPartId = generateId("part");
  const closeoutPartId = generateId("part");

  return [
    {
      id: initiationPartId,
      partNo: 1,
      partName: "Initiation",
      items: createInitiationItems(initiationPartId),
      templateId
    },
    {
      id: reviewPartId,
      partNo: 2,
      partName: "Review",
      items: createReviewItems(reviewPartId),
      templateId
    },
    {
      id: implementationPartId,
      partNo: 3,
      partName: "Implementation",
      items: [],
      templateId
    },
    {
      id: closeoutPartId,
      partNo: 4,
      partName: "Closeout",
      items: [],
      templateId
    }
  ];
};

// 9 Workflow Templates
export const INITIAL_WORKFLOW_DATA: WorkflowTemplateData = {
  templates: [
    {
      id: generateId("template"),
      formNo: 1,
      formName: "Plant Change - Permanent",
      typeOfChange: "Plant Change (Impact PSI Cat 1,2,3)",
      lengthOfChange: "Permanent",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 2,
      formName: "Plant Change - Temporary",
      typeOfChange: "Plant Change (Impact PSI Cat 1,2,3)",
      lengthOfChange: "Temporary",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 3,
      formName: "Maintenance Change - Permanent",
      typeOfChange: "Maintenance Change",
      lengthOfChange: "Permanent",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 4,
      formName: "Maintenance Change - Temporary",
      typeOfChange: "Maintenance Change",
      lengthOfChange: "Temporary",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 5,
      formName: "Process Change - Permanent",
      typeOfChange: "Process Change (No Impact PSI Cat 1,2,3)",
      lengthOfChange: "Permanent",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 6,
      formName: "Process Change - Temporary",
      typeOfChange: "Process Change (No Impact PSI Cat 1,2,3)",
      lengthOfChange: "Temporary",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 7,
      formName: "Override - More than 3 days",
      typeOfChange: "Override",
      lengthOfChange: "More than 3 days",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 8,
      formName: "Override - Less than 3 days",
      typeOfChange: "Override",
      lengthOfChange: "Less than 3 days",
      parts: createParts(generateId("template"))
    },
    {
      id: generateId("template"),
      formNo: 9,
      formName: "Emergency",
      typeOfChange: "Emergency",
      lengthOfChange: "N/A",
      parts: createParts(generateId("template"))
    }
  ]
};

// Helper: Get color class for Type of Change
export const getTypeOfChangeColor = (typeOfChange: string): string => {
  switch (typeOfChange) {
    case "Plant Change (Impact PSI Cat 1,2,3)":
      return "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-200";
    case "Maintenance Change":
      return "bg-purple-100 text-purple-700 border-transparent hover:bg-purple-200";
    case "Process Change (No Impact PSI Cat 1,2,3)":
      return "bg-green-100 text-green-700 border-transparent hover:bg-green-200";
    case "Override":
      return "bg-red-100 text-red-700 border-transparent hover:bg-red-200";
    case "Emergency":
      return "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-200";
    default:
      return "bg-gray-100 text-gray-600 border-transparent";
  }
};

// Helper: Get color class for Length of Change
export const getLengthOfChangeColor = (lengthOfChange: string): string => {
  switch (lengthOfChange) {
    case "Permanent":
      return "bg-green-100 text-green-700 border-transparent hover:bg-green-200";
    case "Temporary":
      return "bg-amber-100 text-amber-700 border-transparent hover:bg-amber-200";
    case "More than 3 days":
      return "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-200";
    case "Less than 3 days":
      return "bg-yellow-100 text-yellow-700 border-transparent hover:bg-yellow-200";
    case "N/A":
      return "bg-gray-100 text-gray-600 border-transparent";
    default:
      return "bg-gray-100 text-gray-600 border-transparent";
  }
};

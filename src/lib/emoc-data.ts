import { AreaOption, TPMLossTypeOption, PriorityOption, SeverityDescription, ProbabilityDescription } from "../types/emoc";

export const AREA_OPTIONS: AreaOption[] = [
  {
    id: "area-1",
    name: "Production Area A",
    units: [
      { id: "unit-1-1", name: "Production Area A UNIT - 1", areaId: "area-1" },
      { id: "unit-1-2", name: "Production Area A UNIT - 2", areaId: "area-1" },
      { id: "unit-1-3", name: "Production Area A UNIT - 3", areaId: "area-1" }
    ]
  },
  {
    id: "area-2",
    name: "Production Area B",
    units: [
      { id: "unit-2-1", name: "Production Area B UNIT - 1", areaId: "area-2" },
      { id: "unit-2-2", name: "Production Area B UNIT - 2", areaId: "area-2" }
    ]
  },
  {
    id: "area-3",
    name: "Utilities",
    units: [
      { id: "unit-3-1", name: "Utilities UNIT - 1", areaId: "area-3" },
      { id: "unit-3-2", name: "Utilities UNIT - 2", areaId: "area-3" }
    ]
  },
  {
    id: "area-4",
    name: "Storage",
    units: [
      { id: "unit-4-1", name: "Storage UNIT - 1", areaId: "area-4" },
      { id: "unit-4-2", name: "Storage UNIT - 2", areaId: "area-4" }
    ]
  },
  {
    id: "area-5",
    name: "Laboratory",
    units: [
      { id: "unit-5-1", name: "Laboratory UNIT - 1", areaId: "area-5" }
    ]
  }
];

// Length of Change - Conditional options based on Type of Change
export const LENGTH_OF_CHANGE_OPTIONS_STANDARD = [
  { id: "length-1", name: "Permanent" },
  { id: "length-2", name: "Temporary" }
];

export const LENGTH_OF_CHANGE_OPTIONS_OVERRIDE = [
  { id: "length-3", name: "More than 3 days" },
  { id: "length-4", name: "Less than 3 days" }
];

export const LENGTH_OF_CHANGE_OPTIONS_ALL = [
  ...LENGTH_OF_CHANGE_OPTIONS_STANDARD,
  ...LENGTH_OF_CHANGE_OPTIONS_OVERRIDE
];

export const TYPE_OF_CHANGE_OPTIONS = [
  { id: "type-1", name: "Plant Change (Impact PSI Cat 1,2,3)" },
  { id: "type-2", name: "Maintenance Change" },
  { id: "type-3", name: "Plant Change (No Impact PSI Cat 1,2,3)" },
  { id: "type-4", name: "Override" }
];

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: "priority-1", name: "Normal", level: 1 },
  { id: "priority-2", name: "Emergency", level: 2 }
];

export const BENEFITS_VALUE_OPTIONS = [
  { id: "benefit-1", name: "Safety" },
  { id: "benefit-2", name: "Environment" },
  { id: "benefit-3", name: "Community" },
  { id: "benefit-4", name: "Reputation" },
  { id: "benefit-5", name: "Law" },
  { id: "benefit-6", name: "Money" }
];

export const TPM_LOSS_TYPE_OPTIONS = [
  { id: "tpm-1", name: "Safety" },
  { id: "tpm-2", name: "Environment" },
  { id: "tpm-3", name: "Quality" },
  { id: "tpm-4", name: "Productivity" }
];

export function getAreaById(areaId: string): AreaOption | undefined {
  return AREA_OPTIONS.find(area => area.id === areaId);
}

export function getUnitsByAreaId(areaId: string) {
  const area = getAreaById(areaId);
  return area?.units || [];
}

// NEW: Severity/Consequence descriptions for risk assessment
export const SEVERITY_DESCRIPTIONS: SeverityDescription[] = [
  {
    level: "Minor",
    numericValue: 1,
    people: "Minor - Injury first aid / Major Injury medical treatment",
    assets: "No Minor damage / < $100,000 Localised damage < $1 Million",
    environmentCommunity: "No Minor effect / - Effect Local community <1 month recovery / - Effect environment recovery Short term < 5 Years or < $50,000",
    security: "No Limit impact* / Localised impact"
  },
  {
    level: "Moderate",
    numericValue: 2,
    people: "Major medical treatment",
    assets: "Major damage > $1 Million",
    environmentCommunity: "- Effect Local community 1-6 month recovery / - Effect environment recovery Short term < 5 Years or < $50,000",
    security: "National impact"
  },
  {
    level: "Major",
    numericValue: 3,
    people: "PTD or 1 to 3 Fatalities",
    assets: "Major damage > $10 Million",
    environmentCommunity: "- Effect Local community 1-6 month recovery / - Effect environment recovery Short term 5-10 Years or < $150,000",
    security: "National impact"
  },
  {
    level: "Catastrophic",
    numericValue: 4,
    people: "More than 3 Fatalities",
    assets: "Extensive damage > $10 Million",
    environmentCommunity: "- Effect Local community >6 month recovery or government involve / - Effect environment recovery Short term > 5 Years or > $150,000",
    security: "International impact"
  }
];

// NEW: Probability descriptions for risk assessment
export const PROBABILITY_DESCRIPTIONS: ProbabilityDescription[] = [
  {
    level: "A",
    numericValue: 1,
    label: "Rare",
    description: "Incident has occurred in oil and gas industry once in >10 years"
  },
  {
    level: "B",
    numericValue: 2,
    label: "Unlikely",
    description: "Incident has occurred in oil and gas industry once with in 5-10 years"
  },
  {
    level: "C",
    numericValue: 3,
    label: "Possible",
    description: "Incident has occurred in oil and gas industry once within 1 year"
  },
  {
    level: "D",
    numericValue: 4,
    label: "Likely",
    description: "Incident has already happened or could occur in oil & gas industry more than once per year"
  }
];

// Centralized Mock Data for MOC Requests
export interface MockMOCRequest {
  id: string;
  mocNo: string;
  title: string;
  typeOfChange: string;
  lengthOfChange: string;
  task: string;
  assignedTo: string;
  assignedOn: string;
  process: "Review" | "Initiation" | "Implementation" | "Closeout";
  requesterName: string;
  requestDate: string;
  areaId: string;
  unitId: string;
  priorityId: string;
  tpmLossType: string;
  lossEliminateValue: number;
  detailOfChange: string;
  reasonForChange: string;
  scopeOfWork: string;
  estimatedBenefit: number;
  estimatedCost: number;
  benefits: string[];
  expectedBenefits: string;
  estimatedDurationStart: string;
  estimatedDurationEnd: string;
}

export function generateMockMOCRequests(): MockMOCRequest[] {
  const processes: Array<"Review" | "Initiation" | "Implementation" | "Closeout"> = ["Review", "Initiation", "Implementation", "Closeout"];
  const typeChanges = [
    { id: "type-1" as const, name: "Plant Change (Impact PSI Cat 1,2,3)" },
    { id: "type-2" as const, name: "Maintenance Change" },
    { id: "type-3" as const, name: "Plant Change (No Impact PSI Cat 1,2,3)" },
    { id: "type-4" as const, name: "Override" }
  ];

  const lengthChanges: Record<string, { id: string; name: string }> = {
    "type-1": { id: "length-1", name: "Permanent" },
    "type-2": { id: "length-1", name: "Permanent" },
    "type-3": { id: "length-2", name: "Temporary" },
    "type-4": { id: "length-3", name: "More than 3 days" }
  };

  const names = ["John Smith (ศศ.B ปล.)", "Sarah Johnson (ศศ.C ปล.)", "Mike Chen (ศศ.D ปล.)", "Emma Davis (สยก.)", "Robert Brown (บศ.สยก.)", "Lisa Anderson (ศศ.C ปค.)"];
  const taskDetails = ["Review technical specs", "Approve risk assessment", "Verify installation", "Sign off closeout"];
  const mocTitles = [
    "Safety Interlocks Upgrade - Production Area A",
    "Equipment Preventive Maintenance Program",
    "Process Flow Optimization Initiative",
    "HVAC System Modernization - Utilities",
    "Compliance Documentation Update",
    "Production Efficiency Enhancement",
    "Environmental Control System Retrofit",
    "Quality Assurance Protocol Revision",
    "Emergency Response System Upgrade",
    "Equipment Calibration and Certification",
    "Safety Training Module Implementation",
    "Risk Assessment and Mitigation",
    "Storage Facility Reorganization",
    "Laboratory Equipment Upgrade",
    "Waste Management System Enhancement",
    "Production Line Reconfiguration",
    "Control System Software Update",
    "Safety Barrier Installation",
    "Maintenance Procedure Standardization",
    "Energy Efficiency Improvement Project"
  ];

  return Array.from({ length: 35 }).map((_, i) => {
    const typeChange = typeChanges[i % typeChanges.length];
    const lengthChange = lengthChanges[typeChange.id];
    const process = processes[i % processes.length];

    return {
      id: `todo-${i}`,
      mocNo: `MOC-2024-${(i + 100).toString()}`,
      title: mocTitles[i % mocTitles.length],
      typeOfChange: typeChange.id,
      lengthOfChange: lengthChange.id,
      task: taskDetails[i % 4],
      assignedTo: names[i % names.length],
      assignedOn: `0${(i % 9) + 1}/12/2024 09:${(i * 10) % 60}`,
      process: process,
      requesterName: names[i % names.length],
      requestDate: `0${(i % 9) + 1}/12/2024 10:${(i * 15) % 60}`,
      areaId: `area-${(i % 5) + 1}`,
      unitId: `unit-${(i % 5) + 1}-${(i % 2) + 1}`,
      priorityId: i % 7 === 0 ? "priority-2" : "priority-1",
      tpmLossType: `tpm-${(i % 4) + 1}`,
      lossEliminateValue: 500000 + (i * 50000),
      detailOfChange: `This is a ${typeChange.name} involving modifications to equipment and processes. The change is designed to improve efficiency, safety, or compliance.`,
      reasonForChange: `The current system requires updates to meet new standards, improve operational efficiency, or address identified risks. This change is necessary to maintain compliance and optimal performance.`,
      scopeOfWork: `1. Conduct assessment and planning\n2. Implement approved modifications\n3. Test and verify functionality\n4. Document and close out the change`,
      estimatedBenefit: 180000 + (i * 20000),
      estimatedCost: 500000 + (i * 50000),
      benefits: ["benefit-1", "benefit-6"],
      expectedBenefits: `Improvements expected in efficiency and operational metrics. Estimated annual benefit of 180,000 THB.`,
      estimatedDurationStart: `2025-12-${(10 + (i % 15)).toString().padStart(2, "0")}`,
      estimatedDurationEnd: `2025-12-${(15 + (i % 10)).toString().padStart(2, "0")}`
    };
  });
}

export const MOCK_MOC_REQUESTS = generateMockMOCRequests();

// MOC Actions - Champion options
export const MOC_CHAMPION_OPTIONS = [
  { id: "champion-1", name: "John Smith (ศศ.B ปล.)", role: "Safety Manager" },
  { id: "champion-2", name: "Sarah Johnson (ศศ.C ปล.)", role: "Production Lead" },
  { id: "champion-3", name: "Mike Chen (ศศ.D ปล.)", role: "Engineering Manager" },
  { id: "champion-4", name: "Emily Davis (ปก.สยก.)", role: "Operations Supervisor" }
];

// MOC Actions - Cancellation categories
export const CANCELLATION_CATEGORIES = [
  { id: "cancel-1", name: "No longer required" },
  { id: "cancel-2", name: "Superseded by another MOC" },
  { id: "cancel-3", name: "Safety concerns" },
  { id: "cancel-4", name: "Budget constraints" },
  { id: "cancel-5", name: "Other" }
];

// Helper: Map areas to their units for easy access
export const UNITS_BY_AREA: Record<string, Array<{ id: string; name: string }>> = {
  "Production Area A": AREA_OPTIONS[0].units,
  "Production Area B": AREA_OPTIONS[1].units,
  "Utilities": AREA_OPTIONS[2].units,
  "Storage": AREA_OPTIONS[3].units,
  "Laboratory": AREA_OPTIONS[4].units
};

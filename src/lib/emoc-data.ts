import { AreaOption, TPMLossTypeOption, PriorityOption } from "../types/emoc";

export const AREA_OPTIONS: AreaOption[] = [
  {
    id: "area-1",
    name: "โรงแยกก๊าซธรรมชาติระยอง",
    units: [
      { id: "unit-1-1", name: "Unit 1", areaId: "area-1" },
      { id: "unit-1-2", name: "Unit 2", areaId: "area-1" },
      { id: "unit-1-3", name: "Unit 3", areaId: "area-1" },
      { id: "unit-1-4", name: "Unit 4", areaId: "area-1" },
      { id: "unit-1-5", name: "Unit 5", areaId: "area-1" },
      { id: "unit-1-6", name: "Unit 6", areaId: "area-1" }
    ]
  },
  {
    id: "area-2",
    name: "โรงแยกก๊าซธรรมชาติขนอม",
    units: [
      { id: "unit-2-1", name: "Unit 1", areaId: "area-2" },
      { id: "unit-2-2", name: "Unit 2", areaId: "area-2" }
    ]
  },
  {
    id: "area-3",
    name: "คลังภาคตะวันออก",
    units: [
      { id: "unit-3-1", name: "Terminal 1", areaId: "area-3" },
      { id: "unit-3-2", name: "Terminal 2", areaId: "area-3" },
      { id: "unit-3-3", name: "Utilities", areaId: "area-3" }
    ]
  }
];

export const LENGTH_OF_CHANGE_OPTIONS = [
  { id: "length-1", name: "Permanent" },
  { id: "length-2", name: "Temporary" },
  { id: "length-3", name: "Overriding" }
];

export const TYPE_OF_CHANGE_OPTIONS = [
  { id: "type-1", name: "Plant Change" },
  { id: "type-2", name: "Maintenance Change" },
  { id: "type-3", name: "Process Change" }
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

export function getAreaById(areaId: string): AreaOption | undefined {
  return AREA_OPTIONS.find(area => area.id === areaId);
}

export function getUnitsByAreaId(areaId: string) {
  const area = getAreaById(areaId);
  return area?.units || [];
}

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

export const TPM_LOSS_TYPES: TPMLossTypeOption[] = [
  { id: "loss-1", name: "Equipment Failure" },
  { id: "loss-2", name: "Setup and Adjustment" },
  { id: "loss-3", name: "Idling and Minor Stoppages" },
  { id: "loss-4", name: "Reduced Speed" },
  { id: "loss-5", name: "Defects in Process" },
  { id: "loss-6", name: "Reduced Yield" },
  { id: "loss-7", name: "Startup Loss" },
  { id: "loss-8", name: "Management Loss" }
];

export const PRIORITY_OPTIONS: PriorityOption[] = [
  { id: "priority-1", name: "Critical", level: 1 },
  { id: "priority-2", name: "High", level: 2 },
  { id: "priority-3", name: "Medium", level: 3 },
  { id: "priority-4", name: "Low", level: 4 }
];

export function getAreaById(areaId: string): AreaOption | undefined {
  return AREA_OPTIONS.find(area => area.id === areaId);
}

export function getUnitsByAreaId(areaId: string) {
  const area = getAreaById(areaId);
  return area?.units || [];
}

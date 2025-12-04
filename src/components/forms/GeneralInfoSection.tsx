import React from "react";
import { Label } from "../ui/label";
import { cn } from "../ui/utils";
import { InitiationFormData } from "../../types/emoc";
import {
  AREA_OPTIONS,
  LENGTH_OF_CHANGE_OPTIONS,
  TYPE_OF_CHANGE_OPTIONS,
  PRIORITY_OPTIONS,
  getUnitsByAreaId
} from "../../lib/emoc-data";
import { Clock, AlertTriangle } from "lucide-react";

interface GeneralInfoSectionProps {
  data: InitiationFormData | null;
}

const ReadOnlyField = ({
  label,
  value,
  multiline = false
}: {
  label: string;
  value: string | number;
  multiline?: boolean;
}) => (
  <div className="space-y-1.5">
    <Label className="text-[13px] font-medium text-[#68737D]">{label}</Label>
    <div
      className={cn(
        "text-[#1C1C1E] text-sm font-medium px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200",
        multiline && "min-h-[60px] whitespace-pre-wrap"
      )}
    >
      {value}
    </div>
  </div>
);

const PriorityBadge = ({ priorityId }: { priorityId: string }) => {
  const priority = PRIORITY_OPTIONS.find((p) => p.id === priorityId);
  if (!priority) return <span>{priorityId}</span>;

  const isEmergency = priority.name === "Emergency";

  return (
    <div className="space-y-1.5">
      <Label className="text-[13px] font-medium text-[#68737D]">
        Priority of Change
      </Label>
      <div
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 font-semibold text-sm",
          isEmergency
            ? "bg-red-50 border-red-300 text-red-700"
            : "bg-green-50 border-green-300 text-green-700"
        )}
      >
        {isEmergency ? (
          <AlertTriangle className="w-5 h-5" />
        ) : (
          <Clock className="w-5 h-5" />
        )}
        <span>{priority.name}</span>
      </div>
    </div>
  );
};

export const GeneralInfoSection = ({ data }: GeneralInfoSectionProps) => {
  if (!data) return <div className="text-sm text-gray-500">No data available</div>;

  const getAreaName = (id: string) =>
    AREA_OPTIONS.find((a) => a.id === id)?.name || id;
  const getUnitName = (areaId: string, unitId: string) =>
    getUnitsByAreaId(areaId).find((u) => u.id === unitId)?.name || unitId;
  const getLengthOfChangeName = (id: string) =>
    LENGTH_OF_CHANGE_OPTIONS.find((l) => l.id === id)?.name || id;
  const getTypeOfChangeName = (id: string) =>
    TYPE_OF_CHANGE_OPTIONS.find((t) => t.id === id)?.name || id;

  return (
    <section className="space-y-6">
      <h3 className="text-[17px] font-semibold text-[#1C1C1E] border-b border-[#F0F2F5] pb-2">
        General Information
      </h3>

      <div className="grid gap-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <ReadOnlyField label="Requester Name" value={data.requesterName} />
          <ReadOnlyField label="Request Date" value={data.requestDate} />
        </div>
        <ReadOnlyField label="MOC Title" value={data.mocTitle} />
        <ReadOnlyField
          label="Length of Change"
          value={getLengthOfChangeName(data.lengthOfChange)}
        />
        <ReadOnlyField
          label="Type of Change"
          value={getTypeOfChangeName(data.typeOfChange)}
        />
        <PriorityBadge priorityId={data.priorityId} />
        <div className="grid sm:grid-cols-2 gap-6">
          <ReadOnlyField label="Area" value={getAreaName(data.areaId)} />
          <ReadOnlyField
            label="Unit"
            value={getUnitName(data.areaId, data.unitId)}
          />
        </div>
        <ReadOnlyField
          label="Cost Estimated of Change (THB)"
          value={data.costEstimated.toLocaleString()}
        />
      </div>
    </section>
  );
};

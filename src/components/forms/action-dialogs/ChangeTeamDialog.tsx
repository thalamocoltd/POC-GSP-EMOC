import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { AREA_OPTIONS, UNITS_BY_AREA } from "../../../lib/emoc-data";

interface ChangeTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    newArea: string;
    newUnit: string;
    reason: string;
  }) => void;
  currentArea: string;
  currentUnit: string;
}

export const ChangeTeamDialog = ({
  isOpen,
  onClose,
  onSubmit,
  currentArea,
  currentUnit,
}: ChangeTeamDialogProps) => {
  const [newArea, setNewArea] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    onSubmit({
      newArea,
      newUnit,
      reason,
    });
    setNewArea("");
    setNewUnit("");
    setReason("");
  };

  // Get units for selected area
  const availableUnits = newArea ? (UNITS_BY_AREA[newArea] || []) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Team</DialogTitle>
          <DialogDescription>
            Transfer MOC to a different team
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Area - Read Only */}
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[#1C1C1E]">
              Current Area
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentArea}</Badge>
            </div>
          </div>

          {/* Current Unit - Read Only */}
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[#1C1C1E]">
              Current Unit
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentUnit}</Badge>
            </div>
          </div>

          {/* New Area - Select */}
          <div className="space-y-2">
            <Label htmlFor="new-area" className="text-[13px] font-medium text-[#1C1C1E]">
              New Area
            </Label>
            <Select value={newArea} onValueChange={setNewArea}>
              <SelectTrigger id="new-area" className="w-full">
                <SelectValue placeholder="Select new area" />
              </SelectTrigger>
              <SelectContent>
                {AREA_OPTIONS.map((area) => (
                  <SelectItem key={area.id} value={area.name}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* New Unit - Select */}
          <div className="space-y-2">
            <Label htmlFor="new-unit" className="text-[13px] font-medium text-[#1C1C1E]">
              New Unit
            </Label>
            <Select value={newUnit} onValueChange={setNewUnit} disabled={!newArea}>
              <SelectTrigger id="new-unit" className="w-full">
                <SelectValue placeholder={newArea ? "Select new unit" : "Select area first"} />
              </SelectTrigger>
              <SelectContent>
                {availableUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.name}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason - Textarea */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-[13px] font-medium text-[#1C1C1E]">
              Reason for Change
            </Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for changing the team..."
              className="w-full px-3 py-2 border border-[#D4D9DE] rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

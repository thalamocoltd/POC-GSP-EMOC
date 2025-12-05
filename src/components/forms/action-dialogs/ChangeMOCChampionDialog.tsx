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
import { MOC_CHAMPION_OPTIONS } from "../../../lib/emoc-data";

interface ChangeMOCChampionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    newChampion: string;
    reason: string;
    effectiveDate: string;
  }) => void;
  currentChampion: string;
}

export const ChangeMOCChampionDialog = ({
  isOpen,
  onClose,
  onSubmit,
  currentChampion,
}: ChangeMOCChampionDialogProps) => {
  const [newChampion, setNewChampion] = useState("");
  const [reason, setReason] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = () => {
    onSubmit({
      newChampion,
      reason,
      effectiveDate,
    });
    setNewChampion("");
    setReason("");
    setEffectiveDate(new Date().toISOString().split("T")[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change MOC Champion</DialogTitle>
          <DialogDescription>
            Reassign the MOC responsibility to a different champion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Champion - Read Only */}
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-[#1C1C1E]">
              Current Champion
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{currentChampion}</Badge>
            </div>
          </div>

          {/* New Champion - Select */}
          <div className="space-y-2">
            <Label htmlFor="new-champion" className="text-[13px] font-medium text-[#1C1C1E]">
              New Champion
            </Label>
            <Select value={newChampion} onValueChange={setNewChampion}>
              <SelectTrigger id="new-champion" className="w-full">
                <SelectValue placeholder="Select new champion" />
              </SelectTrigger>
              <SelectContent>
                {MOC_CHAMPION_OPTIONS.map((champion) => (
                  <SelectItem key={champion.id} value={champion.name}>
                    <div>
                      <div className="font-medium">{champion.name}</div>
                      <div className="text-xs text-[#68737D]">{champion.role}</div>
                    </div>
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
              placeholder="Enter reason for changing the MOC champion..."
              className="w-full px-3 py-2 border border-[#D4D9DE] rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Effective Date */}
          <div className="space-y-2">
            <Label htmlFor="effective-date" className="text-[13px] font-medium text-[#1C1C1E]">
              Effective Date
            </Label>
            <input
              id="effective-date"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#D4D9DE] rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
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

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
import { Alert, AlertDescription } from "../../ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { CANCELLATION_CATEGORIES } from "../../../lib/emoc-data";

interface CancelMOCDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    cancellationReason: string;
    category: string;
    acknowledgeImpact: boolean;
    confirmCancellation: boolean;
  }) => void;
  mocNo: string;
  mocTitle: string;
}

export const CancelMOCDialog = ({
  isOpen,
  onClose,
  onSubmit,
  mocNo,
  mocTitle,
}: CancelMOCDialogProps) => {
  const [category, setCategory] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [acknowledgeImpact, setAcknowledgeImpact] = useState(false);
  const [confirmCancellation, setConfirmCancellation] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      cancellationReason,
      category,
      acknowledgeImpact,
      confirmCancellation,
    });
    setCategory("");
    setCancellationReason("");
    setAcknowledgeImpact(false);
    setConfirmCancellation(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancel MOC</DialogTitle>
          <DialogDescription>
            Cancel this MOC request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* MOC Info */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
            <div className="text-xs text-[#68737D]">MOC Number</div>
            <div className="font-semibold text-[#1C1C1E]">{mocNo}</div>
            <div className="text-xs text-[#68737D] mt-2">MOC Title</div>
            <div className="text-sm text-[#1C1C1E]">{mocTitle}</div>
          </div>

          {/* Warning Alert */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              Cancelling this MOC cannot be undone. All associated data and progress will be archived.
            </AlertDescription>
          </Alert>

          {/* Cancellation Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-[13px] font-medium text-[#1C1C1E]">
              Cancellation Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason - Textarea */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-[13px] font-medium text-[#1C1C1E]">
              Detailed Reason
            </Label>
            <textarea
              id="reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Provide detailed reason for cancellation..."
              className="w-full px-3 py-2 border border-[#D4D9DE] rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Acknowledgement Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="impact"
                checked={acknowledgeImpact}
                onCheckedChange={setAcknowledgeImpact}
              />
              <Label
                htmlFor="impact"
                className="text-sm text-[#1C1C1E] cursor-pointer font-normal"
              >
                I understand this action cannot be undone
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="confirm"
                checked={confirmCancellation}
                onCheckedChange={setConfirmCancellation}
              />
              <Label
                htmlFor="confirm"
                className="text-sm text-[#1C1C1E] cursor-pointer font-normal"
              >
                I confirm cancellation of this MOC
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            Cancel MOC
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

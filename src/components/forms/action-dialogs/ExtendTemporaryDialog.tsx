import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";

interface ExtendTemporaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const ExtendTemporaryDialog = ({
  isOpen,
  onClose,
  onSubmit,
}: ExtendTemporaryDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Extend Temporary MOC</DialogTitle>
          <DialogDescription>
            Extend the temporary MOC duration
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-lg font-medium text-[#1C1C1E]">
            Coming Soon
          </div>
          <div className="text-sm text-[#68737D] mt-2">
            This feature will be available in the next update
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

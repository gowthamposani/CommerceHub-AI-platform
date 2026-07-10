import { AlertTriangle } from "lucide-react";

import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  onCancel,
  onConfirm
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-yellow-700">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{message}</p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

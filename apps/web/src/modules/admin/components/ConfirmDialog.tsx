import { Modal, Button, SecondaryButton } from "../../../components/ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <div className="space-y-4">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="flex justify-end gap-2">
        <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);

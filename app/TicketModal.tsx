"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IssueForm from "./IssueForm";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, image: File | null) => Promise<void>;
}

export default function TicketModal({ isOpen, onClose, onSubmit }: TicketModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <IssueForm
            onSubmit={async (data, image) => {
              await onSubmit(data, image);
              onClose(); // ✅ Close modal after submit
            }}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

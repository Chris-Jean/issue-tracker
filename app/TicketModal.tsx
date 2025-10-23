"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import IssueForm from "./IssueForm";
import type { ConvexIssue } from "./types";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<ConvexIssue, "_id" | "_creationTime">,
    image: File | null
  ) => Promise<void>;
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
                    onSubmit={async (data, image, resetForm) => {
                    try {
                    await onSubmit(data, image);
                    resetForm(); 
                    onClose();   
                     } catch (err) {
                    console.error("Submit failed:", err);
                         }
                         }}
                            onCancel={() => {
                            onClose();
                        }}
                        />

        </div>
      </DialogContent>
    </Dialog>
  );
}

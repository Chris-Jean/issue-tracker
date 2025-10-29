"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import IssueForm from "./IssueForm";
import type { ConvexIssue } from "./types";
import { useState, useEffect } from "react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    issue: Omit<ConvexIssue, "_id" | "_creationTime">,
    selectedImage: File | null
  ) => void;
  initialIssue?: ConvexIssue;
}

export default function TicketModal({
  isOpen,
  onClose,
  onSubmit,
  initialIssue,
}: TicketModalProps) {
  const [savedDraft, setSavedDraft] = useState<Omit<ConvexIssue, "_id" | "_creationTime"> | null>(
    null
  );

  useEffect(() => {
    if (!isOpen && initialIssue) setSavedDraft(initialIssue);
  }, [isOpen, initialIssue]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {initialIssue ? "Edit Ticket" : "New Ticket"}
          </DialogTitle>
        </DialogHeader>

        <IssueForm
          onSubmit={onSubmit}
          onCancel={onClose}
          initialIssue={initialIssue || savedDraft || undefined}
        />
      </DialogContent>
    </Dialog>
  );
}

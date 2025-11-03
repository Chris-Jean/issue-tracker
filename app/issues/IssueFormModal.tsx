"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import IssueForm from "./IssueForm"
import type { Issue, ConvexIssue as _ConvexIssue } from "./types"

interface IssueFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (issue: Issue, selectedImage: File | null) => Promise<void>
  initialIssue?: Issue
  title?: string
}

export default function IssueFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialIssue,
  title = "Create New Issue"
}: IssueFormModalProps) {
  if (!isOpen) return null

  const handleSubmit = async (issue: Issue, selectedImage: File | null) => {
    await onSubmit(issue, selectedImage)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <IssueForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            initialIssue={initialIssue}
          />
        </div>
      </div>
    </div>
  )
}

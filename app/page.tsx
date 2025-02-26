"use client";

import { useState } from "react";
import IssueList from "./IssueList";
import IssueForm from "./IssueForm";
import IssueDetail from "./IssueDetail";
import type { Issue } from "./types";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Add a new issue
  const handleAddIssue = (newIssue: Omit<Issue, "id">) => {
    const newIssueWithId = { ...newIssue, id: Date.now().toString() };
    setIssues((prev) => [...prev, newIssueWithId]);
    toast({ title: "Success", description: "Issue created successfully" });
  };

  // Update an issue (editing happens inside `IssueDetail.tsx`)
  const handleUpdateIssue = (updatedIssue: Issue) => {
    setIssues((prev) => prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue)));
    setSelectedIssue(updatedIssue);
  };

  // Delete an issue
  const handleDeleteIssue = (id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
    setSelectedIssue(null);
    toast({ title: "Success", description: "Issue deleted successfully" });
  };

  // Close the issue detail view
  const handleCloseDetail = () => {
    setSelectedIssue(null);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Issue Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Issues</h2>
          <IssueList issues={issues} onSelectIssue={setSelectedIssue} onEditIssue={setSelectedIssue} onDeleteIssue={handleDeleteIssue} />
        </div>

        
        <div>
          {selectedIssue ? (
            <IssueDetail issue={selectedIssue} onClose={handleCloseDetail} onUpdate={handleUpdateIssue} />
          ) : (
            <IssueForm onSubmit={handleAddIssue} onCancel={handleCloseDetail} />
          )}
        </div>
      </div>

      <Toaster />
    </main>
  );
}

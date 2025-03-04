"use client";

import { Toaster } from "@/components/ui/toaster";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import {
  ConvexProvider,
  ConvexReactClient,
  useMutation,
  useQuery,
} from "convex/react";
import { useState } from "react";
import IssueDetail from "./IssueDetail";
import IssueForm from "./IssueForm";
import IssueList from "./IssueList";
import type { Issue } from "./types";

function Home() {
  const { toast } = useToast();
  const issues = useQuery(api.issues.getIssues);
  const createIssue = useMutation(api.issues.createIssue);
  const updateIssue = useMutation(api.issues.updateIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleAddIssue = async (newIssue: Omit<Issue, "id">) => {
    const newIssueWithId = { ...newIssue };
    await createIssue(newIssueWithId);
    toast({ title: "Success", description: "Issue created successfully" });
  };

  const handleUpdateIssue = async (updatedIssue: Issue) => {
    await updateIssue(updatedIssue);
    setSelectedIssue(updatedIssue);
  };

  const handleDeleteIssue = async (id: Issue["_id"]) => {
    await deleteIssue({ id });
    setSelectedIssue(null);
    toast({ title: "Success", description: "Issue deleted successfully" });
  };

  const handleCloseDetail = () => {
    setSelectedIssue(null);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Issue Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Issues</h2>
          {issues && (
            <IssueList
              issues={issues as any[]}
              onSelectIssue={setSelectedIssue}
              onEditIssue={setSelectedIssue}
              onDeleteIssue={handleDeleteIssue}
            />
          )}
        </div>

        <div>
          {selectedIssue ? (
            <IssueDetail
              issue={selectedIssue}
              onClose={handleCloseDetail}
              onUpdate={handleUpdateIssue}
            />
          ) : (
            <IssueForm onSubmit={handleAddIssue} onCancel={handleCloseDetail} />
          )}
        </div>
      </div>

      <Toaster />
    </main>
  );
}

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export default function HomeWrapper() {
  return (
    <ConvexProvider client={convex}>
      <Home />
    </ConvexProvider>
  );
}

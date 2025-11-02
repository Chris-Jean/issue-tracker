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
import type { ConvexIssue, MetaIssue } from "./types";
import { Id } from "@/convex/_generated/dataModel"; // ✅ Import Convex ID type
import ThemeToggle from "@/components/ui/ThemeToggle";


function Home() {
  const { toast } = useToast();
  const issues = useQuery(api.issues.getIssues) as ConvexIssue[];
  const createIssue = useMutation(api.issues.createIssue);
  const updateIssue = useMutation(api.issues.updateIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);
  const generateUploadUrl = useMutation(api.issues.generateUploadUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedIssue, setSelectedIssue] = useState<MetaIssue | null>(null);

  const handleAddIssue = async (
    newIssue: Omit<ConvexIssue, "_id" | "_creationTime">,
    selectedImage: File | null
  ) => {
    try {
      let imageId: Id<"_storage"> | undefined;

      // Upload image if one is selected
      if (selectedImage) {
        // Step 1: Get a short-lived upload URL
        const postUrl = await generateUploadUrl();

        // Step 2: POST the file to the URL
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });

        if (!result.ok) {
          throw new Error("Image upload failed. Please try again.");
        }

        // Get the storage ID from the response
        const { storageId } = await result.json();
        imageId = storageId as Id<"_storage">; // ✅ Correct Type
      }

      const newIssueWithId = imageId
        ? { ...newIssue, image: imageId }
        : { ...newIssue };

      await createIssue(newIssueWithId);
      toast({ title: "Success", description: "Issue created successfully" });
    } catch (error) {
      console.error("Error adding issue:", error);
      toast({ title: "Error", description: "Failed to create issue. Try again." });
    }
  };

  const handleUpdateIssue = async (updatedIssue: MetaIssue) => {
    try {
      await updateIssue(updatedIssue);
      setSelectedIssue(updatedIssue);
    } catch (error) {
      console.error("Error updating issue:", error);
      toast({ title: "Error", description: "Failed to update issue." });
    }
  };

  const handleDeleteIssue = async (id: MetaIssue["_id"]) => {
    try {
      await deleteIssue({ id });
      setSelectedIssue(null);
      toast({ title: "Success", description: "Issue deleted successfully" });
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast({ title: "Error", description: "Failed to delete issue." });
    }
  };

  const handleCloseDetail = () => {
    setSelectedIssue(null);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4">Issue Tracker</h1>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Issues</h2>
          {issues && (
            <IssueList
              key={refreshKey}
              issues={issues}
              onSelectIssue={setSelectedIssue}
              onEditIssue={setSelectedIssue}
              onDeleteIssue={handleDeleteIssue}
              onRefresh={() => setRefreshKey((prev) => prev + 1)}
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

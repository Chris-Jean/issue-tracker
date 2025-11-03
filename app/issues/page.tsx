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
//import IssueDetail from "./IssueDetail";
//import IssueFormModal from "./IssueFormModal";
import IssueList from "./IssueList";
import type { ConvexIssue, MetaIssue } from "./types";
import { Id } from "@/convex/_generated/dataModel"; // ✅ Import Convex ID type
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TicketModal from "../TicketModal";


function Home() {
  const { toast } = useToast();
  const issues = useQuery(api.issues.getIssues) as ConvexIssue[];
  const createIssue = useMutation(api.issues.createIssue);
  const updateIssue = useMutation(api.issues.updateIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);
  const generateUploadUrl = useMutation(api.issues.generateUploadUrl);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<ConvexIssue | null>(null);


  const [selectedIssue, setSelectedIssue] = useState<MetaIssue | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAddOrUpdateIssue = async (
    issue: Omit<ConvexIssue, "_id" | "_creationTime">,
    selectedImage: File | null
  ) => {
    try {
      let imageId: Id<"_storage"> | undefined = editingIssue?.image;
  
      // 🖼 If a new image was selected, upload it first
      if (selectedImage) {
        const postUrl = await generateUploadUrl();
        const uploadResponse = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        if (!uploadResponse.ok) throw new Error("Image upload failed.");
        const { storageId } = await uploadResponse.json();
        imageId = storageId as Id<"_storage">;
      }
  
      if (editingIssue) {
        // ✏️ UPDATE EXISTING ISSUE
        await updateIssue({
          _id: editingIssue._id as Id<"issues">,
          title: issue.title,
          agent: issue.agent,
          language: issue.language,
          description: issue.description,
          userType: issue.userType,
          VPN: issue.VPN,
          internetSource: issue.internetSource,
          category: issue.category,
          reason: issue.reason,
          dateOfIncident: issue.dateOfIncident,
          image: imageId,
        });
        toast({ title: "Updated", description: "Ticket updated successfully!" });
        setEditingIssue(null);
      } else {
        // 🆕 CREATE NEW ISSUE
        await createIssue({
          ...issue,
          image: imageId,
        });
        toast({ title: "Created", description: "Ticket created successfully!" });
      }
  
      setModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save ticket." });
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

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Issues</h2>
        <Button
  onClick={() => {
    setEditingIssue(null);  // Clear old edit data
    setModalOpen(true);     // Open the same modal
  }}
  className="flex items-center gap-2"
>
  <Plus className="w-4 h-4" />
  Create Issue
</Button>

      </div>

      {issues && (
        <IssueList
        key={refreshKey}
        issues={issues}
        onEditIssue={(issue) => {
          setEditingIssue(issue);
          setModalOpen(true);
        }}
        onDeleteIssue={handleDeleteIssue}
        onRefresh={() => setRefreshKey((prev) => prev + 1)}
      />
      
      )}

          <TicketModal
          isOpen={isModalOpen}
          onClose={() => {
          setModalOpen(false);
          setEditingIssue(null);
          }}
          onSubmit={handleAddOrUpdateIssue}
          initialIssue={editingIssue || undefined}
        />


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

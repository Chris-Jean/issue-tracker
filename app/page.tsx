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
import { useState, useMemo } from "react";
import IssueList from "./IssueList";
import TicketModal from "./TicketModal";
import type { ConvexIssue } from "./types";
import { Id } from "@/convex/_generated/dataModel";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";

function Home() {
  const { toast } = useToast();
  const issues = useQuery(api.issues.getIssues) as ConvexIssue[] | undefined;
  const createIssue = useMutation(api.issues.createIssue);
  const updateIssue = useMutation(api.issues.updateIssue);
  const deleteIssue = useMutation(api.issues.deleteIssue);
  const generateUploadUrl = useMutation(api.issues.generateUploadUrl);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<ConvexIssue | null>(null);

  // 📊 Analytics
  const trends = useMemo(() => {
    if (!issues || issues.length === 0) return null;
    const countTop = (key: keyof ConvexIssue, topN = 5) => {
      const counts = issues.reduce((acc: Record<string, number>, i) => {
        const val = (i[key] as string) || "Unknown";
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, topN);
    };
    return {
      topClients: countTop("userType"),
      topReasons: countTop("reason"),
      topLanguages: countTop("language"),
    };
  }, [issues]);

  // 🧠 Create or Update Issue (with working image upload for both)
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
          image: imageId, // ✅ include image in update
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
      setRefreshKey((prev) => prev + 1); // ✅ refresh after success
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to save ticket." });
    }
  };

  // 🗑️ Delete Issue
  const handleDeleteIssue = async (id: Id<"issues">) => {
    try {
      await deleteIssue({ id });
      toast({ title: "Deleted", description: "Issue deleted successfully." });
      setRefreshKey((prev) => prev + 1);
    } catch {
      toast({ title: "Error", description: "Failed to delete issue." });
    }
  };

  return (
    <main className="container mx-auto p-4 relative">
      {/* 🧭 Header */}
      <div className="fixed top-0 right-0 left-0 bg-background/80 backdrop-blur-md z-20 p-4 shadow-sm flex justify-between items-center">
        <h1 className="text-2xl font-bold">CRM Ticketing Dashboard</h1>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <Button
            onClick={() => {
              setEditingIssue(null);
              setModalOpen(true);
            }}
            className="bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            + New Ticket
          </Button>
        </div>
      </div>

      {/* 🧱 Layout */}
      <div className="flex flex-col lg:flex-row gap-6 mt-24">
        {/* Left: Issues */}
        <div className="flex-1">
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
        </div>

        {/* Right: Analytics */}
        {trends && (
          <aside className="w-full lg:w-1/3 bg-muted rounded-lg p-5 sticky top-24 h-fit">
            <h2 className="text-xl font-semibold mb-4">📈 Trends & Insights</h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Top Clients</h3>
              <ul className="list-disc pl-6">
                {trends.topClients.map(({ name, count }) => (
                  <li key={name}>
                    {name}: <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Common Issues</h3>
              <ul className="list-disc pl-6">
                {trends.topReasons.map(({ name, count }) => (
                  <li key={name}>
                    {name}: <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Languages</h3>
              <ul className="list-disc pl-6">
                {trends.topLanguages.map(({ name, count }) => (
                  <li key={name}>
                    {name}: <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>

      {/* 🪟 Ticket Modal */}
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

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export default function HomeWrapper() {
  return (
    <ConvexProvider client={convex}>
      <Home />
    </ConvexProvider>
  );
}

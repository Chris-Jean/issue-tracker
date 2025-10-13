"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToJsonExcel } from "@/helpers/fileHelpers";
import {
  ChevronDown,
  ChevronRight,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ConvexIssue, MetaIssue } from "./types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface IssueListProps {
  issues: ConvexIssue[];
  onSelectIssue: (issue: MetaIssue) => void;
  onEditIssue: (issue: MetaIssue) => void;
  onDeleteIssue: (id: MetaIssue["_id"]) => void;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function IssueList({
  issues,
  onSelectIssue,
  onEditIssue,
  onDeleteIssue,
  onRefresh,
}: IssueListProps) {
  const archiveAll = useMutation(api.issues.archiveAllIssues);
  const deleteAllActive = useMutation(api.issues.deleteAllActiveIssues);
  //const archiveIssue = useMutation(api.issues.archiveIssue); future use

  
  const [loadingAction, setLoadingAction] = useState(false);

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterByCategory, setFilterByCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageByCategory, setPageByCategory] = useState<Record<string, number>>({});

  const filteredIssues = issues.filter((issue) => {
    const formattedDate = new Date(issue.dateOfIncident).toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    });
    const formattedTime = new Date(issue.dateOfIncident).toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
    });
  
    return (
      (filterByCategory === "All" || issue.category === filterByCategory) &&
      (
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formattedDate.includes(searchQuery) || // ✅ date search
        formattedTime.toLowerCase().includes(searchQuery.toLowerCase()) // ✅ time search
      )
    );
  });  

   // ✅ Reset pagination whenever filters, search, or sort change
   useEffect(() => {
    setPageByCategory({});
  }, [searchQuery, filterByCategory, sortBy]);

  const groupedIssues = filteredIssues.reduce((acc, issue) => {
    const category = issue.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(issue);
    return acc;
  }, {} as Record<string, ConvexIssue[]>);

  const sortedIssues = (issues: ConvexIssue[]) => {
    return [...issues].sort((a, b) => {
      if (sortBy === "agent") return a.agent.localeCompare(b.agent);
      return new Date(b.dateOfIncident).getTime() - new Date(a.dateOfIncident).getTime();
    });
  };

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleDownloadExcel = (category: string, issues: ConvexIssue[]) => {
    const formattedIssues = issues.map((issue) => {
      const dateObj = new Date(issue.dateOfIncident);
  
      return {
        // ✅ Include only the fields you want to export
        Title: issue.title,
        "Service #": issue.agent,
        Client: issue.userType,
        "Project Name": issue.internetSource,
        Language: issue.language,
        Reason: issue.reason,
        Description: issue.description,
        Category: issue.category,
        // ✅ Split date and time into separate columns
        Date: dateObj.toLocaleDateString("en-US", { timeZone: "America/New_York" }),
        Time: dateObj.toLocaleTimeString("en-US", { timeZone: "America/New_York" }),
      };
    });
  
    exportToJsonExcel(formattedIssues, `${category}-issues-${new Date().toDateString()}`);
  };  

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Total Issues: {issues.length}
      </h2>

{/* 🧭 Global Actions */}
<div className="flex justify-between items-center mb-6">
  <h2 className="text-xl font-semibold text-foreground">Issue Dashboard</h2>

  <div className="flex space-x-3">
  <Button
  variant="secondary"
  disabled={loadingAction}
  onClick={async () => {
    if (confirm("Archive all active issues?")) {
      setLoadingAction(true);
      try {
        const result = await archiveAll();
        alert(`✅ Archived ${result.count} issues successfully!`);

      } catch (err) {
        console.error("Error archiving all:", err);
        alert("⚠️ Failed to archive all issues.");
      } finally {
        setLoadingAction(false);
      }
    }
  }}
>
  {loadingAction ? "Archiving..." : "🗃️ Archive All"}
</Button>

<Button
  variant="destructive"
  onClick={async () => {
    if (confirm("⚠️ This will permanently delete all non-archived issues. Continue?")) {
      try {
        const result = await deleteAllActive();
        alert(`🗑️ ${result.message}`);
        onRefresh(); // ✅ Refresh only after delete
      } catch (err) {
        console.error("Error deleting all active issues:", err);
        alert("⚠️ Failed to delete all active issues.");
      }
    }
  }}
>
  🗑️ Delete All
</Button>
  </div>
</div>


      {/* Search and Filters */}
      <div className="flex space-x-4 mb-4">
        <Input
          type="text"
          placeholder="Search issues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select value={filterByCategory} onValueChange={setFilterByCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Client issues">Client issues</SelectItem>
            <SelectItem value="Rude Clients">Rude Clients</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="agent">Service #</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Render Grouped Issues with Pagination */}
      {Object.entries(groupedIssues).map(([category, issues]) => {
        const page = pageByCategory[category] ?? 1;
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const paginatedIssues = sortedIssues(issues).slice(startIndex, startIndex + ITEMS_PER_PAGE);
        const totalPages = Math.ceil(issues.length / ITEMS_PER_PAGE);
        

        return (
          <div key={category} className="mb-6">
            <div
              className="flex items-center justify-between bg-secondary text-secondary-foreground p-2 rounded cursor-pointer"
              onClick={() => toggleCategory(category)}
            >
              <h2 className="text-lg font-semibold">
                {category} ({issues.length})
              </h2>
              {collapsedCategories[category] ? <ChevronRight /> : <ChevronDown />}
              <Download
                onClick={() => handleDownloadExcel(category, issues)}
                className="h-5 w-5"
              />
            </div>

            {!collapsedCategories[category] && (
              <>
                <ul className="space-y-2 mt-2">
                  {paginatedIssues.map((issue) => (
                    <li
                      key={issue._id}
                      className="bg-card text-foreground p-4 rounded shadow border border-border"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3
                            className="font-semibold cursor-pointer hover:underline"
                            onClick={() => onSelectIssue(issue as MetaIssue)}
                          >
                            {issue.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">Caller ID: {issue.title}</p>
                          <p className="text-sm text-muted-foreground">Service #: {issue.agent}</p>
                          <p className="text-sm text-muted-foreground">Client: {issue.userType}</p>
                          <p className="text-sm text-muted-foreground">Project Name: {issue.internetSource}</p>
                          <p className="text-sm text-muted-foreground">Language: {issue.language}</p>
                          <p className="text-sm text-muted-foreground">Reason: {issue.reason}</p>
                          <p className="text-sm text-muted-foreground">{issue.description}</p>
                          <p className="text-sm text-muted-foreground">
                            Date of Incident:{" "}
                            {issue.dateOfIncident
                              ? new Date(issue.dateOfIncident).toLocaleString("en-US", {
                                timeZone: "America/New_York",
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "N/A"}
                          </p>
                        </div>

                        {issue.imageUrl && (
                          <div className="space-y-1 group relative">
                            <a
                              href={issue.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Image
                                src={issue.imageUrl}
                                width={100}
                                height={100}
                                alt={issue.title}
                                className="rounded-md border border-border hover:opacity-80 transition"
                              />
                              {/* Full image preview on hover */}
                              <div className="hidden group-hover:block absolute top-0 left-[110%] z-10 border border-border rounded bg-background shadow-lg">
                                <Image
                                  src={issue.imageUrl}
                                  width={300}
                                  height={300}
                                  alt="Preview"
                                  className="object-contain rounded"
                                />
                              </div>
                            </a>
                            <Button asChild variant="outline" className="text-xs">
                              <a href={issue.imageUrl} download target="_blank" rel="noopener noreferrer">
                                Download Image
                              </a>
                            </Button>
                          </div>
                        )}

                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditIssue(issue as MetaIssue)}
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteIssue(issue._id as MetaIssue["_id"])}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Pagination controls */}
                {totalPages > 1 && (
  <div className="flex justify-center items-center mt-4 space-x-2">
    {/* ⏮ Jump to first */}
    <button
      onClick={() =>
        setPageByCategory((prev) => ({ ...prev, [category]: 1 }))
      }
      disabled={page === 1}
      className={`px-2 py-1 text-sm rounded border ${
        page === 1
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-input hover:bg-accent/10"
      }`}
    >
      ⏮
    </button>

    {/* ◀ Previous */}
    <button
      onClick={() =>
        setPageByCategory((prev) => ({
          ...prev,
          [category]: Math.max(1, page - 1),
        }))
      }
      disabled={page === 1}
      className={`px-2 py-1 text-sm rounded border ${
        page === 1
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-input hover:bg-accent/10"
      }`}
    >
      ◀
    </button>

    {/* Dynamic pages with ellipses */}
    {(() => {
      const pages: (number | string)[] = [];
      const showPages = 4;

      if (totalPages <= showPages + 2) {
        // 👇 Show all pages if there are few
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        // 👇 Always show first page
        pages.push(1);

        // 👇 Add left ellipsis
        if (page > showPages - 1) pages.push("...");

        // 👇 Calculate visible window
        const start = Math.max(2, page - 1);
        const end = Math.min(totalPages - 1, start + showPages - 1);

        for (let i = start; i <= end; i++) pages.push(i);

        // 👇 Add right ellipsis
        if (end < totalPages - 1) pages.push("...");

        // 👇 Always show last page
        pages.push(totalPages);
      }

      return pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-1 text-sm">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() =>
              setPageByCategory((prev) => ({ ...prev, [category]: p as number }))
            }
            className={`px-3 py-1 text-sm rounded border ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent/10"
            }`}
          >
            {p}
          </button>
        )
      );
    })()}

    {/* ▶ Next */}
    <button
      onClick={() =>
        setPageByCategory((prev) => ({
          ...prev,
          [category]: Math.min(totalPages, page + 1),
        }))
      }
      disabled={page === totalPages}
      className={`px-2 py-1 text-sm rounded border ${
        page === totalPages
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-input hover:bg-accent/10"
      }`}
    >
      ▶
    </button>

    {/* ⏭ Jump to last */}
    <button
      onClick={() =>
        setPageByCategory((prev) => ({
          ...prev,
          [category]: totalPages,
        }))
      }
      disabled={page === totalPages}
      className={`px-2 py-1 text-sm rounded border ${
        page === totalPages
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-input hover:bg-accent/10"
      }`}
    >
      ⏭
    </button>
  </div>
)}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

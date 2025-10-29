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
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Archive,
  Download,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight as PageNext,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import type { ConvexIssue, MetaIssue } from "./types";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { exportToJsonExcel } from "@/helpers/fileHelpers";

interface IssueListProps {
  issues?: ConvexIssue[];
  onEditIssue: (issue: MetaIssue) => void;
  onDeleteIssue: (id: Id<"issues">) => void;
  onRefresh: () => void;
}

const ITEMS_PER_PAGE = 5;

export default function IssueList({
  issues,
  onEditIssue,
  onDeleteIssue,
  onRefresh,
}: IssueListProps) {
  const archiveIssue = useMutation(api.issues.archiveIssue);
  const deleteAllActive = useMutation(api.issues.deleteAllActiveIssues);

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterByCategory, setFilterByCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);

  const isLoading = typeof issues === "undefined";

  // 🔹 Filter & Sort
  const filteredIssues = useMemo(() => {
    if (!issues || !Array.isArray(issues)) return [];

    return issues
      .filter((issue) => {
        const date = new Date(issue.dateOfIncident);
        const start = startDate ? new Date(startDate + "T00:00:00") : null;
        const end = endDate ? new Date(endDate + "T23:59:59") : null;

        const afterStart = start ? date >= start : true;
        const beforeEnd = end ? date <= end : true;

        const matchCategory =
          filterByCategory === "All" || issue.category === filterByCategory;

        const q = searchQuery.trim().toLowerCase();
        const matchSearch =
          !q ||
          issue.title.toLowerCase().includes(q) ||
          issue.agent.toLowerCase().includes(q) ||
          issue.language.toLowerCase().includes(q) ||
          (issue.reason || "").toLowerCase().includes(q) ||
          (issue.description || "").toLowerCase().includes(q);

        return afterStart && beforeEnd && matchCategory && matchSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.dateOfIncident).getTime() -
          new Date(a.dateOfIncident).getTime()
      );
  }, [issues, searchQuery, filterByCategory, startDate, endDate]);

  // 🔹 Pagination
  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const paginated = filteredIssues.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // 🔹 Group by category → month
  const groupedByCategoryAndMonth = useMemo(() => {
    const grouped = filteredIssues.reduce((acc, issue) => {
      const catKey = issue.category || "Uncategorized";
      const date = issue.dateOfIncident ? new Date(issue.dateOfIncident) : new Date();
      const monthKey = date.toLocaleString("default", { month: "long", year: "numeric" });

      if (!acc[catKey]) acc[catKey] = {};
      if (!acc[catKey][monthKey]) acc[catKey][monthKey] = [];
      acc[catKey][monthKey].push(issue);
      return acc;
    }, {} as Record<string, Record<string, ConvexIssue[]>>);

    // Sort months newest → oldest inside each category
    for (const category in grouped) {
      grouped[category] = Object.fromEntries(
        Object.entries(grouped[category]).sort(
          (a, b) =>
            new Date(b[0]).getTime() - new Date(a[0]).getTime()
        )
      );
    }
    return grouped;
  }, [filteredIssues]);

  const toggleCategory = (category: string) =>
    setCollapsedCategories((prev) => ({ ...prev, [category]: !prev[category] }));

  const toggleMonth = (key: string) =>
    setCollapsedMonths((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleCard = (id: string) =>
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleArchive = async (id: Id<"issues"> | undefined) => {
    if (!id) return;
    if (!confirm("Archive this issue?")) return;
    try {
      await archiveIssue({ id });
      onRefresh();
    } catch (err) {
      console.error("Archive failed", err);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ Delete all non-archived issues?")) return;
    try {
      await deleteAllActive();
      onRefresh();
      alert("🗑️ Deleted all active issues successfully!");
    } catch (err) {
      console.error("Delete all failed", err);
    }
  };

  return (
    <div className="flex flex-col">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <Input
          type="text"
          placeholder="Search tickets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/4"
        />

        <Select value={filterByCategory} onValueChange={setFilterByCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="Client issues">Client Issues</SelectItem>
            <SelectItem value="Rude Clients">Rude Clients</SelectItem>
          </SelectContent>
        </Select>

        <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

        <Button
          variant="outline"
          onClick={() => {
            if (!filteredIssues.length) return alert("No tickets to export.");
            const exportData = filteredIssues.map((i) => ({
              "Caller ID": i.title,
              "Service #": i.agent,
              "Client": i.userType,
              "Project Name": i.internetSource,
              "Category": i.category,
              "Reason": i.reason || "N/A",
              "Date": new Date(i.dateOfIncident).toLocaleDateString(),
              "Time": new Date(i.dateOfIncident).toLocaleTimeString(),
              "Language": i.language,
              "Description": i.description,
            }));
            exportToJsonExcel(exportData, "Active_Tickets");
          }}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Export Excel
        </Button>

        <Button variant="destructive" onClick={handleDeleteAll}>
          🗑️ Delete All
        </Button>
      </div>

      {/* 🏷 Group by Category → Month */}
      {Object.entries(groupedByCategoryAndMonth).map(([category, months]) => (
        <div key={category} className="mb-6 border rounded-md overflow-hidden">
          <div
            className="flex justify-between items-center bg-secondary text-secondary-foreground p-2 cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            <h2 className="font-semibold text-lg">
              {category} ({Object.values(months).flat().length})
            </h2>
            {collapsedCategories[category] ? <ChevronRight /> : <ChevronDown />}
          </div>

          {!collapsedCategories[category] && (
            <div className="p-3 bg-card space-y-4">
              {Object.entries(months).map(([month, issues]) => (
                <div key={month} className="border rounded-md overflow-hidden">
                  <div
                    className="flex justify-between items-center bg-muted p-2 cursor-pointer"
                    onClick={() => toggleMonth(`${category}-${month}`)}
                  >
                    <h3 className="font-semibold text-base">
                      {month} ({issues.length})
                    </h3>
                    {collapsedMonths[`${category}-${month}`] ? (
                      <ChevronRight />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>

                  {!collapsedMonths[`${category}-${month}`] && (
                    <div className="p-3 bg-background">
                      {issues.map((issue) => {
                        const isExpanded = expandedCards?.[issue._id as string] ?? false;
                        return (
                          <div
                            key={issue._id}
                            className="border p-3 mb-3 rounded bg-background cursor-pointer transition-all hover:bg-accent/40"
                            onClick={() => toggleCard(issue._id as unknown as string)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">{issue.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(issue.dateOfIncident).toLocaleDateString()} | Service #:{" "}
                                  {issue.agent}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditIssue(issue as MetaIssue);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(issue._id);
                                  }}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (issue._id) onDeleteIssue(issue._id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                {isExpanded ? <ChevronDown /> : <ChevronRight />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="mt-3 space-y-2">
                                {issue.imageUrl && (
                                  <div className="w-32 h-32 border rounded overflow-hidden">
                                    <Image
                                      src={issue.imageUrl}
                                      alt={issue.title}
                                      width={128}
                                      height={128}
                                      className="object-cover w-full h-full"
                                    />
                                  </div>
                                )}
                                <p><strong>Caller ID:</strong> {issue.title}</p>
                                <p><strong>Service #:</strong> {issue.agent}</p>
                                <p><strong>Client:</strong> {issue.userType}</p>
                                <p><strong>Project Name:</strong> {issue.internetSource}</p>
                                <p><strong>Language:</strong> {issue.language}</p>
                                <p><strong>Category:</strong> {issue.category}</p>
                                <p><strong>Reason:</strong> {issue.reason || "N/A"}</p>
                                <p>
                                  <strong>Date:</strong>{" "}
                                  {new Date(issue.dateOfIncident).toLocaleDateString()}{" "}
                                  <strong>Time:</strong>{" "}
                                  {new Date(issue.dateOfIncident).toLocaleTimeString()}
                                </p>
                                <p><strong>Description:</strong> {issue.description}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <Button variant="outline" onClick={() => setPage(1)} disabled={page === 1}>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <PageNext className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

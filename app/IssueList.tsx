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

  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterByCategory, setFilterByCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // 🧭 Pagination state (per month)
  const [currentPageByMonth, setCurrentPageByMonth] = useState<Record<string, number>>({});

  const getCurrentPage = (month: string) => currentPageByMonth[month] || 1;
  const setPage = (month: string, page: number) =>
    setCurrentPageByMonth((prev) => ({ ...prev, [month]: page }));

  const isLoading = typeof issues === "undefined";

  // 🔹 Filter & Sort
  const filteredIssues = useMemo(() => {
    if (!issues || !Array.isArray(issues)) return [];

    return issues.filter((issue) => {
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
    });
  }, [issues, searchQuery, filterByCategory, startDate, endDate]);

  // 🔹 Group by month-year
  const groupedByMonth = useMemo(() => {
    return filteredIssues.reduce((acc, issue) => {
      const date = issue.dateOfIncident ? new Date(issue.dateOfIncident) : new Date();
      const monthKey = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(issue);
      return acc;
    }, {} as Record<string, ConvexIssue[]>);
  }, [filteredIssues]);

  const sortedIssues = (arr: ConvexIssue[]) => {
    return [...arr].sort((a, b) => {
      if (sortBy === "agent") return a.agent.localeCompare(b.agent);
      return new Date(b.dateOfIncident).getTime() - new Date(a.dateOfIncident).getTime();
    });
  };

  const toggleMonth = (month: string) => {
    setCollapsedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    if (!confirm("⚠️ This will permanently delete all non-archived issues. Continue?")) return;
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
      <div className="flex flex-wrap gap-3 mb-6">
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
            <SelectItem value="Client issues">Client issues</SelectItem>
            <SelectItem value="Rude Clients">Rude Clients</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="agent">Service #</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="[color-scheme:light] dark:[color-scheme:dark]"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="[color-scheme:light] dark:[color-scheme:dark]"
        />

<Button
  variant="outline"
  onClick={() => {
    if (!filteredIssues.length) {
      alert("No tickets available to export.");
      return;
    }
    const exportData = filteredIssues.map((i) => {
      const dateObj = new Date(i.dateOfIncident);
      return {
        "Title": i.title,
        "Service #": i.agent,
        "Language": i.language,
        "Client Type": i.userType,
        "Project Name": i.internetSource,
        "Category": i.category,
        "Reason": i.reason || "N/A",
        "Date": dateObj.toLocaleDateString("en-US", {
          timeZone: "America/New_York",
          dateStyle: "medium",
        }),
        "Time": dateObj.toLocaleTimeString("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
        }),
        "Description": i.description,
      };
    });
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

      {isLoading && <p className="text-muted-foreground">Loading tickets…</p>}

      {/* 📅 Tickets grouped by month */}
      {Object.entries(groupedByMonth).length === 0 && !isLoading ? (
        <p className="text-muted-foreground">No tickets found for this range.</p>
      ) : (
        Object.entries(groupedByMonth).map(([month, monthIssues]) => {
          const totalPages = Math.ceil(monthIssues.length / ITEMS_PER_PAGE);
          const currentPage = getCurrentPage(month);
          const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
          const paginated = sortedIssues(monthIssues).slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE
          );

          return (
            <div key={month} className="mb-6 border rounded-md overflow-hidden">
              <div
                className="flex justify-between items-center bg-secondary text-secondary-foreground p-2 cursor-pointer"
                onClick={() => toggleMonth(month)}
              >
                <h2 className="font-semibold text-lg">
                  {month} ({monthIssues.length})
                </h2>
                {collapsedMonths[month] ? <ChevronRight /> : <ChevronDown />}
              </div>

              {!collapsedMonths[month] && (
                <div className="p-3 bg-card">
                  {paginated.map((issue) => {
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

                        {/* Expanded details */}
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
    <p><strong>Language:</strong> {issue.language}</p>
    <p><strong>Client Type:</strong> {issue.userType}</p>
    <p><strong>Project Name:</strong> {issue.internetSource}</p>
    <p><strong>Category:</strong> {issue.category}</p>
    <p><strong>Reason:</strong> {issue.reason || "N/A"}</p>
    <p className="text-sm text-muted-foreground">
      <strong>Date of Incident:</strong>{" "}
      {new Date(issue.dateOfIncident).toLocaleDateString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "medium",
      })}{" "}
      <strong>Time:</strong>{" "}
      {new Date(issue.dateOfIncident).toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        timeStyle: "short",
      })}
    </p>
    <p className="mt-2"><strong>Description:</strong> {issue.description}</p>
  </div>
)}

                      </div>
                    );
                  })}

                  {/* 🧭 Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(month, 1)}
                        disabled={currentPage === 1}
                        className="min-w-[70px]"
                      >
                        « First
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(month, Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        ‹ Prev
                      </Button>

                      <span className="text-sm text-muted-foreground px-2">
                        Page {currentPage} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(month, Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next ›
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(month, totalPages)}
                        disabled={currentPage === totalPages}
                        className="min-w-[70px]"
                      >
                        Last »
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

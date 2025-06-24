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
import { useState } from "react";
import type { ConvexIssue, MetaIssue } from "./types";

interface IssueListProps {
  issues: ConvexIssue[];
  onSelectIssue: (issue: MetaIssue) => void;
  onEditIssue: (issue: MetaIssue) => void;
  onDeleteIssue: (id: MetaIssue["_id"]) => void;
}

export default function IssueList({
  issues,
  onSelectIssue,
  onEditIssue,
  onDeleteIssue,
}: IssueListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterByCategory, setFilterByCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

 /* const ITEMS_PER_PAGE = 10;*/

  const filteredIssues = issues.filter(
    (issue) =>
      (filterByCategory === "All" || issue.category === filterByCategory) &&
      (issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

  function handleDownloadExcel(category: string, issues: ConvexIssue[]) {
    exportToJsonExcel(issues, category + "-issues-" + new Date().toDateString());
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Total Issues: {issues.length}
      </h2>

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

      {/* Render Grouped Issues */}
      {Object.entries(groupedIssues).map(([category, issues]) => (
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
            <ul className="space-y-2 mt-2">
              {sortedIssues(issues).map((issue) => (
                <li key={issue.title} className="bg-card text-foreground p-4 rounded shadow border border-border">
                  <div className="flex justify-between items-center">
                    <h3
                      className="font-semibold cursor-pointer hover:underline"
                      onClick={() => onSelectIssue(issue as MetaIssue)}
                    >
                      {issue.title}
                    </h3>
                    {issue.imageUrl && (
                      <Image
                        src={issue.imageUrl}
                        width={100}
                        height={100}
                        alt={issue.title}
                        className="rounded-md border border-border"
                      />
                    )}
                    <div className="flex space-x-2">
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
                      ? new Date(issue.dateOfIncident).toLocaleDateString()
                      : "N/A"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

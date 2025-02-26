import { useState } from "react";
import type { Issue } from "./types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Trash2, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface IssueListProps {
  issues: Issue[];
  onSelectIssue: (issue: Issue) => void;
  onEditIssue: (issue: Issue) => void;
  onDeleteIssue: (id: string) => void;
}

export default function IssueList({ issues, onSelectIssue, onEditIssue, onDeleteIssue }: IssueListProps) {
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterByCategory, setFilterByCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  // 🔍 Apply Search & Filtering
  const filteredIssues = issues.filter(issue => 
    (filterByCategory === "All" || issue.category === filterByCategory) &&
    (issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     issue.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
     issue.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
     issue.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 📂 Group Issues by Category
  const groupedIssues = filteredIssues.reduce((acc, issue) => {
    const category = issue.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  // 🔼 Sort Issues
  const sortedIssues = (issues: Issue[]) => {
    return [...issues].sort((a, b) => {
      if (sortBy === "agent") return a.agent.localeCompare(b.agent);
      return new Date(b.dateOfIncident).getTime() - new Date(a.dateOfIncident).getTime();
    });
  };

  // 🔢 Paginate Issues
  const allIssues = Object.values(groupedIssues).flat(); // Convert grouped issues to a flat list
  const totalPages = Math.ceil(allIssues.length / ITEMS_PER_PAGE);
  const paginatedIssues = allIssues.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div>
      {/* 🔢 Total Issues */}
      <h2 className="text-xl font-semibold mb-4">Total Issues: {issues.length}</h2>

      {/* 🔍 Search, Filtering & Sorting */}
      <div className="flex space-x-4 mb-4">
        <Input type="text" placeholder="Search issues..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <Select value={filterByCategory} onValueChange={setFilterByCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            <SelectItem value="No answer">No answer</SelectItem>
            <SelectItem value="Ghost calls">Ghost calls</SelectItem>
            <SelectItem value="Language errors">Language errors</SelectItem>
            <SelectItem value="Partner issues">Partner issues</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 📂 Render Grouped Issues with Pagination */}
      {Object.entries(groupedIssues).map(([category, issues]) => (
        <div key={category} className="mb-6">
          <div
            className="flex items-center justify-between bg-gray-200 p-2 rounded cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            <h2 className="text-lg font-semibold">{category} ({issues.length})</h2>
            {collapsedCategories[category] ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>

          {!collapsedCategories[category] && (
            <ul className="space-y-2 mt-2">
              {sortedIssues(paginatedIssues).map((issue) => (
                <li key={issue.id} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold cursor-pointer" onClick={() => onSelectIssue(issue)}>
                      {issue.title}
                    </h3>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => onEditIssue(issue)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteIssue(issue.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Agent: {issue.agent}</p>
                  <p className="text-sm text-gray-600">Language: {issue.language}</p>
                  <p className="text-sm text-gray-600">User Type: {issue.userType}</p>
                  <p className="text-sm text-gray-600">VPN: {issue.VPN || "N/A"}</p>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                  <p className="text-sm text-gray-600">Date of Incident: {issue.dateOfIncident ? new Date(issue.dateOfIncident).toLocaleDateString() : "N/A"}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      
      {totalPages > 1 && (
        <div className="flex justify-between mt-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Previous
          </Button>
          <p>Page {currentPage} of {totalPages}</p>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

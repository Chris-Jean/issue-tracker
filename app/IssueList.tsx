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
import Image from "next/image"; // ✅ Import next/image
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
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});
  const [sortBy, setSortBy] = useState<string>("date");
  const [filterByCategory, setFilterByCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null); // ✅ Added for image enlargement

  //  const [currentPage, setCurrentPage] = useState(1);


  // const ITEMS_PER_PAGE = 10;

  // 🔍 Apply Search & Filtering
  const filteredIssues = issues.filter(
    (issue) =>
      (filterByCategory === "All" || issue.category === filterByCategory) &&
      (issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // 📂 Group Issues by Category
  const groupedIssues = filteredIssues.reduce(
    (acc, issue) => {
      const category = issue.category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(issue);
      return acc;
    },
    {} as Record<string, ConvexIssue[]>
  );

  // 🔼 Sort Issues
  const sortedIssues = (issues: ConvexIssue[]) => {
    return [...issues].sort((a, b) => {
      if (sortBy === "agent") return a.agent.localeCompare(b.agent);
      return (
        new Date(b.dateOfIncident).getTime() -
        new Date(a.dateOfIncident).getTime()
      );
    });
  };

  // 🔢 Paginate Issues
  // const allIssues = Object.values(groupedIssues).flat(); // Convert grouped issues to a flat list
  
  // const totalPages = Math.ceil(allIssues.length / ITEMS_PER_PAGE);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  function handleDownloadExcel(category: string, issues: ConvexIssue[]) {
    exportToJsonExcel(
      issues,
      category + "-issues-" + new Date(Date.now()).toDateString()
    );
  }

  return (
    <div>
      {/* 🔢 Total Issues */}
      <h2 className="text-xl font-semibold mb-4">
        Total Issues: {issues.length}
      </h2>

      {/* 🔍 Search, Filtering & Sorting */}
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
            <h2 className="text-lg font-semibold">
              {category} ({issues.length})
            </h2>
            {collapsedCategories[category] ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
            <Download
              onClick={() => handleDownloadExcel(category, issues)}
              className="h-5 w-5"
            />
          </div>

          {!collapsedCategories[category] && (
            <ul className="space-y-2 mt-2">
              {sortedIssues(issues).map((issue) => (
                <li key={issue.title} className="bg-white p-4 rounded shadow">
                  <div className="flex justify-between items-center">
                    <h3
                      className="font-semibold cursor-pointer"
                      onClick={() => onSelectIssue(issue as MetaIssue)}
                    >
                      {issue.title}
                    </h3>
                    {/* ✅ Clickable Uploaded Image with next/image */}
                    {issue.imageUrl && (
                      <Image
                        src={issue.imageUrl}
                        width={100}
                        height={100}
                        alt={issue.title}
                        className="cursor-pointer"
                        onClick={() => setEnlargedImage(issue.imageUrl ?? null)}
                      />
                    )}
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditIssue(issue as MetaIssue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onDeleteIssue(issue._id as MetaIssue["_id"])
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Agent: {issue.agent}</p>
                  <p className="text-sm text-gray-600">
                    Language: {issue.language}
                  </p>
                  <p className="text-sm text-gray-600">{issue.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {/* ✅ Enlarged Image Popup using next/image */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setEnlargedImage(null)}
        >
          <Image
            src={enlargedImage}
            width={600}
            height={600}
            alt="Enlarged Attachment"
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}

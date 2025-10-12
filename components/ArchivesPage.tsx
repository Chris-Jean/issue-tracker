"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Issue {
  _id: string;
  title: string;
  agent: string;
  language: string;
  description: string;
  userType: string;
  VPN?: string;
  internetSource: string;
  category: string;
  reason?: string;
  dateOfIncident: string;
}

// 🧠 Group issues by Month-Year
function groupIssuesByMonth(issues: Issue[]) {
  return issues.reduce((acc: Record<string, Issue[]>, issue) => {
    const date = new Date(issue.dateOfIncident);
    const key = date.toLocaleString("default", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(issue);
    return acc;
  }, {});
}

// 🔢 Get top N values by field
function getTopItems(issues: Issue[], key: keyof Issue, topN = 5) {
  const counts = issues.reduce((acc: Record<string, number>, issue) => {
    const value = (issue[key] as string) || "Unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export default function ArchivesPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("")
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [pageByMonth, setPageByMonth] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const ITEMS_PER_PAGE = 10;
  

  // ✅ Fetch issues directly from Convex based on date range
  const issues = useQuery(api.issues.getIssuesByDateRange, {
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  // 📊 Group issues by month
  const grouped = useMemo(() => (issues ? groupIssuesByMonth(issues) : {}), [issues]);

  // 💡 Trends
  const trends = useMemo(() => {
    if (!issues || issues.length === 0) return null;
    return {
      topClients: getTopItems(issues, "userType"),
      topReasons: getTopItems(issues, "reason"),
      topLanguages: getTopItems(issues, "language"),
    };
  }, [issues]);

  // 🗓 Handle month select
  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    if (!month) return;
    const [year, m] = month.split("-");
    const start = `${month}-01`;
    const endOfMonth = new Date(Number(year), Number(m), 0)
      .toISOString()
      .split("T")[0];
    setStartDate(start);
    setEndDate(endOfMonth);
  };

  // 🔄 Toggle month collapse
  const toggleCollapse = (month: string) => {
    setCollapsed((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">📊 Archived Issues</h1>

      <div className="mb-6">
  <Input
    type="text"
    placeholder="🔍 Search by title, agent, or reason..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full md:w-1/2"
  />
</div>

      {/* 📅 Filter Controls */}
      <div className="flex flex-wrap gap-6 mb-8 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Month (YYYY-MM)</label>
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthSelect(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">From</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button>Apply Filter</Button>
        </div>
      </div>

      {/* 🧱 Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Collapsible Month Sections */}
        <div className="flex-1">
          {issues === undefined ? (
            <p>Loading issues...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="text-muted-foreground">No issues found for this range.</p>
          ) : (
            Object.entries(grouped).map(([month, monthIssues]) => {
              const page = pageByMonth[month] ?? 1;
              const totalPages = Math.ceil(monthIssues.length / ITEMS_PER_PAGE);
              const startIdx = (page - 1) * ITEMS_PER_PAGE;
              const filtered = monthIssues.filter((issue) => {
                const term = searchTerm.toLowerCase();
                return (
                  issue.title?.toLowerCase().includes(term) ||
                  issue.agent?.toLowerCase().includes(term) ||
                  issue.reason?.toLowerCase().includes(term) ||
                  issue.description?.toLowerCase().includes(term)
                );
              });
              
              const paginated = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

              return (
                <div key={month} className="mb-6 border rounded-lg overflow-hidden">
                  {/* Collapsible Header */}
                  <div
                    className="flex justify-between items-center bg-secondary text-secondary-foreground p-3 cursor-pointer"
                    onClick={() => toggleCollapse(month)}
                  >
                    <h2 className="font-semibold text-lg">
                      {month} ({monthIssues.length})
                    </h2>
                    {collapsed[month] ? <ChevronRight /> : <ChevronDown />}
                  </div>

                  {/* Expanded Month */}
                  {!collapsed[month] && (
                    <div className="p-4 bg-card">
                      {paginated.map((issue) => (
  <div
  key={issue._id}
  className="border border-border rounded p-3 mb-3 bg-background cursor-pointer"
  onClick={() =>
    setExpanded((prev) => ({ ...prev, [issue._id]: !prev[issue._id] }))
  }
>
  {/* Always visible header */}
  <div className="flex justify-between items-center">
    <div>
      <h3 className="font-semibold">{issue.title}</h3>
      <p className="text-sm text-muted-foreground">
        {new Date(issue.dateOfIncident).toLocaleDateString()} | {issue.agent}
      </p>
    </div>
    <span>{expanded[issue._id] ? "▲" : "▼"}</span>
  </div>

  {/* Conditionally expanded section */}
  {expanded[issue._id] && (
    <div className="mt-3 text-sm space-y-1">
      <p><strong>Language:</strong> {issue.language}</p>
      <p><strong>User Type:</strong> {issue.userType}</p>
      <p><strong>VPN:</strong> {issue.VPN || "N/A"}</p>
      <p><strong>Internet Source:</strong> {issue.internetSource}</p>
      <p><strong>Category:</strong> {issue.category}</p>
      <p><strong>Reason:</strong> {issue.reason || "N/A"}</p>
      <p className="text-sm text-muted-foreground">
      <strong>Date of Incident:</strong>{" "}
      {new Date(issue.dateOfIncident).toLocaleString("en-US", {
        timeZone: "America/New_York",
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </p>
      <p className="mt-2">{issue.description}</p>
    </div>
  )}
</div>

))}


                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          <button
                            onClick={() =>
                              setPageByMonth((prev) => ({
                                ...prev,
                                [month]: Math.max(1, page - 1),
                              }))
                            }
                            disabled={page === 1}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                          >
                            &lt;
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(
                              Math.max(0, page - 2),
                              Math.min(totalPages, page + 2)
                            )
                            .map((p) => (
                              <button
                                key={p}
                                onClick={() =>
                                  setPageByMonth((prev) => ({ ...prev, [month]: p }))
                                }
                                className={`px-3 py-1 border rounded ${
                                  p === page
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {p}
                              </button>
                            ))}

                          <button
                            onClick={() =>
                              setPageByMonth((prev) => ({
                                ...prev,
                                [month]: Math.min(totalPages, page + 1),
                              }))
                            }
                            disabled={page === totalPages}
                            className="px-3 py-1 border rounded disabled:opacity-50"
                          >
                            &gt;
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: Trends Sidebar */}
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
    </div>
  );
}

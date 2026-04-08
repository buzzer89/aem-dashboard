"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Settings2,
  FileText,
  Loader2,
  Search,
} from "lucide-react";
import type { PagePropertiesRow, PropertyColumn } from "@/types/dashboard";

// ── Default columns (shown before user configures) ───────────────────

export const DEFAULT_COLUMNS: PropertyColumn[] = [
  { id: "title", label: "Title", jcrProperty: "jcr:title" },
  { id: "description", label: "Description", jcrProperty: "jcr:description" },
  { id: "tags", label: "Tags", jcrProperty: "cq:tags" },
  { id: "template", label: "Template", jcrProperty: "cq:template" },
  { id: "lastModified", label: "Last Modified", jcrProperty: "cq:lastModified" },
];

// ── Preset suggestions for quick-add ─────────────────────────────────

const PRESET_SUGGESTIONS: PropertyColumn[] = [
  { id: "title", label: "Title", jcrProperty: "jcr:title" },
  { id: "description", label: "Description", jcrProperty: "jcr:description" },
  { id: "tags", label: "Tags", jcrProperty: "cq:tags" },
  { id: "template", label: "Template", jcrProperty: "cq:template" },
  { id: "lastModified", label: "Last Modified", jcrProperty: "cq:lastModified" },
  { id: "lastModifiedBy", label: "Last Modified By", jcrProperty: "cq:lastModifiedBy" },
  { id: "pageTitle", label: "Page Title", jcrProperty: "pageTitle" },
  { id: "navTitle", label: "Nav Title", jcrProperty: "navTitle" },
  { id: "hideInNav", label: "Hide in Nav", jcrProperty: "hideInNav" },
  { id: "audience", label: "Audience", jcrProperty: "audience" },
  { id: "language", label: "Language", jcrProperty: "jcr:language" },
  { id: "redirectTarget", label: "Redirect Target", jcrProperty: "cq:redirectTarget" },
  { id: "allowedTemplates", label: "Allowed Templates", jcrProperty: "cq:allowedTemplates" },
  { id: "designPath", label: "Design Path", jcrProperty: "cq:designPath" },
  { id: "lastReplicated", label: "Last Replicated", jcrProperty: "cq:lastReplicated" },
  { id: "lastReplicatedBy", label: "Last Replicated By", jcrProperty: "cq:lastReplicatedBy" },
  { id: "lastReplicationAction", label: "Replication Action", jcrProperty: "cq:lastReplicationAction" },
];

interface PagePropertiesTableProps {
  data: PagePropertiesRow[];
  columns: PropertyColumn[];
  onColumnsChange: (columns: PropertyColumn[]) => void;
  loading?: boolean;
  onRefresh?: () => void;
  pageSize?: number;
}

export default function PagePropertiesTable({
  data,
  columns,
  onColumnsChange,
  loading = false,
  onRefresh,
  pageSize = 15,
}: PagePropertiesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfig, setShowConfig] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newJcrProp, setNewJcrProp] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter data by search query (matches path or any property value)
  const filteredData = searchQuery.trim()
    ? data.filter((row) => {
        const q = searchQuery.toLowerCase();
        if (row.path.toLowerCase().includes(q)) return true;
        return Object.values(row.properties).some((val) =>
          val.toLowerCase().includes(q)
        );
      })
    : data;

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(start, start + pageSize);
  const showPagination = filteredData.length > pageSize;

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setCurrentPage(1);
  }

  function addColumn(col: PropertyColumn) {
    if (columns.some((c) => c.id === col.id)) return;
    onColumnsChange([...columns, col]);
  }

  function removeColumn(id: string) {
    onColumnsChange(columns.filter((c) => c.id !== id));
  }

  function addCustomColumn() {
    if (!newLabel.trim() || !newJcrProp.trim()) return;
    const id = newJcrProp.replace(/[^a-zA-Z0-9]/g, "_");
    if (columns.some((c) => c.id === id)) return;
    onColumnsChange([
      ...columns,
      { id, label: newLabel.trim(), jcrProperty: newJcrProp.trim() },
    ]);
    setNewLabel("");
    setNewJcrProp("");
  }

  // Available presets = presets not already in columns
  const availablePresets = PRESET_SUGGESTIONS.filter(
    (p) => !columns.some((c) => c.jcrProperty === p.jcrProperty)
  );

  function truncate(value: string, max: number = 60): string {
    if (value.length <= max) return value;
    return value.slice(0, max) + "…";
  }

  function formatValue(value: string): string {
    if (!value) return "—";
    // Format dates
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      try {
        return new Date(value).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      } catch {
        return value;
      }
    }
    // Format template paths — show only last segment
    if (value.startsWith("/conf/") || value.startsWith("/apps/")) {
      return value.split("/").pop() ?? value;
    }
    return truncate(value);
  }

  return (
    <div className="space-y-4">
      {/* Column configuration panel */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-300">
              Page Properties
            </h3>
            <span className="text-xs text-gray-500">
              {data.length} {data.length === 1 ? "page" : "pages"}
              {searchQuery.trim() && filteredData.length !== data.length && (
                <> · {filteredData.length} matching</>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search pages…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-56 rounded-md bg-gray-800 border border-gray-700 pl-8 pr-8 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-gray-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </button>
            )}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border transition-colors ${
                showConfig
                  ? "bg-blue-600/20 border-blue-500/30 text-blue-300"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800 border-gray-700"
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Configure Columns
            </button>
          </div>
        </div>

        {/* Column config drawer */}
        {showConfig && (
          <div className="border-b border-gray-800 bg-gray-900/80 p-5 space-y-4">
            {/* Active columns */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Active Columns
              </p>
              <div className="flex flex-wrap gap-2">
                {columns.map((col) => (
                  <span
                    key={col.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-600/15 border border-blue-500/25 text-xs text-blue-300"
                  >
                    <span className="font-medium">{col.label}</span>
                    <span className="text-blue-400/50 font-mono text-[10px]">
                      {col.jcrProperty}
                    </span>
                    <button
                      onClick={() => removeColumn(col.id)}
                      className="ml-0.5 hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {columns.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No columns selected. Add columns below.
                  </p>
                )}
              </div>
            </div>

            {/* Quick-add presets */}
            {availablePresets.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  Quick Add
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {availablePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => addColumn(preset)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-xs text-gray-400 hover:text-gray-200 hover:border-gray-600 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom property */}
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                Add Custom Property
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Column label"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-1.5 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="JCR property (e.g. audience)"
                  value={newJcrProp}
                  onChange={(e) => setNewJcrProp(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomColumn()}
                  className="flex-1 rounded-md bg-gray-800 border border-gray-700 px-3 py-1.5 text-xs text-gray-100 font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                <button
                  onClick={addCustomColumn}
                  disabled={!newLabel.trim() || !newJcrProp.trim()}
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Property path is relative to jcr:content (e.g. &quot;audience&quot;, &quot;myApp/customField&quot;)
              </p>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3">
            <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
            <p className="text-sm text-gray-400">Fetching page properties...</p>
          </div>
        )}

        {/* Table */}
        {!loading && columns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide sticky left-0 bg-gray-900/95">
                    Page
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {paginatedData.map((row) => (
                  <tr
                    key={row.path}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-gray-300 sticky left-0 bg-gray-950/80 max-w-[280px] truncate">
                      {row.path}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className="px-3 py-3 text-xs text-gray-400 max-w-[200px]"
                        title={row.properties[col.id] || ""}
                      >
                        {formatValue(row.properties[col.id] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
                {paginatedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="px-5 py-8 text-center text-sm text-gray-500"
                    >
                      {data.length === 0
                        ? "No page data. Connect your AEM instance and click Refresh."
                        : "No results"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty column state */}
        {!loading && columns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Settings2 className="h-8 w-8 text-gray-600" />
            <p className="text-sm text-gray-500">
              Click &quot;Configure Columns&quot; to select which page properties to display
            </p>
          </div>
        )}

        {/* Pagination */}
        {showPagination && !loading && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Showing {start + 1}–{Math.min(start + pageSize, filteredData.length)} of{" "}
              {filteredData.length}{searchQuery.trim() && filteredData.length !== data.length ? ` (filtered from ${data.length})` : ""}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first, last, and pages near current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 2
                  );
                })
                .map((page, i, arr) => {
                  const prev = arr[i - 1];
                  const showEllipsis = prev !== undefined && page - prev > 1;
                  return (
                    <span key={page} className="flex items-center">
                      {showEllipsis && (
                        <span className="px-1 text-xs text-gray-600">…</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600/20 text-blue-400"
                            : "text-gray-400 hover:bg-gray-800"
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  );
                })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  Bot,
} from "lucide-react";
import type { SiteIssue, Severity } from "@/types/dashboard";

interface IssuesTableProps {
  issues: SiteIssue[];
  onSelectIssue: (issue: SiteIssue) => void;
}

const severityConfig: Record<
  Severity,
  { icon: typeof AlertTriangle; color: string; bg: string; badge: string }
> = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  high: {
    icon: AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    badge: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  medium: {
    icon: Info,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  low: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
};

const statusColors: Record<string, string> = {
  open: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  resolved: "bg-green-500/20 text-green-300 border-green-500/30",
};

export default function IssuesTable({
  issues,
  onSelectIssue,
}: IssuesTableProps) {
  const sorted = [...issues].sort((a, b) => {
    const order: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return order[a.severity] - order[b.severity];
  });

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Detected Issues ({issues.length})
        </h3>
        <div className="flex gap-2 text-xs">
          <span className="text-red-400">
            {issues.filter((i) => i.severity === "critical").length} Critical
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-orange-400">
            {issues.filter((i) => i.severity === "high").length} High
          </span>
          <span className="text-gray-600">|</span>
          <span className="text-yellow-400">
            {issues.filter((i) => i.severity === "medium").length} Medium
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        {sorted.map((issue) => {
          const sev = severityConfig[issue.severity];
          const SevIcon = sev.icon;

          return (
            <button
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              className="w-full text-left px-5 py-4 hover:bg-gray-800/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md mt-0.5 ${sev.bg}`}>
                  <SevIcon className={`h-4 w-4 ${sev.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500 font-mono">
                      {issue.id}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${sev.badge}`}
                    >
                      {issue.severity}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[issue.status]}`}
                    >
                      {issue.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-200 truncate">
                    {issue.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {issue.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    {issue.metric && (
                      <span className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-0.5 rounded">
                        {issue.metric}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {issue.affectedPages.length > 0 &&
                        `${issue.affectedPages.length} page${issue.affectedPages.length > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 group-hover:text-blue-400 transition-colors">
                  <Bot className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

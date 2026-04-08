"use client";

import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Bot,
  FileText,
  Settings,
} from "lucide-react";
import Link from "next/link";

export type TabId = "overview" | "performance" | "issues" | "properties" | "ai";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", id: "overview" as const },
  { icon: Activity, label: "Performance", id: "performance" as const },
  { icon: AlertTriangle, label: "Issues", id: "issues" as const },
  { icon: FileText, label: "Page Properties", id: "properties" as const },
  { icon: Bot, label: "AI Insights", id: "ai" as const },
];

export default function DashboardLayout({
  children,
  activeTab = "overview",
  onTabChange,
}: {
  children: React.ReactNode;
  activeTab?: TabId;
  onTabChange?: (tab: TabId) => void;
}) {
  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <button
            onClick={() => onTabChange?.("overview")}
            className="text-left"
          >
            <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              AEM Intelligence
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Performance &amp; AI Dashboard
            </p>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}

          {/* Settings — separate route */}
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Bot className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-300">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Click any issue to get AI-generated fix recommendations
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

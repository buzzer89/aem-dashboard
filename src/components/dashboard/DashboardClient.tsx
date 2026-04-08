"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock,
  Globe,
  Gauge,
  Server,
  RefreshCw,
  Loader2,
  Settings,
} from "lucide-react";
import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import type { TabId } from "@/components/dashboard/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import HealthScore from "@/components/dashboard/HealthScore";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import CategoryChart from "@/components/dashboard/CategoryChart";
import IssuesTable from "@/components/dashboard/IssuesTable";
import PagePerformanceTable from "@/components/dashboard/PagePerformanceTable";
import PagePropertiesTable, {
  DEFAULT_COLUMNS,
} from "@/components/dashboard/PagePropertiesTable";
import AIRecommendationPanel from "@/components/dashboard/AIRecommendationPanel";

import type {
  SiteIssue,
  DashboardSummary,
  PerformanceDataPoint,
  CategoryBreakdown,
  PagePerformance,
  PagePropertiesRow,
  PropertyColumn,
} from "@/types/dashboard";
import {
  dashboardSummary as mockSummary,
  performanceTrend as mockTrend,
  categoryBreakdown as mockCategories,
  siteIssues as mockIssues,
  pagePerformanceData as mockPages,
} from "@/data/mock-data";
import { loadConfig } from "@/services/config-store";
import {
  fetchAEMDashboardData,
  fetchPageProperties,
} from "@/services/aem-client";

export default function DashboardClient() {
  const [mounted, setMounted] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<SiteIssue | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary>(mockSummary);
  const [trend, setTrend] = useState<PerformanceDataPoint[]>(mockTrend);
  const [categories, setCategories] =
    useState<CategoryBreakdown[]>(mockCategories);
  const [issues, setIssues] = useState<SiteIssue[]>(mockIssues);
  const [pages, setPages] = useState<PagePerformance[]>(mockPages);

  const [warnings, setWarnings] = useState<string[]>([]);
  const [hasConfig, setHasConfig] = useState(false);

  // Page Properties tab state
  const [propertyColumns, setPropertyColumns] = useState<PropertyColumn[]>(() => {
    if (typeof window === "undefined") return DEFAULT_COLUMNS;
    try {
      const saved = localStorage.getItem("aem-property-columns");
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch {
      return DEFAULT_COLUMNS;
    }
  });
  const [propertiesData, setPropertiesData] = useState<PagePropertiesRow[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  const fetchProperties = useCallback(
    async (cols: PropertyColumn[]) => {
      const config = loadConfig();
      if (!config || cols.length === 0) {
        setPropertiesData([]);
        return;
      }
      setPropertiesLoading(true);
      try {
        const rows = await fetchPageProperties(config, cols);
        setPropertiesData(rows);
      } catch (err) {
        console.warn("[AEM] fetchPageProperties error:", err);
      } finally {
        setPropertiesLoading(false);
      }
    },
    []
  );

  const handleColumnsChange = useCallback(
    (cols: PropertyColumn[]) => {
      setPropertyColumns(cols);
      try {
        localStorage.setItem("aem-property-columns", JSON.stringify(cols));
      } catch { /* ignore */ }
      fetchProperties(cols);
    },
    [fetchProperties]
  );

  const fetchLiveData = useCallback(async () => {
    const config = loadConfig();
    if (!config) return;

    setLoading(true);
    setError(null);
    setWarnings([]);
    try {
      const data = await fetchAEMDashboardData(config);
      setSummary(data.summary);
      setIssues(data.issues);
      setCategories(data.categories);
      setPages(data.pages.length > 0 ? data.pages : mockPages);
      setTrend(data.trend.length > 0 ? data.trend : mockTrend);
      setWarnings(data.warnings);
      setIsLive(true);
      setLastScan(new Date().toLocaleString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch AEM data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const config = loadConfig();
    setHasConfig(!!config);
    if (config) {
      fetchLiveData();
    }
  }, [fetchLiveData]);

  // Fetch properties when the properties tab is activated for the first time
  const [propertiesFetched, setPropertiesFetched] = useState(false);
  useEffect(() => {
    if (activeTab === "properties" && !propertiesFetched && hasConfig) {
      setPropertiesFetched(true);
      fetchProperties(propertyColumns);
    }
  }, [activeTab, propertiesFetched, hasConfig, fetchProperties, propertyColumns]);

  // Render a shell on the server / before mount to avoid hydration mismatch.
  // Client-only state (localStorage, hasConfig, isLive) isn't available during SSR.
  if (!mounted) {
    return (
      <DashboardLayout activeTab="overview" onTabChange={() => {}}>
        <div className="p-6 flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const tabTitles: Record<TabId, string> = {
    overview: "Performance Overview",
    performance: "Performance Metrics",
    issues: "Site Issues",
    properties: "Page Properties",
    ai: "AI Insights",
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-100">
              {tabTitles[activeTab]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLive ? (
                <>
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5 animate-pulse" />
                  Live data {lastScan && `· Last scan: ${lastScan}`}
                </>
              ) : (
                "Showing mock data — configure AEM to see live data"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!hasConfig && (
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-sm text-blue-300 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Connect AEM
              </Link>
            )}
            <button
              onClick={fetchLiveData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm text-gray-300 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {loading ? "Scanning…" : "Run Scan"}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="rounded-lg border border-yellow-800/50 bg-yellow-950/30 p-3 space-y-1">
            {warnings.map((w, i) => (
              <p key={i} className="text-sm text-yellow-300">
                {w}
              </p>
            ))}
          </div>
        )}

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:row-span-2">
                <HealthScore score={summary.healthScore} />
              </div>
              <MetricCard
                title="Total Pages"
                value={summary.totalPages.toLocaleString()}
                icon={Globe}
                color="blue"
                subtitle="Monitored pages"
              />
              <MetricCard
                title="Critical Issues"
                value={summary.criticalIssues}
                icon={AlertTriangle}
                color="red"
              />
              <MetricCard
                title="Open Issues"
                value={summary.openIssues}
                icon={Clock}
                color="yellow"
                subtitle={`${summary.resolvedThisWeek} resolved this week`}
              />
              <MetricCard
                title="Resolved This Week"
                value={summary.resolvedThisWeek}
                icon={CheckCircle}
                color="green"
              />
              <MetricCard
                title="Avg LCP"
                value={`${(summary.avgLcp / 1000).toFixed(1)}s`}
                icon={Activity}
                color={
                  summary.avgLcp <= 2500
                    ? "green"
                    : summary.avgLcp <= 4000
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.avgLcp <= 2500
                    ? "Good"
                    : summary.avgLcp <= 4000
                      ? "Needs improvement"
                      : "Poor"
                }
              />
              <MetricCard
                title="Avg CLS"
                value={summary.avgCls.toFixed(2)}
                icon={Gauge}
                color={
                  summary.avgCls <= 0.1
                    ? "green"
                    : summary.avgCls <= 0.25
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.avgCls <= 0.1
                    ? "Good"
                    : summary.avgCls <= 0.25
                      ? "Needs improvement"
                      : "Poor"
                }
              />
              <MetricCard
                title="Cache Hit Rate"
                value={`${summary.cacheHitRate}%`}
                icon={Server}
                color={
                  summary.cacheHitRate >= 80
                    ? "green"
                    : summary.cacheHitRate >= 60
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.cacheHitRate >= 80
                    ? "Healthy"
                    : summary.cacheHitRate >= 60
                      ? "Needs improvement"
                      : "Poor"
                }
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <PerformanceChart data={trend} />
              </div>
              <CategoryChart data={categories} />
            </div>

            <PagePerformanceTable data={pages} pageSize={5} />

            <IssuesTable issues={issues} onSelectIssue={setSelectedIssue} />
          </>
        )}

        {/* ── Performance Tab ── */}
        {activeTab === "performance" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Avg LCP"
                value={`${(summary.avgLcp / 1000).toFixed(1)}s`}
                icon={Activity}
                color={
                  summary.avgLcp <= 2500
                    ? "green"
                    : summary.avgLcp <= 4000
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.avgLcp <= 2500
                    ? "Good (≤ 2.5s)"
                    : summary.avgLcp <= 4000
                      ? "Needs improvement (≤ 4s)"
                      : "Poor (> 4s)"
                }
              />
              <MetricCard
                title="Avg CLS"
                value={summary.avgCls.toFixed(2)}
                icon={Gauge}
                color={
                  summary.avgCls <= 0.1
                    ? "green"
                    : summary.avgCls <= 0.25
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.avgCls <= 0.1
                    ? "Good (≤ 0.1)"
                    : summary.avgCls <= 0.25
                      ? "Needs improvement (≤ 0.25)"
                      : "Poor (> 0.25)"
                }
              />
              <MetricCard
                title="Avg INP"
                value={`${summary.avgInp}ms`}
                icon={Activity}
                color={
                  summary.avgInp <= 200
                    ? "green"
                    : summary.avgInp <= 500
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.avgInp <= 200
                    ? "Good (≤ 200ms)"
                    : summary.avgInp <= 500
                      ? "Needs improvement (≤ 500ms)"
                      : "Poor (> 500ms)"
                }
              />
              <MetricCard
                title="Cache Hit Rate"
                value={`${summary.cacheHitRate}%`}
                icon={Server}
                color={
                  summary.cacheHitRate >= 80
                    ? "green"
                    : summary.cacheHitRate >= 60
                      ? "yellow"
                      : "red"
                }
                subtitle={
                  summary.cacheHitRate >= 80
                    ? "Healthy"
                    : summary.cacheHitRate >= 60
                      ? "Needs improvement"
                      : "Poor"
                }
              />
            </div>

            <PerformanceChart data={trend} />
            <PagePerformanceTable data={pages} pageSize={10} />
          </>
        )}

        {/* ── Issues Tab ── */}
        {activeTab === "issues" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Critical Issues"
                value={summary.criticalIssues}
                icon={AlertTriangle}
                color="red"
              />
              <MetricCard
                title="Open Issues"
                value={summary.openIssues}
                icon={Clock}
                color="yellow"
              />
              <MetricCard
                title="Resolved This Week"
                value={summary.resolvedThisWeek}
                icon={CheckCircle}
                color="green"
              />
              <MetricCard
                title="Health Score"
                value={summary.healthScore}
                icon={Activity}
                color="blue"
              />
            </div>

            <CategoryChart data={categories} />
            <IssuesTable issues={issues} onSelectIssue={setSelectedIssue} />
          </>
        )}

        {/* ── Properties Tab ── */}
        {activeTab === "properties" && (
          <PagePropertiesTable
            data={propertiesData}
            columns={propertyColumns}
            onColumnsChange={handleColumnsChange}
            loading={propertiesLoading}
            onRefresh={() => fetchProperties(propertyColumns)}
            pageSize={15}
          />
        )}

        {/* ── AI Insights Tab ── */}
        {activeTab === "ai" && (
          <>
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                  <Bot className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-200">
                    AI-Powered Recommendations
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select any issue below to get Claude-generated fix steps
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Critical Issues"
                value={summary.criticalIssues}
                icon={AlertTriangle}
                color="red"
                subtitle="Click an issue for AI fix"
              />
              <MetricCard
                title="Open Issues"
                value={summary.openIssues}
                icon={Clock}
                color="yellow"
              />
              <MetricCard
                title="Health Score"
                value={summary.healthScore}
                icon={Activity}
                color="blue"
              />
            </div>

            <IssuesTable issues={issues} onSelectIssue={setSelectedIssue} />
          </>
        )}
      </div>

      <AIRecommendationPanel
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </DashboardLayout>
  );
}

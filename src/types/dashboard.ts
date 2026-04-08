// ── Severity & Status Enums ──────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssueCategory =
  | "performance"
  | "seo"
  | "accessibility"
  | "content_quality"
  | "infrastructure"
  | "security";

// ── Core Web Vitals ──────────────────────────────────────────────────

export interface WebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift
  inp: number; // Interaction to Next Paint (ms)
  ttfb: number; // Time to First Byte (ms)
  fcp: number; // First Contentful Paint (ms)
}

// ── Performance Metric (time-series) ─────────────────────────────────

export interface PerformanceDataPoint {
  date: string; // ISO date string
  lcp: number;
  cls: number;
  inp: number;
  ttfb: number;
}

// ── Site Issue ───────────────────────────────────────────────────────

export interface SiteIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: Severity;
  status: IssueStatus;
  affectedPages: string[];
  detectedAt: string;
  metric?: string; // e.g. "LCP: 4200ms"
}

// ── AI Recommendation ────────────────────────────────────────────────

export interface AIRecommendation {
  issueId: string;
  summary: string;
  steps: string[];
  estimatedImpact: string;
  effort: "low" | "medium" | "high";
  codeSnippet?: string;
  references?: string[];
}

// ── Dashboard Summary ────────────────────────────────────────────────

export interface DashboardSummary {
  totalPages: number;
  healthScore: number; // 0–100
  criticalIssues: number;
  openIssues: number;
  resolvedThisWeek: number;
  avgLcp: number;
  avgCls: number;
  avgInp: number;
  cacheHitRate: number; // percentage
}

// ── Category Breakdown (for pie/bar charts) ──────────────────────────

export interface CategoryBreakdown {
  category: IssueCategory;
  count: number;
  label: string;
}

// ── Page Performance Row ─────────────────────────────────────────────

export interface PagePerformance {
  path: string;
  template: string;
  lcp: number;
  cls: number;
  inp: number;
  seoScore: number;
  issues: number;
}

// ── Configurable Property Column ─────────────────────────────────────

export interface PropertyColumn {
  id: string; // unique key
  label: string; // display header
  jcrProperty: string; // JCR property path relative to jcr:content (e.g. "jcr:title", "jcr:description", "cq:tags", "audience")
}

// ── Page Properties Row ──────────────────────────────────────────────

export interface PagePropertiesRow {
  path: string;
  properties: Record<string, string>; // column id → value
}

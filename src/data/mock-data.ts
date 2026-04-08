import type {
  DashboardSummary,
  SiteIssue,
  PerformanceDataPoint,
  CategoryBreakdown,
  PagePerformance,
} from "@/types/dashboard";

// ── Dashboard Summary ────────────────────────────────────────────────

export const dashboardSummary: DashboardSummary = {
  totalPages: 1247,
  healthScore: 68,
  criticalIssues: 4,
  openIssues: 23,
  resolvedThisWeek: 7,
  avgLcp: 3200,
  avgCls: 0.18,
  avgInp: 280,
  cacheHitRate: 72,
};

// ── Performance Trend (last 14 days) ─────────────────────────────────

export const performanceTrend: PerformanceDataPoint[] = [
  { date: "Mar 25", lcp: 3800, cls: 0.22, inp: 310, ttfb: 620 },
  { date: "Mar 26", lcp: 3650, cls: 0.2, inp: 295, ttfb: 590 },
  { date: "Mar 27", lcp: 3700, cls: 0.21, inp: 300, ttfb: 610 },
  { date: "Mar 28", lcp: 3500, cls: 0.19, inp: 285, ttfb: 580 },
  { date: "Mar 29", lcp: 3400, cls: 0.18, inp: 275, ttfb: 560 },
  { date: "Mar 30", lcp: 3350, cls: 0.19, inp: 290, ttfb: 570 },
  { date: "Mar 31", lcp: 3450, cls: 0.2, inp: 295, ttfb: 585 },
  { date: "Apr 01", lcp: 3300, cls: 0.18, inp: 280, ttfb: 550 },
  { date: "Apr 02", lcp: 3250, cls: 0.17, inp: 270, ttfb: 540 },
  { date: "Apr 03", lcp: 3200, cls: 0.18, inp: 280, ttfb: 545 },
  { date: "Apr 04", lcp: 3150, cls: 0.16, inp: 265, ttfb: 530 },
  { date: "Apr 05", lcp: 3100, cls: 0.15, inp: 260, ttfb: 520 },
  { date: "Apr 06", lcp: 3200, cls: 0.18, inp: 280, ttfb: 540 },
  { date: "Apr 07", lcp: 3200, cls: 0.18, inp: 280, ttfb: 535 },
];

// ── Site Issues ──────────────────────────────────────────────────────

export const siteIssues: SiteIssue[] = [
  {
    id: "ISS-001",
    title: "High LCP on product listing pages",
    description:
      "Product listing pages have an average LCP of 4.2s, well above the 2.5s threshold. Hero images are unoptimized PNGs averaging 3.1MB.",
    category: "performance",
    severity: "critical",
    status: "open",
    affectedPages: [
      "/en/products",
      "/en/products/electronics",
      "/en/products/clothing",
      "/en/products/home-garden",
    ],
    detectedAt: "2026-04-05T10:30:00Z",
    metric: "LCP: 4200ms",
  },
  {
    id: "ISS-002",
    title: "Dispatcher cache miss rate exceeding 55%",
    description:
      "API paths under /content/api/* are not being cached by the dispatcher, causing high origin load. Cache miss rate is 58% overall.",
    category: "infrastructure",
    severity: "critical",
    status: "open",
    affectedPages: ["/content/api/products", "/content/api/search"],
    detectedAt: "2026-04-04T14:15:00Z",
    metric: "Cache hit: 42%",
  },
  {
    id: "ISS-003",
    title: "Missing alt text on 140+ images",
    description:
      "Accessibility scan found 143 images across 67 pages without alt text attributes, failing WCAG 2.1 Level A criterion 1.1.1.",
    category: "accessibility",
    severity: "high",
    status: "open",
    affectedPages: [
      "/en/about",
      "/en/gallery",
      "/en/products/featured",
      "+64 more",
    ],
    detectedAt: "2026-04-03T09:00:00Z",
    metric: "143 images",
  },
  {
    id: "ISS-004",
    title: "CLS spike on mobile viewports",
    description:
      "Mobile devices (< 768px) show CLS of 0.32 on pages using the hero-banner component. The image container lacks explicit dimensions.",
    category: "performance",
    severity: "critical",
    status: "open",
    affectedPages: ["/en/home", "/en/campaigns/spring-sale", "/en/landing/*"],
    detectedAt: "2026-04-06T08:45:00Z",
    metric: "CLS: 0.32",
  },
  {
    id: "ISS-005",
    title: "Missing meta descriptions on 89 pages",
    description:
      "SEO audit found 89 pages without meta description tags. These pages will show auto-generated snippets in search results.",
    category: "seo",
    severity: "high",
    status: "open",
    affectedPages: ["/en/blog/*", "/en/support/faq/*", "/en/docs/*"],
    detectedAt: "2026-04-02T11:00:00Z",
    metric: "89 pages",
  },
  {
    id: "ISS-006",
    title: "Slow Oak queries on search results page",
    description:
      "The search results page executes a full-text query using LIKE '%term%' without a supporting index. Average response time is 2.8s.",
    category: "performance",
    severity: "high",
    status: "in_progress",
    affectedPages: ["/en/search"],
    detectedAt: "2026-04-01T16:30:00Z",
    metric: "Query: 2800ms",
  },
  {
    id: "ISS-007",
    title: "Unoptimized DAM assets consuming excess storage",
    description:
      "324 original DAM assets over 5MB each. Total excess storage: ~2.1GB. Many are PSD/TIFF files uploaded without web renditions.",
    category: "content_quality",
    severity: "medium",
    status: "open",
    affectedPages: [],
    detectedAt: "2026-04-03T13:20:00Z",
    metric: "2.1GB excess",
  },
  {
    id: "ISS-008",
    title: "Broken internal links detected",
    description:
      "Link crawler found 34 broken internal links pointing to pages that return 404. Most are references to deleted campaign pages.",
    category: "content_quality",
    severity: "high",
    status: "open",
    affectedPages: [
      "/en/blog/winter-deals",
      "/en/campaigns/2025-black-friday",
      "+12 more",
    ],
    detectedAt: "2026-04-05T07:00:00Z",
    metric: "34 broken links",
  },
  {
    id: "ISS-009",
    title: "JavaScript bundle exceeds 500KB on landing pages",
    description:
      "Landing page clientlibs include unused polyfills and vendor libraries. Main bundle is 612KB gzipped, impacting FCP and INP.",
    category: "performance",
    severity: "medium",
    status: "open",
    affectedPages: ["/en/landing/*", "/en/campaigns/*"],
    detectedAt: "2026-04-04T10:00:00Z",
    metric: "Bundle: 612KB",
  },
  {
    id: "ISS-010",
    title: "Heading hierarchy violations on 42 pages",
    description:
      "Multiple pages jump from H1 to H3 or H4, skipping H2. This impacts both SEO and screen reader navigation.",
    category: "accessibility",
    severity: "medium",
    status: "open",
    affectedPages: ["/en/services/*", "/en/about/team", "/en/partners/*"],
    detectedAt: "2026-04-02T15:45:00Z",
    metric: "42 pages",
  },
  {
    id: "ISS-011",
    title: "Replication queue backlog exceeding threshold",
    description:
      "Author-to-publish replication queue has 156 pending items with an average lag of 12 minutes. Normal threshold is under 2 minutes.",
    category: "infrastructure",
    severity: "critical",
    status: "in_progress",
    affectedPages: [],
    detectedAt: "2026-04-07T06:00:00Z",
    metric: "Lag: 12min",
  },
  {
    id: "ISS-012",
    title: "Missing canonical tags on paginated content",
    description:
      "Blog listing pages (page 2, 3, etc.) lack canonical tags, risking duplicate content penalties in search engines.",
    category: "seo",
    severity: "medium",
    status: "open",
    affectedPages: ["/en/blog?page=2", "/en/blog?page=3", "/en/news?page=2"],
    detectedAt: "2026-04-01T09:30:00Z",
    metric: "12 pages",
  },
];

// ── Category Breakdown ───────────────────────────────────────────────

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: "performance", count: 4, label: "Performance" },
  { category: "seo", count: 3, label: "SEO" },
  { category: "accessibility", count: 2, label: "Accessibility" },
  { category: "content_quality", count: 2, label: "Content Quality" },
  { category: "infrastructure", count: 2, label: "Infrastructure" },
  { category: "security", count: 0, label: "Security" },
];

// ── Top Pages by Issues ──────────────────────────────────────────────

export const pagePerformanceData: PagePerformance[] = [
  { path: "/en/products", template: "product-listing", lcp: 4200, cls: 0.12, inp: 320, seoScore: 72, issues: 3 },
  { path: "/en/home", template: "homepage", lcp: 2800, cls: 0.32, inp: 210, seoScore: 91, issues: 2 },
  { path: "/en/search", template: "search-results", lcp: 3600, cls: 0.08, inp: 450, seoScore: 65, issues: 2 },
  { path: "/en/blog", template: "blog-listing", lcp: 2400, cls: 0.05, inp: 180, seoScore: 58, issues: 3 },
  { path: "/en/campaigns/spring-sale", template: "landing-page", lcp: 3100, cls: 0.28, inp: 290, seoScore: 78, issues: 2 },
  { path: "/en/about", template: "content-page", lcp: 2200, cls: 0.04, inp: 150, seoScore: 82, issues: 1 },
  { path: "/en/gallery", template: "gallery", lcp: 3800, cls: 0.15, inp: 200, seoScore: 70, issues: 2 },
  { path: "/en/services", template: "content-page", lcp: 2100, cls: 0.03, inp: 140, seoScore: 85, issues: 1 },
];

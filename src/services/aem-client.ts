import type { AEMConfig } from "@/types/config";
import type {
  DashboardSummary,
  SiteIssue,
  PerformanceDataPoint,
  CategoryBreakdown,
  PagePerformance,
  PagePropertiesRow,
  PropertyColumn,
  IssueCategory,
  Severity,
} from "@/types/dashboard";

// ── AEM query response shapes ────────────────────────────────────────

interface QueryBuilderResult {
  hits: Array<Record<string, unknown>>;
  results: number;
  total: number;
}

interface HealthCheckResult {
  results: Array<{
    name: string;
    status: string;
    messages?: string[];
  }>;
}

// ── Helper: resolve DAM path from config ─────────────────────────────

function getDamPath(config: AEMConfig): string {
  if (config.damPath) return config.damPath;
  // Derive from sitePath: /content/my-brand → /content/dam/my-brand
  const parts = config.sitePath.split("/");
  // parts: ["", "content", "my-brand", ...]
  if (parts.length >= 3) {
    return `/content/dam/${parts.slice(2).join("/")}`;
  }
  return "/content/dam";
}

// ── Helper: build auth headers ───────────────────────────────────────

function buildHeaders(config: AEMConfig): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (config.authType === "basic" && config.username && config.password) {
    headers["Authorization"] =
      "Basic " + btoa(`${config.username}:${config.password}`);
  } else if (config.authType === "token" && config.token) {
    headers["Authorization"] = `Bearer ${config.token}`;
  }

  return headers;
}

// ── Proxy-aware fetch (routes through /api/aem-proxy to avoid CORS) ─

async function aemFetch(
  config: AEMConfig,
  path: string
): Promise<Response> {
  const res = await fetch("/api/aem-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instanceUrl: config.instanceUrl,
      path,
      headers: buildHeaders(config),
    }),
  });
  return res;
}

// ── Connection test ──────────────────────────────────────────────────

export async function testConnection(
  config: AEMConfig
): Promise<{ ok: boolean; message: string; aemVersion?: string }> {
  try {
    const res = await aemFetch(config, "/libs/granite/core/content/login.html");

    if (res.ok) {
      // Try to get AEM product info
      const infoRes = await aemFetch(
        config,
        "/system/console/productinfo.json"
      );
      let aemVersion = "Unknown";
      if (infoRes.ok) {
        try {
          const info = await infoRes.json();
          aemVersion = info?.product?.version ?? info?.version ?? "Connected";
        } catch {
          aemVersion = "Connected";
        }
      }
      return { ok: true, message: "Connected to AEM", aemVersion };
    }

    if (res.status === 401 || res.status === 403) {
      return { ok: false, message: "Authentication failed. Check credentials." };
    }

    return { ok: false, message: `AEM returned status ${res.status}` };
  } catch (error) {
    return {
      ok: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// ── Fetch pages with missing metadata (SEO issues) ──────────────────

async function fetchPagesWithMissingMeta(
  config: AEMConfig
): Promise<SiteIssue[]> {
  const issues: SiteIssue[] = [];

  // Pages missing jcr:description
  const params = new URLSearchParams({
    path: config.sitePath,
    type: "cq:Page",
    "property": "jcr:content/jcr:description",
    "property.operation": "not",
    "p.limit": "100",
    "p.hits": "selective",
    "p.properties": "jcr:path",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (res.ok) {
      const data: QueryBuilderResult = await res.json();
      if (data.total > 0) {
        const affectedPages = data.hits
          .slice(0, 10)
          .map((h) => String(h["jcr:path"] ?? h.path ?? ""));
        issues.push({
          id: `AEM-SEO-001`,
          title: `Missing meta descriptions on ${data.total} pages`,
          description: `${data.total} pages are missing jcr:description in their page properties. These pages will show auto-generated snippets in search results.`,
          category: "seo",
          severity: data.total > 50 ? "high" : "medium",
          status: "open",
          affectedPages:
            affectedPages.length < data.total
              ? [...affectedPages, `+${data.total - affectedPages.length} more`]
              : affectedPages,
          detectedAt: new Date().toISOString(),
          metric: `${data.total} pages`,
        });
      }
    }
  } catch (err) {
    console.warn("[AEM] fetchPagesWithMissingMeta error:", err);
  }

  return issues;
}

// ── Fetch images missing alt text ────────────────────────────────────

async function fetchImagesWithoutAlt(
  config: AEMConfig
): Promise<SiteIssue[]> {
  const issues: SiteIssue[] = [];

  const params = new URLSearchParams({
    path: getDamPath(config),
    type: "dam:Asset",
    "property": "jcr:content/metadata/dc:description",
    "property.operation": "not",
    "p.limit": "200",
    "p.hits": "selective",
    "p.properties": "jcr:path",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (res.ok) {
      const data: QueryBuilderResult = await res.json();
      if (data.total > 0) {
        issues.push({
          id: `AEM-A11Y-001`,
          title: `${data.total} DAM assets missing alt text / description`,
          description: `Accessibility scan found ${data.total} assets in the DAM without dc:description metadata. Images referenced on pages without alt text fail WCAG 2.1 Level A.`,
          category: "accessibility",
          severity: data.total > 100 ? "high" : "medium",
          status: "open",
          affectedPages: [],
          detectedAt: new Date().toISOString(),
          metric: `${data.total} assets`,
        });
      }
    }
  } catch (err) {
    console.warn("[AEM] fetchImagesWithoutAlt error:", err);
  }

  return issues;
}

// ── Fetch broken references ──────────────────────────────────────────

async function fetchBrokenReferences(
  config: AEMConfig
): Promise<SiteIssue[]> {
  const issues: SiteIssue[] = [];

  // Look for deactivated pages that may be linked to
  const params = new URLSearchParams({
    path: config.sitePath,
    type: "cq:Page",
    "property": "jcr:content/cq:lastReplicationAction",
    "property.value": "Deactivate",
    "p.limit": "50",
    "p.hits": "selective",
    "p.properties": "jcr:path",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (res.ok) {
      const data: QueryBuilderResult = await res.json();
      if (data.total > 0) {
        const paths = data.hits
          .slice(0, 5)
          .map((h) => String(h["jcr:path"] ?? h.path ?? ""));
        issues.push({
          id: `AEM-CQ-001`,
          title: `${data.total} deactivated pages may have stale references`,
          description: `Found ${data.total} deactivated pages. Any internal links pointing to these will result in 404s on publish.`,
          category: "content_quality",
          severity: data.total > 20 ? "high" : "medium",
          status: "open",
          affectedPages: paths,
          detectedAt: new Date().toISOString(),
          metric: `${data.total} pages`,
        });
      }
    }
  } catch (err) {
    console.warn("[AEM] fetchBrokenReferences error:", err);
  }

  return issues;
}

// ── Fetch large unoptimized DAM assets ───────────────────────────────

async function fetchLargeAssets(
  config: AEMConfig
): Promise<SiteIssue[]> {
  const issues: SiteIssue[] = [];

  // Assets over 5MB
  const params = new URLSearchParams({
    path: getDamPath(config),
    type: "dam:Asset",
    "property": "jcr:content/metadata/dam:size",
    "property.operation": "greaterThan",
    "property.value": "5242880",
    "p.limit": "100",
    "p.hits": "selective",
    "p.properties": "jcr:path",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (res.ok) {
      const data: QueryBuilderResult = await res.json();
      if (data.total > 0) {
        issues.push({
          id: `AEM-PERF-001`,
          title: `${data.total} DAM assets over 5MB`,
          description: `Found ${data.total} original DAM assets exceeding 5MB. These may cause slow page loads if served without optimized renditions.`,
          category: "performance",
          severity: data.total > 50 ? "high" : "medium",
          status: "open",
          affectedPages: [],
          detectedAt: new Date().toISOString(),
          metric: `${data.total} assets`,
        });
      }
    }
  } catch (err) {
    console.warn("[AEM] fetchLargeAssets error:", err);
  }

  return issues;
}

// ── Fetch replication queue status ───────────────────────────────────

async function fetchReplicationStatus(
  config: AEMConfig
): Promise<SiteIssue[]> {
  const issues: SiteIssue[] = [];

  try {
    const res = await aemFetch(
      config,
      "/etc/replication/agents.author.json"
    );
    if (res.ok) {
      const data = await res.json();
      // Check for agents with non-empty queues
      for (const [key, agent] of Object.entries(data)) {
        const agentData = agent as Record<string, unknown>;
        const queue = agentData.queue as Record<string, unknown> | undefined;
        if (queue && typeof queue.length === "number" && queue.length > 10) {
          issues.push({
            id: `AEM-INFRA-REPL-${key}`,
            title: `Replication queue backlog on agent "${key}"`,
            description: `Agent "${key}" has ${queue.length} pending items. This may cause content publishing delays.`,
            category: "infrastructure",
            severity: (queue.length as number) > 100 ? "critical" : "high",
            status: "open",
            affectedPages: [],
            detectedAt: new Date().toISOString(),
            metric: `${queue.length} pending`,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[AEM] fetchReplicationStatus error:", err);
  }

  return issues;
}

// ── Fetch health checks ─────────────────────────────────────────────

async function fetchHealthChecks(
  config: AEMConfig
): Promise<SiteIssue[]> {
  const issues: SiteIssue[] = [];

  try {
    const res = await aemFetch(
      config,
      "/system/health?tags=*&combineTagsOr=true"
    );
    if (res.ok) {
      const data: HealthCheckResult = await res.json();
      for (const check of data.results ?? []) {
        if (check.status !== "OK") {
          const severity: Severity =
            check.status === "CRITICAL"
              ? "critical"
              : check.status === "WARN"
                ? "high"
                : "medium";
          issues.push({
            id: `AEM-HC-${check.name.replace(/\s+/g, "-").toUpperCase()}`,
            title: `Health check failed: ${check.name}`,
            description:
              check.messages?.join(". ") ??
              `AEM health check "${check.name}" returned status: ${check.status}`,
            category: "infrastructure",
            severity,
            status: "open",
            affectedPages: [],
            detectedAt: new Date().toISOString(),
            metric: check.status,
          });
        }
      }
    }
  } catch (err) {
    console.warn("[AEM] fetchHealthChecks error:", err);
  }

  return issues;
}

// ── Fetch total page count ───────────────────────────────────────────

async function fetchTotalPages(config: AEMConfig): Promise<number> {
  // Use p.limit=-1 so QueryBuilder traverses all matches and returns
  // the real total. With low p.limit values many AEM SDK versions set
  // "total" equal to the returned hit count, which is wrong for counting.
  // p.hits=selective with a single lightweight property keeps the payload small.
  const params = new URLSearchParams({
    path: config.sitePath,
    type: "cq:Page",
    "p.limit": "-1",
    "p.hits": "selective",
    "p.properties": "jcr:path",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (!res.ok) {
      console.warn(`[AEM] fetchTotalPages failed: HTTP ${res.status}`);
      return 0;
    }
    const data: QueryBuilderResult = await res.json();
    // With p.limit=-1, total and results should match the true count.
    // Prefer total, fall back to results, then hits.length.
    if (data.total > 0) return data.total;
    if (data.results > 0) return data.results;
    if (Array.isArray(data.hits)) return data.hits.length;
    return 0;
  } catch (err) {
    console.warn("[AEM] fetchTotalPages error:", err);
  }
  return 0;
}

// ── Fetch pages with component/template info ─────────────────────────

async function fetchPageDetails(
  config: AEMConfig
): Promise<PagePerformance[]> {
  const params = new URLSearchParams({
    path: config.sitePath,
    type: "cq:Page",
    "p.limit": "200",
    "p.hits": "selective",
    "p.properties":
      "jcr:path jcr:content/cq:template jcr:content/jcr:title",
    orderby: "jcr:content/cq:lastModified",
    "orderby.sort": "desc",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (res.ok) {
      const data: QueryBuilderResult = await res.json();
      return data.hits.map((hit) => {
        const path = String(hit["jcr:path"] ?? hit.path ?? "");
        const template = String(
          hit["jcr:content/cq:template"] ?? "unknown"
        ).split("/").pop() ?? "unknown";
        return {
          path,
          template,
          // Real vitals would come from CrUX API or Lighthouse — placeholders for now
          lcp: 0,
          cls: 0,
          inp: 0,
          seoScore: 0,
          issues: 0,
        };
      });
    }
  } catch (err) {
    console.warn("[AEM] fetchPageDetails error:", err);
  }
  return [];
}

// ── Fetch page properties with configurable columns ──────────────────

export async function fetchPageProperties(
  config: AEMConfig,
  columns: PropertyColumn[]
): Promise<PagePropertiesRow[]> {
  if (columns.length === 0) return [];

  const params = new URLSearchParams({
    path: config.sitePath,
    type: "cq:Page",
    "p.limit": "500",
    "p.hits": "full",
    "p.nodedepth": "1",
    orderby: "jcr:content/cq:lastModified",
    "orderby.sort": "desc",
  });

  try {
    const res = await aemFetch(
      config,
      `/bin/querybuilder.json?${params.toString()}`
    );
    if (res.ok) {
      const data: QueryBuilderResult = await res.json();
      return data.hits.map((hit) => {
        const path = String(hit["jcr:path"] ?? hit.path ?? "");
        const jcrContent =
          (hit["jcr:content"] as Record<string, unknown> | undefined) ?? {};
        const properties: Record<string, string> = {};
        for (const col of columns) {
          // Support nested paths like "myApp/customField" by walking the object
          const segments = col.jcrProperty.split("/");
          let current: unknown = jcrContent;
          for (const seg of segments) {
            if (current && typeof current === "object" && !Array.isArray(current)) {
              current = (current as Record<string, unknown>)[seg];
            } else {
              current = undefined;
              break;
            }
          }
          if (Array.isArray(current)) {
            properties[col.id] = current.join(", ");
          } else if (current !== undefined && current !== null) {
            properties[col.id] = String(current);
          } else {
            properties[col.id] = "";
          }
        }
        return { path, properties };
      });
    }
  } catch (err) {
    console.warn("[AEM] fetchPageProperties error:", err);
  }
  return [];
}

// ── Main: Fetch all dashboard data from AEM ──────────────────────────

export async function fetchAEMDashboardData(config: AEMConfig): Promise<{
  summary: DashboardSummary;
  issues: SiteIssue[];
  categories: CategoryBreakdown[];
  pages: PagePerformance[];
  trend: PerformanceDataPoint[];
  warnings: string[];
}> {
  const warnings: string[] = [];
  // Run all queries in parallel
  const [
    seoIssues,
    altIssues,
    brokenRefIssues,
    largeAssetIssues,
    replicationIssues,
    healthIssues,
    totalPages,
    pageDetails,
  ] = await Promise.all([
    fetchPagesWithMissingMeta(config),
    fetchImagesWithoutAlt(config),
    fetchBrokenReferences(config),
    fetchLargeAssets(config),
    fetchReplicationStatus(config),
    fetchHealthChecks(config),
    fetchTotalPages(config),
    fetchPageDetails(config),
  ]);

  const allIssues = [
    ...seoIssues,
    ...altIssues,
    ...brokenRefIssues,
    ...largeAssetIssues,
    ...replicationIssues,
    ...healthIssues,
  ];

  // Build category breakdown
  const catCounts: Record<IssueCategory, number> = {
    performance: 0,
    seo: 0,
    accessibility: 0,
    content_quality: 0,
    infrastructure: 0,
    security: 0,
  };
  for (const issue of allIssues) {
    catCounts[issue.category]++;
  }
  const categories: CategoryBreakdown[] = [
    { category: "performance", count: catCounts.performance, label: "Performance" },
    { category: "seo", count: catCounts.seo, label: "SEO" },
    { category: "accessibility", count: catCounts.accessibility, label: "Accessibility" },
    { category: "content_quality", count: catCounts.content_quality, label: "Content Quality" },
    { category: "infrastructure", count: catCounts.infrastructure, label: "Infrastructure" },
    { category: "security", count: catCounts.security, label: "Security" },
  ];

  const criticalCount = allIssues.filter((i) => i.severity === "critical").length;

  // Health score: start at 100, deduct by severity
  let healthScore = 100;
  for (const issue of allIssues) {
    if (issue.severity === "critical") healthScore -= 10;
    else if (issue.severity === "high") healthScore -= 5;
    else if (issue.severity === "medium") healthScore -= 2;
    else healthScore -= 1;
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  const summary: DashboardSummary = {
    totalPages,
    healthScore,
    criticalIssues: criticalCount,
    openIssues: allIssues.length,
    resolvedThisWeek: 0,
    avgLcp: 0, // would come from CrUX/Lighthouse
    avgCls: 0,
    avgInp: 0,
    cacheHitRate: 0,
  };

  // Trend data is not available from AEM alone — empty for now
  const trend: PerformanceDataPoint[] = [];

  if (totalPages === 0) {
    warnings.push("Could not retrieve page count from AEM. Check that QueryBuilder is accessible at /bin/querybuilder.json and that /content has cq:Page nodes.");
  }
  if (allIssues.length === 0 && totalPages === 0) {
    warnings.push("No data returned from AEM. Verify your instance URL, credentials, and that the AEM instance is running.");
  }

  return { summary, issues: allIssues, categories, pages: pageDetails, trend, warnings };
}

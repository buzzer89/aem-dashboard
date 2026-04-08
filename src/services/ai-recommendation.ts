import type { SiteIssue, AIRecommendation } from "@/types/dashboard";

/**
 * Builds a prompt for Claude to analyze an AEM site issue and return a fix.
 */
function buildPrompt(issue: SiteIssue): string {
  return `You are an Adobe Experience Manager (AEM) performance expert.

Analyze the following site issue and provide a concrete, actionable recommendation.

## Issue
- **Title**: ${issue.title}
- **Category**: ${issue.category}
- **Severity**: ${issue.severity}
- **Description**: ${issue.description}
- **Metric**: ${issue.metric ?? "N/A"}
- **Affected pages**: ${issue.affectedPages.join(", ") || "N/A"}

## Response format (JSON)
Respond ONLY with valid JSON matching this structure:
{
  "summary": "One paragraph explaining the root cause and recommended fix",
  "steps": ["Step 1...", "Step 2...", "Step 3..."],
  "estimatedImpact": "Expected improvement (e.g. 'LCP reduction from 4.2s to ~2.0s')",
  "effort": "low" | "medium" | "high",
  "codeSnippet": "Optional code or config snippet that implements the fix",
  "references": ["Optional links to AEM docs or best practices"]
}`;
}

/**
 * Calls the Claude API to generate a recommendation for an issue.
 * Requires ANTHROPIC_API_KEY env variable.
 */
export async function getAIRecommendation(
  issue: SiteIssue
): Promise<AIRecommendation> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return getFallbackRecommendation(issue);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: buildPrompt(issue) }],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.status);
      return getFallbackRecommendation(issue);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    // Extract JSON from response (handles markdown code fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getFallbackRecommendation(issue);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      issueId: issue.id,
      summary: parsed.summary,
      steps: parsed.steps,
      estimatedImpact: parsed.estimatedImpact,
      effort: parsed.effort,
      codeSnippet: parsed.codeSnippet,
      references: parsed.references,
    };
  } catch (error) {
    console.error("AI recommendation error:", error);
    return getFallbackRecommendation(issue);
  }
}

/**
 * Returns a pre-built recommendation when Claude API is unavailable.
 * Maps known issue patterns to expert-level AEM fixes.
 */
function getFallbackRecommendation(issue: SiteIssue): AIRecommendation {
  const fallbacks: Record<string, Omit<AIRecommendation, "issueId">> = {
    "ISS-001": {
      summary:
        "The high LCP is caused by unoptimized hero images served as full-resolution PNGs. AEM's Dynamic Media or Asset Compute can generate optimized WebP renditions automatically. Combined with lazy-loading below-fold images and preloading the hero, this should bring LCP under 2.5s.",
      steps: [
        "Enable WebP rendition generation in DAM Processing Profiles for the /products asset folder",
        "Update the hero-image component HTL to use <picture> with WebP srcset and PNG fallback",
        "Add width/height attributes to prevent layout shift during load",
        "Add rel='preload' for the hero image in the page head component",
        "Configure dispatcher to cache WebP variants with Vary: Accept header",
      ],
      estimatedImpact: "LCP reduction from 4.2s to ~1.8–2.2s",
      effort: "medium",
      codeSnippet: `<!-- hero-image.html (HTL) -->
<picture>
  <source srcset="\${hero.webpRendition}" type="image/webp">
  <img src="\${hero.fallbackRendition}"
       alt="\${hero.altText}"
       width="1200" height="600"
       loading="eager"
       fetchpriority="high">
</picture>`,
      references: [
        "https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/assets/dynamicmedia/image-profiles.html",
      ],
    },
    "ISS-002": {
      summary:
        "The dispatcher is configured to exclude /content/api/* from caching. Since product data changes infrequently (daily catalog updates), adding a TTL-based cache rule with Stale-While-Revalidate will dramatically reduce origin load while keeping content fresh.",
      steps: [
        "Add a /cache rule in dispatcher.any for /content/api/* with a 300s TTL",
        "Set Cache-Control headers from AEM: 'public, max-age=300, stale-while-revalidate=60'",
        "Configure dispatcher flush agent to invalidate /content/api/* on catalog publish events",
        "Monitor cache hit rate via dispatcher access logs after deployment",
      ],
      estimatedImpact: "Cache hit rate improvement from 42% to ~85–90%",
      effort: "low",
      codeSnippet: `# dispatcher.any - /cache /rules section
/0100 {
  /glob "/content/api/*"
  /type "allow"
}

# In AEM, set headers via Sling Rewriter or custom filter:
Cache-Control: public, max-age=300, stale-while-revalidate=60`,
      references: [
        "https://experienceleague.adobe.com/docs/experience-manager-dispatcher/using/configuring/dispatcher-configuration.html",
      ],
    },
    "ISS-003": {
      summary:
        "143 images missing alt text violates WCAG 2.1 Level A. Use AEM's bulk metadata editor to add alt text to DAM assets, then ensure components pull alt text from the DAM metadata. For images without meaningful content, mark them as decorative with alt=''.",
      steps: [
        "Export affected asset list using AEM QueryBuilder: path=/content/dam&property=jcr:content/metadata/dc:description&property.operation=not",
        "Use AEM's bulk metadata editor or a CSV import to add alt text to assets in DAM",
        "Update image components to read alt from asset metadata (dam:scene7altText or dc:description)",
        "For decorative images, set role='presentation' and alt='' in the component HTL",
        "Add a content policy validation rule to prevent publishing images without alt text",
      ],
      estimatedImpact: "WCAG 2.1 Level A compliance for criterion 1.1.1",
      effort: "medium",
      references: [
        "https://experienceleague.adobe.com/docs/experience-manager-65/content/assets/managing/metadata-profiles.html",
      ],
    },
    "ISS-004": {
      summary:
        "The CLS spike on mobile is caused by the hero-banner component not reserving space for images before they load. Adding explicit aspect-ratio CSS and width/height attributes will eliminate the layout shift.",
      steps: [
        "Add width and height attributes to the hero-banner img element in the HTL template",
        "Add CSS: .hero-banner img { aspect-ratio: 16/9; width: 100%; height: auto; }",
        "Test on mobile viewports (375px, 414px, 768px) using Chrome DevTools",
        "Verify CLS drops below 0.1 using Lighthouse mobile audit",
      ],
      estimatedImpact: "CLS reduction from 0.32 to < 0.05 on mobile",
      effort: "low",
      codeSnippet: `/* clientlib-site/css/hero-banner.css */
.hero-banner img {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
  object-fit: cover;
}`,
      references: [
        "https://web.dev/articles/cls",
      ],
    },
  };

  const fallback = fallbacks[issue.id];

  if (fallback) {
    return { issueId: issue.id, ...fallback };
  }

  // Generic fallback for unknown issues
  return {
    issueId: issue.id,
    summary: `This ${issue.severity} ${issue.category} issue requires investigation. Review the affected pages and AEM logs to identify the root cause. Consider engaging the AEM platform team for ${issue.category}-specific expertise.`,
    steps: [
      `Review AEM error.log and request.log for entries related to the affected pages`,
      `Reproduce the issue in a lower environment (stage/dev)`,
      `Identify the root cause using browser DevTools and AEM debugging tools`,
      `Implement a targeted fix and validate in the lower environment`,
      `Deploy to production and monitor for improvement`,
    ],
    estimatedImpact: "Varies based on root cause analysis",
    effort: "medium",
  };
}

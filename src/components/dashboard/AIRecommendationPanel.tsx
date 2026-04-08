"use client";

import { useState } from "react";
import {
  Bot,
  X,
  Loader2,
  Zap,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  Wrench,
  Gauge,
  BookOpen,
} from "lucide-react";
import type { SiteIssue, AIRecommendation } from "@/types/dashboard";

interface AIRecommendationPanelProps {
  issue: SiteIssue | null;
  onClose: () => void;
}

export default function AIRecommendationPanel({
  issue,
  onClose,
}: AIRecommendationPanelProps) {
  const [recommendation, setRecommendation] =
    useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchRecommendation = async () => {
    if (!issue) return;
    setLoading(true);
    setRecommendation(null);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId: issue.id }),
      });
      const data = await res.json();
      setRecommendation(data);
    } catch {
      console.error("Failed to fetch recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!issue) return null;

  const effortColor = {
    low: "text-green-400 bg-green-500/10",
    medium: "text-yellow-400 bg-yellow-500/10",
    high: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-gray-900 border-l border-gray-800 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Bot className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-200">
                  AI Recommendation
                </h2>
                <p className="text-xs text-gray-500">Powered by Claude</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Issue summary */}
          <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-4">
            <p className="text-xs text-gray-500 font-mono mb-1">{issue.id}</p>
            <h3 className="text-sm font-semibold text-gray-200">
              {issue.title}
            </h3>
            <p className="text-xs text-gray-400 mt-2">{issue.description}</p>
            {issue.metric && (
              <span className="inline-block text-xs text-gray-400 font-mono bg-gray-700/50 px-2 py-0.5 rounded mt-2">
                {issue.metric}
              </span>
            )}
          </div>

          {/* Get recommendation button */}
          {!recommendation && !loading && (
            <button
              onClick={fetchRecommendation}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-sm font-semibold transition-all flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Get AI Fix Recommendation
            </button>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <p className="text-sm text-gray-400">
                Analyzing issue and generating fix...
              </p>
              <p className="text-xs text-gray-600">
                Claude is reviewing AEM best practices
              </p>
            </div>
          )}

          {/* Recommendation content */}
          {recommendation && (
            <div className="space-y-4 animate-in fade-in duration-500">
              {/* Summary */}
              <div className="rounded-lg border border-blue-700/30 bg-blue-600/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-semibold text-blue-300 uppercase tracking-wide">
                    Analysis
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {recommendation.summary}
                </p>
              </div>

              {/* Effort & Impact */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Effort</span>
                  </div>
                  <span
                    className={`text-sm font-semibold px-2 py-0.5 rounded ${effortColor[recommendation.effort]}`}
                  >
                    {recommendation.effort.charAt(0).toUpperCase() +
                      recommendation.effort.slice(1)}
                  </span>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-800/30 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      Expected Impact
                    </span>
                  </div>
                  <p className="text-sm text-green-400 font-medium">
                    {recommendation.estimatedImpact}
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Fix Steps
                </h4>
                <div className="space-y-2">
                  {recommendation.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code snippet */}
              {recommendation.codeSnippet && (
                <div>
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 hover:text-gray-300"
                  >
                    Code Snippet
                    {showCode ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>

                  {showCode && (
                    <div className="relative rounded-lg border border-gray-700 bg-gray-950 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                        <span className="text-xs text-gray-500">
                          Suggested Fix
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(recommendation.codeSnippet ?? "")
                          }
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300"
                        >
                          {copied ? (
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <pre className="p-3 text-xs text-gray-300 overflow-x-auto">
                        <code>{recommendation.codeSnippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* References */}
              {recommendation.references &&
                recommendation.references.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      References
                    </h4>
                    <ul className="space-y-1">
                      {recommendation.references.map((ref, i) => (
                        <li key={i}>
                          <a
                            href={ref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
                          >
                            {ref}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as In Progress
                </button>
                <button
                  onClick={fetchRecommendation}
                  className="px-4 py-2.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-sm font-medium transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

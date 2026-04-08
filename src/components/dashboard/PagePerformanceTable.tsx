"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PagePerformance } from "@/types/dashboard";

interface PagePerformanceTableProps {
  data: PagePerformance[];
  pageSize?: number;
}

function vitalsColor(value: number, thresholds: [number, number]): string {
  if (value <= thresholds[0]) return "text-green-400";
  if (value <= thresholds[1]) return "text-yellow-400";
  return "text-red-400";
}

export default function PagePerformanceTable({
  data,
  pageSize = 10,
}: PagePerformanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(start, start + pageSize);
  const showPagination = data.length > pageSize;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Page Performance Overview
        </h3>
        <span className="text-xs text-gray-500">
          {data.length} {data.length === 1 ? "page" : "pages"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Page
              </th>
              <th className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Template
              </th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                LCP
              </th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                CLS
              </th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                INP
              </th>
              <th className="text-right px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                SEO
              </th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Issues
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {paginatedData.map((page) => (
              <tr
                key={page.path}
                className="hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-5 py-3 font-mono text-xs text-gray-300">
                  {page.path}
                </td>
                <td className="px-3 py-3 text-xs text-gray-500">
                  {page.template}
                </td>
                <td
                  className={`px-3 py-3 text-xs text-right font-mono ${vitalsColor(page.lcp, [2500, 4000])}`}
                >
                  {(page.lcp / 1000).toFixed(1)}s
                </td>
                <td
                  className={`px-3 py-3 text-xs text-right font-mono ${vitalsColor(page.cls, [0.1, 0.25])}`}
                >
                  {page.cls.toFixed(2)}
                </td>
                <td
                  className={`px-3 py-3 text-xs text-right font-mono ${vitalsColor(page.inp, [200, 500])}`}
                >
                  {page.inp}ms
                </td>
                <td className="px-3 py-3 text-xs text-right">
                  <span
                    className={`font-mono ${page.seoScore >= 80 ? "text-green-400" : page.seoScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
                  >
                    {page.seoScore}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-right">
                  {page.issues > 0 && (
                    <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full text-xs font-medium">
                      {page.issues}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-8 text-center text-sm text-gray-500"
                >
                  No page data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
          <p className="text-xs text-gray-500">
            Showing {start + 1}–{Math.min(start + pageSize, data.length)} of{" "}
            {data.length}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[28px] h-7 rounded-md text-xs font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
  );
}

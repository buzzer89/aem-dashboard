"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { PerformanceDataPoint } from "@/types/dashboard";

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">
        Performance Trend (14 days)
      </h3>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7280" }}
            tickLine={false}
            axisLine={{ stroke: "#374151" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
          />
          <Line
            type="monotone"
            dataKey="lcp"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            name="LCP (ms)"
          />
          <Line
            type="monotone"
            dataKey="ttfb"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
            name="TTFB (ms)"
          />
          <Line
            type="monotone"
            dataKey="inp"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            name="INP (ms)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

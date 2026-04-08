import { NextResponse } from "next/server";
import {
  dashboardSummary,
  performanceTrend,
  categoryBreakdown,
  pagePerformanceData,
} from "@/data/mock-data";

export async function GET() {
  return NextResponse.json({
    summary: dashboardSummary,
    trend: performanceTrend,
    categories: categoryBreakdown,
    pages: pagePerformanceData,
  });
}

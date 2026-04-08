import { NextResponse } from "next/server";
import { siteIssues } from "@/data/mock-data";

export async function GET() {
  return NextResponse.json({ issues: siteIssues });
}

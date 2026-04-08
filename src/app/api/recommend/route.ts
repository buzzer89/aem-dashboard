import { NextResponse } from "next/server";
import { siteIssues } from "@/data/mock-data";
import { getAIRecommendation } from "@/services/ai-recommendation";

export async function POST(request: Request) {
  const body = await request.json();
  const { issueId } = body;

  if (!issueId) {
    return NextResponse.json({ error: "issueId is required" }, { status: 400 });
  }

  const issue = siteIssues.find((i) => i.id === issueId);

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  const recommendation = await getAIRecommendation(issue);
  return NextResponse.json(recommendation);
}

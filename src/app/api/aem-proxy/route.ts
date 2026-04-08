import { NextRequest, NextResponse } from "next/server";

interface ProxyRequestBody {
  instanceUrl: string;
  path: string;
  headers: Record<string, string>;
}

export async function POST(request: NextRequest) {
  let body: ProxyRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { instanceUrl, path, headers } = body;

  if (!instanceUrl || !path) {
    return NextResponse.json(
      { error: "instanceUrl and path are required" },
      { status: 400 }
    );
  }

  // Validate URL to prevent SSRF
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(path, instanceUrl);
  } catch {
    return NextResponse.json(
      { error: "Invalid URL" },
      { status: 400 }
    );
  }

  // Block non-http(s) schemes
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { error: "Only HTTP(S) URLs are allowed" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      headers: headers ?? {},
    });

    const contentType = response.headers.get("content-type") ?? "";
    let responseBody: string | object;

    if (contentType.includes("application/json")) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    return NextResponse.json(
      typeof responseBody === "string" ? { body: responseBody } : responseBody,
      { status: response.status }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Proxy request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 502 }
    );
  }
}

import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set(["camal-riobamba.b-cdn.net"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ message: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return NextResponse.json({ message: "Host not allowed" }, { status: 403 });
  }

  const upstream = await fetch(parsed.toString(), {
    // Avoid caching issues while debugging; can be changed to force-cache later.
    cache: "no-store",
    headers: {
      // Some CDNs behave differently based on UA/accept.
      Accept: "image/svg+xml,image/*;q=0.9,*/*;q=0.8",
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { message: "Upstream fetch failed", status: upstream.status },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const bytes = await upstream.arrayBuffer();

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // Cache a bit on the edge; adjust as needed.
      "Cache-Control": "public, max-age=300",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// In-memory store for demo purposes
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const analyticsStore: any[] = [];

// ---------------------------------------------------------------------------
// POST — receive analytics events
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    analyticsStore.push(...events);

    // Cap in-memory store at 10 000 events
    if (analyticsStore.length > 10_000) {
      analyticsStore.splice(0, analyticsStore.length - 10_000);
    }

    console.log(
      "[Analytics API] Received",
      events.length,
      "events. Total stored:",
      analyticsStore.length
    );

    return NextResponse.json({ ok: true, stored: analyticsStore.length });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

// ---------------------------------------------------------------------------
// GET — return all stored analytics data
// ---------------------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    events: analyticsStore,
    count: analyticsStore.length,
  });
}

import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/racing-desk/platform";
import { collectBetfairMarketSnapshots } from "@/lib/racing-desk/collectors/betfair";

export async function GET(request: Request) {
  try {
    assertCronAuthorized(request);
    const { searchParams } = new URL(request.url);
    const windowHours = Number(searchParams.get("windowHours") ?? "18") || 18;
    const result = await collectBetfairMarketSnapshots({ windowHours });

    return NextResponse.json({
      ok: true,
      collector: "market-snapshots",
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

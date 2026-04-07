import { NextRequest, NextResponse } from "next/server";
import { buildRacingDeskSnapshot } from "@/lib/racing-desk/service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bankroll = Number(searchParams.get("bankroll") ?? "5000");
  const modeParam = searchParams.get("mode");
  const mode =
    modeParam === "live" || modeParam === "demo" ? modeParam : "demo";

  try {
    const snapshot = await buildRacingDeskSnapshot({
      bankroll: Number.isFinite(bankroll) ? bankroll : 5000,
      mode,
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to build racing desk snapshot.",
      },
      { status: 500 }
    );
  }
}

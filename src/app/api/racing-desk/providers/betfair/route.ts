import { NextResponse } from "next/server";
import { BetfairClient } from "@/lib/racing-desk/providers/betfair";

export async function GET() {
  const client = new BetfairClient();
  const config = client.getConfigurationStatus();

  try {
    if (!client.isConfigured()) {
      return NextResponse.json({
        ok: false,
        provider: "betfair",
        configured: false,
        ...config,
      });
    }

    const markets = await client.listMarketCatalogue({
      filter: {
        eventTypeIds: ["7"],
        marketCountries: ["AU"],
        marketTypeCodes: ["WIN"],
        marketStartTime: {
          from: new Date().toISOString(),
          to: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        },
      },
      maxResults: 3,
      marketProjection: ["EVENT", "RUNNER_DESCRIPTION", "MARKET_START_TIME"],
      sort: "FIRST_TO_START",
    });

    return NextResponse.json({
      ok: true,
      provider: "betfair",
      configured: true,
      ...config,
      markets: markets.map((market) => ({
        marketId: market.marketId,
        marketName: market.marketName,
        venue: market.event?.venue ?? market.event?.name ?? null,
        startTime: market.description?.marketTime ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        provider: "betfair",
        configured: true,
        ...config,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

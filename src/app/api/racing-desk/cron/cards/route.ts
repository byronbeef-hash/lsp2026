import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/racing-desk/platform";
import {
  collectPuntingFormCards,
  getCardsDateFromSearchParams,
} from "@/lib/racing-desk/collectors/punting-form";

export async function GET(request: Request) {
  try {
    assertCronAuthorized(request);
    const { searchParams } = new URL(request.url);
    const date = getCardsDateFromSearchParams(searchParams);
    const maxMeetings = Number(searchParams.get("maxMeetings") ?? "0") || undefined;
    const result = await collectPuntingFormCards({ date, maxMeetings });

    return NextResponse.json({
      ok: true,
      collector: "race-cards",
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

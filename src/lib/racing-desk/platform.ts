export function getRacingDefaults() {
  return {
    bankroll: Number(process.env.RACING_BANKROLL_DEFAULT ?? "5000"),
    mode: process.env.RACING_MODE_DEFAULT === "live" ? "live" : "demo",
    maxDailyTurnover: Number(process.env.RACING_MAX_DAILY_TURNOVER ?? "500"),
    maxDailyLoss: Number(process.env.RACING_MAX_DAILY_LOSS ?? "150"),
  } as const;
}

export function assertCronAuthorized(request: Request) {
  const expected = process.env.CRON_SECRET;

  if (!expected) {
    throw new Error("CRON_SECRET is not configured.");
  }

  const bearer = request.headers.get("authorization");
  const headerValue = bearer?.replace(/^Bearer\s+/i, "").trim();

  if (headerValue !== expected) {
    throw new Error("Unauthorized cron request.");
  }
}

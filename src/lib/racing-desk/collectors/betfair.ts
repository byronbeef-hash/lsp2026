import { BetfairClient, type BetfairMarketCatalogue } from "../providers/betfair";
import { RacingSupabaseRepository, type RaceLookup, type RunnerLookup } from "../repository";
import { normalizeName, parseRaceNumber } from "../normalize";

const PROVIDER_CODE = "betfair";
const PROVIDER_NAME = "Betfair Exchange";

interface CollectMarketOptions {
  windowHours?: number;
}

export interface CollectMarketResult {
  provider: "betfair";
  marketCount: number;
  mappedMarkets: number;
  unmatchedMarkets: number;
  snapshotsStored: number;
  runnerSnapshotsStored: number;
  rawEventsStored: number;
  warnings: string[];
}

interface MarketMatch {
  race: RaceLookup;
  catalogue: BetfairMarketCatalogue;
}

function secondsToJump(scheduledJumpAt: string, capturedAt: string): number {
  const jumpMs = new Date(scheduledJumpAt).getTime();
  const captureMs = new Date(capturedAt).getTime();
  return Math.round((jumpMs - captureMs) / 1000);
}

function getClosestRaceMatch(
  catalogue: BetfairMarketCatalogue,
  races: RaceLookup[]
): RaceLookup | undefined {
  const marketRaceNumber = parseRaceNumber(catalogue.marketName);
  const venue = normalizeName(catalogue.event?.venue ?? catalogue.event?.name ?? "");
  const marketStartMs = catalogue.description?.marketTime
    ? new Date(catalogue.description.marketTime).getTime()
    : Number.NaN;

  const candidates = races.filter((race) => {
    const sameVenue = normalizeName(race.venueName) === venue;
    const sameRace = marketRaceNumber ? race.raceNumber === marketRaceNumber : true;
    return sameVenue && sameRace;
  });

  if (candidates.length === 0) return undefined;
  if (Number.isNaN(marketStartMs)) return candidates[0];

  return [...candidates].sort((left, right) => {
    const leftDiff = Math.abs(new Date(left.scheduledJumpAt).getTime() - marketStartMs);
    const rightDiff = Math.abs(new Date(right.scheduledJumpAt).getTime() - marketStartMs);
    return leftDiff - rightDiff;
  })[0];
}

function matchRunnerId(
  raceId: number,
  runnerName: string,
  runners: RunnerLookup[]
): number | undefined {
  const normalizedName = normalizeName(runnerName);
  return runners.find(
    (runner) =>
      runner.raceId === raceId && normalizeName(runner.horseName) === normalizedName
  )?.id;
}

export async function collectBetfairMarketSnapshots(
  options: CollectMarketOptions = {}
): Promise<CollectMarketResult> {
  const client = new BetfairClient();
  if (!client.isConfigured()) {
    throw new Error("Betfair credentials are not configured.");
  }

  const repository = new RacingSupabaseRepository();
  const warnings: string[] = [];
  const now = new Date();
  const until = new Date(now.getTime() + (options.windowHours ?? 18) * 60 * 60 * 1000);
  const fromIso = now.toISOString();
  const toIso = until.toISOString();

  const catalogues = await client.listMarketCatalogue({
    filter: {
      eventTypeIds: ["7"],
      marketCountries: ["AU"],
      marketTypeCodes: ["WIN"],
      marketStartTime: {
        from: fromIso,
        to: toIso,
      },
    },
    maxResults: 200,
    marketProjection: ["EVENT", "RUNNER_DESCRIPTION", "MARKET_START_TIME"],
    sort: "FIRST_TO_START",
  });

  await repository.appendRawProviderEvent({
    providerCode: PROVIDER_CODE,
    providerName: PROVIDER_NAME,
    endpointName: "listMarketCatalogue",
    requestKey: `${fromIso}:${toIso}`,
    responseStatus: 200,
    payloadJson: catalogues,
  });

  const races = await repository.listRaceLookups(fromIso, toIso);
  const matches: MarketMatch[] = [];

  for (const catalogue of catalogues) {
    const race = getClosestRaceMatch(catalogue, races);
    if (!race) {
      warnings.push(`No canonical race match for Betfair market ${catalogue.marketId}.`);
      continue;
    }

    await repository.upsertProviderMarket({
      providerCode: PROVIDER_CODE,
      raceId: race.id,
      marketType: "WIN",
      providerMarketId: catalogue.marketId,
      marketStatus: "OPEN",
      marketStartAt: catalogue.description?.marketTime,
    });

    matches.push({ race, catalogue });
  }

  const marketBooks = matches.length
    ? await client.listMarketBook({
        marketIds: matches.map((match) => match.catalogue.marketId),
        priceProjection: {
          priceData: ["EX_BEST_OFFERS", "EX_TRADED"],
          virtualise: true,
        },
      })
    : [];

  await repository.appendRawProviderEvent({
    providerCode: PROVIDER_CODE,
    providerName: PROVIDER_NAME,
    endpointName: "listMarketBook",
    requestKey: `${fromIso}:${toIso}`,
    responseStatus: 200,
    payloadJson: marketBooks,
  });

  const runnerLookups = await repository.listRunnerLookups(
    matches.map((match) => match.race.id)
  );
  const matchByMarketId = new Map(matches.map((match) => [match.catalogue.marketId, match]));

  let snapshotsStored = 0;
  let runnerSnapshotsStored = 0;
  const capturedAt = new Date().toISOString();

  for (const marketBook of marketBooks) {
    const match = matchByMarketId.get(marketBook.marketId);
    if (!match) continue;

    const snapshotId = await repository.insertMarketSnapshot({
      raceId: match.race.id,
      providerCode: PROVIDER_CODE,
      marketType: "WIN",
      providerMarketId: marketBook.marketId,
      capturedAt,
      secondsToJump: secondsToJump(match.race.scheduledJumpAt, capturedAt),
      marketStatus: "OPEN",
      inPlay: false,
      totalMatchedAud: marketBook.totalMatched,
    });

    snapshotsStored += 1;

    const rows = (marketBook.runners ?? []).flatMap((runner) => {
      const catalogueRunner = match.catalogue.runners?.find(
        (item) => item.selectionId === runner.selectionId
      );
      const runnerName = catalogueRunner?.runnerName;
      if (!runnerName) return [];

      const runnerId = matchRunnerId(match.race.id, runnerName, runnerLookups);
      if (!runnerId) {
        warnings.push(
          `No canonical runner match for ${runnerName} in market ${marketBook.marketId}.`
        );
        return [];
      }

      const bestBack = runner.ex?.availableToBack?.[0];
      const bestLay = runner.ex?.availableToLay?.[0];

      return [
        {
          marketSnapshotId: snapshotId,
          runnerId,
          bestBackPrice: bestBack?.price,
          bestBackSize: bestBack?.size,
          bestLayPrice: bestLay?.price,
          bestLaySize: bestLay?.size,
          lastTradedPrice: runner.lastPriceTraded,
          tradedVolumeAud: runner.totalMatched,
          impliedProbabilityRaw: bestBack?.price ? 1 / bestBack.price : undefined,
        },
      ];
    });

    await repository.insertRunnerMarketSnapshots(rows);
    runnerSnapshotsStored += rows.length;
  }

  return {
    provider: "betfair",
    marketCount: catalogues.length,
    mappedMarkets: matches.length,
    unmatchedMarkets: catalogues.length - matches.length,
    snapshotsStored,
    runnerSnapshotsStored,
    rawEventsStored: 2,
    warnings,
  };
}

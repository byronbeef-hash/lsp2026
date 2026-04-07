import {
  extractRecordArrays,
  parseDateLike,
  pickBoolean,
  pickNumber,
  pickString,
} from "../json";
import { combineDateAndTime } from "../normalize";
import { PuntingFormClient } from "../providers/punting-form";
import { RacingSupabaseRepository } from "../repository";

const PROVIDER_CODE = "punting_form";
const PROVIDER_NAME = "Punting Form";

interface CollectCardsOptions {
  date: string;
  maxMeetings?: number;
}

export interface CollectCardsResult {
  provider: "punting_form";
  date: string;
  meetingsDiscovered: number;
  meetingsCreated: number;
  racesCreated: number;
  runnersCreated: number;
  rawEventsStored: number;
  warnings: string[];
}

function extractMeetingRecords(payload: unknown) {
  const arrays = extractRecordArrays(payload, ["meetings", "data", "items", "results"]);
  return arrays.flat().filter((record) =>
    Boolean(pickString(record, ["meetingid", "meetingId", "id", "meetingname", "meetingName"]))
  );
}

function extractRaceRecords(payload: unknown) {
  const arrays = extractRecordArrays(payload, ["races", "fields", "form", "data", "items"]);
  return arrays
    .flat()
    .filter((record) => pickNumber(record, ["raceno", "raceNo", "race_number", "number"]) !== undefined);
}

function extractRunnerRecords(payload: unknown) {
  const arrays = extractRecordArrays(payload, ["runners", "fields", "form", "data", "starters", "acceptors"]);
  return arrays
    .flat()
    .filter((record) =>
      Boolean(
        pickString(record, ["horse", "horseName", "name", "runnerName"]) ??
          pickNumber(record, ["number", "runnerNo", "runnerNumber"])
      )
    );
}

export async function collectPuntingFormCards(
  options: CollectCardsOptions
): Promise<CollectCardsResult> {
  const client = new PuntingFormClient();
  if (!client.isConfigured()) {
    throw new Error("Punting Form credentials are not configured.");
  }

  const repository = new RacingSupabaseRepository();
  const warnings: string[] = [];
  let meetingsCreated = 0;
  let racesCreated = 0;
  let runnersCreated = 0;
  let rawEventsStored = 0;

  const meetingsPayload = await client.getMeetingsList(options.date);
  await repository.appendRawProviderEvent({
    providerCode: PROVIDER_CODE,
    providerName: PROVIDER_NAME,
    endpointName: "meetingslist",
    requestKey: options.date,
    responseStatus: 200,
    payloadJson: meetingsPayload,
  });
  rawEventsStored += 1;

  const meetingRecords = extractMeetingRecords(meetingsPayload).slice(
    0,
    options.maxMeetings ?? Number.MAX_SAFE_INTEGER
  );

  for (const meetingRecord of meetingRecords) {
    const providerMeetingId =
      pickString(meetingRecord, ["meetingid", "meetingId", "id"]) ??
      pickString(meetingRecord, ["meetingname", "meetingName"]);
    const venueName =
      pickString(meetingRecord, ["meetingname", "meetingName", "track", "venue"]) ??
      "Unknown venue";

    if (!providerMeetingId) {
      warnings.push(`Skipped a meeting with no provider id for ${venueName}.`);
      continue;
    }

    const meetingUpsert = await repository.upsertMeetingFromProvider({
      providerCode: PROVIDER_CODE,
      providerName: PROVIDER_NAME,
      providerMeetingId,
      meeting: {
        meetingDate: options.date,
        jurisdiction: pickString(meetingRecord, ["state", "jurisdiction"]),
        venueCode: pickString(meetingRecord, ["trackcode", "venueCode", "code"]),
        venueName,
        surface: pickString(meetingRecord, ["surface", "trackType"]),
      },
      providerPayload: meetingRecord,
    });

    if (meetingUpsert.created) meetingsCreated += 1;

    const meetingPayload = await client.getMeeting(providerMeetingId);
    await repository.appendRawProviderEvent({
      providerCode: PROVIDER_CODE,
      providerName: PROVIDER_NAME,
      endpointName: "meeting",
      requestKey: providerMeetingId,
      responseStatus: 200,
      payloadJson: meetingPayload,
    });
    rawEventsStored += 1;

    const raceRecords = extractRaceRecords(meetingPayload);
    if (raceRecords.length === 0) {
      warnings.push(`No races extracted for meeting ${providerMeetingId}.`);
    }

    for (const [raceIndex, raceRecord] of raceRecords.entries()) {
      const raceNumber =
        pickNumber(raceRecord, ["raceno", "raceNo", "race_number", "number"]) ??
        raceIndex + 1;
      const providerRaceId =
        pickString(raceRecord, ["raceid", "raceId", "id"]) ??
        `${providerMeetingId}:R${raceNumber}`;
      const scheduledJumpAt =
        parseDateLike(raceRecord["startTime"]) ??
        parseDateLike(raceRecord["raceTime"]) ??
        parseDateLike(raceRecord["jumpTime"]) ??
        combineDateAndTime(
          options.date,
          pickString(raceRecord, ["racetime", "raceTime", "jumpTime", "starttime"]),
          raceIndex
        );

      const raceUpsert = await repository.upsertRaceFromProvider({
        providerCode: PROVIDER_CODE,
        providerName: PROVIDER_NAME,
        providerRaceId,
        race: {
          meetingId: meetingUpsert.meetingId,
          raceNumber,
          scheduledJumpAt,
          raceName: pickString(raceRecord, ["racename", "raceName", "name"]),
          className: pickString(raceRecord, ["class", "className", "grade"]),
          distanceM: pickNumber(raceRecord, ["distance", "distance_m", "distanceM"]) ?? 0,
          trackCondition: pickString(raceRecord, ["trackCondition", "going"]),
          railPosition: pickString(raceRecord, ["rail", "railPosition"]),
          status: pickString(raceRecord, ["status"]),
        },
        providerPayload: raceRecord,
      });

      if (raceUpsert.created) racesCreated += 1;

      const fieldsPayload = await client.getFields(providerMeetingId, raceNumber);
      await repository.appendRawProviderEvent({
        providerCode: PROVIDER_CODE,
        providerName: PROVIDER_NAME,
        endpointName: "fields",
        requestKey: `${providerMeetingId}:${raceNumber}`,
        responseStatus: 200,
        payloadJson: fieldsPayload,
      });
      rawEventsStored += 1;

      const runnerRecords = extractRunnerRecords(fieldsPayload);
      if (runnerRecords.length === 0) {
        warnings.push(`No runners extracted for ${providerMeetingId} race ${raceNumber}.`);
      }

      for (const [runnerIndex, runnerRecord] of runnerRecords.entries()) {
        const horseName =
          pickString(runnerRecord, ["horse", "horseName", "name", "runnerName"]) ??
          `Runner ${runnerIndex + 1}`;
        const runnerNumber =
          pickNumber(runnerRecord, ["number", "runnerNo", "runnerNumber", "saddlecloth"]) ??
          runnerIndex + 1;
        const providerRunnerId =
          pickString(runnerRecord, ["runnerid", "runnerId", "id", "selectionId"]) ??
          `${providerRaceId}:${runnerNumber}`;

        const runnerUpsert = await repository.upsertRunnerFromProvider({
          providerCode: PROVIDER_CODE,
          providerName: PROVIDER_NAME,
          providerRunnerId,
          runner: {
            raceId: raceUpsert.raceId,
            runnerNumber,
            horseName,
            barrier: pickNumber(runnerRecord, ["barrier", "gate", "draw"]),
            allocatedWeightKg: pickNumber(runnerRecord, ["weight", "allocatedWeight", "weightKg"]),
            jockeyName: pickString(runnerRecord, ["jockey", "jockeyName", "rider"]),
            trainerName: pickString(runnerRecord, ["trainer", "trainerName"]),
            apprenticeClaimKg: pickNumber(runnerRecord, ["claim", "apprenticeClaim", "claimKg"]),
            gearChangesText: pickString(runnerRecord, ["gear", "gearChanges"]),
            isScratched: pickBoolean(runnerRecord, ["scratched", "isScratched"]) ?? false,
          },
          providerPayload: runnerRecord,
        });

        if (runnerUpsert.created) runnersCreated += 1;
      }
    }
  }

  return {
    provider: "punting_form",
    date: options.date,
    meetingsDiscovered: meetingRecords.length,
    meetingsCreated,
    racesCreated,
    runnersCreated,
    rawEventsStored,
    warnings,
  };
}

export function getCardsDateFromSearchParams(searchParams: URLSearchParams): string {
  const explicitDate = searchParams.get("date");
  if (explicitDate) {
    return explicitDate;
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
  }).format(new Date());
}

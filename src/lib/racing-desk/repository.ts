import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { isRecord } from "./json";

interface ProviderRow {
  id: number;
  code: string;
}

interface MeetingInput {
  meetingDate: string;
  jurisdiction?: string;
  venueCode?: string;
  venueName: string;
  surface?: string;
}

interface RaceInput {
  meetingId: number;
  raceNumber: number;
  scheduledJumpAt: string;
  raceName?: string;
  className?: string;
  distanceM: number;
  trackCondition?: string;
  railPosition?: string;
  status?: string;
}

interface RunnerInput {
  raceId: number;
  runnerNumber: number;
  horseName: string;
  barrier?: number;
  allocatedWeightKg?: number;
  jockeyName?: string;
  trainerName?: string;
  apprenticeClaimKg?: number;
  gearChangesText?: string;
  isScratched?: boolean;
}

interface MarketMappingInput {
  providerCode: string;
  raceId: number;
  marketType: string;
  providerMarketId: string;
  marketStatus?: string;
  marketStartAt?: string;
}

interface MarketSnapshotInput {
  raceId: number;
  providerCode: string;
  marketType: string;
  providerMarketId: string;
  capturedAt: string;
  secondsToJump?: number;
  marketStatus?: string;
  inPlay?: boolean;
  totalMatchedAud?: number;
  sourceLatencyMs?: number;
}

interface RunnerMarketSnapshotInput {
  marketSnapshotId: number;
  runnerId: number;
  bestBackPrice?: number;
  bestBackSize?: number;
  bestLayPrice?: number;
  bestLaySize?: number;
  lastTradedPrice?: number;
  tradedVolumeAud?: number;
  impliedProbabilityRaw?: number;
}

export interface RaceLookup {
  id: number;
  raceNumber: number;
  scheduledJumpAt: string;
  venueName: string;
  meetingDate: string;
}

export interface RunnerLookup {
  id: number;
  raceId: number;
  horseName: string;
}

function requireRowId(data: unknown, context: string): number {
  if (isRecord(data) && typeof data.id === "number") {
    return data.id;
  }

  throw new Error(`Missing id while processing ${context}.`);
}

export class RacingSupabaseRepository {
  constructor(private readonly supabase: SupabaseClient = createAdminSupabaseClient()) {}

  async ensureProvider(code: string, name: string): Promise<ProviderRow> {
    const { data, error } = await this.supabase
      .from("racing_providers")
      .upsert({ code, name }, { onConflict: "code" })
      .select("id, code")
      .single();

    if (error) throw error;
    if (!isRecord(data) || typeof data.id !== "number" || typeof data.code !== "string") {
      throw new Error(`Unable to resolve provider ${code}.`);
    }

    return { id: data.id, code: data.code };
  }

  async appendRawProviderEvent(input: {
    providerCode: string;
    providerName: string;
    endpointName: string;
    requestKey?: string;
    responseStatus?: number;
    payloadJson: unknown;
  }): Promise<void> {
    const provider = await this.ensureProvider(input.providerCode, input.providerName);

    const { error } = await this.supabase.from("racing_raw_provider_events").insert({
      provider_id: provider.id,
      endpoint_name: input.endpointName,
      request_key: input.requestKey,
      response_status: input.responseStatus,
      payload_json: input.payloadJson,
    });

    if (error) throw error;
  }

  async upsertMeetingFromProvider(input: {
    providerCode: string;
    providerName: string;
    providerMeetingId: string;
    meeting: MeetingInput;
    providerPayload: unknown;
  }): Promise<{ meetingId: number; created: boolean }> {
    const provider = await this.ensureProvider(input.providerCode, input.providerName);
    const { data: existing, error: existingError } = await this.supabase
      .from("racing_provider_meetings")
      .select("meeting_id")
      .eq("provider_id", provider.id)
      .eq("provider_meeting_id", input.providerMeetingId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (isRecord(existing) && typeof existing.meeting_id === "number") {
      const { error } = await this.supabase
        .from("racing_meetings")
        .update({
          meeting_date: input.meeting.meetingDate,
          jurisdiction: input.meeting.jurisdiction,
          venue_code: input.meeting.venueCode,
          venue_name: input.meeting.venueName,
          surface: input.meeting.surface,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.meeting_id);

      if (error) throw error;

      return { meetingId: existing.meeting_id, created: false };
    }

    const { data: meeting, error: meetingError } = await this.supabase
      .from("racing_meetings")
      .insert({
        meeting_date: input.meeting.meetingDate,
        jurisdiction: input.meeting.jurisdiction,
        venue_code: input.meeting.venueCode,
        venue_name: input.meeting.venueName,
        surface: input.meeting.surface,
      })
      .select("id")
      .single();

    if (meetingError) throw meetingError;

    const meetingId = requireRowId(meeting, "meeting insert");
    const { error: mapError } = await this.supabase.from("racing_provider_meetings").insert({
      provider_id: provider.id,
      meeting_id: meetingId,
      provider_meeting_id: input.providerMeetingId,
      provider_payload: input.providerPayload,
    });

    if (mapError) throw mapError;

    return { meetingId, created: true };
  }

  async upsertRaceFromProvider(input: {
    providerCode: string;
    providerName: string;
    providerRaceId: string;
    race: RaceInput;
    providerPayload: unknown;
  }): Promise<{ raceId: number; created: boolean }> {
    const provider = await this.ensureProvider(input.providerCode, input.providerName);
    const { data: existing, error: existingError } = await this.supabase
      .from("racing_provider_races")
      .select("race_id")
      .eq("provider_id", provider.id)
      .eq("provider_race_id", input.providerRaceId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (isRecord(existing) && typeof existing.race_id === "number") {
      const { error } = await this.supabase
        .from("racing_races")
        .update({
          meeting_id: input.race.meetingId,
          race_number: input.race.raceNumber,
          scheduled_jump_at: input.race.scheduledJumpAt,
          race_name: input.race.raceName,
          class_name: input.race.className,
          distance_m: input.race.distanceM,
          track_condition: input.race.trackCondition,
          rail_position: input.race.railPosition,
          status: input.race.status ?? "scheduled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.race_id);

      if (error) throw error;
      return { raceId: existing.race_id, created: false };
    }

    const { data: race, error: raceError } = await this.supabase
      .from("racing_races")
      .insert({
        meeting_id: input.race.meetingId,
        race_number: input.race.raceNumber,
        scheduled_jump_at: input.race.scheduledJumpAt,
        race_name: input.race.raceName,
        class_name: input.race.className,
        distance_m: input.race.distanceM,
        track_condition: input.race.trackCondition,
        rail_position: input.race.railPosition,
        status: input.race.status ?? "scheduled",
      })
      .select("id")
      .single();

    if (raceError) throw raceError;

    const raceId = requireRowId(race, "race insert");
    const { error: mapError } = await this.supabase.from("racing_provider_races").insert({
      provider_id: provider.id,
      race_id: raceId,
      provider_race_id: input.providerRaceId,
      provider_payload: input.providerPayload,
    });

    if (mapError) throw mapError;
    return { raceId, created: true };
  }

  async upsertRunnerFromProvider(input: {
    providerCode: string;
    providerName: string;
    providerRunnerId: string;
    runner: RunnerInput;
    providerPayload: unknown;
  }): Promise<{ runnerId: number; created: boolean }> {
    const provider = await this.ensureProvider(input.providerCode, input.providerName);
    const { data: existing, error: existingError } = await this.supabase
      .from("racing_provider_runners")
      .select("runner_id")
      .eq("provider_id", provider.id)
      .eq("provider_runner_id", input.providerRunnerId)
      .maybeSingle();

    if (existingError) throw existingError;

    const horseId = await this.ensureHorse(input.runner.horseName);
    const jockeyId = input.runner.jockeyName
      ? await this.ensurePerson("jockey", input.runner.jockeyName)
      : null;
    const trainerId = input.runner.trainerName
      ? await this.ensurePerson("trainer", input.runner.trainerName)
      : null;

    if (isRecord(existing) && typeof existing.runner_id === "number") {
      const { error } = await this.supabase
        .from("racing_runners")
        .update({
          race_id: input.runner.raceId,
          horse_id: horseId,
          runner_number: input.runner.runnerNumber,
          barrier: input.runner.barrier,
          allocated_weight_kg: input.runner.allocatedWeightKg,
          jockey_id: jockeyId,
          trainer_id: trainerId,
          apprentice_claim_kg: input.runner.apprenticeClaimKg,
          gear_changes_text: input.runner.gearChangesText,
          is_scratched: input.runner.isScratched ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.runner_id);

      if (error) throw error;
      return { runnerId: existing.runner_id, created: false };
    }

    const { data: runner, error: runnerError } = await this.supabase
      .from("racing_runners")
      .insert({
        race_id: input.runner.raceId,
        horse_id: horseId,
        runner_number: input.runner.runnerNumber,
        barrier: input.runner.barrier,
        allocated_weight_kg: input.runner.allocatedWeightKg,
        jockey_id: jockeyId,
        trainer_id: trainerId,
        apprentice_claim_kg: input.runner.apprenticeClaimKg,
        gear_changes_text: input.runner.gearChangesText,
        is_scratched: input.runner.isScratched ?? false,
      })
      .select("id")
      .single();

    if (runnerError) throw runnerError;

    const runnerId = requireRowId(runner, "runner insert");
    const { error: mapError } = await this.supabase.from("racing_provider_runners").insert({
      provider_id: provider.id,
      runner_id: runnerId,
      provider_runner_id: input.providerRunnerId,
      provider_payload: input.providerPayload,
    });

    if (mapError) throw mapError;
    return { runnerId, created: true };
  }

  async upsertProviderMarket(input: MarketMappingInput): Promise<void> {
    const provider = await this.ensureProvider(
      input.providerCode,
      input.providerCode === "betfair" ? "Betfair Exchange" : input.providerCode
    );

    const { error } = await this.supabase.from("racing_provider_markets").upsert(
      {
        provider_id: provider.id,
        race_id: input.raceId,
        market_type: input.marketType,
        provider_market_id: input.providerMarketId,
        market_status: input.marketStatus,
        market_start_at: input.marketStartAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_id,provider_market_id" }
    );

    if (error) throw error;
  }

  async insertMarketSnapshot(input: MarketSnapshotInput): Promise<number> {
    const provider = await this.ensureProvider(
      input.providerCode,
      input.providerCode === "betfair" ? "Betfair Exchange" : input.providerCode
    );

    const { data, error } = await this.supabase
      .from("racing_market_snapshots")
      .insert({
        race_id: input.raceId,
        provider_id: provider.id,
        market_type: input.marketType,
        provider_market_id: input.providerMarketId,
        captured_at: input.capturedAt,
        seconds_to_jump: input.secondsToJump,
        market_status: input.marketStatus,
        in_play: input.inPlay ?? false,
        total_matched_aud: input.totalMatchedAud,
        source_latency_ms: input.sourceLatencyMs,
      })
      .select("id")
      .single();

    if (error) throw error;
    return requireRowId(data, "market snapshot insert");
  }

  async insertRunnerMarketSnapshots(rows: RunnerMarketSnapshotInput[]): Promise<void> {
    if (rows.length === 0) return;
    const { error } = await this.supabase.from("racing_runner_market_snapshots").insert(
      rows.map((row) => ({
        market_snapshot_id: row.marketSnapshotId,
        runner_id: row.runnerId,
        best_back_price: row.bestBackPrice,
        best_back_size: row.bestBackSize,
        best_lay_price: row.bestLayPrice,
        best_lay_size: row.bestLaySize,
        last_traded_price: row.lastTradedPrice,
        traded_volume_aud: row.tradedVolumeAud,
        implied_probability_raw: row.impliedProbabilityRaw,
      }))
    );

    if (error) throw error;
  }

  async listRaceLookups(startIso: string, endIso: string): Promise<RaceLookup[]> {
    const { data, error } = await this.supabase
      .from("racing_races")
      .select(
        "id, race_number, scheduled_jump_at, racing_meetings!inner(venue_name, meeting_date)"
      )
      .gte("scheduled_jump_at", startIso)
      .lte("scheduled_jump_at", endIso);

    if (error) throw error;
    if (!Array.isArray(data)) return [];

    return data.flatMap((row) => {
      if (!isRecord(row)) return [];
      const meeting = row.racing_meetings;
      if (!isRecord(meeting)) return [];
      if (
        typeof row.id !== "number" ||
        typeof row.race_number !== "number" ||
        typeof row.scheduled_jump_at !== "string" ||
        typeof meeting.venue_name !== "string" ||
        typeof meeting.meeting_date !== "string"
      ) {
        return [];
      }

      return [
        {
          id: row.id,
          raceNumber: row.race_number,
          scheduledJumpAt: row.scheduled_jump_at,
          venueName: meeting.venue_name,
          meetingDate: meeting.meeting_date,
        },
      ];
    });
  }

  async listRunnerLookups(raceIds: number[]): Promise<RunnerLookup[]> {
    if (raceIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from("racing_runners")
      .select("id, race_id, racing_horses!inner(horse_name)")
      .in("race_id", raceIds);

    if (error) throw error;
    if (!Array.isArray(data)) return [];

    return data.flatMap((row) => {
      if (!isRecord(row) || !isRecord(row.racing_horses)) return [];
      if (
        typeof row.id !== "number" ||
        typeof row.race_id !== "number" ||
        typeof row.racing_horses.horse_name !== "string"
      ) {
        return [];
      }

      return [
        {
          id: row.id,
          raceId: row.race_id,
          horseName: row.racing_horses.horse_name,
        },
      ];
    });
  }

  private async ensureHorse(horseName: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("racing_horses")
      .select("id")
      .eq("horse_name", horseName)
      .limit(1);

    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) {
      return requireRowId(data[0], `horse lookup ${horseName}`);
    }

    const { data: inserted, error: insertError } = await this.supabase
      .from("racing_horses")
      .insert({ horse_name: horseName })
      .select("id")
      .single();

    if (insertError) throw insertError;
    return requireRowId(inserted, `horse insert ${horseName}`);
  }

  private async ensurePerson(personType: string, displayName: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("racing_people")
      .select("id")
      .eq("person_type", personType)
      .eq("display_name", displayName)
      .limit(1);

    if (error) throw error;
    if (Array.isArray(data) && data.length > 0) {
      return requireRowId(data[0], `person lookup ${displayName}`);
    }

    const { data: inserted, error: insertError } = await this.supabase
      .from("racing_people")
      .insert({ person_type: personType, display_name: displayName })
      .select("id")
      .single();

    if (insertError) throw insertError;
    return requireRowId(inserted, `person insert ${displayName}`);
  }
}

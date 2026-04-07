# Racing Algo Build Plan

Last updated: 2026-04-05

## Current recommended build assumptions

- First execution venue: Betfair only.
- First market: win only.
- First race slice: NSW and VIC metro thoroughbreds.
- First operating mode: live paper trading with full data capture.
- First promotion target: micro-live after stable CLV and calibration, not before.
- Core platform: Vercel + Supabase.
- Core upstream APIs: Betfair + Punting Form.
- Next docs:
- `docs/research/racing-system-architecture.md`
- `docs/research/racing-data-schema.md`

## Objective

Build an Australian racing probability and execution platform that:

- Estimates calibrated win and later exotic probabilities.
- Blends private forecasts with market information from Betfair, totes, and fixed odds.
- Prices bets after commission, overround, takeout, rebates, and slippage.
- Executes late with disciplined staking and risk controls.
- Improves through controlled research, backtesting, and champion-challenger promotion.

## Design principles

- Probability engine, not tipster engine.
- Market-aware, not market-blind.
- Execution-aware, not prediction-only.
- Conservative promotion and bankroll controls.
- Research pipeline first, automation second, real-money scale last.

## Workstreams

### 1. Research and source tracking

- Maintain the knowledge base at `docs/research/horse-racing-quant-knowledge-base.md`.
- Separate primary evidence from journalistic inference.
- Keep an open-questions list for unresolved technical claims.
- Maintain a changelog of newly discovered data vendors, APIs, papers, and interviews.

### 2. Data acquisition

- Historical race results for Australian metro and provincial meetings.
- Timestamped market snapshots:
- Betfair back/lay ladders and traded volume.
- Tote win/place/exotic probable dividends.
- Fixed odds where legally and technically available.
- Runner metadata:
- barriers, weights, claims, jockey, trainer, sire, gear, scratchings.
- Race metadata:
- venue, class, distance, track condition, rail position, weather, wind, maintenance.
- Performance data:
- sectionals, settle position, margins, track-speed adjustments, trip notes, stewards comments.
- Intent data:
- trials, jump-outs, stable placement patterns, jockey-trainer combos, market drifts.

### 3. Warehouse and feature store

- Create race, runner, market-snapshot, results, and execution tables.
- Store raw data and cleaned feature-ready data separately.
- Version feature definitions.
- Add time-aware joins so every feature is available only as of bet time.
- Store derived features for:
- speed.
- pace.
- class.
- fitness.
- distance-track fit.
- stable intent.
- barrier-tempo interactions.
- market microstructure.

### 4. Modeling stack

- Baseline:
- market-implied probability model.
- private multinomial logit model.
- Intermediate:
- gradient boosting or ranking model with softmax calibration.
- hierarchical runner effects for horse, trainer, jockey, sire, venue, and conditions.
- Calibration:
- isotonic or Platt-style calibration.
- market-blend meta-model.
- Exotics later:
- conditional finish-order model or simulation engine.

### 5. Market integration

- Betfair market discovery and price collection.
- Tote and fixed-odds aggregation.
- Market normalization:
- commission.
- overround.
- takeout.
- rebates.
- price improvement / slippage.
- Late-market signals:
- drift.
- steam.
- exchange-vs-tote divergence.
- traded-volume acceleration.

### 6. Execution and risk

- Fractional Kelly with confidence haircut.
- Max daily loss cap.
- Max daily turnover cap.
- Max race exposure.
- Max runner exposure.
- Kill switches for:
- drawdown.
- data outage.
- stale pricing.
- abnormal slippage.
- unexpected correlation spikes.

### 7. Evaluation

- Predictive:
- log loss.
- Brier score.
- calibration curves.
- ranking metrics.
- Trading:
- ROI.
- CLV.
- turnover.
- slippage.
- drawdown.
- recovery time.
- Segment all metrics by:
- venue.
- distance.
- class.
- track condition.
- bet type.
- signal family.

### 8. Continuous improvement

- Champion-challenger framework.
- Offline retraining on settled results.
- Feature decay monitoring.
- Regime detection for track-bias and policy changes.
- Promote only when:
- calibration improves.
- CLV improves.
- drawdown remains acceptable.
- performance is stable across time splits.

## Milestones

### Phase 1: Research and data blueprint

- Finalize source-backed research notes.
- Lock the canonical data schema.
- Confirm provider availability and legal constraints.
- Define backtest protocol and acceptance metrics.
- Deliverables:
- system architecture doc.
- warehouse schema doc.
- first provider mapping plan.

### Phase 2: Historical warehouse

- Build ingestion for results and market snapshots.
- Backfill a minimum viable history.
- Validate joins and point-in-time correctness.
- Suggested target:
- at least one full recent season of NSW/VIC metro win markets for rapid iteration.
- stretch target of 3-5 years once pipelines are stable.

### Phase 3: First private probability model

- Train baseline win model.
- Benchmark versus market-implied probabilities.
- Add first market-blend layer.
- Acceptance:
- beat market-only control on calibration in held-out windows.
- show non-negative paper CLV after realistic latency assumptions.

### Phase 4: Execution simulator

- Simulate late-bet placement with realistic liquidity and slippage.
- Add bankroll and risk governor.
- Track paper CLV and simulated PnL.
- Acceptance:
- stable paper execution for several weeks with no reconciliation or freshness failures.

### Phase 5: Controlled live pilot

- Small cap only.
- Win markets first.
- Daily monitoring with automatic stop conditions.
- No automatic cap increases without explicit approval.
- Acceptance:
- manual review after each trading block before any increase in daily cap.

## Immediate next tasks

1. Finalize the Australian racing data-source map and what each provider can legally supply.
2. Define the warehouse schema for races, runners, prices, features, bets, and settlements.
3. Decide the first target slice:
NSW/VIC metro win markets on Betfair only, or Betfair plus tote reference prices.
4. Build a point-in-time market snapshot collector.
5. Build the first offline backtest using market-implied probabilities as the control model.

## Open questions

- Which providers give the cleanest timestamped Australian market snapshots at acceptable cost?
- How much subjective trip-note data can we automate from public text before manual labeling is needed?
- Do we start exchange-only for execution, or include tote and fixed-odds comparison immediately?
- What is the minimum viable historical depth for stable calibration in our chosen market slice?

## New architecture decisions from this run (2026-03-28)

- Decision: add a `policy_and_entitlements` service as a hard dependency for both backtest and live execution.
- Why: race-field rights and CAW/late-betting rules are explicitly versioned and venue-specific; replay and production behavior must be policy-correct by date and jurisdiction.
- Decision: enforce Betfair ingestion guardrails in code (`listMarketBook` per-market cadence, request-weight budget, stream-vs-REST split).
- Why: these are documented platform limits and will otherwise silently degrade freshness and execution quality.
- Decision: include a dual market view in schema (`raw` vs `displayed/virtualised` ladder context).
- Why: virtualisation/cross-matching settings can create training-serving mismatches if not persisted.
- Decision: model late-price dynamics with rule-aware features (`sec_to_post`, known cutoff timestamps, venue policy regime).
- Why: CAW access controls change end-of-market microstructure and CLV behavior.

## Provider comparison (high-signal update)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange API + Stream | Live prices, traded volume, market status, bet delay, cross-matching flags, AUS market IDs | Poll/weight limits; delayed data possible with wrong key/account state | A | Primary execution and truth source for win pilot |
| Racing Australia FreeFields + state links | Daily race fields/results/scratchings/stewards pathways and state coverage map | Copyright/licensing constraints; not a full commercial entitlement by default | A | Use for structure discovery and linkage, not unrestricted commercial redistribution |
| Racing NSW / Racing Victoria race-fields policies | Current policy versions and approval conditions | Jurisdiction-specific, updates over time | A | Store versioned policy metadata and enforce as runtime guardrails |
| Punting Form Modeller / Commercial | Sectionals, point-in-time options, historical packs, API pathway | Tiered access, personal-use limits on advertised modeller tier | B | Candidate feature source; require commercial terms before production use |
| ACCC race-info determination history | Historical market-structure context for approved supplier pathways | Older determination context, not a current entitlement grant by itself | B | Use as background context only |

## Data contract additions required

- `policy_regime` table keyed by jurisdiction/track/date:
- `source`, `effective_from`, `effective_to`, `caw_cutoff_sec_win`, `caw_cutoff_sec_other_pools`, `notes`.
- `entitlement_contract` table keyed by provider/product/version:
- `allowed_use`, `redistribution_rights`, `commercial_scope`, `expiry`.
- `market_ingestion_audit`:
- `collector_mode(stream|rest)`, `request_weight_points`, `poll_hz`, `virtualise_flag`, `is_delayed`.
- `execution_context`:
- `sec_to_post`, `bet_delay_sec`, `market_version`, `order_submit_ts`, `order_ack_ts`.

## Open questions to resolve before implementation freeze

- Which exact commercial package (not retail tier) gives us legally deployable AU sectional + point-in-time data?
- Do we ingest tote references from licensed provider feeds in Phase 1, or defer tote until Betfair-only pilot stabilizes?
- What retention and audit requirements apply to policy/entitlement snapshots for compliance reviews?
- For late execution, what is our minimum acceptable end-to-end latency budget from price event to order submit?

## Ranked implementation backlog (revised)

### P0 (must do before any live staking)

1. Implement `policy_and_entitlements` service with versioned rules and provider contracts.
2. Build Betfair collector with explicit request-weight budgeting and per-market poll caps.
3. Persist full execution timestamps (`event`, `signal`, `submit`, `ack`, `match`) plus `betDelay` and `sec_to_post`.
4. Add replay engine mode that enforces historical policy versions by event date.
5. Add runtime kill-switch when data is delayed (`isMarketDataDelayed=true`) or collector breaches guardrails.

### P1 (needed for robust paper trading and model reliability)

1. Integrate one licensed sectional/provider source under commercial terms and map to feature lineage.
2. Train late-microstructure features around cutoff windows and compare against baseline market-only model.
3. Add dual-ladder feature views (raw and virtualised/displayed) and test for prediction drift.
4. Build provider fallback logic so model remains operable under entitlement degradation.

### P2 (scale and edge expansion)

1. Add tote divergence features where rights are confirmed and historical timestamps are reliable.
2. Expand beyond NSW/VIC metro once policy/entitlement handling is battle-tested.
3. Start place/exotics research only after stable win-market calibration + paper CLV persistence.

## Incremental architecture decisions from this run (2026-03-28, pass 2)

- Decision: add an `exchange_session_control` component (stream clocks, subscription budget, reconnect policy, heartbeat supervision).
- Why: Betfair stream and heartbeat semantics create explicit failure modes (`TIMEOUT`, `INVALID_CLOCK`, partial heartbeat cancellations) that need deterministic handling.
- Decision: add a `regulatory_reporting_mart` derived from canonical bet/execution tables.
- Why: RV reporting requires daily and monthly submissions on `Result Date` timelines with specific channel/client fields; this is easiest to satisfy from a dedicated mart.
- Decision: separate `event_date` and `result_date` as first-class columns across ingestion, settlement, and reporting models.
- Why: source documentation uses both dates for different operational requirements; collapsing them would break replay/reconciliation.

## Provider comparison (incremental high-signal additions)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Victoria Guide to Provision of Information 2025-26 | Concrete schema for daily/monthly reporting, required field names, channel/client dimensions, file cadence | Guide is subordinate to standard conditions and can be revised | A | Build reporting mart and ingestion lineage aligned to these fields now |
| Racing Victoria approved WSP registry | Live view of approved operators (AU and international) using Victorian race fields | Approval list can change; not a direct data-feed SLA | A | Snapshot periodically as compliance context metadata |
| Betfair Exchange Stream + Heartbeat API | Connection protocol, subscription/error semantics, reconnect clocks, auto-cancel heartbeat parameters | Operational complexity; cancellation is best-effort, not guaranteed | A | Implement dedicated session-control subsystem before live pilot |

## Data contract additions required (incremental)

- `exchange_session_log`:
- `connection_id`, `stream_connected_ts`, `first_message_ts`, `subscription_count`, `status_code`, `error_code`, `initial_clk`, `clk`.
- `heartbeat_log`:
- `heartbeat_ts`, `preferred_timeout_sec`, `actual_timeout_sec`, `action_performed`.
- `reporting_mart_rv_daily`:
- `event_date`, `result_date`, `venue_code`, `race_number`, `fo_bets_taken`, `fo_bets_paid`, `fo_epmb`, `fo_epwmb`, `fo_client_cnt_ytd`, `fo_to_mobile`, `fo_to_retail` (and other RV-required columns).
- `compliance_snapshot`:
- `jurisdiction`, `approved_wsp_source_url`, `snapshot_ts`, `operator_name`, `approval_class`.

## Open questions to resolve before implementation freeze (incremental)

- Should heartbeat timeout run near minimum (faster cancel intent) or higher (fewer API calls) for our expected order frequency?
- What reconciliation process closes exposure if heartbeat action returns `SOME_BETS_NOT_CANCELLED` or `CANCELLATION_STATUS_UNKNOWN`?
- Do we ingest/snapshot approved-operator registries daily or weekly for policy drift tracking?
- Which internal owner signs off on RV-style reporting completeness SLOs before live trading escalation?

## Ranked implementation backlog (delta)

### P0 additions

1. Build stream clock persistence and reconnect state machine (`initialClk/clk`) with incident escalation on `INVALID_CLOCK`.
2. Implement heartbeat supervisor with explicit handling for partial/unknown cancellation outcomes.
3. Create `event_date` vs `result_date` invariant checks in warehouse ETL and settlement joins.
4. Build first `reporting_mart_rv_daily` export and automated validation against required columns/timing.

### P1 additions

1. Add session-quality metrics (timeouts, reconnects, heartbeat actions) into execution-performance dashboards.
2. Snapshot approved WSP registries and tie snapshots to entitlement/version history.
3. Evaluate whether reporting-derived channel/client fields improve drift detection and CLV segmentation.

## Sources for this update

- NYRA CAW safeguards (2026-01-30): https://www.nyra.com/aqueduct/news/nyra-announces-new-safeguards-concerning-computer-assisted-wagering
- Betfair `listMarketBook`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook
- Betfair market data request limits: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687450/Market+Data+Request+Limits
- Betfair betting type definitions: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting+Type+Definitions
- Racing Australia FreeFields (example): https://www.racingaustralia.horse/FreeFields/Calendar.aspx?State=ACT
- Racing NSW Race Fields Policy (effective 2024-07-01): https://www.racingnsw.com.au/wp-content/uploads/2024/06/Racing-NSW-Race-Fields-Policy-Effective-1-July-2024.pdf
- Racing NSW Standard Conditions (effective 2025-03-01): https://www.racingnsw.com.au/wp-content/uploads/2025/02/Race-Field-Information-Standard-Conditions-of-Approval-1-March-2025.pdf
- Racing NSW race fields (Australian wagering operators information): https://www.racingnsw.com.au/wp-content/uploads/Race-Field-Information-Use-Information-for-Australian-Wagering-Operators.pdf
- Racing Victoria Race Fields policy index: https://www.racingvictoria.com.au/integrity/rule-changes-and-policies/policies/race-fields-policy
- Racing Victoria Race Fields policy page: https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria approved wagering service providers: https://www.racingvictoria.com.au/wagering/wagering-service-providers
- Racing Victoria guide to provision of information 2025-26: https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf?v=09a420bf
- ACCC Authorisation Register (TAB race information determination context): https://www.accc.gov.au/public-registers/authorisations-and-notifications-registers/authorisations-register/tab-limited-notification-n99975
- Punting Form Modeller product page: https://www.puntingform.com.au/products/modeller
- Betfair Exchange Stream API (updated 2026-02-20): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange+Stream+API
- Betfair Heartbeat API (updated 2024-06-27): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687861/Heartbeat+API

## Incremental architecture decisions from this run (2026-03-28, pass 3)

- Decision: add a strict `order_state_reconciler` between signal generation and risk ledger commits.
- Why: Betfair async order placement and stale `marketVersion` lapses mean initial placement responses are non-final in a meaningful subset of paths.
- Decision: add `price_ladder_normalizer` as a shared library used by simulation, execution, and backtest replay.
- Why: official ladder constraints (`CLASSIC`/`FINEST`/`LINE_RANGE`) create deterministic `INVALID_ODDS` failure modes if not normalized pre-submit.
- Decision: add `provider_sla_monitor` and `entitlement_registry_watcher` in ingestion control-plane.
- Why: Racing Australia service/performance metrics and NSW approval/version churn indicate provider reliability and rights status are dynamic operational inputs.
- Decision: move jurisdiction fee schedules into first-class config with effective-date versioning.
- Why: NSW 2025-07-01 conditions include explicit fee/category mechanics that materially alter post-cost EV and deployment decisions.

## Provider comparison (incremental high-signal additions, pass 3)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `placeOrders` + Additional Info + Exchange rules | Market-version lapsed-order control, 60s de-dupe key semantics, async placement behavior, ladder/tick constraints, price-time queue rules | Higher execution-state complexity and reconciliation burden | A | Build idempotent async order pipeline with explicit queue/tick controls before scaling stake |
| Racing Australia materials + 2024/25 service report | Result/publication timing priors and concrete platform service metrics | Service metrics are aggregate and not a commercial low-latency market-data SLA | A | Use as baseline SLA priors and freshness SLO thresholds, not as direct trading-feed guarantees |
| Racing NSW 2025-07-01 Standard Conditions + approved-operator register | Current fee/category schedule and regularly updated approval context | Terms and approved lists can change; requires snapshotting/versioning | A | Implement fee-policy version store and automated entitlement checks in pre-trade gating |

## Data contract additions required (incremental, pass 3)

- `order_reconciliation_log`:
- `market_id`, `selection_id`, `customer_ref`, `market_version_sent`, `placement_status_initial`, `bet_id_initial`, `reconciled_status`, `reconciled_ts`, `lapsed_reason`.
- `price_ladder_snapshot`:
- `market_id`, `price_ladder_type`, `price`, `tick_size`, `is_valid_increment`.
- `provider_sla_snapshot`:
- `provider`, `metric_name`, `target_value`, `actual_value`, `period_start`, `period_end`, `source_url`.
- `jurisdiction_fee_schedule`:
- `jurisdiction`, `effective_from`, `effective_to`, `operator_category`, `rate_percent`, `minimum_monthly_fee_aud`, `source_version`.
- `approval_registry_snapshot`:
- `jurisdiction`, `operator_name`, `approval_status`, `snapshot_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 3)

- What is our canonical handling for `PENDING` orders that remain unreconciled beyond a defined timeout window (auto-cancel, hedge, or halt)?
- How do we estimate queue position robustly when cross-matching may improve displayed matching while preserving first-in-price-time behavior at a given level?
- Should provider SLA drift trigger a hard execution pause, soft model-confidence downweight, or venue-specific routing changes?
- Which finance owner signs off the jurisdiction fee schedule assumptions (including premium/threshold categories) before live deployment?

## Ranked implementation backlog (delta, pass 3)

### P0 additions

1. Implement end-to-end idempotency (`customerRef`) and async reconciliation state machine for place/replace/cancel.
2. Add `marketVersion` concurrency checks and deterministic handling for lapsed orders in execution and replay.
3. Add pre-trade ladder validation and price normalization shared by simulator and live executor.
4. Stand up fee-policy version store with NSW 2025-07-01 baseline and effective-date lookup in expected-value calculations.
5. Add entitlement registry snapshot job and pre-trade gate tied to current approved-operator status.

### P1 additions

1. Build provider SLA monitor from Racing Australia and commercial-feed metrics; expose freshness/error dashboards.
2. Add queue-aware fill model features (`tick_size`, estimated queue rank, cross-matching regime).
3. Run sensitivity tests of strategy edge under fee-category scenarios (standard vs premium/threshold classes).

## Sources for this update (pass 3)

- Betfair `placeOrders`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Additional Information: https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Betfair Exchange general rules: https://support.betfair.com/app/answers/detail/exchange-general-rules
- Racing Australia materials page: https://www.racingaustralia.horse/industry/Materials/
- Racing Australia annual service standard report 2024-25: https://www.racingaustralia.horse/FreeServices/Reports/Consolidated-Report-2024-2025.pdf
- Racing NSW Standard Conditions (effective 2025-07-01): https://www.racingnsw.com.au/wp-content/uploads/2025/06/Race-Field-Information-Standard-Conditions-of-Approval-1-July-2025.pdf
- Racing NSW approved licensed wagering operators register: https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/

## Incremental architecture decisions from this run (2026-03-28, pass 4)

- Decision: add an `order_audit_archive` subsystem as a hard dependency before scaling paper/live turnover.
- Why: Betfair cleared-order history defaults to a 90-day window and paged retrieval; reproducible long-horizon research/compliance requires internal immutable archival.
- Decision: treat `replaceOrders` as explicit two-phase execution (`cancel_leg`, `place_leg`) in domain models.
- Why: cancel-first semantics with no rollback on failed place creates non-atomic exposure transitions and requires deterministic reconciler behavior.
- Decision: add jurisdiction-specific `fee_formula_engine` with threshold and seasonal uplift support.
- Why: Tasracing terms show piecewise fee algebra and Jan-Feb uplifts that materially change net edge and strategy routing.
- Decision: add provider revision-history ingestion mode where available (`history` endpoints + status timestamps).
- Why: update-level lineage is needed for point-in-time replay and late-change diagnostics; snapshot-only ingestion loses sequence information.

## Provider comparison (incremental high-signal additions, pass 4)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `replaceOrders` + current/cleared order APIs | Non-atomic replace semantics, paging/filter limits, recommended match-tracking query mode, settled-history window constraints | Reconciliation complexity and potential history truncation if internal archiving is absent | A | Implement two-phase order state model plus durable internal order/settlement event store |
| Tasracing race-fields policy stack | Explicit bet-type fee formulas, thresholds, seasonal surcharges, filing/payment deadlines, applicant mode declarations | Jurisdiction-specific legal terms; effective documents can change and must be versioned | A | Add versioned fee-formula engine and compliance scheduler keyed by jurisdiction and period |
| Podium Racing API onboarding docs | History endpoints for update-level reconstruction, status transition timestamps (off/weighed-in), practical payload-size guidance | Commercial access and integration terms required; payload growth pressures storage/processing | A | Candidate secondary provider for PIT/event-history enrichment; integrate only with signed commercial terms |

## Data contract additions required (incremental, pass 4)

- `order_replace_journal`:
- `order_id`, `customer_ref`, `cancel_leg_ts`, `cancel_leg_status`, `place_leg_ts`, `place_leg_status`, `non_atomic_gap_ms`, `reconciliation_status`.
- `order_event_archive`:
- `event_id`, `event_type`, `source_api`, `event_ts`, `payload_hash`, `ingested_ts`, `retention_class`.
- `jurisdiction_fee_formula`:
- `jurisdiction`, `effective_from`, `effective_to`, `bet_type`, `turnover_rate`, `net_revenue_rate`, `turnover_threshold_aud`, `seasonal_uplift_rule`.
- `regulatory_due_calendar`:
- `jurisdiction`, `payment_period`, `return_due_date`, `payment_due_date`, `business_day_rule`, `file_status`.
- `provider_history_cursor`:
- `provider`, `entity_type`, `entity_uuid`, `last_seen_update_ts`, `last_seen_version`, `cursor_state`.

## Open questions to resolve before implementation freeze (incremental, pass 4)

- What exact retention policy (years, storage tier, immutability guarantees) do we require for `order_event_archive` to satisfy audit and research needs?
- For non-atomic replace flows, what is the risk action when cancel succeeds but place fails near jump (re-submit, hedge, or hard stop)?
- Do we include Tasracing jurisdiction support in Phase 1 economics engine even if execution remains NSW/VIC-focused, or defer until expansion?
- Which commercial provider is preferred for revision-history ingestion in AU (Podium vs alternatives) once legal terms are compared?
- Betfair documentation currently contains conflicting market-id prefix statements across pages (`1.` legacy note vs AUS `2.` guidance); which endpoint output should be treated as canonical in parser validation tests?

## Ranked implementation backlog (delta, pass 4)

### P0 additions

1. Implement `order_replace_journal` and enforce two-phase replace reconciliation before risk-ledger finalization.
2. Build internal `order_event_archive` with immutable append-only writes and replay tooling.
3. Add Betfair API cursor/pagination guardrails (`fromRecord`, page-size controls, filter-cap checks) and completeness alarms.
4. Implement jurisdiction fee-formula engine with threshold + seasonal uplift support (seed with Tasracing formulas).
5. Add compliance due-date scheduler with business-day logic and alerting for return/payment deadlines.

### P1 additions

1. Add provider-history ingestion abstraction and test with one history-capable feed (Podium candidate).
2. Add late-window recovery policy simulation for replace-failure scenarios near off time.
3. Extend expected-value pipeline to output pre-fee vs post-fee attribution by jurisdiction and fee-rule branch.

## Sources for this update (pass 4)

- Betfair `replaceOrders`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687487/replaceOrders
- Betfair `listCurrentOrders`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687504/listCurrentOrders
- Betfair `listClearedOrders`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687749/listClearedOrders
- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Podium Racing API onboarding documentation: https://podiumsports.com/resource/podium-racing-api-onboarding-documentation/
- Tasracing Race Fields Information: https://tasracing.com.au/documents/race-fields-information
- Tasracing Standard Conditions of Approval (commencing 2019-10-01): https://tasracing.com.au/hubfs/Corporate%20Documents/Standard%20Conditions%20of%20Approval%20October%202019.pdf
- Tasracing Application to Publish - Domestic (FY25): https://tasracing.com.au/hubfs/Corporate%20Documents/Application%20to%20Publish%20-%20Domestic.pdf

## Incremental architecture decisions from this run (2026-03-29, pass 5)

- Decision: add an account-scoped `api_budget_governor` spanning all Betfair clients (market data, order, research).
- Why: Betfair documents account-level instruction limits and shared `TOO_MANY_REQUESTS` failure modes across concurrent apps/processes.
- Decision: add `app_key_entitlement_guard` as a hard startup check in paper/live environments.
- Why: delayed app keys are documented as receiving conflated stream updates every 3 minutes, which invalidates late-market execution assumptions.
- Decision: add `historical_data_readiness` metadata into research pipelines.
- Why: Betfair historical-data availability has explicit coverage start dates and ~5-day post-settlement publication lag, so training windows must be availability-aware.
- Decision: add jurisdiction module support for Queensland and WA in `policy_and_entitlements`.
- Why: QLD and WA documents define materially different authority periods, submission templates, levy thresholds, and return timing obligations.

## Provider comparison (incremental high-signal additions, pass 5)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Support (ops + historical data) | Concrete account-level throttle semantics, delayed/live app-key behavior, historical data coverage windows, publication lag, historical API limits | Support-doc layer (operationally strong, but not full exchange rulebook); limits can evolve | A | Encode as runtime guardrails and data-availability metadata in collector + training orchestrator |
| Racing Queensland race information framework | Authority period/versioning, application fee, authorised-provider snapshot, submission-template segmentation (including >A$5M vs <=A$5M pathways) | Jurisdiction-specific legal artefacts; periodic revisions require snapshotting | A | Add QLD module to entitlement service and reporting-schema selector |
| WA DLGSC race-fields / levy framework | Monthly return + levy obligations, due-date timing, nil-levy threshold, regulator real-time access powers | Statutory/admin obligations distinct from east-coast templates | A | Add WA compliance scheduler + audit-readiness controls before jurisdiction expansion |

## Data contract additions required (incremental, pass 5)

- `api_budget_usage`:
- `account_id`, `window_start_ts`, `window_end_ts`, `instruction_count`, `instruction_limit`, `throttle_events`.
- `app_key_profile`:
- `app_key_id`, `entitlement_type(live|delayed)`, `stream_conflation_sec_expected`, `validated_ts`.
- `historical_data_availability`:
- `provider`, `sport`, `region`, `coverage_start_date`, `publish_lag_days`, `api_rate_limit_req`, `api_rate_limit_window_sec`.
- `jurisdiction_reporting_profile`:
- `jurisdiction`, `effective_from`, `effective_to`, `turnover_band`, `submission_template_id`, `submission_channel`, `frequency`.
- `jurisdiction_levy_rule`:
- `jurisdiction`, `effective_from`, `effective_to`, `threshold_aud`, `levy_formula`, `return_due_days_after_month_end`, `real_time_access_clause_flag`.

## Open questions to resolve before implementation freeze (incremental, pass 5)

- Should we isolate Betfair data collection and execution into separate funded accounts (where terms permit) to avoid shared instruction-budget contention?
- What safety margin do we enforce below the published instruction limit before auto-throttling or queue shedding starts?
- Do we ingest QLD turnover-band templates from source files directly or maintain an internal normalized schema with version hashes?
- For WA real-time access powers, what minimum retention/indexing standard should we enforce for auditable replay and regulator requests?
- Does our current backtest window selection logic explicitly respect Betfair AU/NZ historical coverage start dates and the 5-day settlement publication lag?

## Ranked implementation backlog (delta, pass 5)

### P0 additions

1. Implement account-level Betfair instruction-budget meter and throttle controller with hard fail-safe on sustained `TOO_MANY_REQUESTS`.
2. Add app-key entitlement validation at startup; block paper/live execution if key type is delayed.
3. Add historical-data availability registry (coverage start + lag + API rate limits) and enforce in training/backfill schedulers.
4. Implement QLD jurisdiction profile ingestion (authority dates, fee flag, reporting-template variants, approved-operator snapshot timestamping).
5. Implement WA monthly return scheduler with 14-day due-date logic and nil-levy threshold handling.

### P1 additions

1. Add cross-workload API budget forecasting (research jobs vs live collectors) and off-peak scheduling recommendations.
2. Build compliance schema compiler that maps jurisdiction source templates (QLD/WA/NSW/VIC/TAS) into canonical warehouse views.
3. Add audit-readiness dashboards for retention completeness and replayability under regulator-access scenarios.

## Sources for this update (pass 5)

- Betfair support: `TOO_MANY_REQUESTS` (account-level 1000 instructions/sec context): https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-the-TOO-MANY-REQUESTS-error
- Betfair support: delayed vs live app key (stream conflation behavior): https://support.developer.betfair.com/hc/en-us/articles/115003887431-When-should-I-use-the-Delayed-or-Live-Application-Key
- Betfair historical data coverage: https://support.developer.betfair.com/hc/en-us/articles/360002423271-What-data-is-provided-as-part-of-the-historical-data-service
- Betfair historical API usage: https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-Can-I-Make-HTTP-Requests-to-the-Historical-Data-API
- Betfair historical data publish lag: https://support.developer.betfair.com/hc/en-us/articles/360002427051-How-frequently-is-the-historical-data-updated
- Betfair historical API rate limits: https://support.developer.betfair.com/hc/en-us/articles/360002424072-What-are-the-request-rate-limits-on-the-Historical-Data-API
- Racing Queensland race information: https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland authorised wagering service providers list (as at Nov 20, 2025): https://www.racingqueensland.com.au/getmedia/03b57141-1fe4-41e1-a25e-76d978e27ef3/20251120-List-of-Authorised-Wagering-Services-Providers-v6.pdf
- WA DLGSC race-fields / racing bets levy page: https://prod.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/race-fields

## Incremental architecture decisions from this run (2026-03-29, pass 6)

- Decision: make `clk` the canonical stream-sequencing cursor in collectors and replay, with `pt` retained as telemetry only.
- Why: Betfair support guidance now explicitly points to `clk` for stream sequence tracking.
- Decision: require explicit `marketFilter` in all production stream subscriptions.
- Why: Betfair documents that unfiltered subscriptions auto-publish all newly activated markets available to the app key.
- Decision: split feed-mode contracts into `raw` and `virtual_display` views with explicit lag metadata.
- Why: Betfair support documents an approximate 150ms lag for virtual/display prices relative to non-virtual prices.
- Decision: replace fixed delayed-key assumptions with a delay-range model.
- Why: newer Betfair support guidance gives variable delayed-key snapshots (1-180 seconds), superseding fixed-cadence assumptions.
- Decision: add `provider_freshness_profile` for non-exchange vendors.
- Why: provider docs with minute-level cadence materially affect feature freshness and execution feasibility.

## Provider comparison (incremental high-signal additions, pass 6)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Stream support updates (2026-03) | Canonical stream sequencing guidance (`clk`), `con=true` semantics, unfiltered subscription behavior, closed-market cache handling | Support-doc layer; still needs runtime validation against live traffic | A | Implement stream-sequencing controller + mandatory market-filter guards + subscription-budget alarms |
| Betfair `listMarketBook`/Stream data mapping + app-key guidance | Explicit raw-vs-virtual feed mapping, virtual lag (~150ms), delayed-key variable range (1-180 sec) | Potential doc-version drift and apparent tension with older delayed-key notes | A | Treat feed-mode and delay-regime as first-class fields; block live-like execution in delayed mode |
| The Racing API public docs | Explicit snapshot refresh cadence and AU add-on indication; local-mirror recommendation for high throughput | Vendor-marketing documentation; contract terms/SLA still required for production assurance | B | Add as secondary candidate with cadence-aware freshness controls and legal/commercial due diligence gate |

## Data contract additions required (incremental, pass 6)

- `stream_message_audit`:
- `connection_id`, `clk`, `pt`, `conflated_flag`, `img_flag`, `received_ts`, `socket_lag_ms`.
- `stream_subscription_audit`:
- `subscription_id`, `market_filter_present_flag`, `market_count_requested`, `market_count_auto_added`, `closed_market_cache_count`, `limit_exceeded_flag`.
- `market_feed_mode_profile`:
- `market_id`, `price_view_mode`, `virtual_lag_ms_expected`, `source_doc_url`, `observed_lag_ms_p50`, `observed_lag_ms_p95`.
- `app_key_delay_profile`:
- `app_key_id`, `delay_min_sec_doc`, `delay_max_sec_doc`, `observed_delay_sec_p50`, `observed_delay_sec_p95`, `doc_updated_date`.
- `provider_freshness_profile`:
- `provider`, `region`, `today_update_sec`, `tomorrow_update_sec`, `future_update_sec`, `local_mirror_recommended_flag`, `effective_from`.

## Open questions to resolve before implementation freeze (incremental, pass 6)

- Which delayed-key statement should be treated as canonical in controls: older fixed 180s guidance or updated 1-180s range, and do live measurements match either?
- What threshold of `con=true` frequency triggers collector degradation mode or execution pause near jump?
- Do we isolate raw and virtual display ladders into separate model families, or only use raw ladders for execution-critical features?
- What market-universe allowlist should gate accidental broad subscriptions when market filters are malformed?
- Is The Racing API cadence acceptable for any live pre-off signals, or only for research/feature enrichment roles?

## Ranked implementation backlog (delta, pass 6)

### P0 additions

1. Implement `clk`-based stream sequencer with gap detection and deterministic replay checkpoints.
2. Enforce `marketFilter` requirement in stream subscription builder and block deploys without allowlisted filters.
3. Add subscription-budget monitor that accounts for closed-market cache eviction behavior (5-minute sweep, 1-hour delete mark).
4. Add feed-mode isolation (`raw` vs `virtual_display`) and explicit lag alignment in feature pipeline.
5. Replace fixed delayed-key assumptions with observed delay distribution tracking and hard guardrails for live-like execution.

### P1 additions

1. Add stream-health dashboard panels for `con=true` rate, socket lag, and `clk` gap incidents.
2. Run controlled experiments on model degradation under virtual-lag offset and delayed-key ranges.
3. Complete commercial/legal diligence for The Racing API and classify as research-only vs executable feed.

## Sources for this update (pass 6)

- Betfair support: `con=true` stream messages and causes: https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-con-true-messages-via-the-Stream-API
- Betfair support: Stream sequencing by `clk` / `pt` ordering note (updated 2026-03-03): https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- Betfair support: unfiltered stream subscription behavior (updated 2026-03-03): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair support: closed-market cache eviction and deletion timing: https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair support: `listMarketBook` / Stream data mapping and virtual-price lag (~150ms): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API-
- Betfair support: delayed vs live application key guidance (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/360009638032-When-should-I-use-the-Delayed-or-Live-Application-Key
- The Racing API coverage and published refresh cadence: https://www.theracingapi.com/

## Incremental architecture decisions from this run (2026-03-29, pass 7)

- Decision: add a `delay_model_state_service` to persist and broadcast `betDelayModels` regime (`PASSIVE`, `DYNAMIC`, none) as first-class execution context.
- Why: Betfair's 2026 release notes move delay-model metadata into discovery/filter pathways and document model-dependent delay behavior changes.
- Decision: add a `schema_drift_guard` for market-delay fields and forum-announced rollout changes.
- Why: Betfair rollout notes show temporary naming/behavior inconsistencies (`betDelayedModels` vs `betDelayModels`) that can silently break parsers.
- Decision: add a `policy_override_incident` dataset for venue-rule suspensions.
- Why: Feb 2026 NYRA CAW-guardrail suspension demonstrates operational overrides can temporarily invalidate steady-state policy assumptions.
- Decision: tighten provider-contract gating for AU feature feeds (`personal_use_only`, commercial API entitlement state).
- Why: Punting Form documentation separates Modeller personal-use access from commercial licensing and exposes endpoint-level API contract surface.

## Provider comparison (incremental high-signal additions, pass 7)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Forum announcements (delay-model releases + dynamic-delay updates) | Forward-looking microstructure rollout detail (`betDelayModels` scope, dynamic-delay transitions, implementation caveats) | Announcement/forum layer can include transient rollout inconsistencies; needs runtime verification | A | Add schema-drift guard + delay-model state tracking and event-driven replay support |
| Betfair support in-play delay FAQ | Runtime delay baseline (1-12s) and canonical `betDelay` retrieval points | Support article is descriptive and non-exhaustive by market/sport | A | Keep per-market runtime delay capture mandatory; prohibit static delay constants |
| Punting Form docs + Modeller product page | Concrete API surface (`/v2` endpoint families), token auth pattern, historical dataset scope and licensing boundaries | Entitlement constraints: personal-use tiers vs commercial terms; commercial details off-doc | A | Add provider-license gate and contract snapshot before production ingestion |
| NYRA CAW suspension relay (Equibase/BloodHorse) | Evidence of temporary rule suspension windows during tote upgrades | Secondary reporting, not venue-API contract | B | Track as policy-override signal and exclude from steady-state calibration by default |

## Data contract additions required (incremental, pass 7)

- `delay_model_state`:
- `market_id`, `active_models[]`, `effective_from_ts`, `effective_to_ts`, `source_channel`, `source_schema_version`, `observed_bet_delay_sec`.
- `schema_drift_event`:
- `provider`, `field_name`, `expected_type`, `observed_type`, `first_seen_ts`, `severity`, `auto_mitigation_applied`.
- `policy_override_incident`:
- `jurisdiction`, `track`, `rule_family`, `override_start_ts`, `override_end_ts`, `affected_pools`, `reason`, `source_url`.
- `provider_license_profile`:
- `provider`, `product_tier`, `personal_use_only_flag`, `commercial_license_required_flag`, `contract_status`, `contract_effective_from`.
- `provider_endpoint_catalog`:
- `provider`, `api_base_url`, `endpoint_family`, `auth_scheme`, `history_start_year`, `source_doc_url`.

## Open questions to resolve before implementation freeze (incremental, pass 7)

- How should we prioritize forum-announced rollout behavior vs official reference docs when they diverge for short periods (hard stop vs warning mode)?
- What minimum observation window confirms a delay-model transition is stable enough for model-training inclusion?
- Should policy-override windows be excluded entirely from calibration datasets, or modeled as a separate regime class?
- Which exact Punting Form commercial package terms are required for production use of point-in-time and historical Betfair-derived datasets?
- Do we need a separate legal-control gate for features trained on personally licensed data but deployed in commercial execution stacks?

## Ranked implementation backlog (delta, pass 7)

### P0 additions

1. Implement `delay_model_state_service` and wire `betDelayModels` into pre-trade execution context and replay snapshots.
2. Add `schema_drift_guard` with alerting + fail-safe parsing for delay-model fields during Betfair rollout changes.
3. Add `policy_override_incident` ingestion and enforce backtest exclusion/flagging for override windows.
4. Add provider-license hard gate (`personal_use_only` vs commercial contract state) before enabling non-Betfair feature feeds.
5. Extend collector tests with mixed-market cases where `betDelayModels` is absent on some markets and present on others.

### P1 additions

1. Build delay-model transition analytics (state dwell time, fill/slippage delta by model state).
2. Add semi-automated doc-watch for Betfair announcement threads and support-doc update timestamps.
3. Add provider endpoint-catalog linter that verifies docs-described endpoint/auth shape against integration configs.

## Sources for this update (pass 7)

- Betfair announcement: `betDelayModels` to `listMarketCatalogue` response (effective 12 Jan 2026): https://forum.developer.betfair.com/forum/developer-program/announcements/42703-betfair-api-release-betdelaymodels-to-listmarketcatalogue-response-12thjanuary2026
- Betfair announcements index (includes `betDelayModels` MarketFilter release + dynamic delay update threads): https://forum.developer.betfair.com/forum/developer-program/announcements
- Betfair developer profile activity stream (dated Feb 2026 dynamic-delay update excerpts): https://forum.developer.betfair.com/member/11-betfairdeveloperprogram
- Betfair support: in-play delay baseline and `betDelay` source fields: https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Equibase relay of NYRA CAW guardrail suspension note (Feb 6, 2026): https://cms.equibase.com/node/313508
- Punting Form API docs (`MeetingsList` reference): https://docs.puntingform.com.au/reference/getapi-v2-meetingslist
- Punting Form API docs (`Race Meeting` reference): https://docs.puntingform.com.au/reference/get-api-v2-race-meeting
- Punting Form Modeller product/licensing page: https://puntingform.com.au/products/modeller

## Incremental architecture decisions from this run (2026-03-29, pass 8)

- Decision: implement a `cross_channel_reconciler` that merges `MCM`, `OCM`, and settled-order snapshots through an internal event journal.
- Why: Betfair documents independent market/order stream production and explicit inability to deterministically match `OCM` and `MCM` messages.
- Decision: add a `settlement_backfill_guard` after runner-removal/void events.
- Why: Betfair support states these settlement-time transitions are not reflected in Order Stream updates.
- Decision: add stream bootstrap/reconnect state machine branches for `SEG_IMG`, `RESUB_DELTA`, and `img=true` replacement semantics.
- Why: Betfair support documents segmented initial images at large subscriptions and reconnect flows that can require full image replacement with conflated updates.
- Decision: add `transport_auth_preflight` checks before any live subscription.
- Why: Betfair stream requires SSL socket protocol (not WebSocket) and web app keys require bearer-token session values.
- Decision: expand track policy schema to include CAW definition threshold and retail-only pool controls.
- Why: NYRA primary release includes explicit CAW speed definition (>6 bets/sec) and retail-only pool scope that are not captured by cutoff timestamps alone.
- Decision: move provider entitlement control from provider-level to endpoint-level.
- Why: Punting Form docs show materially different tier/auth requirements across endpoints (`Starter+` vs `Modeller/commercial`).

## Provider comparison (incremental high-signal additions, pass 8)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Stream support (OCM/MCM, reconnect, segmentation, protocol/auth) | Concrete stream-operational semantics for channel independence, reconnect patching, segmentation thresholds, and transport/auth requirements | Support-layer behavior can evolve; requires runtime telemetry confirmation | A | Build cross-channel reconciler + reconnect state machine + protocol/auth preflight hard checks |
| NYRA official CAW guardrail release (2026-01-30) | Explicit CAW speed-threshold definition and pool-specific cutoff/retail-only scope | Venue-specific policy; requires ongoing override watch | A | Encode CAW policy as structured multi-field regime metadata (not single cutoff) |
| Punting Form endpoint docs (`Scratchings`, `Results`, `MeetingSectionals`) | Endpoint-level entitlement and auth boundaries plus timestamp/deduction availability | Commercial terms still required for production beyond documented tiers | A | Implement endpoint-granular entitlement matrix and feature degradation paths |
| Racing & Sports corporate provider page | Additional AU/global provider signal and RA-distributor claim for race-field distribution context | Marketing/corporate source; contract-level technical SLA still required | B | Keep as candidate provider; require contract + technical spec before rank promotion |

## Data contract additions required (incremental, pass 8)

- `cross_channel_reconcile_event`:
- `market_id`, `selection_id`, `channel_type(mcm|ocm|settled)`, `source_ts`, `ingest_ts`, `internal_event_id`, `reconcile_status`, `reconcile_lag_ms`.
- `stream_reconnect_event`:
- `connection_id`, `reconnect_ts`, `ct_mode`, `img_replace_flag`, `con_after_reconnect_flag`, `delta_apply_status`.
- `stream_bootstrap_profile`:
- `subscription_id`, `market_count`, `segmentation_triggered_flag`, `segment_count`, `bootstrap_duration_ms`.
- `transport_auth_profile`:
- `app_key_id`, `app_key_type`, `transport_protocol`, `auth_mode`, `preflight_passed_flag`, `failure_code`, `validated_ts`.
- `track_caw_policy_profile`:
- `jurisdiction`, `track`, `effective_from`, `effective_to`, `caw_speed_threshold_bets_per_sec`, `win_pool_cutoff_sec`, `other_pool_cutoff_sec`, `retail_only_pool_codes`.
- `provider_endpoint_entitlement`:
- `provider`, `endpoint_path`, `min_tier`, `commercial_required_flag`, `token_auth_required_flag`, `includes_timestamp_flag`, `includes_deduction_flag`, `effective_from`.

## Open questions to resolve before implementation freeze (incremental, pass 8)

- What deterministic join policy should we use when `MCM` and `OCM` sequences disagree in near-jump windows (time-priority, channel-priority, or settlement-priority)?
- What SLA should we enforce for settlement backfill completion after runner-removal/void events before PnL is considered final?
- At what subscription market count do we pre-emptively shard stream sessions to avoid segmentation-induced bootstrap delays?
- Should web-app-key and non-web-key collectors be physically separated to avoid accidental auth-mode regression?
- Which Punting Form endpoints are in-scope for Phase 1 if only Starter entitlement is available at launch?
- Can Racing & Sports provide machine-readable freshness/latency SLA language suitable for A-grade evidence, or should it remain a B-grade candidate?

## Ranked implementation backlog (delta, pass 8)

### P0 additions

1. Implement `cross_channel_reconciler` with deterministic internal event IDs across `MCM`, `OCM`, and settled-order snapshots.
2. Add settlement backfill job for runner-removal/void cases and block final PnL until reconciliation is complete.
3. Implement reconnect state machine handling `RESUB_DELTA`, `img=true` replacement, and post-reconnect conflation alarms.
4. Add stream transport/auth preflight checks (SSL socket only, bearer session for web app keys) as hard startup gates.
5. Extend policy schema with `caw_speed_threshold_bets_per_sec` and `retail_only_pool_codes` and wire into regime features.
6. Build endpoint-level provider entitlement matrix and enforce feature toggles based on endpoint tier/auth requirements.

### P1 additions

1. Add automated drift tests for cross-channel reconciliation lag distributions by market phase.
2. Add stream-sharding planner using observed segmentation incidence and bootstrap-duration telemetry.
3. Add provider-claims verification workflow to upgrade/downgrade evidence quality when contract/SLA docs are obtained.

## Sources for this update (pass 8)

- Betfair support: Market & Order Stream overview: https://support.developer.betfair.com/hc/en-us/articles/360000402291-Market-Order-Stream-API-How-does-it-work
- Betfair support: OCM/MCM matching limitations: https://support.developer.betfair.com/hc/en-us/articles/360000391312-How-can-I-match-OCM-and-MCM-messages-from-the-Stream-API
- Betfair support: void bets / runner-removal caveat in Stream API: https://support.developer.betfair.com/hc/en-us/articles/360000391492-How-are-void-bets-treated-by-the-Stream-API
- Betfair support: reconnect handling (`ct=RESUB_DELTA`, `img`, `con`): https://support.developer.betfair.com/hc/en-us/articles/360000391612-Market-Streaming-how-do-I-managed-re-connections
- Betfair support: segmentation behavior and threshold guidance: https://support.developer.betfair.com/hc/en-us/articles/360000402331-How-does-segmentation-work-benefits
- Betfair support: Stream protocol requirement (SSL socket, not WebSocket): https://support.developer.betfair.com/hc/en-us/articles/12937897844252-Does-the-Stream-API-allow-Web-Socket-connections
- Betfair support: bearer-token requirement for web app keys: https://support.developer.betfair.com/hc/en-us/articles/360000391432-Stream-API-Bearer-Token-Must-Be-Used-for-Web-App-Key
- NYRA official CAW guardrails release (2026-01-30): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Punting Form scratchings endpoint docs: https://docs.puntingform.com.au/reference/scratchings
- Punting Form meeting sectionals endpoint docs: https://docs.puntingform.com.au/reference/meetingsectionals
- Punting Form results endpoint docs: https://docs.puntingform.com.au/reference/results-1
- Racing & Sports enhanced information services page: https://racingandsports.company/enhanced-information-services/

## Incremental architecture decisions from this run (2026-03-29, pass 9)

- Decision: split execution identity into three explicit layers (`customerRef` retry key, `customerOrderRef` lifecycle key, `customerStrategyRef` attribution key).
- Why: Betfair docs explicitly state `customerRef` is short-window de-dupe and non-persistent, while strategy attribution is separately surfaced in stream/order views.
- Decision: add account-scoped `cancel_all_mutex` and instruction-budget validators in order-management gateway.
- Why: Betfair documents concurrent cancel-all rejection and hard request limits (`place` 200, `cancel` 60) that should fail fast client-side.
- Decision: build a two-ledger PnL service (`open_live_pnl` from `listMarketProfitAndLoss`, `settled_pnl` from `listClearedOrders`).
- Why: official endpoint scope is OPEN+ODDS only with silent non-ODDS exclusion, so a single PnL feed is structurally incomplete.
- Decision: introduce `jurisdiction_turnover_normalizer` for QLD profile logic and timezone-aware compliance windows.
- Why: QLD conditions include free bets in bets-taken definitions and anchor business-day interpretation to Brisbane.
- Decision: add `provider_coverage_snapshot` ingestion for candidate feeds.
- Why: The Racing API now exposes machine-readable AU coverage counts by state/course/year that can guide data-quality triage before contract execution.

## Provider comparison (incremental high-signal additions, pass 9)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `placeOrders`/`cancelOrders`/`listRunnerBook`/`listMarketProfitAndLoss` | New hard constraints on request limits, identifier semantics, strategy-level partitioning, and OPEN-only PnL scope | Requires stricter state-machine and reconciliation architecture to avoid silent misattribution | A | Implement identity split, cancel mutex, strategy-attribution telemetry, and dual-ledger PnL immediately |
| Racing Queensland FY26-27 conditions + authorised-operator registry | Explicit approved-supplier definitions, jurisdiction-specific turnover semantics, Brisbane business-day anchor, current operator-list snapshot | Jurisdiction-specific and versioned; periodic updates must be tracked | A | Add QLD normalization module and scheduled registry snapshots in compliance layer |
| The Racing API data coverage page | Quantified AU coverage inventory by state/course/year with add-on gating signal | Public product page, dynamic counts, no contractual SLA in source | B | Use as pre-contract coverage triage only; keep out of execution-critical feed ranking until SLA/rights docs are obtained |

## Data contract additions required (incremental, pass 9)

- `execution_identity_profile`:
- `bet_id`, `customer_ref`, `customer_ref_window_sec`, `customer_ref_persistent_flag`, `customer_order_ref`, `customer_strategy_ref`, `strategy_ref_len`.
- `order_gateway_limits`:
- `request_type(place|cancel)`, `instruction_count`, `instruction_limit`, `violated_flag`, `reject_reason`.
- `cancel_all_lock_event`:
- `account_id`, `market_id_nullable`, `lock_acquired_ts`, `lock_released_ts`, `queued_request_count`, `concurrent_reject_detected_flag`.
- `strategy_fill_snapshot`:
- `market_id`, `selection_id`, `customer_strategy_ref`, `matched_size`, `matched_price`, `snapshot_ts`, `source(listRunnerBook)`.
- `pnl_dual_ledger`:
- `market_id`, `market_type`, `open_live_pnl`, `settled_pnl`, `net_of_commission_flag`, `special_tariff_included_flag`, `asof_ts`.
- `jurisdiction_turnover_rule`:
- `jurisdiction`, `effective_from`, `effective_to`, `includes_free_bets_flag`, `includes_layoff_bets_flag`, `timezone_reference`, `business_day_definition`.
- `provider_coverage_snapshot`:
- `provider`, `region`, `state`, `course`, `year`, `result_count`, `add_on_required_flag`, `snapshot_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 9)

- Should `customerStrategyRef` taxonomy be centrally governed (fixed enums) or free-form per model strategy, given the 15-char cap?
- What is the fallback execution policy when a request exceeds Betfair instruction limits at runtime (split, queue, or hard reject)?
- Which dashboard should be authoritative for intraday performance decisions: open-live PnL or settled-ledger proxy with lag adjustments?
- How frequently should QLD approved-supplier/operator snapshots run to balance policy drift risk vs operational overhead?
- What minimum contractual evidence would promote The Racing API from `B` to `A` for provider ranking (latency SLA, rights, retention, audit terms)?

## Ranked implementation backlog (delta, pass 9)

### P0 additions

1. Implement `execution_identity_profile` and remove any lifecycle joins keyed only on `customerRef`.
2. Add pre-submit request-limit validators (`place<=200`, `cancel<=60`) and `cancel_all_mutex` orchestration.
3. Build dual-ledger PnL pipeline (`open_live_pnl` + `settled_pnl`) with explicit scope labels and reconciliation alerts.
4. Integrate `listRunnerBook` strategy partition telemetry for per-strategy fill/slippage analytics.
5. Implement QLD turnover-rule normalization and Brisbane-time business-day calendar support in compliance ETL.

### P1 additions

1. Add nightly provider-coverage snapshot ingest for candidate feeds and quality-threshold scoring by state/course/year.
2. Add execution-policy simulator for limit-overrun fallback strategies (split vs queue vs reject).
3. Build contract-readiness checklist gate for promoting `B` provider evidence into production feed ranking.

## Sources for this update (pass 9)

- Betfair `placeOrders`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair `cancelOrders`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687491/cancelOrders
- Betfair `listRunnerBook`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687847/listRunnerBook
- Betfair `listMarketProfitAndLoss`: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687667/listMarketProfitAndLoss
- Racing Queensland FY26-27 conditions comparison: https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf
- Racing Queensland authorised wagering service providers list (v36): https://www.racingqueensland.com.au/getmedia/e3fcb1e8-f81a-4166-82b3-53495b9a881e/20221212-List-of-Authorised-Wagering-Services-Providers-v36.pdf.aspx
- The Racing API data coverage page: https://www.theracingapi.com/data-coverage

## Incremental architecture decisions from this run (2026-03-29, pass 10)

- Decision: add an `app_key_governance_policy` module with workload-intent classification and key-type enforcement.
- Why: Betfair now explicitly documents that read-only use on live keys is not permitted and can lead to access restrictions/deactivation.
- Decision: add a `request_weight_planner` in market-data collectors before request dispatch.
- Why: Betfair support defines a hard `weight * market_count <= 200` constraint, non-additive projection combinations, and depth-based penalties for `exBestOffersOverrides`.
- Decision: add a first-class `au_wholesaler_lineage_registry` to provider onboarding and entitlement checks.
- Why: Racing Australia (2025-06-19) moved to a five-wholesaler framework under common agreement terms effective 2025-07-01, making wholesaler lineage a concrete compliance dimension.

## Provider comparison (incremental high-signal additions, pass 10)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: read-only API access policy (2026-03-06) | Explicit key-usage governance rule (live-key read-only usage not permitted), operational enforcement implications | Support-layer policy can evolve; must monitor updates | A | Enforce workload-key segregation and key-policy checks at startup/scheduler layers |
| Betfair support: Exchange API request-weight limits (updated 2025-09-09) | Concrete request-budget algebra and depth-scaling behavior for projection payloads | Tables/combination rules may change; requires config versioning | A | Implement request-weight planner + pre-dispatch validation + telemetry for `TOO_MUCH_DATA` near-misses |
| Racing Australia media release: Wholesaler Agreement framework (2025-06-19) | Primary-source list of authorised/approved wholesalers and framework start date (2025-07-01) | Media-release level source; still need contract-level specs per wholesaler | A | Require wholesaler-lineage capture for AU provider onboarding and entitlement audits |

## Data contract additions required (incremental, pass 10)

- `app_key_governance_profile`:
- `app_key_id`, `key_type(live|delayed)`, `workload_intent(execution|read_only_collection)`, `policy_violation_flag`, `policy_source_url`, `validated_ts`.
- `request_weight_plan`:
- `request_id`, `endpoint_name`, `market_ids_count`, `price_projection_combo`, `requested_depth`, `weight_product`, `max_allowed_weight_product`, `predicted_reject_flag`.
- `request_weight_reject_event`:
- `request_id`, `error_code`, `weight_product`, `market_ids_count`, `projection_combo`, `occurred_ts`.
- `au_wholesaler_lineage`:
- `provider_name`, `upstream_wholesaler_name`, `authorised_approved_flag`, `framework_effective_from`, `lineage_verified_ts`, `source_url`.
- `entitlement_audit_snapshot`:
- `provider_name`, `dataset_family`, `lineage_status(verified|unverified)`, `policy_framework_version`, `snapshot_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 10)

- Should research-only collectors always run on separate delayed-key accounts/projects, or can mixed-mode infrastructure be made safe with hard isolation controls?
- What default fallback should run when request-weight planning predicts an over-limit payload near jump (`split_by_market`, `reduce_depth`, or `defer`)?
- What evidence threshold is sufficient to mark AU provider lineage as "verified" when only upstream wholesaler statements are available?
- How frequently should Racing Australia wholesaler framework checks run (daily vs weekly) to catch authorised-list changes without noisy churn?

## Ranked implementation backlog (delta, pass 10)

### P0 additions

1. Implement `app_key_governance_policy` with hard failures for `live + read_only_collection` workloads.
2. Build `request_weight_planner` and block over-limit requests before dispatch; add adaptive split/depth fallback logic.
3. Add request-weight telemetry (`predicted_weight`, `actual_error`) and alert on repeated `TOO_MUCH_DATA` outcomes.
4. Stand up `au_wholesaler_lineage_registry` and require verified lineage metadata before enabling new AU provider feeds in production.
5. Add compliance job that snapshots RA wholesaler-framework source and flags lineage drift for active providers.

### P1 additions

1. Train collector-policy optimizer that balances depth, request cadence, and request-weight budget by market phase.
2. Add provider-onboarding checklist requiring `wholesaler_lineage` and entitlement audit artifacts for review sign-off.
3. Add incident playbook automation for key-policy violations (throttle, disable collector, notify operator).

## Sources for this update (pass 10)

- Betfair support: read-only API policy (published 2026-03-06): https://support.developer.betfair.com/hc/en-us/articles/25033076334748-What-is-read-only-Betfair-API-access
- Betfair support: data/request limits and weight rules (updated 2025-09-09): https://support.developer.betfair.com/hc/en-us/articles/115003864671-What-data-request-limits-exist-on-the-Exchange-API
- Racing Australia media release: Racing Materials distribution - Wholesaler Agreement (2025-06-19): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

## Incremental architecture decisions from this run (2026-03-29, pass 11)

- Decision: add a `market_visibility_guard` pre-check before market discovery, collector health, and incident escalation.
- Why: Betfair documents jurisdiction/IP-based market suppression that can mimic collector faults.
- Decision: make `historical_coverage_floor_enforcer` a hard dependency in training/backtest orchestration.
- Why: Betfair documents global historical data from April 2015 but AU/NZ availability only from October 2016.
- Decision: add a `competition_regime_calibrator` in price-blending and expected-value layers.
- Why: new peer-reviewed evidence shows favourite-longshot bias is strongly linked to market structure/competition, not only bettor psychology.
- Decision: upgrade approved-operator ingestion to `counterparty_segment_registry` with segment-aware controls.
- Why: Racing Victoria provides explicit approved-operator segmentation (Australian, Victorian-licensed, international) suitable for compliance and routing policy.

## Provider comparison (incremental high-signal additions, pass 11)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: market non-return / geo restrictions (2025-11-28) | Concrete legal-visibility causes for empty API responses; Singapore horse-racing AUS/NZ availability constraint | Support-doc layer; policy can change by jurisdiction | A | Add geo-eligibility checks and classify empty responses before outage escalation |
| Betfair support: historical-data coverage window (2025-12-02) | Explicit historical coverage floors (global Apr 2015, AU/NZ Oct 2016) | Support-doc layer; requires ongoing doc-watch | A | Enforce AU/NZ coverage floor in scheduler and experiment metadata |
| Oxford Economic Papers 2026 market-structure study | Peer-reviewed mechanism linking favourite-longshot bias to imperfect competition and market segment differences | Soccer-focused; transfer to AU horse markets requires empirical validation | A | Add structure-conditioned bias calibration and test transferability on AU race data |
| Racing Victoria approved WSP registry | Live counterparty segmentation across Australian/Victorian-licensed/international classes | Registry is dynamic; no direct feed SLA in the page | A | Build segment-aware counterparty registry snapshots and compliance routing rules |

## Data contract additions required (incremental, pass 11)

- `market_visibility_audit`:
- `request_ts`, `source_ip_region`, `endpoint`, `filter_hash`, `empty_response_flag`, `geo_restriction_suspected_flag`, `jurisdiction_rule_ref`.
- `historical_coverage_floor`:
- `provider`, `region`, `coverage_start_date`, `format_version`, `source_url`, `validated_ts`.
- `training_window_audit`:
- `experiment_id`, `region`, `requested_start_date`, `effective_start_date`, `coverage_floor_adjusted_flag`, `coverage_violation_count`.
- `competition_regime_profile`:
- `market_channel(exchange|fixed_odds)`, `margin_proxy`, `competition_tier`, `flb_risk_score`, `asof_ts`.
- `counterparty_segment_registry`:
- `jurisdiction`, `operator_name`, `segment`, `cross_border_flag`, `snapshot_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 11)

- What exact incident policy should fire when an endpoint returns empty markets but geo-visibility checks fail (hard pause vs degraded mode)?
- Should AU/NZ model benchmarking exclude all pre-2017 windows for stability, even though coverage starts in Oct 2016?
- Which measurable proxy should define `competition_tier` in horse-racing channels (overround, customer-limiting prevalence, liquidity depth)?
- How often should RV counterparty segmentation snapshots run to catch approval churn without excessive ops noise?
- Do we treat cross-border counterparties as separate risk buckets in execution-routing simulations from phase 1 or phase 2?

## Ranked implementation backlog (delta, pass 11)

### P0 additions

1. Implement `market_visibility_guard` with geo/jurisdiction preflight and empty-response classification.
2. Enforce `historical_coverage_floor_enforcer` (`AU/NZ >= 2016-10-01`) in all backfill and training schedulers.
3. Add `training_window_audit` outputs to experiment reports and fail runs with unapproved coverage-floor violations.
4. Add `counterparty_segment_registry` snapshots from RV approved-operator source and wire into entitlement checks.
5. Add dashboard alerts separating geo-restriction-empty responses from transport/collector failures.

### P1 additions

1. Build `competition_regime_calibrator` prototype and test structure-conditioned bias adjustments against market-only baseline.
2. Quantify AU horse-market transferability of OEP 2026 structural-bias mechanism using held-out NSW/VIC windows.
3. Add segment-aware compliance workload forecasting for international vs domestic counterparties.

## Sources for this update (pass 11)

- Betfair support: Why markets may not appear in API responses (updated 2025-11-28): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-API-response
- Betfair support: Historical Data service coverage (updated 2025-12-02): https://support.developer.betfair.com/hc/en-us/articles/360002407732-What-data-is-provided-by-the-Historical-Data-service
- Oxford Economic Papers: Market structure and prices in online betting markets (Vol 78, Issue 1, Jan 2026): https://academic.oup.com/oep/article/78/1/90/8244336
- Racing Victoria approved wagering service providers registry: https://www.racingvictoria.com.au/wagering/wagering-service-providers

## Incremental architecture decisions from this run (2026-03-29, pass 12)

- Decision: add a `stream_delta_cache_engine` with strict delta semantics (`size=0` delete, `img=true` replace, nullable-field omission handling).
- Why: Betfair support defines these as canonical cache rules; incorrect handling silently corrupts ladder state and derived features.
- Decision: add a `stream_anomaly_sanitizer` in ingestion and replay (`Infinity` guard, penultimate zeroed-`rc` settlement artefact filter).
- Why: Betfair documents known virtual-stream and settlement artefacts that can pollute execution logic and model labels.
- Decision: add a `heartbeat_cursor_supervisor` with default-aware heartbeat configuration and inactivity-gap monitoring.
- Why: server heartbeat cadence is traffic-dependent and carries `clk`; cursor continuity and inactivity telemetry are required for deterministic replay.
- Decision: add a `qld_submission_artifact_registry` plus `mbl_scope_policy` module.
- Why: Racing Queensland now publishes multiple channel-specific submission artefacts and explicit minimum-bet-limit exclusions that must be encoded in compliance-aware routing.

## Provider comparison (incremental high-signal additions, pass 12)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support stream edge-case docs (`size=0`, heartbeat defaults, `Infinity`, penultimate zeroed `rc`) | Concrete parsing and cache-state rules plus known stream artefacts that affect replay/execution integrity | Support-doc layer; must be validated against live telemetry | A | Implement cache-semantics engine and anomaly sanitizer before scaling any live-like automation |
| Racing Queensland race-information + MBL pages (2025-07 authority period artefacts) | Current condition/submission artefact index (standard/on-course/FTP) and explicit MBL scope/exclusion behavior | Artefacts can change by authority period; source files include mixed formats | A | Build artefact-registry ingestion and MBL-aware policy gate keyed by effective date |

## Data contract additions required (incremental, pass 12)

- `stream_delta_audit`:
- `connection_id`, `market_id`, `selection_id`, `img_flag`, `size_zero_remove_count`, `nullable_omitted_field_count`, `applied_clk`, `applied_ts`.
- `stream_anomaly_event`:
- `connection_id`, `market_id`, `anomaly_type(infinity_size|penultimate_zero_rc)`, `virtual_mode_flag`, `detected_ts`, `sanitizer_action`, `source_url`.
- `stream_heartbeat_audit`:
- `connection_id`, `heartbeat_ms_configured`, `heartbeat_ms_effective`, `inactivity_triggered_flag`, `clk`, `heartbeat_ts`, `gap_since_last_message_ms`.
- `qld_submission_artifact_registry`:
- `artifact_name`, `artifact_type`, `effective_from`, `effective_to`, `format`, `source_url`, `sha256`, `ingested_ts`.
- `qld_mbl_policy_profile`:
- `effective_from`, `effective_to`, `off_course_fixed_odds_only_flag`, `exclude_exchange_flag`, `exclude_multi_bet_flag`, `exclude_retail_flag`, `complaint_window_days`.

## Open questions to resolve before implementation freeze (incremental, pass 12)

- Should `Infinity` payloads trigger hard fail (session restart) or soft sanitize with anomaly tagging when they occur near jump?
- What deterministic rule should classify a penultimate zeroed-`rc` frame as settlement artefact vs genuine liquidity collapse in thin markets?
- Do we enforce a maximum tolerated heartbeat inactivity gap before pausing execution in that market/session?
- Which QLD submission artefacts (standard vs on-course) map to our Phase 1 operating profile, and how will schema drift be detected automatically?
- Should QLD MBL exclusions be represented as pre-trade route blockers or post-trade compliance checks, or both?

## Ranked implementation backlog (delta, pass 12)

### P0 additions

1. Implement `stream_delta_cache_engine` with invariant tests for `size=0` deletes and `img=true` replacement behavior.
2. Build `stream_anomaly_sanitizer` for `Infinity` and penultimate zeroed-`rc` handling with incident metrics.
3. Add `heartbeat_cursor_supervisor` and execution pause policy for excessive inactivity gaps.
4. Create `qld_submission_artifact_registry` ingestion job (effective-date tracking + checksum drift alerts).
5. Implement `qld_mbl_policy_profile` and wire exclusions into route-selection guardrails.

### P1 additions

1. Add anomaly-conditioned training filters so affected stream windows are excluded or downweighted by policy.
2. Add policy-diff automation for QLD submission artefacts (template/definition/FTP/on-course file changes).
3. Build compliance dashboards for MBL-scope events and complaint-window auditability.

## Sources for this update (pass 12)

- Betfair support: runner-change `size=0` handling and delta-cache semantics: https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-to-I-handle-runner-changes-with-size-0
- Betfair support: heartbeat/conflation behavior and default server heartbeat interval: https://support.developer.betfair.com/hc/en-us/articles/360000402611-Market-Streaming-How-do-the-Heartbeat-and-Conflation-requests-work
- Betfair support: `Infinity` size virtual-stream edge case: https://support.developer.betfair.com/hc/en-us/articles/360003061798-Why-am-I-receiving-Infinity-size-from-the-Streaming-API
- Betfair support: penultimate zeroed `rc` settlement artefact: https://support.developer.betfair.com/hc/en-us/articles/4802553453457-Why-does-the-penultimate-rc-have-all-runner-volumes-of-Price-Points-Traded-Available-To-Back-Lay-set-to-zero
- Racing Queensland race information page (July 2025 condition/submission artefact index): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland General Conditions PDF (effective 2025-07-01 to 2027-06-30): https://www.racingqueensland.com.au/getmedia/d3bc5b41-5150-483f-b0b9-ede6f4733ba4/25-0610-General-Conditions-for-Race-Information-Authority-1-July-2025-30-June-2027-FINAL.pdf
- Racing Queensland Minimum Bet Limits page (scope/exclusions/complaint window): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/minimum-bet-limits

## Incremental architecture decisions from this run (2026-03-29, pass 13)

- Decision: add a `market_view_parity_controller` in ingestion and replay (`virtualise`, rollup, website-auth parity metadata).
- Why: Betfair documents deterministic website/API divergence drivers beyond transport latency, so parity diagnostics must be explicit.
- Decision: add a `grade_conditioned_overround_service` in expected-value and execution-threshold layers.
- Why: published Betfair microstructure evidence indicates overround is structurally variable (including race-grade effects), not a constant friction.
- Decision: add a `provider_operational_health_gate` for non-primary augmentation feeds.
- Why: The Racing API publishes incident and uptime telemetry showing schema/range/default changes and endpoint outages that can corrupt training/execution if untreated.

## Provider comparison (incremental high-signal additions, pass 13)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: website vs API parity FAQ | Explicit display-mode causes of price mismatch (`virtualise`, logged-out delay, stake rollup controls) | Support-doc layer; behavior can evolve with UI/API defaults | A | Add market-view parity metadata and require projection-auth-rollup alignment in diagnostics |
| Oxford Handbook chapter on Betfair exchange overround | Empirical overround structure evidence (2,184 UK races; race-grade relationship) and microstructure framing | UK sample and historical period; transferability to AU needs local validation | A | Introduce grade-conditioned overround baselines and validate on NSW/VIC windows |
| The Racing API status + coverage pages | Machine-readable uptime/incident telemetry and dynamic coverage inventories for provider-risk monitoring | Product/site telemetry is not a contractual SLA or rights grant | B | Keep as augmentation-only feed until reliability + entitlement evidence is promoted |

## Data contract additions required (incremental, pass 13)

- `market_view_parity_audit`:
- `snapshot_ts`, `market_id`, `virtualise_flag`, `price_projection`, `rollup_model`, `rollup_limit`, `website_auth_state`, `parity_check_status`.
- `exchange_overround_baseline`:
- `market_id`, `race_grade`, `field_size`, `sp_overround`, `expected_overround`, `overround_residual`, `baseline_version`.
- `provider_operational_snapshot`:
- `provider`, `component`, `uptime_pct_30d`, `snapshot_ts`, `source_url`.
- `provider_incident_log`:
- `provider`, `incident_id`, `component`, `incident_type`, `started_ts`, `resolved_ts`, `impact_level`, `source_url`.
- `provider_query_policy`:
- `provider`, `endpoint_group`, `default_range_days`, `max_range_days`, `effective_from`, `observed_change_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 13)

- Should parity diagnostics compare against website-equivalent view on every snapshot, or only on drift/outlier windows to reduce collector load?
- What is the minimum sample size needed before enabling grade-conditioned overround baselines in live staking controls?
- Do we enforce hard execution blocks when augmentation-provider incident status is active, or soft downweight-only behavior?
- What threshold should promote a `B` provider (status-page telemetry only) to `A` for production-critical dependence?
- Which team owns review/approval when provider query-range defaults change and historical extraction assumptions become stale?

## Ranked implementation backlog (delta, pass 13)

### P0 additions

1. Implement `market_view_parity_controller` and attach parity metadata to all stored snapshots.
2. Add `market_view_parity_audit` checks to incident triage so UI/API divergence is classified before collector-fault alerts.
3. Build `exchange_overround_baseline` tables and initial grade-conditioned thresholds in paper-execution only.
4. Add `provider_operational_snapshot` + `provider_incident_log` ingestion for The Racing API and gate its features behind health checks.
5. Add query-policy drift monitoring (`default_range_days`, `max_range_days`) to historical extraction orchestrators.

### P1 additions

1. Validate transferability of grade-overround effects on AU horse markets; compare against constant-friction baseline.
2. Add automated parity replay tests that vary `virtualise` and `rollup` settings to prove deterministic reconstruction.
3. Build provider-reliability-aware feature weighting in champion-challenger evaluation.

## Sources for this update (pass 13)

- Betfair support: website vs API price differences (`virtualise`, logged-out delay, rollup controls): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Oxford Handbook chapter: Betfair exchange overround microstructure evidence: https://academic.oup.com/edited-volume/36333/chapter/318722302
- The Racing API status page (component uptime + status): https://status.theracingapi.com/
- The Racing API previous incidents: https://status.theracingapi.com/incidents
- The Racing API data coverage inventory: https://www.theracingapi.com/data-coverage

## Incremental architecture decisions from this run (2026-03-29, pass 14)

- Decision: add a `betfair_transaction_cost_governor` in execution policy and order orchestration.
- Why: Betfair transaction-charge rules add behavior-dependent monetary costs (hourly qualifying-transaction thresholds, failed-transaction penalties, commission offsets) beyond API request limits.
- Decision: add a `nsw_fee_regime_engine` with category-ordered threshold allocation and related-group handling.
- Why: NSW 2025-26 conditions require meeting-class and TDO-specific rate treatment plus shared exempt-threshold allocation across related operators.
- Decision: add an `rv_integrity_realtime_interface` and `rv_supplier_lineage_gate` in entitlement/compliance controls.
- Why: RV standard conditions include explicit approved-supplier definitions and real-time integrity information access requirements that can affect operational readiness.

## Provider comparison (incremental high-signal additions, pass 14)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Charges + transaction-counting FAQ | Official transaction-charge algebra, qualifying transaction semantics, and account-group aggregation rules | Terms/policy can change and are account-jurisdiction sensitive | A | Add transaction-cost simulation and charge-aware throttling to execution engine |
| Racing NSW Standard Conditions (2025-26) | Detailed fee rates by meeting class and TDO category; explicit related-group threshold allocation rules | NSW-specific policy with annual revisions; requires effective-date versioning | A | Build NSW-specific fee engine with group-threshold allocator and category-order logic |
| Racing Victoria Standard Conditions + Race Fields Policy | Approved-supplier whitelist and real-time integrity data-access obligations | Jurisdiction-specific compliance pathways; operational/legal coordination required | A | Enforce supplier-lineage gating and build event-driven integrity-access workflow |

## Data contract additions required (incremental, pass 14)

- `betfair_transaction_cost_profile`:
- `account_group_id`, `hour_start_ts`, `qualifying_txn_count`, `failed_txn_count`, `failed_cancel_count`, `commission_generated_gbp`, `estimated_txn_charge_gbp`, `net_txn_charge_gbp`.
- `betfair_transaction_risk_signal`:
- `strategy_id`, `window_start_ts`, `txn_rate_per_min`, `charge_trigger_proximity`, `cost_penalty_applied_flag`.
- `nsw_fee_regime_snapshot`:
- `effective_from`, `meeting_class`, `bet_type`, `fee_rate_pct`, `source_url`, `policy_version_hash`.
- `nsw_group_threshold_allocation`:
- `group_id`, `financial_year`, `threshold_total_aud`, `member_entity`, `allocated_threshold_aud`, `allocation_reason`.
- `rv_supplier_lineage_validation`:
- `provider_name`, `upstream_supplier_name`, `whitelist_match_flag`, `verified_ts`, `source_url`.
- `rv_integrity_access_event`:
- `request_id`, `request_ts`, `requested_scope`, `safeguards_ready_flag`, `privacy_update_status`, `dsa_status`, `delivery_mode`, `completed_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 14)

- What hard cap should trigger execution degradation when projected hourly transaction count approaches Betfair chargeable ranges?
- Should transaction-cost penalties be optimized per strategy, or enforced as a single account-group governor?
- How will we map NSW meeting-class and TDO fee categories into pre-trade expected-value calculations when market metadata is incomplete near jump?
- What legal/operational evidence is required before marking an upstream data source as RV approved-supplier compliant?
- Which team owns SLA and incident response for RV real-time integrity data-access requests once enabled?

## Ranked implementation backlog (delta, pass 14)

### P0 additions

1. Implement `betfair_transaction_cost_governor` with hourly transaction forecasting and pre-trade cost penalties.
2. Add `betfair_transaction_cost_profile` ETL and monitoring (qualifying transactions, failed transactions, commission-offset effect).
3. Build `nsw_fee_regime_engine` with class/TDO-specific fee calculations and related-group threshold allocation logic.
4. Add `rv_supplier_lineage_gate` to block non-whitelisted upstream suppliers for VIC-dependent features.
5. Build `rv_integrity_realtime_interface` scaffolding (request intake, safeguard checks, privacy/DSA state machine).

### P1 additions

1. Backtest charge-aware execution policies to quantify ROI/turnover trade-off under transaction-cost penalties.
2. Add policy-version replay tests for NSW fee-rule changes across approval periods.
3. Create compliance dashboard for RV integrity-request lifecycle and supplier-lineage verification status.

## Sources for this update (pass 14)

- Betfair charges terms: https://www.betfair.com/aboutUs/Betfair.Charges/
- Betfair transaction-counting FAQ (2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/20029343399836-Transaction-Charge-how-are-transactions-counted
- Racing NSW Standard Conditions (effective 1 July 2025): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Marked-Up-Version-Effective-1-July-2025.pdf
- Racing Victoria Race Fields Policy page: https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria Standard Conditions (effective 1 March 2025): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f

## Incremental architecture decisions from this run (2026-03-29, pass 16)

- Decision: add a `runner_metadata_entitlement_normalizer` between market discovery and feature store materialization.
- Why: Betfair `RUNNER_METADATA` contains high-value horse fields, but some attributes (for example `ADJUSTED_RATING`) are entitlement-gated and cannot be treated as ordinary missing data.
- Decision: add a `pool_linkage_regime_tracker` in policy/compliance and simulation layers.
- Why: ACCC documents two-year authorisation windows for SuperTAB participation agreements, so tote-linkage assumptions are explicitly expiry-bound.
- Decision: add a `ra_monthly_kpi_ingestor` and wire it into provider health gating.
- Why: Racing Australia monthly service reports show within-year KPI variance (timeliness and uptime) that annual aggregates can mask.

## Provider comparison (incremental high-signal additions, pass 16)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `listMarketCatalogue` (`RUNNER_METADATA`) | Structured horse-level metadata fields (`DAYS_SINCE_LAST_RUN`, `STALL_DRAW`, `OFFICIAL_RATING`, etc.) and reserve-runner semantics | Field availability can be entitlement-tier dependent; metadata may vary by market/region | A | Add entitlement-aware metadata ingestion and stateful reserve-runner handling |
| ACCC authorisation update (Tabcorp-RWWA, Jan 2025) | Primary regulatory signal for SuperTAB participation linkage and explicit two-year authorisation horizon | Regulatory determinations are revisable/renewable; jurisdiction and parties specific | A | Track authorisation validity windows and treat pool-linkage assumptions as time-bounded |
| Racing Australia monthly service report (Apr 2025) | Monthly KPI telemetry for uptime and racing-material release timeliness | Report format can change; one-month snapshots require rolling aggregation | A | Build monthly provider reliability index and gate latency-sensitive features by KPI health |

## Data contract additions required (incremental, pass 16)

- `runner_metadata_entitlement_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `field_name`, `field_value`, `entitled_flag`, `account_key_type`, `source_url`.
- `runner_state_transition`:
- `market_id`, `selection_id`, `state_type(active|reserve|withdrawn)`, `transition_ts`, `source_url`.
- `pool_linkage_regime`:
- `authority`, `parties`, `pool_name`, `granted_date`, `expiry_date`, `term_years`, `reference_url`, `status`.
- `operator_licence_timeline`:
- `operator`, `jurisdiction`, `licence_start_date`, `licence_term_years`, `effective_to`, `source_url`.
- `ra_monthly_service_kpi`:
- `report_month`, `service_name`, `metric_name`, `target_value`, `actual_value`, `variation_value`, `traffic_light_status`, `source_pdf_url`.
- `provider_reliability_index`:
- `provider`, `month`, `uptime_score`, `timeliness_score`, `combined_score`, `execution_gate_state`.

## Open questions to resolve before implementation freeze (incremental, pass 16)

- Should entitlement-gated Betfair fields be imputed separately by account tier, or excluded entirely from cross-account model training?
- What threshold and lookback should trigger a hard execution downgrade from monthly RA KPI deterioration?
- Do we treat authorisation-expiry proximity as a continuous risk score or a hard phase-switch in tote-linkage simulations?
- How should reserve-runner state transitions be represented in point-in-time feature snapshots to avoid leakage?
- Which owner should monitor and approve ACCC/public-register regime updates before deployment windows?

## Ranked implementation backlog (delta, pass 16)

### P0 additions

1. Implement `runner_metadata_entitlement_normalizer` with explicit entitlement/missingness semantics.
2. Add reserve-runner state machine handling (`Reserve` label, withdrawal transition, point-in-time purging).
3. Build `pool_linkage_regime_tracker` with authorisation start/expiry checks and simulation hooks.
4. Ingest RA monthly KPI PDFs and compute `provider_reliability_index` for execution gating.
5. Add compliance alerting for upcoming authorisation expiry windows affecting tote-linkage assumptions.

### P1 additions

1. Backtest entitlement-aware vs naive-missing metadata features for calibration and CLV impact.
2. Add stress tests around linkage-regime boundary windows (`pre-expiry`, `renewal gap`, `post-renewal`).
3. Build rolling monthly reliability trend dashboards with trigger policy tuning.

## Sources for this update (pass 16)

- Betfair `listMarketCatalogue` (`RUNNER_METADATA` schema): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687517/listMarketCatalogue
- ACCC media update (Tabcorp-RWWA SuperTAB authorisation, 15 Jan 2025): https://www.accc.gov.au/about-us/news/media-updates/accc-grants-authorisation-for-tabcorp-and-racing-and-wagering-western-australia-to-extend-agreement
- Racing Australia Monthly Service Standard Performance Report (April 2025): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-April-2025.pdf

## Incremental architecture decisions from this run (2026-03-29, pass 17)

- Decision: add a `betfair_currency_floor_validator` in pre-trade order construction and backtest replay.
- Why: Betfair currency parameters impose deterministic min-stake/min-liability/min-payout constraints by account currency that can invalidate otherwise valid pricing decisions.
- Decision: add an `rv_submission_contract_enforcer` with `daily_file_scheduler`, `daily_ledger_scheduler`, and immutable `epwmb_method_registry`.
- Why: RV 2025/26 guide specifies strict file conventions, 9am next-day submission obligations, and approval-period method locking for multi-leg allocation.
- Decision: add an `nsw_bet_type_policy_gate` ahead of product routing.
- Why: NSW prohibited/conditional bet-type taxonomy is explicit and should block ineligible constructs pre-trade.
- Decision: upgrade `ra_monthly_kpi_ingestor` to include report rollforward and system-level decomposition.
- Why: December 2025 RA report shows asymmetric reliability across systems and process metrics, which should directly influence provider-health gates.

## Provider comparison (incremental high-signal additions, pass 17)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Additional Information (currency parameters) | Per-currency minimum bet size, BSP liability, and payout floors for order validity | Values can differ by account currency and policy updates | A | Add currency-floor validation in both live execution and simulation |
| Racing Victoria Guide to Provision of Information 2025/26 | Daily/ledger submission SLA mechanics, file naming contracts, and EPWMB method constraints | Operational/legal artifact with periodic revision windows | A | Implement submission-contract enforcer and immutable method registry |
| Racing NSW prohibited bet-types schedule | Product-level prohibited vs conditional bet taxonomy under NSW conditions | Jurisdiction-specific and document-versioned | A | Build NSW product-policy gate and qualifier-aware product templates |
| Racing Australia monthly report (Dec 2025) | Fresh month-level system uptime + process timeliness evidence for reliability calibration | Snapshot month; needs rolling-window context | A | Roll monthly KPI ingestion forward and gate latency-sensitive features by trend |

## Data contract additions required (incremental, pass 17)

- `betfair_currency_floor_profile`:
- `account_currency`, `min_bet_size`, `min_bsp_liability`, `min_bet_payout`, `effective_from`, `source_url`, `source_revision_hash`.
- `order_floor_validation_event`:
- `strategy_id`, `market_id`, `selection_id`, `candidate_stake`, `currency`, `violated_floor_type`, `adjusted_stake`, `blocked_flag`, `event_ts`.
- `rv_submission_contract`:
- `file_type`, `naming_pattern`, `deadline_local_time`, `designated_wsp_only_flag`, `effective_from`, `effective_to`, `source_url`.
- `rv_submission_event`:
- `wsp_code`, `file_type`, `result_date`, `submitted_ts`, `expected_deadline_ts`, `sla_breach_flag`, `ingest_status`.
- `rv_epwmb_method_registry`:
- `wsp_code`, `approval_period`, `method_option`, `method_locked_flag`, `notified_ts`, `source_url`.
- `nsw_bet_type_policy`:
- `bet_type`, `policy_status`, `qualifier_rule`, `effective_from`, `effective_to`, `source_url`, `policy_hash`.
- `order_policy_gate_event`:
- `jurisdiction`, `bet_type`, `allowed_flag`, `block_reason`, `override_ticket_id`, `decision_ts`.
- `ra_monthly_system_kpi`:
- `report_month`, `system_name`, `target_uptime_pct`, `actual_uptime_pct`, `unplanned_downtime_minutes`, `variation_pct`, `source_pdf_url`.
- `ra_monthly_process_kpi`:
- `report_month`, `process_name`, `target_pct`, `actual_pct`, `delta_pct`, `emergency_context_flag`, `source_pdf_url`.

## Open questions to resolve before implementation freeze (incremental, pass 17)

- Should currency-floor normalization happen before or after strategy-level stake clipping so attribution remains stable across currencies?
- Do we enforce hard order rejection when RV submission-contract checks fail, or allow delayed ingest with explicit degraded-mode flags?
- How should NSW conditional bet-type qualifier logic be represented: static rule templates or executable validation DSL?
- What rolling-window length should drive RA KPI health gating (3, 6, or 12 months) for provider reliability decisions?
- Who owns EPWMB method-change governance when an approval period renews and a WSP switches option?

## Ranked implementation backlog (delta, pass 17)

### P0 additions

1. Implement `betfair_currency_floor_validator` and block/auto-adjust below-floor stakes before submit.
2. Add `betfair_currency_floor_profile` ingestion and versioned currency-map checks in replay/backtest jobs.
3. Build `rv_submission_contract_enforcer` for daily/ledger naming + 9am deadline validation.
4. Implement `rv_epwmb_method_registry` and enforce approval-period method immutability in allocation ETL.
5. Add `nsw_bet_type_policy_gate` to pre-trade product construction with qualifier-aware checks.

### P1 additions

1. Add rolling RA monthly KPI trend scoring and wire into provider health gate thresholds.
2. Build dashboards for RV submission SLA breaches and NSW policy-gate rejection distributions.
3. Run scenario tests on currency-floor-induced strategy drift across AUD and non-AUD account profiles.

## Sources for this update (pass 17)

- Betfair Additional Information (currency parameters): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2691053/Additional+Information
- Racing Victoria Guide to Provision of Information 2025/26: https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf?v=09a420bf
- Racing NSW prohibited/conditional bet-type schedule: https://www.racingnsw.com.au/wp-content/uploads/BET-TYPES-NOT-PERMITTED-ON-NSW-THOROUGHBRED-AS-PER-RACING-NSW-RACE-FIELDS-STANDARD-CONDITIONS.pdf
- Racing Australia Monthly Service Standard Performance Report (December 2025): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-December-2025.pdf

## Incremental architecture decisions from this run (2026-03-29, pass 18)

- Decision: add a `market_definition_version_reconciler` to stream ingestion and replay.
- Why: Betfair Stream documents duplicate initial-image states during event migration and requires highest-version retention logic to avoid cache contamination.
- Decision: add an `authorisation_timeline_window_engine` for pooled-liquidity assumptions.
- Why: ACCC register data for SuperTAB linkage includes explicit interim and final windows with exact effective dates through 15 August 2026.
- Decision: add an `ra_publication_lag_monitor` and `ra_process_reliability_gate`.
- Why: RA's index/report artifacts now show January 2026 publication and process-level KPI drift (nominations below target while uptime remains high), so health gating must separate process reliability from infrastructure uptime.

## Provider comparison (incremental high-signal additions, pass 18)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange Stream API (`MarketDefinition` + known issues) | Version/change semantics, market-level commission and regulator fields, documented migration/settlement edge cases | Confluence docs can evolve; implementation must tolerate schema drift | A | Build version-aware dedup and artifact filtering before feature materialization |
| ACCC authorisations register (Tabcorp VIC AA1000676-1) | Exact lodged/interim/final/expiry timeline for SuperTAB-RWWA linkage | Register snapshots may update with renewals or new applications | A | Implement timeline-window state machine and expiry-bound alerts |
| Racing Australia PerformanceReport index + Jan 2026 monthly report | Publication coverage telemetry plus fresh process/system KPI evidence | Monthly cadence; reported artifacts can lag real-time operations | A | Add publication-lag monitoring and process-specific reliability gating |

## Data contract additions required (incremental, pass 18)

- `betfair_market_definition_snapshot`:
- `capture_ts`, `market_id`, `event_id`, `version`, `market_base_rate`, `regulators`, `suspend_time`, `cross_matching_flag`, `bsp_reconciled_flag`, `source_url`.
- `betfair_stream_known_issue_event`:
- `market_id`, `issue_type(event_migration_duplicate|settlement_zero_traded_volume)`, `detected_ts`, `version_kept`, `source_url`.
- `pool_linkage_authorisation_timeline`:
- `register_id`, `application_lodged_date`, `interim_authorisation_date`, `final_determination_date`, `authorisation_end_date`, `window_state`, `source_url`.
- `pool_linkage_authorisation_reference`:
- `register_id`, `prior_cycle_reference_id`, `relationship_type(reauthorisation|supersedes)`.
- `ra_report_publication_index`:
- `capture_ts`, `financial_year_label`, `report_month_label`, `report_url`, `latest_month_published`, `publication_gap_months`.
- `ra_process_reliability_signal`:
- `report_month`, `process_name`, `target_pct`, `actual_pct`, `delta_pct`, `gate_state`.

## Open questions to resolve before implementation freeze (incremental, pass 18)

- Should `market_definition_version_reconciler` run before or after stream conflation handling so duplicate-migration cleanup is deterministic?
- What is the hard cutoff behavior for pooled-liquidity models if authorisation enters a post-expiry window without renewal evidence?
- How many months of RA process KPI deltas are needed before triggering hard execution downgrades versus soft feature downweighting?
- Should `marketBaseRate` be treated as a direct EV cost input per market or absorbed in a jurisdiction-level commission model with reconciliation checks?
- Who owns operational sign-off when RA publication index lags expected monthly cadence (data engineering, compliance, or strategy ops)?

## Ranked implementation backlog (delta, pass 18)

### P0 additions

1. Implement `market_definition_version_reconciler` with highest-version retention and migration-duplicate suppression.
2. Add settlement-artifact filtering for zero traded-volume transition events in stream-derived liquidity features.
3. Build `authorisation_timeline_window_engine` for ACCC lifecycle states (`pre_interim`, `interim`, `final`, `expired`).
4. Add expiry-driven alerts keyed to the current documented SuperTAB-RWWA end date (15 August 2026).
5. Build `ra_publication_lag_monitor` and gate process-sensitive features when publication gap or nominations reliability breaches thresholds.

### P1 additions

1. Backtest version-aware dedup vs naive cache handling to quantify impact on late-window feature stability and CLV.
2. Run scenario analysis for pooled-liquidity assumption breaks across interim/final/expired authorisation windows.
3. Add dashboards separating RA system uptime from process timeliness reliability to prevent false provider-health confidence.

## Sources for this update (pass 18)

- Betfair Exchange Stream API (`MarketDefinition` fields and known issues): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange+Stream+API
- ACCC public register (Tabcorp VIC Pty Ltd, AA1000676-1): https://www.accc.gov.au/public-registers/authorisations-and-notifications-registers/authorisations-register/tabcorp-vic-pty-ltd
- Racing Australia Monthly Service Standard Performance index: https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx
- Racing Australia Monthly Service Standard Performance Report (January 2026): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-January-2026.pdf
- Racing Australia Monthly Service Standard Performance Report (November 2025): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-November-2025.pdf

## Incremental architecture decisions from this run (2026-03-29, pass 19)

- Decision: add a `stream_settlement_reconciler` as a mandatory post-stream state finalizer.
- Why: Betfair documents runner-removal void/lapse transitions that are not reflected through Order Stream and require settlement-side reconciliation.
- Decision: add a `stream_causality_join_guard` that treats OCM and MCM as independently ordered channels.
- Why: Betfair support states there is no guaranteed ordering and no deterministic matching key between OCM and MCM messages.
- Decision: add a `delta_cache_integrity_guard` for stream parser safety.
- Why: Betfair delta semantics (`size=0` remove, `img=true` replacement) plus virtual `Infinity` edge-cases can corrupt ladder state if parser handling is permissive.
- Decision: add a `provider_registry_freshness_scorer` in policy/compliance control-plane.
- Why: NSW and VIC approval artifacts show materially different freshness patterns, and RA monthly index cadence can lag expected periods.

## Provider comparison (incremental high-signal additions, pass 19)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Stream support articles (void handling + OCM/MCM matching) | Explicit stream blind spots and causality constraints for order/market reconciliation | Support-layer docs; behavior must be validated in production telemetry | A | Implement settlement reconciler and non-causal join model before scaling automation |
| Betfair stream parser guidance (`size=0`, `img=true`, virtual `Infinity`) | Concrete delta/update semantics and known virtual-stream edge-case | Virtual path anomalies can contaminate feature labels if not isolated | A | Add parser invariants, cache-rebuild workflow, and anomaly quarantine controls |
| Racing NSW approval page + linked 2020-21 PDF | Claimed regular updates plus observable dated artifact labeling/effective date | Potential stale registry artifacts and naming/version ambiguity | A | Add source-freshness scoring and manual compliance escalation for stale/ambiguous registries |
| Racing Victoria approved WSP page | Current approved-operator list in live page format | No single explicit effective-date stamp in page body | A | Use as high-confidence reference but still snapshot with freshness metadata |
| Racing Australia performance index | Publication-cadence telemetry for monthly provider KPI reports | Reporting lag may vary; absence of month entry is indirect operational signal | A | Add publication-gap monitor and confidence penalties when expected month artifacts are missing |

## Data contract additions required (incremental, pass 19)

- `stream_settlement_reconciliation_event`:
- `market_id`, `selection_id`, `runner_removed_flag`, `stream_state_before`, `settlement_state_after`, `reconciliation_source`, `reconciliation_ts`, `delta_applied_flag`.
- `stream_causality_join_audit`:
- `market_id`, `ocm_ts`, `mcm_ts`, `join_strategy`, `ordered_assumption_used_flag`, `join_confidence_score`, `incident_flag`.
- `stream_delta_parser_event`:
- `connection_id`, `market_id`, `img_flag`, `size_zero_remove_count`, `missing_nullable_field_count`, `cache_rebuild_flag`, `event_ts`.
- `stream_virtual_anomaly_event`:
- `market_id`, `selection_id`, `anomaly_type(infinity_size|invalid_virtual_delta)`, `detected_ts`, `quarantine_applied_flag`, `recovery_action`.
- `provider_registry_freshness_snapshot`:
- `source_name`, `capture_ts`, `claimed_update_text`, `artifact_label`, `artifact_effective_date`, `freshness_age_days`, `freshness_confidence_score`, `validation_state`.
- `provider_publication_cadence_snapshot`:
- `source_name`, `capture_ts`, `latest_period_published`, `expected_next_period`, `missing_period_flag`, `publication_gap_periods`.

## Open questions to resolve before implementation freeze (incremental, pass 19)

- What timeout threshold should trigger forced settlement reconciliation when stream and order state disagree after runner removal events?
- Which join strategy should be canonical for OCM/MCM correlation (time-window nearest, sequence-proxy, or order-state-first), and what minimum confidence is acceptable for training labels?
- Should any virtual-ladder features remain eligible for execution-critical models once `Infinity` anomalies are observed in-session?
- What freshness-confidence threshold should block use of jurisdiction approval registries in entitlement checks?
- Who owns manual override decisions when source language claims frequent updates but artifact effective dates are materially old?

## Ranked implementation backlog (delta, pass 19)

### P0 additions

1. Implement `stream_settlement_reconciler` and enforce final exposure state from reconciled order/settlement views.
2. Build `stream_causality_join_guard` with confidence-scored OCM/MCM joins and incident emission on low-confidence matches.
3. Add strict `delta_cache_integrity_guard` invariants (`size=0` remove semantics, `img=true` replacement handling).
4. Add virtual-stream anomaly quarantine for `Infinity` events with automated cache rebuild and feature suppression.
5. Implement `provider_registry_freshness_scorer` and block entitlement-critical workflows on stale/ambiguous registry artifacts.

### P1 additions

1. Backtest label stability impact of reconciled vs stream-only order-state generation around runner removals.
2. Add dashboards for join-confidence distribution and parser anomaly rates by market/venue/feed mode.
3. Build policy-review workflow for freshness exceptions (NSW/RV/RA source drift) with audit trail and expiry.

## Sources for this update (pass 19)

- Betfair support: How are void bets treated by the Stream API?: https://support.developer.betfair.com/hc/en-us/articles/360000391492-How-are-void-bets-treated-by-the-Stream-API
- Betfair support: How can I match OCM and MCM messages from the Stream API?: https://support.developer.betfair.com/hc/en-us/articles/360000391312-How-can-I-match-OCM-and-MCM-messages-from-the-Stream-API
- Betfair support: How to I handle runner changes with size = 0?: https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-to-I-handle-runner-changes-with-size-0
- Betfair support: Why am I receiving Infinity size from the Streaming API?: https://support.developer.betfair.com/hc/en-us/articles/360003061798-Why-am-I-receiving-Infinity-size-from-the-Streaming-API
- Racing NSW approved licensed wagering operators page: https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/
- Racing NSW linked company/corporate approval file: https://www.racingnsw.com.au/wp-content/uploads/Company-Bookmakers-2020-2021.pdf
- Racing Victoria approved wagering service providers page: https://www.racingvictoria.com.au/wagering/wagering-service-providers
- Racing Australia monthly performance index: https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental architecture decisions from this run (2026-03-29, pass 20)

- Decision: add a `stream_session_recovery_controller` with persistent subscription fingerprints and `clk` checkpointing.
- Why: Betfair reconnection semantics require deterministic re-subscribe/replay handling (`RESUB_DELTA`, `img=true`, `con=true`) to preserve state integrity.
- Decision: add a `stream_scope_capacity_guard` and `closed_market_decay_tracker`.
- Why: Betfair unfiltered subscriptions can flood market cardinality, and closed-market exclusion is delayed by scheduled cache eviction/deletion behavior.
- Decision: add a `component_level_provider_reliability_gate` for AU provider telemetry.
- Why: The Racing API status evidence shows materially different uptime and incident behavior by component (API, Website, Racecards, Results).
- Decision: add a `policy_and_schedule_joint_regime_model` for CAW impact analysis.
- Why: NYRA official headline chronology indicates CAW guardrail windows overlap with weather-driven schedule disruptions.
- Decision: add a `pool_arrangement_scope_contract` for SuperTAB linkage assumptions.
- Why: ACCC draft determination language details specific authorised conduct clauses; regime logic should track whether strategy assumptions depend on in-scope vs changed terms.

## Provider comparison (incremental high-signal additions, pass 20)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Stream support (reconnections, `con=true`, sequencing, subscription scope, closed-market eviction) | Recoverability semantics, quality flags, and explicit subscription-capacity behavior | Support-layer guidance can evolve; needs telemetry validation in production | A | Build stream recovery controller + scope capacity guard before scaling market count |
| NYRA official CAW post + headline stream | Policy threshold/effective-date reference plus schedule-disruption context | Headline feed is operationally rich but not a full econometric dataset | A/B | Build joint policy/schedule regime features for event studies and live controls |
| The Racing API status + maintenance pages | Component-level uptime, incident/change markers, and planned-maintenance visibility | Status text can be brief; incident metadata may need enrichment from webhook/JSON feeds | A | Gate data quality by component and incident proximity, not provider-wide health |
| ACCC draft determination AA1000676 | Clause-level authorised conduct scope for SuperTAB pooling arrangement assumptions | Legal artefact may be superseded by updated determinations/renewals | A | Encode authorisation-scope contract and monitor for arrangement-change drift |

## Data contract additions required (incremental, pass 20)

- `stream_session_checkpoint`:
- `connection_id`, `subscription_fingerprint`, `initial_clk`, `last_clk`, `last_pt`, `checkpoint_ts`, `reconnect_attempt`.
- `stream_resubscription_audit`:
- `connection_id`, `resub_ct`, `img_flag_ratio`, `con_flag_ratio`, `resub_latency_ms`, `recovery_success_flag`, `incident_id`.
- `stream_conflation_cause_event`:
- `connection_id`, `market_id`, `con_flag`, `inferred_cause(client_backpressure|conflate_ms|publisher_cycle|unknown)`, `event_ts`.
- `stream_subscription_capacity_event`:
- `scope_type`, `filter_hash`, `market_count`, `subscription_limit`, `limit_exceeded_flag`, `decision_ts`.
- `closed_market_decay_event`:
- `market_id`, `closed_ts`, `eviction_scan_ts`, `deleted_ts`, `counted_toward_limit_flag`.
- `provider_component_health_snapshot`:
- `provider`, `capture_ts`, `component`, `uptime_90d_pct`, `status`, `source_url`.
- `provider_change_marker_event`:
- `provider`, `component`, `event_date`, `event_summary`, `change_type`, `severity`, `source_url`.
- `caw_policy_schedule_joint_state`:
- `track`, `date`, `caw_policy_state`, `schedule_state(normal|cancelled|resumed|rescheduled)`, `joint_state_id`, `source_url`.
- `pool_arrangement_scope_clause`:
- `register_id`, `clause_code`, `clause_text_hash`, `in_scope_flag`, `effective_from`, `effective_to`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 20)

- What is the canonical fallback when `clk` continuity breaks: full image rebuild or bounded resubscribe replay with confidence penalties?
- Should `con=true` events trigger immediate feature suppression only for affected markets, or global stream-quality downgrade per connection?
- What subscription-limit headroom should be reserved to absorb closed-market decay lag (5-minute eviction scans, ~1-hour deletion horizon)?
- Should NYRA CAW policy evaluation windows exclude cancellation/reschedule dates entirely or model them as explicit interaction terms?
- How should legal/compliance owners review ACCC clause-scope changes before strategy assumptions are re-enabled?

## Ranked implementation backlog (delta, pass 20)

### P0 additions

1. Implement `stream_session_recovery_controller` with persisted subscription fingerprints + `clk` checkpoints.
2. Build `stream_resubscription_audit` and alert on failed `RESUB_DELTA` or abnormal `img/con` ratios.
3. Add `stream_scope_capacity_guard` that blocks unfiltered subscriptions in production unless explicitly approved.
4. Implement `closed_market_decay_tracker` for subscription-limit forecasting and safe re-subscribe gating.
5. Add `component_level_provider_reliability_gate` using The Racing API component uptime + incident markers.

### P1 additions

1. Add `policy_and_schedule_joint_regime_model` for NYRA CAW effect attribution.
2. Ingest The Racing API JSON/webhook status feeds for richer incident metadata and automated contract tests.
3. Build `pool_arrangement_scope_contract` checks that map ACCC clause coverage to allowed simulation assumptions.

## Sources for this update (pass 20)

- Betfair support: Market Streaming - how do I managed re-connections?: https://support.developer.betfair.com/hc/en-us/articles/360000391612-Market-Streaming-how-do-I-managed-re-connections
- Betfair support: Why am I receiving "con= true" messages via the Stream API?: https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-con-true-messages-via-the-Stream-API
- Betfair support: Are Stream API messages guaranteed to be delivered in strict sequential order according to pt?: https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- Betfair support: What happens if you subscribe to the Stream API without a market filter?: https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair support: Are closed markets auto-removed from the Stream API subscription?: https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- NYRA official news: NYRA to implement new guardrails for CAW activity (Jan 30, 2026): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- NYRA official Aqueduct headlines stream: https://www.nyra.com/aqueduct/news/headlines/
- The Racing API status page: https://status.theracingapi.com/
- The Racing API maintenance page: https://status.theracingapi.com/maintenance
- ACCC Draft Determination AA1000676: https://www.accc.gov.au/system/files/public-registers/documents/Draft%20Determination%20-%2019.12.24%20-%20PR%20-%20AA1000676%20TabCorp.pdf

## Incremental architecture decisions from this run (2026-03-29, pass 21)

- Decision: add a `historical_data_acquisition_orchestrator` with settlement-aware re-pull logic.
- Why: Betfair historical files are published after full event settlement and can require re-download/update handling; naive one-shot monthly pulls risk stale/incomplete training sets.
- Decision: add a `historical_replay_parity_normalizer` specifically for PRO volume semantics.
- Why: Betfair PRO documentation defines cumulative-by-price `trd`, derived runner `tv`, and FX-driven volume corrections that can make naive monotonic assumptions invalid.
- Decision: add an `event_hierarchy_key_contract` decoupled from competition-level keys for racing markets.
- Why: Betfair Historical Data does not carry competition IDs/names for horse racing, so event/market joins must not depend on competition-level dimensions.
- Decision: add an endpoint-level `sectionals_entitlement_and_missingness_gate`.
- Why: Punting Form endpoint docs are tier-gated (Starter+ for sectionals) and coverage is broad but non-universal; model features must degrade safely when entitlement or completeness changes.

## Provider comparison (incremental high-signal additions, pass 21)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Historical Data FAQ + PRO volume semantics docs | API rate limits, publish lag behavior, and replay-critical traded-volume semantics | Support-layer docs; implementation needs integrity tests against downloaded files | A | Build settlement-aware historical ingestion and PRO replay-normalization before large backtests |
| Betfair Historical Data metadata note (competition IDs) | Explicit absence of competition dimensions for racing historical data | Limits competition-hierarchy joins and cross-sport reuse assumptions | A | Key race history on event/market/selection hierarchy only |
| Punting Form sectionals/help + API endpoint docs | Coverage claims, sectionals/wides history signals, endpoint-tier entitlement boundaries | Coverage is not complete; commercial scope required for production usage | A | Add entitlement/missingness gates and feature fallback paths |

## Data contract additions required (incremental, pass 21)

- `historical_download_job`:
- `job_id`, `request_ts`, `window_start`, `window_end`, `http_status`, `retry_count`, `rate_limit_backoff_ms`, `completed_ts`.
- `historical_event_publication_state`:
- `event_id`, `event_settled_ts`, `all_markets_settled_flag`, `file_publish_ts`, `publish_lag_days`, `source_url`.
- `historical_runner_volume_semantics`:
- `market_id`, `selection_id`, `price`, `trd_cumulative_value`, `runner_tv_value`, `tv_delta`, `fx_adjustment_inferred_flag`, `snapshot_ts`.
- `event_hierarchy_key_contract`:
- `event_id`, `market_id`, `selection_id`, `competition_id_available_flag`, `competition_name_available_flag`, `source_url`.
- `provider_endpoint_tier_profile`:
- `provider`, `endpoint_path`, `min_tier`, `commercial_required_flag`, `effective_from`, `effective_to`, `source_url`.
- `sectionals_missingness_snapshot`:
- `provider`, `track_code`, `season`, `meeting_count`, `sectionals_present_count`, `missing_rate`, `capture_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 21)

- What freshness cutoff should block historical backtests when event publication lag exceeds expected norms?
- Should FX-driven `tv` downward adjustments be normalized out for feature engineering, or retained as a market-quality signal?
- What is the canonical keying strategy for race hierarchy joins where competition-level identifiers are absent?
- Which minimum Punting Form tier/commercial package is required for Phase-1 production sectionals, and what fallback features run if entitlement drops?
- What missingness threshold should automatically disable sectional-dependent model components by track/season?

## Ranked implementation backlog (delta, pass 21)

### P0 additions

1. Implement `historical_data_acquisition_orchestrator` with rate-limit-aware retries (100 requests/10s guard) and idempotent re-download workflows.
2. Add publication-state checks that block training until event-level historical files are confirmed published after settlement.
3. Build `historical_replay_parity_normalizer` for PRO `trd`/`tv` semantics, including FX-correction anomaly handling.
4. Enforce event/market/selection key contracts that do not require competition dimensions for racing historical data.
5. Implement endpoint-level entitlement gating for sectionals and fail-safe feature degradation when tier requirements are unmet.

### P1 additions

1. Add `sectionals_missingness_snapshot` reporting and automated model-feature suppression thresholds by track/season.
2. Run sensitivity studies comparing raw vs normalized `tv` delta treatments on liquidity and fill models.
3. Add historical-ingestion SLO dashboards (publish lag distribution, retry rates, 429 incidence, re-download drift).

## Sources for this update (pass 21)

- Betfair support: What are the request rate limits on the Historical Data API? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/10111059056669-What-are-the-request-rate-limits-on-the-Historical-Data-API
- Betfair support: How frequently is the historical data updated? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/360002427051-How-frequently-is-the-historical-data-updated
- Betfair support: Does Betfair Historical Data include the competitionId and competition name? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/9863189066781-Does-Betfair-Historical-Data-include-the-competitionId-and-competition-name
- Betfair support: How is traded & available volume represented within the PRO Historical Data files? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/360002401937-How-is-traded-available-volume-represented-within-the-PRO-Historical-Data-files
- Punting Form help: Sections and Percentages: https://help.puntingform.com.au/en/articles/9130884-sections-and-percentages
- Punting Form API docs: Meeting Sectionals endpoint: https://docs.puntingform.com.au/reference/get-api-v2-meetingsectionals
- Punting Form Modeller page: https://www.puntingform.com.au/products/modeller

## Incremental architecture decisions from this run (2026-03-29, pass 22)

- Decision: add an `app_key_mode_capability_registry` and enforce mode-aware feature contracts.
- Why: Betfair Application Keys docs explicitly differentiate delayed vs live observable surfaces (`totalMatched`, `EX_ALL_OFFERS`, BSP near/far) and delayed stream limits (2 connections, 200 markets).
- Decision: add a `betfair_key_policy_conflict_resolver` in onboarding/compliance.
- Why: official Betfair sources currently disagree on live-key activation fee (`GBP299` vs `GBP499`), so key economics/permissions must be versioned and source-stamped.
- Decision: add a `qld_reporting_threshold_regime_engine` keyed by authority period.
- Why: Racing Queensland documentation indicates a turnover-threshold regime change (`AUD5m` legacy to `AUD155m` in 2025-27 comparison terms), altering daily/monthly reporting expectations.
- Decision: add a `supplier_lineage_registry` with explicit approved-supplier snapshots.
- Why: Queensland conditions explicitly enumerate approved suppliers and now include RWWA in the supplier definition set.
- Decision: add `meeting_density_normalization` to CAW policy studies.
- Why: NYRA's 2026 schedule announcement gives explicit annual race-day counts (196 in 2026; 203 planned in 2027), affecting baseline exposure.

## Provider comparison (incremental high-signal additions, pass 22)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `Application Keys` docs + support cost article | Mode-dependent data-surface limits, stream caps, read-only restrictions, and explicit fee-policy contradiction to resolve | Two official doc layers disagree on fee; requires ongoing doc-version reconciliation | A | Implement capability registry + policy conflict resolver and block static assumptions |
| Racing Queensland race-info page + 2025-27 comparison + 2023-25 baseline conditions | Authority-period metadata, threshold-regime shift signals, and approved-supplier lineage changes | Comparison artifact is redline-style and can be hard to parse; needs canonical structured extract | A | Build threshold regime engine + supplier snapshot ingestion with effective dating |
| NYRA 2026 schedule announcement | Exposure baseline (`live race days`) for policy-effect normalization | Schedule plans may change intra-year; requires change-tracking | A/B | Add meeting-density controls to CAW-policy attribution and backtest windows |

## Data contract additions required (incremental, pass 22)

- `app_key_capability_profile`:
- `provider`, `doc_source`, `doc_updated_at`, `key_mode`, `delay_min_sec`, `delay_max_sec`, `supports_total_matched_selection`, `supports_ex_all_offers`, `supports_bsp_near_far`, `stream_connection_limit`, `stream_market_limit`, `read_only_live_allowed`, `activation_fee_gbp`.
- `app_key_policy_conflict_event`:
- `provider`, `policy_field`, `source_a`, `value_a`, `source_b`, `value_b`, `detected_at`, `resolution_state`, `blocking_flag`.
- `qld_reporting_threshold_regime`:
- `authority_period_start`, `authority_period_end`, `daily_reporting_threshold_aud`, `monthly_reporting_business_day_deadline`, `legacy_threshold_aud`, `effective_from`, `source_url`.
- `qld_approved_supplier_snapshot`:
- `capture_ts`, `supplier_name`, `supplier_abn`, `is_active`, `authority_period_start`, `authority_period_end`, `source_url`.
- `meeting_density_baseline`:
- `track`, `season_year`, `planned_live_race_days`, `published_at`, `source_url`, `revision_id`.

## Open questions to resolve before implementation freeze (incremental, pass 22)

- Which source should be authoritative when Betfair official docs conflict on the same policy field (support KB vs developer-docs wiki)?
- Do we block production key onboarding whenever fee/permission contradictions are unresolved, or allow conditional operation with manual override?
- Should Queensland reporting orchestration be keyed only by authority period dates or also by explicit condition-document version hashes?
- How frequently should approved-supplier lineage snapshots be refreshed to catch silently-added or removed suppliers?
- In CAW policy studies, what is the minimum schedule-normalization granularity (annual race days, meet-level days, or card-level counts)?

## Ranked implementation backlog (delta, pass 22)

### P0 additions

1. Implement `app_key_mode_capability_registry` and enforce hard feature contracts for delayed vs live data surfaces.
2. Implement `betfair_key_policy_conflict_resolver` with blocking behavior on unresolved contradictory policy fields.
3. Build `qld_reporting_threshold_regime_engine` with effective-dated thresholds and reporting cadence rules.
4. Add `qld_approved_supplier_snapshot` ingestion and compliance checks against supplier-lineage requirements.
5. Add `meeting_density_normalization` controls to NYRA CAW policy-event datasets.

### P1 additions

1. Add automated doc-diff monitoring for Betfair key-policy pages and raise alerts on fee/permission/limit changes.
2. Build parser-quality tests for RQ redline comparison documents and fallback extraction from canonical non-redline terms.
3. Run sensitivity tests comparing CAW-policy effect estimates with vs without meeting-density controls.

## Sources for this update (pass 22)

- Betfair Exchange API docs: Application Keys (updated 2026-03-16): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687105/Application%20Keys
- Betfair Developer Support: Are there any costs associated with API access? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/115003864531-Are-there-any-costs-associated-with-API-access
- Racing Queensland race-information page: https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland FY26-27 vs FY24-25 comparison PDF: https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf
- Racing Queensland 2023-25 conditions PDF: https://www.racingqueensland.com.au/getmedia/e58ab640-1de5-4741-b602-71f1c728c4b9/General-Conditions-for-Race-Information-Authority-1-July-2023-30-June-2025-FINAL.pdf.aspx
- NYRA 2026 schedule announcement (published 2026-01-03): https://www.nyra.com/aqueduct/news/nyra-announces-2026-racing-schedule-multi-year-agreement-on-race-dates/

## Incremental architecture decisions from this run (2026-03-29, pass 23)

- Decision: add an account-level `session_and_clock_guard` service.
- Why: Betfair explicitly separates session lifetime from API activity and requires `Keep Alive`; NTP alignment is also documented and should be enforced before late-window execution.
- Decision: add `track_policy_timeline` with cross-venue CAW cutoff support.
- Why: Del Mar now provides official 2-min win-pool CAW cutoff evidence, confirming multi-track policy diffusion beyond NYRA.
- Decision: add a `commingling_concentration_monitor` in market-regime analytics.
- Why: HKJC now publishes concrete commingled turnover share (25.3%) and partner-network scale (70+ in 26 jurisdictions), making concentration measurable.
- Decision: add a `herding_informed_state_estimator` challenger model.
- Why: New peer-reviewed OU evidence suggests late odds can be decomposed into herding vs informed flow components.
- Decision: separate `wholesaler_lineage_verification` from `capability_claim_verification` in provider onboarding.
- Why: BetMakers wholesaler status is high-signal lineage evidence, but capability depth still needs contract/SLA confirmation.

## Provider comparison (incremental high-signal additions, pass 23)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`Keep Alive`, NTP) | Session-expiry behavior and clock-sync guidance for execution reliability | Support-article layer; needs periodic revalidation | A | Implement session+clock guardrails as hard pre-trade checks |
| Del Mar official CAW policy release | Independent track-level CAW cutoff regime (`2 min` win-pool cutoff) | Venue-specific; direct transfer to AU not guaranteed | A | Expand policy-timeline model to handle multi-track CAW rule variants |
| HKJC FY2024/25 corporate release | Quantified commingling concentration (share, turnover, partner breadth) | HK market structure differs from AU exchange-first setup | A | Use as external benchmark in liquidity-transfer and regime-risk studies |
| BetMakers wholesaler announcement | Practical lineage path for official RA materials + bundled product claim | Capability depth is self-reported without full SLA/legal terms | A/B | Keep as shortlist candidate; require contract/SLA verification before ranking uplift |

## Data contract additions required (incremental, pass 23)

- `session_clock_guard_log`:
- `session_created_ts`, `last_keep_alive_ts`, `session_timeout_sec`, `keep_alive_due_ts`, `ntp_offset_ms`, `guard_state`, `blocking_flag`.
- `track_caw_policy_timeline`:
- `track_code`, `pool_scope`, `cutoff_sec_to_post`, `announced_ts`, `effective_ts`, `source_url`, `override_flag`.
- `commingling_regime_snapshot`:
- `jurisdiction`, `report_period`, `commingled_turnover_hkd`, `commingled_share_pct`, `partner_count`, `partner_jurisdiction_count`, `source_url`.
- `odds_state_estimation`:
- `market_id`, `snapshot_ts`, `herder_share_estimate`, `informed_share_estimate`, `mean_reversion_rate`, `diffusion_scale`, `model_version`.
- `provider_claim_verification`:
- `provider`, `claim_type`, `claim_text`, `claim_source_url`, `verification_state`, `verified_by_contract_flag`, `verified_by_sla_flag`.

## Open questions to resolve before implementation freeze (incremental, pass 23)

- What NTP offset threshold should trigger hard trading pause versus soft confidence haircut?
- How should we encode CAW policy transition windows (grace days vs immediate switch) in causal backtests?
- Which commingling concentration metric best predicts liquidity portability into Betfair-centric execution assumptions?
- Should OU-style herding/informed latent-state models run only as diagnostics first, or directly gate live stake sizing?
- Which minimum contract/SLA fields are required to promote wholesaler capability claims from `B` to `A` evidence in provider ranking?

## Ranked implementation backlog (delta, pass 23)

### P0 additions

1. Implement `session_and_clock_guard` with keep-alive scheduler, expiry alarms, and NTP-offset hard gates.
2. Add `track_caw_policy_timeline` and backtest segmentation by policy regime and transition window.
3. Ingest `commingling_regime_snapshot` and wire concentration metrics into regime-risk dashboards.
4. Add provider onboarding split: lineage verification pass, then capability/SLA verification pass with blocking states.

### P1 additions

1. Build an OU-based herding/informed-state challenger and compare against existing late-drift features.
2. Add sensitivity tests for stake and CLV performance under varying NTP-offset and session-health degradation scenarios.
3. Add automated claim-verification reminders for providers with unresolved capability assertions.

## Sources for this update (pass 23)

- Betfair support: How do I keep my API session alive? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/360002773032-How-do-I-keep-my-API-session-alive
- Betfair support: Which NTP servers do Betfair use? (updated 2025-12-02): https://support.developer.betfair.com/hc/en-us/articles/360000406071-Which-NTP-servers-do-Betfair-use
- Del Mar official release (published 2025-07-29): https://www.dmtc.com/media/news/del-mar-to-take-additional-steps-to-curb-late-odds-2724
- HKJC corporate results release FY2024/25 (published 2025-08-29): https://corporate.hkjc.com/corporate/corporate-news/english/2025-08/news_2025082901950.aspx
- Physica A (2025): Ornstein-Uhlenbeck process for horse race betting (PII: S037843712500634X): https://www.sciencedirect.com/science/article/pii/S037843712500634X
- BetMakers wholesaler announcement (published 2025-06-20): https://betmakers.com/articles/betmakers-appointed-racing-australia-data-wholesaler

## Incremental architecture decisions from this run (2026-03-29, pass 24)

- Decision: add a `feature_lineage_complexity_registry` with uncertainty-aware promotion gates.
- Why: Benter's primary DPGA example and man-year guidance indicate complex feature engineering is core edge and must be tracked as a first-class risk/cost object.
- Decision: add a `threshold_stability_controller` for value-filter policies.
- Why: Bolton-Chapman primary results show non-monotonic returns under stricter `pmin` filters when effective sample counts shrink.
- Decision: add a `public_vs_private_sign_probe` diagnostic service.
- Why: Walsh's interview provides a testable claim that certain feature coefficients (for example weight) change sign when public factors are included.
- Decision: split SP projection state from exchange-ladder state in the canonical schema.
- Why: Betfair Near/Far mechanics are reconciliation constructs and should not be treated as executable ladder equivalents.

## Provider comparison (incremental high-signal additions, pass 24)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Benter 1994 primary report | Concrete feature-engineering complexity pattern, sample-size guidance, closed-population caution | Legacy-era paper; requires modern AU transfer testing | A | Build feature-lineage complexity registry and jurisdiction-aware promotion gates |
| Bolton & Chapman 1986 primary paper | Quantified threshold/sizing sensitivity in expected-return wagering policies | Historical dataset/regime; requires replication on modern AU markets | A | Implement threshold-stability controller before locking static `pmin` rules |
| Walsh interview transcript (Andrew Leigh) | First-person ownership structure and public-factor dependency claims; testable coefficient-sign hypothesis | Interview evidence (not full methodological disclosure) | A/B | Add coefficient-sign diagnostics and structure metadata, keep internals as hypothesis class |
| Betfair SP FAQ | Explicit Near/Far projection mechanics and reconciliation framing | Product FAQ layer; needs integration checks against API payload behavior | A/B | Add separate SP projection state tables and projection-vs-actual error monitoring |

## Data contract additions required (incremental, pass 24)

- `feature_lineage_complexity_registry`:
- `feature_code`, `derivation_family`, `complexity_tier`, `implementation_loc_estimate`, `validation_sample_races`, `oos_gain_metric`, `promotion_state`.
- `threshold_stability_window`:
- `strategy_id`, `pmin_threshold`, `window_race_count`, `eligible_race_count`, `window_return`, `stability_score`, `policy_action`.
- `public_private_sign_probe`:
- `feature_name`, `model_variant(with_public|without_public)`, `coefficient_value`, `sign`, `sign_flip_flag`, `evaluation_ts`.
- `sp_projection_state`:
- `market_id`, `selection_id`, `near_price`, `far_price`, `display_mode`, `includes_exchange_unmatched_flag`, `snapshot_ts`, `actual_sp`, `projection_error_ticks`.
- `operator_structure_snapshot`:
- `entity_name`, `source_person`, `ownership_share_pct`, `evidence_source_url`, `evidence_ts`, `confidence_grade`.

## Open questions to resolve before implementation freeze (incremental, pass 24)

- What minimum out-of-sample gain should a high-complexity feature clear before entering the live feature set?
- Which rolling window length (race-count basis) should drive threshold-stability controller actions in NSW/VIC win markets?
- Should coefficient-sign flips be hard fail signals for model promotion or soft diagnostics requiring manual review?
- How should SP projection-error features be weighted relative to exchange-ladder signals near jump?
- What confidence rubric should govern first-person operator-structure claims before they affect provider/counterparty risk scoring?

## Ranked implementation backlog (delta, pass 24)

### P0 additions

1. Implement `feature_lineage_complexity_registry` and require complexity-aware promotion checks for every non-trivial derived factor.
2. Build `threshold_stability_controller` using fixed-race rolling windows and automatic policy fallback when stability degrades.
3. Implement `public_private_sign_probe` on key folklore-prone features (weight, recent streaks, draw narratives).
4. Add `sp_projection_state` ingestion and keep SP projections physically separate from executable ladder snapshots.
5. Add `operator_structure_snapshot` store with source/confidence tags for governance and risk context.

### P1 additions

1. Reproduce Bolton-style `pmin` sensitivity tests on AU Betfair datasets and compare to historical patterns.
2. Build challenger models that include projection-error features (`near/far` vs actual SP) for BSP-related strategies.
3. Add monthly drift reports on coefficient-sign stability for features linked to known public biases.

## Sources for this update (pass 24)

- Benter (1994) primary report: https://gwern.net/doc/statistics/decision/1994-benter.pdf
- Bolton and Chapman (1986) primary paper: https://gwern.net/doc/statistics/decision/1986-bolton.pdf
- David Walsh interview transcript (Andrew Leigh): https://www.andrewleigh.com/david_walsh_tgl
- Betfair SP FAQ: https://promo.betfair.com/betfairsp/FAQs_projectedOdds.html

## Incremental architecture decisions from this run (2026-03-29, pass 25)

- Decision: add an `nsw_min_bet_compliance_engine` with effective-dated schedule ingestion and clause-5.7 exemption logic.
- Why: NSW minimum-bet obligations are split between the standard conditions and separately published amount/time schedules, with anti-circumvention and complaint-handling requirements.
- Decision: add a `bookmaker_route_integrity_log` to capture account-routing actions (including white-label redirects) and complaint outcomes.
- Why: clause 5.7 explicitly treats routing/closure/restriction behavior as potential avoidance, so execution governance needs event-level evidence.
- Decision: enforce `listMarketBook` status-separated polling profiles and projection-policy versioning.
- Why: Betfair docs state OPEN/CLOSED should be requested separately and provide a recommended projection bundle for coherent single-call state capture.

## Provider comparison (incremental high-signal additions, pass 25)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing NSW 2025-26 standard conditions + minimum-bet schedule | Clause-level anti-circumvention/exemption workflow and explicit amount/time schedule values | Schedule values are externally published and amendable; must be version-tracked | A | Build policy engine with effective-dated schedule snapshots and complaint-state ingest |
| Betfair `listMarketBook` API docs | Explicit OPEN/CLOSED request separation rule and recommended order/match projection settings | API behavior can evolve; requires telemetry to detect drift from docs | A | Enforce request-profile contracts and track projection mode lineage in ingestion audit |

## Data contract additions required (incremental, pass 25)

- `nsw_min_bet_schedule_snapshot`:
- `captured_ts`, `effective_date`, `threshold_turnover_aud`, `metro_limit_aud`, `metro_place_component_aud`, `nonmetro_limit_aud`, `nonmetro_place_component_aud`, `commencement_time_local`, `night_commencement_time_local`, `source_url`.
- `nsw_min_bet_compliance_event`:
- `event_ts`, `operator`, `customer_ref`, `horse_ref`, `public_odds`, `requested_stake`, `accepted_stake`, `proportional_accept_applied_flag`, `exemption_code`, `beneficial_owner_ref`, `source_url`.
- `nsw_min_bet_complaint_case`:
- `case_id`, `received_ts`, `response_due_ts`, `docs_submitted_ts`, `determination_ts`, `account_suspended_pre_determination_flag`, `outcome_code`.
- `betfair_marketbook_request_profile`:
- `profile_id`, `market_status_scope`, `order_projection`, `match_projection`, `include_overall_position`, `response_size_bytes`, `request_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 25)

- Should policy ingestion treat NSW minimum-bet schedule updates as deployment-blocking until replay tests pass?
- What customer-identity keying is acceptable for beneficial-owner linkage in simulation without breaching privacy constraints?
- Do we enforce a single canonical `listMarketBook` projection profile across all strategies or permit strategy-specific profiles with lineage gating?
- What telemetry threshold indicates `listMarketBook` response-surface drift significant enough to pause model promotion?

## Ranked implementation backlog (delta, pass 25)

### P0 additions

1. Implement `nsw_min_bet_compliance_engine` with effective-dated schedule snapshots and clause-5.7 exemption resolution.
2. Build `bookmaker_route_integrity_log` and wire complaint-case state into operator reliability scoring.
3. Add hard collector guards preventing mixed OPEN/CLOSED `listMarketBook` requests.
4. Version-control `listMarketBook` projection profiles and block unapproved runtime changes.

### P1 additions

1. Backtest sensitivity of expected fill/capacity under NSW minimum-bet exemptions (beneficial owner, commencement time, cash outlet carve-outs).
2. Build ingestion-quality dashboards for `listMarketBook` state-surface completeness by projection profile.
3. Add nightly policy-drift diffing on Racing NSW minimum-bet schedule page and publish change alerts.

## Sources for this update (pass 25)

- Racing NSW 2025-26 standard conditions (effective 1 July 2025): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Clean-Version-Effective-1-July-2025.pdf
- Racing NSW minimum-bet schedule (as at 1 July 2022): https://www.racingnsw.com.au/wp-content/uploads/Minimum-Bet-Limits-and-Minimum-Bet-Commencement-Time-as-at-1-July-2022.pdf
- Racing NSW race-fields legislation index: https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/
- Betfair Exchange API docs: `listMarketBook` (updated 2024-06-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook

## Incremental architecture decisions from this run (2026-03-30, pass 26)

- Decision: add a `post_start_odds_lag_interpreter` service for any tote-linked market references.
- Why: NYRA's official FAQ says wagering closes at gate-open while final odds can still update post-start due to high-volume totalisator calculation delays.
- Decision: add a `sectional_provider_regime_registry` with method-level metadata and effective-date boundaries.
- Why: Tasracing formally switched to Daily Sectionals from 1 Jan 2026 with explicit race-vision capture semantics and `200m` split + position-in-running outputs.
- Decision: enforce venue-specific CLV benchmark windows (`off_snapshot` vs `final_published`).
- Why: post-jump tote publication lag can otherwise contaminate execution attribution and cross-venue comparisons.

## Provider comparison (incremental high-signal additions, pass 26)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| NYRA official betting FAQ | Explicit statement that betting closes at gate-open and post-start odds movement can reflect tote publication lag, not post-start acceptance | Venue-specific; FAQ semantics may differ across operators/jurisdictions | A | Add tote-cycle lag decomposition fields and venue-specific benchmark windows |
| Tasracing official provider notice (24 Dec 2025) | Effective-dated sectional-provider switch to Daily Sectionals and explicit output schema (`200m` splits, overall time, position in running) with race-vision capture note | Jurisdiction-specific methodology; may not transfer directly to other state sectionals | A | Add provider-regime metadata and regime-break handling in feature engineering/backtests |

## Data contract additions required (incremental, pass 26)

- `tote_cycle_lag_event`:
- `venue`, `race_id`, `wager_close_ts`, `race_start_ts`, `final_odds_publish_ts`, `post_start_odds_update_lag_sec`, `source_url`, `faq_version`.
- `sectional_provider_regime`:
- `jurisdiction`, `provider_name`, `effective_from`, `effective_to`, `capture_method`, `split_interval_m`, `includes_position_in_running_flag`, `coverage_scope`, `source_url`.
- `clv_benchmark_window`:
- `venue`, `market_type`, `benchmark_mode(off_snapshot|final_published|dual)`, `effective_from`, `effective_to`, `reason_code`.

## Open questions to resolve before implementation freeze (incremental, pass 26)

- For U.S. tote-linked references, do we evaluate signal quality against jump-time odds, final-published odds, or both?
- Should post-start odds-publication lag trigger automatic exclusions from CLV attribution reports when lag exceeds a threshold?
- How do we normalize sectional-derived pace features across jurisdictions with different capture methods (vision vs other) and different effective dates?
- Do we run separate challenger models for Tasmanian sectionals pre- and post-1 Jan 2026 to avoid hidden method shift contamination?

## Ranked implementation backlog (delta, pass 26)

### P0 additions

1. Implement `tote_cycle_lag_event` ingest and wire venue-specific odds-publication lag into evaluation pipelines.
2. Add `clv_benchmark_window` policy with explicit `off_snapshot` and `final_published` modes by venue/source.
3. Implement `sectional_provider_regime` joins and enforce regime-break segmentation in backtests.

### P1 additions

1. Run sensitivity analysis on CLV/PnL attribution under alternative benchmark windows where post-start publication lag exists.
2. Build pre/post-regime drift monitors for Tasmanian sectional features around the 1 Jan 2026 provider transition.
3. Add feature-normalization experiments for `position_in_running` and `200m` split signals under mixed provider-method regimes.

## Sources for this update (pass 26)

- NYRA betting FAQ (Aqueduct): https://cms.nyra.com/aqueduct/racing/betting-faq
- Tasracing notice: New sectional provider for Tasmanian thoroughbred racing (24 Dec 2025): https://tasracing.com.au/news/new-sectional-provider-for-tasmanian-thoroughbred-racing

## Incremental architecture decisions from this run (2026-03-30, pass 27)

- Decision: introduce a `betfair_filter_contract_registry` and make filter-bundle completeness a startup/runtime invariant.
- Why: Betfair's mapping doc makes key state surfaces opt-in (`EX_MARKET_DEF`, SP filters, bounded `ladderLevels`), so partial subscriptions can silently degrade model inputs.
- Decision: add a `victorian_jumpout_protocol_regime` layer to pre-race feature ingestion.
- Why: RV formalized a standard jump-out production/publishing regime (from 3 Mar 2025), including explicit same-day publication expectations and track exceptions.
- Decision: gate jump-out-dependent pre-off features on publication-latency policy.
- Why: RV's stated `5pm` publication timing means same-day availability is predictable but not immediate.

## Provider comparison (incremental high-signal additions, pass 27)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support market-data mapping (updated 2025-10-30) | Explicit filter-to-surface map (`EX_MARKET_DEF`, SP filters, `ladderLevels` bounds) and virtual/raw distinctions | Support-layer docs can change; must monitor revisions | A | Enforce filter-contract registry and block strategies on incomplete bundles |
| Racing Victoria jump-out release (3 Mar 2025) | Officially dated standardization event + publication timing and channel rules for VIC jump-outs | Jurisdiction-specific and partly media-surface oriented; needs track-level exception handling | A | Add jump-out regime metadata and publication-latency gates in pre-race pipeline |

## Data contract additions required (incremental, pass 27)

- `betfair_filter_contract`:
- `contract_id`, `required_price_filter_set`, `requires_market_def_flag`, `requires_sp_filters_flag`, `ladder_levels_min`, `ladder_levels_max`, `effective_from`, `source_url`.
- `collector_filter_contract_audit`:
- `run_id`, `market_id`, `contract_id`, `price_filters_active`, `market_def_active_flag`, `sp_filters_active_flag`, `ladder_levels_value`, `gap_detected_flag`, `audit_ts`.
- `jumpout_protocol_regime`:
- `jurisdiction`, `track`, `regime_start_date`, `standardized_production_flag`, `racecaller_flag`, `color_id_standard_flag`, `publish_deadline_local`, `exception_track_flag`, `source_url`.
- `jumpout_publication_event`:
- `track`, `session_date`, `expected_publish_deadline`, `first_seen_ts`, `published_by_deadline_flag`, `channel`, `capture_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 27)

- Should filter-contract violations hard-fail ingestion immediately, or route to degraded-mode scoring with explicit suppression?
- Which strategies require mandatory SP filters versus optional SP filters with feature fallback?
- For Victorian jump-outs, do we define one regime from 2025-03-03 globally or track-specific effective dates with exception lists?
- What is the allowable same-day grace window after the documented `5pm` target before triggering data-readiness alerts?

## Ranked implementation backlog (delta, pass 27)

### P0 additions

1. Implement `betfair_filter_contract_registry` and runtime audits that flag missing `EX_MARKET_DEF`/SP filters and invalid ladder depth.
2. Add `collector_filter_contract_audit` checks to block promotion of datasets with state-surface gaps.
3. Add `jumpout_protocol_regime` joins in feature pipelines for Victorian jump-out derived features.
4. Implement jump-out publication-latency gating for same-day pre-race models.

### P1 additions

1. Run ablation studies comparing full filter bundles vs price-only bundles on BSP/late-microstructure model stability.
2. Build deadline-adherence monitor for jump-out publication events (`expected` vs `first_seen`).
3. Add regime-aware retraining triggers when jump-out protocol metadata changes.

## Sources for this update (pass 27)

- Betfair support: What market data is available from `listMarketBook` & Stream API? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API-
- Racing Victoria official release (3 Mar 2025): Racing Victoria and Racing.com launch enhanced jump-out coverage: https://www.racingvictoria.com.au/news/2025/03/03/racing-victoria-and-racingcom-launch-enhanced-jump-out-coverage

## Incremental architecture decisions from this run (2026-03-30, pass 30)

- Decision: add a `stream_access_regime_gate` as a first-class pre-trade dependency.
- Why: Betfair documents delayed-key stream conflation (3-minute cadence) and separate live-key/KYC/funding requirements, which materially change observable market microstructure.
- Decision: add a `vendor_web_bearer_contract` validator in stream session bootstrap.
- Why: Betfair explicitly requires Bearer-token session formatting for Vendor Web app keys; auth mismatch should fail fast, not surface mid-session.
- Decision: add a `freefields_publication_state_registry` and `results_interim_state` lifecycle in provider ingestion.
- Why: Racing Australia FreeFields exposes artifact readiness by column and explicit `Available Now (interim)` statuses that can otherwise leak look-ahead bias into modeling.

## Provider comparison (incremental high-signal additions, pass 30)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: Stream access + bearer-token requirements | Explicit delayed-vs-live stream regime, 3-minute delayed conflation, KYC/funding preconditions, vendor-web bearer-session contract | Support-layer docs can change; requires startup/runtime validation telemetry | A | Enforce stream-regime gate + app-key-class auth validator before any late-window strategy runs |
| Racing Australia FreeFields calendar/results pages | Artifact-level availability matrix and `interim` vs final result publication states, plus rights notices | Web-surface (not signed SLA feed); must snapshot page state/time to avoid retroactive ambiguity | A | Add publication-state ingestion and preserve interim/final lineage in PIT datasets |

## Data contract additions required (incremental, pass 30)

- `stream_access_regime_snapshot`:
- `captured_ts`, `app_key_mode(delayed|live)`, `stream_conflation_interval_sec`, `kyc_verified_flag`, `account_funded_flag`, `source_url`.
- `stream_auth_contract_audit`:
- `session_id`, `app_key_class(vendor_web|other)`, `session_token_format`, `auth_success_flag`, `auth_error_code`, `validated_ts`, `source_url`.
- `freefields_artifact_state`:
- `captured_ts`, `state`, `meeting_date`, `meeting_key`, `nominations_flag`, `weights_flag`, `acceptances_flag`, `form_flag`, `gear_flag`, `scratchings_flag`, `results_flag`, `source_url`.
- `freefields_results_publication_state`:
- `captured_ts`, `state`, `meeting_date`, `meeting_key`, `result_status(interim|final)`, `source_url`.
- `freefields_rights_notice_snapshot`:
- `captured_ts`, `state`, `state_rights_holder`, `ra_rights_notice_flag`, `notice_text_hash`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 30)

- Should delayed-stream (`>=180s` conflation) sessions be hard-blocked for all model training, or only for execution and CLV-critical feature families?
- What is the minimum validation cadence for `vendor_web_bearer_contract` (startup only vs periodic re-check) to minimize false starts?
- How should we reconcile `interim` results to final outcomes in warehouse history while preserving point-in-time truth for backtests?
- Do state-level rights notices on FreeFields require per-state feature suppression in shared downstream artifacts, or is dataset-level tagging sufficient?

## Ranked implementation backlog (delta, pass 30)

### P0 additions

1. Implement `stream_access_regime_gate` and block late-window models when stream mode is delayed or unknown.
2. Implement `stream_auth_contract_audit` with hard failure on vendor-web bearer-token mismatches.
3. Add `freefields_artifact_state` and `freefields_results_publication_state` ingestion with timestamped snapshots.
4. Add PIT-safe reconciliation rules preserving `interim` to `final` transitions without overwriting historical state.

### P1 additions

1. Build `stream_regime_eligibility_score` and test calibration degradation under delayed/conflated stream regimes.
2. Build publication-state-aware feature gating experiments (`artifact complete` vs partial readiness windows).
3. Add rights-notice drift monitor to detect state-level copyright notice changes that may affect distribution policy.

## Sources for this update (pass 30)

- Betfair support: How do I get access to the Stream API? (updated 2024-06-21): https://support.developer.betfair.com/hc/en-us/articles/115003887871-How-do-I-get-access-to-the-Stream-API
- Betfair support: Stream API - Bearer Token Must Be Used for Web App Key (updated 2025-09-11): https://support.developer.betfair.com/hc/en-us/articles/360000391432-Stream-API-Bearer-Token-Must-Be-Used-for-Web-App-Key
- Racing Australia FreeFields (NSW race fields/form calendar): https://www.racingaustralia.horse/FreeFields/Calendar.aspx?State=NSW
- Racing Australia FreeFields (NSW results calendar): https://www.racingaustralia.horse/FreeFields/Calendar_Results.aspx?State=NSW

## Incremental architecture decisions from this run (2026-03-30, pass 31)

- Decision: add a `catalogue_live_surface_split` invariant in data ingestion and feature assembly.
- Why: Betfair type definitions explicitly mark `MarketCatalogue.totalMatched` as cached and direct live-liquidity reads to `listMarketBook`.
- Decision: add a `runner_identity_graph` keyed on Betfair-native `selectionId` plus runner-name pair lineage.
- Why: Betfair documents cross-market reuse of `selectionId` + `runnerName`, enabling more stable identity joins than string-normalization alone.
- Decision: add an `au_race_type_mapping_guard` with explicit `NO_VALUE` handling in taxonomy pipelines.
- Why: Betfair now documents AU/NZ race-type semantics and an explicit unmapped bucket (`NO_VALUE`) that should not silently collapse into standard classes.
- Decision: tighten provider onboarding from tier-level checks to endpoint-level entitlement checks for Punting Form.
- Why: Punting Form docs and API reference show endpoint-level access asymmetry (Starter+ ratings vs Modeller/commercial benchmarks/sectionals).

## Provider comparison (incremental high-signal additions, pass 31)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `listMarketCatalogue` + Betting Type Definitions | Explicit cached-vs-live liquidity semantics, cross-market runner identity key behavior, AU/NZ raceType mapping including `NO_VALUE` | Doc-level marketId prefix wording can conflict with newer AUS notes elsewhere; requires parser assertions and runtime validation | A | Enforce static-vs-dynamic surface split, selectionId-first identity joins, and raceType quality guards |
| Punting Form guides + API reference | Endpoint-level entitlement matrix, token-auth requirement, Modeller/commercial pathway for sectional/benchmark endpoints | Public docs describe tiers but not full commercial SLA/contract terms | A | Build endpoint-level entitlement registry and gate feature families by contract-tier + endpoint availability |

## Data contract additions required (incremental, pass 31)

- `market_surface_split_audit`:
- `market_id`, `snapshot_ts`, `catalogue_total_matched_cached`, `book_total_matched_live`, `gap_abs`, `gap_pct`, `policy_breach_flag`, `source_url`.
- `runner_identity_graph`:
- `selection_id`, `runner_name`, `first_seen_ts`, `last_seen_ts`, `cross_market_count`, `name_change_detected_flag`, `source_url`.
- `market_race_type_mapping`:
- `market_id`, `race_type_raw`, `race_type_norm`, `no_value_flag`, `mapping_version`, `capture_ts`, `source_url`.
- `provider_endpoint_entitlement_snapshot`:
- `provider`, `endpoint_path`, `min_tier`, `commercial_path_required_flag`, `token_auth_required_flag`, `snapshot_ts`, `source_url`.
- `provider_contract_feature_gate`:
- `provider`, `feature_family`, `required_endpoint_set`, `entitlement_state(allowed|blocked|degraded)`, `evaluated_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 31)

- What quantitative threshold should trigger `market_surface_split_audit.policy_breach_flag` for cached-vs-live liquidity divergence?
- Should `selectionId` identity joins hard-reject rows where runner names diverge, or keep lineage history with soft warnings?
- How do we resolve Betfair market-id prefix documentation drift (`1.` legacy wording vs AU examples seen elsewhere) in parser validation policy?
- Which minimum commercial artifacts (contract schedule, redistribution clause, SLA) are required before promoting Punting Form benchmark/sectional endpoints from paper to live feature feeds?

## Ranked implementation backlog (delta, pass 31)

### P0 additions

1. Implement `catalogue_live_surface_split` checks and block execution features when cached/live liquidity surfaces are mixed.
2. Build `runner_identity_graph` with `selectionId`-anchored joins and lineage alerts for name drift.
3. Add `au_race_type_mapping_guard` with explicit `NO_VALUE` handling and downstream feature suppression policies.
4. Implement `provider_endpoint_entitlement_snapshot` for Punting Form and make endpoint-level entitlement gating mandatory in feature orchestration.

### P1 additions

1. Run sensitivity analysis for model calibration under different cached-vs-live volume-gap thresholds.
2. Build taxonomy-stability reports quantifying `NO_VALUE` prevalence by track/season.
3. Add automated contract-readiness checks that map endpoint entitlements to live-deployment eligibility.

## Sources for this update (pass 31)

- Betfair `listMarketCatalogue` (updated 2024-06-12): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687517/listMarketCatalogue
- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Punting Form docs home: https://docs.puntingform.com.au/
- Punting Form Modeller Membership guide: https://docs.puntingform.com.au/docs/modeller-membership
- Punting Form API reference `MeetingRatings`: https://docs.puntingform.com.au/reference/ratings
- Punting Form API reference `MeetingBenchmarks/csv`: https://docs.puntingform.com.au/reference/meetingbenchmarkscsv

## Incremental architecture decisions from this run (2026-03-30, pass 32)

- Decision: add a `cleared_orders_rollup_contract` and enforce settlement-grain lineage in reconciliation pipelines.
- Why: Betfair documents roll-up-specific field availability, hoisted fields, and mixed aggregation semantics (`SUM`/`AVG`/`MAX`) for `listClearedOrders`; attribution is unsafe without explicit grain metadata.
- Decision: split provider reliability into `process_sla_quality` and `system_uptime_quality` tracks, with a publication-gap monitor.
- Why: Racing Australia's January 2026 report shows nominations timeliness below target while uptime remains near-perfect, and the index still lists January as latest (no February entry visible in this run).

## Provider comparison (incremental high-signal additions, pass 32)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `listClearedOrders - Roll-up Fields Available` | Explicit per-rollup field availability, aggregation semantics, and hoist rules for settled orders | Roll-up behavior can silently vary by query shape; consumers may misread aggregated rows as atomic facts | A | Enforce roll-up contract registry and block per-bet attribution when grain metadata is missing |
| Racing Australia monthly performance index + January 2026 report | Process-level timeliness KPIs, system uptime metrics, and monthly publication-cadence visibility | Monthly cadence is coarse; publication lag can delay telemetry | A | Add dual reliability scores (process vs uptime) and publication-gap penalties |

## Data contract additions required (incremental, pass 32)

- `cleared_orders_rollup_contract`:
- `contract_id`, `group_by_level`, `field_name`, `availability_mode(y|n|hoisted)`, `aggregation_mode(raw|sum|avg|max)`, `effective_from`, `source_url`.
- `cleared_orders_rollup_audit`:
- `capture_ts`, `query_group_by`, `row_count`, `bet_count_total`, `hoisted_fields_json`, `aggregation_semantics_json`, `grain_safety_flag`, `source_url`.
- `provider_process_sla_kpi`:
- `provider`, `report_month`, `metric_name`, `target_pct`, `actual_pct`, `variance_pct`, `source_url`.
- `provider_system_uptime_kpi`:
- `provider`, `report_month`, `system_name`, `target_uptime_pct`, `actual_uptime_pct`, `unplanned_downtime_min`, `source_url`.
- `provider_publication_cadence_snapshot`:
- `provider`, `captured_ts`, `latest_listed_month`, `expected_latest_month`, `missing_expected_month_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 32)

- Should any non-`BET` `listClearedOrders` roll-up be hard-blocked from per-strategy/per-runner attribution, or allowed with explicit aggregation-aware transforms?
- What threshold should trigger a provider process-quality downgrade when a single metric (for example nominations timeliness) misses target but uptime remains healthy?
- How many days after month-end should `missing_expected_month_flag` become a hard reliability alert versus a soft warning?
- Should publication-cadence penalties affect only model confidence, or also execution caps for strategies dependent on provider freshness?

## Ranked implementation backlog (delta, pass 32)

### P0 additions

1. Implement `cleared_orders_rollup_contract` and reject attribution joins when settlement grain is ambiguous.
2. Build `cleared_orders_rollup_audit` and require `groupBy=BET` for any per-bet PnL/execution diagnostic workflow.
3. Add `provider_process_sla_kpi` and `provider_system_uptime_kpi` ingestion with separate reliability scores.
4. Add `provider_publication_cadence_snapshot` and alerting on missing expected monthly reports.

### P1 additions

1. Run attribution-drift experiments comparing `groupBy=BET` versus higher roll-ups under aggregation-aware transforms.
2. Calibrate reliability haircuts that combine process-SLA misses and publication-cadence gaps.
3. Add dashboard segmentation showing when uptime and process timeliness diverge.

## Sources for this update (pass 32)

- Betfair `listClearedOrders - Roll-up Fields Available` (updated 2024-06-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687679/listClearedOrders%2B-%2BRoll-up%2BFields%2BAvailable
- Racing Australia monthly performance index: https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx
- Racing Australia Monthly Service Standard Performance Report (January 2026): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-January-2026.pdf

## Incremental architecture decisions from this run (2026-03-30, pass 34)

- Decision: add a `betfair_auth_session_regime` control plane with jurisdiction-aware keep-alive cadence and login-rate budgeting.
- Why: Betfair documents finite session TTLs, explicit keep-alive dependence, and `100/min` login limits with `20-minute` temporary session-creation bans.
- Decision: split Racing Australia provider reliability into `monthly_kpi`, `planned_outage`, and `incident_event` streams.
- Why: RA's independent systems-status site and Oracle migration notice expose intramonth outage windows and affected feed surfaces not recoverable from monthly KPI PDFs alone.
- Decision: add feed-surface-level gating for RA ingestion dependencies (`xml`, `ftp`, `mviews/shareplex`, `sns` modules).
- Why: migration and maintenance notices are module/surface specific; all-or-nothing provider flags would overblock or miss targeted failures.

## Provider comparison (incremental high-signal additions, pass 34)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Login & Session Management + Keep-Alive support | Explicit login rate limits, temporary-ban behavior, session TTL by jurisdiction, and AU/NZ keep-alive endpoint routing | Session rules can vary by jurisdiction/account settings; requires runtime telemetry and watchdogs | A | Implement auth-session regime service with keep-alive scheduler, rate budgeter, and ban-state alerts |
| Racing Australia systems status + Oracle migration release | Independent outage publication channel plus module-level outage scope/timing for planned and major infra events | Status posts are advisory web content, so we must snapshot quickly for PIT lineage | A | Build outage-event ingestion and feed-surface-specific gating in provider health layer |

## Data contract additions required (incremental, pass 34)

- `betfair_auth_session_regime`:
- `captured_ts`, `jurisdiction`, `session_ttl_sec`, `keepalive_endpoint`, `login_limit_per_min`, `temp_ban_duration_sec`, `source_url`.
- `betfair_auth_session_event`:
- `session_id`, `event_ts`, `event_type(login|keepalive|logout|no_session|temp_ban)`, `status`, `error_code`, `requests_last_min`, `temp_ban_until_ts`, `source_url`.
- `ra_status_event`:
- `event_id`, `published_ts`, `event_type(planned|unplanned|migration)`, `title`, `window_start_local`, `window_end_local`, `independent_status_site_flag`, `source_url`.
- `ra_status_event_surface`:
- `event_id`, `surface_name`, `affected_flag`, `notes`.
- `provider_outage_regime_snapshot`:
- `provider`, `captured_ts`, `active_outage_flag`, `outage_type`, `surface_scope_json`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 34)

- For AU/NZ deployment, what keep-alive cadence buffer should we set relative to documented session TTL to avoid edge expiry without excess churn?
- Should `TEMPORARY_BAN_TOO_MANY_REQUESTS` force an immediate trading halt, or can we continue with existing sessions under reduced operational mode?
- What precedence should apply when RA monthly KPIs look healthy but independent status posts indicate active or recent module outages?
- Do we require confirmation from multiple RA channels (status site + monthly report + provider logs), or is status-site publication sufficient for hard feature gating?

## Ranked implementation backlog (delta, pass 34)

### P0 additions

1. Implement `betfair_auth_session_regime` with jurisdiction-aware keep-alive scheduling and login-rate budget enforcement.
2. Add `betfair_auth_session_event` telemetry and hard alerts for `NO_SESSION` and `TEMPORARY_BAN_TOO_MANY_REQUESTS` states.
3. Ingest `ra_status_event` notices and join them to capture windows in PIT pipelines.
4. Add surface-level provider gates so RA XML/FTP/SNS degradations only disable dependent strategy modules.

### P1 additions

1. Run outage-conditioned backtests to quantify model/calibration drift when training rows overlap known provider outage windows.
2. Tune auth-health confidence haircuts using keep-alive failure streaks and re-login burst rates.
3. Build dashboard panels contrasting monthly KPI reliability versus intramonth outage-event frequency/severity.

## Sources for this update (pass 34)

- Betfair Login & Session Management (updated 2025-09-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687869/Login%2BSession%2BManagement
- Betfair support: How do I keep my API session alive? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/360002773032-How-do-I-keep-my-API-session-alive
- Racing Australia Systems Status Updates: https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status post: Planned Maintenance - Thursday 5th March 2026: https://racingaustraliasystemsstatus.horse/planned-maintenance-thursday-5th-march-2026.html
- Racing Australia media release: Data Centre move to Oracle Cloud Infrastructure (July 2025): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Australia-Data-Centre-move-to-Oracle-Cloud-Infrastructure.pdf

## Incremental architecture decisions from this run (2026-03-30, pass 35)

- Decision: add an `order_intent_transform_registry` that tracks submission intent (`betTargetType`/`betTargetSize`) separately from queued stake representation.
- Why: Betfair payout/profit-target orders can transition to stake-based unmatched residuals, which breaks naive one-shape order assumptions.
- Decision: add `time_in_force_contract` validation in execution simulation and live order submission.
- Why: Betfair `timeInForce`/`minFillSize` semantics materially change fill behavior and should be treated as explicit execution regimes.
- Decision: split provider ingestion into `provider_curated_feed` and `user_authored_feed` classes for Punting Form.
- Why: Punting Form API includes both canonical feed endpoints and user-edited endpoints (`User/Speedmaps`, `User/Notes`), which require different provenance and model-governance rules.

## Provider comparison (incremental high-signal additions, pass 35)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `placeOrders` + Betting Type Definitions | Target-outcome order semantics (`betTargetType`/`betTargetSize`), queue-transition behavior, and `timeInForce`/`minFillSize` execution controls | Lifecycle state can change representation after submission; easy to misattribute slippage if intent vs queue state is not preserved | A | Build intent-transform ledger and enforce time-in-force aware simulator/live parity checks |
| Punting Form API (`Updates/Conditions`, `User/Speedmaps`, `User/Notes`) | Meeting-condition feed fields plus explicit user-authored endpoint surfaces | User-authored endpoints can contaminate canonical model training unless provenance-gated | A | Introduce feed-class partition (`provider_curated` vs `user_authored`) with default deny for user-authored model ingestion |

## Data contract additions required (incremental, pass 35)

- `order_intent_transform_event`:
- `order_id`, `event_ts`, `bet_target_type`, `bet_target_size`, `size_submitted`, `size_remaining`, `representation_mode(target|stake)`, `conversion_detected_flag`, `source_url`.
- `time_in_force_contract_snapshot`:
- `captured_ts`, `time_in_force`, `min_fill_size_present_flag`, `persistence_type`, `contract_notes`, `source_url`.
- `provider_feed_class_registry`:
- `provider`, `endpoint_path`, `endpoint_family`, `feed_class(provider_curated|user_authored)`, `token_scope`, `snapshot_ts`, `source_url`.
- `feature_provenance_gate`:
- `feature_family`, `required_feed_class`, `user_authored_allowed_flag`, `approval_owner`, `evaluated_ts`.
- `meeting_conditions_snapshot`:
- `meeting_id`, `captured_ts`, `track_grade`, `weather_text`, `provider_endpoint`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 35)

- Should `betTargetType` orders be allowed in the first live pilot, or deferred until intent-transform telemetry is proven stable in paper trading?
- What tolerance threshold should flag unacceptable divergence between submitted target-outcome intent and post-queue stake representation?
- Who can approve `user_authored` feed-class promotion into model features, and what audit evidence is mandatory?
- Do we keep `meeting_conditions` as core production features immediately, or stage them behind a freshness/provenance quality gate first?

## Ranked implementation backlog (delta, pass 35)

### P0 additions

1. Implement `order_intent_transform_event` logging and block execution analytics when intent/queue lineage is missing.
2. Add `time_in_force_contract_snapshot` checks to both simulator and live order path.
3. Build `provider_feed_class_registry` for Punting Form endpoints with enforced `provider_curated` default in training pipelines.
4. Add `feature_provenance_gate` policy so user-authored endpoints cannot enter production models without explicit approval.

### P1 additions

1. Run A/B replay comparing stake-native vs target-outcome instructions for fill/slippage stability near jump.
2. Add dashboard metrics for intent-to-queue conversion frequency by market type and latency window.
3. Evaluate predictive lift from `meeting_conditions` features under strict freshness/provenance filters.

## Sources for this update (pass 35)

- Betfair `placeOrders` (updated 2025-01-07): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Betting Type Definitions: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Punting Form API docs: `Conditions`: https://docs.puntingform.com.au/reference/conditions
- Punting Form API docs: `User/Speedmaps`: https://docs.puntingform.com.au/reference/speedmaps
- Punting Form API docs: `User/Notes`: https://docs.puntingform.com.au/reference/notes

## Incremental architecture decisions from this run (2026-03-30, pass 36)

- Decision: add a `market_data_contract_version_registry` for Betfair support/doc-derived market-surface semantics.
- Why: Betfair's mapping article now has a newer revision timestamp (2026-03-27) and clarifies virtual-ladder/all-level behavior and traded-volume surface distinctions (`EX_TRADED` vs `EX_TRADED_VOL`).
- Decision: split sectional feature contracts into `form_core` and `sectional_benchmark_enhanced` entitlement classes.
- Why: current Punting Form docs/API indicate `MeetingSectionals`/`MeetingBenchmarks` are Modeller-or-commercial gated while `Form` is Starter+, so prior single-tier assumptions are unsafe.
- Decision: add a `sectional_split_schema` contract and missingness regime metadata.
- Why: provider docs define mandatory split families (`600/400/200/100`) plus optional longer splits (`1200/1000/800`) that vary with marker/vision availability.

## Provider comparison (incremental high-signal additions, pass 36)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support mapping page (updated 2026-03-27) | Revised market-data contract metadata (virtual-price lag context, all-level virtual ladder note, explicit `EX_TRADED` vs `EX_TRADED_VOL` surface split) | Support layer can change without schema versioning; must snapshot and diff revisions | A | Introduce contract-version registry and enforce surface-specific feature generation |
| Punting Form Sectional Data + API endpoint refs | Explicit split taxonomy, region coverage statements, and endpoint-level tier boundaries (`Form` vs `MeetingSectionals/Benchmarks`) | Coverage claims are provider-stated; endpoint availability is tier/commercial-contract dependent | A/B | Add entitlement-aware dual model tracks (`starter_form_only` vs `modeller_sectionals`) and split-schema missingness controls |

## Data contract additions required (incremental, pass 36)

- `market_data_contract_version`:
- `captured_ts`, `provider`, `doc_url`, `source_updated_ts`, `contract_hash`, `change_detected_flag`.
- `market_price_surface_contract`:
- `surface_family(ex_best_offers|ex_best_offers_disp|ex_all_offers|ex_traded|ex_traded_vol)`, `virtual_ladder_all_levels_flag`, `nominal_lag_ms`, `ladder_depth_min`, `ladder_depth_max`, `source_url`.
- `sectional_split_schema`:
- `provider`, `mandatory_split_set_json`, `optional_split_set_json`, `marker_dependency_flag`, `vision_dependency_flag`, `snapshot_ts`, `source_url`.
- `provider_endpoint_entitlement_snapshot`:
- `provider`, `endpoint_name`, `min_tier_required`, `commercial_required_flag`, `token_auth_required_flag`, `snapshot_ts`, `source_url`.
- `sectional_capture_missingness`:
- `provider`, `region`, `track_code`, `season`, `mandatory_missing_rate`, `optional_missing_rate`, `capture_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 36)

- What drift threshold in `market_data_contract_version` should trigger mandatory replay re-baselining versus soft alerting?
- Should virtual/display-ladder data be allowed in production models by default, or only in explicit `display-parity` feature families?
- For Punting Form, what contract evidence is required before promoting `MeetingSectionals`/`MeetingBenchmarks` from paper to live scoring?
- How should we set fallback behavior when mandatory splits are present but optional long splits are missing for a venue/day?

## Ranked implementation backlog (delta, pass 36)

### P0 additions

1. Implement `market_data_contract_version_registry` and block silent contract drift in collectors/replay pipelines.
2. Add `market_price_surface_contract` checks so `EX_TRADED` and `EX_TRADED_VOL` cannot be conflated in feature pipelines.
3. Enforce endpoint-level entitlement gating for `Form` vs `MeetingSectionals`/`MeetingBenchmarks` with per-run audit logs.
4. Build `sectional_split_schema` validation and fail-safe missingness tagging for mandatory vs optional splits.

### P1 additions

1. Run model-ablation tests comparing raw-traded-ladder (`EX_TRADED`) versus aggregate-traded-volume (`EX_TRADED_VOL`) liquidity features.
2. Build dual promotion tracks (`starter_form_only`, `modeller_sectionals`) with separate CLV/calibration thresholds.
3. Add regional missingness dashboards for sectional split availability (AUS/SG/HK/NA) and feed these into confidence haircuts.

## Sources for this update (pass 36)

- Betfair support mapping page (updated 2026-03-27): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Punting Form Sectional Data docs: https://docs.puntingform.com.au/docs/sectional-data
- Punting Form API reference `MeetingSectionals`: https://docs.puntingform.com.au/reference/meetingsectionals
- Punting Form API reference `MeetingBenchmarks`: https://docs.puntingform.com.au/reference/meetingbenchmarks
- Punting Form API reference `Form`: https://docs.puntingform.com.au/reference/form-1

## Incremental architecture decisions from this run (2026-03-30, pass 37)

- Decision: add a `market_discovery_contract_guard` for Betfair collector filters.
- Why: Betfair documents non-obvious filter semantics (`textQuery` event-name scope, `marketCountries` fallback behavior) that can silently drop AU racing markets.
- Decision: add `best_price_execution_regime` metadata to execution and replay pipelines.
- Why: Betfair Exchange rules frame Best Price Execution as default-on, with disablement scoped via UK-resident controls; replay assumptions must remain jurisdiction-aware.
- Decision: add `vic_mbl_policy_engine` for future fixed-odds routing (kept dormant in Betfair-only phase).
- Why: Racing Victoria minimum-bet rules include explicit fixed-odds timing/limit/exclusion contracts that cannot be inherited safely from NSW/QLD policy logic.

## Provider comparison (incremental high-signal additions, pass 37)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Betting Type Definitions + Exchange General Rules | Canonical filter-semantics details (`textQuery`, country fallback, venue scope) plus Best Price Execution default/toggle behavior | Documentation-level contract can drift; semantics are easy to misapply in generic collectors | A | Add filter-contract registry and jurisdiction-aware execution-option metadata |
| Racing Victoria Minimum Bet Limit policy page | Explicit VIC fixed-odds minimum-bet thresholds, exclusions, and complaint-window policy semantics | Policy page can be updated without API versioning; applies to fixed-odds, not exchange | A | Build dormant VIC policy engine now and activate only when fixed-odds routing is enabled |

## Data contract additions required (incremental, pass 37)

- `market_discovery_contract_snapshot`:
- `captured_ts`, `provider`, `text_query_scope`, `market_country_fallback`, `venues_filter_scope`, `source_url`.
- `market_discovery_audit`:
- `capture_ts`, `filter_payload_hash`, `event_type`, `country_filter`, `result_count`, `default_country_fallback_applied_flag`, `source_url`.
- `best_price_execution_regime`:
- `captured_ts`, `default_on_flag`, `disable_scope`, `account_jurisdiction`, `source_url`.
- `vic_mbl_policy_snapshot`:
- `captured_ts`, `effective_date`, `fixed_odds_only_flag`, `post_final_acceptances_only_flag`, `metro_win_limit`, `metro_place_limit`, `non_metro_win_limit`, `non_metro_place_limit`, `complaint_window_days`, `source_url`.
- `vic_mbl_exclusion_matrix`:
- `captured_ts`, `exchange_transaction_excluded_flag`, `multi_bet_excluded_flag`, `retail_excluded_flag`, `insufficient_funds_excluded_flag`, `integrity_exception_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 37)

- Should the collector classify empty Betfair discovery responses as `contract_mismatch` before raising provider-outage alerts?
- For AU accounts, do we treat Best Price Execution as effectively non-configurable in simulation, or expose a strategy-level override only for UK-linked accounts?
- When fixed-odds is introduced, should VIC MBL eligibility checks run pre-price-request, pre-order-submit, or both?
- What evidence bundle should be stored for each rejected fixed-odds order to support 14-day complaint windows under VIC policy?

## Ranked implementation backlog (delta, pass 37)

### P0 additions

1. Implement `market_discovery_contract_snapshot` and attach contract hashes to every Betfair discovery run.
2. Add `market_discovery_audit` classifications (`empty_due_to_filter_contract` vs `empty_due_to_provider_state`) before outage escalation.
3. Add `best_price_execution_regime` metadata into replay/execution datasets so fill models are jurisdiction-aware.
4. Create `vic_mbl_policy_snapshot` + `vic_mbl_exclusion_matrix` ingestion stubs and policy tests (kept inactive in Betfair-only execution mode).

### P1 additions

1. Run discovery-robustness tests comparing strict country filters vs fallback-aware retrieval for AU horse markets.
2. Add simulator variants for Best Price Execution-on vs strict-price path to quantify CLV/fill sensitivity.
3. Build fixed-odds policy-router prototype for VIC/NSW/QLD with shared interface and jurisdiction-specific rule packs.

## Sources for this update (pass 37)

- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%2BType%2BDefinitions
- Betfair Exchange Introduction & General Rules (Best Price Execution): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Racing Victoria Minimum Bet Limit policy/FAQ page: https://www.racingvictoria.com.au/wagering/minimum-bet-limit

## Incremental architecture decisions from this run (2026-03-30, pass 38)

- Decision: add an `order_persistence_update_contract` for Betfair `updateOrders` as a first-class execution path.
- Why: Betfair explicitly scopes `updateOrders` to non-exposure changes with dedicated instruction/report semantics and request limits; this should not be merged into cancel/replace logic.
- Decision: add a `betting_endpoint_regime_registry` keyed by account jurisdiction.
- Why: Betfair betting API docs specify jurisdiction-dependent base endpoints (global vs NZ `.com.au`) that can impact routing correctness and reconciliation.
- Decision: add a `provider_docs_signal_strength` layer for Australian providers (starting with Punting Form) that treats docs-version labels as advisory only.
- Why: public docs-version signals remain coarse (`v1.0` marker), so deployment gates should be driven by endpoint-schema and entitlement snapshots.

## Provider comparison (incremental high-signal additions, pass 38)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `updateOrders` + Betting Type Definitions | Canonical persistence-only mutation path (`UpdateInstruction.newPersistenceType`), explicit non-exposure scope, and update instruction limits | Easy to misclassify as generic order edit and pollute exposure-change analytics | A | Build dedicated update-path ledger and persistence-transition telemetry |
| Betfair Betting API endpoint matrix | Jurisdiction-specific endpoint routing requirement (global vs NZ betting endpoints) | Incorrect endpoint base can create subtle transport/routing failures and reconciliation noise | A | Enforce endpoint-regime selection + audit at startup and token-refresh |
| Punting Form docs surface (`getting-started`) | Public documentation version/navigation signal (`v1.0`, changelog nav) | Coarse docs-version signal is insufficient as sole contract-drift detector | A/B | Use docs signal as advisory; keep endpoint/entitlement snapshots as hard gates |

## Data contract additions required (incremental, pass 38)

- `order_persistence_update_contract_snapshot`:
- `captured_ts`, `provider`, `market_id_required_flag`, `max_update_instructions`, `customer_ref_max_len`, `non_exposure_only_flag`, `source_url`.
- `order_persistence_update_event`:
- `order_id`, `market_id`, `event_ts`, `new_persistence_type`, `customer_ref`, `instruction_status`, `instruction_error_code`, `source_url`.
- `betting_endpoint_regime_registry`:
- `captured_ts`, `account_region`, `jsonrpc_base_url`, `rest_base_url`, `selection_rule`, `source_url`.
- `api_endpoint_regime_audit`:
- `call_ts`, `operation_name`, `endpoint_base_url`, `account_region`, `regime_match_flag`, `mismatch_reason`, `source_url`.
- `provider_docs_signal_snapshot`:
- `provider`, `captured_ts`, `visible_version_label`, `changelog_nav_present_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 38)

- Should persistence updates (`updateOrders`) be enabled in the first live pilot, or delayed until we have stable persistence-transition telemetry in paper mode?
- What mismatch policy should apply when endpoint base URL conflicts with inferred account region (hard block vs degraded mode)?
- Do we require both docs-signal and endpoint-schema drift before escalating provider-contract alerts, or treat endpoint drift as sufficient alone?
- Which minimum persistence-transition event set is required before we trust fill/slippage attribution around suspend boundaries?

## Ranked implementation backlog (delta, pass 38)

### P0 additions

1. Implement `order_persistence_update_contract_snapshot` and enforce `updateOrders` instruction-count prechecks.
2. Add `order_persistence_update_event` lineage so persistence flips are visible in replay and execution diagnostics.
3. Build `betting_endpoint_regime_registry` + startup validator for jurisdiction-correct endpoint routing.
4. Add `api_endpoint_regime_audit` and hard alerts for endpoint-regime mismatch.

### P1 additions

1. Run paper-trading experiments comparing persistence-updated orders vs cancel/replace paths near suspend.
2. Add `provider_docs_signal_snapshot` dashboards and compare docs-signal drift vs endpoint-schema drift incidence.
3. Calibrate confidence haircuts for sessions with endpoint-regime mismatch or missing persistence-update lineage.

## Sources for this update (pass 38)

- Betfair `updateOrders` operation (updated 2024-06-19): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687485/updateOrders
- Betfair Betting Type Definitions (`UpdateInstruction` / `UpdateExecutionReport`): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Betfair Betting API endpoint matrix (global vs NZ endpoint routing): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687158/Betting%2BAPI
- Punting Form Getting Started docs surface (`Guides`/`API Reference`/`Changelog`, `v1.0` marker): https://docs.puntingform.com.au/docs/getting-started

## Incremental architecture decisions from this run (2026-03-30, pass 40)

- Decision: add an `ra_sns_access_governor` and treat SNS-derived data as rights-constrained by default.
- Why: Racing Australia SNS pages explicitly scope access to authorised business users and prohibit personal gain/commercial third-party sharing without approval.
- Decision: extend `commingling_regime_snapshot` to a multi-season HK baseline (`FY2023/24` + `FY2024/25`) and separate commingled-share from total-turnover trend.
- Why: HKJC reports strong commingling growth can co-exist with overall racing-turnover decline, so single-axis liquidity assumptions are unsafe.
- Decision: add `docs_capture_access_mode` metadata to Betfair contract-drift monitoring.
- Why: current Betfair docs surfaces can show anonymous-content blocking while historical versions remain visible; drift checks need visibility-state awareness.

## Provider comparison (incremental high-signal additions, pass 40)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia SNS login + SNS Code of Conduct | Explicit national-system purpose, authorised-user scope, business-use-only terms, and non-public sharing restrictions | Rights/usage constraints are legal controls, not optional engineering preferences | A | Add hard access-governor and entitlement lineage before any SNS-derived data enters model pipelines |
| HKJC FY2023/24 corporate release | Prior-year commingling share/turnover plus World Pool-simulcast decomposition for trend analysis | HK market structure still differs from AU exchange-first routing | A | Use two-season commingling baseline for portability and liquidity-regime stress tests |
| Betfair Additional Information (current + historical surfaces) | Contract-observability signal (`Updated Mar 19`, anonymous-blocking note, historical table visibility) | Contract visibility can depend on session/auth mode | A/B | Persist docs access-mode metadata and require re-capture before escalating drift alerts |

## Data contract additions required (incremental, pass 40)

- `ra_sns_access_regime_snapshot`:
- `captured_ts`, `provider`, `authorised_user_scope`, `business_use_only_flag`, `third_party_sharing_restricted_flag`, `personal_gain_prohibited_flag`, `usage_monitoring_flag`, `source_url`.
- `provider_rights_gate_event`:
- `event_ts`, `provider`, `dataset_family`, `rights_check_status`, `commercial_approval_ref`, `blocked_flag`, `reason_code`, `source_url`.
- `commingling_regime_snapshot` (extension):
- `report_period`, `commingled_turnover_hkd`, `commingled_share_pct`, `world_pool_simulcast_turnover_hkd`, `additional_overseas_races`, `total_racing_turnover_hkd`, `source_url`.
- `docs_capture_access_mode_snapshot`:
- `captured_ts`, `provider`, `doc_url`, `access_mode`, `content_blocked_flag`, `visible_section_count`, `page_updated_text`, `source_url`.
- `docs_drift_recheck_event`:
- `event_ts`, `provider`, `doc_url`, `trigger_reason(access_mode_change|section_missing|revision_change)`, `recheck_status`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 40)

- What minimum commercial-approval artifact is required before SNS-derived data can move from operational support to model-training surfaces?
- Should rights-gate failures hard-stop ingestion jobs, or degrade to metadata-only capture mode for audit continuity?
- For HK portability scoring, what threshold of divergence between commingled-share and total-turnover trend should force parameter re-tuning?
- For Betfair docs drift alerts, should anonymous-blocked captures always trigger authenticated re-fetch before paging humans?

## Ranked implementation backlog (delta, pass 40)

### P0 additions

1. Implement `ra_sns_access_regime_snapshot` and enforce `provider_rights_gate_event` checks before persistence to feature stores.
2. Extend commingling snapshots to include FY2023/24 + FY2024/25 trend fields and wire into regime-risk dashboards.
3. Add `docs_capture_access_mode_snapshot` and block contract-drift promotions when capture visibility is incomplete.
4. Add authenticated re-fetch fallback for Betfair docs when anonymous capture reports blocked sections.

### P1 additions

1. Build a portability stress test using HKJC two-season commingling-vs-total-turnover divergence as a calibration prior.
2. Add entitlement lineage dashboards showing which datasets are blocked by RA SNS rights constraints.
3. Tune alerting policy for `docs_drift_recheck_event` to reduce false positives from access-mode changes.

## Sources for this update (pass 40)

- Racing Australia SNS login page: https://racingaustralia.horse/IndustryLogin/SNS_Login.aspx
- Racing Australia SNS Code of Conduct (updated May 2021): https://racingaustralia.horse/AboutUs/Single-National-System-Code-of-Conduct.aspx
- HKJC FY2023/24 results release (published 2024-09-04): https://corporate.hkjc.com/corporate/corporate-news/english/2024-09/news_2024090402030.aspx
- Betfair Additional Information (current page surface): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2686993/Additional%2BInformation
- Betfair Additional Information (historical visible table version): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053

## Incremental architecture decisions from this run (2026-03-30, pass 41)

- Decision: add a `caw_flow_concentration_registry` that fuses institutional-share estimates with regulator-published hub-handle concentration.
- Why: CAW impact is better represented as a measurable concentration state than a binary late-bet narrative.
- Decision: formalize a `betfair_request_shape_contract` from the developer weight matrix (including non-additive combos and catalogue weights).
- Why: request shaping can be deterministic pre-dispatch; reactive retry logic is avoidable and degrades freshness near jump.
- Decision: add a `provider_release_clock_registry` for third-party ratings products (starting with Punting Form PF AI).
- Why: provider release windows and benchmark-price conventions materially affect feature freshness, benchmark alignment, and reproducibility.

## Provider comparison (incremental high-signal additions, pass 41)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Oregon Racing Commission ADW reports + TIF Wagering Insecurity | Observable hub-level handle concentration plus institutional-share estimates for high-volume syndicate footprint modeling | TIF share band is estimate (not regulator disclosure); jurisdiction is U.S.-centric | A/B | Build CAW concentration regime features and keep share estimates as bounded priors |
| Betfair Market Data Request Limits (developer docs) | Explicit request-budget algebra (`<=200`), non-additive combo weights, depth-scaling formula, and catalogue-weight costs | Matrix can drift; planner must be versioned and source-hashed | A | Implement deterministic request-shaping before dispatch and attach contract hash to collector runs |
| Punting Form PF AI Ratings docs | Release-window semantics (within 1 hour of market open) and benchmark convention (TAB fixed odds at release) | Provider-published performance claims are marketing-grade until reproduced | B/C | Add provider release-clock metadata and quarantine claim-based metrics pending internal PIT validation |

## Data contract additions required (incremental, pass 41)

- `caw_flow_concentration_snapshot`:
- `captured_ts`, `jurisdiction`, `season`, `institutional_share_low_pct`, `institutional_share_high_pct`, `source_type(estimate|regulatory)`, `source_url`.
- `hub_handle_operator_snapshot`:
- `captured_ts`, `jurisdiction`, `calendar_year`, `operator_name`, `operator_handle_usd`, `total_handle_usd`, `operator_share_pct`, `source_url`.
- `betfair_request_shape_contract_snapshot`:
- `captured_ts`, `source_updated_ts`, `combo_key`, `combo_weight`, `depth_scaling_formula`, `catalogue_projection_weights_json`, `source_url`.
- `collector_request_shape_event`:
- `request_id`, `dispatch_ts`, `projected_weight_product`, `shape_action(split|reduce_depth|defer)`, `predicted_margin_to_limit`, `source_url`.
- `provider_release_clock_snapshot`:
- `provider`, `product`, `captured_ts`, `release_window_minutes_from_market_open`, `benchmark_price_surface`, `coverage_scope`, `source_url`.
- `provider_claim_validation_event`:
- `provider`, `product`, `claim_window_start`, `claim_window_end`, `validation_status`, `validation_dataset_ref`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 41)

- What threshold in `operator_share_pct` (top-1 or top-2) should trigger a CAW-concentration regime switch in late-window models?
- Should `caw_flow_concentration_snapshot` be hard-required for U.S.-sourced transfer-learning experiments, or optional with confidence haircuts?
- For Betfair collectors, what is the default shape policy near jump when projected weight exceeds budget: split requests or reduce depth first?
- How much tolerance is acceptable between provider benchmark surface (TAB-at-release) and our execution benchmark surface before we reject third-party scorecards?

## Ranked implementation backlog (delta, pass 41)

### P0 additions

1. Implement `betfair_request_shape_contract_snapshot` + `collector_request_shape_event` and block over-limit dispatches by policy.
2. Build `provider_release_clock_snapshot` ingestion for Punting Form products and enforce release-phase tagging in feature pipelines.
3. Create `caw_flow_concentration_snapshot` with initial bounded priors and wire regime flags into late-window model segmentation.
4. Add `provider_claim_validation_event` workflow so marketing claims cannot promote models without internal PIT replay evidence.

### P1 additions

1. Add concentration-regime stress tests comparing low vs high institutional-share priors on late-odds jump models.
2. Train data-freshness challengers using `predicted_margin_to_limit` to quantify quality loss from aggressive request shaping.
3. Build benchmark-translation diagnostics (TAB-at-release vs Betfair-at-release) for third-party signal evaluation.

## Sources for this update (pass 41)

- Thoroughbred Idea Foundation, *Wagering Insecurity*: https://racingthinktank.com/reports/wagering-insecurity
- Oregon Racing Commission ADW hub page: https://www.oregon.gov/racing/Pages/Advance-Deposit-Wagering.aspx
- Oregon Racing Commission quarterly multi-jurisdictional handle PDF: https://www.oregon.gov/racing/Parimutuel%20Handle/MJ%20Hubs%20Stats/QT%20HND.pdf
- Betfair Market Data Request Limits: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687478/Market%2BData%2BRequest%2BLimits
- Punting Form PF AI Ratings docs: https://docs.puntingform.com.au/docs/punting-form-ai-ratings

## Incremental architecture decisions from this run (2026-03-30, pass 42)

- Decision: add a `qld_race_info_authority_registry` with explicit authority-cycle and onboarding-fee metadata.
- Why: Racing Queensland documents a fixed 2025-07-01 to 2027-06-30 authority cycle, Section 133 offence semantics for unauthorised use, and differentiated onboarding conditions.
- Decision: add a `qld_submission_profile_router` keyed by operator turnover band and channel profile.
- Why: RQ publishes separate over/under `$5m` artefacts plus distinct FTP/oncourse submission instructions effective 2025-07-01, so one parser contract is insufficient.
- Decision: add an `au_race_volume_baseline_snapshot` seeded from Racing Australia Fact Book 2024/25.
- Why: Fact Book national counts show strong TAB/non-TAB and metro/country segmentation; capacity planning and model cadence should be regime-specific.

## Provider comparison (incremental high-signal additions, pass 42)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Queensland race-information authority page | Primary legal/operational contract for QLD race-info use (authority period, offence semantics, application fee, submission artefact matrix) | Web-page and linked artefacts can change outside API versioning; requires snapshotting by effective date | A | Build authority-registry + submission-profile router before any QLD-authority ingestion automation |
| Racing Australia Fact Book 2025 (pages 12, 70) | National 2024/25 race-volume segmentation (TAB/non-TAB, meetings/races/starters, metro-country trend) for workload and sample-size priors | Statistical publication cadence is seasonal, not real-time operational telemetry | A | Use as baseline priors for collector capacity, retraining cadence, and slice-level acceptance thresholds |

## Data contract additions required (incremental, pass 42)

- `qld_race_info_authority_snapshot`:
- `captured_ts`, `period_start`, `period_end`, `section_133_offence_without_authority_flag`, `new_applicant_fee_aud`, `source_url`.
- `qld_submission_profile_contract`:
- `captured_ts`, `operator_band(over_5m|under_5m|oncourse)`, `transport_mode(ftp|portal)`, `template_effective_from`, `definitions_required_flag`, `source_url`.
- `qld_authority_audit_event`:
- `event_ts`, `operator_id`, `authority_status`, `profile_selected`, `contract_match_flag`, `failure_reason`, `source_url`.
- `au_race_volume_baseline_snapshot`:
- `season`, `tab_meetings_count`, `non_tab_meetings_count`, `tab_races_count`, `non_tab_races_count`, `tab_starters_count`, `non_tab_starters_count`, `source_url`.
- `au_race_trend_baseline_snapshot`:
- `season`, `metro_races_count`, `country_races_count`, `total_races_count`, `total_races_yoy_pct`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 42)

- Should `qld_authority_audit_event.contract_match_flag=false` hard-block ingestion, or allow metadata-only capture for remediation?
- Which source is canonical when RQ page metadata and linked template artefacts diverge on effective dates?
- What minimum share of TAB-volume coverage must a slice have before it can qualify for weekly retraining cadence?
- Should non-TAB slices use distinct calibration targets and wider promotion confidence intervals by default?

## Ranked implementation backlog (delta, pass 42)

### P0 additions

1. Implement `qld_race_info_authority_snapshot` and block QLD ingestion jobs when authority period or status is unknown.
2. Build `qld_submission_profile_contract` + routing validator for over/under `$5m` and oncourse profile paths.
3. Seed `au_race_volume_baseline_snapshot` and `au_race_trend_baseline_snapshot` from Fact Book 2024/25 and wire into capacity-planning calculators.
4. Add `qld_authority_audit_event` to compliance telemetry and require daily contract-match checks.

### P1 additions

1. Build slice-density thresholds using TAB/non-TAB and metro/country baselines for retraining-cadence policy.
2. Add dashboard splits for model and execution metrics by `tab_segment` and `metro_country_segment`.
3. Add seasonal baseline refresh workflow to detect drift between published Fact Book priors and observed ingest volumes.

## Sources for this update (pass 42)

- Racing Queensland race-information authority page: https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Australia Fact Book 2025 page 12: https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/12/
- Racing Australia Fact Book 2025 page 70: https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/70/

## Incremental architecture decisions from this run (2026-03-30, pass 43)

- Decision: add a `betfair_market_visibility_regime` gate ahead of discovery/outage classification.
- Why: Betfair documents jurisdiction-dependent legal restrictions that can intentionally return empty responses (`listEvents`/`listMarketCatalogue`/`listMarketBook`), including Singapore horse-market scope constraints by customer region.
- Decision: implement an account-scoped `betfair_queue_contention_scheduler` for order-state endpoints.
- Why: Betfair support defines contention between `listMarketBook` (with order/match projections), `listCurrentOrders`, and `listMarketProfitAndLoss`; independent worker throttles are insufficient.
- Decision: extend `race_class_governance_timeline` with an explicit BTAG advisory layer.
- Why: Racing Australia (11 March 2026) formalized BTAG with independence constraints and advisory scope for black-type upgrades/downgrades/additions, introducing additional governance-path complexity.

## Provider comparison (incremental high-signal additions, pass 43)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Support (market visibility + queue contention) | Explicit legal-availability empty-response semantics by location/account regime and account-level cross-endpoint contention rules for request queues | Support-page contracts can drift; must snapshot update timestamp and source URL hash | A | Add legal-visibility classifier + global account scheduler for projection-heavy polling |
| Racing Australia BTAG media release (11 Mar 2026) | Formal governance-process update: approved advisory body, independence constraints, and black-type advice scope to PRA/APC | Governance process may continue evolving as transition matures | A | Add BTAG event lineage and widen class-label stability priors in transition windows |

## Data contract additions required (incremental, pass 43)

- `betfair_market_visibility_regime_snapshot`:
- `captured_ts`, `region_or_ip_group`, `restricted_market_scope`, `empty_response_expected_flag`, `source_url`.
- `market_visibility_classification_event`:
- `event_ts`, `account_region`, `request_filter_hash`, `empty_result_flag`, `classification`, `source_url`.
- `betfair_queue_contention_regime_snapshot`:
- `captured_ts`, `account_scoped_flag`, `contention_group_json`, `non_contention_operations_json`, `source_url`.
- `queue_contention_audit_event`:
- `event_ts`, `account_id_hash`, `operation_name`, `projection_mode`, `ready_queue_depth`, `error_code`, `source_url`.
- `black_type_governance_event`:
- `event_date`, `body_name`, `board_approved_flag`, `member_count`, `independence_constraints`, `advice_scope_json`, `downstream_bodies_json`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 43)

- Should legal-visibility empty responses (`classification=legal_restriction`) hard-exclude markets from freshness SLAs, or keep them in denominator with annotated exemptions?
- Under queue stress, should degraded mode first remove `MatchProjection`, then `OrderProjection`, or split by market priority tier?
- What minimum evidence bundle is required before reclassifying persistent empty responses from `legal_restriction` to `provider_state` incident?
- How should BTAG advisory events be mapped to class-label freeze windows in backtests (fixed-day buffer vs event-driven windows)?

## Ranked implementation backlog (delta, pass 43)

### P0 additions

1. Implement `betfair_market_visibility_regime_snapshot` and mandatory `market_visibility_classification_event` before outage escalation.
2. Build account-scoped `betfair_queue_contention_scheduler` and route `listMarketBook` (projection modes), `listCurrentOrders`, and `listMarketProfitAndLoss` through one queue governor.
3. Add `queue_contention_audit_event` telemetry with projection-mode tags and contention depth metrics.
4. Add `black_type_governance_event` ingestion and link race-class revisions to governance provenance in replay datasets.

### P1 additions

1. Backtest freshness/CLV impact under alternative degraded-mode ladders (`drop_match_projection_first` vs `drop_order_projection_first`).
2. Build legal-visibility dashboards by account region and market family (including Singapore horse-market routing checks).
3. Add class-stability sensitivity tests around BTAG/APC/PRA decision windows.

## Sources for this update (pass 43)

- Betfair support: market-visibility legal restrictions and region-scoped availability: https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listMarketCatalogue-API-response
- Betfair support: `TOO_MANY_REQUESTS` contention semantics (account-level, cross-endpoint): https://support.developer.betfair.com/hc/en-us/articles/360000406111-Why-am-I-receiving-the-TOO-MANY-REQUESTS-error
- Racing Australia media release index: https://www.racingaustralia.horse/FreeServices/MediaReleases.aspx
- Racing Australia BTAG announcement (11 March 2026): https://www.racingaustralia.horse/uploadimg/media-releases/Statement-on-formation-of-Black-Type-Advisory-Group.pdf

## Incremental architecture decisions from this run (2026-03-30, pass 44)

- Decision: add a `chrb_market_access_fee_regime` with monthly blended-takeout exception handling.
- Why: CHRB 2025-11 and 2026-01 board materials define explicit ADW deduction percentages and a `<15%` blended-takeout carve-out that can switch fee treatment by month.
- Decision: introduce a `betfair_vendor_distribution_regime` gate for productized/public clients.
- Why: Betfair vendor process imposes separate constraints (Vendor Web API requirement for web apps, browser-extension prohibition, country exclusions, certification fee, checklist throughput item) beyond exchange endpoint semantics.
- Decision: keep `provider_publication_cadence_snapshot` active for Racing Australia monthly KPI ingestion.
- Why: As of 2026-03-30 capture, Racing Australia's 2025-2026 index still lists January 2026 as latest, so KPI freshness should be treated as publication-lag constrained.

## Provider comparison (incremental high-signal additions, pass 44)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB board materials (Nov 2025 + Jan 2026) | Primary ADW market-access-fee mechanics: explicit deduction terms, statutory insufficiency context, and monthly blended-takeout `<15%` exception logic | California-jurisdiction specific; transfer to AU requires explicit portability checks | A | Build fee-regime state machine and monthly exception events before CA-sourced economics are reused |
| Betfair Developer Program Vendor Process | Distribution-layer requirements (Vendor Web API for web apps, non-permitted app/country combinations, certification cost, checklist throughput limit) | Program-policy surface can change independent of exchange API schemas | A | Add deployment mode split (`private` vs `vendor`) with hard compliance and throughput guards |
| Racing Australia performance-report index | Observable publication-cadence signal for monthly KPI availability | Index visibility does not explain cause of lag; needs ongoing refresh checks | A/B | Keep cadence monitor and avoid assuming month-end KPI availability in automation SLAs |

## Data contract additions required (incremental, pass 44)

- `chrb_market_access_fee_regime_snapshot`:
- `captured_ts`, `effective_from`, `effective_to`, `sv_deduction_pct_of_adw_handle`, `ctba_incentive_pct_of_adw_handle`, `statutory_offtrack_allocation_pct`, `blended_takeout_exception_threshold_pct`, `source_url`.
- `market_access_fee_exception_event`:
- `event_month`, `track_or_pool_group_id`, `blended_takeout_pct`, `exception_applied_flag`, `calculation_scope(non_commingled_single_racetrack)`, `source_url`.
- `betfair_vendor_regime_snapshot`:
- `captured_ts`, `vendor_web_api_required_for_web_app_flag`, `browser_extension_permitted_flag`, `blocked_vendor_application_countries_json`, `security_certification_fee_gbp`, `market_price_req_per_market_per_sec_limit`, `source_url`.
- `app_distribution_profile`:
- `app_id`, `distribution_mode(private_internal|vendor_distributed)`, `vendor_compliance_required_flag`, `last_validated_ts`, `source_url`.
- `vendor_throughput_guard_event`:
- `event_ts`, `app_id`, `market_id`, `observed_market_price_req_rate_per_sec`, `limit_breach_flag`, `mitigation_action`, `source_url`.
- `provider_publication_cadence_snapshot` (extension):
- `captured_ts`, `provider`, `latest_visible_report_month`, `expected_next_report_month`, `lag_months`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 44)

- For CHRB-style fee regimes, should monthly blended-takeout exception checks run as a hard pre-settlement gate or as post-settlement adjustment with revision events?
- If a strategy is later productized, do we keep one codepath with capability flags or maintain separate private/vendor execution services?
- Should vendor throughput guardrails (`<=5` market-price requests per market per second) be modeled as a hard kill-switch or graceful degradation profile?
- How many missed expected months in `provider_publication_cadence_snapshot` should trigger KPI-confidence downgrades in provider-health models?

## Ranked implementation backlog (delta, pass 44)

### P0 additions

1. Implement `chrb_market_access_fee_regime_snapshot` and `market_access_fee_exception_event` with monthly blended-takeout exception evaluation.
2. Add `betfair_vendor_regime_snapshot` plus startup compliance validation keyed by `app_distribution_profile`.
3. Enforce `vendor_throughput_guard_event` monitoring in any vendor-distributed execution surface.
4. Extend `provider_publication_cadence_snapshot` checks and apply confidence haircuts when monthly KPI publication lags persist.

### P1 additions

1. Run backtests on fee-sensitive strategy PnL with and without blended-takeout exception activation.
2. Build deployment-mode experiments comparing private-stack vs vendor-constrained request policies on freshness and fill quality.
3. Add alerting policy for prolonged Racing Australia monthly-report lag and track impact on provider-SLA assumptions.

## Sources for this update (pass 44)

- CHRB board item (2025-11-19): 2026 Southern California Stabling and Vanning ADW fee distribution terms: https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052626&SubCategory=
- CHRB board item (2026-01-14): blended-takeout `<15%` exception clause for modified market-access-fee distributions: https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052699&SubCategory=
- Betfair Developer Program vendor process: https://developer.betfair.com/vendor-program/the-process/
- Racing Australia monthly performance report index: https://www.racingaustralia.horse/freeservices/performancereport.aspx

## Incremental architecture decisions from this run (2026-03-30, pass 45)

- Decision: add a venue-level `caw_policy_parameter_registry` with effective-dated cutoff and pool-scope fields.
- Why: Del Mar's 2025-07-29 policy sets a 2-minute CAW cutoff for win pools, reinforcing that CAW controls are venue-specific and cannot be hardcoded from one jurisdiction template.
- Decision: add a versioned `betfair_currency_parameter_contract` with page-version and access-mode lineage.
- Why: Betfair Additional Information snapshots show materially different AUD minimums across versions; runtime validation must follow captured contract version, not static assumptions.
- Decision: extend AU provider modeling with `provider_distribution_role` classification.
- Why: Racing and Sports documents an approved-distributor/intermediary role that is operationally distinct from direct endpoint providers.

## Provider comparison (incremental high-signal additions, pass 45)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Del Mar official press release (29 Jul 2025) | Explicit CAW control parameter (`2` minutes pre-post) and affected pool scope (win) | Venue-specific policy; portability requires venue-by-venue mapping | A | Build venue policy registry and policy-aware microstructure segmentation |
| Betfair Additional Information page family (current + indexed versions) | Contract observability state (`anonymous content may be blocked`) plus versioned currency-floor values | Indexed snapshots are discovery-grade unless revalidated via authenticated capture | A/B | Require authenticated recapture before production contract promotion; keep version-hash lineage |
| Racing and Sports Enhanced Information Services page | Australian approved-distributor role plus packaged data-family claims across 33+ jurisdictions | Corporate marketing surface; requires contract validation for SLA/rights specifics | B | Add provider-role classification and role-aware entitlement/provenance checks |

## Data contract additions required (incremental, pass 45)

- `caw_policy_parameter_snapshot`:
- `captured_ts`, `venue_id`, `policy_effective_date`, `caw_cutoff_minutes_to_post`, `affected_pool_types_json`, `policy_objective_text`, `source_url`.
- `caw_policy_regime_event`:
- `event_ts`, `venue_id`, `prior_policy_hash`, `new_policy_hash`, `change_scope(cutoff_minutes|pool_scope|both)`, `source_url`.
- `betfair_currency_parameter_contract_snapshot`:
- `captured_ts`, `page_id`, `page_version`, `captured_access_mode`, `account_currency`, `min_bet_size`, `min_bsp_liability`, `min_bet_payout`, `source_url`.
- `currency_parameter_drift_event`:
- `event_ts`, `account_currency`, `old_contract_ref`, `new_contract_ref`, `delta_min_bet_size`, `delta_min_bsp_liability`, `delta_min_bet_payout`, `promotion_status`, `source_url`.
- `provider_distribution_role_snapshot`:
- `captured_ts`, `provider`, `role_type`, `approved_distributor_flag`, `claimed_jurisdiction_count`, `artifact_family_json`, `rights_lineage_text`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 45)

- For venue-policy heterogeneity, what minimum evidence is required before changing `caw_cutoff_minutes_to_post` in production (single release vs two-source confirmation)?
- Should currency-parameter contract promotion require authenticated fetch parity with indexed snapshots, or can indexed snapshots trigger immediate simulation-only updates?
- Do we treat distributor-role feeds as secondary enrichment only until direct-provider timestamp parity is demonstrated?
- What tolerance threshold in `currency_parameter_drift_event` should auto-trigger stake-sizing policy review?

## Ranked implementation backlog (delta, pass 45)

### P0 additions

1. Implement `caw_policy_parameter_snapshot` and apply venue-policy gating in late-window backtests and execution simulation.
2. Build `betfair_currency_parameter_contract_snapshot` ingestion with mandatory contract-version pinning in order validators.
3. Add `currency_parameter_drift_event` alerts and require explicit promotion approval when floor values change.
4. Add `provider_distribution_role_snapshot` and enforce role-aware provenance/entitlement checks before feature-store writes.

### P1 additions

1. Run A/B microstructure backtests with and without venue-level CAW policy segmentation to quantify calibration and CLV lift.
2. Backtest stake-size sensitivity to AUD floor regimes (`A$5/25/50` vs `A$1/10/20`) using frozen historical execution traces.
3. Build role-aware provider scorecards comparing distributor-fed vs direct-feed freshness, stability, and rights frictions.

## Sources for this update (pass 45)

- Del Mar official press item (29 Jul 2025): https://www.dmtc.com/media/stable-news/del-mar-to-take-additional-steps-to-curb-late-odds-fluctuations
- Betfair `Additional Information` current page (Updated Mar 19; anonymous-content block note): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2686993/Additional%2BInformation
- Betfair indexed historical `Additional Information` snapshot (`pageVersion=68`): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053&pageVersion=68
- Betfair indexed newer `Additional Information` snapshot (`pageVersion=131`): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053&pageVersion=131
- Racing and Sports Enhanced Information Services page: https://racingandsports.company/enhanced-information-services/

## Incremental architecture decisions from this run (2026-03-30, pass 46)

- Decision: add a `tote_publication_latency_regime` and require stop-betting anchored reconciliation windows for tote-derived labels.
- Why: CHRB-hosted CAW Q&A details a layered delay path (pool close, ingest lag, odds/will-pay compute lag, and display propagation), which can otherwise be misclassified as integrity breaks.
- Decision: add a `betfair_stream_cache_health_contract` with mandatory `SUB_IMAGE` cache-reset handling and `status`-coded latency state.
- Why: Betfair stream contracts explicitly allow midstream full-image replacement and `status=503` downstream-latency signaling; rate-limit compliance alone is insufficient.
- Decision: enforce an explicit `ra_terms_compliance_gate` for AU website-surface ingestion.
- Why: Racing Australia terms prohibit automated scraping on website materials and scope use to personal/non-commercial contexts without separate permission paths.

## Provider comparison (incremental high-signal additions, pass 46)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB-hosted CAW Q&A letter (Elite Turf Club, 2024-09-05) | Concrete CAW operational claims: feed parity, pool-close synchrony, cancellation restrictions, throughput/account controls, and tote publication lag mechanics | Primary but operator-authored; treat as high-signal claims with source-type caveat until regulator corroboration | A/B | Add latency-regime contracts and source-type tags; use for hypothesis priors and monitoring thresholds |
| Betfair Exchange Stream API docs | Stream-change contracts: midstream `SUB_IMAGE`, `status=503` latency signal, independent market/order ordering, actual-vs-requested heartbeat/conflation bounds | Documentation can drift; anonymous-view blocking possible | A | Implement cache/health state machine and persist stream-contract snapshot hash |
| Racing Australia Terms/Disclaimer + Scratching Release page | Website-use constraints (automation/scrape prohibition) plus staged scratching-release timetable semantics | Website terms are legal constraints, not API SLA; schedule can change | A | Hard-gate website scraping paths and model scratching as phased publication state |

## Data contract additions required (incremental, pass 46)

- `tote_publication_latency_regime_snapshot`:
- `captured_ts`, `jurisdiction`, `source_type`, `pool_close_sync_claim_flag`, `data_ingest_lag_sec_low`, `data_ingest_lag_sec_high`, `odds_compute_lag_sec_low`, `odds_compute_lag_sec_high`, `source_url`.
- `tote_reconciliation_window_event`:
- `event_ts`, `race_id`, `stop_betting_ts`, `reconciliation_window_end_ts`, `post_open_odds_change_flag`, `classification(lag_expected|anomaly)`, `source_url`.
- `betfair_stream_cache_health_contract_snapshot`:
- `captured_ts`, `source_updated_ts`, `sub_image_midstream_reset_required_flag`, `status_503_latency_flag`, `market_order_global_ordering_guaranteed_flag`, `heartbeat_min_ms`, `heartbeat_max_ms`, `source_url`.
- `stream_cache_health_event`:
- `event_ts`, `market_id`, `change_type`, `status_code`, `actual_conflate_ms`, `actual_heartbeat_ms`, `cache_reset_applied_flag`, `source_url`.
- `provider_terms_compliance_snapshot`:
- `captured_ts`, `provider`, `surface_type(website)`, `personal_noncommercial_only_flag`, `automated_scrape_prohibited_flag`, `liability_remedy_type`, `source_url`.
- `scratching_publication_phase_snapshot`:
- `captured_ts`, `state_code`, `interim_close_local_time`, `final_close_local_time`, `queue_processed_before_close_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 46)

- Should operator-authored CAW claims (CHRB-hosted) be allowed to set production thresholds directly, or only initialize priors until corroborated by regulator/track data?
- What `reconciliation_window_end_ts` default should we use per jurisdiction before classifying post-open odds movement as anomaly?
- When stream `status=503` persists, should execution degrade by stake haircut, signal-mask, or temporary pause?
- For RA terms compliance, do we maintain any website collector in metadata-only mode, or hard-disable all automated website retrieval jobs?

## Ranked implementation backlog (delta, pass 46)

### P0 additions

1. Implement `betfair_stream_cache_health_contract_snapshot` and fail closed when `SUB_IMAGE` events are not applied as full cache resets.
2. Add `stream_cache_health_event` telemetry and wire `status=503` into execution-risk governors.
3. Build `tote_publication_latency_regime_snapshot` plus `tote_reconciliation_window_event` classification for tote-based labeling and QA.
4. Implement `provider_terms_compliance_snapshot` and block disallowed website automation paths by policy.

### P1 additions

1. Run replay experiments with alternative tote reconciliation windows (e.g., `+10s`, `+15s`, `+20s`) and compare false anomaly rates.
2. Quantify CLV/calibration impact from masking stream-sensitive features during `status=503` intervals.
3. Add `scratching_publication_phase_snapshot` ingestion and test phase-aware non-runner risk features.

## Sources for this update (pass 46)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter: https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair Exchange Stream API documentation: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange%2BStream%2BAPI
- Racing Australia Terms of Use: https://www.racingaustralia.horse/AboutUs/TermsOfUse.aspx
- Racing Australia Disclaimer: https://www.racingaustralia.horse/AboutUs/Disclaimer.aspx
- Racing Australia Scratching Release Information: https://www.racingaustralia.horse/FreeFields/ScratchingReleaseInformation.aspx

## Incremental architecture decisions from this run (2026-03-31, pass 47)

- Decision: add a `caw_late_flow_concentration_contract` with explicit pool-share vs last-60s-share dimensions.
- Why: CHRB-hosted CAW material provides separate concentration signals and an explicit effective-takeout arithmetic example, so one-dimensional CAW flags are insufficient.
- Decision: add a `betfair_historical_coverage_exclusion_registry` and package-tier contract pinning.
- Why: Betfair documents non-random historical exclusions (long-term season/politics and tennis game betting) and package-tier schema criteria, which can bias model evaluation if untreated.
- Decision: add an `ra_wholesaler_framework_contract` with role split (`RA compliance role` vs wholesaler delivery role) and terms-parity metadata.
- Why: Racing Australia states common wholesaler agreement terms from 2025-07-01, but operational/SLA behavior remains wholesaler-specific.

## Provider comparison (incremental high-signal additions, pass 47)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB-hosted CAW Q&A letter (Elite Turf Club) | Quantitative CAW concentration and worked effective-takeout mechanics for late-flow interpretation | Operator-authored claims hosted by regulator; requires corroboration for production thresholds | A/B | Add source-typed CAW concentration contracts and use as priors/monitoring, not unqualified truth |
| Betfair Historical Data FAQ pages | Explicit market-family exclusions and package/specification contract pointers | Support content can drift; package details may be visual/table-driven | A | Enforce market-family history masks and package-tier contract pinning in replay pipelines |
| Racing Australia Wholesaler Agreement media release | Primary framework facts: RA role shift to compliance, five authorised wholesalers, common terms, 2025-07-01 commencement | Governance/contract facts do not imply equal technical service levels across wholesalers | A | Track contractual parity centrally but score SLA/freshness per wholesaler independently |

## Data contract additions required (incremental, pass 47)

- `caw_late_flow_concentration_snapshot`:
- `captured_ts`, `venue_id`, `source_type`, `sample_descriptor`, `caw_pool_share_pct`, `caw_last60s_share_pct`, `non_caw_last60s_share_pct`, `source_url`.
- `effective_takeout_scenario_snapshot`:
- `captured_ts`, `venue_id`, `nominal_takeout_pct`, `caw_pool_share_pct`, `caw_win_rate_pct`, `retail_effective_takeout_pct`, `source_url`.
- `betfair_historical_coverage_exclusion_snapshot`:
- `captured_ts`, `market_family`, `excluded_flag`, `stated_reason`, `source_url`.
- `betfair_historical_package_contract_snapshot`:
- `captured_ts`, `package_tier`, `specification_ref`, `stream_subscription_criteria_ref`, `source_url`.
- `ra_wholesaler_framework_snapshot`:
- `captured_ts`, `effective_date`, `ra_operating_role`, `standard_terms_parity_flag`, `source_url`.
- `ra_wholesaler_registry_snapshot`:
- `captured_ts`, `wholesaler_name`, `authorised_flag`, `commencement_date`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 47)

- What minimum corroboration standard should promote `A/B` CAW concentration metrics into hard execution-governor thresholds?
- Should excluded historical market families be removed from global benchmark aggregates or retained with explicit denominator annotations?
- How do we encode package-tier feature masks when historical experiments mix `BASIC` and `ADVANCED/PRO` purchases?
- For RA wholesaler parity, what minimum SLA telemetry period is required before ranking wholesalers for production routing?

## Ranked implementation backlog (delta, pass 47)

### P0 additions

1. Implement `caw_late_flow_concentration_snapshot` and `effective_takeout_scenario_snapshot` with source-type confidence tags.
2. Add `betfair_historical_coverage_exclusion_snapshot` and hard-block excluded families from training/evaluation sets.
3. Build `betfair_historical_package_contract_snapshot` and require package-tier metadata in replay job configs.
4. Implement `ra_wholesaler_framework_snapshot` plus `ra_wholesaler_registry_snapshot` and wire contract-parity vs SLA-separation into provider routing logic.

### P1 additions

1. Run sensitivity tests comparing calibration/CLV when `last60s_caw_share` is included vs omitted from late-window models.
2. Build benchmark reports with and without excluded historical market families to quantify denominator distortion.
3. Add wholesaler scorecards (freshness/outage/completeness) under a common RA-contract umbrella.

## Sources for this update (pass 47)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair support: Which markets aren't available via Historical Data? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/360017615137-Which-markets-aren-t-available-via-Historical-Data
- Betfair support: Where can I view the data specification for each historical data package? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/360002423271-Where-can-I-view-the-data-specification-for-each-historical-data-package
- Racing Australia media release: Racing Materials distribution - Wholesaler Agreement (2025-06-19): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

## Incremental architecture decisions from this run (2026-03-31, pass 48)

- Decision: add a `caw_account_lineage_contract` and `caw_purse_flow_contract` as separate CAW economics/governance layers.
- Why: CHRB-hosted CAW material includes TRA-code uniqueness, track/jurisdiction approval gating, and explicit purse-flow transfer percentages not captured by late-flow concentration features.
- Decision: add a `provider_schema_change_registry` with automated drift checks for Punting Form Results APIs.
- Why: Punting Form changelog shows additive schema changes (`Distance`, `Class`) landing within v1.0 and consumable immediately, creating train/serve mismatch risk if not tracked.
- Decision: promote Punting Form `Updates` endpoints (`Scratchings`, `Conditions`) to first-class operational-state ingestion.
- Why: official endpoint contracts expose timestamped scratchings/deductions and upcoming track grade/weather at Starter tier, which are directly useful for pre-off execution-state gating.

## Provider comparison (incremental high-signal additions, pass 48)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB-hosted CAW Q&A letter (Elite Turf Club) | Account-lineage/approval mechanics (TRA code uniqueness, track/jurisdiction consent) plus stated purse-flow transfer percentage for CAW handle | Operator-authored claims hosted by regulator; corroboration needed before hard-threshold automation | A/B | Add account-lineage + purse-flow contracts with confidence tags and revalidation cadence |
| Punting Form changelog + API reference (`Results`, `Updates`) | Active schema-evolution signal (new Results fields) and Starter-tier update surfaces for scratchings/deductions and conditions/weather | Doc-driven contract may move without webhook/version bump; payload verification still required | A | Add schema-change registry + update-event ingestion and drift alarms before model promotions |

## Data contract additions required (incremental, pass 48)

- `caw_account_lineage_snapshot`:
- `captured_ts`, `source_type`, `tra_code_unique_per_player_flag`, `subaccount_rollup_to_single_tra_flag`, `track_consent_required_flag`, `jurisdiction_regulator_approval_required_flag`, `source_url`.
- `caw_purse_flow_snapshot`:
- `captured_ts`, `track_group_id`, `caw_to_purse_pct`, `platform_fee_parity_claim_flag`, `source_url`.
- `provider_schema_change_event`:
- `event_ts`, `provider`, `surface`, `field_name`, `change_type`, `breaking_change_flag`, `source_url`.
- `provider_updates_endpoint_snapshot`:
- `captured_ts`, `provider`, `endpoint_name`, `path`, `min_subscription_tier`, `source_url`.
- `scratching_update_event`:
- `event_ts`, `meeting_id`, `runner_id`, `scratch_ts`, `deduction_value`, `source_url`.
- `meeting_condition_update_event`:
- `event_ts`, `meeting_id`, `track_grade`, `weather_text`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 48)

- What corroboration threshold should promote CHRB operator-stated purse-flow percentages from `A/B` to execution-economics hard inputs?
- Should `caw_account_lineage_snapshot` checks be evaluated at strategy onboarding only, or as recurring runtime eligibility gates by venue?
- For Punting Form additive schema events, do we auto-allow new fields into feature stores or require explicit feature-contract migration PRs?
- What freshness SLA should be enforced for `Scratchings` and `Conditions` update streams before suppressing late bets?

## Ranked implementation backlog (delta, pass 48)

### P0 additions

1. Implement `provider_schema_change_event` capture for Punting Form and block model promotion when undocumented payload fields appear.
2. Build `provider_updates_endpoint_snapshot` for `Scratchings`/`Conditions` and ingest timestamped update events into pre-off risk state.
3. Add `caw_account_lineage_snapshot` validation in venue-strategy eligibility checks.
4. Add `caw_purse_flow_snapshot` to economics normalization with source-confidence tagging.

### P1 additions

1. Run sensitivity tests on late-execution CLV with/without `scratching_update_event` and `meeting_condition_update_event` features.
2. Build monthly revalidation jobs for CHRB operator-authored CAW account/economics claims.
3. Add provider-schema drift dashboards showing changelog events vs observed payload deltas.

## Sources for this update (pass 48)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Punting Form Changelog (`Results API Update - Distance and Class Fields Added`, about 1 month ago): https://docs.puntingform.com.au/changelog
- Punting Form API Reference - Scratchings (`/v2/Updates/Scratchings`): https://docs.puntingform.com.au/reference/scratchings
- Punting Form API Reference - Conditions (`/v2/Updates/Conditions`): https://docs.puntingform.com.au/reference/conditions

## Incremental architecture decisions from this run (2026-03-31, pass 49)

- Decision: add a `betfair_nonrunner_asymmetry_contract` with market-type-specific cancellation thresholds and jurisdiction-aware reduction-update freeze windows.
- Why: Betfair horse-racing rules define distinct win/place behaviors (`2.5%` vs `4.0%`) plus AU/US `~5` minute pre-off update-freeze guidance that materially affects late-window simulation and execution.
- Decision: add a `nonrunner_sequence_replay_engine` keyed to official removal-order policy.
- Why: Betfair documents racecard-order processing when multiple non-runners are known simultaneously; replay and audit logic must be deterministic to prevent impossible cache states.
- Decision: add a `wholesaler_claimed_latency_registry` with confidence tags and validation cadence.
- Why: Mediality's FAQ provides explicit artifact-level latency/depth claims (acceptances/results/in-running delay) that are operationally relevant but provider-authored and therefore require measurement-backed verification.

## Provider comparison (incremental high-signal additions, pass 49)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: Exchange - Horse Racing Rules | Primary non-runner mechanics: AU/US reduction-update timing window, win/place cancellation thresholds, and simultaneous removal order policy | Rule text can evolve; requires periodic contract snapshot refresh | A | Implement non-runner asymmetry contract + sequence-aware replay/state machine |
| Mediality Racing FAQ | Wholesaler-specific claims on history depth, acceptances/results latency, and jurisdictional artifact delays (NZ in-runnings) | Provider-authored claims are not independent SLA guarantees | A/B | Ingest as priors with confidence tags; enforce measured SLA validation before production routing preference |

## Data contract additions required (incremental, pass 49)

- `betfair_nonrunner_asymmetry_contract_snapshot`:
- `captured_ts`, `market_type`, `win_lay_cancel_threshold_pct`, `place_lay_cancel_threshold_pct`, `place_reduction_always_applies_flag`, `reduction_update_soft_freeze_minutes_to_off_au_us`, `source_url`.
- `nonrunner_sequence_policy_snapshot`:
- `captured_ts`, `simultaneous_removal_policy`, `policy_scope`, `source_url`.
- `nonrunner_sequence_replay_event`:
- `event_ts`, `race_id`, `market_type`, `runner_id`, `sequence_index`, `reduction_factor_pct`, `unmatched_lay_cancelled_flag`, `source_url`.
- `wholesaler_claimed_latency_snapshot`:
- `captured_ts`, `provider`, `artifact_type`, `latency_minutes_claim`, `latency_days_low_claim`, `latency_days_high_claim`, `claim_confidence`, `source_url`.
- `wholesaler_history_depth_snapshot`:
- `captured_ts`, `provider`, `artifact_type`, `history_start_month`, `history_start_year`, `source_url`.
- `wholesaler_coverage_scope_snapshot`:
- `captured_ts`, `provider`, `jurisdiction`, `artifact_scope_json`, `format_type`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 49)

- For AU pre-off reduction freezes, should execution switch to stricter stake caps once `minutes_to_off <= 5`, or only during detected non-runner events?
- What validation threshold should promote wholesaler-authored latency claims from `A/B` priors to routing-weight inputs?
- Should `nonrunner_sequence_replay_event` be required for all replay jobs, or only for races with more than one non-runner event inside the late window?
- How should we reconcile provider-claimed NZ in-running delay (`1-2 days`) with strategy slices that depend on same-day post-race analytics?

## Ranked implementation backlog (delta, pass 49)

### P0 additions

1. Implement `betfair_nonrunner_asymmetry_contract_snapshot` and enforce market-type-specific cancellation/reduction logic in replay and live validators.
2. Build `nonrunner_sequence_policy_snapshot` + `nonrunner_sequence_replay_event` and fail replay when non-runner sequence cannot be deterministically reconstructed.
3. Add `wholesaler_claimed_latency_snapshot` with confidence tags and block routing-preference promotion without measured validation evidence.
4. Add AU late-window risk guard using `reduction_update_soft_freeze_minutes_to_off_au_us` and non-runner event flags.

### P1 additions

1. Backtest win-vs-place non-runner asymmetry features on late CLV and slippage prediction accuracy.
2. Build a wholesaler SLA validation job comparing claimed vs observed latency for acceptances/results/in-running artifacts.
3. Create provider-slice reports that quantify signal degradation when NZ in-running artifacts are delayed by 1-2 days.

## Sources for this update (pass 49)

- Betfair support: Exchange - Horse Racing Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-horse-racing-rules/
- Mediality Racing FAQ (captured 2026-03-31): https://medialityracing.com.au/data-faq/

## Incremental architecture decisions from this run (2026-03-31, pass 50)

- Decision: add a `betfair_material_change_gate` contract separate from raw `market_version` monotonic checks.
- Why: Betfair `placeOrders` defines acceptance against last material (suspension-linked) change rather than every market-version increment; replay and order validators must mirror this to avoid false reject assumptions.
- Decision: add a `replace_nonrollback_risk_guard` in execution and simulation.
- Why: Betfair `replaceOrders` is cancel-then-place with no rollback if re-placement fails; this creates explicit stranded-cancel states that need liquidity/risk treatment.
- Decision: implement a `provider_dual_path_recovery_contract` for BetMakers ingestion.
- Why: BetMakers FAQ states subscriptions emit only from subscription start time; disconnection recovery requires query-based catch-up under documented query-rate and shape constraints.

## Provider comparison (incremental high-signal additions, pass 50)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange API docs (`placeOrders`, `replaceOrders`) | Primary order-entry contracts: material-change version acceptance, `customerRef` de-dupe window, async pending states, and replace non-rollback semantics | Docs can drift and anonymous view may hide parts; contract snapshots must be version-pinned | A | Add material-change gate + replace non-rollback state machine in replay/live validators |
| BetMakers Core API FAQ | Concrete AU provider transport/query limits: token TTL, non-replay subscriptions, keepalive format, query throttle/window defaults, and `429` risk patterns | Provider-authored FAQ; runtime behavior still needs payload-level telemetry validation | A/B | Build dual-path collector (subscription + catch-up queries) with endpoint-shape-aware budget controls |

## Data contract additions required (incremental, pass 50)

- `betfair_material_change_contract_snapshot`:
- `captured_ts`, `market_version_any_change_flag`, `acceptance_uses_last_material_change_flag`, `material_change_examples_json`, `non_material_change_examples_json`, `source_url`.
- `betfair_order_dedupe_contract_snapshot`:
- `captured_ts`, `customer_ref_dedupe_window_seconds`, `customer_ref_persists_to_stream_flag`, `source_url`.
- `betfair_replace_nonrollback_contract_snapshot`:
- `captured_ts`, `replace_instruction_limit`, `cancel_then_place_flag`, `cancel_rollback_supported_flag`, `source_url`.
- `order_replace_risk_event`:
- `event_ts`, `market_id`, `cancelled_before_replace_flag`, `replace_failed_flag`, `stranded_exposure_delta`, `source_url`.
- `provider_transport_contract_snapshot`:
- `captured_ts`, `provider`, `token_ttl_minutes`, `subscription_replay_supported_flag`, `keepalive_frame_type`, `reconnect_policy_hint`, `source_url`.
- `provider_query_budget_contract_snapshot`:
- `captured_ts`, `provider`, `query_rate_limit_per_second`, `meetingsdated_day_window_limit`, `races_default_limit`, `heavy_query_429_risk_flag`, `source_url`.
- `provider_gap_recovery_event`:
- `event_ts`, `provider`, `disconnect_ts`, `resubscribe_ts`, `catchup_query_start_ts`, `catchup_query_end_ts`, `recovered_event_count`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 50)

- In live execution, should stale-version rejection guards key only to material-change state, or add a conservative buffer for non-material increments near jump?
- For replace non-rollback handling, what maximum stranded-cancel exposure is acceptable before hard-pausing order amendments?
- For BetMakers `10 qps` limits, do we allocate a fixed per-meeting budget, or dynamic budgets based on race-count and market urgency?
- What telemetry threshold should confirm BetMakers FAQ claims (token/session/replay semantics) before promoting from `A/B` to fully trusted routing assumptions?

## Ranked implementation backlog (delta, pass 50)

### P0 additions

1. Implement `betfair_material_change_contract_snapshot` and enforce material-change-aware stale-version validation in both replay and live order simulators.
2. Build `betfair_replace_nonrollback_contract_snapshot` plus `order_replace_risk_event`; fail-safe when replace flows create stranded-cancel states above configured thresholds.
3. Implement `provider_transport_contract_snapshot` + `provider_query_budget_contract_snapshot` for BetMakers and enforce documented token/replay/throttle constraints.
4. Add `provider_gap_recovery_event` logging and require explicit catch-up query completion before re-enabling feature/execution pipelines after disconnects.

### P1 additions

1. Backtest late-window fill/reject accuracy with and without material-change-aware version gating.
2. Stress-test replace-amend workflows under injected place-failure faults to calibrate non-rollback risk limits.
3. Run ingestion reliability experiments on BetMakers comparing subscription-only vs dual-path recovery under synthetic disconnects and heavy-field query shapes.

## Sources for this update (pass 50)

- Betfair Exchange API Documentation - `placeOrders` (Updated 2025-01-07): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Exchange API Documentation - `replaceOrders` (Updated 2024-06-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687487/replaceOrders
- BetMakers Docs - Core API FAQ (captured 2026-03-31): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental architecture decisions from this run (2026-03-31, pass 51)

- Decision: add a `profit_ratio_rejection_contract` for Betfair order transforms.
- Why: Betfair explicitly documents `INVALID_PROFIT_RATIO` as a rounding-fairness guard across place/cancel/update paths, creating a non-liquidity rejection regime that can affect amendment-heavy execution.
- Decision: promote `rollup_depth_policy` + `fill_or_kill_policy` to first-class strategy controls.
- Why: Betfair support ties `exBestOffersOverrides` rollup settings and `fill-or-kill` usage directly to matchability and unmatched-order behavior.
- Decision: add a `provider_entity_alias_registry` for AU wholesaler normalization.
- Why: Racing Australia contract nomenclature (`News Perform`) and provider-facing branding (`InForm Connect (News Limited)`) can diverge, risking entitlement/audit drift without canonical IDs.

## Provider comparison (incremental high-signal additions, pass 51)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Support - `INVALID_PROFIT_RATIO` | Explicit fairness-band rejection semantics for place/cancel/update mutation paths | Support-page guidance can evolve; needs periodic contract snapshotting | A | Implement pre-flight amendability checks and rejection-state telemetry |
| Betfair Developer Support - matchability article | Practical execution contract tying rollup settings and `fill-or-kill` to match outcomes | Guidance-oriented article; must still be validated in production telemetry | A | Add strategy-level rollup/fill-or-kill policies and replay-aware fields |
| Racing Australia release + InForm Connect post | Contract-level wholesaler naming plus brand/legal alias divergence signal | Provider post is self-asserted (`A/B`) and needs legal-entity corroboration | A/B | Build alias registry and require canonical provider IDs in all entitlement checks |

## Data contract additions required (incremental, pass 51)

- `betfair_profit_ratio_contract_snapshot`:
- `captured_ts`, `error_code`, `applies_to_actions_json`, `fair_return_low_pct`, `fair_return_high_pct`, `source_url`.
- `order_profit_ratio_reject_event`:
- `event_ts`, `market_id`, `selection_id`, `order_transform_type`, `price`, `remaining_size`, `error_code`, `source_url`.
- `strategy_rollup_policy_snapshot`:
- `captured_ts`, `strategy_id`, `rollup_model`, `rollup_limit`, `website_slider_equivalent_flag`, `source_url`.
- `strategy_fill_policy_snapshot`:
- `captured_ts`, `strategy_id`, `fill_or_kill_default_flag`, `time_in_force_profile`, `source_url`.
- `provider_entity_alias_snapshot`:
- `captured_ts`, `canonical_provider_id`, `legal_entity_name`, `brand_name`, `framework_name`, `alias_type`, `evidence_quality`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 51)

- What pre-flight threshold should block amend/cancel-down attempts for likely `INVALID_PROFIT_RATIO` outcomes at short odds?
- For each strategy class, should `fill-or-kill` be default-on, default-off, or conditional on alpha half-life and queue depth?
- What legal-document standard is required to promote wholesaler alias links from `A/B` to `A` in entitlement governance?
- Should provider-routing dashboards display both canonical IDs and known brand aliases by default to reduce operator error?

## Ranked implementation backlog (delta, pass 51)

### P0 additions

1. Implement `betfair_profit_ratio_contract_snapshot` + `order_profit_ratio_reject_event` and block unsafe amend transforms in pre-flight checks.
2. Add strategy-configurable `rollup_depth_policy` and `fill_or_kill_policy` with telemetry on fill rate, slippage, and missed-opportunity cost.
3. Build `provider_entity_alias_snapshot` and enforce canonical provider IDs across contracts, routing, and audit logs.
4. Add replay-time validation that strategy execution assumptions use the same rollup/fill policy as live order generation.

### P1 additions

1. Backtest amendment success and PnL sensitivity with and without `profit_ratio_reject_hazard` features.
2. Run strategy-cluster experiments to optimize `rollup_limit` vs fill/slippage trade-offs.
3. Add monthly alias-reconciliation review between RA releases, supplier disclosures, and internal provider master data.

## Sources for this update (pass 51)

- Betfair Developer Support - `INVALID_PROFIT_RATIO` semantics (updated 2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/360010423978-Why-am-I-receiving-the-INVALID-PROFIT-RATIO-error
- Betfair Developer Support - improving match chance (`rollupModel`, `rollupLimit`, `fill-or-kill`) (updated 2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/360017675098-How-do-I-improve-the-chances-of-my-bet-being-matched
- Racing Australia media release - Wholesaler Agreement (2025-06-19): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf
- InForm Connect post - wholesaler/distributor appointment claim (2025-08-26): https://informconnect.com.au/2025/08/26/inform-connect-benchmarked-2/

## Incremental architecture decisions from this run (2026-03-31, pass 52)

- Decision: add a `cross_match_source_contract` with explicit source typing (`direct_opposing`, `cross_selection`, `cross_market`) and valid-increment residual tracking.
- Why: Betfair Exchange Rules provide explicit cross-selection/cross-market mechanics, valid-increment constraints, and possible revenue residuals that affect fill/slippage attribution.
- Decision: add an `sp_reconciliation_and_unmatched_off_contract` to preserve pre-off unmatched handling (`lapse`, `convert_to_sp`, `persist_inplay`).
- Why: Betfair rules tie SP reconciliation to unmatched Exchange orders and state SP bets are non-cancellable, so replay/live systems need explicit lifecycle-state parity.
- Decision: add a `provider_artifact_history_floor_registry` for AU data vendors.
- Why: Punting Form documentation shows artifact-specific history floors (`results` vs `sectional/benchmark` surfaces), so feature eligibility must be depth-aware per artifact family.

## Provider comparison (incremental high-signal additions, pass 52)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange General Rules | Primary matching-policy mechanics for cross-selection/cross-market matching, valid-increment constraints, FIFO-at-price behavior, and SP/unmatched reconciliation rules | Rules can evolve without API schema versioning; requires periodic snapshot-diffing | A | Implement cross-match source attribution + unmatched-off lifecycle contracts in replay/live execution |
| Punting Form Guides (`Results`, `Benchmarks`) | Artifact-specific historical depth claims (`results` archive floor vs benchmark/sectional history horizon) | Provider-authored guide claims need independent data-completeness verification | A/B | Add artifact-level history-floor registry and training-window eligibility gates |

## Data contract additions required (incremental, pass 52)

- `cross_match_source_contract_snapshot`:
- `captured_ts`, `cross_selection_enabled_flag`, `cross_market_enabled_flag`, `better_price_required_flag`, `valid_increment_only_flag`, `additional_revenue_possible_flag`, `source_url`.
- `order_fill_source_event`:
- `event_ts`, `market_id`, `selection_id`, `match_source_type(direct_opposing|cross_selection|cross_market)`, `crossmatch_residual_flag`, `price_improvement_ticks`, `source_url`.
- `sp_reconciliation_contract_snapshot`:
- `captured_ts`, `sp_cancel_allowed_flag`, `includes_unmatched_exchange_offers_flag`, `source_url`.
- `unmatched_off_policy_snapshot`:
- `captured_ts`, `account_id_hash`, `lapse_default_flag`, `convert_to_sp_supported_flag`, `persist_inplay_supported_flag`, `source_url`.
- `provider_artifact_history_floor_snapshot`:
- `captured_ts`, `provider`, `artifact_type`, `start_year_claim`, `coverage_scope_json`, `claim_confidence`, `source_url`.
- `feature_history_eligibility_event`:
- `event_ts`, `feature_family`, `required_start_year`, `provider_artifact_floor_year`, `eligible_flag`, `block_reason`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 52)

- What minimum telemetry evidence is required before trusting inferred `match_source_type` labels for production slippage attribution?
- Should `convert_to_sp` vs `persist_inplay` policy be strategy-configurable per market type, or centrally fixed at account level for replay parity?
- For artifact-level history-floor claims, what measured completeness threshold upgrades `A/B` provider claims to `A` internal confidence?
- Do we permit training windows earlier than `results` floor when benchmark-derived features exist, or enforce strict intersection windows across all required artifacts?

## Ranked implementation backlog (delta, pass 52)

### P0 additions

1. Implement `cross_match_source_contract_snapshot` + `order_fill_source_event` and add fill-attribution diagnostics by match-source type.
2. Build `sp_reconciliation_contract_snapshot` + `unmatched_off_policy_snapshot`; block replay jobs that cannot reconstruct pre-off unmatched handling mode.
3. Add `provider_artifact_history_floor_snapshot` and enforce artifact-level history eligibility checks before model training or promotion.
4. Add `feature_history_eligibility_event` to promotion gates so feature families fail closed when required historical depth is unavailable.

### P1 additions

1. Backtest slippage/fill model improvement from explicit cross-match source labeling vs ladder-only attribution.
2. Run controlled experiments comparing `lapse` vs `convert_to_sp` vs `persist_inplay` unmatched-off policies on late-window CLV and fill ratio.
3. Build monthly provider-depth audits that compare claimed history floors to observed artifact completeness by year.

## Sources for this update (pass 52)

- Betfair Exchange - Introduction & General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Punting Form Guides - Results (`database goes back to 2005`, captured 2026-03-31): https://docs.puntingform.com.au/docs/results
- Punting Form Guides - Benchmarks (`12+ years` sectional basis claim, captured 2026-03-31): https://docs.puntingform.com.au/docs/benchmarks-1

## Incremental architecture decisions from this run (2026-03-31, pass 53)

- Decision: add a `betfair_lapse_reason_contract` and persist typed lapse codes in order-state telemetry.
- Why: Betfair Stream API now provides enumerated `lapseStatusReasonCode` values; generic lapse buckets lose deterministic rejection/lapse causality.
- Decision: add a `stream_duplicate_market_resolution` step to cache hydration/reconnect.
- Why: Betfair Stream known-issues section states moved markets can appear twice in initial image cache and clients should retain the higher version.
- Decision: add a `freefields_publication_clock` for Racing NSW meeting/result surfaces.
- Why: Racing NSW FreeFields pages expose concrete pre-race deadlines and `Results Last Published` timestamps that can govern PIT-safe ingestion and settlement promotion.

## Provider comparison (incremental high-signal additions, pass 53)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange Stream API docs | Typed lapse-status reason taxonomy and documented duplicate-market initial-image edge case with higher-version retention rule | Docs can drift; anonymous access can hide some context | A | Implement lapse-reason state model + duplicate-market pruning in stream cache pipeline |
| Racing NSW FreeFields (`mdata`) meeting/results pages | Meeting deadlines with timezone labels, `Results Last Published` timestamp, and Snapshot/XML/CSV export surfaces | Web-page surface (not signed feed SLA); meeting-level values can be revised intraday | A | Build publish-clock snapshots and use as gating metadata for PIT ingestion and settlement finalization |

## Data contract additions required (incremental, pass 53)

- `betfair_order_lapse_reason_contract_snapshot`:
- `captured_ts`, `supported_codes_json`, `null_semantics_text`, `source_url`.
- `order_lapse_reason_event`:
- `event_ts`, `market_id`, `selection_id`, `order_id`, `lapse_status_reason_code`, `market_version`, `queue_wait_ms`, `source_url`.
- `stream_duplicate_market_contract_snapshot`:
- `captured_ts`, `duplicate_initial_image_possible_flag`, `latest_version_only_update_flag`, `source_url`.
- `stream_market_duplicate_resolution_event`:
- `event_ts`, `market_id`, `event_id_old`, `event_id_new`, `version_kept`, `version_dropped`, `source_url`.
- `freefields_meeting_deadline_snapshot`:
- `captured_ts`, `jurisdiction`, `meeting_key`, `nominations_close_ts_local`, `weights_declared_by_ts_local`, `acceptances_deadline_ts_local`, `riders_declared_deadline_ts_local`, `scratching_close_ts_local`, `source_url`.
- `freefields_results_publication_snapshot`:
- `captured_ts`, `meeting_key`, `results_last_published_ts_local`, `snapshot_url`, `xml_url`, `csv_url`, `source_url`.
- `freefields_meeting_surface_snapshot`:
- `captured_ts`, `meeting_key`, `penetrometer_value`, `track_information_text`, `weather_text`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 53)

- Should any lapse reason codes (`MKT_VERSION`, `TIME_ELAPSED`, `PRICE_IMP_TOO_LARGE`) trigger immediate strategy-level throttles, or only post-trade diagnostics?
- For duplicate-market initial images, do we hard-fail execution until duplicate pruning is complete, or run in degraded mode with feature masking?
- What stability rule should define FreeFields result finality: single `results_last_published_ts` observation, or unchanged timestamp across N polling cycles?
- Should we treat FreeFields export links (`Snapshot/XML/CSV`) as independent artifacts with separate lineage IDs or as one publication event with multiple transport formats?

## Ranked implementation backlog (delta, pass 53)

### P0 additions

1. Implement `betfair_order_lapse_reason_contract_snapshot` + `order_lapse_reason_event` and wire lapse-code telemetry into execution risk governors.
2. Add `stream_duplicate_market_contract_snapshot` + `stream_market_duplicate_resolution_event`, and block replay/execution until duplicate market versions are reconciled.
3. Build `freefields_meeting_deadline_snapshot` + `freefields_results_publication_snapshot` and enforce publication-clock gating in settlement/training pipelines.
4. Add `freefields_meeting_surface_snapshot` ingestion so penetrometer/track-info values are available for same-day regime features.

### P1 additions

1. Quantify calibration/fill improvements from lapse-code-aware rejection modeling versus generic lapse buckets.
2. Run fault-injection tests for duplicate-market initial-image handling to validate replay determinism.
3. Backtest label-quality changes when enforcing `results_last_published_ts` stability gates before model retraining.

## Sources for this update (pass 53)

- Betfair Exchange Stream API (updated 2026-02-20): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange%2BStream%2BAPI
- Racing NSW FreeFields race program example (captured 2026-03-31): https://mdata.racingnsw.com.au/FreeFields/RaceProgram.aspx?Key=2026Mar04%2CNSW%2CWarwick+Farm
- Racing NSW FreeFields results example (captured 2026-03-31): https://mdata.racingnsw.com.au/FreeFields/Results.aspx?Key=2026Mar04%2CNSW%2CWarwick+Farm

## Incremental architecture decisions from this run (2026-03-31, pass 54)

- Decision: add a `betfair_sp_reconciliation_state_machine` with separate `request_accepted` and `reconciliation_eligible` states.
- Why: Betfair rules/support document late-reconciliation void paths, reversal paths, and minimum-liability cancellation behavior that make SP conversion non-atomic.
- Decision: add `caw_policy_regime_event` status transitions (`active`, `temporarily_suspended`) rather than date-only cutovers.
- Why: February 2026 NYRA reporting shows one-day operational suspension/restart of new CAW guardrails, which can bias before/after inference if unmodeled.
- Decision: extend `race_class_governance_timeline` with a `btag_recommendation` stage.
- Why: Racing Australia (11 March 2026) formally introduces BTAG as an independent advisory layer feeding PRA/APC black-type decisions.

## Provider comparison (incremental high-signal additions, pass 54)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange General Rules + SP support article | Primary SP reconciliation/void/reversal semantics and explicit minimum-liability conversion behavior | Support/rules text can change without API versioning; requires snapshot diffing | A | Implement SP conversion state machine and reconciliation-timing guards in replay/live |
| NYRA official announcement + Equibase operational relay | CAW-policy effective date plus temporary suspension/restart signal for one-minute guardrail rollout | Suspension detail is secondary-report relayed (`B`) and needs confidence tagging | A/B | Add policy-status events and treat suspension windows as separate regimes |
| Racing Australia BTAG media release | Primary governance change introducing independent BTAG recommendation stage for black-type list decisions | Public release does not expose machine-readable recommendation feed yet | A | Add BTAG stage to class-governance timeline and label-timing controls |

## Data contract additions required (incremental, pass 54)

- `betfair_sp_reconciliation_timing_snapshot`:
- `captured_ts`, `late_reconciliation_material_event_rule_flag`, `post_off_take_sp_void_flag`, `post_off_sp_bet_void_flag`, `premature_reconciliation_reversal_flag`, `source_url`.
- `betfair_sp_min_liability_snapshot`:
- `captured_ts`, `min_lay_liability`, `min_back_stake`, `currency_scope`, `source_url`.
- `order_sp_conversion_event`:
- `event_ts`, `market_id`, `selection_id`, `order_id`, `take_sp_selected_flag`, `accepted_preoff_flag`, `eligible_at_reconciliation_flag`, `ineligible_reason`, `source_url`.
- `caw_policy_event_snapshot`:
- `captured_ts`, `venue`, `policy_name`, `effective_start_date`, `status`, `suspension_date`, `expected_resume_date`, `suspension_reason`, `source_quality`, `source_url`.
- `caw_policy_status_window`:
- `venue`, `policy_name`, `status`, `window_start_ts`, `window_end_ts`, `confidence`, `source_url`.
- `black_type_governance_body_snapshot`:
- `captured_ts`, `body_name`, `approval_date`, `independence_constraint_text`, `source_url`.
- `black_type_governance_member_snapshot`:
- `captured_ts`, `body_name`, `member_name`, `source_url`.
- `black_type_recommendation_event`:
- `event_ts`, `body_name`, `action_type`, `target_race_id`, `forwarded_to`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 54)

- For Betfair SP conversion, should pre-flight validation hard-block low-liability `Take SP` lay intents, or allow and classify as `eligible_at_reconciliation` risk?
- What confidence threshold should permit Equibase-relayed NYRA suspension data to affect production policy status windows without direct NYRA publication?
- For CAW-policy analytics, do we exclude suspended windows entirely or include with explicit interaction terms?
- How should we capture BTAG recommendations before a formal machine-readable feed exists: manual event ingestion, PDF parsing, or deferred until structured output appears?

## Ranked implementation backlog (delta, pass 54)

### P0 additions

1. Implement `betfair_sp_reconciliation_timing_snapshot`, `betfair_sp_min_liability_snapshot`, and `order_sp_conversion_event` with two-stage SP eligibility logic.
2. Add `caw_policy_event_snapshot` + `caw_policy_status_window` and enforce regime-status filtering in volatility/CLV evaluation jobs.
3. Extend `race_class_governance_timeline` to include `btag_recommendation` stage and block PIT class-label promotion when governance stage is unresolved.
4. Add source-quality-aware gating so secondary policy updates (for example Equibase relays) are tagged and auditable before affecting automated strategy promotion.

### P1 additions

1. Backtest SP fill/void attribution accuracy with and without two-stage SP conversion states.
2. Re-run NYRA CAW guardrail impact tests with suspension windows modeled explicitly and compare effect-size drift.
3. Build a lightweight BTAG event-capture pipeline (PDF scrape + manual validation queue) until structured recommendation feeds exist.

## Sources for this update (pass 54)

- Betfair Exchange General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Betfair Support - Starting Price (SP), minimum liability and `Take SP` examples (captured 2026-03-31): https://support.betfair.com/app/answers/detail/a_id/421/
- NYRA official CAW guardrail announcement (2026-01-30): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Equibase relay of NYRA one-day CAW suspension/update (2026-02-06): https://cms.equibase.com/node/313508
- Racing Australia media release - Statement on formation of BTAG (2026-03-11): https://www.racingaustralia.horse/uploadimg/media-releases/Statement-on-formation-of-Black-Type-Advisory-Group.pdf

## Incremental architecture decisions from this run (2026-03-31, pass 55)

- Decision: add a `market_completeness_and_version_contract` for Betfair market-state ingestion.
- Why: Betfair type definitions separate `complete` (runner-universe mutability), `version` (status-transition lineage), and `runnersVoidable` caveats for horse non-runner handling.
- Decision: add a `track_rating_transition_timeline` with race-scoped retrospective support.
- Why: Racing Australia FreeFields results pages publish timestamped track-rating transitions that can apply retrospectively to earlier races.

## Provider comparison (incremental high-signal additions, pass 55)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Betting Type Definitions (updated 2025-12-11) | Explicit semantics for `complete`, `version`, and horse-market caveat on `runnersVoidable` | Type-definition semantics may drift; must snapshot with update date/hash | A | Enforce runner-universe lock logic and status-lineage-aware version handling |
| Racing Australia FreeFields results pages | Race-scoped track-rating transition log with timestamps/scope plus `Results Last Published` and race-level timing/comments surfaces | Web-page surface can change format; requires parser robustness and replayable raw capture | A | Build track-rating transition event parser with retrospective scope support |

## Data contract additions required (incremental, pass 55)

- `betfair_market_completeness_contract_snapshot`:
- `captured_ts`, `complete_false_allows_runner_additions_flag`, `source_updated_ts`, `source_url`.
- `betfair_market_version_contract_snapshot`:
- `captured_ts`, `version_increments_on_status_change_flag`, `source_updated_ts`, `source_url`.
- `betfair_market_voidability_contract_snapshot`:
- `captured_ts`, `runners_voidable_excludes_horse_non_runner_flag`, `source_updated_ts`, `source_url`.
- `runner_universe_lock_event`:
- `event_ts`, `market_id`, `complete_flag`, `status`, `version`, `locked_flag`, `source_url`.
- `track_rating_change_event`:
- `event_ts_local`, `meeting_key`, `race_number_nullable`, `new_track_rating`, `scope_type(retrospective|forward_only)`, `scope_race_number_nullable`, `source_text`, `source_url`.
- `track_rating_transition_parse_audit`:
- `captured_ts`, `meeting_key`, `raw_comment_hash`, `parse_success_flag`, `unparsed_fragment_count`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 55)

- What minimum lead time before jump (`seconds_since_complete_true`) is required for strategy eligibility in live execution?
- Should `version` be modeled only as status-transition count, or combined with stream `pt` cadence to estimate suspend/reopen turbulence?
- How should retrospective track-rating events trigger replay corrections: immediate historical feature rewrite, or queued nightly backfill with lineage tags?
- What parser-confidence threshold should block downstream model retraining when FreeFields transition text structure changes?

## Ranked implementation backlog (delta, pass 55)

### P0 additions

1. Implement `betfair_market_completeness_contract_snapshot`, `betfair_market_version_contract_snapshot`, and `runner_universe_lock_event`; block execution signals before runner-universe lock.
2. Add `betfair_market_voidability_contract_snapshot` and enforce horse non-runner settlement via reduction-factor workflows, not generic voidability flags.
3. Build `track_rating_change_event` ingestion with retrospective-scope support and wire into PIT feature generation.
4. Add `track_rating_transition_parse_audit` with fail-closed behavior when transition parsing confidence drops.

### P1 additions

1. Backtest fill/CLV sensitivity to `complete=true` lock gating versus current pre-off snapshot policy.
2. Evaluate calibration drift before/after adding race-scoped track-rating transition features.
3. Build anomaly monitors for large retrospective track-rating corrections and compare against race-result publication timelines.

## Sources for this update (pass 55)

- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%2BType%2BDefinitions
- Racing Australia FreeFields results example (captured 2026-03-31): https://www.racingaustralia.horse/FreeFields/Results.aspx?Key=2026Mar01%2CVIC%2CSale

## Incremental architecture decisions from this run (2026-03-31, pass 56)

- Decision: add a `keep_bet_transition_state_machine` for horse-racing markets with explicit late-withdrawal override paths.
- Why: Betfair Exchange rules describe branch behavior where `At In-Play: Keep` lay orders are usually preserved/adjusted on qualifying non-runners, but may be force-cancelled for material late withdrawals.
- Decision: add an `sp_limit_boundary_queue_model` for SP-limit participation at exact boundary prices.
- Why: Betfair SP rules state equal-limit inclusion is first-come-first-served and can produce partial/unmatched outcomes at the requested-limit boundary.

## Provider comparison (incremental high-signal additions, pass 56)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange General Rules (`Keep Bets`, SP sections) | Primary horse-market `keep` branch semantics under non-runner/late-withdrawal conditions plus SP-limit boundary queue behavior | Rules text can change without API schema versioning; requires periodic snapshot hashing | A | Implement dedicated keep-transition state machine and SP-limit boundary telemetry in replay/live |

## Data contract additions required (incremental, pass 56)

- `betfair_keep_bet_rule_snapshot`:
- `captured_ts`, `keep_lay_nonrunner_no_cancel_flag`, `keep_lay_reduction_adjustment_flag`, `material_late_withdrawal_force_cancel_right_flag`, `material_runner_rf_threshold_approx`, `source_url`.
- `order_keep_transition_event`:
- `event_ts`, `market_id`, `selection_id`, `order_id`, `keep_state(kept_and_reduced|force_cancelled_material_late_withdrawal|kept_unreduced_inplay_match)`, `late_withdrawal_flag`, `reduction_applied_flag`, `source_url`.
- `late_withdrawal_materiality_event`:
- `event_ts`, `market_id`, `withdrawn_selection_id`, `estimated_reduction_factor`, `materiality_flag`, `preoff_cancel_action_taken_flag`, `source_url`.
- `sp_limit_queue_event`:
- `event_ts`, `market_id`, `selection_id`, `limit_price`, `queue_position_proxy`, `partial_match_flag`, `unmatched_at_off_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 56)

- What fallback rule should apply when late-withdrawal materiality cannot be estimated before off-time (fail-safe cancel, fail-open keep, or confidence-gated branch)?
- Should `keep` branch states hard-block CLV attribution for affected orders until reduction-factor reconciliation is finalized?
- How should we estimate SP-limit queue position in replay when only partial visibility of competing boundary orders exists?
- Do we promote `material_runner_rf_threshold_approx` as a configurable parameter or pin to documented heuristic and alert on drift?

## Ranked implementation backlog (delta, pass 56)

### P0 additions

1. Implement `betfair_keep_bet_rule_snapshot` and `order_keep_transition_event` with explicit branch-state labels for non-runner and late-withdrawal paths.
2. Add `late_withdrawal_materiality_event` and gate execution/replay transitions on materiality-confidence checks.
3. Build `sp_limit_queue_event` capture and integrate boundary-queue uncertainty into SP fill attribution.
4. Add fail-closed reconciliation checks so reduction-factor settlement logic depends on matched-phase (`preoff` vs `inplay_keep`) provenance.

### P1 additions

1. Backtest fill/slippage error reduction from keep-state branching versus current single-flag persistence treatment.
2. Stress-test late-withdrawal scenarios to quantify false-cancel vs false-keep cost trade-offs.
3. Evaluate calibration gains from adding SP-limit boundary queue-pressure features in final-minute models.

## Sources for this update (pass 56)

- Betfair Exchange - Introduction & General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules

## Incremental architecture decisions from this run (2026-03-31, pass 57)

- Decision: add a `market_information_asymmetry_monitor` that continuously compares `private_only` vs `private_plus_market` model performance.
- Why: Benter's primary report explicitly treats odds as a carrier of non-public information; blend value should be monitored as structural signal, not optional calibration polish.
- Decision: add a `rv_deduction_delivery_contract_registry` with fallback-path handling.
- Why: Racing Victoria's standard conditions specify prescribed deduction-delivery mechanisms, binding preferences for the approval period, and explicit table fallback behavior.
- Decision: add a `rv_reporting_clock_governor` for designated WSP race-info and daily-ledger deadlines.
- Why: RV's 2025/26 guide defines hard timing obligations (1-minute race-info latency and 09:00 next-day submission clock) that can be monitored deterministically.

## Provider comparison (incremental high-signal additions, pass 57)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Benter 1994 primary report | Explicit methodological framing that public odds embed inaccessible information (inside info) and should be integrated in practical models | Historical source and venue-specific context; still foundational but not modern API contract | A | Treat market blending as mandatory baseline; monitor blend-value drift as a health signal |
| Racing Victoria Standard Conditions (effective 1 March 2025) | Deduction-delivery mechanisms, mechanism-binding period, fallback-to-table path, and bet-type approval governance | Policy text can change between approval periods; requires version snapshots | A | Build jurisdiction-aware deduction-delivery contract registry and bet-type governance gate |
| Racing Victoria Guide to Provision of Information 2025/26 | Concrete timing obligations and detailed daily-ledger field schema (including cancellation/liability fields) | Guide revs each FY and can modify schema/clock expectations | A | Add reporting-clock monitors and schema-versioned ingestion for daily-ledger feeds |

## Data contract additions required (incremental, pass 57)

- `market_information_asymmetry_assumption_snapshot`:
- `captured_ts`, `inside_info_reflected_in_odds_flag`, `published_data_only_model_scope_flag`, `source_url`.
- `model_blend_diagnostic_event`:
- `event_ts`, `model_variant(private_only|private_plus_market)`, `calibration_score`, `clv_proxy`, `delta_vs_baseline`, `source_url`.
- `rv_deduction_delivery_contract_snapshot`:
- `captured_ts`, `prescribed_mechanisms_json`, `preferred_mechanism`, `mechanism_binding_for_period_flag`, `source_url`.
- `rv_deduction_delivery_fallback_event`:
- `event_ts`, `meeting_key`, `reason_code`, `table_of_deductions_applied_flag`, `source_url`.
- `rv_bet_type_governance_event`:
- `event_ts`, `bet_type_name`, `requires_written_approval_flag`, `approval_status`, `source_url`.
- `rv_reporting_clock_snapshot`:
- `captured_ts`, `race_info_max_lag_minutes`, `daily_submission_deadline_local`, `source_url`.
- `rv_daily_ledger_submission_event`:
- `event_ts`, `reporting_date_local`, `submitted_ts_local`, `submission_deadline_met_flag`, `source_url`.
- `rv_daily_ledger_runner_liability_snapshot`:
- `event_ts`, `meeting_key`, `runner_id`, `horse_win_takeout`, `horse_win_hold`, `horse_place_takeout`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 57)

- What trigger threshold should raise a production alert when `private_plus_market` no longer outperforms `private_only` in calibration/CLV windows?
- Should the `rv_deduction_delivery_contract_registry` support meeting-level override events, or only approval-period defaults with manual exceptions?
- For designated WSP deadline misses, do we quarantine affected files from training only, or also suppress strategy promotion and live scaling decisions?
- How should we map RV daily-ledger liability fields into a cross-jurisdiction schema where non-RV providers may not expose equivalent fields?

## Ranked implementation backlog (delta, pass 57)

### P0 additions

1. Implement `market_information_asymmetry_assumption_snapshot` and `model_blend_diagnostic_event`; add fail-safe alerts when market-blend edge collapses.
2. Build `rv_deduction_delivery_contract_snapshot` + `rv_deduction_delivery_fallback_event` and wire settlement logic to mechanism/fallback state.
3. Add `rv_reporting_clock_snapshot` + `rv_daily_ledger_submission_event` with deadline monitors and fail-closed training gates for late/missing designated-WSP submissions.
4. Implement `rv_bet_type_governance_event` so unapproved bet-type routes are blocked by jurisdiction policy checks.

### P1 additions

1. Backtest robustness of execution and calibration under simulated deduction-feed path failures (`api` outage -> table fallback).
2. Evaluate predictive utility of RV liability fields (`HorseWinHold`, `HorseWinTakeout`) for late-window price-impact and slippage models.
3. Build FY-version diff checks for RV guide/schema revisions and auto-open migration tasks when clocks or fields change.

## Sources for this update (pass 57)

- William Benter, *Computer Based Horse Race Handicapping and Wagering Systems: A Report* (1994): https://gwern.net/doc/statistics/decision/1994-benter.pdf
- Racing Victoria Standard Conditions of Approval (effective 1 March 2025): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf
- Racing Victoria Guide to the Provision of Information 2025/26: https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf

## Incremental architecture decisions from this run (2026-03-31, pass 59)

- Decision: add a `settlement_rollup_scope_guard` that tags market-level `listClearedOrders` aggregates as `window_non_isolated` for long-running multi-settlement markets.
- Why: Betfair documents that market-level rollups can include all settlements even when a settled date range is provided.
- Decision: add an `order_source_attribution_registry` using `includeSourceId` surfaces from current and cleared order APIs.
- Why: source attribution (`sourceIdKey`, `sourceIdDescription`) provides execution-channel lineage needed for robust fill/slippage and reconciliation diagnostics.

## Provider comparison (incremental high-signal additions, pass 59)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `listClearedOrders` / `listCurrentOrders` | Primary order-history contracts for source attribution and settled-rollup scope caveats in long-running markets | Attribution fields are optional/availability-dependent; rollup behavior can be misread as date-window isolated | A | Enforce source-attribution capture and add rollup-scope guards before periodized PnL reporting |

## Data contract additions required (incremental, pass 59)

- `betfair_order_source_contract_snapshot`:
- `captured_ts`, `include_source_id_supported_flag`, `source_url`.
- `order_source_attribution_snapshot`:
- `event_ts`, `order_id`, `bet_id`, `source_id_key`, `source_id_description`, `source_url`.
- `cleared_orders_rollup_scope_contract_snapshot`:
- `captured_ts`, `long_running_market_rollup_includes_all_settlements_flag`, `groupby_market_caveat_text`, `source_url`.
- `settlement_window_query_audit`:
- `query_ts`, `group_by`, `date_range_from`, `date_range_to`, `window_non_isolated_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 59)

- When `includeSourceId` is unavailable on specific records, what fallback attribution hierarchy should be applied (`customerStrategyRef`, account routing table, or unknown bucket)?
- Should periodized strategy reporting hard-fail on `groupBy=MARKET` during long-running market windows, or allow with explicit bias warnings?
- What policy should classify a market as `long-running` for reconciliation controls: multiple distinct `settledDate` values, elapsed settlement span threshold, or both?
- Do we require dual reconciliation views (`BET`-level authoritative, `MARKET`-level summary) for all investor-facing reporting?

## Ranked implementation backlog (delta, pass 59)

### P0 additions

1. Implement `order_source_attribution_registry` with `includeSourceId=true` in collectors and persist `sourceIdKey/sourceIdDescription` where available.
2. Add `settlement_rollup_scope_guard` and mark `groupBy=MARKET` rollups as non-window-isolated when long-running multi-settlement behavior is detected.
3. Build `settlement_window_query_audit` and block automated strategy-promotion reports when rollup-scope warnings are present.
4. Add report-layer controls that require BET-level settled reconciliation for date-window performance claims.

### P1 additions

1. Quantify attribution drift and execution-quality differences by `sourceIdKey` channel mix over time.
2. Backtest periodized PnL error introduced by market-level rollups versus bet-level reconciliation in long-running markets.
3. Add dashboard warnings for analysts when windowed market-level aggregates are used in research notebooks.

## Sources for this update (pass 59)

- Betfair `listClearedOrders` (updated 2024-11-05): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687749/listClearedOrders
- Betfair `listCurrentOrders` (updated 2024-11-05): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687504/listCurrentOrders

## Incremental architecture decisions from this run (2026-03-31, pass 60)

- Decision: add a `provider_reliability_dual_surface` architecture (`process_sla_surface` + `infrastructure_uptime_surface`) for Racing Australia feeds.
- Why: RA's annual report shows nominations timing under target while uptime remains near-perfect, so a single blended health score hides actionable risk.
- Decision: add a `service_phase_breach_guard` for pre-off data dependencies (nominations, acceptances, scratchings).
- Why: phase-level release timeliness misses directly affect feature freshness in late-window execution.
- Decision: add a `provider_operational_load_monitor` using RA outbound communication totals/averages.
- Why: high SMS/email throughput can coexist with SLA drift and should be modeled as an operational-pressure covariate.

## Provider comparison (incremental high-signal additions, pass 60)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia Consolidated Annual Service Standard Performance Report 2024-2025 | Annual process-phase SLA outcomes, system uptime by platform, and communication-load volumes in one primary source | Annual cadence only; not sufficient for intraday incident detection without monthly/real-time complements | A | Split provider reliability into process vs uptime surfaces and gate late-window features on phase-specific SLA health |

## Data contract additions required (incremental, pass 60)

- `ra_annual_service_standard_snapshot`:
- `captured_ts`, `reporting_period_start`, `reporting_period_end`, `metric_name`, `target_pct`, `actual_pct`, `variance_pct`, `traffic_light_status`, `source_url`.
- `ra_service_phase_metric_snapshot`:
- `captured_ts`, `phase_name`, `official_close_anchor`, `target_minutes_from_close`, `target_pct`, `actual_pct`, `variance_pct`, `breach_flag`, `source_url`.
- `ra_system_uptime_snapshot`:
- `captured_ts`, `system_name`, `unplanned_downtime_minutes`, `target_uptime_pct`, `actual_uptime_pct`, `source_url`.
- `ra_comms_load_snapshot`:
- `captured_ts`, `channel(sms|email)`, `annual_total`, `monthly_avg`, `source_url`.
- `provider_reliability_surface_state`:
- `event_ts`, `provider`, `process_sla_health(green|amber|red)`, `uptime_health(green|amber|red)`, `comms_load_state(low|normal|high)`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 60)

- What threshold should mark `process_sla_health=red` for strategy gating: any negative variance, or only breaches beyond `-1%` below standard?
- How should annual metrics be blended with monthly reports when they disagree on trend direction?
- Should `provider_operational_load_monitor` influence only data-confidence scoring, or also direct stake-sizing throttles in late windows?
- What fallback source hierarchy applies when annual report publication lags beyond expected cycle timing?

## Ranked implementation backlog (delta, pass 60)

### P0 additions

1. Implement `provider_reliability_dual_surface` and replace single RA health score logic in feature-store gating.
2. Build `ra_service_phase_metric_snapshot` ingestion and apply `service_phase_breach_guard` to pre-off model refresh and execution eligibility.
3. Add `ra_system_uptime_snapshot` + `ra_comms_load_snapshot` to monitoring with explicit decoupled alert channels (`process_sla` vs `uptime`).
4. Add `provider_reliability_surface_state` to replay metadata so backtests can condition on reliability regime.

### P1 additions

1. Backtest whether phase-level SLA breaches predict CLV degradation or stale-feature incidents near jump time.
2. Evaluate interaction effects between communications-load spikes and publish-lag anomalies.
3. Build annual-vs-monthly reconciliation checks that auto-open investigation tasks when divergence exceeds configured thresholds.

## Sources for this update (pass 60)

- Racing Australia Consolidated Annual Service Standard Performance Report 2024-2025 (12 months ending June 2025): https://www.racingaustralia.horse/FreeServices/Reports/Consolidated-Report-2024-2025.pdf

## Incremental architecture decisions from this run (2026-03-31, pass 61)

- Decision: add a `dead_heat_settlement_engine` as a first-class settlement branch for Betfair win/place markets.
- Why: Betfair's official dead-heat contract is formulaic (stake prorating by tied-runner cardinality and payout-place count), so generic settlement handling is insufficient for accurate PnL attribution.
- Decision: add a `ra_form_lineage_contract` for NSW FreeFields `Form` ingestion.
- Why: `True Weight` semantics, welfare-fund percentage allocations, and meeting publish/deadline clocks are explicit contract-like metadata needed for PIT correctness and reproducible handicap interpretation.

## Provider comparison (incremental high-signal additions, pass 61)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Support `Dead Heat` | Deterministic settlement logic for tied outcomes in Exchange win/place markets, including place-market payout/tied-runner formula and lay/back symmetry | Support-doc surface (not versioned API schema); requires periodic snapshot hashing/date capture | A | Implement dead-heat settlement branch and enforce dead-heat-aware PnL labeling |
| Racing Australia FreeFields `Form` pages (NSW example) | `True Weight` definition, welfare-fund allocation percentages, plus operational clocks (`FinalFields Last Published`, riders/scratchings deadlines) and race field-limit metadata | Web-surface contract can drift and may vary by jurisdiction/page family; parser and lineage checks required | A/B | Add `ra_form_lineage_contract` and persist meeting clocks + weight semantics in PIT warehouse |

## Data contract additions required (incremental, pass 61)

- `betfair_dead_heat_rule_snapshot`:
- `captured_ts`, `win_settlement_prorata_stake_flag`, `place_settlement_formula_text`, `lay_back_symmetry_flag`, `source_url`.
- `dead_heat_settlement_event`:
- `event_ts`, `market_id`, `selection_id`, `bet_id`, `market_type(win|place)`, `tied_runner_count`, `payout_places_count`, `prorated_stake`, `settlement_multiplier`, `source_url`.
- `ra_form_contract_snapshot`:
- `captured_ts`, `jurisdiction`, `true_weight_column_present_flag`, `true_weight_definition_text`, `equine_welfare_fund_pct`, `jockey_welfare_fund_pct`, `source_url`.
- `ra_form_meeting_clock_snapshot`:
- `event_ts`, `meeting_key`, `final_fields_last_published_ts_local`, `riders_declared_before_ts_local`, `scratching_close_ts_local`, `source_url`.
- `ra_form_race_constraint_snapshot`:
- `event_ts`, `meeting_key`, `race_number`, `field_limit_main`, `field_limit_emergencies`, `source_url`.
- `ra_form_runner_weight_snapshot`:
- `event_ts`, `meeting_key`, `race_number`, `runner_id`, `declared_weight_kg`, `true_weight_kg_nullable`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 61)

- For dead-heat handling, do we hard-block strategy-PnL reporting when `tied_runner_count` is unknown, or allow provisional settlement with confidence tags?
- Should `ra_form_lineage_contract` be NSW-only initially (where `True Weight` is explicit), or generalized immediately with nullable semantics across all states?
- Do welfare-fund percentages belong in settlement-context metadata only, or should they also feed pricing diagnostics for pool-economics comparability by jurisdiction/date?
- What parser-confidence threshold should quarantine FreeFields `Form` rows when race-level notes format drifts?

## Ranked implementation backlog (delta, pass 61)

### P0 additions

1. Implement `dead_heat_settlement_engine` with explicit win/place branch formulas and attach `dead_heat_settlement_event` to all settled Betfair bets.
2. Add `betfair_dead_heat_rule_snapshot` capture with source hash/date and fail-closed warning when rule snapshot is stale.
3. Build `ra_form_lineage_contract` ingestion for NSW `Form` pages, persisting `true_weight`, welfare-fund percentages, and meeting clocks.
4. Enforce PIT gates using `final_fields_last_published`, riders deadline, and scratching close timestamps before feature materialization.

### P1 additions

1. Backtest PnL attribution drift between dead-heat-aware and dead-heat-naive settlement paths.
2. Evaluate signal lift from `true_weight_minus_declared_weight` and `field_limit_pressure` on late-window price-impact/slippage models.
3. Extend `ra_form_lineage_contract` to non-NSW states with jurisdiction-specific capability flags and missingness audits.

## Sources for this update (pass 61)

- Betfair Support - `Dead Heat` (captured 2026-03-31): https://support.betfair.com/app/answers/detail/a_id/403
- Racing Australia FreeFields `Form` example (captured 2026-03-31): https://www.racingaustralia.horse/FreeFields/Form.aspx?Key=2026Feb28%2CNSW%2CRoyal+Randwick

## Incremental architecture decisions from this run (2026-03-31, pass 62)

- Decision: add a `track_policy_outcome_benchmark` layer keyed by venue + policy regime + meet window.
- Why: Del Mar now provides official post-policy summer/fall handle and field-size outcomes that can benchmark policy-regime drift without claiming causality.
- Decision: add a `provider_result_shape_normalizer` branch for BetMakers dead-heat payloads.
- Why: BetMakers documents duplicate `tabNo` rows across positions and an explicit "use highest position" rule, which must be applied before canonical result/settlement joins.

## Provider comparison (incremental high-signal additions, pass 62)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Del Mar official 2025 season close releases (summer + fall) | Post-policy outcome metrics (`total handle`, `avg daily handle`, `field size`, day-count/exclusion context) from the same venue where CAW cutoff policy changed | Observational outcome reporting; not causal attribution on its own | A/B | Add policy-outcome benchmark store and use for drift checks, not direct strategy-crediting |
| BetMakers Core API FAQ (`Dead Heats` result handling) | Provider-specific result-shape contract: duplicate `tabNo` across positions with highest-position normalization rule | FAQ-level contract; requires payload-level validation and drift checks | A/B | Implement provider-specific dead-heat normalization prior to canonical settlement labeling |

## Data contract additions required (incremental, pass 62)

- `track_policy_outcome_snapshot`:
- `captured_ts`, `track_id`, `policy_name`, `policy_effective_date`, `meet_name`, `meet_start_date`, `meet_end_date`, `meet_days`, `total_handle_usd_m`, `total_handle_yoy_pct`, `avg_daily_handle_usd_m`, `avg_daily_handle_yoy_pct`, `avg_field_size`, `avg_field_size_yoy_delta`, `weather_disruption_flag`, `event_exclusion_note`, `source_url`.
- `policy_outcome_benchmark_state`:
- `event_ts`, `track_id`, `policy_regime_id`, `window(pre|transition|post)`, `handle_index_vs_prior`, `field_size_index_vs_prior`, `confidence_tag(observational|causal_pending)`, `source_url`.
- `betmakers_dead_heat_contract_snapshot`:
- `captured_ts`, `duplicate_tabno_across_positions_flag`, `highest_position_rule_flag`, `example_payload_hash`, `source_url`.
- `betmakers_dead_heat_position_event`:
- `event_ts`, `race_id`, `tabno`, `raw_positions_json`, `highest_position_selected`, `normalization_applied_flag`, `source_url`.
- `provider_result_normalization_event`:
- `event_ts`, `provider`, `rule_applied`, `rows_before`, `rows_after`, `schema_drift_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 62)

- What minimum post-policy sample window do we require before `policy_outcome_benchmark_state` can influence risk throttles?
- Should policy-outcome benchmarks be normalized by national handle trend controls (for example Breeders' Cup cycle effects) before any automated alerting?
- For BetMakers dead heats, do we preserve both `highest_position` and full duplicated placement set in canonical warehouse, or keep full set only in raw zone?
- What threshold of dead-heat normalization anomalies should trigger quarantine of provider result payloads?

## Ranked implementation backlog (delta, pass 62)

### P0 additions

1. Implement `track_policy_outcome_snapshot` ingestion for Del Mar season-close releases and wire `policy_outcome_benchmark_state` into monitoring.
2. Add explicit `observational` confidence tagging to policy-outcome dashboards to prevent causal over-interpretation.
3. Implement `betmakers_dead_heat_contract_snapshot` and `betmakers_dead_heat_position_event` normalization before canonical result joins.
4. Add `provider_result_normalization_event` auditing with row-count and schema-drift checks.

### P1 additions

1. Backtest whether policy-outcome benchmarks improve venue-regime drift detection versus parameter-only policy timelines.
2. Measure label and PnL attribution differences between normalized vs raw BetMakers dead-heat result handling.
3. Add regression tests that replay dead-heat payload examples with duplicate `tabNo` and assert deterministic normalization output.

## Sources for this update (pass 62)

- Del Mar official release (published 2025-09-07): https://www.dmtc.com/media/news/del-mar-concludes-86th-summer-season-with-increases-in-wagering-2953
- Del Mar official release (published 2025-11-30): https://www.dmtc.com/media/news/del-mar-fall-meet-delivers-strong-gains-in-handle-3073
- BetMakers Docs - Core API FAQ (`How do we handle Dead Heats for results (tie)?`, captured 2026-03-31): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental architecture decisions from this run (2026-03-31, pass 63)

- Decision: add a `caw_account_operating_envelope_registry` for venue- and source-specific CAW controls.
- Why: CHRB-hosted CAW documentation adds explicit operating constraints (classification threshold, no-cancel policy, throughput and onboarding thresholds) that are not represented by pool-share metrics alone.
- Decision: add a `ra_scratching_channel_state_machine` with pending-approval branches.
- Why: Racing Australia's official scratching workflow is channel-dependent and includes pending steward approval states (Group 1 and NT), so single-timestamp scratching models are unsafe.

## Provider comparison (incremental high-signal additions, pass 63)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB-hosted CAW Q&A letter (Elite Turf Club) | Quantified CAW operating envelope (`>5 bets/s` CAW classification, `2,000 bets/s` processing claim, no-cancel policy, membership/annual-threshold controls) | Operator-authored claims hosted by regulator; still requires independent corroboration before hard production thresholds | A/B | Add source-tagged CAW operating-envelope registry and keep threshold rules confidence-tagged |
| Racing Australia FreeFields Scratching Release Information | Channel-specific scratching lifecycle (`Service Centre` double-check, `Stable Assist` live release), pending-steward branch for Group 1/NT, and queue/deadline completion semantics | Web-surface contract can drift; requires parser confidence checks and version snapshots | A | Implement channel-aware scratching state machine and pending-state-aware PIT gates |

## Data contract additions required (incremental, pass 63)

- `caw_operating_envelope_snapshot`:
- `captured_ts`, `source_type`, `single_client_max_bets_per_second`, `caw_classification_threshold_bets_per_second`, `cancellation_restriction_policy`, `api_integration_required_flag`, `min_annual_wager_threshold_usd`, `membership_range_low`, `membership_range_high`, `background_check_cadence`, `source_url`.
- `caw_account_classification_event`:
- `event_ts`, `venue_id`, `account_id`, `observed_peak_bets_per_second`, `classification(non_caw|caw)`, `source_url`.
- `caw_execution_constraints_state`:
- `event_ts`, `account_id`, `cancel_allowed_flag`, `api_route_required_flag`, `classification_source_confidence`, `source_url`.
- `ra_scratching_channel_contract_snapshot`:
- `captured_ts`, `service_centre_double_check_flag`, `stable_assist_live_release_flag`, `group1_pending_steward_approval_flag`, `nt_pending_steward_approval_flag`, `source_url`.
- `ra_scratching_queue_contract_snapshot`:
- `captured_ts`, `queue_timestamp_logging_flag`, `pre_deadline_queue_must_complete_flag`, `volume_weather_dependency_flag`, `source_url`.
- `ra_scratching_state_event`:
- `event_ts`, `meeting_key`, `race_number`, `runner_id`, `channel(service_centre|stable_assist)`, `state(submitted_live|pending_steward|finalized)`, `steward_approval_required_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 63)

- For CHRB-hosted CAW constraints, what corroboration threshold is required before we convert `A/B` source-tagged operating-envelope parameters into hard controls?
- Should `caw_account_operating_envelope_registry` support venue-specific overrides where host-track definitions differ from California thresholds?
- For RA scratching states, do we treat `pending_steward` runners as ineligible for final pre-off model snapshots, or allow with confidence penalties?
- What lag threshold between `submitted_live` and `finalized` should trigger automated risk-throttle in late windows?

## Ranked implementation backlog (delta, pass 63)

### P0 additions

1. Implement `caw_operating_envelope_snapshot` ingestion and `caw_account_classification_event` derivation with source-confidence tagging.
2. Build `caw_execution_constraints_state` and enforce explicit `cancel_allowed_flag`/`api_route_required_flag` checks in CAW-vs-retail simulation paths.
3. Implement `ra_scratching_channel_state_machine` and persist `ra_scratching_state_event` transitions with channel provenance.
4. Add pre-off feature gates that require `finalized` scratching state for runners marked `pending_steward`.

### P1 additions

1. Backtest late-odds volatility models with `caw_operating_envelope_score` features versus pool-share-only baselines.
2. Quantify model and execution drift when pending-state scratchings are treated as final too early.
3. Add parser-drift tests for RA scratching page structure and alert when pending-approval text/semantics change.

## Sources for this update (pass 63)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05; captured 2026-03-31): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Racing Australia FreeFields Scratching Release Information (captured 2026-03-31): https://www.racingaustralia.horse/FreeFields/ScratchingReleaseInformation.aspx

## Incremental architecture decisions from this run (2026-03-31, pass 64)

- Decision: add a `provider_usage_eligibility_gate` as a hard precondition before any provider is classified as execution-capable.
- Why: The Racing API's own FAQ/terms explicitly prohibit use by betting operators/sportsbooks, which is a legal-eligibility blocker independent of feed quality.
- Decision: add a `rights_owner_entitlement_matrix` for provider onboarding.
- Why: Podium documentation states full coverage can require multiple rights-owner agreements, so provider-level entitlement flags are insufficient.
- Decision: add a `capital_capacity_attribution_layer` in strategy review dashboards.
- Why: Walsh's first-person ownership/capital description indicates realized performance can be constrained by capital structure even when model signal exists.

## Provider comparison (incremental high-signal additions, pass 64)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| The Racing API FAQ + Terms of Service | Explicit published policy on prohibited betting-operator/sportsbook use, plus baseline request/freshness constraints | Hard legal-usage constraint for operator workflows under current terms | A | Mark as ineligible for execution/operator stack until terms materially change |
| Podium API pages + onboarding docs | Rights-owner entitlement granularity and PUSH coverage behavior | Coverage depends on signed agreements across rights owners; potential partial visibility | A/B | Build rights-owner entitlement matrix and feature-completeness gating |
| Walsh interview transcript (Andrew Leigh) | Primary-source signal that capital ownership/share affects realized success and model deployment scale | Interview evidence is directional, not full operational ledger data | A/B | Add capital-capacity attribution controls in strategy scaling reviews |

## Data contract additions required (incremental, pass 64)

- `provider_usage_eligibility_snapshot`:
- `provider`, `captured_ts`, `prohibited_operator_use_flag`, `prohibited_sportsbook_use_flag`, `default_rate_limit_rps`, `today_update_interval_sec`, `eligibility_state`, `source_url`.
- `provider_usage_eligibility_event`:
- `provider`, `decision_ts`, `prior_state`, `new_state`, `decision_reason`, `approver`, `source_url`.
- `rights_owner_entitlement_matrix`:
- `provider`, `rights_owner`, `jurisdiction`, `contract_signed_flag`, `coverage_scope`, `push_enabled_flag`, `effective_from`, `effective_to`, `source_url`.
- `provider_coverage_completeness_snapshot`:
- `provider`, `capture_ts`, `region`, `track_count_expected`, `track_count_entitled`, `completeness_score`, `source_url`.
- `capital_capacity_attribution_snapshot`:
- `strategy_id`, `capture_ts`, `owner`, `ownership_pct`, `capital_constraint_score`, `deployment_limit_proxy`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 64)

- What legal/compliance process is required to move a provider from `ineligible` to `eligible` when terms are revised?
- Should rights-owner entitlement be enforced as a hard feature gate, or as confidence-weighted downranking in research-only mode?
- What minimum evidence is needed to operationalize capital-capacity attribution beyond interview evidence (for example internal bankroll-turnover logs)?
- Which owner signs off provider-eligibility overrides when business pressure conflicts with published provider terms?

## Ranked implementation backlog (delta, pass 64)

### P0 additions

1. Implement `provider_usage_eligibility_gate` and block execution routing for providers with explicit operator-use prohibitions.
2. Build `provider_usage_eligibility_snapshot` ingestion from provider FAQ/terms sources with source-hash drift alerts.
3. Implement `rights_owner_entitlement_matrix` and require rights-owner completeness checks before feature promotion.
4. Add `provider_coverage_completeness_snapshot` and emit hard warnings when entitlement completeness drops below threshold.

### P1 additions

1. Add a provider-terms diff watcher that triggers legal review when usage-language changes.
2. Build research-mode fallback policy for ineligible providers (allowed: exploratory analytics only; blocked: execution and production model training).
3. Add `capital_capacity_attribution_snapshot` into strategy review reports to separate model-edge quality from deployment-capacity limits.

## Sources for this update (pass 64)

- David Walsh interview transcript with Andrew Leigh (captured 2026-03-31): https://www.andrewleigh.com/david_walsh_tgl
- The Racing API FAQ (captured 2026-03-31): https://www.theracingapi.com/faq
- The Racing API Terms of Service (captured 2026-03-31): https://www.theracingapi.com/terms-of-service
- Podium horse-racing API product page (captured 2026-03-31): https://podiumsports.com/horse-racing-api/
- Podium onboarding documentation page (captured 2026-03-31): https://podiumsports.com/resource/podium-racing-api-onboarding-documentation/

## Incremental architecture decisions from this run (2026-03-31, pass 65)

- Decision: add an `au_off_to_inplay_void_guard` in execution and replay pipelines.
- Why: Betfair Exchange rules define an Australian horse-racing exception where bets matched after official off but before intentional in-play turn are void, so this interval must be modeled explicitly.
- Decision: add an `sp_reconciliation_route_annotator` in settlement analytics.
- Why: Betfair SP rules allow reconciliation against unmatched Exchange offers and note a possible Betfair-group licensed risk counterparty path, which can alter attribution assumptions.
- Decision: add an `rnsw_bet_back_credit_eligibility_engine` with point-in-time rule + operator snapshot checks.
- Why: Racing NSW bet-back-credit conditions require account-channel and operator qualification checks beyond simple operator-list presence.

## Provider comparison (incremental high-signal additions, pass 65)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange General Rules | AU horse-racing off-to-in-play void clause plus SP reconciliation/counterparty mechanics | Rules text can evolve; requires periodic snapshot + parser regression tests | A | Implement explicit off-to-in-play void guard and SP-route attribution metadata |
| Racing NSW approved operators + bet-back-credit page | Operator approval cadence signal and concrete bet-back-credit qualification conditions (account path + operator qualification) | Web-surface legal/operational text can change and references full standard conditions | A | Build PIT bet-back-credit eligibility engine; do not assume credits from operator-list presence alone |

## Data contract additions required (incremental, pass 65)

- `betfair_market_phase_rule_snapshot`:
- `captured_ts`, `jurisdiction`, `off_to_inplay_matched_bets_void_flag`, `sp_reconciliation_counterparty_possible_flag`, `source_url`.
- `execution_void_window_event`:
- `event_ts`, `market_id`, `selection_id`, `order_submit_ts`, `order_match_ts`, `official_off_ts`, `inplay_turn_ts`, `voided_by_rule_flag`, `source_url`.
- `sp_reconciliation_route_event`:
- `event_ts`, `market_id`, `sp_reconciliation_ts`, `used_unmatched_exchange_offers_flag`, `group_risk_counterparty_possible_flag`, `source_url`.
- `rnsw_bet_back_credit_rule_snapshot`:
- `captured_ts`, `approved_list_updated_regularly_flag`, `account_channel_required_flag`, `cash_bet_ineligible_flag`, `operator_qualification_required_flag`, `source_url`.
- `rnsw_operator_approval_snapshot`:
- `snapshot_ts`, `operator_name`, `approved_flag`, `source_url`.
- `bet_back_credit_eligibility_event`:
- `event_ts`, `operator_name`, `via_account_flag`, `operator_qualified_flag`, `eligible_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 65)

- For AU horse racing, what is our hard cutoff policy for submissions between `official_off_ts` and `inplay_turn_ts` in volatile markets?
- In SP attribution, do we treat possible Betfair-group risk-counterparty participation as a separate reconciliation regime in post-trade analytics?
- What evidence bundle (rule snapshot + operator snapshot + account-path proof) is mandatory before booking expected bet-back credits into EV?
- How frequently should Racing NSW operator snapshots run to control eligibility drift without excessive operational noise?

## Ranked implementation backlog (delta, pass 65)

### P0 additions

1. Implement `au_off_to_inplay_void_guard` and enforce void-risk tagging for all AU horse-racing orders around off/in-play transition.
2. Add `execution_void_window_event` capture in live + replay modes and hard-fail reconciliation when `official_off_ts` or `inplay_turn_ts` is missing.
3. Implement `rnsw_bet_back_credit_eligibility_engine` with rule snapshots plus operator approval snapshots at bet time.
4. Gate EV calculations so bet-back credits are applied only when `eligible_flag=true` with complete provenance.
5. Add source-drift watcher for Betfair Exchange rules and Racing NSW bet-back-credit text.

### P1 additions

1. Backtest impact of excluding void-window fills on CLV/PnL stability in AU horse-racing late windows.
2. Add SP-route diagnostics to compare edge attribution between SP reconciliation paths and regular exchange fills.
3. Stress-test EV sensitivity to operator-qualification drift and missing account-path evidence in NSW bet-back-credit assumptions.

## Sources for this update (pass 65)

- Betfair Exchange General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Racing NSW approved licensed wagering operators and bet-back-credit conditions (captured 2026-03-31): https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/

## Incremental architecture decisions from this run (2026-03-31, pass 66)

- Decision: add a `feature_annotation_lineage_layer` for Benter/Woods-style high-touch curation signals.
- Why: WIRED's Hong Kong profile reports dedicated race-tape review and `130` characteristic scoring, implying feature-production depth should be modeled as a first-class regime variable.
- Decision: add an `execution_footprint_management_module` in order-placement policy.
- Why: The same source reports staged small-tranche betting to reduce observable footprint, indicating realized edge depends on concealment policy as well as forecast quality.
- Decision: add an `exotic_combinatorial_budget_optimizer` for high-dimensional pool products.
- Why: Reported Triple Trio-scale coverage (`900,000` combinations, `$1.2m` outlay) implies exotic staking needs dedicated combinatorial constraints, not single-runner sizing logic.

## Provider comparison (incremental high-signal additions, pass 66)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| WIRED 2002 Hong Kong computer-team profile | Concrete operational details: feature-annotation scale (`130` traits), model-build/maintenance effort signals, stake-footprint masking pattern, and exotic-combination scale marker | Long-form journalism with participant/expert quotes, not regulator/API contract text; treat as operational prior rather than hard rule | B | Add annotation-lineage, footprint-management, and combinatorial-optimizer layers with confidence-tagged priors |

## Data contract additions required (incremental, pass 66)

- `feature_annotation_process_snapshot`:
- `captured_ts`, `operator_group`, `annotation_characteristic_count`, `video_review_required_flag`, `annotation_team_size_estimate`, `source_url`.
- `model_maintenance_cost_snapshot`:
- `capture_ts`, `initial_build_time_months_estimate`, `initial_build_cost_usd_estimate`, `recurring_update_cadence`, `source_url`.
- `execution_footprint_tranche_event`:
- `event_ts`, `market_id`, `selection_id`, `tranche_stake`, `tranche_count`, `inter_tranche_gap_ms`, `intent_masking_hypothesis_flag`, `source_url`.
- `adversarial_flow_monitor_snapshot`:
- `capture_ts`, `external_flow_service_present_flag`, `service_name`, `source_url`.
- `exotic_combination_plan_event`:
- `event_ts`, `bet_type`, `combination_count`, `total_outlay`, `estimated_pool_share`, `execution_window_sec`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 66)

- What minimum internal evidence threshold is required before footprint-masking policies can alter live staking behavior (rather than remain research-only)?
- Should `annotation_characteristic_count` be used as a hard model-governance gate or a soft confidence feature in deployment scoring?
- What pool-share cap should `exotic_combinatorial_budget_optimizer` enforce by default to avoid self-defeating price impact?
- How do we distinguish intentional tranche masking from benign order fragmentation in post-trade analytics?

## Ranked implementation backlog (delta, pass 66)

### P0 additions

1. Implement `feature_annotation_process_snapshot` and `model_maintenance_cost_snapshot` ingestion for named-operator historical priors with evidence-confidence tags.
2. Build `execution_footprint_tranche_event` telemetry and add detection rules for high-visibility burst patterns near off.
3. Implement initial `exotic_combinatorial_budget_optimizer` constraints (`max_combination_count`, `max_pool_share`, `max_outlay_per_window`).
4. Add `adversarial_flow_monitor_snapshot` support so replay diagnostics can test footprint leakage hypotheses.

### P1 additions

1. Backtest whether footprint-entropy-aware tranche policies improve realized edge versus naive lump-sum placement in late windows.
2. Evaluate whether annotation-lineage depth features improve robustness when transferring models across jurisdictions/eras.
3. Run stress tests for exotic combinatorial plans under pool-size shocks and late-odds drift.

## Sources for this update (pass 66)

- WIRED, *The High Tech Trifecta* (published 2002-03-01; captured 2026-03-31): https://www.wired.com/2002/03/betting/

## Incremental architecture decisions from this run (2026-03-31, pass 67)

- Decision: add an `app_key_lifecycle_guard` service that validates key state and production-routing assumptions before collector start.
- Why: Betfair docs clarify delayed keys still run on production exchange infrastructure and live keys start inactive, so mode labels alone are unsafe.
- Decision: add an `order_fragment_lineage_reconciler` with explicit `betIds` batching and `matchedSince` semantics.
- Why: `listMarketBook` imposes `betIds<=250` and returns full matched fragments for qualifying orders, which can break naive cursor-based reconciliation.
- Decision: split provider onboarding into `plan_capability` and `commercial_consent` tracks (starting with Punting Form).
- Why: Punting Form product pages advertise API capability by plan while Terms set personal-use default unless written commercial consent exists.

## Provider comparison (incremental high-signal additions, pass 67)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`Delayed` vs `Live` key article) + `listMarketBook` docs | App-key lifecycle semantics (live initially inactive, delayed on production), plus order retrieval boundaries (`betIds` limit, `matchedSince` order-fragment behavior) | Support/docs can drift; requires runtime contract checks and regression tests | A | Add app-key lifecycle guard and fragment-lineage reconciler before any promotion |
| Punting Form Professional page + Terms | Plan-advertised API capabilities and explicit legal default (`personal use only` unless prior written commercial consent) | Commercial entitlement cannot be inferred from tier labels; requires documentable consent artifacts | A | Require written-consent artifact for production use; keep capability/consent tracked separately |

## Data contract additions required (incremental, pass 67)

- `app_key_lifecycle_snapshot`:
- `captured_ts`, `live_key_assigned_flag`, `delayed_key_assigned_flag`, `live_key_initially_inactive_flag`, `delayed_key_runs_on_production_flag`, `source_url`.
- `execution_environment_guard_event`:
- `event_ts`, `app_key_mode(delayed|live)`, `production_route_allowed_flag`, `guard_reason`, `source_url`.
- `order_pull_contract_snapshot`:
- `captured_ts`, `max_betids_per_request`, `matchedsince_returns_all_fragments_for_qualifying_order_flag`, `executable_orders_always_returned_flag`, `source_url`.
- `order_fragment_lineage_event`:
- `event_ts`, `bet_id`, `fragment_match_ts`, `fragment_before_matchedsince_flag`, `pull_cursor_ts`, `source_url`.
- `provider_plan_capability_snapshot`:
- `provider`, `capture_ts`, `plan_name`, `api_access_advertised_flag`, `sectional_api_advertised_flag`, `historical_data_option_flag`, `source_url`.
- `provider_commercial_consent_snapshot`:
- `provider`, `capture_ts`, `personal_use_only_default_flag`, `prior_written_consent_required_flag`, `consent_artifact_ref`, `effective_from`, `effective_to`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 67)

- What hard evidence bundle should satisfy `commercial consent` for provider production usage (contract PDF hash, countersign date, scope clause, and expiry)?
- Should delayed-key production-touch sessions be blocked from all auto-order code paths at process start, or only when specific execution features are enabled?
- For `matchedSince` reconciliation, do we anchor dedup keys at `(betId, fragment_match_ts, price, size)` or keep provider-native fragment IDs only?
- What alert threshold should trigger quarantine when observed `betIds` pagination or fragment lineage differs from documented contract behavior?

## Ranked implementation backlog (delta, pass 67)

### P0 additions

1. Implement `app_key_lifecycle_guard` and fail startup when key-state/routing assertions are missing.
2. Add explicit run-mode policy: delayed-key sessions are `production-touching` and must be execution-disabled by default.
3. Build `order_fragment_lineage_reconciler` with deterministic `betIds<=250` batching and idempotent fragment merge.
4. Persist `order_pull_contract_snapshot` and block promotion when reconciliation lineage completeness falls below threshold.
5. Add `provider_commercial_consent_snapshot` gate so provider-backed models cannot enter production without written-consent artifact.

### P1 additions

1. Run reconciliation stress tests across synthetic high-fragment order books to validate cursor correctness under `matchedSince` semantics.
2. Add weekly contract-drift checks on Betfair key docs and Punting Form terms/product pages with hash-based diff alerts.
3. Build dual dashboards for provider `plan capability` vs `commercial consent` to prevent entitlement assumptions from product-tier metadata.

## Sources for this update (pass 67)

- Betfair support: delayed vs live application keys (updated 2025-10-30; captured 2026-03-31): https://support.developer.betfair.com/hc/en-us/articles/360009638032-When-should-I-use-the-Delayed-or-Live-Application-Key
- Betfair Exchange API docs: `listMarketBook` (updated 2024-06-04; captured 2026-03-31): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook
- Punting Form Professional product page (captured 2026-03-31): https://puntingform.com.au/products/professional
- Punting Form Terms and Conditions (captured 2026-03-31): https://puntingform.com.au/terms-and-conditions

## Incremental architecture decisions from this run (2026-04-01, pass 68)

- Decision: add a `stream_segment_commit_controller` that gates checkpoint persistence on segment boundaries.
- Why: Betfair Stream docs define `SEG_START`/`SEG_END` with segmented initial-image behavior, and explicitly tie clock persistence to `SEG_END` for segmented flows.
- Decision: add a `stream_message_size_guardrail` with segmentation-aware alerting.
- Why: Betfair Stream docs publish a `5MB` maximum message size, meaning oversized updates are split and require deterministic assembly before state mutation.
- Decision: add a `segment_bootstrap_integrity_gate` to replay/live promotion criteria.
- Why: segmented flows can emit `fullImage=true` with empty `marketChanges` on intermediate segments; treating those frames as complete images can corrupt replay state and downstream execution analytics.

## Provider comparison (incremental high-signal additions, pass 68)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange Stream API docs (updated 2026-02-20) | Explicit segmented-image contract (`SEG_START`/`SEG_END`), `5MB` max message size, and segment-aware clock-commit guidance | Contract is documentation-layer and can evolve; must be enforced/validated in runtime telemetry | A | Implement segment-commit controller + message-size/segmentation observability before promotion |

## Data contract additions required (incremental, pass 68)

- `stream_segmentation_contract_snapshot`:
- `captured_ts`, `max_message_size_bytes`, `segmentation_enabled_supported_flag`, `segment_start_token`, `segment_end_token`, `clock_commit_on_seg_end_flag`, `source_url`.
- `stream_segment_buffer_event`:
- `event_ts`, `connection_id`, `market_count`, `segment_type`, `full_image_flag`, `empty_marketchanges_flag`, `buffer_depth`, `source_url`.
- `stream_checkpoint_commit_event`:
- `event_ts`, `connection_id`, `commit_clk`, `commit_pt`, `commit_trigger(seg_end|unsegmented_message)`, `source_url`.
- `stream_segment_integrity_snapshot`:
- `capture_ts`, `connection_id`, `segmented_cycle_count`, `incomplete_cycle_count`, `mean_cycle_duration_ms`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 68)

- What hard timeout should close an in-flight segmented cycle before forcing full-image resubscribe?
- Should `segment_bootstrap_integrity_gate` be a hard block for all late-window execution analytics, or a confidence-weighted downgrade?
- What alert threshold on `incomplete_cycle_count` should auto-disable model promotion for microstructure-sensitive strategies?
- Do we shard subscriptions proactively based on observed segmented-cycle duration, or only react after integrity breaches?

## Ranked implementation backlog (delta, pass 68)

### P0 additions

1. Implement `stream_segment_commit_controller` and block checkpoint writes until `SEG_END` for segmented flows.
2. Add `stream_message_size_guardrail` and alerting for segment-frequency spikes that indicate payload-pressure regimes.
3. Build `stream_segment_buffer_event` and `stream_checkpoint_commit_event` telemetry in both live collectors and replay workers.
4. Add `segment_bootstrap_integrity_gate` to promotion checks for all microstructure and execution-quality metrics.

### P1 additions

1. Backtest sensitivity of CLV/PnL conclusions to simulated segmented-cycle loss (missing `SEG_END`) versus clean cycles.
2. Add adaptive stream-sharding policy based on segmented-cycle duration and incomplete-cycle rate.
3. Build dashboards correlating segmented-cycle anomalies with stale-price incidents and reconciliation faults.

## Sources for this update (pass 68)

- Betfair Exchange Stream API (updated 2026-02-20; captured 2026-04-01): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange+Stream+API

## Incremental architecture decisions from this run (2026-04-01, pass 69)

- Decision: add a `betfair_status_gate` in collector/execution startup and runtime health checks.
- Why: Betfair publishes operation-level status components (including Betting API, Stream API, and regional exchange surfaces), so green aggregate assumptions are unsafe.
- Decision: add a `release_outage_notice_ingestor` using Betfair's official notification channels.
- Why: Betfair support explicitly routes release/planned-outage communication through Developer Forum announcements; these notices should automatically drive maintenance windows and change calendars.
- Decision: add a `provider_ops_regime_annotator` for backtests/replay and live attribution.
- Why: provider-side outage/maintenance regimes can contaminate microstructure and fill-quality metrics if not separated from model behavior.

## Provider comparison (incremental high-signal additions, pass 69)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support status + release-notification FAQs plus Betfair status page | Official status endpoint pointer, operation-level component health surface, and official announcement channel for releases/planned outages | Support/status surfaces can drift; forum announcements may require parsing and dedup controls | A | Add status gate + notice ingestor as hard dependencies for live scheduling and promotion |

## Data contract additions required (incremental, pass 69)

- `betfair_status_component_snapshot`:
- `capture_ts`, `component_name`, `component_status`, `status_page_url`, `source_url`.
- `betfair_release_notice_event`:
- `event_ts`, `notice_channel(status_page|forum_announcements)`, `notice_type(release|planned_outage|incident_update)`, `notice_title`, `notice_url`, `effective_from`, `effective_to`.
- `provider_ops_regime_window`:
- `provider`, `window_start_ts`, `window_end_ts`, `regime_type(normal|planned_maintenance|degraded|incident)`, `evidence_ref`, `source_url`.
- `execution_startup_gate_event`:
- `event_ts`, `gate_name(betfair_status_gate)`, `allowed_flag`, `blocking_component`, `reason_code`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 69)

- Which Betfair components are hard blockers (`Betting API`, `Stream API`, `Global Exchange`, `AUS Exchange`) versus soft warnings for our AU win pilot?
- What maximum staleness is acceptable for status snapshots before startup should fail closed?
- Should announcement ingestion block execution when parser confidence is low, or fallback to manual operator acknowledgement?
- How should replay scoring treat bets generated during status-degraded windows: exclude, downweight, or separate-regime report only?

## Ranked implementation backlog (delta, pass 69)

### P0 additions

1. Implement `betfair_status_gate` and block live execution startup when execution-critical components are degraded or stale.
2. Build `betfair_status_component_snapshot` polling with immutable snapshots and alerting on status transitions.
3. Implement `release_outage_notice_ingestor` for Betfair status/announcement channels and wire to scheduler blackout windows.
4. Add `provider_ops_regime_window` tagging to replay and live ledgers so model/performance attribution can isolate provider-operations effects.

### P1 additions

1. Backtest metric sensitivity (CLV/fill/slippage) with and without degraded/maintenance windows included.
2. Build operator dashboard showing status-component drift, announcement timeline, and blocked-startup incidents.
3. Add weekly contract-drift checks on Betfair support notification/status FAQs to detect policy-path changes.

## Sources for this update (pass 69)

- Betfair Developer Support - How can I check the status of the Betfair API? (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360014583377-How-can-I-check-the-status-of-the-Betfair-API
- Betfair Developer Status page (captured 2026-04-01): https://status.developer.betfair.com/
- Betfair Developer Support - How can I be notified regarding API releases & planned outage periods? (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/115003899492-How-can-I-be-notified-regarding-API-releases-planned-outage-periods

## Incremental architecture decisions from this run (2026-04-01, pass 70)

- Decision: add an `event_delay_regime_tracker` that ingests Betfair announcement-driven delay rollouts at competition/event granularity.
- Why: Betfair announcement updates indicate phased policy deployment (selected events and subset event-ID rollout patterns), so a static sport-level delay assumption is unsafe.
- Decision: add an `nsw_product_type_cost_engine` with explicit derivative-bet fee handling and effective-date versioning.
- Why: Racing NSW annual reporting introduces derivative-bet fee segmentation (including Premier-meeting differential) from 1 January 2025.
- Decision: add an `entitlement_path_registry` to distinguish direct state approvals from distributor-mediated rights paths.
- Why: Racing NSW reporting indicates some non-wagering operators may rely on Racing Australia authorised-distributor agreements rather than separate NSW applications.

## Provider comparison (incremental high-signal additions, pass 70)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Forum announcement thread on passive-bet delay rollout | Event-level rollout metadata and phased deployment behavior for delay policy regimes | Forum/announcement source can change quickly and may not be mirrored in static docs immediately | A/B | Add event-scoped delay-regime ingestion and label transitions in replay/live attribution |
| Racing NSW Annual Report 2024-25 | Official jurisdictional fee/regime updates: derivative-bet fee treatment, approved-operator count, and entitlement-path note for certain non-wagering operators | Annual-report cadence means mid-year policy changes still require supplemental notices/contracts | A | Add NSW product-type fee versioning and entitlement-path branching in provider onboarding/cost engine |

## Data contract additions required (incremental, pass 70)

- `event_delay_regime_snapshot`:
- `provider`, `capture_ts`, `competition_id`, `event_id`, `delay_policy_label`, `rollout_scope(selected|odd_event_subset|full)`, `effective_from`, `effective_to`, `source_url`.
- `nsw_product_type_fee_snapshot`:
- `capture_ts`, `product_type(derivative|other)`, `fee_pct`, `premier_meeting_fee_pct`, `effective_from`, `effective_to`, `source_url`.
- `nsw_operator_market_structure_snapshot`:
- `capture_ts`, `approved_wagering_operator_count`, `reporting_period_start`, `reporting_period_end`, `source_url`.
- `provider_entitlement_path_snapshot`:
- `provider`, `capture_ts`, `jurisdiction`, `operator_type`, `ra_authorised_distributor_path_flag`, `separate_state_application_required_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 70)

- Should forum-announcement-driven delay-regime changes be hard blockers for auto-trading until parsed/validated, or soft warnings with confidence downweighting?
- What is the canonical override order when annual-report fee schedules conflict with later circulars or contract amendments?
- Do we split EV accounting by NSW product type (`derivative` vs other) in-model, or only in post-trade cost attribution?
- Which evidence bundle is sufficient to mark an entitlement path as `RA-distributor mediated` versus `direct state approval` in production controls?

## Ranked implementation backlog (delta, pass 70)

### P0 additions

1. Implement `event_delay_regime_tracker` and annotate every market with event-scoped delay policy regime at decision time.
2. Implement `nsw_product_type_cost_engine` with effective-date versioning for derivative and Premier-meeting fee schedules.
3. Add `provider_entitlement_path_snapshot` and block production onboarding when path evidence is missing or contradictory.
4. Backfill historical AU ledgers with `product_type` and `entitlement_path` tags so replay EV can be recomputed under current fee logic.

### P1 additions

1. Build reconciliation checks that compare forum-announced rollout scope against observed live delay behavior to detect drift.
2. Add quarterly jurisdictional fee/regime diff jobs (starting with NSW) using annual reports plus subsequent regulator updates.
3. Run sensitivity studies on stake sizing under derivative-fee vs non-derivative-fee assumptions in NSW.

## Sources for this update (pass 70)

- Betfair Developer Forum announcement thread (`No Delays on Passive Bets - Selected Events - PLEASE SUBSCRIBE FOR UPDATES`; indexed updates captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements/40962-no-delays-on-passive-bets-selected-events-please-subscribe-for-updates?p=41471
- Racing NSW Annual Report 2024-25 (tabled 2025-11-20; captured 2026-04-01): https://www.parliament.nsw.gov.au/tp/files/192181/2024-25%20Racing%20NSW%20Annual%20Report.pdf

## Incremental architecture decisions from this run (2026-04-01, pass 71)

- Decision: add a `provider_coverage_conflict_resolver` service that compares corporate claim surfaces against endpoint-observed jurisdiction availability.
- Why: Racing Australia publishes an "except WA" service claim while RA FreeFields exposes WA artifacts; policy routing must handle evidence conflicts explicitly.
- Decision: add an `odds_display_cadence_model` for tote-style comparative analysis.
- Why: Keeneland publishes a concrete final-window odds refresh cycle (`5s` in last 2 minutes) and lock timing semantics, which are distinct from pool-close events.
- Decision: introduce a `venue_wager_mix_prior_registry` for CAW-sensitivity benchmarking.
- Why: venue-published composition data (Keeneland: CAW `23%`) provides an explicit baseline that should condition policy-effect comparisons.

## Provider comparison (incremental high-signal additions, pass 71)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia Role-and-Services + RA WA FreeFields surface | Explicit claim-vs-endpoint coverage conflict (`except WA` claim vs visible WA endpoint artifacts) | Corporate summary pages and endpoint surfaces can drift independently | A | Implement coverage-conflict resolver and require adjudication artifacts before jurisdiction routing decisions |
| Keeneland wagering experience page | Published CAW share composition (`23%`) plus explicit odds refresh cadence and lock semantics | Venue-specific US disclosure; not directly transferable to AU without normalization | A/B | Use as external CAW microstructure benchmark and display-cadence control in policy-effect analysis |

## Data contract additions required (incremental, pass 71)

- `provider_coverage_claim_snapshot`:
- `provider`, `capture_ts`, `claim_scope_text`, `wa_excluded_flag`, `source_url`.
- `endpoint_jurisdiction_observation`:
- `provider`, `capture_ts`, `endpoint_url`, `jurisdiction`, `artifact_type`, `visible_flag`, `source_url`.
- `coverage_conflict_resolution_event`:
- `event_ts`, `provider`, `jurisdiction`, `conflict_type(claim_vs_endpoint)`, `resolution_status(open|resolved|suppressed)`, `resolution_artifact_ref`, `source_url`.
- `venue_wager_mix_snapshot`:
- `venue`, `capture_ts`, `caw_share_pct`, `adw_share_pct`, `brick_mortar_share_pct`, `on_track_share_pct`, `source_url`.
- `venue_odds_refresh_contract_snapshot`:
- `venue`, `capture_ts`, `refresh_interval_sec_final_window`, `final_window_sec`, `betting_lock_event`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 71)

- For AU routing, which evidence source has precedence when provider coverage claims conflict with endpoint observations?
- Should unresolved coverage conflicts hard-block feature promotion for that jurisdiction, or allow research-mode ingestion with confidence penalties?
- What transferability discount should be applied when using non-AU venue CAW-share baselines (for example Keeneland) in AU policy simulations?
- Do we model odds-display cadence as a market-observer artifact only, or include it directly in late-window execution risk scoring?

## Ranked implementation backlog (delta, pass 71)

### P0 additions

1. Implement `provider_coverage_conflict_resolver` and fail closed on unresolved `claim_vs_endpoint` conflicts for production routing.
2. Add automated snapshots for provider claim surfaces and endpoint-jurisdiction observations with diff alerts.
3. Add adjudication workflow (`coverage_conflict_resolution_event`) with mandatory artifact references before lifting route blocks.
4. Add timeline separation of `pool_lock_ts` vs `display_refresh_ts` in replay schema to avoid misattributing post-lock odds movement.

### P1 additions

1. Build `venue_wager_mix_prior_registry` and wire CAW-share priors into cross-venue policy-effect comparisons.
2. Add `display_cadence_lag` controls to tote-comparison dashboards and post-race diagnostics.
3. Run sensitivity analysis: how much apparent CAW-impact signal disappears after controlling for odds refresh cadence and publication timing.

## Sources for this update (pass 71)

- Racing Australia Role and Services (`Compilation of Race Fields ... except WA`; captured 2026-04-01): https://www.racingaustralia.horse/Aboutus/Role-and-Services.aspx
- Racing Australia FreeFields WA scratchings page (captured 2026-04-01): https://www.racingaustralia.horse/FreeFields/Calendar_Scratchings.aspx?State=WA
- Keeneland wagering experience page (captured 2026-04-01): https://www.keeneland.com/wagering-experience

## Incremental architecture decisions from this run (2026-04-01, pass 72)

- Decision: add a `price_surface_mode_router` that stores and routes `raw`, `virtualised`, and `stake_rolled` Betfair views as separate first-class series.
- Why: Betfair support docs explicitly distinguish website virtual prices, API default non-virtual prices, and rollup semantics, with delayed-key windows up to 180 seconds.
- Decision: add a `wholesaler_entitlement_matrix` service for Australian thoroughbred racing-materials providers.
- Why: Racing Australia formalized a five-wholesaler framework effective 1 July 2025 and shifted to a compliance role; provider routing must be entitlement-path aware.
- Decision: add a `provider_freshness_and_rights_gate` with dual checks (`freshness claim drift` and `credential-use legality`).
- Why: Mediality publishes concrete delivery timing claims, while Racing Australia SNS policy text imposes strict authorised-use and anti-sharing constraints.
- Decision: add a `tote_close_vs_publish_lag_classifier` in CAW-policy analytics.
- Why: NYRA documents both hard CAW cutoffs and post-start final-odds publication lag behavior, which must be modeled separately to avoid causal misattribution.
- Decision: add a `market_visibility_geo_gate` for Betfair ingestion.
- Why: Betfair states legal geo restrictions can return empty `listMarketCatalogue/listMarketBook` responses and applies explicit jurisdictional filters (for example Singapore racing to AUS/NZ customers).

## Provider comparison (incremental high-signal additions, pass 72)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: website-vs-API price differences | Explicit representation controls (`virtualise`, `EX_BEST_OFFERS_DISP`, stake rollup, delayed-key windows) | Support-doc layer may evolve; must snapshot and contract-test regularly | A | Implement `price_surface_mode_router`; block mixed-mode training without explicit stratification |
| Betfair support: missing markets in API responses | Legal/geo eligibility constraints and empty-response behavior for restricted locations | Account/IP-context dependent behavior can be hard to simulate offline | A | Add `market_visibility_geo_gate` and explicit missing-market reason codes |
| Racing Australia media release (Wholesaler Agreement, 2025-06-19) | Named five-wholesaler framework, commencement date, RA compliance-role shift | Framework-level signal; provider-level SLA/packaging still varies | A | Add `wholesaler_entitlement_matrix` and effective-date routing logic |
| Mediality public FAQ + homepage | Historical depth and delivery timing claims; authorised-agent claim | Commercial scope/terms still require contract evidence | A/B | Add freshness SLA monitoring and rights-confidence separation |
| Racing Australia SNS login policy page | Primary constraint text on authorised users and third-party/commercial sharing prohibition | Page is policy signal, not full contract text | A | Add credential-use compliance gate and immutable policy snapshoting |
| NYRA CAW release + betting FAQ | Concrete CAW guardrail parameters and tote close-vs-publish-lag semantics | US venue policy; AU transferability needs discounting | A | Use as high-signal CAW microstructure benchmark with transferability controls |

## Data contract additions required (incremental, pass 72)

- `price_surface_contract_snapshot`:
- `capture_ts`, `provider`, `virtual_prices_default_returned_flag`, `virtualise_param_supported_flag`, `stream_disp_mode_supported_flag`, `delayed_key_window_sec_min`, `delayed_key_window_sec_max`, `source_url`.
- `price_surface_snapshot`:
- `event_ts`, `market_id`, `selection_id`, `surface_mode(raw|virtualised|stake_rolled)`, `virtualise_flag`, `rollup_model`, `rollup_limit`, `app_key_mode`, `source_url`.
- `market_visibility_restriction_snapshot`:
- `capture_ts`, `provider`, `jurisdiction`, `market_scope`, `restriction_reason(legal|geo|account_entitlement)`, `empty_response_expected_flag`, `source_url`.
- `wholesaler_entitlement_matrix_snapshot`:
- `capture_ts`, `framework_effective_from`, `ra_compliance_role_flag`, `wholesaler_name`, `authorised_flag`, `framework_version`, `source_url`.
- `provider_freshness_claim_snapshot`:
- `capture_ts`, `provider`, `artifact_type(acceptance|results)`, `claimed_latency_min`, `source_url`.
- `credential_use_constraint_snapshot`:
- `capture_ts`, `system_name`, `authorised_personnel_only_flag`, `third_party_commercial_sharing_prohibited_flag`, `source_url`.
- `venue_caw_guardrail_snapshot`:
- `capture_ts`, `venue`, `effective_from`, `cutoff_sec_to_post`, `speed_threshold_bets_per_sec`, `pool_scope`, `source_url`.
- `tote_close_publish_lag_contract_snapshot`:
- `capture_ts`, `venue`, `wagering_close_event`, `post_start_betting_capability_flag`, `final_odds_publish_lag_reason`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 72)

- Which price surface should be canonical for model serving (`raw` or `virtualised`) and how do we enforce parity in replay/live pipelines?
- Should any delayed-key capture (`1-180s`) be hard-excluded from late-window execution model training?
- For the RA five-wholesaler framework, what minimum contract artifact set is required before marking a provider path `production-eligible`?
- How do we quantify transferability from NYRA CAW guardrails to AU venues: fixed prior discount or venue-level Bayesian pooling?
- For geo/rights restrictions causing empty Betfair responses, do we fail fast at scheduler time or allow limited fallback ingestion with explicit "coverage degraded" tagging?

## Ranked implementation backlog (delta, pass 72)

### P0 additions

1. Implement `price_surface_mode_router` and persist representation metadata (`raw|virtualised|stake_rolled`) on every market snapshot.
2. Add `market_visibility_geo_gate` and fail closed when API empties are attributable to legal/geo restrictions.
3. Build `wholesaler_entitlement_matrix` with effective-date routing from 1 July 2025 onward.
4. Add `provider_freshness_and_rights_gate` requiring both SLA telemetry and credential-use policy artifacts before production promotion.
5. Add `tote_close_vs_publish_lag_classifier` and split post-break odds movement diagnostics into `settlement_lag` vs `policy_window` buckets.

### P1 additions

1. Run parity backtests comparing `raw` vs `virtualised` Betfair surfaces for calibration/CLV drift.
2. Build automatic policy-diff jobs for RA wholesaler framework and Betfair support-doc contract surfaces.
3. Run CAW-policy sensitivity tests using NYRA guardrail parameters as priors with explicit AU transferability penalties.
4. Add provider scorecards: claimed freshness vs observed freshness, and entitlement confidence vs rights-artifact completeness.

## Sources for this update (pass 72)

- Racing Australia media release PDF, `Racing Materials distribution - Wholesaler Agreement` (dated 2025-06-19; captured 2026-04-01): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf
- Betfair Developer Support, `Why are the prices displayed on the website different from what I see in my API application?` (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Betfair Developer Support, `Why do markets not appear in the listEvents, listMarketCatalogue or listMarketBook API response?` (updated 2025-11-28; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listEvents-listMarketCatalogue-or-listMarketBook-API-response
- NYRA release, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; captured 2026-04-01): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- NYRA betting FAQ (Aqueduct; captured 2026-04-01): https://cms.nyra.com/aqueduct/racing/betting-faq
- Mediality Racing FAQ (`data-faq`; captured 2026-04-01): https://medialityracing.com.au/data-faq/
- Mediality Racing homepage (`Authorised agent` claim; captured 2026-04-01): https://medialityracing.com.au/
- Racing Australia SNS login (`authorised personnel` and third-party use restriction; captured 2026-04-01): https://www.racingaustralia.horse/IndustryLogin/SNS_Login.aspx

## Incremental architecture decisions from this run (2026-04-01, pass 73)

- Decision: add a `historical_ladder_state_reconstructor` with absolute-overwrite semantics for `atb/atl` and explicit zero-volume clears.
- Why: Betfair PRO historical files define `atb/atl` volumes as absolute and use zero values to clear a level; additive replay logic is incorrect.
- Decision: add an `implicit_cancel_inference_engine` in replay labeling and fill simulation.
- Why: Betfair advanced historical guidance documents conflicting top-of-book updates where prior unmatched orders may be cancelled/matched without explicit cancel messages.
- Decision: add an `fx_adjusted_traded_volume_handler` for cumulative `trd` points.
- Why: Betfair states cross-currency effects can trigger nominal traded-volume updates and even decreases in previously reported `trd` amounts.
- Decision: add a `bsp_volume_decomposition_validator` for historical BSP CSV feeds.
- Why: Betfair documents that `MORNINGTRADEDVOL` includes BSP volume not present in `PPTRADEDVOL` and `IPTRADEDVOL`, requiring explicit decomposition checks.
- Decision: add a `historical_format_parity_gate` across purchased historical files and stream replay codecs.
- Why: Betfair states historical-data format is aligned with Exchange Stream API; parser parity should be enforced as a hard contract.

## Provider comparison (incremental high-signal additions, pass 73)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: PRO historical volume representation | Explicit absolute-ladder semantics, per-price cumulative traded-volume rules, FX-driven revision caveat | Support-layer guidance; needs runtime telemetry validation against purchased files | A | Implement absolute-state reconstructor + traded-volume revision handling before replay-based model promotion |
| Betfair support: advanced historical update interpretation | Tuple schema (`[level,price,volume]`) plus implicit-cancel/conflict guidance without explicit cancel events | Example-driven guidance; requires robust inference auditing | A | Build implicit-cancel inference and confidence-scored reconstruction diagnostics |
| Betfair support: MORNING/PP/IP traded-volume identity | Concrete BSP-volume reconciliation identity for historical CSV columns | Column availability can vary by package/export surface | A | Enforce decomposition validator and quarantine rows failing identity checks |
| Betfair support: historical download/view guidance | Confirms historical package format parity with Exchange Stream API and API-based automated download path | Operational article; not a substitute for schema tests | A/B | Add parser-parity gate and automated sample-file contract tests in CI |

## Data contract additions required (incremental, pass 73)

- `historical_ladder_level_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `side(atb|atl)`, `price`, `available_volume_abs`, `zero_volume_clear_flag`, `source_url`.
- `historical_traded_point_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `price`, `traded_volume_cumulative_at_price`, `traded_volume_delta`, `backers_stake_equiv`, `fx_adjustment_flag`, `revision_direction`, `source_url`.
- `historical_stream_conflict_event`:
- `event_ts`, `market_id`, `selection_id`, `prior_top_price`, `new_top_price`, `implicit_cancel_inferred_flag`, `reconstruction_confidence`, `source_url`.
- `bsp_volume_decomposition_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `morning_traded_vol`, `pp_traded_vol`, `ip_traded_vol`, `bsp_component_vol`, `identity_holds_flag`, `source_url`.
- `historical_format_parity_snapshot`:
- `capture_ts`, `package_type`, `stream_schema_version`, `historical_schema_version`, `parity_pass_flag`, `mismatch_reason`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 73)

- What confidence threshold should be required for `implicit_cancel_inferred_flag=true` before a replay sample is eligible for fill-model training?
- Should negative `traded_volume_delta` events be retained as-is for modeling, or normalized into an `fx_adjusted` side channel that is excluded from turnover features?
- Which historical packages/sports surfaces include stable `MORNINGTRADEDVOL/PPTRADEDVOL/IPTRADEDVOL` coverage, and do we need package-specific BSP feature fallbacks?
- Do we enforce hard failure on historical/stream schema-parity mismatch in CI, or allow temporary soft-fail with blocker ticketing?

## Ranked implementation backlog (delta, pass 73)

### P0 additions

1. Implement `historical_ladder_state_reconstructor` with absolute overwrite + zero-clear handling for `atb/atl` updates.
2. Implement `implicit_cancel_inference_engine` with per-event confidence scoring and audit traces.
3. Add `fx_adjusted_traded_volume_handler` and prevent monotonicity assumptions in traded-flow feature jobs.
4. Build `bsp_volume_decomposition_validator` and quarantine ingestion rows failing `MORNING = PP + IP + BSP_component`.
5. Add `historical_format_parity_gate` that contract-tests purchased historical files against stream schema expectations.

### P1 additions

1. Run replay ablations comparing explicit-cancel-only vs implicit-cancel-aware queue reconstruction on fill/slippage metrics.
2. Quantify model sensitivity to retaining vs excluding negative `traded_volume_delta` windows.
3. Add provider scorecard metrics: implicit-cancel frequency, FX-revision rate, BSP decomposition failure rate.

## Sources for this update (pass 73)

- Betfair support: `How is traded & available volume represented within the PRO Historical Data files?` (updated 2025-02-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360002401937-How-is-traded-available-volume-represented-within-the-PRO-Historical-Data-files
- Betfair support: `Advanced Historical Data - How do I interpret updates?` (updated 2025-02-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360018468438-Advanced-Historical-Data-How-do-I-interpret-updates
- Betfair support: `Why at times does the MORNINGTRADEDVOL column exceed the sum of the PPTRADEDVOL and IPTRADEDVOL?` (updated 2025-02-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360008669197-Why-at-times-does-the-MORNINGTRADEDVOL-column-exceed-the-sum-of-the-PPTRADEDVOL-and-IPTRADEDVOL
- Betfair support: `How do I download and view Betfair Historical Data?` (updated 2025-07-15; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360000402211-How-do-I-download-and-view-Betfair-Historical-Data

## Incremental architecture decisions from this run (2026-04-01, pass 74)

- Decision: add a `counterparty_approval_gate` that validates approved-WSP status on every execution path touching Victorian race fields.
- Why: RV Standard Conditions explicitly prohibit placing/accepting/facilitating Victorian race betting transactions with Non-Approved WSP pathways.
- Decision: add a `flow_origin_split_ledger` (`customer_flow` vs `wsp_layoff_flow`) before reportable-turnover materialization.
- Why: RV definitions of `Bets Taken` include lay-off transactions, so unsegmented turnover labels can mislead liquidity/edge modeling.
- Decision: add a `regulatory_request_authenticator` and immutable disclosure audit trail for transaction-data exports.
- Why: RV conditions state only RV Authorised Officers may request/receive betting transaction information.

## Provider comparison (incremental high-signal additions, pass 74)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Victoria Standard Conditions (effective 1 March 2025) | Explicit Non-Approved-WSP prohibitions, turnover-definition semantics (including lay-off), and authorised-officer disclosure controls | Jurisdiction-specific and versioned; requires effective-date management | A | Implement counterparty hard gate, flow-origin split ledger, and regulator-request authenticator |
| Racing Victoria Approved WSP registry page | Current approved-operator surface for counterparty eligibility checks | Registry can change; snapshot cadence and historical reconstruction needed | A/B | Snapshot registry and join by effective window in routing/compliance checks |

## Data contract additions required (incremental, pass 74)

- `counterparty_approval_snapshot`:
- `capture_ts`, `jurisdiction`, `operator_name`, `approval_status`, `approval_class(australian|international|other)`, `source_url`.
- `counterparty_approval_gate_event`:
- `event_ts`, `market_id`, `counterparty_operator`, `jurisdiction`, `approved_flag`, `decision(allow|block|review)`, `reason_code`, `source_url`.
- `bet_flow_fact` additions:
- `flow_origin(customer|wsp_layoff|unknown)`, `reportable_turnover_inclusion_flag`, `flow_origin_confidence`.
- `turnover_definition_snapshot`:
- `capture_ts`, `jurisdiction`, `metric_name`, `includes_layoff_flow_flag`, `definition_text_hash`, `source_url`.
- `regulatory_data_request_log`:
- `request_ts`, `requester_identity`, `authority_type(rv_authorised_officer|other)`, `authority_validation_result`, `request_scope`, `artifact_hash`, `response_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 74)

- What evidence set is sufficient to validate counterparty approval-state at order time when registry and contractual data disagree?
- Should `flow_origin=unknown` transactions be excluded from model training or included with confidence penalties?
- What minimum snapshot cadence is required for approved-WSP registry drift detection (daily, intra-day, or event-triggered)?
- Which team owns responder identity validation for regulator-request workflows during out-of-hours incidents?

## Ranked implementation backlog (delta, pass 74)

### P0 additions

1. Implement `counterparty_approval_gate` and fail closed when Victorian counterparty approval cannot be established at decision time.
2. Build `flow_origin_split_ledger` and prevent direct use of unsegmented reportable turnover in model features.
3. Implement `regulatory_request_authenticator` with immutable request/response audit trail.
4. Backfill historical ledgers with `flow_origin` labels (or `unknown`) and rerun turnover-dependent feature quality checks.

### P1 additions

1. Add registry drift monitoring for RV approved operators with alerting on add/remove/status changes.
2. Build attribution dashboards comparing performance metrics with and without lay-off-flow-adjusted turnover measures.
3. Add compliance-game-day runbook checks for authorised-officer request validation outcomes.

## Sources for this update (pass 74)

- Racing Victoria Race Fields Policy page (captured 2026-04-01): https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria Standard Conditions of Approval - Effective 1 March 2025 (captured 2026-04-01): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f
- Racing Victoria Approved Wagering Service Providers page (captured 2026-04-01): https://www.racingvictoria.com.au/wagering/wagering-service-providers

## Incremental architecture decisions from this run (2026-04-01, pass 75)

- Decision: add a `tote_timeline_decomposer` that treats `stop_betting_command`, `gate_open`, and `final_odds_publish` as independent timeline events.
- Why: CHRB-published CAW Q&A states post-gate odds changes can result from tote settlement/publication lag (about 3-5 seconds), not only access-window policy.
- Decision: add a `caw_participant_control_registry` for venue-level CAW controls (`bets_per_sec` threshold, cancellation permissions, participant tracking requirements).
- Why: CHRB-published Q&A provides explicit controls (CAW threshold >5 bets/sec, cancellation prohibition, TRA-code tracking) that materially affect late-flow interpretation and transferability.
- Decision: add an `exchange_contract_change_watcher` fed by announcement-index diffs.
- Why: Betfair announcement-index entries signal schema/economics changes (`suspendReason` release and transaction-charge schedule change) that can invalidate parser and cost assumptions before deeper documents are ingested.

## Provider comparison (incremental high-signal additions, pass 75)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB published `Computer Assisted Wagering Question & Answer` PDF | Concrete CAW operational controls, throughput figure, venue flow-share examples, and post-gate odds-lag explanation | Q&A is published by regulator but authored from an operator-side response context; use with venue-transfer caution | A/B | Add timeline decomposer + venue CAW-control registry and treat source as high-signal policy/microstructure context |
| Betfair Developer Program Announcements index | Forward signal for schema and economics contract changes (`suspendReason`, transaction-charge change event) with dated release markers | Index-level signal lacks full field semantics by itself; requires follow-up parsing/validation | A/B | Add announcement diff watcher and block releases until parser/cost contracts are triaged for each new event |

## Data contract additions required (incremental, pass 75)

- `tote_timeline_event`:
- `venue`, `market_id`, `stop_betting_command_ts`, `gate_open_ts`, `final_odds_publish_ts`, `publish_lag_sec`, `source_url`.
- `venue_caw_control_snapshot`:
- `venue`, `capture_ts`, `caw_definition_bets_per_sec`, `caw_cancel_prohibited_flag`, `participant_tracking_mode(tra_code|other)`, `approval_required_flag`, `source_url`.
- `venue_caw_flow_share_snapshot`:
- `venue`, `capture_ts`, `pool_scope`, `caw_total_handle_share_pct`, `caw_last60s_inflow_share_pct`, `sample_method_text`, `source_url`.
- `betfair_contract_change_event`:
- `capture_ts`, `announcement_title`, `announcement_started_date`, `event_type(schema|economics|other)`, `expected_effective_date`, `review_status`, `source_url`.
- `cost_model_version` additions:
- `effective_from`, `effective_to`, `charge_schedule_version`, `triggering_announcement_ref`, `validation_status`.

## Open questions to resolve before implementation freeze (incremental, pass 75)

- For CHRB-sourced CAW metrics, what transferability weight should be applied when calibrating AU late-flow priors?
- Which event should anchor pre-off replay windows in tote studies: `stop_betting_command_ts` or `gate_open_ts`?
- What SLA should govern contract-change triage after a new Betfair announcement appears (for example, same day vs next release cycle)?
- Should announcement-index events auto-open parser/cost model blocker tickets even when full technical detail is pending?

## Ranked implementation backlog (delta, pass 75)

### P0 additions

1. Implement `tote_timeline_decomposer` and enforce three-event timeline capture (`stop`, `gate`, `final publish`) in tote-analytics datasets.
2. Build `caw_participant_control_registry` and attach venue/date-scoped controls to all CAW policy-effect analyses.
3. Implement `exchange_contract_change_watcher` that diffs Betfair announcement index and auto-flags schema/economics-impact events.
4. Add parser and cost-model release gates requiring explicit triage of each new `betfair_contract_change_event`.

### P1 additions

1. Add transferability scoring for non-AU CAW evidence (for example CHRB/NYRA/Del Mar) in AU model-prior construction.
2. Build dashboards splitting late-odds movement into `access-window` vs `publish-lag` attribution buckets.
3. Add post-announcement regression checks for fill-rate, rejection-state mix, and cost-attribution drift.

## Sources for this update (pass 75)

- CHRB published PDF, `Computer Assisted Wagering Question & Answer` (dated 2024-09-05; captured 2026-04-01): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair Developer Program Announcements index (showing 2025-08-11 `suspendReason` release and 2025-08-22 transaction-charge change announcement; captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements

## Incremental architecture decisions from this run (2026-04-01, pass 76)

- Decision: add a `betfair_dual_cost_router` that optimizes decisions against both transaction-charge and AU turnover-charge regimes.
- Why: Betfair's post-2025 transaction-charge schedule is type-sensitive (`put-up` exempt, duplicate-error premium), while NSW turnover-charge rules impose weekly commission-ratio constraints on specific AU markets.
- Decision: add a `suspend_reason_state_machine` with reason taxonomy, sport scoping, and fallback behavior for missing fields.
- Why: `suspendReason` now provides state-rich suspension context (`Goal`, `Penalty`, `Red Card`, etc.) rather than a single undifferentiated `SUSPENDED` state.
- Decision: add a `contract_effective_date_gate` for exchange economics/schema.
- Why: August/September 2025 changes show that announcement date and effective date can differ and should independently gate backtests, simulators, and release validation.

## Provider comparison (incremental high-signal additions, pass 76)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair announcement: transaction-charge changes (2025-08-22) + Betfair Charges terms | Concrete post-2025 charge table (`put-up` exemption, duplicate error penalty, standard rate) and retained commission-offset algebra | Announcement is release-layer (`A/B`) and terms can drift by region/account class; requires effective-date versioning | A + A/B | Implement dual-cost router and versioned transaction/turnover cost contracts |
| Betfair announcement: `suspendReason` release (2025-08-11) | New optional suspension-reason field, API/stream surface mapping, initial football reason set | Sport-scoped initial rollout and optionality mean sparse/heterogeneous coverage across markets | A/B | Add reason-aware suspension state machine with strict unknown-value tests |
| Betfair Charges terms (`Turnover Charge`) | Explicit AU Racing NSW turnover-charge thresholds/rates and commission-floor math | Jurisdiction- and market-scope specific; weekly windows can be misapplied without market tagging | A | Add NSW turnover-cost estimator and weekly trigger-risk monitors |

## Data contract additions required (incremental, pass 76)

- `betfair_txn_pricing_regime`:
- `effective_from`, `effective_to`, `standard_txn_cost_gbp`, `duplicate_txn_cost_gbp`, `market_making_putup_exempt_flag`, `putup_back_stake_min_gbp`, `putup_lay_liability_min_gbp`, `source_url`.
- `betfair_turnover_charge_regime`:
- `capture_ts`, `market_scope`, `threshold_back_turnover_aud`, `commission_floor_pct`, `turnover_charge_pct`, `settlement_window(weekly_gmt)`, `source_url`.
- `execution_cost_surface_snapshot`:
- `market_id`, `event_ts`, `txn_charge_estimate_gbp`, `turnover_charge_estimate_aud`, `dual_cost_pressure_score`, `cost_regime_version`.
- `market_suspend_event` additions:
- `suspend_reason_raw`, `suspend_reason_class`, `reason_present_flag`, `surface(api_ng|stream)`, `sport_scope`, `taxonomy_version`, `source_url`.
- `contract_effective_date_event`:
- `announcement_date`, `effective_date`, `change_domain(schema|economics)`, `release_gate_status`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 76)

- Should `put-up` exemption eligibility be modeled from order intent at submit time or only from confirmed placement outcomes?
- How should `suspendReason` class priors transfer from football-initial rollout to other sports where value frequencies may differ?
- What tolerance band should trigger a release blocker when observed duplicate-error cost diverges from expected `GBP 0.005` charging?
- For AU portfolios, should turnover-charge risk limits be enforced at strategy, account-group, or global wallet level?

## Ranked implementation backlog (delta, pass 76)

### P0 additions

1. Implement `betfair_dual_cost_router` combining hourly transaction-charge and weekly NSW turnover-charge simulation in pre-trade checks.
2. Build `suspend_reason_state_machine` with taxonomy mapping, unknown-value quarantine, and reason-conditioned restart handling.
3. Add `contract_effective_date_gate` so schema/economic changes are applied by effective date (not ingest date) in replay and live systems.
4. Backfill post-`2025-09-01` replay windows with new charge table and rerun strategy EV baselines.

### P1 additions

1. Add dashboards for `dual_cost_pressure_score` versus realized net edge by strategy.
2. Run ablations comparing binary suspend handling vs reason-aware handling on fill quality and adverse-selection metrics.
3. Add CI canary tests that parse forum/terms diffs and open blocker tickets for unmatched schema/economics deltas.

## Sources for this update (pass 76)

- Betfair Developer Forum announcement thread, `Transaction Charge Changes Effective from 1st September 2025` (published 2025-08-22; captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements/42143-transaction-charge-changes-effective-from-1st-september-2025
- Betfair Charges terms (captured 2026-04-01): https://www.betfair.com/aboutUs/Betfair.Charges/
- Betfair Developer Forum announcement thread, `New Betfair API Release - Enhanced Suspended Message field - suspendReason` (published 2025-08-11; captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements/42119-new-betfair-api-release-enhanced-suspended-message-field-suspendreason

## Incremental architecture decisions from this run (2026-04-01, pass 77)

- Decision: add a `provider_incident_visibility_index` that tracks planned vs unplanned recency by source.
- Why: Racing Australia's status site currently shows rich planned-window detail but sparse visible unplanned chronology, so outage attribution confidence must be source-aware.
- Decision: add a `maintenance_window_router` in execution supervision.
- Why: published maintenance windows (with module/time scope) should drive proactive throttle/hold behavior instead of being treated as generic outage noise.
- Decision: add an `announcement_notice_classifier` for Betfair forum ingestion.
- Why: the announcements surface carries both contract changes and maintenance outages; parser/cost blockers should trigger only on schema/economics notices.

## Provider comparison (incremental high-signal additions, pass 77)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia Systems Status site | Independent status channel, module-scoped planned outage windows, explicit service inventory | Visible unplanned chronology appears sparse/stale relative to planned-posting cadence; do not assume complete incident feed | A | Build incident-visibility index and use planned windows as first-class execution constraints |
| Betfair Developer Program forum index | Top-level announcement-state metadata, including maintenance/outage notices in same channel as API changes | Index-level metadata is classification signal, not full technical detail; requires follow-through parsing by notice type | A/B | Implement announcement classifier and split schema/economics gates from availability/outage routing |

## Data contract additions required (incremental, pass 77)

- `provider_incident_visibility_snapshot`:
- `capture_ts`, `provider`, `surface(status_page|monthly_report|forum)`, `planned_latest_visible_date`, `unplanned_latest_visible_date`, `visibility_lag_days`, `source_url`.
- `planned_outage_window`:
- `provider`, `module_scope_json`, `window_start_local`, `window_end_local`, `capture_ts`, `source_url`.
- `exchange_notice_event`:
- `capture_ts`, `notice_channel`, `notice_type(release|maintenance_outage|other)`, `notice_title`, `jurisdiction_scope`, `last_posted_ts_visible`, `source_url`.
- `notice_triage_decision`:
- `event_id`, `triage_ts`, `decision(open_blocker|availability_only|ignore)`, `decision_reason`, `owner`.

## Open questions to resolve before implementation freeze (incremental, pass 77)

- What `visibility_lag_days` threshold should downgrade outage-attribution confidence for a provider status surface?
- Should planned-maintenance windows automatically trigger strategy throttles, or only pre-trade warning states with manual escalation?
- What is the minimum metadata required to classify a Betfair announcement as `schema/economics` vs `maintenance_outage` when only index-level text is available?
- Which incident surfaces are mandatory for "no known outage" determination (for example status page + forum + monthly report)?

## Ranked implementation backlog (delta, pass 77)

### P0 additions

1. Implement `provider_incident_visibility_index` and compute `visibility_lag_days` for each provider/surface daily.
2. Build `maintenance_window_router` that applies pre-window throttles/holds using module-scoped outage schedules.
3. Implement `announcement_notice_classifier` and split Betfair notice handling into `schema/economics` vs `maintenance/outage` workflows.
4. Add release-gate policy so index-only maintenance notices do not block parser/cost deployments unless jurisdiction overlap exists.

### P1 additions

1. Add dashboards comparing execution degradation near planned windows vs non-window baseline periods.
2. Add confidence-weighted outage-attribution labels for replay/backtest incident studies.
3. Backtest strategy resilience under simulated stale-unplanned-surface conditions.

## Sources for this update (pass 77)

- Racing Australia Systems Status Updates page (captured 2026-04-01): https://racingaustraliasystemsstatus.horse/
- Betfair Developer Program forum index (Announcements last-post metadata, captured 2026-04-01): https://forum.developer.betfair.com/forum

## Incremental architecture decisions from this run (2026-04-01, pass 78)

- Decision: add a `stream_sequence_authority_guard` that enforces `clk` as canonical ordering and treats `pt` as latency metadata.
- Why: Betfair's March 2026 Stream API guidance makes `clk` the sequencing contract, so `pt`-driven replay can misorder state transitions.
- Decision: add an `activation_burst_controller` for unfiltered stream subscriptions.
- Why: unfiltered subscriptions now have explicit contract behavior to receive all newly activated markets with immediate `img=true` snapshots, which can create burst-load and subscription-capacity spikes.
- Decision: add a `closed_market_cache_budgeter` in stream session control.
- Why: closed markets are evicted on periodic jobs (5-minute cycle, 1-hour deletion lag), so subscription-limit accounting must include lingering closed-market cache state.
- Decision: add a `surface_lag_normalizer` for virtualised vs non-virtual ladders.
- Why: Betfair now documents an approximately 150ms lag on virtual best-offer updates, which can otherwise leak into false micro-alpha.
- Decision: add an `ra_dependency_blast_radius_registry` for provider maintenance events.
- Why: RA's Oracle migration notice lists simultaneous impact to SFTP, XML, SNS, web, and PRA-RA links, implying multi-service correlated outage risk.

## Provider comparison (incremental high-signal additions, pass 78)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Stream/API support corpus (Mar 2026 updates + core stream FAQ) | Explicit sequencing contract (`clk`), unfiltered-subscription activation behavior (`img=true` snapshots), and closed-market cache eviction semantics | Support-layer docs can evolve quickly; enforce periodic contract regression checks | A (sequencing/subscription) + A/B (operational cache behavior) | Implement stream ordering guard, activation-burst control, and cache-budget aware resubscribe logic |
| Betfair market-data mapping article (updated 2026-03-27) | Filter-to-surface map and documented ~150ms virtual-price lag vs non-virtual stream | Approximate lag and venue-state dependency; requires empirical drift monitoring | A | Add surface-mode and lag normalization gates in training and live execution |
| Racing Australia Oracle migration release (2025-06-27) | Concrete planned outage window and explicit list of affected RA systems/services/links | Point-in-time event, but reveals durable dependency graph and blast-radius shape | A | Build provider dependency registry and pre-window contingency routing for RA-linked ingestion |

## Data contract additions required (incremental, pass 78)

- `stream_sequence_audit`:
- `market_id`, `capture_ts`, `clk`, `pt`, `clk_monotonic_flag`, `pt_monotonic_flag`, `ordering_conflict_flag`, `source_url`.
- `stream_activation_burst_snapshot`:
- `capture_ts`, `subscription_mode(filtered|unfiltered)`, `new_market_count_1m`, `img_snapshot_count_1m`, `queue_depth_p95`, `source_url`.
- `stream_subscription_capacity_state`:
- `capture_ts`, `requested_market_count`, `active_market_count`, `closed_market_cached_count`, `eviction_cycle_min`, `deletion_lag_min`, `limit_exceeded_flag`, `source_url`.
- `price_surface_mode_snapshot` additions:
- `surface_name`, `virtualised_flag`, `estimated_virtual_lag_ms`, `ladder_levels`, `api_surface(rest|stream)`, `source_url`.
- `provider_dependency_event`:
- `provider`, `event_type(planned_maintenance|unplanned_outage)`, `window_start_local`, `window_end_local`, `affected_system`, `impact_class`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 78)

- What SLO threshold should trigger a hard incident when `clk` and `pt` imply inconsistent ordering for a market stream segment?
- Should unfiltered-subscription mode ever run in production, or remain a controlled discovery mode behind hard queue/CPU guards?
- What tolerance band should be used when validating the documented ~150ms virtual lag against observed runtime behavior by market state?
- Which RA dependency classes (SFTP/XML/SNS/link) require automatic strategy hold versus degraded read-only mode during planned windows?

## Ranked implementation backlog (delta, pass 78)

### P0 additions

1. Implement `stream_sequence_authority_guard` and block replay/live promotion when `clk` sequencing checks fail.
2. Add `closed_market_cache_budgeter` with pre-resubscribe headroom checks using 5-minute eviction and 1-hour deletion assumptions.
3. Implement `surface_lag_normalizer` and enforce explicit `surface_mode` compatibility in backtest/live datasets.
4. Build `ra_dependency_blast_radius_registry` and auto-apply planned-window holds for affected RA-linked ingestion paths.

### P1 additions

1. Build activation-burst telemetry dashboards for unfiltered-subscription load behavior (`img` bursts, queue depth, dropped-update risk).
2. Add canary tests that compare observed virtual-lag distributions against documented expectations and alert on drift.
3. Add provider-dependency simulation scenarios to resilience tests (single endpoint outage vs RA multi-service event).

## Sources for this update (pass 78)

- Betfair Developer Program, `Are Stream API messages guaranteed to be delivered in strict sequential order according to pt?` (updated 2026-03-03; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- Betfair Developer Program, `What happens if you subscribe to the Stream API without a market filter?` (updated 2026-03-03; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair Developer Program, `Are closed markets auto-removed from the Stream API subscription?` (updated 2024-04-23; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair Developer Program, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Racing Australia media release index (captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/MediaReleases.aspx
- Racing Australia PDF, `Racing Australia Data Centre Move to Oracle Cloud Infrastructure` (dated 2025-06-27; captured 2026-04-01): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Australia-Data-Centre-move-to-Oracle-Cloud-Infrastructure.pdf

## Incremental architecture decisions from this run (2026-04-01, pass 79)

- Decision: add a `wa_operator_class_router` that separates offshore approval gating from monthly levy-return compliance.
- Why: WA DLGSC guidance explicitly ties offshore use/publish rights to Section `27D(2A)(b)` commission approval while also requiring monthly levy-return workflows.
- Decision: add an `entitlement_snapshot_freshness_gate` using source-declared `as_at` markers.
- Why: Racing Queensland now exposes an authorised-provider list marker `as at March 30, 2026`, which is stronger than capture-time-only freshness tracking.
- Decision: add an `exchange_instruction_cap_registry` keyed by exchange scope.
- Why: Betfair `placeOrders` caps differ by venue (`Global 200`, `Italian 50`), so static global caps are unsafe for portable execution infrastructure.

## Provider comparison (incremental high-signal additions, pass 79)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| WA DLGSC race-fields + Racing Bets Levy guidance | Explicit offshore approval branch (`Section 27D(2A)(b)`) plus ongoing monthly return/levy obligations | Statutory references can be revised; page-level operational guidance still needs snapshot/version discipline | A | Implement operator-class routing and distinct onboarding vs ongoing compliance gates |
| Racing Queensland race-information authority page | Current authority period and source-declared authorised-provider list freshness marker (`as at 2026-03-30`) | Linked list artifact can update without URL change; requires marker-aware freshness logic | A | Add `as_at`-driven entitlement freshness scoring and alerting |
| Betfair `placeOrders` API doc | Exchange-scope instruction caps (`200` global, `50` Italian) | Scope assumptions can drift if docs update; requires periodic contract checks | A | Store scope-specific caps and parameterize order-splitting/throttling by exchange |

## Data contract additions required (incremental, pass 79)

- `wa_race_fields_approval_rule`:
- `capture_ts`, `operator_class(offshore|other)`, `section_ref`, `commission_approval_required_flag`, `source_url`.
- `wa_race_fields_reporting_rule`:
- `capture_ts`, `monthly_return_required_flag`, `levy_payment_required_flag`, `reporting_window_text`, `source_url`.
- `qld_authorised_provider_list_snapshot` additions:
- `authority_period_start`, `authority_period_end`, `as_at_date`, `source_url`.
- `provider_entitlement_freshness_score` additions:
- `days_since_as_at`, `freshness_band(green|amber|red)`, `last_refresh_attempt_ts`.
- `exchange_instruction_cap_snapshot`:
- `capture_ts`, `exchange_scope(global|italian)`, `place_instruction_cap`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 79)

- For WA onboarding, what minimum evidence artifact is required to mark `offshore_approval_required` as satisfied in production (letter, registry entry, or both)?
- What `days_since_as_at` threshold should downgrade entitlement confidence from `green` to `amber` for provider-list snapshots?
- Should cap-overrun prevention split orders automatically when `cap_proximity_ratio > 1.0`, or hard-fail and require explicit strategy retry logic?
- Do we maintain exchange-scope cap policies in static config, or ingest them from scheduled doc-contract snapshots with manual approval gates?

## Ranked implementation backlog (delta, pass 79)

### P0 additions

1. Implement `wa_operator_class_router` with fail-closed offshore approval gate for WA race-fields onboarding.
2. Add `entitlement_snapshot_freshness_gate` using source `as_at` markers (starting with RQ authorised-provider list).
3. Build `exchange_instruction_cap_registry` and wire split/throttle logic to exchange scope (`global` vs `italian`).
4. Add compliance audit events proving onboarding gate success is independent of ongoing monthly return/levy status.

### P1 additions

1. Add dashboards for entitlement freshness drift (`capture_ts` vs `as_at_date`) across AU jurisdictions.
2. Backtest execution reliability impact of cap-aware order slicing versus hard-fail behavior under burst conditions.
3. Add contract-diff automation for WA/RQ/Betfair pages used as entitlement and cap-control authorities.

## Sources for this update (pass 79)

- WA DLGSC race-fields / Racing Bets Levy guidance (captured 2026-04-01): https://www.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/race-fields
- DLGSC racing applications page (`WA Race Fields` offshore approval reference; captured 2026-04-01): https://www.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/racing-applications
- Racing Queensland race-information authority page (`as at March 30, 2026` authorised-provider list marker; captured 2026-04-01): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Betfair Exchange API documentation, `placeOrders` (instruction cap by exchange scope; captured 2026-04-01): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders

## Incremental architecture decisions from this run (2026-04-01, pass 80)

- Decision: add a `bet_delay_contract_resolver` that joins `betDelayModels`, `betDelay`, and `isMarketDataDelayed` into a single market-state contract object.
- Why: Betfair now exposes delay-model and delay-seconds semantics across market discovery and market-state surfaces; announcement-only tracking is no longer sufficient.
- Decision: add a `provider_service_standard_ingestor` for Racing Australia monthly/annual service reports.
- Why: RA reliability signals include timeliness and service-specific downtime metrics that are not fully observable from status-page chronology.
- Decision: add a `compilation_timeliness_quality_gate` for RA-linked fields (nominations/acceptances/scratchings/riders).
- Why: published timeliness metrics can miss target even when unplanned downtime is reported as zero.

## Provider comparison (incremental high-signal additions, pass 80)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair API `Betting Type Definitions` + in-play delay FAQ | Explicit `betDelayModels`, `betDelay`, `isMarketDataDelayed`, and documented in-play delay range/source fields | Support/docs contract can evolve; must snapshot by date and diff changes | A | Implement delay-contract resolver and pre-trade delay-state gate |
| Racing Australia Monthly Service Standard report (Nov 2025) | Service timeliness and uptime metrics with target-vs-actual values (e.g., nominations release misses) | Monthly snapshots; extraction quality must be validated per PDF format drift | A | Ingest monthly reliability metrics and expose timeliness-gap features |
| Racing Australia Annual Consolidated Service report (FY ending Jun 2025) | Service-level unplanned downtime totals and uptime by subsystem | Annual cadence is slow; should complement, not replace, monthly/status feeds | A | Build annual reliability baseline and service-specific drift monitors |

## Data contract additions required (incremental, pass 80)

- `market_delay_contract_snapshot`:
- `capture_ts`, `market_id`, `bet_delay_models_json`, `bet_delay_seconds`, `data_delay_flag`, `source_surface`, `source_url`.
- `pretrade_delay_gate_event`:
- `event_ts`, `market_id`, `delay_model_regime`, `bet_delay_seconds`, `data_delay_flag`, `decision(allow|throttle|block)`, `decision_reason`.
- `provider_service_standard_snapshot`:
- `capture_ts`, `provider`, `report_period_start`, `report_period_end`, `system_name`, `unplanned_downtime_minutes`, `target_uptime_pct`, `actual_uptime_pct`, `source_url`.
- `provider_service_timeliness_snapshot`:
- `capture_ts`, `provider`, `metric_name`, `target_pct`, `actual_pct`, `variance_pct`, `reporting_period`, `source_url`.
- `provider_reliability_regime_state`:
- `provider`, `event_date`, `uptime_gap_score`, `timeliness_gap_score`, `combined_reliability_band(green|amber|red)`.

## Open questions to resolve before implementation freeze (incremental, pass 80)

- What threshold on `bet_delay_seconds` should move a strategy from `allow` to `throttle` for each market class?
- Should `PASSIVE` and `DYNAMIC` delay models receive separate fill/slippage priors, or a shared hierarchical prior with model-level offsets?
- Which RA timeliness metrics are most predictive of stale-feature risk in our NSW/VIC win-market slice?
- How should monthly report publication lag be handled when constructing near-real-time reliability state?

## Ranked implementation backlog (delta, pass 80)

### P0 additions

1. Implement `bet_delay_contract_resolver` and persist per-market delay state from catalogue/book/stream surfaces.
2. Add `pretrade_delay_gate_event` logic that blocks or throttles when `isMarketDataDelayed=true` or delay-state breaches strategy policy.
3. Build `provider_service_standard_ingestor` for RA monthly and annual reports with schema-validated extraction.
4. Add `compilation_timeliness_quality_gate` so RA feature freshness confidence degrades when target-vs-actual timeliness variance is negative.

### P1 additions

1. Train execution models with explicit `delay_model_regime` and `bet_delay_seconds` features and compare against current baseline.
2. Build reliability dashboards joining status-page outages with RA monthly/annual timeliness+downtime metrics.
3. Backtest confidence-weighted feature gating based on `combined_reliability_band` during known RA timeliness misses.

## Sources for this update (pass 80)

- Betfair Exchange API docs, `Betting Type Definitions` (updated 2025-12-11; captured 2026-04-01): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Betfair Developer Program FAQ, `Why do you have a delay on placing bets on a market that is in-play` (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Racing Australia PDF, `Monthly Service Standard Performance Report - November 2025` (captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-November-2025.pdf
- Racing Australia PDF, `Annual Service Standard Performance Report for the 12 months ending June 2025` (captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/Reports/Consolidated-Report-2024-2025.pdf

## Incremental architecture decisions from this run (2026-04-01, pass 81)

- Decision: add a `historical_data_access_policy_gate` ahead of Betfair historical backfill and replay jobs.
- Why: account-jurisdiction eligibility (Betfair.com vs blocked regional account domains) can prevent access even when API credentials otherwise look valid.
- Decision: add a `caw_rebate_policy_scenario_engine` for pool-pressure simulation.
- Why: CHRB-recorded CAW testimony provides concrete host-fee-to-rebate arithmetic that can shift win-pool intensity and late-odds stability.
- Decision: add a `policy_regime_partitioner` for CAW microstructure analytics.
- Why: fee-policy events (for example, September 2022 host-fee changes) define structural breaks in pool behavior that should not be averaged into one regime.

## Provider comparison (incremental high-signal additions, pass 81)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Support: historical-data jurisdictions FAQ | Explicit account-domain allow/block contract for historical-data site access | Support-layer policy can change; must snapshot and revalidate periodically | A | Implement historical-data access gate with deterministic failure reasons |
| CHRB June 2024 CAW transcript (Item 11) | Quantified host-fee and rebate arithmetic tied to CAW volume/stability controls | Transcript testimony is contextual and jurisdiction-specific; requires portability caution | A/B | Build rebate-policy scenario engine and regime-aware pool-pressure models |

## Data contract additions required (incremental, pass 81)

- `historical_data_access_policy_snapshot`:
- `capture_ts`, `service_name`, `allowed_account_domain`, `blocked_account_domains_json`, `block_reason`, `source_url`.
- `historical_data_access_check_event`:
- `event_ts`, `account_domain`, `service_name`, `eligible_flag`, `failure_reason`, `run_id`.
- `caw_host_fee_policy_event`:
- `event_ts`, `jurisdiction`, `pool_type`, `host_fee_delta_pct`, `effective_period_start`, `policy_source_url`.
- `caw_rebate_arithmetic_snapshot`:
- `capture_ts`, `takeout_pct`, `host_fee_pct`, `operator_retained_pct`, `implied_rebate_pct`, `jurisdiction`, `source_url`.
- `policy_regime_partition`:
- `regime_id`, `jurisdiction`, `pool_type`, `start_ts`, `end_ts`, `trigger_event`, `notes`.

## Open questions to resolve before implementation freeze (incremental, pass 81)

- Do we maintain separate historical-data collectors per Betfair account domain, or a single collector with policy-aware routing and failover?
- What is the minimum evidence threshold to activate `caw_rebate_policy_scenario_engine` outside California (for example, NYRA, Del Mar, AU tote analogs)?
- Should `policy_regime_partitioner` be hard event-date cuts or probabilistic transition windows when exact effective timestamps are unclear?
- How should blocked historical-data windows be represented in model training: exclusion, imputation, or explicit missingness regime features?

## Ranked implementation backlog (delta, pass 81)

### P0 additions

1. Implement `historical_data_access_policy_gate` with startup validation against account-domain eligibility and explicit error taxonomy.
2. Add `historical_data_access_policy_snapshot` + `historical_data_access_check_event` persistence to backfill/replay orchestration.
3. Implement `policy_regime_partitioner` to split CAW microstructure datasets on known fee-policy events before model fitting.
4. Add `caw_rebate_policy_scenario_engine` v1 using host-fee/rebate arithmetic to generate policy-counterfactual pool-pressure priors.

### P1 additions

1. Backtest late-odds compression models with and without `rebate_pressure_index` features derived from policy arithmetic.
2. Build jurisdiction-portability diagnostics to test whether California fee-policy priors transfer to other CAW-influenced pools.
3. Add a scheduled doc watcher for Betfair support policy pages that can invalidate historical-data eligibility assumptions.

## Sources for this update (pass 81)

- Betfair Developer Program FAQ, `Which juristictions is Betfair Exchange Historical Data available to?` (updated 2025-04-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360008664937-Which-juristictions-is-Betfair-Exchange-Historical-Data-available-to
- California Horse Racing Board meeting transcript, 20 June 2024 (Agenda Item 11: CAW discussion; captured 2026-04-01): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=BOARDMTGTRANS&DocumentID=00051659&SubCategory=

## Incremental architecture decisions from this run (2026-04-01, pass 82)

- Decision: add a `caw_gateway_concentration_monitor` in market-regime analytics.
- Why: CHRB-recorded testimony indicates California CAW flow concentration through a single gateway can be material to pool behavior.
- Decision: add a `caw_rebate_baseline_calibrator` with explicit baseline-vs-policy-shock states.
- Why: the same transcript provides a worked high-volume blended rebate baseline (~13%) that should be represented separately from host-fee shock events.
- Decision: add a `counterparty_concentration_kill_switch` for CAW-sensitive strategies.
- Why: concentrated gateway structure raises single-intermediary dependency risk and can amplify abrupt late-odds regime shifts.

## Provider comparison (incremental high-signal additions, pass 82)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB June 2024 CAW transcript (Item 11) | Testimony-level concentration signal ("virtually all" CAW in CA pools via one gateway) and high-volume blended rebate baseline (~13%) | Regulatory hearing transcript with participant testimony; strong contextual signal but not a statutory rule or audited market-share table | A/B | Add concentration monitor + rebate baseline calibrator; treat thresholds as scenario priors with source-type tags |

## Data contract additions required (incremental, pass 82)

- `caw_gateway_concentration_snapshot`:
- `capture_ts`, `jurisdiction`, `pool_scope`, `gateway_name`, `concentration_claim_text`, `source_type`, `source_url`.
- `caw_rebate_baseline_snapshot`:
- `capture_ts`, `jurisdiction_scope`, `rebate_baseline_pct`, `participant_class`, `source_type`, `source_url`.
- `caw_concentration_regime_state`:
- `regime_id`, `jurisdiction`, `start_ts`, `end_ts`, `gateway_concentration_band(low|medium|high)`, `evidence_grade`, `notes`.
- `strategy_concentration_risk_event`:
- `event_ts`, `strategy_id`, `market_id`, `concentration_band`, `rebate_baseline_pct`, `decision(allow|throttle|block)`, `decision_reason`.

## Open questions to resolve before implementation freeze (incremental, pass 82)

- What evidence threshold should move gateway concentration from scenario prior to hard execution control in non-California pools?
- Should concentration risk gates be strategy-specific (only late-pool/liquidity-sensitive strategies) or account-wide?
- How should we combine concentration and host-fee policy states when they point to opposite pressure signals in a window?
- What revalidation cadence should apply to testimony-derived concentration priors before they expire automatically?

## Ranked implementation backlog (delta, pass 82)

### P0 additions

1. Implement `caw_gateway_concentration_monitor` with source-type confidence tags and automatic expiry of stale testimony-derived priors.
2. Add `caw_rebate_baseline_calibrator` and store baseline vs policy-shock deltas used in pool-pressure models.
3. Add `counterparty_concentration_kill_switch` for CAW-sensitive strategies when concentration risk exceeds configured threshold.
4. Add `strategy_concentration_risk_event` logging so every throttle/block decision is replayable and auditable.

### P1 additions

1. Run sensitivity tests on late-odds drift and fill quality under low/medium/high concentration regime assumptions.
2. Build jurisdiction-portability diagnostics to test whether California concentration priors transfer to NYRA/Del Mar/AU-linked tote contexts.
3. Add scheduled revalidation workflow for testimony-derived priors and downgrade confidence when no corroborating updates appear.

## Sources for this update (pass 82)

- California Horse Racing Board meeting transcript, 20 June 2024 (Agenda Item 11: CAW discussion, concentration + blended rebate remarks; captured 2026-04-01): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=BOARDMTGTRANS&DocumentID=00051659&SubCategory=

## Incremental architecture decisions from this run (2026-04-01, pass 83)

- Decision: add an `nsw_use_scope_entitlement_gate` before NSW data ingestion and execution enablement.
- Why: Racing NSW 2025-26 conditions bind use rights to Australian-licence scope and Australian/location-constrained infrastructure pathways, not fee status alone.
- Decision: add a `group_threshold_allocator` in fee simulation and realized-margin attribution.
- Why: the same conditions apply a shared exempt-threshold construct across related operators, so entity-level independent-threshold assumptions can materially misprice fees.
- Decision: add a `bet_back_credit_eligibility_validator` with evidence attachments.
- Why: Bet Back credits are conditional on account-based bets with NSW-approved counterparties plus documentary proof.

## Provider comparison (incremental high-signal additions, pass 83)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing NSW 2025-26 standard conditions (clean version) | Hard use-scope contract (licence + geography/hosting), group-threshold allocation mechanics, and Bet Back credit eligibility/evidence rules | Conditions can be revised by period/version; requires snapshotting by effective date and explicit contract-version linkage | A | Implement entitlement gate + group-threshold allocator + evidence-backed credit validator before live scale-up |

## Data contract additions required (incremental, pass 83)

- `nsw_use_scope_contract_snapshot`:
- `capture_ts`, `effective_date`, `allowed_licence_scope`, `allowed_infrastructure_scope`, `non_au_operation_exclusion_flag`, `source_url`.
- `nsw_group_threshold_allocation_snapshot`:
- `capture_ts`, `group_id`, `related_operator_flag`, `group_shared_threshold_aud`, `allocation_method_ref`, `source_url`.
- `nsw_bet_back_credit_rule_snapshot`:
- `capture_ts`, `account_based_only_flag`, `counterparty_requires_nsw_approval_flag`, `documentary_evidence_required_flag`, `source_url`.
- `bet_back_credit_evidence_event`:
- `event_ts`, `operator_id`, `counterparty_id`, `bet_back_reference`, `evidence_attached_flag`, `eligibility_decision(allow|deny)`, `decision_reason`.
- `entitlement_scope_check_event`:
- `event_ts`, `jurisdiction(nsw)`, `licence_scope_pass_flag`, `hosting_scope_pass_flag`, `decision(allow|block)`, `decision_reason`.

## Open questions to resolve before implementation freeze (incremental, pass 83)

- What evidence artifact set is minimally acceptable for Bet Back credit recognition in production PnL (transaction logs only vs logs plus contractual counterparty proof)?
- Do we enforce `nsw_use_scope_entitlement_gate` as a hard precondition for all NSW backtests, or only for forward/live datasets?
- How should `group_id` be maintained when related-entity relationships change intra-period for threshold allocation replay?
- Should margin dashboards report both gross theoretical credits and evidence-qualified credits to expose compliance-adjusted economics?

## Ranked implementation backlog (delta, pass 83)

### P0 additions

1. Implement `nsw_use_scope_entitlement_gate` with fail-closed behavior when licence/hosting scope checks are unresolved.
2. Add `group_threshold_allocator` and re-run fee simulations using related-operator group logic.
3. Implement `bet_back_credit_eligibility_validator` and block unrealized credit application without evidence attachments.
4. Persist `entitlement_scope_check_event` and `bet_back_credit_evidence_event` for audit-ready replay.

### P1 additions

1. Add compliance-aware margin reports (`theoretical_credit` vs `evidence_qualified_credit`) by jurisdiction and operator group.
2. Build contract-diff monitors for NSW standard-condition version changes and auto-flag affected fee/entitlement assumptions.
3. Stress test strategy portability under stricter hosting/licence-scope constraints to quantify deployment-friction impact.

## Sources for this update (pass 83)

- Racing NSW PDF, `NSW Thoroughbred Race Field Information Use Approvals For Australian Wagering Operators Standard Conditions – 2025-26 (Effective 1 July 2025)` (captured 2026-04-01): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Clean-Version-Effective-1-July-2025.pdf

## Incremental architecture decisions from this run (2026-04-01, pass 84)

- Decision: add a `tote_finalization_latency_model` service with venue-specific stage timings.
- Why: CHRB-published CAW/tote mechanics provide explicit stage latency (hub receive + odds recompute/display), so post-jump price updates must be modeled as deterministic processing windows.
- Decision: add `market_access_regime_guard` in collector startup and monitoring.
- Why: Betfair documents legally restricted-region empty responses; we must distinguish legal-unavailable from infrastructure/auth outages.
- Decision: add `commingling_policy_regime` features in market-structure modeling.
- Why: HKJC disclosures show policy-step changes in simulcast quotas and large commingled turnover share that can shift liquidity dynamics.
- Decision: add a `source_bias_weighting` rule in evidence promotion.
- Why: stakeholder-disclosure sources can be primary but interested; they should be retained with confidence weighting and corroboration requirements.

## Provider comparison (incremental high-signal additions, pass 84)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB published CAW Q&A (Elite response) | Concrete CAW operating metrics: throughput, account thresholding, no-cancel rule, late-money share and tote finalization timing decomposition | Stakeholder-authored response letter; primary but interested and venue-specific | A | Use as measurable priors with source-bias tag; require corroboration before hard global defaults |
| Betfair support article on missing markets | Explicit legal-region/IP gating behavior for market discovery/book APIs; SG horse-market AUS/NZ scope statement | Support-doc layer, can change with legal policy updates | A | Implement legal-access diagnostics + region-preflight checks before declaring data outages |
| HKJC corporate disclosures (2025) | Commingling partner breadth, turnover share/growth, and policy quota-step changes for simulcasts | Jurisdiction-specific and not directly transferable to AU | A | Use for regime-feature priors and stress tests of liquidity-shift scenarios, not direct parameter copy |

## Data contract additions required (incremental, pass 84)

- `tote_finalization_profile`:
- `track`, `effective_from`, `effective_to`, `stop_to_hub_receive_sec_p50`, `hub_receive_to_display_sec_p50`, `total_stop_to_display_sec_p50`, `source_type`, `source_url`.
- `late_money_composition_snapshot`:
- `track`, `pool_type`, `window_sec_to_post`, `caw_share_pct`, `non_caw_share_pct`, `sample_basis`, `source_url`.
- `market_access_regime_event`:
- `event_ts`, `egress_ip_country`, `api_operation`, `empty_response_flag`, `legal_restriction_suspected_flag`, `diagnostic_decision`, `source_doc_version`.
- `commingling_regime_snapshot`:
- `jurisdiction`, `season`, `partner_count`, `partner_jurisdiction_count`, `commingled_turnover`, `commingled_share_pct`, `simulcast_race_cap`, `simulcast_day_cap`, `source_url`.
- `evidence_confidence_profile`:
- `source_id`, `source_type`, `interested_party_flag`, `base_confidence`, `corroboration_count`, `promotion_status`.

## Open questions to resolve before implementation freeze (incremental, pass 84)

- What corroboration threshold should promote stakeholder-disclosed CAW latency/share metrics into hard production defaults?
- For Betfair legal-region gating, what should collector behavior be when a market family is inaccessible from current egress (hard fail vs degraded mode)?
- Which markets in our roadmap are exposed to similar commingling/policy-step shocks, and what alert threshold should trigger regime re-training?
- Should latency-model parameters be venue-level only, or segmented further by pool type and host tote operator?

## Ranked implementation backlog (delta, pass 84)

### P0 additions

1. Implement `market_access_regime_guard` with IP/region preflight checks and legal-restriction diagnostics for empty catalogue/book responses.
2. Add `tote_finalization_latency_model` and enforce pool-finalization timestamps in tote label generation.
3. Persist `late_money_composition_snapshot` and include CAW-share-window features in late-odds movement models.
4. Add `source_bias_weighting` and corroboration gates in evidence promotion pipeline.

### P1 additions

1. Add commingling-policy regime features and test sensitivity of late-execution models to quota-step shocks.
2. Build alerting for sudden shifts in last-60-second money composition relative to baseline track profile.
3. Create fallback routing rules when market-access regime blocks specific jurisdictional market families.

## Sources for this update (pass 84)

- CHRB published CAW Q&A letter (`Computer_Assisted_Wagering.pdf`, Elite Turf Club response dated 2024-09-05; accessed 2026-04-01): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair support: market visibility restrictions by legal location/IP, including SG horse-market AUS/NZ scope (updated 2025-11-05): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listEvents-listMarketCatalogue-or-listMarketBook-API-response
- HKJC FY2024/25 results disclosure (commingling turnover/share and partner breadth, 2025-08-29): https://corporate.hkjc.com/corporate/corporate-news/english/2025-08/news_2025082901950.aspx
- HKJC simulcast quota expansion announcement (2025-06-18): https://corporate.hkjc.com/corporate/corporate-news/english/2025-06/news_2025061801842.aspx

## Incremental architecture decisions from this run (2026-04-01, pass 85)

- Decision: add a `caw_intermediary_affiliation_registry` to CAW microstructure governance.
- Why: CHRB-published CAW Q&A material provides explicit ownership concentration for a dominant CAW gateway (Elite), adding affiliation-risk context beyond routing share alone.
- Decision: add a `caw_rebate_elasticity_scenario_engine` in policy-counterfactual simulation.
- Why: the same CHRB source gives a directional no-rebate/takeout sensitivity claim (around 12% takeout with no rebates implies material CAW handle reduction), which should be represented as a scenario prior.
- Decision: add a `provider_report_index_integrity_guard` for Australian KPI-ingestion pipelines.
- Why: Racing Australia report-index chronology/listing inconsistencies can silently mislabel reporting windows if grouping labels are trusted without document-level validation.

## Provider comparison (incremental high-signal additions, pass 85)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB published CAW Q&A (Elite response) | Additional CAW governance/economics detail: intermediary ownership concentration and directional no-rebate takeout sensitivity claim | Stakeholder-authored disclosure; strong primary context but interested-party bias remains | A/B | Add affiliation registry + rebate-elasticity scenario priors with confidence tagging |
| Racing Australia monthly-report index | Primary index surface for provider KPI discovery plus observable chronology/listing anomalies | HTML/index structure can be inconsistent; must not be treated as chronology-authoritative without cross-checks | A | Implement index-integrity guard and report-period reconciliation before KPI promotion |

## Data contract additions required (incremental, pass 85)

- `caw_intermediary_affiliation_snapshot`:
- `capture_ts`, `jurisdiction`, `gateway_name`, `owner_entity`, `ownership_pct`, `source_type`, `source_url`.
- `caw_rebate_elasticity_claim_snapshot`:
- `capture_ts`, `jurisdiction`, `takeout_scenario_pct`, `rebate_enabled_flag`, `claimed_handle_effect(material_decrease|neutral|increase)`, `source_type`, `source_url`.
- `provider_report_index_snapshot`:
- `capture_ts`, `provider`, `section_label`, `link_text_month`, `link_url`, `chronology_anomaly_flag`, `anomaly_reason`, `source_url`.
- `provider_report_period_reconciliation_event`:
- `event_ts`, `provider`, `index_period_label`, `pdf_period_label`, `reconciliation_status(pass|fail)`, `decision(allow|block|review)`, `decision_reason`.

## Open questions to resolve before implementation freeze (incremental, pass 85)

- What confidence threshold should allow stakeholder-claimed rebate-elasticity signals to influence production priors outside scenario testing?
- Should `caw_intermediary_affiliation_registry` drive hard risk controls, or remain an attribution-only feature until independently corroborated?
- For Racing Australia KPI ingestion, do we hard-block on any index chronology anomaly, or allow ingestion when PDF metadata reconciliation passes?
- What is the required retention horizon for index snapshots so chronology anomalies are audit-replayable?

## Ranked implementation backlog (delta, pass 85)

### P0 additions

1. Implement `provider_report_index_integrity_guard` and block KPI promotion when index-period labels fail document-level reconciliation.
2. Add `provider_report_period_reconciliation_event` logging for every monthly KPI ingest run.
3. Stand up `caw_intermediary_affiliation_registry` with source-type confidence tags and expiry/revalidation policy.
4. Implement `caw_rebate_elasticity_scenario_engine` v1 with explicit no-rebate/takeout scenario parameters.

### P1 additions

1. Run sensitivity tests for late-odds drift/fill quality under affiliation concentration and rebate-elasticity scenario toggles.
2. Build anomaly dashboards for provider index integrity (`chronology_anomaly_rate`, `reconciliation_fail_rate`) by source.
3. Add corroboration workflow to upgrade or downgrade stakeholder-claimed elasticity priors over time.

## Sources for this update (pass 85)

- CHRB published CAW Q&A letter (`Computer_Assisted_Wagering.pdf`, Elite Turf Club response dated 2024-09-05; accessed 2026-04-01): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Racing Australia Monthly Service Standard Performance Report index (`PerformanceReport.aspx`, captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental architecture decisions from this run (2026-04-02, pass 86)

- Decision: add a `betfair_sp_reconciliation_state_machine` to execution and replay.
- Why: Betfair SP docs define deterministic Near/Far projection semantics and unmatched-to-SP reconciliation with threshold-based lapse behavior that is not represented in a binary matched/unmatched order model.
- Decision: add an `au_off_to_inplay_void_guard` for settlement and incident replay.
- Why: Betfair Exchange rules apply an AU horse-racing-specific void window for bets matched after official off but before delayed in-play transition.
- Decision: add a `caw_balance_target_monitor` and `purse_yield_scenario` in CAW regime analytics.
- Why: CHRB-published CAW material includes explicit target-band and purse-contribution framing that implies policy responses are balance- and economics-driven, not purely handle-maximizing.
- Decision: add a `provider_topology_router` with WA exception handling for fields ingestion.
- Why: Racing Australia service statements explicitly separate national fields compilation from WA, while still asserting national official results/form coverage.

## Provider comparison (incremental high-signal additions, pass 86)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair SP FAQ + SP Rules | Near/Far projection mechanics, no-SP midpoint fallback, unmatched-to-SP conversion path, minimum lay-liability lapse behavior | Promo/help layer; verify market-specific behavior in live telemetry by currency and product context | A | Implement SP reconciliation state machine and minimum-liability-aware sizing/reconciliation |
| Betfair Exchange General Rules | Jurisdiction-specific settlement nuance for AU horse-racing off-to-inplay delay windows | Rules page can evolve; requires version snapshotting for replay correctness | A | Add AU off-to-inplay void guard and rules-versioned settlement replay |
| CHRB CAW Q&A (Elite response) | Additional CAW objective metrics: target handle-share band, win-rate framing, purse-share contribution statement | Stakeholder-authored disclosure; venue-specific and potentially self-serving | A/B | Use as scenario priors with source-bias tags, not global hard defaults |
| Racing Australia Role and Services | Provider topology constraints: national fields scope with WA exception, plus national official results/form role | Corporate service description; confirms topology but not SLA/latency terms | A | Add jurisdiction-aware provider routing and lineage controls (`fields` vs `results/form`) |

## Data contract additions required (incremental, pass 86)

- `sp_reconciliation_event`:
- `market_id`, `selection_id`, `order_id`, `snapshot_ts`, `near_price`, `far_price`, `pending_sp_reconciliation_flag`, `reconciliation_result`, `lapse_reason`, `min_liability_threshold_value`.
- `market_transition_void_window_event`:
- `market_id`, `jurisdiction`, `official_off_ts`, `inplay_turn_ts`, `off_to_inplay_gap_sec`, `au_void_rule_applied_flag`, `voided_bet_count`, `source_rule_version`.
- `caw_balance_target_snapshot`:
- `track`, `capture_ts`, `target_caw_handle_share_pct`, `target_band_tolerance_pct`, `target_win_rate_ceiling_pct`, `source_type`, `source_url`.
- `caw_purse_yield_snapshot`:
- `track`, `capture_ts`, `purse_contribution_pct_per_caw_dollar`, `source_type`, `source_url`.
- `provider_topology_map`:
- `dataset_type(fields|results|form)`, `jurisdiction`, `primary_provider`, `exception_flag`, `exception_reason`, `effective_from`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 86)

- For SP reconciliation, do we maintain a unified cross-market model, or separate models for SP-eligible vs non-SP execution paths?
- What rules-version pinning strategy should we use so historical settlement replay remains stable when Betfair rule text changes?
- What confidence/corroboration threshold is required before CHRB stakeholder-disclosed CAW target/economics values can influence live risk controls?
- For WA fields routing, what is the canonical alternate provider and schema-drift fallback when national and jurisdictional feeds diverge?
- Should off-to-inplay gap incidents trigger an automatic temporary stake haircut in AU horse racing, and at what gap threshold?

## Ranked implementation backlog (delta, pass 86)

### P0 additions

1. Implement `betfair_sp_reconciliation_state_machine` and persist `sp_reconciliation_event` before final risk-ledger commits.
2. Implement `au_off_to_inplay_void_guard` in settlement/replay and add rules-version snapshots for all incident windows.
3. Add order-sizing checks for SP minimum-lay-liability constraints to reduce avoidable reconciliation lapses.
4. Stand up `provider_topology_router` with explicit WA exception handling for fields ingestion and lineage tagging.
5. Add `provider_topology_map` validation tests to block deploys when jurisdiction/provider mappings are incomplete.

### P1 additions

1. Add `caw_balance_target_monitor` dashboards (`observed_share`, `target_band_gap`, `win_rate_gap`) for policy-response diagnostics.
2. Run scenario tests for `purse_yield_sensitivity` and CAW target-band drift under host-fee/pool-restriction policy changes.
3. Train fill-validity risk features using `off_to_inplay_gap_sec` and compare AU vs non-AU incident behavior.

## Sources for this update (pass 86)

- Betfair SP FAQ (`Projected SP Odds`, including Near/Far and no-SP midpoint behavior; accessed 2026-04-02): https://promo.betfair.com/betfairsp/FAQs_projectedOdds.html
- Betfair SP Rules (`SP Bet Rules`, including unmatched-to-SP conversion and minimum lay-liability lapse behavior; accessed 2026-04-02): https://promo.betfair.com/betfairsp/FAQs_spbetrules.html
- Betfair Exchange General Rules (AU horse-racing off-to-in-play void exception; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/exchange-general-rules
- CHRB published CAW Q&A letter (`Computer_Assisted_Wagering.pdf`, Elite Turf Club response dated 2024-09-05; accessed 2026-04-02): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Racing Australia `Role and Services` (fields coverage exception for WA + official results/form database statements; accessed 2026-04-02): https://www.racingaustralia.horse/Aboutus/Role-and-Services.aspx

## Incremental architecture decisions from this run (2026-04-02, pass 87)

- Decision: add a `venue_caw_policy_state_engine` for rule-effective-date policy gating by pool and time-to-post.
- Why: NYRA now publishes explicit CAW speed and cutoff controls (including differentiated win-pool vs broader pool windows), which create measurable market-structure regime boundaries.
- Decision: add a `betfair_virtualisation_config_guard` in market-data collectors and replay tooling.
- Why: Betfair documents deterministic website/API divergences when virtual prices are excluded by default and request-depth/weight settings differ.
- Decision: add an `api_weight_budget_scheduler` for Exchange API market-book polling.
- Why: Betfair enforces a 200-point request-weight budget with `TOO_MUCH_DATA` failures; polling strategy must optimize market breadth vs depth explicitly.
- Decision: add an `rv_contract_compliance_orchestrator` covering supplier entitlement, integrity-request SLAs, and HVD state.
- Why: RV conditions introduce enforceable state-level controls (approved suppliers, anti-avoidance, integrity cooperation timelines, and exchange discount mechanics) that materially affect both data rights and realized economics.

## Provider comparison (incremental high-signal additions, pass 87)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| NYRA official CAW guardrail release (2026-01-30) | Explicit CAW policy parameters: `>6 bets/sec` classification and expanded `1 MTP` cutoff scope plus existing win-pool and retail-only carve-outs | Venue-specific policy; portability outside NYRA requires caution | A | Implement venue policy-state engine with effective-date segmentation and per-pool rule mapping |
| Betfair developer support (virtual prices + request limits) | Deterministic API/site ladder differences via virtualization config; hard polling budget constraints (`200` weight points, depth-scaling impacts) | Support-layer docs can change; requires version snapshot and live telemetry validation | A | Add virtualization guard and weight-budget scheduler; persist request config in every snapshot |
| Racing Victoria Standard Conditions + 2025/26 guide | State-level entitlement/compliance mechanics: approved supplier constraints, anti-avoidance language, integrity data-request timelines, HVD formula/eligibility, reporting-metric semantics | Contract/version-specific and jurisdiction-bound; terms can be amended | A | Add RV contract compliance orchestrator and jurisdiction-aware fee/reporting normalization |

## Data contract additions required (incremental, pass 87)

- `venue_caw_policy_snapshot`:
- `venue`, `effective_from`, `effective_to`, `caw_speed_threshold_bets_per_sec`, `pool_scope`, `cutoff_mtp_sec`, `retail_only_flag`, `source_url`.
- `betfair_request_config_snapshot`:
- `capture_ts`, `market_ids_count`, `price_projection`, `virtualise_flag`, `requested_depth`, `computed_weight`, `weight_limit`, `request_outcome`, `error_code`.
- `virtualisation_gap_event`:
- `market_id`, `selection_id`, `event_ts`, `api_best_price`, `virtual_best_price`, `gap_ticks`, `config_hash`.
- `rv_supplier_entitlement_snapshot`:
- `effective_from`, `effective_to`, `approved_supplier`, `dataset_scope`, `contract_version`, `source_url`.
- `rv_integrity_request_event`:
- `request_id`, `request_ts`, `request_type(ongoing|real_time)`, `due_ts`, `response_ts`, `sla_breach_flag`, `requesting_entity`.
- `rv_hvd_state_snapshot`:
- `period`, `qcr_amount`, `multiplier_primary`, `multiplier_secondary`, `cap_agreed_flag`, `cap_amount`, `hvd_amount`.

## Open questions to resolve before implementation freeze (incremental, pass 87)

- For policy-state modeling, should we treat NYRA cutoff changes as hard discontinuities or apply a transition window for participant adaptation?
- What canonical method should compute Betfair request weight locally so scheduler decisions stay aligned with support-documented server weighting rules?
- How should we fail over when RV supplier entitlement changes mid-period but historical runs require reproducible replay against old supplier sets?
- For RV integrity requests, what is the operational threshold to trigger automatic strategy throttling under concurrent real-time request load?
- Should HVD assumptions be represented as deterministic formula application only, or scenario-based until cap-agreement data is guaranteed complete?

## Ranked implementation backlog (delta, pass 87)

### P0 additions

1. Implement `venue_caw_policy_state_engine` and enforce per-venue/per-pool CAW cutoff rules in simulation and live execution.
2. Add `betfair_virtualisation_config_guard` so collectors always persist and validate virtualization/depth settings before publishing ladders.
3. Implement `api_weight_budget_scheduler` with pre-flight weight estimation and automatic downshift to avoid `TOO_MUCH_DATA` failures.
4. Build `rv_contract_compliance_orchestrator` for supplier-entitlement checks, integrity-request SLA tracking, and contract-versioned gating.
5. Add `rv_hvd_state_snapshot` calculation path (including cap-agreement state) and integrate into effective-fee attribution.

### P1 additions

1. Backtest liquidity/odds-volatility changes around NYRA's 2026-02-05 policy cutover using segmented regimes.
2. Train slippage-error diagnostics using `virtualisation_gap_event` to quantify benefit of virtualized vs raw-price consumption.
3. Add compliance-load dashboards for RV integrity request throughput and SLA breach rates.
4. Build cross-jurisdiction fee-normalization reports that reconcile nominal fees, discounts, rebates, and reporting-definition differences.

## Sources for this update (pass 87)

- NYRA official release, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; accessed 2026-04-02): https://www.nyra.com/belmont/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Betfair developer support, website/API virtual price differences and virtualization flags (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Betfair developer support, Exchange API request-weight limits (`TOO_MUCH_DATA`, 200-point budget) (updated 2025-09-09; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/115003864671-What-data-request-limits-exist-on-the-Exchange-API
- Racing Victoria, Race Fields Policy page linking current policy/conditions (accessed 2026-04-02): https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria PDF, `Standard Conditions of Approval - Effective 1 March 2025` (accessed 2026-04-02): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f
- Racing Victoria PDF, `Guide to the Provision of Information 2025/26` (accessed 2026-04-02): https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf?v=09a420bf

## Incremental architecture decisions from this run (2026-04-02, pass 88)

- Decision: add a `wa_levy_calendar_orchestrator` with monthly and annual deadline-state tracking.
- Why: WA DLGSC defines explicit monthly (`+14 days`) and annual (`30 August`, race year `1 August`-`31 July`) obligations plus exemption timing boundaries that require deterministic calendar gating.
- Decision: add a `wa_turnover_semantics_normalizer` before fee and edge attribution.
- Why: WA turnover rules explicitly include free bets, disallow common deductions (rebates/discounts/claims), and require multi-leg/cross-period apportionment; generic turnover logic will drift.
- Decision: add a `wa_prescribed_info_access_audit` lane in compliance telemetry.
- Why: WA prescribed-information provisions include document/record access and, where possible, real-time system access, with summary-format constraints to RWWA; this is an operational capability requirement, not static legal text.

## Provider comparison (incremental high-signal additions, pass 88)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| WA DLGSC Racing Bets Levy page | Hard WA compliance contract: monthly/annual filing deadlines, audited-return exemption timing, turnover-construction semantics, prescribed-information access obligations | Government guidance layer references Acts/Regulations; implementation details still need legal/version pinning | A | Implement WA calendar orchestrator + turnover semantics normalizer + prescribed-info audit artifacts |

## Data contract additions required (incremental, pass 88)

- `wa_levy_calendar_snapshot`:
- `capture_ts`, `monthly_due_days_after_month_end`, `annual_due_month_day`, `race_year_start_month_day`, `race_year_end_month_day`, `source_url`.
- `wa_audited_return_exemption_snapshot`:
- `capture_ts`, `turnover_threshold_aud`, `request_recommended_by_month_day`, `hard_reject_after_month_day`, `annual_reapply_required_flag`, `source_url`.
- `wa_turnover_semantics_snapshot`:
- `capture_ts`, `includes_free_bets_flag`, `rebate_deduction_allowed_flag`, `bad_debt_deduction_allowed_flag`, `cross_period_apportionment_required_flag`, `multi_leg_wa_apportionment_required_flag`, `source_url`.
- `wa_prescribed_info_access_event`:
- `event_ts`, `requesting_entity`, `request_type(document_copy|record_access|real_time_access)`, `where_possible_constraint_flag`, `response_ts`, `sla_status`, `source_url`.
- `wa_monthly_return_channel_snapshot`:
- `period_month`, `channel(on_course|telephone|internet|retail)`, `bets_taken_total`, `payout_total`, `gross_turnover_total`.

## Open questions to resolve before implementation freeze (incremental, pass 88)

- Should WA deadline breaches hard-stop execution in WA markets immediately, or trigger staged degradation with manual override?
- What canonical rule set should resolve conflicts between provider-native turnover fields and WA levy semantics for multi-leg and cross-period bets?
- How do we evidence and monitor the "where possible" real-time-access obligation in a technically auditable way?
- Should annual-exemption status (`<A$50k`) be modeled as a forecasted state intra-year or only as a filed/approved state?

## Ranked implementation backlog (delta, pass 88)

### P0 additions

1. Implement `wa_levy_calendar_orchestrator` with deadline-state events for monthly (`+14d`) and annual (`30 Aug`) obligations.
2. Build `wa_turnover_semantics_normalizer` and block WA fee attribution when semantic checks fail (free-bet inclusion, deduction bans, apportionment rules).
3. Implement `wa_audited_return_exemption_gate` with request-timing controls (`pre-31 Jul` preferred, `post-30 Aug` reject).
4. Add `wa_prescribed_info_access_audit` logging for document/record/real-time requests and response timestamps.

### P1 additions

1. Add WA compliance dashboards (`monthly_submission_latency`, `annual_filing_status`, `exemption_request_success_rate`).
2. Run sensitivity tests of PnL/edge attribution under alternative turnover-construction assumptions to quantify WA semantic risk.
3. Add contract-version monitoring for WA legislative references and trigger re-validation workflows on detected changes.

## Sources for this update (pass 88)

- WA DLGSC, `Racing Bets Levy` (monthly/annual return deadlines, turnover semantics, prescribed-information obligations; accessed 2026-04-02): https://www.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/race-fields
- WA Betting Control Act 1954 (legislative basis referenced by DLGSC page; accessed 2026-04-02): https://www.legislation.wa.gov.au/legislation/statutes.nsf/main_mrtitle_67_homepage.html
- WA Racing Bets Levy Act 2009 (legislative basis referenced by DLGSC page; accessed 2026-04-02): https://www.legislation.wa.gov.au/legislation/statutes.nsf/main_mrtitle_1137_homepage.html

## Incremental architecture decisions from this run (2026-04-02, pass 89)

- Decision: add an `account_scope_api_contention_scheduler` with projection-aware request partitioning.
- Why: Betfair support documents account-level `TOO_MANY_REQUESTS` semantics with conditional contention triggered when `listMarketBook` includes order/match projections, and shared contention across account-state operations.
- Decision: add an `inplay_delay_regime_monitor` as a mandatory execution context feed.
- Why: Betfair support explicitly frames in-play placement delay as variable (`1-12s`) and surfaced through `betDelay`/market definition, so live/replay behavior must be delay-state aware.
- Decision: add `qld_authority_period_registry` and `qld_submission_channel_router`.
- Why: Racing Queensland now publishes a bounded authority period (`2025-07-01` to `2027-06-30`) and new effective-date submission artifacts (FTP/oncourse portal templates and definitions), requiring date-versioned entitlement/compliance routing.

## Provider comparison (incremental high-signal additions, pass 89)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`TOO_MANY_REQUESTS`) | Account-level contention mechanics, projection-triggered throttling scope, shared queue behavior, and write-instruction cap context | Support-layer operational docs can change; must be version snapped and validated in telemetry | A | Build projection-aware API scheduler and shared account-budget controls before scaling poll breadth |
| Betfair support (in-play delay) | Explicit in-play delay regime range (`1-12s`) and canonical retrieval points (`betDelay`, market definition) | Delay can vary by market and time; requires runtime capture, not static config | A | Add delay-state monitor and bind order models to observed delay regime |
| Racing Queensland race-information page | Current authority period, effective-date condition changes, new-applicant fee signal, authorised-WSP as-at timestamping, and 2025 submission-channel artifacts | Page-level source with linked artefacts; detailed clause enforcement still depends on current PDF/version snapshots | A | Implement QLD authority/version registry and submission-channel version controls in compliance pipeline |

## Data contract additions required (incremental, pass 89)

- `api_contention_window_snapshot`:
- `account_id`, `window_start_ts`, `operation`, `order_projection_flag`, `match_projection_flag`, `shared_contention_group`, `queue_ready_threshold`, `throttle_error_count`.
- `api_request_budget_partition`:
- `account_id`, `budget_window_ts`, `budget_market_data`, `budget_account_state`, `budget_orders`, `budget_reporting`, `allocation_policy_version`.
- `inplay_delay_regime_snapshot`:
- `market_id`, `capture_ts`, `is_inplay`, `bet_delay_sec`, `source_channel(listMarketBook|stream_definition)`, `delay_regime_version`.
- `qld_authority_period_snapshot`:
- `capture_ts`, `effective_from`, `effective_to`, `new_applicant_fee_aud`, `source_url`.
- `qld_submission_channel_spec`:
- `capture_ts`, `effective_from`, `channel_type(ftp|oncourse_portal)`, `template_id`, `definition_id`, `instructions_doc_url`.
- `qld_authorised_wsp_snapshot`:
- `capture_ts`, `as_at_date`, `operator_name`, `status`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 89)

- What default allocation policy should the account-scope scheduler use when market-data scans and account-state checks collide near jump?
- For projection-aware throttling, do we hard-ban `OrderProjection` on high-frequency loops, or allow dynamic burst windows under low contention?
- Should in-play delay forecasts be market-family specific (thoroughbred/harness/greyhound) or purely market-level by observed `betDelay`?
- How frequently should QLD authorised-WSP snapshots refresh to balance compliance freshness and operational overhead?
- Do we require mandatory hash/version capture of linked QLD templates/definitions before any production report submission?

## Ranked implementation backlog (delta, pass 89)

### P0 additions

1. Implement `account_scope_api_contention_scheduler` with projection-aware routing and shared-operation budgets.
2. Block high-frequency collector paths from requesting `OrderProjection`/`MatchProjection` unless explicitly approved.
3. Add `inplay_delay_regime_monitor` and require `bet_delay_sec` capture for all in-play execution/replay events.
4. Build `qld_authority_period_registry` with effective-date validation gates on entitlement checks.
5. Implement `qld_submission_channel_router` and enforce template/definition version pinning for each submission channel.

### P1 additions

1. Train throttle-risk diagnostics using contention and projection flags to forecast `TOO_MANY_REQUESTS` incidents.
2. Add delay-regime segmentation to fill/slippage dashboards (`1s-3s`, `4s-8s`, `9s-12s`) and compare model stability.
3. Automate QLD authorised-WSP as-at snapshot ingestion with change detection alerts and audit diffs.

## Sources for this update (pass 89)

- Betfair developer support, `Why am I receiving the TOO_MANY_REQUESTS error?` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000406111-Why-am-I-receiving-the-TOO-MANY-REQUESTS-error
- Betfair developer support, `Why do you have a delay on placing bets on a market that is 'in-play'` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Racing Queensland, `Race Information` (authority period, fee, effective-date conditions and submission artifacts; page crawled 2026-03-30, accessed 2026-04-02): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information

## Incremental architecture decisions from this run (2026-04-02, pass 90)

- Decision: add an `account_statement_reconciliation_ledger` service that ingests and normalizes `getAccountStatement` entries as a first-class post-trade truth surface.
- Why: Betfair documents transaction-charge identification and resettlement lifecycle effects through account-statement entries (including UNKNOWN-class rows), which are not fully represented by order/execution endpoints alone.
- Decision: add a `resettlement_lifecycle_replayer` for historical and live PnL correctness.
- Why: Betfair's resettlement lifecycle examples show multi-stage transitions (`RESULT_ERR`, `RESULT_FIX`, `COMMISSION_REVERSAL`, `RESULT_LOST`) that can revise previously settled outcomes.
- Decision: add a `transaction_charge_trace_parser` keyed to statement markers.
- Why: Betfair support explicitly points to `getAccountStatement` for transaction-charge identification, with marker text embedded in statement payload fields.

## Provider comparison (incremental high-signal additions, pass 90)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`getAccountStatement` transaction-charge + resettlement FAQs) | Canonical support guidance tying transaction-charge discovery and resettlement handling to account-statement surfaces | Support-layer wording can change; requires version snapshot and parser regression tests | A/B + A | Build statement-ledger parser and reconciliation pipeline before scaling live turnover |
| Betfair Exchange API docs (`Additional Information` resettlement lifecycle examples) | Concrete ledger event patterns (`RESULT_ERR`, `RESULT_FIX`, `COMMISSION_REVERSAL`, UNKNOWN-item payload semantics) | Example-driven reference; must be validated continuously against live account payload variation | A | Implement lifecycle replayer and UNKNOWN-item decoder with strict schema checks |

## Data contract additions required (incremental, pass 90)

- `account_statement_entry`:
- `fetch_ts`, `ref_id`, `item_date`, `item_class`, `amount`, `balance`, `currency`, `full_market_name_raw`, `transaction_type`, `win_lose`, `source_payload_json`, `source_payload_hash`.
- `transaction_charge_event`:
- `event_ts`, `ref_id`, `charge_marker_detected_flag`, `charge_marker_text`, `amount`, `strategy_ref`, `account_id`.
- `resettlement_lifecycle_event`:
- `market_id`, `selection_id`, `ref_id`, `event_ts`, `transaction_type`, `win_lose`, `amount`, `lifecycle_stage(initial_settle|unsettle|resettle)`, `commission_reversal_flag`.
- `statement_decode_quality_event`:
- `event_ts`, `item_class`, `decoder_version`, `decode_status`, `unknown_field_count`, `parse_error_code`.

## Open questions to resolve before implementation freeze (incremental, pass 90)

- What deterministic rules map statement event sequences into `initial_settle/unsettle/resettle` states when payload ordering arrives near-simultaneously?
- Do we treat any unparsed `itemClass=UNKNOWN` payload as a hard PnL-quality failure, or allow bounded soft-fail with quarantine?
- What retention horizon and refresh cadence should we use for statement backfills to catch delayed resettlement adjustments?
- How should statement-derived transaction-charge markers be allocated back to strategy-level cost attribution in shared-account trading?

## Ranked implementation backlog (delta, pass 90)

### P0 additions

1. Implement `account_statement_reconciliation_ledger` with durable ingestion and idempotent dedupe by `ref_id + item_date + amount`.
2. Build strict UNKNOWN-item decoders and fail-safe quarantine path for undecodable statement entries.
3. Implement `resettlement_lifecycle_replayer` and reconcile statement lifecycle events against settled-PnL tables.
4. Add `transaction_charge_trace_parser` and expose strategy-level charge attribution metrics.
5. Wire statement-derived reconciliation failures into live risk kill-switches for net-PnL confidence breaches.

### P1 additions

1. Add dashboards for `resettlement_revision_rate`, `commission_reversal_rate`, and `unknown_decode_failure_rate`.
2. Train PnL-confidence models using statement lifecycle volatility as a feature.
3. Run backfill studies to quantify historical drift between market-level settlement snapshots and statement-ledger truth.

## Sources for this update (pass 90)

- Betfair Developer Support, `How can I identify Transaction Charges via getAccountStatement?` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000396972-How-can-I-identify-Transaction-Charges-via-getAccountStatement
- Betfair Developer Support, `How does market resettlement show on my Betair Account Statement?` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360004664811-How-does-market-resettlement-show-on-my-Betair-Account-Statement
- Betfair Exchange API Documentation, `Additional Information` (`Account Statement - Resettlement Lifecycle` section; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Betfair Exchange API Documentation, `Additional Information` (current page surface containing resettlement examples; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2698444

## Incremental architecture decisions from this run (2026-04-02, pass 91)

- Decision: add an `execution_intent_policy_engine` that treats `FILL_OR_KILL` as a separate execution regime.
- Why: Betfair documents distinct FOK semantics (VWAP-floor plus immediate cancel unless `minFillSize` can be matched), so fill and slippage logic cannot be shared with resting LIMIT orders.
- Decision: add a `stake_validity_rules_engine` with per-currency dual-threshold checks and jurisdiction gates.
- Why: Betfair minimum-stake validity uses both `Min Bet Size` and `Min Bet Payout` with order-type and jurisdiction constraints.
- Decision: add a `scratchings_state_scheduler` keyed to Racing Australia state-specific interim/final release windows.
- Why: runner-set stability and pre-off uncertainty are time- and jurisdiction-dependent, including pending steward-approval states.
- Decision: add an `nsw_fee_surface_model` that normalizes expected costs by meeting tier and wager type.
- Why: Racing NSW fee tables explicitly vary by Standard/Premium/Premier meetings and by Totalizator-Derived-Odds vs other wagers.

## Provider comparison (incremental high-signal additions, pass 91)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `placeOrders` + `Additional Information` | Deterministic FOK behavior, `minFillSize`/VWAP-floor semantics, and min-size/min-payout stake-validity rules | Confluence version drift and region-specific enablement require version snapshots | A | Implement intent-policy and stake-rules engines before expanding automated order paths |
| Racing Australia `Scratching Release Information` | State-level interim/final scratchings windows and pending-approval caveats | Operational timings can change; needs scheduled refresh/version pinning | A | Add scratchings-state scheduler and runner-set stability features |
| Racing NSW race-field fee schedule | Meeting-tier and bet-type explicit fee gradients | Jurisdiction-specific and periodically revised | A | Add NSW fee-surface normalization into expected-net-edge and attribution |

## Data contract additions required (incremental, pass 91)

- `execution_intent_snapshot`:
- `order_id`, `event_ts`, `time_in_force`, `min_fill_size`, `price_vwap_floor`, `cancel_on_partial_flag`, `source_url`.
- `execution_intent_outcome`:
- `order_id`, `event_ts`, `matched_size_immediate`, `matched_vwap`, `kill_triggered_flag`, `residual_size`.
- `stake_validity_rule_snapshot`:
- `capture_ts`, `currency_code`, `order_type`, `min_bet_size`, `min_bet_payout`, `minimum_bsp_liability`, `jurisdiction_enabled_flag`, `source_url`.
- `scratchings_release_schedule_snapshot`:
- `capture_ts`, `state`, `interim_cutoff_local`, `final_cutoff_local`, `pending_steward_approval_possible_flag`, `source_url`.
- `runner_set_stability_event`:
- `market_id`, `event_ts`, `state`, `time_to_final_cutoff_sec`, `pending_approval_flag`, `queue_backlog_flag`, `stability_score`.
- `nsw_fee_surface_snapshot`:
- `capture_ts`, `meeting_tier`, `bet_type(tdo|other)`, `fee_rate_pct`, `clause_ref`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 91)

- What default policy should choose `FILL_OR_KILL` vs resting LIMIT by liquidity regime and seconds-to-post?
- Should `minFillSize` be strategy-static, or dynamically set by expected queue depth and slippage tolerance?
- For stake validation, do we source jurisdiction state from account profile, market regulator metadata, or both?
- How often should we refresh and diff Racing Australia scratchings windows to detect operational timing updates?
- Should NSW fee-surface changes immediately reprice historical strategy attribution, or be applied only prospectively from effective date?

## Ranked implementation backlog (delta, pass 91)

### P0 additions

1. Implement `execution_intent_policy_engine` with explicit FOK path (`minFillSize`, VWAP-floor, immediate-cancel semantics).
2. Implement `stake_validity_rules_engine` (currency min size + min payout + jurisdiction enablement) as a pre-trade hard gate.
3. Add `scratchings_state_scheduler` and bind runner-set stability to pre-off stake sizing/kill-switch logic.
4. Add `nsw_fee_surface_model` into expected-net-edge calculations and realized-cost attribution.
5. Add versioned snapshots for all three policy surfaces (Betfair order/stake rules, RA scratchings schedule, NSW fee schedule).

### P1 additions

1. Train `fok_fill_probability` and `vwap_floor_slippage_gap` diagnostics by market regime.
2. Add `stake_rejection_risk` monitoring to identify rule-config drift and prevent avoidable rejects.
3. Backtest CLV/PnL sensitivity to scratchings-window uncertainty and meeting-tier fee-surface differences.

## Sources for this update (pass 91)

- Betfair Exchange API Documentation, `placeOrders` (`FILL_OR_KILL`, `minFillSize`, VWAP-floor semantics, Min Bet Payout behavior; updated 2025-01-07; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Exchange API Documentation, `Additional Information` (`Currency Parameters`: Min Bet Size, Minimum BSP Liability, Minimum Bet Payout; last modified 2023-11-24 shown on captured version; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Racing Australia, `Scratching Release Information` (state/territory interim/final scratchings schedule and pending approval notes; accessed 2026-04-02): https://www.racingaustralia.horse/FreeFields/ScratchingReleaseInformation.aspx
- Racing NSW, `Race Field Fees - NSW Thoroughbred Races - for Australian Wagering Operators` (meeting-tier and bet-type fee schedule; accessed 2026-04-02): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/race-field-fees-nsw-thoroughbred-races-for-australian-wagering-operators/

## Incremental architecture decisions from this run (2026-04-02, pass 92)

- Decision: add an `expert_fee_regime_engine` with weekly state recomputation and rate/buffer transitions.
- Why: Betfair now runs profitability-based Expert Fee logic on a rolling 52-active-week window with qualification gates, dynamic buffer behavior, and explicit weekly charge timing.
- Decision: add an `implied_commission_basis_versioner` in cost attribution.
- Why: Betfair Expert Fee FAQ documents historical `3%` vs current `2.5%` implied-commission basis; backtests and live attribution need period-correct fee math.
- Decision: add a `provider_access_fidelity_guard` for onboarding/demo feeds.
- Why: BetMakers official demo scope is region/product constrained and explicitly delayed (`10s`), so using demo traces as production-equivalent will bias fill/edge estimates.

## Provider comparison (incremental high-signal additions, pass 92)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Charges + Expert Fee FAQ | Formal Expert Fee qualification gates, rolling 52-week basis, transition timeline from Premium Charge, dynamic buffer mechanics, implied-commission basis details | Support/terms wording can change; needs scheduled version snapshots and replay-safe formula versioning | A | Implement fee-regime engine + implied-commission basis versioner before scaling high-turnover production strategies |
| BetMakers API Demo Access page | Explicit demo coverage boundaries and declared `10s` price delay | Demo surface is intentionally non-production; unsuitable for latency-sensitive calibration without strong guards | A/B | Add provider-access fidelity guard and hard-fail production-grade evaluation on demo profiles |

## Data contract additions required (incremental, pass 92)

- `expert_fee_state_snapshot`:
- `account_id`, `activity_week_start`, `activity_week_end`, `last_52_active_week_gross_pnl_gbp`, `lifetime_gross_pnl_gbp`, `lifetime_markets_bet`, `expert_fee_rate_pct`, `buffer_gbp`, `buffer_basis`, `implied_commission_rate_pct`, `commission_generated_gbp`, `weekly_fee_due_gbp`, `source_url`.
- `fee_regime_transition_event`:
- `account_id`, `event_ts`, `from_regime(premium_charge|expert_fee|none)`, `to_regime`, `trigger_reason`, `rate_before_pct`, `rate_after_pct`, `buffer_before_gbp`, `buffer_after_gbp`.
- `implied_commission_basis_snapshot`:
- `capture_ts`, `basis_rate_pct`, `effective_from`, `effective_to`, `reference_doc_url`.
- `provider_access_profile_snapshot`:
- `provider_name`, `capture_ts`, `access_mode(demo|production)`, `racing_data_scope_regions`, `pricing_results_scope`, `form_history_scope`, `price_update_delay_sec`, `source_url`.
- `provider_fidelity_gate_event`:
- `event_ts`, `provider_name`, `access_mode`, `fidelity_status(pass|warn|fail)`, `blocking_reason`, `market_id`, `run_id`.

## Open questions to resolve before implementation freeze (incremental, pass 92)

- Should Expert Fee rate-state be forecast intraday for sizing, or only applied as a weekly settlement adjustment after official recalculation?
- What is the authoritative cadence for refreshing Betfair charge/FAQ snapshots to catch silent formula-text updates?
- For accounts with shared infrastructure, how should fee-state attribution be allocated across strategies when one account-level buffer/rate applies to many models?
- Do we hard-block all latency-sensitive backtests on `access_mode=demo`, or allow with explicit penalty labels and excluded KPI views?
- What minimum provider-fidelity threshold is required before promoting a strategy from research to paper/live execution?

## Ranked implementation backlog (delta, pass 92)

### P0 additions

1. Implement `expert_fee_regime_engine` with weekly recomputation, qualification gates, and deterministic fee/buffer math.
2. Add `implied_commission_basis_versioner` so replay/live net-edge attribution uses period-correct basis rates.
3. Build `fee_regime_transition_event` logging and wire it to strategy-level net-return dashboards.
4. Implement `provider_access_fidelity_guard` and block production-sensitive calibration on demo-labeled feeds.
5. Add configuration checks that fail CI/research runs when provider profile declares non-zero feed delay for latency-sensitive experiments.

### P1 additions

1. Train `buffer_depletion_hazard` and `rate_transition_risk` diagnostics for strategy capacity planning.
2. Build fee-regime stress tests across `0%/20%/40%` states to quantify strategy robustness after dynamic fee shifts.
3. Add an automated monitor that diffs Betfair charge/FAQ text snapshots and raises change-review tickets.

## Sources for this update (pass 92)

- Betfair support, `Betfair Charges` (Expert Fee terms, formulas, cadence, and charge structure context; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/betfair-charges
- Betfair support, `Expert Fee FAQs` (qualification/gating, 2025 transition timing, buffer mechanics, implied commission basis update, and examples; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/expert-fee-faqs
- BetMakers, `BetMakers API Demo Access` (demo scope boundaries and 10-second price-delay statement; accessed 2026-04-02): https://graphql.coreapi.gcpintau.tbm.sh/

## Incremental architecture decisions from this run (2026-04-02, pass 93)

- Decision: add a `venue_caw_participation_policy_registry`.
- Why: Keeneland now provides explicit, machine-usable CAW policy posture signals (no participant/wager-type restrictions, no special-odds treatment) that are distinct from cutoff-time controls.
- Decision: add a `venue_caw_affiliation_disclosure_registry`.
- Why: track-declared non-affiliation/non-ownership of CAW platforms is a separate governance dimension that should be queryable when evaluating venue comparability and concentration-risk assumptions.

## Provider comparison (incremental high-signal additions, pass 93)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Keeneland wagering-experience page (FAQ section) | Explicit CAW participation-policy and affiliation posture disclosures beyond simple odds-refresh/cutoff mechanics | Venue-authored policy page; requires periodic recapture for wording changes | A | Extend CAW regime model to include participation and affiliation dimensions before cross-venue policy transfer |

## Data contract additions required (incremental, pass 93)

- `venue_caw_participation_policy_snapshot`:
- `venue`, `capture_ts`, `restricts_by_participant_flag`, `restricts_by_wager_type_flag`, `special_odds_or_guaranteed_payout_flag`, `policy_text_hash`, `source_url`.
- `venue_caw_affiliation_disclosure_snapshot`:
- `venue`, `capture_ts`, `track_affiliated_with_caw_platform_flag`, `track_owns_caw_operation_flag`, `disclosure_text_hash`, `source_url`.
- `venue_policy_alignment_vector`:
- `venue`, `capture_ts`, `cutoff_minutes_to_post`, `pool_scope_code`, `participation_restriction_code`, `affiliation_posture_code`, `alignment_vector_version`.

## Open questions to resolve before implementation freeze (incremental, pass 93)

- What weighting should `venue_caw_policy_laxity_score` assign to non-restriction posture versus explicit cutoff-time controls?
- Should affiliation posture changes trigger automatic downweighting of historical policy-effect benchmarks until revalidated?
- What recrawl cadence is sufficient for venue FAQ policy pages that may change without formal release notes?

## Ranked implementation backlog (delta, pass 93)

### P0 additions

1. Implement `venue_caw_participation_policy_registry` and ingest machine-readable restriction posture fields per venue.
2. Implement `venue_caw_affiliation_disclosure_registry` with text-hash drift alerts.
3. Add `venue_policy_alignment_vector` computation and require it before cross-venue policy-prior transfer in model training.

### P1 additions

1. Backtest policy-transfer robustness after adding participation/affiliation dimensions to CAW regime states.
2. Add dashboard slices comparing restricted-venue vs open-participation venue late-odds behavior.
3. Build automated recapture checks for venue FAQ policy pages lacking explicit version metadata.

## Sources for this update (pass 93)

- Keeneland, `Wagering Experience` (FAQ entries on CAW participation restrictions, payout parity, and affiliation posture; accessed 2026-04-02): https://www.keeneland.com/wagering-experience

## Incremental architecture decisions from this run (2026-04-02, pass 94)

- Decision: add an `nsw_code_fee_surface_engine` with explicit code partition (`thoroughbred|greyhound|harness`) and formula routing (`gross_margin`, `turnover`, `gross_revenue`, `greater_of`, `cap`).
- Why: GRNSW and HRNSW source texts show materially different fee algebra and premium/cap mechanics that break single-rate NSW assumptions.
- Decision: add a `grnsw_calendar_compliance_guard` with separate monthly report (`+5 business days`) and payment (`+10 business days`) timers plus final-return/auditor-cert windows.
- Why: GRNSW conditions define concrete filing and payment cadences that should be machine-enforced to protect entitlement continuity.
- Decision: add an `nsw_cross_code_economics_normalizer` for strategy attribution.
- Why: code-specific fee surfaces (and betting-exchange vs turnover/gross-margin pathways) can dominate net-edge interpretation if not normalized consistently.

## Provider comparison (incremental high-signal additions, pass 94)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| GRNSW 2025-26 Standard Conditions (PDF) | Primary fee algebra (`17.5%` margin vs `2%` turnover greater-of rule), betting-exchange `25%` gross-revenue fee, explicit cap schedule, and hard monthly/annual reporting/payment gates | Jurisdiction/code specific; versioned legal text can update annually and requires snapshot diffing | A | Implement code-specific fee engine + compliance calendar guards before expanding NSW multi-code coverage |
| HRNSW race-fields page | Harness-specific fee and premium-meeting uplift summary plus annual approval-condition linkage | Web summary (not full condition PDF in this capture); requires follow-up direct PDF snapshot validation | A/B | Add provisional harness fee-surface profile and require primary-condition confirmation before production activation |

## Data contract additions required (incremental, pass 94)

- `nsw_code_fee_surface_snapshot`:
- `capture_ts`, `code(thoroughbred|greyhound|harness)`, `operator_class(australian|international)`, `bet_type`, `primary_calc_method`, `primary_rate_pct`, `alternative_calc_method`, `alternative_rate_pct`, `greater_of_rule_flag`, `maximum_fee_cap_pct`, `meeting_prize_threshold_aud`, `source_url`.
- `nsw_code_reporting_calendar_snapshot`:
- `capture_ts`, `code`, `monthly_report_due_business_days`, `monthly_payment_due_business_days`, `final_return_due_days_after_period_end`, `audit_certificate_due_days`, `source_url`.
- `nsw_code_fee_cap_snapshot`:
- `capture_ts`, `code`, `bet_type`, `cap_rate_pct`, `cap_trigger_type(meeting_prize_threshold|other)`, `cap_trigger_value`, `effective_from`, `source_url`.
- `nsw_code_entitlement_gate_snapshot`:
- `capture_ts`, `code`, `new_applicant_fee_aud`, `low_turnover_threshold_aud`, `refund_shortfall_rule_flag`, `source_url`.
- `nsw_cross_code_cost_attribution_event`:
- `event_ts`, `strategy_id`, `market_id`, `code`, `bet_type`, `raw_edge_bps`, `effective_fee_bps`, `net_edge_bps`, `formula_version`.

## Open questions to resolve before implementation freeze (incremental, pass 94)

- Should cross-code strategy allocation be hard-constrained by fee-surface-adjusted edge, or only reported as attribution diagnostics in early rollout?
- For HRNSW, do we block production use until direct condition-PDF parsing is captured, or allow provisional routing from published summary rates with reduced confidence?
- What policy should govern annual condition rollover detection (for example, auto-pause on unseen version hash vs grace window)?
- Should GRNSW monthly reporting/payment timers trigger immediate execution halt on breach risk, or staged degradation with manual override?

## Ranked implementation backlog (delta, pass 94)

### P0 additions

1. Implement `nsw_code_fee_surface_engine` with code + bet-type formula routing (`greater_of`, cap, and exchange gross-revenue paths).
2. Add `grnsw_calendar_compliance_guard` enforcing monthly report/payment and annual final/audit due-date states.
3. Build `nsw_cross_code_economics_normalizer` and require it in expected-net-edge and realized-cost attribution pipelines.
4. Add version-hash snapshots for GRNSW/HRNSW condition surfaces and alert on drift before model promotion.

### P1 additions

1. Ingest direct HRNSW approval-condition PDFs into the same parser path used for other state condition documents.
2. Add dashboards for `code_specific_effective_fee_rate`, `fee_cap_binding_frequency`, and `calendar_breach_risk`.
3. Run counterfactual backtests showing strategy rank changes under single-NSW-rate vs code-specific fee surfaces.

## Sources for this update (pass 94)

- GRNSW, `Race Fields Information Use` page (2025-26 conditions link and application-fee note; accessed 2026-04-02): https://www.grnsw.com.au/policies/wagering/race-fields-information-use
- GRNSW PDF, `2025-26 GRNSW RFIU Approval for Australian WSPs - Standard Conditions` (Version 1.1, 24 June 2025, effective 1 July 2025; accessed 2026-04-02): https://www.grnsw.com.au/attachments/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCRFgwblFFPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--03efde82ee1bbbf899d10010754aa579ec9c791d/2025-26%20GRNSW%20RFIU%20Approval%20for%20Australian%20WSPs%20-%20Standard%20Conditions%20.pdf
- HRNSW, `Race Fields and Corporate Wagering Operators` (harness fee structure summary and annual approval-condition links; accessed 2026-04-02): https://www.hrnsw.com.au/hrnsw/race-fields-and-corporate-wagering-operators

## Incremental architecture decisions from this run (2026-04-02, pass 95)

- Decision: add a `caw_legal_regime_monitor` that snapshots active CAW-related litigation state by jurisdiction and venue network.
- Why: the 2026-02-27 amended pleading in `Dickey et al.` expands claim scope and parties, creating a court-driven policy-risk channel that can alter CAW operating constraints independently of track-issued policy changes.
- Decision: add a `vic_scratching_economics_state_engine` keyed to rider-declaration stage and fee branch.
- Why: RV's effective-2026-02-01 scratching-fee model introduces explicit economic state transitions (`with rider`, `without rider`, `vet cert`) that likely influence late runner-set stability and wagering microstructure.

## Provider comparison (incremental high-signal additions, pass 95)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| EDNY CAW case filings (`Dickey` initial + amended complaint) plus docket snapshot | Concrete litigation-state timeline (`filed`, `amended`, pre-motion phase) and explicit claim-family expansion metadata | Pleadings are allegations, not adjudicated facts; aggregator mirrors can lag PACER | A/B | Treat as governance-regime telemetry (state/risk inputs), not as factual confirmation of CAW mechanics |
| Racing Victoria official scratching-fee release | Effective-dated fee-branch schedule tied to rider-declaration/vet-cert states, directly relevant to scratch timing incentives | Jurisdiction-specific and potentially revised seasonally | A | Add state-specific scratch-economics engine and bind to runner-set stability and late-liquidity features |

## Data contract additions required (incremental, pass 95)

- `caw_legal_regime_snapshot`:
- `capture_ts`, `case_id`, `court`, `complaint_version(initial|amended)`, `complaint_filed_date`, `named_plaintiff_count`, `named_defendant_count`, `claim_family_flags`, `pre_motion_status`, `next_event_date`, `source_url`.
- `caw_legal_regime_event`:
- `event_ts`, `case_id`, `event_type(complaint|amended_complaint|pre_motion_letter|conference_order|ruling)`, `jurisdiction`, `document_ref`, `source_tier(court|aggregator|media_mirror)`.
- `vic_scratching_fee_model_snapshot`:
- `capture_ts`, `effective_from`, `fee_with_rider_declared_aud_ex_gst`, `fee_without_rider_declared_aud_ex_gst`, `fee_with_vet_certificate_aud_ex_gst`, `fee_with_vet_cert_30d_standdown_aud_ex_gst`, `fee_picnic_aud_ex_gst`, `group_listed_rule_text`, `scope_flags`, `source_url`.
- `runner_set_economic_state_event`:
- `market_id`, `runner_id`, `event_ts`, `jurisdiction`, `rider_declared_flag`, `scratch_reason_class`, `applicable_scratch_fee_aud_ex_gst`, `time_to_jump_sec`.

## Open questions to resolve before implementation freeze (incremental, pass 95)

- Should `caw_legal_regime_state` directly throttle cross-jurisdiction policy transfer, or only adjust confidence weights in model promotion?
- What evidence threshold promotes a litigation-state event from `watch` to `actionable` (for example, amended complaint vs court ruling vs settlement/consent order)?
- For VIC scratchings, should rider-declaration-stage economics alter live stake sizing immediately, or only affect offline drift/feature weights until validated?
- Do we need separate scratch-economics branches for Group/Listed races where RV retains percentage-of-prizemoney treatment?

## Ranked implementation backlog (delta, pass 95)

### P0 additions

1. Implement `caw_legal_regime_monitor` with versioned case-state snapshots and event timeline ingestion.
2. Add `source_tier` lineage controls so court filings, aggregator dockets, and media mirrors are not treated as equivalent confidence.
3. Implement `vic_scratching_economics_state_engine` and inject fee-branch context into runner-set stability features.
4. Add replay support for effective-dated scratch-fee regimes (pre-2026-02-01 vs post-2026-02-01 VIC behavior).

### P1 additions

1. Run an event study on late-odds/runner-withdrawal behavior around VIC fee-regime activation date.
2. Build litigation-regime scenario tests (`no change`, `procedural escalation`, `adverse ruling`) for CAW-policy portability stress testing.
3. Add dashboard slices for `rider_declared_at_scratch_rate`, `applicable_scratch_fee_mix`, and `legal_regime_state` vs drift/CLV outcomes.

## Sources for this update (pass 95)

- First Amended Complaint PDF (`Case 2:25-cv-05962-JMA-JMW`, Document 53, filed 2026-02-27): https://pastthewire.com/wp-content/uploads/2026/03/2026-02-27-first-amended-complaint.pdf
- Initial Complaint PDF (`Dickey v. The Stronach Group, Inc. et al`, filed 2025-10-24): https://www.classaction.org/media/dickey-v-the-stronach-group-inc-et-al-complaint.pdf
- Justia docket summary (`Dickey v. The Stronach Group, Inc. et al`, 2:2025cv05962; includes last-retrieved timestamp and docket entries list): https://dockets.justia.com/docket/new-york/nyedce/2%3A2025cv05962/538025
- Racing Victoria official release, `New scratching fee model` (published 2025-11-30; effective from 2026-02-01): https://www.racingvictoria.com.au/news/2025/12/01/new-scratching-fee-model

## Incremental architecture decisions from this run (2026-04-02, pass 96)

- Decision: add a `betfair_rule_hierarchy_resolver` layer in execution/replay adjudication.
- Why: Betfair's formal rule precedence and discretionary market-management rights can override market-level guidance without API-schema changes.
- Decision: add a `provider_rights_and_automation_gate` in provider onboarding.
- Why: Racing Australia terms explicitly constrain permitted usage and prohibit automated scraping, so data-source eligibility must be rights-aware, not schema-only.
- Decision: add a `derived_content_provenance_registry` for silks/image artifacts.
- Why: Racing Australia publishing workflow indicates large-scale auto-generated derivative assets with jurisdiction exclusions (`Excluding WA`) that affect feature portability.

## Provider comparison (incremental high-signal additions, pass 96)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange Rules and Regulations | Canonical rule hierarchy, market-info precedence constraints, discretionary suspension rights, and post-load amendment boundaries | Rules text can change independently of API docs; strategy logic can silently drift if hierarchy not versioned | A | Implement rule-hierarchy resolver and periodic rules-text diffing as part of execution-contract governance |
| Racing Australia Website Terms + Privacy Notice + Publications | Rights perimeter (usage + automation constraints), multi-domain/PRA processing context, and derivative-content workflow metadata (silks image generation, WA exclusion) | Legal/policy text may update without API change notices; web-surface rights may diverge from feed licensing terms | A | Add rights-and-automation gate and provenance registry before scaling AU provider integrations and image-derived features |

## Data contract additions required (incremental, pass 96)

- `betfair_rule_hierarchy_snapshot`:
- `capture_ts`, `specific_over_general_flag`, `market_info_overrides_general_flag`, `override_phrase_exception_flag`, `suspension_discretion_flag`, `market_info_amendment_constraint_code`, `source_url`.
- `execution_governance_override_event`:
- `event_ts`, `market_id`, `strategy_id`, `trigger_type(rule_hierarchy_conflict|market_suspension|settlement_override)`, `pre_event_expected_state`, `resolved_state`, `resolver_version`, `source_url`.
- `provider_rights_policy_snapshot`:
- `capture_ts`, `provider_name`, `personal_noncommercial_only_flag`, `automated_scraping_prohibited_flag`, `jurisdiction_copyright_owner_map`, `permission_contact_path`, `source_url`.
- `provider_operating_scope_snapshot`:
- `capture_ts`, `provider_name`, `multi_domain_footprint`, `pra_processing_flag`, `domain_count`, `source_url`.
- `derived_content_provenance_snapshot`:
- `capture_ts`, `provider_name`, `content_type`, `auto_generated_from_text_flag`, `jurisdiction_exclusion_map`, `asset_count_estimate`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 96)

- Should `betfair_rule_hierarchy_resolver` hard-stop execution on rule ambiguity, or continue with degraded-confidence mode plus audit flag?
- What recapture cadence is sufficient for Betfair rules text (daily hash check vs event-triggered only)?
- For Racing Australia sources, do we require explicit written permission artifacts in lineage before any non-personal/non-manual usage path is enabled?
- How should `Excluding WA` derivative-content constraints be represented when generating national silks/image features?

## Ranked implementation backlog (delta, pass 96)

### P0 additions

1. Implement `betfair_rule_hierarchy_resolver` and bind it into replay/live settlement adjudication.
2. Add `provider_rights_and_automation_gate` to block prohibited web-surface automation paths by policy.
3. Implement `execution_governance_override_event` logging for suspension/hierarchy-driven state changes.
4. Build policy-text hash monitoring for Betfair rules and Racing Australia terms/privacy pages.

### P1 additions

1. Implement `derived_content_provenance_registry` for jockey-silks/image artifacts with jurisdiction exclusions.
2. Add dashboards for `rights_friction_score`, `governance_override_rate`, and `policy_text_drift_events`.
3. Run backtests with and without governance/rights gating to quantify edge overstatement risk from unconstrained assumptions.

## Sources for this update (pass 96)

- Betfair, `Exchange Rules and Regulations` (rule hierarchy, market management discretion, and settlement governance details; accessed 2026-04-02): https://www.betfair.com.au/AUS_NZL/aboutUs/Rules.and.Regulations/
- Racing Australia, `Website Terms of Use` (rights, usage, and automation restrictions; updated May 2021; accessed 2026-04-02): https://www.racingaustralia.horse/AboutUs/website-terms-of-use.aspx
- Racing Australia, `Privacy Collection Notice` (multi-domain operating footprint and PRA processing context; accessed 2026-04-02): https://www.racingaustralia.horse/AboutUs/privacy-collection-notice.aspx
- Racing Australia, `Publications` (jockey silks image database scale and automated generation workflow; accessed 2026-04-02): https://www.racingaustralia.horse/AboutUs/Publishing.aspx

## Incremental architecture decisions from this run (2026-04-02, pass 97)

- Decision: add a `pool_regime_router` that resolves economics/rules at `meeting x pool_type` granularity (`local` vs `outbound` commingling).
- Why: HKJC documents that governing rulebook and rebate applicability diverge by pool type within the same simulcast meeting.
- Decision: add a `threshold_policy_controller` with regime-aware probability-floor selection and replay-gated promotion.
- Why: Chapman's 2,000-race extension reports large return differences under a low-probability exclusion threshold (`p < 0.04`), indicating threshold policy is a first-order control variable.

## Provider comparison (incremental high-signal additions, pass 97)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| HKJC outbound-commingling page | Explicit pool-level regime fork (local vs outbound), governing-rulebook switch (PMU vs HK rules), and rebate applicability split by pool type | Venue-specific (HK) and product-specific context; transfer to AU requires normalization | A | Implement `pool_regime_router` and pool-level economics schema before cross-pool strategy expansion |
| RePEc/World Scientific chapter metadata for Chapman (2008) | Post-Bolton holdout-study summary: 20-variable logit on 2,000 races with threshold-conditioned return claim | Abstract-level access only in this run (full chapter paywalled); needs replication on our data before policy lock | A/B | Add threshold-policy experiments as mandatory pre-promotion gate, with sample-fragility controls |

## Data contract additions required (incremental, pass 97)

- `pool_regime_snapshot`:
- `capture_ts`, `meeting_id`, `jurisdiction`, `pool_type`, `commingling_mode`, `partner_operator`, `partner_rulebook`, `rebate_applicable_flag`, `effective_from`, `source_url`.
- `pool_economics_route_event`:
- `event_ts`, `strategy_id`, `market_id`, `pool_type`, `selected_regime_id`, `pre_fee_edge_bps`, `post_fee_edge_bps`, `rebate_path`, `rulebook_path`.
- `threshold_policy_experiment`:
- `capture_ts`, `strategy_id`, `dataset_window`, `threshold_variable`, `threshold_value`, `sample_count`, `holdout_return_pct`, `calibration_delta`, `clv_delta`, `promotion_decision`.
- `threshold_policy_lineage`:
- `effective_from`, `effective_to`, `policy_version`, `selection_logic`, `uncertainty_haircut_rule`, `rollback_trigger`, `source_reference`.

## Open questions to resolve before implementation freeze (incremental, pass 97)

- Should `pool_regime_router` hard-block execution when regime metadata is missing for a pool, or fall back to conservative no-rebate defaults?
- How do we encode commingling-rulebook precedence in replay when a meeting contains both local and outbound pools with different settlement semantics?
- What minimum holdout sample size should gate `threshold_policy_controller` promotions to avoid fragile high-return thresholds?
- Do we use one global threshold-policy family for AU rollout, or jurisdiction-specific policies with explicit transfer penalties?

## Ranked implementation backlog (delta, pass 97)

### P0 additions

1. Implement `pool_regime_router` and require it in all EV/post-cost calculations.
2. Add `pool_regime_snapshot` ingestion with effective-date versioning and source-hash monitoring.
3. Implement `threshold_policy_controller` with replay-based promotion gates and rollback triggers.
4. Add audit checks that block mixed-regime pooling assumptions (for example, applying local rebate logic to outbound pools).

### P1 additions

1. Build pool-regime stress tests comparing local-only vs mixed-commingling cards.
2. Run threshold sensitivity sweeps around low-probability cutoffs and track sample fragility metrics.
3. Add dashboards for `regime_routing_mismatch_rate`, `threshold_policy_drift`, and `sample_fragility_alerts`.

## Sources for this update (pass 97)

- Hong Kong Jockey Club, `Outbound Commingling` (pool merge/rulebook/rebate applicability mechanics; accessed 2026-04-02): https://campaigns.hkjc.com/outbound-commingling/en/
- IDEAS/RePEc entry for Randall G. Chapman chapter in *Efficiency Of Racetrack Betting Markets* (abstract metadata and threshold result summary; accessed 2026-04-02): https://ideas.repec.org/h/wsi/wschap/9789812819192_0018.html

## Incremental architecture decisions from this run (2026-04-02, pass 98)

- Decision: add a `bsp_projection_quality_guard` that classifies `nearPrice`/`farPrice` into finite vs non-finite states and tracks projection staleness.
- Why: Betfair `StartingPrices` fields are cached at 60-second intervals and explicitly permit `INF/-INF/NaN`, so naive numeric ingestion can corrupt BSP feature calibration.
- Decision: add a `projection_weight_scheduler` that plans BSP + EX projection bundles under the 200-point request budget before dispatch.
- Why: Betfair request-limit tables assign non-trivial weights to `SP_AVAILABLE` and `SP_TRADED`, and projection combinations can sharply reduce safe market fan-out.

## Provider comparison (incremental high-signal additions, pass 98)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `Betting Type Definitions` (`StartingPrices`) | Primary semantics for BSP projection vs reconciled fields (`nearPrice`, `farPrice`, `actualSP`, SP matched amounts), with cache cadence and non-finite numeric allowance | Older versioned page surface; must monitor for schema wording drift in current versions | A | Build BSP quality-state ingestion and leakage-safe separation of projected vs reconciled features |
| Betfair `Market Data Request Limits` (updated 2025-05-21) | Explicit request-weight matrix including BSP projections and combo/depth effects used to compute safe per-request market fan-out | Limits can change over time; requires periodic source-hash/version recapture | A | Implement deterministic projection-weight scheduler and reject unplanned overweight request shapes |

## Data contract additions required (incremental, pass 98)

- `bsp_projection_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `near_price_raw`, `far_price_raw`, `numeric_state`, `cache_interval_sec_doc`, `seconds_since_last_projection_update`, `market_reconciled_flag`, `actual_sp`, `back_stake_taken`, `lay_liability_taken`.
- `bsp_projection_quality_event`:
- `event_ts`, `market_id`, `selection_id`, `quality_state(finite|inf|neg_inf|nan|stale)`, `time_to_jump_sec`, `action(downweight|drop|keep)`.
- `projection_weight_plan`:
- `capture_ts`, `projection_set`, `includes_sp_available_flag`, `includes_sp_traded_flag`, `weight_total`, `projected_market_id_count`, `projected_weight_product`, `weight_margin_to_limit`, `shape_strategy`.
- `collector_shape_audit`:
- `event_ts`, `request_id`, `planned_weight_product`, `actual_weight_product`, `split_count`, `overweight_blocked_flag`, `error_code`.

## Open questions to resolve before implementation freeze (incremental, pass 98)

- What staleness threshold should mark BSP projections as non-actionable in late pre-off windows (for example, `>30s` vs `>60s`) for each market class?
- Should non-finite BSP projections (`INF/-INF/NaN`) be hard-dropped from model features, or retained as categorical regime states with calibrated priors?
- Do we run a dedicated BSP collector profile separate from EX ladder collection to protect fan-out under the 200-point limit?
- What alert threshold on `projection_weight_margin` should trigger automatic collector shape simplification before freshness degradation propagates to execution?

## Ranked implementation backlog (delta, pass 98)

### P0 additions

1. Implement `bsp_projection_quality_guard` with strict finite/non-finite classification and staleness tracking.
2. Add leakage-safe feature split between projected BSP fields and post-reconciliation BSP outcome fields.
3. Implement `projection_weight_scheduler` that computes/validates request shape (`sum(weight) * markets <= 200`) before API dispatch.
4. Add `collector_shape_audit` and block overweight request plans in both live and replay collectors.

### P1 additions

1. Run calibration studies for finite vs non-finite BSP projection states and publish reliability curves.
2. Backtest strategy sensitivity to projection staleness bins (`0-15s`, `15-30s`, `30-60s`, `>60s`).
3. Add dashboards for `bsp_quality_state_mix`, `projection_weight_margin`, and `overweight_block_rate`.

## Sources for this update (pass 98)

- Betfair Exchange API Documentation, `Betting Type Definitions` (`StartingPrices` fields including `nearPrice`, `farPrice`, cache cadence, non-finite numeric support, and reconciled BSP fields; versioned page capture): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2687465&pageVersion=131
- Betfair Exchange API Documentation, `Market Data Request Limits` (updated 2025-05-21; weighting formula and `SP_AVAILABLE`/`SP_TRADED` costs): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687478/Market%2BData%2BRequest%2BLimits

## Incremental architecture decisions from this run (2026-04-02, pass 99)

- Decision: add a `projection_override_contract_guard` in Betfair market-data ingestion and execution config validation.
- Why: Betfair documents unsupported rollup branches and bounded depth/default semantics in `ExBestOffersOverrides`, so unsupported/assumed-active settings must be blocked before runtime.
- Decision: add an `execution_field_completeness_layer` for async and market-type-aware null handling.
- Why: `averagePriceMatched`/`sizeMatched` can be null for async paths and not meaningful for LINE markets, so fill/quality metrics need contextual completeness logic.
- Decision: add an `artifact_authorship_and_lineage_gate` for AU provider data promotion.
- Why: Punting Form worksheets and user endpoints mix provider defaults with user-customized artifacts and explicitly reference BetMakers-synced market odds, requiring source-chain tagging before model use.

## Provider comparison (incremental high-signal additions, pass 99)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `Betting Type Definitions` (`ExBestOffersOverrides` + execution-field notes) | Primary override-contract semantics (depth caps/defaults, unsupported rollup branches, async/LINE-market nullability) | Contract behavior can drift by page version; unsupported fields are easy to misconfigure silently | A | Implement override-contract guardrails and nullability-aware execution metrics before expanding depth/rollup strategies |
| Punting Form Worksheets + User API docs | Explicit mixed authorship surfaces (default vs user-customized) and upstream market-sync dependency attribution (BetMakers) with Starter-tier access on user endpoints | User-authored overlays can leak subjective edits into training; upstream sync dependency may be unstated in raw payloads | A | Enforce authorship/lineage tagging and keep user-layer artifacts out of baseline production models by default |

## Data contract additions required (incremental, pass 99)

- `projection_override_contract_snapshot`:
- `capture_ts`, `provider`, `best_prices_depth_default`, `best_prices_depth_max`, `rollup_model_default`, `rollup_limit_default_policy`, `rollover_stakes_supported_flag`, `rollup_liability_threshold_supported_flag`, `rollup_liability_factor_supported_flag`, `source_url`.
- `execution_field_completeness_event`:
- `event_ts`, `order_id`, `market_id`, `market_type`, `async_order_flag`, `average_price_matched_present_flag`, `size_matched_present_flag`, `line_market_meaningful_avg_price_flag`, `completeness_state`.
- `provider_artifact_authorship_snapshot`:
- `capture_ts`, `provider`, `artifact_type`, `variant_type(default|user_customized)`, `entitlement_tier_min`, `upstream_market_sync_provider`, `edge_display_flag`, `source_url`.
- `feature_lineage_chain_snapshot`:
- `feature_id`, `provider_chain`, `authorship_class`, `sync_dependency`, `lineage_confidence`, `effective_from`, `effective_to`.

## Open questions to resolve before implementation freeze (incremental, pass 99)

- Should unsupported Betfair rollup branches be hard-error at config compile time, or downgraded to warnings with forced fallback to supported defaults?
- What minimum completeness threshold should gate execution-model training when async/LINE-market nullability increases missing `averagePriceMatched`/`sizeMatched` rates?
- For Punting Form user-layer artifacts, do we allow any usage in production alpha models, or restrict to analyst tooling and challenger-only experiments?
- How frequently should lineage snapshots be recaptured to detect upstream dependency changes (for example, if worksheet sync attribution changes)?

## Ranked implementation backlog (delta, pass 99)

### P0 additions

1. Implement `projection_override_contract_guard` with startup validation for depth/default/support flags.
2. Add `execution_field_completeness_layer` and block naive zero-imputation of async/LINE-market null fields.
3. Implement `provider_artifact_authorship_snapshot` ingestion and block user-customized artifacts from baseline model training by default.
4. Add `feature_lineage_chain_snapshot` persistence with upstream-provider chain fields (including BetMakers dependency where declared).

### P1 additions

1. Build completeness-aware fill-quality dashboards segmented by `async_order_flag` and market type.
2. Run ablations comparing provider-curated-only features vs mixed user-layer features to quantify leakage risk.
3. Add contract-drift alerts when Betfair override-support semantics or Punting Form authorship/lineage wording changes.

## Sources for this update (pass 99)

- Betfair Exchange API Documentation, `Betting Type Definitions` (`ExBestOffersOverrides` depth/default semantics, unsupported rollup branches, and async/LINE-market field behavior; versioned page capture): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2687465&pageVersion=131
- Punting Form Guides, `Worksheets` (user-rated vs neural default pricing and BetMakers market-sync attribution): https://docs.puntingform.com.au/docs/worksheets-1
- Punting Form API Reference, `Speedmaps` (`/v2/User/Speedmaps` default vs user-customized response behavior and Starter+ availability): https://docs.puntingform.com.au/reference/speedmaps

## Incremental architecture decisions from this run (2026-04-02, pass 100)

- Decision: add a `provider_event_lifecycle_collector` for BetMakers widget-driven execution events.
- Why: BetMakers documents explicit event names and failure payloads (`status`, `message`) that are not recoverable from settlement-only ingestion.
- Decision: add a `provider_status_normalization_engine` with refund-aware canonical mapping.
- Why: BetMakers status semantics include intermediate and refund states (`processing`, `pending`, `partially-refunded`, `fully-refunded`, `unsettled`) that require deterministic mapping before PnL and CLV attribution.
- Decision: add a `product_family_semantics_registry` keyed by provider product code.
- Why: BetMakers product taxonomy spans tote/fixed/operator variants, and examples show `odds` can be null for exotics, so payout/feature logic must be product-aware.

## Provider comparison (incremental high-signal additions, pass 100)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| BetMakers Web SDK `Events` | Event-level execution lifecycle and failure telemetry (`bm.event.*`, `bm.state.betslip`, host state events, structured failure payload) | Widget-surface contract; must align with backend/Core API semantics before hard production reliance | A/B | Implement provider event-lifecycle collector and failure-class attribution before scaling mixed-provider execution |
| BetMakers Web SDK `Bet Types` | Explicit bet status enums, product-code taxonomy, and null-odds examples for exotics | Documentation-surface contract may evolve; needs periodic schema/version recapture | A/B | Implement status normalization + product-family registry and enforce odds-null-safe settlement logic |

## Data contract additions required (incremental, pass 100)

- `provider_widget_event`:
- `event_ts`, `provider`, `session_id`, `event_name`, `payload_status_code`, `payload_message`, `bet_payload_ref`, `balance_refetch_triggered_flag`.
- `provider_event_sequence_audit`:
- `capture_ts`, `provider`, `session_id`, `betslip_state_seen_flag`, `placed_or_failed_seen_flag`, `missing_transition_flag`, `sequence_gap_ms`.
- `provider_bet_status_contract_snapshot`:
- `capture_ts`, `provider`, `status_enum_json`, `null_odds_allowed_flag`, `product_enum_json`, `source_url`.
- `provider_bet_lifecycle_event`:
- `event_ts`, `provider`, `bet_id`, `status`, `product`, `odds_present_flag`, `refund_state`, `canonical_status`.
- `product_family_semantics_snapshot`:
- `capture_ts`, `provider`, `product_code`, `product_family`, `odds_expected_flag`, `settlement_path`, `effective_from`, `effective_to`.

## Open questions to resolve before implementation freeze (incremental, pass 100)

- Should `provider_event_lifecycle_collector` be a hard dependency for live trading, or optional telemetry during initial paper mode?
- What canonical state machine should map BetMakers `processing/pending/unresulted/unsettled` into internal execution states without losing auditability?
- For product codes with null odds semantics, do we calculate expected payout from product-specific dividend feeds only, or defer EV until settlement/dividend confirmation?
- What recapture cadence should we use for BetMakers Web SDK docs to detect enum/event drift before it breaks normalization?

## Ranked implementation backlog (delta, pass 100)

### P0 additions

1. Implement `provider_event_lifecycle_collector` and persist BetMakers `bm.event.*` plus `bm.state.betslip` events with session IDs.
2. Build `provider_status_normalization_engine` with explicit refund/intermediate-state mapping and canonical-status outputs.
3. Add `product_family_semantics_registry` and block payout logic that assumes odds are always present.
4. Add sequence-audit checks that alert on missing bet lifecycle transitions (for example, missing placed/failure after betslip update).

### P1 additions

1. Build dashboards for `provider_pre_exchange_failure_rate`, `refund_state_mix`, and `sequence_gap_ms` by product family.
2. Run attribution studies comparing settlement-only vs event-aware execution logs to quantify hidden failure undercount.
3. Add schema-drift monitors for BetMakers event/status/product enums with automated changelog triage.

## Sources for this update (pass 100)

- BetMakers Docs, `Events` (host/widget event taxonomy and bet placement/failure payload contracts; accessed 2026-04-02): https://docs.betmakers.com/docs/web/events/index.html
- BetMakers Docs, `Bet Types` (status/product enums and exotic null-odds examples; accessed 2026-04-02): https://docs.betmakers.com/docs/web/bet_types/index.html

## Incremental architecture decisions from this run (2026-04-02, pass 101)

- Decision: add a `caw_policy_docket_monitor` for CHRB agenda/report surfaces.
- Why: CHRB publishes recurring governance artifacts (including ADW market-access-fee review agenda items and CAW-focused report links), so CAW policy state should be tracked as a structured time series.
- Decision: add a `provider_result_source_contract_layer` for BetMakers Core API result joins.
- Why: BetMakers explicitly scopes SP/Top-Fluc retrieval to source `OP`, so result lineage must be explicit before settlement and feature joins.
- Decision: add a `provider_transport_compatibility_guard` in ingestion infrastructure.
- Why: BetMakers currently does not support `graphql-transport-ws`, and stream/query throttling asymmetry changes reconnect/catch-up risk.

## Provider comparison (incremental high-signal additions, pass 101)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB meeting agendas + reports pages | Primary, dated governance publication channel for CAW/ADW policy discussions and formal CAW report tracking | Publication feed signals policy process, not immediate enacted-rule text; requires downstream status classification | A | Build CHRB policy-docket monitor and treat agenda/report events as regime-state inputs |
| BetMakers Core API FAQ | Contract details for result-source lineage (`OP` for SP/Top Fluc), websocket support boundary, and stream/query load asymmetry | FAQ-level contract surface may drift; needs periodic recapture and validation in live integration tests | A/B | Implement result-source registry + transport compatibility guard before broader provider-result automation |

## Data contract additions required (incremental, pass 101)

- `caw_policy_docket_snapshot`:
- `capture_ts`, `regulator`, `page_type`, `document_date`, `document_title`, `topic_flags`, `action_language_present_flag`, `source_url`.
- `caw_policy_regime_event`:
- `event_ts`, `regulator`, `state_transition(quiet|agenda_flagged|active_review|post_decision)`, `document_ref`, `confidence`, `source_url`.
- `provider_result_source_snapshot`:
- `capture_ts`, `provider`, `metric_family`, `required_result_source`, `source_url`.
- `provider_transport_contract_snapshot`:
- `capture_ts`, `provider`, `websocket_protocol`, `graphql_transport_ws_supported_flag`, `subscription_throttle_state`, `query_rate_limit_per_sec`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 101)

- What confidence threshold should move CHRB docket events from `agenda_flagged` to `active_review` in automated risk controls?
- Should CHRB docket monitoring be US-only CAW telemetry, or should it feed global venue-policy transfer penalties by default?
- For BetMakers `results(sources:["OP"])`, do we hard-fail SP/Top-Fluc feature generation when source tags are missing, or fallback with low-confidence tagging?
- What CI cadence should validate websocket compatibility assumptions while `graphql-transport-ws` remains unsupported?

## Ranked implementation backlog (delta, pass 101)

### P0 additions

1. Implement `caw_policy_docket_monitor` for CHRB agenda/report pages with dated snapshot persistence and topic tagging.
2. Build `provider_result_source_contract_layer` and require source-lineage validation for SP/Top-Fluc joins.
3. Add `provider_transport_compatibility_guard` with protocol-contract smoke tests and fail-closed behavior on drift.
4. Add regime-state alerts for CHRB policy publication events that touch CAW or ADW market-access economics.

### P1 additions

1. Run event studies around CHRB publication dates vs late-odds volatility/pool concentration.
2. Build dashboards for `policy_docket_event_rate`, `result_source_contract_breach_rate`, and `transport_contract_drift_events`.
3. Simulate stream/query outage-recovery under BetMakers asymmetric throttling to tune catch-up budgets.

## Sources for this update (pass 101)

- California Horse Racing Board, `Meeting Agendas, Packages, and Transcripts` (including Jan 14, 2026 ADW market-access-fee agenda item; accessed 2026-04-02): https://www.chrb.ca.gov/meeting_agendas.shtml
- California Horse Racing Board, `Reports` (contains `Questions and Answers Regarding Computer Assisted Wagering`; accessed 2026-04-02): https://www.chrb.ca.gov/reports.html
- BetMakers Docs, `Core API FAQ` (SP/Top-Fluc source `OP`, protocol support, and query/subscription throttling guidance; accessed 2026-04-02): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental architecture decisions from this run (2026-04-02, pass 102)

- Decision: add a `grn_reporting_control_plane` with deadline-state tracking and batch-atomicity safeguards.
- Why: BetMakers GRN Reporting docs define strict upload windows (`within 24h` of last race, local timezone), single-race request boundaries, and whole-batch rejection semantics.
- Decision: add `provider_environment_contract_guard` across ingestion and model-evaluation pipelines.
- Why: BetMakers Core API introduction explicitly limits INT test coverage (QLD racing + VIC Tote) and caps query result size at 4MB, so environment portability assumptions must be explicit.
- Decision: add `query_backfill_before_resubscribe` as mandatory reconnect choreography in provider stream handlers.
- Why: BetMakers troubleshooting guidance recommends requerying latest race data after subscription drops before re-establishing subscriptions.

## Provider comparison (incremental high-signal additions, pass 102)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| BetMakers GRN Reporting `Introduction` | Primary reporting-upload contract: per-race batching limits (`<=1000`), batch atomic rejection behavior, deadline timing, endpoint version split (`uploadRace`/`uploadRaceV2`) | Documentation-level contract; integration must validate exact production behavior and timezone handling per operator context | A/B | Build GRN control-plane with deadline-state tracking, payload-hash auditability, and atomic-failure retry lanes |
| BetMakers Core API `Introduction` + `Troubleshoooting` | Explicit INT/UAT scope and query-size limits plus reconnect recovery runbook (`query latest` then resubscribe) | Test scope is non-production-representative; reconnect guidance is necessary but not sufficient without observed SLOs | A/B | Enforce environment-contract tagging and requery-first reconnect runbook before broader provider dependence |

## Data contract additions required (incremental, pass 102)

- `grn_upload_contract_snapshot`:
- `capture_ts`, `provider`, `max_bets_per_batch`, `single_meeting_race_required_flag`, `batch_atomic_reject_flag`, `upload_deadline_hours_from_last_race`, `deadline_timezone_rule(local_operator_tz)`, `endpoint_v1`, `endpoint_v2`, `source_url`.
- `grn_upload_attempt`:
- `event_ts`, `meeting_id`, `race_number`, `bet_count`, `valid_bet_count`, `rejected_entire_batch_flag`, `deadline_state`, `payload_hash`, `retry_count`, `final_outcome`.
- `provider_environment_contract_snapshot`:
- `capture_ts`, `provider`, `environment`, `scope_constraints_json`, `query_result_size_limit_mb`, `auth_mode`, `source_url`.
- `provider_stream_recovery_event`:
- `event_ts`, `provider`, `environment`, `disconnect_cause`, `backfill_query_run_flag`, `resubscribe_attempt_count`, `resubscribe_success_flag`, `recovery_latency_ms`.

## Open questions to resolve before implementation freeze (incremental, pass 102)

- Do we enforce hard segmentation of INT/UAT-derived features from production model training, or allow controlled challenger usage with environment penalties?
- What batch-sizing strategy minimizes whole-batch rejection risk under GRN atomicity (for example fixed-size vs complexity-aware splitting)?
- Should late or failed GRN uploads trigger automated compliance escalation immediately, or after bounded retry windows?
- What maximum reconnect latency is acceptable when `query_backfill_before_resubscribe` is enforced during high-cardinality race periods?

## Ranked implementation backlog (delta, pass 102)

### P0 additions

1. Implement `grn_reporting_control_plane` with deadline-state tracking, batch-atomicity checks, and payload-hash audit archive.
2. Add `provider_environment_contract_guard` so INT/UAT-scope constraints and 4MB query-size contracts are explicit in ingestion/replay/training metadata.
3. Implement mandatory `query_backfill_before_resubscribe` runbook in BetMakers stream connectors with fail-closed alerts when skipped.
4. Add `grn_upload_attempt` monitoring and compliance alerts for `late` or repeated whole-batch rejection outcomes.

### P1 additions

1. Run sensitivity tests on GRN batch partitioning policies to reduce atomic rejection probability.
2. Build environment-portability diagnostics comparing INT/UAT distributions vs production for key feature families.
3. Add recovery-quality dashboards (`disconnect_cause_mix`, `backfill_before_resubscribe_rate`, `recovery_latency_ms`, `resubscribe_success_rate`).

## Sources for this update (pass 102)

- BetMakers Docs, `GRN Reporting - Introduction` (batch limits, deadline and endpoint semantics, field/status definitions; accessed 2026-04-02): https://docs.betmakers.com/docs/grnr/introduction/index.html
- BetMakers Docs, `Core API - Introduction` (INT scope restrictions, 4MB query limit, UAT credential mode; accessed 2026-04-02): https://docs.betmakers.com/docs/core-api/introduction/index.html
- BetMakers Docs, `Core API - Troubleshoooting` (disconnect causes and query-backfill-before-resubscribe guidance; accessed 2026-04-02): https://docs.betmakers.com/docs/core-api/troubleshooting/index.html

## Incremental architecture decisions from this run (2026-04-02, pass 103)

- Decision: add a `tote_visibility_latency_model` for tote-linked market analysis and reporting.
- Why: the CHRB-linked CAW Q&A provides explicit multi-stage timing (pool-close ingest plus compute/publish lag) and last-minute CAW/non-CAW mix context that should be represented as separate states.
- Decision: add a `stream_scope_and_pairing_guard` in Betfair stream ingestion.
- Why: Betfair support explicitly states OCM and MCM are not guaranteed to be pair-matched and wildcard subscriptions can emit all activated markets with `img=true` snapshots.
- Decision: add a `mixed_lineage_payload_splitter` for Australian wholesaler feeds.
- Why: wholesaler-channel evidence shows official Racing Australia materials and proprietary overlays may be delivered via a single provider API surface.

## Provider comparison (incremental high-signal additions, pass 103)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB-linked `Computer Assisted Wagering Q&A` PDF | Concrete CAW handle-mix percentages, last-60s flow composition, and tote timing pipeline estimates useful for regime priors | Document is a submitted Q&A artifact under regulator report links, not a universal rulebook; venue/jurisdiction transfer risk | A/B | Add venue-scoped `tote_visibility_latency_model` and avoid attributing all post-jump movement to one cause |
| Betfair support (`OCM/MCM matching`, `no market filter`, `con=true`, `clk/pt`) | Direct stream-operability constraints on sequencing, conflation causes, and wildcard subscription behavior | Support-article contracts can evolve; requires version recapture and regression tests | A | Implement stream scope guardrails, `clk` continuity checks, and probabilistic OCM/MCM attribution |
| BetMakers wholesaler announcement (2025-06-20) | Explicit statement that CoreAPI can package official RA materials alongside proprietary products (Punting Form/Racelab) | Vendor-authored source and promotional framing; still needs contract-level confirmation in commercial terms | B | Enforce ingest-time lineage split (`official` vs `proprietary`) and baseline-model reproducibility controls |

## Data contract additions required (incremental, pass 103)

- `tote_visibility_latency_snapshot`:
- `capture_ts`, `jurisdiction`, `track_code`, `stop_to_ingest_sec_low`, `stop_to_ingest_sec_high`, `compute_publish_sec_low`, `compute_publish_sec_high`, `final_odds_known_sec_low`, `final_odds_known_sec_high`, `source_url`.
- `late_money_mix_snapshot`:
- `capture_ts`, `track_code`, `sample_window_desc`, `caw_pool_share_pct`, `caw_last_60s_share_pct`, `non_caw_last_60s_share_pct`, `source_url`.
- `stream_scope_audit`:
- `event_ts`, `provider`, `market_filter_present_flag`, `app_key_scope_market_count`, `new_market_img_event_count`, `wildcard_blocked_flag`.
- `stream_pairing_uncertainty_event`:
- `event_ts`, `market_id`, `ocm_seq_id`, `mcm_seq_id`, `pairing_confidence`, `clk`, `pt`, `con_flag`, `conflate_ms`.
- `provider_payload_lineage_snapshot`:
- `capture_ts`, `provider`, `channel`, `material_class(official_ra|proprietary_overlay)`, `content_family`, `proprietary_product_tag`, `lineage_confidence`, `effective_from`, `effective_to`.

## Open questions to resolve before implementation freeze (incremental, pass 103)

- What prior distribution should we use for `tote_visibility_latency_state` by venue when no direct venue audit exists?
- Should wildcard market subscriptions be blocked at config-compile time, or allowed only in explicitly tagged diagnostic sessions?
- What minimum `pairing_confidence` threshold is required before OCM/MCM-derived features are allowed into live execution decisions?
- For mixed provider payloads, do we require field-level lineage or is table-level lineage sufficient for initial production controls?

## Ranked implementation backlog (delta, pass 103)

### P0 additions

1. Implement `stream_scope_and_pairing_guard` (mandatory market filters, `clk` continuity checks, and explicit OCM/MCM pairing-confidence output).
2. Add `tote_visibility_latency_snapshot` and `late_money_mix_snapshot` tables, and wire them into venue-specific risk regimes.
3. Add `mixed_lineage_payload_splitter` and block baseline model training on unclassified mixed-source fields.
4. Add runtime alerting for `con=true` spikes tied to socket-backlog and conflate settings, with automatic degradation of latency-sensitive execution.

### P1 additions

1. Run event studies partitioning late-odds movement into money-mix versus visibility-latency components.
2. Build dashboards for `wildcard_subscription_block_rate`, `ocm_mcm_pairing_confidence_distribution`, and `conflation_pressure`.
3. Perform ablation tests comparing `official_ra_only` features against `official_plus_proprietary` mixes for stability and compliance risk.

## Sources for this update (pass 103)

- California Horse Racing Board linked report, `Computer Assisted Wagering Question & Answer` (dated 2024-09-05; handle mix and tote timing details; accessed 2026-04-02): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair support, `How can I match OCM and MCM messages from the Stream API?` (independent systems and no guaranteed match key; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000391312-How-can-I-match-OCM-and-MCM-messages-from-the-Stream-API
- Betfair support, `What happens if you subscribe to the Stream API without a market filter?` (wildcard scope and `img=true` behavior; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair support, `Why am I receiving "con= true" messages via the Stream API?` (conflation causes and `conflateMs` guidance; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-con-true-messages-via-the-Stream-API
- Betfair support, `Are Stream API messages guaranteed to be delivered in strict sequential order according to pt?` (`clk` sequencing statement; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- BetMakers, `BetMakers appointed Racing Australia data wholesaler` (official-plus-proprietary CoreAPI packaging statement; accessed 2026-04-02): https://betmakers.com/articles/betmakers-appointed-racing-australia-data-wholesaler

## Incremental architecture decisions from this run (2026-04-02, pass 104)

- Decision: add an `app_key_tier_gate` and `stream_transport_guard` before any execution path is enabled.
- Why: Betfair support explicitly documents delayed-key stream conflation (3-minute windows), live-key/KYC-funded prerequisites, and non-websocket transport requirements.
- Decision: add a `stream_cache_and_settlement_reconciler` as mandatory lifecycle infrastructure.
- Why: closed-market eviction is periodic (not immediate), and runner-removal void transitions are not fully visible in Order Stream.
- Decision: add an `ra_wholesaler_registry_guard` to entitlement selection and provider onboarding.
- Why: Racing Australia's own wholesaler release confirms framework start date, authorized wholesaler set, and RA compliance posture under common terms.

## Provider comparison (incremental high-signal additions, pass 104)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`Stream access`, `WebSocket support`, `closed-market removal`, `void bets`, `size=0`) | Primary execution-relevant contracts for access tier, transport protocol, cache lifecycle, and stream-settlement visibility gaps | Support articles can evolve; requires periodic recapture and integration tests | A | Implement pre-trade tier/transport gate, closed-market TTL handling, and settlement-first reconciliation for runner removals |
| Racing Australia media release (`Wholesaler Agreement`, 2025-06-19) | Principal statement of authorized wholesaler framework, named participants, equal-term posture, and compliance role | Media release is framework-level and does not include per-provider technical SLA/schema specifics | A | Build authorized-wholesaler registry and separate rights-equivalence checks from feed-quality/performance checks |

## Data contract additions required (incremental, pass 104)

- `betfair_session_contract_snapshot`:
- `capture_ts`, `app_key_tier`, `stream_transport`, `websocket_allowed_flag`, `delayed_conflation_window_sec`, `live_key_required_for_trading_flag`, `source_url`.
- `betfair_account_gate_state`:
- `event_ts`, `account_verified_flag`, `account_funded_flag`, `trade_enable_blocked_flag`, `block_reason`.
- `stream_market_cache_policy_snapshot`:
- `capture_ts`, `closed_market_eviction_interval_min`, `closed_market_delete_after_min`, `source_url`.
- `order_stream_visibility_gap_snapshot`:
- `capture_ts`, `runner_removal_void_visible_flag`, `settlement_reconciliation_required_flag`, `source_url`.
- `runner_change_delta_event`:
- `event_ts`, `market_id`, `img_flag`, `size_zero_remove_count`, `nullable_omission_count`, `cache_replace_applied_flag`.
- `ra_wholesaler_framework_snapshot`:
- `capture_ts`, `effective_from`, `equal_terms_flag`, `ra_role`, `source_url`.
- `ra_wholesaler_registry_snapshot`:
- `capture_ts`, `wholesaler_name`, `authorized_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 104)

- Should delayed-key sessions be hard-blocked globally, or allowed in analytics-only mode with runtime execution disablement?
- What reconciliation SLA do we require between stream lifecycle events and settlement/current-orders when runner removals occur?
- Should closed-market cache TTLs be configurable per strategy profile, or fixed to provider-documented windows for deterministic replay?
- Do we require dual-source validation for RA canonical fields when onboarding a new wholesaler, even under equal contractual terms?

## Ranked implementation backlog (delta, pass 104)

### P0 additions

1. Implement `app_key_tier_gate` (block execution on delayed keys; enforce verified+funded account prerequisites).
2. Add `stream_transport_guard` that fails startup unless SSL-socket CRLF protocol compatibility is confirmed.
3. Implement `stream_cache_and_settlement_reconciler` with explicit closed-market TTL handling and runner-removal settlement reconciliation.
4. Add `ra_wholesaler_registry_guard` to entitlement onboarding and block non-authorized wholesaler feeds by effective date.

### P1 additions

1. Build dashboards for `delayed_key_session_rate`, `stream_settlement_reconciliation_gap_rate`, and `closed_market_cache_age_distribution`.
2. Add contract-drift monitors for Betfair support surfaces and RA wholesaler framework text changes.
3. Run schema/latency benchmark harness across at least two RA-authorized wholesalers for canonical field parity and freshness.

## Sources for this update (pass 104)

- Betfair support, `How do I get access to the Stream API?` (delayed-key conflation and live-access prerequisites; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/115003887871-How-do-I-get-access-to-the-Stream-API
- Betfair support, `Does the Stream API allow Web Socket connections?` (SSL socket + CRLF protocol, no websocket support; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/12937897844252-Does-the-Stream-API-allow-Web-Socket-connections
- Betfair support, `Are closed markets auto-removed from the Stream API subscription?` (cache eviction cadence and closed-market deletion timing; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair support, `How are void bets treated by the Stream API?` (runner-removal void visibility limitations in Order Stream; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000391492-How-are-void-bets-treated-by-the-Stream-API
- Betfair support, `How to I handle runner changes with "size = 0"?` (delta cache update semantics; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-to-I-handle-runner-changes-with-size-0
- Racing Australia, `Racing Materials distribution - Wholesaler Agreement` (media release dated 2025-06-19; accessed 2026-04-02): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

## Incremental architecture decisions from this run (2026-04-02, pass 105)

- Decision: add a `caw_fee_policy_version_store` sourced from CHRB notices, staff analyses, and transcripts.
- Why: CHRB primary 2026 artifacts show thresholded and amendable market-access-fee mechanics, including explicit trigger logic and formula-text corrections.
- Decision: add a `policy_event_study_runner` for fee-governance publications.
- Why: policy release/approval timestamps can create structural breaks in handle composition and late-liquidity behavior that contaminate pooled training windows.

## Provider comparison (incremental high-signal additions, pass 105)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| CHRB 2026 meeting notice + staff-analysis + board transcript | Primary, dated fee-governance evidence: amendment workflow, blended-takeout trigger framing, and formula-correction mechanics | California-specific; transferability to AU is indirect and should be treated as regime-prior input, not direct policy mapping | A | Implement dated policy-version ingestion and event-study hooks for CAW-economics sensitivity |

## Data contract additions required (incremental, pass 105)

- `caw_fee_policy_snapshot`:
- `capture_ts`, `regulator`, `jurisdiction`, `document_type`, `document_date`, `blended_takeout_trigger_pct`, `transfer_enabled_below_trigger_flag`, `handle_application_factor`, `formula_text_hash`, `source_url`.
- `caw_fee_policy_event`:
- `event_ts`, `regulator`, `event_kind`, `related_snapshot_id`, `change_summary`, `source_url`.
- `policy_event_study_window`:
- `event_ts`, `event_kind`, `window_pre_days`, `window_post_days`, `sample_scope`, `completed_flag`.

## Open questions to resolve before implementation freeze (incremental, pass 105)

- What minimum evidence threshold should promote a fee-policy artifact from informational context to deployment-blocking regime change?
- Should CHRB fee-trigger events be used only as US policy telemetry, or as priors in global CAW-transfer penalties?
- What change-detection rule should fire replay requirements when formula text is edited but headline percentages remain unchanged?

## Ranked implementation backlog (delta, pass 105)

### P0 additions

1. Implement `caw_fee_policy_version_store` with immutable snapshot hashing for notice/staff-analysis/transcript layers.
2. Add `caw_fee_policy_event` detection and wire deployment alerts when trigger logic or handle-factor text changes.
3. Add policy-event tags to backtest metadata and block pooled-window promotion when event-study windows are incomplete.

### P1 additions

1. Run event studies around CHRB fee-policy publication dates versus late-handle concentration and price-impact proxies.
2. Build dashboard panels for `policy_formula_change_rate`, `event_study_coverage`, and `regime_break_flag_rate`.

## Sources for this update (pass 105)

- California Horse Racing Board, `JANUARY 2026 Notice of Meeting draft #9` (dated 2026-01-02; includes ADW market-access-fee distribution amendment action item; accessed 2026-04-02): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052679&SubCategory=
- California Horse Racing Board, staff-analysis material (March 2026 posting; includes blended-takeout trigger language for transfer logic; accessed 2026-04-02): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052709&SubCategory=
- California Horse Racing Board, board transcript (`BOARDMTGTRANS`; includes FY2025-26 board-support formula correction language on 0.96%/0.96-of-handle; accessed 2026-04-02): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=BOARDMTGTRANS&DocumentID=00052413&SubCategory=

## Incremental architecture decisions from this run (2026-04-02, pass 106)

- Decision: add an `execution_preference_capture` service that snapshots account/order setting state at submission time.
- Why: Betfair BPE/SP docs show fill/lapse outcomes depend on execution toggles and conversion rules, not only market state.
- Decision: split order simulation into explicit `fixed_price_path` and `sp_conversion_path`.
- Why: SP conversion has separate projection/liability constraints and cancellation behavior at the off.
- Decision: add an `order_lapse_classifier` in reconciler and analytics pipelines.
- Why: bet lapse causes now include deterministic policy causes (`better_price_available_bpe_off`) beyond generic timeout/closure categories.

## Provider comparison (incremental high-signal additions, pass 106)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`Best Price Execution`, `Starting Price`, `matched vs unmatched`) | Primary execution-policy mechanics: improved-price behavior, lapse pathways, SP projection/synthesis, minimum-liability cancellation edge cases | Help-center content can evolve and can mix UI framing with exchange behavior; requires version recapture for audit | A | Capture execution-setting state per order and model fill/lapse outcomes as policy-regime dependent |

## Data contract additions required (incremental, pass 106)

- `execution_preference_snapshot`:
- `capture_ts`, `account_id`, `bpe_enabled_flag`, `matchme_enabled_flag`, `matchme_scope`, `min_sp_lay_liability_ccy`, `min_sp_lay_liability_value`, `source_url`.
- `order_lapse_event`:
- `event_ts`, `order_id`, `market_id`, `selection_id`, `seconds_to_off`, `lapse_reason`, `bpe_enabled_flag`, `requested_price`, `best_available_price_at_submit`.
- `sp_projection_snapshot`:
- `event_ts`, `market_id`, `selection_id`, `near_price`, `far_price`, `projected_sp`, `source_url`.
- `execution_path_label`:
- `event_ts`, `order_id`, `path_type(fixed_price|sp_conversion)`, `final_path_state(matched|unmatched|cancelled|lapsed)`, `matched_price`, `sp_final_price`.

## Open questions to resolve before implementation freeze (incremental, pass 106)

- For API-driven execution, which account-level settings are externally queryable versus requiring operator-runbook attestations at session start?
- Should `lapse_reason=better_price_available_bpe_off` trigger automatic safe-resubmit logic, or remain manual until deterministic guardrails are proven?
- Do we include SP conversion in Phase 1 execution, or hard-scope to fixed-price exchange orders until path-level reconciliation is stable?
- What tolerance should be set for `near/far/projected` SP divergence before suppressing pre-off SP-linked signals?

## Ranked implementation backlog (delta, pass 106)

### P0 additions

1. Implement `execution_preference_capture` and require presence on every order submission event.
2. Add `order_lapse_classifier` with deterministic reason taxonomy including BPE-off price-improvement lapses.
3. Split simulator/live reconciler into `fixed_price_path` and `sp_conversion_path` with independent KPIs.
4. Add SP projection ingestion (`near`, `far`, `projected`) and divergence-quality checks in pre-off feature pipelines.

### P1 additions

1. Run segmented CLV/fill studies by BPE setting state and path type to quantify policy-regime sensitivity.
2. Add dashboard panels for `lapse_reason_mix`, `policy_setting_coverage`, and `sp_projection_divergence`.
3. Build safe-resubmit policy experiments for deterministic lapse classes under strict seconds-to-off limits.

## Sources for this update (pass 106)

- Betfair support, `Exchange: What is Best Price Execution?` (improved-price and lapse behavior plus BPE+MatchMe interaction; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/a_id/404/
- Betfair support, `Starting Price (SP)` (near/far/projected SP and minimum-liability cancellation examples; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/a_id/421/
- Betfair support, `Exchange: What is the difference between matched and unmatched bets?` (unmatched lapse behavior and market-view refresh caveat; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/a_id/401/

## Incremental architecture decisions from this run (2026-04-03, pass 107)

- Decision: add an `app_key_governance_gate` with explicit mode tagging (`delayed_research` vs `live_trading`) across ingestion, backtest, and live execution.
- Why: Betfair support now explicitly links live-key use to betting intent and flags read-only live-key usage for potential deactivation.
- Decision: split market-feature generation into `raw_non_virtual_surface` and `virtual_display_surface` pipelines with deterministic lag alignment.
- Why: Betfair states virtual/display offers (`EX_BEST_OFFERS_DISP`) update about 150ms after non-virtual prices.
- Decision: add an `endpoint_entitlement_registry` at provider-endpoint granularity.
- Why: Punting Form documents materially different rights and feature availability by endpoint/tier (personal-use developer API vs modeller/commercial sectionals/benchmarks).

## Provider comparison (incremental high-signal additions, pass 107)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`read-only access`, `API costs`, `market data surfaces`, `in-play delay`) | Primary contracts on app-key governance, activation cost, virtual-vs-raw price timing, and in-play `betDelay` mechanics | Help-center policy can change and needs recapture/versioning | A | Enforce app-key mode gate, separate virtual/raw features, and make `betDelay` first-class in simulation and live routing |
| Punting Form developer + API reference (`Developer API`, `MeetingSectionals`, `MeetingBenchmarks`) | Primary endpoint-level entitlement signals for sectionals/benchmarks and token-auth requirements | Subscription-tier constraints can block production parity if only personal-use tier is available | A | Implement endpoint entitlement registry and block promotion of models relying on personal-use-only endpoints |

## Data contract additions required (incremental, pass 107)

- `app_key_governance_snapshot`:
- `capture_ts`, `provider`, `app_key_tier`, `mode_label(delayed_research|live_trading)`, `live_key_read_only_permitted_flag`, `deactivation_risk_flag`, `activation_fee_gbp`, `source_url`.
- `market_surface_observation`:
- `event_ts`, `market_id`, `selection_id`, `surface_type(raw_non_virtual|virtual_display)`, `price`, `size`, `lag_from_raw_ms`, `source_url`.
- `inplay_delay_observation`:
- `event_ts`, `market_id`, `inplay_flag`, `bet_delay_sec`, `source_channel(rest_listMarketBook|stream_marketDefinition)`, `source_url`.
- `provider_endpoint_entitlement_snapshot`:
- `capture_ts`, `provider`, `endpoint_path`, `feature_family`, `subscription_tier_required`, `allowed_use_scope`, `token_auth_required_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 107)

- Do we require dual publishing of features (`raw` and lag-adjusted `virtual`) in Phase 1, or lock to raw-only for execution and keep virtual-only for UX parity?
- What policy should auto-block experiments when session lineage indicates delayed-key mode but downstream artifacts are tagged for live promotion?
- Which minimum commercial tier is required to guarantee production-stable access to sectionals/benchmarks, and what fallback applies if entitlement is downgraded?
- Should `betDelay` above a threshold (for example 8-12s) trigger strategy-level suppression or only stake-size haircuting?

## Ranked implementation backlog (delta, pass 107)

### P0 additions

1. Implement `app_key_governance_gate` and stamp every run with immutable mode metadata (`delayed_research` or `live_trading`).
2. Add dual-surface collector support (`raw_non_virtual` + `virtual_display`) with enforced lag-alignment transform before feature derivation.
3. Ingest and persist `betDelay` continuously from both REST and Stream definitions, and wire to execution-path guards.
4. Build `provider_endpoint_entitlement_registry` and block deployment candidates dependent on personal-use-only endpoints.

### P1 additions

1. Run ablation studies comparing `raw-only`, `virtual-only`, and `lag-aligned dual-surface` microstructure features.
2. Add dashboards for `app_key_mode_mix`, `virtual_lag_distribution_ms`, and `high_betDelay_market_rate`.
3. Build entitlement-degradation drills to validate fallback feature sets when sectional/benchmark endpoints are unavailable.

## Sources for this update (pass 107)

- Betfair support, `What is read-only Betfair API access?` (updated 2026-03-06; live-key read-only prohibition and deactivation-risk guidance; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/25033076334748-What-is-read-only-Betfair-API-access
- Betfair support, `Are there any costs associated with API access?` (updated 2025-10-30; delayed-key free development access and GBP 299 live-key activation fee; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003864531-Are-there-any-costs-associated-with-API-access
- Betfair support, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; virtual/display (`EX_BEST_OFFERS_DISP`) update lag vs non-virtual prices; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Betfair support, `Why do you have a delay on placing bets on a market that is in-play` (updated 2025-08-20; in-play delay range and `betDelay` field guidance; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Punting Form, `Developer API` (Pro-member availability and personal-use-only restriction; accessed 2026-04-03): https://www.puntingform.com.au/developer/api/
- Punting Form docs, `Sectionals CSV` (Modeller/commercial entitlement and token auth; accessed 2026-04-03): https://docs.puntingform.com.au/reference/meetingsectionalscsv
- Punting Form docs, `Benchmarks` (Modeller/commercial entitlement and token auth; accessed 2026-04-03): https://docs.puntingform.com.au/reference/meetingbenchmarks

## Incremental architecture decisions from this run (2026-04-03, pass 108)

- Decision: add an `off_time_settlement_governance_engine` for Betfair post-off handling.
- Why: Betfair rules define distinct outcomes when suspension timing fails (`void`, `stand`, or `stand_with_price_adjustment`) keyed to official off-time and delayed in-play transitions.
- Decision: add a `provider_maintenance_phase_controller` for Racing Australia integrations.
- Why: RA FAQ guidance adds a concrete pre-cutover logout deadline and structured post-cutover validation expectations beyond simple outage windows.

## Provider comparison (incremental high-signal additions, pass 108)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support `Sportsbook - General Sports Betting Rules` | Explicit off-time failure governance: horse-racing official-off void boundaries and post-off repricing possibility when in-play turn is delayed | Rules are sportsbook/fixed-odds scope and must not be overgeneralized to exchange-only paths | A | Add post-off settlement regime modeling and separate product-surface governance branches |
| Racing Australia FAQ `Systems Upgrade Oracle Cloud Infrastructure` | Operationally precise maintenance controls (pre-cutover logout deadline, outage-service scope, post-cutover access expectations) | Event-specific FAQ; needs reusable abstraction so one-off migration details do not become hardcoded | A | Implement phased maintenance runbook state machine with pre-cutover and post-cutover checkpoints |

## Data contract additions required (incremental, pass 108)

- `off_time_settlement_governance_event`:
- `event_ts`, `provider`, `product_surface`, `market_id`, `scheduled_inplay_flag`, `official_off_time`, `suspend_missed_flag`, `late_inplay_turn_flag`, `post_off_outcome`, `price_adjustment_applied_flag`, `source_url`.
- `off_time_settlement_adjustment_event`:
- `event_ts`, `bet_id`, `market_id`, `pre_adjustment_price`, `adjusted_price`, `adjustment_reason`, `source_url`.
- `provider_maintenance_phase_snapshot`:
- `capture_ts`, `provider`, `window_start_local`, `window_end_local`, `pre_cutover_logout_deadline_local`, `post_cutover_login_change_expected_flag`, `affected_services_json`, `source_url`.
- `provider_post_cutover_validation_event`:
- `event_ts`, `provider`, `check_name`, `check_status(pass|fail|warn)`, `incident_payload_complete_flag`, `run_id`.

## Open questions to resolve before implementation freeze (incremental, pass 108)

- For Betfair integrations, where do we hard-separate sportsbook/fixed-odds settlement governance from exchange settlement logic in shared analytics tables?
- What tolerance should be used before labeling a late in-play transition as likely to trigger repricing risk vs no-adjustment stand?
- Should RA pre-cutover deadlines trigger automatic ingestion freeze, or operator-confirmed manual freeze with explicit override logging?
- What minimum post-cutover validation checklist is required before re-enabling live strategy execution after planned provider maintenance?

## Ranked implementation backlog (delta, pass 108)

### P0 additions

1. Implement `off_time_settlement_governance_engine` with explicit `void|stand|stand_price_adjusted` state mapping and product-surface tags.
2. Add `off_time_settlement_adjustment_event` persistence so any Betfair post-off repricing is auditable in replay and PnL attribution.
3. Implement `provider_maintenance_phase_controller` with `pre_cutover_logout_deadline` enforcement and automatic ingestion freeze/resume gates.
4. Add `provider_post_cutover_validation_event` checks and block strategy re-enable until required checks pass.

### P1 additions

1. Backtest edge-attribution sensitivity by excluding vs including `stand_price_adjusted` regimes.
2. Build dashboards for `suspend_miss_rate`, `post_off_adjustment_rate`, `pre_cutover_freeze_compliance`, and `post_cutover_validation_fail_rate`.
3. Run chaos drills simulating late provider suspend/outage windows and verify runbook-state transitions are deterministic.

## Sources for this update (pass 108)

- Betfair support, `Sportsbook - General Sports Betting Rules` (off-time suspension miss logic, horse-racing official-off void boundary, and post-off price-adjustment clause; accessed 2026-04-03): https://support.betfair.com/app/answers/detail/a_id/10589/
- Racing Australia FAQ, `Racing Australia Systems Upgrade Oracle Cloud Infrastructure` (pre-cutover logout guidance, outage scope, and post-cutover behavior notes; accessed 2026-04-03): https://www.racingaustralia.horse/faq/Racing-Australia-Systems-Upgrade-Oracle-Cloud-Infrastructure.aspx

## Incremental architecture decisions from this run (2026-04-03, pass 109)

- Decision: add a `stream_status_degradation_controller` that treats `status=503` as a degraded execution state with controlled risk reduction, not an automatic reconnect condition.
- Why: Betfair's release contract explicitly states clients should remain connected during `status=503`, and that status is emitted per subscription on both heartbeat and change messages.
- Decision: add a `provider_identity_timeline_registry` with effective-date alias mapping (`legal_name` <-> `brand_name`).
- Why: provider branding can change (News Perform -> InForm) while regulatory/contract references continue using older legal names.

## Provider comparison (incremental high-signal additions, pass 109)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange API release note (`New API Release - 20th July`) | Explicit stream-health semantics: `status=null` vs `status=503`, per-subscription propagation, and no-disconnect guidance during degraded push latency | Older release note (2017) but still normative for status behavior; must be reconciled with current stream docs when drift appears | A | Implement degradation-mode risk controls before any reconnect policy |
| InForm media release (`News Perform Rebrands as InForm`) | Dated brand-transition evidence linking RA wholesaler naming (`News Perform`) to current operating brand lineage (`InForm`/`Inform Connect`) | Provider-authored source; legal-entity mapping still needs regulator/contract corroboration for hard compliance assertions | A/B | Add effective-date alias registry and enforce canonical provider IDs in entitlement routing |

## Data contract additions required (incremental, pass 109)

- `stream_status_event`:
- `event_ts`, `subscription_id`, `channel(order|market)`, `message_type(change|heartbeat)`, `status_code`, `degraded_push_latency_flag`, `reconnect_forbidden_by_contract_flag`, `source_url`.
- `stream_degradation_window`:
- `window_start_ts`, `window_end_ts`, `subscription_id`, `status_503_duration_ms`, `orders_submitted_count`, `stake_haircut_policy_applied`, `source_url`.
- `provider_identity_timeline`:
- `capture_ts`, `canonical_provider_id`, `legal_name`, `brand_name`, `effective_from`, `effective_to`, `source_type(regulator_release|provider_release)`, `confidence_tag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 109)

- What objective threshold should escalate from `status=503` stake haircuts to full execution pause?
- Should reconnection under degraded status be allowed only after `N` missed-heartbeat intervals, or blocked entirely until explicit disconnect causes occur?
- For alias mapping, what minimum corroboration is required before treating provider-authored rebrand evidence as compliance-grade identity truth?
- Do we require dual-source identity confirmation (regulator + provider) before enabling production routing to renamed wholesalers?

## Ranked implementation backlog (delta, pass 109)

### P0 additions

1. Implement `stream_status_degradation_controller` and wire `status=503` to deterministic risk-state transitions (`normal -> degraded -> paused`).
2. Persist `stream_status_event` and `stream_degradation_window` telemetry and enforce post-run coverage checks.
3. Implement `provider_identity_timeline_registry` with effective-date joins, canonical provider IDs, and confidence-tagged alias evidence.
4. Block entitlement/routing decisions when provider alias confidence is below threshold or date-effective mapping is ambiguous.

### P1 additions

1. Run CLV/fill-attribution studies segmented by `status` health windows to quantify degradation impact.
2. Add dashboard panels for `status_503_dwell_ms`, `degraded_order_share`, and `alias_resolution_conflict_rate`.
3. Build automated diff checks between regulator wholesaler lists and provider brand announcements to surface identity drift early.

## Sources for this update (pass 109)

- Betfair Exchange API release note, `New API Release - 20th July` (published 2017-07-20; Stream `status` behavior and `status=503` handling contract; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687957
- InForm media release, `News Perform Rebrands as InForm, Introducing Inform Connect and Inform Media` (published 2025-03-26; provider brand-transition timeline; accessed 2026-04-03): https://www.informsportsracing.com.au/media/news-perform-rebrands-as-inform/

## Incremental architecture decisions from this run (2026-04-03, pass 110)

- Decision: add a `betfair_license_mode_gate` that classifies every run as `personal_non_distributed`, `vendor_distributed`, or `operator_commercial`.
- Why: Betfair support now provides explicit license-path taxonomy and vendor-security/certification obligations that materially change deployability.
- Decision: add a `vendor_permissioning_service` for any distributed-application path.
- Why: Vendor Services API contract requires licensed/certified vendor status, server-to-server token flow, and has operation-level Web API exclusions.
- Decision: add a `client_architecture_compliance_guard` that blocks direct browser Betfair calls.
- Why: Betfair explicitly disallows CORS, so browser-direct API integrations are contract-incompatible.
- Decision: add a `provider_report_publication_lag_monitor` for Racing Australia monthly KPI artifacts.
- Why: as of 2026-04-03 the published monthly index still lists January 2026 as latest, so publication lag is a measurable provider-risk signal.

## Provider comparison (incremental high-signal additions, pass 110)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`Which API Licence`, `Software Vendor`, `API testbed`, `CORS`) + Vendor Services API docs | Primary deployability contracts: KYC/license path taxonomy, vendor-certification + fee surface, no-funds-testbed absence, browser CORS prohibition, and vendor permissioning boundaries | Support/docs layer can change; license/legal details are binding but require periodic recapture | A | Implement license-mode gating + server-side permissioning architecture as preconditions for any distributed product |
| Racing Australia monthly performance-report index | Primary publication-state signal for service-standard artifacts (latest 2025-26 month still January as of 2026-04-03 capture) | Index state can lag independently of system uptime; requires recurring capture | A | Add publication-lag telemetry and escalation thresholds in provider-health controls |

## Data contract additions required (incremental, pass 110)

- `betfair_license_mode_snapshot`:
- `capture_ts`, `provider`, `kyc_verified_required_flag`, `license_mode`, `distribution_allowed_flag`, `vendor_security_cert_required_flag`, `vendor_license_fee_gbp`, `source_url`.
- `betfair_api_access_constraints_snapshot`:
- `capture_ts`, `provider`, `cors_allowed_flag`, `testbed_without_real_funds_available_flag`, `delayed_key_testing_required_flag`, `source_url`.
- `vendor_permission_contract_snapshot`:
- `capture_ts`, `provider`, `licensed_vendor_required_flag`, `server_to_server_token_required_flag`, `session_expiry_min_minutes`, `session_expiry_default_hours`, `web_api_blocked_operations_json`, `source_url`.
- `provider_report_publication_lag_snapshot`:
- `capture_ts`, `provider`, `report_family`, `latest_report_month`, `latest_report_year`, `days_since_month_end`, `missing_expected_months_count`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 110)

- Which target operating mode is intended for Phase 1 (`personal non-distributed internal tool` vs `vendor-distributed app`), and does that force immediate vendor-program enrollment?
- What hard policy should block promotion when run lineage is `personal/delayed-key` but artifact intent is `commercial/distributed`?
- For browser-facing product surfaces, do we standardize on a backend proxy for all Betfair calls now, or permit temporary direct stubs only in local development?
- What publication-lag threshold on RA monthly KPI artifacts should trigger provider-risk alerts (for example `>30` vs `>45` days after month end)?

## Ranked implementation backlog (delta, pass 110)

### P0 additions

1. Implement `betfair_license_mode_gate` and stamp every run/deployment candidate with immutable license/distribution mode metadata.
2. Add `client_architecture_compliance_guard` and block any production path requiring browser-direct Betfair calls (CORS unsupported).
3. Implement `vendor_permissioning_service` contracts (`server-to-server` token handling + blocked-operation checks) for distributed-app scenarios.
4. Add `provider_report_publication_lag_monitor` for Racing Australia monthly reports and wire alerting when lag threshold is breached.

### P1 additions

1. Build promotion-policy checks that reject models/artifacts trained under personal/delayed lineage when target mode is commercial/distributed.
2. Add dashboards for `license_mode_mix`, `vendor_permissioning_coverage`, and `ra_monthly_report_publication_lag_days`.
3. Run tabletop drills comparing internal-tool vs vendor-distributed deployment paths to quantify compliance lead-time and operational overhead.

## Sources for this update (pass 110)

- Betfair support, `Which API Licence Do I Require?` (updated 2026-01-13; KYC prerequisite and license-path taxonomy; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002464152-Which-API-Licence-Do-I-Require
- Betfair support, `What is a Software Vendor?` (updated 2026-03-05; vendor rights and GBP 999 security-certification fee note; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002190692-What-is-a-Software-Vendor
- Betfair support, `How do I become a Software Vendor?` (updated 2026-03-05; vendor-program application/certification flow and fee note; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360000391912-How-do-I-become-a-Software-Vendor
- Betfair support, `Do Software Vendors have to pay to access the Betfair API?` (updated 2026-03-16; delayed-key development posture and GBP 999 fee note; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002190732-Do-Software-Vendors-have-to-pay-to-access-the-Betfair-API
- Betfair support, `Is there an API testbed available?` (updated 2025-10-30; no no-funds API testbed guidance; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003886111-Is-there-an-API-testbed-available
- Betfair support, `Does the Betfair API support CORS?` (updated 2025-10-30; CORS unsupported; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/9746660402332-Does-the-Betfair-API-support-CORS
- Betfair Exchange API docs, `Vendor Services API` (licensed-vendor scope, server-to-server token rule, and Web API operation exclusions; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687938/Vendor%2BServices%2BAPI
- Racing Australia, `Monthly Service Standard Performance Report` index (captured 2026-04-03; latest listed 2025-2026 month is January 2026): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental architecture decisions from this run (2026-04-03, pass 111)

- Decision: add a `pool_economics_normalizer` that computes `effective_pool_return_pct` per pool/rulebook.
- Why: HKJC commingling documentation now provides explicit payout (`84.95%`) plus reserve deduction (`0.1699%`) parameters for PMU outbound Win/Place pools.
- Decision: persist `collection_window_days` and `partner_rulebook` in settlement contracts for commingled pools.
- Why: payout and claimability windows are contract terms that affect realized bankroll and replay correctness.

## Provider comparison (incremental high-signal additions, pass 111)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| HKJC `Commingling Pools` (PMU outbound rules) | Explicit pool economics (`84.95%` payout, `0.1699%` overseas-jackpot reserve deduction), partner rulebook application, and payout-collection window context | Venue/pool-specific and not directly portable to AU pools without regime mapping | A | Add pool-economics normalizer and rulebook-aware EV calculator before cross-jurisdiction tote comparisons |

## Data contract additions required (incremental, pass 111)

- `commingled_pool_economics_snapshot`:
- `capture_ts`, `venue`, `partner_pool_operator`, `bet_type`, `pool_payout_pct`, `reserve_deduction_pct`, `rebate_applicable_flag`, `partner_rulebook`, `source_url`.
- `pool_settlement_claim_window_snapshot`:
- `capture_ts`, `venue`, `pool_type`, `collection_window_days`, `claim_window_basis`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 111)

- For cross-venue tote backtests, do we normalize all implied edges to `effective_pool_return_pct` before comparing with exchange-derived EV?
- Should commingled-pool reserve deductions be modeled as deterministic costs in pre-trade staking, or as settlement-only adjustments?
- What confidence threshold is required to transfer HKJC commingled-pool economics priors into AU tote-simulation defaults?

## Ranked implementation backlog (delta, pass 111)

### P0 additions

1. Implement `pool_economics_normalizer` and block EV calculations when payout/deduction inputs are missing.
2. Add `commingled_pool_economics_snapshot` ingestion with effective-date versioning and source URL lineage.
3. Extend settlement replay to include `collection_window_days` and `partner_rulebook` joins.

### P1 additions

1. Run sensitivity tests comparing raw-vs-normalized tote EV under varying payout and reserve-deduction assumptions.
2. Add dashboards for `effective_pool_return_pct` drift by venue and pool type.

## Sources for this update (pass 111)

- Hong Kong Jockey Club, `Commingling Pools` (PMU outbound pool payout percentage, reserve deduction, and rulebook split; accessed 2026-04-03): https://special.hkjc.com/e-win/en-US/betting-info/racing/beginners-guide/commingling-pools/

## Incremental architecture decisions from this run (2026-04-03, pass 112)

- Decision: add an `sp_reconciliation_observer` component that records projected SP (`near`/`far`) and realized SP outcomes at suspend/off.
- Why: Betfair SP mechanics define deterministic reconciliation inputs and a minimum-lay-liability cancellation branch that directly impacts off-time liquidity assumptions.
- Decision: add a `wholesaler_contract_registry` keyed by effective date and wholesaler identity.
- Why: Racing Australia moved to an appointed-wholesaler structure from 2025-07-01, so provider entitlement checks must resolve through wholesaler contracts rather than a single RA distribution assumption.
- Decision: add a `provider_session_semantics_catalog` for endpoint auth/session behavior.
- Why: BetMakers token/session semantics (1-hour token validity and reconnect-dependent refresh behavior) materially affect long-running subscription reliability controls.

## Provider comparison (incremental high-signal additions, pass 112)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support `Starting Price (SP)` | Primary SP reconciliation contract (near/far projections, visible SP stake/liability surfaces, min-lay-liability cancellation) | Help-center text can change; still authoritative enough for execution assumptions | A | Add SP projection/reconciliation dataset and liquidity-conversion filters before off-time modeling |
| Racing Australia `Wholesaler Agreement` media release | Official AU distribution topology: five appointed wholesalers and RA compliance-role shift from 2025-07-01 | Structural policy source; does not by itself define each wholesaler's endpoint SLA | A | Build wholesaler contract registry + date-effective entitlement routing |
| BetMakers Core API FAQ + Punting Form sectionals docs | Concrete provider session semantics and historical coverage priors (`1h` token TTL, sectional completeness depth) | Vendor-authored docs; commercial terms/SLA still require contract validation | A/B | Add provider session/capability snapshots and coverage-aware feature-confidence controls |

## Data contract additions required (incremental, pass 112)

- `sp_projection_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `near_price`, `far_price`, `near_far_spread`, `sp_back_stakes_visible`, `sp_lay_liabilities_visible`, `source_url`.
- `sp_reconciliation_event`:
- `event_ts`, `market_id`, `selection_id`, `realized_sp`, `min_lay_liability_gbp`, `low_liability_lapse_flag`, `source_url`.
- `wholesaler_contract_snapshot`:
- `capture_ts`, `effective_from`, `wholesaler_name`, `appointed_by_ra_flag`, `ra_wholesaler_role_active_flag`, `source_url`.
- `provider_session_semantics_snapshot`:
- `capture_ts`, `provider`, `endpoint_family`, `auth_model`, `token_ttl_sec`, `subscription_reauth_required_on_disconnect_flag`, `source_url`.
- `provider_history_coverage_snapshot`:
- `capture_ts`, `provider`, `data_family`, `coverage_start_year`, `coverage_ratio_pct`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 112)

- Should pre-off execution sizing be suppressed when `near_far_spread` exceeds a threshold, or only haircutted proportionally?
- What is our canonical fallback when SP projection surfaces are unavailable for a subset of runners near suspend?
- Do we require at least two independent wholesalers for critical race/results ingestion in Phase 1, or accept single-wholesaler concentration risk?
- What minimum contractual evidence is required to upgrade vendor-authored session/coverage docs from `A/B` to fully `A` in entitlement gates?

## Ranked implementation backlog (delta, pass 112)

### P0 additions

1. Implement `sp_reconciliation_observer` and persist projected-vs-realized SP with per-runner lineage.
2. Add minimum-liability conversion filters to off-time liquidity estimates and simulator fill models.
3. Build `wholesaler_contract_registry` with effective-date joins and hard gating in provider routing.
4. Add `provider_session_semantics_catalog` checks to subscription supervisors (token TTL and reconnect behavior).

### P1 additions

1. Run ablations on `near_far_spread` features for late-window drift/fill prediction.
2. Add concentration-risk dashboards for wholesaler dependence across critical data families.
3. Backtest robustness under synthetic token-expiry/reconnect failures using provider session-semantic profiles.

## Sources for this update (pass 112)

- Betfair support, `Starting Price (SP)` (SP reconciliation mechanics, projected near/far prices, and minimum SP lay liability behavior; accessed 2026-04-03): https://support.betfair.com/app/answers/detail/a_id/421/
- Racing Australia media release, `Racing Materials distribution - Wholesaler Agreement` (published 2025-06-19; five appointed wholesalers and commencement 2025-07-01; accessed 2026-04-03): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf
- BetMakers docs, `FAQ` (token validity and long-running subscription restart semantics; accessed 2026-04-03): https://docs.betmakers.com/docs/core-api/faq/index.html
- Punting Form docs, `Sectional Data` (sectional completeness and historical capture depth; accessed 2026-04-03): https://docs.puntingform.com.au/docs/sectional-data

## Incremental architecture decisions from this run (2026-04-03, pass 113)

- Decision: add a `nsw_threshold_allocation_engine` that applies clause-ordered exempt-threshold allocation and group-shared threshold logic by effective date.
- Why: Racing NSW marked-up 2025-26 conditions provide deterministic allocation order and related-group mechanics that invalidate unconstrained threshold heuristics.
- Decision: add a `policy_artifact_quality_gate` before promoting legal-rule parser outputs.
- Why: marked-up policy PDFs can contain redline/numbering artifacts; clean-version pairing is required for reproducible machine interpretation.
- Decision: add `worked_example_contract_tests` for fee policy.
- Why: Racing NSW Appendix A worked examples provide concrete expected outcomes for regression-grade fee-engine verification.

## Provider comparison (incremental high-signal additions, pass 113)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing NSW 2025-26 marked-up standard conditions (effective 2025-07-01) | Primary clause-level fee mechanics: forced exempt-threshold allocation order, related-group shared threshold, and reallocation behavior under relationship changes | Marked-up artifact contains redline formatting noise; must be paired with clean version for canonical parser behavior | A | Implement policy-constrained fee engine + clean/marked-up dual-source validation before production fee attribution |

## Data contract additions required (incremental, pass 113)

- `nsw_fee_threshold_allocation_rule_snapshot`:
- `capture_ts`, `effective_from`, `allocation_order_json`, `group_shared_threshold_flag`, `source_url`.
- `nsw_related_operator_membership_event`:
- `event_ts`, `group_id`, `members_json`, `reallocation_trigger_flag`, `source_url`.
- `nsw_fee_worked_example_snapshot`:
- `capture_ts`, `example_id`, `input_turnover_by_bucket_json`, `threshold_allocation_by_entity_json`, `source_appendix_ref`, `source_url`.
- `policy_artifact_quality_snapshot`:
- `capture_ts`, `source_url`, `artifact_type(clean|marked_up|unknown)`, `parsing_risk_tag(low|medium|high)`, `clean_pair_url`.

## Open questions to resolve before implementation freeze (incremental, pass 113)

- Which source should be canonical for parser output when clean and marked-up policy artifacts diverge on punctuation/numbering but not apparent legal intent?
- How should intra-period related-entity membership changes be timestamped when counterparty disclosures arrive with reporting lag?
- Do we require deterministic clause-order replay in all historical fee backtests, or allow approximate replay in early-stage exploratory notebooks?
- What is the minimum test coverage threshold for Appendix-A-based fee-regression fixtures before enabling live policy updates?

## Ranked implementation backlog (delta, pass 113)

### P0 additions

1. Implement `nsw_threshold_allocation_engine` with explicit clause-order bucket allocation and related-group threshold sharing.
2. Add `nsw_related_operator_membership_event` ingestion and wire reallocation behavior into fee replay.
3. Build `worked_example_contract_tests` from Appendix A and block promotion when fixture outputs drift.
4. Add `policy_artifact_quality_gate` that requires clean-version pairing before parser-driven policy promotion.

### P1 additions

1. Add sensitivity reports comparing unconstrained vs clause-constrained fee modeling impact on net-edge attribution.
2. Add dashboards for `group_membership_change_events`, `threshold_reallocation_count`, and `policy_artifact_parsing_risk`.
3. Build automated drift checks between Racing NSW clean vs marked-up versions and surface clause-level diffs.

## Sources for this update (pass 113)

- Racing NSW, `Race Fields SC 2025-26 Marked Up Version Effective 1 July 2025` (clause-ordered exempt-threshold allocation mechanics, related-group threshold rules, and worked examples; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Marked-Up-Version-Effective-1-July-2025.pdf

## Incremental architecture decisions from this run (2026-04-03, pass 114)

- Decision: add a `market_view_parity_controller` that stores and serves `non_virtual`, `virtual_displayed`, and rollup contexts for every late-market feature computation.
- Why: Betfair now documents explicit virtual-price lag (~150 ms) and rollup-dependent website/API differences.
- Decision: add a `request_weight_budget_planner` as a hard gate in collectors and backtest replayers.
- Why: Betfair constrains request load by weighted-point arithmetic (`<=200` per request) with depth-dependent scaling.
- Decision: add a `caw_regime_event_catalog` with portable threshold schema (`speed`, `cutoff`, `pool_scope`, `effective_from`).
- Why: NYRA's 2026 CAW guardrails provide explicit operational thresholds rather than implicit market-behavior clues.
- Decision: add a `provider_ops_compliance_layer` spanning entitlement, outage calendars, support windows, and reporting-deadline contracts.
- Why: RA SNS/status + BetMakers GRN docs expose concrete operational constraints that can independently break production correctness.

## Provider comparison (incremental high-signal additions, pass 114)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support/docs (`market data availability`, `website-vs-API differences`, `request limits`, `in-play delay`) | Explicit microstructure/execution contracts: virtual-price lag, rollup divergence mechanics, request-weight formulas, and `betDelay` semantics | Support-layer text can drift; must recapture periodically and regression-test assumptions | A | Implement view-parity persistence and request-budget gating before broadening late-window feature set |
| NYRA CAW guardrail announcement (2026-01-30) | Primary threshold-based CAW policy template (`>6 bets/sec`, 1-minute cutoff scope, retained 2-minute win-pool rule) | Non-AU jurisdiction; directly useful as transferable regime-schema pattern, not as AU policy truth | A | Build generic CAW regime catalog + epoch-aware analytics segmentation |
| Racing Australia SNS login + systems-status site | Primary entitlement boundary, support-hour windows, independent status channel, and module-scoped outage disclosures | Operational notices can be ephemeral and timezone-specific; requires scheduled snapshot capture | A | Add provider-ops calendar and support-window gating into collector + incident workflows |
| BetMakers GRN Reporting API docs | Concrete reporting-compliance contract: race-level batching, 1000-bet max, atomic validation, OAuth2 client-credentials, 24h deadline from last local race | Vendor-authored docs; contractual/legal enforceability still needs executed commercial agreement context | A/B | Build pre-submit validation and reporting-deadline scheduler before regulated production launch |

## Data contract additions required (incremental, pass 114)

- `betfair_price_view_snapshot`:
- `capture_ts`, `market_id`, `selection_id`, `price_view_type`, `virtual_lag_ms_assumption`, `rollup_model`, `rollup_limit`, `source_url`.
- `betfair_request_budget_snapshot`:
- `capture_ts`, `operation`, `weight_per_market`, `market_count`, `requested_depth`, `total_weight_points`, `source_url`.
- `caw_regime_event_snapshot`:
- `capture_ts`, `jurisdiction`, `operator`, `effective_from`, `caw_speed_threshold_bets_per_sec`, `cutoff_sec_to_post`, `pool_scope_json`, `retail_only_pools_json`, `source_url`.
- `ra_provider_ops_snapshot`:
- `capture_ts`, `provider`, `status_channel_independent_flag`, `support_windows_json`, `authorized_personnel_only_flag`, `source_url`.
- `ra_system_outage_event`:
- `event_ts`, `event_type(planned|unplanned)`, `affected_modules_json`, `window_start_local`, `window_end_local`, `source_url`.
- `betmakers_grn_reporting_contract_snapshot`:
- `capture_ts`, `upload_deadline_hours_from_last_race`, `max_bets_per_request`, `single_meeting_race_per_request_flag`, `batch_atomicity_flag`, `oauth2_client_credentials_required_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 114)

- For Betfair late-window features, should model training standardize on `non_virtual` ladders only, or learn a dual-view representation with explicit lag compensation?
- What hard threshold on `total_weight_points` should trigger feature-drop vs collector-throttle when market count spikes near jump?
- Which AU jurisdictions currently publish CAW-like cutoff/speed controls in primary form, and how do we map them into the same regime schema?
- What is the operational policy when planned RA module outages overlap our collection windows: skip, degrade to backup provider, or re-run backfill only?
- Do BetMakers GRN upload/deadline constraints apply directly to our intended operating mode, or only to specific wagering-operator/reporting relationships under contract?

## Ranked implementation backlog (delta, pass 114)

### P0 additions

1. Implement `market_view_parity_controller` and persist `price_view_type + rollup_context` on all market snapshots and feature materializations.
2. Add `request_weight_budget_planner` with hard fail-safe when weighted request plans exceed contract limits.
3. Implement `provider_ops_compliance_layer` ingesting RA support windows and planned outage notices into collector scheduling.
4. Add `grn_reporting_preflight_validator` enforcing meeting/race scope, max-batch size, and atomicity before any reporting upload path.

### P1 additions

1. Build dual-view (virtual/non-virtual) ablation studies for late drift/fill prediction and CLV attribution.
2. Add `caw_regime_event_catalog` and segment market-quality metrics by policy epoch IDs.
3. Create dashboards for `request_weight_utilization_pct`, `planned_outage_overlap_minutes`, and `grn_preflight_rejection_rate`.

## Sources for this update (pass 114)

- Betfair support, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; virtual-price timing and projection/ladder mapping; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Betfair support, `Why are the prices displayed on the website different from what I see in my API application?` (updated 2025-08-20; `virtualise`, delayed-key, and rollup differences; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Betfair support, `What data/request limits exist on the Exchange API?` (updated 2025-09-09; weighted-point request budget and depth scaling; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003864671-What-data-request-limits-exist-on-the-Exchange-API
- Betfair support, `Why do you have a delay on placing bets on a market that is 'in-play'` (updated 2025-08-20; in-play delay range and `betDelay` source fields; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- NYRA, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; CAW threshold and cutoff windows; accessed 2026-04-03): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Racing Australia, `SNS Login` (SNS scope, authorized use constraints, and support schedule; accessed 2026-04-03): https://racingaustralia.horse/IndustryLogin/SNS_Login.aspx
- Racing Australia, `Systems Status Updates` (independent status channel and module-level outage notices; accessed 2026-04-03): https://racingaustraliasystemsstatus.horse/
- BetMakers docs, `GRN Reporting API Introduction` (batch/deadline/auth constraints; accessed 2026-04-03): https://docs.betmakers.com/docs/grnr/introduction/index.html

## Incremental architecture decisions from this run (2026-04-03, pass 115)

- Decision: add an `rv_counterparty_segment_registry` with explicit support for `interstate_oncourse_bookmaker` as a separate class.
- Why: Racing Victoria's approved-WSP registry now publishes a fourth segment beyond the previously modeled three-class structure.
- Decision: add an `rv_policy_pair_reconciler` that binds clean and marked-up standard-condition artifacts before policy promotion.
- Why: Racing Victoria's policy index exposes both clean and marked-up Standard Conditions for the same effective date, enabling deterministic clause-diff controls.
- Decision: add a `jurisdiction_policy_bundle_watcher` that treats policy-index link changes as event triggers.
- Why: RV's race-fields policy page serves as an authoritative index for policy/conditions/guide artifact sets, so link changes are operationally meaningful.

## Provider comparison (incremental high-signal additions, pass 115)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Victoria `Approved Wagering Service Providers` page | Principal counterparty segmentation now including `Interstate Oncourse Bookmakers`, plus explicit international approved entities | Dynamic page without explicit version API; requires snapshot lineage for historical reconstruction | A | Implement four-class RV counterparty registry and make entitlement/compliance checks segment-aware |
| Racing Victoria `Race Fields Policy` page | Principal index linking effective-date policy bundle, including clean and marked-up standard conditions plus current guide | Index-level source; clause semantics still come from linked PDFs and can change across approval periods | A | Implement policy-bundle watcher and clean/marked-up reconciliation gate before parser promotion |

## Data contract additions required (incremental, pass 115)

- `rv_approved_counterparty_snapshot`:
- `capture_ts`, `counterparty_name`, `counterparty_segment`, `source_page_url`.
- `rv_counterparty_segment_membership_event`:
- `event_ts`, `counterparty_name`, `old_segment`, `new_segment`, `source_page_url`.
- `rv_policy_artifact_snapshot`:
- `capture_ts`, `effective_from`, `artifact_type(clean|marked_up|guide|policy_index)`, `artifact_url`, `parent_index_url`.
- `rv_policy_diff_event`:
- `event_ts`, `effective_from`, `diff_detected_flag`, `clause_ids_changed_json`, `source_page_url`.

## Open questions to resolve before implementation freeze (incremental, pass 115)

- For Victorian workflows, do we enforce different control planes by counterparty segment (e.g., separate gates for `interstate_oncourse_bookmaker` vs `international_licensed_bookmaker`), or only use segment labels for monitoring?
- What snapshot cadence is sufficient for the RV approved-WSP page to detect operationally relevant segment drift without excessive churn?
- Should clean-vs-marked-up RV policy diffs block all production promotions, or only compliance/fee-sensitive components?
- Do we standardize NSW and RV policy artifact pairing under one cross-jurisdiction parser gate, or keep jurisdiction-specific validators?

## Ranked implementation backlog (delta, pass 115)

### P0 additions

1. Implement `rv_counterparty_segment_registry` with explicit four-class normalization, including `interstate_oncourse_bookmaker`.
2. Add `rv_policy_pair_reconciler` and block policy-parser promotion when clean/marked-up RV artifacts are unresolved.
3. Build `jurisdiction_policy_bundle_watcher` for RV policy index link-change detection and parser regression triggers.

### P1 additions

1. Add dashboards for `rv_segment_membership_change_rate` and `international_counterparty_concentration`.
2. Add cross-jurisdiction policy-artifact confidence scoring (`NSW`, `VIC`) and use it in compliance-rule deployment risk gating.
3. Backtest compliance-sensitive metrics with and without segment-aware RV counterparty controls.

## Sources for this update (pass 115)

- Racing Victoria, `Approved Wagering Service Providers` (four-class segmentation including `Interstate Oncourse Bookmakers`, plus international approved entities; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/wagering-service-providers
- Racing Victoria, `Race Fields Policy` (principal page linking policy bundle including clean + marked-up Standard Conditions and the 2025-26 guide; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/race-fields-policy

## Incremental architecture decisions from this run (2026-04-03, pass 116)

- Decision: add a `betfair_order_state_guard` that enforces market-version-aware order submission and tracks idempotency lineage.
- Why: Betfair `placeOrders` defines explicit stale-version lapse, 60-second `customerRef` dedupe behavior, async `PENDING` semantics, and partial-success mode when best execution is disabled.
- Decision: add a `stream_regime_classifier` with hard lineage labels for `live_filtered`, `delayed_conflated`, and `unfiltered_activation_feed` subscriptions.
- Why: Betfair stream docs now expose deterministic 3-minute conflation under delayed keys and all-market activation behavior when no filter is applied.
- Decision: add a `jurisdiction_authority_clock` service for AU race-information rulebooks.
- Why: RQ and GRNSW now show materially different authority horizons and fee/reporting pathways that must be replayed by effective period.
- Decision: add a `deduction_provenance_registry` keyed by jurisdiction/provider/method.
- Why: RQ comparison artifacts explicitly define QOP deduction service semantics (BetMakers), while other jurisdictions retain different deduction and fee constructs.

## Provider comparison (incremental high-signal additions, pass 116)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange API `placeOrders` | Primary execution contract for stale-version lapses, dedupe windows, async pending states, and partial batch outcomes | Requires strict capture of submit-time metadata; behavior depends on account settings (best execution) | A | Implement order-state guard and replay-aware error branches before broader auto-execution |
| Betfair support `Stream API access` + `unfiltered subscription` articles | Concrete stream-regime rules: delayed-key 3-minute conflation and activation-time `img=true` snapshots without market filters | Support docs can evolve; needs periodic recapture and regression checks | A | Add stream-regime lineage labels and block latency-sensitive training on delayed/unfiltered lineage |
| Racing Queensland race-information page + FY26-27 comparison PDF | Authority-window schedule, application-fee and reporting-template pathways, plus QOP deduction-service definitions | Comparison artifact is marked-up and parser-noisy; pair with base conditions for canonical parsing | A/A-B | Build authority-clock + deduction-provenance ingestion with clean/marked-up validation gate |
| GRNSW 2025-26 standard conditions (Version 1.1) | Explicit one-year approval period, fee cadence, application-fee thresholds, and bet-back/margin definitions | Jurisdiction-specific and annual versioned; requires effective-date snapshots | A | Add GRNSW-specific fee/margin contract tables and authority-expiry gating |

## Data contract additions required (incremental, pass 116)

- `betfair_order_submission_snapshot`:
- `capture_ts`, `market_id`, `market_version_sent`, `market_version_current`, `version_lapse_flag`, `customer_ref`, `customer_ref_dedupe_window_sec`, `best_execution_enabled_flag`, `async_flag`, `initial_order_status`, `initial_bet_id_present_flag`, `processed_with_errors_flag`, `source_url`.
- `betfair_stream_regime_snapshot`:
- `capture_ts`, `app_key_mode`, `conflation_window_sec`, `market_filter_present_flag`, `unfiltered_activation_feed_flag`, `initial_image_on_activation_flag`, `source_url`.
- `rq_authority_period_snapshot`:
- `capture_ts`, `effective_from`, `effective_to`, `new_applicant_fee_aud`, `authorized_wsp_list_url`, `source_url`.
- `rq_reporting_pathway_snapshot`:
- `capture_ts`, `pathway_type(standard|oncourse)`, `template_url`, `definitions_url`, `instructions_url`, `source_url`.
- `rq_deduction_service_snapshot`:
- `capture_ts`, `qop_service_defined_flag`, `qop_provider_name`, `qop_deductions_defined_flag`, `source_url`.
- `grnsw_authority_period_snapshot`:
- `capture_ts`, `effective_from`, `effective_to`, `application_fee_aud_ex_gst`, `low_turnover_threshold_aud`, `source_url`.
- `grnsw_fee_payment_timing_snapshot`:
- `capture_ts`, `monthly_due_business_days`, `payment_method_options_json`, `source_url`.
- `grnsw_margin_formula_snapshot`:
- `capture_ts`, `product_family(fixed_odds|tdo|tot|exchange)`, `formula_expression`, `eligible_betback_inclusion_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 116)

- For Betfair live execution, do we force `marketVersion` on every submit and fail closed on mismatch, or allow selective fallback for low-latency retries?
- What standard should govern `customerRef` generation to prevent accidental dedupe collisions during strategy burst traffic inside 60 seconds?
- Should delayed-key conflated stream captures be fully excluded from model training, or retained only for coarse non-latency features?
- For Queensland, do we treat QOP-based deductions as mandatory canonical values when available, or as one branch in a dual-source deduction reconciliation model?
- How should we harmonize two-year (RQ) versus one-year (GRNSW) authority clocks in compliance expiry alerts and fee-replay windowing?

## Ranked implementation backlog (delta, pass 116)

### P0 additions

1. Implement `betfair_order_state_guard` with mandatory submit-time capture of `marketVersion`, `customerRef`, async mode, and best-execution context.
2. Add `stream_regime_classifier` and hard-block latency-sensitive feature training when lineage is `delayed_conflated` or `unfiltered_activation_feed`.
3. Build `jurisdiction_authority_clock` for RQ and GRNSW with effective-date expiry checks wired into ingestion and reporting jobs.
4. Implement `deduction_provenance_registry` and require provenance tags on every fee/deduction record (`QOP`, operator, or other prescribed mechanism).

### P1 additions

1. Build reconciliation reports comparing QOP-derived versus operator-derived deduction paths on overlapping windows.
2. Add dashboards for `order_version_lapse_rate`, `customer_ref_dedupe_hit_rate`, and `processed_with_errors_rate`.
3. Add jurisdictional compliance alerts for `authority_days_to_expiry` and `reporting_template_mismatch_count`.

## Sources for this update (pass 116)

- Betfair Exchange API docs, `placeOrders` (updated 2025-01-07; marketVersion lapse behavior, `customerRef` dedupe window, async `PENDING`, and partial-success caveat; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair support, `How do I get access to the Stream API?` (updated 2024-06-21; delayed-key stream conflation behavior; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003887871-How-do-I-get-access-to-the-Stream-API
- Betfair support, `What happens if you subscribe to the Stream API without a market filter?` (updated 2026-03-03; unfiltered activation feed and initial image behavior; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Racing Queensland, `Race Information` (authority period, application-fee note, authorised-WSP list link, and reporting artifacts; accessed 2026-04-03): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland, `FY26-27 vs FY24-25 General Conditions Comparison` (QOP service/deduction definitions and prescribed-mechanism terms; accessed 2026-04-03): https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf
- GRNSW, `2025-26 RFIU Approval for Australian WSPs - Standard Conditions` (Version 1.1; approval period, fees, payment timing, and margin definitions; accessed 2026-04-03): https://www.grnsw.com.au/attachments/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCRFgwblFFPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--03efde82ee1bbbf899d10010754aa579ec9c791d/2025-26%20GRNSW%20RFIU%20Approval%20for%20Australian%20WSPs%20-%20Standard%20Conditions%20.pdf

## Incremental architecture decisions from this run (2026-04-03, pass 117)

- Decision: add a `betfair_delay_policy_epoch_watcher` that snapshots announcement-thread metadata and emits effective-date policy epochs.
- Why: Betfair announcement surfaces show continued post-January 2026 updates for passive/dynamic delay policy threads, so execution assumptions can drift without schema-level API changes.
- Decision: add an `rv_interstate_jurisdiction_matrix` under the Victorian counterparty registry.
- Why: RV interstate-oncourse rows include explicit per-counterparty jurisdiction sets, creating heterogeneous entitlement/routing risk within a single segment label.
- Decision: require epoch-aware and jurisdiction-aware joins in execution analytics.
- Why: both delay-policy churn and multi-jurisdiction counterparty changes create non-stationary fill/compliance behavior if flattened.

## Provider comparison (incremental high-signal additions, pass 117)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Program announcements + forum index | Dated policy-churn telemetry for passive/dynamic delay operations (active thread recency and update cadence) | Listing metadata is high-signal operational telemetry but may omit full rule-text details without thread snapshots | A/B | Implement delay-policy epoch watcher and gate fill/slippage model pooling across epochs |
| Racing Victoria `Approved Wagering Service Providers` page | Interstate-oncourse counterparty table with explicit jurisdiction sets (single-state vs multi-state topology) | Dynamic web list with no versioned diff feed; requires periodic snapshotting | A | Build interstate jurisdiction matrix and enforce `{counterparty, venue_jurisdiction}` entitlement checks |

## Data contract additions required (incremental, pass 117)

- `betfair_delay_policy_thread_snapshot`:
- `capture_ts`, `thread_title`, `thread_url`, `thread_posts_count`, `last_post_local_ts`, `last_post_author`, `source_url`.
- `betfair_delay_policy_epoch_event`:
- `event_ts`, `policy_surface`, `event_type(thread_update|new_thread|sticky_update)`, `event_source`, `source_url`.
- `rv_interstate_oncourse_snapshot`:
- `capture_ts`, `counterparty_name`, `jurisdictions_raw`, `jurisdictions_json`, `jurisdiction_count`, `multi_jurisdiction_flag`, `source_url`.
- `rv_interstate_oncourse_membership_event`:
- `event_ts`, `counterparty_name`, `old_jurisdictions_json`, `new_jurisdictions_json`, `change_type(add|remove|replace)`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 117)

- What minimum evidence threshold should promote forum-listing churn signals (`A/B`) into hard execution-governor toggles versus monitoring-only flags?
- Should `betfair_delay_policy_epoch_watcher` snapshot only thread metadata daily, or also archive full thread content when update timestamps advance?
- For RV interstate-oncourse counterparties, do we enforce hard venue-jurisdiction gating immediately, or begin with soft alerts until historical false-positive rates are known?
- What snapshot cadence is required to catch meaningful RV jurisdiction-set changes without excessive operational churn (hourly, daily, or weekly)?

## Ranked implementation backlog (delta, pass 117)

### P0 additions

1. Implement `betfair_delay_policy_epoch_watcher` and block cross-epoch pooling in fill/slippage training until delay-policy state is explicit.
2. Implement `rv_interstate_jurisdiction_matrix` and enforce `{counterparty, venue_jurisdiction}` entitlement checks in routing and reconciliation.
3. Add change-diff jobs for announcement metadata and RV interstate jurisdiction sets, with immutable effective-date event logs.

### P1 additions

1. Add `delay_policy_churn_score` to execution-quality dashboards and test predictive value for fill/slippage instability.
2. Add `interstate_oncourse_fragmentation_index` dashboards (single-state vs multi-state share) for governance concentration monitoring.
3. Run sensitivity tests comparing segment-only vs jurisdiction-aware RV controls for compliance incident and reconciliation drift.

## Sources for this update (pass 117)

- Betfair Developer Program forum root listing (announcement activity snapshot and thread recency context; crawled 2026-04-03): https://forum.developer.betfair.com/
- Betfair Developer Program announcements index (active/sticky delay-policy thread metadata with latest post dates; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements
- Racing Victoria, `Approved Wagering Service Providers` (interstate-oncourse jurisdiction-string rows; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/wagering-service-providers

## Incremental architecture decisions from this run (2026-04-03, pass 118)

- Decision: add a `betfair_passive_delay_rollout_timeline` service keyed by dated thread-post milestones.
- Why: thread-level evidence shows staged coverage transitions (`odd_id_subset` -> tournament-wide -> sport-wide), which are materially richer than announcement-index recency.
- Decision: add a `betfair_contract_revision_precedence_guard` for mutable announcement-thread guidance.
- Why: `betDelayModels` thread history includes release-date changes and a correction from apparent reject semantics to normal-delay fallback for non-compliant orders.
- Decision: separate `policy_state` and `enforcement_state` in execution controls.
- Why: forum contracts can keep feature state constant (`PASSIVE` exists) while changing enforcement outcomes for attribute violations.

## Provider comparison (incremental high-signal additions, pass 118)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair `No Delays on Passive Bets` thread (page-level posts) | Dated rollout phases for passive no-delay coverage (odd IDs, tournament-wide, then full sport coverage) with milestone narrative | Forum-post telemetry; chronology is strong but remains announcement-layer, so must be versioned | A/B | Implement rollout timeline service and enforce phase-aware segmentation in fill/slippage analytics |
| Betfair `betDelayModels` update thread | Intra-release contract changes (dates, order requirements, and corrected non-compliant-order outcome) | Mutable thread content can supersede earlier replies; requires precedence rules by timestamp/edit state | A/B | Implement contract-revision precedence guard and avoid hard-fail validators from superseded guidance |

## Data contract additions required (incremental, pass 118)

- `betfair_passive_delay_rollout_event`:
- `event_ts`, `sport`, `coverage_mode`, `scope_note`, `source_thread_url`, `source_thread_post_id`.
- `betfair_contract_revision_event`:
- `event_ts`, `contract_surface`, `requirement_snapshot_json`, `release_date_announced`, `release_date_revised`, `source_thread_post_id`, `source_url`.
- `betfair_non_compliant_passive_outcome_snapshot`:
- `capture_ts`, `order_attribute_profile_json`, `expected_outcome(normal_delay|reject)`, `evidence_post_id`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 118)

- What confidence threshold should promote forum-thread corrections into production execution policy when formal reference docs lag?
- Do we require a dual-source confirmation rule (forum + API docs) before changing hard validation logic, or allow forum-first hotfix behavior behind feature flags?
- How should we map passive-delay rollout phases to historical training windows when exact intraday switch timestamps are approximate (`around midday`)?

## Ranked implementation backlog (delta, pass 118)

### P0 additions

1. Implement `betfair_passive_delay_rollout_timeline` ingestion from thread-post chronology and join it into fill/slippage training windows.
2. Implement `betfair_contract_revision_precedence_guard` that orders thread statements by publish/edit timestamp and blocks stale-rule deployment.
3. Add executor guardrails so non-compliant PASSIVE attribute combinations default to normal-delay handling unless latest evidence confirms reject semantics.

### P1 additions

1. Add `passive_rollout_phase_drift` and `contract_revision_latency` dashboards for policy-ops observability.
2. Backtest execution-quality metrics across rollout phases (`odd_id_subset`, `tournament_full`, `sport_full`) to estimate regime-transfer risk.
3. Add regression tests that replay superseded-vs-current forum guidance and verify policy-engine precedence behavior.

## Sources for this update (pass 118)

- Betfair Developer Program thread, `No Delays on Passive Bets - Selected Events - PLEASE SUBSCRIBE FOR UPDATES` (thread-level rollout milestones including French Open full trial and 100% tennis/baseball activation notes; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements/40962-no-delays-on-passive-bets-selected-events-please-subscribe-for-updates/page4
- Betfair Developer Program thread, `UPDATE - Betfair API Release 4th September - New Field - betDelayModels` (order requirements, release-date changes, and clarified non-compliant-order outcome; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements/42128-betfair-api-release-28th-august-%E2%80%93-new-field-betdelaymodels
- Betfair Developer Program announcements index (dynamic-delay sticky recency and chronology context; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements

## Incremental architecture decisions from this run (2026-04-03, pass 119)

- Decision: add a `policy_exception_calendar` service for CAW-rule timelines.
- Why: NYRA evidence indicates temporary one-day suspension and later reinstatement of new CAW guardrails, so policy state is not reliably represented by a single effective-date row.
- Decision: formalize policy-state transitions (`announced -> effective -> temporary_suspend -> reinstated`) as first-class replay/execution inputs.
- Why: exception windows can materially change late-odds dynamics and fill behavior if treated as normal-policy days.
- Decision: add source-confidence weighting for policy updates.
- Why: some near-real-time policy deltas arrive through secondary channels first and need controlled promotion into hard execution gates.

## Provider comparison (incremental high-signal additions, pass 119)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Equibase relayed NYRA/BloodHorse policy update (`2026-02-06`) | Dated temporary-suspension and reinstatement-window signal for newly effective CAW guardrails | Secondary relay surface; requires later primary corroboration for permanent-control promotion | B | Ingest as provisional policy-event telemetry with confidence tags and override expiry |
| NYRA Aqueduct racing page calendar context | Official date context confirming February interruption/resumption window (`Racing returns Feb 11`) | Calendar context does not itself define CAW-policy clauses | A/B | Use as date-anchor corroboration for policy-event timeline windows |

## Data contract additions required (incremental, pass 119)

- `policy_exception_event`:
- `event_ts`, `jurisdiction`, `policy_name`, `transition_type`, `effective_from`, `expected_resume_ts`, `exception_reason`, `source_quality`, `source_url`.
- `policy_state_epoch`:
- `jurisdiction`, `policy_name`, `epoch_id`, `epoch_state`, `epoch_start_ts`, `epoch_end_ts`, `confidence_score`.
- `execution_policy_context`:
- `market_id`, `event_ts`, `policy_epoch_id`, `policy_exception_window_flag`, `source_quality_floor_applied_flag`.

## Open questions to resolve before implementation freeze (incremental, pass 119)

- What minimum corroboration rule should upgrade a secondary-sourced policy exception from monitoring-only to hard execution gating?
- Should policy exceptions auto-expire without explicit reinstatement evidence, or persist until manually cleared?
- How should backtests treat low-confidence policy epochs: exclude, downweight, or include with uncertainty labels?

## Ranked implementation backlog (delta, pass 119)

### P0 additions

1. Implement `policy_exception_calendar` and wire policy-state epochs into replay and live execution context joins.
2. Add policy-source confidence gates so secondary updates can trigger soft guards immediately but require corroboration for hard blocks.
3. Add historical backtest segmentation by policy-state epoch (`effective`, `temporary_suspend`, `reinstated`) for CAW-sensitive venues.

### P1 additions

1. Build a policy-event corroboration job that attempts to match secondary alerts to primary venue/regulator artifacts.
2. Add dashboards for `policy_exception_count`, `exception_duration`, and `low_confidence_policy_usage_rate`.

## Sources for this update (pass 119)

- Equibase, `NYRA Suspends New CAW Restrictions During Feb. 6 Card` (submitted 2026-02-06; suspension/reinstatement timeline context): https://cms.equibase.com/node/313508
- NYRA Aqueduct racing page (February 2026 calendar context and return-date banner): https://www.nyra.com/aqueduct/racing/?day=2026-02-21&limit=entries

## Incremental architecture decisions from this run (2026-04-03, pass 120)

- Decision: add a `participant_registry_exception_window` service for ownership/declaration policy events.
- Why: Racing Australia's 31 March 2026 Late FOD Amnesty introduces a one-time, deadline-bounded correction window for foals from the 2024/2025 seasons.
- Decision: keep a hard `provider_publication_gap_slo` for monthly KPI ingestion.
- Why: Racing Australia's performance index captured on 2026-04-03 still lists January 2026 as latest for FY 2025-2026, so month+1 assumptions are unsafe.
- Decision: split metadata-quality signals into `policy_exception` and `publication_staleness` dimensions.
- Why: one is a bounded compliance/event override (FOD amnesty), the other is recurring reporting-lag risk (monthly KPI publication gap).

## Provider comparison (incremental high-signal additions, pass 120)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia media release index (`31 Mar 2026` Late FOD Amnesty) | Primary dated exception-window event with explicit scope (`2024/2025` foals) and hard deadline (`14 Apr 2026 5:30pm AEST`) | Media-release layer summarizes rule application; downstream system effects still need measured telemetry | A | Add participant-registry exception window and post-deadline drift checks |
| Racing Australia monthly performance report index (`captured 3 Apr 2026`) | Direct publication-cadence signal showing `January 2026` still latest in FY 2025-2026 list | Absence of a month entry does not explain cause; requires lag-aware alert thresholds | A/B | Keep publication-gap SLO and staleness-weighted provider-health controls |

## Data contract additions required (incremental, pass 120)

- `participant_registry_exception_event`:
- `event_ts`, `provider`, `event_name`, `scope_json`, `deadline_local_ts`, `one_time_flag`, `rules_referenced_json`, `source_url`.
- `participant_registry_quality_snapshot`:
- `capture_ts`, `runner_id`, `ownership_declared_flag`, `declaration_lag_days`, `exception_window_flag`, `source_lineage`.
- `provider_publication_gap_snapshot`:
- `capture_ts`, `provider`, `artifact_family`, `fiscal_cycle`, `latest_report_label`, `expected_next_report_label`, `gap_days`, `missing_expected_report_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 120)

- For the Late FOD Amnesty, do we treat post-deadline late declarations as hard-invalid for model features, or soft-penalized pending subsequent regulatory updates?
- What `gap_days` threshold should trigger degraded-mode behavior for monthly KPI-dependent provider-health scoring?
- Should exception-window events be replayed into feature-store backfills as immutable labels, or recalculated from source snapshots at query time?

## Ranked implementation backlog (delta, pass 120)

### P0 additions

1. Implement `participant_registry_exception_window` ingestion for the RA Late FOD Amnesty with immutable scope/deadline fields.
2. Add `provider_publication_gap_slo` checks to provider-health jobs and alerting (explicitly keyed to FY cycle + expected month).
3. Add replay-safe labels (`exception_window_flag`, `declaration_lag_days`, `missing_expected_report_flag`) to feature and monitoring datasets.

### P1 additions

1. Run post-`14 Apr 2026` drift analysis on ownership/declaration completeness and model sensitivity.
2. Backtest reliability-weighted execution controls with and without publication-gap penalties to quantify false-positive alert risk.
3. Add dashboard panels for `exception_window_active_count` and `provider_kpi_publication_gap_days`.

## Sources for this update (pass 120)

- Racing Australia media releases index (includes `31 March 2026` `Statement on Late FOD Amnesty` entry and deadline text; accessed 2026-04-03): https://www.racingaustralia.horse/FreeServices/MediaReleases.aspx
- Racing Australia Monthly Service Standard Performance Report index (latest visible FY 2025-2026 entry remains `January 2026` at capture time; accessed 2026-04-03): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental architecture decisions from this run (2026-04-03, pass 121)

- Decision: add a `market_poll_cadence_guard` with immutable per-market caps for Betfair collectors.
- Why: Betfair `listMarketBook` now adds an explicit operation-level ceiling (`max 5 calls/sec per marketId`) that is orthogonal to request-weight budgeting.
- Decision: add an `nsw_bet_type_policy_registry` keyed by effective-date RFIU versions.
- Why: Racing NSW primary artifacts expose versioned bet-type permission taxonomy (prohibited vs conditionally approved), which directly affects legal product-surface eligibility.
- Decision: add a `governance_deadline_calendar_ingestor` for CHRB schedule metadata.
- Why: CHRB publishes meeting, agenda-request, notice, and materials deadlines with change notices; this enables proactive CAW/ADW policy-watch scheduling and parser anomaly detection.

## Provider comparison (incremental high-signal additions, pass 121)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Exchange API `listMarketBook` docs | Explicit per-market polling cadence contract (`<=5 calls/sec` to one marketId) in addition to projection/request rules | Operation docs may evolve; requires version capture and runtime telemetry to detect drift | A | Implement per-market cadence guard as a hard pre-dispatch gate |
| Racing NSW historical RFIU archive + Clause 5.6 PDF | Date-versioned policy lineage and concrete bet-type prohibition/qualification taxonomy | Archive spans older seasons; current applicability must be resolved by effective-date joins | A | Build effective-date bet-type policy registry and block non-compliant market-surface routing |
| CHRB 2026 meeting schedule | Deterministic governance-deadline feed (agenda request / notice / materials due dates) plus explicit schedule-change notices | Calendar page can include formatting anomalies and is not itself final rule text | A/A-B | Add governance deadline ingestor + anomaly flags to policy-watch orchestration |

## Data contract additions required (incremental, pass 121)

- `betfair_market_polling_contract_snapshot`:
- `capture_ts`, `operation_name`, `max_calls_per_market_per_second`, `contract_updated_date`, `source_url`.
- `market_poll_rate_violation_event`:
- `event_ts`, `market_id`, `observed_calls_per_second`, `allowed_calls_per_second`, `collector_id`, `source_contract_url`.
- `nsw_rfiu_policy_version_snapshot`:
- `capture_ts`, `policy_doc_label`, `effective_from`, `effective_to`, `source_url`.
- `nsw_bet_type_policy_rule`:
- `capture_ts`, `policy_version`, `bet_type_name`, `policy_state`, `qualification_text`, `source_url`.
- `chrb_board_calendar_event`:
- `capture_ts`, `meeting_date`, `location_text`, `agenda_request_due_date`, `notice_post_date`, `public_comment_due_date`, `location_change_notice_flag`, `date_format_anomaly_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 121)

- Do we hard-fail collector dispatch above the Betfair per-market `5/s` cap, or allow temporary burst tolerance with immediate cooldown?
- For NSW bet-type policy rules, what is the minimum evidence needed to map historical Clause 5.6 categories into current product-taxonomy IDs without false positives?
- Should CHRB calendar anomalies (for example malformed date strings) automatically downgrade policy-watch confidence and require human acknowledgement before scheduling downstream tasks?
- What lead-time threshold before agenda/material deadlines should trigger intensified policy-artifact polling for CAW/ADW governance changes?

## Ranked implementation backlog (delta, pass 121)

### P0 additions

1. Implement `market_poll_cadence_guard` enforcing Betfair `listMarketBook <=5 calls/sec/marketId` with pre-dispatch rejection and telemetry.
2. Build `nsw_bet_type_policy_registry` with effective-date joins and execution prechecks blocking prohibited bet-type surfaces.
3. Implement `governance_deadline_calendar_ingestor` for CHRB schedule rows, deadline fields, and anomaly flags.
4. Wire `calendar_anomaly_flag` and `policy_version_missing_flag` into compliance-risk dashboards and routing guards.

### P1 additions

1. Add weekly diff jobs for Racing NSW archive artifacts to detect new annual standard-condition drops or clause-level attachments.
2. Add dashboards for `per_market_poll_rate_violation_count`, `bet_type_policy_block_rate`, and `governance_deadline_miss_risk`.
3. Backtest strategy sensitivity to exclusion of windows captured under cadence violations or unresolved bet-type policy state.

## Sources for this update (pass 121)

- Betfair Exchange API Documentation, `listMarketBook` (updated 2024-06-04; explicit per-market `<=5/s` call-rate guidance; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook
- Racing NSW, `Previous Acts, Regulations and Standard Conditions` (historical RFIU artifacts and amendment links; accessed 2026-04-03): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/previous-acts-regulations-and-standard-conditions/
- Racing NSW PDF, `RFIU Standard Conditions 2014-2015 ... Clause 5.6 Bet Types` (explicit prohibited/conditionally approved bet-type taxonomy; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/RFIU-Standard-Conditions-2014-2015-For-Australian-Wagering-Operators-2014-15-Clause-5.6-Bet-Types.pdf
- California Horse Racing Board, `2026 Meeting Schedule` (meeting/deadline calendar plus change notice context; accessed 2026-04-03): https://www.chrb.ca.gov/meeting_schedule_2026.html

## Incremental architecture decisions from this run (2026-04-03, pass 122)

- Decision: add an `nsw_bet_back_operator_registry` as a first-class compliance/economics dimension.
- Why: Racing NSW publishes an operator-level approved roster (with jurisdiction + effective date) for bet-back credits, so rebate assumptions cannot remain venue-level constants.
- Decision: add a `chrb_meet_window_calendar` alongside existing CHRB meeting-deadline ingestion.
- Why: CHRB's 2026 racing schedule provides venue-level allocated date blocks that form deterministic regime boundaries distinct from board agenda cadence.
- Decision: add staleness scoring to approval/calendar artifacts.
- Why: primary artifacts can remain published across long windows; model/execution confidence should degrade when source periods age beyond policy thresholds.

## Provider comparison (incremental high-signal additions, pass 122)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing NSW `Bet Back` approval roster PDF | Operator-level whitelist with jurisdiction and effective-date attributes for bet-back eligibility | Captured artifact is period-specific; publication cadence and conditions can change | A | Build operator-identity join + effective-date eligibility table for rebate-aware PnL attribution |
| CHRB `2026 Racing Schedule` | Venue/date-block allocation calendar plus explicit allocation-meeting provenance | Allocated blocks are not equal to final live-day schedule; must reconcile with approved applications | A | Add meet-window calendar ingestion and boundary-triggered monitoring layer |
| Racing NSW `Race Field Information Use` index hub | Current link topology to policy/approval artifacts on one page | Link targets can change without schema/version notices | A/B | Add crawler checks for link-set drift and artifact-availability alerts |

## Data contract additions required (incremental, pass 122)

- `nsw_bet_back_approval_snapshot`:
- `capture_ts`, `period_label`, `source_url`, `source_hash`.
- `nsw_bet_back_operator_approval`:
- `capture_ts`, `operator_name`, `jurisdiction_label`, `effective_date`, `conditions_text_present_flag`, `source_url`.
- `chrb_race_date_block_snapshot`:
- `capture_ts`, `source_url`, `source_hash`.
- `chrb_race_date_block`:
- `venue_name`, `code_type`, `allocated_start_date`, `allocated_end_date`, `allocation_meeting_date`, `actual_live_days_determined_later_flag`, `source_url`.
- `policy_artifact_staleness_state`:
- `artifact_type`, `artifact_period_start`, `artifact_period_end`, `days_since_period_end`, `staleness_level(green|amber|red)`, `computed_ts`.

## Open questions to resolve before implementation freeze (incremental, pass 122)

- For NSW bet-back eligibility, should unknown/unmapped operator identity default to `ineligible` (conservative) or `unresolved` (manual review required) in live routing?
- What staleness thresholds should trigger confidence downgrade for operator-approval rosters (for example 90 vs 180 days beyond period end)?
- Should CHRB allocated date blocks be treated as hard regime boundaries for model segmentation, or only as priors blended with observed handle/liquidity shifts?
- Do we need a dedicated canonical-entity service to map `trading as` labels to legal entities across regulator documents before rebate joins?

## Ranked implementation backlog (delta, pass 122)

### P0 additions

1. Implement `nsw_bet_back_operator_registry` ingestion/parsing with canonical-identity matching and effective-date joins.
2. Add `counterparty_bet_back_eligible_flag` to settlement/PnL attribution and block unsupported assumptions in reporting pipelines.
3. Implement `chrb_meet_window_calendar` ingestion and publish `meet_boundary_proximity_days` features for monitoring/model consumers.
4. Add `policy_artifact_staleness_state` computation and route-confidence degradation when artifact staleness is amber/red.

### P1 additions

1. Build weekly link-set diff checks on Racing NSW race-field index pages to detect artifact URL churn early.
2. Add dashboards for `unmapped_operator_identity_rate`, `bet_back_eligibility_coverage`, and `meet_boundary_regime_shift_alerts`.
3. Backtest whether CHRB meet-boundary segmentation improves late-odds drift and fill-quality calibration versus monthly segmentation.

## Sources for this update (pass 122)

- Racing NSW, `Race Field Information Use` index page (current artifact-link hub; accessed 2026-04-03): https://www.racingnsw.com.au/race-field-information-use/
- Racing NSW PDF, `Bet Back - Approved Licensed Wagering Operators ... (subject to conditions)` (operator/jurisdiction/effective-date roster; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Bet-Back-Approvals-2020-21.pdf
- California Horse Racing Board, `2026 Racing Schedule` (allocated date blocks + allocation provenance note; accessed 2026-04-03): https://chrb.ca.gov/racing_schedule_2026.html

## Incremental architecture decisions from this run (2026-04-03, pass 123)

- Decision: add an `nsw_bet_back_claim_rules_engine` as a hard post-trade economics dependency.
- Why: Racing NSW's primary bet-back definition is rule-constrained (genuine layoff, same contingency, win<=existing liability, approved account/operator path), so flat rebate assumptions are not policy-safe.
- Decision: add an `nsw_bet_back_publication_health_monitor` for roster staleness.
- Why: the official page claims regular updates while currently exposing `2020-21` roster artifacts; stale publication windows should degrade confidence in automated eligibility attribution.
- Decision: persist `roster_type` (`sole_trader` vs `company_tab_exchange`) in operator identity mapping.
- Why: roster families are published separately and need separate parsing/normalization paths before canonical counterparty joins.

## Provider comparison (incremental high-signal additions, pass 123)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing NSW approved-operator page | Canonical page-level claim of update cadence plus formal bet-back qualification logic and qualifying-operator constraints | Page-level "updated regularly" claim can diverge from visible linked roster recency | A | Add publication-health checks and rule-engine enforcement before rebate-adjusted PnL attribution |
| Racing NSW `Sole Trader` + `Company/TAB/Exchange` 2020-21 PDFs | Structured roster artifacts with entity/jurisdiction/effective-date fields split by roster family | Period-specific and currently stale relative to capture date; requires conservative defaults and staleness states | A | Keep roster-family-aware ingestion and enforce date-effective eligibility joins with staleness downgrades |

## Data contract additions required (incremental, pass 123)

- `nsw_bet_back_page_snapshot`:
- `capture_ts`, `page_url`, `updated_regularly_claim_flag`, `visible_roster_period_min`, `visible_roster_period_max`, `visible_roster_count`, `source_url`.
- `nsw_bet_back_roster_link`:
- `capture_ts`, `roster_type`, `period_label`, `artifact_url`, `source_url`.
- `nsw_bet_back_claim_rule`:
- `capture_ts`, `same_contingency_required_flag`, `genuine_layoff_required_flag`, `win_leq_existing_liability_flag`, `account_based_required_flag`, `cash_claim_disallowed_flag`, `operator_approval_required_flag`, `fee_payment_qualification_required_flag`, `source_url`.
- `nsw_bet_back_publication_health`:
- `capture_ts`, `latest_visible_period_end`, `days_since_latest_period_end`, `staleness_level(green|amber|red)`, `fallback_policy_applied_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 123)

- What staleness threshold should force `rebate_assumption_mode=conservative` for NSW bet-back attribution (for example `>365` vs `>730` days since latest period end)?
- Should `updated regularly` page claims be treated as advisory only, with hard controls driven exclusively by artifact recency and effective-date coverage?
- For unmatched operator identities, should live routing default to `bet_back_ineligible` or `manual_review_required` when publication health is amber/red?

## Ranked implementation backlog (delta, pass 123)

### P0 additions

1. Implement `nsw_bet_back_claim_rules_engine` and block rebate-adjusted economics unless all claim predicates are satisfied.
2. Implement `nsw_bet_back_publication_health_monitor` with conservative fallback when roster recency breaches threshold.
3. Add roster-family-aware parsers (`sole_trader`, `company_tab_exchange`) plus canonical entity matching with effective-date joins.
4. Add routing/reporting guards that require explicit `eligibility_state` (`eligible|ineligible|unresolved_stale`) for every bet-back-attributed row.

### P1 additions

1. Add weekly crawler checks for roster-link period changes and page-text drift on the approved-operator page.
2. Add dashboards for `bet_back_unresolved_stale_rate`, `rebate_assumption_fallback_rate`, and `roster_family_parse_fail_rate`.
3. Backtest sensitivity of net-edge attribution under strict vs permissive defaults during stale-roster windows.

## Sources for this update (pass 123)

- Racing NSW, `Approved Licensed Wagering Operators` page (update-cadence claim + bet-back qualification conditions + roster links; accessed 2026-04-03): https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/
- Racing NSW PDF, `Sole Trader Bookmakers 2020-21` (roster artifact with operator/jurisdiction/effective-date rows; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Sole-Trader-Bookmakers-2020-2021.pdf
- Racing NSW PDF, `Company Bookmakers, Corporates, TABs and Betting Exchange 2020-21` (roster artifact with operator/jurisdiction/effective-date rows; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Company-Bookmakers-2020-2021.pdf

## Incremental architecture decisions from this run (2026-04-03, pass 124)

- Decision: add a `market_microstructure_clock` subsystem that persists raw-vs-virtual ladder lineage and stream clock continuity.
- Why: Betfair docs now provide explicit virtual-price lag (`~150ms`) and heartbeat/`clk` semantics that are operationally material for late execution replay.
- Decision: gate all microstructure evaluation and live-readiness checks by `app_key_capability_regime`.
- Why: delayed keys can be `1-180s` stale and omit key fields (`EX_ALL_OFFERS`, selection-level `totalMatched`), so they cannot be treated as execution-truth equivalents.
- Decision: add a venue-level `caw_policy_regime` dimension with explicit cutoff thresholds and effective windows.
- Why: NYRA and Keeneland now publish machine-usable CAW control and participation-mix signals that affect end-of-market volatility.
- Decision: split provider onboarding into two independent scores: `coverage_quality` and `deployment_rights`.
- Why: Punting Form primary docs show strong data-coverage claims but tier-specific/personal-use entitlement constraints.

## Provider comparison (incremental high-signal additions, pass 124)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support + API docs (`market data`, `heartbeat`, `application keys`, `additional info`) | Microstructure contracts: virtual update lag, heartbeat/clock behavior, tick ladder validity, key-tier capability matrix, in-play `betDelay` | Contract details can change by doc version; delayed keys are not full-fidelity execution data | A | Build clock-aware ingestion + capability-gated evaluation; hard-block invalid-odds and delayed-key misuse in execution QA |
| NYRA CAW guardrails announcement (`2026-01-30`) | Explicit CAW threshold definition and pool cutoff windows by time-to-post | Venue-specific policy, US jurisdiction | A | Use as policy-regime design template for rules engine and late-window feature schema |
| Keeneland wagering-experience disclosure | Declared wagering mix including CAW share and final-window odds refresh cadence | Venue communication layer, not API feed | A/B | Ingest as regime-context metadata for volatility diagnostics and policy-watch benchmarking |
| Punting Form docs (`sectional data`, endpoint reference, developer API) | Coverage claims, endpoint/tier requirements, token-auth requirements, personal-use API boundary | Marketing/docs layer must be validated against contract | A/A-B | Add entitlement-contract gate and separate procurement checks for commercial deployment eligibility |

## Data contract additions required (incremental, pass 124)

- `market_microstructure_clock_event`:
- `event_ts`, `market_id`, `clk`, `message_type`, `is_virtualised_view`, `raw_vs_virtual_lag_ms`, `heartbeat_gap_ms`, `source_url`.
- `market_price_ladder_contract_snapshot`:
- `capture_ts`, `price_ladder_type`, `tick_table_json`, `invalid_odds_error_code`, `source_url`.
- `app_key_capability_regime_snapshot`:
- `capture_ts`, `account_id`, `key_type`, `delay_range_sec_min`, `delay_range_sec_max`, `ex_all_offers_available_flag`, `selection_total_matched_available_flag`, `commercial_approval_required_flag`, `source_url`.
- `venue_caw_policy_regime`:
- `capture_ts`, `venue_id`, `policy_name`, `caw_speed_threshold_bets_per_sec`, `cutoff_sec_to_post_win_pool`, `cutoff_sec_to_post_other_pools`, `effective_from`, `effective_to`, `source_url`.
- `venue_wager_mix_snapshot`:
- `capture_ts`, `venue_id`, `period_label`, `caw_share_pct`, `adw_share_pct`, `brick_mortar_share_pct`, `ontrack_share_pct`, `odds_refresh_sec_final_window`, `source_url`.
- `provider_entitlement_coverage_snapshot`:
- `capture_ts`, `provider_name`, `endpoint_name`, `required_tier`, `personal_use_only_flag`, `token_auth_required_flag`, `coverage_metric_name`, `coverage_metric_value`, `coverage_scope_text`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 124)

- What hard thresholds should quarantine microstructure research windows with missing/unstable `clk` continuity?
- Should late-trigger logic always use raw offers and reserve displayed/virtual offers for diagnostics only?
- For environments still on delayed keys, do we fully block CLV/fill-model training or allow downgraded exploratory-only runs?
- Which entitlement evidence is sufficient to upgrade Punting Form-derived features from research-only to production-eligible?
- Do we need a jurisdiction-agnostic CAW policy schema now, or keep US/AU policy regimes separate until AU primary disclosures are equally explicit?

## Ranked implementation backlog (delta, pass 124)

### P0 additions

1. Implement `market_microstructure_clock` ingestion with strict `clk` continuity checks and heartbeat-gap telemetry.
2. Add `app_key_capability_regime` guards that block execution-quality analytics on delayed-key captures.
3. Enforce Betfair price-ladder validation before order creation to eliminate `INVALID_ODDS` rejects.
4. Add `betDelay`-aware timing in execution simulator and live policy checks for in-play windows.
5. Add provider-gating logic requiring explicit `deployment_rights` confirmation before promoting any provider-dependent feature set.

### P1 additions

1. Build `venue_caw_policy_regime` tables and join them into late-volatility diagnostics and backtest segmentation.
2. Add dashboards for `raw_virtual_lag_ms`, `heartbeat_gap_rate`, `delayed_key_usage_rate`, and `invalid_odds_reject_rate`.
3. Add `coverage_quality` vs `rights_status` comparison panel for vendor procurement and model-lineage audits.

### P2 additions

1. Extend CAW regime ingestion to additional venues/jurisdictions and quantify transferability to AU late-market behavior.
2. Build automated doc-version diff monitors for Betfair contract pages and provider entitlement pages.
3. Backtest impact of excluding displayed/virtual lag-affected windows on CLV and fill-probability calibration.

## Sources for this update (pass 124)

- Betfair Developer Program, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Betfair Developer Program, `Market Streaming - How do the Heartbeat and Conflation requests work?` (updated 2024-04-23; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360000402611-Market-Streaming-How-do-the-Heartbeat-and-Conflation-requests-work
- Betfair Exchange API docs, `Additional Information` (price increments and `INVALID_ODDS`; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Betfair Exchange API docs, `Application Keys` (delayed/live capability split and commercial-usage note; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687105/Application%20Keys
- Betfair Developer Program, `Why do you have a delay on placing bets on a market that is in-play` (in-play delay semantics; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- NYRA, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; accessed 2026-04-03): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Keeneland, `Wagering Experience` (wagering-channel composition and odds-refresh cadence; accessed 2026-04-03): https://www.keeneland.com/wagering-experience
- Punting Form docs, `Sectional Data` (coverage claims; accessed 2026-04-03): https://docs.puntingform.com.au/docs/sectional-data
- Punting Form docs, `Sectionals` endpoint (tier + auth requirements; accessed 2026-04-03): https://docs.puntingform.com.au/reference/meetingsectionals
- Punting Form, `Developer API` (personal-use API statement; accessed 2026-04-03): https://www.puntingform.com.au/developer/api/

## Incremental architecture decisions from this run (2026-04-03, pass 125)

- Decision: add a `rights_owner_topology_resolver` to provider onboarding and runtime entitlement checks.
- Why: Podium's product page explicitly states full coverage requires multiple rights-owner agreements, so entitlement is graph-shaped rather than provider-binary.
- Decision: split provider readiness into `transport_ready` (`REST`/`PUSH`) and `rights_ready` (agreement-complete by scope/jurisdiction).
- Why: endpoint integration can be healthy while rights coverage is partial; production routing needs both dimensions.

## Provider comparison (incremental high-signal additions, pass 125)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Podium horse-racing API product page | First-party statement of delivery modes (`REST` + `PUSH`), broad racecourse coverage claim (`300+`), and explicit multi-rights-owner requirement for full coverage | Product-page evidence; rights-owner and SLA details still require contract artifacts | A/B | Add rights-topology resolver and block production promotion when required rights-owner agreements are incomplete |

## Data contract additions required (incremental, pass 125)

- `provider_rights_topology_snapshot`:
- `capture_ts`, `provider_name`, `claimed_racecourse_count`, `delivery_mode_rest_flag`, `delivery_mode_push_flag`, `multi_rights_owner_required_flag`, `source_url`.
- `rights_owner_agreement_state`:
- `capture_ts`, `provider_name`, `rights_owner_id`, `jurisdiction`, `coverage_scope`, `agreement_state(missing|pending|active|expired)`, `effective_from`, `effective_to`, `source_url`.
- `provider_readiness_state`:
- `capture_ts`, `provider_name`, `transport_ready_flag`, `rights_ready_flag`, `rights_topology_completeness_score`, `promotion_block_reason`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 125)

- What minimum rights-owner agreement coverage threshold qualifies a provider path as `production-eligible` for NSW/VIC win pilot?
- Should missing rights-owner agreements trigger hard block globally, or scoped block only for affected tracks/products?
- What contract artifact standard is needed to upgrade Podium rights claims from `A/B` to `A` evidence in entitlement scoring?

## Ranked implementation backlog (delta, pass 125)

### P0 additions

1. Implement `rights_owner_topology_resolver` and enforce scope-aware entitlement checks before feature promotion.
2. Add `provider_readiness_state` with dual gates (`transport_ready`, `rights_ready`) and hard-block on incomplete rights topology.
3. Persist `rights_owner_agreement_state` snapshots and wire agreement expiry into routing kill-switches.

### P1 additions

1. Add rights-gap dashboards by jurisdiction/track/product (`missing|pending|expired` rates).
2. Backtest feature stability under simulated rights-topology degradation to quantify fallback behavior.
3. Add contract-diff monitoring to detect rights-owner scope changes that affect active provider paths.

## Sources for this update (pass 125)

- Podium, `Horse Racing API - Real-Time Data & Betting Markets` (REST/PUSH delivery, coverage claim, and multi-rights-owner requirement statement; accessed 2026-04-03): https://podiumsports.com/horse-racing-api/

## Incremental architecture decisions from this run (2026-04-03, pass 126)

- Decision: add a `betfair_account_state_guard` before every collector/execution session.
- Why: Betfair support confirms a nominal Live App Key can still deliver delayed data when account funding/override conditions are not satisfied.
- Decision: add a `geo_market_visibility_filter` to market-discovery and anomaly pipelines.
- Why: Betfair support documents location-constrained market visibility (including Singapore horse-market AUS/NZ eligibility), so empty responses are not always liquidity failures.
- Decision: add a `qld_authority_artifact_registry` with period + turnover-band versioning.
- Why: Racing Queensland publishes explicit FY26-27 authority-period artifacts and separate submission templates for under/over `A$5M` pathways.
- Decision: add `approved_supplier_registry` normalization for Queensland authority parsing.
- Why: FY26-27 comparison artifacts enumerate named approved suppliers; this is useful for contract-lineage joins and source-validation gates.

## Provider comparison (incremental high-signal additions, pass 126)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support (`live-key delayed data`, `live-key activation`, `missing-market visibility`) | Account-state delay behavior, activation prerequisites/cost, and legal-location market-visibility constraints | Support-doc layer; requires runtime monitoring and location-aware diagnostics in production | A | Add account-state + geolocation guards and classify empty-market outcomes by entitlement regime |
| Racing Queensland race-information authority artifacts | Current authority window (`2025-07-01` to `2027-06-30`) plus turnover-band-specific submission templates and updated condition sets | Jurisdiction-specific and periodically revised; requires version pinning and replay by period | A | Add period/band artifact registry and enforce period-correct reporting/economics routing |
| Racing Queensland FY26-27 comparison PDF (`Approved Supplier` definitions) | Canonical supplier-name set for contract/source normalization | Comparison artifact format can change; ABN/name mapping still needs canonical-entity handling | A | Add approved-supplier registry and validate provider lineage against published supplier definitions |

## Data contract additions required (incremental, pass 126)

- `betfair_account_runtime_state`:
- `capture_ts`, `account_id`, `account_funded_flag`, `delay_override_applied_flag`, `effective_price_delay_regime`, `source_url`.
- `betfair_live_key_activation_contract_snapshot`:
- `capture_ts`, `activation_fee_gbp`, `kyc_required_flag`, `live_read_only_permitted_flag`, `source_url`.
- `betfair_geo_market_visibility_rule`:
- `capture_ts`, `country_or_ip_scope`, `endpoint_name`, `market_scope_text`, `empty_response_expected_flag`, `source_url`.
- `market_discovery_outcome_audit`:
- `capture_ts`, `query_scope`, `result_count`, `geo_visibility_regime`, `account_delay_regime`, `empty_result_classification(liquidity|entitlement|transport)`, `source_url`.
- `qld_authority_artifact_version`:
- `capture_ts`, `effective_from`, `effective_to`, `application_fee_aud`, `artifact_type(conditions|template|comparison)`, `source_url`, `source_hash`.
- `qld_submission_template_pathway`:
- `capture_ts`, `turnover_band`, `template_label`, `delivery_channel`, `effective_from`, `effective_to`, `source_url`.
- `qld_approved_supplier_registry_snapshot`:
- `capture_ts`, `authority_period_label`, `supplier_name`, `supplier_abn`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 126)

- What runtime checks should hard-block execution when a Live key is effectively delayed due to account state (funding/override) rather than key type?
- Should market-discovery pipelines classify geolocation-filtered empty responses as `expected` and suppress false outage alerts by default?
- For Queensland, what authoritative source should drive turnover-band assignment (operator declaration vs calculated turnover history) in automated template routing?
- Do we require canonical legal-entity resolution before using Queensland approved-supplier lists for provider gating, or allow name-based matching with confidence scoring first?

## Ranked implementation backlog (delta, pass 126)

### P0 additions

1. Implement `betfair_account_state_guard` and block execution-quality analytics when effective regime is delayed.
2. Add `geo_market_visibility_filter` with explicit empty-result classification (`entitlement` vs `liquidity` vs `transport`).
3. Implement `qld_authority_artifact_registry` with effective-date hashes and turnover-band template routing.
4. Add `qld_approved_supplier_registry_snapshot` ingestion and wire provider-lineage prechecks against supplier definitions.
5. Add startup and scheduled health checks that verify key activation prerequisites and expected account runtime state before collector launch.

### P1 additions

1. Add dashboards for `effective_delay_regime_rate`, `geo_filtered_empty_result_rate`, and `qld_template_band_mismatch_rate`.
2. Backtest discovery/fill diagnostics with and without geolocation entitlement classification to quantify false-incident reduction.
3. Add canonical-entity matching for supplier/provider name drift in Queensland artifact joins.

## Sources for this update (pass 126)

- Betfair Developer Program, `Why am I receiving delayed data when using a 'live' Application Key?` (updated 2025-10-30; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003886711-Why-am-I-receiving-delayed-data-when-using-a-live-Application-Key
- Betfair Developer Program, `How do I activate my Live App Key?` (updated 2026-01-02; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003860331-How-do-I-activate-my-Live-App-Key
- Betfair Developer Program, `Why do markets not appear in the listEvents, listMarketCatalogue or listMarketBook API response?` (updated 2025-11-28; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listMarketCatalogue-API-response
- Racing Queensland, `Race Information` page (current authority period and template links; accessed 2026-04-03): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland, FY26-27 vs FY24-25 general-conditions comparison PDF (approved-supplier definition list; published 2025-06-03; accessed 2026-04-03): https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf

## Incremental architecture decisions from this run (2026-04-03, pass 127)

- Decision: add an `rv_integrity_disclosure_audit` service with business-day SLA checks.
- Why: RV clause `5.9.1` requires disclosure notifications to Approved WSPs no later than `3 Business Days` after disclosure.
- Decision: add an `rv_min_bet_exclusion_state_engine` with evidence-pack storage.
- Why: RV clause `12.3.2` allows permanent/ongoing minimum-bet exclusion pathways with specific verifiable-evidence bases (for example IP/device/public-record checks), and clause `12.3.3` defines delegated-account approval constraints.
- Decision: add an `rv_fee_formula_contract` module for Schedule 1 definitions.
- Why: RV fee algebra explicitly defines inclusion/exclusion treatment for promotional returns, free bets, cash-out components, and related items, which can break naive turnover math.

## Provider comparison (incremental high-signal additions, pass 127)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| RV Standard Conditions (effective 2025-03-01) | Clause-level contract for integrity disclosures, minimum-bet exclusions/delegation, and fee-algebra definitions | Jurisdiction-specific legal instrument; requires version pinning and clause-level parser tests | A | Treat as executable policy contract; implement SLA checks + exclusion state engine + formula-versioned economics |
| RV Race Fields Policy index page | Stable bundle entrypoint for current clean/marked-up conditions + annual guide links | Link targets can rotate; page itself is index-level signal | A | Add page-level watch job to detect artifact churn and trigger clause parser recapture |

## Data contract additions required (incremental, pass 127)

- `rv_integrity_disclosure_event`:
- `capture_ts`, `request_id`, `disclosure_recipient_type`, `disclosure_ts`, `notification_sent_ts`, `notification_within_3bd_flag`, `confidentiality_agreement_required_flag`, `source_url`.
- `rv_min_bet_exclusion_event`:
- `capture_ts`, `account_id`, `exclusion_reason_code`, `evidence_source`, `permanent_or_ongoing_flag`, `effective_from`, `effective_to`, `source_url`.
- `rv_delegated_account_approval`:
- `capture_ts`, `primary_account_id`, `delegate_account_id`, `notice_received_ts`, `identity_docs_verified_flag`, `approval_outcome`, `approval_decision_ts`, `unreasonable_delay_flag`, `source_url`.
- `rv_fee_formula_contract_snapshot`:
- `capture_ts`, `effective_from`, `bets_taken_formula_version`, `promotional_adjustment_rule`, `free_bet_excluded_flag`, `commission_rebate_incentive_excluded_flag`, `pooling_fee_excluded_flag`, `jackpot_allocated_excluded_flag`, `seeding_excluded_flag`, `cashout_component_defined_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 127)

- What should be the hard alert threshold for RV disclosure-notification SLA breaches (`>3 Business Days`) before routing/reporting is quarantined?
- For RV minimum-bet exclusions, which evidence-source combinations are sufficient for automatic classification vs mandatory manual review?
- Should delegated-account approvals be modeled as account-level overrides with expiry, or as per-delegate scoped grants with separate revocation semantics?
- Which fee-formula fields are mandatory for finance-grade sign-off before releasing strategy-level PnL dashboards?

## Ranked implementation backlog (delta, pass 127)

### P0 additions

1. Implement `rv_integrity_disclosure_audit` and enforce `notification_within_3bd_flag` checks with incident alerts.
2. Build `rv_min_bet_exclusion_state_engine` with verifiable evidence-source capture and immutable decision logs.
3. Implement `rv_delegated_account_approval` workflow and block minimum-bet eligibility assumptions when approval state is unresolved.
4. Add `rv_fee_formula_contract` and require formula-version IDs in all jurisdictional economics calculations.

### P1 additions

1. Add clause-parser regression tests for RV condition updates (clean and marked-up variants).
2. Build dashboards for `rv_disclosure_sla_breach_rate`, `rv_min_bet_exclusion_rate_by_reason`, and `rv_formula_version_mismatch_rate`.
3. Run backtests comparing naive turnover formulas vs RV Schedule 1 formula-accurate economics attribution.

## Sources for this update (pass 127)

- Racing Victoria, `Standard Conditions of Approval - Effective 1 March 2025` (integrity disclosure rules, minimum-bet exclusion/delegated-account clauses, and Schedule 1 fee definitions; accessed 2026-04-03): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f
- Racing Victoria, `Race Fields Policy` page (current policy bundle index; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/race-fields-policy

## Incremental architecture decisions from this run (2026-04-03, pass 128)

- Decision: add an `act_rfi_policy_engine` as a separate jurisdiction module.
- Why: Canberra Racing Club's 2024-2027 ACT race-field pack defines distinct fee bases, filing deadlines, and approval/audit conditions that are not interchangeable with NSW/QLD/RV settings.
- Decision: add an `act_mbl_state_machine` for fixed-odds execution feasibility.
- Why: ACT minimum-bet docs define race-tier limits, product exclusions, once-per-horse rules, and exception pathways that must be resolved before stake-routing.
- Decision: add `act_complaint_evidence_capture` in compliance telemetry.
- Why: ACT complaint workflows are explicitly time-bounded and evidence-driven, so execution/rejection records need audit-grade retention aligned to complaint clocks.

## Provider comparison (incremental high-signal additions, pass 128)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Canberra Racing Club ACT race-field pack + ACT MBL docs | Primary ACT approval/fee/reporting contract plus race-tier minimum-bet/exclusion semantics and complaint process | Jurisdiction-specific documents that may update outside national feed cadence; requires version-watch and parser regression tests | A | Implement dedicated ACT policy engine and MBL feasibility gate before enabling ACT-linked execution paths |

## Data contract additions required (incremental, pass 128)

- `act_rfi_contract_snapshot`:
- `capture_ts`, `approval_required_flag`, `apply_min_lead_days`, `approval_end_date`, `audit_lookback_years`, `source_url`.
- `act_rfi_fee_formula_snapshot`:
- `capture_ts`, `wagering_type`, `fee_basis(turnover|net_customer_winnings)`, `fee_rate`, `negative_ncw_floor_zero_flag`, `source_url`.
- `act_rfi_reporting_snapshot`:
- `capture_ts`, `return_frequency(monthly)`, `return_due_day`, `exempt_turnover_threshold_flag`, `source_url`.
- `act_mbl_limit_snapshot`:
- `capture_ts`, `race_tier`, `win_each_way_limit_aud`, `place_component_limit_aud`, `source_url`.
- `act_mbl_scope_rule_snapshot`:
- `capture_ts`, `product_type`, `in_scope_flag`, `pre_9am_excluded_flag`, `source_url`.
- `act_mbl_exception_event`:
- `capture_ts`, `account_id`, `exception_reason_code`, `integrity_related_flag`, `once_per_horse_limit_applied_flag`, `source_url`.
- `act_mbl_complaint_event`:
- `capture_ts`, `incident_ts`, `lodged_ts`, `within_14_day_window_flag`, `complaint_type`, `evidence_pack_present_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 128)

- Do we enable ACT in Phase 1 as read-only compliance simulation, or only after full fee/MBL state-machine validation?
- What default routing behavior should apply when ACT MBL scope is ambiguous for mixed-product bets at submit time?
- Should ACT complaint evidence retention align to a fixed minimum period beyond the published 14-day lodge window?
- Which owner signs off ACT-specific exception-code mapping (`integrity`, `fraud`, `non-beneficial-owner`, etc.) before live promotion?

## Ranked implementation backlog (delta, pass 128)

### P0 additions

1. Implement `act_rfi_policy_engine` with ACT-specific fee formulas, approval horizon, and monthly return deadlines.
2. Build `act_mbl_state_machine` enforcing race-tier limits, scope exclusions, and once-per-horse semantics.
3. Add `act_mbl_exception_event` and `act_complaint_evidence_capture` telemetry with 14-day-window checks.
4. Add parser/version watch for ACT race-field and MBL documents with source-hash drift alerts.

### P1 additions

1. Backtest ACT strategy economics under turnover-based vs net-customer-winnings fee paths.
2. Add dashboards for `act_mbl_scope_reject_rate`, `act_exception_reason_mix`, and `act_complaint_window_breach_rate`.
3. Run legal/compliance tabletop on ACT dispute workflows using captured rejection/evidence payloads.

## Sources for this update (pass 128)

- Canberra Racing Club, `Information on and Application to Use ACT Race Field Information (2024-2027)` (approval requirement, fee formulas, reporting deadlines, and audit rights; accessed 2026-04-03): https://admin.thoroughbredpark.com.au/sites/default/files/2024-04/ACT%20RFL%20Information%20%26%20%20Application%20Renewal%20%202024-2027.pdf
- Canberra Racing Club, `ACT Thoroughbred Race Field Information Use Minimum Bet Limits Conditions` (race-tier minimum-bet limits and scope/exclusion rules; accessed 2026-04-03): https://admin.thoroughbredpark.com.au/sites/default/files/2021-09/ACT_Thoroughbred_Race_Field_Information_Use_Minimum_Bet_Limits_Conditions.pdf
- Canberra Racing Club, `ACT Thoroughbred Race Field Information Use Minimum Bet Limits Frequently Asked Questions` (operational clarifications and complaint timing; accessed 2026-04-03): https://thoroughbredpark.com.au/sites/default/files/2021-08/2017_Frequently_Asked_Questions.pdf
- Canberra Racing Club, `ACT Thoroughbred Race Field Information Use Minimum Bet Limits Complaint Form` (complaint categories and evidence fields; accessed 2026-04-03): https://thoroughbredpark.com.au/sites/default/files/2021-10/ACT-THOROUGHBRED-RACE-FIELD-INFORMATION-USE-MINIMUM-BET-LIMITS-COMPLAINTS-FORM.pdf

## Incremental architecture decisions from this run (2026-04-04, pass 129)

- Decision: add a `commingling_merge_state` module to tote/commingled pool ingestion and replay.
- Why: HKJC documents a concrete fallback branch when outbound commingling into partner pools fails.
- Decision: split provider readiness into `capability_ready` and `deployment_rights_ready` gates at feature and strategy levels.
- Why: Punting Form Modeller advertises PIT + Betfair flucs capability but explicitly limits default usage to personal scope.

## Provider comparison (incremental high-signal additions, pass 129)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| HKJC outbound-commingling notice (2019-10-04) | Explicit partner-pool merge semantics plus fallback to HK-only pool with PMU formula | Venue-specific rulebook context; portability to AU requires normalization | A | Add merge-success state tracking and fallback-aware payout reconciliation |
| Punting Form Modeller page | Capability signal (PIT + historical Betfair flucs) and explicit personal-vs-commercial use boundary | Product-page scope signal; commercial rights still require executed terms | A | Gate strategy promotion on rights while allowing controlled offline capability experiments |

## Data contract additions required (incremental, pass 129)

- `commingling_merge_event`:
- `capture_ts`, `pool_id`, `partner_operator`, `merge_success_flag`, `fallback_local_pool_flag`, `partner_formula_applied_flag`, `source_url`.
- `commingling_place_odds_state`:
- `capture_ts`, `pool_id`, `min_range_display_flag`, `finalized_flag`, `source_url`.
- `provider_capability_vs_rights_state`:
- `capture_ts`, `provider_name`, `capability_pit_flag`, `capability_historical_betfair_flucs_flag`, `personal_use_only_flag`, `commercial_terms_required_flag`, `deployment_rights_ready_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 129)

- What threshold should trigger a commingling-fallback incident (`single pool event` vs `session-level %`) before strategy execution is quarantined?
- How long should place-odds-min-range states remain valid before we mark pre-off prices as low-confidence inputs?
- What entitlement artifacts are the minimum bar to flip `deployment_rights_ready=true` for PIT/flucs-dependent strategies?

## Ranked implementation backlog (delta, pass 129)

### P0 additions

1. Implement `commingling_merge_state` capture and enforce fallback-aware settlement logic.
2. Add `provider_capability_vs_rights_state` and block production promotion when rights are not explicitly commercial.
3. Add incident alerts for repeated commingling merge failures or unresolved place-odds-finalization states.

### P1 additions

1. Backtest tote/commingled strategies with explicit merge-success and fallback branches to measure payout-attribution drift.
2. Add dashboards for `commingling_fallback_rate`, `place_range_state_duration`, and `rights_gate_block_rate`.
3. Add entitlement-artifact lineage tracking for PIT/flucs capability claims.

### P2 additions

1. Extend commingling state-machine coverage to additional partner-pool jurisdictions and rulebooks.
2. Add document-diff monitoring for provider capability/scope pages where deployability rights can drift over time.
3. Quantify marginal alpha from PIT/flucs features under rights-constrained vs rights-approved scenarios.

## Sources for this update (pass 129)

- Hong Kong Jockey Club, `Outbound commingling on designated simulcast races from France commences` (partner-pool merge, fallback, and place-odds range semantics; accessed 2026-04-04): https://racingnews.hkjc.com/english/2019/10/04/outbound-commingling-on-designated-simulcast-races-from-france-commences/
- Punting Form, `Modeller` (historical Betfair flucs/PIT capability and personal-vs-commercial usage scope; accessed 2026-04-04): https://puntingform.com.au/products/modeller

## Incremental architecture decisions from this run (2026-04-04, pass 130)

- Decision: add an `exotic_order_bias_calibrator` module with explicit Harville-correction parameter storage (`gamma`, `delta`) by jurisdiction/track/time window.
- Why: Benter's primary results show systematic Harville bias and provide concrete fitted-parameter structure that should be operationalized, not left as narrative guidance.
- Decision: require an `exotic_calibration_validity_gate` before any exacta/quinella/trifecta promotion.
- Why: uncorrected or stale order-condition parameters can create deterministic EV overstatement in exotic pools.

## Provider comparison (incremental high-signal additions, pass 130)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Benter 1994 primary paper | Explicit Harville-bias diagnosis, corrected-order parameterization framework, and sample-calibrated values (`gamma=0.81`, `delta=0.65`) | Historical venue/sample; parameters are not universal constants and must be re-fit by jurisdiction/regime | A | Implement parameterized exotic-order calibration and make it a hard prerequisite for exotic deployment |

## Data contract additions required (incremental, pass 130)

- `exotic_order_bias_model`:
- `capture_ts`, `jurisdiction`, `track_group`, `effective_from`, `effective_to`, `base_formula`, `gamma_second_place`, `delta_third_place`, `fit_method(maximum_likelihood)`, `source_url`.
- `exotic_order_fit_dataset_snapshot`:
- `capture_ts`, `sample_races`, `sample_horses_second`, `sample_horses_third`, `date_window_start`, `date_window_end`, `source_url`.
- `exotic_order_calibration_audit`:
- `run_ts`, `model_version`, `z_stat_max_abs_before`, `z_stat_max_abs_after`, `calibration_pass_flag`, `retrain_trigger_reason`.

## Open questions to resolve before implementation freeze (incremental, pass 130)

- What maximum tolerated conditional-probability misfit (`|z|` or equivalent) should block exotic model promotion?
- Should we fit `gamma`/`delta` per track, per jurisdiction, or via hierarchical pooling with shrinkage across venues?
- What retrain cadence (time-based vs drift-triggered) best controls stale-parameter risk in exotic-order models?

## Ranked implementation backlog (delta, pass 130)

### P0 additions

1. Implement `exotic_order_bias_calibrator` with persisted `gamma`/`delta` and effective-date versioning.
2. Add `exotic_calibration_validity_gate` that blocks exotic execution when fitted-parameter quality thresholds fail.
3. Build replay checks comparing Harville-naive vs corrected-order expected value to quantify misspecification risk per venue.

### P1 additions

1. Add drift monitors for second/third conditional-frequency bins and auto-trigger re-fit workflows.
2. Evaluate hierarchical vs per-track parameter fitting for sparse-venue stability.
3. Add dashboards for `exotic_order_misfit_rate`, `parameter_drift_velocity`, and `gate_block_rate`.

## Sources for this update (pass 130)

- William Benter, `Computer Based Horse Race Handicapping and Wagering Systems: A Report` (Harville-bias diagnosis and corrected-order parameterization with sample values `gamma=0.81`, `delta=0.65`; accessed 2026-04-04): https://gwern.net/doc/statistics/decision/1994-benter.pdf

## Incremental architecture decisions from this run (2026-04-04, pass 131)

- Decision: add a `provider_publication_latency_contract` for AU upstream artifacts (results/positions-in-running/form comments) with explicit lag-state capture.
- Why: Racing Australia `Materials` publishes concrete same-day receipt windows (`majority within 20 minutes`, usually within `40 minutes`) and manual operations context, which must be represented in PIT and settlement gating.
- Decision: add an `adw_channel_clock_contract` to separate channel display/acceptance clocks from pool-close semantics.
- Why: KeenelandSelect FAQ discloses odds-refresh cadence (`60s or less`, faster near post) plus host-track early-close shut-out risk, implying channel-level execution windows can differ from pool-level assumptions.

## Provider comparison (incremental high-signal additions, pass 131)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia `Materials` page | Explicit operational latency envelope for results receipt plus manual production coverage for form/positions-in-running | Corporate operational page (not signed SLA endpoint); needs runtime observation to validate stability | A | Add provider-latency contract + PIT gating on observed publication clocks |
| KeenelandSelect `General Wager FAQ` | Channel-level odds refresh and early host-track closure/shut-out semantics | ADW-channel FAQ (US context); portability to AU requires channel-specific validation | A/B | Add channel-clock model and shut-out risk features in execution simulator |

## Data contract additions required (incremental, pass 131)

- `provider_publication_latency_contract_snapshot`:
- `capture_ts`, `provider_name`, `artifact_type`, `majority_lag_min`, `typical_lag_min`, `manual_ops_flag`, `source_url`.
- `provider_publication_latency_observation`:
- `capture_ts`, `provider_name`, `artifact_type`, `race_id`, `official_event_ts`, `first_seen_ts`, `observed_lag_min`, `source_url`.
- `adw_channel_clock_contract_snapshot`:
- `capture_ts`, `channel_name`, `odds_refresh_interval_sec_max`, `near_post_refresh_acceleration_flag`, `host_track_early_close_possible_flag`, `source_url`.
- `adw_acceptance_window_observation`:
- `capture_ts`, `channel_name`, `race_id`, `last_accept_ts`, `official_post_ts`, `shut_out_observed_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 131)

- What lag threshold should mark an AU provider artifact as PIT-unsafe for model serving (`>20m`, `>40m`, or percentile-based by provider/race class)?
- Do we enforce a hard execution cutoff using channel-specific `last_accept_ts` estimates, or dynamically route by observed shut-out risk?
- For AU rollout, which local ADW/bookmaker channels expose publish-clock/refresh metadata we can observe directly (vs inferred only from outcomes)?

## Ranked implementation backlog (delta, pass 131)

### P0 additions

1. Implement `provider_publication_latency_contract` + `provider_publication_latency_observation` and block PIT promotion when lag-state is unresolved.
2. Add `adw_channel_clock_contract` and compute channel-specific late-bet acceptance envelopes in simulation.
3. Add execution kill-switch when channel odds/acceptance telemetry indicates elevated shut-out risk near post.

### P1 additions

1. Build dashboards for `provider_observed_lag_min_p95`, `pit_unsafe_artifact_rate`, and `channel_shut_out_rate`.
2. Run ablation tests to quantify CLV/ROI drift when channel-clock and publication-lag features are omitted.
3. Extend channel-clock instrumentation to AU-facing execution channels once rights/telemetry access is confirmed.

## Sources for this update (pass 131)

- Racing Australia, `Materials` page (results receipt latency and manual operations details; accessed 2026-04-04): https://www.racingaustralia.horse/AboutUs/Materials.aspx
- KeenelandSelect, `General Wager FAQ` (odds refresh cadence and host-track early-closure guidance; updated 2023-02-03; accessed 2026-04-04): https://support.keenelandselect.com/hc/en-us/articles/360055881472-General-Wager-FAQ

## Incremental architecture decisions from this run (2026-04-04, pass 132)

- Decision: add an `fx_reconciliation_classifier` in Betfair market-data ingestion.
- Why: Betfair documents that traded-volume (`trd`) can decrease/increase from foreign-exchange revaluation events, so raw volume deltas are not pure order-flow signals.
- Decision: add a `provider_query_window_contract` guard for BetMakers historical/backfill jobs.
- Why: BetMakers FAQ states deterministic query-shape limits (`Races` default 10, `MeetingsDated` max 5 days) that can silently truncate coverage without transport errors.

## Provider comparison (incremental high-signal additions, pass 132)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair support: traded volume decrease/increase | Primary explanation for non-monotonic `trd` updates (cross-currency FX revaluation) plus hourly currency-rate update cadence reference | Support-layer operational contract; requires runtime tagging and validation in live telemetry | A | Add FX-aware traded-volume attribution and block pure-order-flow assumptions in microstructure features |
| BetMakers Core API FAQ | Deterministic query-window constraints (`Races` default limit, `MeetingsDated` 5-day horizon) for AU coverage planning | FAQ-level contract; can drift and must be re-snapshotted in provider-change monitoring | A/B | Enforce window-tiling + explicit limit overrides in all backfill/catch-up pipelines |

## Data contract additions required (incremental, pass 132)

- `betfair_trd_reconciliation_event`:
- `capture_ts`, `market_id`, `selection_id`, `trd_delta_signed`, `fx_reconciliation_candidate_flag`, `source_url`.
- `betfair_currency_rate_snapshot`:
- `capture_ts`, `rate_effective_ts`, `update_cadence(hourly_weekday)`, `source_url`.
- `betmakers_query_window_contract_snapshot`:
- `capture_ts`, `races_default_limit`, `meetings_dated_max_days`, `source_url`.
- `betmakers_backfill_window_audit`:
- `capture_ts`, `requested_start`, `requested_end`, `window_split_count`, `limit_override_used_flag`, `coverage_gap_detected_flag`.

## Open questions to resolve before implementation freeze (incremental, pass 132)

- What tolerance threshold should classify a `trd` change as likely FX reconciliation (`time-to-rate-update`, `delta-size`, cross-currency context) before suppressing order-flow signals?
- Do we treat BetMakers window-limit violations as hard-fail ingestion errors or soft warnings with delayed remediation?
- What refresh cadence should we use to re-snapshot FAQ-level provider contracts so query-shape drift is caught before monthly backfills?

## Ranked implementation backlog (delta, pass 132)

### P0 additions

1. Implement `fx_reconciliation_classifier` and annotate Betfair traded-volume updates with source-cause labels (`order_flow` vs `fx_revaluation_candidate`).
2. Add BetMakers `provider_query_window_contract` enforcement in ingestion/backfill orchestration (`MeetingsDated <=5 days`, explicit `Races` limit policy).
3. Add hard data-quality gate that blocks feature promotion when `coverage_gap_detected_flag=true` or unresolved window tiling remains.

### P1 additions

1. Build dashboards for `fx_reconciliation_candidate_rate`, `trd_non_monotonic_event_rate`, and `betmakers_window_truncation_incidents`.
2. Run ablation experiments comparing model performance with vs without FX-attribution filtering on traded-volume features.
3. Add contract-drift monitor for BetMakers FAQ query limits and trigger parser/test updates on change.

## Sources for this update (pass 132)

- Betfair Developer Program, `Why does traded volume decrease as well as increase?` (updated 2025-02-25; FX-driven `trd` adjustments and `listCurrencyRates` hourly weekday cadence; accessed 2026-04-04): https://support.developer.betfair.com/hc/en-us/articles/360006560978-Why-does-traded-volume-decrease-as-well-as-increase
- BetMakers Docs, `Core API FAQ` (`Races` default limit and `MeetingsDated` 5-day limit; captured 2026-04-04): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental architecture decisions from this run (2026-04-04, pass 133)

- Decision: add a `provider_strategy_change_log` control-plane module fed by annual-report and governance disclosures.
- Why: Racing Australia's 2024 report discloses NZTR SNS project closure, impairment recognition, and team redeployment, which can alter roadmap/reliability risk outside normal API/status telemetry.
- Decision: split AU provider reliability modeling into subsystem-level SLOs (`sns_core`, `website`, `telephony/pabx`, `messaging`) with explicit fallback paths.
- Why: Racing Australia's annual service-standard tables show heterogeneous performance across service channels, so one aggregate uptime assumption is unsafe.
- Decision: add throughput-baseline stress tests using annual operational volume metrics from primary provider reporting.
- Why: published annual volumes/timeliness rates provide concrete sizing priors for ingestion queues, alerting thresholds, and replay windows.

## Provider comparison (incremental high-signal additions, pass 133)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia Annual Report 2024 (CEO + financial/operations sections) | Primary governance signal on platform portfolio events (NZTR SNS closure, impairment, team redeployment) | Annual cadence; strategic disclosures are lagged vs live incidents | A | Add `provider_strategy_change_log` and event-window risk overlays in reliability modeling |
| Racing Australia Annual Report 2024 service-standard tables | Concrete throughput/timeliness and per-system uptime baselines | Self-reported operational metrics; still requires runtime reconciliation | A | Build subsystem-specific SLOs/failover and volume-based stress testing |

## Data contract additions required (incremental, pass 133)

- `provider_strategy_change_event`:
- `capture_ts`, `provider_name`, `event_type`, `project_name`, `event_effective_date`, `financial_impact_aud`, `affected_service_domains_json`, `source_url`.
- `provider_subsystem_uptime_snapshot`:
- `capture_ts`, `provider_name`, `subsystem_name`, `target_uptime_pct`, `actual_uptime_pct`, `unplanned_downtime_minutes`, `source_url`.
- `provider_operational_throughput_snapshot`:
- `capture_ts`, `provider_name`, `metric_name`, `annual_volume`, `monthly_avg_volume`, `target_pct`, `actual_pct`, `variation_pct`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 133)

- What severity/weight should we assign to annual-report change events (`project closure`, `impairment`, `team redeployment`) in provider risk scoring?
- Should subsystem SLO breaches (for example telephony/pabx) trigger strategy-level throttles only for affected workflows or global ingestion/execution safeguards?
- What minimum reconciliation process should compare annual self-reported service metrics against our observed runtime telemetry before accepting them as priors?

## Ranked implementation backlog (delta, pass 133)

### P0 additions

1. Implement `provider_strategy_change_log` ingestion from annual governance artifacts and wire it into reliability/risk features.
2. Build subsystem-specific provider SLO registry (`sns_core`, `website`, `telephony/pabx`, `messaging`) with workflow-scoped fallback policies.
3. Add provider throughput stress-test suite parameterized by annual volume baselines from primary reports.

### P1 additions

1. Create dashboards for `provider_strategy_change_event_rate`, `subsystem_slo_breach_rate`, and `volume_headroom_pct`.
2. Add attribution checks that separate model drift from upstream strategic/platform change events.
3. Add document-diff monitor for annual-report sections that materially affect reliability and capacity assumptions.

### P2 additions

1. Extend governance-event and subsystem-SLO framework to additional AU providers where annual-report style disclosures are available.
2. Backtest strategy robustness under synthetic "team redeployment + subsystem outage" compound scenarios.
3. Build confidence weighting that decays annual-report priors when runtime telemetry diverges materially.

## Sources for this update (pass 133)

- Racing Australia, `Annual Report 2024` (CEO/financial operations disclosures including NZTR SNS closure and impairment context; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/newsletters/2024_Racing_Australia_Annual_Report/
- Racing Australia, `Annual Report 2024` service-standard tables (throughput/timeliness and subsystem uptime metrics; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/newsletters/2024_Racing_Australia_Annual_Report/20/

## Incremental architecture decisions from this run (2026-04-04, pass 134)

- Decision: add a `participant_mix_regime_model` to execution and microstructure research layers.
- Why: The Jockey Club 2018 transcript provides explicit CAW share bounds (`16-19%` observed, natural-limit hypothesis near `20%`) that argue against linear extrapolation.
- Decision: add an `adw_concentration_risk` control in liquidity and deployment gating.
- Why: the same source reports one ADW sample where `6%` of accounts produced `72%` of handle, implying fragile pool composition under concentration shocks.

## Provider comparison (incremental high-signal additions, pass 134)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| The Jockey Club Round Table 2018 transcript (McKinsey situation analysis) | Quantified CAW-share range (`16-19%`), explicit saturation hypothesis (~`20%`), and ADW concentration datapoint (`6%` accounts -> `72%` handle) | Historical US sample and transcript-level reporting; requires local telemetry to calibrate AU deployment thresholds | A/B | Implement participant-mix regime features and concentration-aware execution throttles |

## Data contract additions required (incremental, pass 134)

- `participant_mix_regime_snapshot`:
- `capture_ts`, `jurisdiction`, `sample_scope_desc`, `caw_handle_share_low_pct`, `caw_handle_share_high_pct`, `caw_share_natural_limit_est_pct`, `source_url`.
- `adw_account_concentration_snapshot`:
- `capture_ts`, `channel_name`, `top_account_pct`, `handle_share_pct`, `source_url`.
- `participant_mix_risk_signal`:
- `capture_ts`, `market_id`, `recreational_share_proxy_pct`, `caw_saturation_risk_flag`, `concentration_fragility_flag`.

## Open questions to resolve before implementation freeze (incremental, pass 134)

- What AU-available proxy should be authoritative for `recreational_share_proxy_pct` when direct participant tagging is unavailable?
- Should concentration fragility trigger hard execution throttles or only spread/wager-size haircut rules in late windows?
- What confidence weighting should we apply when transferring US transcript-era CAW saturation priors into current AU strategy controls?

## Ranked implementation backlog (delta, pass 134)

### P0 additions

1. Implement `participant_mix_regime_model` with saturation-aware feature transforms for CAW-share effects.
2. Add `concentration_fragility_flag` gating to late-window execution sizing and fill-probability forecasts.
3. Build a participant-mix diagnostics dashboard (`caw_share_proxy`, `recreational_share_proxy`, `top_account_concentration_proxy`) with incident alerts.

### P1 additions

1. Run ablation tests comparing linear vs saturation-transformed CAW-share features in odds-volatility and fill models.
2. Add scenario tests for sudden recreational-liquidity drops to evaluate robustness of late execution policies.
3. Add periodic source-refresh checks for participant-mix disclosure updates from major racing bodies.

## Sources for this update (pass 134)

- The Jockey Club, `Round Table Conference (2018) - McKinsey Report Situation Analysis` (CAW-share range, saturation-limit commentary, and ADW concentration datapoint; accessed 2026-04-04): https://jockeyclub.com/default.asp?area=4&section=RT&year=2018

## Incremental architecture decisions from this run (2026-04-04, pass 135)

- Decision: add a `provider_operations_load_monitor` module using Racing Australia contact-center and notification telemetry.
- Why: January 2026 RA service metrics expose high-signal operational-intensity features (calls, abandon rates, SMS/email bursts) not captured by uptime-only health models.
- Decision: add an `identity_latency_prior_service` for registry/genetics-linked data dependencies.
- Why: January 2026 RA genetics rows provide measurable turnaround-state variation (including backup-panel workflow), which should condition freshness assumptions for identity-adjacent data.

## Provider comparison (incremental high-signal additions, pass 135)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia January 2026 monthly service report | Operational-load telemetry (call distribution, abandon rate, outbound SMS/email volume) plus genetics throughput/turnaround metrics | Monthly self-reported snapshot; must be aggregated into rolling distributions before hard thresholds | A | Implement operations-load monitor + identity-latency priors and gate latency-sensitive execution/features when stressed |

## Data contract additions required (incremental, pass 135)

- `provider_operations_load_snapshot`:
- `capture_ts`, `provider`, `calls_inbound`, `calls_outbound`, `online_transaction_pct`, `phone_transaction_pct`, `answer_lt_60s_pct`, `answer_60_120s_pct`, `answer_gt_120s_pct`, `abandon_rate_pct`, `sms_sent`, `email_sent`, `source_url`.
- `provider_operations_load_state`:
- `capture_ts`, `provider`, `contact_load_zscore`, `notification_load_zscore`, `combined_load_regime(normal|elevated|stressed)`, `source_url`.
- `identity_latency_prior_snapshot`:
- `capture_ts`, `provider`, `service_domain(genetics_registry)`, `sample_category`, `turnaround_target_days`, `turnaround_actual_days`, `turnaround_prior_month_days`, `backup_panel_flag`, `latency_regime(normal|elevated|degraded)`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 135)

- What thresholding approach should define `combined_load_regime` (`z-score` cutoffs vs percentile bands) for execution gating?
- Should operations-load stress trigger hard late-window throttles, or only widen expected-slippage/fill uncertainty bands?
- Which model families should be blocked when `identity_latency_prior` is degraded (all registry-dependent features vs only recently changed entities)?

## Ranked implementation backlog (delta, pass 135)

### P0 additions

1. Implement `provider_operations_load_monitor` ingestion for RA monthly reports and compute `combined_load_regime` from call + notification telemetry.
2. Add execution-policy guard that applies late-window size haircuts when `combined_load_regime=stressed`.
3. Implement `identity_latency_prior_service` and block promotion of registry-dependent features when latency regime is degraded.

### P1 additions

1. Build dashboards for `contact_load_zscore`, `notification_load_zscore`, `abandon_rate_pct`, and `identity_latency_regime`.
2. Run ablation tests to quantify slippage/CLV changes when operations-load and identity-latency priors are excluded.
3. Add rolling-month trend monitors to detect structural shifts in RA operational intensity before release windows.

## Sources for this update (pass 135)

- Racing Australia, `Monthly Service Standard Performance Report - January 2026` (contact-center SLA distribution, outbound communications volume, and genetics-turnaround telemetry; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-January-2026.pdf

## Incremental architecture decisions from this run (2026-04-04, pass 136)

- Decision: add an `au_market_topology_profile` module keyed by `state + tab_coverage_class`.
- Why: Racing Australia Fact Book 2025 shows strong TAB/non-TAB concentration asymmetry by state, so one national liquidity prior is structurally unsafe.
- Decision: make `tab_coverage_class` a required dimension in execution, backtest, and monitoring datasets.
- Why: non-TAB slices are materially smaller and geographically concentrated; pooled calibration with TAB markets can bias fill/slippage expectations.
- Decision: add a `counterparty_topology_snapshot` input to provider/policy control plane.
- Why: Fact Book topology (`343` bookmakers, `39` corporate bookmakers, `1` betting exchange) indicates non-exchange routing breadth but exchange concentration risk.

## Provider comparison (incremental high-signal additions, pass 136)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia Fact Book 2025 (Tables 1-2) | State-level TAB/non-TAB meeting/race/start structure plus national bookmaker/corporate/exchange topology | Annual snapshot cadence; requires intraseason telemetry to detect drift | A | Add topology-aware priors and stratified execution/backtest segmentation before wider venue expansion |

## Data contract additions required (incremental, pass 136)

- `au_market_topology_snapshot`:
- `capture_ts`, `season`, `state_code`, `tab_meetings`, `non_tab_meetings`, `tab_races`, `non_tab_races`, `tab_starts`, `non_tab_starts`, `bookmakers_count`, `corporate_bookmakers_count`, `betting_exchanges_count`, `source_url`.
- `execution_segmentation_profile`:
- `capture_ts`, `state_code`, `tab_coverage_class`, `expected_liquidity_regime`, `default_size_haircut`, `source_url`.
- `backtest_stratification_contract`:
- `capture_ts`, `requires_state_dimension_flag`, `requires_tab_coverage_dimension_flag`, `pooling_allowed_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 136)

- Should early live deployment exclude `non_tab` meetings entirely, or allow them under stricter size/cap controls by state?
- What minimum sample sizes by `state + tab_coverage_class` are required before promoting challenger models?
- Do we maintain separate liquidity/slippage models for TAB and non-TAB regimes, or share a parent model with regime interactions?

## Ranked implementation backlog (delta, pass 136)

### P0 additions

1. Implement `au_market_topology_profile` ingestion from Fact Book tables and publish state-level TAB/non-TAB concentration metrics.
2. Enforce `state + tab_coverage_class` segmentation in backtest reporting, CLV dashboards, and promotion gates.
3. Apply non-TAB default size haircuts and tighter risk caps until regime-specific fill/slippage priors are validated.

### P1 additions

1. Train separate or interaction-aware fill/slippage models for TAB vs non-TAB regimes and compare calibration drift.
2. Add topology-drift monitor that flags divergence between annual Fact Book priors and live observed meeting/race mix.
3. Add operator-topology sensitivity tests for exchange-concentration risk in routing and fallback logic.

## Sources for this update (pass 136)

- Racing Australia, `Fact Book 2025 - Page 12` (Table 2 TAB/non-TAB structure by state for 2024/25; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/12/
- Racing Australia, `Fact Book 2025 - Page 11` (Table 1 continued with bookmaker/corporate bookmaker/betting exchange counts for 2024/25; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/11/

## Incremental architecture decisions from this run (2026-04-04, pass 137)

- Decision: add a `provider_regime_transition_model` that tracks month-over-month deltas and cross-channel divergence states.
- Why: Racing Australia August/September 2025 primary reports show non-monotonic movement (for example, contact abandon-rate spike while `<60s` remains strong, nominations lag while acceptances improve), which level-only health checks cannot represent.
- Decision: split provider gating into independent channels (`contact`, `compilation`, `uptime`, `genetics_identity`) with explicit disagreement handling.
- Why: September shows website/stud-book downtime with SNS/StableAssist/REINS at zero downtime, so one aggregate uptime indicator is insufficient for execution and feature-freshness controls.
- Decision: add `backup_path_latency` as a first-class input to identity/registry freshness controls.
- Why: Tokyo backup-panel turnaround moved from `8.00` days (Aug report) to `17.50` days (Sep report), indicating potentially material identity-latency regime changes without broad platform outages.

## Provider comparison (incremental high-signal additions, pass 137)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia monthly reports (Aug + Sep 2025) | Month-over-month regime transitions across contact-center SLA, compilation timeliness, subsystem uptime, and genetics turnaround | Monthly cadence (not intraday); self-reported operational telemetry requires local reconciliation | A | Build transition/delta-aware provider-risk controls and channel-specific gating before expanding live exposure |

## Data contract additions required (incremental, pass 137)

- `provider_regime_transition_snapshot`:
- `capture_ts`, `provider`, `period_month`, `metric_family`, `metric_name`, `actual_value`, `target_value`, `prev_month_value`, `delta_mom`, `source_url`.
- `provider_channel_divergence_snapshot`:
- `capture_ts`, `provider`, `period_month`, `contact_score`, `compilation_score`, `uptime_score`, `genetics_score`, `divergence_score`, `disagreement_flag`, `source_url`.
- `identity_backup_latency_snapshot`:
- `capture_ts`, `provider`, `period_month`, `backup_service_name`, `turnaround_days`, `prev_turnaround_days`, `delta_mom_days`, `latency_regime`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 137)

- What divergence threshold should trigger hard throttles vs soft uncertainty widening when channel metrics disagree?
- Should `genetics_identity` degradation block only registry-dependent models, or also execution modes that rely on ownership/eligibility freshness?
- Do we require two consecutive monthly confirmations before promoting policy changes derived from monthly report transitions?

## Ranked implementation backlog (delta, pass 137)

### P0 additions

1. Implement `provider_regime_transition_model` with month-over-month deltas for contact, compilation, uptime, and genetics channels.
2. Add channel-disagreement guardrails: block aggressive late execution when `divergence_score` breaches threshold even if aggregate uptime remains high.
3. Add `backup_path_latency` gating for identity/registry-dependent features and promotion checks.

### P1 additions

1. Build transition dashboards (`delta_mom`, `divergence_score`, `disagreement_flag`) and correlate them with CLV/slippage anomalies.
2. Run ablation tests comparing level-only provider health features vs transition-aware features for execution error prediction.
3. Add monthly publication watcher against the RA performance-report index to auto-detect stale-month conditions.

## Sources for this update (pass 137)

- Racing Australia, `Monthly Service Standard Performance Report - August 2025` (contact/compilation/uptime/genetics metrics; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-August-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report - September 2025` (month-over-month transitions across channels; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-September-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report index` (FY2025-26 publication chronology; accessed 2026-04-04): https://www.racingaustralia.horse/freeservices/performancereport.aspx

## Incremental architecture decisions from this run (2026-04-04, pass 138)

- Decision: add a `betfair_delay_policy_epoch_service` that snapshots API-signposted delay regimes plus announcement-thread metadata.
- Why: Betfair's passive-delay thread shows active rollout changes through February 2026 (including sport/competition expansions and test constraints), so delay assumptions must be date-versioned.
- Decision: add `policy_churn_confidence` to execution gating.
- Why: when policy signposting snapshots are stale relative to active rollout periods, fill/slippage priors should widen or throttle automatically.
- Decision: add `provider_scale_surface_profile` to Australian wholesaler/provider selection.
- Why: Racing and Sports public disclosures add scale/surface signals (coverage depth and delivery lines) not represented by RA wholesaler authorization alone.

## Provider comparison (incremental high-signal additions, pass 138)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Developer Program thread + announcements index (`No Delays on Passive Bets`, announcement board metadata) | Dated rollout chronology through Feb 2026, response/latest-post state, and API-signposting workflow cues for dynamic delay regimes | Forum/ops layer; racing-specific effects still require market-level validation | A/B | Implement delay-policy epoch snapshots and policy-churn-aware execution confidence controls |
| Racing and Sports corporate pages (`Investor Centre`, `Home`, `Enhanced Information Services`) | Provider-scale and product-surface claims (`jurisdictions`, corpus size, product-line breadth, distributor-role framing) for AU provider ranking | Vendor/corporate self-description, not contract SLA telemetry; requires runtime verification | B | Add provider-scale/surface priors with explicit source-type confidence weighting |

## Data contract additions required (incremental, pass 138)

- `betfair_delay_policy_epoch_snapshot`:
- `capture_ts`, `thread_id`, `latest_post_ts`, `responses_count`, `sports_scope_json`, `api_signposted_flag`, `rollout_state(active|stable)`, `source_url`.
- `betfair_delay_policy_rollout_event`:
- `capture_ts`, `event_date`, `thread_post_number`, `sport`, `competition_scope`, `odd_event_id_test_flag`, `source_url`.
- `execution_policy_churn_state`:
- `capture_ts`, `provider`, `policy_surface(delay_policy)`, `snapshot_age_hours`, `churn_confidence(normal|elevated|stale)`, `source_url`.
- `provider_scale_surface_profile_snapshot`:
- `capture_ts`, `provider_name`, `jurisdictions_count_claim`, `data_points_count_claim`, `annual_unique_users_claim`, `annual_pageviews_claim`, `product_surface_json`, `source_type`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 138)

- What snapshot cadence is sufficient for Betfair delay-policy state during active rollout (`hourly`, `daily`, event-driven from forum deltas)?
- Should stale `policy_churn_confidence` hard-block late execution or only apply uncertainty widening and size haircuts?
- What minimum runtime telemetry evidence is required before promoting provider-scale claims from `B` evidence into operational routing weights?

## Ranked implementation backlog (delta, pass 138)

### P0 additions

1. Implement `betfair_delay_policy_epoch_service` with daily snapshots from announcements index plus thread chronology parsing.
2. Add `policy_churn_confidence` guardrails to late-window execution sizing and slippage confidence intervals.
3. Add `provider_scale_surface_profile` ingestion for Racing and Sports and wire source-confidence tags into provider ranking.

### P1 additions

1. Build drift monitors comparing `policy epoch` changes against fill/slippage anomalies by market regime.
2. Add provider-claim validation jobs that reconcile scale/surface claims against observed API completeness/latency metrics.
3. Extend provider-scale profile ingestion to additional RA-authorized wholesalers for symmetric comparison.

### P2 additions

1. Add automatic forum-thread delta extraction for other Betfair microstructure threads tied to delay/status fields.
2. Build a transferability score mapping non-racing delay-policy rollouts to horse-racing execution risk confidence.
3. Add longitudinal confidence decay for vendor-scale claims when no corroborating telemetry is observed.

## Sources for this update (pass 138)

- Betfair Developer Program forum thread, `No Delays on Passive Bets - Selected Events - PLEASE SUBSCRIBE FOR UPDATES` (post chronology through 2026-02-04 and API-signposting statements; crawled 2026-04-04): https://forum.developer.betfair.com/forum/developer-program/announcements/40962-no-delays-on-passive-bets-selected-events-please-subscribe-for-updates?p=41579
- Betfair Developer Program forum index, `Announcements` (response counts and latest-post metadata including dynamic-delay sticky thread status; crawled 2026-04-04): https://forum.developer.betfair.com/forum/developer-program/announcements
- Racing and Sports, `Investor Centre` (jurisdictions/data-corpus/product-surface and audience-scale claims; accessed 2026-04-04): https://racingandsports.company/investor-centre/
- Racing and Sports, `Home` (coverage and solution framing; accessed 2026-04-04): https://racingandsports.company/
- Racing and Sports, `Enhanced Information Services` (approved distributor statement and product descriptors; accessed 2026-04-04): https://racingandsports.company/enhanced-information-services/

## Incremental architecture decisions from this run (2026-04-04, pass 139)

- Decision: add a `provider_footprint_claim_registry` with explicit source-confidence tags.
- Why: InForm's official release contributes named partner-footprint and audience-scale claims that are useful for fallback priors, but are provider-authored and require telemetry corroboration.
- Decision: add a `provider_transport_change_watcher` for AU wholesaler delivery channels.
- Why: Mediality's file-delivery page signals an early-2025 delivery-process change plus credential-gated onboarding, indicating transport-path risk can change independently of entitlement framework status.
- Decision: separate `entitlement_valid` from `transport_operational_ready` as independent runtime gates.
- Why: authorised-wholesaler status alone does not guarantee current credential/process compatibility for ingestion.

## Provider comparison (incremental high-signal additions, pass 139)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| InForm official rebrand release (2025-03-26) | Named partner footprint (Sportsbet/TAB/RV/RQ) and monthly audience claim (`1.5m`) for provider-scale priors | Provider-authored media release; not contract/SLA evidence | A/B | Add footprint/audience claim registry with strict confidence-weighting and no direct routing uplift without telemetry validation |
| Mediality `digital file delivery` page | Explicit delivery-surface change signal (early-2025 change + credential onboarding path) | Web-surface operational note; no formal SLA/version contract in-page | A/B | Add transport-change watcher and credential-lifecycle checks as first-class ingestion controls |

## Data contract additions required (incremental, pass 139)

- `provider_footprint_claim_snapshot`:
- `capture_ts`, `provider_name`, `partner_name`, `partner_type`, `monthly_users_count_claim`, `audience_scope_claim`, `source_type`, `source_url`.
- `provider_transport_change_event`:
- `capture_ts`, `provider_name`, `transport_surface`, `change_effective_period_desc`, `credentials_required_flag`, `onboarding_contact_channel`, `source_url`.
- `provider_transport_operational_state`:
- `capture_ts`, `provider_name`, `entitlement_valid_flag`, `transport_ready_flag`, `credential_state(valid|expiring|invalid)`, `last_successful_pull_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 139)

- What corroboration threshold (for example, 30-day observed freshness/completeness) is required before partner-footprint claims can influence routing weights?
- Should `transport_ready_flag=false` hard-block ingestion immediately, or trigger a bounded grace period with failover before hard stop?
- How frequently should delivery-surface pages be snapshotted to catch transport/auth changes without excessive alert noise?

## Ranked implementation backlog (delta, pass 139)

### P0 additions

1. Implement `provider_transport_change_watcher` for active AU providers and alert on delivery/auth wording changes.
2. Add `provider_transport_operational_state` gate so entitlement validity and transport readiness are independently enforced.
3. Add credential-lifecycle telemetry (`valid`, `expiring`, `invalid`) to ingestion health dashboards and failover automation.

### P1 additions

1. Implement `provider_footprint_claim_registry` with source-confidence tags and no automatic routing impact.
2. Build validation jobs that compare claimed provider scale/footprint against measured freshness/completeness/latency.
3. Add replay annotations for transport-change windows so data gaps are not misattributed to model drift.

### P2 additions

1. Extend delivery-surface change watcher to non-wholesaler upstream dependencies (status pages, documentation portals, credential endpoints).
2. Build a provider claim decay model that downgrades stale uncorroborated claims over time.
3. Add periodic human review workflow for claim-to-telemetry mismatches.

## Sources for this update (pass 139)

- InForm, `News Perform Rebrands as InForm, Introducing Inform Connect and Inform Media` (published 2025-03-26; partner and audience claims; accessed 2026-04-04): https://www.informsportsracing.com.au/media/news-perform-rebrands-as-inform/
- Mediality Racing, `digital file delivery` page (early-2025 delivery change and credential path note; accessed 2026-04-04): https://medialityracing.com.au/filedelivery/

## Incremental architecture decisions from this run (2026-04-04, pass 140)

- Decision: add a `provider_monthly_transition_vector_service` that stores current-month metrics plus embedded prior-month comparators from RA reports.
- Why: November 2025 and December 2025 reports expose useful October/November baseline fields in-page, enabling trajectory reconstruction even when direct older documents are not yet ingested.
- Decision: add a `trajectory_confidence` control that penalizes state transitions with missing comparator continuity.
- Why: genetics `Tokyo (Backup)` appears as `N/A` in comparator fields in some months, which can overstate trend certainty if untreated.
- Decision: separate `comms_intensity_state` from `contact_sla_state` and `compilation_state`.
- Why: November/December show non-parallel movement across SMS/email volume, call-answer distribution, and nominations/acceptances timing; one aggregate health score is unsafe.

## Provider comparison (incremental high-signal additions, pass 140)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia monthly reports (Nov + Dec 2025 with embedded Oct/Nov comparators) | Reconstructable three-month transition vectors across contact SLA, communications intensity, compilation timeliness, uptime, and genetics backup latency | Monthly cadence and occasional comparator `N/A` values require continuity handling | A | Implement trajectory-aware provider-risk controls using monthly vectors and continuity flags |

## Data contract additions required (incremental, pass 140)

- `provider_monthly_transition_vector`:
- `capture_ts`, `provider`, `period_month`, `reference_prev_month`, `calls_inbound`, `calls_outbound`, `answer_lt_60s_pct`, `abandon_pct`, `nominations_pct`, `acceptances_pct`, `sms_sent`, `email_sent`, `website_unplanned_downtime_min`, `source_url`.
- `provider_transition_continuity`:
- `capture_ts`, `provider`, `period_month`, `metric_name`, `prev_value_missing_flag`, `continuity_score`, `source_url`.
- `provider_monthly_state_label`:
- `capture_ts`, `provider`, `period_month`, `contact_state`, `compilation_state`, `comms_intensity_state`, `genetics_backup_state`, `composite_state_label`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 140)

- What continuity threshold should downgrade transition confidence when prior-month comparator fields are `N/A`?
- Should `comms_intensity_state` influence execution sizing directly, or only through model-confidence modifiers?
- How many months of transition history are required before state-machine labels can be used in live risk gating?

## Ranked implementation backlog (delta, pass 140)

### P0 additions

1. Implement `provider_monthly_transition_vector_service` for RA monthly reports, persisting both current and embedded prior-month values.
2. Add `trajectory_confidence` logic that penalizes transitions with missing comparator continuity.
3. Add tri-axis gating (`contact_sla_state`, `compilation_state`, `comms_intensity_state`) in execution policy checks.

### P1 additions

1. Backfill transition vectors for Jul 2025 to Jan 2026 using monthly PDFs and validate state labeling stability.
2. Add dashboards showing month-over-month vector movement and disagreement states across contact/compilation/comms.
3. Run ablation tests comparing scalar health gating vs vector-trajectory gating for slippage/CLV anomaly prediction.

## Sources for this update (pass 140)

- Racing Australia, `Monthly Service Standard Performance Report - November 2025` (includes October comparator fields and November actuals across contact/comms/compilation/uptime/genetics; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-November-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report - December 2025` (includes November comparator fields and December actuals; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-December-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report index` (2025-2026 listing chronology; accessed 2026-04-04): https://www.racingaustralia.horse/freeservices/performancereport.aspx

## Incremental architecture decisions from this run (2026-04-04, pass 141)

- Decision: add a `provider_maintenance_cluster_monitor` fed by independent status-window notices.
- Why: Racing Australia's Jan-Mar 2026 sequence shows repeated module-scoped planned windows in short intervals, which is not captured by monthly uptime aggregates.
- Decision: add `surface_impact_scoring` in provider-risk gating.
- Why: outage notices are surface-specific (for example `Acceptances`, `Reports`, `StableAssist`, `myhorseracing`), so risk controls should depend on whether affected modules overlap current ingestion/execution dependencies.
- Decision: add `planned_window_haircut_policy` for pre-trade confidence and data-freshness thresholds.
- Why: clustered planned windows can temporarily increase stale-data and reconciliation risk even when overall uptime metrics remain strong.

## Provider comparison (incremental high-signal additions, pass 141)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia systems-status channel + March 2026 maintenance post | Independent operational notice stream with dated, module-level planned windows across Jan-Mar 2026 | Notice-channel content can be operationally brief and requires capture/versioning | A | Build maintenance-cluster monitor + module-overlap gating into daily execution controls |

## Data contract additions required (incremental, pass 141)

- `provider_planned_maintenance_window`:
- `capture_ts`, `provider`, `notice_id`, `notice_date`, `window_start_local_ts`, `window_end_local_ts`, `affected_surface`, `affected_module`, `source_url`.
- `provider_maintenance_cluster_state`:
- `capture_ts`, `provider`, `lookback_days`, `window_count`, `unique_surface_count`, `cluster_state`, `source_url`.
- `provider_surface_dependency_map`:
- `capture_ts`, `provider`, `surface_name`, `pipeline_dependency_class(critical|important|noncritical)`, `owner`, `source_url`.
- `execution_window_risk_adjustment`:
- `capture_ts`, `provider`, `surface_name`, `cluster_state`, `freshness_haircut_pct`, `size_haircut_pct`, `effective_from_ts`, `effective_to_ts`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 141)

- What lookback horizon (`7d`, `14d`, `30d`) best predicts execution-quality degradation from maintenance clustering?
- Should cluster-state gating be provider-global, or strictly limited to overlapping surfaces in `provider_surface_dependency_map`?
- What minimum notice lead time triggers mandatory strategy throttling vs advisory-only alerts?

## Ranked implementation backlog (delta, pass 141)

### P0 additions

1. Implement `provider_planned_maintenance_window` ingestion from independent status channels with daily snapshot/versioning.
2. Build `provider_maintenance_cluster_monitor` (`window_count`, `unique_surface_count`, state labels) and wire to execution pre-checks.
3. Add module-overlap gating using `provider_surface_dependency_map` so only relevant strategies are throttled.

### P1 additions

1. Backtest slippage/fill impacts around Jan-Mar 2026 planned-window clusters vs non-cluster periods.
2. Calibrate `planned_window_haircut_policy` by dependency class (`critical`, `important`, `noncritical`).
3. Add dashboards for notice chronology, affected-surface frequency, and cluster-state transitions.

## Sources for this update (pass 141)

- Racing Australia, `Systems Status Updates` (independent status channel and Jan-Mar 2026 planned maintenance listing; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status post, `Planned Maintenance - Thursday 5th March 2026` (module/time-window example in the Jan-Mar sequence; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/planned-maintenance-thursday-5th-march-2026.html

## Incremental architecture decisions from this run (2026-04-04, pass 142)

- Decision: add a `pool_connectivity_state_service` with explicit `commingled`, `degraded`, and `local_only` states.
- Why: HKJC's May 2025 incident shows live-session withdrawal of commingled partner flow and local-only continuation, which materially changes liquidity and dividend behavior.
- Decision: add `incident_class` and `dependency_class` dimensions to provider-risk gating (`maintenance`, `telecom_carrier`, `deployment`, `phone_carrier`).
- Why: Racing Australia's status corpus includes both planned API windows and unplanned dependency failures; these are not interchangeable risk surfaces.
- Decision: add an `incident_replay_timeline` artifact as a required input for backtest/live parity.
- Why: incident chronology (`detect`, `fallback`, `restore`) affects price formation and execution assumptions during affected windows.

## Provider comparison (incremental high-signal additions, pass 142)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| HKJC club statement (May 2025 commingling incident) | Primary evidence of real-time commingling fallback (`remove partner flow`, `local-only` continuation, delayed starts) | Non-AU venue; use as microstructure stress analog, not direct policy transfer | A | Add pool-connectivity state machine and fragmentation-aware execution controls |
| Racing Australia Systems Status (planned + unplanned posts) | Operational incident taxonomy across API windows and carrier/deployment outages | Feed is operationally terse and requires robust snapshot/versioning | A/A-B | Add incident-class registry and dependency-aware risk gating in provider control plane |

## Data contract additions required (incremental, pass 142)

- `pool_connectivity_state_event`:
- `capture_ts`, `venue`, `state(commingled|degraded|local_only)`, `state_transition_reason`, `affected_races_json`, `source_url`.
- `pool_fragmentation_observation`:
- `capture_ts`, `venue`, `race_number`, `local_pool_size`, `reference_pool_size_prev_race`, `dividend_gap_local_vs_host`, `source_url`.
- `provider_incident_registry`:
- `capture_ts`, `provider`, `event_type(planned|unplanned)`, `incident_class`, `dependency_class`, `affected_surface`, `start_ts`, `end_ts`, `rollback_flag`, `source_url`.
- `incident_replay_timeline`:
- `capture_ts`, `provider_or_venue`, `incident_id`, `detect_ts`, `mitigation_ts`, `fallback_ts`, `restore_ts`, `timeline_confidence`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 142)

- What hard thresholds should trigger automatic `local_only` strategy throttling (`pool-size ratio`, `latency spike`, or explicit status flag only)?
- Do we treat non-AU commingling incident analogs (HKJC/World Pool) as calibration priors only, or do we allow direct control-policy transfer?
- What snapshot cadence is sufficient for systems-status feeds to catch short-lived unplanned events without high false-alert noise?

## Ranked implementation backlog (delta, pass 142)

### P0 additions

1. Implement `pool_connectivity_state_service` and enforce stake caps/pause rules when state is `degraded` or `local_only`.
2. Build `provider_incident_registry` ingestion from Racing Australia systems-status planned and unplanned posts.
3. Add incident-class-aware pre-trade gates and freshness haircuts (`maintenance` vs `carrier` vs `deployment`).
4. Add `incident_replay_timeline` support in simulator/backtest so affected windows are replayed with correct connectivity state.

### P1 additions

1. Build pool-fragmentation diagnostics comparing local-only vs commingled liquidity/dividend behavior.
2. Calibrate incident-class hazard models for short-horizon reliability scoring and strategy throttling.
3. Add dashboard views for incident chronology, dependency class, and execution-quality deltas around fallback windows.

## Sources for this update (pass 142)

- HKJC Racing News, `Club Statement` (published 2025-05-25; commingling connectivity issue and local-only continuation details; accessed 2026-04-04): https://racingnews.hkjc.com/english/2025/05/25/club-statement/
- The Straight, `Commingling issue delivers a $69 million hit to Hong Kong turnover` (published 2025-05-26; secondary context for pool-size/dividend divergence; accessed 2026-04-04): https://thestraight.com.au/commingling-issue-delivers-a-69-million-hit-to-hong-kong-turnover/
- Racing Australia Systems Status, `Planned Maintenance - Monday 2nd June 2025` (module and API outage windows; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/planned-maintenance-monday-2nd-june-2025.html
- Racing Australia Systems Status, `Network Outage` (published 2020-08-31; telecommunications-provider outage affecting website + SNS; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/unplanned-interruptions-to-website-and-sns.html
- Racing Australia Systems Status home feed (planned/unplanned incident taxonomy and latest listing context; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status, `Software Deployment Issue triggering SMS notifications` (published 2024-07-30 listing context; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/software-deployment-issue-triggering-sms-notifications.html

## Incremental architecture decisions from this run (2026-04-04, pass 143)

- Decision: add an `nt_jurisdiction_control_plane` module with effective-date authority mappings.
- Why: NT primary sources show split licensing authority (commission vs director) plus a declared move to Racing NT Limited as race control body in late 2026.
- Decision: add `pooled_tote_dependency_graph` support in provider-risk controls.
- Why: NT totalisator guidance explicitly links UBET NT pooling to QLD/SA/TAS, so liquidity and outage assumptions should include linked-jurisdiction state.
- Decision: add `operator_registry_freshness_guard` for NT licensed operators.
- Why: NT operator roster is published with explicit last-updated markers and active/not-trading status changes, which are entitlement-critical for compliance and routing.

## Provider comparison (incremental high-signal additions, pass 143)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| NT Government `NT totalisator licence` | Primary NT tote structure: exclusive UBET NT licence term, role boundaries, and QLD/SA/TAS pooling linkage | Jurisdiction-specific policy page; pool behavior still needs runtime telemetry | A | Add NT totalisator structure registry and pooling-dependency risk overlays in tote execution models |
| NT Department `Sports bookmakers, betting exchange operators and totalisators` | Official operator/brand roster with explicit last-updated date and trading-status markers | Registry can change without schema/version notice; requires frequent snapshotting | A | Implement operator-registry snapshot + entitlement freshness checks |
| NT Department `Racing NT Board` | Declared governance transition to Racing NT Limited as race control body in late 2026 | Transition timing is prospective; implementation details may evolve | A/A-B | Add governance-transition timeline and effective-date authority switch logic |

## Data contract additions required (incremental, pass 143)

- `nt_operator_registry_snapshot`:
- `capture_ts`, `list_updated_date`, `company_name`, `trading_as`, `website_url`, `license_surface`, `trading_status`, `license_authority`, `source_url`.
- `nt_totalisator_structure_snapshot`:
- `capture_ts`, `license_holder`, `exclusive_term_years`, `license_award_year`, `pooled_with_jurisdictions_json`, `authority_split_note`, `source_url`.
- `jurisdiction_governance_transition_timeline`:
- `capture_ts`, `jurisdiction`, `future_rcb_name`, `transition_target_period`, `legal_reference`, `current_authority`, `planned_authority`, `source_url`.
- `pooled_jurisdiction_dependency_edge`:
- `capture_ts`, `source_jurisdiction`, `linked_jurisdiction`, `dependency_type(pooling)`, `edge_confidence`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 143)

- What snapshot cadence should govern NT operator-registry refresh (`daily` vs `weekly`) to balance entitlement accuracy and noise?
- Which rule should apply if registry status changes intraday (`not_currently_trading`) while open exposure exists?
- For pooled tote dependency, do we hard-gate NT execution when linked jurisdictions (QLD/SA/TAS) enter incident states, or apply graduated sizing haircuts?
- How should we schedule effective-date cutover tests for late-2026 Racing NT governance transition before production migration?

## Ranked implementation backlog (delta, pass 143)

### P0 additions

1. Implement `nt_operator_registry_snapshot` ingestion with last-updated marker capture and status-diff alerts.
2. Add `nt_jurisdiction_control_plane` authority mapping (`commission`, `director`, future `Racing NT`) with effective-date validation.
3. Build `pooled_tote_dependency_graph` edges for NT<->QLD/SA/TAS and wire dependency-aware pre-trade risk checks.

### P1 additions

1. Add registry-change replay tests to validate entitlement gating during active strategy windows.
2. Add governance-transition dry-run mode for late-2026 authority switch scenarios.
3. Calibrate pool-dependency risk multipliers using incident windows across linked jurisdictions.

## Sources for this update (pass 143)

- NT Government, `NT totalisator licence` (UBET NT exclusive term and pooled jurisdictions; accessed 2026-04-04): https://nt.gov.au/industry/gambling/licences/nt-totalisator-licence
- NT Department of Tourism and Hospitality, `Sports bookmakers, betting exchange operators and totalisators` (official NT licensed operators list with date marker and status fields; accessed 2026-04-04): https://dth.nt.gov.au/boards-and-committees/racing-commission/sports-bookmakers-and-betting-exchange-operators?affiliate=365_01165385
- NT Department of Tourism and Hospitality, `Racing NT Board` (late-2026 race-control-body transition statement; accessed 2026-04-04): https://dth.nt.gov.au/racing-gaming-and-licensing/racing-nt-board

## Incremental architecture decisions from this run (2026-04-04, pass 144)

- Decision: add an `sa_authorised_operator_registry_guard` with scheduled snapshot-diffing and entitlement freshness scoring.
- Why: SA's CBS roster is a live operator-level authorization surface with operative-date and notice metadata that can drift independently of broader wholesaler policy docs.
- Decision: add an `sa_event_obligation_monitor` for 14-day notifications (`change_of_particulars`, `disciplinary_or_criminal_proceedings`, cessation).
- Why: SA interstate betting compliance includes event-triggered obligations not covered by monthly fee-return schedulers.
- Decision: add `approved_contingency_scope` as a market-universe pre-check for SA routing.
- Why: SA explicitly limits accepted wagers to commissioner-approved contingencies and wagering-rule artifacts, so entitlement validity is not only operator-license status.
- Decision: add a fixed-date `sa_annual_return_cycle` control (`30 September`) to the compliance calendar service.
- Why: SA annual reporting cadence introduces a second temporal compliance axis beyond monthly obligations used in other states.

## Provider comparison (incremental high-signal additions, pass 144)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| SA.GOV.AU interstate-operator and contingencies pages | Primary jurisdictional obligations: remote-only operating conditions, annual return date (`30 Sep`), 14-day notification requirements, and approved-contingency/rule scope limits | Government web workflow pages may change structure; must snapshot and parse version markers | A | Implement SA event-obligation monitor + contingency-scope gate + annual-cycle scheduler |
| CBS SA authorised-operator register | Live operator roster with operator-level identity and status metadata (`domicile`, `operative date`, `notice date`) | Registry entries can update without schema/version notices and may include incomplete fields | A | Implement snapshot-diff ingestion + entitlement freshness alarms before SA market routing |

## Data contract additions required (incremental, pass 144)

- `sa_authorised_operator_snapshot`:
- `capture_ts`, `operator_name`, `notice_id`, `domicile_jurisdiction`, `operative_date`, `notice_date`, `source_url`.
- `sa_operator_obligation_event`:
- `capture_ts`, `operator_name`, `event_type`, `event_date`, `notification_due_date`, `submitted_date`, `within_14_day_window_flag`, `source_url`.
- `sa_annual_return_cycle_state`:
- `capture_ts`, `operator_name`, `return_due_date`, `return_submitted_flag`, `submission_ts`, `lateness_days`, `source_url`.
- `sa_contingency_scope_snapshot`:
- `capture_ts`, `approved_contingencies_version`, `wagering_rules_version`, `effective_from`, `source_url`.
- `jurisdiction_entitlement_freshness_score`:
- `capture_ts`, `jurisdiction`, `operator_name`, `registry_recency_hours`, `entry_completeness_score`, `event_obligation_state`, `annual_cycle_state`, `score`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 144)

- What snapshot cadence is required for SA authorised-operator roster drift (`daily` vs intra-day) to keep entitlement freshness acceptable without noisy false positives?
- Should missing `operative_date` fields in the SA register hard-block routing, or apply conditional risk haircuts until corroborated by notice PDF parsing?
- How should contingency-scope violations be handled in strategy orchestration (`hard reject` vs `route exclusion with alert`)?
- Do we standardize event-obligation monitoring across jurisdictions now, or implement SA-first and generalize after proving signal value?

## Ranked implementation backlog (delta, pass 144)

### P0 additions

1. Implement `sa_authorised_operator_snapshot` ingestion with diff-based alerts on roster changes and missing critical fields.
2. Build `sa_event_obligation_monitor` enforcing 14-day notification windows and exposing compliance-state telemetry.
3. Add `approved_contingency_scope` pre-trade gate for SA market-universe validation.
4. Add `sa_annual_return_cycle` scheduler with fixed `30 September` due-date state transitions.

### P1 additions

1. Parse linked SA notice PDFs into structured operator timeline events for deeper entitlement lineage.
2. Add `jurisdiction_entitlement_freshness_score` calibration using SA roster recency, completeness, and event-obligation state.
3. Integrate SA compliance-state outputs into execution sizing policy (`normal`, `watch`, `restricted`).

### P2 additions

1. Generalize `event_obligation_monitor` schema for reuse across other jurisdictions with event-driven obligations.
2. Add evidence-quality-aware fallback when SA web schema changes break automated extraction.
3. Build a jurisdictional calendar reconciler combining monthly, annual, and event-triggered obligations in one timeline UI.

## Sources for this update (pass 144)

- SA.GOV.AU, `Interstate betting operators` (operating conditions, annual return, and obligations; page last updated 2025-12-02; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/interstate-betting-operators
- SA.GOV.AU, `Notify of proceedings for authorised betting operator` (14-day proceedings notification requirement; page last updated 2025-12-02; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/interstate-betting-operators/notify-of-proceedings-for-authorised-betting-operator
- SA.GOV.AU, `Change of particulars for an authorised betting operator` (14-day notification for operator detail changes; page last updated 2025-12-02; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/interstate-betting-operators/change-of-particulars-for-an-authorised-betting-operator
- SA.GOV.AU, `Approved contingencies and wagering rules` (approved-contingency scope and wagering-rule surface; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/approved-contingencies-and-wagering-rules
- Consumer and Business Services (SA), `Current authorised interstate betting operators` (live roster metadata including domicile and operative-date fields; accessed 2026-04-04): https://www.cbs.sa.gov.au/sections/LGL/current-authorised-interstate-betting-operators

## Incremental architecture decisions from this run (2026-04-04, pass 145)

- Decision: add an `hrnsw_multi_clock_compliance_engine` with independent `D+5 return`, `D+7 payment`, optional `weekly return`, and `FY+90 certification` states.
- Why: direct HRNSW approval conditions show multiple independent obligation clocks that are not safely represented as a single monthly compliance marker.
- Decision: add a `betback_credit_allocation_resolver` for harness race-fields accounting.
- Why: HRNSW credit eligibility and allocation are rule-bound by account path, approved counterparty, wagering type ordering, and fee-difference adjustment.
- Decision: add `registry_content_recency` checks to operator entitlement ingestion.
- Why: HRNSW approved-operator artifact shows filename/version tokens can lag actual row-level recency, so freshness must be parsed from content.

## Provider comparison (incremental high-signal additions, pass 145)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| HRNSW Approval Conditions 2024-25 (direct PDF) | Primary harness race-fields contract semantics: dual month-end clocks, weekly-return escalation, FY certification path, late-payment economics, and bet-back allocation logic | Annual-condition artifact; needs yearly version capture and parser regression tests | A | Promote HRNSW harness module from provisional to primary-condition mode with clause-level parsing |
| HRNSW Approved Wagering Operators roster PDF | Operator/category/code/date roster with row-level approval chronology usable for entitlement gating and bet-back eligibility checks | File naming/version token may not reflect content recency; OCR/layout noise on long rows | A | Gate on parsed row data + snapshot diffs; add filename-vs-content recency diagnostics |

## Data contract additions required (incremental, pass 145)

- `hrnsw_compliance_clock_state`:
- `capture_ts`, `period_end_date`, `return_due_date_d5`, `payment_due_date_d7`, `weekly_return_required_flag`, `week_end_day`, `state`, `source_url`.
- `hrnsw_final_certification_state`:
- `capture_ts`, `financial_year_end`, `cert_due_date`, `audit_required_flag`, `stat_dec_turnover_threshold_aud`, `submitted_ts`, `state`, `source_url`.
- `hrnsw_penalty_policy_snapshot`:
- `capture_ts`, `interest_basis`, `interest_margin_pct`, `monthly_late_fee_aud`, `cancellation_risk_flag`, `source_url`.
- `hrnsw_betback_credit_rule_snapshot`:
- `capture_ts`, `account_only_flag`, `approved_counterparty_required_flag`, `same_type_first_flag`, `cross_type_fee_adjustment_flag`, `source_url`.
- `hrnsw_operator_registry_snapshot`:
- `capture_ts`, `file_name_token`, `operator_name`, `category`, `approval_code`, `approval_date`, `latest_row_date_in_file`, `filename_content_recency_gap_days`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 145)

- For HRNSW, should `D+5 return` and `D+7 payment` breaches trigger separate severity ladders, or a joint compliance state with weighted penalties?
- What parser-confidence threshold is required before auto-enabling roster-based entitlement gates on noisy long-row PDF records?
- Should weekly-return requests be modeled as ad-hoc events only, or as a persistent elevated-supervision regime until explicitly cleared?
- How should we backfill historical HRNSW operator roster deltas when only periodic static-style file URLs are available?

## Ranked implementation backlog (delta, pass 145)

### P0 additions

1. Implement `hrnsw_multi_clock_compliance_engine` with explicit `D+5`, `D+7`, weekly, and `FY+90` timers and breach-state outputs.
2. Build clause parser for HRNSW direct approval-condition PDFs and deprecate summary-page-only harness assumptions.
3. Add `betback_credit_allocation_resolver` and enforce account-path + approved-counterparty + wagering-type allocation logic before rebate-adjusted PnL attribution.
4. Ingest `hrnsw_operator_registry_snapshot` with row-level date parsing and recency-gap diagnostics (`filename token` vs `latest row date`).

### P1 additions

1. Add replay tests for split-clock breach scenarios (`return late`, `payment on-time`, and inverse).
2. Calibrate penalty-impact accounting under HRNSW late-payment policy (`RBA bill +2%` + fixed monthly fee).
3. Build roster-diff alerting and counterparty approval freshness scoring for harness routing.

### P2 additions

1. Generalize multi-clock compliance engine across other jurisdictions with mixed monthly/annual/event obligations.
2. Add OCR/parse quality scoring to roster ingestion and manual-review queue for low-confidence row captures.
3. Build a jurisdictional compliance-calendar view combining due clocks, verification mode, and penalty-state trajectories.

## Sources for this update (pass 145)

- HRNSW, `Approval Conditions 2025` (direct 2024-25 conditions PDF: fees, deadlines, bet-back credits, certification, penalties; accessed 2026-04-04): https://www.hrnsw.com.au/Uploads/files/Race%20Fields%20Legislation/2025%2007%2001%20-%20HRNSW%20Approval%20Conditions%202024-2025%20Final.pdf
- HRNSW, `Approved Wagering Operators` roster PDF (operator categories and approval-date rows, including 2025 entries in captured artifact; accessed 2026-04-04): https://www.hrnsw.com.au/Uploads/files/Race%20Fields%20Legislation/Approved%20Wagering%20Operators_010720_v3.pdf
- HRNSW, `Race Fields and Corporate Wagering Operators` page (source index for approval-condition and roster artifacts; accessed 2026-04-04): https://www.hrnsw.com.au/hrnsw/race-fields-and-corporate-wagering-operators

## Incremental architecture decisions from this run (2026-04-04, pass 146)

- Decision: add a `source_confidence_weighting_layer` for legacy syndicate-method claims.
- Why: new Benter/Woods detail from Ziemba's 2020 survey is high-signal but mixed source-type (survey + participant narrative), so it should initialize priors rather than become unqualified hard logic.
- Decision: add a `market_as_feature_experiment_harness` to test private-only vs private+market-input probability pipelines.
- Why: the Ziemba source explicitly describes both pathways in successful syndicate practice.
- Decision: add an `entain_affiliate_contract_gate` for any Ladbrokes Affiliates API ingestion.
- Why: docs specify personal-use/non-republication limits, additive-schema behavior, beta endpoint churn, required partner headers, and endpoint-level shape limits.
- Decision: add provider-schema volatility telemetry (`open-schema append` + beta flags) to ingestion quality controls.
- Why: parser stability and train/serve schema consistency are otherwise at risk when providers reserve additive-change rights.

## Provider comparison (incremental high-signal additions, pass 146)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Ziemba LSE discussion paper (2020) | Additional Benter/Woods method-lineage claims: high-factor modeling, market-as-input pathway, discounted-Harville adaptation context, syndicate scale/setup observations | Mixed source type (survey plus participant narrative); claims require replication before hard production use | A/B | Use for hypothesis/prior generation with explicit confidence tags, not direct production thresholds |
| Ladbrokes AU Affiliates API docs | Machine-readable AU racing surface (live/historical, multi-code) with explicit schema/version/auth/query contracts | Personal-use and non-republication restrictions; beta volatility; partner-header dependency; endpoint limits | A | Treat as restricted research/enrichment candidate only until commercial/redistribution terms are confirmed |

## Data contract additions required (incremental, pass 146)

- `method_claim_registry`:
- `capture_ts`, `operator_or_team`, `claim_family`, `claim_value`, `source_type`, `confidence_grade`, `source_url`.
- `market_as_feature_experiment_snapshot`:
- `capture_ts`, `jurisdiction`, `model_variant(private_only|private_plus_market)`, `calibration_delta`, `clv_delta`, `robustness_score`.
- `provider_usage_rights_snapshot`:
- `capture_ts`, `provider`, `allowed_use_scope`, `republish_allowed_flag`, `commercial_contract_status`, `source_url`.
- `provider_schema_contract_snapshot`:
- `capture_ts`, `provider`, `schema_mode`, `beta_flag`, `required_headers_json`, `appenditive_change_allowed_flag`, `source_url`.
- `provider_endpoint_limit_snapshot`:
- `capture_ts`, `provider`, `endpoint_path`, `default_limit`, `max_limit`, `date_window_max_days`, `pagination_mode`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 146)

- What evidence threshold upgrades a `survey/participant narrative` method claim into production-default logic (replicated backtest, independent paper, or both)?
- For the `market-as-feature` branch, which AU slices (NSW/VIC metro only vs broader) should be used first for fair transferability tests?
- Do we pursue commercial rights discussions for Ladbrokes affiliate data, or keep this source permanently out of execution-path ingestion?
- What schema-drift SLO should trigger automatic feature suppression when additive fields appear on beta-tagged endpoints?

## Ranked implementation backlog (delta, pass 146)

### P0 additions

1. Implement `source_confidence_weighting_layer` and require confidence tags on all non-replicated syndicate-method claims.
2. Build `market_as_feature_experiment_harness` and run private-only vs private+market ablations on the current AU win-market slice.
3. Add `entain_affiliate_contract_gate` with hard-block for personal-use-only restrictions in production contexts.
4. Implement additive-schema-safe parsers and schema-drift alerts for beta/open-schema provider surfaces.
5. Persist `provider_endpoint_limit_snapshot` and enforce endpoint-specific list-window guards (`max limit`, date-range caps).

### P1 additions

1. Run replication studies to validate discounted-ordering model portability (Harville-adjustment style) on AU data before any exotic-market expansion.
2. Build provider-rights audit reports linking every model feature to allowed-use scope and redistribution status.
3. Add roadmap realism metrics tying team-capacity assumptions to implementation throughput (reflecting observed syndicate-scale complexity claims).

## Sources for this update (pass 146)

- William T. Ziemba, `Parimutuel betting markets: racetracks and lotteries revisited` (LSE SRC Discussion Paper 103; September 2020): https://www.fmg.ac.uk/sites/default/files/2020-09/dp-103.pdf
- LSE Research Online record for Ziemba paper (archive metadata page): https://researchonline.lse.ac.uk/id/eprint/118873/
- Ladbrokes Australia `Affiliates API` documentation (v1.0.0): https://api-affiliates.ladbrokes.com.au/

## Incremental architecture decisions from this run (2026-04-04, pass 147)

- Decision: add a `qld_fee_basis_router` that branches exchange vs non-exchange fee normalization at source.
- Why: QLD conditions compute exchange obligations from `Betting Exchange Revenue` and non-exchange obligations from `Assessable Turnover`, so a single fee-normalization path will misprice net edge.
- Decision: add a `qld_three_clock_month_end_engine` (`statement_due_d+5bd`, `invoice_received`, `payment_due_invoice+10bd`).
- Why: the QLD contract splits monthly compliance across statement, invoicing, and payment events; collapsing to one month-end checkpoint loses deterministic breach state.
- Decision: add a `qld_arrears_state_machine` with economic and authority outcomes.
- Why: RQ specifies daily-compound arrears interest (`RBA cash target +2%`) plus possible authority cancellation after 30 days post-reminder.
- Decision: add a `qld_submission_channel_router` keyed to turnover bands and expected-turnover state.
- Why: QLD uses different operational pathways (`daily FTP` vs monthly submission-by-5th-business-day) around the `A$5m` threshold.
- Decision: add `qld_mbl_automation_semantics` into execution-policy logic.
- Why: QLD minimum-bet rules require automation support for market selection/bet-slip addition but do not require acceptance of completed automated bet transactions.

## Provider comparison (incremental high-signal additions, pass 147)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Queensland FY25-27 General Conditions (direct PDF) | Clause-level fee basis/rates, monthly and arrears timing, turnover-band submission modes, annual assurance thresholds, and minimum-bet/automation semantics | Jurisdiction-specific legal instrument; requires strict effective-date versioning and parser regression controls | A | Promote QLD from template-level tracking to clause-level compliance + execution state machine |
| Racing Queensland race-information index page | Current authority-cycle context and source-declared authorised-operator list freshness marker (`as at 2026-03-30`) | Page and linked artifacts may update without stable API schema | A | Keep marker-aware entitlement freshness snapshots and diff alerts |

## Data contract additions required (incremental, pass 147)

- `qld_fee_basis_snapshot`:
- `capture_ts`, `operator_mode`, `fee_base_type`, `source_url`.
- `qld_fee_rate_ladder_snapshot`:
- `capture_ts`, `turnover_threshold_aud`, `rate_tb_bps`, `rate_harness_bps`, `rate_greyhound_bps`, `source_url`.
- `qld_monthly_compliance_clock`:
- `period_end_date`, `statement_due_date`, `statement_submitted_ts`, `invoice_received_ts`, `payment_due_date`, `payment_submitted_ts`, `state`, `source_url`.
- `qld_arrears_state`:
- `capture_ts`, `days_since_reminder`, `interest_basis`, `interest_margin_pct`, `daily_compound_flag`, `authority_cancellation_risk_flag`, `source_url`.
- `qld_wagering_info_channel_rule`:
- `capture_ts`, `turnover_band`, `expected_turnover_band`, `submission_channel`, `submission_due_rule`, `source_url`.
- `qld_annual_assurance_rule`:
- `capture_ts`, `turnover_band`, `exchange_operator_flag`, `assurance_type`, `due_days_after_fy_end`, `source_url`.
- `qld_min_bet_limit_automation_rule`:
- `capture_ts`, `race_code`, `to_lose_limit_win_or_each_way`, `to_lose_limit_place`, `final_field_display_deadline_local`, `allow_market_select_automation_flag`, `must_accept_completed_automation_bet_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 147)

- Do we treat missing `invoice_received_ts` as a hard stop for payment-clock logic, or infer receipt from platform inbox telemetry after a timeout?
- Should QLD arrears-interest accrual be booked as realized cost daily or as contingent liability until paid?
- For operators near `A$5m`, what trigger governs channel switching (`expected` vs `actual` turnover) when forecasts and settled values diverge mid-period?
- How should execution policy respond when a strategy relies on full automated bet submission in a jurisdiction that only guarantees automation for market selection and bet-slip construction?

## Ranked implementation backlog (delta, pass 147)

### P0 additions

1. Implement `qld_fee_basis_router` and validate exchange-vs-turnover fee paths in replay.
2. Build `qld_three_clock_month_end_engine` with independent D+5 statement and invoice+10BD payment timers.
3. Add `qld_arrears_state_machine` with daily interest accrual and authority-cancellation-risk thresholds.
4. Implement turnover-band `qld_submission_channel_router` (`daily FTP` vs monthly-by-5th-business-day).
5. Persist `qld_min_bet_limit_automation_rule` and wire into order-entry capability gating.

### P1 additions

1. Add reconciliation jobs that cross-check statement, invoice, and payment timestamps against jurisdiction clocks.
2. Calibrate near-threshold (`~A$5m`) turnover-switch instability and define conservative fallback behavior.
3. Build an alert pack for QLD minimum-bet complaints/compliance events tied to automation-related rejection patterns.

### P2 additions

1. Generalize three-clock + arrears engine templates across jurisdictions with invoice-mediated payment models.
2. Add legal-artifact diffing for QLD condition revisions and auto-generate migration impact notes for feature contracts.
3. Integrate jurisdiction-specific automation-permission semantics into strategy deployment scoring.

## Sources for this update (pass 147)

- Racing Queensland, `General Conditions for Race Information Authority (1 July 2025 - 30 June 2027)` (clause-level fee, timing, arrears, reporting, and minimum-bet terms; accessed 2026-04-04): https://www.racingqueensland.com.au/getmedia/d3bc5b41-5150-483f-b0b9-ede6f4733ba4/25-0610-General-Conditions-for-Race-Information-Authority-1-July-2025-30-June-2027-FINAL.pdf
- Racing Queensland, `Race Information` page (authority context and authorised-WSP list marker as at 2026-03-30; accessed 2026-04-04): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information

## Incremental architecture decisions from this run (2026-04-04, pass 148)

- Decision: add a `tas_integrity_conditions_engine` separate from Tasmania's fee/reporting calculators.
- Why: Tasracing's post-2024 artifacts and reg 56 define a 10-clause integrity-control set (identity, monitoring, warning-off exclusion, secure audit trail, licence continuity, disciplinary notifications) that is not reducible to fee/payment states.
- Decision: add a `tas_dual_surface_policy_resolver` to co-version `Standard Conditions (2019)` and `Integrity Conditions (as at 2025-07-01)`.
- Why: Tasracing currently publishes both surfaces; replay and live gating need deterministic source/effective-window joins to avoid policy drift.
- Decision: add a `tas_application_disclosure_ingestor` for pre-approval quantitative/control metadata.
- Why: the domestic application form now captures structured turnover/bet-back history, FY forecast, channel-mode declarations, and integrity-process attestations that can improve compliance priors and capacity planning.

## Provider comparison (incremental high-signal additions, pass 148)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Tasracing Integrity Conditions (as at 1 Jul 2025) | Compact clause-level integrity contract with explicit obligations and immediate-notice semantics | One-page artifact can change without API/version feed; requires snapshot hashing | A | Implement Tasmania integrity-state machine with clause-level telemetry |
| Tasmanian Legislation: RRI Regulations 2024 reg 56 + Act 2024 s128 | Statutory basis for prescribed integrity conditions, specified-body scope, and publication obligations | Legislative amendments can alter prescribed set; monitor revision history | A | Anchor parser logic to statute/regulation references and effective dates |
| Tasracing Domestic Application form | Structured pre-approval data for wagering modes, historical/forecast turnover, bet-back profile, and integrity-process disclosures | Applicant-provided values require reconciliation against realized reports | A | Ingest as attestation layer and add drift checks vs realized turnover/compliance events |

## Data contract additions required (incremental, pass 148)

- `tas_integrity_conditions_snapshot`:
- `capture_ts`, `as_at_date`, `condition_count`, `source_url`, `document_hash`.
- `tas_integrity_condition_rule`:
- `capture_ts`, `rule_id`, `rule_family`, `immediacy_required_flag`, `where_able_flag`, `cross_jurisdiction_licence_required_flag`, `source_url`.
- `tas_specified_body_registry`:
- `capture_ts`, `body_name`, `body_type`, `source_url`.
- `tas_disciplinary_notice_event`:
- `event_ts`, `operator_name`, `jurisdiction`, `action_type(prosecution|disciplinary)`, `notified_ts`, `latency_seconds`, `source_url`.
- `tas_application_disclosure_snapshot`:
- `capture_ts`, `operator_name`, `betting_exchange_flag`, `publication_history_5y_flag`, `source_url`.
- `tas_application_turnover_history`:
- `capture_ts`, `fin_year`, `code`, `assessable_turnover_aud`, `bet_back_share_pct`, `source_url`.
- `tas_application_turnover_forecast`:
- `capture_ts`, `fin_year`, `code`, `forecast_turnover_aud`, `forecast_bet_back_share_pct`, `source_url`.
- `tas_application_integrity_process_decl`:
- `capture_ts`, `operator_name`, `kyc_declared_flag`, `suspicious_betting_policy_declared_flag`, `warning_off_screening_declared_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 148)

- For Tasmania, should any breach in integrity-clause telemetry be a hard execution stop, or do some clauses (`where able` monitoring participation) use staged degradation?
- What reconciliation cadence should compare application-declared turnover/bet-back forecasts against realized monthly returns to detect governance drift early?
- How should we version and diff Tasracing's 2019 standard conditions against 2025 integrity conditions to avoid false policy-conflict alerts when both remain published?
- Do we normalize `specified body` references into a shared national entity registry now, or keep Tasmania-specific mapping until more jurisdictions expose equivalent clause structures?

## Ranked implementation backlog (delta, pass 148)

### P0 additions

1. Implement `tas_integrity_conditions_engine` with clause-level state outputs and immediate-notice breach telemetry.
2. Build `tas_dual_surface_policy_resolver` to co-version Tasmania 2019 standard conditions and 2025 integrity conditions by effective window.
3. Ingest and normalize `tas_application_disclosure_snapshot` with channel-mode, turnover history/forecast, and integrity-process declarations.
4. Add `tas_disciplinary_notice_event` and `warning_off_account_block` checks into counterparty eligibility gating.

### P1 additions

1. Build drift monitors comparing application forecasts (`turnover`, `bet-back share`) against realized monthly outcomes.
2. Add `integrity_enforcement_pressure_score` to strategy sizing/routing policy for Tas-linked exposure.
3. Implement document-hash diff alerts for Tasracing Integrity Conditions and Race Fields index artifacts.

### P2 additions

1. Generalize `integrity_condition_rule` schema for reuse in other jurisdictions with explicit integrity-condition schedules.
2. Add a national `specified_body_registry` service for cross-jurisdiction warning-off and disciplinary-event joins.
3. Build replay tooling that can simulate policy-surface drift where statutory and published-condition artifacts move out of sync.

## Sources for this update (pass 148)

- Tasracing, `Race Fields Information` index (current links to Integrity Conditions, Domestic Application, and Standard Conditions; accessed 2026-04-04): https://tasracing.com.au/documents/race-fields-information
- Tasracing PDF, `Integrity Conditions` (`as at 1 July 2025`; 10 integrity clauses under s128(4); accessed 2026-04-04): https://tasracing.com.au/hubfs/Corporate%20Documents/Integrity%20Conditions.pdf
- Tasracing PDF, `Application to Publish - Domestic` (section-128(2) disclosure structure and quantitative/integrity declarations; accessed 2026-04-04): https://tasracing.com.au/hubfs/Corporate%20Documents/Application%20to%20Publish%20-%20Domestic.pdf
- Tasmanian Legislation PDF, `Racing Regulation and Integrity Regulations 2024` (Part 5, reg 56 integrity-condition prescription and specified-body scope; accessed 2026-04-04): https://www.legislation.tas.gov.au/view/pdf/asmade/sr-2024-078
- Tasmanian Legislation, `Racing Regulation and Integrity Act 2024` (section 128 approval/condition/publication obligations; accessed 2026-04-04): https://www.legislation.tas.gov.au/view/whole/html/inforce/2025-05-16/act-2024-016

## Incremental architecture decisions from this run (2026-04-04, pass 149)

- Decision: add an `hkjc_commingling_mix_monitor` and include it in transfer/regime gating.
- Why: HKJC's 2024/25 season table shows commingling turnover (`HK$34,004m`, `+9.9%`) growing faster than Hong Kong customer turnover (`HK$104,847m`, `+1.0%`) and total turnover (`+3.0%`), so pool-mix state cannot be treated as static background.
- Decision: add `turnover_vs_income_decomposition` for HK-linked priors.
- Why: retained commingling income growth (`+16.7%`) diverges from domestic-customer income trend (`-0.7%`), which can distort simplistic turnover-only economics assumptions.
- Decision: add a `betfair_cert_auth_control_plane` as separate infrastructure from session keep-alive management.
- Why: Betfair non-interactive login requires linked `2048-bit RSA` certificate auth; this creates a certificate-lifecycle failure mode that is independent of session cadence/2FA posture.

## Provider comparison (incremental high-signal additions, pass 149)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| HKJC `Horse Racing Turnover - Season Total` PDF (2025-07-17) | Primary table-level commingling vs domestic turnover and retained-income components for 2024/25 | Annual/seasonal cadence; jurisdiction-specific to HK pools | A | Add commingling-mix regime monitor and turnover-vs-income decomposition features for HK transfer logic |
| Betfair non-interactive login documentation | Primary certificate-auth contract for bot login (linked self-signed cert, 2048-bit RSA requirement, 2FA interaction note) | Documentation-level contract; cert operational state must be observed in runtime telemetry | A | Implement certificate lifecycle monitoring and auth-capability gating before relying on non-interactive production sessions |

## Data contract additions required (incremental, pass 149)

- `hkjc_commingling_mix_snapshot`:
- `capture_ts`, `season_label`, `local_commingling_turnover_hkm`, `total_commingling_turnover_hkm`, `hk_customer_turnover_hkm`, `total_turnover_hkm`, `comm_turnover_share_pct`, `source_url`.
- `hkjc_income_mix_snapshot`:
- `capture_ts`, `season_label`, `commingling_income_hkm`, `hk_customer_income_hkm`, `comm_income_share_pct`, `source_url`.
- `hkjc_mix_drift_event`:
- `event_ts`, `season_label`, `comm_share_delta_pct_pt`, `income_share_delta_pct_pt`, `severity`, `source_url`.
- `betfair_cert_auth_profile`:
- `capture_ts`, `app_key`, `auth_mode`, `cert_key_type`, `cert_key_bits`, `cert_linked_flag`, `cert_expiry_ts`, `website_2fa_independent_flag`, `source_url`.
- `betfair_cert_auth_event`:
- `event_ts`, `app_key`, `event_type`, `error_code`, `recovered_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 149)

- What threshold in HK commingling-share drift should trigger automatic downweighting of historical transfer priors?
- Should HK turnover-mix updates be ingested seasonally only, or augmented with intra-season proxies from meeting-level releases?
- For Betfair cert auth, what minimum certificate-expiry buffer (for example, 30 vs 60 days) should trigger pre-emptive rotation and deployment freeze?
- Do we require dual cert-auth readiness (active + standby cert/app key path) for production cutover, or accept single-path risk in Phase 1?

## Ranked implementation backlog (delta, pass 149)

### P0 additions

1. Implement `hkjc_commingling_mix_monitor` and persist season-level turnover/income mix ratios.
2. Add `pool_mix_drift_penalty` in transfer-learning gating when commingling-share deltas exceed configured thresholds.
3. Stand up `betfair_cert_auth_control_plane` with certificate linkage checks, expiry alarms, and startup preflight validation.
4. Extend execution readiness checks to include `auth_mode_capability` (non-interactive cert path available vs unavailable).

### P1 additions

1. Build HK turnover-vs-income decomposition dashboards and integrate into strategy-capacity review.
2. Add cert-rotation runbooks and synthetic cert-login probes in non-prod/prod.
3. Add incident taxonomy for auth failures (`cert_missing`, `cert_expired`, `cert_unlinked`, `cert_login_fail`) and wire into pager policy.

### P2 additions

1. Generalize `commingling_mix_monitor` schema for other commingled tote jurisdictions.
2. Add a forecast model for next-season commingling-share shift and test sensitivity in bankroll/routing simulations.
3. Automate documentation-watch on Betfair auth-contract pages for cert requirement changes.

## Sources for this update (pass 149)

- HKJC, `Horse Racing Turnover - Season Total` PDF (published 2025-07-17; commingling/domestic turnover and betting-income components; accessed 2026-04-04): https://res.hkjc.com/racingnews/wp-content/uploads/sites/3/2025/07/20250717-seasontotalracingTurnover-E.pdf
- HKJC Racing News page, `Horse Racing Turnover - Season Total` (PDF index anchor; accessed 2026-04-04): https://racingnews.hkjc.com/english/2025/07/17/horse-racing-turnover-season-total-4/
- Betfair docs, `Non-Interactive (bot) login` (certificate-linked auth requirements for bot sessions; accessed 2026-04-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687915/Non-Interactive%20bot%20login

## Incremental architecture decisions from this run (2026-04-04, pass 150)

- Decision: add a `provider_maintenance_shape_engine` on top of existing planned-window ingestion.
- Why: Jan-Mar 2026 status cards expose repeatable structure (dense cadence, Monday concentration, and multi-window coupling) that a binary maintenance flag cannot represent.
- Decision: add a `maintenance_window_coupling_detector` with per-day compound risk outputs.
- Why: multiple cards show separate afternoon and evening windows on the same day; operational risk is additive and time-local, not one notice-wide constant.
- Decision: add a `status_notice_timezone_confidence_layer`.
- Why: cards mix explicit timezone-labelled windows with unlabeled local times, so replay/execution controls need confidence-weighted time normalization.

## Provider comparison (incremental high-signal additions, pass 150)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia systems-status homepage + 5 Mar 2026 card | Dated multi-card maintenance sequence with module-level window timings; enough structure to derive cadence/coupling/duration spread signals | Card summaries are concise and can use mixed/implicit timezone notation; requires conservative parser + confidence scoring | A/A-B | Implement maintenance-shape and timezone-confidence control planes; keep alerting tied to explicit parsed windows |

## Data contract additions required (incremental, pass 150)

- `provider_maintenance_shape_snapshot`:
- `capture_ts`, `provider`, `lookback_start_date`, `lookback_end_date`, `notice_count`, `monday_notice_count`, `coupled_window_notice_count`, `min_declared_window_minutes`, `max_declared_window_minutes`, `median_declared_window_minutes`, `module_breadth_max`, `timezone_label_coverage_ratio`, `source_url`.
- `provider_maintenance_notice_window`:
- `capture_ts`, `provider`, `notice_date`, `window_seq`, `start_local_time_text`, `end_local_time_text`, `declared_timezone_text`, `duration_minutes_declared`, `affected_modules_json`, `source_url`.
- `provider_status_time_normalization_event`:
- `capture_ts`, `provider`, `notice_date`, `timezone_inferred_flag`, `timezone_confidence_score`, `normalization_rule`, `source_url`.
- `execution_maintenance_shape_adjustment`:
- `capture_ts`, `provider`, `calendar_date`, `shape_pressure_score`, `coupled_window_flag`, `timezone_confidence_penalty_pct`, `freshness_haircut_pct`, `size_haircut_pct`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 150)

- What `shape_pressure_score` threshold should trigger hard execution throttles vs soft confidence haircuts?
- Should coupled-window days (`afternoon + evening`) force a full-day risk mode, or only window-adjacent suppression?
- What minimum timezone-confidence score is required before using status-card timings in automated replay alignment?

## Ranked implementation backlog (delta, pass 150)

### P0 additions

1. Implement `provider_maintenance_shape_engine` and persist lookback metrics (`notice_count`, `coupled_window_count`, duration spread, module breadth).
2. Build `maintenance_window_coupling_detector` and wire compound-window risk into pre-trade gating.
3. Add `status_notice_timezone_confidence_layer` with fail-safe defaults when timezone labels are absent.
4. Extend execution readiness checks with `shape_pressure_score` + `timezone_confidence_penalty`.

### P1 additions

1. Backtest slippage/availability drift on high-shape-pressure days vs low-pressure days using Jan-Mar 2026 windows.
2. Add dashboards for weekday concentration, duration distribution, and module-breadth drift in planned windows.
3. Build parser regression tests for mixed clock formats (`AEDT` labelled vs unlabeled local-time cards).

### P2 additions

1. Generalize maintenance-shape contracts for other status-card providers with short-form operational notices.
2. Add scenario simulation where timezone inference is wrong to quantify replay and compliance-clock sensitivity.
3. Introduce adaptive suppression windows that scale with recent coupled-window recurrence.

## Sources for this update (pass 150)

- Racing Australia Systems Status homepage (Jan-Mar 2026 planned-maintenance card sequence with module/time-window summaries; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status, `Planned Maintenance - Thursday 5th March 2026` (example card with multi-surface dual-window structure; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/planned-maintenance-thursday-5th-march-2026.html

## Incremental architecture decisions from this run (2026-04-04, pass 151)

- Decision: add a `topaz_entitlement_control_plane` before any greyhound data ingestion/execution path.
- Why: Topaz access is explicitly limited to active Betfair AU/NZ customers with key provisioning/screening gates, so ingestion availability is an entitlement-state problem, not only uptime.
- Decision: split Topaz ingestion into `monthly_backfill + daily_nearline` lanes with explicit lag awareness.
- Why: Topaz bulk-history surface is monthly/daily and documented as available up to `today-1`, so one cadence cannot optimize both long backfills and nearline updates.
- Decision: add a `runner_topology_reconciliation_layer` that joins Topaz runner attributes to Betfair market clarifications pre-execution.
- Why: the published workflow replaces Topaz `boxNumber` with Betfair-derived final box mapping, indicating a concrete final-field drift pathway near race time.

## Provider comparison (incremental high-signal additions, pass 151)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Betfair Automation Hub Topaz tutorial (GRV-backed product path) | Practical provider contract: access gating, bulk-history geometry (`2020+`, monthly/daily, `today-1` lag), retryable-failure patterns, and Topaz-to-Betfair field reconciliation workflow | Tutorial-level source (operationally useful but not formal legal/API SLA docs); must be monitored for content drift | A/B | Implement entitlement checks, lag-aware ingestion scheduler, and final-field reconciliation before live greyhound execution |
| Betfair Automation Hub FastTrack tutorial (deprecation marker) | Explicit migration marker (`FastTrack -> Topaz`) for legacy pipeline retirement | Historical/tutorial source; migration timing details not a machine-readable changelog | A/B | Decommission FastTrack assumptions and tag historical datasets by API generation |

## Data contract additions required (incremental, pass 151)

- `topaz_entitlement_state_snapshot`:
- `capture_ts`, `betfair_account_region`, `active_account_flag`, `topaz_key_present_flag`, `screening_required_flag`, `source_url`.
- `topaz_bulk_window_policy`:
- `capture_ts`, `history_start_date`, `supports_monthly_blocks_flag`, `supports_daily_blocks_flag`, `bulk_recency_lag_days`, `jurisdiction_codes_json`, `source_url`.
- `topaz_bulk_ingestion_event`:
- `event_ts`, `owning_authority_code`, `window_type(month|day)`, `window_start_date`, `window_end_date`, `retry_count`, `terminal_status`, `error_family`, `source_url`.
- `topaz_betfair_runner_reconciliation_event`:
- `event_ts`, `track`, `race_number`, `rug_number`, `topaz_box_number`, `betfair_box_number`, `override_applied_flag`, `source_url`.
- `provider_schema_generation_tag`:
- `capture_ts`, `provider`, `schema_generation(fasttrack|topaz)`, `effective_from_date`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 151)

- Do we hard-block execution when Topaz entitlement checks fail, or allow degraded operation from Betfair-only features for races missing Topaz joins?
- What reconciliation cutoff (for example, `T-10m` vs `T-2m`) should freeze Topaz-to-Betfair runner topology to avoid late churn while preserving final-field accuracy?
- Should monthly backfill and daily nearline jobs share one retry budget, or use independent budgets to prevent nearline starvation during historical catch-up?
- What monitoring cadence is sufficient to detect silent changes in tutorial-documented Topaz access/coverage behavior without formal API changelog guarantees?

## Ranked implementation backlog (delta, pass 151)

### P0 additions

1. Implement `topaz_entitlement_control_plane` with startup preflight (`active_account`, `key_present`, region eligibility) and hard fail-closed behavior.
2. Build `topaz_dual_lane_ingestor` (`monthly_backfill` + `daily_nearline`) with explicit `today-1` cutoff enforcement.
3. Implement `topaz_betfair_runner_reconciliation_layer` and block order generation when unresolved rug/box conflicts remain.
4. Add `schema_generation_tag` to all greyhound historical stores to separate FastTrack-era and Topaz-era records.

### P1 additions

1. Add drift dashboards for Topaz-vs-Betfair box reconciliation mismatches by track and time-to-jump bucket.
2. Build adaptive retry/backoff policies tuned separately for backfill and nearline lanes using observed 429/timeout incidence.
3. Add automated content-diff watchers for Topaz/FastTrack tutorial pages and route material contract changes to review.

### P2 additions

1. Generalize `provider_entitlement_control_plane` for other AU racing data providers with gated keys/onboarding checks.
2. Run ablation tests quantifying model degradation when Topaz features are missing and execution falls back to exchange-only inputs.
3. Build simulation modes for delayed or partial Topaz delivery to stress-test pre-race reconciliation and execution robustness.

## Sources for this update (pass 151)

- Betfair Automation Hub, `Greyhound Topaz API (Python)` (Topaz requirements, access gate wording, historic coverage window, monthly/daily bulk pattern, and retry/reconciliation implementation examples; accessed 2026-04-04): https://betfair-datascientists.github.io/modelling/topazTutorial/
- Betfair Automation Hub, `Greyhound FastTrack API (Python)` (deprecation notice confirming migration to Topaz API; accessed 2026-04-04): https://betfair-datascientists.github.io/modelling/fasttrackTutorial/

## Incremental architecture decisions from this run (2026-04-05, pass 152)

- Decision: implement an `ra_fod_eligibility_state_machine` with three independent clocks (`birth_due_clock`, `notification_appeal_clock`, `decision_sla_clock`).
- Why: RA FAQ + 2025 guidelines define distinct timing anchors (`30-day due`, post-notification `90-day` appeal hard stop, and `~21-day` decision target) that cannot be represented by a single late-flag field.
- Decision: split FOD fee handling into `lodgement_fee_path` and `appeal_fee_path` with versioned schedule metadata.
- Why: the guidelines state an after-60-day lodgement fee (stated as `$140` in 2025) plus a separate `$500` appeal fee with conditional refund and retained late-fee outcomes.
- Decision: add an `appeal_evidence_completeness_gate` before promoting eligibility-state-dependent features.
- Why: guidelines enforce evidence quality thresholds and written-only adjudication; insufficient submissions can be rejected before substantive outcome.

## Provider comparison (incremental high-signal additions, pass 152)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing Australia `Foal Ownership Compliance FAQs` | Operational deadline and consequence ladder for Mare Return/FOD, including explicit fee bands and ineligibility consequences | Web-surface operational text may change without version pinning; must snapshot frequently | A | Add versioned FOD rule-contract snapshot and eligibility-state transitions |
| Racing Australia `Appeal Guidelines ... Late Lodgement of FOD` PDF (2025-09-10) | Rule references (`AR286/AR287`), appeal-window constraints, fee-stack semantics, and adjudication-process contract (written-only, decision target) | Schedule values are date-qualified (`in 2025 or as updated`), requiring effective-date parameterization | A | Implement multi-clock appeal engine + evidence-completeness checks + fee versioning |

## Data contract additions required (incremental, pass 152)

- `ra_fod_rule_contract_snapshot`:
- `capture_ts`, `rules_referenced_json`, `live_fod_due_days`, `late_band_1_start_days`, `late_band_1_end_days`, `late_fee_band_1_aud`, `ineligible_threshold_days`, `after_60_lodgement_fee_aud`, `appeal_fee_aud`, `appeal_hard_stop_days_from_notification`, `appeal_decision_target_days`, `source_url`.
- `ra_fod_submission_event`:
- `event_ts`, `foal_id`, `mare_id`, `submission_type(live|non_live|not_served)`, `days_from_birth_at_lodgement`, `ineligible_flag_assigned`, `lodgement_fee_aud`, `source_url`.
- `ra_fod_notification_event`:
- `event_ts`, `foal_id`, `notification_channel(email)`, `notification_reason(after_60_lodgement)`, `source_url`.
- `ra_fod_appeal_event`:
- `event_ts`, `foal_id`, `days_from_notification`, `accepted_for_consideration_flag`, `decision_outcome(success|fail|rejected_insufficient_info)`, `decision_turnaround_days`, `appeal_fee_aud`, `appeal_fee_refund_applied_flag`, `source_url`.
- `ra_fod_appeal_evidence_item`:
- `event_ts`, `foal_id`, `evidence_family`, `document_type`, `sufficiency_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 152)

- Should unresolved FOD appeal states hard-block only registration-dependent features, or all downstream runner-level features to avoid leakage from ineligible trajectories?
- What fallback policy should apply when notification timestamps are missing but appeal outcomes are present (infer clock vs mark unknown and fail closed)?
- How should we parameterize fee schedules where RA text says `in 2025 or as updated` without explicit machine-readable effective-date tables?
- Do we require minimum evidence-family diversity (for example, objective third-party docs) before assigning non-zero appeal-success priors?

## Ranked implementation backlog (delta, pass 152)

### P0 additions

1. Implement `ra_fod_eligibility_state_machine` with explicit birth-, notification-, and decision-clock transitions.
2. Build `ra_fod_fee_version_resolver` separating lodgement vs appeal fee paths and effective-date overrides.
3. Add `ra_fod_appeal_completeness_gate` and block eligibility-dependent feature promotion on non-terminal or insufficient appeal states.
4. Persist `ra_fod_notification_event` so 90-day appeal deadlines are computed from notification events, not inferred birth offsets.

### P1 additions

1. Add dashboards for `fod_ineligible_rate`, `appeal_submission_rate`, `appeal_success_rate`, and `decision_turnaround_days` by foal season.
2. Backtest model sensitivity with and without unresolved-FOD rows to quantify eligibility-state leakage risk.
3. Add document-diff watchers for RA FAQ/guidelines pages and route fee/timing contract changes to compliance review.

### P2 additions

1. Generalize `eligibility_state_machine` primitives for other registration-governed datasets beyond FOD.
2. Add synthetic scenario testing for missing-notification timestamps and delayed adjudication outcomes.
3. Build a cross-jurisdiction registration-policy registry to compare Australian traceability clocks with other racing jurisdictions.

## Sources for this update (pass 152)

- Racing Australia, `Foal Ownership Compliance FAQs` (Mare Return/FOD deadline/fee and ineligibility/appeal process details; accessed 2026-04-05): https://www.racingaustralia.horse/RoR/Foal-Ownership-Compliance-FAQS.aspx
- Racing Australia PDF, `Appeal Guidelines in respect of Late Lodgement of Foal Ownership Declarations` (dated 2025-09-10; AR286/AR287 references, fee layering, 90-day post-notification appeal limit, and 21-day decision-target text; accessed 2026-04-05): https://www.racingaustralia.horse/RoR/Appeal-Guidelines-for-Late-Lodgement-of-Foal-Ownership-Declarations.pdf

## Incremental architecture decisions from this run (2026-04-05, pass 153)

- Decision: add a `policy_source_canonicalizer` service for jurisdiction/provider policy ingestion.
- Why: Racing NSW currently exposes conflicting "Current" RFIU condition vintages across two live URL surfaces; naive single-URL ingestion can promote stale rules.
- Decision: add a `policy_conflict_quarantine` state in entitlement/fee update workflows.
- Why: when two provider surfaces disagree on active standard conditions, updates must be held for adjudication rather than auto-applied.
- Decision: add a `source_surface_health` monitor with conflict and staleness scoring.
- Why: source-path drift is now a measurable operational risk that can directly alter fee/eligibility assumptions and post-cost EV.

## Provider comparison (incremental high-signal additions, pass 153)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Racing NSW `Race Fields Legislation` | Current policy surface with 2025-26 RFIU condition pointers and newer regulation references | Must still be cross-checked with other NSW surfaces to detect drift | A | Rank as primary NSW policy source but require conflict checks |
| Racing NSW `Race Field Information Use` | Alternate NSW policy surface with legacy 2017-18 "Current" markers still visible | Conflicting "Current" signposting can drive stale ingestion if used directly | A | Treat as secondary/legacy candidate and block autonomous promotion when conflicting |

## Data contract additions required (incremental, pass 153)

- `policy_source_surface_snapshot`:
- `capture_ts`, `provider`, `surface_url`, `surface_label`, `current_conditions_label_text`, `effective_date_text`, `regulation_reference_text`, `canonical_rank_score`, `version_conflict_flag`, `source_url`.
- `policy_conflict_event`:
- `event_ts`, `provider`, `jurisdiction`, `surface_a_url`, `surface_b_url`, `conflict_dimension(version|effective_date|regulation_ref)`, `severity`, `status(open|resolved|suppressed)`, `resolver_owner`.
- `entitlement_update_decision_log`:
- `event_ts`, `provider`, `candidate_version`, `decision(applied|quarantined|rejected)`, `decision_reason`, `evidence_urls_json`.

## Open questions to resolve before implementation freeze (incremental, pass 153)

- Which NSW URL surface should be treated as canonical when a direct PDF link is unavailable or temporarily broken?
- What conflict-severity threshold should force a hard execution block versus a soft fee-confidence haircut?
- Do we require manual sign-off for every `version_conflict_flag=true` event, or only for fee-bearing changes?
- How often should source-surface snapshots run to catch silent signposting edits without creating alert fatigue?

## Ranked implementation backlog (delta, pass 153)

### P0 additions

1. Implement `policy_source_canonicalizer` with provider-specific ranking rules and deterministic tie-breaks.
2. Add `policy_conflict_quarantine` in entitlement/fee promotion pipeline with hard fail-closed behavior on unresolved conflicts.
3. Persist `policy_source_surface_snapshot` daily for NSW and compute `version_conflict_flag` before any runtime-config update.
4. Add runtime guard: block fee/entitlement-dependent execution when policy source conflict is open and severity >= configured threshold.

### P1 additions

1. Build dashboards for `source_surface_conflict_count`, `mean_time_to_resolution`, and `quarantined_update_rate` by provider.
2. Add document-diff watchers for canonical and legacy surfaces to accelerate conflict triage.
3. Backtest fee/entitlement sensitivity using canonical-vs-legacy parameter branches to quantify expected-value drift risk.

## Sources for this update (pass 153)

- Racing NSW, `Race Fields Legislation` (2025-26 RFIU links and updated regulation references): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/
- Racing NSW, `Race Field Information Use` (legacy 2017-18 "Current" links on alternate NSW surface): https://www.racingnsw.com.au/race-field-information-use/

## Incremental architecture decisions from this run (2026-04-05, pass 154)

- Decision: add a `venue_pool_economics_contract` layer keyed by venue, wager type, and channel scope.
- Why: Keeneland now publishes pool-specific takeout values (including on-track vs off-track show split), so one blended takeout prior is not sufficient for EV normalization or cross-pool comparisons.
- Decision: add a `sectional_provider_scope_and_lag_contract` for non-exchange AU feeds.
- Why: Daily Sectionals declares selective meeting focus and typical T+48h publication timing, which creates deterministic freshness and coverage constraints for feature assembly.
- Decision: gate sectional features with a `provider_readiness` check before both backtest and live inference.
- Why: provider-declared lag and selective coverage can otherwise create hidden look-ahead leakage and non-random missingness.

## Provider comparison (incremental high-signal additions, pass 154)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Keeneland `Wagering Experience` | Venue-published CAW share plus pool-level takeout schedule and final-window odds-refresh contract | Single-venue U.S. context; useful for policy/economics heterogeneity benchmarking, not direct AU transfer | A | Add pool-level takeout and refresh-contract schema, and normalize CAW-effect studies by pool economics |
| Daily Sectionals (FAQ + Home) | AU sectional-provider scope, meeting-focus profile, publication-lag contract, and capture-method statement | Provider self-description; requires ongoing empirical verification against observed publication timestamps | A/B | Add provider scope/lag contracts and freshness gates before using sectionals in production features |

## Data contract additions required (incremental, pass 154)

- `venue_pool_takeout_snapshot`:
- `capture_ts`, `venue`, `wager_type`, `min_bet_amount`, `takeout_pct`, `channel_scope`, `bonus_program_flag`, `source_url`.
- `venue_odds_refresh_contract_snapshot`:
- `capture_ts`, `venue`, `final_window_seconds`, `refresh_interval_seconds`, `lock_event_definition`, `source_url`.
- `sectional_provider_scope_snapshot`:
- `capture_ts`, `provider`, `primary_meeting_focus`, `secondary_coverage_note`, `state_coverage_json`, `capture_method_text`, `source_url`.
- `sectional_provider_availability_contract_snapshot`:
- `capture_ts`, `provider`, `report_lag_hours_typical`, `meeting_class_scope`, `source_url`.
- `sectional_report_publication_event`:
- `event_ts`, `provider`, `meeting_id`, `last_race_ts`, `publish_ts`, `publish_lag_hours`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 154)

- Should `pool_specific_post_takeout_edge` be computed at bet-construction time only, or also stored as an immutable feature in training snapshots?
- For AU sectionals, what freshness SLA should hard-block feature use (`T+24h`, `T+48h`, or dynamic by provider/meeting class)?
- Do we require per-meeting empirical publication-lag monitoring before trusting provider-declared lag contracts in production gates?
- How should we handle meetings outside declared provider focus: hard feature-null, imputation, or separate fallback model family?

## Ranked implementation backlog (delta, pass 154)

### P0 additions

1. Implement `venue_pool_economics_contract` with versioned wager-type takeout + channel-scope fields.
2. Add `pool_specific_post_takeout_edge` transform in bet-pricing pipeline and backtest replay.
3. Implement `sectional_provider_scope_and_lag_contract` and hard freshness gating for sectional-dependent features.
4. Persist `sectional_report_publication_event` and compute observed-vs-declared lag compliance daily.

### P1 additions

1. Add calibration slices by wager-type takeout bands to test whether edge quality is economics-sensitive.
2. Build dashboards for sectional publication lag distribution by provider/meeting class.
3. Add non-random missingness diagnostics for out-of-scope meetings to prevent silent model drift.

### P2 additions

1. Generalize pool-economics contract ingestion across additional CAW-sensitive venues for transfer-learning controls.
2. Build adaptive freshness gates that tighten during high-volatility race windows.
3. Run ablations comparing models with/without sectional-provider readiness gating to quantify leakage reduction.

## Sources for this update (pass 154)

- Keeneland, `Wagering Experience` (pool-level takeout schedule, CAW mix, and final-window odds-refresh statement; accessed 2026-04-05): https://www.keeneland.com/wagering-experience
- Daily Sectionals, `FAQ` (meeting-focus and typical report-publication timing statements; accessed 2026-04-05): https://dailysectionals.com.au/faq/
- Daily Sectionals, `Home` (coverage scope and live-stream capture-method statement; accessed 2026-04-05): https://dailysectionals.com.au/

## Incremental architecture decisions from this run (2026-04-05, pass 155)

- Decision: add a `provider_contract_control_plane` for entitlement and usage-right enforcement (approval state, key tenancy, revocation/removal obligations).
- Why: RISE API terms require written approval, constrain key scope (one key per commercial service), and permit content-removal requests with a 30-day response expectation.
- Decision: add `provider_contract_drift_guardrails` distinct from transport-health monitoring.
- Why: RISE terms explicitly reserve non-backward-compatible changes and no service-availability guarantees, so schema/contract drift can break parity even when APIs remain reachable.
- Decision: implement `contractual_data_erasure_workflow` with auditable completion timestamps.
- Why: provider-requested content removal is an explicit contractual branch and should be treated as a compliance-critical lifecycle, not an ad-hoc ops task.

## Provider comparison (incremental high-signal additions, pass 155)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| RISE Racing API + RISE API key terms | AU harness-data API surface plus explicit onboarding/usage contract mechanics | Written approval gate, one-key-per-service tenancy, discretionary call limits, no guaranteed backwards compatibility/availability, and content-removal-on-request obligations | A/B | Add provider-contract control plane, key-scope enforcement, contract snapshotting, and deletion-audit workflow before relying on RISE-dependent features |

## Data contract additions required (incremental, pass 155)

- `provider_contract_snapshot`:
- `capture_ts`, `provider`, `product_surface`, `written_approval_required_flag`, `key_scope`, `end_customer_direct_keys_allowed_flag`, `publisher_compliance_access_required_flag`, `content_removal_on_request_flag`, `content_removal_sla_days`, `backward_compatibility_guaranteed_flag`, `service_availability_guarantee_flag`, `rate_limit_discretionary_flag`, `source_url`.
- `provider_access_state_event`:
- `event_ts`, `provider`, `approval_state(pending|approved|revoked)`, `api_key_scope`, `approval_reference`, `source_url`.
- `provider_content_removal_event`:
- `event_ts`, `provider`, `dataset_family`, `request_received_ts`, `removal_due_ts`, `removal_completed_ts`, `evidence_link`, `source_url`.
- `provider_contract_drift_event`:
- `event_ts`, `provider`, `contract_clause_changed`, `change_severity`, `deployment_block_applied_flag`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 155)

- Do we treat `approval_state != approved` as hard fail-closed for all RISE-derived features, or allow read-only research mode?
- What minimum evidence set confirms 30-day removal compliance (row counts, hash attestations, signed audit record)?
- How frequently should provider-contract snapshots run to detect clause drift without excessive noise?
- Where should one-key-per-service constraints be enforced in multi-tenant architecture (gateway, tenant config, or execution runtime)?

## Ranked implementation backlog (delta, pass 155)

### P0 additions

1. Implement `provider_contract_control_plane` with approval-state and key-scope gating.
2. Add `provider_contract_snapshot` + `provider_contract_drift_event` capture with deployment block hooks.
3. Build `contractual_data_erasure_workflow` and completion-evidence audit logging.
4. Add runtime guardrails that disable provider-dependent features when approval state is non-terminal or revoked.

### P1 additions

1. Build contract-drift alerting and dashboarding by provider/product surface.
2. Add replay-mode flags for historical runs affected by later removal requests.
3. Add model-ablation tests quantifying impact when RISE features are gated off.

### P2 additions

1. Generalize contract-control-plane primitives across all AU wholesalers/providers.
2. Add policy simulation tests for non-backward-compatible provider releases.
3. Automate periodic legal/terms-page diff snapshots with reviewer routing.

## Sources for this update (pass 155)

- RISE Racing, `RISE Racing API` (Australian harness API surface and gated docs/access workflow; accessed 2026-04-05): https://www.riseracing.com/products/rise-api/
- RISE Digital, `Request an API Key` (approval/key-scope/retention/removal/service-change terms; accessed 2026-04-05): https://www.rise-digital.com.au/products/rise-api/request-an-api-key/

## Incremental architecture decisions from this run (2026-04-05, pass 156)

- Decision: split AU sectional ingestion into a `product_phase_contract` with three explicit phases (`pre_meeting`, `race_morning_after_scratchings`, `post_meeting`).
- Why: Daily Sectionals product pages expose pre-meeting and race-morning release mechanics that differ from FAQ-level post-meeting `within 48 hours` framing.
- Decision: add a `sectional_scope_resolver` keyed by meeting class and state.
- Why: subscription contracts specify `Saturday metro only` packs with selectable state scope (`VIC/NSW/QLD/WA/SA`), so one provider-wide coverage assumption is invalid.
- Decision: add a `scratchings_sync_gate` before promoting race-morning sectional features.
- Why: final-edition availability is explicitly tied to being `after scratchings`, making scratchings-state lineage a contract dependency.

## Provider comparison (incremental high-signal additions, pass 156)

| Provider / source | What it gives us | Constraints / risk | Evidence quality | Build decision |
| --- | --- | --- | --- | --- |
| Daily Sectionals product + subscription pages | Product-level timing contracts (`Thu/Fri 24-48h`, race-morning pre-9:30 update, finals after scratchings) and explicit Saturday-metro state-pack scope (`VIC/NSW/QLD/WA/SA`) | E-commerce copy may change without API/version notices; requires recurring snapshot/diff monitoring | A/B | Implement phase-aware freshness gating + meeting-scope resolver; do not treat provider as single-latency/single-scope feed |

## Data contract additions required (incremental, pass 156)

- `sectional_product_contract_snapshot`:
- `capture_ts`, `provider`, `product_name`, `coverage_meeting_class`, `coverage_state_set_json`, `pre_meeting_release_window_text`, `race_morning_update_cutoff_local_time`, `after_scratchings_release_flag`, `delivery_channel`, `source_url`.
- `sectional_publication_event`:
- `event_ts`, `provider`, `product_name`, `meeting_id`, `publish_phase(pre_meeting|race_morning|post_meeting)`, `publish_local_ts`, `hours_to_first_race`, `after_scratchings_flag`, `source_url`.
- `sectional_scope_resolution_event`:
- `event_ts`, `provider`, `meeting_id`, `meeting_state`, `meeting_class`, `scope_match_flag`, `resolution_mode(in_scope|out_of_scope|unknown)`, `source_url`.
- `scratchings_sync_audit_event`:
- `event_ts`, `meeting_id`, `sectional_publish_ts`, `latest_scratchings_ts`, `minutes_since_last_scratching`, `sync_status(ok|stale|unknown)`, `source_url`.

## Open questions to resolve before implementation freeze (incremental, pass 156)

- For race-morning updates, what is the hard cutoff for usable features relative to jump time and feed/ops latency?
- Should out-of-scope meetings (`non-saturday` or non-selected states) hard-null sectional features or route to a separate fallback model family?
- How should conflicting provider statements be ranked when FAQ and product pages differ on availability windows?
- Do we require observed publication telemetry to validate the claimed pre-9:30 race-morning update cadence before promotion?

## Ranked implementation backlog (delta, pass 156)

### P0 additions

1. Implement `sectional_product_phase_contract` and enforce phase-aware feature freshness gates.
2. Build `sectional_scope_resolver` for `meeting_class x state` and block silent out-of-scope feature use.
3. Add `scratchings_sync_gate` with auditable timestamps for race-morning final-edition consumption.
4. Persist daily diffs for Daily Sectionals product/subscription pages and block deployment on material contract drift.

### P1 additions

1. Add dashboards for phase-level publication reliability (`pre_meeting`, `race_morning`, `post_meeting`).
2. Backtest CLV/calibration impact of phase-aware gating vs single-lag (`T+48h`) assumptions.
3. Run scope-mismatch diagnostics by state/class to quantify transfer leakage.

### P2 additions

1. Generalize `product_phase_contract` ingestion for other AU sectional vendors.
2. Add policy conflict-resolution logic that weights source type (`API docs` vs `FAQ` vs `product page`) and recency.
3. Build simulation tests for stale scratchings lineage during race-morning ingest windows.

## Sources for this update (pass 156)

- Daily Sectionals, `Race Speed Profile Early Edition` (Thursday/Friday 24-48h pre-meeting release statement; accessed 2026-04-05): https://dailysectionals.com.au/product/race-speed-profile-early-edition/
- Daily Sectionals, `Race Speed Profile Final Edition` (race-morning after-scratchings statement; accessed 2026-04-05): https://dailysectionals.com.au/product/race-speed-profile-final-edition/
- Daily Sectionals, `Subscription - Early Edition Reports 4 Weeks` (Saturday-metro state scope + race-morning pre-9:30 update statement; accessed 2026-04-05): https://dailysectionals.com.au/product/subscription-package-early-edition-reports-4-weeks/
- Daily Sectionals, `Subscription - Early Edition Reports 10 Weeks` (same scope/timing contract replication; accessed 2026-04-05): https://dailysectionals.com.au/product/subscription-package-early-edition-reports-10-weeks/
- Daily Sectionals, `Subscription - Early Edition Reports 20 Weeks` (same scope/timing contract replication; accessed 2026-04-05): https://dailysectionals.com.au/product/subscription-package-early-edition-reports-20-weeks/

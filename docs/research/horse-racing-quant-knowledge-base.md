# Horse Racing Quant Knowledge Base

Last updated: 2026-04-05

## Purpose

This file is the local research base for our racing algorithm build. It focuses on what the best-documented quant horse-betting operators and researchers actually did, which parts are well supported by primary evidence, and what design choices we should carry into an Australian Betfair plus form-data stack.

## Evidence quality

### Primary / highest-signal

- William Benter, *Computer Based Horse Race Handicapping and Wagering Systems: A Report* (1994).
- Ruth Bolton and Randall Chapman, *Searching for Positive Returns at the Track: A Multinomial Logit Model for Handicapping Horse Races* (1986).
- David Walsh interview with Andrew Leigh discussing his horse-racing work and market biases.

### Strong secondary

- Bloomberg Businessweek, Kit Chellel, *The Gambler Who Cracked the Horse-Racing Code* (2018).
- The Monthly, Tony Wilson, *Mr Huge* on Alan Woods (2005-2006).
- The Monthly, Chloe Hooper, *Gambler* on David Walsh and the Bank Roll (2013).
- Sydney Morning Herald, Kate McClymont, *Meet the Joker* on Zeljko Ranogajec (2018).
- WIRED, *The High Tech Trifecta* (2002).

### Modern market-structure context

- Thoroughbred Idea Foundation, *Sharks & Minnows* (2023).
- arXiv papers on the Bristol Betting Exchange and learned wager placement.

## What Benter actually contributed

### Core modeling ideas

- Build a private probability model for every runner, not a tip sheet.
- Use a multinomial logit framework so probabilities are coherent within a field and sum to one.
- Treat model development as factor engineering plus repeated out-of-sample testing, not one-shot fitting.
- Evaluate whether a factor helps prediction and whether that prediction survives conversion into betting profit.

### Feature groups Benter explicitly described

From Benter's 1994 paper, the useful feature families were:

- Current condition: recent performance, days since last start, workout information, age.
- Past performance: prior finishing positions, beaten margins, normalized times.
- Adjustments to past performance: competition strength, carried weight, jockey contribution, bad-luck compensation, post-position effects.
- Present-race situational factors: today’s carried weight, today’s jockey ability, today’s draw/post effect.
- Preference factors: distance suitability, surface suitability, wet/dry suitability, track-specific suitability.

### Important methodological details

- He emphasized that the hard part was not choosing a model class but building better factor specifications.
- He explicitly warned against overfitting and argued for conservative statistical testing on large samples.
- He noted that some features that sound intuitive do not survive testing; the example from the Bloomberg profile is temperature/weather research that added no value, while rest days did help.
- He found that public odds were already a strong forecast and that the best system blended his model with market probabilities rather than trying to replace them.

### Market-blending insight

- Benter’s second-stage idea was to combine private model probabilities and public implied probabilities in another logit-style calibration layer.
- This is the single most important bridge between classical handicapping and a true quant desk.
- Translation for our stack: never ship raw model probabilities directly into staking. Always recalibrate them against late exchange, tote, and fixed-odds prices.

### Staking and execution

- Benter used Kelly as the theoretical base but argued that full Kelly is too aggressive in practice.
- He recommended fractional Kelly because estimation error, bankroll withdrawals, and real-time edge decay all reduce the true advantage.
- He also stressed price impact: in pool markets and exchanges, your own bet worsens your price, so stake size must solve for diminishing edge, not just nominal EV.

### Exotic bets

- Benter explicitly argued against naive Harville assumptions for exacta/quinella/trifecta style pricing.
- He showed that simple Harville-style finish-order estimates are biased because lower-probability runners finish second and third more often than the basic formula predicts.
- Translation for us: if we model exotics later, we should use conditional finish-order models or simulation, not textbook Harville alone.

## What Woods actually contributed

### Operational structure

- Woods appears to have industrialized the process: a team of analysts, coders, and compilers reviewing every horse in every Hong Kong race.
- The Monthly reported that his group maintained both objective form variables and subjective trip notes.

### Feature and signal ideas from the Woods profile

- Objective factors included gender, track, distance, weight, and last-start result.
- Woods and Benter reportedly found number of starts more useful than age in Hong Kong.
- Field-size context mattered; a placing was interpreted differently in small and large fields.
- Barrier/draw effects were treated as dynamic, not static.

### Track-bias adaptation

- Woods noticed that his model stopped working for a period after a track re-cambering at Happy Valley changed the effect of inside barriers.
- His team adjusted barrier-related coefficients and restored performance.
- Translation for us: track geometry, rail moves, lane bias, and maintenance changes must be modeled as regime shifts, not constants.

### Subjective/video factors

- Woods’s team reportedly coded race-video observations such as bad rides, signs of not trying, pace pressure, premature speed, and late speed.
- This is one of the clearest public examples of a hybrid system: human trip analysis converted into structured variables.
- Translation for us: if we can’t watch every race manually, we should at least preserve steward comments, trip notes, settle position, pace pressure, and sectional finish signatures as machine-readable inputs.

### Pricing philosophy

- Woods focused on overlays after takeout, not merely on “best horse”.
- In the Hong Kong pools, the rake was high enough that small overlays were not enough.
- The Monthly describes his “Win Expectation” workflow as private win probability multiplied by current odds, then bet only when the value clears the rake and risk threshold.

## What Walsh and Ranogajec contributed

### Walsh on model reality

- David Walsh said it took years before his model was more accurate than the public.
- That is a useful corrective: if we are not beating the public forecast on calibration, we are not ready to stake aggressively.

### Walsh on behavioral bias

- Walsh highlighted the longshot bias and also a specifically Australian bias around horse weight, driven by punter folklore.
- He described a setup where the crowd can be directionally right about a factor but still overprice it.
- Translation for us: we should test not only whether a feature predicts performance, but whether the market systematically overreacts or underreacts to it.

### Bank Roll structure

- The Monthly and the Sydney Morning Herald both describe the Bank Roll as a staffed operation using mathematicians, analysts, computer scientists, and racing observers.
- That matters because the edge was not a single genius formula; it was a production system combining data collection, modeling, pool scanning, and execution.

### Ranogajec’s edge mix

- The strongest documented Ranogajec edge was not pure forecasting. It was the combination of:
- High-liquidity pools.
- Massive turnover.
- Sophisticated algorithms.
- Late execution.
- Operator rebates and kickbacks.

- The Sydney Morning Herald reported industry estimates of Tabcorp rebates in the 8% to 10% range for his syndicate and described the arithmetic directly: a small betting loss can still become a net profit once the rebate is included.
- Translation for us: rebate economics must be modeled explicitly. A tote or exchange strategy that is negative before rebates can still be profitable after rebates, and a marginal positive strategy can become excellent with them.

### Jackpot and pool-threshold behavior

- The same reporting says the Bank Roll attacks pools and jackpots once they cross mathematically attractive thresholds.
- Translation for us: pool size and jackpot carryover are features, not just context.

## Shared playbook across Benter, Woods, Walsh, and Ranogajec

- Build probabilities, not narratives.
- Use as much structured historical data as possible.
- Encode both objective form and subjective race-trip information.
- Let the market teach you what your database is missing.
- Bet late, when information is richest.
- Care about pool depth and your own price impact.
- Use bankroll discipline and fractional Kelly.
- Prefer markets with high liquidity and stable data.
- Look for operator economics such as rebates and jackpot overlays.
- Treat the system as an evolving research pipeline, not a fixed formula.

## Data points we should capture for our own algo

### Runner history

- Finishing positions.
- Margins and beaten lengths.
- Adjusted speed ratings.
- Adjusted sectionals and finishing splits.
- Days since last start.
- First-up and second-up flags.
- Class transitions.
- Distance changes.
- Surface and going preference.
- Barrier history.
- Carry weight and weight change.
- Jockey and trainer history.
- Apprentice claims.
- Stable switch and trainer change.

### Race context

- Venue.
- Track layout.
- Rail position.
- Track condition.
- Weather.
- Wind.
- Field size.
- Scratchings.
- Pace map.
- Expected settle position.
- Race class and restrictions.

### Video and intent layer

- Trouble in running.
- Bad ride / poor tactical fit.
- Pace pressure faced.
- Premature speed.
- Late speed.
- Not fully tested / held up / blocked.
- Market support or drift that is unexplained by public form.
- Trial and jump-out notes.
- Parade or fitness proxies where available.

### Market layer

- Betfair back and lay ladder snapshots.
- Betfair traded volume by runner over time.
- Fixed-odds snapshots by bookmaker over time.
- Tote win/place/exotic probable dividends over time.
- Late price drift.
- Exchange-vs-tote divergence.
- Market share / liquidity / projected slippage.
- Overround, takeout, commission, rebate, and promo economics.

### Portfolio and execution layer

- CLV versus final exchange and final tote.
- Stake as percent of bankroll.
- Stake as percent of market volume.
- Realized slippage.
- Exposure by race, venue, class, signal family, and bet type.
- Drawdown and time-to-recovery.

## Model design implications for our build

### Win model

- Start with a calibrated field model that outputs coherent win probabilities.
- Good first choices: multinomial logit baseline, gradient boosting ranker with softmax calibration, or a Bayesian hierarchical runner model feeding a race-level softmax.

### Market calibration layer

- Use late exchange and tote-implied probabilities as a prior.
- Fit a meta-model that learns when to trust the private model and when to defer to the market.
- Include uncertainty penalties when the private model and market disagree sharply.

### Exotics

- Build only after the win model is calibrated.
- Use conditional finish-order simulation and not naive Harville.
- Let second and third place randomness expand as Benter suggested.

### Execution engine

- Bet late.
- Compute expected value after commission, overround, takeout, and rebate.
- Solve stake size with fractional Kelly and exposure caps.
- Avoid pushing prices through our own size.

### Continuous improvement

- Promote new features only if they improve out-of-sample calibration and profit after realistic execution costs.
- Run regime checks for rail changes, track maintenance, surface changes, and seasonal effects.
- Store failed ideas too. Benter’s weather/temperature dead-end is a reminder that discarded factors are part of the edge.

## What not to copy blindly

- Do not assume Hong Kong findings transfer directly to Australian metro and provincial racing.
- Do not assume tote-only logic carries over unchanged to exchange-first execution.
- Do not use full Kelly.
- Do not rely on qualitative “tips” without encoding them as structured data.
- Do not treat track bias as stationary.
- Do not model exotics with raw Harville probabilities and call it done.
- Do not judge model quality only by hit rate.

## Concrete backlog for our Australian system

1. Build a 5- to 10-year warehouse of Australian metro and provincial races with timestamped price snapshots.
2. Create a private runner-rating layer with speed, pace, class, fitness, and stable-intent signals.
3. Build a race-level probability model and calibrate it against late Betfair and tote markets.
4. Add trip-note and bad-luck factors from video/stewards/comments as structured variables.
5. Add track-bias regime detection keyed to rail moves, maintenance, weather, and lane effects.
6. Model operator economics: Betfair commission, tote takeout, bookmaker overround, and any rebates.
7. Track CLV, drawdown, slippage, and feature decay by venue and class.
8. Only after win calibration is strong, add place and selected exotics with conditional order simulation.

## Open research gaps

- I did not find a high-quality primary technical source for Tony Bloom’s horse-racing models, so he is not part of the core design here.
- Ranogajec’s operation is well reported at a business level but far less transparent technically than Benter’s.
- Woods’s public technical detail is sparse and comes mostly through reportage rather than papers.

## New sourced findings added in this run (2026-03-28)

### CAW policy is now an explicit venue-level regime variable

- [A] NYRA announced new safeguards on 2026-01-30: CAW teams are now prevented from betting into all pools at the one-minute-to-post mark, with a stricter two-minute cutoff in the win pool (the win-pool limit has been in place since 2021). NYRA also defines CAW teams operationally as entities placing more than six bets per second.
- Why this matters: late-odds dynamics are not stationary across jurisdictions. A US tote venue with explicit CAW cutoff times should not be used as a direct latency analogue for Australian pools.

Extracted data fields to add:
- `track_policy.caw_definition_bets_per_second`
- `track_policy.caw_cutoff_sec_to_post.{win,place,show,exotics}`
- `track_policy.effective_date`
- `market_snapshot.sec_to_post`
- `market_snapshot.last_60s_odds_jump`

Model ideas:
- Add a piecewise hazard model for late-price movement with knots at policy cutoffs (e.g., 120s and 60s to post).
- Train venue-policy interaction terms so CLV expectations are conditional on whether CAW access is still open.

Execution lessons:
- Keep a policy calendar and replay historical backtests using policy-valid cutoff rules.
- For cross-venue transfer learning, downweight late-tote signals from venues with incompatible CAW gating.

Contradiction noted:
- Earlier narrative: CAW activity is always "last-second unlimited". New NYRA policy evidence shows explicit, recent restrictions.

### Betfair microstructure constraints are hard system limits, not soft guidance

- [A] Betfair docs specify `listMarketBook` call cadence up to 5 calls/second per `marketId`.
- [A] Betfair docs also set request-weight limits (sum of weighted projections across markets per call), with a 200-point ceiling and materially different weights by projection mix.
- [A] MarketBook includes `betDelay` (seconds order is held, usually in-play), `isMarketDataDelayed`, and `crossMatching` flags.
- [A] Betfair type definitions state market IDs prefixed `2.` are Australia Exchange markets (`1.` for UK).
- [B] Betfair Data Scientists documentation notes stream/API outputs differ when virtual prices are included (e.g., `EX_BEST_OFFERS_DISP`); this affects reproducibility if historical data and live trading use different virtualisation settings.

Extracted data fields to add:
- `betfair_market.market_id_prefix`
- `betfair_market.is_market_data_delayed`
- `betfair_market.bet_delay_sec`
- `betfair_market.cross_matching_enabled`
- `collector.request_weight_points`
- `collector.stream_virtualise_mode`
- `collector.call_rate_per_market_hz`

Model ideas:
- Explicitly model fill probability as a function of `bet_delay_sec`, queue depth, and time-to-jump.
- Build a dual-view feature set: "displayed" (virtualised) vs "raw ladder" to avoid training/serving skew.

Execution lessons:
- Prefer stream-first ingestion and cap REST polling to policy limits.
- Fail closed if app key/funding state triggers delayed market data.

Contradiction noted:
- Common shortcut: "Betfair is continuous and instant pre-off." Official fields and limits show deterministic delay and data-regime flags that must be handled in execution logic.

### Australian race-field rights are fragmented and operationally binding

- [A] Racing Australia FreeFields pages expose fields/form/results/scratchings/stewards links and include explicit copyright notices for both state principal racing authorities and Racing Australia.
- [A] Racing NSW Race Fields Policy (effective 2024-07-01) states use/publication/supply for wagering without approval is an offence; Standard Conditions of Approval are versioned and updated (effective 2025-03-01 in the current document set).
- [A] Racing Victoria Race Fields policy documents are explicitly versioned (effective 2024-07-01, with 2025-07-01 guidance updates), confirming license terms are not static.
- [B] ACCC records around race information arrangements identify approved supplier pathways (Racing Australia, AAP, Live Datacast) for certain publication rights contexts; this is older but still useful for historical structure.
- [B] Punting Form product pages now provide concrete commercial constraints/capabilities (API sectional access, point-in-time data options, AU/HK/SG coverage, personal-use limits for Modeller tier).

Extracted data fields to add:
- `source_contract.provider`
- `source_contract.allowed_use`
- `source_contract.redistribution_allowed`
- `source_contract.effective_from`
- `source_contract.effective_to`
- `source_contract.jurisdiction`
- `feature_lineage.source_provider`

Model ideas:
- Add a "license-safe feature manifest" that blocks training/deployment when a feature depends on data outside approved use.
- Keep per-provider fallback features so the model still runs under degraded licensing scenarios.

Execution lessons:
- Treat legal entitlements as first-class runtime config, not documentation.
- Snapshot policy versions alongside model versions for auditability.

Contradiction noted:
- Prior simplification: "Australian racing data is a single feed problem." New evidence shows state-level policy variance plus provider-tier usage constraints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec)

- [A] No new primary technical papers/interviews were found this run that materially change Benter’s documented modeling framework.
- [B] No new primary-technical disclosures were found for Woods, Walsh, or Ranogajec; confidence remains highest on organizational/process traits and lowest on exact feature engineering internals.
- Practical implication: keep their sections as process inspiration, but keep implementation decisions anchored to primary technical sources and observable market data.

## Incremental sourced findings added in this run (2026-03-28, pass 2)

### Benter primary details: second-stage blend math and sample-size pragmatics are implementation-critical

- [A] In Benter (1994), the second-stage model is explicitly a logit over `log(p_model)` and `log(p_public)`, fit on out-of-sample model probabilities to avoid overstating model significance.
- [A] The paper reports a concrete improvement metric (`ff` gain over public) and example values (`ff_public=0.1218`, `ff_combined=0.1396`, delta `0.0178`) and links higher delta to higher simulated profitability.
- [A] Benter also gives operational data guidance that is often omitted in summaries: roughly 500-1000 races as a minimum development/testing range, and strong preference for closed horse populations due to transfer/normalization issues across jurisdictions.

Extracted data fields to add:
- `model_blend.log_p_model`
- `model_blend.log_p_public`
- `model_blend.alpha`
- `model_blend.beta`
- `model_blend.ff_public`
- `model_blend.ff_combined`
- `model_blend.ff_delta`
- `dataset.jurisdiction_closed_population_flag`

Model ideas:
- Treat alpha/beta blend coefficients as time-varying and re-estimate by venue regime and season.
- Use `ff_delta` as a promotion gate alongside CLV and calibration for challenger models.

Execution lessons:
- Enforce strictly out-of-sample generation for blend training sets.
- Avoid cross-jurisdiction pooling unless normalization quality is demonstrated; default to jurisdiction-specific models.

Contradiction noted:
- Simplified retelling: "Benter just blended model plus market." Primary text shows a specific second-stage estimation protocol with explicit fit metric and data-regime caveats.

### Betfair stream and heartbeat semantics add mandatory reliability controls

- [A] Betfair Stream API requires sending a message within 15 seconds of connection or a `TIMEOUT` error can occur.
- [A] Stream error semantics include `SUBSCRIPTION_LIMIT_EXCEEDED` (default cap 200 markets), `TOO_MANY_REQUESTS`, and `INVALID_CLOCK` for bad `initialClk/clk` on re-subscription.
- [A] Heartbeat API supports automatic unmatched-bet cancellation on connectivity loss but explicitly states no guarantee that all bets are cancelled; `preferredTimeoutSeconds` is bounded (min 10, max 300) and returns `actualTimeoutSeconds`.

Extracted data fields to add:
- `stream_session.first_message_sent_within_15s`
- `stream_session.subscription_market_count`
- `stream_session.status_error_code`
- `stream_session.initial_clk`
- `stream_session.clk`
- `heartbeat.preferred_timeout_sec`
- `heartbeat.actual_timeout_sec`
- `heartbeat.action_performed`

Model ideas:
- Add execution reliability features (stream reconnect count, clock invalidations, heartbeat actions) into slippage and fill-quality models.
- Build a session-quality score to downweight training samples from degraded ingestion windows.

Execution lessons:
- Fail-safe design must include heartbeat plus independent order-reconciliation logic because cancellation is best-effort, not guaranteed.
- Persist stream clock state and treat clock mismatch as a hard incident, not a warning.

Contradiction noted:
- Common assumption: "Heartbeat guarantees flat unmatched exposure on disconnect." Official docs explicitly say cancellation may be incomplete.

### Racing Victoria reporting requirements imply a richer compliance+microstructure dataset than most stacks collect

- [A] RV's 2025-26 Guide to Provision of Information requires daily wagering files by 9am next day (by Result Date) and monthly adjustment files within 5 days after payment period end, delivered via FTP/CSV naming conventions.
- [A] The required schema includes race/venue-day level fields across fixed odds and pari-mutuel/tote-derivative categories, plus unique-client counts and turnover by channel.
- [A] RV also publishes current approved WSP lists (including exchanges and international operators), reinforcing that policy/entitlement context is dynamic and operator-specific, not static metadata.

Extracted data fields to add:
- `reg_reporting.result_date`
- `reg_reporting.event_date`
- `reg_reporting.file_submission_ts`
- `reg_reporting.file_type_daily_or_monthly`
- `reg_reporting.adjustment_flag`
- `turnover.by_channel.{mobile,internet,contact,retail,licensed,oncourse}`
- `customer_counts.{by_race,by_meeting,ytd,new_clients}`
- `counterparty.approved_wsp_flag`

Model ideas:
- Use channel-share mix and client-count trajectories as weak signals for market composition shifts.
- Build a compliance-replay layer that reconstructs fee/reporting view from internal trading data for reconciliation audits.

Execution lessons:
- Design storage to preserve both Event Date and Result Date dimensions; these are not interchangeable in reporting/audit workflows.
- Add data-quality SLOs tied to regulatory file completeness and timeliness, not only prediction metrics.

Contradiction noted:
- Typical quant shortcut: "Only price ladder + fills matter." Regulatory reporting schemas reveal additional structure (channel/client dimensions) useful for diagnostics and regime detection.

## Source notes

- Benter 1994 paper: https://gwern.net/doc/statistics/decision/1994-benter.pdf
- Bolton and Chapman 1986 paper: https://gwern.net/doc/statistics/decision/1986-bolton.pdf
- Bloomberg Businessweek on Benter, published 2018-05-03: https://www.bloomberg.com/news/features/2018-05-03/the-gambler-who-cracked-the-horse-racing-code
- Mirror PDF of the Bloomberg article used for extractable text: https://ryansbrill.com/pdf/statistics_in_sports_papers/Horse_Race_Betting_article.pdf
- The Monthly on Alan Woods: https://www.themonthly.com.au/december-2005-january-2006/essays/mr-huge
- The Monthly on David Walsh: https://www.themonthly.com.au/february-2013/essays/gambler
- David Walsh interview with Andrew Leigh: https://www.andrewleigh.com/david_walsh_tgl
- WIRED on Hong Kong computer teams: https://www.wired.com/2002/03/betting/
- Sydney Morning Herald PDF on Zeljko Ranogajec, published 2018-05-17: https://varenne.art/usr/documents/press/download_url/359/the-joker-meet-zeljko-ranogajec-the-australian-who-is-the-biggest-gambler-in-the-world.pdf
- Thoroughbred Idea Foundation, *Sharks & Minnows*: https://racingthinktank.com/blog/sharks-and-minnows-managing-growing-imbalance-racing-wagering-markets
- Bristol Betting Exchange paper: https://arxiv.org/abs/2105.08310
- BBE implementation paper: https://arxiv.org/abs/2108.02419
- XGBoost wager-placement paper: https://arxiv.org/abs/2401.06086
- NYRA CAW safeguards (2026-01-30): https://www.nyra.com/aqueduct/news/nyra-announces-new-safeguards-concerning-computer-assisted-wagering
- Betfair `listMarketBook` operation: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook
- Betfair market data request limits: https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687450/Market+Data+Request+Limits
- Betfair betting type definitions (`betDelay`, `crossMatching`, market id prefix): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting+Type+Definitions
- Betfair virtual bets/cross-matching context: https://betfair-datascientists.github.io/wagering/analysingAndPredictingBSP/
- HKJC FY2024/25 commingling update (2025-08-29): https://corporate.hkjc.com/corporate/corporate-news/english/2025-08/news_2025082901950.aspx
- Racing Australia FreeFields (example state calendar/copyright notice): https://www.racingaustralia.horse/FreeFields/Calendar.aspx?State=ACT
- Racing NSW Race Fields Policy (effective 2024-07-01): https://www.racingnsw.com.au/wp-content/uploads/2024/06/Racing-NSW-Race-Fields-Policy-Effective-1-July-2024.pdf
- Racing NSW Standard Conditions (effective 2025-03-01): https://www.racingnsw.com.au/wp-content/uploads/2025/02/Race-Field-Information-Standard-Conditions-of-Approval-1-March-2025.pdf
- Racing NSW race fields (Australian wagering operators information): https://www.racingnsw.com.au/wp-content/uploads/Race-Field-Information-Use-Information-for-Australian-Wagering-Operators.pdf
- Racing Victoria Race Fields policy index and updates: https://www.racingvictoria.com.au/integrity/rule-changes-and-policies/policies/race-fields-policy
- Racing Victoria Race Fields policy page (policy links + approvals): https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria approved wagering service providers: https://www.racingvictoria.com.au/wagering/wagering-service-providers
- Racing Victoria guide to provision of information 2025-26: https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf?v=09a420bf
- ACCC race information determination context: https://www.accc.gov.au/public-registers/authorisations-and-notifications-registers/authorisations-register/tab-limited-notification-n99975
- Punting Form Modeller capabilities and constraints: https://www.puntingform.com.au/products/modeller
- Betfair Exchange Stream API (updated 2026-02-20): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange+Stream+API
- Betfair Heartbeat API (updated 2024-06-27): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687861/Heartbeat+API

## Incremental sourced findings added in this run (2026-03-28, pass 3)

### Betfair order microstructure has additional hard constraints for queue and idempotency control

- [A] Betfair `placeOrders` supports optional `marketVersion`; if the current market version is higher than submitted, the order is lapsed. This is effectively an optimistic-concurrency control on order placement.
- [A] Betfair `placeOrders` supports `customerRef` de-duplication with a 60-second window; this should be treated as a mandatory idempotency key in retry paths.
- [A] Betfair docs note that when `async=true`, the placement report may return `PENDING` with no `betId` (execution completion arrives later via stream/polling), requiring asynchronous state reconciliation.
- [A] Betfair Additional Information defines odds-ladder increments (`CLASSIC`, `FINEST`, `LINE_RANGE`) and states invalid increments produce `INVALID_ODDS`; tick-size normalization is therefore a pre-trade validation requirement, not a UI concern.
- [A] Betfair Exchange rules state equal-price matching is first-come-first-served and that cross-matching can generate small extra operator revenue because matching must respect valid odds increments.

Extracted data fields to add:
- `order_submission.market_version_sent`
- `order_submission.market_version_current`
- `order_submission.customer_ref`
- `order_submission.customer_ref_dedupe_window_sec`
- `order_submission.async_flag`
- `order_submission.placement_status_initial`
- `order_submission.bet_id_initially_present`
- `market_microstructure.price_ladder_type`
- `market_microstructure.tick_size_at_price`
- `queue.position_estimate`

Model ideas:
- Add a queue-survival feature conditioned on `price_ladder_type`, local depth, and arrival sequence to improve fill-probability forecasts.
- Add an execution-failure classifier using stale `market_version` and async reconciliation lag as predictors of slippage and miss risk.

Execution lessons:
- Enforce pre-trade odds normalization and reject non-ladder prices client-side before API submission.
- Use `customerRef` on every place/replace/cancel request and treat retries without idempotency keys as a production incident class.
- Treat `PENDING` placement states as non-final and reconcile from stream state before updating risk/exposure.

Contradiction noted:
- Common simplification: "Betfair order submission is synchronous and immediate." Official docs show explicit async and version-lapse pathways that can invalidate naive synchronous execution assumptions.

### Australian provider and policy evidence now includes explicit timeliness and fee-schedule signals

- [A] Racing Australia's annual service standard report for the 12 months ending June 2025 reports concrete timeliness/availability metrics (e.g., nominations release timing performance, and 99.90% targets with 100.00% actual uptime for core national systems in that period).
- [A] Racing Australia race fields/materials pages state most race results are provided within about 40 minutes of a race, with the majority within about 20 minutes; this is a useful baseline for non-exchange result-feed staleness assumptions.
- [A] Racing NSW has a newer Standard Conditions instrument effective 2025-07-01 (superseding the 2025-03-01 version previously captured), with explicit fee and category structure updates.
- [A] Racing NSW 2025-07-01 standard conditions include schedule-level fee definitions (including standard, premium, and turnover-threshold categories) and minimum monthly fee mechanics; these should be modeled directly in unit economics.
- [A] Racing NSW publishes an "approved licensed wagering operators" register and states it is updated regularly, which supports periodic entitlement-drift snapshots.

Extracted data fields to add:
- `provider_sla.metric_name`
- `provider_sla.target_value`
- `provider_sla.actual_value`
- `provider_sla.measurement_period`
- `results_feed.expected_publish_window_min`
- `results_feed.actual_publish_latency_min`
- `race_fields_policy.version_effective_date`
- `race_fields_fee.operator_category`
- `race_fields_fee.rate_percent`
- `race_fields_fee.minimum_monthly_aud`
- `counterparty.approval_registry_snapshot_ts`

Model ideas:
- Add a data-freshness reliability feature for each provider (target vs actual timeliness variance) and downweight labels generated in stale windows.
- Add fee-regime-aware expected-value adjustments so predicted alpha is converted to post-fee edge by jurisdiction and operator category.

Execution lessons:
- Keep fee/version metadata keyed by effective date and replay backtests under the historically correct schedule.
- Add daily/weekly entitlement registry snapshots and hard-fail execution if operator approval status cannot be verified.

Contradiction noted:
- Previous open question: whether NSW had a newer public wagering-operator guide than older material. New primary documentation shows current instruments are actively versioned into 2025-07-01.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical disclosures were found this run that materially extend Benter's published modeling internals beyond the 1994 paper.
- [B] No new primary technical disclosures were found this run for Woods, Walsh, or Ranogajec; implementation details remain mostly inferential from profiles/interviews rather than formal technical publication.
- [A] New primary CAW-related policy evidence remains strongest via venue/operator rule sets (e.g., NYRA and exchange/tote platform rules), not via syndicate self-disclosure.

## Source notes (incremental additions for pass 3)

- Betfair `placeOrders` operation (marketVersion/customerRef/async semantics): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Additional Information (price ladders, currency parameters, common errors): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Betfair Exchange general rules (best price execution, cross-matching, price-time queue order): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Racing Australia materials and race results timeliness guidance: https://www.racingaustralia.horse/industry/Materials/
- Racing Australia annual service standard performance report (12 months ending June 2025): https://www.racingaustralia.horse/FreeServices/Reports/Consolidated-Report-2024-2025.pdf
- Racing NSW Standard Conditions of Approval (effective 2025-07-01): https://www.racingnsw.com.au/wp-content/uploads/2025/06/Race-Field-Information-Standard-Conditions-of-Approval-1-July-2025.pdf
- Racing NSW approved licensed wagering operators register: https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/

## Incremental sourced findings added in this run (2026-03-28, pass 4)

### Betfair order/audit plumbing has additional failure and retention constraints

- [A] Betfair `replaceOrders` is logically cancel-then-place; the cancel leg is completed first, and if new placement fails the cancellations are not rolled back. This creates a deterministic exposure gap risk if replace is treated as atomic state mutation in internal ledgers.
- [A] `replaceOrders` also caps replace instructions at 60/request and allows async mode, but async replace is not available for MOC/LOC bets.
- [A] `listCurrentOrders` defaults to returning up to 1000 bets; pagination requires `fromRecord`/`recordCount`. Bet and market filters are capped at 250 ids combined.
- [A] Betfair best-practice guidance for match tracking is explicit: use `orderBy=BY_MATCH_TIME` with `orderProjection=ALL` and `dateRange` to capture newly matched bets efficiently.
- [A] `listClearedOrders` defaults to last-90-day settled history, with the same 1000-row page-size cap, which implies exchange-side settlement history is not a long-horizon source of truth by itself.

Extracted data fields to add:
- `order_replace.replace_instruction_count`
- `order_replace.cancel_leg_completed_ts`
- `order_replace.place_leg_status`
- `order_replace.cancel_not_rolled_back_flag`
- `order_query.from_record`
- `order_query.record_count`
- `order_query.order_by`
- `order_query.date_range_from`
- `order_query.date_range_to`
- `order_archive.source_window_days`

Model ideas:
- Add a replacement-friction feature (`replace_to_final_match_latency_ms`, `replace_partial_failure_flag`) for fill/slippage modeling.
- Build an order-event completeness score that penalizes windows where API paging or retention limits imply missing order history.

Execution lessons:
- Treat `replaceOrders` as a two-phase operation in risk accounting; never assume rollback of the cancel leg.
- Add mandatory internal archival of order/settlement events beyond 90 days for backtest and compliance reproducibility.
- Standardize polling cursors (`fromRecord`) and deterministic replay checkpoints for order-ledger reconciliation.

Contradiction noted:
- Common assumption: "replace is atomic amend." Betfair docs define a cancel-first workflow where failed place does not restore the prior unmatched position.

### Australian provider/policy delta: Tasmania race-fields terms expose explicit fee algebra and reporting cadence

- [A] Tasracing race-fields Standard Conditions (commencing 2019-10-01) are still published as active conditions under the current Race Fields Information page, with definitions tied to the Racing Regulation and Integrity Act 2024 (Tas).
- [A] Fee mechanics are explicit and formulaic by wagering type: examples include 2.0% of net turnover for totalizator, 1.0% for betting-exchange turnover, and threshold behavior where nil applies if aggregate net turnover for the payment period is <= A$83,333.
- [A] Conditions include additional Jan-Feb thoroughbred uplifts (extra 0.5% of turnover in totalizator paths, and extra 5% of net revenue in the non-totalizator/non-exchange path), which are materially important for seasonal EV and routing decisions.
- [A] Operational reporting/payment obligations are explicit: Race Field Fee Return within 5 business days after each payment period and payment due within 12 days.
- [A] Tasracing domestic application form (FY25) directly binds applicants to clause-3 fee terms and integrity conditions, and captures wagering-mode declarations (including explicit betting-exchange Yes/No fields).

Extracted data fields to add:
- `race_fields_fee_formula.jurisdiction`
- `race_fields_fee_formula.bet_type`
- `race_fields_fee_formula.turnover_rate`
- `race_fields_fee_formula.net_revenue_rate`
- `race_fields_fee_formula.turnover_threshold_aud`
- `race_fields_fee_formula.seasonal_uplift_window`
- `race_fields_reporting.return_due_business_days`
- `race_fields_reporting.payment_due_days`
- `application.wagering_mode_exchange_flag`

Model ideas:
- Add a jurisdiction-season fee transform that maps predicted gross edge to post-fee edge using date-aware formula branches.
- Add route-selection logic that de-prioritizes strategies exposed to high seasonal uplifts unless modeled edge remains positive post-fee.

Execution lessons:
- Fee engines must support piecewise formulas and seasonal add-ons rather than single headline percentages.
- Compliance jobs need business-day-aware due-date calculators per jurisdiction, not one global filing schedule.

Contradiction noted:
- Prior simplification: "AU race-fields costs are mostly flat percentages." Tasracing demonstrates thresholded, bet-type-specific, and seasonally uplifted fee logic.

### Provider capability delta: Podium’s API docs expose event-history and race-status timing artifacts useful for PIT reconstruction

- [A] Podium’s onboarding documentation describes explicit `.../history` endpoints (stage/event/entrant/participant) that retain every update to entities, enabling point-in-time reconstruction of status and odds evolution.
- [A] The same doc provides concrete response-size guidance (example stage history ~165k JSON lines / ~400KB), signaling ingestion/storage pressure for full-diff archival.
- [A] Event payloads include timestamps for status transitions (including off time and weighed-in time), and raceday betting updates are described as typically appearing about 15 minutes pre-off.

Extracted data fields to add:
- `provider_event_history.entity_type`
- `provider_event_history.entity_uuid`
- `provider_event_history.update_ts`
- `provider_event_history.payload_size_bytes`
- `race_status.off_ts`
- `race_status.weighed_in_ts`
- `provider_market.first_show_lead_time_sec`

Model ideas:
- Use status-transition timestamps to build robust `sec_to_off_actual` labels for latency and submit-timing models.
- Use full history diffs to train drift detectors on late non-runner/status amendments.

Execution lessons:
- For providers offering revision streams/history endpoints, raw-diff retention should be first-class rather than periodic snapshots only.
- Backfill/storage budgets must be planned around worst-case history payloads, not median request sizes.

Contradiction noted:
- Typical shortcut: "results providers are static pre/post snapshots." Podium docs indicate full update-history pathways suitable for market-state replay.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented model internals beyond the 1994 paper already captured.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals; confidence remains process-level rather than model-equation-level.
- [A] CAW policy evidence remains strongest through operator/venue rule documents and implementation notices rather than syndicate self-disclosure.

## Source notes (incremental additions for pass 4)

- Betfair `replaceOrders` (cancel-then-place semantics, limits, async caveat): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687487/replaceOrders
- Betfair `listCurrentOrders` (paging caps, best-practice match tracking): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687504/listCurrentOrders
- Betfair `listClearedOrders` (default 90-day window, paging): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687749/listClearedOrders
- Betfair Betting Type Definitions (updated 2025-12-11; AUS/NZ raceType mapping and delay-model filters): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Podium Racing API onboarding (history endpoints, status timestamps, pre-off update timing): https://podiumsports.com/resource/podium-racing-api-onboarding-documentation/
- Tasracing Race Fields Information index: https://tasracing.com.au/documents/race-fields-information
- Tasracing Standard Conditions of Approval (commencing 2019-10-01): https://tasracing.com.au/hubfs/Corporate%20Documents/Standard%20Conditions%20of%20Approval%20October%202019.pdf
- Tasracing Application to Publish - Domestic (FY25): https://tasracing.com.au/hubfs/Corporate%20Documents/Application%20to%20Publish%20-%20Domestic.pdf

## Incremental sourced findings added in this run (2026-03-29, pass 5)

### Betfair execution and backtest plumbing has additional non-obvious constraints

- [A] Betfair documents a hard account-level transaction ceiling of 1000 "instructions" per second and states `TOO_MANY_REQUESTS` can be triggered by aggregate traffic across all apps/processes on the same account, not just one strategy process.
- [A] Betfair Exchange Stream guidance states delayed application keys are conflated to updates every 3 minutes, which is incompatible with sub-minute pre-off execution research unless a live key is used.
- [A] Betfair historical-data docs state basic package coverage starts from April 2015, while Australian and New Zealand racing data availability starts from October 2016.
- [A] Betfair historical-data FAQ says files are generally published 5 days after event settlement and only after all markets in that event have settled.
- [A] Betfair historical-data API guidance includes explicit request throttling (100 requests per 10 seconds) and endpoint-level operations (`GetMyData`, `GetCollectionOptions`, `DownloadListOfFiles`) that should be wrapped with backoff and cursoring.

Extracted data fields to add:
- `betfair_account_limit.instructions_per_second_limit`
- `betfair_account_limit.account_scope_shared_flag`
- `betfair_rate_limit.error_code`
- `stream_entitlement.app_key_type`
- `stream_entitlement.update_conflation_sec`
- `historical_data.coverage_start_date_global`
- `historical_data.coverage_start_date_au_nz`
- `historical_data.publish_lag_days`
- `historical_data.api_rate_limit_requests`
- `historical_data.api_rate_limit_window_sec`
- `historical_data.request_operation`

Model ideas:
- Add a collector-contention feature that downweights late-window signals when account-level instruction budget saturation is observed.
- Add a history-availability flag in backtests to prevent accidental training on event windows that could not have been available at the model build date.

Execution lessons:
- Treat request budgeting as an account-level governor; isolate research, paper, and live traffic across credentials where policy allows.
- Fail deployment checks when a delayed app key is configured for live-like execution environments.
- Add explicit historical-data freshness markers so feature stores and training jobs can account for the documented 5-day settlement lag.

Contradiction noted:
- Common assumption: "historical market data is effectively immediate and exhaustive." Betfair documentation shows explicit post-settlement lag and start-date boundaries that create blind spots.

### Australian race-information policy evidence now adds Queensland and WA operational detail

- [A] Racing Queensland states the current authority period is 1 July 2025 to 30 June 2027, requires an application to use QLD race information, and charges a A$250 application fee for applicants that have not previously held an authority.
- [A] Racing Queensland also states updated general conditions take effect from 1 July 2025 and publishes separate submission templates/definitions and FTP instructions (including split workflows for operators over vs under A$5M turnover and on-course submissions).
- [A] The published Racing Queensland authorised wagering service providers list is dated "as at Nov 20, 2025," providing a concrete snapshot timestamp for entitlement drift tracking.
- [A] WA DLGSC race-fields guidance states operators approved to publish WA race fields must lodge monthly returns and pay the relevant levy, with returns due within 14 days after month-end.
- [A] WA guidance also states where monthly turnover on WA races is less than A$1,000, a nil levy applies but monthly returns are still mandatory.
- [A] WA rules permit regulators to require real-time access to operator systems/accounts for monitoring and audit, creating additional observability and retention obligations.

Extracted data fields to add:
- `race_info_authority.jurisdiction`
- `race_info_authority.period_start`
- `race_info_authority.period_end`
- `race_info_authority.application_fee_aud`
- `race_info_authority.snapshot_as_at`
- `operator_reporting.turnover_band`
- `operator_reporting.submission_channel`
- `operator_reporting.ftp_required_flag`
- `operator_reporting.return_frequency`
- `operator_reporting.return_due_days_after_month_end`
- `operator_reporting.nil_levy_turnover_threshold_aud`
- `operator_reporting.nil_levy_return_required_flag`
- `regulatory_access.real_time_access_required_flag`

Model ideas:
- Add operator-turnover-band as an execution-cost feature when modeling route feasibility by jurisdiction and policy regime.
- Add a compliance-risk feature that penalizes strategies whose reporting granularity cannot satisfy jurisdictional templates.

Execution lessons:
- Compliance pipelines must handle jurisdiction-specific monthly cycles and turnover-band-specific schema variants, not one uniform AU report.
- Maintain dated snapshots of authorised-provider lists and policy documents because approval status is explicitly time-varying.
- Include a "regulator-access readiness" control (audit-log completeness, replayability, retention) before increasing turnover.

Contradiction noted:
- Prior simplification: "Australian race-fields compliance is mostly one policy template." QLD and WA documents show materially different authority periods, threshold logic, and reporting mechanics.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented model internals beyond the 1994 paper already captured.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] No new official CAW-rule publication with higher signal than already captured NYRA/Betfair policy sources was found in this run's search window.

## Source notes (incremental additions for pass 5)

- Betfair support: `TOO_MANY_REQUESTS` from account-level transaction limits (1000 instructions/sec): https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-the-TOO-MANY-REQUESTS-error
- Betfair support: delayed vs live app key stream behavior (delayed key conflated every 3 minutes): https://support.developer.betfair.com/hc/en-us/articles/115003887431-When-should-I-use-the-Delayed-or-Live-Application-Key
- Betfair historical data package coverage and operation list: https://support.developer.betfair.com/hc/en-us/articles/360002423271-What-data-is-provided-as-part-of-the-historical-data-service
- Betfair historical data API endpoint and payload shape: https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-Can-I-Make-HTTP-Requests-to-the-Historical-Data-API
- Betfair historical data publication lag (5 days after settlement): https://support.developer.betfair.com/hc/en-us/articles/360002427051-How-frequently-is-the-historical-data-updated
- Betfair historical data API request rate limit (100 requests per 10 seconds): https://support.developer.betfair.com/hc/en-us/articles/360002424072-What-are-the-request-rate-limits-on-the-Historical-Data-API
- Racing Queensland race information authority page (authority period, application fee, condition/version and submission artifacts): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland authorised wagering service providers list (as at Nov 20, 2025): https://www.racingqueensland.com.au/getmedia/03b57141-1fe4-41e1-a25e-76d978e27ef3/20251120-List-of-Authorised-Wagering-Services-Providers-v6.pdf
- WA DLGSC race-fields / racing bets levy guidance (returns, threshold, 14-day timing, real-time access provisions): https://prod.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/race-fields

## Incremental sourced findings added in this run (2026-03-29, pass 6)

### Betfair Stream sequencing and subscription behavior adds new hard controls

- [A] Betfair Stream support states `clk` is the sequencing mechanism for stream ordering; `pt` is not the state cursor.
- [A] The same 2026 support note states messages are delivered in strict sequential order and that an earlier `pt` should not arrive after a more recent `pt`.
- [A] Betfair support explains `con=true` means multiple updates were pushed in one cycle, including cases where client socket buffers are not drained, `conflateMs > 0`, or the publisher cycle is slow.
- [A] A new 2026 support article says subscribing without a market filter causes all new markets available to the app key to be published when activated, including an `img=true` snapshot.
- [A] Betfair support states closed markets are not immediately excluded from subscription counts: eviction runs every 5 minutes and closed markets are marked for deletion after 1 hour.

Extracted data fields to add:
- `stream_message.clk`
- `stream_message.pt`
- `stream_message.conflated_flag`
- `stream_message.img_flag`
- `stream_subscription.market_filter_present_flag`
- `stream_subscription.auto_added_market_count`
- `stream_subscription.closed_market_cache_count`
- `stream_subscription.closed_market_eviction_cycle_sec`
- `stream_subscription.closed_market_delete_after_sec`

Model ideas:
- Add a stream-quality feature set using `conflated_flag`, socket lag, and `clk` gaps as predictors for stale-signal risk near jump.
- Add a universe-churn feature (`auto_added_market_count`) to detect subscription explosions that can degrade per-market freshness.

Execution lessons:
- Drive replay and reconciliation by `clk` progression, not timestamp sorting alone.
- Enforce explicit market filters in production subscriptions and alert on unexpected `img=true` market additions.
- Treat closed-market cache residency as part of subscription-budget governance.

Contradiction noted:
- Prior simplification: stream ordering can be reconstructed purely by `pt`. New support guidance makes `clk` the canonical sequencing cursor.

### Betfair display-vs-raw price path now has an explicit latency offset in official support

- [A] Betfair support's `listMarketBook`/Stream mapping article states `EX_BEST_OFFERS_DISP` (virtual/display prices) updates around 150ms after non-virtual prices.
- [A] The same mapping clarifies that virtual/display ladders and raw ladders are distinct feed modes and not interchangeable from a micro-timing perspective.
- [A] Betfair's updated app-key guidance (2025-10-30) states delayed keys provide variable-delay snapshots in a 1-180 second range.

Extracted data fields to add:
- `market_feed.price_view_mode(raw|virtual_display)`
- `market_feed.virtual_price_lag_ms_expected`
- `market_feed.app_key_delay_min_sec`
- `market_feed.app_key_delay_max_sec`
- `market_feed.delay_mode_source_doc_version`

Model ideas:
- Train separate late-microstructure features for raw vs virtual-display views and include a deterministic lag compensator for display feed paths.
- Add a delay-regime feature bucket (`1-5s`, `6-30s`, `31-180s`) when evaluating collector freshness under delayed keys.

Execution lessons:
- Do not mix raw and display-virtual ladders in training labels without explicit time-alignment adjustments.
- Treat delayed-key environments as non-live-equivalent and explicitly store observed delay regime per session.

Contradiction noted:
- Earlier pass-5 source stated delayed stream updates every 3 minutes; newer Betfair guidance states variable delay between 1 and 180 seconds. Runtime controls should assume a range, not a fixed 180-second cadence.

### Additional provider capability signal: The Racing API publishes explicit update cadence and throughput guidance

- [B] The Racing API publishes explicit freshness cadence on its public docs: today's racecards/odds/results every 3 minutes, tomorrow's racecards/odds every 15 minutes, future racecards daily.
- [B] The same docs state Australia coverage is available via regional add-on services and recommend high-throughput users import required data into their own database.

Extracted data fields to add:
- `provider_freshness_profile.provider`
- `provider_freshness_profile.today_update_sec`
- `provider_freshness_profile.tomorrow_update_sec`
- `provider_freshness_profile.future_update_sec`
- `provider_freshness_profile.region_addon_required_flag`
- `provider_freshness_profile.local_mirror_recommended_flag`

Model ideas:
- Build provider-specific freshness priors so feature confidence is downweighted when target horizon exceeds documented refresh cadence.
- Add ingestion mode switching (`pull_snapshot` vs `local_mirror`) based on expected request throughput and provider guidance.

Execution lessons:
- Capture documented provider update cadence in entitlement metadata and use it as a pre-trade data-staleness bound.
- For high-throughput workloads, treat provider-local mirroring as default architecture, not later optimization.

Contradiction noted:
- Common assumption: third-party racing feeds are effectively tick-level realtime by default. Public provider documentation here indicates minute-level snapshot cadence for many endpoints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond the 1994 paper.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] CAW microstructure signal quality remains highest via exchange/venue technical and policy documentation rather than syndicate self-disclosure.

## Source notes (incremental additions for pass 6)

- Betfair support: `con=true` stream messages and causes: https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-con-true-messages-via-the-Stream-API
- Betfair support: Stream sequencing by `clk` / `pt` ordering note (updated 2026-03-03): https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- Betfair support: unfiltered stream subscription behavior (updated 2026-03-03): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair support: closed-market cache eviction and deletion timing: https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair support: `listMarketBook` / Stream data mapping and virtual-price lag (~150ms): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API-
- Betfair support: delayed vs live application key guidance (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/360009638032-When-should-I-use-the-Delayed-or-Live-Application-Key
- The Racing API coverage and published refresh cadence: https://www.theracingapi.com/

## Incremental sourced findings added in this run (2026-03-29, pass 7)

### Betfair delay-model microstructure now has explicit model-state behavior and rollout details

- [A] Betfair Developer Program announcements state `betDelayModels` support was expanded from market-description fields into `MarketFilter` (effective 12 January 2026) across filtered discovery endpoints (for example, `listMarketCatalogue`) for `PASSIVE` and `DYNAMIC` model selection.
- [A] A companion Betfair release note states `listMarketCatalogue` only returns `betDelayModels` when `MARKET_DESCRIPTION` is requested and the market actually has delay models enabled; the field can be absent for markets without configured models.
- [A] Betfair forum follow-up (5 February 2026) documents temporary stream-doc inconsistencies during rollout (for example, `betDelayedModels` typo vs returned `betDelayModels`, and filter-behavior confusion), then confirms canonical field naming as `betDelayModels`.
- [A] Betfair's January 2026 Dynamic Bet Delay test note provides concrete transition logic: tennis delay drops to 1 second during nominated "safe" windows (change of ends), restores to 3 seconds at `Pointstart`, and uses suspend/lapse/reactivate choreography targeting sub-0.5 second state transitions.
- [B] Betfair forum update stream indicates dynamic-delay testing remained active through February 2026 with additional competitions added, so delay behavior should be treated as a live rollout program, not a one-off static rule.

Extracted data fields to add:
- `market_description.bet_delay_models[]`
- `market_filter.bet_delay_models[]`
- `market_delay_model.active_state(PASSIVE|DYNAMIC|NONE)`
- `market_delay_model.last_state_change_ts`
- `market_delay_model.transition_trigger`
- `market_delay_model.target_delay_sec`
- `market_delay_model.transition_latency_ms`
- `market_delay_model.rollout_cohort_id`
- `market_delay_model.source_schema_version`

Model ideas:
- Add delay-regime features keyed to model state (`PASSIVE`/`DYNAMIC`) so fill/slippage models do not assume a single in-play delay process.
- Add state-transition-aware execution labels that suppress aggressive placement in the short window around suspend/lapse/reactivate cycles.

Execution lessons:
- Collector/executor contracts should ingest `betDelayModels` at both discovery and market-book layers and fail closed when model state becomes unknown.
- In-play simulation should replay delay-model transitions by trigger event, not fixed per-market constants.

Contradiction noted:
- Prior simplification: in-play delay is mostly a static market-level integer. New Betfair release evidence shows model-state-dependent delay regimes with active rollout behavior.

### Betfair in-play delay baseline remains venue-control dependent and should be treated as floor behavior

- [A] Betfair support documentation states in-play delay is typically 1-12 seconds and is intended to allow unmatched-order cancellation on condition changes.
- [A] The same support article confirms `betDelay` must be read from `listMarketBook` or Stream Market Definition, reinforcing that order delay is runtime market metadata rather than fixed strategy config.

Extracted data fields to add:
- `market_delay.baseline_min_sec`
- `market_delay.baseline_max_sec`
- `market_delay.source_field(listMarketBook|stream_marketDefinition)`

Model ideas:
- Use runtime `betDelay` as a direct covariate in pre-off/in-play fill-probability models and as a hard input to opportunity-half-life estimates.

Execution lessons:
- Never hard-code delay assumptions by sport; use per-market runtime values and retain historical delay traces for replay.

Contradiction noted:
- Common shortcut: one constant in-play delay profile per sport. Betfair's own guidance frames delay as market/runtime-specific and potentially wide-range.

### CAW venue controls remain operationally fragile under tote-system changes

- [B] February 6, 2026 NYRA reporting (via Equibase/BloodHorse relay) states newly introduced CAW guardrails were temporarily suspended for one card to support tote upgrades, with win-pool and selected multi-race restrictions still applied and full guardrail resumption targeted for February 11, 2026.
- [B] This indicates even policy-defined CAW cutoffs can be temporarily altered for infrastructure reasons, creating short-lived regime breaks around technology interventions.

Extracted data fields to add:
- `track_policy.override_start_ts`
- `track_policy.override_end_ts`
- `track_policy.override_scope_pools`
- `track_policy.override_reason`
- `track_policy.override_source_url`

Model ideas:
- Add policy-override event flags to late-odds volatility models so temporary control suspensions are not mislearned as steady-state behavior.

Execution lessons:
- Maintain a policy-override incident ledger and exclude override windows from default parameter calibration unless explicitly modeled.

Contradiction noted:
- Prior assumption: published CAW cutoff schedules are continuously enforced once announced. New reporting shows short-term operational suspensions can occur.

### Australian provider contract detail delta: Punting Form API shape and commercial gating are now clearer

- [A] Punting Form documentation pages expose specific API endpoint families (`MeetingsList`, `RaceDetails`, `Sectionals`, `Results`) and tokenized access patterns via `https://api.puntingform.com.au/v2/`.
- [A] Product pages state Modeller includes API access to sectional data and options to purchase modelling-ready point-in-time datasets and historical Betfair prices/fluctuations, while also stating Modeller is personal-use-only and commercial API use requires separate sales terms.
- [A] Product text also states historical sectional data availability from 2014 (AU/HK/SG) as an explicit lower bound for archive scope on marketed packages.

Extracted data fields to add:
- `provider_contract.api_base_url`
- `provider_contract.auth_scheme`
- `provider_contract.endpoint_family`
- `provider_contract.personal_use_only_flag`
- `provider_contract.commercial_license_required_flag`
- `provider_contract.history_start_year`
- `provider_contract.includes_historical_betfair_flucs_flag`

Model ideas:
- Add provider-license-state as a build-time gate for features derived from point-in-time/historical packs so research pipelines and deployable pipelines cannot silently diverge.

Execution lessons:
- Treat endpoint taxonomy and license scope as first-class provider metadata before schema lock, not post-integration legal cleanup.
- Keep historical backfill plans explicitly bounded by documented provider start years to avoid accidental continuity assumptions.

Contradiction noted:
- Prior simplification: endpoint availability implies deployment entitlement. Punting Form documentation explicitly separates personal-use Modeller access from commercial-use licensing.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond the 1994 paper.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [B] CAW policy updates this run were operational/policy implementation details rather than new syndicate method disclosures.

## Source notes (incremental additions for pass 7)

- Betfair announcement: `betDelayModels` added to MarketFilter (effective 12 Jan 2026): https://forum.developer.betfair.com/forum/developer-program/announcements/42691-betfair-api-release-betdelaymodels-added-to-marketfilter-%E2%80%93-12th-january-2026
- Betfair announcement: `betDelayModels` added to `listMarketCatalogue` response (field-presence semantics): https://forum.developer.betfair.com/forum/developer-program/announcements/42703-betfair-api-release-betdelaymodels-to-listmarketcatalogue-response-12thjanuary2026
- Betfair announcements index (shows ongoing Feb 2026 dynamic-delay update activity): https://forum.developer.betfair.com/forum/developer-program/announcements
- Betfair developer profile activity feed (contains dated dynamic-delay update excerpts): https://forum.developer.betfair.com/member/11-betfairdeveloperprogram
- Betfair support: in-play delay baseline and runtime `betDelay` lookup: https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Equibase relay of NYRA CAW restriction suspension note (Feb 6, 2026): https://cms.equibase.com/node/313508
- Punting Form API docs (endpoint families, v2 tokenized access examples): https://docs.puntingform.com.au/reference/getapi-v2-meetingslist
- Punting Form API reference index: https://docs.puntingform.com.au/reference/get-api-v2-race-meeting
- Punting Form Modeller product/licensing page: https://puntingform.com.au/products/modeller

## Incremental sourced findings added in this run (2026-03-29, pass 8)

### Betfair order-vs-market stream boundaries create a non-negotiable reconciliation requirement

- [A] Betfair support states market changes (MCM) and order changes (OCM) are produced by independent systems, with no guaranteed send order and no field for deterministic OCM-to-MCM matching.
- [A] Betfair support documents an Order Stream limitation: runner-removal void/lapse transitions are not reflected in stream updates because they are treated as settlement-time events.
- [A] Betfair reconnection guidance specifies replay patching via `ct=RESUB_DELTA`, with possible `img=true` replacement semantics and frequent `con=true` conflation after reconnect.
- [A] Betfair segmentation guidance states segmentation is predominantly an initial-image behavior and generally appears at large subscription sizes (~1000 markets or more).

Extracted data fields to add:
- `stream_event.channel(mcm|ocm|settlement)`
- `stream_event.source_sequence`
- `stream_event.cross_channel_match_id_nullable`
- `order_stream.runner_removal_void_visible_flag`
- `stream_resub.ct`
- `stream_resub.img_replace_required_flag`
- `stream_resub.conflated_after_resub_flag`
- `stream_bootstrap.segmented_initial_image_flag`
- `stream_bootstrap.segment_count`
- `stream_bootstrap.subscription_market_count`

Model ideas:
- Add a reconciliation-quality feature (`mcm_ocm_alignment_lag_ms`, `unmatched_settlement_adjustments`) and downweight labels sourced from unresolved cross-channel states.
- Add bootstrap-load diagnostics (segmented-image depth, post-resub conflation incidence) as covariates in late-window freshness confidence.

Execution lessons:
- Treat Order Stream as necessary but insufficient truth for settlement-sensitive states; always reconcile with settled-order endpoints.
- Separate market-state processing from order-state processing and merge only through an internal deterministic event journal.
- Build reconnect handlers that explicitly branch on `RESUB_DELTA` + `img=true` replacement semantics instead of generic delta merges.

Contradiction noted:
- Prior simplification: one stream timeline can fully explain order + market state transitions. Betfair support states these channels are independent and can diverge in observable sequence.

### Betfair transport/auth implementation details should be encoded as deploy-time guardrails

- [A] Betfair support states Exchange Stream API uses SSL socket + CRLF JSON protocol; WebSocket connections are refused.
- [A] Betfair support states Vendor Web API app keys must send the BEARER token (`token_type + access_token`) as the stream session value.

Extracted data fields to add:
- `stream_connection.transport_protocol(ssl_socket_crlf_json)`
- `stream_connection.websocket_attempted_flag`
- `stream_connection.auth_mode(session|bearer)`
- `stream_connection.app_key_type(web|desktop|other)`
- `stream_connection.auth_failure_code`

Model ideas:
- Add transport/auth incident features to session-quality scoring used for execution-quality attribution.

Execution lessons:
- Enforce protocol and auth preflight checks before market subscription to avoid avoidable live-session failures.
- Maintain app-key-type-aware session builders (`bearer` for web keys) as a hard requirement in deployment config.

Contradiction noted:
- Common implementation shortcut: Stream API behaves like generic WebSocket market feeds. Betfair support explicitly requires SSL socket protocol semantics.

### NYRA CAW policy source adds explicit operational threshold metadata

- [A] NYRA's official Jan 30, 2026 announcement defines CAW activity as execution speed exceeding six bets per second.
- [A] The same release keeps the historical win-pool 2-minutes-to-post CAW restriction while applying 1-minute-to-post cessation to pools not already covered.
- [A] NYRA states Late Pick 5 and Pick 6 remain retail-only wagers under this policy set.

Extracted data fields to add:
- `track_policy.caw_speed_threshold_bets_per_sec`
- `track_policy.win_pool_caw_cutoff_sec_to_post`
- `track_policy.other_pools_caw_cutoff_sec_to_post`
- `track_policy.retail_only_pool_codes[]`
- `track_policy.policy_source_published_date`

Model ideas:
- Add a policy-intensity feature combining cutoff timing + CAW speed-threshold strictness to explain pre-off odds volatility differences across tracks.

Execution lessons:
- Preserve separate policy dimensions (definition threshold, pool scope, cutoff timings, retail-only pools) instead of flattening to one `caw_cutoff_sec` field.

Contradiction noted:
- Prior shorthand: CAW policies are mostly cutoff timestamps. NYRA's source adds explicit speed-threshold definition and retail-only pool scoping.

### Australian provider signal update: endpoint-tier separations are explicit and useful for entitlement-aware architecture

- [A] Punting Form API docs specify `v2/Updates/Scratchings` returns upcoming scratchings with timestamps and deductions and is available from Starter tier upward.
- [A] Punting Form docs specify `v2/Ratings/MeetingSectionals` is available only to Modeller/commercial subscriptions and requires token-based authentication.
- [A] Punting Form docs specify `v2/form/results` is available from Starter tier upward, reinforcing endpoint-level tier heterogeneity.
- [B] Racing & Sports corporate materials state RAS is an approved distributor under Racing Australia for Australian race fields and advertises premium data/statistics coverage across 33+ jurisdictions.

Extracted data fields to add:
- `provider_endpoint.entitlement_tier_min`
- `provider_endpoint.token_auth_required_flag`
- `provider_endpoint.includes_timestamps_flag`
- `provider_endpoint.includes_deductions_flag`
- `provider_contract.approved_distributor_under_ra_flag`
- `provider_contract.claimed_jurisdiction_coverage_count`

Model ideas:
- Build endpoint-level feature entitlement checks so live pipelines can degrade gracefully when only Starter-tier endpoints are licensed.
- Add deduction-aware late price adjustment features using timestamped scratching/deduction updates.

Execution lessons:
- Model/data contracts should be endpoint-granular, not provider-granular, because entitlement varies materially within one provider.
- Keep lower-confidence corporate marketing claims (`B`) separate from contractual API evidence (`A`) when ranking providers.

Contradiction noted:
- Prior simplification: provider capability can be represented by a single plan level. Endpoint documentation shows mixed tier requirements even within the same API family.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond the 1994 paper.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] CAW evidence quality improved via direct NYRA threshold-definition language, but this is still policy/microstructure disclosure rather than syndicate method disclosure.

## Source notes (incremental additions for pass 8)

- Betfair support: Market & Order Stream overview (channel separation context): https://support.developer.betfair.com/hc/en-us/articles/360000402291-Market-Order-Stream-API-How-does-it-work
- Betfair support: OCM vs MCM matching limitation: https://support.developer.betfair.com/hc/en-us/articles/360000391312-How-can-I-match-OCM-and-MCM-messages-from-the-Stream-API
- Betfair support: void bets and runner-removal limitation in Order Stream: https://support.developer.betfair.com/hc/en-us/articles/360000391492-How-are-void-bets-treated-by-the-Stream-API
- Betfair support: reconnection guidance (`RESUB_DELTA`, `img=true`, `con=true`): https://support.developer.betfair.com/hc/en-us/articles/360000391612-Market-Streaming-how-do-I-managed-re-connections
- Betfair support: segmentation behavior and ~1000-market threshold guidance: https://support.developer.betfair.com/hc/en-us/articles/360000402331-How-does-segmentation-work-benefits
- Betfair support: Stream API protocol is SSL socket (not WebSocket): https://support.developer.betfair.com/hc/en-us/articles/12937897844252-Does-the-Stream-API-allow-Web-Socket-connections
- Betfair support: BEARER token requirement for Vendor Web app key stream sessions: https://support.developer.betfair.com/hc/en-us/articles/360000391432-Stream-API-Bearer-Token-Must-Be-Used-for-Web-App-Key
- NYRA official release (Jan 30, 2026) CAW guardrails and threshold definition: https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Punting Form API docs: Scratchings endpoint (`timestamps` + `deductions`, Starter+): https://docs.puntingform.com.au/reference/scratchings
- Punting Form API docs: Sectionals endpoint (Modeller/commercial + token auth): https://docs.puntingform.com.au/reference/meetingsectionals
- Punting Form API docs: Results endpoint (Starter+): https://docs.puntingform.com.au/reference/results-1
- Racing & Sports corporate: Enhanced Information Services / approved distributor claim: https://racingandsports.company/enhanced-information-services/

## Incremental sourced findings added in this run (2026-03-29, pass 9)

### Betfair order identity and cancellation semantics require stricter execution-state design

- [A] Betfair `placeOrders` documents multiple independent identifiers and limits that are easy to conflate in live systems: `customerRef` is only a 60-second de-duplication key, does not persist into the place response/Order Stream, and must not be treated as an order-state join key.
- [A] The same page states `customerStrategyRef` is returned on order-change stream messages but is capped at 15 characters.
- [A] `placeOrders` also documents that if "Best Execution" is switched off, a normally atomic call can return `PROCESSED_WITH_ERRORS` (partial acceptance), and place instruction count is capped at 200 per request on Global Exchange.
- [A] `cancelOrders` documents concurrent "cancel all bets" requests are rejected until the first request completes, and cancel instruction count is capped at 60 per request.
- [A] `listRunnerBook` documents single-runner query scope per request (one `marketId` + one `selectionId`) and provides strategy partitioning controls (`partitionMatchedByStrategyRef`, `customerStrategyRefs`) with a max of 250 `betIds`.

Extracted data fields to add:
- `order_identity.customer_ref_ephemeral_flag`
- `order_identity.customer_ref_dedupe_window_sec`
- `order_identity.customer_order_ref`
- `order_identity.customer_strategy_ref`
- `order_identity.customer_strategy_ref_len`
- `order_execution.processed_with_errors_flag`
- `order_submission.place_instruction_count`
- `order_submission.place_instruction_limit`
- `cancel_flow.cancel_all_mutex_active_flag`
- `cancel_flow.concurrent_cancel_all_reject_flag`
- `cancel_flow.cancel_instruction_count`
- `cancel_flow.cancel_instruction_limit`
- `runner_query.partition_by_strategy_flag`
- `runner_query.customer_strategy_refs[]`
- `runner_query.bet_ids_count`
- `runner_query.bet_ids_limit`

Model ideas:
- Build strategy-level fill/slippage diagnostics keyed to `customerStrategyRef` partitions from `listRunnerBook` so alpha and execution quality can be measured per strategy, not only per market.
- Add execution-risk features for partial atomicity failure (`processed_with_errors_flag`) and cancel contention (`cancel_all_mutex_active_flag`) in near-jump windows.

Execution lessons:
- Treat `customerRef` as retry hygiene only; persist and reconcile on `customerOrderRef`/`betId`/strategy keys instead.
- Add hard client-side guardrails for place/cancel instruction counts before request construction.
- Serialize "cancel all" operations through an account-scoped mutex and explicit queueing path.

Contradiction noted:
- Common implementation shortcut: one client reference can serve idempotency and lifecycle tracking. Betfair docs explicitly separate these concerns and make `customerRef` non-persistent.

### Betfair PnL endpoint scope can bias live diagnostics if not modeled explicitly

- [A] `listMarketProfitAndLoss` is documented for OPEN markets only and only for ODDS market types; non-ODDS markets are silently ignored.
- [A] Betfair also documents CLOSED-market PnL should be retrieved via `listClearedOrders`.
- [A] The endpoint can optionally return PnL net of current commission rate including special tariffs (`netOfCommission=true`).

Extracted data fields to add:
- `pnl_snapshot.market_state_scope(open_only)`
- `pnl_snapshot.market_betting_type_scope(odds_only)`
- `pnl_snapshot.non_odds_ignored_flag`
- `pnl_snapshot.net_of_commission_flag`
- `pnl_snapshot.special_tariff_included_flag`
- `pnl_snapshot.closed_market_source(listClearedOrders)`

Model ideas:
- Train a reconciliation model for `live_open_pnl` vs `settled_pnl` drift by market phase so strategy comparisons are not polluted by endpoint scope artifacts.

Execution lessons:
- Do not use `listMarketProfitAndLoss` as a universal truth source for final strategy PnL.
- Always publish paired PnL views (`open_live_estimate`, `settled_final`) in dashboards and governance reports.

Contradiction noted:
- Prior simplification: one PnL endpoint can power both live and settled reporting. Betfair docs define separate scopes and settlement pathways.

### Queensland race-information conditions add machine-actionable compliance and normalization details

- [A] Racing Queensland's FY26-27 conditions comparison document explicitly enumerates "Approved Supplier" entities (including Racing Australia, AAP, BettorData/Live Datacast, RISE, RWWA, BetMakers).
- [A] The same document defines Business Day relative to Brisbane and includes "Free Bets" within bets-taken turnover definitions.

Extracted data fields to add:
- `jurisdiction_policy.approved_supplier_name`
- `jurisdiction_policy.approved_supplier_abn`
- `jurisdiction_policy.timezone_reference(Brisbane)`
- `jurisdiction_policy.business_day_calendar_id`
- `turnover_definition.includes_free_bets_flag`
- `turnover_definition.includes_layoff_bets_flag`
- `turnover_definition.non_winning_refund_deduction_excluded_flag`

Model ideas:
- Add a jurisdiction-specific turnover-normalization layer so fee/profitability simulations use source-correct bet-base definitions rather than generic turnover assumptions.

Execution lessons:
- Normalize compliance/reporting timestamps to jurisdiction-defined business-day timezone, not system default timezone.
- Keep an approved-supplier registry dimension in entitlement checks so upstream feed substitutions remain policy-valid.

Contradiction noted:
- Prior simplification: turnover definitions are uniform across states and free bets are treated separately. QLD conditions explicitly include free bets and jurisdiction-specific counting rules.

### The Racing API now provides quantifiable AU coverage evidence (still lower-confidence for production SLA)

- [B] The Racing API "Data Coverage" page now exposes concrete AU inventory counts by state/course/year and states AU coverage requires an Australia data add-on.
- [B] Current page values include dynamic totals (e.g., AU section showing `Total Results` and per-state/year splits), which are useful for initial coverage sanity checks before commercial diligence.

Extracted data fields to add:
- `provider_coverage.total_results`
- `provider_coverage.region_add_on_required_flag`
- `provider_coverage.state`
- `provider_coverage.course`
- `provider_coverage.year`
- `provider_coverage.result_count`
- `provider_coverage.snapshot_ts`

Model ideas:
- Use coverage-density features (results-per-course-year) as a data-quality prior when selecting jurisdictions/classes for early model training slices.

Execution lessons:
- Snapshot coverage pages with timestamps; treat counts as moving metadata, not static provider facts.
- Keep this provider at `B` evidence until contractual freshness/latency and rights terms are obtained.

Contradiction noted:
- Prior simplification: candidate-provider coverage was mostly qualitative. New coverage tables provide quantitative pre-screening signals.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] New high-signal evidence this run was concentrated in exchange microstructure and Australian policy/provider contract surfaces.

## Source notes (incremental additions for pass 9)

- Betfair `placeOrders` (instruction limits, identifier semantics, partial processing caveat): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair `cancelOrders` (concurrent cancel-all rejection, cancel limits): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687491/cancelOrders
- Betfair `listRunnerBook` (strategy partitioning, one-runner scope, betIds cap): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687847/listRunnerBook
- Betfair `listMarketProfitAndLoss` (OPEN-only scope, ODDS-only support, net commission option): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687667/listMarketProfitAndLoss
- Racing Queensland FY26-27 general conditions comparison (approved suppliers, turnover/business-day definitions): https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf
- Racing Queensland authorised wagering service providers list (v36 snapshot): https://www.racingqueensland.com.au/getmedia/e3fcb1e8-f81a-4166-82b3-53495b9a881e/20221212-List-of-Authorised-Wagering-Services-Providers-v36.pdf.aspx
- The Racing API data coverage page (AU add-on + state/course/year counts): https://www.theracingapi.com/data-coverage

## Incremental sourced findings added in this run (2026-03-29, pass 10)

### Betfair app-key policy now explicitly links read-only live-key behavior to enforcement risk

- [A] Betfair's official "What is read-only Betfair API access?" article (published 2026-03-06) states read-only access using a live application key is not permitted.
- [A] The same source states teams collecting/reading market data without intent to place bets should use delayed keys, and warns of restrictions including live-key deactivation.

Extracted data fields to add:
- `app_key_usage.intended_mode(execution|read_only_collection)`
- `app_key_usage.live_key_read_only_prohibited_flag`
- `app_key_usage.enforcement_risk_flag`
- `app_key_usage.recommended_key_type(delayed|live)`
- `app_key_usage.policy_last_seen_ts`

Model ideas:
- Add an `execution_intent_valid` gate in training/collection pipelines so historical data ingests that are not tied to execution use delayed-key infrastructure by default.

Execution lessons:
- Separate app keys by workload purpose (execution vs research collection) and make "live key + read-only workload" a hard policy violation in runbooks.
- Add automated key-health monitors for early detection of enforcement/deactivation events.

Contradiction noted:
- Prior simplification: key choice is mainly latency/performance. Betfair now frames key choice as an explicit compliance/control issue tied to access restrictions.

### Betfair request-weight rules add concrete microstructure collection trade-offs at request-construction time

- [A] Betfair's Exchange API limits article (updated 2025-09-09) defines a per-request cap where `sum(weight) * marketIds` must stay <= 200 or the request fails with `TOO_MUCH_DATA`.
- [A] The same source states some `priceProjection` combinations have non-additive weights and that `exBestOffersOverrides` scales weight by `(requestedDepth/3)`.

Extracted data fields to add:
- `request_budget.request_weight_sum`
- `request_budget.market_ids_count`
- `request_budget.weight_times_market_count`
- `request_budget.max_allowed_weight_product(200)`
- `request_budget.price_projection_combo_id`
- `request_budget.ex_best_offers_requested_depth`
- `request_budget.projected_weight_with_depth`
- `request_budget.too_much_data_reject_flag`

Model ideas:
- Learn a dynamic collector-depth policy that picks `requestedDepth` by `sec_to_post` and liquidity regime while staying within account-level and request-level weight budgets.

Execution lessons:
- Budget request weight before dispatch; do not rely on endpoint rejection handling in hot paths.
- Treat projection-combination weight tables as versioned config with regression tests.

Contradiction noted:
- Prior simplification: projection weights are approximately additive and can be tuned ad hoc. Betfair docs specify non-additive combinations and depth-scaled penalties.

### Racing Australia wholesaler framework creates a stronger primary-source map for AU data-provider routing

- [A] Racing Australia's media release dated 2025-06-19 states Racing Australia stepped back from acting as a wholesaler and appointed five authorised/approved wholesalers under a common Wholesaler Agreement.
- [A] The same release names the five wholesalers as BettorData, BetMakers, Mediality Racing, News Perform (Punters Paradise), and Racing and Sports, and states arrangements commenced 2025-07-01.
- [A] Racing Australia states the change was made to improve transparency and compliance/enforcement around copyright/IP use.

Extracted data fields to add:
- `ra_wholesaler_registry.wholesaler_name`
- `ra_wholesaler_registry.authorised_flag`
- `ra_wholesaler_registry.approved_flag`
- `ra_wholesaler_registry.framework_start_date`
- `ra_wholesaler_registry.source_release_date`
- `ra_wholesaler_registry.common_agreement_flag`
- `entitlement_path.upstream_wholesaler_name`
- `entitlement_path.ra_compliance_framework_version`

Model ideas:
- Add a provider-lineage confidence feature (`direct_authorised_wholesaler`, `downstream_reseller`, `unknown`) to data-quality and legal-risk scoring used in provider ranking.

Execution lessons:
- Record explicit wholesaler lineage for every non-Betfair AU racing dataset before feature promotion.
- Re-run provider due diligence when RA wholesaler framework versions or authorised lists change.

Contradiction noted:
- Prior simplification: provider legitimacy could be modeled mainly at provider-brand level. RA's framework introduces a primary-source wholesaler lineage layer that should be first-class in entitlement checks.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] This run's strongest net-new evidence is in execution microstructure controls and AU data-entitlement structure, not syndicate-model internals.

## Source notes (incremental additions for pass 10)

- Betfair support: "What is read-only Betfair API access?" (published 2026-03-06): https://support.developer.betfair.com/hc/en-us/articles/25033076334748-What-is-read-only-Betfair-API-access
- Betfair support: Exchange API request-weight limits and `TOO_MUCH_DATA` rules (updated 2025-09-09): https://support.developer.betfair.com/hc/en-us/articles/115003864671-What-data-request-limits-exist-on-the-Exchange-API
- Racing Australia media release: Racing Materials distribution - Wholesaler Agreement (2025-06-19): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

## Incremental sourced findings added in this run (2026-03-29, pass 11)

### Betfair market availability has jurisdiction/IP constraints that can silently create missing-market artifacts

- [A] Betfair support (updated 2025-11-28) states `listEvents`, `listMarketCatalogue`, and `listMarketBook` can return empty results for legally restricted locations/IP ranges (example provided: Germany-based access).
- [A] The same source states Singapore-based horse-racing markets are only returned for AUS/NZ customers.

Extracted data fields to add:
- `market_visibility.request_ip_region`
- `market_visibility.legal_restriction_flag`
- `market_visibility.empty_response_due_to_geo_flag`
- `market_visibility.sg_horse_market_aus_nz_only_flag`
- `market_visibility.source_policy_last_seen_ts`

Model ideas:
- Add a `visibility_eligibility_score` feature to classify whether apparent market absences are likely data-collector faults vs jurisdiction filtering.

Execution lessons:
- Treat empty market responses as ambiguous until geo-eligibility checks pass.
- Add region/endpoint health probes from at least one allowed AUS/NZ context before raising outage incidents.

Contradiction noted:
- Prior simplification: empty catalogue/book responses are primarily collector or filter bugs. Betfair documents legal-visibility constraints as a separate root cause.

### Betfair historical-data coverage boundaries should be hard constraints in AU backtest windows

- [A] Betfair support (updated 2025-12-02) states current-format historical data is available from April 2015 onward.
- [A] The same source states Australian/New Zealand historical market data is available from October 2016 only.

Extracted data fields to add:
- `historical_coverage.global_start_date(2015-04-01)`
- `historical_coverage.au_nz_start_date(2016-10-01)`
- `historical_coverage.format_pre_2015_available_flag(false)`
- `training_window.coverage_floor_violation_flag`
- `training_window.coverage_source_url`

Model ideas:
- Add a `coverage_density_penalty` to downweight evaluation segments near the AU/NZ coverage boundary where sample fragmentation is higher.

Execution lessons:
- Enforce AU/NZ training/backtest lower bound at `2016-10-01` unless a separate pre-2015 ingestion path is explicitly built and labeled.
- Track coverage-floor violations as first-class experiment metadata so model comparisons remain valid.

Contradiction noted:
- Prior simplification: AU history could be treated as continuous from global Exchange archival start. Betfair documents a later AU/NZ start boundary.

### New peer-reviewed evidence reframes favourite-longshot bias as market-structure sensitive, not purely behavioral

- [A] Hegarty and Whelan (Oxford Economic Papers, Vol 78 Issue 1, Jan 2026; published 2025-08-28) model favourite-longshot bias as an imperfect-competition outcome in fixed-odds markets when bettor disagreement interacts with heterogeneous demand elasticity.
- [A] The same paper reports that bias appears in high-margin home/away/draw books but not in a more competitive Asian Handicap market for the same soccer fixtures.

Extracted data fields to add:
- `market_structure.competition_regime(competitive|retail_high_margin)`
- `market_structure.margin_proxy_overround`
- `market_structure.customer_limiting_practices_flag`
- `bias_diagnostics.flb_expected_by_regime`
- `bias_diagnostics.draw_loss_rate_bucket`

Model ideas:
- Add a `structure-conditioned bias` layer that estimates expected longshot-tax by venue/book type and uses it to calibrate cross-market price blending.

Execution lessons:
- Do not treat favourite-longshot bias as static across all channels; model it as a regime variable tied to competition and margin structure.
- When blending exchange and fixed-odds references, include a competition-regime adjustment before deriving value signals.

Contradiction noted:
- Prior simplification: longshot bias was mostly bettor-psychology. New evidence supports an additional structural/competition mechanism that can dominate in retail fixed-odds channels.

### Racing Victoria approved-operator registry exposes deployable counterparty-segmentation signals

- [A] Racing Victoria's approved WSP page provides live segmentation into `Australian Operators`, `Victorian Licensed Bookmakers`, and `International Licensed Bookmakers`.
- [A] The same registry currently includes international counterparties such as Hong Kong Jockey Club, Japan Racing Association, PMU, and Singapore Turf Club, which is useful for compliance-tier and cross-border routing metadata.

Extracted data fields to add:
- `rv_registry_snapshot.operator_name`
- `rv_registry_snapshot.operator_segment(australian|victorian_licensed|international)`
- `rv_registry_snapshot.snapshot_ts`
- `counterparty_profile.cross_border_flag`
- `counterparty_profile.jurisdiction_group`

Model ideas:
- Add counterparty-segment features for execution-risk priors (e.g., expected reporting burden, jurisdiction complexity, settlement/cutoff heterogeneity).

Execution lessons:
- Snapshot registry composition regularly and tie provider/counterparty approvals to jurisdiction-aware routing and entitlement checks.
- Keep segment-aware compliance playbooks instead of a single generic WSP process.

Contradiction noted:
- Prior simplification: approved-operator checks were mostly binary. Registry structure supports richer segment-level controls.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] This run's strongest net-new evidence is in market-availability controls, data-coverage boundaries, and market-structure calibration logic.

## Source notes (incremental additions for pass 11)

- Betfair support: market non-return causes / geo restrictions (updated 2025-11-28): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-API-response
- Betfair support: historical-data service coverage window (updated 2025-12-02): https://support.developer.betfair.com/hc/en-us/articles/360002407732-What-data-is-provided-by-the-Historical-Data-service
- Oxford Economic Papers (Vol 78, Issue 1, Jan 2026): Market structure and prices in online betting markets (doi:10.1093/oep/gpaf023): https://academic.oup.com/oep/article/78/1/90/8244336
- Racing Victoria approved wagering service providers registry: https://www.racingvictoria.com.au/wagering/wagering-service-providers

## Incremental sourced findings added in this run (2026-03-29, pass 12)

### Betfair stream cache semantics and heartbeat defaults should be treated as first-class reliability inputs

- [A] Betfair support clarifies `size=0` in runner-change ladders means remove at that level/price, not an executable zero-size quote; cache handlers must delete entries rather than keep zero-size levels.
- [A] The same guidance reiterates stream updates are delta-oriented: `img=true` means replace cached item, and unchanged nullable fields may be omitted from subsequent deltas.
- [A] Betfair heartbeat/conflation guidance states server heartbeats are emitted only when no market traffic is sent in the interval, carry `clk`, and default to 5000ms unless configured.

Extracted data fields to add:
- `stream_delta.size_zero_remove_flag`
- `stream_delta.delta_nullable_omitted_flag`
- `stream_delta.img_replace_flag`
- `stream_heartbeat.server_heartbeat_interval_ms`
- `stream_heartbeat.server_heartbeat_default_ms`
- `stream_heartbeat.sent_due_to_inactivity_flag`
- `stream_heartbeat.clk`

Model ideas:
- Add `stream_staleness_gap_ms` and `heartbeat_gap_count` features to downweight late-window observations from cache-degraded sessions.
- Add a delta-integrity score (`size_zero_applied_correctly`, `img_replacement_consistency`) as an execution-quality covariate.

Execution lessons:
- Keep a deterministic in-memory/order-book cache spec: apply remove-on-zero before feature derivation.
- Persist heartbeat `clk` even when no prices change, so replay cursors remain contiguous across low-activity windows.

Contradiction noted:
- Prior shortcut: zero sizes can be treated as inert values. Betfair guidance defines them as explicit delete operations.

### Betfair virtual-stream edge cases (`Infinity`, penultimate zeroed RC) require explicit sanitizers and settlement-aware filtering

- [A] Betfair support documents an edge case where virtualized stream serialization can emit `"Infinity"` size values; this is tied to virtual-order generation failures.
- [A] Betfair also documents penultimate runner-change messages with all price-point volumes zeroed as a known settlement clear-out artefact/bug when bets move from trading DB to longer-term store.

Extracted data fields to add:
- `stream_anomaly.infinity_size_seen_flag`
- `stream_anomaly.infinity_field_path`
- `stream_anomaly.virtual_stream_mode_flag`
- `stream_anomaly.penultimate_zero_rc_flag`
- `stream_anomaly.settlement_clearout_window_flag`
- `stream_anomaly.anomaly_source_doc_version`

Model ideas:
- Add an anomaly-mask feature to exclude or downweight affected snapshots in microstructure labels.
- Train a post-settlement artefact classifier so end-of-market clear-out frames are not mislearned as genuine liquidity collapses.

Execution lessons:
- Normalize `Infinity` payloads via strict parser guards and incident counters before cache mutation.
- Suppress penultimate settlement artefacts from execution and calibration pipelines unless explicitly tagged as settlement-phase diagnostics.

Contradiction noted:
- Prior simplification: stream payloads are always numeric/clean if transport is healthy. Betfair support confirms known serialization/settlement artefacts.

### Queensland policy surface now provides deployable submission-artifact and minimum-bet-limit controls

- [A] Racing Queensland's race-information page now publishes current July 1, 2025 artefacts for authorised operators, including updated general conditions plus standard, on-course, and FTP submission definition/template instructions.
- [A] Racing Queensland's Minimum Bet Limits page states off-course fixed-odds obligations are subject to General Conditions exclusions, including betting exchange bets, multi-bets, and retail betting transactions.
- [A] The same page states MBL complaints are time-bounded (14 days from incident, with extension conditions) and shows turnover-tiered operator treatment on published MBL material.

Extracted data fields to add:
- `qld_submission_artifact.artifact_type(definitions|template|ftp_instruction|oncourse_definition|oncourse_template)`
- `qld_submission_artifact.effective_from`
- `qld_submission_artifact.source_url`
- `qld_submission_artifact.format(docx|xlsx|pdf|html)`
- `qld_mbl_scope.off_course_fixed_odds_only_flag`
- `qld_mbl_scope.exclusion_betting_exchange_flag`
- `qld_mbl_scope.exclusion_multi_bet_flag`
- `qld_mbl_scope.exclusion_retail_transaction_flag`
- `qld_mbl_complaint.complaint_window_days`
- `qld_mbl_operator.turnover_tier`

Model ideas:
- Add a jurisdictional execution-feasibility gate that disables fixed-odds strategy paths when MBL-scope/exclusion logic indicates non-applicability.
- Add turnover-tier-aware compliance-cost priors for bookmaker-route profitability stress tests.

Execution lessons:
- Tie QLD reporting ETL to explicitly versioned artefact files (definitions/templates/FTP instructions) rather than implicit schema assumptions.
- Keep separate policy logic for exchange and fixed-odds channels under QLD MBL rules.

Contradiction noted:
- Prior simplification: QLD reporting/control artefacts were mostly static and high-level. Current pages expose finer-grained, channel-specific submission packs and explicit MBL exclusions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new evidence in this pass remains strongest in exchange stream implementation edge cases and AU compliance artefact surfaces.

## Source notes (incremental additions for pass 12)

- Betfair support: runner-change `size=0` handling and delta-cache semantics: https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-to-I-handle-runner-changes-with-size-0
- Betfair support: heartbeat/conflation behavior and default server heartbeat interval: https://support.developer.betfair.com/hc/en-us/articles/360000402611-Market-Streaming-How-do-the-Heartbeat-and-Conflation-requests-work
- Betfair support: `Infinity` size virtual-stream edge case: https://support.developer.betfair.com/hc/en-us/articles/360003061798-Why-am-I-receiving-Infinity-size-from-the-Streaming-API
- Betfair support: penultimate zeroed `rc` settlement artefact: https://support.developer.betfair.com/hc/en-us/articles/4802553453457-Why-does-the-penultimate-rc-have-all-runner-volumes-of-Price-Points-Traded-Available-To-Back-Lay-set-to-zero
- Racing Queensland race information page (July 2025 condition/submission artefact index): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland General Conditions PDF (effective 2025-07-01 to 2027-06-30): https://www.racingqueensland.com.au/getmedia/d3bc5b41-5150-483f-b0b9-ede6f4733ba4/25-0610-General-Conditions-for-Race-Information-Authority-1-July-2025-30-June-2027-FINAL.pdf
- Racing Queensland Minimum Bet Limits page (scope/exclusions/complaint window): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/minimum-bet-limits

## Incremental sourced findings added in this run (2026-03-29, pass 13)

### Betfair website-vs-API parity has three documented microstructure causes that should be modeled explicitly

- [A] Betfair support states website prices can differ from API outputs because website display includes virtual bets while API defaults may exclude them unless `virtualise=true` (`listMarketBook`) or `EX_BEST_OFFERS_DISP` (stream) is requested.
- [A] The same source states a logged-out website session is delayed by default, while a live-key API session is not, creating apparent parity breaks even when filters are otherwise aligned.
- [A] The same source states website bet-view stake aggregation can be replicated only when API requests set `exBestOffersOverrides` with `rollupModel=STAKE` and `rollupLimit`.

Extracted data fields to add:
- `market_view_parity.virtualise_requested_flag`
- `market_view_parity.price_projection_type(ex_best_offers|ex_best_offers_disp)`
- `market_view_parity.website_auth_state(logged_in|logged_out)`
- `market_view_parity.rollup_model`
- `market_view_parity.rollup_limit`
- `market_view_parity.default_stake_reference_gbp`

Model ideas:
- Add a `display_parity_residual` feature that compares strategy inputs against website-equivalent rollup/virtual settings to prevent false drift alerts.
- Train fill/slippage models on both `raw_orderbook_view` and `display_equivalent_view` so monitoring can distinguish execution edge from UI-view mismatch.

Execution lessons:
- Do not triage API-vs-website price mismatches until `virtualise`, auth state, and rollup settings are explicitly aligned and logged.
- Persist request-level projection settings with every snapshot so replay can reconstruct exact visibility conditions.

Contradiction noted:
- Prior simplification: website/API price differences were treated mainly as latency or key-mode effects. Betfair documents additional deterministic display-mode causes.

### Betfair exchange overround appears structurally variable by race grade in published microstructure evidence

- [A] Oxford Handbook chapter evidence (2,184 UK races, 2008-2010) reports a positive relationship between race grade and Betfair starting-price overround.
- [A] The same chapter frames exchange overround analysis as a microstructure problem in order-driven markets rather than a static constant.

Extracted data fields to add:
- `exchange_overround.sp_overround`
- `exchange_overround.race_grade`
- `exchange_overround.field_size`
- `exchange_overround.preoff_liquidity_proxy`
- `exchange_overround.expected_overround_by_grade`

Model ideas:
- Add a `grade_conditioned_overround_baseline` to expected-value calculations so edge thresholds are race-context aware.
- Add overround-regime residuals as predictors for short-horizon fill-probability and closing-price error.

Execution lessons:
- Use dynamic overround baselines by race segment before signaling overlays; avoid a single global overround assumption.
- Segment CLV and realized edge by race grade to detect where market friction systematically shifts.

Contradiction noted:
- Prior simplification: exchange overround was often treated as a near-constant friction term. Published evidence shows systematic structural variation.

### The Racing API exposes operational-health and query-window constraints that should stay out of execution-critical dependencies

- [B] The Racing API status feed reports recent production incidents, including a 2026-02-06 regional add-on 500-error event and a 2026-02-07 results-endpoint parameter/default-range change.
- [B] The same status page publishes service uptime by component (API, Racecards, Results), enabling machine-readable provider reliability scoring.
- [B] The Racing API data-coverage page publishes dynamic result-count inventories by region/year/course and dataset tier, indicating feed shape is mutable and should be snapshotted.

Extracted data fields to add:
- `provider_status_snapshot.provider`
- `provider_status_snapshot.component`
- `provider_status_snapshot.uptime_pct_30d`
- `provider_incident.incident_id`
- `provider_incident.component`
- `provider_incident.started_at`
- `provider_incident.resolved_at`
- `provider_incident.change_type(default_range|endpoint_error|other)`
- `provider_query_policy.max_results_range_days`
- `provider_coverage_inventory.dataset_tier`
- `provider_coverage_inventory.region`
- `provider_coverage_inventory.year`
- `provider_coverage_inventory.result_count`

Model ideas:
- Add `provider_reliability_weight` to feature-lineage confidence so unstable auxiliary feeds are downweighted in production scoring.
- Add a `provider_schema_change_risk` signal from incident/change logs to trigger automatic challenger-only mode for affected features.

Execution lessons:
- Treat The Racing API as research/augmentation input unless reliability and legal-rights evidence is elevated to `A`.
- Snapshot status and coverage inventories on schedule and block silent schema/range-default changes from contaminating training windows.

Contradiction noted:
- Prior simplification: provider capability pages were sufficient for feed ranking. Operational status/change telemetry adds a separate reliability dimension.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new evidence in this pass remains strongest in exchange display/microstructure controls and provider-operational telemetry.

## Source notes (incremental additions for pass 13)

- Betfair support: website vs API price differences (`virtualise`, logged-out delay, stake rollup controls): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Oxford Handbook chapter: Betfair exchange overround microstructure evidence (2,184 UK races, 2008-2010): https://academic.oup.com/edited-volume/36333/chapter/318722302
- The Racing API status page (component uptime + incident history): https://status.theracingapi.com/
- The Racing API previous incidents page: https://status.theracingapi.com/incidents
- The Racing API data coverage inventory page: https://www.theracingapi.com/data-coverage

## Incremental sourced findings added in this run (2026-03-29, pass 14)

### Betfair transaction-charge economics create a second execution-cost surface beyond commission and API limits

- [A] Betfair Charges terms state transaction charges can apply when qualifying transactions exceed 5,000 in any hour, and charges are computed by transaction type before offsetting against daily commission generated.
- [A] The same terms define qualifying transactions to include placed bets and failed transactions; successful cancellations do not add an extra transaction, while failed cancellations do.
- [A] Betfair also states related accounts (same person/entity, API subscription, or master/sub account structures) are treated as one customer for transaction-charge purposes.
- [A] Betfair Developer support (2025-08-20) aligns with this definition and points directly to the charges framework for transaction accounting.

Extracted data fields to add:
- `betfair_txn_hour.hour_start_ts`
- `betfair_txn_hour.qualifying_txn_count`
- `betfair_txn_hour.placed_bet_count`
- `betfair_txn_hour.failed_txn_count`
- `betfair_txn_hour.failed_cancel_count`
- `betfair_txn_hour.duplicate_txn_count`
- `betfair_txn_hour.market_making_putup_qualifying_count`
- `betfair_txn_hour.estimated_txn_charge_gbp`
- `betfair_txn_day.commission_generated_gbp`
- `betfair_txn_day.net_txn_charge_gbp`
- `betfair_account_group.group_id`
- `betfair_account_group.charge_aggregation_scope(master_sub|api_subscription|entity)`

Model ideas:
- Add a `txn_charge_penalty` term to expected value so high-churn quoting/cancel behavior is penalized before order submission.
- Train a transaction-intensity policy that shifts from quote-replace loops to coarser updates as the hourly transaction budget approaches charge-trigger zones.

Execution lessons:
- Optimize not just for instruction-rate limits but also for monetary transaction costs under high-frequency behavior.
- Track failed-cancel and duplicate-error rates as direct cost drivers, not only reliability metrics.

Contradiction noted:
- Prior simplification: exchange frictions were mostly commission, overround, and API throttle failures. Betfair terms add explicit transaction-cost penalties tied to behavior intensity.

### NSW 2025-26 race-field conditions introduce fee-shape and group-threshold mechanics that must be encoded pre-trade

- [A] Racing NSW 2025-26 standard conditions specify differentiated fee rates by meeting class and bet type, including separate higher rates for Totalizator Derived Odds turnover.
- [A] The same conditions define a group-level exempt turnover threshold allocation: related operators share a single threshold rather than each receiving independent threshold benefits.
- [A] Threshold allocation order is explicitly specified across turnover categories (standard, premium, TDO, premier, etc.), so fee estimation depends on category ordering, not only totals.

Extracted data fields to add:
- `nsw_fee_schedule.effective_from`
- `nsw_fee_schedule.meeting_class(standard|premium|premier)`
- `nsw_fee_schedule.bet_channel(totalizator_derived_odds|other)`
- `nsw_fee_schedule.fee_rate_pct`
- `nsw_exempt_threshold.group_id`
- `nsw_exempt_threshold.financial_year_threshold_aud`
- `nsw_exempt_threshold.allocated_amount_aud`
- `nsw_exempt_threshold.allocation_order_rank`
- `nsw_group_relationship.relationship_basis`
- `nsw_turnover_bucket.net_assessable_turnover_aud`

Model ideas:
- Add a jurisdictional `effective_take_rate` feature that uses meeting-class and TDO composition, not a flat fee proxy.
- Add group-structure sensitivity tests so simulated profitability is robust to shared-threshold allocation changes.

Execution lessons:
- Fee simulation for NSW must run on category-level turnover buckets with ordering semantics, not a single blended percentage.
- Related-entity structure affects cost base directly; entitlement/compliance identity modeling is part of alpha preservation.

Contradiction noted:
- Prior simplification: race-field charges were often modeled as a flat jurisdiction fee. NSW conditions require class- and product-specific fee algebra with group-level threshold sharing.

### Racing Victoria standard conditions add explicit supplier-whitelist and real-time integrity-data obligations

- [A] RV standard conditions define "Approved Supplier" explicitly as Racing Australia, Australian Associated Press, or Live Datacast.
- [A] The same conditions include a real-time information-access mechanism (clause 5.3) where RV may request real-time access to integrity-relevant information once technical/procedural safeguards are in place.
- [A] Clause 5.3 also requires good-faith cooperation and contemplates customer-consent/privacy-policy updates to enable compliant sharing, plus Data Sharing Agreement pathways with Sports Integrity Entities.

Extracted data fields to add:
- `rv_supplier_whitelist.supplier_name`
- `rv_supplier_whitelist.acn`
- `rv_supplier_whitelist.effective_from`
- `rv_integrity_access_request.request_id`
- `rv_integrity_access_request.requested_scope(real_time|ongoing|ad_hoc)`
- `rv_integrity_access_request.safeguards_confirmed_flag`
- `rv_integrity_access_request.privacy_update_required_flag`
- `rv_integrity_access_request.data_sharing_agreement_required_flag`
- `rv_integrity_access_request.response_sla`
- `rv_integrity_data_feed.access_mode(push|pull|portal)`

Model ideas:
- Add a compliance-latency feature capturing delay between integrity request issuance and data-feed readiness; use it to downweight markets with unresolved integrity-feed obligations.
- Add supplier-lineage confidence features that score whether each upstream feed is on the explicit approved-supplier list.

Execution lessons:
- Provider onboarding in VIC should include supplier-whitelist validation before data is admitted to production feature stores.
- Real-time integrity sharing obligations imply event-driven data export plumbing and privacy-governance hooks, not just periodic reporting files.

Contradiction noted:
- Prior simplification: provider entitlement checks were mostly commercial/API-tier checks. RV conditions add explicit upstream-supplier restrictions and real-time integrity-sharing duties.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new signal this pass is strongest in exchange cost microstructure and AU race-field policy mechanics (NSW/VIC), rather than syndicate self-disclosure.

## Source notes (incremental additions for pass 14)

- Betfair charges terms (transaction charge mechanics, thresholds, offsets, account aggregation): https://www.betfair.com/aboutUs/Betfair.Charges/
- Betfair Developer support: transaction-charge counting FAQ (updated 2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/20029343399836-Transaction-Charge-how-are-transactions-counted
- Racing NSW Standard Conditions (effective 1 July 2025; fee schedules, threshold allocation mechanics): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Marked-Up-Version-Effective-1-July-2025.pdf
- Racing Victoria Race Fields Policy page (effective-date links and policy surface): https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria Standard Conditions (effective 1 March 2025; approved suppliers and integrity data-sharing clauses): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f

## Incremental sourced findings added in this run (2026-03-29, pass 16)

### Betfair `RUNNER_METADATA` adds a high-signal structured form layer, but with entitlement-gated coverage and reserve-runner caveats

- [A] Betfair `listMarketCatalogue` includes horse-racing `RUNNER_METADATA` fields such as `DAYS_SINCE_LAST_RUN`, `STALL_DRAW`, `TRAINER_NAME`, `OFFICIAL_RATING`, `FORM`, and `JOCKEY_CLAIM`, with schema-level definitions in the API docs.
- [A] The same source states `ADJUSTED_RATING` is available only with a Premium Timeform subscription, meaning this field has entitlement-driven missingness by account tier.
- [A] The same source notes `JOCKEY_NAME` may be `Reserve` for reserve runners, and reserve runners are later withdrawn if not confirmed to run.

Extracted data fields to add:
- `betfair_runner_metadata.capture_ts`
- `betfair_runner_metadata.market_id`
- `betfair_runner_metadata.selection_id`
- `betfair_runner_metadata.days_since_last_run`
- `betfair_runner_metadata.stall_draw`
- `betfair_runner_metadata.official_rating`
- `betfair_runner_metadata.form_string`
- `betfair_runner_metadata.jockey_claim`
- `betfair_runner_metadata.adjusted_rating`
- `betfair_runner_metadata.adjusted_rating_entitled_flag`
- `betfair_runner_metadata.reserve_label_flag`
- `betfair_runner_metadata.source_revision_ts`

Model ideas:
- Add an entitlement-aware missingness feature (`adjusted_rating_entitled_flag`) so model behavior differs between unavailable-by-rights vs truly unknown values.
- Add reserve-runner transition features to avoid pre-off contamination from temporary `Reserve` entries.

Execution lessons:
- Snapshot runner metadata with timestamps and key tier context; do not assume static availability across environments/accounts.
- Treat reserve-runner markers as state transitions and purge unconfirmed reserve rows before pre-off inference windows.

Contradiction noted:
- Prior simplification: runner-form inputs were mostly external-provider fields. Betfair native metadata now supports a deeper in-house form layer with explicit entitlement caveats.

### ACCC 2025 Tabcorp-RWWA authorisation adds expiry-bound pool-linkage regime risk to tote microstructure assumptions

- [A] ACCC (15 January 2025) granted authorisation for Tabcorp VIC Pty Ltd to extend the RWWA participation agreement in the SuperTAB totalisator pool.
- [A] The same ACCC update states authorisation was granted for two years, creating an explicit regulatory expiry window for that linkage.
- [A] The same notice records Tabcorp's Victorian Wagering and Betting Licence start date (16 August 2024) with a 20-year term, highlighting multi-layered policy horizons.

Extracted data fields to add:
- `pool_linkage_authorisation.authority`
- `pool_linkage_authorisation.parties`
- `pool_linkage_authorisation.pool_name`
- `pool_linkage_authorisation.granted_date`
- `pool_linkage_authorisation.expiry_date`
- `pool_linkage_authorisation.term_years`
- `pool_linkage_authorisation.reference_register_url`
- `operator_licence_profile.licence_start_date`
- `operator_licence_profile.licence_term_years`
- `operator_licence_profile.jurisdiction`

Model ideas:
- Add a `pool_linkage_regime_risk` factor so tote liquidity-transfer assumptions decay as authorisation expiry approaches.
- Segment tote-to-exchange transferability tests by linkage-regime window (`pre-expiry`, `post-renewal`, `uncertain`).

Execution lessons:
- Policy/authorisation expiry dates should be first-class scheduling inputs for retraining, stress tests, and routing rules.
- Do not extrapolate pooled-liquidity behavior across periods without explicit authorisation-validity checks.

Contradiction noted:
- Prior simplification: inter-pool connectivity was treated as stable context. ACCC authorisation windows make some connectivity assumptions explicitly time-bounded.

### Racing Australia monthly service reports reveal operational variance hidden by annual aggregates

- [A] Racing Australia's monthly Service Standard Performance Report (April 2025) publishes system-level uptime and process-timeliness KPIs at monthly cadence.
- [A] In that report, Racing Australia website uptime is shown below target (99.75% actual vs 99.90% target), while core national systems remain at 100%.
- [A] The same report shows operational-timeliness misses in racing-material release metrics for the month (for example nominations and final scratchings below 98% targets).

Extracted data fields to add:
- `ra_monthly_service_kpi.report_month`
- `ra_monthly_service_kpi.metric_name`
- `ra_monthly_service_kpi.target_value`
- `ra_monthly_service_kpi.actual_value`
- `ra_monthly_service_kpi.variation_value`
- `ra_monthly_service_kpi.traffic_light_status`
- `ra_monthly_service_kpi.system_or_service`
- `ra_monthly_service_kpi.source_pdf_url`
- `ra_monthly_uptime.unplanned_downtime_minutes`
- `ra_monthly_release_timeliness.process_name`

Model ideas:
- Add a monthly `provider_operational_volatility` score from KPI deltas rather than relying on annual averages.
- Downweight features with upstream dependencies when monthly release-timeliness KPIs fall below target thresholds.

Execution lessons:
- Provider reliability gating should ingest monthly RA KPI artifacts, not just annual summary reports.
- Use monthly KPI regressions to trigger conservative execution mode for data-latency-sensitive strategies.

Contradiction noted:
- Prior simplification: annual RA service summaries were adequate for provider reliability priors. Monthly reports show material within-year variance that can affect live quality.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new evidence in this pass is strongest in Betfair metadata-surface detail and AU regulatory/operational provider telemetry.

## Source notes (incremental additions for pass 16)

- Betfair `listMarketCatalogue` (`RUNNER_METADATA` schema, horse-racing metadata semantics): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687517/listMarketCatalogue
- ACCC media update (Tabcorp-RWWA SuperTAB authorisation, 15 Jan 2025): https://www.accc.gov.au/about-us/news/media-updates/accc-grants-authorisation-for-tabcorp-and-racing-and-wagering-western-australia-to-extend-agreement
- Racing Australia Monthly Service Standard Performance Report (April 2025): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-April-2025.pdf

## Incremental sourced findings added in this run (2026-03-29, pass 17)

### Betfair currency-parameter constraints create account-currency microstructure floors that must be modeled before stake sizing

- [A] Betfair Additional Information publishes per-currency `Minimum Bet Size`, `Minimum BSP Liability`, and `Minimum Bet Payout`; for Australian Dollar accounts the listed values are 5, 10, and 5 respectively.
- [A] The same source ties these constraints to order validity alongside exchange price-ladder rules, so sub-floor staking can fail even when price and market-state logic are otherwise correct.

Extracted data fields to add:
- `betfair_currency_profile.currency_code`
- `betfair_currency_profile.min_bet_size`
- `betfair_currency_profile.min_bsp_liability`
- `betfair_currency_profile.min_bet_payout`
- `order_validation.currency_floor_breach_flag`
- `order_validation.floor_type(min_stake|min_liability|min_payout)`
- `order_validation.adjusted_stake_for_floor`
- `order_validation.floor_source_revision_ts`

Model ideas:
- Add a `currency_floor_pressure` feature to flag candidate orders that are alpha-positive but operationally invalid at target stake granularity.
- Add account-currency-aware minimum-stake transforms before portfolio optimization so strategy comparisons are not biased by hidden floor breaches.

Execution lessons:
- Pre-trade validators must enforce currency floors before queueing orders; this is a deterministic reject path, not a probabilistic fill-risk path.
- Backtests and paper execution should apply the same currency floor map to avoid overstating realizable edge at small stakes.

Contradiction noted:
- Prior simplification: order validity was mostly price-ladder and request-limit constrained. Betfair currency parameters add hard stake/liability/payout floors by account currency.

### Racing Victoria 2025/26 guide adds machine-actionable daily/ledger deadlines and multi-leg allocation mechanics

- [A] RV's 2025/26 guide specifies Daily Files must be submitted by 9am on the following day with a fixed naming convention (`WSPxxxxx_DDMMYYYY.csv`).
- [A] The same guide specifies Daily Ledger Files for designated approved WSPs by 9am on the following day (`WSPxxxxx_LEDGER_DDMMYYYY.csv`).
- [A] The guide formalizes eligible-portion calculations for multi-event/multi-leg bets (including nominated EPWMB method selection fixed for the approval period once notified).

Extracted data fields to add:
- `rv_submission_deadline.file_type(daily|daily_ledger|monthly)`
- `rv_submission_deadline.cutoff_local_time`
- `rv_submission_file.naming_template`
- `rv_submission_file.designated_wsp_required_flag`
- `rv_multi_leg_policy.ep_method(option_a|option_b)`
- `rv_multi_leg_policy.method_locked_for_period_flag`
- `rv_multi_leg_allocation.eligible_portion_amount_aud`
- `rv_multi_leg_allocation.relevant_victorian_race_flag`
- `rv_submission_audit.submitted_ts`
- `rv_submission_audit.sla_breach_flag`

Model ideas:
- Add a `reporting_sla_risk` feature based on lateness and file-type criticality to gate data-provider trust during compliance-sensitive windows.
- Add multi-leg allocation-consistency checks so turnover/cost labels align with chosen EPWMB method across the full approval period.

Execution lessons:
- Treat submission timing and naming conventions as schema-level contracts and hard-validate before ETL acceptance.
- Persist EPWMB method nomination state as immutable per approval period to prevent silent historical restatement errors.

Contradiction noted:
- Prior simplification: RV obligations were mostly static entitlement/commercial terms. The guide adds operationally strict deadline/file-shape and allocation-method controls.

### NSW prohibited-bet taxonomy should be encoded as pre-trade product guardrails, not only legal documentation

- [A] Racing NSW's prohibited-bet-types schedule under standard conditions explicitly disallows products including margin betting, race-time betting, spread betting, and "horse to lose" style bets on NSW thoroughbred races.
- [A] The same schedule includes conditionally permitted products (for example head-to-head, favourite-out, and challenge markets) with explicit rule qualifiers that must be satisfied for approval.

Extracted data fields to add:
- `nsw_bet_type_policy.bet_type_name`
- `nsw_bet_type_policy.approval_status(prohibited|conditional|approved)`
- `nsw_bet_type_policy.qualifier_text`
- `nsw_bet_type_policy.effective_document_url`
- `product_catalogue.nsw_eligibility_flag`
- `order_intent.policy_block_reason`
- `order_intent.policy_override_ticket_id`
- `compliance_rejection.count_by_bet_type`

Model ideas:
- Add a product-eligibility prior that excludes structurally prohibited bet constructs before value modeling.
- Train separate expected-value models for conditionally approved exotic/challenge markets where qualifier rules alter settlement eligibility.

Execution lessons:
- Route construction must include an NSW bet-type policy gate before pricing/execution; post-trade checks are too late for prohibited products.
- Keep qualifier-specific rule templates versioned with effective documents so bet construction logic and compliance logic stay synchronized.

Contradiction noted:
- Prior simplification: NSW controls were mainly fee/threshold economics. NSW also has explicit bet-type eligibility taxonomy that directly constrains product design.

### Racing Australia December 2025 monthly KPI artifact provides new operational priors for release quality and uptime variance

- [A] Racing Australia's December 2025 monthly service report shows RA website uptime affected by unplanned downtime minutes while core national systems remained at 100% availability for the month.
- [A] The same report records final scratchings release timeliness above target in that month (both non-emergency and emergency scenarios shown above the 98% standard), illustrating meaningful month-to-month operational movement.

Extracted data fields to add:
- `ra_monthly_service_kpi.report_month`
- `ra_monthly_service_kpi.metric_name`
- `ra_monthly_service_kpi.target_pct`
- `ra_monthly_service_kpi.actual_pct`
- `ra_monthly_service_kpi.variation_pct`
- `ra_monthly_system_uptime.system_name`
- `ra_monthly_system_uptime.unplanned_downtime_minutes`
- `ra_monthly_release_kpi.process_name`
- `ra_monthly_release_kpi.emergency_context_flag`
- `ra_monthly_release_kpi.actual_vs_target_delta_pct`

Model ideas:
- Add a `monthly_release_reliability` covariate derived from scratchings/nominations timeliness deltas to weight late-market features.
- Add system-specific uptime priors (website vs core systems) instead of a single provider-wide reliability scalar.

Execution lessons:
- Monthly KPI ingestion should preserve per-system granularity; aggregate provider uptime can hide operational asymmetry.
- Reliability gating should use rolling monthly evidence and not assume stationarity from a single report month.

Contradiction noted:
- Prior simplification: monthly operational artifacts mostly reinforced annual averages. December 2025 data shows system-level asymmetry and process-level improvement can co-exist.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] This pass adds strongest net-new signal in Betfair execution constraints and Australian policy/reporting microstructure, rather than syndicate self-disclosure.

## Source notes (incremental additions for pass 17)

- Betfair Additional Information (currency parameters, minimum stake/liability/payout by currency): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2691053/Additional+Information
- Racing Victoria Guide to the Provision of Information 2025/26 (daily/ledger file conventions, submission deadlines, multi-leg allocation methods): https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf?v=09a420bf
- Racing NSW prohibited/conditional bet-type schedule (standard conditions reference): https://www.racingnsw.com.au/wp-content/uploads/BET-TYPES-NOT-PERMITTED-ON-NSW-THOROUGHBRED-AS-PER-RACING-NSW-RACE-FIELDS-STANDARD-CONDITIONS.pdf
- Racing Australia Monthly Service Standard Performance Report (December 2025): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-December-2025.pdf

## Incremental sourced findings added in this run (2026-03-29, pass 18)

### Betfair Stream `MarketDefinition` semantics add version-aware dedup and per-market commission context

- [A] Betfair Exchange Stream API documents `MarketDefinition.version` as a change indicator and notes that when markets are moved under a new `eventId`, initial images may contain duplicate copies; clients should keep only the higher-version market record.
- [A] The same source documents additional market-level fields that are directly useful in execution simulation and expected-value normalization, including `marketBaseRate` (market commission rate), `regulators`, `suspendTime`, `crossMatching`, and `bspReconciled`.
- [A] Betfair's known-issues section also flags settlement-phase notifications with traded volumes at zero across prices as a storage-transition artifact, not a true liquidity event.

Extracted data fields to add:
- `betfair_market_definition_snapshot.capture_ts`
- `betfair_market_definition_snapshot.market_id`
- `betfair_market_definition_snapshot.event_id`
- `betfair_market_definition_snapshot.version`
- `betfair_market_definition_snapshot.market_base_rate`
- `betfair_market_definition_snapshot.regulators`
- `betfair_market_definition_snapshot.suspend_time`
- `betfair_market_definition_snapshot.cross_matching_flag`
- `betfair_market_definition_snapshot.bsp_reconciled_flag`
- `betfair_market_definition_snapshot.known_issue_duplicate_event_flag`
- `betfair_market_definition_snapshot.zero_traded_volume_artifact_flag`
- `betfair_market_definition_snapshot.source_revision_ts`

Model ideas:
- Add a `market_version_churn` feature to downweight stale snapshots when version-change intensity spikes near jump.
- Normalize expected value by `marketBaseRate` at market granularity rather than account-wide commission assumptions.

Execution lessons:
- Stream cache materialization should be version-aware and deduplicate moved markets by keeping the highest `version` image.
- Settlement-transition artifacts (`trd` all zero) should be filtered from liquidity/fill training labels.

Contradiction noted:
- Prior simplification: `marketId` was effectively unique and stable in stream bootstrap images. Betfair known-issue guidance shows temporary dual-copy states when event migration occurs.

### ACCC authorisation register adds machine-actionable interim and expiry windows for SuperTAB linkage

- [A] ACCC's Tabcorp VIC authorisation register entry states the current SuperTAB-RWWA authorisation application (AA1000676-1) was lodged on 17 July 2024, interim authorisation granted on 14 August 2024, final determination granted on 15 January 2025, and authorisation end date set to 15 August 2026.
- [A] The same register page ties this sequence to prior authorisation cycles and explicitly records a status-quo continuity mechanism via interim authorisation between licence/authorisation windows.

Extracted data fields to add:
- `pool_linkage_authorisation.register_id`
- `pool_linkage_authorisation.application_lodged_date`
- `pool_linkage_authorisation.interim_authorisation_date`
- `pool_linkage_authorisation.final_determination_date`
- `pool_linkage_authorisation.authorisation_end_date`
- `pool_linkage_authorisation.status_quo_continuity_flag`
- `pool_linkage_authorisation.prior_cycle_reference_ids`
- `pool_linkage_authorisation.public_register_url`
- `pool_linkage_authorisation.window_state(pre_interim|interim|final|expired)`

Model ideas:
- Add an `authorisation_window_state` regime feature so tote-linkage transfer assumptions are conditioned on interim vs final windows.
- Add an `expiry_proximity_days` hazard feature to stress-test turnover/liquidity assumptions as the 15 August 2026 boundary approaches.

Execution lessons:
- Compliance and routing logic should track interim and final windows separately; both are operationally relevant states.
- Backtests should replay linkage state by exact register timeline dates, not only coarse annual policy versions.

Contradiction noted:
- Prior simplification: linkage was represented as a single two-year authorisation block. Register-level evidence shows a multi-stage timeline with explicit interim continuity.

### Racing Australia publication index and January 2026 report show stronger month-to-month reliability drift than December-only views

- [A] Racing Australia's Monthly Service Standard Performance Report index now lists January 2026 (alongside July-December 2025) under the 2025-2026 cycle, which provides a direct publication-lag and coverage signal for provider-health monitoring.
- [A] In the January 2026 report, Racing Materials `Nominations` timeliness is 90.80% vs 98% target (delta -7.20%), while `Riders`, `Acceptances`, and both `Final Scratchings` measures remain above target.
- [A] The same January 2026 report records Racing Australia website uptime at 99.98% with 9 minutes unplanned downtime for the month while core national systems remained at 100%.
- [A] November 2025 report context shows nominations at 95.95% (delta -2.05%), reinforcing that nominations timeliness variance is not a one-off December artifact.

Extracted data fields to add:
- `ra_report_index.capture_ts`
- `ra_report_index.financial_year_label`
- `ra_report_index.report_month_label`
- `ra_report_index.report_url`
- `ra_report_index.latest_month_published`
- `ra_report_index.publication_gap_months`
- `ra_monthly_process_kpi.report_month`
- `ra_monthly_process_kpi.process_name`
- `ra_monthly_process_kpi.target_pct`
- `ra_monthly_process_kpi.actual_pct`
- `ra_monthly_process_kpi.delta_pct`
- `ra_monthly_system_uptime.unplanned_downtime_minutes`

Model ideas:
- Add a `nominations_release_risk` feature from rolling timeliness deltas to gate pre-scratchings feature trust.
- Add a `publication_lag_state` feature for provider freshness confidence when monthly artifacts are delayed.

Execution lessons:
- Provider-health gates should separate process-level reliability (nominations/scratchings timeliness) from system uptime metrics.
- Monthly report-index scraping should be first-class telemetry; missing publication itself is an operational signal.

Contradiction noted:
- Prior simplification: December 2025 report represented near-term stability. January 2026 shows materially worse nominations timeliness despite otherwise strong system uptime.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new high-signal evidence this pass is in exchange microstructure implementation detail and AU provider/regulatory timeline instrumentation.

## Source notes (incremental additions for pass 18)

- Betfair Exchange Stream API (`MarketDefinition` fields, `version`, known issues): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange+Stream+API
- ACCC public register (Tabcorp VIC Pty Ltd, AA1000676-1 timeline and dates): https://www.accc.gov.au/public-registers/authorisations-and-notifications-registers/authorisations-register/tabcorp-vic-pty-ltd
- Racing Australia monthly performance report index (2025-2026 month availability): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx
- Racing Australia Monthly Service Standard Performance Report (January 2026): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-January-2026.pdf
- Racing Australia Monthly Service Standard Performance Report (November 2025): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-November-2025.pdf

## Incremental sourced findings added in this run (2026-03-29, pass 19)

### Betfair stream has a documented blind spot for runner-removal voids and no deterministic OCM-to-MCM join key

- [A] Betfair support states an explicit limitation: when a runner is removed, matched/unmatched bet void/lapse transitions for that runner are not reflected through the Order Stream; the transition occurs at settlement and "the Order Stream never gets to see this transition".
- [A] Betfair support also states Order Change Messages (OCM) and Market Change Messages (MCM) are produced by two independent systems; there is no guaranteed ordering and no matching parameter to join OCM and MCM 1:1.
- Why this matters: stream-only ledgers can silently miss exposure transitions around removals and can mis-attribute causality if OCM/MCM are treated as strictly ordered.

Extracted data fields to add:
- `stream_order_blind_spot.runner_removal_void_visibility_flag`
- `stream_order_blind_spot.requires_settlement_reconciliation_flag`
- `stream_join_quality.ocm_mcm_order_guaranteed_flag`
- `stream_join_quality.ocm_mcm_match_key_available_flag`
- `stream_join_quality.reconciliation_strategy_id`
- `order_state.reconciliation_source(stream|listCurrentOrders|listClearedOrders)`
- `order_state.reconciliation_lag_ms`
- `order_state.runner_removal_event_flag`

Model ideas:
- Add a `reconciliation_confidence` feature to execution-quality models so slippage/fill labels are downweighted when state depends on post-hoc settlement reconciliation.
- Train a `causal_join_uncertainty` indicator around runner removals and suspend high-frequency policy learning in those windows.

Execution lessons:
- Treat stream as low-latency signal transport, not complete order-state truth during runner-removal settlement paths.
- Use deterministic reconciliation jobs against order/cleared endpoints before committing final exposure/PnL state in backtest and live analytics.

Contradiction noted:
- Prior simplification: order + market streams provide causally ordered, complete transition truth. Betfair support explicitly documents missing runner-removal void transitions and no strict OCM/MCM ordering guarantee.

### Betfair delta-cache semantics (`size=0`, `img=true`) and virtual `Infinity` edge-case require parser-grade safeguards

- [A] Betfair support documents `size=0` as a remove operation for ladder entries in both depth-based and full-depth ladders.
- [A] The same guidance states runner-change payloads are delta-based; when `img=true`, cache consumers should replace the item, and unchanged nullable fields may be omitted.
- [A] Betfair support documents a known edge case where the virtualized stream can emit `Infinity` size values due to virtualization failure conditions.

Extracted data fields to add:
- `stream_delta_event.ladder_family(depth|full_depth)`
- `stream_delta_event.size_zero_remove_flag`
- `stream_delta_event.img_replace_flag`
- `stream_delta_event.missing_nullable_fields_count`
- `stream_delta_event.virtual_stream_flag`
- `stream_delta_event.infinity_size_flag`
- `stream_parser.recovery_action(drop|coerce|rebuild_cache)`
- `stream_parser.cache_rebuild_trigger_ts`

Model ideas:
- Add `parser_integrity_score` as a gating feature so model promotion excludes windows with cache rebuilds or `Infinity` events.
- Build separate quality priors for raw vs virtual ladders conditioned on parser anomaly rates.

Execution lessons:
- Enforce strict parser invariants for delta streams (`size=0` remove handling, `img=true` full-item replacement semantics).
- When `Infinity` events occur, quarantine affected virtual-ladder slices from execution-critical features until cache integrity is re-established.

Contradiction noted:
- Prior simplification: virtual/display ladders are just delayed versions of raw ladders. Betfair support documents distinct virtual-stream failure cases (`Infinity`) that require explicit resilience logic.

### Australian provider registry freshness is heterogeneous across jurisdictions and should be scored, not assumed

- [A] Racing NSW's approved-operator page says the list is "updated regularly", but the linked company/corporate approval file label remains "2020-21" and the published table includes "AS AT 1 JULY 2019".
- [A] Racing Victoria's approved WSP page presents operators as "currently approved" in a live webpage list (including exchange operators such as Betfair Pty Ltd).
- [A] Racing Australia's monthly performance index (as observed on 2026-03-29) lists January 2026 as latest for FY 2025-2026 and does not yet show a February 2026 report entry.
- [B] Inference: registry/report artifacts have materially different freshness profiles by source; entitlement and provider-health confidence should be source-scored rather than binary.

Extracted data fields to add:
- `provider_registry_snapshot.source_name`
- `provider_registry_snapshot.capture_ts`
- `provider_registry_snapshot.claimed_update_phrase`
- `provider_registry_snapshot.document_label`
- `provider_registry_snapshot.document_effective_date`
- `provider_registry_snapshot.freshness_age_days`
- `provider_registry_snapshot.freshness_confidence_score`
- `provider_registry_snapshot.validation_result(fresh|stale|ambiguous)`
- `provider_report_index.latest_period_published`
- `provider_report_index.missing_expected_period_flag`

Model ideas:
- Add a `source_freshness_confidence` covariate to compliance-sensitive feature gating and entitlement checks.
- Route provider-dependent strategies through a confidence-weighted policy layer (hard blocks for stale entitlement artifacts, soft downweights for lagged operational reports).

Execution lessons:
- Persist both claimed freshness metadata (page language) and observed artifact dates to detect stale-but-asserted-current registries.
- Escalate manual compliance review when registry confidence drops below threshold or when expected monthly publication cadence is broken.

Contradiction noted:
- Prior simplification: operator-approval lists are uniformly current across jurisdictions. Current sources show uneven freshness and lag behavior.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new high-signal evidence this pass is concentrated in Betfair stream microstructure limitations and AU provider-governance freshness instrumentation.

## Source notes (incremental additions for pass 19)

- Betfair support: How are void bets treated by the Stream API?: https://support.developer.betfair.com/hc/en-us/articles/360000391492-How-are-void-bets-treated-by-the-Stream-API
- Betfair support: How can I match OCM and MCM messages from the Stream API?: https://support.developer.betfair.com/hc/en-us/articles/360000391312-How-can-I-match-OCM-and-MCM-messages-from-the-Stream-API
- Betfair support: How to I handle runner changes with size = 0?: https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-to-I-handle-runner-changes-with-size-0
- Betfair support: Why am I receiving Infinity size from the Streaming API?: https://support.developer.betfair.com/hc/en-us/articles/360003061798-Why-am-I-receiving-Infinity-size-from-the-Streaming-API
- Racing NSW approved licensed wagering operators page: https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/
- Racing NSW linked company/corporate approval file (2020-21 label; table "AS AT 1 JULY 2019"): https://www.racingnsw.com.au/wp-content/uploads/Company-Bookmakers-2020-2021.pdf
- Racing Victoria approved wagering service providers page: https://www.racingvictoria.com.au/wagering/wagering-service-providers
- Racing Australia monthly performance index: https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental sourced findings added in this run (2026-03-29, pass 20)

### Betfair stream session lifecycle adds recoverability constraints that must be modeled explicitly

- [A] Betfair support reconnection guidance requires clients to persist the original subscription payload (same filters), continuously advance `initialClk`/`clk`, and re-send the same subscription on reconnect; successful replay returns `ct=RESUB_DELTA`, often with `img=true` replacement snapshots and `con=true` conflated payloads.
- [A] Betfair support states `con=true` can arise from three distinct causes: client socket-backlog (reader not draining fast enough), explicit `conflateMs > 0`, or slow publishing cycles.
- [A] A newer Betfair support article (updated 2026-03-03) states stream delivery order is sequenced by `clk`, and messages with earlier `pt` should not arrive after newer `pt`.

Extracted data fields to add:
- `stream_session_recovery_event.connection_id`
- `stream_session_recovery_event.subscription_fingerprint`
- `stream_session_recovery_event.reconnect_ts`
- `stream_session_recovery_event.initial_clk_before`
- `stream_session_recovery_event.clk_after`
- `stream_session_recovery_event.resub_delta_received_flag`
- `stream_session_recovery_event.resub_delta_latency_ms`
- `stream_message_quality.con_flag`
- `stream_message_quality.con_reason(client_backpressure|client_conflate_ms|publisher_cycle)`
- `stream_message_quality.pt_monotonicity_violation_flag`
- `stream_message_quality.sequence_anchor(clk|pt)`

Model ideas:
- Add a `session_recovery_state` feature to execution models so fills/latency labels are downweighted during `RESUB_DELTA` windows.
- Add a `conflation_cause_mix` feature to separate endogenous feed pressure (publisher) from local consumer lag (client backpressure).

Execution lessons:
- Reconnect logic should be stateful and deterministic: persist subscription fingerprints and advance `clk` as first-class state.
- `con=true` should be treated as a quality/regime signal, not only a transport artifact, because causes have different operational implications.

Contradiction noted:
- Apparent conflict with pass-19 ordering notes: Betfair now documents ordered delivery by `clk`/`pt` inside a stream channel, while pass-19's OCM-vs-MCM warning still holds for cross-channel causal joining.

### Betfair subscription-scope behavior creates explicit market-cardinality and cache-lag risk

- [A] Betfair support states subscribing without a `marketFilter` causes all new markets available to the App Key to be published at activation, with an `img=true` snapshot on activation.
- [A] Betfair support states subscription-limit validation occurs at subscribe time (`SUBSCRIPTION_LIMIT_EXCEEDED` on breach), and closed-market exclusion is not immediate: internal eviction runs every 5 minutes and markets are marked for deletion after ~1 hour closed.
- Why this matters: market-universe scope and closed-market cache lag can create avoidable subscription limit incidents and replay skew unless controlled.

Extracted data fields to add:
- `stream_subscription_scope.scope_type(filtered|unfiltered)`
- `stream_subscription_scope.market_filter_hash`
- `stream_subscription_scope.market_activation_img_flag`
- `stream_subscription_scope.subscription_limit_exceeded_flag`
- `stream_subscription_scope.market_count_at_subscribe`
- `stream_closed_market_cache.market_id`
- `stream_closed_market_cache.closed_ts`
- `stream_closed_market_cache.eviction_job_interval_minutes`
- `stream_closed_market_cache.marked_for_deletion_after_minutes`
- `stream_closed_market_cache.removed_from_limit_count_ts`

Model ideas:
- Add a `market_universe_pressure_score` feature to capture feed-state inflation risk when broad/unfiltered subscriptions are used.
- Add a `closed_cache_lag_minutes` feature to suppress false capacity alarms in market-loader autoscaling.

Execution lessons:
- Never run production subscriptions without explicit market filters unless capacity modeling and throttles are in place.
- Subscription-limit alerts should include projected closed-market decay timing (5-minute sweeps, ~1-hour deletion horizon).

Contradiction noted:
- Prior simplification: closed markets effectively disappear from subscription accounting on close. Betfair documents scheduled eviction and delayed deletion semantics.

### Australian provider telemetry: The Racing API exposes component-level reliability gradients and unscheduled-change signals

- [A] The Racing API status page (captured 2026-03-29 run) reports all services online with differing 90-day component uptime: API `100%`, Website `99.767%`, Racecards `99.888%`, Results `99.986%`.
- [A] The same status page records February 2026 incident/change markers, including a brief regional add-on endpoint issue and a Results endpoint parameter note (`start_date`/`end_date` change marker).
- [A] The maintenance page for March-May 2026 shows no scheduled maintenance windows.

Extracted data fields to add:
- `provider_component_uptime_snapshot.provider_name`
- `provider_component_uptime_snapshot.capture_ts`
- `provider_component_uptime_snapshot.component_name`
- `provider_component_uptime_snapshot.uptime_90d_pct`
- `provider_component_uptime_snapshot.status_state`
- `provider_incident_marker.event_date`
- `provider_incident_marker.component_name`
- `provider_incident_marker.event_summary`
- `provider_incident_marker.change_type(incident|parameter_change|degradation)`
- `provider_maintenance_window.month_label`
- `provider_maintenance_window.scheduled_flag`

Model ideas:
- Add `component_specific_provider_confidence` so racecard-dependent features and results-dependent settlement jobs are independently gated.
- Add `provider_change_marker_proximity` feature to reduce trust immediately around parameter-change incidents.

Execution lessons:
- Availability should be scored at component granularity, not provider-wide binary health.
- Absence of scheduled maintenance does not imply change absence; incident markers still require schema/regression guards.

Contradiction noted:
- Prior simplification: provider health can be represented by one aggregate uptime scalar. Current source indicates meaningful component-level divergence.

### NYRA CAW policy timeline check: official headline stream supports event-window controls

- [A] NYRA's Jan 30, 2026 post defines CAW as wagering activity above six bets per second and states a Feb 5, 2026 one-minute-to-post cutoff expansion for pools not already restricted.
- [A] NYRA's official Aqueduct headlines page (captured in this run) shows the Jan 30 CAW guardrail item and contemporaneous weather/schedule disruption items around Feb 5-7 and Feb 11 race resumption windows.
- [B] Inference: CAW-effect studies around early February 2026 need confound controls for cancellation/schedule shifts, not only policy flags.

Extracted data fields to add:
- `caw_policy_timeline.policy_announcement_date`
- `caw_policy_timeline.effective_date`
- `caw_policy_timeline.caw_speed_threshold_bets_per_second`
- `caw_policy_timeline.cutoff_seconds_to_post`
- `track_schedule_disruption_event.track`
- `track_schedule_disruption_event.event_date`
- `track_schedule_disruption_event.event_type(cancelled|resumed|rescheduled)`
- `track_schedule_disruption_event.source_headline_url`

Model ideas:
- Add `policy_x_schedule_interaction` features to separate odds-volatility effects from weather-driven field/turnover shifts.
- Use `effective_policy_minutes_to_post` as a regime covariate in tote-odds trajectory models.

Execution lessons:
- CAW policy backtests should include official schedule-disruption overlays for event-window validity.
- Store policy and operational-timeline events in the same state machine used for regime-aware replay.

Contradiction noted:
- Prior simplification: early-February NYRA windows were treated as pure policy shocks. Official headline chronology indicates material concurrent scheduling disruptions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's documented internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new high-signal evidence this pass is concentrated in Betfair stream state-management semantics and provider-operations/policy timeline instrumentation.

## Source notes (incremental additions for pass 20)

- Betfair support: Market Streaming - how do I managed re-connections?: https://support.developer.betfair.com/hc/en-us/articles/360000391612-Market-Streaming-how-do-I-managed-re-connections
- Betfair support: Why am I receiving "con= true" messages via the Stream API?: https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-con-true-messages-via-the-Stream-API
- Betfair support: Are Stream API messages guaranteed to be delivered in strict sequential order according to pt?: https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- Betfair support: What happens if you subscribe to the Stream API without a market filter?: https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair support: Are closed markets auto-removed from the Stream API subscription?: https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair support: Does the Stream API allow Web Socket connections?: https://support.developer.betfair.com/hc/en-us/articles/12937897844252-Does-the-Stream-API-allow-Web-Socket-connections
- NYRA official news: NYRA to implement new guardrails for CAW activity (Jan 30, 2026): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- NYRA official Aqueduct headlines stream (timeline context): https://www.nyra.com/aqueduct/news/headlines/
- The Racing API status page: https://status.theracingapi.com/
- The Racing API maintenance page: https://status.theracingapi.com/maintenance
- ACCC Draft Determination AA1000676 (arrangement-change coverage boundaries): https://www.accc.gov.au/system/files/public-registers/documents/Draft%20Determination%20-%2019.12.24%20-%20PR%20-%20AA1000676%20TabCorp.pdf

## Incremental sourced findings added in this run (2026-03-29, pass 21)

### Betfair Historical Data has replay-critical constraints that differ from live stream assumptions

- [A] Betfair Historical Data API request throughput is capped at 100 requests per 10 seconds, including failed requests; breaches return HTTP 429.
- [A] Betfair support states historical market files are published only after all markets in an event are settled, with expected publication up to around 5 days after event completion.
- [A] Betfair support documents that Historical Data does not include `competitionId`/competition names, and explicitly notes horse and greyhound racing do not have competition names in this context.
- [A] Betfair PRO historical-data guidance defines traded volume semantics that differ from naive assumptions: `trd` values are cumulative by price level, runner `tv` is a derived cumulative figure, `tv` reflects backer stake x2, and traded-volume adjustments can move down due to FX-related corrections.

Extracted data fields to add:
- `historical_api.rate_limit_requests_per_10s`
- `historical_api.http_429_count`
- `historical_file.event_settled_ts`
- `historical_file.publish_ts`
- `historical_file.publish_lag_days`
- `historical_market.competition_id_present_flag`
- `historical_market.competition_name_present_flag`
- `historical_runner.trd_price_level_cumulative_flag`
- `historical_runner.tv_definition(backers_stake_x2)`
- `historical_runner.tv_negative_delta_flag`
- `historical_runner.fx_adjustment_inferred_flag`

Model ideas:
- Add `historical_publish_lag_days` as a feature-store readiness gate to prevent accidental look-ahead in backtests built from recently settled meetings.
- Add a `tv_monotonicity_exception` feature in market-microstructure labels so FX-correction windows do not get misclassified as liquidity collapse.
- Add replay-normalization transforms that reconstruct total traded measures from price-level cumulative `trd` events instead of trusting runner `tv` blindly.

Execution lessons:
- Historical ingestion should be event-settlement aware and idempotent; late-arriving files should trigger controlled backfill re-runs.
- Strategy diagnostics using traded-volume momentum must explicitly account for occasional downward volume revisions in PRO data.

Contradiction noted:
- Prior shortcut: historical traded volume is always monotonic and directly comparable to live stream snapshots. Betfair support documents cumulative/derived semantics and FX-related downward adjustments.

### Punting Form sectional coverage and entitlement tiers imply explicit missingness + license-state features

- [A] Punting Form sectionals docs state broad historical coverage claims (e.g., 92%+ coverage since 2012 and wide/weight-change detail since 2014) but not universal completeness.
- [A] Endpoint documentation marks `MeetingSectionals` as available only to Starter+ tiers and separately flags commercial/API usage pathways, reinforcing endpoint-level entitlement variance.

Extracted data fields to add:
- `provider_endpoint_entitlement.min_tier_required`
- `provider_endpoint_entitlement.commercial_required_flag`
- `sectionals_coverage.claimed_coverage_pct`
- `sectionals_coverage.coverage_start_year`
- `sectionals_coverage.wides_available_since_year`
- `sectionals_coverage.observed_missing_rate_by_track`
- `sectionals_coverage.observed_missing_rate_by_season`

Model ideas:
- Add `sectional_missingness_profile` features by venue/season and downweight pace-derived factors in thin-coverage regimes.
- Add entitlement-aware feature toggles so the same model spec can run in Starter-only vs commercial-data environments without silent leakage.

Execution lessons:
- Treat provider coverage claims as priors and validate with empirical missingness audits before promoting sectional-dependent models.
- Tie feature availability to endpoint-tier contracts at runtime to avoid training-serving mismatch when licenses change.

Contradiction noted:
- Prior simplification: sectional datasets are effectively complete once provider access is enabled. Source docs imply tier-gated access plus non-trivial long-horizon coverage gaps.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's published modeling internals beyond the existing corpus.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new high-signal evidence this pass is concentrated in replay-data semantics (Betfair Historical Data) and AU provider entitlement/coverage instrumentation.

## Source notes (incremental additions for pass 21)

- Betfair support: What are the request rate limits on the Historical Data API? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/10111059056669-What-are-the-request-rate-limits-on-the-Historical-Data-API
- Betfair support: How frequently is the historical data updated?: https://support.developer.betfair.com/hc/en-us/articles/360002427051-How-frequently-is-the-historical-data-updated
- Betfair support: Does Betfair Historical Data include the competitionId and competition name?: https://support.developer.betfair.com/hc/en-us/articles/9863189066781-Does-Betfair-Historical-Data-include-the-competitionId-and-competition-name
- Betfair support: How is traded & available volume represented within the PRO Historical Data files?: https://support.developer.betfair.com/hc/en-us/articles/360002401937-How-is-traded-available-volume-represented-within-the-PRO-Historical-Data-files
- Punting Form docs: Sections and Percentages: https://help.puntingform.com.au/en/articles/9130884-sections-and-percentages
- Punting Form API docs: Meeting Sectionals endpoint: https://docs.puntingform.com.au/reference/get-api-v2-meetingsectionals
- Punting Form Modeller/licensing page: https://www.puntingform.com.au/products/modeller

## Incremental sourced findings added in this run (2026-03-29, pass 22)

### Betfair app-key mode changes the observable microstructure surface and currently has fee-policy doc drift

- [A] Betfair `Application Keys` docs (updated 2026-03-16) state delayed keys: use variable 1-180s delayed snapshots, do not return `totalMatched` or `EX_ALL_OFFERS` via `listMarketBook`, do not return BSP near/far prices, and have stream constraints of 2 connections and 200 markets (for delayed-key stream access path).
- [A] The same Betfair doc states a one-off live-key activation fee of `GBP499` and reiterates restrictions on read-only live-key usage.
- [A] Betfair Developer Support's costs article (updated 2025-10-30) states a one-off live-key activation fee of `GBP299` and likewise states read-only live-key use is not permitted.
- [B] Inference: official Betfair documentation layers currently disagree on activation-fee value (`GBP299` vs `GBP499`), so runtime/compliance onboarding should treat app-key economics as a versioned policy surface instead of static constants.

Extracted data fields to add:
- `betfair_app_key_profile.doc_source`
- `betfair_app_key_profile.doc_last_updated`
- `betfair_app_key_profile.key_mode(delayed|live)`
- `betfair_app_key_profile.delay_range_sec_min`
- `betfair_app_key_profile.delay_range_sec_max`
- `betfair_app_key_profile.supports_total_matched_selection_flag`
- `betfair_app_key_profile.supports_ex_all_offers_flag`
- `betfair_app_key_profile.supports_bsp_far_near_flag`
- `betfair_app_key_profile.stream_connection_limit`
- `betfair_app_key_profile.stream_market_limit`
- `betfair_app_key_profile.live_key_activation_fee_gbp`
- `betfair_app_key_profile.read_only_live_allowed_flag`
- `betfair_app_key_profile.policy_conflict_flag`

Model ideas:
- Add `app_key_mode` and `data_surface_tier` as explicit replay covariates so delayed-key backtests are never treated as live-parity datasets.
- Add a `policy_conflict_penalty` feature that downweights operational assumptions (costs/limits) when source documents disagree.

Execution lessons:
- Key onboarding needs a policy-resolver that snapshots every doc source and blocks promotion to production when fee/limit fields conflict.
- Avoid any strategy health metric that depends on selection-level traded volume unless the collector is verified on live-key data surface.

Contradiction noted:
- Prior simplification: live-key activation cost is a single stable constant. Current official sources disagree (`GBP299` vs `GBP499`).

### Queensland race-information conditions now imply a different reporting-regime partition than earlier templates

- [A] Racing Queensland's race-information page states the current authority period is 1 July 2025 to 30 June 2027 and links new 2025-27 conditions plus a comparison document against 2023-25.
- [A] The 2025-27 comparison document states that operators at or above `AUD155 million` assessable turnover provide wagering information daily, while operators below `AUD155 million` provide prior-month information by the fifth business day.
- [A] The prior 2023-25 conditions use a `AUD5 million` threshold for daily vs monthly reporting cadence, indicating a major threshold shift in regime partitioning.
- [A] The 2025-27 comparison document's `Approved Supplier` definition includes `Racing and Wagering Western Australia` (RWWA), expanding the explicit supplier lineage list.

Extracted data fields to add:
- `qld_reporting_regime.authority_period_start`
- `qld_reporting_regime.authority_period_end`
- `qld_reporting_regime.daily_reporting_turnover_threshold_aud`
- `qld_reporting_regime.monthly_reporting_deadline_business_day`
- `qld_reporting_regime.legacy_daily_threshold_aud`
- `qld_reporting_regime.threshold_change_detected_flag`
- `qld_reporting_regime.threshold_change_effective_date`
- `qld_approved_supplier_snapshot.supplier_name`
- `qld_approved_supplier_snapshot.includes_rwwa_flag`
- `qld_approved_supplier_snapshot.source_doc_url`

Model ideas:
- Add a `jurisdiction_reporting_regime_state` feature so operator-telemetry expectations are conditioned on the active threshold regime.
- Use `supplier_lineage_class` to segment provider-latency and data-quality priors by approved-source path.

Execution lessons:
- Compliance ingestion cannot rely on old over/under `AUD5m` templates once 2025-27 terms are active.
- Reporting SLA monitors should parameterize thresholds by authority period, not jurisdiction only.

Contradiction noted:
- Prior simplification: Queensland reporting cadence split is anchored at `AUD5m`. Current 2025-27 terms reference `AUD155m`.

### NYRA 2026 race-day schedule adds exposure-normalization context for CAW event studies

- [A] NYRA's 2026 schedule announcement (published 2026-01-03) states 196 live race days for 2026 and a 2027 foundation schedule of 203 days.
- [B] Inference: CAW-policy effect analysis around early-2026 should normalize for meeting-density/exposure baseline shifts, not only pool cutoff policy changes.

Extracted data fields to add:
- `track_schedule_yearly_plan.track`
- `track_schedule_yearly_plan.season_year`
- `track_schedule_yearly_plan.live_race_days_planned`
- `track_schedule_yearly_plan.publication_date`
- `track_schedule_yearly_plan.source_url`

Model ideas:
- Add `planned_live_days_per_year` as an exposure normalizer in turnover/volatility regime comparisons.

Execution lessons:
- Policy-window attribution should include annual schedule intensity controls to avoid over-attributing changes to CAW rules.

Contradiction noted:
- Prior simplification: annual race-day exposure is stable across NYRA windows used for CAW analysis.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's published modeling internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Net-new high-signal evidence this pass is concentrated in app-key mode microstructure differences, Betfair key-policy documentation drift, and Queensland reporting-regime shifts.

## Source notes (incremental additions for pass 22)

- Betfair Exchange API docs: Application Keys (updated 2026-03-16): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687105/Application%20Keys
- Betfair Developer Support: Are there any costs associated with API access? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/115003864531-Are-there-any-costs-associated-with-API-access
- Racing Queensland race-information page (authority period + links): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland FY26-27 vs FY24-25 comparison PDF (turnover-threshold and supplier definition changes): https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf
- Racing Queensland 2023-25 conditions PDF (legacy threshold baseline): https://www.racingqueensland.com.au/getmedia/e58ab640-1de5-4741-b602-71f1c728c4b9/General-Conditions-for-Race-Information-Authority-1-July-2023-30-June-2025-FINAL.pdf.aspx
- NYRA 2026 schedule announcement (published 2026-01-03): https://www.nyra.com/aqueduct/news/nyra-announces-2026-racing-schedule-multi-year-agreement-on-race-dates/

## Incremental sourced findings added in this run (2026-03-29, pass 23)

### Betfair session-lifecycle and clock discipline are hard prerequisites for reliable execution telemetry

- [A] Betfair support states API session timeout on the international exchange is 12 hours and explicitly says API activity does not extend session life; `Keep Alive` must be called within timeout windows.
- [A] Betfair support recommends synchronizing to the `pool.ntp.org/zone/europe` NTP pool (closest geographic servers) to align with Betfair server time.

Extracted data fields to add:
- `api_session.created_ts`
- `api_session.last_keep_alive_ts`
- `api_session.session_timeout_sec`
- `api_session.activity_extends_session_flag`
- `api_session.expiry_risk_flag`
- `clock_sync.ntp_pool_zone`
- `clock_sync.last_sync_ts`
- `clock_sync.offset_ms`
- `clock_sync.offset_abs_ms`
- `clock_sync.sync_health_state`

Model ideas:
- Add a `session_health_score` feature to execution-quality models using keep-alive age and recent NTP offset.
- Add a `clock_offset_penalty` term to late-window slippage/fill models when absolute offset breaches a configured threshold.

Execution lessons:
- Treat keep-alive scheduling as a control-plane responsibility with alerting and fail-safe token refresh.
- Make NTP offset checks a hard pre-trade guard in low-latency windows.

Contradiction noted:
- Prior simplification: frequent API traffic implicitly keeps sessions alive. Betfair explicitly states session lifetime is not extended by activity.

### CAW cutoff policy diffusion is spreading beyond NYRA and should be modeled as track-specific regime metadata

- [A] Del Mar's official 2025-07-29 release states CAW access to win pools is closed at two minutes to post beginning 2025-07-31.
- [A] The same release frames the change as a response to observed late-odds swings in early summer cards.

Extracted data fields to add:
- `track_policy.track_code`
- `track_policy.pool_scope(win_only|all_visible|custom)`
- `track_policy.caw_cutoff_sec_to_post`
- `track_policy.announced_ts`
- `track_policy.effective_ts`
- `track_policy.policy_trigger_late_odds_flag`

Model ideas:
- Add track-level CAW-policy features so late-odds volatility baselines are conditioned on local cutoff regimes.
- Add policy-change event windows (`pre`, `transition`, `post`) for causal backtest segmentation.

Execution lessons:
- Maintain a track-policy timeline table instead of reusing a single NYRA-derived cutoff assumption.
- Exclude transition-week samples by default from base calibration datasets unless explicitly modeled.

Contradiction noted:
- Prior simplification: US CAW cutoff evidence was mainly NYRA-specific. Del Mar confirms multi-track policy propagation.

### HKJC commingling scale now provides a concrete benchmark for cross-jurisdiction liquidity concentration risk

- [A] HKJC reports FY2024/25 commingled turnover up 10.1% to HK$31.8b, representing 25.3% of Hong Kong racing wagering turnover for the season.
- [A] The same report states HKJC has over 70 commingling partners across 26 countries/jurisdictions.

Extracted data fields to add:
- `commingling.partner_count`
- `commingling.partner_jurisdiction_count`
- `commingling.turnover_hkd`
- `commingling.turnover_growth_pct`
- `commingling.turnover_share_pct`
- `commingling.report_period`

Model ideas:
- Add a `commingling_share_regime` feature to adjust expected late-liquidity behavior in cross-market transfer experiments.
- Add partner-network concentration covariates to stress-test external-liquidity dependency assumptions.

Execution lessons:
- Treat commingled turnover share as a first-class market-structure variable in portability studies.
- Re-estimate liquidity priors when partner-network breadth changes materially.

Contradiction noted:
- Prior simplification: commingling context was directional only. HKJC now provides quantified turnover-share and partner-network scale.

### New peer-reviewed microstructure evidence supports explicit herding-vs-informed state modeling in tote odds dynamics

- [A] A 2025 Physica A paper models horse-race odds dynamics with a time-dependent Ornstein-Uhlenbeck process derived from bettor-behavior microfoundations.
- [A] The paper reports empirical support from 3,450 JRA races (2008), with informed-bettor share rising over time toward close.

Extracted data fields to add:
- `odds_dynamics.model_family(ou_time_dependent)`
- `odds_dynamics.herder_share_estimate`
- `odds_dynamics.informed_share_estimate`
- `odds_dynamics.time_to_close_sec`
- `odds_dynamics.mean_reversion_rate`
- `odds_dynamics.diffusion_scale`
- `dataset.sample_race_count`
- `dataset.market_context(jra_2008_win_pool)`

Model ideas:
- Add a latent state model estimating time-varying informed-share and herding-share for late-window drift decomposition.
- Use OU-inspired features as challengers to purely black-box late-price models.

Execution lessons:
- Separate noise-drift (herding) from information-drift near close to avoid overreactive chasing.
- Validate regime stability before transferring parameters across jurisdictions/pool mechanics.

Contradiction noted:
- Prior simplification: late odds movement was mostly treated as opaque flow. New evidence supports structured micro-macro decomposition.

### Provider capability delta: BetMakers wholesaler appointment clarifies one practical routing path for official AU materials

- [A] BetMakers' 2025-06-20 notice states it is one of five authorised Racing Australia wholesalers under the 2025-07-01 framework.
- [B] The same source claims customers can access official RA materials through CoreAPI and combine them with proprietary layers (for example Punting Form / Racelab) through one supplier path.

Extracted data fields to add:
- `provider_lineage.ra_authorised_wholesaler_flag`
- `provider_lineage.framework_effective_date`
- `provider_lineage.wholesaler_name`
- `provider_capability.coreapi_official_materials_flag`
- `provider_capability.proprietary_bundle_claim_flag`
- `provider_capability.claim_source_type(corporate_announcement)`

Model ideas:
- Add a `single_supplier_bundle_risk` feature to compare resilience of bundled vs multi-vendor ingestion topologies.
- Add entitlement-confidence weighting that discounts marketing claims until contract/SLA evidence is attached.

Execution lessons:
- Keep provider-lineage metadata separate from capability claims and enforce independent SLA/legal verification.
- Model vendor concentration risk explicitly when official + proprietary feeds share one supplier path.

Contradiction noted:
- Prior simplification: RA-wholesaler status alone was enough to rank provider suitability. Capability/SLA certainty still requires separate validation.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No new primary technical publication was identified this run that materially extends Benter's published internals beyond existing sources.
- [B] No new primary technical disclosures were identified this run for Woods, Walsh, or Ranogajec internals.
- [A] Highest-signal net-new evidence this pass is concentrated in exchange/session controls, CAW policy diffusion, and market-structure quantification.

## Source notes (incremental additions for pass 23)

- Betfair support: How do I keep my API session alive? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/360002773032-How-do-I-keep-my-API-session-alive
- Betfair support: Which NTP servers do Betfair use? (updated 2025-12-02): https://support.developer.betfair.com/hc/en-us/articles/360000406071-Which-NTP-servers-do-Betfair-use
- Del Mar official release (published 2025-07-29): https://www.dmtc.com/media/news/del-mar-to-take-additional-steps-to-curb-late-odds-2724
- HKJC corporate results release FY2024/25 (published 2025-08-29): https://corporate.hkjc.com/corporate/corporate-news/english/2025-08/news_2025082901950.aspx
- Physica A (2025): Ornstein-Uhlenbeck process for horse race betting (PII: S037843712500634X): https://www.sciencedirect.com/science/article/pii/S037843712500634X
- BetMakers wholesaler announcement (published 2025-06-20): https://betmakers.com/articles/betmakers-appointed-racing-australia-data-wholesaler

## Incremental sourced findings added in this run (2026-03-29, pass 24)

### Benter's primary factor-engineering example implies we need uncertainty-aware feature lineage, not flat feature tables

- [A] Benter (1994) gives a concrete evolution path from simple distance flags (`NEWDIST`, `DOK`) to his `DPGA` factor and states that computing the refined factor required several thousand lines of code.
- [A] The same paper states practical development usually needs several man-years of programming/data-analysis effort and recommends roughly 500-1000 races for development/testing, with closed horse populations preferred for transferability and normalization reasons.
- [A] Benter also explicitly acknowledges model aesthetics can degrade into a "hodgepodge of highly correlated variables" when optimizing predictive fit, which is acceptable if out-of-sample prediction improves.

Extracted data fields to add:
- `feature_definition.feature_code`
- `feature_definition.derivation_family`
- `feature_definition.implementation_complexity_tier`
- `feature_definition.loc_estimate`
- `feature_definition.requires_closed_population_flag`
- `feature_validation.sample_race_count`
- `feature_validation.out_of_sample_delta_logloss`
- `feature_validation.correlation_cluster_id`

Model ideas:
- Add an uncertainty-shrunk feature layer where complex handcrafted factors receive stronger regularization unless they clear out-of-sample gain thresholds by jurisdiction.
- Add feature-lineage-aware retraining so expensive derived factors can be disabled automatically under data/rights degradation.

Execution lessons:
- Track feature complexity and validation evidence as first-class metadata; do not treat all inputs as equivalent scalar columns.
- Keep jurisdiction-specific model tracks by default when horse-population closure assumptions are weak.

Contradiction noted:
- Prior simplification: winning edge can be built mostly from lightweight feature engineering and model-class choice. Benter's primary text points to long-cycle, high-complexity factor engineering as core edge.

### Bolton-Chapman primary betting results show threshold-sensitive edge instability that should be encoded as a risk regime

- [A] Bolton and Chapman (1986) report that a single-unit strategy betting the horse with maximum expected return (only when expected return exceeds one) produced a weighted average return of 3.1% per race across their four data subsets.
- [A] The same table reports 19 of 26 tested minimum-probability (`pmin`) settings positive over 50-race aggregates, but with large variance and sign reversals at higher thresholds due smaller effective sample counts.
- [A] Their differential-wager variant (Rosner-sized stake by race attractiveness) targets higher multi-race growth, reinforcing that sizing policy can dominate nominal per-race edge.

Extracted data fields to add:
- `strategy_gate.expected_return_gt_one_flag`
- `strategy_gate.pmin_threshold`
- `strategy_gate.eligible_race_count`
- `strategy_perf.mean_return_per_race`
- `strategy_perf.return_across_50_races`
- `strategy_perf.threshold_stability_score`
- `staking_policy.policy_family(single_unit|single_differential)`

Model ideas:
- Train a threshold-stability model that estimates whether current race-count/liquidity conditions justify aggressive `pmin` filters.
- Add a policy-switch controller that moves between single-unit and differential staking based on estimated threshold instability.

Execution lessons:
- Treat filtering thresholds as regime-dependent controls, not static constants.
- Evaluate strategy robustness on rolling fixed-count windows (for example 50-race blocks), not only aggregate ROI.

Contradiction noted:
- Prior simplification: stricter value thresholds monotonically improve realized returns. Primary 1986 results show unstable non-monotonic behavior once sample size shrinks.

### Walsh interview evidence provides concrete Bank Roll structure detail and a measurable public-vs-private coefficient-sign test

- [A] In Walsh's interview with Andrew Leigh, Walsh states the enterprise he set up had him at 28% ownership and "another guy" (identified in the interview as Zeljko Ranogajec) at 29%.
- [A] In the same interview, Walsh says horse-racing analysis took "more than 30 years" and that models remain inferior unless public prices are included as factors.
- [A] Walsh also describes an Australia-specific weight bias pattern: when public information is included, the weight coefficient flips sign in a way consistent with market over-discounting of weight.

Extracted data fields to add:
- `operator_structure.source_person`
- `operator_structure.ownership_share_pct`
- `operator_structure.evidence_date`
- `model_blend.public_factor_included_flag`
- `bias_probe.feature_name`
- `bias_probe.coefficient_without_public`
- `bias_probe.coefficient_with_public`
- `bias_probe.sign_flip_detected_flag`

Model ideas:
- Add routine coefficient-sign diagnostics (with/without public-price features) for folklore-heavy variables such as carried weight.
- Add a market-bias module that scores features by overreaction risk, not only predictive strength.

Execution lessons:
- Store and monitor coefficient-sign flips as production diagnostics for market-bias exploitation durability.
- Treat operator-structure disclosures as probabilistic evidence on process scale and capital mechanics, not direct feature blueprints.

Contradiction noted:
- Prior simplification: Walsh/Ranogajec process detail is only journalistic. This interview provides first-person structural detail and testable modeling claims.

### Betfair SP Near/Far mechanics should be modeled as a separate projection regime from exchange-ladder state

- [A] Betfair's SP FAQ states `Far` projection is derived from SP requests only, while `Near` projection incorporates unmatched exchange orders that could be included at reconciliation.
- [A] The same source states displayed projected SP commonly corresponds to Near price when projected odds are shown.
- [B] Inference: SP projection fields are reconciliation-state estimators, not equivalent to immediate ladder executable prices, and should be stored separately in feature pipelines.

Extracted data fields to add:
- `sp_projection.near_price`
- `sp_projection.far_price`
- `sp_projection.display_mode`
- `sp_projection.includes_exchange_unmatched_flag`
- `sp_projection.snapshot_ts`
- `sp_projection.actual_sp_post_reconcile`
- `sp_projection.reconcile_error_ticks`

Model ideas:
- Add a projection-error model (`near/far` vs actual SP) as a dedicated feature family for BSP-related execution decisions.
- Add state-switch logic separating exchange-ladder alpha and SP-reconciliation alpha.

Execution lessons:
- Do not merge SP projections into the same feature namespace as executable back/lay ladder quotes.
- Persist pre-off Near/Far series to diagnose projection quality drift by venue/time-to-jump regime.

Contradiction noted:
- Prior simplification: projected SP is effectively just another live odds quote. Official FAQ mechanics show it is a distinct reconciliation construct.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] This pass adds primary quantitative detail for Benter feature engineering and Walsh/Ranogajec structure, improving evidence quality for those sections.
- [B] No new primary technical disclosures were identified this pass for Alan Woods internals.
- [A] No net-new CAW policy source beat existing NYRA/Del Mar evidence quality this pass.

## Source notes (incremental additions for pass 24)

- Benter (1994) primary report (DPGA example, sample-size guidance, feature-engineering complexity): https://gwern.net/doc/statistics/decision/1994-benter.pdf
- Bolton and Chapman (1986) primary paper (single-unit/differential strategy return tables): https://gwern.net/doc/statistics/decision/1986-bolton.pdf
- David Walsh interview transcript with Andrew Leigh (ownership split, public-factor dependency, weight-bias claim): https://www.andrewleigh.com/david_walsh_tgl
- Betfair SP FAQ (Near/Far mechanics and reconciliation framing): https://promo.betfair.com/betfairsp/FAQs_projectedOdds.html

## Incremental sourced findings added in this run (2026-03-29, pass 25)

### NSW minimum-bet enforcement is an explicit anti-circumvention control surface, not just a headline limit table

- [A] Racing NSW 2025-26 clause 5.7 requires proportional acceptance when a customer asks above the published minimum: operators must lay the proportional equivalent of the published limit rather than reject outright.
- [A] The same clause prohibits avoidance behaviors including account closure/restriction and redirection to "white label" operations offering worse odds than publicly displayed prices.
- [A] The clause codifies exemption paths (for example betting exchange transactions, pre-commencement-time bets, prior acceptance up to limit for the same horse/beneficial owner, and some cash-retail contexts) and requires complaint-response evidence within 7 days.

Extracted data fields to add:
- `nsw_min_bet_rule.rule_version`
- `nsw_min_bet_rule.proportional_accept_required_flag`
- `nsw_min_bet_rule.anti_circumvention_event_type`
- `nsw_min_bet_rule.exemption_code`
- `nsw_min_bet_rule.beneficial_owner_check_required_flag`
- `nsw_min_bet_complaint.received_ts`
- `nsw_min_bet_complaint.response_due_days`
- `nsw_min_bet_complaint.account_freeze_until_determination_flag`

Model ideas:
- Add a `min_bet_enforceability_risk` feature for bookmaker-reference feeds: downgrade signals from operators with unresolved clause-5.7 complaint history.
- Add beneficial-owner-linked acceptance saturation flags to avoid overestimating repeat-capacity on a single runner.

Execution lessons:
- Encode minimum-bet compliance/exemption states in execution simulation rather than assuming fixed posted limits are always actionable.
- Store bookmaker-routing decisions with anti-circumvention evidence to support compliance audits and strategy post-mortems.

Contradiction noted:
- Prior simplification: minimum-bet rules were mostly static amounts and start times. Current NSW terms define a richer enforcement workflow with explicit anti-avoidance and complaint obligations.

### NSW publishes the amount/time schedule separately from standard conditions, so hardcoded limits are fragile

- [A] Racing NSW's published minimum-bet schedule (effective 1 July 2022, still referenced by current clause 5.7) lists `A$2,000` metro / `A$1,000` non-metro for operators at or above the `A$5m` turnover threshold, with place components (`A$800` and `A$400`).
- [A] The same schedule sets commencement at `9am` NSW time (or `2pm` for night meetings), while clause 5.7 states the website-published values can be amended over time.

Extracted data fields to add:
- `nsw_min_bet_schedule.effective_date`
- `nsw_min_bet_schedule.threshold_turnover_aud`
- `nsw_min_bet_schedule.metro_win_eachway_limit_aud`
- `nsw_min_bet_schedule.metro_place_component_aud`
- `nsw_min_bet_schedule.nonmetro_win_eachway_limit_aud`
- `nsw_min_bet_schedule.nonmetro_place_component_aud`
- `nsw_min_bet_schedule.commencement_time_local`
- `nsw_min_bet_schedule.night_meeting_commencement_time_local`

Model ideas:
- Add effective-dated schedule joins so simulation replays use the limit table valid at event time.
- Build a rule-drift alert whenever the published schedule changes without a corresponding schema/version update.

Execution lessons:
- Pull minimum-bet schedules as versioned policy artifacts, not constants embedded in strategy code.
- Keep timezone-aware commencement checks (`Australia/Sydney`) in pre-trade validation.

Contradiction noted:
- Prior simplification: clause text alone was sufficient for minimum-bet logic. Current terms explicitly delegate amount/time values to a separately updated website schedule.

### Betfair `listMarketBook` has an OPEN/CLOSED mixing trap and a recommended projection bundle that should be encoded in collector policy

- [A] Betfair's official `listMarketBook` docs state OPEN and CLOSED markets should be requested separately; mixed-status requests return only OPEN markets.
- [A] The same page recommends a specific projection bundle for single-call state tracking: `OrderProjection=EXECUTABLE` with `MatchProjection=ROLLED_UP_BY_AVG_PRICE` (or `ROLLED_UP_BY_PRICE`) to track prices, traded volume, unmatched orders, and matched position in a bounded response profile.

Extracted data fields to add:
- `collector.market_status_request_scope(open|closed|mixed)`
- `collector.mixed_status_request_blocked_flag`
- `collector.order_projection_mode`
- `collector.match_projection_mode`
- `collector.response_payload_bytes`
- `collector.response_entity_count`
- `collector.state_surface(prices|traded|unmatched|matched_pos)`

Model ideas:
- Add a `state_surface_completeness_score` feature so backtests can discount windows where collector projection modes were incomplete.
- Add ingestion-policy experiments comparing position-tracking error under recommended vs non-recommended projection bundles.

Execution lessons:
- Enforce separate OPEN/CLOSED polling paths to avoid silent state loss.
- Standardize projection settings per strategy so data-surface changes are explicit versioned events.

Contradiction noted:
- Prior simplification: one `listMarketBook` request profile can safely span all market states. Official docs indicate mixed OPEN/CLOSED polling silently drops CLOSED data.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary technical disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality CAW policy source was identified this pass beyond existing NYRA/Del Mar coverage.
- [A] Net-new signal this pass is strongest in NSW policy-execution constraints and Betfair collector semantics.

## Source notes (incremental additions for pass 25)

- Racing NSW 2025-26 standard conditions (effective 1 July 2025): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Clean-Version-Effective-1-July-2025.pdf
- Racing NSW minimum-bet schedule (as at 1 July 2022): https://www.racingnsw.com.au/wp-content/uploads/Minimum-Bet-Limits-and-Minimum-Bet-Commencement-Time-as-at-1-July-2022.pdf
- Racing NSW race-fields legislation index (current links to clause 5.7 materials): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/
- Betfair Exchange API docs: `listMarketBook` (updated 2024-06-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook

## Incremental sourced findings added in this run (2026-03-30, pass 26)

### NYRA's official betting FAQ separates post-start odds movement from post-start bet acceptance

- [A] NYRA's betting FAQ states wagering closes when the gate opens and explicitly says no wagering site can accept bets after the start of any NYRA race.
- [A] The same FAQ explains post-start odds movement as a tote-calculation publication delay caused by high last-minute wagering volume across simulcast channels.

Extracted data fields to add:
- `tote_cycle.wager_close_ts`
- `tote_cycle.race_start_ts`
- `tote_cycle.final_odds_publish_ts`
- `tote_cycle.post_start_odds_update_lag_sec`
- `tote_cycle.post_start_acceptance_possible_flag`
- `tote_cycle.venue_faq_version`

Model ideas:
- Add a `post_start_odds_lag_decomposition` feature set so model diagnostics can separate legal tote-publication lag from suspected market-access asymmetry.
- Add a `final_odds_publish_lag_bucket` covariate for any U.S. tote-linked reference signals used in cross-market research.

Execution lessons:
- Do not classify every post-jump odds movement as evidence of after-the-jump betting access.
- Track odds-publication lag explicitly before attributing slippage or CLV misses to execution quality.

Contradiction noted:
- Prior simplification: post-start odds changes imply post-start betting. NYRA's official FAQ attributes these changes to calculation/publication lag after on-time wagering closure.

### Tasracing confirms a new official sectional provider (effective 1 January 2026) with explicit capture-method semantics

- [A] Tasracing's 24 Dec 2025 notice says Daily Sectionals became the official sectional timing provider for Tasmanian thoroughbred meetings from 1 Jan 2026.
- [A] The same notice specifies coverage content (`200m` splits, overall times, and position-in-running) and states the timing relies on race vision to capture data for every horse that finishes.

Extracted data fields to add:
- `sectional_provider_regime.jurisdiction`
- `sectional_provider_regime.provider_name`
- `sectional_provider_regime.effective_from`
- `sectional_provider_regime.capture_method(vision|transponder|mixed)`
- `sectional_provider_regime.split_interval_m`
- `sectional_provider_regime.includes_position_in_running_flag`
- `sectional_provider_regime.coverage_scope(all_finishers|subset)`

Model ideas:
- Add provider-regime controls so sectional-derived features can be normalized when capture method changes.
- Add a Tasmanian pre/post-2026 regime flag for transfer-learning tests against VIC/WA sectionals.

Execution lessons:
- Treat sectional-provider changes as hard regime boundaries for backtests and calibration monitoring.
- Preserve capture-method metadata with each sectional record; identical field names can hide materially different measurement processes.

Contradiction noted:
- Prior simplification: Australian sectional data is roughly homogeneous across jurisdictions/time. Tasracing's provider switch and capture-method detail show this is not safe.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Net-new CAW-relevant evidence this pass is NYRA's official clarification that post-start odds movement can arise from tote-publication lag despite wagering closure at gate-open.
- [A] Net-new Australian provider signal this pass is Tasracing's formal 2026 sectional-provider regime change and measurement semantics.

## Source notes (incremental additions for pass 26)

- NYRA betting FAQ (Aqueduct): https://cms.nyra.com/aqueduct/racing/betting-faq
- Tasracing notice: New sectional provider for Tasmanian thoroughbred racing (24 Dec 2025): https://tasracing.com.au/news/new-sectional-provider-for-tasmanian-thoroughbred-racing

## Incremental sourced findings added in this run (2026-03-30, pass 27)

### Betfair data-surface mapping adds filter-level constraints we should encode as hard collector contracts

- [A] Betfair Developer Support's mapping article (updated 2025-10-30) states top-of-book subscriptions with virtual prices (`EX_BEST_OFFERS_DISP` / `virtualise=true`) are parameterized by `ladderLevels` with an explicit depth range of `1..10`.
- [A] The same source states market-definition updates are delivered only when `EX_MARKET_DEF` is requested; SP ladders/projections require explicit SP filters (`SP_TRADED`, `SP_AVAILABLE`, `SP_PROJECTED`) rather than being implied by price filters.
- [A] Inference: incomplete projection/filter bundles can silently create partial state surfaces that look valid but are not feature-complete for execution or BSP research.

Extracted data fields to add:
- `collector.price_depth_ladder_levels`
- `collector.market_definition_requested_flag`
- `collector.sp_traded_requested_flag`
- `collector.sp_available_requested_flag`
- `collector.sp_projected_requested_flag`
- `collector.filter_bundle_profile_id`
- `collector.state_surface_gap_flag`

Model ideas:
- Add a `state_surface_missingness_score` feature and down-weight model windows where required filter bundles were not active.
- Add challenger experiments that compare BSP-related signals under full-SP filter bundles versus price-only bundles.

Execution lessons:
- Treat filter/projection bundles as versioned contracts; reject runs with missing `EX_MARKET_DEF` or missing SP filters for strategies that depend on them.
- Keep ladder-depth (`ladderLevels`) lineage in every replay slice; depth drift can mimic microstructure drift.

Contradiction noted:
- Prior simplification: requesting prices was broadly sufficient for market-state reconstruction. Betfair's mapping clarifies several critical state surfaces are opt-in via specific filters.

### Racing Victoria's jump-out standardization creates a concrete pre-race data-regime boundary for Victorian horse-profile signals

- [A] Racing Victoria's 3 Mar 2025 announcement says all jump-outs from Flemington and Geelong are now produced to a common standard and published to Racing.com and horse profiles on the Racing Australia website.
- [A] The same notice states every jump-out now has race callers and color-coded identification matching the horse's race-day colours from its most recent race start.
- [A] Publication timing is explicitly defined: jump-out videos are available by `5pm` on jump-out day (all tracks except Cranbourne and Pakenham).
- [B] Inference: Victorian jump-out derived features should treat pre/post-standardization windows as different observability regimes, especially for computer-vision and manual-note pipelines.

Extracted data fields to add:
- `jumpout_capture.protocol_regime_id`
- `jumpout_capture.standardized_production_flag`
- `jumpout_capture.racecaller_present_flag`
- `jumpout_capture.colors_standardized_flag`
- `jumpout_capture.publish_deadline_local`
- `jumpout_capture.publish_channel(racingcom|ra_profile|other)`
- `jumpout_capture.track_exception_flag`

Model ideas:
- Add a Victorian jump-out `protocol_regime` covariate and test uplift in pre-race readiness models after standardization.
- Build latency-aware pre-off models that only consume jump-out features once expected publication deadline has elapsed.

Execution lessons:
- Persist jump-out protocol metadata with each derived feature so feature quality can be conditioned on the capture/display regime.
- For same-day execution, include a publication-latency gate to avoid assuming jump-out assets are uniformly available across all tracks.

Contradiction noted:
- Prior simplification: jump-out evidence was treated as loosely structured and uniformly timed. RV now defines explicit production standards and publication timing constraints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Strongest net-new signal this pass is implementation-level: Betfair filter-contract completeness and RV jump-out data-regime standardization.
- [A] CAW evidence quality remains policy/operator-side rather than syndicate self-disclosure.

## Source notes (incremental additions for pass 27)

- Betfair support: What market data is available from `listMarketBook` & Stream API? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API-
- Racing Victoria official release (3 Mar 2025): Racing Victoria and Racing.com launch enhanced jump-out coverage: https://www.racingvictoria.com.au/news/2025/03/03/racing-victoria-and-racingcom-launch-enhanced-jump-out-coverage

## Incremental sourced findings added in this run (2026-03-30, pass 30)

### Betfair Stream access state is a hard execution precondition, with delayed-key conflation explicitly unsuitable for late microstructure work

- [A] Betfair support states Stream API access is available by default on delayed keys, and delayed-key stream output is conflated into one update every 3 minutes containing the preceding 3-minute changes.
- [A] The same source says live stream access requires a funded, KYC-verified account with a live app key.
- [A] Betfair support's Bearer-token article states Vendor Web API app keys must use `BEARER` token format (`token_type + " " + access_token`) as the stream `session` value.
- [B] Inference: stream access mode (`delayed|live`) and app-key class (`vendor_web|standard`) are not onboarding details; they are runtime microstructure regime controls that must gate both feature eligibility and execution readiness.

Extracted data fields to add:
- `stream_access_profile.app_key_mode(delayed|live)`
- `stream_access_profile.stream_conflation_interval_sec`
- `stream_access_profile.account_kyc_verified_flag`
- `stream_access_profile.account_funded_flag`
- `stream_auth_contract.app_key_class(vendor_web|other)`
- `stream_auth_contract.session_token_format(bearer|session_token)`
- `stream_auth_contract.auth_validation_ts`

Model ideas:
- Add a `stream_regime_eligibility_score` feature that suppresses late-window microstructure signals when stream mode is delayed or auth contract is degraded.
- Add `stream_conflation_interval_sec` as a confidence haircut input for any model consuming intra-minute drift/volume dynamics.

Execution lessons:
- Treat delayed-key sessions as a separate research mode; block live execution and CLV attribution based on sub-minute dynamics when `stream_conflation_interval_sec >= 180`.
- Validate stream auth contract at startup (including bearer-token requirements for vendor-web keys) and hard-fail before market open if mismatched.

Contradiction noted:
- Prior simplification: once stream connectivity exists, microstructure features are comparable across environments. Betfair support explicitly distinguishes delayed conflated streams from live trading-grade streams.

### Racing Australia FreeFields pages expose publication-state metadata (`interim` vs final) and artifact-lifecycle surfaces we should persist

- [A] Racing Australia's NSW FreeFields calendar page publishes per-meeting artifact columns (`Nominations`, `Weights`, `Acceptances`, `Form`, `Gear`, `Scratchings`, `Results`) rather than a single "race ready" state.
- [A] Racing Australia's NSW results calendar marks some outputs as `Available Now (interim)`, while others are simply `Available Now`, exposing a machine-actionable publication-state transition.
- [A] FreeFields footer notices assign state-level racing-material copyright ownership (for example NSW materials owned by Racing NSW and related parties), with Racing Australia copyright layered separately.
- [B] Inference: FreeFields can serve as a provider-state monitor if we store artifact readiness and interim/final result flags; this also improves entitlement/compliance lineage.

Extracted data fields to add:
- `freefields_artifact_state.state`
- `freefields_artifact_state.meeting_date`
- `freefields_artifact_state.meeting_key`
- `freefields_artifact_state.nominations_available_flag`
- `freefields_artifact_state.weights_available_flag`
- `freefields_artifact_state.acceptances_available_flag`
- `freefields_artifact_state.form_available_flag`
- `freefields_artifact_state.gear_available_flag`
- `freefields_artifact_state.scratchings_available_flag`
- `freefields_result_publication.result_status(interim|final)`
- `freefields_rights_notice.state_rights_holder`
- `freefields_rights_notice.ra_rights_notice_flag`

Model ideas:
- Add a `publication_state_confidence` feature to down-weight signals when only pre-final artifacts are available or results are still `interim`.
- Build artifact-readiness predictors so pre-off models consume only fields guaranteed to have crossed state-specific readiness thresholds.

Execution lessons:
- Treat FreeFields publication states as event-time metadata; do not backfill-finalize historical snapshots without preserving the original `interim` state.
- Persist rights-notice lineage with each ingest batch so endpoint-level usage controls can be enforced in downstream products.

Contradiction noted:
- Prior simplification: FreeFields outputs were treated as binary available/not-available. Current pages expose multi-artifact readiness and explicit interim/final result states.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing policy/operator sources.
- [A] Strongest net-new signal this pass is execution-governance level: stream access-mode/auth contracts and provider publication-state instrumentation.

## Source notes (incremental additions for pass 30)

- Betfair support: How do I get access to the Stream API? (updated 2024-06-21): https://support.developer.betfair.com/hc/en-us/articles/115003887871-How-do-I-get-access-to-the-Stream-API
- Betfair support: Stream API - Bearer Token Must Be Used for Web App Key (updated 2025-09-11): https://support.developer.betfair.com/hc/en-us/articles/360000391432-Stream-API-Bearer-Token-Must-Be-Used-for-Web-App-Key
- Racing Australia FreeFields (NSW race fields/form calendar): https://www.racingaustralia.horse/FreeFields/Calendar.aspx?State=NSW
- Racing Australia FreeFields (NSW results calendar with interim/final status labels): https://www.racingaustralia.horse/FreeFields/Calendar_Results.aspx?State=NSW

## Incremental sourced findings added in this run (2026-03-30, pass 31)

### Betfair catalogue/type definitions add three high-impact microstructure contracts: cached `totalMatched`, stable `selectionId` mapping, and AU/NZ `raceTypes`

- [A] Betfair Betting Type Definitions state `MarketCatalogue.totalMatched` is cached and directs users to `listMarketBook` for live matched-volume values.
- [A] The same type-definitions page states the same `selectionId` + `runnerName` pairs are used across Betfair markets containing those runners, which is a stronger native-identity key than ad-hoc name matching.
- [A] Betfair's `MarketFilter.raceTypes` now explicitly documents AUS/NZ mappings (`Flat`, `Harness`, `Steeple`, `Hurdle`) and a `NO_VALUE` bucket when no race type has been mapped.
- [B] Inference: we can reduce join fragility and leakage risk by separating static catalogue snapshots from dynamic book telemetry and by preserving Betfair-native runner identity keys.

Extracted data fields to add:
- `market_catalogue_snapshot.total_matched_cached`
- `market_book_snapshot.total_matched_live`
- `market_catalogue_snapshot.market_projection_set`
- `runner_identity.selection_id`
- `runner_identity.runner_name`
- `runner_identity.cross_market_stable_pair_flag`
- `market_filter_race_type.race_type_raw`
- `market_filter_race_type.race_type_norm_au`
- `market_filter_race_type.no_value_flag`

Model ideas:
- Build a `catalogue_vs_live_volume_gap` feature for freshness diagnostics; downweight signals where cached-vs-live divergence exceeds policy thresholds.
- Use `selectionId`-anchored longitudinal runner embeddings to avoid alias drift from string-normalized names.
- Add `race_type_mapping_quality` as a covariate so `NO_VALUE` windows are treated as lower-confidence taxonomy periods.

Execution lessons:
- Never treat catalogue `totalMatched` as executable liquidity; route all fill/slippage logic through live market-book/stream values.
- Persist catalogue and book snapshots separately to avoid training-serving skew from mixed-freshness fields.
- Keep `NO_VALUE` race-type rows in PIT data, but block them from production segment-level strategy rollups until resolved.

Contradiction noted:
- Prior simplification: `totalMatched` from discovery calls is equivalent to live liquidity. Betfair's type definitions explicitly label catalogue `totalMatched` as cached.

### Punting Form docs clarify subscription-to-endpoint entitlement boundaries, including sectional API gating and commercial escalation

- [A] Punting Form's docs position Modeller membership as the tier with API access to sectional data and access to historical-data purchasing workflows.
- [A] Punting Form API reference pages show endpoint-level entitlement tags (for example, `MeetingRatings` available to Starter+; `MeetingBenchmarks/csv` available to Modeller and commercial subscriptions), both requiring token authentication.
- [A] Punting Form docs route commercial users explicitly through a separate commercial-customer path rather than self-serve consumer tiers.
- [B] Inference: provider gating should be endpoint-granular; tier-level access alone is insufficient because feature-critical endpoints may be unavailable under lower tiers.

Extracted data fields to add:
- `provider_endpoint_tier_profile.provider`
- `provider_endpoint_tier_profile.endpoint_path`
- `provider_endpoint_tier_profile.min_tier`
- `provider_endpoint_tier_profile.commercial_path_required_flag`
- `provider_endpoint_tier_profile.token_auth_required_flag`
- `provider_membership_profile.tier_name`
- `provider_membership_profile.sectional_api_access_flag`
- `provider_membership_profile.historical_purchase_available_flag`

Model ideas:
- Add a `feature_entitlement_coverage_score` that downweights or masks features when required endpoints are unavailable for the active contract tier.
- Run challenger experiments separating `ratings-only` models (Starter-eligible) from `sectional-enhanced` models (Modeller/commercial eligible).

Execution lessons:
- Treat endpoint entitlement snapshots as deployment-blocking prerequisites for any model that depends on sectionals/benchmarks.
- Preserve contract-tier lineage with every feature batch so replay and compliance audits can reconstruct what was legally available at bet time.

Contradiction noted:
- Prior simplification: one provider-tier flag adequately represents feed capability. Punting Form docs show endpoint-level access asymmetry inside the same provider.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing policy/operator sources.
- [A] Strongest net-new signal this pass is execution/data-contract level: Betfair catalogue semantics and AU provider endpoint entitlement boundaries.

## Source notes (incremental additions for pass 31)

- Betfair `listMarketCatalogue` (updated 2024-06-12): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687517/listMarketCatalogue
- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Punting Form Getting Started docs index: https://docs.puntingform.com.au/
- Punting Form Modeller Membership guide: https://docs.puntingform.com.au/docs/modeller-membership
- Punting Form API reference `MeetingRatings`: https://docs.puntingform.com.au/reference/ratings
- Punting Form API reference `MeetingBenchmarks/csv`: https://docs.puntingform.com.au/reference/meetingbenchmarkscsv

## Incremental sourced findings added in this run (2026-03-30, pass 32)

### Betfair `listClearedOrders` roll-up semantics add a settlement-grain trap we should treat as a hard reconciliation contract

- [A] Betfair's `listClearedOrders - Roll-up Fields Available` page states settled-order fields are roll-up dependent and may be aggregated (`SUM`, `AVG`, `MAX`) above bet level, rather than returned as bet-grain facts.
- [A] The same page states values can be "hoisted" into higher roll-up levels whenever unambiguous, including conditions where `selectionId`, `handicap`, `side`, `priceRequested`, `priceMatched`, and `sizeSettled` appear at market/runner levels.
- [A] Commission is explicitly unavailable at `BET`/`SIDE` roll-up but appears from `MARKET` upward (with `SUM` semantics), which can distort attribution if consumers assume a fixed field set by row.
- [B] Inference: settlement ETL must carry explicit roll-up lineage and aggregation semantics per row; otherwise model/reconciliation layers will mix aggregated and atomic values.

Extracted data fields to add:
- `cleared_orders_rollup.group_by_level`
- `cleared_orders_rollup.hoisted_fields_set`
- `cleared_orders_rollup.aggregation_semantics_json`
- `cleared_orders_rollup.bet_count`
- `cleared_orders_rollup.price_requested_agg_mode`
- `cleared_orders_rollup.price_matched_agg_mode`
- `cleared_orders_rollup.size_settled_agg_mode`
- `cleared_orders_rollup.commission_available_flag`

Model ideas:
- Add a `settlement_grain_confidence` feature that down-weights post-settlement diagnostics when records are non-bet-grain roll-ups.
- Build roll-up aware challenger reports that compare attribution drift between `BET` and higher-level grouped settlements.

Execution lessons:
- Never join `listClearedOrders` rows into per-bet execution diagnostics unless `groupBy=BET` is enforced and lineage checks pass.
- Persist aggregation/hoist metadata with every cleared-order ingest batch so replay can reconstruct exactly what grain was observed.

Contradiction noted:
- Prior simplification: settled-order rows are uniformly bet-grain records with stable field availability. Betfair documents dynamic, roll-up-dependent field surfacing and aggregation.

### Racing Australia January 2026 monthly report adds process-level SLA variance that uptime-only monitoring misses

- [A] Racing Australia's January 2026 service-standard report shows `Nominations RA` timeliness at `90.80%` against a `98%` target (negative variance `-7.20%`), while `Riders` and `Acceptances` exceeded target in the same report.
- [A] The same report shows January 2026 website uptime at `99.98%` with `9` minutes unplanned downtime, while core national systems remained `100%`.
- [A] Racing Australia's monthly-performance index (captured in this run on 2026-03-30) still lists January 2026 as the latest 2025-26 artifact, with no February 2026 report entry visible.
- [B] Inference: provider-health controls should separate process-SLA quality (artifact timeliness) from system uptime and should treat missing expected monthly artifacts as an independent confidence penalty.

Extracted data fields to add:
- `ra_monthly_process_kpi.report_month`
- `ra_monthly_process_kpi.metric_name`
- `ra_monthly_process_kpi.target_pct`
- `ra_monthly_process_kpi.actual_pct`
- `ra_monthly_process_kpi.variance_pct`
- `ra_monthly_system_kpi.website_uptime_pct`
- `ra_monthly_system_kpi.website_unplanned_downtime_min`
- `ra_monthly_publication_index.latest_listed_month`
- `ra_monthly_publication_index.missing_expected_month_flag`

Model ideas:
- Add a `provider_process_quality_score` that gates feature families relying on nominations/acceptances timeliness, independent of infrastructure uptime.
- Add publication-gap-aware confidence haircuts when expected monthly KPI artifacts are missing.

Execution lessons:
- Do not treat high uptime alone as proof of feed quality; process-specific timeliness metrics can fail while systems remain largely available.
- Snapshot monthly report index state so publication lag itself becomes measurable rather than inferred post hoc.

Contradiction noted:
- Prior simplification: monthly provider reliability could be proxied by uptime metrics and latest single report values. January 2026 evidence shows process timeliness can underperform targets despite near-perfect uptime.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy sources.
- [A] Strongest net-new signal this pass is operational-contract level: settlement roll-up semantics and provider process-SLA instrumentation.

## Source notes (incremental additions for pass 32)

- Betfair `listClearedOrders - Roll-up Fields Available` (updated 2024-06-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687679/listClearedOrders%2B-%2BRoll-up%2BFields%2BAvailable
- Racing Australia Monthly Service Standard Performance index: https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx
- Racing Australia Monthly Service Standard Performance Report (January 2026): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-January-2026.pdf

## Incremental sourced findings added in this run (2026-03-30, pass 34)

### Betfair login/session contracts add hard uptime constraints that are independent of market activity

- [A] Betfair's Login & Session Management page (updated 2025-09-11) sets successful login request limits at `100/minute`; breaching this returns `TEMPORARY_BAN_TOO_MANY_REQUESTS` and blocks creating new sessions for `20 minutes` while existing sessions remain valid.
- [A] The same source states session lifetime is not extended by normal API traffic; Keep-Alive must be called within the jurisdiction timeout window or the session expires.
- [A] Session-expiry windows are explicitly jurisdiction-dependent (`12h` international `.com` non-UK/IE, `24h` UK/IE, `20m` Italian/Spanish), and the Keep-Alive endpoint is jurisdiction-specific (for AU/NZ: `identitysso.betfair.au`).
- [B] Inference: auth/session reliability is a first-class execution-regime variable, not a generic platform concern; stale keep-alive scheduling and login retry storms can create false market-signal outages and execution gaps.

Extracted data fields to add:
- `auth_session_regime.exchange_jurisdiction`
- `auth_session_regime.session_ttl_sec`
- `auth_session_regime.keepalive_endpoint`
- `auth_session_event.last_keepalive_ts`
- `auth_session_event.next_keepalive_due_ts`
- `auth_session_event.keepalive_status(success|fail|no_session)`
- `auth_session_event.login_request_count_1m`
- `auth_session_event.login_temp_ban_active_flag`
- `auth_session_event.login_temp_ban_until_ts`

Model ideas:
- Add an `auth_regime_health_score` feature to suppress late-window microstructure signals when session-refresh latency or login-ban risk is elevated.
- Add an `api_surface_continuity` covariate built from keep-alive success streaks and `NO_SESSION` incidence to improve confidence calibration during infrastructure stress.

Execution lessons:
- Treat Keep-Alive scheduling as a hard control loop with jurisdiction-specific cadence, not a best-effort background task.
- Enforce login-rate budgeters and exponential backoff to avoid self-induced `20-minute` session-creation lockouts.

Contradiction noted:
- Prior simplification: active API flow implicitly keeps sessions alive. Betfair explicitly states API activity does not extend session lifetime.

### Racing Australia now exposes two distinct provider-reliability surfaces: monthly KPIs and an independent outage log

- [A] Racing Australia's systems-status site states it is independent of RA production infrastructure and will continue to be updated during major outages.
- [A] The same site publishes dated planned outage notices (for example, 5 March 2026 outages affecting `myhorseracing.horse` and SNS modules including RoR/StableAssist) and unplanned outage incidents.
- [A] Racing Australia's July 2025 Oracle-cloud migration notice defined a `10-hour` outage window and explicitly listed impacted surfaces including `Secure FTP data services`, `XML services`, `mViews and Shareplex services`, and PRA-RA data links.
- [B] Inference: provider-availability modeling should split `scheduled outage regime`, `incident regime`, and `monthly KPI regime`; relying only on monthly service reports misses intramonth outage windows that can contaminate PIT feature completeness.

Extracted data fields to add:
- `ra_status_event.event_type(planned|unplanned|migration)`
- `ra_status_event.event_title`
- `ra_status_event.published_ts`
- `ra_status_event.window_start_local`
- `ra_status_event.window_end_local`
- `ra_status_event.affected_surfaces_json`
- `ra_status_event.independent_status_site_flag`
- `ra_status_event.source_url`
- `ra_feed_surface_health.surface_name(ftp|xml|mviews|shareplex|sns|website)`
- `ra_feed_surface_health.degraded_flag`

Model ideas:
- Add an `intramonth_provider_outage_risk` feature that penalizes feature confidence when upstream outage windows overlap data-capture windows.
- Build outage-conditioned challengers that exclude or downweight training examples captured during known degraded-source windows.

Execution lessons:
- Snapshot outage notices as soon as published; post-event reconstruction from monthly PDFs loses module-level outage timing.
- Add feed-surface-specific kill switches so XML/FTP degradation can halt dependent strategy modules without disabling unrelated pipelines.

Contradiction noted:
- Prior simplification: monthly SLA reports were sufficient to model RA provider reliability. Independent status logs and migration notices show materially finer-grain outage state.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy sources.
- [A] Strongest net-new signal this pass is execution/provider operations level: Betfair auth-session contracts and Racing Australia outage-surface telemetry.

## Source notes (incremental additions for pass 34)

- Betfair Login & Session Management (updated 2025-09-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687869/Login%2BSession%2BManagement
- Betfair support: How do I keep my API session alive? (updated 2025-10-30): https://support.developer.betfair.com/hc/en-us/articles/360002773032-How-do-I-keep-my-API-session-alive
- Racing Australia Systems Status Updates: https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status post: Planned Maintenance - Thursday 5th March 2026: https://racingaustraliasystemsstatus.horse/planned-maintenance-thursday-5th-march-2026.html
- Racing Australia media release: Data Centre move to Oracle Cloud Infrastructure (July 2025): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Australia-Data-Centre-move-to-Oracle-Cloud-Infrastructure.pdf

## Incremental sourced findings added in this run (2026-03-30, pass 35)

### Betfair targeted payout/profit orders and `TimeInForce` semantics add a stake-normalization + queue-transition contract

- [A] Betfair `placeOrders` supports `betTargetType` (`PAYOUT` or `BACKERS_PROFIT`) with `betTargetSize`, so orders can be expressed by target outcome rather than backer stake size.
- [A] Betfair documents that if a payout/profit-target order is not fully matched on first entry, the unmatched remainder is converted into standard unmatched-queue terms (price plus backer-stake representation).
- [A] Betfair Betting Type Definitions document that `timeInForce` (for example `FILL_OR_KILL`) takes precedence over `persistenceType`, and `minFillSize` behavior depends on `timeInForce` usage.
- [B] Inference: execution telemetry must preserve pre-queue intent (`betTargetType`) separately from post-queue representation (`sizeRemaining`) to avoid false slippage attribution when residuals are transformed.

Extracted data fields to add:
- `order_instruction.bet_target_type`
- `order_instruction.bet_target_size`
- `order_instruction.size_submitted`
- `order_instruction.time_in_force`
- `order_instruction.min_fill_size`
- `order_state.unmatched_representation_mode(target|stake)`
- `order_state.unmatched_conversion_detected_flag`
- `order_state.unmatched_conversion_ts`

Model ideas:
- Add a `target_to_stake_conversion_rate` feature to execution-quality models, measuring how often target-outcome instructions are converted into stake-based residuals in late windows.
- Train separate fill/slippage models for `stake_native` orders and `target_outcome` orders to avoid pooling structurally different instruction behavior.

Execution lessons:
- Persist both instruction intent and resulting queue representation for each order lifecycle state.
- Treat `FILL_OR_KILL` plus `minFillSize` usage as a high-impact regime switch in replay/backtest simulation, not a generic limit-order variant.

Contradiction noted:
- Prior simplification: order size semantics are stable from submission through unmatched queue state. Betfair documents explicit target-outcome-to-stake conversion for partially unmatched target bets.

### Punting Form endpoint taxonomy exposes a provider-curated vs user-authored data boundary that must be feature-gated

- [A] Punting Form's `v2/Updates/Conditions` endpoint provides upcoming-meeting conditions including track grading and weather and is marked available from Starter tier.
- [A] Punting Form's `v2/User/Speedmaps` and `v2/User/Notes` endpoints are user-surface APIs that return user-edited or user-entered artifacts.
- [B] Inference: these user endpoints are valuable for operator workflows but should be isolated from canonical model training data unless provenance controls explicitly permit personalized features.

Extracted data fields to add:
- `provider_endpoint_profile.endpoint_family(updates|form|ratings|user)`
- `provider_endpoint_profile.user_authored_flag`
- `meeting_conditions.track_grade`
- `meeting_conditions.weather_text`
- `feature_provenance.source_scope(provider_curated|user_authored)`
- `feature_provenance.user_context_id`
- `feature_gate.user_authored_allowed_flag`

Model ideas:
- Build a `provider_curated_only` champion model that excludes all user-authored endpoint families for production baseline calibration.
- Run challenger experiments with controlled `user_authored` features only when provenance and permission state are explicit.

Execution lessons:
- Separate credentials and storage paths for canonical provider feeds vs user-customized endpoints.
- Enforce a default deny policy: user-authored signals must be explicitly whitelisted before entering training or live scoring.

Contradiction noted:
- Prior simplification: all provider API endpoints are equivalent machine-ingest surfaces. Punting Form docs show a material split between provider-curated and user-authored data products.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy sources.
- [A] Strongest net-new signal this pass is execution/provider-contract level: order-intent transformation semantics and user-authored endpoint isolation.

## Source notes (incremental additions for pass 35)

- Betfair `placeOrders` (updated 2025-01-07): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Betting Type Definitions (current page id): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Punting Form API docs: `Conditions` endpoint: https://docs.puntingform.com.au/reference/conditions
- Punting Form API docs: `User/Speedmaps` endpoint: https://docs.puntingform.com.au/reference/speedmaps
- Punting Form API docs: `User/Notes` endpoint: https://docs.puntingform.com.au/reference/notes

## Incremental sourced findings added in this run (2026-03-30, pass 36)

### Betfair market-data mapping revision (2026-03-27) adds explicit virtual-ladder semantics that affect replay parity

- [A] Betfair Developer Support's `listMarketBook`/Stream mapping page now shows update timestamp `March 27, 2026 11:01`, indicating active contract drift and the need for source-version tracking.
- [A] The same page states virtual/display prices (`EX_BEST_OFFERS_DISP` / `virtualise=true`) are updated about `150 m/s` after non-virtual prices and clarifies virtual prices are calculated for all requested ladder levels (`1..10`).
- [A] The mapping table explicitly distinguishes `EX_TRADED` (full traded ladder) from `EX_TRADED_VOL` (market-level and runner-level traded volume), which should be modeled as separate surfaces rather than interchangeable liquidity fields.
- [B] Inference: replay and diagnostics should carry a versioned market-view contract so model labels do not silently mix virtual-ladder lag behavior with raw-price behavior.

Extracted data fields to add:
- `betfair_market_data_contract.source_updated_ts`
- `betfair_market_data_contract.virtual_ladder_all_levels_flag`
- `betfair_market_data_contract.virtual_ladder_lag_ms_nominal`
- `market_snapshot.price_surface_family(ex_best_offers|ex_best_offers_disp|ex_all_offers|ex_traded|ex_traded_vol)`
- `market_snapshot.traded_volume_surface_level(market|runner|price_ladder)`
- `market_snapshot.contract_version_hash`

Model ideas:
- Add a `virtual_ladder_lag_exposure` feature for late-window fill and slippage models so virtual/display lag is represented explicitly.
- Train separate microstructure challengers on `EX_TRADED` (price-ladder turnover shape) versus `EX_TRADED_VOL` (aggregate turnover pressure) rather than blending both into one liquidity proxy.

Execution lessons:
- Snapshot support-doc version metadata together with collector configuration to make replay auditable under changing platform guidance.
- Keep virtual/display and non-virtual surfaces isolated in training datasets unless lag-adjusted alignment is proven.

Contradiction noted:
- Prior simplification: virtual/display prices were treated as a shallow top-of-book transform. Current Betfair mapping guidance states virtual prices are calculated across all requested ladder levels with distinct update timing.

### Punting Form sectionals docs now expose finer split taxonomy and tighter entitlement boundaries

- [A] Punting Form's Sectional Data guide states minimum split capture includes start-to-finish plus barriers-to-last-600m and last `600m/400m/200m/100m`, with optional `1200m/1000m/800m` where markers/vision permit.
- [B] The same guide repeats broad coverage claims (`92%+` races since 2012) and wide-position capture since 2014, while explicitly spanning TAB meetings in Australia, Singapore, Hong Kong, and North America.
- [A] Current API reference pages show `MeetingSectionals` and `MeetingBenchmarks` available to `Modeller and commercial subscriptions` (token-auth required), while baseline `Form` remains `Starter subscriptions and up`.
- [B] Inference: our feature contracts must separate `form-core` from `sectional/benchmark` feature families at entitlement-check time and treat regional/marker-availability as structured missingness.

Extracted data fields to add:
- `sectional_schema.min_split_set(start_to_finish|barriers_to_600|last_600|last_400|last_200|last_100)`
- `sectional_schema.optional_split_set(last_1200|last_1000|last_800)`
- `sectional_capture.marker_available_flag`
- `sectional_capture.vision_available_flag`
- `sectional_capture.region(aus|sg|hk|na)`
- `provider_endpoint_entitlement.endpoint_name(form|meetingsectionals|meetingbenchmarks)`
- `provider_endpoint_entitlement.min_tier(starter|modeller|commercial)`

Model ideas:
- Build split-family-aware pace features that degrade gracefully when optional long splits (`1200/1000/800`) are unavailable.
- Run two champion/challenger tracks: `starter_form_only` and `modeller_sectional_enhanced`, with separate promotion gates.

Execution lessons:
- Treat split taxonomy as schema, not free text, so feature generation does not silently break when marker availability changes by venue.
- Enforce entitlement checks per endpoint family before each batch/stream run to avoid accidental sectionals leakage in Starter-tier environments.

Contradiction noted:
- Prior simplification: `MeetingSectionals` was treated as Starter-tier compatible. Current API docs indicate sectionals/benchmarks are Modeller-or-commercial gated while Starter access applies to core form endpoints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing NYRA/operator policy coverage.
- [A] Strongest net-new signal this pass is platform-contract and provider-entitlement drift: Betfair market-data contract revision plus Punting Form split/entitlement clarification.

## Source notes (incremental additions for pass 36)

- Betfair support: What Betfair Exchange market data is available from `listMarketBook` & Stream API? (updated 2026-03-27): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Punting Form docs: Sectional Data (coverage/split taxonomy): https://docs.puntingform.com.au/docs/sectional-data
- Punting Form API reference: `MeetingSectionals` (tier + auth): https://docs.puntingform.com.au/reference/meetingsectionals
- Punting Form API reference: `MeetingBenchmarks` (tier + auth): https://docs.puntingform.com.au/reference/meetingbenchmarks
- Punting Form API reference: `Form` (Starter+ baseline): https://docs.puntingform.com.au/reference/form-1

## Incremental sourced findings added in this run (2026-03-30, pass 37)

### Betfair market-discovery and execution-option semantics create hidden routing risk in AU racing collectors

- [A] Betfair Betting Type Definitions state `MarketFilter.textQuery` only evaluates event-name text and does not evaluate market or selection names.
- [A] The same page states `MarketFilter.marketCountries` defaults to `GB` when country code cannot be determined.
- [A] Betfair also documents `venues` filtering as applicable to horse and greyhound markets, which makes venue-based discovery logic racing-specific and fragile if reused across non-racing event types.
- [A] Betfair Exchange General Rules state Best Price Execution is enabled by default; disabling is presented as a UK-resident toggle.
- [B] Inference: discovery misses can be caused by filter-contract assumptions (text scope, default-country fallback) rather than transport faults, and execution replay should treat price-improvement behavior as jurisdiction/config dependent rather than globally optional.

Extracted data fields to add:
- `market_filter_contract.text_query_scope(event_name_only|market_name|selection_name)`
- `market_filter_contract.market_country_fallback`
- `market_filter_contract.venues_filter_scope`
- `market_discovery_event.filter_payload_hash`
- `market_discovery_event.unresolved_country_code_flag`
- `market_discovery_event.default_country_fallback_applied_flag`
- `execution_option.best_price_execution_default_on_flag`
- `execution_option.best_price_execution_disable_scope`
- `execution_option.account_jurisdiction`

Model ideas:
- Add a `discovery_contract_risk_score` feature that penalizes confidence when filter payloads depend on fallback country behavior.
- Add an execution-path regime flag for `best_price_execution_effective` so fill/slippage models separate expected price improvement from strict submitted-price behavior.

Execution lessons:
- Store canonical market-discovery filter payloads and contract snapshots with every ingestion run.
- Treat empty discovery responses as potentially contract-driven (filter semantics) before escalating as feed outages.

Contradiction noted:
- Prior simplification: market discovery filters were straightforward and globally intuitive. Betfair docs show non-obvious scope/fallback semantics that can silently bias AU market collection.

### Racing Victoria MBL policy adds concrete fixed-odds acceptance and exclusion semantics not interchangeable with NSW/QLD assumptions

- [A] Racing Victoria's Minimum Bet Limit page states Victorian thoroughbred fixed-odds obligations apply after Final Acceptances Deadline, with metropolitan limits up to `$2,000` to lose (`$800` place) and non-metropolitan limits up to `$1,000` to lose (`$400` place).
- [A] The same page lists explicit exclusions including betting-exchange transactions, retail bets, multi-bets, insufficient funds, and multiple integrity/account-state exceptions.
- [A] Racing Victoria states complaints should be lodged within `14 days` of incident (with extension context when operator response is pending).
- [B] Inference: a jurisdiction-specific policy engine is required for fixed-odds routing, because NSW/QLD-style minimum-bet assumptions do not fully encode Victoria's exclusion and timing semantics.

Extracted data fields to add:
- `vic_mbl_policy.effective_start_date`
- `vic_mbl_policy.fixed_odds_only_flag`
- `vic_mbl_policy.post_final_acceptances_only_flag`
- `vic_mbl_limit.metro_win_to_lose`
- `vic_mbl_limit.metro_place_to_lose`
- `vic_mbl_limit.non_metro_win_to_lose`
- `vic_mbl_limit.non_metro_place_to_lose`
- `vic_mbl_exclusion.exchange_transaction_flag`
- `vic_mbl_exclusion.multi_bet_flag`
- `vic_mbl_exclusion.retail_transaction_flag`
- `vic_mbl_exclusion.insufficient_funds_flag`
- `vic_mbl_complaint_window.days`

Model ideas:
- Add a `vic_mbl_eligible_flag` and simulate fixed-odds acceptance probability conditioned on policy exclusions.
- Include `post_final_acceptances_window` as an execution eligibility feature for fixed-odds strategy modules in Victoria.

Execution lessons:
- Separate exchange and fixed-odds policy checks before order routing in Victorian races.
- Persist rejection reasons against explicit MBL exclusion codes to support complaint/audit workflows.

Contradiction noted:
- Prior simplification: minimum-bet-limit handling could be generalized from NSW/QLD policies. RV documentation shows materially different exclusion granularity and explicit fixed-odds timing gates.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy sources.
- [A] Strongest net-new signal this pass is contract-level execution and regulatory-routing semantics (Betfair filter behavior + Victorian MBL rules).

## Source notes (incremental additions for pass 37)

- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%2BType%2BDefinitions
- Betfair Exchange Introduction & General Rules (Best Price Execution section): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Racing Victoria Minimum Bet Limit policy/FAQ page: https://www.racingvictoria.com.au/wagering/minimum-bet-limit

## Incremental sourced findings added in this run (2026-03-30, pass 38)

### Betfair `updateOrders` is a dedicated persistence-mutation path and should be treated as a separate execution regime

- [A] Betfair `updateOrders` is explicitly scoped to `Update non-exposure changing fields`, with a request cap of `60` update instructions and optional `customerRef` (up to 32 chars) for de-duplication.
- [A] Betfair Betting Type Definitions define `UpdateInstruction` as updating a LIMIT bet's persistence (`newPersistenceType`) and not changing exposure.
- [B] Inference: persistence mutation (`LAPSE`/`PERSIST` control path) should be modeled as a queue-state governance action, not grouped with stake/price-changing actions such as `replaceOrders`.

Extracted data fields to add:
- `order_update_event.market_id`
- `order_update_event.bet_id`
- `order_update_event.new_persistence_type`
- `order_update_event.customer_ref`
- `order_update_event.request_instruction_count`
- `order_update_event.non_exposure_change_flag`
- `order_update_event.execution_report_status`
- `order_update_event.execution_report_error_code`

Model ideas:
- Add a `persistence_flip_rate` feature by `sec_to_post` bucket to explain unmatched carry-through behavior into suspend/in-play transitions.
- Train fill-risk challengers with a separate `update_path_used_flag` so persistence edits are not conflated with cancel/replace churn.

Execution lessons:
- Prefer `updateOrders` for persistence transitions rather than cancel/replace workflows when exposure must remain constant.
- Alert when `request_instruction_count > 60` before dispatch to avoid preventable execution-report failures.

Contradiction noted:
- Prior simplification: order-state changes were mainly modeled as place/cancel/replace lifecycles. Betfair documents a distinct non-exposure `updateOrders` path for persistence-only state mutation.

### Betfair betting-endpoint routing is jurisdiction-regime metadata (global `.com` vs NZ `.com.au`)

- [A] Betfair Betting API docs provide separate betting endpoints for global exchange users and state that New Zealand-based customers must use the `.com.au` JSON-RPC/REST betting endpoints.
- [B] Inference: endpoint-base selection belongs in jurisdiction contracts and should be audited per session to prevent silent routing mismatches and degraded order/market calls.

Extracted data fields to add:
- `betting_endpoint_regime.account_region(global|nz)`
- `betting_endpoint_regime.jsonrpc_base_url`
- `betting_endpoint_regime.rest_base_url`
- `betting_endpoint_regime.selection_reason(account_jurisdiction|config_override)`
- `betting_endpoint_regime.snapshot_ts`
- `api_call_audit.endpoint_base_url`
- `api_call_audit.endpoint_regime_match_flag`

Model ideas:
- Add an `endpoint_regime_health_flag` to suppress execution-quality attribution during endpoint-routing mismatches.

Execution lessons:
- Validate endpoint base URL against account jurisdiction at startup and on token-refresh boundaries.
- Persist endpoint-regime snapshots so replay reproduces the original transport/routing context.

Contradiction noted:
- Prior simplification: a single global betting endpoint was operationally sufficient. Betfair docs define jurisdiction-specific betting endpoint routing for NZ accounts.

### Punting Form documentation lifecycle signal: visible docs versioning remains coarse (`v1.0`), so contract drift detection must be endpoint-first

- [A] Punting Form's public docs navigation (captured this run) shows `Guides`, `API Reference`, `Changelog`, and a visible `v1.0` version marker on the Getting Started surface.
- [B] Inference: provider-doc versioning appears coarse at public-doc level, so production change detection should rely on endpoint contract snapshots and runtime validation rather than docs-version labels alone.

Extracted data fields to add:
- `provider_docs_surface.provider`
- `provider_docs_surface.visible_version_label`
- `provider_docs_surface.changelog_nav_present_flag`
- `provider_docs_surface.capture_ts`
- `provider_contract_drift_check.endpoint_schema_hash`
- `provider_contract_drift_check.docs_version_label`

Model ideas:
- Add a `docs_signal_strength` feature to provider-confidence scoring, downweighting doc-only drift checks when visible versioning is coarse.

Execution lessons:
- Keep docs-based drift checks as advisory; gate production behavior on endpoint-schema and entitlement snapshots.

Contradiction noted:
- Prior simplification: provider docs-version labels were assumed to be sufficient early-warning signals for API-surface change.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy sources.
- [A] Strongest net-new signal this pass is execution contract granularity (`updateOrders` persistence path) and routing-contract specificity (Betfair endpoint regime), with provider-doc drift controls for Australian data ingestion.

## Source notes (incremental additions for pass 38)

- Betfair `updateOrders` operation (updated 2024-06-19): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687485/updateOrders
- Betfair Betting Type Definitions (`UpdateInstruction` / `UpdateExecutionReport` structures): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Betfair Betting API endpoint matrix (global vs NZ endpoint routing): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687158/Betting%2BAPI
- Punting Form Getting Started docs surface (`Guides`/`API Reference`/`Changelog`, `v1.0` marker): https://docs.puntingform.com.au/docs/getting-started

## Incremental sourced findings added in this run (2026-03-30, pass 40)

### Racing Australia SNS access and code-of-conduct terms add hard entitlement boundaries for production data use

- [A] Racing Australia's SNS login page states SNS is the national database used to manage race fields, race form, and race results, and that access is provided only to authorised personnel at PRAs and race clubs for work-related purposes.
- [A] The same SNS login page states sharing credentials, personal use, or providing information to third parties for personal or commercial use is a breach of terms.
- [A] Racing Australia's SNS Code of Conduct (updated May 2021) states Racing Materials are protected by copyright, are for legitimate business-related purposes only, and must not be used for personal gain or profit.
- [A] The Code of Conduct also states non-public racing materials must not be shared without prior written approval, and RA reserves the right to monitor usage by individual user ID.
- [B] Inference: provider integration must treat SNS-sourced artifacts as rights-constrained operational inputs, not general-purpose model-training data unless explicit commercial/legal approval is documented.

Extracted data fields to add:
- `provider_access_regime.provider(ra_sns)`
- `provider_access_regime.authorised_user_class(pra|race_club|other)`
- `provider_access_regime.business_use_only_flag`
- `provider_access_regime.third_party_share_prohibited_flag`
- `provider_access_regime.personal_gain_prohibited_flag`
- `provider_access_regime.usage_monitoring_flag`
- `provider_access_regime.source_effective_date`
- `provider_access_regime.support_hours_text`

Model ideas:
- Add an `entitlement_hard_block_flag` so features derived from SNS-only surfaces cannot enter training/inference pipelines without a matching commercial-rights record.
- Add a `provider_support_window_risk` feature to outage/recovery models so weekend or holiday incidents are scored with realistic response-latency priors.

Execution lessons:
- Keep SNS data lineage physically separated from public/free-field ingestion paths.
- Require explicit legal metadata on every provider snapshot before enabling downstream redistribution, warehousing, or model promotion.

Contradiction noted:
- Prior simplification: Racing Australia national-system data was treated as a normal provider feed if technically reachable. Official SNS terms define explicit user-class and use-purpose constraints.

### HKJC 2023/24 turnover decomposition adds a second-year commingling baseline for Hong Kong portability checks

- [A] HKJC's FY2023/24 results release states commingled turnover on Hong Kong racing rose `13.7%` to `HK$28.8b`, representing `23.7%` of local racing turnover.
- [A] The same release states simulcasting plus World Pool turnover rose `8.7%` to `HK$12.8b` with an additional 83 top overseas races.
- [A] The release also reports overall racing wagering turnover for the season down `4.5%` to `HK$134.7b` despite commingling growth.
- [B] Inference: portability studies from Benter/Woods-style Hong Kong edges should model commingling growth and domestic-turnover decline jointly, not as a single liquidity trend.

Extracted data fields to add:
- `commingling_regime_snapshot.report_period(fy2023_24)`
- `commingling_regime_snapshot.commingled_turnover_hkd`
- `commingling_regime_snapshot.commingled_share_pct`
- `world_pool_snapshot.turnover_hkd`
- `world_pool_snapshot.additional_overseas_race_count`
- `market_turnover_snapshot.local_racing_turnover_hkd`
- `market_turnover_snapshot.total_racing_turnover_hkd`
- `market_turnover_snapshot.yoy_change_pct`

Model ideas:
- Build a `liquidity_mix_shift` regime feature that tracks commingled-share and local-turnover direction separately.
- Add a transfer-learning guard that downweights HK-trained liquidity assumptions when local-turnover trend diverges from commingling trend.

Execution lessons:
- Benchmark Hong Kong-derived microstructure priors against at least two consecutive HKJC seasons before using them in AU execution parameterization.
- Separate commingled-pool growth from total-turnover growth in all capacity and slippage extrapolations.

Contradiction noted:
- Prior simplification: rising commingling share was treated as a direct proxy for overall turnover strength. HKJC reports commingling growth alongside a season-level total-turnover decline.

### Betfair documentation-surface access mode has become a reliability variable for contract snapshots

- [A] Betfair's current `Additional Information` page (captured this run) shows `Updated Mar 19` and states anonymous viewers may have blocked content.
- [A] The same page family has a publicly accessible historical version with explicit tables for price increments, error codes, and currency parameters.
- [B] Inference: documentation ingestion should model `access_mode` (anonymous vs authenticated) because contract visibility can differ by session state even when URLs are stable.

Extracted data fields to add:
- `docs_capture_event.provider(betfair)`
- `docs_capture_event.page_id`
- `docs_capture_event.page_updated_text`
- `docs_capture_event.access_mode(anonymous|authenticated)`
- `docs_capture_event.content_blocked_flag`
- `docs_capture_event.visible_section_count`

Model ideas:
- Add a `doc_visibility_confidence` score to contract-drift alerts so low-visibility captures trigger re-fetch before escalating production changes.

Execution lessons:
- Store both authenticated and anonymous capture metadata in contract registries.
- Do not treat missing sections in anonymous captures as definitive contract removals.

Contradiction noted:
- Prior simplification: stable doc URL implied stable contract observability. Current Betfair docs surfaces show access-mode-dependent visibility.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy sources.
- [A] Strongest net-new signal this pass is provider-rights/access governance and cross-season market-structure decomposition (RA SNS + HKJC FY2023/24).

## Source notes (incremental additions for pass 40)

- Racing Australia SNS login page (SNS purpose/access/scope + support window): https://racingaustralia.horse/IndustryLogin/SNS_Login.aspx
- Racing Australia Single National System Code of Conduct (updated May 2021): https://racingaustralia.horse/AboutUs/Single-National-System-Code-of-Conduct.aspx
- HKJC FY2023/24 results release (commingled share + World Pool/simulcast turnover): https://corporate.hkjc.com/corporate/corporate-news/english/2024-09/news_2024090402030.aspx
- Betfair Additional Information (current surface, updated Mar 19, anonymous visibility note): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2686993/Additional%2BInformation
- Betfair Additional Information (historical fully visible version with price/currency/error tables): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053

## Incremental sourced findings added in this run (2026-03-30, pass 41)

### CAW-team footprint signal: high-volume wagering concentration can be tracked with regulator hub data plus institutional-share estimates

- [B] Thoroughbred Idea Foundation's *Wagering Insecurity* series states high-volume betting shops / secondary pari-mutuel organizations were estimated at `33%` to `40%` of 2020 U.S. Thoroughbred handle (around `$4b` of `$10.92b`), versus roughly `8%` in 2003.
- [A] Oregon Racing Commission's 2025 quarterly multi-jurisdictional handle report shows concentrated ADW-hub throughput (`$6.824b` total; large shares through Churchill/TwinSpires and ODS/TVG licensees).
- [B] Inference: CAW/HVBS exposure should be modeled as a concentration regime (`share + hub concentration`) rather than a binary "CAW present" flag.

Extracted data fields to add:
- `caw_flow_snapshot.report_year`
- `caw_flow_snapshot.estimated_hvbs_share_low_pct`
- `caw_flow_snapshot.estimated_hvbs_share_high_pct`
- `hub_handle_snapshot.jurisdiction(oregon_mj_hubs)`
- `hub_handle_snapshot.calendar_year`
- `hub_handle_snapshot.total_handle_usd`
- `hub_handle_snapshot.operator_name`
- `hub_handle_snapshot.operator_handle_usd`
- `hub_handle_snapshot.operator_share_pct`

Model ideas:
- Add a `caw_concentration_regime` feature combining estimated institutional-share bands with observed hub concentration (Herfindahl or top-2 share).
- Segment late-odds-jump labels by concentration regime so microstructure parameters are not pooled across structurally different flow states.

Execution lessons:
- Keep CAW-flow assumptions versioned by season and jurisdiction, not static constants.
- Require both a concentration estimate and observed handle concentration before applying aggressive late-window drift priors.

Contradiction noted:
- Prior simplification: CAW impact was mainly treated as qualitative late-odds behavior. New regulator + industry data supports explicit concentration-state modeling.

### Betfair request-weight matrix is now explicit enough for deterministic pre-dispatch shaping

- [A] Betfair's developer limits page defines `sum(weight) * number_of_marketIds <= 200`; breaches return `TOO_MUCH_DATA`.
- [A] The same page publishes concrete non-additive projection combos (`EX_BEST_OFFERS + EX_TRADED = 20`, `EX_ALL_OFFERS + EX_TRADED = 32`) and depth scaling (`weight * requestedDepth/3` for `exBestOffersOverrides`).
- [A] `listMarketCatalogue` weighting also distinguishes metadata surfaces (`MARKET_DESCRIPTION=1`, `RUNNER_METADATA=1`) from zero-weight projections, so catalogue enrichment is not "free" at scale.

Extracted data fields to add:
- `request_weight_matrix.source_updated_ts`
- `request_weight_matrix.price_projection_combo`
- `request_weight_matrix.combo_weight`
- `request_weight_matrix.depth_scaling_formula`
- `catalogue_weight_projection.market_projection`
- `catalogue_weight_projection.weight`
- `request_shape_decision.split_strategy`
- `request_shape_decision.projected_weight_product`

Model ideas:
- Add `collector_shape_mode` as a feature in data-quality confidence models to down-rank windows that required aggressive depth splitting.
- Add `predicted_weight_margin` (`200 - projected_weight_product`) as an execution-risk covariate for near-jump freshness degradation.

Execution lessons:
- Compute request shape deterministically before dispatch; never rely on post-error retries for weight compliance.
- Track catalogue-weight usage separately from price-weight usage so metadata enrichment cannot silently starve live price collection.

Contradiction noted:
- Prior simplification: request-weight planning was mostly a price-projection problem. Official limits show catalogue projections also consume finite budget.

### Australian provider contract delta: Punting Form PF AI release clock and benchmark-price convention are usable as a timing regime

- [B] Punting Form's PF AI Ratings documentation states ratings are released within `1 hour` of market opening for AU/HK/SG TAB meetings.
- [B] The same documentation states PF AI ratings are generated without market-price inputs, while the published EV bet-selection convention compares PF AI Price against TAB Fixed Odds at release time.
- [C] Performance claims on the page are provider-published marketing metrics and should be treated as hypothesis inputs until independently reproduced.

Extracted data fields to add:
- `provider_release_clock.provider`
- `provider_release_clock.product(pf_ai_ratings)`
- `provider_release_clock.release_window_from_market_open_min`
- `provider_release_clock.release_reference_price_surface(tab_fixed_odds)`
- `provider_release_clock.coverage_scope(au_hk_sg_tab)`
- `provider_claim_snapshot.backtest_start_date`
- `provider_claim_snapshot.backtest_end_date`
- `provider_claim_snapshot.independent_validation_status`

Model ideas:
- Add a `provider_release_phase` feature (`pre_release`, `release_window`, `post_release`) when evaluating third-party signal drift and crowding risk.
- Build challenger labels using both TAB-at-release and exchange-at-release references to isolate benchmark-surface bias.

Execution lessons:
- Timestamp provider-signal arrival relative to market-open and first tradable exchange depth.
- Keep provider-claimed backtests in a quarantined evidence tier until reproducible with internal point-in-time data.

Contradiction noted:
- Prior simplification: third-party ratings were treated as continuously available features. Provider documentation indicates discrete release-window timing and a specific benchmark-price convention.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [B] Net-new CAW-team evidence this pass is structural/compositional (institutional-share concentration and hub-flow concentration), not proprietary model internals.
- [A] Strongest net-new signal this pass is concentration-state modeling for CAW impact plus explicit provider-release timing contracts.

## Source notes (incremental additions for pass 41)

- Thoroughbred Idea Foundation, *Wagering Insecurity* (HVBS/SPMO share estimates, 2020 vs 2003 context): https://racingthinktank.com/reports/wagering-insecurity
- Oregon Racing Commission ADW hub page (report index and cadence): https://www.oregon.gov/racing/Pages/Advance-Deposit-Wagering.aspx
- Oregon Racing Commission Quarterly Handle PDF (2025/2024/2023 operator-level totals): https://www.oregon.gov/racing/Parimutuel%20Handle/MJ%20Hubs%20Stats/QT%20HND.pdf
- Betfair Market Data Request Limits (official developer-doc weight matrix and combo weights): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687478/Market%2BData%2BRequest%2BLimits
- Punting Form PF AI Ratings documentation (release-window and benchmark-price convention): https://docs.puntingform.com.au/docs/punting-form-ai-ratings

## Incremental sourced findings added in this run (2026-03-30, pass 42)

### Queensland race-information authority mechanics add explicit application-cycle and submission-profile contracts

- [A] Racing Queensland's race-information page states Section 133 of the Racing Act 2002 (Qld) makes it an offence for a licensed wagering operator to use Queensland race information without an authority.
- [A] The same page states the current authority period runs from `2025-07-01` to `2027-06-30`, and specifies a `$250` application fee for applicants that have not previously held an authority.
- [A] The page also publishes distinct operational artefacts for authorised operators: over/under `$5m` submission templates/definitions, plus 2025-effective FTP and oncourse-portal submission instructions, and a separate annual return/audit template.
- [B] Inference: provider governance should model QLD as an authority-lifecycle regime with explicit reporting-profile routing (turnover-tier + oncourse/offcourse channel), not a static entitlement flag.

Extracted data fields to add:
- `qld_race_info_authority.period_start`
- `qld_race_info_authority.period_end`
- `qld_race_info_authority.section_133_offence_without_authority_flag`
- `qld_race_info_authority.new_applicant_fee_aud`
- `qld_submission_profile.operator_band(over_5m|under_5m|oncourse)`
- `qld_submission_profile.template_effective_from`
- `qld_submission_profile.transport_mode(ftp|portal)`
- `qld_submission_profile.required_definition_doc_flag`
- `qld_annual_return_audit.template_available_flag`

Model ideas:
- Add an `authority_cycle_state` feature so historical performance can be segmented by authority period and reporting-rule set.
- Add `submission_profile_mismatch_risk` to ingestion confidence scoring when observed payload shape diverges from the declared operator profile.

Execution lessons:
- Treat turnover-band and channel profile as ingestion-contract selectors before parsing any QLD-authority submissions.
- Track authority-period boundaries as deployment events because submission artefacts can change without API-version signals.

Contradiction noted:
- Prior simplification: QLD provider access was represented mainly as approved-supplier status. The authority page defines a broader lifecycle including offence semantics, fee-triggered onboarding class, and profile-specific submission contracts.

### Racing Australia Fact Book 2024/25 provides new national race-volume priors for AU model-capacity planning

- [A] Racing Australia's Fact Book 2025 (2024/25 season) reports national TAB vs non-TAB segmentation at race and starter granularity: `17,100` TAB races vs `1,934` non-TAB races, and `165,790` TAB starts vs `14,213` non-TAB starts.
- [A] The same table reports `2,214` TAB meetings vs `355` non-TAB meetings for 2024/25.
- [A] Fact Book page 70 reports total races at `19,034` for 2024/25 (`-0.86%` YoY), with metro races `4,863` (`-0.90%`) and country races `14,171` (`-0.85%`).
- [B] Inference: AU capacity/coverage priors should be explicitly TAB-segmented and metro-country segmented; a single national race-volume prior obscures materially different liquidity and model-stability regimes.

Extracted data fields to add:
- `au_race_volume_snapshot.season`
- `au_race_volume_snapshot.tab_meetings_count`
- `au_race_volume_snapshot.non_tab_meetings_count`
- `au_race_volume_snapshot.tab_races_count`
- `au_race_volume_snapshot.non_tab_races_count`
- `au_race_volume_snapshot.tab_starters_count`
- `au_race_volume_snapshot.non_tab_starters_count`
- `au_race_trend_snapshot.metro_races_count`
- `au_race_trend_snapshot.country_races_count`
- `au_race_trend_snapshot.total_races_yoy_pct`

Model ideas:
- Add a `market_coverage_density` regime feature derived from TAB/non-TAB share and metro/country split to tune minimum-sample thresholds by slice.
- Use race-volume priors to set dynamic retraining cadence (faster for high-density TAB metro slices, slower for sparse non-TAB segments).

Execution lessons:
- Capacity planning (collector throughput, feature refresh cadence, and backtest window sizing) should use segmented national counts rather than undifferentiated totals.
- Report model diagnostics by TAB and metro/country regime to prevent aggregate metrics from hiding sparse-slice failure.

Contradiction noted:
- Prior simplification: AU race-volume assumptions were often treated as one aggregate market-size number. Fact Book 2024/25 shows strong structural segmentation that should be first-class in planning.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team methodological disclosure was identified this pass beyond existing policy and flow-concentration sources.
- [A] Strongest net-new signal this pass is Australian authority-cycle/provider-contract mechanics plus national race-volume segmentation priors.

## Source notes (incremental additions for pass 42)

- Racing Queensland race-information authority page (Section 133, authority period, fee, submission artefacts): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Australia Fact Book 2025, page 12 (TAB vs non-TAB meetings/races/starters): https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/12/
- Racing Australia Fact Book 2025, page 70 (metro/country/total race trend): https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/70/

## Incremental sourced findings added in this run (2026-03-30, pass 43)

### Betfair legal-availability routing is a first-class market-visibility contract (not a discovery bug)

- [A] Betfair Developer Support states `listEvents`, `listMarketCatalogue`, and `listMarketBook` can return empty responses when access originates from legally restricted locations/IP ranges (example explicitly given: Germany/German IP).
- [A] The same support note states Singapore horse-racing markets are returned only for AUS/NZ customers.
- [B] Inference: empty discovery/book responses must be classified by legal-access regime before being treated as provider outage or filter-contract failure.

Extracted data fields to add:
- `market_visibility_regime_snapshot.provider(betfair)`
- `market_visibility_regime_snapshot.region_or_ip_group`
- `market_visibility_regime_snapshot.restricted_market_scope`
- `market_visibility_regime_snapshot.empty_response_expected_flag`
- `market_visibility_regime_snapshot.source_updated_ts`
- `market_visibility_audit.account_region`
- `market_visibility_audit.request_region_hint`
- `market_visibility_audit.empty_result_flag`
- `market_visibility_audit.classification(legal_restriction|filter_mismatch|provider_state)`

Model ideas:
- Add a `visibility_regime_confidence` feature so collection gaps from legal restrictions do not contaminate liquidity or outage labels.
- Build region-aware transfer-learning guards that suppress Singapore-horse market assumptions for non-AUS/NZ account regimes.

Execution lessons:
- Treat sustained empty results as triage events with explicit legal-access checks before paging on-call.
- Persist account-region/session context with every discovery and market-book request to support deterministic incident classification.

Contradiction noted:
- Prior simplification: empty discovery/book responses mostly implied query/filter issues. Betfair now documents jurisdiction/legal-access causes that intentionally return empty payloads.

### Betfair `TOO_MANY_REQUESTS` on `listMarketBook` has cross-endpoint queue contention semantics

- [A] Betfair Developer Support states the conditional queue limit applies at account level (not session level) when `listMarketBook` requests include `OrderProjection` or `MatchProjection`.
- [A] The same support article states `listMarketBook` (with these projections), `listCurrentOrders`, and `listMarketProfitAndLoss` can contend with each other, with queueing behavior around three ready-for-processing requests under load.
- [A] The same source distinguishes this from `listClearedOrders`, which has separate rate limiting and does not contend with those calls.
- [B] Inference: order-state polling architecture must be globally scheduled by account and endpoint mix, not independently tuned per collector worker.

Extracted data fields to add:
- `request_queue_regime.provider(betfair)`
- `request_queue_regime.account_scoped_limit_flag`
- `request_queue_regime.contention_group(listMarketBook_proj,listCurrentOrders,listMarketProfitAndLoss)`
- `request_queue_regime.non_contention_endpoint(listClearedOrders)`
- `queue_contention_event.account_id_hash`
- `queue_contention_event.operation_name`
- `queue_contention_event.order_or_match_projection_requested_flag`
- `queue_contention_event.concurrent_ready_request_count`
- `queue_contention_event.error_code`

Model ideas:
- Add `queue_contention_state` as a data-freshness covariate in pre-off price/latency models.
- Add endpoint-mix features (`book_proj_rate`, `current_orders_rate`, `pnl_rate`) to explain abrupt staleness spikes before jump.

Execution lessons:
- Centralize account-level request scheduling across market and order services; do not let each service self-throttle in isolation.
- Use degraded-mode policies that temporarily drop optional projections before cutting core top-of-book freshness.

Contradiction noted:
- Prior simplification: `TOO_MANY_REQUESTS` was mainly a per-endpoint throughput issue. Support guidance shows cross-endpoint contention within an account-scoped queue regime.

### Racing Australia BTAG formation (11 March 2026) strengthens black-type governance-transition evidence

- [A] Racing Australia's 11 March 2026 media release confirms Board approval of a Black Type Advisory Group (BTAG) following the 17 December 2025 transition notice.
- [A] The release states BTAG membership is drawn from industry groups and explicitly excludes people with roles at Racing Australia, PRAs, or racing clubs.
- [A] The release states BTAG will provide independent advice on upgrades, downgrades, and additions to the Australian Black Type list via Racing Australia to PRAs and the Asian Pattern Committee.
- [B] Inference: race-class governance should now be treated as a multi-body advisory workflow with explicit independence constraints, not a single static authority map.

Extracted data fields to add:
- `black_type_governance_event.event_date`
- `black_type_governance_event.body_name(btag)`
- `black_type_governance_event.board_approved_flag`
- `black_type_governance_event.member_count`
- `black_type_governance_event.independence_constraint_text`
- `black_type_governance_event.advice_scope(upgrade|downgrade|addition)`
- `black_type_governance_event.downstream_decision_bodies(pra|apc)`

Model ideas:
- Add a `race_class_governance_complexity` flag so class-label stability priors widen during multi-body transition windows.
- Add governance-event features around class changes to isolate policy-driven class drift from true performance drift.

Execution lessons:
- Version class labels with governance-body provenance, not just effective date.
- Require replay-safe class snapshots around black-type decision windows to avoid backtest leakage from later-class revisions.

Contradiction noted:
- Prior simplification: post-ARF transition governance was primarily framed as APC responsibility. March 2026 evidence adds a formal independent advisory layer with explicit scope and constraints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality primary CAW-team proprietary model disclosure was identified this pass.
- [A] Strongest net-new signal this pass is Betfair legal-availability and account-queue contention mechanics plus Australian black-type governance-process formalization.

## Source notes (incremental additions for pass 43)

- Betfair support: jurisdiction/legal-restriction empty responses and Singapore horse-market access scope (updated 2025-11-28): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listMarketCatalogue-API-response
- Betfair support: `TOO_MANY_REQUESTS` queue contention semantics across `listMarketBook` projections, `listCurrentOrders`, `listMarketProfitAndLoss` (updated 2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/360000406111-Why-am-I-receiving-the-TOO-MANY-REQUESTS-error
- Racing Australia media release index (shows 11 March 2026 BTAG announcement): https://www.racingaustralia.horse/FreeServices/MediaReleases.aspx
- Racing Australia PDF: Statement on formation of Black Type Advisory Group (11 March 2026): https://www.racingaustralia.horse/uploadimg/media-releases/Statement-on-formation-of-Black-Type-Advisory-Group.pdf

## Incremental sourced findings added in this run (2026-03-30, pass 44)

### CHRB market-access-fee agreements add a concrete takeout-threshold regime for ADW economics

- [A] CHRB staff analysis for the 2026 Southern California Stabling and Vanning Funding Agreement (board item dated 2025-11-19) states the statutory `2%` off-track allocation has been insufficient in recent years and records an agreed ADW-handle deduction of `1.85%` for the Southern California Stabling and Vanning fund.
- [A] The same approved agreement keeps CTBA incentive-fund distribution at `0.463%` of California ADW handle on races hosted by signatory associations.
- [A] CHRB's 2026 amendment request item (regular board meeting 2026-01-14) states the market-access-fee alteration from four prior agreements does not apply in any calendar month where racetrack blended takeout is below `15%`, and treats separate pooled (`non-commingled`) wagers as a single racetrack for that clause.
- [B] Inference: ADW unit economics in CA should be modeled as a thresholded regime with monthly blended-takeout exception logic, not as a fixed deduction schedule.

Extracted data fields to add:
- `chrb_market_access_fee_regime_snapshot.effective_from`
- `chrb_market_access_fee_regime_snapshot.effective_to`
- `chrb_market_access_fee_regime_snapshot.sv_deduction_pct_of_adw_handle`
- `chrb_market_access_fee_regime_snapshot.ctba_incentive_pct_of_adw_handle`
- `chrb_market_access_fee_regime_snapshot.statutory_offtrack_allocation_pct`
- `chrb_market_access_fee_regime_snapshot.blended_takeout_exception_threshold_pct`
- `chrb_market_access_fee_regime_snapshot.exception_scope(non_commingled_single_racetrack_flag)`
- `market_access_fee_exception_event.calendar_month`
- `market_access_fee_exception_event.track_or_pool_group_id`
- `market_access_fee_exception_event.blended_takeout_pct`
- `market_access_fee_exception_event.exception_applied_flag`

Model ideas:
- Add a `takeout_threshold_state` feature to expected-net-return models for California ADW-heavy strategies.
- Stress-test edge durability around monthly boundary transitions where blended-takeout status can flip the fee regime.

Execution lessons:
- Settlement and attribution pipelines need monthly blended-takeout snapshots before final PnL normalization.
- Keep fee-regime logic and takeout-measurement logic versioned together to avoid silent post-hoc PnL drift.

Contradiction noted:
- Prior simplification: ADW market-access-fee deductions were treated as mostly static percentages. CHRB documents explicit monthly threshold exceptions tied to blended takeout.

### Betfair vendor-program constraints add hard execution/distribution guardrails beyond trading-endpoint limits

- [A] Betfair Developer Program vendor process requires web apps to use the Vendor Web API for end-user interactions, disallows browser-extension apps, and states software-vendor applications are not accepted from Italy, Austria, Sri Lanka, or Nepal.
- [A] The same page states a one-off `GBP999` license fee is payable at security-certification submission.
- [A] Betfair's vendor checklist on the same page includes a product-requirement item that applications should not make more than five market-price requests per market per second.
- [B] Inference: any distributed execution client should be modeled as a separate compliance regime (`trader_private_stack` vs `vendor_distributed_stack`) with additional throughput and jurisdiction constraints.

Extracted data fields to add:
- `betfair_vendor_regime_snapshot.captured_ts`
- `betfair_vendor_regime_snapshot.vendor_web_api_required_for_web_app_flag`
- `betfair_vendor_regime_snapshot.browser_extension_permitted_flag`
- `betfair_vendor_regime_snapshot.blocked_vendor_application_countries`
- `betfair_vendor_regime_snapshot.security_certification_fee_gbp`
- `betfair_vendor_regime_snapshot.market_price_req_per_market_per_sec_limit`
- `app_distribution_profile.mode(private_internal|vendor_distributed)`
- `app_distribution_profile.vendor_compliance_required_flag`
- `vendor_throughput_guard_event.market_id`
- `vendor_throughput_guard_event.market_price_req_rate_per_sec`
- `vendor_throughput_guard_event.limit_breach_flag`

Model ideas:
- Add `distribution_mode` as a feature in execution-latency studies so vendor-compliance throttles are not mixed with private-stack behavior.
- Simulate strategy viability under a strict 5-requests-per-market-per-second cap when planning public productization.

Execution lessons:
- Build capability flags at deployment-time (`private` vs `vendor`) and fail fast when runtime behavior crosses vendor constraints.
- Keep vendor-policy snapshots as versioned compliance artifacts because support/docs surfaces can change independently of API schema.

Contradiction noted:
- Prior simplification: execution constraints were mostly endpoint-rate and queue mechanics. Vendor distribution introduces an additional policy layer with its own throughput and certification constraints.

### Racing Australia monthly-report index still exposes publication-cadence risk for provider KPI refresh

- [A] Racing Australia's monthly performance-report page (captured 2026-03-30) lists `January 2026` as the latest month visible in the 2025-2026 section.
- [B] Inference: provider-operational KPI pipelines should continue to treat 2025-2026 monthly report cadence as lag-prone until February/March artifacts appear.

Extracted data fields to add:
- `provider_publication_cadence_snapshot.provider(racing_australia)`
- `provider_publication_cadence_snapshot.page_capture_date`
- `provider_publication_cadence_snapshot.latest_visible_report_month`
- `provider_publication_cadence_snapshot.expected_next_month`
- `provider_publication_cadence_snapshot.lag_months`

Model ideas:
- Add `provider_report_recency_state` features to confidence weighting for provider-process SLA assumptions.

Execution lessons:
- Keep monthly KPI assumptions bounded by observed publication lag rather than calendar expectation.

Contradiction noted:
- Prior simplification: monthly provider KPI refresh was near-calendar-stable. Current listing still tops out at January 2026 as of 2026-03-30 capture.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No new primary CAW-team proprietary model disclosure was identified this pass.
- [A] Strongest net-new signal this pass is CA market-access-fee threshold mechanics plus Betfair vendor-regime execution constraints.

## Source notes (incremental additions for pass 44)

- CHRB board item (2025-11-19): 2026 Southern California Stabling and Vanning ADW fee distribution terms: https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052626&SubCategory=
- CHRB board item (2026-01-14): amendment adding blended-takeout `<15%` exception semantics across prior agreements: https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052699&SubCategory=
- Betfair Developer Program vendor process (Vendor Web API requirement, jurisdiction exclusions, certification fee, checklist constraints): https://developer.betfair.com/vendor-program/the-process/
- Racing Australia monthly service standard performance report index (latest visible month in 2025-2026 section): https://www.racingaustralia.horse/freeservices/performancereport.aspx

## Incremental sourced findings added in this run (2026-03-30, pass 45)

### Del Mar formalized a CAW win-pool cutoff regime at two minutes to post (2025-07-29)

- [A] Del Mar Thoroughbred Club's official press item (published 2025-07-29) states access by computer-assisted wagering (CAW) players to win pools is closed at two minutes prior to scheduled post time.
- [A] The same Del Mar item frames the change as an anti-late-fluctuation measure and explicitly references prior encouragement for earlier CAW processing as insufficient.
- [B] Inference: CAW market-structure policy is venue-specific and parameterized (e.g., NYRA one-minute pool-wide controls vs Del Mar two-minute win-pool control), so microstructure priors must be track-policy aware.

Extracted data fields to add:
- `caw_policy_event.venue_id`
- `caw_policy_event.policy_effective_date`
- `caw_policy_event.caw_cutoff_minutes_to_post`
- `caw_policy_event.affected_pool_types`
- `caw_policy_event.stated_policy_objective`
- `caw_policy_event.source_url`

Model ideas:
- Add `venue_caw_cutoff_minutes` as a late-window feature for odds-jump and fill-probability models.
- Segment pre-off microstructure backtests by `policy_regime_id` so CAW-control venues are not pooled with unrestricted venues.

Execution lessons:
- Do not transfer one venue's CAW timing assumptions to another without explicit policy evidence.
- Store policy-effective timestamps and replay trades under the historical policy active at the event time.

Contradiction noted:
- Prior simplification: CAW controls were treated mostly as a NYRA-style template. Del Mar confirms materially different cutoff timing and pool scope.

### Betfair currency-parameter values show documentation-version drift risk on the same page family

- [A] Betfair's current `Additional Information` page (captured this run) shows `Updated Mar 19` and warns anonymous users that some content may be blocked.
- [B] A publicly indexed historical snapshot (`pageVersion=68`) shows AUD currency parameters as approximately `A$5` minimum bet size, `A$25` minimum BSP liability, and `A$50` minimum bet payout.
- [B] A separately indexed newer snapshot (`pageVersion=131`) shows materially lower AUD values (`A$1`, `A$10`, `A$20`) for those same fields.
- [B] Inference: execution and replay validation should key to captured contract version/hash and session visibility state; static hardcoded currency floors are unsafe.

Extracted data fields to add:
- `currency_parameter_snapshot.provider(betfair)`
- `currency_parameter_snapshot.page_id`
- `currency_parameter_snapshot.page_version`
- `currency_parameter_snapshot.captured_access_mode(anonymous|authenticated|indexed_snapshot)`
- `currency_parameter_snapshot.account_currency`
- `currency_parameter_snapshot.min_bet_size`
- `currency_parameter_snapshot.min_bsp_liability`
- `currency_parameter_snapshot.min_bet_payout`
- `currency_parameter_snapshot.source_updated_text`

Model ideas:
- Add `currency_floor_regime` as an execution-feasibility feature in stake-size optimization.
- Run counterfactual PnL simulations under prior vs current currency floors to estimate regime-sensitivity.

Execution lessons:
- Treat minimum-size/liability/payout checks as versioned runtime config, not compile-time constants.
- Require a fresh authenticated snapshot before promoting any currency-parameter contract change.

Contradiction noted:
- Prior simplification: Betfair currency floors were treated as stable once captured. New indexed versions indicate material parameter drift within the same documentation family.

### Racing and Sports clarifies a distributor-role surface that is distinct from direct end-user API framing

- [B] Racing and Sports' corporate Enhanced Information Services page states RAS is an approved distributor under Racing Australia for Australian race fields.
- [B] The same page frames a distribution-service role as a link between rights holders and racing bodies, and lists broad packaged artifacts (sectionals, proprietary ratings/analytics, speed maps, comments) across 33+ jurisdictions.
- [B] Inference: AU provider contracts should include a `distribution_role` dimension (approved distributor/wholesaler vs direct endpoint provider), because entitlement lineage and redistribution constraints can differ even when data families overlap.

Extracted data fields to add:
- `provider_role_snapshot.provider(ras)`
- `provider_role_snapshot.role_type(approved_distributor|direct_endpoint_provider|hybrid)`
- `provider_role_snapshot.ra_approved_distributor_flag`
- `provider_role_snapshot.claimed_jurisdiction_count`
- `provider_role_snapshot.artifact_family_json`
- `provider_role_snapshot.rights_lineage_text`

Model ideas:
- Add `provider_role_class` as a feature in data-quality priors (distributor feeds may emphasize packaging breadth over raw-timing transparency).
- Use role-aware ensemble weighting when equivalent feature families arrive from direct and distributor channels.

Execution lessons:
- Keep redistribution checks role-aware; distributor-sourced artifacts may have additional onward-use restrictions.
- Preserve provenance to the role layer (`distributor` vs `direct`) for audit and dispute resolution.

Contradiction noted:
- Prior simplification: provider comparisons treated all suppliers as endpoint-equivalent API vendors. RAS material supports a distinct distributor-rights intermediation role.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] The strongest CAW-team-adjacent net-new signal this pass is policy-parameter heterogeneity at venue level (Del Mar 2-minute win-pool cutoff).
- [A] Strongest execution signal this pass is Betfair documentation-version drift for currency-parameter constraints.

## Source notes (incremental additions for pass 45)

- Del Mar official press item (29 Jul 2025): CAW players cut off from win pools two minutes before post: https://www.dmtc.com/media/stable-news/del-mar-to-take-additional-steps-to-curb-late-odds-fluctuations
- Betfair `Additional Information` current page (`Updated Mar 19`, anonymous-block note): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2686993/Additional%2BInformation
- Betfair indexed historical `Additional Information` snapshot (`pageVersion=68`, AUD values visible): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053&pageVersion=68
- Betfair indexed newer `Additional Information` snapshot (`pageVersion=131`, updated AUD values visible): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053&pageVersion=131
- Racing and Sports corporate Enhanced Information Services page (approved distributor claim + distribution-role descriptions): https://racingandsports.company/enhanced-information-services/

## Incremental sourced findings added in this run (2026-03-30, pass 46)

### CHRB-hosted CAW Q&A adds concrete operational mechanics for CAW account structure and tote timing

- [A] In the CHRB-hosted 2024-09-05 `Computer Assisted Wagering` letter, Elite states AmTote provides the same tote feed to Elite and retail channels, and says there is one tote feed across those channels.
- [A] The same source states host-track pools close simultaneously for all guest locations, states Elite players are forbidden from cancelling bets, and describes stop-betting-command timing plus downstream publication lag (`~3-5s` to receive all win-pool data and roughly `10-12s` to calculate/update odds and will-pays).
- [A/B] The same source describes California CAW account controls and thresholds (tracks define CAW as `>5 bets/sec`, unique `TRA` code tracking, onboarding/approval checks, and an Elite-stated minimum wagering threshold of `$20m/year`).
- [B] Inference: CAW microstructure assumptions should be split into (1) pool-close timestamp, (2) tote-computation lag, and (3) display-pipeline lag; post-open odds movement alone is insufficient evidence of post-close bet acceptance.

Extracted data fields to add:
- `caw_operator_process_snapshot.source_type(chrb_hosted_operator_letter)`
- `caw_operator_process_snapshot.same_tote_feed_claim_flag`
- `caw_operator_process_snapshot.pool_close_simultaneous_claim_flag`
- `caw_operator_process_snapshot.bet_cancel_permitted_flag`
- `tote_settlement_latency_snapshot.data_ingest_lag_sec_low`
- `tote_settlement_latency_snapshot.data_ingest_lag_sec_high`
- `tote_settlement_latency_snapshot.odds_compute_lag_sec_low`
- `tote_settlement_latency_snapshot.odds_compute_lag_sec_high`
- `caw_account_rule_snapshot.caw_threshold_bets_per_sec`
- `caw_account_rule_snapshot.unique_tra_code_required_flag`
- `caw_account_rule_snapshot.min_annual_turnover_usd`

Model ideas:
- Add a `tote_publication_latency_regime` feature so late-odds attribution distinguishes compute/display lag from true new-money effects.
- Add `caw_account_rule_tightness` features (threshold + compliance burden) in venue-level CAW-flow prior models.

Execution lessons:
- Anchor all tote reconciliation to stop-betting timestamps, then apply explicit lag windows before flagging anomalies.
- Treat operator-hosted CAW disclosures as high-signal but not regulator-adjudicated; keep source-type metadata explicit.

Contradiction noted:
- Prior simplification: late post-open odds movement was often treated as a betting-window integrity signal by itself. This source supports a layered lag explanation (ingest + compute + display) even when pools are closed.

### Betfair stream change-message contracts add cache-replacement and latency-health semantics not captured in request-budget rules

- [A] Betfair's Exchange Stream API docs state `ct=SUB_IMAGE` can occur not only at initial subscribe but also during an ongoing subscription, and in that case local cache should be replaced entirely.
- [A] The same docs state `status` on change messages is `null` when stream data is up-to-date and `503` when downstream services are experiencing latency.
- [A] The same docs state market and order changes are produced by independent systems with no guarantee of message ordering between them.
- [A] The same docs state heartbeat bounds are `500-5000ms`, and the actual `conflateMs`/`heartbeatMs` returned can differ from requested values due to bounds/delay regime.
- [B] Inference: stream consumers need explicit health-state and cache-state machines; request-rate compliance alone does not guarantee point-in-time correctness.

Extracted data fields to add:
- `stream_change_contract_snapshot.sub_image_midstream_replace_cache_flag`
- `stream_health_event.status_code`
- `stream_health_event.downstream_latency_flag`
- `stream_health_event.actual_conflate_ms`
- `stream_health_event.actual_heartbeat_ms`
- `stream_merge_policy_snapshot.market_order_global_ordering_guaranteed_flag`
- `stream_cache_reset_event.trigger(change_type_sub_image)`
- `stream_cache_reset_event.segment_type`

Model ideas:
- Add a `stream_health_state` feature to down-weight micro-latency-sensitive signals during `status=503` periods.
- Build a cache-integrity challenger that simulates missed `SUB_IMAGE` replacement and measures downstream CLV drift.

Execution lessons:
- Implement hard cache-reset paths keyed to `ct=SUB_IMAGE` even mid-session.
- Reconcile order and market streams via timestamped merge logic rather than assumed delivery order.

Contradiction noted:
- Prior simplification: stable subscription implied delta-only updates and consistent stream health. Betfair contracts explicitly allow midstream full-image replacement and downstream-latency status signaling.

### Racing Australia website terms plus scratching-release timetable add enforceable ingestion and timing constraints for AU provider workflows

- [A] Racing Australia's website terms (updated May 2021) grant use for personal, non-commercial purposes and explicitly prohibit automated tasks (including bots) that search/copy/scrape/store/reuse website materials.
- [A] The same terms/disclaimer state liability limits around defects/errors/omissions are constrained to supplying equivalent material/services.
- [A] Racing Australia's FreeFields scratching-release page defines state-specific interim/final scratching times and notes queue semantics: calls logged before deadline are processed before meeting close.
- [B] Inference: production ingestion must treat direct website scraping as disallowed without explicit permission/commercial pathway, and treat scratching status as a staged state (interim queue completion -> final) rather than a single timestamp.

Extracted data fields to add:
- `provider_terms_snapshot.provider(racing_australia)`
- `provider_terms_snapshot.personal_noncommercial_only_flag`
- `provider_terms_snapshot.automated_scrape_prohibited_flag`
- `provider_terms_snapshot.liability_remedy_type(resupply_equivalent_material)`
- `scratching_release_schedule_snapshot.state_code`
- `scratching_release_schedule_snapshot.interim_close_local_time`
- `scratching_release_schedule_snapshot.final_close_local_time`
- `scratching_release_schedule_snapshot.queue_completion_before_close_flag`
- `scratching_publication_phase_event.phase(interim|final)`
- `scratching_publication_phase_event.provider_processing_queue_open_flag`

Model ideas:
- Add `scratching_phase_state` and `minutes_to_final_scratchings` to late non-runner risk models.
- Add provider-rights gating as a hard feature-availability mask so disallowed acquisition paths never contaminate train/test data.

Execution lessons:
- Route AU production collection through licensed/API-entitled channels; do not rely on website-scrape collectors for durable operations.
- Preserve interim vs final scratching phases in PIT snapshots and settlement replay.

Contradiction noted:
- Prior simplification: FreeFields web surfaces were treated as generally scrapeable operational feeds. Terms language explicitly prohibits automated scraping and narrows permitted use.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Highest CAW-team signal this pass is operational-process disclosure from a CHRB-hosted CAW operator letter (feed parity claims, closure timing, CAW-account controls), plus Betfair stream health/cache contracts.
- [A] Strongest AU data-provider signal this pass is explicit RA terms-of-use automation prohibition and staged scratching-release timing mechanics.

## Source notes (incremental additions for pass 46)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair Exchange Stream API docs (`SUB_IMAGE`, `status=503`, heartbeat/conflation semantics, ordering notes): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange%2BStream%2BAPI
- Racing Australia Website Terms of Use (updated May 2021): https://www.racingaustralia.horse/AboutUs/TermsOfUse.aspx
- Racing Australia Disclaimer (updated May 2021): https://www.racingaustralia.horse/AboutUs/Disclaimer.aspx
- Racing Australia FreeFields Scratching Release Information: https://www.racingaustralia.horse/FreeFields/ScratchingReleaseInformation.aspx

## Incremental sourced findings added in this run (2026-03-31, pass 47)

### CHRB-hosted CAW letter adds quantitative late-money concentration and effective-takeout arithmetic

- [A/B] The CHRB-hosted Elite letter states Santa Anita tracks CAW participation to a target band around 20% of handle, with CAW win-rate not materially above 90%.
- [A/B] The same source reports an audit sample where CAW represented about 17% of win-pool volume but about 43% of wagers in the final 60 seconds (with non-CAW at about 57% of last-minute flow).
- [A/B] The same source provides an explicit worked example where a 20% takeout pool with 20% CAW share and 90% CAW win rate implies retail effective takeout rising to 22.5%.
- [B] Inference: late-odds movement decomposition should include separate concentration terms for total-pool CAW share and final-minute CAW share, not a single CAW-presence flag.

Extracted data fields to add:
- `caw_late_flow_audit_snapshot.source_type(chrb_hosted_operator_letter)`
- `caw_late_flow_audit_snapshot.venue_id`
- `caw_late_flow_audit_snapshot.audit_period_label`
- `caw_late_flow_audit_snapshot.caw_pool_share_pct`
- `caw_late_flow_audit_snapshot.caw_last60s_share_pct`
- `caw_late_flow_audit_snapshot.non_caw_last60s_share_pct`
- `caw_target_policy_snapshot.caw_handle_target_pct`
- `caw_target_policy_snapshot.caw_win_rate_ceiling_pct`
- `effective_takeout_scenario.takeout_nominal_pct`
- `effective_takeout_scenario.caw_pool_share_pct`
- `effective_takeout_scenario.caw_win_rate_pct`
- `effective_takeout_scenario.retail_effective_takeout_pct`

Model ideas:
- Add `last60s_caw_concentration` as a late-window microstructure feature separate from `overall_caw_share`.
- Add a scenario-driven `effective_takeout_uplift_estimate` feature for tote-channel expected value normalization.

Execution lessons:
- Do not attribute all late movement to CAW by default; persist decomposed last-minute flow shares and uncertainty by source type.
- Keep operator-authored CAW metrics tagged as `source_confidence=A/B` until independently corroborated.

Contradiction noted:
- Prior simplification: CAW impact was often modeled as a single scalar presence variable. This source supports at least two distinct concentration dimensions (pool-level and final-minute).

### Betfair historical-data FAQ defines non-trivial market-family blind spots for backtests

- [A] Betfair support states some market families are unavailable in historical data due to technical constraints, including long-term season markets, long-term politics markets, and tennis game-betting markets.
- [A] Betfair support also states historical package schemas are mapped to Stream-API subscription criteria via package-specific specification guidance (`BASIC`/`ADVANCED`/`PRO`).
- [B] Inference: backtest coverage checks must be market-family aware and package aware; missing-history bias is structural, not random.

Extracted data fields to add:
- `historical_coverage_exclusion_snapshot.provider(betfair)`
- `historical_coverage_exclusion_snapshot.market_family(long_term_season|long_term_politics|tennis_game_betting)`
- `historical_coverage_exclusion_snapshot.exclusion_reason(technical_constraints)`
- `historical_package_contract_snapshot.package_tier(basic|advanced|pro)`
- `historical_package_contract_snapshot.stream_subscription_criteria_ref`
- `historical_package_contract_snapshot.specification_ref`

Model ideas:
- Add `history_coverage_mask` to training-set construction so excluded families are blocked before split generation.
- Add package-tier-aware feature availability masks for replay consistency testing.

Execution lessons:
- Treat absent historical families as hard exclusions in experiment metadata, not as collection failures.
- Pin replay assumptions to the purchased package-tier contract before comparing historical and live behavior.

Contradiction noted:
- Prior simplification: historical gaps were mostly recency/publication lag issues. Betfair documents permanent family-level exclusions.

### Racing Australia wholesaler agreement clarifies standardized contract terms and role split

- [A] Racing Australia (media release dated 2025-06-19) states it stepped back from wholesaler operations and moved into a compliance role under the new structure.
- [A] The same release states five appointed wholesalers (BettorData, BetMakers, Mediality Racing, News Perform/Punters Paradise, Racing and Sports) operate under the same terms and conditions in Wholesaler Agreements, commencing 2025-07-01.
- [B] Inference: AU provider comparison should separate `authorised_wholesaler_status` from `distribution quality/SLA`, because contractual parity does not imply identical technical service characteristics.

Extracted data fields to add:
- `ra_wholesaler_framework_snapshot.effective_date`
- `ra_wholesaler_framework_snapshot.ra_operating_role(compliance_only)`
- `ra_wholesaler_framework_snapshot.standard_terms_parity_flag`
- `ra_wholesaler_registry.wholesaler_name`
- `ra_wholesaler_registry.authorised_flag`
- `ra_wholesaler_registry.commencement_date`

Model ideas:
- Add `wholesaler_pathway` as a provider-regime feature for data-latency and outage attribution models.
- Run parity-vs-performance diagnostics to detect SLA divergence despite common contractual base terms.

Execution lessons:
- Maintain one compliance-lineage model for RA rights, but keep per-wholesaler technical scorecards independent.
- Do not treat RA contractual parity as evidence of identical endpoint behavior.

Contradiction noted:
- Prior simplification: wholesaler status itself implied comparable operational characteristics. RA's framework implies rights parity at contract level but not guaranteed service parity.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] Highest new CAW signal this pass is quantitative flow/effective-takeout mechanics from a CHRB-hosted operator letter, not new syndicate model internals.
- [A] Strongest AU data-provider signal this pass is RA wholesaler contract-role structure and standardized-terms framing.

## Source notes (incremental additions for pass 47)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair support: Which markets aren't available via Historical Data? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/360017615137-Which-markets-aren-t-available-via-Historical-Data
- Betfair support: Where can I view the data specification for each historical data package? (updated 2025-02-25): https://support.developer.betfair.com/hc/en-us/articles/360002423271-Where-can-I-view-the-data-specification-for-each-historical-data-package
- Racing Australia media release: Racing Materials distribution - Wholesaler Agreement (2025-06-19): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

## Incremental sourced findings added in this run (2026-03-31, pass 48)

### CHRB-hosted CAW letter adds account-lineage and purse-flow mechanics that strengthen venue-level economics modeling

- [A/B] The CHRB-hosted Elite letter states each TRA code must receive racetrack consent before wagering into that track's pari-mutuel pools, and some jurisdictions require regulator approval per new TRA code.
- [A/B] The same source states a player may have multiple sub-accounts but all must roll up under one unique TRA code, with no player allowed multiple TRA codes.
- [A/B] The same source states roughly 4.00% of each CAW dollar bet into Del Mar and Santa Anita pools is directed to the respective purse account, and that California tracks charge comparable fees across CAW platforms cited in the letter.
- [B] Inference: tote economics and execution constraints should include account-lineage approval friction and purse-flow transfer ratios, not only late-flow concentration metrics.

Extracted data fields to add:
- `caw_account_lineage_snapshot.source_type(chrb_hosted_operator_letter)`
- `caw_account_lineage_snapshot.tra_code_unique_per_player_flag`
- `caw_account_lineage_snapshot.subaccount_rollup_to_single_tra_flag`
- `caw_account_lineage_snapshot.track_consent_required_flag`
- `caw_account_lineage_snapshot.jurisdiction_regulator_approval_required_flag`
- `caw_purse_flow_snapshot.track_group_id`
- `caw_purse_flow_snapshot.caw_to_purse_pct`
- `caw_purse_flow_snapshot.platform_fee_parity_claim_flag`

Model ideas:
- Add `caw_account_friction_score` (approval + code-lineage constraints) as a prior for venue-level CAW penetration elasticity.
- Add `purse_flow_transfer_pct` as an economics feature when comparing tote participation regimes across venues.

Execution lessons:
- Separate `account_enablement` risk from `market_microstructure` risk in deployment gates; both can block or distort expected turnover.
- Persist operator-authored purse-flow metrics with confidence tags and revalidation reminders before using in production economics.

Contradiction noted:
- Prior simplification: CAW economics were mainly represented via last-minute concentration and effective-takeout mechanics. The same primary source also exposes account-lineage gatekeeping and purse-flow transfer terms that can materially affect capacity and venue selection.

### Punting Form docs now provide fresh schema-drift signal and explicit Starter-tier update endpoints with timestamp-rich race operations data

- [A] Punting Form's changelog (about 1 month ago) states `Distance` and `Class` fields were added to Results APIs and are immediately consumable with no breaking changes.
- [A] Punting Form API reference (`/v2/Updates/Scratchings`) states the endpoint returns upcoming scratchings with timestamps and deductions, available to Starter subscriptions and up.
- [A] Punting Form API reference (`/v2/Updates/Conditions`) states the endpoint returns track grading and weather for all upcoming meetings, also available to Starter subscriptions and up.
- [B] Inference: provider contract monitoring should treat Punting Form as an actively evolving schema surface and treat Updates endpoints as first-class operational-state inputs, not just pre-race enrichment.

Extracted data fields to add:
- `provider_schema_change_event.provider(punting_form)`
- `provider_schema_change_event.surface(results_api)`
- `provider_schema_change_event.field_name(distance|class)`
- `provider_schema_change_event.change_type(additive_non_breaking)`
- `provider_schema_change_event.announced_ts`
- `provider_updates_endpoint_snapshot.endpoint_name(scratchings|conditions)`
- `provider_updates_endpoint_snapshot.path`
- `provider_updates_endpoint_snapshot.min_subscription_tier(starter)`
- `scratching_update_event.update_ts`
- `scratching_update_event.deduction_value`
- `meeting_condition_update_event.track_grade`
- `meeting_condition_update_event.weather_text`

Model ideas:
- Add `provider_schema_freshness_days` to feature-lineage confidence so newly added fields can be isolated in challenger models before broad promotion.
- Add `live_condition_delta` features using conditions/scratchings update cadence for late volatility priors.

Execution lessons:
- Run schema-diff checks on provider docs and payloads before each retrain to prevent silent train/serve drift on newly added fields.
- Use update timestamps and deduction deltas as operational-state events in pre-off execution guards.

Contradiction noted:
- Prior simplification: provider schema evolution was treated as low-frequency and mostly versioned via major API milestones. Current Punting Form docs show additive field changes landing within the same major version and requiring continuous contract monitoring.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] Strongest CAW-team-adjacent delta this pass is governance/economics mechanics from the CHRB-hosted letter (TRA-code lineage approvals and purse-flow transfer), not new model internals.
- [A] Strongest AU provider delta this pass is active Punting Form schema and updates-endpoint contract signals (Results field additions; Starter-tier scratchings/conditions update surfaces).

## Source notes (incremental additions for pass 48)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Punting Form Changelog (`Results API Update - Distance and Class Fields Added`, about 1 month ago): https://docs.puntingform.com.au/changelog
- Punting Form API Reference - Scratchings (`/v2/Updates/Scratchings`): https://docs.puntingform.com.au/reference/scratchings
- Punting Form API Reference - Conditions (`/v2/Updates/Conditions`): https://docs.puntingform.com.au/reference/conditions

## Incremental sourced findings added in this run (2026-03-31, pass 49)

### Betfair horse-racing rules expose non-runner handling asymmetry that changes AU pre-off risk modeling

- [A] Betfair's Exchange horse-racing rules state reduction factors are updated only in exceptional circumstances after approximately `5` minutes from scheduled off for Australian and US markets (general rule is approximately `15` minutes elsewhere).
- [A] The same rules define asymmetric cancellation and reduction mechanics: in win markets, unmatched lay offers are cancelled only when the non-runner reduction factor is `>=2.5%`; in place markets, reductions always apply, but unmatched lay offers are cancelled only when the non-runner reduction factor is `>=4.0%`.
- [A] The same rules state simultaneous non-runner removals are processed in racecard order.
- [B] Inference: AU late-window slippage and fill risk should treat win/place as separate non-runner shock regimes and include deterministic removal-order replay logic.

Extracted data fields to add:
- `nonrunner_reduction_regime_snapshot.provider(betfair)`
- `nonrunner_reduction_regime_snapshot.jurisdiction_scope(australia|us|other)`
- `nonrunner_reduction_regime_snapshot.reduction_update_soft_freeze_minutes_to_off`
- `nonrunner_reduction_regime_snapshot.win_lay_cancel_threshold_pct`
- `nonrunner_reduction_regime_snapshot.place_lay_cancel_threshold_pct`
- `nonrunner_reduction_regime_snapshot.place_reduction_always_applies_flag`
- `nonrunner_removal_order_policy_snapshot.simultaneous_removal_policy(racecard_order)`
- `nonrunner_event_replay.removal_sequence_index`
- `nonrunner_event_replay.market_type(win|place)`
- `nonrunner_event_replay.unmatched_lay_cancelled_flag`

Model ideas:
- Add `nonrunner_shock_asymmetry` features split by `market_type` and threshold band (`<2.5`, `2.5-3.99`, `>=4.0`).
- Add `minutes_to_off_vs_reduction_freeze` to late-price-volatility priors in AU races.

Execution lessons:
- Do not apply a single cancellation rule across win and place ladders during non-runner events.
- Replay non-runner bursts with racecard-order sequencing to avoid impossible market-state reconstructions.

Contradiction noted:
- Prior simplification: non-runner handling was treated as a mostly symmetric market-wide reduction/cancellation process. Betfair rules show explicit win/place threshold asymmetry and jurisdiction-dependent reduction-update windows.

### Mediality FAQ provides explicit AU wholesaler latency/depth priors not captured in RA contract-parity releases

- [A/B] Mediality Racing's published FAQ states historical results coverage back to `January 1982`.
- [A/B] The same FAQ states expected delivery timing of approximately `5 minutes` after acceptances and approximately `20 minutes` after correct weight for results.
- [A/B] The same FAQ states international coverage includes Hong Kong weights/fields/form/results and New Zealand/Singapore fields/form/results in XML, while NZ in-runnings are available `1-2 days` post-meeting.
- [B] Inference: under RA wholesaler terms parity, provider-specific freshness and artifact-latency priors still differ enough to require per-wholesaler technical scorecards.

Extracted data fields to add:
- `wholesaler_latency_claim_snapshot.provider(mediality_racing)`
- `wholesaler_latency_claim_snapshot.acceptances_to_file_minutes_claim`
- `wholesaler_latency_claim_snapshot.correct_weight_to_result_minutes_claim`
- `wholesaler_history_coverage_snapshot.results_start_month`
- `wholesaler_history_coverage_snapshot.results_start_year`
- `wholesaler_international_coverage_snapshot.jurisdiction`
- `wholesaler_international_coverage_snapshot.artifact_scope_json`
- `wholesaler_inrunning_latency_claim_snapshot.jurisdiction(new_zealand)`
- `wholesaler_inrunning_latency_claim_snapshot.availability_delay_days_low`
- `wholesaler_inrunning_latency_claim_snapshot.availability_delay_days_high`

Model ideas:
- Add `provider_claimed_latency_minutes` as a prior for ingestion-SLA expectation and anomaly thresholds.
- Add `jurisdiction_artifact_delay` features so NZ in-running-dependent signals are naturally masked pre-availability.

Execution lessons:
- Keep RA rights-lineage and wholesaler technical-SLA models decoupled; contract parity does not imply timing parity.
- Enforce artifact-level freshness guards (acceptances/results/in-runnings) before promoting provider-dependent features.

Contradiction noted:
- Prior simplification: RA wholesaler framework largely implied interchangeable operational behavior across providers. Mediality's own artifact-level timing claims indicate measurable provider-specific service profiles.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Strongest CAW-team-adjacent delta this pass remains market-rule microstructure handling rather than new syndicate model internals.
- [A/B] Strongest AU provider delta this pass is wholesaler-specific latency/depth claims (Mediality FAQ) layered on top of RA contract-parity governance.

## Source notes (incremental additions for pass 49)

- Betfair support: Exchange - Horse Racing Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-horse-racing-rules/
- Mediality Racing FAQ (captured 2026-03-31): https://medialityracing.com.au/data-faq/

## Incremental sourced findings added in this run (2026-03-31, pass 50)

### Betfair order-entry docs add material-change version semantics that tighten late-window replay and rejection modeling

- [A] Betfair `placeOrders` documents that `marketVersion` is incremented for all market changes, but order acceptance is keyed to the last *material* change (defined as changes under suspension), not every increment.
- [A] The same page gives explicit examples: start-time updates while not suspended are non-material and should still process, while runner removals and turn-in-play are material and can reject stale-version bets (`BET_TAKEN_OR_LAPSED` path shown).
- [A] Betfair `placeOrders` also states `customerRef` de-duplication operates in a `60`-second window and does not persist into order-stream responses.
- [A] Betfair `replaceOrders` states replacement is logical cancel-then-place, and if re-placement fails, prior cancellations are not rolled back; `replaceOrders` also caps replace instructions at `60` per request.
- [B] Inference: pre-off execution simulators need two distinct version gates (`version_monotonic` vs `last_material_change`) plus non-rollback replacement failure states, otherwise fill/rejection backtests are biased optimistic.

Extracted data fields to add:
- `betfair_order_version_contract_snapshot.market_version_increments_on_any_change_flag`
- `betfair_order_version_contract_snapshot.acceptance_uses_last_material_change_flag`
- `betfair_order_version_contract_snapshot.material_change_scope_json`
- `betfair_order_version_contract_snapshot.non_material_change_example(start_time_update_not_suspended)`
- `betfair_order_dedupe_contract_snapshot.customer_ref_dedupe_window_seconds`
- `betfair_order_dedupe_contract_snapshot.customer_ref_persists_to_stream_flag`
- `betfair_replace_semantics_snapshot.cancel_then_place_nonrollback_flag`
- `betfair_replace_semantics_snapshot.replace_instruction_limit_global`
- `betfair_replace_event.replacement_failed_after_cancel_flag`
- `betfair_replace_event.order_state_transition(cancelled_without_replacement)`

Model ideas:
- Add `material_change_hazard` features near jump based on suspension-derived events rather than raw version increments.
- Train rejection-probability models with explicit `replace_nonrollback_exposure` states to improve late-window fill-risk forecasts.

Execution lessons:
- Do not assume `marketVersion` rejects on any stale increment; align validators to Betfair's material-change behavior.
- Treat replace workflows as non-atomic at portfolio level and reserve liquidity for cancel-success/place-fail outcomes.

Contradiction noted:
- Prior simplification: market-version handling was treated as a strict monotonic reject gate on any increment. Betfair docs show acceptance is based on last material (suspension-linked) change.

### BetMakers Core API FAQ adds concrete AU provider transport and throttle contracts that change collector design

- [A/B] BetMakers Core API FAQ states auth tokens are valid for `1 hour`, and long-running subscriptions are validated on start; reconnect behavior depends on token validity at reconnect time.
- [A/B] The same FAQ states subscriptions only emit updates from subscription start time, requiring separate query-based catch-up after disconnects.
- [A/B] BetMakers documents websocket keepalive frames as `{"type":"ka"}` and recommends exponential backoff for reconnects to avoid thundering-herd retry patterns.
- [A/B] The same FAQ states GraphQL query throttling at `10` queries/second, default `races` query limit of `10`, and `meetingsDated` date window limited to `5` days.
- [A/B] BetMakers also documents that intensive nested fields in `meetingsDated` can trigger `429` errors, and race cancellations/track changes propagate as `ABANDONED` status.
- [B] Inference: AU provider ingestion should split state catch-up from subscriptions, include endpoint-shape-aware query budgeting, and treat `ABANDONED` as an operational-state transition event rather than a terminal data omission.

Extracted data fields to add:
- `provider_transport_contract_snapshot.provider(betmakers)`
- `provider_transport_contract_snapshot.token_ttl_minutes`
- `provider_transport_contract_snapshot.subscription_replay_from_creation_flag`
- `provider_transport_contract_snapshot.keepalive_frame_type`
- `provider_transport_contract_snapshot.reconnect_policy_hint(exponential_backoff)`
- `provider_query_budget_snapshot.provider(betmakers)`
- `provider_query_budget_snapshot.query_rate_limit_per_second`
- `provider_query_budget_snapshot.races_default_limit`
- `provider_query_budget_snapshot.meetingsdated_day_window_limit`
- `provider_query_budget_snapshot.intensive_field_429_risk_json`
- `provider_race_state_event.provider(betmakers)`
- `provider_race_state_event.status(abandoned)`
- `provider_race_state_event.reason(track_change|cancellation)`

Model ideas:
- Add `provider_gap_recovery_lag` features based on disconnect/catch-up windows and query budget state.
- Add `abandoned_state_prior` gating so affected races are filtered from training labels and execution candidate sets quickly.

Execution lessons:
- Use query+subscription dual-path collectors; subscription-only collectors will silently miss outage intervals.
- Enforce provider-specific query budgets and shape guards to prevent self-induced `429` bursts on meeting-wide pulls.

Contradiction noted:
- Prior simplification: provider websocket streams were treated as near-complete continuous state with generic retry handling. BetMakers documents explicit non-replay semantics and query-shape throttling constraints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Strongest CAW-team-adjacent delta this pass remains execution microstructure contracts (Betfair material-change/version handling), not new syndicate model internals.
- [A/B] Strongest AU provider delta this pass is BetMakers transport/throttle contract detail relevant to ingestion reliability and execution-state correctness.

## Source notes (incremental additions for pass 50)

- Betfair Exchange API Documentation - `placeOrders` (Updated 2025-01-07): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Exchange API Documentation - `replaceOrders` (Updated 2024-06-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687487/replaceOrders
- BetMakers Docs - Core API FAQ (captured 2026-03-31): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental sourced findings added in this run (2026-03-31, pass 51)

### Betfair `INVALID_PROFIT_RATIO` adds a hidden execution-rejection regime for low-stake/low-odds bet mutations

- [A] Betfair Developer Support (updated 2025-08-20) states `INVALID_PROFIT_RATIO` is enforced to prevent rounding abuse and can be triggered by `place`, `cancel`, or `update` workflows, not just fresh placements.
- [A] The same source defines explicit fairness bands: a bet mutation that would return `20%` less or `25%` more than expected (from rounding behavior) is rejected.
- [A] The worked example shows stake-edit, cancel-down, and price-edit pathways can all fail even when the user intent is ordinary position management.
- [B] Inference: late-window amendment logic must model `INVALID_PROFIT_RATIO` as an order-transform risk state (especially at short prices), otherwise amend-success assumptions are overstated.

Extracted data fields to add:
- `betfair_profit_ratio_contract_snapshot.captured_ts`
- `betfair_profit_ratio_contract_snapshot.error_code(INVALID_PROFIT_RATIO)`
- `betfair_profit_ratio_contract_snapshot.applies_to_actions(place|cancel|update)`
- `betfair_profit_ratio_contract_snapshot.min_fair_return_pct_low`
- `betfair_profit_ratio_contract_snapshot.max_fair_return_pct_high`
- `betfair_profit_ratio_contract_snapshot.rounding_abuse_guard_flag`
- `order_reject_event.error_code`
- `order_reject_event.order_transform_type(place|cancel_down|size_up|price_edit)`
- `order_reject_event.price`
- `order_reject_event.remaining_size`

Model ideas:
- Add `profit_ratio_reject_hazard` features for short-price amendment paths (`price <= 1.20`, tiny residual size states).
- Add an `amendability_score` prior to expected-fill models so replace/cancel-down flows are discounted when rejection risk is high.

Execution lessons:
- Pre-screen amend/cancel-down requests for likely `INVALID_PROFIT_RATIO` failures before sending to exchange.
- Keep fallback logic that re-plans exposure when a non-atomic amend path is rejected for ratio constraints.

Contradiction noted:
- Prior simplification: amendment failures were mostly attributable to liquidity, versioning, or rate limits. Betfair now documents an additional rounding-fairness rejection path that can invalidate otherwise syntactically valid instructions.

### Betfair support explicitly links API rollup configuration and `fill-or-kill` usage to match-probability control

- [A] Betfair Developer Support (updated 2025-08-20) states API users should use `exBestOffersOverrides` (`rollupModel` + `rollupLimit`) to approximate executable depth and align to website bet-slider behavior.
- [A] The same article explicitly recommends `fill or kill` bet-placement options to prevent orders from remaining unmatched when immediate execution fails.
- [B] Inference: execution simulation should treat rollup depth selection and `fill-or-kill` usage as strategy-level controls, not UI conveniences.

Extracted data fields to add:
- `betfair_matchability_contract_snapshot.captured_ts`
- `betfair_matchability_contract_snapshot.rollup_model`
- `betfair_matchability_contract_snapshot.rollup_limit`
- `betfair_matchability_contract_snapshot.website_slider_equivalence_flag`
- `betfair_matchability_contract_snapshot.fill_or_kill_recommended_flag`
- `order_submission_event.fill_or_kill_flag`
- `order_submission_event.rollup_limit_used`
- `order_submission_event.expected_executable_depth`

Model ideas:
- Add `fok_usage` and `rollup_limit_band` features to slippage/fill-probability models.
- Learn per-strategy `rollup_limit` policies that optimize expected fill quality under queue/rate constraints.

Execution lessons:
- Explicitly couple quoting depth assumptions to the same rollup regime used in order-generation logic.
- Use `fill-or-kill` selectively for short-lived alpha where stale unmatched rests are more harmful than missed fills.

Contradiction noted:
- Prior simplification: rollup knobs were treated mainly as data-query optimizations. Betfair guidance frames them as direct execution-quality controls.

### Australian wholesaler identity now needs alias-level mapping (`News Perform` vs `InForm Connect (News Limited)`)

- [A] Racing Australia's wholesaler release (2025-06-19) names `News Perform (Punters Paradise)` as one of five authorised wholesalers.
- [A/B] InForm Connect's 2025-08-26 post states `InForm Connect (News Limited)` was appointed as an official distributor under the Racing Australia Wholesale Agreement.
- [B] Inference: provider onboarding and entitlement audits should maintain legal-entity and brand aliases to avoid false duplicate suppliers or incorrect contract attribution.

Extracted data fields to add:
- `provider_entity_alias_snapshot.captured_ts`
- `provider_entity_alias_snapshot.framework_name(racing_australia_wholesaler_agreement)`
- `provider_entity_alias_snapshot.legal_entity_name`
- `provider_entity_alias_snapshot.brand_name`
- `provider_entity_alias_snapshot.alias_type(legal_to_brand|legacy_name)`
- `provider_entity_alias_snapshot.evidence_quality`
- `provider_entity_alias_snapshot.source_url`

Model ideas:
- Add `provider_alias_conflict_flag` to data-lineage confidence scoring for wholesaler-normalized features.

Execution lessons:
- Route entitlement checks via canonical provider IDs, not marketing names appearing in integration paperwork.
- Keep alias history versioned so contract and feed provenance remain auditable after rebrands.

Contradiction noted:
- Prior simplification: wholesaler identity was treated as a static five-name list. Recent provider communications indicate alias/rebrand surfaces that can diverge from contract nomenclature.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Strongest CAW-team-adjacent signal this pass remains exchange execution microstructure/rule mechanics rather than syndicate self-disclosure.
- [A/B] Strongest AU provider delta this pass is wholesaler identity/alias governance risk, not new sectional or model-factor disclosures.

## Source notes (incremental additions for pass 51)

- Betfair Developer Support - `INVALID_PROFIT_RATIO` semantics (updated 2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/360010423978-Why-am-I-receiving-the-INVALID-PROFIT-RATIO-error
- Betfair Developer Support - improving match chance (`rollupModel`, `rollupLimit`, `fill-or-kill`) (updated 2025-08-20): https://support.developer.betfair.com/hc/en-us/articles/360017675098-How-do-I-improve-the-chances-of-my-bet-being-matched
- Racing Australia media release - Wholesaler Agreement (2025-06-19): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf
- InForm Connect post - wholesaler/distributor appointment claim (2025-08-26): https://informconnect.com.au/2025/08/26/inform-connect-benchmarked-2/

## Incremental sourced findings added in this run (2026-03-31, pass 52)

### Betfair Exchange rules add cross-matching and SP-reconciliation mechanics that materially change fill attribution

- [A] Betfair Exchange General Rules explicitly separate `cross-selection matching` and `cross-market matching`, with both mechanisms only used when they improve the customer's price versus same-selection opposing liquidity.
- [A] The same rules state cross-matched outcomes must still land on valid odds-ladder increments, and this valid-increment constraint can create a small Betfair revenue residual in some cross-matched cases.
- [A] The same rules preserve FIFO queue priority at equal price regardless of whether matching used cross-matching or direct opposing liquidity.
- [A] Betfair SP rules state SP bets cannot be cancelled once placed, and SP reconciliation includes unmatched Exchange offers where they improve SP outcomes.
- [A] The same SP section states unmatched pre-off Exchange bets can be configured to convert to SP or persist in-play instead of auto-lapsing at the off.
- [B] Inference: execution replay should split `price improvement source` (`direct_opposing` vs `cross_selection` vs `cross_market`) and track `revenue_residual` states from valid-increment rounding effects.

Extracted data fields to add:
- `cross_matching_policy_snapshot.cross_selection_enabled_flag`
- `cross_matching_policy_snapshot.cross_market_enabled_flag`
- `cross_matching_policy_snapshot.better_price_required_flag`
- `cross_matching_policy_snapshot.valid_increment_only_flag`
- `cross_matching_policy_snapshot.additional_revenue_possible_flag`
- `price_time_queue_policy_snapshot.fifo_same_price_flag`
- `sp_reconciliation_policy_snapshot.sp_cancel_allowed_flag`
- `sp_reconciliation_policy_snapshot.includes_unmatched_exchange_offers_flag`
- `unmatched_off_policy_snapshot.convert_to_sp_option_flag`
- `unmatched_off_policy_snapshot.persist_inplay_option_flag`
- `order_fill_event.match_source_type(direct_opposing|cross_selection|cross_market)`
- `order_fill_event.crossmatch_revenue_residual_flag`

Model ideas:
- Add `crossmatch_improvement_ticks` and `crossmatch_source_mix` features to explain late-window fill quality beyond visible ladder depth.
- Add `preoff_unmatched_conversion_profile` features to estimate how SP-convert/persist policies alter realized fill and CLV distributions.

Execution lessons:
- Attribute fill and slippage to explicit match-source pathways; do not assume all better-than-quoted fills came from same-market queue dynamics.
- Persist account/order-level unmatched-off handling (`lapse` vs `sp` vs `persist`) as first-class execution context for replay correctness.

Contradiction noted:
- Prior simplification: cross-matching was treated mostly as generic best-price behavior within the same market, and SP was treated as operationally separate from regular unmatched Exchange flow. Betfair rules tie both together through cross-market liquidity use and SP reconciliation with unmatched Exchange orders.

### Punting Form docs expose historical-depth asymmetry between result archives and benchmark/sectional surfaces

- [A/B] Punting Form's Results guide states the results database "goes back to 2005".
- [A/B] Punting Form's Benchmarks guide states benchmark data is based on `12+ years` of sectional times for every runner in TAB meetings in Australia plus Hong Kong and North America.
- [B] Inference: provider history depth is artifact-specific; result archives and sectional/benchmark history cannot be assumed to share the same temporal floor.

Extracted data fields to add:
- `provider_history_depth_snapshot.provider(punting_form)`
- `provider_history_depth_snapshot.artifact_type(results|sectionals|benchmarks)`
- `provider_history_depth_snapshot.start_year_claim`
- `provider_history_depth_snapshot.coverage_scope_json`
- `provider_history_depth_snapshot.claim_confidence`
- `feature_eligibility_window.artifact_type`
- `feature_eligibility_window.min_train_year`

Model ideas:
- Build artifact-specific train-window guards so long-horizon model experiments back off automatically when required provider depth is unavailable.
- Add `history_depth_gap_years` as a confidence penalty when combining provider-level features with different temporal baselines.

Execution lessons:
- Separate provider ingestion SLAs from provider history-depth contracts; both must pass before enabling a feature family in production.
- Validate training windows against artifact-level depth metadata to avoid silent survivorship bias in backtests.

Contradiction noted:
- Prior simplification: once provider entitlement was confirmed, historical depth was treated as broadly comparable across artifacts. Punting Form documentation indicates materially different history floors by surface.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] Strongest CAW-team-adjacent signal this pass remains exchange microstructure/rule mechanics (cross-matching + SP reconciliation), not new syndicate internals.
- [A/B] Strongest AU provider delta this pass is artifact-level historical-depth asymmetry in Punting Form docs, not new methodological racing-model disclosures.

## Source notes (incremental additions for pass 52)

- Betfair Exchange - Introduction & General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Punting Form Guides - Results (`database goes back to 2005`, captured 2026-03-31): https://docs.puntingform.com.au/docs/results
- Punting Form Guides - Benchmarks (`12+ years` sectional basis claim, captured 2026-03-31): https://docs.puntingform.com.au/docs/benchmarks-1

## Incremental sourced findings added in this run (2026-03-31, pass 53)

### Betfair Stream order-state taxonomy exposes deterministic lapse causes and a duplicate-market edge case we were not modeling

- [A] Betfair Exchange Stream API documents an explicit `lapseStatusReasonCode` field on Order Stream objects, with supported values including `MKT_VERSION`, `TIME_ELAPSED`, `MKT_SUSPENDED`, `PRICE_INVALID`, `SP_IN_PLAY`, and `PRICE_IMP_TOO_LARGE`.
- [A] The same spec states `lapseStatusReasonCode` can be null when no lapse occurred or when lapse reason is outside the currently enumerated list.
- [A] Stream API "Known Issues" documents that markets moved to a new `eventId` can appear twice in the initial image cache; updates then continue only on the latest market version, and clients are told to keep the higher `version`.
- [B] Inference: replay/live order-state engines should treat lapse causality as typed states (not generic "lapsed"), and stream cache hydration should enforce duplicate-market pruning by `marketId` + highest `version`.

Extracted data fields to add:
- `betfair_order_lapse_reason_contract_snapshot.captured_ts`
- `betfair_order_lapse_reason_contract_snapshot.supported_codes_json`
- `betfair_order_lapse_reason_contract_snapshot.null_semantics_text`
- `order_lapse_event.lapse_status_reason_code`
- `order_lapse_event.market_version_at_lapse`
- `order_lapse_event.time_in_queue_ms`
- `stream_known_issue_contract_snapshot.market_move_duplicate_initial_image_flag`
- `stream_known_issue_contract_snapshot.latest_version_only_update_flag`
- `stream_market_snapshot.market_id`
- `stream_market_snapshot.event_id`
- `stream_market_snapshot.version`
- `stream_market_snapshot.duplicate_pruned_flag`

Model ideas:
- Add `lapse_reason_mix` features (for example `TIME_ELAPSED` share and `MKT_VERSION` share) to predict amendability and near-jump fill reliability.
- Add a `duplicate_market_hydration_anomaly` feature to down-weight markets where initial-image reconciliation required duplicate pruning.

Execution lessons:
- Persist `lapseStatusReasonCode` on every lapsed order update; do not collapse to a single "lapse" bucket.
- During stream bootstrap and reconnect, de-duplicate by `marketId` retaining highest `version` before feature generation or execution decisions.

Contradiction noted:
- Prior simplification: most lapse outcomes were treated as queue/liquidity artifacts. Betfair now provides typed lapse causes and a documented duplicate-market initial-image edge case.

### Racing NSW FreeFields meeting/result pages expose publish-state and deadline fields that should be first-class operational metadata

- [A] Racing NSW FreeFields race-program pages publish meeting-level operational deadlines (`Nominations close`, `Weights declared by`, `Acceptances declared before`, `Riders declared before`, `Scratching close`) with explicit local timezone labels.
- [A] Racing NSW FreeFields results pages expose `Results Last Published` timestamp, plus per-meeting export links (`Snapshot`, `XML`, `CSV`) and meeting telemetry fields (`Penetrometer`, `Track Information`, `Timing Method`).
- [A] The same pages carry race-by-race welfare-fund lines and official comments, which create a stronger event-time reconciliation surface than a pure finish-order feed.
- [B] Inference: provider publication-state contracts should include both readiness deadlines and post-race publication timestamps, enabling PIT-safe freshness checks and delayed-finalization controls.

Extracted data fields to add:
- `freefields_meeting_deadline_snapshot.source(racing_nsw_mdata)`
- `freefields_meeting_deadline_snapshot.nominations_close_ts_local`
- `freefields_meeting_deadline_snapshot.weights_declared_by_ts_local`
- `freefields_meeting_deadline_snapshot.acceptances_deadline_ts_local`
- `freefields_meeting_deadline_snapshot.riders_declared_deadline_ts_local`
- `freefields_meeting_deadline_snapshot.scratching_close_ts_local`
- `freefields_results_publication_snapshot.results_last_published_ts_local`
- `freefields_results_publication_snapshot.snapshot_url`
- `freefields_results_publication_snapshot.xml_url`
- `freefields_results_publication_snapshot.csv_url`
- `freefields_meeting_surface_snapshot.penetrometer_value`
- `freefields_meeting_surface_snapshot.track_information_text`
- `freefields_race_result_snapshot.timing_method`
- `freefields_race_result_snapshot.official_comments_text`

Model ideas:
- Add `results_publication_lag_minutes` and `deadline_phase_state` features to control training-label eligibility and post-race calibration windows.
- Add `surface_measurement_delta` features from `penetrometer` and track-info updates to improve regime detection on moisture/going transitions.

Execution lessons:
- Gate settlement/backfill jobs on `results_last_published_ts` stability rather than assuming immediate finality after race off-time.
- Snapshot and store meeting deadline fields pre-race; they are useful as deterministic clocks for when specific artifacts should exist.

Contradiction noted:
- Prior simplification: FreeFields was treated mainly as a static artifact-link index. Racing NSW meeting/results pages expose actionable publish-time and measurement metadata.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-quality CAW-team methodological self-disclosure was identified this pass; strongest new signal remains exchange/order-state microstructure.
- [A] Strongest AU provider delta this pass is operational publish-state metadata from Racing NSW FreeFields endpoints.

## Source notes (incremental additions for pass 53)

- Betfair Exchange Stream API (updated 2026-02-20; lapse codes + known issues): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange%2BStream%2BAPI
- Racing NSW FreeFields race program example (captured 2026-03-31): https://mdata.racingnsw.com.au/FreeFields/RaceProgram.aspx?Key=2026Mar04%2CNSW%2CWarwick+Farm
- Racing NSW FreeFields results example (captured 2026-03-31): https://mdata.racingnsw.com.au/FreeFields/Results.aspx?Key=2026Mar04%2CNSW%2CWarwick+Farm

## Incremental sourced findings added in this run (2026-03-31, pass 54)

### Betfair SP lifecycle has additional void/lapse states that can break naive pre-off reconciliation assumptions

- [A] Betfair Exchange General Rules state that if SP reconciliation happens late and Betfair determines a material event occurred, reconciliation is restricted to pre-off SP orders, while post-off `At In-Play: Take SP` matches are voided and post-off SP bets are voided.
- [A] The same rules state if reconciliation is performed prematurely (for example, in-play toggled in error), Betfair may reverse reconciliation and restore SP / `Take SP` / `Keep` order states to their prior status.
- [A] Betfair SP support guidance states minimum SP liabilities are enforced at reconciliation (`£10` lay, `£1` back or currency equivalent); unmatched lay requests converted via `Take SP` can be accepted pre-off but still lapse/cancel at the off if residual liability is below the threshold.
- [B] Inference: SP simulation and replay need distinct `accepted_preoff` vs `eligible_at_reconciliation` states; treating all `Take SP` requests as guaranteed SP participation overstates late-window fill certainty.

Extracted data fields to add:
- `betfair_sp_reconciliation_timing_snapshot.captured_ts`
- `betfair_sp_reconciliation_timing_snapshot.late_reconciliation_material_event_rule_flag`
- `betfair_sp_reconciliation_timing_snapshot.post_off_take_sp_void_flag`
- `betfair_sp_reconciliation_timing_snapshot.post_off_sp_bet_void_flag`
- `betfair_sp_reconciliation_timing_snapshot.premature_reconciliation_reversal_flag`
- `betfair_sp_min_liability_snapshot.captured_ts`
- `betfair_sp_min_liability_snapshot.min_lay_liability`
- `betfair_sp_min_liability_snapshot.min_back_stake`
- `order_sp_conversion_event.order_id`
- `order_sp_conversion_event.take_sp_selected_flag`
- `order_sp_conversion_event.accepted_preoff_flag`
- `order_sp_conversion_event.eligible_at_reconciliation_flag`
- `order_sp_conversion_event.ineligible_reason(min_liability|post_off|material_event_void)`

Model ideas:
- Add `sp_conversion_eligibility_hazard` features for low-liability lays near the off.
- Add `late_reconciliation_void_risk` features in fill-probability and CLV attribution models for events with suspend/in-play timing anomalies.

Execution lessons:
- Treat SP conversion as a two-step state machine (`request accepted` then `reconciliation eligible`), not a single flag.
- Reconcile fill and void outcomes against reconciliation timing events before attributing slippage to liquidity alone.

Contradiction noted:
- Prior simplification: unmatched pre-off `Take SP` intents were treated as effectively guaranteed SP participation unless user-cancelled. Betfair rules/support add minimum-liability and late-reconciliation void paths that break this assumption.

### NYRA CAW guardrails show operational toggles that require regime versioning in tote-volatility studies

- [A] NYRA's official 2026 guardrail announcement sets the new broad one-minute CAW cutoff starting February 5, 2026, while retaining stricter legacy restrictions for the win pool and retail-only late Pick 5/Pick 6.
- [B] Equibase relays NYRA's February 6 operational update that the new one-minute guardrail was suspended for one race day for tote technical upgrades, with reinstatement expected February 11, 2026.
- [B] Inference: CAW-policy impact evaluation should not treat February policy as a single uninterrupted regime; short operational suspensions can confound volatility/odds-lag attribution.

Extracted data fields to add:
- `caw_policy_event_snapshot.venue(nyra)`
- `caw_policy_event_snapshot.policy_name(one_minute_cutoff_all_non_legacy_pools)`
- `caw_policy_event_snapshot.effective_start_date`
- `caw_policy_event_snapshot.status(active|suspended_temp)`
- `caw_policy_event_snapshot.suspension_reason`
- `caw_policy_event_snapshot.suspension_date`
- `caw_policy_event_snapshot.expected_resume_date`
- `caw_policy_event_snapshot.source_quality`

Model ideas:
- Add `caw_policy_status` and `days_since_policy_change` features when modeling final-minute tote odds volatility.
- Add event-level exclusion/robustness filters for known policy-suspension dates in before/after CAW guardrail studies.

Execution lessons:
- Version tote/CAW policy regimes by date and explicit status transitions (`active` vs `temporarily suspended`).
- Keep source-quality tags for policy events that come from official announcements vs third-party reportage.

Contradiction noted:
- Prior simplification: CAW cutoff changes were represented as continuous hard cutover dates. February 2026 reporting indicates short-lived operational suspensions that require explicit regime toggles.

### Racing Australia BTAG formation adds a new independent governance layer for black-type upgrade/downgrade flow

- [A] Racing Australia (11 March 2026) confirms board approval of the Black Type Advisory Group (BTAG) with named members and a charter requiring members not hold roles with Racing Australia, state PRAs, or racing clubs.
- [A] The same release states BTAG initially provides independent views on upgrades, downgrades, and additions to the Black Type List via Racing Australia to both PRAs and the Asian Pattern Committee.
- [B] Inference: post-December-2025 black-type governance now has an additional domestic advisory stage, so class-governance timelines should include BTAG recommendation events before APC/PRA outcomes where available.

Extracted data fields to add:
- `black_type_governance_body_snapshot.body_name(BTAG)`
- `black_type_governance_body_snapshot.approval_date`
- `black_type_governance_body_snapshot.independence_constraint_text`
- `black_type_governance_member_snapshot.member_name`
- `black_type_governance_member_snapshot.body_name`
- `black_type_recommendation_event.event_ts`
- `black_type_recommendation_event.action_type(add|upgrade|downgrade)`
- `black_type_recommendation_event.forwarded_to(pra|apc)`
- `race_class_governance_timeline.stage_name(btag_recommendation|pra_consideration|apc_decision)`

Model ideas:
- Add a `black_type_pending_recommendation_flag` to class-change-sensitive features so models can down-weight stale class labels near governance transition points.

Execution lessons:
- Distinguish `advisory recommendation date` from `effective class label date` in PIT feature generation.
- Track governance-body provenance on race-class changes, not just final class outputs.

Contradiction noted:
- Prior simplification: post-ARF/APC black-type governance was modeled mostly as PRA/APC outcome flow. Racing Australia's March 2026 BTAG release introduces an explicit independent advisory stage.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] CAW-team signal this pass is operational policy-regime continuity risk (NYRA guardrail suspension/restart), not new model-method disclosure by syndicates.
- [A] Strongest Betfair microstructure delta this pass is SP reconciliation timing + minimum-liability conversion semantics.
- [A] Strongest AU provider/governance delta this pass is BTAG formation as a new black-type recommendation layer.

## Source notes (incremental additions for pass 54)

- Betfair Exchange General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Betfair Support - Starting Price (SP), minimum liability and `Take SP` examples (captured 2026-03-31): https://support.betfair.com/app/answers/detail/a_id/421/
- NYRA official CAW guardrail announcement (2026-01-30): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Equibase relay of NYRA one-day CAW suspension/update (2026-02-06): https://cms.equibase.com/node/313508
- Racing Australia media release - Statement on formation of BTAG (2026-03-11): https://www.racingaustralia.horse/uploadimg/media-releases/Statement-on-formation-of-Black-Type-Advisory-Group.pdf

## Incremental sourced findings added in this run (2026-03-31, pass 55)

### Betfair `MarketBook` has pre-finality and voidability semantics that need explicit runner-universe and state-lineage controls

- [A] Betfair Betting Type Definitions (updated 2025-12-11) states `MarketBook.complete=false` means runners may still be added to the market.
- [A] The same page states `runnersVoidable` excludes horse-racing non-runner handling (`reduction factor` path), so `false`/`true` cannot be used as a complete non-runner settlement proxy for horse markets.
- [A] The same page defines `MarketBook.version` as incrementing on market status changes (for example, turn-in-play or suspend events), not as a generic per-price-update counter.
- [B] Inference: execution/replay should treat `complete` as the runner-universe lock signal and treat `version` as a status-transition lineage signal, while non-runner settlement remains a separate reduction-factor workflow.

Extracted data fields to add:
- `betfair_market_completeness_contract_snapshot.captured_ts`
- `betfair_market_completeness_contract_snapshot.complete_false_allows_runner_additions_flag`
- `betfair_market_voidability_contract_snapshot.captured_ts`
- `betfair_market_voidability_contract_snapshot.runners_voidable_excludes_horse_non_runner_flag`
- `betfair_market_version_contract_snapshot.captured_ts`
- `betfair_market_version_contract_snapshot.version_increments_on_status_change_flag`
- `market_state_snapshot.complete_flag`
- `market_state_snapshot.version_value`
- `market_state_snapshot.status_value`
- `runner_universe_lock_event.market_id`
- `runner_universe_lock_event.locked_ts`
- `runner_universe_lock_event.complete_true_observed_flag`

Model ideas:
- Add `runner_universe_lock_state` and `seconds_since_lock` features for late-window fill/CLV models to discount edges generated before runner set is stable.
- Add `status_transition_density` features from `version`/`status` transitions rather than treating `version` deltas as pure microprice churn.

Execution lessons:
- Block promotion of pre-off execution strategies unless market snapshots show `complete=true` before signal generation cutoffs.
- Keep non-runner reduction-factor reconciliation as a separate ledger path; do not infer horse-market voidability from `runnersVoidable` alone.

Contradiction noted:
- Prior simplification: `version` and market-voidability flags were treated as broad market-change proxies. Current type definitions separate runner-universe completeness, status transitions, and horse-specific non-runner settlement behavior.

### Racing Australia results pages expose race-scoped track-rating transition logs (including retrospective application) that should become first-class regime events

- [A] Racing Australia FreeFields results pages include explicit `Results Last Published` timestamps and meeting telemetry (`Penetrometer`, `Track Information`) plus race-level `Timing Method` and `Official Comments`.
- [A] The same pages also publish intraday track-rating transition lines with timestamps and scope, including retrospective application (for example, "Track Upgraded to (Heavy 9) @ 12:56 PM retrospective to Race 1").
- [B] Inference: a single meeting-level going value is insufficient; PIT feature generation should use a race-scoped track-rating transition timeline with explicit effective scope (`after race N` vs `retrospective to race N`).

Extracted data fields to add:
- `track_rating_change_event.provider(racing_australia_freefields)`
- `track_rating_change_event.meeting_key`
- `track_rating_change_event.event_ts_local`
- `track_rating_change_event.new_track_rating`
- `track_rating_change_event.scope_type(retrospective|forward_only)`
- `track_rating_change_event.scope_race_number`
- `track_rating_change_event.source_text`
- `race_result_surface_snapshot.timing_method`
- `race_result_surface_snapshot.official_comments_text`

Model ideas:
- Add `track_rating_transition_count_pre_jump` and `retrospective_rating_adjustment_flag` features for race-level uncertainty/covariate-shift handling.
- Build race-specific going-adjustment features keyed to the latest applicable transition event rather than meeting-start condition.

Execution lessons:
- Recompute pre-race feature views when retrospective track-rating events are published; do not assume monotonic forward-only updates.
- Keep raw comment text alongside parsed transition events so reconciliation can recover parser misses.

Contradiction noted:
- Prior simplification: meeting-level track condition was treated as a mostly forward-moving state. FreeFields results logs show race-scoped and retrospective transitions that can revise earlier-race interpretation.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] No higher-quality CAW-team methodological self-disclosure was identified this pass; strongest new signal remains market-structure/data-contract semantics.
- [A] Strongest Betfair microstructure delta this pass is `MarketBook` completeness/version/voidability separation.
- [A] Strongest AU provider delta this pass is race-scoped and retrospective track-rating transition logging on FreeFields results pages.

## Source notes (incremental additions for pass 55)

- Betfair Betting Type Definitions (updated 2025-12-11): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%2BType%2BDefinitions
- Racing Australia FreeFields results example (captured 2026-03-31): https://www.racingaustralia.horse/FreeFields/Results.aspx?Key=2026Mar01%2CVIC%2CSale

## Incremental sourced findings added in this run (2026-03-31, pass 56)

### Betfair `At In-Play: Keep` has horse-specific non-runner and late-withdrawal exception paths that require a dedicated state machine

- [A] Betfair Exchange General Rules state unmatched lay offers are normally cancelled on qualifying non-runner removals, but lay offers with `At In-Play: Keep` selected are not cancelled in that path and are instead price-adjusted by reduction-factor mechanics.
- [A] The same rules specify a late-withdrawal exception: when Betfair can determine a material late withdrawal (approximately `20%` reduction-factor runner), Betfair reserves the right to cancel all lay `keep` bets (win and place) before in-play.
- [A] The same section states if those lay `keep` bets are not cancelled in that late-withdrawal scenario and then match in-play, they remain at original selected price and are not subject to post-race reduction-factor adjustments applied to bets matched at or before the off.
- [A] Betfair SP rules in the same source also state SP bets at exact requested limit are included in first-come-first-served order and can be partially matched/unmatched at that boundary.
- [B] Inference: replay/execution cannot model `keep` as a single persistence flag; it needs branch states for `kept_and_reduced`, `force_cancelled_material_late_withdrawal`, and `kept_unreduced_inplay_match`.

Extracted data fields to add:
- `betfair_keep_bet_rule_snapshot.captured_ts`
- `betfair_keep_bet_rule_snapshot.keep_lay_nonrunner_no_cancel_flag`
- `betfair_keep_bet_rule_snapshot.keep_lay_reduction_adjustment_flag`
- `betfair_keep_bet_rule_snapshot.material_late_withdrawal_force_cancel_right_flag`
- `betfair_keep_bet_rule_snapshot.material_runner_rf_threshold_approx`
- `order_keep_transition_event.event_ts`
- `order_keep_transition_event.market_id`
- `order_keep_transition_event.selection_id`
- `order_keep_transition_event.order_id`
- `order_keep_transition_event.keep_state(kept_and_reduced|force_cancelled_material_late_withdrawal|kept_unreduced_inplay_match)`
- `order_keep_transition_event.late_withdrawal_flag`
- `order_keep_transition_event.reduction_applied_flag`
- `sp_limit_queue_event.event_ts`
- `sp_limit_queue_event.selection_id`
- `sp_limit_queue_event.limit_price`
- `sp_limit_queue_event.queue_position`
- `sp_limit_queue_event.partial_match_flag`

Model ideas:
- Add `keep_force_cancel_hazard` and `late_withdrawal_materiality_proxy` features to late-window fill models.
- Add `sp_limit_queue_pressure` features around off-time to model partial/unmatched boundary behavior for SP-limit orders.

Execution lessons:
- Treat `At In-Play: Keep` as a governed state machine with explicit late-withdrawal override rights, not a guaranteed persistence promise.
- Separate in-play matched `keep` orders in late-withdrawal scenarios from pre-off-matched orders in reduction-factor reconciliation.

Contradiction noted:
- Prior simplification: `keep` was treated as stable persistence unless unmatched at final close. Betfair horse-racing rules include explicit non-runner adjustment and material-late-withdrawal cancellation branches.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] No higher-quality CAW-team methodological self-disclosure was identified this pass; strongest net-new signal is still exchange execution-contract detail.
- [A] Strongest Betfair microstructure delta this pass is `At In-Play: Keep` branch semantics under non-runner and late-withdrawal conditions.
- [A] No higher-signal AU provider disclosure than pass-55 additions was identified in this run.

## Source notes (incremental additions for pass 56)

- Betfair Exchange - Introduction & General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules

## Incremental sourced findings added in this run (2026-03-31, pass 57)

### Benter's 1994 primary report explicitly frames "inside information in odds" as a structural reason to blend with market data

- [A] Benter (1994) states trainer/jockey intentions and other non-public signals can be available to some parties and reflected in betting odds, creating an information disadvantage for models built only from published data.
- [A] The same passage implies model edge is partly a compression problem: extract maximal signal from large historical databases, then use market prices as information-bearing inputs instead of treating market odds as pure noise.
- [B] Inference: for our stack, market-blend calibration should be treated as a structural requirement tied to information asymmetry, not only a post-hoc accuracy tweak.

Extracted data fields to add:
- `market_information_asymmetry_assumption_snapshot.captured_ts`
- `market_information_asymmetry_assumption_snapshot.inside_info_reflected_in_odds_flag`
- `model_input_scope_snapshot.published_data_only_flag`
- `model_input_scope_snapshot.market_price_blend_enabled_flag`
- `model_calibration_window.public_market_weight`
- `model_calibration_window.private_model_weight`

Model ideas:
- Add `market_information_gap_proxy` features from unexplained late odds movement after controlling for form variables.
- Add regime-aware blend priors that increase market weight when signal sparsity is high (for example, first-up runners with thin recent data).

Execution lessons:
- Treat late-market odds as a required feature family in production, not a fallback.
- Track performance deltas for `private_only` vs `private_plus_market` models as a standing diagnostic of information asymmetry risk.

Contradiction noted:
- Prior simplification: market blending was mostly justified as generic calibration improvement. Benter's primary framing is that public odds embed otherwise inaccessible information and should be treated as a core input class.

### Racing Victoria race-fields conditions formalize deduction-feed delivery and bet-type governance constraints relevant to live execution

- [A] RV's Standard Conditions (effective 1 March 2025) specify deduction-value delivery via one of three prescribed mechanisms (email, API used by the WSP betting system, or RV website), with each WSP bound to its nominated mechanism for the approval period unless RV determines otherwise.
- [A] The same clause requires fallback to a published table of deductions when prescribed delivery is unavailable within reasonable time, which creates an explicit contingency settlement path.
- [A] The same instrument also requires consultation/approval for new bet types and explicitly escalates written approval where a bet type enables customers to profit directly from poor horse performance.
- [B] Inference: provider-policy engines need both deduction-feed mechanism versioning and bet-type approval-state gates; execution assumptions cannot rely on a single immutable feed path.

Extracted data fields to add:
- `rv_deduction_delivery_contract_snapshot.captured_ts`
- `rv_deduction_delivery_contract_snapshot.prescribed_mechanisms(email|api|website)`
- `rv_deduction_delivery_contract_snapshot.preferred_mechanism`
- `rv_deduction_delivery_contract_snapshot.mechanism_binding_for_approval_period_flag`
- `rv_deduction_delivery_fallback_event.event_ts`
- `rv_deduction_delivery_fallback_event.reason`
- `rv_deduction_delivery_fallback_event.table_of_deductions_applied_flag`
- `rv_bet_type_governance_event.event_ts`
- `rv_bet_type_governance_event.bet_type_name`
- `rv_bet_type_governance_event.requires_written_approval_flag`
- `rv_bet_type_governance_event.approval_status`

Model ideas:
- Add `deduction_source_reliability_state` features to settlement-confidence scoring.
- Add `bet_type_governance_state` as a hard filter in strategy-selection pipelines.

Execution lessons:
- Persist jurisdiction-level deduction mechanism metadata and fallback usage events for every meeting day.
- Fail closed on unapproved bet-type routing in venue-specific execution logic.

Contradiction noted:
- Prior simplification: deduction values were treated as a single stable feed. RV conditions define mechanism selection, binding periods, and table-fallback behavior that can change operational paths.

### Racing Victoria's FY25-26 information guide exposes near-real-time and next-day reporting clocks plus transaction-level liability fields

- [A] RV's 2025/26 Guide to the Provision of Information states designated approved WSPs must provide race information no later than 1 minute after the approved WSP receives the information.
- [A] The same guide sets an explicit daily data-submission deadline (`09:00` the next day after betting transactions were placed) for designated WSPs.
- [A] The daily ledger schema includes transaction-level and runner-liability fields (for example cancellation flags/time, `HorseWinTakeout`, `HorseWinHold`, `HorsePlaceTakeout`) plus bet-information enums (`FIXED`, `SP`, `SPG`, etc.).
- [B] Inference: provider contracts support deterministic reporting-clock monitoring and liability-surface reconstruction; these should be explicit controls in compliance-aware replay.

Extracted data fields to add:
- `rv_reporting_clock_snapshot.captured_ts`
- `rv_reporting_clock_snapshot.race_info_max_lag_minutes`
- `rv_reporting_clock_snapshot.daily_submission_deadline_local`
- `rv_daily_ledger_submission_event.event_ts`
- `rv_daily_ledger_submission_event.reporting_date_local`
- `rv_daily_ledger_submission_event.submission_deadline_met_flag`
- `rv_daily_ledger_bet_event.bet_id`
- `rv_daily_ledger_bet_event.bet_information_enum`
- `rv_daily_ledger_bet_event.cancel_flag`
- `rv_daily_ledger_bet_event.time_cancelled_local`
- `rv_daily_ledger_runner_liability_snapshot.horse_win_takeout`
- `rv_daily_ledger_runner_liability_snapshot.horse_win_hold`
- `rv_daily_ledger_runner_liability_snapshot.horse_place_takeout`

Model ideas:
- Add `provider_reporting_lag_breach_flag` as a feature-quality gate for same-day training labels.
- Add runner-liability concentration features from `HorseWinHold/HorseWinTakeout` when estimating price-impact risk around late betting windows.

Execution lessons:
- Build automated deadline monitors for provider submissions and quarantine late/missing files from model refresh jobs.
- Preserve raw daily-ledger enums and liability fields before normalization so compliance/audit replay remains source-faithful.

Contradiction noted:
- Prior simplification: Australian provider reporting was modeled mainly as publish-state timestamps. RV guide adds concrete latency obligations and rich liability schema suitable for deterministic governance checks.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] Net-new primary methodological signal this pass is Benter's explicit inside-information framing for why market odds must be incorporated.
- [A] No net-new primary methodological disclosures were identified for Woods, Walsh, or Ranogajec internals this pass.
- [A/B] No higher-quality CAW-team methodological self-disclosure was identified this pass.
- [A] Strongest AU provider delta this pass is Racing Victoria's explicit deduction-delivery and reporting-clock contract semantics.

## Source notes (incremental additions for pass 57)

- William Benter, *Computer Based Horse Race Handicapping and Wagering Systems: A Report* (1994): https://gwern.net/doc/statistics/decision/1994-benter.pdf
- Racing Victoria Standard Conditions of Approval (effective 1 March 2025): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf
- Racing Victoria Guide to the Provision of Information 2025/26: https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf

## Incremental sourced findings added in this run (2026-03-31, pass 59)

### Betfair order-history APIs add source-attribution and settlement-rollup caveats that require new replay/accounting controls

- [A] Betfair `listCurrentOrders` and `listClearedOrders` expose an optional `includeSourceId` flag; when enabled and available, responses include `sourceIdKey` and `sourceIdDescription`.
- [A] Betfair `listClearedOrders` documents an explicit caveat for longer-running markets settled at multiple times: market-level rollups cannot be constrained to only settlements within a selected date range; they return overall market position including all settlements.
- [A] The same `listClearedOrders` contract includes `customerOrderRefs` and `customerStrategyRefs` filters for settled-history segmentation.
- [B] Inference: ledger/replay systems must separate `settlement_time_window` from `market_rollup_scope` and persist source-attribution fields so downstream PnL/attribution jobs do not incorrectly assume date-window-isolated rollups.

Extracted data fields to add:
- `betfair_order_source_contract_snapshot.captured_ts`
- `betfair_order_source_contract_snapshot.include_source_id_supported_flag`
- `order_source_attribution_snapshot.order_id`
- `order_source_attribution_snapshot.source_id_key`
- `order_source_attribution_snapshot.source_id_description`
- `cleared_orders_rollup_scope_contract_snapshot.captured_ts`
- `cleared_orders_rollup_scope_contract_snapshot.long_running_market_rollup_includes_all_settlements_flag`
- `cleared_orders_rollup_scope_contract_snapshot.source_url`
- `settlement_window_query_audit.query_ts`
- `settlement_window_query_audit.group_by`
- `settlement_window_query_audit.date_range_from`
- `settlement_window_query_audit.date_range_to`
- `settlement_window_query_audit.rollup_scope_warning_flag`

Model ideas:
- Add `source_channel_mix_entropy` features from `sourceIdKey` distributions to detect execution-channel drift that can affect fill/slippage behavior.
- Add `long_running_rollup_bias_flag` as a hard filter in training-label builders to avoid leaking out-of-window settlements into periodized PnL labels.

Execution lessons:
- Treat `includeSourceId=true` as required in both live and backfill order-collection jobs when available.
- Block periodized strategy-PnL reports that rely on market-level rollups in windows where long-running multi-settlement markets are present.

Contradiction noted:
- Prior simplification: `settledDateRange` plus market-level rollups was assumed sufficient for window-specific settled attribution. Betfair docs explicitly state long-running market rollups can still include all settlements.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] No higher-quality CAW-team methodological self-disclosure was identified this pass.
- [A] Strongest Betfair microstructure/accounting delta this pass is source-attribution (`includeSourceId`) plus long-running settlement-rollup scope limits in `listClearedOrders`.
- [A] No higher-signal AU provider-policy disclosure than prior pass additions was identified in this run.

## Source notes (incremental additions for pass 59)

- Betfair `listClearedOrders` (updated 2024-11-05): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687749/listClearedOrders
- Betfair `listCurrentOrders` (updated 2024-11-05): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687504/listCurrentOrders

## Incremental sourced findings added in this run (2026-03-31, pass 60)

### Racing Australia's annual service-standard report adds a higher-confidence process-vs-uptime reliability split for provider risk modeling

- [A] Racing Australia's Consolidated Annual Service Standard Performance Report for the 12 months ending June 2025 reports nominations release timeliness at `96.04%` against a `98%` target (`-1.96%`), while riders (`99.45%` vs `98%`) and final scratchings with emergencies (`98.85%` vs `98%`) exceeded target.
- [A] The same report records high infrastructure uptime across most systems (`99.94%` to `100.00%`), including `99.94%` for the Racing Australia website, despite process-timeliness misses in some race-day publication phases.
- [A] The report also quantifies annual communication volume (`1,881,977` SMS and `3,213,969` emails), indicating that publication-timing risk should be modeled under high outbound operational load rather than assumed low-volume conditions.
- [B] Inference: provider quality controls should explicitly separate `process_sla_breach_risk` from `system_uptime_risk`; high uptime does not imply race-day artifact-timing compliance.

Extracted data fields to add:
- `ra_annual_service_standard_snapshot.reporting_period_end`
- `ra_annual_service_standard_snapshot.metric_name`
- `ra_annual_service_standard_snapshot.target_pct`
- `ra_annual_service_standard_snapshot.actual_pct`
- `ra_annual_service_standard_snapshot.variance_pct`
- `ra_annual_service_standard_snapshot.traffic_light_status`
- `ra_annual_service_standard_snapshot.source_url`
- `ra_service_phase_metric_snapshot.phase_name`
- `ra_service_phase_metric_snapshot.target_minutes_from_official_close`
- `ra_service_phase_metric_snapshot.actual_pct`
- `ra_service_phase_metric_snapshot.breach_flag`
- `ra_system_uptime_snapshot.system_name`
- `ra_system_uptime_snapshot.unplanned_downtime_minutes`
- `ra_system_uptime_snapshot.target_uptime_pct`
- `ra_system_uptime_snapshot.actual_uptime_pct`
- `ra_comms_load_snapshot.channel(sms|email)`
- `ra_comms_load_snapshot.annual_total`
- `ra_comms_load_snapshot.monthly_avg`

Model ideas:
- Add a `service_phase_breach_pressure` feature that uses nominations/scratchings timeliness deltas as regime inputs for late-market execution confidence.
- Add a `provider_operational_load_index` from monthly SMS/email volumes and test interaction with publish-lag frequency.

Execution lessons:
- Maintain separate dashboards and gates for `process SLA` and `infrastructure uptime`; do not collapse both into a single provider-health score.
- Trigger stricter stale-data safeguards in final pre-off windows when nominations/scratchings timeliness underperforms target, even if uptime remains green.

Contradiction noted:
- Prior simplification: strong uptime was treated as a reliable proxy for publication timeliness. Annual RA service metrics show timing SLA misses can coexist with near-perfect uptime.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] No higher-quality primary CAW-team methodological self-disclosure was identified this pass.
- [A] Strongest net-new high-signal source this run is Racing Australia's annual process-vs-uptime reliability decomposition.
- [A] No new higher-confidence Betfair microstructure source beyond pass 59 was identified in this run.

## Source notes (incremental additions for pass 60)

- Racing Australia Consolidated Annual Service Standard Performance Report 2024-2025 (12 months ending June 2025): https://www.racingaustralia.horse/FreeServices/Reports/Consolidated-Report-2024-2025.pdf

## Incremental sourced findings added in this run (2026-03-31, pass 61)

### Betfair dead-heat exchange settlement rules add a missing settlement-state branch that should be modeled explicitly

- [A] Betfair's official `Dead Heat` help page states dead heats apply on Exchange horse markets by proportionally splitting stake across tied runners (for example, two-way tie pays half stake at full odds; three-way tie pays one-third).
- [A] The same source provides an explicit place-market settlement formula with `No of payouts` and `No of tied runners`, which implies deterministic formula-based settlement branches rather than a generic tie outcome.
- [A] The same source states back and lay settlement are symmetric (`what the backer wins, the layer loses`).
- [B] Inference: win/place settlement and PnL attribution pipelines need a dedicated dead-heat branch keyed by tie cardinality and place-count, otherwise realized PnL decomposition and strategy diagnostics will be biased.

Extracted data fields to add:
- `betfair_dead_heat_rule_snapshot.captured_ts`
- `betfair_dead_heat_rule_snapshot.win_settlement_prorata_stake_flag`
- `betfair_dead_heat_rule_snapshot.place_settlement_formula_text`
- `betfair_dead_heat_rule_snapshot.lay_back_symmetry_flag`
- `dead_heat_settlement_event.event_ts`
- `dead_heat_settlement_event.market_id`
- `dead_heat_settlement_event.selection_id`
- `dead_heat_settlement_event.bet_id`
- `dead_heat_settlement_event.market_type(win|place)`
- `dead_heat_settlement_event.tied_runner_count`
- `dead_heat_settlement_event.payout_places_count`
- `dead_heat_settlement_event.prorated_stake`
- `dead_heat_settlement_event.settlement_multiplier`

Model ideas:
- Add `dead_heat_frequency_by_track_distance` features for place-market expected-value calibration.
- Add `dead_heat_pnl_variance_component` in bankroll stress tests for high-field-size strategies.

Execution lessons:
- Reconcile settled PnL with dead-heat-aware formulas before labeling execution quality outliers.
- Keep dead-heat branches explicit in investor reporting so lay-side and back-side attribution remain consistent.

Contradiction noted:
- Prior simplification: tie outcomes were treated as generic settled-result noise. Betfair provides deterministic dead-heat settlement mechanics that should be replayed exactly.

### Racing Australia FreeFields `Form` pages expose contract-relevant NSW fields (`True Weight`) and welfare-fund deductions that should be retained in provider lineage

- [A] Racing Australia FreeFields NSW `Form` pages include a declared `True Weight` column note (introduced 19 Sep 2018), defining it as benchmark-derived handicap weight where no minimum applies.
- [A] The same page family states that from 1 Sep 2022, prize money includes explicit allocations to Equine Welfare Fund (`1.5%`) and Jockey Welfare Fund (`1%`), and meeting/race lines display those amounts.
- [A] The same surfaces expose operational publication clocks (`FinalFields Last Published`, riders declaration deadline, scratching close) and per-race field constraints (`Field Limit`, emergency counts), which are needed for point-in-time lineage and late-scratch replay integrity.
- [B] Inference: provider ingestion should preserve `true_weight` and welfare-deduction metadata as first-class fields; these are not cosmetic labels and can affect handicap interpretation, payout accounting context, and PIT auditability.

Extracted data fields to add:
- `ra_form_contract_snapshot.captured_ts`
- `ra_form_contract_snapshot.true_weight_column_present_flag`
- `ra_form_contract_snapshot.true_weight_definition_text`
- `ra_form_contract_snapshot.equine_welfare_fund_pct`
- `ra_form_contract_snapshot.jockey_welfare_fund_pct`
- `ra_form_meeting_clock_snapshot.final_fields_last_published_ts_local`
- `ra_form_meeting_clock_snapshot.riders_declared_before_ts_local`
- `ra_form_meeting_clock_snapshot.scratching_close_ts_local`
- `ra_form_race_constraint_snapshot.field_limit_main`
- `ra_form_race_constraint_snapshot.field_limit_emergencies`
- `ra_form_runner_weight_snapshot.weight_declared_kg`
- `ra_form_runner_weight_snapshot.true_weight_kg_nullable`

Model ideas:
- Add `true_weight_minus_declared_weight` as a handicap-pressure feature (where available) and test interaction with barrier and apprentice-claim effects.
- Add `field_limit_pressure` features from `main/emergency` slots to capture late-acceptance congestion risk in final windows.

Execution lessons:
- Track `FinalFields Last Published` and declaration/scratching cutoffs as hard PIT gates before generating pre-off feature snapshots.
- Keep welfare-fund deduction metadata versioned by jurisdiction/date so payout-context analytics do not assume fixed prize distribution rules.

Contradiction noted:
- Prior simplification: FreeFields meeting pages were mainly treated as race-program scaffolding. Current pages carry explicit contract-style weight semantics, deduction percentages, and operational clocks suitable for production governance.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] No higher-quality primary CAW-team methodological self-disclosure was identified this pass.
- [A] Strongest net-new signal this run is deterministic dead-heat settlement mechanics from Betfair Exchange support documentation.
- [A] Strongest AU provider delta this run is FreeFields NSW `Form` contract semantics (`True Weight`, welfare-fund allocations, and publish/deadline clocks).

## Source notes (incremental additions for pass 61)

- Betfair Support - `Dead Heat` (captured 2026-03-31): https://support.betfair.com/app/answers/detail/a_id/403
- Racing Australia FreeFields `Form` example (captured 2026-03-31): https://www.racingaustralia.horse/FreeFields/Form.aspx?Key=2026Feb28%2CNSW%2CRoyal+Randwick

## Incremental sourced findings added in this run (2026-03-31, pass 62)

### Del Mar published post-cutoff seasonal handle outcomes that can anchor CAW-policy effect priors

- [A] Del Mar's official summer 2025 season close report states total handle was `$535.15 million` (`+6.7%` vs 2024), with average daily handle `$17.26 million` (vs `$16.18 million` in 2024) and field size `8.7` (vs `8.6`).
- [A] Del Mar's official fall 2025 season close report states total handle rose to `$183.4 million` (`+9.4%` vs 2024) despite one fewer race day due to weather cancellation; average daily handle was `$14.1 million` (`+17.8%`) with field size `7.77` (vs `7.72`).
- [A/B] Inference: after introducing explicit CAW win-pool cutoff controls (previously captured), Del Mar's official end-of-meet reports provide concrete post-policy outcome anchors for `handle`, `average daily handle`, and `field size`; these are still non-causal but high-signal benchmark points for policy-regime monitoring.

Extracted data fields to add:
- `track_policy_outcome_snapshot.track_id`
- `track_policy_outcome_snapshot.policy_name(caw_win_pool_cutoff)`
- `track_policy_outcome_snapshot.policy_effective_date`
- `track_policy_outcome_snapshot.meet_name`
- `track_policy_outcome_snapshot.meet_start_date`
- `track_policy_outcome_snapshot.meet_end_date`
- `track_policy_outcome_snapshot.meet_days`
- `track_policy_outcome_snapshot.total_handle_usd_m`
- `track_policy_outcome_snapshot.total_handle_yoy_pct`
- `track_policy_outcome_snapshot.avg_daily_handle_usd_m`
- `track_policy_outcome_snapshot.avg_daily_handle_yoy_pct`
- `track_policy_outcome_snapshot.avg_field_size`
- `track_policy_outcome_snapshot.avg_field_size_yoy_delta`
- `track_policy_outcome_snapshot.weather_disruption_flag`
- `track_policy_outcome_snapshot.breeders_cup_excluded_flag`

Model ideas:
- Add `policy_regime_post_window` and `policy_regime_post_window_handle_delta` features for venue-level regime diagnostics.
- Add `meet_day_adjusted_handle_index` so cross-meet comparisons normalize day-count shocks (for example weather-cancelled cards).

Execution lessons:
- Keep a separate `policy_outcome_benchmark` layer from causal attribution; use it for sanity checks and drift alarms, not direct policy-credit claims.
- Normalize meet-level outcomes for event exclusions and day-count changes before comparing pre/post policy performance.

Contradiction noted:
- Prior simplification: CAW policy tracking centered on rule text and cutoff parameters. Del Mar now provides official post-change seasonal outcome metrics that should be persisted as benchmark evidence.

### BetMakers documents dead-heat result-shape semantics (`tabNo` duplication) that require provider-specific settlement normalization

- [A/B] BetMakers Core API FAQ states dead-heat results can contain duplicate `tabNo` values across multiple finishing positions.
- [A/B] The same FAQ instructs consumers to use the highest finishing position when duplicate `tabNo` values occur.
- [B] Inference: provider-normalization layers need an explicit `betmakers_dead_heat_projection` step before downstream place/win labeling, otherwise duplicate-position rows can inflate runner-count and corrupt settlement joins.

Extracted data fields to add:
- `betmakers_dead_heat_contract_snapshot.captured_ts`
- `betmakers_dead_heat_contract_snapshot.duplicate_tabno_across_positions_flag`
- `betmakers_dead_heat_contract_snapshot.highest_position_rule_flag`
- `betmakers_dead_heat_position_event.event_ts`
- `betmakers_dead_heat_position_event.race_id`
- `betmakers_dead_heat_position_event.tabno`
- `betmakers_dead_heat_position_event.raw_positions_json`
- `betmakers_dead_heat_position_event.highest_position_selected`
- `provider_result_normalization_event.provider(betmakers)`
- `provider_result_normalization_event.rule_applied(dead_heat_highest_position)`

Model ideas:
- Add `provider_dead_heat_normalization_applied_flag` as a label-lineage feature for settlement-quality diagnostics.
- Add `dead_heat_position_multiplicity` as a data-quality monitor to detect schema/regime drift in provider results.

Execution lessons:
- Run provider-specific normalization before generating canonical finishing-order labels.
- Preserve both raw and normalized dead-heat result payloads so audits can replay exact provider behavior.

Contradiction noted:
- Prior simplification: dead-heat handling was modeled primarily from exchange settlement rules. BetMakers adds upstream result-shape rules that must be applied before exchange/payout reconciliation.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] Strongest CAW-team-adjacent signal this pass is official post-policy Del Mar handle outcomes (summer and fall 2025), which are outcome benchmarks rather than causal proof.
- [A/B] Strongest AU provider delta this pass is BetMakers dead-heat result-shape normalization semantics (`duplicate tabNo` plus highest-position rule).

## Source notes (incremental additions for pass 62)

- Del Mar official release (published 2025-09-07): https://www.dmtc.com/media/news/del-mar-concludes-86th-summer-season-with-increases-in-wagering-2953
- Del Mar official release (published 2025-11-30): https://www.dmtc.com/media/news/del-mar-fall-meet-delivers-strong-gains-in-handle-3073
- BetMakers Docs - Core API FAQ (`How do we handle Dead Heats for results (tie)?`, captured 2026-03-31): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental sourced findings added in this run (2026-03-31, pass 63)

### CHRB-hosted CAW letter defines an actionable operating envelope (throughput threshold, control requirements, and membership scale)

- [A/B] The CHRB-hosted Elite letter states AmTote can process up to `2,000 bets/second` from one client, while California racetracks classify activity above `5 bets/second` as CAW and attach extra controls (vetting, source-of-funds checks, unique TRA-code tracking, API integration).
- [A/B] The same source states Elite players are absolutely restricted from cancelling wagers, regardless of time or reason.
- [A/B] The same source states Elite membership typically hovers around `12-20` players and requires a stated minimum wagering threshold of `$20 million/year` (with ramp-up), with ongoing semi-annual background checks.
- [B] Inference: CAW impact modeling should include a distinct `account-operating-envelope` layer (throughput class, cancellation rights, onboarding thresholds), not just pool-share or final-minute-flow metrics.

Extracted data fields to add:
- `caw_operating_envelope_snapshot.source_type(chrb_hosted_operator_letter)`
- `caw_operating_envelope_snapshot.single_client_max_bets_per_second(2000)`
- `caw_operating_envelope_snapshot.caw_classification_threshold_bets_per_second(5)`
- `caw_operating_envelope_snapshot.cancellation_restriction_policy(no_cancellations)`
- `caw_operating_envelope_snapshot.api_integration_required_flag`
- `caw_operating_envelope_snapshot.min_annual_wager_threshold_usd(20000000)`
- `caw_operating_envelope_snapshot.membership_range_low(12)`
- `caw_operating_envelope_snapshot.membership_range_high(20)`
- `caw_operating_envelope_snapshot.background_check_cadence(semi_annual)`
- `caw_account_classification_event.event_ts`
- `caw_account_classification_event.account_id`
- `caw_account_classification_event.observed_peak_bets_per_second`
- `caw_account_classification_event.classification(non_caw|caw)`

Model ideas:
- Add `caw_operating_envelope_score` as a venue/account-state covariate for late-odds impact and liquidity-stability diagnostics.
- Add `cancellation_rights_regime` as a friction feature when comparing modeled and realized execution flexibility across account types.

Execution lessons:
- Separate `speed capacity` from `regulatory/account controls` in CAW analytics; both change observed market impact.
- Do not infer cancellation optionality from generic ADW behavior when source-tagged CAW regimes explicitly disallow cancellations.

Contradiction noted:
- Prior simplification: CAW presence was mostly proxied by late-flow share and pool participation. The same primary source provides explicit throughput, compliance, and account-control boundaries that should be modeled independently.

### Racing Australia scratching workflow includes pending-stage steward approval and channel-specific release behavior that should be represented as state transitions

- [A] Racing Australia's Scratching Release Information page states Group 1 and Northern Territory scratchings lodged via Service Centre or Stable Assist are placed in `pending` stage and require steward approval before finalization.
- [A] The same page states Service Centre scratchings are double-checked before final compilation, while Stable Assist scratchings are released live at submission time.
- [A] The same page notes finalization pressure controls: call-queue timestamps are logged, meetings are not closed until all calls queued before deadline are attended, and final release can be affected by short-window scratching volume/weather shocks.
- [B] Inference: AU scratching ingestion should use a channel-aware state machine (`submitted_live`, `pending_steward`, `finalized`) and avoid treating all scratchings as immediate, homogeneous events.

Extracted data fields to add:
- `ra_scratching_channel_contract_snapshot.captured_ts`
- `ra_scratching_channel_contract_snapshot.service_centre_double_check_flag`
- `ra_scratching_channel_contract_snapshot.stable_assist_live_release_flag`
- `ra_scratching_channel_contract_snapshot.group1_pending_steward_approval_flag`
- `ra_scratching_channel_contract_snapshot.nt_pending_steward_approval_flag`
- `ra_scratching_queue_contract_snapshot.queue_timestamp_logging_flag`
- `ra_scratching_queue_contract_snapshot.pre_deadline_queue_must_complete_flag`
- `ra_scratching_queue_contract_snapshot.volume_weather_dependency_flag`
- `ra_scratching_state_event.event_ts`
- `ra_scratching_state_event.runner_id`
- `ra_scratching_state_event.channel(service_centre|stable_assist)`
- `ra_scratching_state_event.state(submitted_live|pending_steward|finalized)`
- `ra_scratching_state_event.steward_approval_required_flag`

Model ideas:
- Add `scratch_state_pending_hazard` and `minutes_in_pending_state` to late non-runner risk models.
- Add `queue_pressure_proxy` features from pre-close queue depth and channel mix to improve final-minute deduction-risk estimation.

Execution lessons:
- Keep channel provenance (`Service Centre` vs `Stable Assist`) in PIT records so replay can reproduce pending-to-final transitions.
- Gate final pre-off feature snapshots on `finalized` state, not just first-seen scratch timestamp.

Contradiction noted:
- Prior simplification: scratchings were treated as a single live-updating event stream. Racing Australia documents channel-specific validation and pending approval branches that create non-trivial state transitions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] Strongest CAW-team-adjacent delta this pass is the CHRB-hosted operating-envelope detail (classification threshold, cancellation restrictions, and membership/threshold controls), not new model internals.
- [A] Strongest AU provider delta this pass is Racing Australia's channel-specific scratching state logic (`pending` approval and release-path asymmetry).

## Source notes (incremental additions for pass 63)

- CHRB-hosted `Computer Assisted Wagering` Q&A letter (Elite Turf Club, 2024-09-05; captured 2026-03-31): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Racing Australia FreeFields Scratching Release Information (captured 2026-03-31): https://www.racingaustralia.horse/FreeFields/ScratchingReleaseInformation.aspx

## Incremental sourced findings added in this run (2026-03-31, pass 64)

### Walsh/Ranogajec primary-source nuance: capital structure is part of model edge realization, not a side note

- [A/B] In the Andrew Leigh transcript, Walsh states the enterprise ownership split as him at `28%` and Zeljko Ranogajec at `29%`, and attributes Ranogajec's larger success partly to supplying capital.
- [A/B] Same transcript: Walsh reiterates that his horse model only became competitive after including the public as an explicit model input, and that some historical crowd biases evolve over time (for example he says one trend "used to" hold but now does not).
- [B] Inference: bankroll/capital access should be treated as a first-class production constraint (capacity to exploit edge), while crowd-bias features need decay/regime monitoring instead of static coefficients.

Extracted data fields to add:
- `enterprise_ownership_snapshot.captured_ts`
- `enterprise_ownership_snapshot.operator_name`
- `enterprise_ownership_snapshot.ownership_pct`
- `enterprise_ownership_snapshot.capital_provider_flag`
- `bias_regime_observation.event_ts`
- `bias_regime_observation.bias_name`
- `bias_regime_observation.observed_state(present|decayed|reversed)`
- `bias_regime_observation.source_url`

Model ideas:
- Add `capital_capacity_constraint` in strategy scaling simulations (edge quality vs deployable turnover).
- Add time-decay priors for behavioral-bias features and enforce scheduled re-validation windows.

Execution lessons:
- Do not evaluate model quality in isolation from bankroll/deployment constraints.
- Treat interview-derived bias claims as hypotheses to test per era/venue, not fixed rules.

Contradiction noted:
- Prior simplification: if prediction edge exists, scaling follows naturally. Walsh's account implies capital structure materially affects realized PnL independent of raw model skill.

### Provider eligibility contradiction: The Racing API explicitly disallows betting-operator/sportsbook operational use

- [A] The Racing API FAQ and Terms of Service state usage is prohibited for betting operators and sportsbooks.
- [A] The same FAQ states default request limits of `5 requests/second` and freshness cadence of `3 minutes` for today's racecards/odds/results.
- [A/B] Inference: even where coverage is acceptable, this provider should remain out of execution-critical or operator-production pathways under current terms.

Extracted data fields to add:
- `provider_usage_policy_snapshot.provider`
- `provider_usage_policy_snapshot.prohibited_operator_use_flag`
- `provider_usage_policy_snapshot.prohibited_sportsbook_use_flag`
- `provider_usage_policy_snapshot.default_rate_limit_rps`
- `provider_usage_policy_snapshot.today_update_interval_sec`
- `provider_usage_policy_snapshot.contract_status(eligible|ineligible_for_operator_stack)`
- `provider_usage_policy_snapshot.source_url`

Model ideas:
- None for live execution models; treat this as a governance/eligibility control input.

Execution lessons:
- Separate `data quality` from `legal eligibility`; high coverage does not imply deployment viability.
- Provider ranking should include hard disqualification rules from terms, not only SLA/freshness scoring.

Contradiction noted:
- Prior ambiguity: The Racing API was considered a possible secondary feed pending SLA checks. Current published terms create a stronger hard-stop for betting-operator operational usage.

### Podium entitlement granularity: full coverage depends on multiple rights-owner agreements

- [A/B] Podium's horse-racing API pages state that multiple rights-owner agreements are needed to access full coverage.
- [A/B] Podium onboarding docs also describe PUSH delivery entitlement shaping (messages reflect contract scope), plus a large hierarchical payload structure that can exceed 20k lines for meeting detail responses.
- [B] Inference: provider onboarding must track entitlement at rights-owner scope, not single provider-level "on/off" status.

Extracted data fields to add:
- `provider_rights_owner_entitlement.provider`
- `provider_rights_owner_entitlement.rights_owner`
- `provider_rights_owner_entitlement.coverage_scope`
- `provider_rights_owner_entitlement.contract_signed_flag`
- `provider_rights_owner_entitlement.push_enabled_flag`
- `provider_rights_owner_entitlement.source_url`

Model ideas:
- Add `coverage_completeness_score` by jurisdiction/track based on rights-owner entitlement state.

Execution lessons:
- Ingestor must degrade gracefully when rights-owner subsets are missing; avoid assuming global completeness.
- Track PUSH entitlement scope in replay metadata so missing updates are diagnosed as entitlement gaps vs transport faults.

Contradiction noted:
- Prior simplification: provider contracts were mostly treated as provider-level. Podium documentation shows rights-owner-level entitlement fragmentation.

## Source notes (incremental additions for pass 64)

- David Walsh interview transcript with Andrew Leigh (captured 2026-03-31): https://www.andrewleigh.com/david_walsh_tgl
- The Racing API FAQ (captured 2026-03-31): https://www.theracingapi.com/faq
- The Racing API Terms of Service (captured 2026-03-31): https://www.theracingapi.com/terms-of-service
- Podium horse-racing API product page (captured 2026-03-31): https://podiumsports.com/horse-racing-api/
- Podium onboarding documentation page (captured 2026-03-31): https://podiumsports.com/resource/podium-racing-api-onboarding-documentation/

## Incremental sourced findings added in this run (2026-03-31, pass 65)

### Betfair Exchange rules add two execution-critical microstructure clauses: AU off-to-in-play void window and SP risk-counterparty path

- [A] Betfair Exchange General Rules state an Australia-specific horse-racing exception: if a market is turned in-play late, bets matched after the official off but before Betfair actually turns the market in-play are void for Australian horse racing.
- [A] The same rules state Betfair SP reconciliation can use unmatched Exchange offers and, when needed for fair SP, a licensed betting operator within the Betfair group may act as risk counterparty.
- [A/B] Inference: fill-attribution and post-off execution logic for AU races must treat the off-to-in-play interval as a distinct void-risk regime, and SP analytics should carry explicit counterparty-route metadata rather than assuming only peer-to-peer flow.

Extracted data fields to add:
- `betfair_market_phase_rule_snapshot.captured_ts`
- `betfair_market_phase_rule_snapshot.jurisdiction(au_horse_racing)`
- `betfair_market_phase_rule_snapshot.off_to_inplay_matched_bets_void_flag`
- `betfair_market_phase_rule_snapshot.source_url`
- `execution_void_window_event.market_id`
- `execution_void_window_event.selection_id`
- `execution_void_window_event.order_submit_ts`
- `execution_void_window_event.order_match_ts`
- `execution_void_window_event.official_off_ts`
- `execution_void_window_event.inplay_turn_ts`
- `execution_void_window_event.voided_by_rule_flag`
- `sp_reconciliation_counterparty_event.market_id`
- `sp_reconciliation_counterparty_event.reconciliation_ts`
- `sp_reconciliation_counterparty_event.group_risk_counterparty_possible_flag`
- `sp_reconciliation_counterparty_event.source_url`

Model ideas:
- Add `off_to_inplay_void_hazard` features for AU horse-racing markets to downgrade fragile late-window fills.
- Add `sp_counterparty_route_flag` to SP-vs-exchange reconciliation diagnostics when analyzing realized edge.

Execution lessons:
- Block or heavily downweight new AU in-play transition orders once `official_off_ts` is reached unless the strategy explicitly models the void interval.
- Keep SP analytics separate from pure exchange-ladder fills so reconciliation behavior does not pollute queue/fill attribution.

Contradiction noted:
- Prior simplification: post-off matched bets were treated as generally standing once matched. Betfair rules carve out an explicit AU horse-racing void interval and an SP counterparty path.

### Racing NSW bet-back-credit policy creates operator-eligibility gating beyond simple approval-list presence

- [A] Racing NSW's approved-operators page states the list is updated regularly and frames it as operators against whom bet-back credits are allowed to be claimed (subject to conditions).
- [A] The same page defines bet-back credits as liability-layoff wagers and states credits are unavailable for cash bets or bets placed with licensed Australian wagering operators that do not meet the qualification criteria.
- [A] The same page requires the bet back to be through an account with an operator that (1) has a Racing NSW race-fields approval before the bet back and (2) pays qualifying fees (to Racing NSW or a NSW thoroughbred racing club, per the stated criteria).
- [A/B] Inference: approved-list membership alone is insufficient for fee-credit economics; auditability requires account-channel and qualification-state evidence at bet time.

Extracted data fields to add:
- `rnsw_bet_back_credit_rule_snapshot.captured_ts`
- `rnsw_bet_back_credit_rule_snapshot.approved_list_updated_regularly_flag`
- `rnsw_bet_back_credit_rule_snapshot.account_channel_required_flag`
- `rnsw_bet_back_credit_rule_snapshot.cash_bet_ineligible_flag`
- `rnsw_bet_back_credit_rule_snapshot.operator_qualification_required_flag`
- `rnsw_bet_back_credit_rule_snapshot.source_url`
- `rnsw_operator_approval_snapshot.snapshot_ts`
- `rnsw_operator_approval_snapshot.operator_name`
- `rnsw_operator_approval_snapshot.approved_flag`
- `bet_back_credit_eligibility_event.event_ts`
- `bet_back_credit_eligibility_event.operator_name`
- `bet_back_credit_eligibility_event.via_account_flag`
- `bet_back_credit_eligibility_event.operator_qualified_flag`
- `bet_back_credit_eligibility_event.eligible_flag`

Model ideas:
- Add `expected_rebate_eligibility_prob` features so pre-trade EV can be calculated as conditional on bet-back-credit eligibility.
- Add `operator_qualification_drift` monitors to detect abrupt changes in effective post-cost edge.

Execution lessons:
- Do not book bet-back economics into EV unless eligibility is proven for the exact operator/account path at event time.
- Snapshot approved-operator artifacts and rule text frequently enough to reconstruct why a credit was or was not recognized.

Contradiction noted:
- Prior simplification: approval-list status was treated as the main entitlement signal. Racing NSW bet-back-credit rules add account-path and operator-qualification conditions that can invalidate expected fee-credit assumptions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A/B] No stronger CAW-team methodology disclosure was identified this pass beyond previously captured policy/process evidence.
- [A] Strongest net-new signal this pass is Betfair AU off-to-in-play void mechanics plus SP counterparty/reconciliation clauses.
- [A] Strongest AU provider/policy delta this pass is Racing NSW bet-back-credit qualification mechanics tied to approved operators and account-path constraints.

## Source notes (incremental additions for pass 65)

- Betfair Exchange General Rules (captured 2026-03-31): https://support.betfair.com/app/answers/detail/exchange-general-rules
- Racing NSW approved licensed wagering operators and bet-back-credit conditions (captured 2026-03-31): https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/

## Incremental sourced findings added in this run (2026-03-31, pass 66)

### WIRED's Hong Kong profile adds concrete Benter-era execution-footprint and feature-maintenance details that are still structurally relevant

- [B] WIRED's 2002 long-form profile reports that Benter's operation used dedicated staff to review race tapes and score horses on `130` characteristics per run.
- [B] The same article reports a high fixed-cost/maintenance framing from quoted experts: roughly `1 year` and about `$1 million` to build an initial probability system, then ongoing weekly maintenance and at least annual model updates.
- [B] The same profile includes a specific execution-footprint claim from Rod Dufficy describing Benter's wager masking as staged `$5,000` dribbles over time to avoid revealing directional intent.
- [B] The same source states rival teams monitored flow via an external odds-monitoring service (`Telequote`), implying adversarial observation pressure in late wagering windows.
- [B] Inference: besides edge estimation, Benter-style production systems need explicit `feature-maintenance` and `footprint-management` layers that model both information decay and adversarial visibility.

Extracted data fields to add:
- `feature_annotation_process_snapshot.captured_ts`
- `feature_annotation_process_snapshot.operator_group`
- `feature_annotation_process_snapshot.annotation_characteristic_count`
- `feature_annotation_process_snapshot.video_review_required_flag`
- `feature_annotation_process_snapshot.annotation_team_size_estimate`
- `feature_annotation_process_snapshot.source_url`
- `model_maintenance_cost_snapshot.capture_ts`
- `model_maintenance_cost_snapshot.initial_build_time_months_estimate`
- `model_maintenance_cost_snapshot.initial_build_cost_usd_estimate`
- `model_maintenance_cost_snapshot.recurring_update_cadence`
- `model_maintenance_cost_snapshot.source_url`
- `execution_footprint_tranche_event.event_ts`
- `execution_footprint_tranche_event.market_id`
- `execution_footprint_tranche_event.selection_id`
- `execution_footprint_tranche_event.tranche_stake`
- `execution_footprint_tranche_event.tranche_count`
- `execution_footprint_tranche_event.intent_masking_hypothesis_flag`
- `execution_footprint_tranche_event.source_url`
- `adversarial_flow_monitor_snapshot.capture_ts`
- `adversarial_flow_monitor_snapshot.external_flow_service_present_flag`
- `adversarial_flow_monitor_snapshot.service_name`
- `adversarial_flow_monitor_snapshot.source_url`

Model ideas:
- Add an `annotation_depth_score` (by venue/era/data family) so predictions can be conditioned on feature curation maturity rather than raw model class alone.
- Add an `order_footprint_entropy` feature to execution analytics to test whether tranche design reduces detectable information leakage before off.

Execution lessons:
- Treat feature engineering as a maintained production process with explicit staffing/cadence metadata, not a one-time model build artifact.
- Separate `edge creation` from `edge concealment`; execution slicing policy can be a first-class alpha-preservation control.

Contradiction noted:
- Prior simplification: historical Benter/Woods edges were mostly summarized as better probability math plus public-odds blending. This source adds an operational layer where high-touch annotation processes and bet-footprint management materially shape realized edge.

### WIRED's Triple Trio example adds a concrete combinatorial-staking scale marker for exotic pools

- [B] The same WIRED piece reports a record Triple Trio payout event where two computer-assisted bettors covered `900,000` combinations with approximately `$1.2 million` in stake.
- [B] Inference: exotic-pool optimization requires explicit combinatorial-budget governance and pool-impact constraints; naive independent-bet sizing abstractions are structurally unsafe at this scale.

Extracted data fields to add:
- `exotic_combination_plan_event.event_ts`
- `exotic_combination_plan_event.bet_type`
- `exotic_combination_plan_event.combination_count`
- `exotic_combination_plan_event.total_outlay`
- `exotic_combination_plan_event.estimated_pool_share`
- `exotic_combination_plan_event.execution_window_sec`
- `exotic_combination_plan_event.source_url`

Model ideas:
- Add a constrained optimizer for exotic pools that jointly solves expected edge, combination coverage, and maximum pool-share caps.

Execution lessons:
- Persist planned vs realized combination coverage and outlay so large exotic strategies can be audited against pool-impact assumptions.

Contradiction noted:
- Prior simplification: exotic strategy sizing was treated as a scaled extension of single-selection staking. Reported Hong Kong computer-team behavior suggests a distinct combinatorial optimization regime.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [B] This pass adds net-new operational detail for Benter-era teams (annotation scale, maintenance cost/cadence, footprint masking, and combinatorial exotic staking scale) from a long-form contemporaneous profile.
- [B] No net-new primary methodological disclosure was identified this pass for Alan Woods internals beyond prior reportage.
- [A] No net-new primary-source methodology disclosures were identified this pass for Walsh or Ranogajec internals.
- [A] No higher-signal CAW policy-rule source was added this pass beyond the existing NYRA/Del Mar/CHRB corpus.

## Source notes (incremental additions for pass 66)

- WIRED, *The High Tech Trifecta* (published 2002-03-01; captured 2026-03-31): https://www.wired.com/2002/03/betting/

## Incremental sourced findings added in this run (2026-03-31, pass 67)

### Betfair app-key lifecycle docs add an execution-safety nuance: delayed keys still hit production and live keys start inactive

- [A] Betfair Developer support (updated 2025-10-30) states `createDeveloperAppKeys` assigns both a `Live` and `Delayed` app key.
- [A] The same source states the `Live` app key is inactive on creation.
- [A] The same source states the `Delayed` key operates on the live production Betfair Exchange (not a virtual-currency sandbox/testbed), with delayed price snapshots.
- [A/B] Inference: environment labels (`delayed` vs `live`) are not a safe proxy for `production vs non-production`; key-state and account-level routing controls need explicit runtime enforcement.

Extracted data fields to add:
- `app_key_lifecycle_snapshot.captured_ts`
- `app_key_lifecycle_snapshot.live_key_assigned_flag`
- `app_key_lifecycle_snapshot.delayed_key_assigned_flag`
- `app_key_lifecycle_snapshot.live_key_initially_inactive_flag`
- `app_key_lifecycle_snapshot.delayed_key_runs_on_production_flag`
- `app_key_lifecycle_snapshot.source_url`
- `execution_environment_guard_event.event_ts`
- `execution_environment_guard_event.app_key_mode(delayed|live)`
- `execution_environment_guard_event.production_route_allowed_flag`
- `execution_environment_guard_event.guard_reason`

Model ideas:
- Add an `environment_confidence_gate` feature that suppresses live-like microstructure labeling when runtime app-key state and routing proofs are incomplete.

Execution lessons:
- Treat delayed-key sessions as production-touching sessions for operational controls (audit, kill-switch, and account scoping), even when strategy mode is `development`.
- Require explicit activation-state checks before any workflow assumes `live` key availability.

Contradiction noted:
- Prior simplification: delayed keys implied a non-production testing path. Betfair docs explicitly state delayed keys run against production exchange infrastructure.

### Betfair `listMarketBook` order-fragment contract adds two reconciliation-critical boundaries (`betIds <= 250`, `matchedSince` semantics)

- [A] Betfair `listMarketBook` docs state that when `betIds` is used, a maximum of `250` bet IDs can be supplied in a request.
- [A] The same docs state `matchedSince` returns orders with at least one fragment matched since the provided timestamp, and returns all matched fragments for those qualifying orders (including fragments from before the timestamp); all executable orders are returned regardless of match date.
- [A/B] Inference: naive incremental pull logic can over-assume strict time-window filtering and silently create duplication or omission errors unless fragment lineage is persisted.

Extracted data fields to add:
- `order_pull_contract_snapshot.captured_ts`
- `order_pull_contract_snapshot.max_betids_per_request`
- `order_pull_contract_snapshot.matchedsince_returns_all_fragments_for_qualifying_order_flag`
- `order_pull_contract_snapshot.executable_orders_always_returned_flag`
- `order_pull_contract_snapshot.source_url`
- `order_fragment_lineage_event.event_ts`
- `order_fragment_lineage_event.bet_id`
- `order_fragment_lineage_event.fragment_match_ts`
- `order_fragment_lineage_event.fragment_before_matchedsince_flag`
- `order_fragment_lineage_event.pull_cursor_ts`

Model ideas:
- Add a `reconciliation_lineage_completeness_score` and downweight execution-performance conclusions when fragment lineage is incomplete.

Execution lessons:
- Enforce chunked `betIds` pagination (`<=250`) with deterministic merge semantics.
- Decouple `matchedSince` cursor logic from fragment-dedup logic; timestamp filtering alone is insufficient.

Contradiction noted:
- Prior simplification: `matchedSince` was treated as a strict per-fragment time filter. Betfair docs specify order-level qualification with full-fragment return behavior.

### Punting Form product + Terms pairing sharpens commercial-entitlement ambiguity for API users

- [A] Punting Form's Professional product page states Starter includes `API Access`, and Modeller adds sectional API access, historical-data purchase options, and historical Betfair prices/flucs.
- [A] The same page labels Modeller as `Personal use only`.
- [A] Punting Form Terms and Conditions state access to all products/services/data, including API access, is for personal use only unless prior written consent is granted for commercial use.
- [A/B] Inference: endpoint/tier capability does not confer commercial deployment rights; entitlement state must be tracked as contract evidence, not inferred from plan tier.

Extracted data fields to add:
- `provider_commercial_consent_snapshot.provider`
- `provider_commercial_consent_snapshot.captured_ts`
- `provider_commercial_consent_snapshot.personal_use_only_default_flag`
- `provider_commercial_consent_snapshot.prior_written_consent_required_flag`
- `provider_commercial_consent_snapshot.consent_artifact_ref`
- `provider_commercial_consent_snapshot.source_url`
- `provider_plan_capability_snapshot.provider`
- `provider_plan_capability_snapshot.plan_name`
- `provider_plan_capability_snapshot.api_access_advertised_flag`
- `provider_plan_capability_snapshot.sectional_api_advertised_flag`
- `provider_plan_capability_snapshot.source_url`

Model ideas:
- Add a `commercial_entitlement_confidence` gate so feature families derived from provider APIs are blocked from production scoring unless consent artifacts are present.

Execution lessons:
- Separate `technical capability` snapshots from `legal/commercial permission` snapshots in onboarding checklists.
- Require explicit written-consent artifact IDs before promoting provider-backed models beyond research mode.

Contradiction noted:
- Prior simplification: paid tier/API visibility was treated as near-equivalent to deployable entitlement. Punting Form Terms explicitly set personal-use default across API/data absent written commercial consent.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No higher-signal CAW policy/procedure source was identified this pass beyond the existing NYRA/Del Mar/CHRB corpus.
- [A] Strongest net-new signal this pass is execution-governance and entitlement-controls detail from Betfair and Punting Form primary documentation.

## Source notes (incremental additions for pass 67)

- Betfair support: delayed vs live application keys (updated 2025-10-30; captured 2026-03-31): https://support.developer.betfair.com/hc/en-us/articles/360009638032-When-should-I-use-the-Delayed-or-Live-Application-Key
- Betfair Exchange API docs: `listMarketBook` (updated 2024-06-04; captured 2026-03-31): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook
- Punting Form Professional product page (captured 2026-03-31): https://puntingform.com.au/products/professional
- Punting Form Terms and Conditions (captured 2026-03-31): https://puntingform.com.au/terms-and-conditions

## Incremental sourced findings added in this run (2026-04-01, pass 68)

### Betfair Stream segmentation contract adds a new checkpointing boundary (`SEG_END`) and message-size guardrail (`5MB`)

- [A] Betfair Exchange Stream API documentation states stream messages have a maximum size of `5MB`; when a larger update is needed, segmentation is used and can be explicitly requested with `segmentationEnabled=true`.
- [A] The same docs define segment markers `SEG_START` and `SEG_END`; for segmented initial images, intermediate segments can carry `fullImage=true` with empty `marketChanges`.
- [A] The same docs state clients should store `clk` and `publishTime` only at `SEG_END` when segmentation is active; for unsegmented updates, clocks are stored per message.
- [A/B] Inference: treating every incoming segmented frame as a committed market-state checkpoint can create replay drift and duplicate/partial-state risk; checkpoint commits should occur at segment boundaries.

Extracted data fields to add:
- `stream_segmentation_contract_snapshot.captured_ts`
- `stream_segmentation_contract_snapshot.max_message_size_bytes`
- `stream_segmentation_contract_snapshot.segmentation_enabled_flag`
- `stream_segmentation_contract_snapshot.segment_start_token`
- `stream_segmentation_contract_snapshot.segment_end_token`
- `stream_segmentation_contract_snapshot.source_url`
- `stream_segment_buffer_event.event_ts`
- `stream_segment_buffer_event.connection_id`
- `stream_segment_buffer_event.market_count`
- `stream_segment_buffer_event.segment_type`
- `stream_segment_buffer_event.full_image_flag`
- `stream_segment_buffer_event.empty_marketchanges_flag`
- `stream_segment_buffer_event.segment_commit_allowed_flag`
- `stream_segment_buffer_event.source_url`
- `stream_checkpoint_commit_event.event_ts`
- `stream_checkpoint_commit_event.connection_id`
- `stream_checkpoint_commit_event.commit_clk`
- `stream_checkpoint_commit_event.commit_pt`
- `stream_checkpoint_commit_event.commit_trigger(seg_end|unsegmented_message)`
- `stream_checkpoint_commit_event.source_url`

Model ideas:
- Add a `stream_segment_commit_integrity_score` feature that downweights late-window signal confidence when segmented bootstrap cycles are incomplete.
- Add a `bootstrap_fragmentation_risk` covariate in execution-simulation confidence so replay outcomes can be discounted when segment commits are missing.

Execution lessons:
- Do not advance replay/execution checkpoints on `SEG_START` or intermediate segments; commit state only at `SEG_END`.
- Add payload-size and segmentation telemetry as first-class collector health metrics before any microstructure-sensitive model promotion.

Contradiction noted:
- Prior simplification: each stream message was treated as immediately committable state under clock continuity. Betfair's segmentation contract adds explicit multi-message commit boundaries.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary-source methodology disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No stronger CAW-policy primary source was added this pass beyond the existing NYRA/Del Mar/CHRB corpus.
- [A] Strongest net-new signal this pass is Betfair Stream's segmented checkpoint and message-size contract detail.

## Source notes (incremental additions for pass 68)

- Betfair Exchange Stream API (updated 2026-02-20; captured 2026-04-01): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687396/Exchange+Stream+API

## Incremental sourced findings added in this run (2026-04-01, pass 69)

### Betfair's official status + release-notification surfaces add a missing operational-governance signal for execution safety

- [A] Betfair's official support FAQ explicitly directs API users to `https://status.developer.betfair.com/` as the status surface for Exchange API health.
- [A] Betfair's status site exposes operation-level components (for example: API, Betting API, Accounts API, Stream API, Global Exchange, AUS Exchange) rather than a single aggregate status, which enables route-specific health gating.
- [A] Betfair's support FAQ for release/outage notifications instructs users to subscribe to the Developer Forum `Announcements` area for API releases and planned outage periods.
- [A/B] Inference: API contract safety is not fully represented by static reference docs alone; an execution stack should treat status components plus announcement feeds as machine-consumable control inputs (startup gating, maintenance blackouts, and replay annotations).

Extracted data fields to add:
- `betfair_status_component_snapshot.capture_ts`
- `betfair_status_component_snapshot.component_name`
- `betfair_status_component_snapshot.component_status`
- `betfair_status_component_snapshot.status_page_url`
- `betfair_status_component_snapshot.source_url`
- `betfair_release_notice_event.event_ts`
- `betfair_release_notice_event.notice_channel(status_page|forum_announcements)`
- `betfair_release_notice_event.notice_type(release|planned_outage|incident_update)`
- `betfair_release_notice_event.notice_title`
- `betfair_release_notice_event.notice_url`
- `betfair_release_notice_event.effective_from`
- `betfair_release_notice_event.effective_to`

Model ideas:
- Add an `exchange_operational_health_score` feature that downweights microstructure-sensitive signals when any execution-critical Betfair component is degraded.
- Add a `maintenance_window_flag` covariate in live-vs-replay performance attribution to separate model edge from provider-operations regime shifts.

Execution lessons:
- Do not start live order-routing when `Betting API`, `Stream API`, or jurisdiction-specific exchange components are degraded, even if general API status appears mostly green.
- Treat Developer Forum announcement ingestion as a mandatory pre-trade control path, not optional operator reading.

Contradiction noted:
- Prior simplification: authoritative operational state was inferred mostly from runtime errors and static API docs. Betfair publishes explicit status and planned-outage/release channels that should be integrated as first-class control-plane inputs.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary-source methodological disclosures were identified this pass for Benter, Woods, Walsh, or Ranogajec internals.
- [A] No stronger CAW-policy primary artifact was identified this pass beyond the existing NYRA/Del Mar/CHRB/Equibase corpus already captured.
- [A] Strongest net-new signal this pass is Betfair operational-governance telemetry (status components + release/outage notification channels).

## Source notes (incremental additions for pass 69)

- Betfair Developer Support - How can I check the status of the Betfair API? (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360014583377-How-can-I-check-the-status-of-the-Betfair-API
- Betfair Developer Status page (captured 2026-04-01): https://status.developer.betfair.com/
- Betfair Developer Support - How can I be notified regarding API releases & planned outage periods? (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/115003899492-How-can-I-be-notified-regarding-API-releases-planned-outage-periods

## Incremental sourced findings added in this run (2026-04-01, pass 70)

### Betfair delay behavior can be event-scoped and phased (odd/even partition rollouts), not just market-static

- [A/B] Betfair Developer Forum announcement updates in the long-running `No Delays on Passive Bets - Selected Events` thread show operational rollout mechanics where no-delay passive matching is enabled for selected competitions/events, including phased expansion patterns (for example odd-event-ID subsets before full-scale rollout).
- [A/B] Inference: delay regime should be treated as a dynamic event-policy overlay (`eventId`/competition scoped and time-versioned), not a single sport-level constant.

Extracted data fields to add:
- `bet_delay_policy_rollout_event.capture_ts`
- `bet_delay_policy_rollout_event.source_channel(forum_announcement)`
- `bet_delay_policy_rollout_event.competition_id`
- `bet_delay_policy_rollout_event.event_id`
- `bet_delay_policy_rollout_event.rollout_scope(selected|odd_event_subset|full)`
- `bet_delay_policy_rollout_event.policy_label(no_delay_on_passive|standard_delay)`
- `bet_delay_policy_rollout_event.effective_from`
- `bet_delay_policy_rollout_event.effective_to`
- `bet_delay_policy_rollout_event.source_url`

Model ideas:
- Add an `event_scoped_delay_regime_flag` to execution/latency models and treat rollout windows as separate calibration strata.
- Add a `delay_policy_transition_risk` feature for periods immediately before and after announced rollout-scope changes.

Execution lessons:
- Do not hardcode delay behavior at sport level; consume announcement-driven regime deltas into market-selection and replay labeling.
- Run parser checks for phased rollouts (subset event IDs) so strategy logic does not assume universal policy within one competition.

Contradiction noted:
- Prior simplification: delay behavior was treated as mostly sport- or market-level static state. Forum rollout evidence indicates explicit event-scoped phased deployment.

### Racing NSW 2024-25 race-fields reporting adds fee/regime changes that materially affect AU cost modeling

- [A] Racing NSW's 2024-25 annual report documents that, effective 1 January 2025, `Derivative Bets` were included in Race Fields fees at `2.5%` of NSW thoroughbred turnover and `3.5%` for Premier Race Meetings.
- [A] The same report states there were `249` approved wagering operators under the NSW Race Fields scheme in 2024-25.
- [A] The same report states that certain non-wagering operators with agreements through Racing Australia's authorised distributors do not require a separate Racing NSW application.
- [A/B] Inference: AU provider and rights-cost models need explicit product-type branching (`derivative` vs non-derivative) plus entitlement-path branching (direct NSW approval vs RA distributor path).

Extracted data fields to add:
- `nsw_racefields_fee_regime_snapshot.capture_ts`
- `nsw_racefields_fee_regime_snapshot.derivative_bets_included_flag`
- `nsw_racefields_fee_regime_snapshot.derivative_fee_pct`
- `nsw_racefields_fee_regime_snapshot.premier_meeting_derivative_fee_pct`
- `nsw_racefields_fee_regime_snapshot.effective_from`
- `nsw_racefields_operator_count_snapshot.capture_ts`
- `nsw_racefields_operator_count_snapshot.approved_operator_count`
- `nsw_entitlement_path_snapshot.capture_ts`
- `nsw_entitlement_path_snapshot.operator_type(wagering|non_wagering)`
- `nsw_entitlement_path_snapshot.ra_distributor_agreement_flag`
- `nsw_entitlement_path_snapshot.separate_racing_nsw_application_required_flag`
- `nsw_entitlement_path_snapshot.source_url`

Model ideas:
- Add a `rights_cost_regime` feature family that conditions expected-value and bankroll-allocation outputs on product-type fee schedules.
- Add an `entitlement_path_confidence` flag so data-source weights are reduced when approval path evidence is incomplete.

Execution lessons:
- Cost normalization must separate NSW `Derivative Bets` turnover from other product categories from 1 January 2025 onward.
- Provider onboarding should explicitly store whether entitlement came via direct NSW approval or an RA authorised-distributor agreement.

Contradiction noted:
- Prior simplification: NSW race-fields cost was treated as near-uniform across bet-product categories. Racing NSW reporting adds explicit derivative-bet fee segmentation and entitlement-path variance.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary technical disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] CAW microstructure signal this pass came from platform/venue policy surfaces (Betfair rollout announcements) rather than new syndicate self-disclosure.

## Source notes (incremental additions for pass 70)

- Betfair Developer Forum announcement thread (`No Delays on Passive Bets - Selected Events - PLEASE SUBSCRIBE FOR UPDATES`; indexed updates captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements/40962-no-delays-on-passive-bets-selected-events-please-subscribe-for-updates?p=41471
- Racing NSW Annual Report 2024-25 (tabled 2025-11-20; captured 2026-04-01): https://www.parliament.nsw.gov.au/tp/files/192181/2024-25%20Racing%20NSW%20Annual%20Report.pdf

## Incremental sourced findings added in this run (2026-04-01, pass 71)

### Racing Australia coverage signal conflict: corporate service narrative says "except WA" while FreeFields exposes WA race artifacts

- [A] Racing Australia's Role and Services page states RA compiles, distributes, and publishes Race Fields for all states and territories "except WA".
- [A] Racing Australia's FreeFields WA scratchings page is publicly accessible and carries live WA venue/date entries plus WA-specific form semantics (for example apprentice riding weight notes).
- [A/B] Inference: provider-jurisdiction lineage cannot be inferred from one static corporate-description surface; ingestion must retain endpoint-level evidence and effective-date context.

Extracted data fields to add:
- `provider_coverage_claim_snapshot.provider`
- `provider_coverage_claim_snapshot.capture_ts`
- `provider_coverage_claim_snapshot.claim_scope_text`
- `provider_coverage_claim_snapshot.wa_excluded_flag`
- `provider_coverage_claim_snapshot.source_url`
- `endpoint_jurisdiction_observation.provider`
- `endpoint_jurisdiction_observation.capture_ts`
- `endpoint_jurisdiction_observation.endpoint_url`
- `endpoint_jurisdiction_observation.jurisdiction`
- `endpoint_jurisdiction_observation.artifact_type`
- `endpoint_jurisdiction_observation.visible_flag`
- `endpoint_jurisdiction_observation.source_url`

Model ideas:
- Add a `provider_coverage_conflict_flag` to downweight feature families when corporate coverage claims and endpoint-observed jurisdiction coverage disagree.
- Add a `jurisdiction_source_confidence` feature for WA signals until lineage is reconciled (RA endpoint vs WA-specific authority/provider path).

Execution lessons:
- Build coverage maps from endpoint observations first, then reconcile against policy/marketing claims as a separate governance layer.
- Block automatic jurisdiction expansion when claim-vs-endpoint conflicts exist and no adjudication artifact is stored.

Contradiction noted:
- Prior simplification: RA's corporate service description was treated as a reliable single-source coverage boundary. Public WA FreeFields endpoints show endpoint-level behavior can diverge from summary narratives.

### Keeneland's wagering transparency page adds a quantitative CAW-composition benchmark and explicit odds-refresh contract

- [A] Keeneland's wagering-experience page reports a two-year wagering-source mix with `23%` CAW share.
- [A] The same page states odds refresh every `5 seconds` in the final two minutes before post, odds become final when betting closes at race start, and betting is locked at the break by stewards.
- [A/B] Inference: CAW-impact analysis should separate participant-share composition from odds-publication cadence; late-cycle UI refresh behavior can explain perceived post-break odds movement without implying post-start betting access.

Extracted data fields to add:
- `venue_wager_mix_snapshot.venue`
- `venue_wager_mix_snapshot.capture_ts`
- `venue_wager_mix_snapshot.caw_share_pct`
- `venue_wager_mix_snapshot.adw_share_pct`
- `venue_wager_mix_snapshot.brick_mortar_share_pct`
- `venue_wager_mix_snapshot.on_track_share_pct`
- `venue_odds_refresh_contract_snapshot.venue`
- `venue_odds_refresh_contract_snapshot.capture_ts`
- `venue_odds_refresh_contract_snapshot.refresh_interval_sec_final_window`
- `venue_odds_refresh_contract_snapshot.final_window_sec`
- `venue_odds_refresh_contract_snapshot.betting_lock_event`
- `venue_odds_refresh_contract_snapshot.source_url`

Model ideas:
- Add a `display_cadence_lag_exposure` covariate for tote-style venues where odds publication cadence can lag lock events.
- Add a `caw_share_regime` prior for cross-venue CAW-sensitivity benchmarking when evaluating policy interventions.

Execution lessons:
- Keep pool-close semantics and odds-display cadence as separate timeline events in replay/diagnostics.
- When benchmarking CAW policy outcomes, normalize for baseline CAW-share composition before causal comparisons.

Contradiction noted:
- Prior simplification: visible post-break odds movement was often interpreted as a direct timing-access effect. Keeneland's published cadence and lock semantics indicate display-cycle timing can produce similar observations.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Strongest CAW-team-adjacent delta this pass is venue-published composition and odds-cycle transparency (Keeneland), not new syndicate proprietary model disclosure.
- [A] Strongest AU provider delta this pass is coverage-lineage contradiction detection on Racing Australia surfaces.

## Source notes (incremental additions for pass 71)

- Racing Australia Role and Services (`Compilation of Race Fields ... except WA`; captured 2026-04-01): https://www.racingaustralia.horse/Aboutus/Role-and-Services.aspx
- Racing Australia FreeFields WA scratchings page (captured 2026-04-01): https://www.racingaustralia.horse/FreeFields/Calendar_Scratchings.aspx?State=WA
- Keeneland wagering experience page (captured 2026-04-01): https://www.keeneland.com/wagering-experience

## Incremental sourced findings added in this run (2026-04-01, pass 72)

### Betfair price-surface semantics: website and API can diverge by representation mode and key-state delay, not matching logic

- [A] Betfair Developer Support states website prices can include Exchange-generated virtual bets, while `listMarketBook` does not return virtual bets by default.
- [A] The same article states virtual prices can be included via `priceProjection.virtualise=true` (REST) or `EX_BEST_OFFERS_DISP` (Stream).
- [A] The same article states delayed application keys can return snapshots delayed by `1-180 seconds`.
- [A] The same article states website "bet view slider" stake aggregation differs from API defaults and can be replicated using `exBestOffersOverrides` with `RollUpModel=STAKE`.
- [A/B] Inference: a single "best price" field is insufficient for model/replay parity; we need explicit representation metadata (`raw`, `virtualised`, `stake-rolled`) and key-state delay context.

Extracted data fields to add:
- `price_surface_snapshot.capture_ts`
- `price_surface_snapshot.market_id`
- `price_surface_snapshot.selection_id`
- `price_surface_snapshot.surface_mode(raw|virtualised|stake_rolled)`
- `price_surface_snapshot.virtualise_flag`
- `price_surface_snapshot.rollup_model`
- `price_surface_snapshot.rollup_limit`
- `price_surface_snapshot.app_key_mode(live|delayed)`
- `price_surface_snapshot.delay_window_sec_min`
- `price_surface_snapshot.delay_window_sec_max`
- `price_surface_snapshot.source_url`

Model ideas:
- Add a `surface_mode_mismatch_flag` feature to downweight signals when training/serving market representations differ.
- Add an `app_key_delay_uncertainty` penalty term in late-window edge estimates for any delayed-key or unknown-key-state capture.

Execution lessons:
- Persist and audit price representation mode on every snapshot; do not merge `raw` and `virtualised` ladders into one canonical series.
- Block strategy promotion when evaluation data mixes live-key and delayed-key snapshots without explicit stratification.

Contradiction noted:
- Prior simplification: price discrepancies were treated mostly as transport latency/noise. Betfair support documentation adds deterministic representation-mode and key-state causes.

### Racing Australia wholesaler reform is now explicit and date-versioned; entitlement routing must use provider-path metadata

- [A] Racing Australia's `Racing Materials distribution - Wholesaler Agreement` release (19 June 2025) states the market moved from three wholesalers (Mediality Racing, BettorData, Racing Australia) to five authorised wholesalers.
- [A] The same release states Racing Australia stepped back from direct wholesaling to a compliance role, with all authorised wholesalers operating under common Wholesaler Agreement terms.
- [A] The same release names the five wholesalers as BettorData, BetMakers, Mediality Racing, News Perform (Punters Paradise), and Racing and Sports, with commencement `1 July 2025`.
- [A/B] Inference: provider selection is now a multi-wholesaler routing problem with common contractual baseline but potentially different operational SLAs and product wrappers.

Extracted data fields to add:
- `ra_wholesaler_framework_snapshot.capture_ts`
- `ra_wholesaler_framework_snapshot.effective_from`
- `ra_wholesaler_framework_snapshot.ra_wholesaler_count`
- `ra_wholesaler_framework_snapshot.ra_direct_wholesaler_flag`
- `ra_wholesaler_member.provider_name`
- `ra_wholesaler_member.authorised_flag`
- `ra_wholesaler_member.framework_version`
- `ra_wholesaler_member.source_url`

Model ideas:
- Add a `provider_path_variance` prior so feature reliability can differ by wholesaler path even under shared headline terms.
- Add a `framework_change_regime` feature to isolate model drift around the 1 July 2025 transition.

Execution lessons:
- Store entitlement path as `{jurisdiction, authority, wholesaler}` rather than authority-only.
- Require an effective-date check at job start so backtests before and after 1 July 2025 use correct provider-path assumptions.

Contradiction noted:
- Prior simplification: Racing Australia surfaces were treated as a quasi-single supplier boundary. The 2025 framework formalizes a five-wholesaler topology.

### Australian data-provider operations: Mediality discloses concrete historical depth and freshness timings; SNS page confirms strict non-commercial credential constraints

- [A/B] Mediality's public FAQ states its results history starts `January 1982` and gives explicit operational timing claims (`~5 minutes` after acceptances; `~20 minutes` after correct weight for results).
- [A/B] Mediality's homepage states it is an "Authorised agent of official Racing Australia data."
- [A] Racing Australia's SNS login page states SNS access is for authorised personnel at principal racing authorities/race clubs and explicitly forbids providing information to third parties for personal or commercial use.
- [A/B] Inference: AU ingest governance needs separate trust layers for (1) entitlement legality and (2) delivery freshness/SLA claims; they are related but not interchangeable.

Extracted data fields to add:
- `provider_history_depth_snapshot.provider`
- `provider_history_depth_snapshot.capture_ts`
- `provider_history_depth_snapshot.results_start_date`
- `provider_freshness_claim_snapshot.provider`
- `provider_freshness_claim_snapshot.acceptance_to_file_min`
- `provider_freshness_claim_snapshot.correct_weight_to_result_min`
- `provider_authorisation_claim_snapshot.provider`
- `provider_authorisation_claim_snapshot.claim_text`
- `credential_use_constraint_snapshot.system_name`
- `credential_use_constraint_snapshot.authorised_personnel_only_flag`
- `credential_use_constraint_snapshot.third_party_commercial_sharing_prohibited_flag`
- `credential_use_constraint_snapshot.source_url`

Model ideas:
- Add a `provider_freshness_confidence` feature to reduce live signal weight when observed latency breaches published delivery windows.
- Add a `data_rights_confidence` gate that prevents promotion when credential-use constraints conflict with intended commercial workflow.

Execution lessons:
- Track observed-vs-claimed freshness per provider and quarantine features during sustained SLA drift.
- Keep credential and rights artifacts in immutable audit records; policy text belongs in runtime controls, not just legal docs.

Contradiction noted:
- Prior simplification: provider capability and legal entitlement were often combined in one "provider quality" score. Source evidence indicates they require separate control planes.

### CAW-team policy signal: NYRA's 2026 guardrails and tote-close semantics clarify timing-rule vs post-start display-lag effects

- [A] NYRA's 30 January 2026 release states that from `5 February 2026`, CAW activity must cease at `one minute to post` in pools not already restricted.
- [A] The same release defines CAW activity operationally as wager execution speed exceeding `six bets per second`.
- [A] The same release confirms NYRA's earlier win-pool restriction remains in force (no CAW later than two minutes to post in win pools) and retail-only status for Late Pick 5 and Pick 6.
- [A] NYRA betting FAQ states wagering closes when the gate opens and final odds may still update during race progress due to totalisator settlement lag from last-minute simulcast wagering, not post-start acceptance.
- [A/B] Inference: CAW-impact attribution must model both rule cutoff timestamps and tote publication/settlement lag to avoid false positives in "late betting" diagnostics.

Extracted data fields to add:
- `venue_caw_guardrail_snapshot.venue`
- `venue_caw_guardrail_snapshot.capture_ts`
- `venue_caw_guardrail_snapshot.effective_from`
- `venue_caw_guardrail_snapshot.cutoff_sec_to_post`
- `venue_caw_guardrail_snapshot.speed_threshold_bets_per_sec`
- `venue_caw_guardrail_snapshot.pool_scope`
- `venue_retail_only_pool_snapshot.venue`
- `venue_retail_only_pool_snapshot.bet_type`
- `venue_retail_only_pool_snapshot.retail_only_flag`
- `tote_close_publish_lag_contract_snapshot.venue`
- `tote_close_publish_lag_contract_snapshot.wagering_close_event`
- `tote_close_publish_lag_contract_snapshot.final_odds_publish_lag_reason`
- `tote_close_publish_lag_contract_snapshot.post_start_betting_capability_flag`
- `tote_close_publish_lag_contract_snapshot.source_url`

Model ideas:
- Add a `caw_guardrail_regime` feature keyed by venue/date/pool to segment policy-effect studies.
- Add a `tote_settlement_lag_proxy` covariate so post-break odds updates are separated from true access-timing effects.

Execution lessons:
- Keep `cutoff_policy_ts`, `gate_open_ts`, and `final_odds_publish_ts` as distinct timeline events.
- In CAW diagnostics, classify late odds movement as `policy-window`, `settlement-lag`, or `unknown`, not a single bucket.

Contradiction noted:
- Prior simplification: post-start odds movement was treated as a direct proxy for post-start wagering access. NYRA documentation explicitly provides an alternative settlement-lag explanation.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] Strongest CAW-team-adjacent primary delta this pass is NYRA's explicit 2026 guardrail policy and speed threshold definitions.
- [A] Strongest AU provider-structure delta this pass is Racing Australia's wholesaler-framework formalization plus SNS credential-use constraints.

## Source notes (incremental additions for pass 72)

- Racing Australia media release PDF, `Racing Materials distribution - Wholesaler Agreement` (dated 2025-06-19; captured 2026-04-01): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf
- Betfair Developer Support, `Why are the prices displayed on the website different from what I see in my API application?` (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Betfair Developer Support, `Why do markets not appear in the listEvents, listMarketCatalogue or listMarketBook API response?` (updated 2025-11-28; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listEvents-listMarketCatalogue-or-listMarketBook-API-response
- NYRA release, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; captured 2026-04-01): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- NYRA betting FAQ (Aqueduct; captured 2026-04-01): https://cms.nyra.com/aqueduct/racing/betting-faq
- Mediality Racing FAQ (`data-faq`; captured 2026-04-01): https://medialityracing.com.au/data-faq/
- Mediality Racing homepage (`Authorised agent` claim; captured 2026-04-01): https://medialityracing.com.au/
- Racing Australia SNS login (`authorised personnel` and third-party use restriction; captured 2026-04-01): https://www.racingaustralia.horse/IndustryLogin/SNS_Login.aspx

## Incremental sourced findings added in this run (2026-04-01, pass 73)

### Betfair PRO historical-data volume semantics add non-obvious reconstruction rules that can break naive replay

- [A] Betfair support states `atb/atl` values in PRO files are absolute available volume at each price (not incremental deltas), and `0` volume updates mean no volume remains at that price level.
- [A] The same source states `trd` values are cumulative per price point and that PRO files do not provide a single cumulative traded-volume field per runner across all prices.
- [A] The same source states traded volume is expressed as `backers stake x 2`, and warns that cross-currency matching can generate nominal `trd` adjustments that may decrease previously reported traded values.
- [A/B] Inference: historical replay must treat traded-volume and ladder state as revision-capable state machines (including downward `trd` corrections), not monotonic append-only time series.

Extracted data fields to add:
- `historical_ladder_level_snapshot.source_mode(pro_historical)`
- `historical_ladder_level_snapshot.side(atb|atl)`
- `historical_ladder_level_snapshot.price`
- `historical_ladder_level_snapshot.available_volume_abs`
- `historical_ladder_level_snapshot.zero_volume_clear_flag`
- `historical_traded_point_snapshot.selection_id`
- `historical_traded_point_snapshot.price`
- `historical_traded_point_snapshot.traded_volume_cumulative_at_price`
- `historical_traded_point_snapshot.backers_stake_equiv`
- `historical_traded_point_snapshot.fx_adjustment_flag`
- `historical_traded_point_snapshot.traded_volume_revision_direction(increase|decrease)`

Model ideas:
- Add an `fx_adjusted_tv_revision_rate` feature so unreliable price-point turnover windows are downweighted in microstructure models.
- Add a `ladder_clear_intensity` feature family using zero-volume clears as a proxy for queue depletion dynamics.

Execution lessons:
- Reconstruct orderbook state using absolute overwrite semantics for `atb/atl`, not additive updates.
- Allow negative delta corrections when deriving traded-flow features from cumulative `trd` points.

Contradiction noted:
- Prior simplification: traded volume and ladder updates were often treated as monotonic additive streams. Betfair PRO semantics explicitly allow zero-clears and downward traded-volume corrections.

### Betfair advanced update guidance adds an implicit-cancel rule: conflicting top-of-book updates may arrive without explicit cancel messages

- [A] Betfair's advanced historical-data guidance defines `batb/batl` tuples as `[level, price, volume]` and provides explicit examples where a later conflicting top-of-book update should be interpreted as prior unmatched orders being matched/cancelled and remaining orders moved.
- [A] The same guidance explicitly notes that an unmatched top-of-book order can be cancelled with no explicit cancellation update emitted in the stream message sequence.
- [A/B] Inference: point-in-time queue reconstruction should include implicit-cancel inference logic; relying only on explicit cancel events will overstate resting liquidity and bias fill simulations.

Extracted data fields to add:
- `historical_stream_update_contract_snapshot.tuple_schema_batb_batl`
- `historical_stream_update_contract_snapshot.implicit_cancel_possible_flag`
- `historical_stream_conflict_event.market_id`
- `historical_stream_conflict_event.selection_id`
- `historical_stream_conflict_event.prior_top_price`
- `historical_stream_conflict_event.new_top_price`
- `historical_stream_conflict_event.implicit_cancel_inferred_flag`
- `historical_stream_conflict_event.reconstruction_confidence`

Model ideas:
- Add an `implicit_cancel_risk` feature in fill-probability models for windows with frequent conflicting top-of-book updates.
- Build a replay-quality score that penalizes samples with high unresolved conflict-update density.

Execution lessons:
- Keep explicit and inferred cancel pathways separate in audit logs.
- Gate simulation promotions on reconstruction parity tests against known edge cases from Betfair's published examples.

Contradiction noted:
- Prior simplification: missing cancel messages meant queue persistence. Betfair support shows cancellation can occur without explicit cancellation updates.

### BSP historical CSV columns have a strict reconciliation identity that should be encoded as a data-quality invariant

- [A] Betfair support states `MORNINGTRADEDVOL` can exceed `PPTRADEDVOL + IPTRADEDVOL` because PP/IP do not include Betfair Starting Price volume.
- [A] The same article identifies the BSP component as the difference between `MORNINGTRADEDVOL` and the sum of PP/IP traded volumes.
- [A/B] Inference: BSP historical features should include explicit decomposition checks before using morning-traded aggregates in model training.

Extracted data fields to add:
- `bsp_volume_decomposition_snapshot.market_id`
- `bsp_volume_decomposition_snapshot.selection_id`
- `bsp_volume_decomposition_snapshot.morning_traded_vol`
- `bsp_volume_decomposition_snapshot.pp_traded_vol`
- `bsp_volume_decomposition_snapshot.ip_traded_vol`
- `bsp_volume_decomposition_snapshot.bsp_component_vol`
- `bsp_volume_decomposition_snapshot.identity_holds_flag`

Model ideas:
- Add a `bsp_component_share` feature for pre-off vs BSP-driven turnover regime classification.
- Add a decomposition-integrity gate so samples failing the identity are excluded from BSP-feature training sets.

Execution lessons:
- Validate `MORNING = PP + IP + BSP_component` during ingest and quarantine malformed rows.
- Keep BSP-volume-derived features isolated from pure exchange pre-off microstructure features.

Contradiction noted:
- Prior simplification: morning traded volume was treated as primarily pre-play plus in-play turnover. Betfair documents a separate BSP component that must be reconciled explicitly.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] No stronger CAW policy primary source was identified this pass beyond the existing NYRA/Del Mar/CHRB corpus already captured.
- [A] Strongest net-new primary delta this pass is Betfair historical microstructure semantics relevant to BSP and orderbook reconstruction.

## Source notes (incremental additions for pass 73)

- Betfair support: `How is traded & available volume represented within the PRO Historical Data files?` (updated 2025-02-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360002401937-How-is-traded-available-volume-represented-within-the-PRO-Historical-Data-files
- Betfair support: `Advanced Historical Data - How do I interpret updates?` (updated 2025-02-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360018468438-Advanced-Historical-Data-How-do-I-interpret-updates
- Betfair support: `Why at times does the MORNINGTRADEDVOL column exceed the sum of the PPTRADEDVOL and IPTRADEDVOL?` (updated 2025-02-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360008669197-Why-at-times-does-the-MORNINGTRADEDVOL-column-exceed-the-sum-of-the-PPTRADEDVOL-and-IPTRADEDVOL
- Betfair support: `How do I download and view Betfair Historical Data?` (updated 2025-07-15; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360000402211-How-do-I-download-and-view-Betfair-Historical-Data

## Incremental sourced findings added in this run (2026-04-01, pass 74)

### Racing Victoria counterparty rules make approval-state a hard execution constraint (not just onboarding metadata)

- [A] Racing Victoria's Standard Conditions (effective 1 March 2025) state an Approved WSP must not place bets on Victorian races with a Non-Approved WSP, must not accept bets from a Non-Approved WSP, and must not enter related arrangements with Non-Approved WSPs.
- [A] The same clause set prohibits accepting betting transactions facilitated by a Betting Intermediary other than under the approved framework.
- [A/B] Inference: execution routing must enforce approval-state checks on wagering counterparties continuously, not only at provider onboarding time.

Extracted data fields to add:
- `wsp_counterparty_constraint_snapshot.capture_ts`
- `wsp_counterparty_constraint_snapshot.jurisdiction(VIC)`
- `wsp_counterparty_constraint_snapshot.approved_wsp_required_flag`
- `wsp_counterparty_constraint_snapshot.non_approved_wsp_prohibited_flag`
- `wsp_counterparty_constraint_snapshot.non_approved_facilitation_prohibited_flag`
- `wsp_counterparty_constraint_snapshot.effective_from`
- `wsp_counterparty_constraint_snapshot.effective_to`
- `wsp_counterparty_constraint_snapshot.source_url`

Model ideas:
- Add a `counterparty_compliance_regime` feature for replay segmentation so strategy performance can be measured under strict-approval vs permissive-sim assumptions.
- Add a `counterparty_eligibility_confidence` prior that downweights any sample where execution-path counterparties cannot be verified as approved at event time.

Execution lessons:
- Treat counterparty approval-state as a pre-trade hard gate in live schedulers.
- Snapshot approved-operator registries on a defined cadence and join by effective date at decision time.

Contradiction noted:
- Prior simplification: counterparty status was often treated as a static legal artifact. RV conditions imply a live execution-path constraint with direct operational consequences.

### RV turnover definitions include lay-off betting flows, so naive turnover labels can misstate true market-facing activity

- [A] RV Standard Conditions define `Bets Taken` to include amounts from betting transactions made by another wagering service provider to lay off that provider's liability.
- [A/B] Inference: turnover and exposure labels must distinguish customer-origin flow from inter-operator lay-off flow to avoid distorted strategy economics and market-impact estimates.

Extracted data fields to add:
- `vic_turnover_definition_snapshot.capture_ts`
- `vic_turnover_definition_snapshot.metric_name(bets_taken)`
- `vic_turnover_definition_snapshot.includes_layoff_flow_flag`
- `vic_turnover_definition_snapshot.layoff_flow_scope_text`
- `vic_turnover_definition_snapshot.source_url`
- `bet_flow_fact.flow_origin(customer|wsp_layoff|unknown)`
- `bet_flow_fact.reportable_turnover_inclusion_flag`

Model ideas:
- Add `layoff_flow_share` as a confound-control feature in turnover-to-edge diagnostics.
- Add a `reporting_definition_regime` covariate for any model trained on reporting-derived turnover labels.

Execution lessons:
- Keep separate ledgers for `customer_flow` and `layoff_flow`, then materialize reportable turnover views from policy rules.
- Prevent direct use of raw reportable turnover as a liquidity proxy without flow-origin decomposition.

Contradiction noted:
- Prior simplification: reportable turnover was treated as equivalent to customer demand. RV definitions explicitly include inter-operator lay-off flow.

### RV transaction-information access controls imply authenticated regulator-request workflows

- [A] RV Standard Conditions state only RV Authorised Officers may request or receive betting transaction information from a wagering service provider.
- [A/B] Inference: compliance-data export workflows need requester-authentication and request-audit controls, not ad hoc manual extracts.

Extracted data fields to add:
- `regulatory_request_authority_snapshot.jurisdiction(VIC)`
- `regulatory_request_authority_snapshot.authorised_officer_only_flag`
- `regulatory_request_authority_snapshot.capture_ts`
- `regulatory_request_authority_snapshot.source_url`
- `regulatory_data_request_log.request_ts`
- `regulatory_data_request_log.requester_identity`
- `regulatory_data_request_log.authority_validation_result`
- `regulatory_data_request_log.artifact_hash`

Model ideas:
- Add a `compliance_request_event_flag` control variable so unusual post-request operational behavior is not misattributed to model drift.

Execution lessons:
- Require cryptographically auditable request artifacts for transaction-data disclosures.
- Reject or quarantine transaction-data export jobs when requester authority validation is missing.

Contradiction noted:
- Prior simplification: compliance data exports were treated mostly as formatting/SLA tasks. Source clauses add a hard requester-authority control requirement.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] No stronger primary CAW-team mechanics source was found this pass beyond the existing NYRA/Del Mar/CHRB/Keeneland corpus.
- [A] Strongest net-new primary delta this pass is Victorian race-fields counterparty/reporting control semantics from RV Standard Conditions.

## Source notes (incremental additions for pass 74)

- Racing Victoria Race Fields Policy page (captured 2026-04-01): https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria Standard Conditions of Approval - Effective 1 March 2025 (captured 2026-04-01): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f
- Racing Victoria Approved Wagering Service Providers page (captured 2026-04-01): https://www.racingvictoria.com.au/wagering/wagering-service-providers

## Incremental sourced findings added in this run (2026-04-01, pass 75)

### CHRB-published CAW Q&A adds concrete execution-control and late-odds attribution signals beyond NYRA cutoff timing

- [A/B] CHRB's published `Computer Assisted Wagering Question & Answer` PDF (dated 2024-09-05) states AmTote provides the same tote feed to Elite and retail customers; the document attributes perceived differences to display-cycle/view constraints rather than privileged feed content.
- [A/B] The same document states pool close is simultaneous across host/guest locations, cites time-synchronised transactional/ITSP logs for auditability, and states Elite players are forbidden from cancelling bets.
- [A/B] The same source states AmTote can process up to `2,000 bets/second` from a single client, while California tracks define CAW at more than `5 bets/second` with additional controls (vetting, dedicated TRA code, ongoing checks).
- [A/B] The same source includes venue-level composition/flow metrics: Santa Anita target CAW share around `20%` handle, sampled win-pool CAW share around `17%`, and around `43%` of last-60-second inflow in sampled races.
- [A/B] The same source states odds can update after gate-open because commingled tote settlement/publication can take roughly `3-5 seconds`, even when wagering is closed.
- [A/B] Inference: late-window diagnostics should separate `access-window policy`, `throughput concentration`, and `publish-lag mechanics`; cutoff-only models are under-specified.

Extracted data fields to add:
- `venue_caw_profile_snapshot.venue`
- `venue_caw_profile_snapshot.caw_definition_bets_per_sec`
- `venue_caw_profile_snapshot.caw_target_handle_pct`
- `venue_caw_profile_snapshot.caw_last60s_inflow_share_pct`
- `venue_caw_profile_snapshot.caw_sample_total_pool_share_pct`
- `venue_caw_profile_snapshot.caw_cancel_prohibited_flag`
- `tote_transport_contract_snapshot.processing_capacity_bets_per_sec`
- `tote_transport_contract_snapshot.stop_betting_sync_log_available_flag`
- `tote_publish_lag_snapshot.final_odds_post_gate_lag_sec_min`
- `tote_publish_lag_snapshot.final_odds_post_gate_lag_sec_max`
- `caw_participant_identity_snapshot.tra_code_required_flag`
- `caw_participant_identity_snapshot.track_level_approval_required_flag`

Model ideas:
- Add a `late_window_flow_mix` feature set splitting total last-minute flow into estimated CAW vs non-CAW components where venue audits exist.
- Add a `post_gate_publish_lag_regime` covariate so post-break odds updates are not over-attributed to post-close access.

Execution lessons:
- Keep `stop_betting_command_ts`, `gate_open_ts`, and `final_odds_publish_ts` as separate timeline events.
- Add venue-specific CAW profile priors (definition threshold, cancellation policy, expected share bands) before cross-venue transfer.

Contradiction noted:
- Prior simplification: post-break odds updates were often treated as direct evidence of late access. CHRB-published Q&A provides an explicit settlement/publication-lag mechanism.

### Betfair announcement-index deltas: new `suspendReason` field release and charge-schedule-change events should be treated as schema/economics regime markers

- [A/B] Betfair Developer Program Announcements index includes a 2025-08-11 release titled `New Betfair API Release - Enhanced Suspended Message field - suspendReason`.
- [A/B] The same index includes a 2025-08-22 release titled `Transaction Charge Changes Effective from 1st September 2025`.
- [A/B] Inference: announcement-index events should be ingested as first-class contract-change signals, even before deeper docs are parsed, because they indicate possible schema drift (`suspendReason`) and expected-value cost-model drift (transaction-charge schedule changes).

Extracted data fields to add:
- `betfair_contract_change_event.capture_ts`
- `betfair_contract_change_event.event_type(schema|economics|other)`
- `betfair_contract_change_event.announcement_title`
- `betfair_contract_change_event.announcement_started_date`
- `betfair_contract_change_event.expected_effective_date`
- `betfair_contract_change_event.field_candidate(suspendReason|...)`
- `betfair_contract_change_event.impact_scope(market_state|cost_model|both)`
- `betfair_contract_change_event.review_status(open|triaged|implemented)`

Model ideas:
- Add an `exchange_contract_change_window` feature to isolate model/CLV anomalies near schema or cost-schedule changes.

Execution lessons:
- Treat announcement-index diffs as CI blockers for parser and economics-contract tests until triaged.
- Version transaction-cost assumptions by effective date and link them to backtest replay windows.

Contradiction noted:
- Prior simplification: exchange contract surfaces were treated as mostly static between API spec versions. Announcement-layer evidence shows meaningful operational changes can arrive between major spec milestones.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Strongest CAW delta this pass is CHRB-published operational/Q&A detail (controls, flow-share snapshots, and post-gate publication-lag explanation), rather than syndicate self-disclosure.
- [A/B] Strongest Betfair microstructure delta this pass is announcement-layer contract-change signaling (`suspendReason` and transaction-charge change events).

## Source notes (incremental additions for pass 75)

- CHRB published PDF, `Computer Assisted Wagering Question & Answer` (dated 2024-09-05; captured 2026-04-01): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair Developer Program Announcements index (showing 2025-08-11 `suspendReason` release and 2025-08-22 transaction-charge change announcement; captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements

## Incremental sourced findings added in this run (2026-04-01, pass 76)

### Betfair transaction-charge release now has concrete post-2025 economics: market-making exemption + duplicate-error penalty uplift

- [A/B] Betfair's 2025-08-22 announcement thread states that from `2025-09-01`, the per-transaction cost above `5,000` qualifying transactions/hour was reduced from `GBP 0.002` to `GBP 0.001`.
- [A/B] The same announcement states initially unmatched put-up bets with back stake `>= GBP 10` or lay liability `>= GBP 100` became transaction-charge exempt, while failed `DUPLICATE_TRANSACTION` errors increased to `GBP 0.005`.
- [A] Betfair Charges terms now encode these rates directly (`Market Making Bet* = Free`, duplicate failed transaction `GBP 0.005`, other placed/failed `GBP 0.001`) and keep commission-offset mechanics after hourly charge aggregation.
- [A] The same Charges terms define turnover-charge triggers for Australian Racing NSW markets (`AUS 1,000` matched-back threshold with `1.25%` commission test and `3.0%` turnover charge), creating a second AU-specific cost regime that can stack with execution behavior.
- [A/B] Inference: execution policy should jointly optimize for transaction-charge buckets and NSW turnover-charge exposure; minimizing one surface can worsen the other.

Extracted data fields to add:
- `betfair_txn_pricing_regime.effective_from(2025-09-01)`
- `betfair_txn_pricing_regime.standard_txn_cost_gbp`
- `betfair_txn_pricing_regime.duplicate_txn_cost_gbp`
- `betfair_txn_pricing_regime.market_making_putup_exempt_flag`
- `betfair_txn_pricing_regime.market_making_back_stake_min_gbp`
- `betfair_txn_pricing_regime.market_making_lay_liability_min_gbp`
- `betfair_turnover_charge_regime.market_scope(rnsw|nrl|other)`
- `betfair_turnover_charge_regime.weekly_back_turnover_threshold_aud`
- `betfair_turnover_charge_regime.commission_floor_pct`
- `betfair_turnover_charge_regime.turnover_charge_pct`
- `execution_cost_surface_snapshot.txn_charge_estimate_gbp`
- `execution_cost_surface_snapshot.turnover_charge_estimate_aud`

Model ideas:
- Add a `dual_cost_pressure` feature that combines hourly transaction intensity with weekly AU turnover/commission ratio proximity to trigger bands.
- Train policy variants that classify actions into `put_up_exempt`, `priced_take`, and `duplicate-risk` paths for expected net-edge ranking.

Execution lessons:
- Separate error-class budgets from quote-placement budgets because duplicate errors now carry a 5x marginal transaction-charge rate vs standard orders.
- Keep jurisdiction-aware cost simulators active in both backtests and live throttling (`GBP` transaction regime plus `AUD` turnover-charge regime windows).

Contradiction noted:
- Prior simplification: transaction-cost modeling treated high-frequency orders with near-uniform marginal charge. Post-2025 terms are explicitly type-dependent and can reward market-making while penalizing duplicate failures.

### `suspendReason` contract moved from announcement signal to parseable microstructure feature with sport-scoped reason taxonomy

- [A/B] Betfair's 2025-08-11 announcement thread states `suspendReason` is an optional field at market-status level, returned only for specific suspension types.
- [A/B] The announcement states rollout to Exchange Stream API users was targeted by end of August 2025 and that the field was initially enabled for football with reasons including `Goal`, `Scout Unavailable`, `Penalty`, `Red Card`, and `Non In Play Market`.
- [A/B] The same announcement states Exchange API returns the field in `listMarketBook`/`listRunnerBook`, while Stream API carries it on `MarketDefinition.suspendReason`.
- [A/B] Inference: suspension-state parsers should not treat all `SUSPENDED` states as homogeneous; reason-tagged events can materially improve stop/requote logic and restart hazard estimates.

Extracted data fields to add:
- `market_suspend_event.suspend_reason_raw`
- `market_suspend_event.suspend_reason_class(goal|penalty|red_card|scout_unavailable|non_inplay|other)`
- `market_suspend_event.surface(api_ng|stream)`
- `market_suspend_event.reason_present_flag`
- `market_suspend_event.sport_scope_at_capture`
- `market_suspend_event.schema_first_seen_ts`
- `market_suspend_event.source_announcement_url`

Model ideas:
- Add reason-conditional restart priors so fill-probability models distinguish `goal` and `red_card` suspensions from generic operational suspends.

Execution lessons:
- Version suspend-state logic by `reason_present_flag` and fall back cleanly when regions/markets still emit reasonless suspensions.
- Add parser-contract tests that fail when unseen `suspendReason` values appear without taxonomy mapping.

Contradiction noted:
- Prior simplification: suspension handling used mostly binary status transitions. Announcement-level schema details establish a reason-typed suspension regime.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No stronger primary CAW-team internal-method source was found this pass; strongest net-new signal remains exchange contract/economics detail from Betfair primary surfaces.

## Source notes (incremental additions for pass 76)

- Betfair Developer Forum announcement thread, `Transaction Charge Changes Effective from 1st September 2025` (published 2025-08-22; captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements/42143-transaction-charge-changes-effective-from-1st-september-2025
- Betfair Charges terms (captured 2026-04-01): https://www.betfair.com/aboutUs/Betfair.Charges/
- Betfair Developer Forum announcement thread, `New Betfair API Release - Enhanced Suspended Message field - suspendReason` (published 2025-08-11; captured 2026-04-01): https://forum.developer.betfair.com/forum/developer-program/announcements/42119-new-betfair-api-release-enhanced-suspended-message-field-suspendreason

## Incremental sourced findings added in this run (2026-04-01, pass 77)

### Racing Australia status surface is now a first-class planned-maintenance feed, but unplanned-incident visibility is structurally sparse

- [A] Racing Australia's systems-status site states it is independent of core RA systems and is intended to continue updates during major outages.
- [A] The same page currently lists multiple detailed planned outage windows across January-March 2026 (for example, 2 March and 5 March entries with module-level impact windows).
- [A] The same page's unplanned-outage list is materially older in visible chronology (latest visible item dated 30/07/24), despite recent planned-maintenance posting activity.
- [A/B] Inference: treat this surface as a high-signal planned-maintenance and service-scope registry, but not as a complete real-time unplanned-incident chronology for replay labeling.

Extracted data fields to add:
- `provider_status_surface_snapshot.capture_ts`
- `provider_status_surface_snapshot.provider(racing_australia)`
- `provider_status_surface_snapshot.site_independent_flag`
- `provider_status_surface_snapshot.planned_outage_latest_date_visible`
- `provider_status_surface_snapshot.unplanned_outage_latest_date_visible`
- `provider_status_surface_snapshot.unplanned_visibility_lag_days`
- `planned_outage_window.module_scope_json`
- `planned_outage_window.window_start_local`
- `planned_outage_window.window_end_local`
- `incident_visibility_score.surface(status_page|monthly_report|forum)`
- `incident_visibility_score.score`

Model ideas:
- Add a `provider_incident_visibility_regime` feature that downweights outage-based attribution when unplanned-status surfaces show large chronology gaps.
- Add a `maintenance_window_proximity` covariate to execution-quality diagnostics so degradation around published maintenance windows is not misclassified as model decay.

Execution lessons:
- Ingest RA status pages on a schedule and persist both planned and unplanned latest-visible timestamps as independent signals.
- Route production runbooks to require at least two independent incident surfaces before classifying a provider as "no known outage".

Contradiction noted:
- Prior simplification: RA systems-status updates could be treated as a sufficiently complete outage chronology. Current visible chronology supports planned-window operations strongly, but not comprehensive unplanned-incident recency.

### Betfair Developer Program forum surface currently carries maintenance/outage notices as top-level announcement-state, not just schema/economics releases

- [A/B] Betfair Developer Program forum metadata currently shows the Announcements board's most recent post as `Betfair Italy Exchange - Maintenance Outage - Monday 16th March`.
- [A/B] Inference: the same announcement channel used for API-field/economics changes also carries operational outage notices, so contract-watchers must classify notice intent (`release` vs `maintenance/outage`) before triggering parser/cost-model gates.

Extracted data fields to add:
- `exchange_notice_event.capture_ts`
- `exchange_notice_event.notice_channel(forum_announcements)`
- `exchange_notice_event.notice_type(release|maintenance_outage|other)`
- `exchange_notice_event.notice_title`
- `exchange_notice_event.jurisdiction_scope`
- `exchange_notice_event.last_posted_ts_visible`

Model ideas:
- Add an `announcement_type_gate` feature so strategy/pipeline blockers are raised only for economically or schema-relevant notices, while maintenance notices feed execution-availability guards.

Execution lessons:
- Keep separate automation paths for `schema/economics` notices and `maintenance/outage` notices even when sourced from the same forum surface.
- Enforce jurisdiction tagging on outage notices so non-target exchange regions do not create false global kill-switches.

Contradiction noted:
- Prior simplification: Betfair announcement ingestion was treated mostly as schema/economics drift detection. Forum-state evidence shows mixed notice classes requiring explicit classifier logic.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No stronger CAW-team internal-method disclosure was identified this pass; strongest net-new signal is operational provider/exchange status-channel behavior.

## Source notes (incremental additions for pass 77)

- Racing Australia Systems Status Updates page (captured 2026-04-01): https://racingaustraliasystemsstatus.horse/
- Betfair Developer Program forum index (Announcements last-post metadata showing maintenance outage item; captured 2026-04-01): https://forum.developer.betfair.com/forum

## Incremental sourced findings added in this run (2026-04-01, pass 78)

### Betfair Stream API now has explicit 2026 sequencing and market-discovery contracts that change collector state-machine assumptions

- [A] Betfair's `Are Stream API messages guaranteed ... according to pt?` article (updated `2026-03-03`) states ordering is guaranteed, but `clk` is the sequencing mechanism; `pt` should not be used as the canonical sequence key.
- [A] Betfair's `What happens if you subscribe ... without a market filter?` article (updated `2026-03-03`) states all newly activated markets available to the app key will be pushed automatically, each with an `img=true` snapshot at activation.
- [A/B] Betfair's `Are closed markets auto-removed ...` article states closed markets are evicted from subscription cache on a scheduled internal process (every 5 minutes) and marked for deletion after 1 hour, which can affect `SUBSCRIPTION_LIMIT_EXCEEDED` behavior on rapid resubscription loops.
- [A/B] Inference: collectors need explicit `clk`-driven sequencing, activation-burst controls for unfiltered subscriptions, and closed-market cache accounting to avoid false freshness/limit incidents.

Extracted data fields to add:
- `stream_sequence_event.clk`
- `stream_sequence_event.pt`
- `stream_sequence_event.sequence_source(clk_primary|pt_secondary)`
- `stream_subscription_scope.filter_mode(filtered|unfiltered)`
- `stream_market_activation_event.market_id`
- `stream_market_activation_event.activation_ts`
- `stream_market_activation_event.img_snapshot_received_flag`
- `stream_subscription_capacity_snapshot.open_market_count`
- `stream_subscription_capacity_snapshot.closed_market_eviction_cycle_min(5)`
- `stream_subscription_capacity_snapshot.closed_market_deletion_lag_min(60)`

Model ideas:
- Add a `sequence_integrity_regime` feature to quarantine training windows where `pt` monotonicity and `clk` progression diverge unexpectedly.
- Add an `activation_burst_density` feature for pre-off liquidity nowcasting when running broad/unfiltered subscriptions.

Execution lessons:
- Treat `clk` as the only authoritative replay cursor; store `pt` for latency analysis only.
- Run subscription-capacity checks against both active and not-yet-evicted closed markets before dynamic resubscribe expansions.

Contradiction noted:
- Prior simplification: `pt` was treated as sufficient ordering and unfiltered subscriptions as mostly a convenience setting. March 2026 Betfair guidance makes `clk` and activation-burst behavior first-class operational controls.

### Betfair published precise virtual-vs-non-virtual ladder timing and filter mappings (2026-03-27)

- [A] Betfair's `What Betfair Exchange market data is available from listMarketBook & Stream API?` article (updated `2026-03-27`) maps REST and stream filter equivalence and states virtual best-offer stream updates are approximately `150ms` after non-virtual prices.
- [A] The same article states `EX_BEST_OFFERS_DISP` corresponds to website-style virtualized best offers, while non-virtual `EX_BEST_OFFERS` and full-ladder `EX_ALL_OFFERS`/`EX_TRADED` surfaces are distinct data products.
- [A/B] Inference: mixed use of virtualized and non-virtual ladders without explicit lag modeling can create false lead-lag alpha and execution-timing overfit.

Extracted data fields to add:
- `price_surface_contract_snapshot.surface_name(EX_BEST_OFFERS|EX_BEST_OFFERS_DISP|EX_ALL_OFFERS|EX_TRADED|EX_TRADED_VOL|EX_LTP)`
- `price_surface_contract_snapshot.virtualised_flag`
- `price_surface_contract_snapshot.estimated_virtual_lag_ms(150)`
- `price_surface_contract_snapshot.ladder_levels_requested`
- `price_surface_contract_snapshot.api_projection_source(rest|stream)`

Model ideas:
- Add `virtual_lag_adjusted_spread` and `surface_mode` interaction terms to reduce synthetic alpha from display-lag artifacts.

Execution lessons:
- Force strategy-level declaration of `surface_mode` and forbid backtest/live mixing of virtual and non-virtual ladders without lag-normalization.

Contradiction noted:
- Prior simplification: virtualized and non-virtual best-offer views were often treated as interchangeable at sub-second horizons. Betfair now documents a measurable lag.

### Racing Australia Oracle-cloud migration notice exposes a concrete system-dependency outage graph for AU data ingestion

- [A] Racing Australia's `Racing Australia Data Centre Move to Oracle Cloud Infrastructure` release (dated `2025-06-27`) states a planned outage window from `7:00pm AEST 7 July 2025` to `5:00am AEST 8 July 2025` (10 hours).
- [A] The same release lists impacted services: Australian Stud Book, SNS, Stable Assist, MHR, Racing Australia website, Secure FTP data services, XML services, mViews/Shareplex services, all PRA-RA data links, and PRA web pages hosted by RA.
- [A/B] Inference: RA acts as a multi-system dependency hub; provider outage modeling should include cross-service blast-radius and not treat RA feeds as isolated point failures.

Extracted data fields to add:
- `provider_maintenance_event.provider(racing_australia)`
- `provider_maintenance_event.window_start_aest`
- `provider_maintenance_event.window_end_aest`
- `provider_maintenance_event.window_duration_min`
- `provider_dependency_impact_snapshot.system_name`
- `provider_dependency_impact_snapshot.impact_class(data_feed|operations|web|integration_link)`
- `provider_dependency_impact_snapshot.jurisdiction_link_scope(all_pra_ra_links|subset)`

Model ideas:
- Add a `provider_dependency_blast_radius` covariate so missingness and stale-data effects are attributed to infrastructure events rather than form/market signal decay.

Execution lessons:
- Precompute outage contingency plans for RA-linked ingestion pipelines (SFTP/XML/link endpoints) and force fallback mode before announced windows.

Contradiction noted:
- Prior simplification: RA outage handling was primarily endpoint-level. Release-level evidence shows concurrent disruption across multiple ingestion and integration surfaces.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No stronger primary CAW-team internal-method source was identified this pass; strongest delta is exchange microstructure contract detail and Australian provider dependency mapping.

## Source notes (incremental additions for pass 78)

- Betfair Developer Program, `Are Stream API messages guaranteed to be delivered in strict sequential order according to pt?` (updated 2026-03-03; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- Betfair Developer Program, `What happens if you subscribe to the Stream API without a market filter?` (updated 2026-03-03; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair Developer Program, `Are closed markets auto-removed from the Stream API subscription?` (updated 2024-04-23; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair Developer Program, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Racing Australia media release index (captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/MediaReleases.aspx
- Racing Australia PDF, `Racing Australia Data Centre Move to Oracle Cloud Infrastructure` (dated 2025-06-27; captured 2026-04-01): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Australia-Data-Centre-move-to-Oracle-Cloud-Infrastructure.pdf

## Incremental sourced findings added in this run (2026-04-01, pass 79)

### WA race-fields regime adds a clearer offshore approval branch that should be modeled separately from generic monthly-levy obligations

- [A] WA DLGSC race-fields guidance states Section `27D(2A)(b)` requires offshore betting operators to seek Gaming and Wagering Commission approval to use/publish WA race fields.
- [A] The same guidance states betting operators conducting betting on WA races must lodge monthly returns and pay the racing bets levy.
- [A/B] Inference: WA entitlement logic should distinguish `offshore_approval_required` from routine levy-return obligations to avoid false equivalence between onboarding and ongoing reporting controls.

Extracted data fields to add:
- `wa_race_fields_approval_rule.capture_ts`
- `wa_race_fields_approval_rule.operator_class(offshore|other)`
- `wa_race_fields_approval_rule.section_ref(27D_2A_b)`
- `wa_race_fields_approval_rule.commission_approval_required_flag`
- `wa_race_fields_reporting_rule.monthly_return_required_flag`
- `wa_race_fields_reporting_rule.levy_payment_required_flag`
- `wa_race_fields_reporting_rule.source_url`

Model ideas:
- Add a `jurisdictional_entitlement_friction_score` feature so provider-path onboarding latency/risk is modeled separately from steady-state turnover economics.

Execution lessons:
- Gate WA offshore onboarding behind explicit commission-approval evidence and keep that gate independent from monthly levy-return compliance checks.

Contradiction noted:
- Prior simplification: WA race-fields controls were treated mostly as a monthly return/levy workflow. Primary guidance shows a distinct offshore pre-approval path.

### Racing Queensland now publishes a newer authorised-provider snapshot marker (`as at March 30, 2026`) that should drive entitlement freshness scoring

- [A] Racing Queensland's race-information page links a `List of Authorised Wagering Service Providers (as at March 30, 2026)` for the 1 July 2025 to 30 June 2027 authority period.
- [A/B] Inference: entitlement confidence should decay against the source's own `as_at` marker, not only document URL/version stability.

Extracted data fields to add:
- `qld_authorised_provider_list_snapshot.capture_ts`
- `qld_authorised_provider_list_snapshot.authority_period_start`
- `qld_authorised_provider_list_snapshot.authority_period_end`
- `qld_authorised_provider_list_snapshot.as_at_date(2026-03-30)`
- `qld_authorised_provider_list_snapshot.source_url`
- `provider_entitlement_freshness_score.days_since_as_at`

Model ideas:
- Add an `entitlement_snapshot_staleness` covariate to compliance-risk weighting in execution-readiness classifiers.

Execution lessons:
- Trigger entitlement-refresh jobs from `as_at_date` age thresholds rather than fixed weekly cadence only.

Contradiction noted:
- Prior simplification: provider entitlement snapshots were tracked mainly by capture timestamp. RQ's explicit `as at` marker is a stronger freshness anchor.

### Betfair place-order instruction caps are exchange-scope specific (`Global 200`, `Italian 50`) and should be modeled as venue contract metadata

- [A] Betfair `placeOrders` documentation states the per-request place-instruction cap is `200` for the Global Exchange and `50` for the Italian Exchange.
- [A/B] Inference: instruction-cap enforcement should be keyed by exchange scope, not encoded as a single static global limit.

Extracted data fields to add:
- `exchange_instruction_cap_snapshot.capture_ts`
- `exchange_instruction_cap_snapshot.exchange_scope(global|italian)`
- `exchange_instruction_cap_snapshot.place_instruction_cap`
- `exchange_instruction_cap_snapshot.source_url`

Model ideas:
- Add a `cap_proximity_ratio` feature (`instructions_requested / cap`) to explain rejection/queue risk in burst execution windows.

Execution lessons:
- Parameterize order-splitting and throttling by exchange scope to avoid latent cap-overrun incidents when routing beyond AU/global defaults.

Contradiction noted:
- Prior simplification: place-instruction limits were treated as effectively global. Betfair docs provide exchange-specific caps.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] No stronger primary CAW-team internal-method source was identified this pass beyond the existing NYRA/Del Mar/CHRB/Keeneland corpus.
- [A] Strongest AU provider delta this pass is regulatory/entitlement-path specificity (WA offshore approval branch plus RQ snapshot freshness marker).

## Source notes (incremental additions for pass 79)

- WA DLGSC race-fields / Racing Bets Levy guidance (captured 2026-04-01): https://www.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/race-fields
- DLGSC racing applications page (`WA Race Fields` offshore approval reference; reviewed date visible; captured 2026-04-01): https://www.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/racing-applications
- Racing Queensland race-information authority page (`as at March 30, 2026` authorised-provider list marker; captured 2026-04-01): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Betfair Exchange API documentation, `placeOrders` (instruction-cap scope by exchange; captured 2026-04-01): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders

## Incremental sourced findings added in this run (2026-04-01, pass 80)

### Betfair now exposes delay regime controls across both market discovery and market-state surfaces, reducing reliance on announcement-only inference

- [A] Betfair `Betting Type Definitions` (updated `2025-12-11`) documents `betDelayModels` in `MarketFilter` (filter by models such as `PASSIVE`, `DYNAMIC`) and in `MarketBook` (list of delay models applied when applicable).
- [A] The same definitions page explicitly describes `betDelay` as order-hold seconds and `isMarketDataDelayed` as delayed-data state for unfunded/insufficient-key scenarios.
- [A] Betfair's in-play delay FAQ (updated `2025-08-20`) states in-play delays are typically `1-12` seconds and can be read from both `listMarketBook.betDelay` and Stream `MarketDefinition.betDelay`.
- [A/B] Inference: delay policy should be modeled as first-class contract state (`delay_model_set`, `bet_delay_seconds`, `data_delay_flag`) at market-time granularity, not only as release-note events.

Extracted data fields to add:
- `market_delay_contract_snapshot.capture_ts`
- `market_delay_contract_snapshot.market_id`
- `market_delay_contract_snapshot.bet_delay_models_json`
- `market_delay_contract_snapshot.bet_delay_seconds`
- `market_delay_contract_snapshot.data_delay_flag`
- `market_delay_contract_snapshot.source_surface(listMarketCatalogue|listMarketBook|stream_market_definition)`
- `market_delay_contract_snapshot.source_url`

Model ideas:
- Add `delay_model_regime` and `bet_delay_seconds` features to execution-fill and slippage models to avoid mixing passive/no-delay-eligible flows with standard delayed flows.
- Add a `market_data_delay_quarantine` flag so training windows tagged `isMarketDataDelayed=true` are excluded from microstructure calibration baselines.

Execution lessons:
- Require pre-trade checks to capture both `betDelayModels` and current `betDelay` before submitting in-play strategies.
- Fail closed (or hard throttle) when `isMarketDataDelayed=true` to avoid false stale-alpha signals.

Contradiction noted:
- Prior simplification: delay-regime changes were tracked mainly via announcement/forum events. Current API definitions + support FAQ expose runtime fields needed for deterministic delay-state handling.

### Racing Australia service-standard reports provide higher-fidelity availability and timeliness signals than the public status feed alone

- [A] RA monthly service report for `November 2025` reports `0 minutes unplanned downtime` for SNS/Stable Assist/REINS/RA Website while publishing operational timeliness misses (for example, `Nominations RA` actual `95.95%` vs target `98%`).
- [A] RA annual consolidated report for the 12 months ending `June 2025` records non-zero unplanned downtime on some services (`Racing Australia Website 298 minutes`, `Private Label Websites 183`, `Stud Book Website 146`) while core SNS/Stable Assist report `0 minutes`.
- [A/B] Inference: availability and compilation-timeliness are distinct reliability axes; status-page chronology should not be used as a single proxy for data-feed quality.

Extracted data fields to add:
- `provider_service_standard_snapshot.capture_ts`
- `provider_service_standard_snapshot.reporting_period_start`
- `provider_service_standard_snapshot.reporting_period_end`
- `provider_service_standard_snapshot.system_name`
- `provider_service_standard_snapshot.unplanned_downtime_minutes`
- `provider_service_standard_snapshot.target_uptime_pct`
- `provider_service_standard_snapshot.actual_uptime_pct`
- `provider_service_timeliness_snapshot.metric_name(nominations|riders|acceptances|scratchings)`
- `provider_service_timeliness_snapshot.target_pct`
- `provider_service_timeliness_snapshot.actual_pct`
- `provider_service_timeliness_snapshot.variance_pct`
- `provider_service_timeliness_snapshot.source_url`

Model ideas:
- Add a `provider_reliability_regime` latent state combining availability and timeliness deltas rather than a binary outage flag.
- Add `compilation_timeliness_gap` as a covariate for feature freshness risk when using RA nominations/acceptances/scratchings pipelines.

Execution lessons:
- Ingest RA monthly/annual service-standard reports as a scheduled reliability source, separate from status-page planned-outage signals.
- Trigger degraded-confidence mode when timeliness metrics breach target even if unplanned downtime remains zero.

Contradiction noted:
- Prior simplification: provider health was approximated from status-page outage recency plus maintenance notices. Service-standard artifacts show additional reliability variance (timeliness misses and service-specific downtime totals) not visible in status chronology alone.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No stronger primary CAW-team internal-method disclosure was identified this pass; strongest net-new CAW-adjacent signal is exchange delay-regime contract formalization.

## Source notes (incremental additions for pass 80)

- Betfair Exchange API docs, `Betting Type Definitions` (updated 2025-12-11; captured 2026-04-01): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687465/Betting%20Type%20Definitions
- Betfair Developer Program FAQ, `Why do you have a delay on placing bets on a market that is in-play` (updated 2025-08-20; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Racing Australia PDF, `Monthly Service Standard Performance Report - November 2025` (captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-November-2025.pdf
- Racing Australia PDF, `Annual Service Standard Performance Report for the 12 months ending June 2025` (captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/Reports/Consolidated-Report-2024-2025.pdf

## Incremental sourced findings added in this run (2026-04-01, pass 81)

### Betfair historical-data access is jurisdiction-gated at account level, not just by API entitlement tier

- [A] Betfair Developer Support's jurisdiction FAQ states the Exchange Historical Data service is available to `Betfair.com` customers only.
- [A] The same FAQ states customers on `Betfair.br`, `Betfair.it`, `Betfair.es`, `Betfair.ro`, and `Betfair.se` cannot access `historicdata.betfair.com` due to regulatory reasons.
- [A/B] Inference: historical-replay and model-retraining pipelines need an account-jurisdiction eligibility gate; data entitlement cannot be inferred from app-key status alone.

Extracted data fields to add:
- `historical_data_access_policy_snapshot.capture_ts`
- `historical_data_access_policy_snapshot.service_name(betfair_exchange_historical_data)`
- `historical_data_access_policy_snapshot.allowed_account_domain(betfair.com)`
- `historical_data_access_policy_snapshot.blocked_account_domains_json`
- `historical_data_access_policy_snapshot.block_reason(regulatory)`
- `historical_data_access_policy_snapshot.source_url`

Model ideas:
- Add `historical_replay_eligibility_flag` to prevent mixed-eligibility backtests from silently dropping unavailable market-days.
- Add an `account_domain_regime` feature for portability studies so performance comparisons are stratified by allowable historical-data access path.

Execution lessons:
- Validate historical-data account eligibility at collector startup and fail with explicit policy diagnostics rather than empty-data retries.
- Keep historical backfill inventories keyed by account-domain regime to avoid accidental survivorship bias from jurisdiction-blocked gaps.

Contradiction noted:
- Prior simplification: historical-data ingestion risk was mostly format/schema drift. Betfair support documentation adds a first-class jurisdiction/account access gate that can block collection entirely.

### CHRB transcript adds a quantitative CAW control mechanism: host-fee tuning can directly compress rebate-driven win-pool intensity

- [A/B] CHRB's June 20, 2024 meeting transcript records 1/ST/Elite testimony that California implemented a `3.5%` host-fee increase on CAW win bets in `September 2022` to reduce win-pool CAW volume and stabilize odds.
- [A/B] The same transcript provides a concrete rebate arithmetic example: with `20%` takeout and `8%` host fee plus `2%` retained, CAW rebate is `10%`; after a `+3.5%` host-fee adjustment, rebate becomes `6.5%`.
- [A/B] Inference: CAW impact modeling should include endogenous rebate-policy state, because host-fee policy shifts can alter late-pool pressure without changing public takeout.

Extracted data fields to add:
- `caw_host_fee_policy_event.event_ts`
- `caw_host_fee_policy_event.jurisdiction(california)`
- `caw_host_fee_policy_event.pool_type(win)`
- `caw_host_fee_policy_event.host_fee_delta_pct`
- `caw_host_fee_policy_event.effective_period_start`
- `caw_rebate_arithmetic_snapshot.takeout_pct`
- `caw_rebate_arithmetic_snapshot.host_fee_pct`
- `caw_rebate_arithmetic_snapshot.operator_retained_pct`
- `caw_rebate_arithmetic_snapshot.implied_rebate_pct`
- `caw_rebate_arithmetic_snapshot.source_url`

Model ideas:
- Add `rebate_pressure_index` features from host-fee and retained-margin parameters when forecasting final-minute odds compression risk.
- Build policy-counterfactual simulations that stress test late-odds drift under alternate host-fee schedules.

Execution lessons:
- Preserve dated policy events (not only static fee tables) because CAW behavior can shift after fee adjustments.
- Separate pool-level pressure diagnostics by policy regime to avoid averaging pre- and post-adjustment dynamics.

Contradiction noted:
- Prior simplification: CAW pressure was treated mainly as participant-behavior and timing-rule effects. CHRB-recorded testimony adds explicit fee-policy levers that change rebate economics and observed volume.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW signal this pass is policy economics (host-fee to rebate transmission) from CHRB-recorded testimony, not new team-internal feature or model disclosures.

## Source notes (incremental additions for pass 81)

- Betfair Developer Program FAQ, `Which juristictions is Betfair Exchange Historical Data available to?` (updated 2025-04-25; captured 2026-04-01): https://support.developer.betfair.com/hc/en-us/articles/360008664937-Which-juristictions-is-Betfair-Exchange-Historical-Data-available-to
- California Horse Racing Board meeting transcript, 20 June 2024 (Agenda Item 11: CAW discussion; captured 2026-04-01): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=BOARDMTGTRANS&DocumentID=00051659&SubCategory=

## Incremental sourced findings added in this run (2026-04-01, pass 82)

### CHRB transcript adds a concentration signal: California CAW flow was described as largely routed through one gateway, implying counterparty concentration risk

- [A/B] In CHRB's 20 June 2024 transcript (Agenda Item 11), testimony states that "virtually all CAW play" in California pools comes through Elite Turf Club.
- [A/B] The same discussion gives a worked economics baseline of an approximately `13%` blended rebate across North American content for very high-volume CAW participants.
- [A/B] Inference: CAW pressure should be modeled with both `rebate economics` and `gateway concentration` state; pool behavior can hinge on the routing concentration of one dominant intermediary, not only aggregate CAW participation.

Extracted data fields to add:
- `caw_gateway_concentration_snapshot.capture_ts`
- `caw_gateway_concentration_snapshot.jurisdiction(california)`
- `caw_gateway_concentration_snapshot.pool_scope(total_pools|win_pool)`
- `caw_gateway_concentration_snapshot.gateway_name`
- `caw_gateway_concentration_snapshot.concentration_claim_text`
- `caw_gateway_concentration_snapshot.source_type(regulatory_meeting_testimony)`
- `caw_rebate_baseline_snapshot.capture_ts`
- `caw_rebate_baseline_snapshot.rebate_pct(approx_13)`
- `caw_rebate_baseline_snapshot.jurisdiction_scope(north_america_content_claim)`
- `caw_rebate_baseline_snapshot.source_url`

Model ideas:
- Add a `caw_concentration_risk` feature so late-odds compression priors are conditioned on whether flow appears multi-gateway or gateway-concentrated.
- Add a `rebate_baseline_shift` feature alongside host-fee regime markers, so pre/post-policy CAW intensity is not fit with one stationary prior.

Execution lessons:
- Treat pool-stability controls as counterparty-structure sensitive; if one gateway dominates, policy/operator changes can create abrupt microstructure regime shifts.
- Keep CAW-affected pool-risk thresholds versioned by both fee-policy events and gateway-concentration regime.

Contradiction noted:
- Prior simplification: CAW participation was modeled mostly as a broad participant class. CHRB-recorded testimony implies a meaningful intermediary concentration layer that can dominate pool microstructure transitions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosure was identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW signal this pass is structural concentration (gateway concentration plus blended rebate baseline) from CHRB-recorded testimony.

## Source notes (incremental additions for pass 82)

- California Horse Racing Board meeting transcript, 20 June 2024 (Agenda Item 11: CAW discussion, concentration + blended rebate remarks; captured 2026-04-01): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=BOARDMTGTRANS&DocumentID=00051659&SubCategory=

## Incremental sourced findings added in this run (2026-04-01, pass 83)

### NSW race-fields conditions add enforceable geofencing and licence-scope constraints that should be modeled as hard entitlement gates

- [A] Racing NSW 2025-26 Standard Conditions (effective 1 July 2025) state use approval is limited to wagering operations conducted under an Australian wagering licence, and use must occur in Australia or on a website hosted and maintained in Australia for those Australian-licensed operations.
- [A/B] Inference: entitlement validity is not just a fee-payment status; it is also an operational-scope contract (`licence scope + infrastructure location + product-scope boundaries`) that should be checked before ingestion and execution.

Extracted data fields to add:
- `nsw_use_scope_contract_snapshot.capture_ts`
- `nsw_use_scope_contract_snapshot.effective_date(2025-07-01)`
- `nsw_use_scope_contract_snapshot.allowed_licence_scope(australian_wagering_licence_only)`
- `nsw_use_scope_contract_snapshot.allowed_infrastructure_scope(australia_or_au_hosted_site)`
- `nsw_use_scope_contract_snapshot.non_au_operation_exclusion_flag`
- `nsw_use_scope_contract_snapshot.source_url`

Model ideas:
- Add a `jurisdictional_use_scope_risk` feature so strategy portability scoring penalizes pipelines that rely on non-compliant hosting or non-Australian licence pathways.

Execution lessons:
- Fail closed for NSW feeds/execution whenever current deployment metadata cannot prove Australian-licence scope and allowed hosting/location conditions.

Contradiction noted:
- Prior simplification: NSW race-fields governance was treated mainly as a fee and reporting framework. The 2025-26 conditions also impose explicit licence/location scope constraints.

### NSW exemption and credit mechanics imply anti-fragmentation controls and counterparty-qualified offset logic

- [A] The same conditions include a worked example that related operators share one `AUD 5 million` exempt turnover threshold as a group, rather than each entity getting its own independent threshold.
- [A] Clause 2.3 states Bet Back credits are only available for account-based Bet Backs placed with an operator already granted NSW race-field approval, and documentary proof is required.
- [A/B] Inference: fee forecasting and effective-margin modeling must include group-structure and qualified-credit constraints, otherwise net fee estimates can be biased low.

Extracted data fields to add:
- `nsw_group_threshold_allocation_snapshot.capture_ts`
- `nsw_group_threshold_allocation_snapshot.group_shared_threshold_aud(5000000)`
- `nsw_group_threshold_allocation_snapshot.related_operator_flag`
- `nsw_bet_back_credit_rule_snapshot.capture_ts`
- `nsw_bet_back_credit_rule_snapshot.account_based_only_flag`
- `nsw_bet_back_credit_rule_snapshot.counterparty_requires_nsw_approval_flag`
- `nsw_bet_back_credit_rule_snapshot.documentary_evidence_required_flag`
- `nsw_bet_back_credit_rule_snapshot.source_url`

Model ideas:
- Add a `fee_offset_realizability` feature that discounts theoretical bet-back offsets when counterparty approval/evidence conditions are not verifiably satisfied.

Execution lessons:
- Treat related-entity structure as a first-class fee input; do not assume per-entity exempt thresholds in turnover planning.
- Require auditable proof attachments before recognizing Bet Back credits in realized-margin analytics.

Contradiction noted:
- Prior simplification: exempt-threshold and credit mechanics were approximated from aggregate turnover categories. Current conditions add group anti-fragmentation and evidence-qualified credit constraints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] No stronger primary CAW-team internals were identified this pass; strongest net-new signal is NSW entitlement/fee-contract mechanics that affect AU deployment economics.

## Source notes (incremental additions for pass 83)

- Racing NSW PDF, `NSW Thoroughbred Race Field Information Use Approvals For Australian Wagering Operators Standard Conditions – 2025-26 (Effective 1 July 2025)` (captured 2026-04-01): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Clean-Version-Effective-1-July-2025.pdf

## Incremental sourced findings added in this run (2026-04-01, pass 84)

### CAW operating mechanics have additional measurable constraints (customer gating, throughput, and tote-latency decomposition)

- [A] CHRB's published CAW Q&A response letter (Elite Turf Club, 2024-09-05) states: CAW accounts are effectively institution-scale (minimum wagering threshold of USD 20m/year, typical membership 12-20), use unique TRA codes, and are under no-cancellation constraints.
- [A] The same document states AmTote can process up to 2,000 bets/second from a single client, while California tracks define CAW status at more than 5 bets/second.
- [A] The same document provides a tote-timing decomposition for post-jump odds visibility: roughly 3-5s to receive final hub data plus around 10-12s to recalculate/update odds/will-pays, implying about 13-17s lag from last accepted bet to displayed final odds in normal conditions.
- [A] The same document reports a Santa Anita audit sample where CAW represented about 17% of sampled win pools but about 43% of last-60-second inflow.
- [A/B] Inference: late-price attribution and execution benchmarks need a venue-specific "finalization latency model" plus CAW-share-of-late-money features; using a single static "post time" boundary is structurally wrong for tote replay.

Extracted data fields to add:
- `caw_operator_profile.source_type(stakeholder_disclosure)`
- `caw_operator_profile.min_annual_turnover_usd`
- `caw_operator_profile.membership_count_range`
- `caw_operator_profile.caw_definition_bets_per_second`
- `caw_operator_profile.max_gateway_throughput_bets_per_second`
- `caw_operator_profile.cancellation_allowed_flag`
- `pool_finalization_latency.stop_to_hub_receive_sec`
- `pool_finalization_latency.hub_receive_to_display_sec`
- `pool_finalization_latency.total_stop_to_display_sec`
- `late_money_mix.caw_share_last_60s`
- `late_money_mix.caw_share_total_pool`

Model ideas:
- Add a two-stage tote finalization model (`acceptance_close -> hub aggregation -> display update`) and train odds-jump expectations conditional on each latency stage.
- Add a `late_money_concentration_ratio = caw_share_last_60s / caw_share_total_pool` feature for late-drifts and payout-volatility forecasts.

Execution lessons:
- In tote-calibration datasets, anchor labels to pool-finalization timestamp, not gate-open or first on-screen odds after jump.
- Maintain source-bias tags for stakeholder-provided metrics and require independent corroboration where possible before hard limits are promoted.

Contradiction noted:
- Prior assumption from other venues: CAW threshold is generally ">6 bets/sec". CHRB-published California stakeholder material uses ">5 bets/sec", so threshold logic is jurisdiction-specific.

### Betfair geo-availability is a first-class market-access regime variable

- [A] Betfair support (updated 2025-11-05) states markets may be absent from `listEvents`, `listMarketCatalogue`, and `listMarketBook` when access originates from legally restricted IP/location contexts.
- [A] The same article explicitly notes Singapore horse-racing markets are only returned for AUS/NZ customers.
- [A/B] Inference: empty market responses can be legal-availability state, not collector failure; this should be modeled as a deterministic entitlement regime.

Extracted data fields to add:
- `api_access_context.egress_ip_country`
- `api_access_context.legal_region_restriction_flag`
- `api_access_context.market_availability_scope`
- `api_access_context.empty_response_reason(infra|auth|legal_restriction|unknown)`
- `market_catalogue_visibility.region_gate_rule_id`

Model ideas:
- Add a market-availability gating layer that routes "empty catalogue" events through legal-region diagnostics before declaring feed outage.

Execution lessons:
- Preflight API jobs with region-aware health checks; block strategy activation when required market families are legally unavailable from current egress.

Contradiction noted:
- Common debugging shortcut: "empty `listMarketBook` means API fault." Betfair primary support guidance shows legal geo-restrictions can be the direct cause.

### HKJC commingling concentration provides a measurable benchmark for syndicate-scale liquidity environments

- [A] HKJC FY2024/25 disclosures report over 70 commingling partners across 26 countries/jurisdictions and commingled turnover of HKD 31.8b (25.3% of season racing turnover), up 10.1% year-on-year.
- [A] HKJC also discloses approved simulcast quota expansion: races 25 -> 40 (2025/26) -> 55 (2026/27), and days 37 -> 53 -> 70.
- [A/B] Inference: policy-driven expansion of cross-border liquidity can materially change late-money composition and should be treated as an exogenous market-structure regime shift variable.

Extracted data fields to add:
- `commingling_network.partner_count`
- `commingling_network.jurisdiction_count`
- `commingling_network.turnover_hkd`
- `commingling_network.turnover_share_pct`
- `commingling_network.yoy_growth_pct`
- `simulcast_policy.max_races_per_season`
- `simulcast_policy.max_days_per_season`
- `simulcast_policy.effective_season`

Model ideas:
- Add a jurisdiction-level liquidity regime prior using commingling share and partner breadth to calibrate expected late-flow volatility.

Execution lessons:
- Recalibrate late-execution assumptions whenever simulcast/commingling policy caps change; treat these as structural breaks, not noise.

Contradiction noted:
- Prior simplification: cross-border liquidity growth is gradual/organic. HKJC disclosures show discrete policy quota steps can re-shape market depth quickly.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] Net-new signal this pass is strongest in CAW/tote operating mechanics and market-access policy regimes (CHRB + Betfair + HKJC), not in new syndicate self-disclosure.

## Source notes (incremental additions for pass 84)

- CHRB published CAW Q&A letter (`Computer_Assisted_Wagering.pdf`, Elite Turf Club response dated 2024-09-05; accessed 2026-04-01): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair support: market visibility restrictions by legal location/IP, including SG horse-market AUS/NZ scope (updated 2025-11-05): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listEvents-listMarketCatalogue-or-listMarketBook-API-response
- HKJC FY2024/25 results disclosure (commingling turnover/share and partner breadth, 2025-08-29): https://corporate.hkjc.com/corporate/corporate-news/english/2025-08/news_2025082901950.aspx
- HKJC simulcast quota expansion announcement (2025-06-18): https://corporate.hkjc.com/corporate/corporate-news/english/2025-06/news_2025061801842.aspx

## Incremental sourced findings added in this run (2026-04-01, pass 85)

### CHRB CAW governance/economics detail: intermediary ownership concentration and rebate-dependence sensitivity are explicit in primary materials

- [A/B] CHRB's published CAW Q&A letter (Elite Turf Club response, 2024-09-05) states Elite Turf Club is owned `80%` by `1/ST RACING` and `20%` by `NYRA`.
- [A/B] The same letter states that if win-pool takeout were reduced to around `12%` and CAW players were not rebated, CAW handle would decrease materially.
- [A/B] Inference: CAW-impact modeling should include both `intermediary-affiliation concentration` and `rebate-elasticity` states, because policy or commercial shocks at one gateway can alter late-pool pressure even without any model-logic change by end bettors.

Extracted data fields to add:
- `caw_intermediary_affiliation_snapshot.capture_ts`
- `caw_intermediary_affiliation_snapshot.gateway_name`
- `caw_intermediary_affiliation_snapshot.owner_entity`
- `caw_intermediary_affiliation_snapshot.ownership_pct`
- `caw_rebate_elasticity_claim_snapshot.capture_ts`
- `caw_rebate_elasticity_claim_snapshot.takeout_scenario_pct`
- `caw_rebate_elasticity_claim_snapshot.rebate_enabled_flag`
- `caw_rebate_elasticity_claim_snapshot.directional_handle_effect`
- `caw_rebate_elasticity_claim_snapshot.source_url`

Model ideas:
- Add a `gateway_affiliation_concentration_score` feature so late-odds pressure priors can vary between diversified and affiliated-gateway structures.
- Add a `rebate_elasticity_scenario` feature in CAW pressure simulation to test sensitivity to takeout and rebate-regime changes.

Execution lessons:
- Track gateway-ownership snapshots as dated risk metadata; affiliation structure can change the blast radius of policy/commercial events.
- Treat takeout/rebate assumptions as scenario inputs, not constants, when evaluating turnover-linked strategies.

Contradiction noted:
- Prior simplification: CAW concentration was mostly represented as routing concentration only. Primary CHRB material also exposes intermediary ownership concentration and explicit no-rebate takeout sensitivity.

### Australian provider index integrity delta: Racing Australia monthly-report index includes chronology anomalies that require parser-grade safeguards

- [A] Racing Australia's Monthly Service Standard Performance Report index (`PerformanceReport.aspx`, captured 2026-04-01) still lists `January 2026` as the latest visible month in the 2025-2026 section.
- [A] The same page includes a chronology anomaly in historical sections (a `December 2016` monthly-report link appearing under both `2016-2017` and `2015-2016` groupings on the captured page), indicating index-level HTML/listing inconsistencies.
- [A/B] Inference: report-index parsing should be validated against `report_period` and PDF metadata, not inferred solely from on-page grouping labels.

Extracted data fields to add:
- `provider_report_index_snapshot.capture_ts`
- `provider_report_index_snapshot.provider`
- `provider_report_index_snapshot.section_label`
- `provider_report_index_snapshot.link_text_month`
- `provider_report_index_snapshot.link_url`
- `provider_report_index_snapshot.chronology_anomaly_flag`
- `provider_report_index_snapshot.anomaly_reason`
- `provider_report_index_snapshot.source_url`

Model ideas:
- Add an `index_integrity_score` for provider KPI ingestion so stale/misaligned index windows are downweighted in reliability-state updates.

Execution lessons:
- Enforce index-to-document reconciliation before promoting monthly KPI inputs to production reliability features.
- Keep an explicit `latest_visible_report_period` monitor per provider rather than relying on section-order assumptions.

Contradiction noted:
- Prior simplification: provider monthly-report index pages can be treated as chronology-clean metadata feeds. Current Racing Australia index evidence shows listing-level anomalies that need validation gates.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass is governance/economics state detail from CHRB (intermediary affiliation concentration and rebate-elasticity claim), not new proprietary model internals.

## Source notes (incremental additions for pass 85)

- CHRB published CAW Q&A letter (`Computer_Assisted_Wagering.pdf`, Elite Turf Club response dated 2024-09-05; accessed 2026-04-01): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Racing Australia Monthly Service Standard Performance Report index (`PerformanceReport.aspx`, captured 2026-04-01): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental sourced findings added in this run (2026-04-02, pass 86)

### Betfair SP reconciliation rules add explicit pre-off state transitions and liability-threshold edge cases

- [A] Betfair SP FAQ material defines projected `Near` and `Far` prices differently: `Far` uses SP orders only, while `Near` includes reconcilable unmatched Exchange orders when the market suspends to in-play.
- [A] The same FAQ states that if no SP money exists, projected SP is the midpoint between best available back and lay prices.
- [A] Betfair SP rules state Take SP bets and exchange-SP-limit bets can remain unmatched pre-off and are then reconciled at SP when the market turns in-play.
- [A] Betfair SP rules also state an unmatched lay converted to SP can lapse if resulting liability would be below £10.
- [A/B] Inference: pre-off execution state is not binary matched/unmatched; there is a distinct `pending_sp_reconciliation` state with deterministic conversion and lapse behavior that can bias fill-rate estimates near jump.

Extracted data fields to add:
- `sp_projection.near_price`
- `sp_projection.far_price`
- `sp_projection.no_sp_midpoint_fallback_flag`
- `sp_projection.snapshot_ts`
- `order_preoff.pending_sp_reconciliation_flag`
- `order_preoff.sp_reconciliation_result(matched|partially_matched|lapsed)`
- `order_preoff.sp_lapse_reason(min_liability_threshold)`
- `order_preoff.sp_min_lay_liability_gbp`

Model ideas:
- Add a pre-off transition model that predicts `exchange_match -> sp_reconciliation -> lapse` pathways as a function of seconds-to-off, queue depth, and side.
- Add a low-stake lay-lapse penalty feature so expected fill and realized exposure forecasts account for the SP minimum-liability rule.

Execution lessons:
- Reconcile unmatched pre-off orders through an explicit SP-conversion pass before finalizing exposure and fill metrics.
- Add venue/currency-aware minimum-liability checks in order sizing to avoid avoidable SP-lapse outcomes.

Contradiction noted:
- Common simplification: unmatched pre-off orders are either filled or simply canceled. Betfair SP rules define a third path where unmatched orders can be converted and reconciled at SP with threshold-based lapsing.

### Australian Betfair horse-racing has a stricter off-time void window when in-play transition is delayed

- [A] Betfair Exchange general rules state that for horse/greyhound markets, when a market scheduled to go in-play is turned in-play late, matched bets after official off can stand in general; however, for Australian horse racing, matched bets after off and before Betfair intentionally turns the market in-play are void.
- [A/B] Inference: Australian horse-racing execution replay requires a dedicated `off_to_inplay_void_window` treatment; cross-sport or non-AU assumptions will overstate matched-bet validity in delayed-suspension incidents.

Extracted data fields to add:
- `market_official.off_ts`
- `market_transition.inplay_turn_ts`
- `market_transition.off_to_inplay_gap_sec`
- `market_transition.au_off_to_inplay_void_rule_flag`
- `bet_validity.void_reason_code(au_off_to_inplay_window)`
- `bet_validity.voided_ts`

Model ideas:
- Add a delayed-transition incident feature for fill-validity risk around jump, conditioned on jurisdiction and market type.

Execution lessons:
- Delay-sensitive staking logic should include expected void-risk cost for the AU off-to-inplay gap.
- Backtest settlement reconciler must apply AU-specific void logic when replaying delayed transition incidents.

Contradiction noted:
- Prior simplification: if a race market is eventually turned in-play, all pre-turn matched bets stand. Betfair rules carve out a stricter AU horse-racing exception.

### CHRB CAW Q&A includes additional retail-balance targets and purse-contribution economics not previously captured

- [A/B] CHRB-published CAW Q&A (Elite response) states Santa Anita targets CAW participation around 20% of total handle (plus/minus a few percent) and references a CAW win-rate ceiling notion (not materially higher than 90%).
- [A/B] The same source states roughly 4% of each CAW dollar into Del Mar/Santa Anita pools is routed to purse accounts for horsemen.
- [A/B] Inference: host-track optimization appears multi-objective (`liquidity + retail balance + purse yield`), so CAW pressure should not be modeled as a single monotonic handle-maximization regime.

Extracted data fields to add:
- `track_caw_balance_target.target_caw_handle_share_pct`
- `track_caw_balance_target.target_win_rate_ceiling_pct`
- `track_caw_balance_target.target_band_tolerance_pct`
- `track_caw_economics.purse_contribution_pct_per_caw_dollar`
- `track_caw_economics.effective_date`
- `track_caw_economics.source_type(stakeholder_disclosure)`

Model ideas:
- Add a `caw_balance_gap` signal (`observed_caw_share - target_share`) to anticipate host-fee/pool-restriction policy responses.
- Add a purse-yield sensitivity feature for scenario testing of CAW policy changes.

Execution lessons:
- Treat CAW regime assumptions as policy-responsive; monitor drift from stated target bands as an early-warning signal.
- Keep stakeholder-disclosed economic parameters tagged and versioned, with corroboration workflow before hard default promotion.

Contradiction noted:
- Prior simplification: CAW influence was mainly handled as late-money concentration. This source adds explicit track-level target-band and purse-yield framing.

### Racing Australia service topology clarifies national-vs-WA provider routing and official-results ownership

- [A] Racing Australia states it compiles, distributes, and publishes race fields for all states/territories except Western Australia.
- [A] The same page states Racing Australia maintains the official race results database for all states/territories and distributes/publishes the past-performance (form) database.
- [A/B] Inference: AU data ingestion architecture should treat WA fields as an explicit alternate-source route, while results/form lineage can stay RA-centered.

Extracted data fields to add:
- `provider_topology.dataset_type(fields|results|form)`
- `provider_topology.jurisdiction`
- `provider_topology.primary_provider`
- `provider_topology.exception_flag`
- `provider_topology.exception_reason`
- `provider_topology.effective_date`

Model ideas:
- Add a provider-topology reliability prior that penalizes mixed-provider jurisdictions for schema-drift risk.

Execution lessons:
- Build jurisdiction-aware source routing so WA fields do not silently fail under RA-only assumptions.
- Persist provider lineage per feature to keep reconciliation/audit paths clear when fields and results originate through different topologies.

Contradiction noted:
- Prior simplification: Racing Australia can be treated as single national source for all racing materials. Primary service text explicitly carves out WA for fields compilation/distribution.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass is in execution-policy/economic constraints (SP reconciliation, AU void windows, CAW target-band/purse-yield framing), not proprietary feature engineering disclosures.

## Source notes (incremental additions for pass 86)

- Betfair SP FAQ (`Projected SP Odds`, including Near/Far and no-SP midpoint behavior; accessed 2026-04-02): https://promo.betfair.com/betfairsp/FAQs_projectedOdds.html
- Betfair SP Rules (`SP Bet Rules`, including unmatched-to-SP conversion and minimum lay liability lapse behavior; accessed 2026-04-02): https://promo.betfair.com/betfairsp/FAQs_spbetrules.html
- Betfair Exchange General Rules (AU horse-racing off-to-in-play void exception; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/exchange-general-rules
- CHRB published CAW Q&A letter (`Computer_Assisted_Wagering.pdf`, Elite Turf Club response dated 2024-09-05; accessed 2026-04-02): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Racing Australia `Role and Services` (fields coverage exception for WA + official results/form database statements; accessed 2026-04-02): https://www.racingaustralia.horse/Aboutus/Role-and-Services.aspx

## Incremental sourced findings added in this run (2026-04-02, pass 87)

### NYRA published 2026 CAW guardrails with explicit speed definition and expanded time-cutoff policy

- [A] NYRA's official release dated `2026-01-30` states that from `2026-02-05`, CAW activity must cease at `1 minute to post` in pools not already under high-speed restrictions.
- [A] The same release defines CAW activity operationally as wagering speed greater than `6 bets per second`.
- [A] NYRA also states its 2021 win-pool CAW restriction remains in force (`no later than 2 minutes to post`) and that Late Pick 5/Pick 6 remain retail-only products.
- [A/B] Inference: venue policy now exposes explicit `speed-threshold + pool-scope + temporal-cutoff` control dimensions that can shift late-liquidity composition independently of underlying team-model quality.

Extracted data fields to add:
- `venue_caw_policy_snapshot.capture_ts`
- `venue_caw_policy_snapshot.venue`
- `venue_caw_policy_snapshot.effective_date`
- `venue_caw_policy_snapshot.caw_speed_threshold_bets_per_sec`
- `venue_caw_policy_snapshot.global_cutoff_mtp_sec`
- `venue_caw_policy_snapshot.win_pool_cutoff_mtp_sec`
- `venue_caw_policy_snapshot.retail_only_pool_list`
- `venue_caw_policy_snapshot.source_url`

Model ideas:
- Add a `policy_constrained_late_flow` feature that adjusts expected late odds pressure by pool and seconds-to-post under active CAW cutoffs.
- Add a policy-step event model to detect regime breaks at rule-effective timestamps (e.g., 2026-02-05).

Execution lessons:
- Backtests that span pre/post policy cutovers should segment by effective-date policy state rather than assume stationarity.
- Execution simulators should encode CAW speed definitions and per-pool cutoff windows as venue-specific constraints.

Contradiction noted:
- Prior simplification: CAW controls are mostly takeout/rebate mediated. NYRA primary policy shows direct microstructure controls via speed thresholding and explicit pre-post cutoffs.

### Betfair website/API price divergence has deterministic virtual-bet mechanics and request-weight constraints

- [A] Betfair developer support states website ladders may include `virtual` prices generated by exchange cross-matching logic, whereas API responses do not include virtual bets by default.
- [A] Betfair specifies virtual prices can be included in API responses via `listMarketBook` with `"virtualise":"true"` or stream subscription to `EX_BEST_OFFERS_DISP`.
- [A] Betfair request-limit guidance states for certain operations the `sum(weight) * number_of_market_ids` must not exceed `200`, with `TOO_MUCH_DATA` returned when exceeded.
- [A] The same guidance notes `exBestOffersOverrides` weight scales with depth (`weight * requestedDepth/3`).
- [A/B] Inference: apparent API-vs-site spread anomalies near off can be a product of virtualization and weighting/depth configuration, not necessarily stale data transport.

Extracted data fields to add:
- `market_book_request.virtualise_flag`
- `market_book_request.price_projection_type`
- `market_book_request.requested_depth`
- `market_book_request.weight_score`
- `market_book_request.market_count`
- `market_book_request.weight_budget_exceeded_flag`
- `market_book_request.error_code`
- `market_book_snapshot.virtual_price_included_flag`

Model ideas:
- Add a `virtualisation_gap` feature (`website_displayable_best - api_raw_best`) to calibrate fill/slippage expectations.
- Add adaptive polling-depth optimization under a 200-point request budget to minimize `TOO_MUCH_DATA` rejections during high-cardinality scans.

Execution lessons:
- Always version capture settings (`virtualise`, depth, projection flags) alongside market snapshots; without this, replay diagnostics can misattribute price differences.
- Build scheduler logic that tunes breadth vs depth per cycle to stay within request-weight limits.

Contradiction noted:
- Prior simplification: website/API top-of-book should match unless transport lag occurs. Betfair documentation shows deterministic divergence when virtual prices are excluded from API requests.

### Racing Victoria 2025 conditions provide enforceable supplier, integrity, and discount mechanics for AU provider architecture

- [A] RV Standard Conditions (effective `2025-03-01`) require Victorian thoroughbred race fields to be sourced from approved suppliers and list `Racing Australia`, `AAP`, and `Live Datacast` as approved in the cited schedule.
- [A] The same conditions include an anti-avoidance construct: approved WSPs must not enter schemes with sole/dominant purpose of achieving a prescribed fee-avoidance outcome.
- [A] RV conditions require data/information assistance to RV and Sports Integrity Entities, including ongoing and real-time requests, with compliance no later than end of the second business day after request.
- [A] RV conditions define a High Value Discount mechanism for approved exchanges with formula term `HVD = QCR * 0.3 * 0.66`, subject to a separately agreed cap; if no cap is agreed before period end, discount is nil.
- [A] RV Guide to Provision of Information (2025/26) states the guide does not override Standard Conditions, requires daily files to include all specified columns (nil values as zero), and defines `Bets Taken` metrics to include free bets/contracted amounts while excluding commissions/rebates/incentives.
- [A/B] Inference: AU data/compliance architecture needs provider-entitlement routing, integrity-SLA orchestration, and fee-model logic that is explicitly jurisdiction- and contract-version aware.

Extracted data fields to add:
- `rv_supplier_entitlement_snapshot.capture_ts`
- `rv_supplier_entitlement_snapshot.approved_supplier`
- `rv_supplier_entitlement_snapshot.dataset_scope(race_fields)`
- `rv_anti_avoidance_event.event_ts`
- `rv_anti_avoidance_event.prescribed_outcome_flag`
- `rv_integrity_request_event.request_ts`
- `rv_integrity_request_event.request_type(ongoing|real_time)`
- `rv_integrity_request_event.response_due_ts`
- `rv_hvd_snapshot.qcr_value`
- `rv_hvd_snapshot.formula_multiplier`
- `rv_hvd_snapshot.cap_agreed_flag`
- `rv_hvd_snapshot.hvd_amount`
- `rv_reporting_metric_snapshot.metric_name`
- `rv_reporting_metric_snapshot.includes_free_bets_flag`
- `rv_reporting_metric_snapshot.excludes_rebates_flag`

Model ideas:
- Add a jurisdictional `effective_fee_surface` model that toggles between nominal fee, HVD-adjusted fee, and nil-discount states.
- Add an integrity-request load feature to execution throttles for periods with elevated real-time compliance obligations.

Execution lessons:
- Persist contract-version fingerprints (`effective_date`, supplier list, formula terms) for every ingestion/execution run to preserve audit replay.
- Treat reporting-metric definitions (e.g., inclusion of free bets, exclusion of rebates) as semantic schema, not documentation trivia, before comparing provider economics across states.

Contradiction noted:
- Prior simplification: AU provider ingestion can be centralized under a single national contract pattern. RV primary conditions impose state-level supplier and integrity obligations with bespoke fee-discount mechanics.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass is strongest in venue policy controls (NYRA) and exchange microstructure configuration (Betfair), plus state-level AU provider/compliance mechanics (RV), rather than proprietary model features.

## Source notes (incremental additions for pass 87)

- NYRA official release, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; accessed 2026-04-02): https://www.nyra.com/belmont/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Betfair developer support, website/API virtual price differences and virtualization flags (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Betfair developer support, Exchange API request-weight limits (`TOO_MUCH_DATA`, 200-point budget) (updated 2025-09-09; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/115003864671-What-data-request-limits-exist-on-the-Exchange-API
- Racing Victoria, Race Fields Policy page linking current policy/conditions (accessed 2026-04-02): https://www.racingvictoria.com.au/wagering/race-fields-policy
- Racing Victoria PDF, `Standard Conditions of Approval - Effective 1 March 2025` (accessed 2026-04-02): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f
- Racing Victoria PDF, `Guide to the Provision of Information 2025/26` (accessed 2026-04-02): https://dxp-cdn.racing.com/api/public/content/20250410-Guide-to-the-Provision-of-Information-FY-25-26-%28clean%29-3005110.pdf?v=09a420bf

## Incremental sourced findings added in this run (2026-04-02, pass 88)

### WA Racing Bets Levy source text adds hard compliance-calendar and turnover-semantics contracts not yet encoded

- [A] WA DLGSC's Racing Bets Levy page states monthly WA race-fields returns and levy payments are due within `14 days` of month end, with returns submitted in an approved form.
- [A] The same page states annual audited returns are required under `Regulation 110` for the prior race year (`1 August` to `31 July`), due by `30 August`.
- [A] The same source states annual-audit exemptions are only available where WA-race turnover is below `$50,000` per annum, requests should be lodged before `31 July`, and requests received after `30 August` cannot be approved.
- [A] WA turnover semantics are explicit: free bets are included; rebates/discounts, commission-agent amounts, and bad debts/claims do not reduce turnover; multi/doubles are proportionally apportioned to WA legs; cross-period bets are apportioned to reporting periods.
- [A] WA prescribed-information obligations require operators to provide records and, where possible, real-time betting-system access to authorised officers/Chief Steward, while section `27E(3)` requires summary/statistical provision to RWWA without direct operator association.
- [A/B] Inference: WA should be modeled as a strict `calendar + semantics + access` compliance regime; using only monthly levy totals misses failure modes from deadline gating, definition drift, and information-access obligations.

Extracted data fields to add:
- `wa_monthly_return_obligation_snapshot.capture_ts`
- `wa_monthly_return_obligation_snapshot.due_days_after_month_end(14)`
- `wa_monthly_return_obligation_snapshot.approved_form_required_flag`
- `wa_audited_return_obligation_snapshot.race_year_start_month_day(08-01)`
- `wa_audited_return_obligation_snapshot.race_year_end_month_day(07-31)`
- `wa_audited_return_obligation_snapshot.due_month_day(08-30)`
- `wa_audited_return_exemption_rule.turnover_threshold_aud(50000)`
- `wa_audited_return_exemption_rule.request_recommended_by_month_day(07-31)`
- `wa_audited_return_exemption_rule.hard_reject_after_month_day(08-30)`
- `wa_turnover_semantics_snapshot.includes_free_bets_flag`
- `wa_turnover_semantics_snapshot.disallows_rebate_deduction_flag`
- `wa_turnover_semantics_snapshot.multi_leg_wa_apportionment_required_flag`
- `wa_prescribed_info_access_snapshot.real_time_access_where_possible_flag`
- `wa_prescribed_info_access_snapshot.summary_only_to_rwwa_flag`
- `wa_return_channel_breakdown_snapshot.sales_channel(on_course|telephone|internet|retail)`

Model ideas:
- Add a `wa_compliance_deadline_risk` feature that rises as monthly and annual submission windows approach or are breached.
- Add a `turnover_definition_gap_score` feature comparing provider feed semantics vs WA levy semantics (free bets, rebate deduction handling, cross-period apportionment).

Execution lessons:
- Treat WA monthly/annual return dates as hard operational SLOs in deployment readiness, not back-office reporting metadata.
- Validate turnover construction against WA definitions before fee/edge attribution; definition mismatch can create false alpha and compliance risk simultaneously.
- Persist evidence of prescribed-information responsiveness (including real-time-access capability) as a first-class compliance artifact.

Contradiction noted:
- Prior simplification: WA controls were mostly represented as offshore approval plus monthly levy workflow. Primary WA text adds strict annual-audit deadlines, exemption-timing gates, detailed turnover semantics, and access obligations that materially affect architecture.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Strongest net-new signal this pass is WA jurisdictional compliance microstructure (deadline calendars, turnover semantics, prescribed-information access), rather than new CAW-team proprietary model disclosures.

## Source notes (incremental additions for pass 88)

- WA DLGSC, `Racing Bets Levy` (monthly/annual return deadlines, turnover semantics, prescribed-information obligations; accessed 2026-04-02): https://www.dlgsc.wa.gov.au/racing-gaming-and-liquor/racing-gaming-and-wagering/race-fields
- WA Betting Control Act 1954 (legislative basis referenced by DLGSC page; accessed 2026-04-02): https://www.legislation.wa.gov.au/legislation/statutes.nsf/main_mrtitle_67_homepage.html
- WA Racing Bets Levy Act 2009 (legislative basis referenced by DLGSC page; accessed 2026-04-02): https://www.legislation.wa.gov.au/legislation/statutes.nsf/main_mrtitle_1137_homepage.html

## Incremental sourced findings added in this run (2026-04-02, pass 89)

### Betfair concurrent throttling has projection-dependent contention mechanics beyond simple per-second caps

- [A] Betfair developer support states `TOO_MANY_REQUESTS` rate limiting is applied at logged-in account level (not session level), and that `listMarketBook` only enters this contention path when `OrderProjection` or `MatchProjection` is requested.
- [A] The same source states this conditional `listMarketBook` throttling contends with `listCurrentOrders` and `listMarketProfitAndLoss`, while `listClearedOrders` uses a separate mechanism.
- [A] The same source states the service checks for three queued requests ready for processing, and order-write operations (`placeOrders`, `cancelOrders`, `updateOrders`, `replaceOrders`) can also fail if transaction instructions exceed `1000` in one second.
- [A/B] Inference: collector and risk-query architecture should treat account-level request classes as a shared constrained resource with projection-aware routing, not just operation-local retry logic.

Extracted data fields to add:
- `api_throttle_event.account_scope_flag`
- `api_throttle_event.operation`
- `api_throttle_event.order_or_match_projection_flag`
- `api_throttle_event.shared_contention_group_id`
- `api_throttle_event.queue_ready_count_threshold(3)`
- `api_throttle_event.error_code`
- `api_throttle_event.event_ts`
- `order_instruction_rate_snapshot.instructions_per_sec`

Model ideas:
- Add a `projection_contention_risk` feature to execution-quality models, keyed by query mix and queued-request pressure.
- Add a scheduler policy model that minimizes expected throttle incidents by separating market-data and account-state query windows.

Execution lessons:
- Keep `OrderProjection`/`MatchProjection` off high-frequency market scans unless explicitly needed.
- Partition API budgets across market data, exposure checks, and PnL queries at account scope.
- Alert on rising queued-request pressure before hard throttle errors materialize.

Contradiction noted:
- Prior simplification: Betfair throttling is mostly raw request rate per endpoint. New support guidance shows projection-conditional, cross-operation contention under shared account scope.

### Betfair in-play delay is an explicit 1-12 second regime input and must be modeled as market-state data

- [A] Betfair developer support states in-play markets usually apply a `1-12 second` delay on bet placement.
- [A] The same source ties delay-state retrieval directly to `betDelay` from `listMarketBook` and market definition in Stream API.
- [A/B] Inference: in-play fill/latency assumptions should be conditioned on observed delay state, not static sport-level constants.

Extracted data fields to add:
- `market_delay_snapshot.bet_delay_sec`
- `market_delay_snapshot.delay_source(listMarketBook|stream_market_definition)`
- `market_delay_snapshot.market_inplay_flag`
- `market_delay_snapshot.capture_ts`

Model ideas:
- Include `bet_delay_sec` as a first-class covariate in in-play fill probability and adverse-selection models.

Execution lessons:
- Snapshot delay-state each execution cycle around in-play transitions and bind it to order decisions.

Contradiction noted:
- Prior simplification: in-play delay can be treated as fixed by market type. Support guidance states a variable 1-12 second regime.

### Racing Queensland now exposes a fresh 2025-2027 authority regime with new effective-date controls and submission-channel artifacts

- [A] Racing Queensland's race-information page states the current authority period is `1 July 2025` to `30 June 2027`.
- [A] The same source states updated General Conditions take effect from `1 July 2025`.
- [A] The same page states a `$250` application fee applies to applicants who have not previously held an authority.
- [A] The page publishes an authorised wagering service provider list with an explicit as-at date (`30 March 2026`) and links new submission/transport artifacts effective `1 July 2025` (FTP and oncourse-portal instructions plus submission templates/definitions).
- [A/B] Inference: provider entitlement and submission-schema controls in QLD should be effective-date and channel-version aware, not treated as static annual metadata.

Extracted data fields to add:
- `qld_authority_period_snapshot.effective_from`
- `qld_authority_period_snapshot.effective_to`
- `qld_authority_period_snapshot.new_applicant_fee_aud`
- `qld_authorised_wsp_snapshot.as_at_date`
- `qld_submission_channel_spec.channel_type(ftp|oncourse_portal)`
- `qld_submission_channel_spec.effective_from`
- `qld_submission_channel_spec.template_reference`
- `qld_submission_channel_spec.definition_reference`

Model ideas:
- Add a `submission_channel_mismatch_risk` feature for compliance/ops forecasting when configured channel/spec does not match effective version.

Execution lessons:
- Version-lock QLD entitlement and submission specs by effective date for both live and replay workflows.
- Include authorised-WSP list as-at timestamp in compliance snapshots and audit trails.

Contradiction noted:
- Prior simplification: Queensland authority setup is mostly static and annualized. Current source shows a bounded two-year authority period with versioned 2025 submission-channel controls.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal findings this pass are execution/control-plane mechanics (Betfair throttle and delay regimes) plus Queensland entitlement/submission governance.

## Source notes (incremental additions for pass 89)

- Betfair developer support, `Why am I receiving the TOO_MANY_REQUESTS error?` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000406111-Why-am-I-receiving-the-TOO-MANY-REQUESTS-error
- Betfair developer support, `Why do you have a delay on placing bets on a market that is 'in-play'` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Racing Queensland, `Race Information` (authority period, fee, effective-date conditions and submission artifacts; page crawled 2026-03-30, accessed 2026-04-02): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information

## Incremental sourced findings added in this run (2026-04-02, pass 90)

### Betfair account-statement surfaces add explicit transaction-charge and resettlement-ledger mechanics that should be first-class execution-accounting inputs

- [A/B] Betfair Developer Support's `How can I identify Transaction Charges via getAccountStatement?` states transaction charges are discoverable through `getAccountStatement` with `itemClass=UNKNOWN`, and the statement text carries a charge marker (`fullMarketName` contains `Bet Txn Charge for over 5000 per hour` in the example).
- [A] Betfair Developer Support's resettlement FAQ (`How does market resettlement show on my Betair Account Statement?`, updated `2025-08-20`) points to the official `Account Statement - Resettlement Lifecycle` reference as the canonical lifecycle mapping.
- [A] Betfair's official `Additional Information` reference (`Account Statement - Resettlement Lifecycle`) shows concrete ledger transitions for unsettled/resettled paths, including `winLose` and `transactionType` patterns such as `RESULT_WON`, `RESULT_ERR`, `RESULT_FIX`, `RESULT_LOST`, plus `COMMISSION_REVERSAL` entries.
- [A] The same reference shows these entries arriving as `itemClass="UNKNOWN"` rows with rich payload in `unknownStatementItem`/`legacyData`, rather than a dedicated transaction-charge or resettlement item class.
- [A/B] Inference: post-trade cost attribution and PnL replay cannot rely on market-level settlement snapshots alone; they need statement-ledger parsing with explicit lifecycle-state reconstruction and UNKNOWN-item decoding.

Extracted data fields to add:
- `account_statement_entry.fetch_ts`
- `account_statement_entry.ref_id`
- `account_statement_entry.item_date`
- `account_statement_entry.item_class`
- `account_statement_entry.amount`
- `account_statement_entry.balance`
- `account_statement_entry.full_market_name_raw`
- `account_statement_entry.transaction_type`
- `account_statement_entry.win_lose`
- `account_statement_entry.charge_marker_txn_gt_5000_flag`
- `account_statement_entry.commission_reversal_flag`
- `account_statement_entry.result_fix_flag`
- `account_statement_entry.result_err_flag`
- `account_statement_entry.result_lost_flag`
- `account_statement_entry.source_payload_hash`

Model ideas:
- Add a `resettlement_hazard_score` feature (per market/day) from recent `RESULT_ERR/RESULT_FIX/COMMISSION_REVERSAL` frequency to downweight fragile realized-PnL labels.
- Add a `txn_charge_pressure_score` from statement-derived transaction-charge markers to improve expected-net-edge modeling in high-churn strategies.

Execution lessons:
- Treat `getAccountStatement` as a required reconciliation source for cost attribution and not only as a finance/back-office report.
- Parse and persist `itemClass=UNKNOWN` rows with schema-aware decoders; dropping UNKNOWN rows can silently remove charge and resettlement events.
- Rebuild settled PnL through lifecycle events (initial settle, unsettle, resettle) instead of assuming single-pass settlement finality.

Contradiction noted:
- Prior simplification: transaction charges and settlement corrections were modeled mostly from static charge tables and single-pass market settlement outcomes. Betfair primary/support docs show statement-ledger lifecycle events with charge and resettlement semantics that are not safely inferable from market-level snapshots alone.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal delta this pass is Betfair post-trade accounting microstructure (transaction-charge identification and resettlement lifecycle semantics), rather than new CAW-team proprietary model disclosures.

## Source notes (incremental additions for pass 90)

- Betfair Developer Support, `How can I identify Transaction Charges via getAccountStatement?` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000396972-How-can-I-identify-Transaction-Charges-via-getAccountStatement
- Betfair Developer Support, `How does market resettlement show on my Betair Account Statement?` (updated 2025-08-20; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360004664811-How-does-market-resettlement-show-on-my-Betair-Account-Statement
- Betfair Exchange API Documentation, `Additional Information` (`Account Statement - Resettlement Lifecycle` section; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Betfair Exchange API Documentation, `Additional Information` (current page surface containing resettlement examples; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2698444

## Incremental sourced findings added in this run (2026-04-02, pass 91)

### Betfair `FILL_OR_KILL` semantics add a distinct execution regime (VWAP-floor, immediate cancel, optional minimum fill)

- [A] Betfair `placeOrders` documents that `TimeInForce=FILL_OR_KILL` only matches if the full size can be matched immediately, or if `minFillSize` is provided, at least that minimum can be matched; otherwise the order is immediately canceled.
- [A] The same page states `FILL_OR_KILL` price semantics differ from standard LIMIT semantics: the submitted price is a lower bound on the order-level VWAP, not a per-fragment minimum.
- [A/B] Inference: fill modeling must separate resting-LIMIT behavior from immediate-execution FOK behavior, because partial-fill and price-improvement mechanics are materially different.

Extracted data fields to add:
- `order_intent_snapshot.time_in_force`
- `order_intent_snapshot.min_fill_size`
- `order_intent_snapshot.vwap_floor_price`
- `order_intent_snapshot.immediate_cancel_if_unfilled_flag`
- `order_fill_outcome_snapshot.fill_or_kill_triggered_flag`
- `order_fill_outcome_snapshot.size_matched_immediate`
- `order_fill_outcome_snapshot.vwap_matched_price`

Model ideas:
- Train a `fok_fill_probability` model keyed by ladder depth, `minFillSize`, and seconds-to-post.
- Add a `vwap_floor_slippage_gap` feature (matched VWAP minus requested floor) to compare FOK vs resting LIMIT quality.

Execution lessons:
- Do not treat `FILL_OR_KILL` as a minor LIMIT variant; route it through a separate policy path.
- Require explicit `minFillSize` policy per strategy instead of defaulting to full-size FOK.

Contradiction noted:
- Prior simplification: LIMIT and FOK can share one fill/slippage model. Betfair documents a distinct matching rule using VWAP-floor logic for FOK.

### Betfair minimum-stake logic is dual-threshold (Min Bet Size and Min Bet Payout) with jurisdiction gating

- [A] Betfair `placeOrders` states bets below `Min Bet Size` can still be valid for `orderType=LIMIT` when payout reaches the currency `Min Bet Payout` threshold.
- [A] The same page states this lower-minimum-stake feature is not enabled in `.it`, `.es`, `.dk`, and `.se` jurisdictions.
- [A] Betfair `Additional Information` currency table explicitly ties `Min Bet Size`, `Minimum BSP Liability`, and `Minimum Bet Payout` by currency (including AUD row values).
- [A/B] Inference: stake validation should be implemented as a rules engine with jurisdiction and order-type gates, not a single static min-stake constant.

Extracted data fields to add:
- `stake_validation_snapshot.currency_code`
- `stake_validation_snapshot.order_type`
- `stake_validation_snapshot.min_bet_size`
- `stake_validation_snapshot.min_bet_payout`
- `stake_validation_snapshot.minimum_bsp_liability`
- `stake_validation_snapshot.low_stake_exception_active_flag`
- `stake_validation_snapshot.jurisdiction_supported_flag`

Model ideas:
- Add a `stake_rejection_risk` feature using currency, order type, and payout target.
- Add a `microstake_viability_score` for long-price strategies constrained by min payout and jurisdiction.

Execution lessons:
- Validate stake/order combinations before order submission using both min-size and min-payout rules.
- Persist which rule branch passed (`base_min_size` vs `min_payout_exception`) for post-trade diagnostics.

Contradiction noted:
- Prior simplification: min stake is one static per-currency threshold. Betfair docs show a conditional min-payout pathway with jurisdiction exclusions.

### Australian pre-off data and fee regimes include hard timing and meeting-tier economics that should be explicit model/execution inputs

- [A] Racing Australia publishes state/territory scratchings release schedules in local time, including distinct final-scratchings times (e.g., WA 8:00am, NT 8:15am final) and operational queue handling near deadline.
- [A] Racing Australia notes Group 1 and NT scratchings can remain pending steward approval before finalization.
- [A] Racing NSW fee tables for Australian wagering operators explicitly separate Totalizator-Derived-Odds wagers from other wagers and step rates by meeting class (Standard, Premium, Premier).
- [A/B] Inference: pre-off market-state uncertainty and effective fee rates should be time- and class-conditional, not globally static across Australian meetings.

Extracted data fields to add:
- `scratchings_release_schedule.state`
- `scratchings_release_schedule.interim_cutoff_local_time`
- `scratchings_release_schedule.final_cutoff_local_time`
- `scratchings_release_schedule.pending_steward_approval_flag`
- `scratchings_release_event.queue_backlog_flag`
- `nsw_fee_surface_snapshot.meeting_tier(standard|premium|premier)`
- `nsw_fee_surface_snapshot.bet_type(tdo|other)`
- `nsw_fee_surface_snapshot.fee_rate_pct`

Model ideas:
- Add a `preoff_runner_set_stability_score` using state-specific scratchings windows and pending-approval states.
- Add an `effective_fee_rate` feature by meeting tier and bet type for NSW return normalization.

Execution lessons:
- Freeze or haircut stake sizing near final scratchings windows when runner-set stability is unresolved.
- Compute expected edge after meeting-tier-specific fee assumptions, especially for tote-derived-odds pathways.

Contradiction noted:
- Prior simplification: Australian scratchings and fee assumptions were broadly uniform. Primary RA/RNSW sources show jurisdiction/time and meeting-tier/bet-type specific differences.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal evidence this pass is concentrated in exchange execution semantics (Betfair) and Australian operational/commercial race-data mechanics (Racing Australia, Racing NSW), rather than fresh CAW-team proprietary method disclosures.

## Source notes (incremental additions for pass 91)

- Betfair Exchange API Documentation, `placeOrders` (`FILL_OR_KILL`, `minFillSize`, VWAP-floor semantics, Min Bet Payout behavior; updated 2025-01-07; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair Exchange API Documentation, `Additional Information` (`Currency Parameters`: Min Bet Size, Minimum BSP Liability, Minimum Bet Payout; last modified 2023-11-24 shown on captured version; accessed 2026-04-02): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Racing Australia, `Scratching Release Information` (state/territory interim/final scratchings schedule and pending approval notes; accessed 2026-04-02): https://www.racingaustralia.horse/FreeFields/ScratchingReleaseInformation.aspx
- Racing NSW, `Race Field Fees - NSW Thoroughbred Races - for Australian Wagering Operators` (meeting-tier and bet-type fee schedule; accessed 2026-04-02): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/race-field-fees-nsw-thoroughbred-races-for-australian-wagering-operators/

## Incremental sourced findings added in this run (2026-04-02, pass 92)

### Betfair Expert Fee mechanics introduce a rolling net-edge regime (52-active-week profitability + dynamic buffer) that must be modeled separately from base commission/transaction charges

- [A] Betfair Charges terms define Expert Fee qualification around `Last 52 Active Week Gross P&L > £25,000`, with active-week and commission-generated semantics, weekly calculation cadence, and explicit weekly debit timing.
- [A] Betfair Expert Fee FAQ adds operational transition details: Premium Charge framework ended after activity week `2024-12-30` to `2025-01-05` (final debit `2025-01-08`), with Expert Fee effective from `2025-01-06` for previously qualifying accounts.
- [A] The same FAQ states Expert Fee is capped at `40%` (no `50%/60%` legacy premium-charge rates), includes extra gating (`Lifetime Gross P&L > 0`, `Lifetime Markets Bet > 100`), and formalizes dynamic buffer carry-forward.
- [A] The FAQ states implied commission in commission-generated calculations moved from `3%` historically to `2.5%` of market losses going forward, with formula continuity via `Commission Generated = (Commission Paid + Implied Commission) / 2`.
- [A/B] Inference: post-2025 net-edge attribution should treat Betfair high-profit cohorts as a stateful fee regime (`rate tier`, `buffer`, `implied-commission basis`) rather than a static top-line commission assumption.

Extracted data fields to add:
- `expert_fee_regime_snapshot.capture_ts`
- `expert_fee_regime_snapshot.account_id`
- `expert_fee_regime_snapshot.last_52_active_week_gross_pnl_gbp`
- `expert_fee_regime_snapshot.lifetime_gross_pnl_gbp`
- `expert_fee_regime_snapshot.lifetime_markets_bet`
- `expert_fee_regime_snapshot.current_expert_fee_rate_pct`
- `expert_fee_regime_snapshot.current_buffer_gbp`
- `expert_fee_regime_snapshot.buffer_calc_basis(since_last_fee|since_last_rate_change)`
- `expert_fee_regime_snapshot.implied_commission_rate_pct`
- `expert_fee_regime_snapshot.weekly_commission_generated_gbp`
- `expert_fee_regime_snapshot.weekly_fee_due_gbp`
- `expert_fee_regime_snapshot.premium_to_expert_transition_flag`
- `expert_fee_regime_snapshot.activity_week_start_date`
- `expert_fee_regime_snapshot.activity_week_end_date`

Model ideas:
- Add a `fee_regime_adjusted_edge` label that subtracts dynamic Expert Fee expectation (rate + buffer state), not just commission/transaction costs.
- Add a `buffer_depletion_hazard` feature to forecast when a strategy/account is likely to re-enter fee-paying state after loss/commission cushions decay.
- Train a `rate_transition_risk` classifier keyed to rolling 52-week P&L velocity to anticipate `20%` to `40%` regime jumps.

Execution lessons:
- Recompute expected net edge weekly after Betfair Monday fee-state updates; daily cost assumptions are insufficient for high-turnover accounts.
- Persist fee-state snapshots and implied-commission basis version (`3.0%` historical vs `2.5%` current) so replay/backtests match period-appropriate economics.
- Segment strategy evaluation by fee regime (`0%`, `20%`, `40%`) before attributing alpha decay.

Contradiction noted:
- Prior simplification: Betfair cost modeling focused mostly on exchange commission plus transaction/turnover charges. Current Betfair terms/FAQ show a rolling profitability-based Expert Fee regime with dynamic buffer and implied-commission basis changes that materially alter realized net returns for top cohorts.

### BetMakers demo-access constraints expose provider-scope and latency traps for early-stage pipeline validation

- [A/B] BetMakers' official API demo access page states explicit demo-scope boundaries: racing data limited to Queensland (`Thoroughbred`, `Greyhound`, `Harness`), pricing/results tied to `TAB VIC - V`, and form-history via `RaceLab - RLB`.
- [A/B] The same page states demo price updates are delayed by `10 seconds`.
- [A/B] Inference: prototype model validation run on demo credentials risks leakage into production assumptions unless jurisdiction/latency flags are enforced.

Extracted data fields to add:
- `provider_access_profile.provider_name`
- `provider_access_profile.access_mode(demo|production)`
- `provider_access_profile.racing_data_scope_regions`
- `provider_access_profile.pricing_results_scope`
- `provider_access_profile.form_history_scope`
- `provider_access_profile.price_update_delay_sec`
- `provider_access_profile.credentials_source`
- `provider_access_profile.capture_ts`

Model ideas:
- Add a `provider_access_fidelity_score` feature to downweight experiments trained/evaluated under demo-latency or partial-jurisdiction scope.

Execution lessons:
- Block production-sensitivity backtests when provider profile indicates `access_mode=demo` or non-zero declared delay.
- Tag every market snapshot with provider access profile so mixed demo/production traces are detectable and removable.

Contradiction noted:
- Prior simplification: provider onboarding/demo feeds were treated as close proxies for production behavior once schemas matched. BetMakers explicitly discloses scope-limited coverage and delayed pricing in demo mode.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal delta this pass is exchange fee-regime microstructure (Betfair Expert Fee/Premium transition and implied-commission basis) plus provider-access-fidelity controls (BetMakers demo constraints).

## Source notes (incremental additions for pass 92)

- Betfair support, `Betfair Charges` (Expert Fee terms, formulas, cadence, and charge structure context; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/betfair-charges
- Betfair support, `Expert Fee FAQs` (qualification/gating, 2025 transition timing, buffer mechanics, implied commission basis update, and worked examples; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/expert-fee-faqs
- BetMakers, `BetMakers API Demo Access` (demo scope boundaries and 10-second price-delay statement; accessed 2026-04-02): https://graphql.coreapi.gcpintau.tbm.sh/

## Incremental sourced findings added in this run (2026-04-02, pass 93)

### Keeneland publishes explicit CAW participation and affiliation stances that sharpen venue-level policy heterogeneity

- [A] Keeneland's wagering-experience FAQ states the venue does not restrict participation by wager type or participant.
- [A] The same page states CAWs do not get special odds or guaranteed payouts.
- [A] The same page states Keeneland is not affiliated with a CAW wager-processing platform and does not own a CAW operation.
- [A/B] Inference: CAW regime modeling needs more than cutoff timestamps; venue-level participation policy and platform-affiliation posture are separate state variables that can diverge across tracks.

Extracted data fields to add:
- `venue_caw_participation_policy_snapshot.venue`
- `venue_caw_participation_policy_snapshot.capture_ts`
- `venue_caw_participation_policy_snapshot.restricts_by_participant_flag`
- `venue_caw_participation_policy_snapshot.restricts_by_wager_type_flag`
- `venue_caw_participation_policy_snapshot.special_odds_or_guaranteed_payout_flag`
- `venue_caw_participation_policy_snapshot.track_affiliated_with_caw_platform_flag`
- `venue_caw_participation_policy_snapshot.track_owns_caw_operation_flag`
- `venue_caw_participation_policy_snapshot.source_url`

Model ideas:
- Add a `venue_caw_policy_laxity_score` feature (restriction scope + affiliation posture) for cross-venue tote-odds regime transfer.
- Add a `policy_alignment_distance` feature comparing venue CAW stance vectors (for example NYRA/Del Mar cutoff-first vs Keeneland open-participation posture) before borrowing priors.

Execution lessons:
- Keep CAW policy as a multidimensional state (`cutoff`, `pool_scope`, `participant_restrictions`, `affiliation_posture`) rather than one boolean flag.
- Treat venue-declared non-restriction posture as a routing and benchmarking attribute when evaluating late-odds behavior against restricted venues.

Contradiction noted:
- Prior simplification: CAW venue policy was represented mainly by cutoff timing and affected pools. Keeneland's official FAQ adds independent dimensions (participation openness and no-affiliation posture) that can materially alter policy-regime comparisons.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent evidence this pass is venue policy-stance metadata (participation restrictions and affiliation posture), not new syndicate proprietary model disclosure.

## Source notes (incremental additions for pass 93)

- Keeneland, `Wagering Experience` (FAQ entries on CAW participation restrictions, payout parity, and affiliation posture; accessed 2026-04-02): https://www.keeneland.com/wagering-experience

## Incremental sourced findings added in this run (2026-04-02, pass 94)

### NSW code-level race-fields economics diverge materially across thoroughbred, greyhound, and harness conditions and need explicit fee-surface routing

- [A] GRNSW's 2025-26 Standard Conditions (Version `1.1`, effective `1 July 2025`) define monthly payment and reporting gates that are tighter than many static fee assumptions: Monthly Instalment Amounts are due within `10 Business Days` after month-end, while monthly returns are due within `5 Business Days` after month-end.
- [A] The same GRNSW conditions define Information Use Fee for Fixed Odds / Totalisator Derived Odds / Totalisator Odds as the greater of:
- `17.5%` of gross margin components (with `$0` floor) aggregated across those bet classes, or
- `2%` of NSW greyhound turnover.
- [A] The same GRNSW schedule sets Betting Exchange fees at `25%` of Gross Revenue (or `$0`, whichever is greater), which is structurally different from turnover-based fee formulations.
- [A] GRNSW's schedule also publishes explicit maximum-fee caps (as at grant date): `4%` turnover for TDO, `3.0%` turnover for Fixed Odds/Totalisator Odds where at least one race at the meeting has prizes `>= $1m`, and `2.5%` turnover for other Fixed Odds/Totalisator Odds races.
- [A] GRNSW defines an application-fee gate for new applicants and smaller incumbents (`$2,500 + GST`, including prior-period turnover criterion) and includes annual-report/audit timing mechanics (`final return within 1 month after 30 June 2026`, auditor certificate within `90 days`).
- [A/B] HRNSW's race-fields page publishes harness-specific fee structure and premium-meeting uplift logic for Australian operators (`1.75%` non-TDO / `3.0%` TDO net harness turnover; premium-meeting uplift `2.75%` non-TDO / `3.5%` TDO) and notes international operator fee treatment (`3.5%` net harness turnover), with annual Approval Conditions links.
- [A/B] Inference: NSW economics/compliance cannot be represented as a single "NSW fee rate"; it is code-specific (thoroughbred vs greyhound vs harness), bet-type-specific, meeting-tier-specific, and calendar-SLA specific.

Extracted data fields to add:
- `nsw_code_fee_surface_snapshot.code(thoroughbred|greyhound|harness)`
- `nsw_code_fee_surface_snapshot.capture_ts`
- `nsw_code_fee_surface_snapshot.operator_class(australian|international)`
- `nsw_code_fee_surface_snapshot.bet_type(fixed_odds|tdo|totalisator_odds|betting_exchange)`
- `nsw_code_fee_surface_snapshot.primary_calc_method(gross_margin_pct|turnover_pct|gross_revenue_pct)`
- `nsw_code_fee_surface_snapshot.primary_rate_pct`
- `nsw_code_fee_surface_snapshot.alternative_rate_pct`
- `nsw_code_fee_surface_snapshot.greater_of_rule_flag`
- `nsw_code_fee_surface_snapshot.maximum_fee_cap_pct`
- `nsw_code_fee_surface_snapshot.meeting_prize_threshold_aud`
- `nsw_code_fee_surface_snapshot.effective_from`
- `nsw_code_reporting_calendar_snapshot.code`
- `nsw_code_reporting_calendar_snapshot.monthly_report_due_business_days`
- `nsw_code_reporting_calendar_snapshot.monthly_payment_due_business_days`
- `nsw_code_reporting_calendar_snapshot.final_return_due_days_after_period_end`
- `nsw_code_reporting_calendar_snapshot.audit_certificate_due_days`
- `nsw_code_entitlement_fee_gate_snapshot.code`
- `nsw_code_entitlement_fee_gate_snapshot.new_applicant_fee_aud`
- `nsw_code_entitlement_fee_gate_snapshot.low_turnover_threshold_aud`

Model ideas:
- Add a `code_specific_effective_fee_rate` feature that computes expected post-fee economics by NSW code + bet type + meeting tier instead of applying a statewide scalar.
- Add a `compliance_calendar_breach_risk` feature from report/payment due-date proximity and filing completeness to model operational interruption risk.
- Add a `fee_cap_binding_probability` feature for greyhound/harness contexts where maximum-fee caps can materially alter expected net edge under high-turnover scenarios.

Execution lessons:
- Treat NSW code type as a first-class execution routing key in cost attribution and pre-trade edge filters.
- Enforce separate monthly report/payment deadline workflows for GRNSW conditions (`5` vs `10` business-day gates) to avoid silent compliance drift.
- Keep fee formulas versioned and composable (`greater_of`, `cap`, `premium-meeting`) rather than flattening into one fixed percentage.

Contradiction noted:
- Prior simplification: NSW race-fields economics were modeled mainly from thoroughbred schedules with limited cross-code differentiation. GRNSW/HRNSW primary artifacts show distinct fee algebra, cap logic, and reporting cadence across codes.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal delta this pass is Australian provider/compliance microstructure across NSW racing codes (GRNSW + HRNSW), which is execution/cost architecture relevant but not new syndicate model internals.

## Source notes (incremental additions for pass 94)

- GRNSW, `Race Fields Information Use` page (2025-26 conditions link and application-fee notice; accessed 2026-04-02): https://www.grnsw.com.au/policies/wagering/race-fields-information-use
- GRNSW PDF, `2025-26 GRNSW RFIU Approval for Australian WSPs - Standard Conditions` (Version 1.1, 24 June 2025, effective 1 July 2025; accessed 2026-04-02): https://www.grnsw.com.au/attachments/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCRFgwblFFPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--03efde82ee1bbbf899d10010754aa579ec9c791d/2025-26%20GRNSW%20RFIU%20Approval%20for%20Australian%20WSPs%20-%20Standard%20Conditions%20.pdf
- HRNSW, `Race Fields and Corporate Wagering Operators` (harness fee structure and premium-meeting uplift summary + annual approval-conditions links; accessed 2026-04-02): https://www.hrnsw.com.au/hrnsw/race-fields-and-corporate-wagering-operators

## Incremental sourced findings added in this run (2026-04-02, pass 95)

### US CAW litigation moved from initial complaint to a materially expanded amended pleading (filed 2026-02-27), increasing policy/regime uncertainty for CAW access assumptions

- [A/B] The First Amended Complaint in `Dickey et al. v. The Stronach Group, Inc. et al.` was filed on `2026-02-27` (`Document 53`) and expands the case from a single named plaintiff to multiple named plaintiffs.
- [A/B] The same amended filing explicitly states it was submitted after court-directed amendment and adds multiple state consumer-protection claims alongside the existing RICO-centered framing.
- [A/B] Justia's docket snapshot (last retrieved `2025-12-20`) records pre-motion conference letters for contemplated motions to dismiss and initial conference scheduling into January 2026, confirming the dispute had already transitioned into active pre-motion procedure before the amended filing.
- [B] Inference: while allegations are unproven, the litigation state itself is now a measurable CAW-policy regime input (discovery, settlement, injunction, or policy-change pathways), and should be modeled as legal-regime uncertainty rather than only static track-policy text.

Extracted data fields to add:
- `caw_litigation_case_snapshot.case_id`
- `caw_litigation_case_snapshot.capture_ts`
- `caw_litigation_case_snapshot.court`
- `caw_litigation_case_snapshot.latest_complaint_type(initial|amended)`
- `caw_litigation_case_snapshot.latest_complaint_filed_date`
- `caw_litigation_case_snapshot.named_plaintiff_count`
- `caw_litigation_case_snapshot.named_defendant_count`
- `caw_litigation_case_snapshot.claim_family_flags(rico|consumer_protection|state_tort)`
- `caw_litigation_case_snapshot.pre_motion_status(active|none)`
- `caw_litigation_case_snapshot.next_scheduled_event_date`
- `caw_litigation_case_snapshot.source_provenance(court_filing|docket_aggregator|media_copy)`

Model ideas:
- Add a `caw_legal_regime_state` feature (`none|active_pre_motion|active_discovery|resolved`) to downweight cross-jurisdiction transfer when litigation pressure is elevated.
- Add an event-study layer around major litigation milestones (amended complaints, dismissal rulings, settlements) to test whether tote microstructure metrics shift around legal-regime changes.

Execution lessons:
- Persist the filing timeline as an auditable regime stream separate from policy announcements.
- Treat non-court reposts of filings as secondary provenance and preserve source-tier metadata in lineage.

Contradiction noted:
- Prior simplification: CAW governance inputs were mostly modeled as track-issued policy settings (cutoffs/eligibility). The post-2025 litigation track introduces a parallel, court-driven regime channel that can alter operating constraints without new track-policy releases.

### Racing Victoria's 2026 scratching-fee model adds an explicit pre-rider vs post-rider economic state variable that should feed runner-set stability and late-liquidity priors

- [A] Racing Victoria's official release (`Nov 30, 2025`) states a new scratching-fee structure applies from `1 February 2026`.
- [A] The release specifies fee-state branching by scratching context: `A$274.25 ex GST` with rider declared, `A$100` without rider declared, `A$120` with veterinary certificate, and free for vet certificate plus 30-day stand down; picnic and Group/Listed paths are separately handled.
- [A/B] Inference: pre-off runner-removal behavior is influenced by a time-sensitive fee surface keyed to rider-declaration state, so scratchings should be modeled as economically conditioned state transitions, not only steward/fitness outcomes.

Extracted data fields to add:
- `vic_scratching_fee_model_snapshot.capture_ts`
- `vic_scratching_fee_model_snapshot.effective_from`
- `vic_scratching_fee_model_snapshot.scope_professional_flat_ex_group_listed_flag`
- `vic_scratching_fee_model_snapshot.scope_jumps_flag`
- `vic_scratching_fee_model_snapshot.fee_with_rider_declared_aud_ex_gst`
- `vic_scratching_fee_model_snapshot.fee_without_rider_declared_aud_ex_gst`
- `vic_scratching_fee_model_snapshot.fee_with_vet_certificate_aud_ex_gst`
- `vic_scratching_fee_model_snapshot.fee_with_vet_cert_and_30d_standdown_aud_ex_gst`
- `vic_scratching_fee_model_snapshot.fee_picnic_aud_ex_gst`
- `vic_scratching_fee_model_snapshot.group_listed_fee_rule_text`
- `runner_status_event.rider_declared_flag_at_scratch`

Model ideas:
- Add a `scratch_cost_pressure` feature keyed to rider-declaration timing and fee branch.
- Add a `late_field_retention_probability` model using declaration-stage and race-class interactions.

Execution lessons:
- Recompute runner-set stability priors at rider-declaration boundaries, not only at final-scratchings timestamps.
- Keep jurisdiction-specific scratching economics versioned by effective date in replay/backtests.

Contradiction noted:
- Prior simplification: scratchings were treated mainly as operational/integrity events. RV's schedule shows explicit fee-state economics that likely influence withdrawal timing and therefore pre-off liquidity composition.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass is legal-regime evolution (court filings/procedure) plus state-level scratching-economics mechanics (RV) that can shift observable market microstructure without new syndicate technical disclosures.

## Source notes (incremental additions for pass 95)

- First Amended Complaint PDF (`Case 2:25-cv-05962-JMA-JMW`, Document 53, filed 2026-02-27): https://pastthewire.com/wp-content/uploads/2026/03/2026-02-27-first-amended-complaint.pdf
- Initial Complaint PDF (`Dickey v. The Stronach Group, Inc. et al`, filed 2025-10-24): https://www.classaction.org/media/dickey-v-the-stronach-group-inc-et-al-complaint.pdf
- Justia docket summary (`Dickey v. The Stronach Group, Inc. et al`, 2:2025cv05962; docket snapshot metadata including last retrieved date and listed entries): https://dockets.justia.com/docket/new-york/nyedce/2%3A2025cv05962/538025
- Racing Victoria official release, `New scratching fee model` (published 2025-11-30; effective from 2026-02-01): https://www.racingvictoria.com.au/news/2025/12/01/new-scratching-fee-model

## Incremental sourced findings added in this run (2026-04-02, pass 96)

### Betfair rule-hierarchy mechanics create a separate governance-state input for execution reliability beyond API schema contracts

- [A] Betfair's Exchange Rules and Regulations define explicit rule precedence: Specific Sports Rules override General Rules, and Market Information overrides both unless an override phrase is explicitly used.
- [A] The same rules state Market Information is guidance and Betfair reserves the right to suspend any market at any time at sole discretion.
- [A] The same rules state Market Information should not be amended after market load except obvious-error correction or clarification.
- [A/B] Inference: exchange execution modeling needs a `governance override` state that is orthogonal to API uptime and schema stability, because settlement/suspension behavior can legally diverge from preloaded market metadata.

Extracted data fields to add:
- `betfair_rule_hierarchy_snapshot.capture_ts`
- `betfair_rule_hierarchy_snapshot.specific_over_general_flag`
- `betfair_rule_hierarchy_snapshot.market_info_overrides_general_flag`
- `betfair_rule_hierarchy_snapshot.override_phrase_exception_flag`
- `betfair_market_governance_snapshot.capture_ts`
- `betfair_market_governance_snapshot.market_suspension_discretion_unbounded_flag`
- `betfair_market_governance_snapshot.market_info_post_load_amendment_policy(obvious_error_or_clarification_only)`
- `betfair_market_governance_snapshot.source_url`

Model ideas:
- Add a `rule_hierarchy_override_risk` feature that increases expected execution/settlement variance when strategy logic depends on Market Information assumptions.
- Add a `market_governance_fragility_score` to penalize strategies that rely on narrow in-play timing assumptions under discretionary suspend powers.

Execution lessons:
- Treat Market Information as soft-control metadata and Rules page hierarchy as the canonical conflict resolver in replay and live adjudication.
- Version-diff the Rules page as a first-class contract source, not only API docs/support endpoints.

Contradiction noted:
- Prior simplification: exchange microstructure risk was modeled mostly as API/stream constraints. Betfair's formal rule hierarchy and suspension discretion adds a separate governance path that can change behavior without endpoint changes.

### Racing Australia's web terms, privacy scope, and publishing surfaces show a stronger rights-and-operating perimeter than schema-only provider onboarding captures

- [A] Racing Australia's Website Terms of Use (`Updated May 2021`) state fields/form/results are copyright-protected and include jurisdiction-specific ownership statements (for example Racing NSW, Racing Victoria, Racing Queensland, WA, SA, TAS, NT, ACT) with personal/non-commercial usage limits and written-permission requirements for broader use.
- [A] The same Terms explicitly prohibit automated scraping/bot access against website materials.
- [A] Racing Australia's Privacy Collection Notice states RA operates a multi-domain service footprint and may collect/process data on behalf of Principal Racing Authorities (PRAs), including identity and compliance-related data classes.
- [A/B] Racing Australia's Publishing page states racebook/publishing products include an official Jockey Silks image database (`in excess of 40,000` images) and automatic image generation from service-centre text descriptions (`Excluding WA`).
- [A/B] Inference: provider readiness should include rights posture, automation restrictions, and derivative-content provenance (for example silks-render lineage), not only API availability/cadence.

Extracted data fields to add:
- `provider_rights_policy_snapshot.provider_name`
- `provider_rights_policy_snapshot.capture_ts`
- `provider_rights_policy_snapshot.personal_noncommercial_only_flag`
- `provider_rights_policy_snapshot.automated_scraping_prohibited_flag`
- `provider_rights_policy_snapshot.jurisdiction_copyright_owner_map`
- `provider_rights_policy_snapshot.permission_contact_channel`
- `provider_operating_scope_snapshot.provider_name`
- `provider_operating_scope_snapshot.multi_domain_footprint`
- `provider_operating_scope_snapshot.pra_processing_flag`
- `provider_content_derivative_snapshot.content_type(jockey_silks_image)`
- `provider_content_derivative_snapshot.auto_generated_from_text_flag`
- `provider_content_derivative_snapshot.wa_exclusion_flag`
- `provider_content_derivative_snapshot.asset_count_estimate`

Model ideas:
- Add a `provider_rights_friction_score` feature to weight data-source promotion risk by rights restrictions and automation prohibitions.
- Add a `derived_content_provenance_confidence` feature for silks/image-based features, downweighting jurisdictions with explicit exclusion or non-equivalent generation paths.

Execution lessons:
- Separate ingestion channels into `licensed feed/API` vs `web-surface` and enforce hard blocking on prohibited automation paths.
- Track jurisdiction-level rights ownership metadata as part of source lineage to avoid cross-state reuse assumptions.

Contradiction noted:
- Prior simplification: Australian provider evaluation treated availability/schema as the dominant constraint. RA terms/privacy/publishing artifacts show rights, automation limits, and derivative-content provenance are equally binding architecture inputs.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No net-new direct CAW-team proprietary model disclosures were identified this pass; the net-new signal is governance perimeter tightening (Betfair rule hierarchy) and Australian provider rights/operating constraints.

## Source notes (incremental additions for pass 96)

- Betfair, `Exchange Rules and Regulations` (rule precedence, Market Information override logic, suspension discretion, and amendment constraints; accessed 2026-04-02): https://www.betfair.com.au/AUS_NZL/aboutUs/Rules.and.Regulations/
- Racing Australia, `Website Terms of Use` (rights ownership map, permitted-use limits, anti-scraping clause, and liability terms; updated May 2021; accessed 2026-04-02): https://www.racingaustralia.horse/AboutUs/website-terms-of-use.aspx
- Racing Australia, `Privacy Collection Notice` (multi-domain operating scope and PRA processing context; accessed 2026-04-02): https://www.racingaustralia.horse/AboutUs/privacy-collection-notice.aspx
- Racing Australia, `Publications` (jockey silks database scale and auto-generation workflow, excluding WA; accessed 2026-04-02): https://www.racingaustralia.horse/AboutUs/Publishing.aspx

## Incremental sourced findings added in this run (2026-04-02, pass 97)

### HKJC outbound-commingling rules expose a pool-level rebate and rulebook fork that should be modeled as market-regime state

- [A] HKJC's outbound-commingling page states that from October 2019, designated French simulcast Win/Place pools are merged into PMU pools and governed by modified PMU rules.
- [A] The same HKJC page explicitly says rebate is not applicable for outbound commingling (including repeated rule-highlight note), while Quinella/Quinella Place remain in separate Hong Kong pools where rebate is applicable.
- [A/B] Inference: payout/rebate economics can switch within the same meeting by pool type and commingling mode, so a single "venue rebate assumption" is structurally wrong.

Extracted data fields to add:
- `pool_regime_snapshot.capture_ts`
- `pool_regime_snapshot.jurisdiction`
- `pool_regime_snapshot.meeting_id`
- `pool_regime_snapshot.pool_type(win|place|quinella|quinella_place|other)`
- `pool_regime_snapshot.commingling_mode(local|outbound)`
- `pool_regime_snapshot.partner_operator`
- `pool_regime_snapshot.partner_rulebook(PMU|HKJC|other)`
- `pool_regime_snapshot.rebate_applicable_flag`
- `pool_regime_snapshot.takeout_formula_reference`
- `pool_regime_snapshot.effective_from`

Model ideas:
- Add a `pool_regime_transition_risk` feature for meetings where local and outbound pools coexist.
- Add a `rebate_path_classifier` to route EV logic by pool-level regime instead of venue-level defaults.

Execution lessons:
- Treat commingling mode and governing rulebook as first-class inputs to expected-value and post-cost reconciliation.
- Do not reuse win-pool economics assumptions for exotic pools without explicit regime validation.

Contradiction noted:
- Prior simplification: rebate applicability was often assumed to be a venue/operator property. HKJC shows it can be pool-specific and commingling-specific within the same card.

### Chapman 2008 (2,000 HK races) adds a post-Bolton threshold result that strengthens explicit p-min regime controls

- [A/B] RePEc/World Scientific chapter metadata and abstract state Chapman extended the Bolton-Chapman multinomial-logit approach with a 20-variable fundamental model over 2,000 Hong Kong races.
- [A/B] The same abstract reports holdout positive returns under a simple single-unit strategy, and expected returns above 20% when excluding runners with estimated win probability below 0.04.
- [A/B] Inference: thresholding behavior is not a static optimization knob; it is a regime-sensitive edge-shaping control that can produce large swings and must be stress-tested by market/liquidity context.

Extracted data fields to add:
- `strategy_threshold_experiment.capture_ts`
- `strategy_threshold_experiment.source_study_id`
- `strategy_threshold_experiment.sample_size_races`
- `strategy_threshold_experiment.feature_count`
- `strategy_threshold_experiment.threshold_variable(p_estimated_win)`
- `strategy_threshold_experiment.threshold_value`
- `strategy_threshold_experiment.reported_return_pct`
- `strategy_threshold_experiment.validation_mode(holdout|other)`
- `strategy_threshold_experiment.source_confidence(A|A/B|B)`

Model ideas:
- Add a `dynamic_pmin_controller` that chooses threshold bands by liquidity and model uncertainty, not a single global value.
- Add sensitivity sweeps around low-probability exclusions to detect overconcentration and sample-fragility early.

Execution lessons:
- Require threshold-policy A/B replay before promotion whenever liquidity mix or jurisdiction changes.
- Store threshold decision lineage with sample counts to prevent "high return" settings that are data-fragile.

Contradiction noted:
- Prior simplification: probability-floor filters were treated mainly as minor sizing heuristics. The Chapman extension indicates they can be first-order drivers of realized edge.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Net-new CAW-adjacent evidence this pass is pool-governance/economics structure (HKJC commingling/rebate/rulebook split), not proprietary team model internals.

## Source notes (incremental additions for pass 97)

- Hong Kong Jockey Club, `Outbound Commingling` (pool merge rules, PMU-rulebook application, and pool-level rebate applicability; accessed 2026-04-02): https://campaigns.hkjc.com/outbound-commingling/en/
- IDEAS/RePEc entry for Randall G. Chapman chapter in *Efficiency Of Racetrack Betting Markets* (abstract metadata for 20-variable model, 2,000-race sample, and threshold result; accessed 2026-04-02): https://ideas.repec.org/h/wsi/wschap/9789812819192_0018.html

## Incremental sourced findings added in this run (2026-04-02, pass 98)

### Betfair BSP projection fields (`nearPrice`/`farPrice`) are cached and can be non-finite, so BSP feature pipelines need explicit quality-state handling

- [A] Betfair `StartingPrices` definitions state `nearPrice` is the projected SP if reconciled now using SP bets plus unmatched exchange bets on the same selection, and this value is cached/updated every `60 seconds`.
- [A] The same definitions state `farPrice` is the projected SP using only currently placed SP bets (less accurate by design), also cached/updated every `60 seconds`.
- [A] The same fields explicitly allow `Double` values to include finite numbers plus `INF`, `-INF`, and `NaN`.
- [A] `actualSP` is only available once the market has reconciled, and `backStakeTaken`/`layLiabilityTaken` are defined as amounts matched at the actual BSP.
- [A/B] Inference: pre-off BSP projections are delayed and can become numerically non-finite, so treating `nearPrice`/`farPrice` as clean continuously-updating numeric labels will introduce silent training/serving skew.

Extracted data fields to add:
- `bsp_projection_snapshot.capture_ts`
- `bsp_projection_snapshot.market_id`
- `bsp_projection_snapshot.selection_id`
- `bsp_projection_snapshot.near_price_raw`
- `bsp_projection_snapshot.far_price_raw`
- `bsp_projection_snapshot.numeric_state(finite|inf|neg_inf|nan)`
- `bsp_projection_snapshot.cache_interval_sec_doc`
- `bsp_projection_snapshot.seconds_since_last_projection_update`
- `bsp_projection_snapshot.market_reconciled_flag`
- `bsp_projection_snapshot.actual_sp`
- `bsp_projection_snapshot.back_stake_taken`
- `bsp_projection_snapshot.lay_liability_taken`

Model ideas:
- Add a `bsp_projection_quality_state` feature and train separate reliability priors for finite vs non-finite projection states.
- Add a `projection_staleness_sec` covariate so BSP-based features are downweighted inside the final-minute window when cache lag is largest relative to market velocity.

Execution lessons:
- Do not coerce `INF/-INF/NaN` projections to arbitrary numeric caps without preserving the original quality state.
- Separate pre-reconcile projection features from post-reconcile outcome fields (`actualSP`, matched-at-SP amounts) to avoid leakage.

Contradiction noted:
- Prior simplification: `nearPrice`/`farPrice` behaved like high-frequency numeric microprice fields. Primary docs show they are cached (`60s`) and may be non-finite.

### Betfair request-weight budgeting must explicitly include BSP projection costs for fan-out-safe collector planning

- [A] Betfair request limits specify `sum(weight) * number_of_marketIds <= 200` per request, with `TOO_MUCH_DATA` on breach.
- [A] The same table assigns explicit BSP projection weights: `SP_AVAILABLE=3`, `SP_TRADED=7` (alongside `EX_BEST_OFFERS=5`, `EX_ALL_OFFERS=17`, `EX_TRADED=17`).
- [A] The same source notes combination and depth effects (`EX_BEST_OFFERS + EX_TRADED = 20`; `EX_ALL_OFFERS + EX_TRADED = 32`; `exBestOffersOverrides` scales by `requestedDepth/3`).
- [A/B] Inference: adding BSP projections to exchange-price collectors materially reduces allowable per-request market fan-out and must be routed through deterministic request-shaping, not ad hoc retries.

Extracted data fields to add:
- `request_weight_plan.includes_sp_available_flag`
- `request_weight_plan.includes_sp_traded_flag`
- `request_weight_plan.sp_projection_weight_total`
- `request_weight_plan.max_market_ids_for_shape`
- `request_weight_plan.weight_margin_to_limit`
- `request_weight_plan.shape_strategy(split_by_projection|split_by_market_count|both)`

Model ideas:
- Add `collector_weight_margin` as a data-quality risk feature for late-window freshness degradation.
- Add a `projection_surface_profile` regime feature so model calibration differs when BSP surfaces are present vs absent in a market snapshot.

Execution lessons:
- Budget BSP and EX projections together before dispatch; treat `TOO_MUCH_DATA` as a preventable planning failure class.
- Record the projection set used per snapshot so replay can reproduce data-surface differences exactly.

Contradiction noted:
- Prior simplification: BSP projections were treated as lightweight add-ons to exchange ladders. Official weight tables show they consume meaningful request budget and change collector topology.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Net-new high-signal delta this pass is Betfair BSP/microstructure instrumentation quality (projection semantics + weight economics), not new syndicate internals.

## Source notes (incremental additions for pass 98)

- Betfair Exchange API Documentation, `Betting Type Definitions` (`StartingPrices`: `nearPrice`, `farPrice`, cache interval, non-finite numeric support, and reconciled BSP fields; page version captured): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2687465&pageVersion=131
- Betfair Exchange API Documentation, `Market Data Request Limits` (updated 2025-05-21; request-weight equation and explicit `SP_AVAILABLE`/`SP_TRADED` weights): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687478/Market%2BData%2BRequest%2BLimits

## Incremental sourced findings added in this run (2026-04-02, pass 99)

### Betfair `ExBestOffersOverrides` exposes unsupported rollup branches and hard depth limits that should be treated as contract-state, not configurable execution knobs

- [A] Betfair `Betting Type Definitions` documents `bestPricesDepth` under `ExBestOffersOverrides` with default depth `3` and maximum returned depth `10`.
- [A] The same contract states `rollupModel` defaults to `STAKE` with `rollupLimit` defaulting to minimum stake in the specified currency when unspecified.
- [A] The same contract marks `rolloverStakes`, `rollupLiabilityThreshold`, and `rollupLiabilityFactor` as `Not supported as yet`.
- [A] The same type definitions note `averagePriceMatched` and `sizeMatched` can be `null` for asynchronously placed orders, and `averagePriceMatched` is not meaningful/guaranteed for LINE markets.
- [A/B] Inference: collector and execution telemetry should model override-support state and async/market-type nullability explicitly; assuming all rollup modes are active or all fill fields are always populated creates deterministic replay and fill-quality errors.

Extracted data fields to add:
- `price_override_contract_snapshot.capture_ts`
- `price_override_contract_snapshot.best_prices_depth_default`
- `price_override_contract_snapshot.best_prices_depth_max`
- `price_override_contract_snapshot.rollup_model_default`
- `price_override_contract_snapshot.rollup_limit_default_policy`
- `price_override_contract_snapshot.rollover_stakes_supported_flag`
- `price_override_contract_snapshot.rollup_liability_threshold_supported_flag`
- `price_override_contract_snapshot.rollup_liability_factor_supported_flag`
- `order_execution_quality_snapshot.async_order_flag`
- `order_execution_quality_snapshot.average_price_matched_present_flag`
- `order_execution_quality_snapshot.size_matched_present_flag`
- `order_execution_quality_snapshot.line_market_meaningful_avg_price_flag`

Model ideas:
- Add a `projection_contract_support_state` feature so models can downweight snapshots collected under unsupported/ignored override branches.
- Add a `fill_field_completeness_score` feature to separate true execution underperformance from async/nullability-driven missingness.

Execution lessons:
- Treat unsupported override fields as inert and enforce a fail-closed validator when strategy config requests non-supported rollup branches.
- Make async and LINE-market nullability first-class in reconciliation logic; do not coerce missing `averagePriceMatched`/`sizeMatched` into zero-like values.

Contradiction noted:
- Prior simplification: `ExBestOffersOverrides` was handled as fully active configuration space. Current contract text shows several branches are documented but not supported, and key execution fields can be non-populated by design.

### Punting Form worksheet surfaces add a user-authored pricing layer and explicit BetMakers sync dependency that should be captured as provider-lineage state

- [A] Punting Form `Worksheets` docs state users can enter their own rated prices or use a `Neural Price` default, then compare against market prices.
- [A] The same page states fixed odds in worksheets are auto-synced from the market at that moment `thanks to Betmakers`, and calculated edge is displayed.
- [A] Punting Form API reference (`/v2/User/Speedmaps`) states responses return either default provider output or user-customized versions, and this endpoint is available to `Starter subscriptions and up`.
- [A/B] Inference: AU provider ingestion must partition provider-curated vs user-authored artifacts and carry upstream market-sync lineage (`BetMakers`) to prevent inadvertent training leakage and source-attribution drift.

Extracted data fields to add:
- `provider_artifact_snapshot.provider_name`
- `provider_artifact_snapshot.artifact_family(user_feature|provider_curated)`
- `provider_artifact_snapshot.artifact_type(worksheet|speedmap|notes|blackbook)`
- `provider_artifact_snapshot.user_customized_variant_flag`
- `provider_artifact_snapshot.default_variant_flag`
- `provider_artifact_snapshot.default_rating_source(neural_price|other)`
- `provider_artifact_snapshot.market_sync_upstream(BetMakers|other)`
- `provider_artifact_snapshot.edge_calculation_present_flag`
- `provider_artifact_snapshot.entitlement_tier_min`
- `feature_lineage_snapshot.upstream_provider_chain`

Model ideas:
- Add an `artifact_authorship_risk` feature that downweights user-authored artifacts in baseline production models unless explicitly approved.
- Add a `lineage_chain_stability` feature that penalizes signals whose upstream sync dependencies are undocumented or unstable.

Execution lessons:
- Tag every Punting Form-derived feature with authorship class (`user` vs `provider`) before model training and promotion.
- Separate worksheet-style edge displays from production alpha features unless lineage and timestamp controls are complete.

Contradiction noted:
- Prior simplification: provider API payloads were treated mostly as provider-curated objective data. Current Punting Form docs show mixed authorship surfaces and explicit third-party market-sync dependency.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal delta this pass is concentrated in Betfair projection/override contract-state semantics and Australian provider artifact-lineage controls, not new syndicate proprietary model disclosures.

## Source notes (incremental additions for pass 99)

- Betfair Exchange API Documentation, `Betting Type Definitions` (`ExBestOffersOverrides` depth/defaults, unsupported rollup branches, and async/LINE-market field nullability semantics; versioned page capture): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2687465&pageVersion=131
- Punting Form Guides, `Worksheets` (user-rated vs neural default pricing, calculated edge display, and fixed-odds sync attribution to BetMakers): https://docs.puntingform.com.au/docs/worksheets-1
- Punting Form API Reference, `Speedmaps` (`/v2/User/Speedmaps` returns default or user-customized variants; Starter+ entitlement): https://docs.puntingform.com.au/reference/speedmaps

## Incremental sourced findings added in this run (2026-04-02, pass 100)

### BetMakers Web SDK event contracts expose a bet-acknowledgement and failure-surface that should be persisted as first-class execution telemetry

- [A/B] BetMakers `Events` documentation defines host-driven events (`host.state.user`, `host.event.toggleBetslip`) and widget-driven bet lifecycle events (`bm.state.betslip`, `bm.event.betslipPlaced`, `bm.event.betslipFailure`, `bm.event.betPlaced`, `bm.event.betFailure`).
- [A/B] The same page specifies a structured failure payload for `bm.event.betslipFailure` (`status`, `message`) and recommends balance refetch flows on both success and failure events.
- [A/B] Inference: provider-side event streams contain usable execution-state and rejection telemetry that should be captured alongside exchange outcomes, instead of collapsing all provider-side failures into generic placement errors.

Extracted data fields to add:
- `provider_widget_event.event_ts`
- `provider_widget_event.provider(betmakers)`
- `provider_widget_event.session_id`
- `provider_widget_event.event_name`
- `provider_widget_event.payload_status_code`
- `provider_widget_event.payload_message`
- `provider_widget_event.bet_payload_ref`
- `provider_widget_event.balance_refetch_triggered_flag`
- `provider_widget_event.host_user_state_logged_in_flag`
- `provider_widget_event.host_user_state_bonus_balance_cents`

Model ideas:
- Add a `provider_pre_exchange_failure_hazard` feature using event-level failure rates in the final minutes before jump.
- Add a `widget_event_sequence_integrity_score` feature that penalizes snapshots with missing `bm.state.betslip` to `bm.event.betPlaced/betFailure` transitions.

Execution lessons:
- Persist BetMakers widget events in timestamp order so rejected/failed bet attempts are not lost when no downstream settlement appears.
- Treat provider-origin failure events as a distinct failure class from exchange rejects for post-trade attribution.

Contradiction noted:
- Prior simplification: provider integrations were modeled mostly as stateless request/response pipes around final bet outcomes. BetMakers documents an explicit evented lifecycle with actionable failure payloads.

### BetMakers bet payload semantics add settlement-state and product-lineage dimensions that should be explicit in normalization and replay

- [A/B] BetMakers `Bet Types` documentation defines status values including `processing`, `pending`, `unresulted`, `partially-refunded`, `paid`, `unsettled`, `rejected`, `failed`, `cancelled`, and `fully-refunded`.
- [A/B] The same page shows `odds` may be `null` for exotic products and includes a wide product taxonomy (`midtote`, `supertab`, `toptote`, `unitab`, `TBF`, `NSW`, and others).
- [A/B] Inference: result normalization and EV attribution need explicit provider status mapping and product-family dimensions; assuming one terminal settlement state or always-present odds will create deterministic accounting errors.

Extracted data fields to add:
- `provider_bet_status_contract_snapshot.capture_ts`
- `provider_bet_status_contract_snapshot.provider(betmakers)`
- `provider_bet_status_contract_snapshot.status_enum_json`
- `provider_bet_status_contract_snapshot.null_odds_allowed_flag`
- `provider_bet_status_contract_snapshot.product_enum_json`
- `provider_bet_lifecycle_event.event_ts`
- `provider_bet_lifecycle_event.bet_id`
- `provider_bet_lifecycle_event.status`
- `provider_bet_lifecycle_event.product`
- `provider_bet_lifecycle_event.odds_present_flag`
- `provider_bet_lifecycle_event.refund_state(none|partial|full)`

Model ideas:
- Add a `provider_refund_transition_risk` feature to separate true alpha decay from post-placement refund/cancel dynamics.
- Add a `product_family_fill_prior` feature by product code to avoid mixing tote-style and fixed-odds lifecycle behavior.

Execution lessons:
- Map provider statuses to canonical internal states (`accepted`, `pending_manual`, `partially_refunded`, `settled_paid`, `settled_void`, `rejected`, `failed`) before PnL aggregation.
- Keep `odds_present_flag` explicit so exotic bet records with null odds are handled by product-aware payout logic, not missing-data fallback.

Contradiction noted:
- Prior simplification: post-placement lifecycle was treated as mostly binary (`accepted` then `settled`). BetMakers exposes materially richer intermediate and refund states plus product-dependent odds semantics.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No net-new direct CAW-team proprietary model disclosures were identified this pass; strongest incremental signal is AU provider execution/settlement event-contract detail.
- [A] No net-new Betfair contract-state finding was added in this pass after duplicate-screening against prior Betfair notes.

## Source notes (incremental additions for pass 100)

- BetMakers Docs, `Events` (host/widget event taxonomy, bet placement/failure events, and failure payload schema; accessed 2026-04-02): https://docs.betmakers.com/docs/web/events/index.html
- BetMakers Docs, `Bet Types` (bet status enums, product taxonomy, and null-odds examples for exotics; accessed 2026-04-02): https://docs.betmakers.com/docs/web/bet_types/index.html

## Incremental sourced findings added in this run (2026-04-02, pass 101)

### CHRB governance surfaces now expose a recurring CAW-policy and ADW-fee decision stream that should be modeled as a live regime input

- [A] CHRB's `Meeting Agendas, Packages, and Transcripts` page includes dated board-agenda artifacts and lists a `January 14, 2026` item: `Review and possible action regarding ADW market access fees`.
- [A] CHRB's `Reports` page includes a dedicated `Questions and Answers Regarding Computer Assisted Wagering` report entry under official board-report outputs.
- [A/B] Inference: CAW operating constraints and ADW fee economics are being surfaced through a recurring board-governance channel, so policy-state ingestion should track agenda/report cadence instead of relying only on ad hoc press items.

Extracted data fields to add:
- `caw_policy_docket_snapshot.capture_ts`
- `caw_policy_docket_snapshot.regulator(chrb)`
- `caw_policy_docket_snapshot.page_type(meeting_agendas|reports)`
- `caw_policy_docket_snapshot.document_date`
- `caw_policy_docket_snapshot.document_title`
- `caw_policy_docket_snapshot.topic_flags(caw|adw_market_access_fees|other)`
- `caw_policy_docket_snapshot.action_language_present_flag`
- `caw_policy_docket_snapshot.source_url`

Model ideas:
- Add a `caw_policy_cycle_state` feature (`quiet|agenda_flagged|active_review|post_decision`) so late-pool behavior transfer is downweighted during active governance windows.
- Add an event-study around CHRB agenda/report publication timestamps to test whether late-odds volatility and pool-concentration metrics shift around policy-review milestones.

Execution lessons:
- Treat regulator agenda/report pages as first-class ingestion surfaces and persist immutable snapshots for replay.
- Separate `policy under review` from `policy enacted` states; strategy/risk controls should react differently to each.

Contradiction noted:
- Prior simplification: CAW-policy state was captured mainly from one-off releases, letters, and litigation filings. CHRB pages show an ongoing board-governance publication channel suitable for systematic regime tracking.

### BetMakers Core API result-source and transport contracts add separate lineage and protocol-risk dimensions for AU execution data

- [A/B] BetMakers Core API FAQ states Starting Price and Top Fluc in Core API are retrieved via `results(sources: ["OP"])`, indicating source-scoped result lineage rather than a single undifferentiated result feed.
- [A/B] The same FAQ states subscriptions are not currently throttled while GraphQL queries are throttled (`10` per second), creating asymmetric pressure between streaming and query catch-up paths.
- [A/B] The same FAQ states `graphql-transport-ws` is not currently supported, so integrations must continue to support the existing websocket protocol while preparing for future compatibility updates.
- [A/B] Inference: provider replay and reliability controls need explicit `result source`, `transport protocol`, and `channel pressure` state; assuming one canonical results source and one stable websocket standard can create silent join and reconnect failures.

Extracted data fields to add:
- `provider_result_source_snapshot.capture_ts`
- `provider_result_source_snapshot.provider(betmakers)`
- `provider_result_source_snapshot.metric_family(starting_price|top_fluc)`
- `provider_result_source_snapshot.required_result_source(OP)`
- `provider_result_source_snapshot.source_url`
- `provider_transport_contract_snapshot.capture_ts`
- `provider_transport_contract_snapshot.websocket_protocol(graphql_ws_legacy)`
- `provider_transport_contract_snapshot.graphql_transport_ws_supported_flag`
- `provider_transport_contract_snapshot.subscription_throttle_state(unthrottled)`
- `provider_transport_contract_snapshot.query_rate_limit_per_sec`

Model ideas:
- Add a `provider_result_source_confidence` feature that downweights result-derived labels when required source contracts are unknown or changed.
- Add a `provider_channel_pressure_state` feature combining stream/query load balance to predict stale-catchup risk.

Execution lessons:
- Persist result-source lineage (`OP`) in all SP/Top-Fluc derived records before joining into settlement/feature tables.
- Keep protocol-contract smoke tests in CI so websocket client upgrades fail closed if provider protocol support changes.

Contradiction noted:
- Prior simplification: provider results were treated as a single homogeneous surface and websocket protocol support as stable plumbing detail. Current FAQ contracts show source-scoped results and explicit protocol asymmetry.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass is governance/process-layer evolution (CHRB agenda/report publication channel and ADW-fee review visibility), not proprietary syndicate model disclosures.

## Source notes (incremental additions for pass 101)

- California Horse Racing Board, `Meeting Agendas, Packages, and Transcripts` (including `January 14, 2026` agenda item on ADW market access fees; accessed 2026-04-02): https://www.chrb.ca.gov/meeting_agendas.shtml
- California Horse Racing Board, `Reports` (includes `Questions and Answers Regarding Computer Assisted Wagering` board-report entry; accessed 2026-04-02): https://www.chrb.ca.gov/reports.html
- BetMakers Docs, `Core API FAQ` (result source `OP` for SP/Top Fluc, subscription/query throttling asymmetry, and websocket protocol support statement; accessed 2026-04-02): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental sourced findings added in this run (2026-04-02, pass 102)

### BetMakers GRN Reporting API defines hard upload-atomicity and reporting-window constraints that should be modeled as compliance-critical data contracts

- [A/B] BetMakers GRN Reporting `Introduction` states race reports must be uploaded after each race finalises and before the deadline: within `24 hours` of the last race of the day (local timezone of the wagering operator).
- [A/B] The same page defines strict batch constraints: single meeting + race per request, maximum `1,000` bets per batch, and all-or-nothing batch validity (any invalid bet rejects the entire batch).
- [A/B] The same page documents V1 (`/public/uploadRace`) and V2 (`/public/uploadRaceV2`) payload variants with explicit status enums (`Paid`, `Cancelled`, `FullRefund`, `Unresulted`, `Pending`, `PartialRefund`) and bet taxonomy (`win`, `place`, `multi`, `exacta`, `trifecta`, `quaddie`, `firstfour`, `quinella`, `dailydouble`).
- [A/B] Inference: reconciliation and compliance controls should treat GRN reporting as a separate correctness surface from execution, with deadline-state and batch-atomicity failure risk explicitly tracked.

Extracted data fields to add:
- `grn_upload_contract_snapshot.capture_ts`
- `grn_upload_contract_snapshot.max_bets_per_batch`
- `grn_upload_contract_snapshot.single_meeting_race_required_flag`
- `grn_upload_contract_snapshot.batch_atomic_reject_flag`
- `grn_upload_contract_snapshot.upload_deadline_hours_from_last_race`
- `grn_upload_contract_snapshot.endpoint_v1`
- `grn_upload_contract_snapshot.endpoint_v2`
- `grn_upload_attempt.event_ts`
- `grn_upload_attempt.meeting_id`
- `grn_upload_attempt.race_number`
- `grn_upload_attempt.bet_count`
- `grn_upload_attempt.valid_bet_count`
- `grn_upload_attempt.rejected_entire_batch_flag`
- `grn_upload_attempt.deadline_state(on_time|late|unknown)`

Model ideas:
- Add a `grn_deadline_breach_hazard` feature by jurisdiction/timezone and race-finalisation lag profile.
- Add a `batch_atomicity_failure_risk` feature to estimate probability of whole-batch rejection as bet count and payload heterogeneity increase.

Execution lessons:
- Split upload batches by risk profile (for example, by product/status complexity) to reduce correlated whole-batch rejection risk.
- Keep a deterministic requeue path for rejected batches that preserves original payload hashes for audit replay.

Contradiction noted:
- Prior simplification: reporting uploads were treated as operationally similar to generic append-style event ingestion. GRN docs show strict atomicity and per-race deadline constraints that create distinct failure modes.

### BetMakers Core API introduction + troubleshooting docs add concrete environment and reconnect constraints for provider-ingestion reliability

- [A/B] BetMakers Core API `Introduction` states INT test scope is restricted to Queensland gallop/greyhound/harness meetings plus VIC Tote prices, with query results capped at `4MB`.
- [A/B] The same source states test/UAT has dummy credentials while production requires OAuth.
- [A/B] BetMakers Core API `Troubleshoooting` states subscription disconnections can occur from cluster rebalancing, deployments, and network issues; recommended recovery is to requery latest race data and then re-establish subscriptions.
- [A/B] Inference: ingestion reliability needs environment-scoped contracts (`test` vs `prod`) and reconnect workflows that include query-backfill before stream resubscription.

Extracted data fields to add:
- `provider_environment_contract_snapshot.capture_ts`
- `provider_environment_contract_snapshot.provider(betmakers)`
- `provider_environment_contract_snapshot.environment(int|uat|prod)`
- `provider_environment_contract_snapshot.scope_constraints_json`
- `provider_environment_contract_snapshot.query_result_size_limit_mb`
- `provider_environment_contract_snapshot.auth_mode(dummy|oauth2)`
- `provider_reconnect_guidance_snapshot.capture_ts`
- `provider_reconnect_guidance_snapshot.disconnect_causes(cluster_rebalancing|deployment|network)`
- `provider_reconnect_guidance_snapshot.requery_before_resubscribe_required_flag`
- `provider_stream_recovery_event.event_ts`
- `provider_stream_recovery_event.backfill_query_run_flag`
- `provider_stream_recovery_event.resubscribe_success_flag`

Model ideas:
- Add an `environment_scope_mismatch_risk` feature to block portability assumptions from INT/UAT payload behavior into production.
- Add a `provider_recovery_path_quality` feature measuring reconnect success when backfill-query-first recovery is followed versus skipped.

Execution lessons:
- In replay and paper trading, label samples with provider environment scope so false confidence from narrowed test-universe distributions is avoided.
- Enforce reconnect runbook ordering (`query backfill` then `subscribe`) and alert when resubscribe occurs without a fresh backfill.

Contradiction noted:
- Prior simplification: provider stream reconnects were treated as transport-only retries. BetMakers troubleshooting guidance requires an explicit state-repair step (latest-query refresh) before subscription recovery.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] No net-new direct CAW-team proprietary model disclosures were identified this pass; strongest net-new signal is provider contract-state detail for reporting/upload integrity and reconnect reliability.

## Source notes (incremental additions for pass 102)

- BetMakers Docs, `GRN Reporting - Introduction` (upload deadline, batch constraints, endpoint variants, and field/status definitions; accessed 2026-04-02): https://docs.betmakers.com/docs/grnr/introduction/index.html
- BetMakers Docs, `Core API - Introduction` (INT test scope restrictions, 4MB query limit, UAT dummy credentials note; accessed 2026-04-02): https://docs.betmakers.com/docs/core-api/introduction/index.html
- BetMakers Docs, `Core API - Troubleshoooting` (subscription disconnect causes and requery-then-resubscribe guidance; accessed 2026-04-02): https://docs.betmakers.com/docs/core-api/troubleshooting/index.html

## Incremental sourced findings added in this run (2026-04-02, pass 103)

### CHRB CAW Q&A artifact adds directly usable handle-mix and tote-latency priors for late-odds modeling

- [A/B] The CHRB-linked 2024 CAW Q&A document states Santa Anita targets CAW at roughly 20% of total handle with a CAW win-rate guardrail around 90%, and reports a sample where CAW was about 17% of win pools but about 43% of money entering in the last 60 seconds.
- [A/B] The same artifact states tote timing mechanics: approximately 3-5 seconds to receive all win-pool data after stop-betting, then roughly 10-12 seconds average to calculate and update odds/will-pays (about 13-17 seconds from last accepted bet to known final odds), with possible extra third-party display delay.
- [A/B] The same source also states CAW cancellation is forbidden for Elite accounts and documents a 5+ bets/second threshold for CAW classification in the California track context.
- [B] Inference: late-odds movement should be decomposed into (i) late-money composition, (ii) tote computation latency, and (iii) display latency, rather than treated as one undifferentiated "CAW shock."

Extracted data fields to add:
- `caw_late_money_audit_snapshot.capture_ts`
- `caw_late_money_audit_snapshot.track_code`
- `caw_late_money_audit_snapshot.sample_window_desc`
- `caw_late_money_audit_snapshot.caw_pool_share_pct`
- `caw_late_money_audit_snapshot.caw_last_60s_share_pct`
- `caw_late_money_audit_snapshot.non_caw_last_60s_share_pct`
- `tote_latency_contract_snapshot.capture_ts`
- `tote_latency_contract_snapshot.stop_to_global_ingest_sec_low`
- `tote_latency_contract_snapshot.stop_to_global_ingest_sec_high`
- `tote_latency_contract_snapshot.compute_update_sec_low`
- `tote_latency_contract_snapshot.compute_update_sec_high`
- `tote_latency_contract_snapshot.final_odds_known_sec_low`
- `tote_latency_contract_snapshot.final_odds_known_sec_high`
- `caw_account_policy_snapshot.capture_ts`
- `caw_account_policy_snapshot.cancel_allowed_flag`
- `caw_account_policy_snapshot.caw_threshold_bets_per_sec`

Model ideas:
- Add a `late_money_mix_state` feature that separates CAW vs non-CAW final-minute inflows where available.
- Add a `tote_visibility_latency_state` feature so observed post-jump odds movement is interpreted as calculation/publication lag before being attributed to alpha.

Execution lessons:
- Use a two-clock representation for tote markets: `pool_close_clock` and `display_finalization_clock`.
- Keep CAW-policy and tote-latency priors venue-specific; do not generalize one jurisdiction's cadence globally.

Contradiction noted:
- Prior simplification: post-jump odds movement was treated mainly as last-second CAW behavior. The CHRB-linked Q&A adds concrete multi-stage latency mechanics and mixed-source late-money composition.

### Betfair stream support adds explicit non-linkability and subscription-scope failure modes that must be encoded in replay and live controls

- [A] Betfair support states OCM (order change) and MCM (market change) are produced by independent systems; message order between them is not guaranteed and no matching parameter is provided.
- [A] Betfair support states subscribing without a market filter causes all markets available to the app key to be published as they activate, each with a new-market `img=true` snapshot.
- [A] Betfair support states `con=true` can arise from client socket-buffer lag, explicit `conflateMs > 0`, or slow publishing cycles.
- [A] Betfair support also states sequencing should be handled by `clk`; while `pt` remains monotonic in delivery, `clk` is the ordering cursor.
- [A/B] Inference: execution attribution should not assume deterministic one-to-one OCM/MCM joins, and stream collectors need hard safeguards against unbounded subscription scope and backlog-induced conflation.

Extracted data fields to add:
- `stream_subscription_scope_audit.capture_ts`
- `stream_subscription_scope_audit.market_filter_present_flag`
- `stream_subscription_scope_audit.app_key_scope_market_count`
- `stream_subscription_scope_audit.new_market_img_events`
- `stream_update_conflation_event.event_ts`
- `stream_update_conflation_event.market_id`
- `stream_update_conflation_event.con_flag`
- `stream_update_conflation_event.client_buffer_backlog_flag`
- `stream_update_conflation_event.conflate_ms`
- `stream_update_conflation_event.publisher_slow_cycle_flag`
- `stream_message_cursor_event.event_ts`
- `stream_message_cursor_event.clk`
- `stream_message_cursor_event.pt`
- `stream_message_cursor_event.ocm_mcm_link_state(unlinked)`

Model ideas:
- Add a `stream_conflation_pressure` feature as a reliability covariate for short-horizon microstructure signals.
- Add an `ocm_mcm_alignment_confidence` feature that penalizes attribution paths requiring deterministic order-market message pairing.

Execution lessons:
- Enforce non-empty market filters in production stream subscriptions and fail closed on wildcard scope.
- Reconstruct state using `clk` cursor continuity; treat OCM/MCM correlations as probabilistic joins with explicit uncertainty.

Contradiction noted:
- Prior simplification: order and market stream events were treated as tightly pairable per underlying trigger. Betfair support explicitly denies guaranteed pairing and adds scope/conflation failure modes.

### Australian wholesaler channel now shows explicit mixed official-plus-proprietary packaging in one integration surface

- [B] BetMakers' June 20, 2025 wholesaler announcement states CoreAPI can expose official Racing Australia materials (nominations, acceptances, trials, results, form) alongside proprietary products such as Punting Form and Racelab.
- [B] The same announcement frames this packaging under the Racing Australia wholesaler framework effective 1 July 2025.
- [B] Inference: Australian provider integrations may combine regulated canonical materials and vendor-generated overlays in one API contract, so feature lineage must split "official rights chain" from "proprietary augmentation chain" at ingest time.

Extracted data fields to add:
- `provider_payload_lineage_snapshot.capture_ts`
- `provider_payload_lineage_snapshot.provider`
- `provider_payload_lineage_snapshot.channel(core_api|managed_trading_api)`
- `provider_payload_lineage_snapshot.material_class(official_ra|proprietary_overlay)`
- `provider_payload_lineage_snapshot.content_family(nominations|acceptances|trials|results|form|other)`
- `provider_payload_lineage_snapshot.proprietary_product_tag`
- `provider_payload_lineage_snapshot.wholesaler_framework_effective_from`

Model ideas:
- Add an `official_vs_overlay_dependence` feature family to quantify strategy sensitivity to proprietary layers versus canonical race materials.
- Run ablations requiring `official_ra_only` feature sets as a compliance-safe control benchmark.

Execution lessons:
- Persist feature lineage at field level when one payload mixes official and proprietary sections.
- Default baseline production models to an "official-materials-only reproducibility" mode unless overlay entitlement and provenance checks pass.

Contradiction noted:
- Prior simplification: provider rows were assumed to map to one homogeneous material class. Current wholesaler/channel evidence indicates mixed-content payloads on the same integration surface.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter or Alan Woods internals.
- [A/B] No net-new first-person technical disclosure was found this pass for David Walsh or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass is strongest in the CHRB-linked Q&A's quantitative handle/latency mechanics and policy-operation constraints, not proprietary syndicate model equations.

## Source notes (incremental additions for pass 103)

- California Horse Racing Board linked report, `Computer Assisted Wagering Question & Answer` (dated 2024-09-05; CAW handle-mix, late-money composition, tote latency and policy mechanics; accessed 2026-04-02): https://www.chrb.ca.gov/misc_docs/Computer_Assisted_Wagering.pdf
- Betfair support, `How can I match OCM and MCM messages from the Stream API?` (independent systems and no guaranteed match key; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000391312-How-can-I-match-OCM-and-MCM-messages-from-the-Stream-API
- Betfair support, `What happens if you subscribe to the Stream API without a market filter?` (wildcard publication scope and `img=true` on new markets; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Betfair support, `Why am I receiving "con= true" messages via the Stream API?` (conflation causes including socket backlog and `conflateMs`; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/10913019079452-Why-am-I-receiving-con-true-messages-via-the-Stream-API
- Betfair support, `Are Stream API messages guaranteed to be delivered in strict sequential order according to pt?` (`clk` sequencing guidance and `pt` delivery-order statement; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/25873962091420-Are-Stream-API-messages-guaranteed-to-be-delivered-in-strict-sequential-order-according-to-pt
- BetMakers, `BetMakers appointed Racing Australia data wholesaler` (official+proprietary packaging statement under 2025-07-01 framework; accessed 2026-04-02): https://betmakers.com/articles/betmakers-appointed-racing-australia-data-wholesaler

## Incremental sourced findings added in this run (2026-04-02, pass 104)

### Betfair stream access tier and transport protocol are hard execution-regime gates

- [A] Betfair support states Stream API is available via delayed app key by default, but delayed-key stream output is conflated into one message every 3 minutes for changes over the last 3 minutes.
- [A] The same support article states live trading use requires a Live App Key, plus verified and funded account state.
- [A] Betfair support states Stream API is not websocket-based; it uses SSL sockets with CRLF JSON protocol and websocket attempts are refused.
- [A/B] Inference: app-key tier is a first-class market-microstructure variable; delayed-key sessions should be treated as unsuitable for latency-sensitive execution, with data only suitable for slow analytics/replay.

Extracted data fields to add:
- `betfair_session_contract_snapshot.capture_ts`
- `betfair_session_contract_snapshot.app_key_tier(delayed|live)`
- `betfair_session_contract_snapshot.stream_transport(ssl_socket_crlf_json)`
- `betfair_session_contract_snapshot.websocket_allowed_flag`
- `betfair_session_contract_snapshot.delayed_conflation_window_sec`
- `betfair_session_contract_snapshot.live_key_required_for_trading_flag`
- `betfair_session_state.account_verified_flag`
- `betfair_session_state.account_funded_flag`
- `stream_message_observed.conflation_window_sec_estimate`

Model ideas:
- Add a `session_tier_latency_penalty` feature that downweights/blocks sub-minute microstructure signals in delayed-key sessions.
- Add a `transport_compatibility_state` feature to prevent false-positive reliability assumptions when client transport stack is websocket-native.

Execution lessons:
- Fail closed for live execution when app key is `delayed` or when account verification/funding prerequisites are unmet.
- Run a startup contract check that asserts SSL-socket mode and rejects websocket-only stream clients.

Contradiction noted:
- Prior simplification: stream data freshness was treated mostly as an internal collector tuning problem. Betfair access-tier contracts show freshness can be structurally capped at 3-minute conflation under delayed keys.

### Betfair stream cache and runner-removal behavior create explicit reconciliation gaps

- [A] Betfair support states closed markets are not immediately removed from stream subscription cache; eviction runs every 5 minutes and markets are marked for deletion after 1 hour closed.
- [A] Betfair support states runner-removal void/lapse transitions are not reflected in Order Stream for matched/unmatched bets on removed runners because those voids occur at settlement.
- [A] Betfair support states stream runner-change payloads are delta-based: `size=0` is remove semantics, `img=true` means replace cache image, and unchanged nullable values are omitted.
- [A/B] Inference: order/position state cannot rely on stream-only transitions around runner removals and market closures; settlement reconciliation must be a mandatory second channel.

Extracted data fields to add:
- `stream_market_cache_policy_snapshot.capture_ts`
- `stream_market_cache_policy_snapshot.closed_market_eviction_interval_min`
- `stream_market_cache_policy_snapshot.closed_market_delete_after_min`
- `order_stream_void_gap_snapshot.capture_ts`
- `order_stream_void_gap_snapshot.runner_removal_void_visible_flag`
- `runner_change_delta_event.event_ts`
- `runner_change_delta_event.market_id`
- `runner_change_delta_event.img_flag`
- `runner_change_delta_event.size_zero_remove_count`
- `runner_change_delta_event.nullable_omission_count`
- `settlement_reconciliation_event.event_ts`
- `settlement_reconciliation_event.runner_removal_adjustment_detected_flag`

Model ideas:
- Add a `settlement_transition_visibility_gap` feature to suppress overconfident post-race execution attribution when stream-level void transitions are known missing.
- Add a `cache_staleness_hysteresis` feature keyed to market-closure age and eviction-cycle boundaries.

Execution lessons:
- Keep closed markets in memory with explicit TTL semantics and do not assume immediate subscription-count relief.
- Always reconcile runner-removal impacts via settlement/current-orders snapshots, not Order Stream alone.

Contradiction noted:
- Prior simplification: stream/order feeds were treated as near-complete lifecycle truth. New support guidance confirms blind spots around runner-removal voids and delayed cache eviction.

### Racing Australia wholesaler media release upgrades provider-lineage evidence from vendor claim to principal statement

- [A] Racing Australia media release dated 19 June 2025 states RA stepped back from direct wholesaler role and appointed five authorized wholesalers for Australian Thoroughbred Racing Materials, commencing 1 July 2025.
- [A] The same release names the five wholesalers: BettorData, BetMakers, Mediality Racing, News Perform (Punters Paradise), and Racing and Sports.
- [A] The same release states all authorized wholesalers operate under the same terms and conditions under a Wholesaler Agreement and frames RA's role as compliance, transparency, and unauthorized-use identification.
- [A/B] Inference: provider-comparison and entitlement logic should treat wholesaler selection as a competitive implementation choice within a common RA framework, while preserving provider-specific transport/schema differences.

Extracted data fields to add:
- `ra_wholesaler_framework_snapshot.capture_ts`
- `ra_wholesaler_framework_snapshot.effective_from`
- `ra_wholesaler_framework_snapshot.ra_role(compliance)`
- `ra_wholesaler_framework_snapshot.equal_terms_flag`
- `ra_wholesaler_registry_snapshot.capture_ts`
- `ra_wholesaler_registry_snapshot.wholesaler_name`
- `ra_wholesaler_registry_snapshot.authorized_flag`
- `provider_contract_selection_event.event_ts`
- `provider_contract_selection_event.wholesaler_name`
- `provider_contract_selection_event.schema_diff_profile`

Model ideas:
- Add a `wholesaler_source_switch_risk` feature for drift detection when equivalent rights are delivered via non-equivalent schemas/latency envelopes.
- Add `multi_wholesaler_consensus_checks` for canonical fields (nominations, acceptances, results, form) where dual-source validation is possible.

Execution lessons:
- Separate rights-equivalence logic from feed-quality logic; equal contractual terms do not imply equal technical behavior.
- Keep an authorized-wholesaler snapshot history and reject ingest from non-listed counterparties by effective date.

Contradiction noted:
- Prior simplification: Australian wholesaler structure was represented mainly through vendor-authored announcements. Racing Australia's own release provides principal-level confirmation of framework scope, participants, and compliance posture.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team-adjacent signal this pass remains execution/governance mechanics (stream and rights infrastructure), not syndicate model formulas.

## Source notes (incremental additions for pass 104)

- Betfair support, `How do I get access to the Stream API?` (delayed-key 3-minute conflation; live-key/KYC-funded prerequisites; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/115003887871-How-do-I-get-access-to-the-Stream-API
- Betfair support, `Does the Stream API allow Web Socket connections?` (SSL sockets + CRLF JSON protocol and websocket refusal; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/12937897844252-Does-the-Stream-API-allow-Web-Socket-connections
- Betfair support, `Are closed markets auto-removed from the Stream API subscription?` (5-minute cache eviction job and 1-hour closed-market deletion marking; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/11741143435932-Are-closed-markets-auto-removed-from-the-Stream-API-subscription
- Betfair support, `How are void bets treated by the Stream API?` (runner-removal void transitions absent from Order Stream and handled at settlement; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360000391492-How-are-void-bets-treated-by-the-Stream-API
- Betfair support, `How to I handle runner changes with "size = 0"?` (delta-cache semantics for `size=0`, `img=true`, and nullable omissions; accessed 2026-04-02): https://support.developer.betfair.com/hc/en-us/articles/360004014071-How-to-I-handle-runner-changes-with-size-0
- Racing Australia, `Media Release: Racing Materials distribution - Wholesaler Agreement` (19 June 2025; RA compliance role, five authorized wholesalers, equal-term agreement, and 1 July 2025 commencement; accessed 2026-04-02): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf

## Incremental sourced findings added in this run (2026-04-02, pass 105)

### CHRB primary 2026 board artifacts add explicit market-access-fee trigger mechanics relevant to CAW economics

- [A] CHRB January 2026 meeting notice (dated 2026-01-02) includes an action item to amend previously approved modified distributions of ADW market-access fees for central and southern zones.
- [A] CHRB staff-analysis materials (March 2026 posting) describe a blended-takeout trigger where no transfer is made when blended takeout is below 15%, and describe transfer logic once that threshold is exceeded.
- [A] CHRB board transcript documents FY2025-26 board-support formula handling with corrected agreement text that 0.96% applies to 0.96 of ADW handle, reflecting concrete formula-implementation sensitivity.
- [A/B] Inference: CAW/pool-behavior studies that treat host-fee and market-access settings as static will miss important regime transitions; fee-trigger state should be modeled as dated policy variables.

Extracted data fields to add:
- `caw_fee_policy_snapshot.capture_ts`
- `caw_fee_policy_snapshot.regulator`
- `caw_fee_policy_snapshot.jurisdiction`
- `caw_fee_policy_snapshot.document_type(notice|staff_analysis|transcript)`
- `caw_fee_policy_snapshot.blended_takeout_trigger_pct`
- `caw_fee_policy_snapshot.transfer_enabled_below_trigger_flag`
- `caw_fee_policy_snapshot.transfer_formula_text_hash`
- `caw_fee_policy_snapshot.handle_application_factor`
- `caw_fee_policy_snapshot.effective_period_start`
- `caw_fee_policy_snapshot.effective_period_end`
- `caw_fee_policy_event.event_ts`
- `caw_fee_policy_event.event_kind(formula_correction|distribution_amendment|threshold_change)`

Model ideas:
- Add a `policy_fee_trigger_state` regime feature to late-liquidity and rebate-sensitivity models.
- Add an event-study feature set around board-policy publication/approval timestamps to detect structural breaks in late-money composition and turnover patterns.

Execution lessons:
- Treat board notices/staff analyses/transcripts as separate policy evidence layers and persist all three for auditable replay.
- Re-run historical attribution when formula-text corrections are published, because small wording changes can alter downstream fee arithmetic.

Contradiction noted:
- Prior simplification: CAW economics were often modeled with fixed host-fee assumptions. CHRB primary artifacts show thresholded and periodically amended formula logic.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW signal this pass is regulatory-economic mechanics (market-access fee thresholds/formula handling), not syndicate model internals.

## Source notes (incremental additions for pass 105)

- California Horse Racing Board, `JANUARY 2026 Notice of Meeting draft #9` (dated 2026-01-02; includes ADW market-access-fee distribution amendment action item; accessed 2026-04-02): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052679&SubCategory=
- California Horse Racing Board, staff-analysis material (March 2026 posting; includes blended-takeout trigger language for market-access-fee transfer logic; accessed 2026-04-02): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=MTGAGENDAITEMS&DocumentID=00052709&SubCategory=
- California Horse Racing Board, board transcript (`BOARDMTGTRANS`; includes FY2025-26 board-support formula correction language on 0.96%/0.96-of-handle; accessed 2026-04-02): https://www.chrb.ca.gov/DocumentRequestor2.aspx?Category=BOARDMTGTRANS&DocumentID=00052413&SubCategory=

## Incremental sourced findings added in this run (2026-04-02, pass 106)

### Betfair pre-off execution settings (BPE and SP) create hidden fill-regime variation that must be persisted for reproducible research

- [A] Betfair `Best Price Execution` documentation states that with BPE enabled, bets can be matched at improved odds if better prices are available or become available before matching.
- [A] The same document states if BPE is disabled and better odds are available, the bet request can lapse and requires resubmission.
- [A] The same document states BPE + MatchMe can match back bets at lower than requested odds (within thresholds), while BPE alone will not match at worse odds than requested.
- [A] Betfair SP documentation states projected SP surfaces (`Near Price` and `Far` odds), and that final SP is determined at event start from SP requests plus unmatched Exchange bets.
- [A] The same SP documentation states unmatched SP lay conversions below minimum liability (example threshold shown as GBP/EUR 10) cancel at the off rather than entering SP reconciliation.
- [A] Betfair matched/unmatched documentation states unmatched offers may lapse at market close/in-play transition and highlights that display refresh cadence can lag high-throughput server-side matching.
- [A/B] Inference: a large share of apparent signal/edge drift can be execution-policy drift (BPE toggle state, SP conversion rules, UI-to-server timing mismatch) rather than model drift.

Extracted data fields to add:
- `bet_execution_preference_snapshot.capture_ts`
- `bet_execution_preference_snapshot.bpe_enabled_flag`
- `bet_execution_preference_snapshot.matchme_enabled_flag`
- `bet_execution_preference_snapshot.matchme_scope(back_mobile_only_when_enabled)`
- `bet_execution_preference_snapshot.min_sp_lay_liability_ccy`
- `bet_execution_preference_snapshot.min_sp_lay_liability_value`
- `order_submission_context.event_ts`
- `order_submission_context.requested_price`
- `order_submission_context.matched_price`
- `order_submission_context.price_improved_flag`
- `order_submission_context.price_worsened_within_feature_threshold_flag`
- `order_submission_context.lapse_reason(better_price_available_bpe_off|market_closed|other)`
- `sp_projection_snapshot.event_ts`
- `sp_projection_snapshot.near_price`
- `sp_projection_snapshot.far_price`
- `sp_projection_snapshot.projected_sp`
- `ui_market_view_state.event_ts`
- `ui_market_view_state.refresh_interval_sec`
- `ui_market_view_state.server_throughput_notice_flag`

Model ideas:
- Add an `execution_setting_regime` feature to calibration/CLV attribution so runs are segmented by BPE/MatchMe/SP-conversion settings.
- Add a `sp_projection_disagreement` feature (`near_vs_far` spread and drift velocity) as a pre-off uncertainty proxy.
- Add a `lapse_hazard` model for unmatched orders conditioned on setting state and seconds-to-off.

Execution lessons:
- Persist account-level execution toggles and minimum-liability rules as first-class metadata in both simulation and live logs.
- Treat SP conversion path and fixed-price path as separate order types with distinct failure/lapse behavior.
- Avoid manual-screen timestamp assumptions in high-volatility windows; rely on exchange event clocks and explicit order-ack timing.

Contradiction noted:
- Prior simplification: pre-off fill quality was mostly attributed to liquidity/latency. Betfair docs show user/account execution settings and SP conversion constraints can materially alter fill outcomes even at identical market states.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new signal this pass is exchange microstructure and order-policy mechanics (BPE/SP/lapse pathways), not syndicate model internals.

## Source notes (incremental additions for pass 106)

- Betfair support, `Exchange: What is Best Price Execution?` (BPE improved-odds behavior, lapse behavior when off, and BPE+MatchMe caveat; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/a_id/404/
- Betfair support, `Starting Price (SP)` (near/far projected SP surfaces and minimum-liability cancellation behavior for SP lay conversion; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/a_id/421/
- Betfair support, `Exchange: What is the difference between matched and unmatched bets?` (unmatched lapse mechanics and display-refresh vs server-throughput caution; accessed 2026-04-02): https://support.betfair.com/app/answers/detail/a_id/401/

## Incremental sourced findings added in this run (2026-04-03, pass 107)

### Betfair live-key policy and price-surface semantics add new constraints for market-microstructure research design

- [A] Betfair support (updated 2026-03-06) states read-only use with a live application key is not permitted; users collecting data without intending to place bets should use a delayed key and can face live-key deactivation otherwise.
- [A] Betfair support states delayed-key development access is free, while live-key activation for betting carries a one-off GBP 299 fee and remains non-refundable.
- [A] Betfair support (updated 2026-03-27) states `EX_BEST_OFFERS_DISP` (virtual/display prices) is updated about 150 milliseconds after non-virtual prices.
- [A] Betfair support states in-play order submission delay usually ranges from 1 to 12 seconds and is exposed via `betDelay` in both `listMarketBook` and Stream market definition payloads.
- [A/B] Inference: any benchmark using virtual display ladders as "real-time top-of-book" without lag adjustment risks optimistic latency assumptions, and data-only collection workflows must use delayed-key governance by design.

Extracted data fields to add:
- `betfair_key_policy_snapshot.capture_ts`
- `betfair_key_policy_snapshot.live_key_read_only_permitted_flag`
- `betfair_key_policy_snapshot.live_key_deactivation_risk_flag`
- `betfair_key_policy_snapshot.delayed_key_recommended_for_data_collection_flag`
- `betfair_key_policy_snapshot.live_key_activation_fee_gbp`
- `market_surface_latency_snapshot.capture_ts`
- `market_surface_latency_snapshot.virtual_price_lag_ms`
- `market_surface_latency_snapshot.source_filter(ex_best_offers_disp|ex_best_offers)`
- `order_delay_state.event_ts`
- `order_delay_state.market_id`
- `order_delay_state.inplay_flag`
- `order_delay_state.bet_delay_sec`

Model ideas:
- Add a `virtual_surface_lag_adjusted_imbalance` feature that aligns displayed (virtual) and raw ladders on event clock before deriving microstructure signals.
- Add a `bet_delay_aware_fill_horizon` feature to suppress unrealistic in-play fill assumptions when `betDelay` is elevated.
- Add a `key_tier_research_mode` flag in experiment metadata so comparisons do not mix delayed-only and live-trade-capable sessions.

Execution lessons:
- Segment all signal and CLV reporting by `price_surface_type` (`virtual_display` vs `raw_non_virtual`) and by measured lag-adjustment policy.
- Treat delayed-key collection as a separate research lane; block live-execution promotion when session lineage indicates delayed-only collection.
- Budget for live-key activation and compliance as part of production readiness, not as an afterthought.

Contradiction noted:
- Prior simplification: app-key state was modeled mainly as an access prerequisite. New policy text and price-surface timing evidence show app-key type also changes what "current market" means operationally and legally.

### Australian provider entitlement granularity: Punting Form endpoints split personal-use developer access from modeller/commercial sectionals

- [A] Punting Form developer page states its developer API is available to Pro members and that API data is for personal use only.
- [A] Punting Form API reference states `MeetingSectionals` and `MeetingBenchmarks` endpoints are available to Modeller and commercial subscriptions and require token authentication.
- [A/B] Inference: provider capability mapping must be endpoint-level (not provider-level) because the same brand exposes materially different rights/feature surfaces by subscription class.

Extracted data fields to add:
- `provider_endpoint_entitlement_snapshot.capture_ts`
- `provider_endpoint_entitlement_snapshot.provider`
- `provider_endpoint_entitlement_snapshot.endpoint_path`
- `provider_endpoint_entitlement_snapshot.subscription_tier_required`
- `provider_endpoint_entitlement_snapshot.allowed_use_scope(personal|commercial)`
- `provider_endpoint_entitlement_snapshot.token_auth_required_flag`
- `provider_endpoint_entitlement_snapshot.feature_family(sectionals|benchmarks|form)`

Model ideas:
- Add `entitlement_tier_coverage_ratio` to measure feature availability drift when moving from research to production contracts.
- Add `endpoint_rights_gap_penalty` in model-selection so challengers relying on personal-use-only endpoints cannot auto-promote.

Execution lessons:
- Persist endpoint-level rights lineage alongside every feature to prevent accidental production dependence on personal-use tiers.
- Build fallback feature sets that exclude subscription-sensitive sectionals/benchmarks for fail-safe deployment.

Contradiction noted:
- Prior simplification: provider discussions were mostly at brand/product level. Endpoint-level entitlement differences are large enough to alter both feasibility and model feature sets.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-adjacent signal remains operational/policy structure (access-tier controls and odds-update micro-latency), not syndicate model internals.

## Source notes (incremental additions for pass 107)

- Betfair support, `What is read-only Betfair API access?` (updated 2026-03-06; live-key read-only prohibition and deactivation-risk guidance; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/25033076334748-What-is-read-only-Betfair-API-access
- Betfair support, `Are there any costs associated with API access?` (updated 2025-10-30; delayed-key free development access and GBP 299 live-key activation fee; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003864531-Are-there-any-costs-associated-with-API-access
- Betfair support, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; `EX_BEST_OFFERS_DISP` virtual stream update lag ~150ms; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Betfair support, `Why do you have a delay on placing bets on a market that is in-play` (updated 2025-08-20; in-play delay range and `betDelay` field locations; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- Punting Form, `Developer API` (Pro-member availability and personal-use-only restriction; accessed 2026-04-03): https://www.puntingform.com.au/developer/api/
- Punting Form docs, `Sectionals CSV` (Modeller/commercial entitlement and token auth; accessed 2026-04-03): https://docs.puntingform.com.au/reference/meetingsectionalscsv
- Punting Form docs, `Benchmarks` (Modeller/commercial entitlement and token auth; accessed 2026-04-03): https://docs.puntingform.com.au/reference/meetingbenchmarks

## Incremental sourced findings added in this run (2026-04-03, pass 108)

### Betfair off-time suspension failure logic adds a distinct void-vs-reprice regime that should be modeled explicitly in pre-off/in-play attribution

- [A] Betfair General Sports Betting Rules state that for horse racing/greyhound racing markets not scheduled to be turned in-play, if Betfair fails to suspend at the relevant time, bets matched after the official off time are void.
- [A] The same rules state that for markets scheduled to be turned in-play, if suspension fails at the off and the market is never turned in-play, bets after off are void (for horse racing, measured from official off time unless Betfair can establish pre-off placement).
- [A] The same rules state that if suspension fails at the off but market is turned in-play later, bets after off can stand but may be price-adjusted by Betfair to the correct time-of-bet price.
- [A/B] Inference: replay and live PnL attribution need a three-way post-off state (`void`, `stand_no_adjustment`, `stand_with_price_adjustment`) rather than binary settled/void assumptions.

Extracted data fields to add:
- `off_time_governance_event.event_ts`
- `off_time_governance_event.market_id`
- `off_time_governance_event.product_surface(sportsbook|fixed_odds)`
- `off_time_governance_event.scheduled_inplay_flag`
- `off_time_governance_event.official_off_time`
- `off_time_governance_event.suspend_missed_flag`
- `off_time_governance_event.late_inplay_turn_flag`
- `off_time_governance_event.post_off_outcome(void|stand|stand_price_adjusted)`
- `off_time_governance_event.betfair_price_adjustment_applied_flag`

Model ideas:
- Add `post_off_settlement_regime` as a first-class label in fill-quality and edge-attribution studies.
- Add `suspend_miss_exposure` features to estimate expected post-off adjustment/void risk by market type and seconds-to-off.

Execution lessons:
- Treat official-off-time alignment as mandatory metadata whenever any pre-off or in-play order is analyzed.
- Keep a dedicated adjustment ledger for any Betfair post-placement price correction so realized-vs-expected slippage remains auditable.

Contradiction noted:
- Prior simplification: late suspension errors were treated mostly as technical latency artifacts. Betfair rule text introduces a formal settlement-governance branch where outcomes can be voided or repriced.

### Racing Australia migration FAQ adds pre-cutover operational controls that should be encoded as planned-maintenance runbook states

- [A] Racing Australia migration FAQ states all core products/services were unavailable from `7:00 PM AEST, 7 July 2025` to `5:00 AM AEST, 8 July 2025`, including Secure FTP, XML services, and PRA-RA links.
- [A] The same FAQ instructs users to complete transactions before cutoff and be logged out by `6:55pm AEST`.
- [A] The same FAQ states post-cutover access behavior should remain unchanged (no credential/password changes), with issue reports requiring user/system/steps context and screenshots.
- [A/B] Inference: provider-maintenance controls should include an explicit `pre_cutover_logout_deadline` state and a structured `post_cutover_validation` checklist, not just an outage start/end window.

Extracted data fields to add:
- `provider_maintenance_window.capture_ts`
- `provider_maintenance_window.provider(ra)`
- `provider_maintenance_window.window_start_local`
- `provider_maintenance_window.window_end_local`
- `provider_maintenance_window.pre_cutover_logout_deadline_local`
- `provider_maintenance_window.affected_services_json`
- `provider_maintenance_window.post_cutover_login_change_expected_flag`
- `provider_incident_report_contract.required_fields_json`

Model ideas:
- Add `maintenance_cutover_proximity` as a hard filter in feature generation to avoid training on incomplete publication windows.
- Add `post_cutover_validation_pass_rate` as an ingestion health prior before enabling live execution paths.

Execution lessons:
- Schedule provider adapters to hard-stop writes and pollers before documented logout deadlines, not only at outage start.
- Enforce structured incident payload templates so provider escalations are reproducible and fast.

Contradiction noted:
- Prior simplification: planned maintenance was represented as a single downtime interval. Racing Australia operational guidance adds a separate pre-cutover control phase and post-cutover validation expectations.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal evidence this pass is concentrated in execution-governance and provider operations contracts, not syndicate model internals.

## Source notes (incremental additions for pass 108)

- Betfair support, `Sportsbook - General Sports Betting Rules` (off-time suspension miss logic, horse-racing official-off void boundary, and post-off price-adjustment clause; accessed 2026-04-03): https://support.betfair.com/app/answers/detail/a_id/10589/
- Racing Australia FAQ, `Racing Australia Systems Upgrade Oracle Cloud Infrastructure` (pre-cutover logout guidance, outage scope, and post-cutover behavior notes; accessed 2026-04-03): https://www.racingaustralia.horse/faq/Racing-Australia-Systems-Upgrade-Oracle-Cloud-Infrastructure.aspx

## Incremental sourced findings added in this run (2026-04-03, pass 109)

### Betfair Stream `status` contract clarifies that 503 periods are degradation states, not immediate reconnect triggers

- [A] Betfair's 2017 release note introducing Stream `status` states the field is present on every Market (`mcm`) and Order (`ocm`) change message, and is emitted on heartbeat messages as well.
- [A] The same note states `status=null` when stream data is up to date and `status=503` when stream data is unreliable due to increased push latency (not all changes reflected in real time).
- [A] Betfair explicitly states clients should not disconnect when `status=503`; once stream health recovers, latest updates are sent.
- [A/B] Inference: execution controls should switch to a degraded-risk mode during `status=503` windows rather than forcing reconnect loops that can worsen data loss and queue position.

Extracted data fields to add:
- `stream_status_event.event_ts`
- `stream_status_event.subscription_id`
- `stream_status_event.channel(order|market)`
- `stream_status_event.status_code(null|503|other)`
- `stream_status_event.message_type(change|heartbeat)`
- `stream_status_event.degraded_push_latency_flag`
- `stream_status_event.reconnect_forbidden_by_contract_flag`

Model ideas:
- Add `stream_degradation_exposure` as a feature counting `status=503` dwell time in the last N seconds before signal generation.
- Add `status_503_recovery_lag_ms` telemetry and test whether post-recovery windows show elevated microstructure instability.

Execution lessons:
- Treat `status=503` as a deterministic execution-risk state with stake haircut/signal masking before considering session restart.
- Keep per-subscription health state (not connection-global only), because status is contractually scoped at subscription message level.

Contradiction noted:
- Prior simplification: any stream-health anomaly should trigger reconnect. Betfair's release contract explicitly recommends staying connected during `status=503` and waiting for recovery updates.

### Australian wholesaler identity lineage: News Perform's rebrand to InForm predates current wholesaler naming

- [A/B] InForm's official media release (published 2025-03-26) states `News Perform` rebranded as `InForm` and launched `Inform Connect` and `Inform Media`.
- [A/B] The same release describes Inform Connect as a platform for racing-data management, content delivery, and trading operations.
- [A/B] Inference: Racing Australia wholesaler entries using `News Perform` should be treated as legal-name snapshots that may map to post-rebrand operating brands, so provider identity joins must be date-aware.

Extracted data fields to add:
- `provider_alias_timeline.capture_ts`
- `provider_alias_timeline.legal_name`
- `provider_alias_timeline.brand_name`
- `provider_alias_timeline.alias_effective_from`
- `provider_alias_timeline.alias_effective_to`
- `provider_alias_timeline.source_type(regulator_release|provider_release)`
- `provider_alias_timeline.confidence_tag(A|B|C)`

Model ideas:
- Add `provider_alias_confidence_penalty` to suppress auto-routing when contract name and feed brand mapping confidence is below threshold.

Execution lessons:
- Enforce canonical provider IDs in entitlement checks and route all legal/brand aliases through an effective-date mapping layer.
- Keep source-type confidence tagging (`regulator` vs `provider-authored`) on alias evidence to prevent overconfident entitlement assumptions.

Contradiction noted:
- Prior simplification: wholesaler naming in regulatory releases and product branding were effectively interchangeable. Rebrand chronology shows they can diverge for extended periods.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] No net-new primary methodological disclosure was identified in this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal additions this pass are operational/governance controls (Betfair stream degradation handling and AU provider identity lineage), not syndicate model internals.

## Source notes (incremental additions for pass 109)

- Betfair Exchange API release note, `New API Release - 20th July` (published 2017-07-20; Stream `status` semantics, `status=503` handling guidance, and per-subscription heartbeat/change-message behavior; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687957
- InForm media release, `News Perform Rebrands as InForm, Introducing Inform Connect and Inform Media` (published 2025-03-26; brand-transition timeline and product-surface description; accessed 2026-04-03): https://www.informsportsracing.com.au/media/news-perform-rebrands-as-inform/

## Incremental sourced findings added in this run (2026-04-03, pass 110)

### Betfair commercialization surface adds a licensing/permissioning regime that materially changes deployability assumptions

- [A] Betfair's `Which API Licence Do I Require?` (updated 2026-01-13) states API access requires a personal or corporate KYC-verified Betfair account and separates licensing paths into personal live-key use vs commercial licenses (Software Vendor, Betting Operator/Company Data, Odds Publisher).
- [A] Betfair Software Vendor pages (updated 2026-03-05 and 2026-03-16) state software distributed to Betfair customers requires vendor licensing/security certification and applies a `GBP 999` license fee once submitted for security certification.
- [A] Betfair's `Is there an API testbed available?` (updated 2025-10-30) states there is no testbed allowing API testing without real funds and directs functional testing to delayed app keys.
- [A] Betfair's CORS support article (updated 2025-10-30) states API CORS requests are not allowed.
- [A] Betfair Vendor Services documentation states subscription permissioning is available only to licensed/certified vendors, requires server-to-server token handling, and excludes some operations (for example `Navigation Data for Applications`, `getAccountStatement`, `Logout`) from Vendor Web API.
- [B] Inference: an execution system can be technically valid yet still non-deployable/compliance-invalid unless licensing class, app-distribution mode, and vendor permissioning contracts are modeled as first-class runtime gates.

Extracted data fields to add:
- `betfair_license_policy_snapshot.capture_ts`
- `betfair_license_policy_snapshot.kyc_required_flag`
- `betfair_license_policy_snapshot.license_path(personal|software_vendor|betting_operator_company_data|odds_publisher)`
- `betfair_license_policy_snapshot.vendor_security_cert_required_flag`
- `betfair_license_policy_snapshot.vendor_license_fee_gbp`
- `betfair_license_policy_snapshot.testbed_available_without_real_funds_flag`
- `betfair_license_policy_snapshot.cors_allowed_flag`
- `vendor_permission_contract_snapshot.capture_ts`
- `vendor_permission_contract_snapshot.server_to_server_token_required_flag`
- `vendor_permission_contract_snapshot.session_expiry_min_minutes`
- `vendor_permission_contract_snapshot.session_expiry_default_hours`
- `vendor_permission_contract_snapshot.web_api_blocked_operations_json`

Model ideas:
- Add `deployability_gate_state` as a hard eligibility label in experiment tracking (`research_only`, `paper_trade_only`, `distribution_eligible`).
- Add `license_mode_mismatch_flag` to block model promotion when run lineage (personal app key) conflicts with intended distribution path (vendor/commercial).

Execution lessons:
- Treat licensing and vendor-permissioning contracts as production prerequisites, not legal afterthoughts.
- Keep web-client architecture server-mediated for all Betfair calls; direct browser CORS execution is unsupported by contract.
- Use delayed-key runs only for functional validation and avoid assuming testbed-like safety semantics.

Contradiction noted:
- Prior simplification: production-readiness was largely framed as model quality + exchange microstructure correctness. New Betfair licensing/vendor controls show deployability is additionally constrained by KYC class, distribution intent, and server-side permissioning contracts.

### Racing Australia monthly KPI publication lag remains open as of 2026-04-03 (latest listed month still January 2026)

- [A] Racing Australia's Monthly Service Standard Performance Report index (captured 2026-04-03) lists `January 2026` as the latest entry under `2025-2026`, with no February/March entry visible.
- [B] Inference: provider-health monitoring should track publication-lag duration itself as a reliability signal; absence of newer monthly artifacts is a measurable data-freshness risk for operational assumptions.

Extracted data fields to add:
- `provider_report_publication_lag_snapshot.capture_ts`
- `provider_report_publication_lag_snapshot.provider`
- `provider_report_publication_lag_snapshot.report_family`
- `provider_report_publication_lag_snapshot.latest_report_month`
- `provider_report_publication_lag_snapshot.latest_report_year`
- `provider_report_publication_lag_snapshot.days_since_month_end`
- `provider_report_publication_lag_snapshot.missing_expected_months_count`

Model ideas:
- Add `provider_publication_lag_days` as a prior in ingestion-confidence scoring and fallback-source routing.

Execution lessons:
- Escalate stale monthly KPI publication as a soft operational risk signal even when uptime pages are nominal.

Contradiction noted:
- Prior simplification: monthly KPI publication cadence was treated as roughly contemporaneous. As of 2026-04-03, the index still lags by at least one reporting month.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-adjacent signal in this pass is deployment-governance structure (licensing/permissioning), not new syndicate model internals.

## Source notes (incremental additions for pass 110)

- Betfair support, `Which API Licence Do I Require?` (updated 2026-01-13; KYC requirement and commercial-license path taxonomy; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002464152-Which-API-Licence-Do-I-Require
- Betfair support, `What is a Software Vendor?` (updated 2026-03-05; vendor rights, App Directory promotion scope, and GBP 999 fee statement; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002190692-What-is-a-Software-Vendor
- Betfair support, `How do I become a Software Vendor?` (updated 2026-03-05; software vendor licensing/security-certification flow and GBP 999 fee statement; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360000391912-How-do-I-become-a-Software-Vendor
- Betfair support, `Do Software Vendors have to pay to access the Betfair API?` (updated 2026-03-16; delayed-key development posture and GBP 999 security-certification fee statement; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002190732-Do-Software-Vendors-have-to-pay-to-access-the-Betfair-API
- Betfair support, `Is there an API testbed available?` (updated 2025-10-30; no no-funds API testbed and delayed-key testing guidance; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003886111-Is-there-an-API-testbed-available
- Betfair support, `Does the Betfair API support CORS?` (updated 2025-10-30; CORS not permitted; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/9746660402332-Does-the-Betfair-API-support-CORS
- Betfair Exchange API docs, `Vendor Services API` (licensed-vendor permissioning, server-to-server token requirement, and Vendor Web API operation constraints; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687938/Vendor%2BServices%2BAPI
- Racing Australia, `Monthly Service Standard Performance Report` index (captured 2026-04-03; latest visible 2025-2026 month remains January 2026): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental sourced findings added in this run (2026-04-03, pass 111)

### HKJC outbound commingling page adds explicit pool payout and reserve-deduction arithmetic not previously captured

- [A] HKJC's commingling-pools page states designated France PMU outbound Win/Place pools pay out `84.95%` of pool dividends, with an additional `0.1699%` pool deduction labeled `Overseas Jackpot Reserve Deduction`.
- [A] The same page states PMU-modified rules apply for those outbound pools.
- [A/B] Inference: cross-jurisdiction tote comparisons and CAW-impact analysis should normalize on `effective_pool_payout_pct` and `reserve_deduction_pct`, not only nominal takeout or rebate flags.

Extracted data fields to add:
- `commingled_pool_economics_snapshot.capture_ts`
- `commingled_pool_economics_snapshot.venue(HKJC)`
- `commingled_pool_economics_snapshot.partner_pool_operator(PMU)`
- `commingled_pool_economics_snapshot.bet_type(win|place|other)`
- `commingled_pool_economics_snapshot.pool_payout_pct`
- `commingled_pool_economics_snapshot.reserve_deduction_pct`
- `commingled_pool_economics_snapshot.rebate_applicable_flag`
- `commingled_pool_economics_snapshot.partner_rulebook_applies_flag`
- `commingled_pool_economics_snapshot.collection_window_days`

Model ideas:
- Add `effective_pool_return_pct` features so tote-value priors use net payout economics under the active pool regime.
- Add `rulebook_switch_penalty` when training windows cross pool-rulebook changes (for example HKJC-native to PMU-rulebook pools).

Execution lessons:
- Store payout and reserve deductions as first-class parameters in expected-value calculators; do not treat commingled pools as equivalent to local-pool rake settings.
- Keep pool-level rulebook metadata in replay and PnL attribution to avoid false regressions after commingling-configuration changes.

Contradiction noted:
- Prior simplification: commingling regime modeling focused mainly on rebate applicability and partner identity. New HKJC page detail adds explicit payout and reserve-deduction arithmetic that can materially change edge calculations.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal delta is pool-economics microstructure detail (payout plus reserve deduction) in HKJC commingling documentation.

## Source notes (incremental additions for pass 111)

- Hong Kong Jockey Club, `Commingling Pools` (PMU outbound pool payout percentage, overseas jackpot reserve deduction, and rulebook context; accessed 2026-04-03): https://special.hkjc.com/e-win/en-US/betting-info/racing/beginners-guide/commingling-pools/

## Incremental sourced findings added in this run (2026-04-03, pass 112)

### Betfair SP reconciliation mechanics add explicit pre-off imbalance and conversion rules not yet captured in our execution model

- [A] Betfair's Starting Price (SP) help contract states SP is computed at the off by balancing SP backers/layers and unmatched Exchange bets, with projected `Near Price` and `Far Price` surfaces available pre-off.
- [A] The same source states unmatched lay bets with liability below `£10` at the off are cancelled and excluded from SP reconciliation.
- [A] The same source provides deterministic display conventions for no-limit SP intent (`1.01` for SP back and `1000` for SP lay in the traded-table context).
- [A/B] Inference: our off-time microstructure model should treat SP projected-price spread and low-liability conversion attrition as first-class features when estimating final off-price drift and fill certainty.

Extracted data fields to add:
- `sp_projection_snapshot.capture_ts`
- `sp_projection_snapshot.market_id`
- `sp_projection_snapshot.selection_id`
- `sp_projection_snapshot.near_price`
- `sp_projection_snapshot.far_price`
- `sp_projection_snapshot.near_far_spread`
- `sp_projection_snapshot.sp_back_stakes_visible`
- `sp_projection_snapshot.sp_lay_liabilities_visible`
- `sp_projection_snapshot.no_limit_sp_back_flag`
- `sp_projection_snapshot.no_limit_sp_lay_flag`
- `sp_reconciliation_rule.min_lay_liability_gbp`
- `sp_reconciliation_event.low_liability_lapse_flag`

Model ideas:
- Add `near_far_spread` and `sp_back_vs_lay_imbalance` features in the final 120 seconds to post for off-price jump prediction.
- Add a conversion-attrition prior that discounts projected SP lay liquidity below minimum-liability thresholds.

Execution lessons:
- Do not treat all unmatched lay volume marked `Take SP` as convertible at suspend; apply minimum-liability filtering before liquidity estimates.
- Persist both projected and realized SP states so pre-off signal quality can be calibrated against actual reconciliation outcomes.

Contradiction noted:
- Prior simplification: unmatched intent marked `Take SP` was treated as broadly convertible. Betfair's explicit minimum-liability rule shows a deterministic cancellation branch at the off.

### Racing Australia wholesaler restructure plus provider capability docs add a clearer AU data-procurement topology

- [A] Racing Australia media release (2025-06-19) states a new wholesaler structure commencing `1 July 2025`, with Racing Australia stepping back as wholesaler and appointing five authorised wholesalers: BettorData, BetMakers, Mediality Racing, News Perform (Punters Paradise), and Racing and Sports.
- [A] The same release states authorised wholesalers operate under the same Wholesaler Agreement terms with Racing Australia.
- [A] BetMakers Core API FAQ states GraphQL subscriptions validate token state at subscription start, tokens are valid for `1 hour`, and disconnected subscriptions require token refresh only when token validity has expired.
- [A] Punting Form sectionals documentation states raw sectional times are captured for `92%+` of races since 2012 (with wides captured since 2014), giving explicit historical-depth priors for coverage modeling.
- [A/B] Inference: AU provider planning should be modeled as wholesaler-level contracting plus endpoint-level capability/SLA differences, not as a single monolithic "Racing Australia feed" decision.

Extracted data fields to add:
- `wholesaler_agreement_snapshot.capture_ts`
- `wholesaler_agreement_snapshot.effective_from`
- `wholesaler_agreement_snapshot.wholesaler_name`
- `wholesaler_agreement_snapshot.ra_wholesaler_role_active_flag`
- `provider_capability_snapshot.provider`
- `provider_capability_snapshot.endpoint_family`
- `provider_capability_snapshot.auth_model`
- `provider_capability_snapshot.token_ttl_sec`
- `provider_capability_snapshot.subscription_reauth_required_on_disconnect_flag`
- `provider_history_coverage_snapshot.provider`
- `provider_history_coverage_snapshot.data_family(sectionals|wides)`
- `provider_history_coverage_snapshot.coverage_start_year`
- `provider_history_coverage_snapshot.coverage_ratio_pct`

Model ideas:
- Add provider-coverage confidence weights so historical-feature reliability is explicitly downweighted when sectional completeness is below threshold.
- Add a wholesaler-diversification penalty in production routing when multiple critical feature families depend on a single wholesaler contract.

Execution lessons:
- Build entitlement checks at wholesaler-contract and endpoint-token layers; both can invalidate production ingestion independently.
- Version provider capability snapshots so replay and incident diagnostics use the correct token/subscription semantics by date.

Contradiction noted:
- Prior simplification: Racing Australia itself remained the practical wholesaler anchor. The 2025-07-01 structure moves distribution to appointed wholesalers and changes procurement/control points.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal additions in this pass are market-microstructure reconciliation mechanics (SP) and Australian provider topology/coverage evidence.

## Source notes (incremental additions for pass 112)

- Betfair support, `Starting Price (SP)` (SP reconciliation framing, near/far projection surfaces, and minimum SP lay liability cancellation behavior; accessed 2026-04-03): https://support.betfair.com/app/answers/detail/a_id/421/
- Racing Australia media release, `Racing Materials distribution - Wholesaler Agreement` (published 2025-06-19; appointed wholesaler list, compliance-role shift, and 2025-07-01 commencement; accessed 2026-04-03): https://www.racingaustralia.horse/uploadimg/media-releases/Racing-Materials-distribution-Wholesaler-Agreement.pdf
- BetMakers docs, `FAQ` (GraphQL token validity/subscription restart behavior; accessed 2026-04-03): https://docs.betmakers.com/docs/core-api/faq/index.html
- Punting Form docs, `Sectional Data` (sectional/wide coverage depth statements and update metadata; accessed 2026-04-03): https://docs.puntingform.com.au/docs/sectional-data

## Incremental sourced findings added in this run (2026-04-03, pass 113)

### Racing NSW 2025-26 marked-up standard conditions expose deterministic threshold-allocation mechanics that tighten fee-simulation constraints

- [A] Racing NSW's marked-up 2025-26 standard conditions (effective 2025-07-01) encode a strict Exempt Turnover allocation waterfall across turnover categories (Standard non-TDO -> Premium non-TDO -> Standard TDO -> Premier non-TDO -> Premium TDO -> Premier TDO), rather than allowing arbitrary operator-selected allocation.
- [A] The same contract states related operators share one group-level exempt threshold benefit (not one per entity), and Racing NSW may re-allocate threshold entitlement when related-entity membership changes intra-period.
- [A] The same contract provides explicit Appendix A worked examples (including multi-entity group allocation) that operationalize clause behavior for audit-grade fee reconstruction.
- [A/B] Inference: fee backtests that optimize threshold allocation heuristically (or entity-by-entity) will overstate edge; simulation must replay clause-ordered allocation and relationship-state transitions by effective date.

Extracted data fields to add:
- `nsw_fee_threshold_allocation_rule_snapshot.capture_ts`
- `nsw_fee_threshold_allocation_rule_snapshot.effective_from`
- `nsw_fee_threshold_allocation_rule_snapshot.allocation_order_json`
- `nsw_fee_threshold_allocation_rule_snapshot.group_shared_threshold_flag`
- `nsw_related_operator_membership_event.event_ts`
- `nsw_related_operator_membership_event.group_id`
- `nsw_related_operator_membership_event.members_json`
- `nsw_related_operator_membership_event.reallocation_trigger_flag`
- `nsw_fee_worked_example_snapshot.example_id`
- `nsw_fee_worked_example_snapshot.input_turnover_by_bucket_json`
- `nsw_fee_worked_example_snapshot.threshold_allocation_by_entity_json`
- `nsw_fee_worked_example_snapshot.source_appendix_ref`

Model ideas:
- Add a `policy_constrained_fee_drag` feature computed from clause-ordered threshold allocation rather than unconstrained fee-minimization heuristics.
- Add a `related_entity_reallocation_risk` prior to downweight backtest windows spanning likely group-membership changes.

Execution lessons:
- Treat fee computation as a policy-engine replay problem with effective-dated group membership, not a static percentage table.
- Store worked-example snapshots as regression fixtures for compliance-safe fee engine tests.

Contradiction noted:
- Prior simplification: exempt-threshold treatment could be approximated by aggregate totals and simple class-rate tables. The marked-up 2025-26 contract adds deterministic bucket-order and group-reallocation behavior that materially changes payable-fee paths.

### Source-integrity note: marked-up legal artifacts require canonical clean-version pairing for deterministic parsing

- [A] The Racing NSW marked-up PDF includes visible redline/numbering artifacts (for example malformed year strings and duplicated clause-label transitions) while still carrying operative clause content.
- [A/B] Inference: parser pipelines should not treat marked-up legal PDFs as canonical machine-contract sources without paired clean-version validation.

Extracted data fields to add:
- `policy_artifact_quality_snapshot.capture_ts`
- `policy_artifact_quality_snapshot.source_url`
- `policy_artifact_quality_snapshot.artifact_type(clean|marked_up|unknown)`
- `policy_artifact_quality_snapshot.parsing_risk_tag(low|medium|high)`
- `policy_artifact_quality_snapshot.clean_pair_url`

Model ideas:
- Add `policy_artifact_quality_penalty` in entitlement/fee confidence scoring when only marked-up artifacts are available.

Execution lessons:
- Maintain a two-source policy-ingest rule (`marked-up + clean`) before promoting rule changes to production fee engines.

Contradiction noted:
- Prior simplification: policy documents were treated as uniformly parse-stable once sourced from official pages. Marked-up legal artifacts introduce non-trivial parser ambiguity risk.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal additions this pass are Australian fee-policy mechanics and policy-artifact parsing controls, not syndicate model internals.

## Source notes (incremental additions for pass 113)

- Racing NSW, `Race Fields SC 2025-26 Marked Up Version Effective 1 July 2025` (clause-ordered exempt-threshold allocation, related-group allocation/reallocation mechanics, and worked examples; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Race-Fields-SC-2025-26-Marked-Up-Version-Effective-1-July-2025.pdf

## Incremental sourced findings added in this run (2026-04-03, pass 114)

### Betfair microstructure contract now has explicit virtual-lag and request-weight arithmetic that should be encoded in replay

- [A] Betfair's market-data matrix states `EX_BEST_OFFERS_DISP` (virtual prices) updates are about `150 ms` behind non-virtual prices.
- [A] Betfair support states website/API divergence is deterministic when API calls omit `virtualise=true`, when delayed keys are used (`1-180` second variable delay), or when website stake rollup differs from API defaults.
- [A] Betfair support request-limit documentation states request load is constrained by `sum(weight) * number_of_marketIds <= 200` per request, with `exBestOffersOverrides` weight scaled by `weight * (requestedDepth/3)`.
- [A] Betfair in-play guidance states order placement delay is typically `1-12` seconds and is explicitly surfaced as `betDelay` in both `listMarketBook` and stream market definition payloads.
- [A/B] Inference: training/execution parity requires carrying `virtual-vs-non-virtual` and `rollup` context as first-class features; otherwise CLV and fill models can be systematically mismeasured near post.

Extracted data fields to add:
- `betfair_price_view_snapshot.capture_ts`
- `betfair_price_view_snapshot.market_id`
- `betfair_price_view_snapshot.selection_id`
- `betfair_price_view_snapshot.price_view_type(non_virtual|virtual_displayed)`
- `betfair_price_view_snapshot.virtual_lag_ms_assumption`
- `betfair_price_view_snapshot.rollup_model`
- `betfair_price_view_snapshot.rollup_limit`
- `betfair_request_budget_snapshot.capture_ts`
- `betfair_request_budget_snapshot.operation`
- `betfair_request_budget_snapshot.weight_per_market`
- `betfair_request_budget_snapshot.market_count`
- `betfair_request_budget_snapshot.total_weight_points`
- `betfair_request_budget_snapshot.requested_depth`
- `betfair_request_budget_snapshot.exbestoffersoverride_multiplier`
- `betfair_execution_delay_snapshot.market_id`
- `betfair_execution_delay_snapshot.bet_delay_sec`
- `betfair_execution_delay_snapshot.inplay_flag`

Model ideas:
- Add `virtual_nonvirtual_gap` and `rollup_stake_context` features in late-window drift/fill models.
- Add `request_budget_pressure` as a collector-quality feature when deriving confidence in last-minute ladder completeness.

Execution lessons:
- Persist both raw and displayed/virtualised ladders and annotate each model inference with view context.
- Fail safe when projected polling plan breaches `200` weighted points per request; otherwise freshness assumptions are invalid.

Contradiction noted:
- Prior simplification: virtualised and non-virtual ladders were treated as near-equivalent snapshots. Current Betfair support/docs add explicit timing and rollup mechanics that can create stable measurement bias.

### NYRA's 2026 CAW policy creates a concrete high-frequency threshold/cutoff template for late-pool regime features

- [A] NYRA announced on `2026-01-30` that from `2026-02-05` CAW activity must stop at `1 minute to post` in pools not already under high-speed restrictions.
- [A] The same source defines CAW activity as wagering speed above `6 bets per second`.
- [A] NYRA also states the prior win-pool rule remains (CAW barred later than `2 minutes to post`) and that Late Pick 5/Pick 6 remain retail-only wagers.
- [A/B] Inference: we can use explicit `speed-threshold + cutoff-window + pool-scope` triples as portable schema primitives for CAW-regime modeling, even when jurisdictional rules differ.

Extracted data fields to add:
- `caw_policy_snapshot.capture_ts`
- `caw_policy_snapshot.operator`
- `caw_policy_snapshot.effective_from`
- `caw_policy_snapshot.caw_speed_threshold_bets_per_sec`
- `caw_policy_snapshot.cutoff_sec_to_post`
- `caw_policy_snapshot.pool_scope_json`
- `caw_policy_snapshot.retail_only_pool_list_json`
- `caw_policy_snapshot.source_announcement_url`

Model ideas:
- Add `caw_cutoff_window_sec` and `caw_speed_threshold` policy features to late-odds volatility priors.
- Build transfer-learning experiments where NYRA regime-change windows are used to stress-test volatility controls before AU deployment.

Execution lessons:
- Treat CAW policy shifts as deterministic market-regime events and replay them with exact effective dates.
- Segment CLV and slippage metrics by `policy_epoch_id`, not just by venue/date.

Contradiction noted:
- Prior simplification: CAW intensity was modeled as an implicit liquidity pattern. NYRA now publishes explicit operational thresholds that should be represented directly.

### Australian provider operations: SNS entitlement boundary and systems-status channel add concrete reliability/compliance signals

- [A] Racing Australia's SNS login page explicitly defines SNS as the national race-fields/form/results system and restricts access to authorized PRA/race-club personnel for work purposes.
- [A] The same page publishes support windows (weekday/weekend/holiday schedules), enabling deterministic incident-escalation SLAs in operations runbooks.
- [A] Racing Australia's systems-status site states it is independent of core RA IT systems and is intended to remain updateable during major outages.
- [A] The status site includes module-level planned outage notices for SNS subsystems (for example Acceptances, Reports, Licensing, StableAssist modules), which can be harvested into ingestion risk calendars.
- [A] BetMakers GRN Reporting API docs define operational upload constraints: race-level batch uploads, `<=1000` bets per request, all-or-none batch validation, OAuth2 client-credentials flow, and upload deadline within `24 hours` of the last local race of the day.
- [A/B] Inference: AU provider reliability should be modeled as both entitlement and operations discipline (support windows, outage advisories, reporting deadlines), not just feed-level schema quality.

Extracted data fields to add:
- `ra_sns_access_policy_snapshot.capture_ts`
- `ra_sns_access_policy_snapshot.authorized_personnel_only_flag`
- `ra_sns_access_policy_snapshot.personal_or_commercial_reshare_prohibited_flag`
- `ra_sns_support_window_snapshot.capture_ts`
- `ra_sns_support_window_snapshot.day_type`
- `ra_sns_support_window_snapshot.support_start_local`
- `ra_sns_support_window_snapshot.support_end_local`
- `ra_system_status_event.capture_ts`
- `ra_system_status_event.event_type(planned|unplanned)`
- `ra_system_status_event.affected_modules_json`
- `ra_system_status_event.outage_window_start_local`
- `ra_system_status_event.outage_window_end_local`
- `ra_system_status_event.status_site_independent_flag`
- `betmakers_grn_contract_snapshot.capture_ts`
- `betmakers_grn_contract_snapshot.upload_deadline_hours_from_last_race`
- `betmakers_grn_contract_snapshot.max_bets_per_batch`
- `betmakers_grn_contract_snapshot.single_meeting_race_per_request_flag`
- `betmakers_grn_contract_snapshot.batch_atomicity_flag`
- `betmakers_grn_contract_snapshot.auth_flow(client_credentials_oauth2)`

Model ideas:
- Add a `provider_operational_reliability_score` combining outage-calendar density, support-window coverage, and reporting-deadline breach history.
- Add `reporting_deadline_risk` as a compliance prior when selecting provider mixes for regulated production channels.

Execution lessons:
- Join planned outage calendars into data collector scheduling to avoid false alert storms and stale-feature contamination.
- Enforce GRN upload pre-validation (batch size and atomicity constraints) before dispatch to avoid avoidable compliance failures.

Contradiction noted:
- Prior simplification: provider choice emphasized feature depth and entitlement only. New primary docs show that operational windows/status channels/reporting deadlines materially affect production viability.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A] Net-new CAW-team signal this pass is a primary-policy threshold from NYRA (`>6 bets/sec`, explicit cutoff windows/pool scope), useful for regime-feature design.

## Source notes (incremental additions for pass 114)

- Betfair support, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; virtual stream timing, ladder/filter mapping, and SP projection references; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Betfair support, `Why are the prices displayed on the website different from what I see in my API application?` (updated 2025-08-20; virtualise behavior, delayed/live divergence, and rollup model details; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003878512-Why-are-the-prices-displayed-on-the-website-different-from-what-I-see-in-my-API-application
- Betfair support, `What data/request limits exist on the Exchange API?` (updated 2025-09-09; 200-point request budget formula and depth-scaling note; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003864671-What-data-request-limits-exist-on-the-Exchange-API
- Betfair support, `Why do you have a delay on placing bets on a market that is 'in-play'` (updated 2025-08-20; 1-12 second in-play delay and `betDelay` fields; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- NYRA, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; effective date, speed threshold, and pool-policy scope; accessed 2026-04-03): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Racing Australia, `SNS Login` (national SNS scope, authorized-access restrictions, and support-window schedule; accessed 2026-04-03): https://racingaustralia.horse/IndustryLogin/SNS_Login.aspx
- Racing Australia, `Systems Status Updates` (independent status channel statement and module-level outage notices; accessed 2026-04-03): https://racingaustraliasystemsstatus.horse/
- BetMakers docs, `GRN Reporting API Introduction` (upload deadline/size constraints, atomic batch behavior, and OAuth2 flow; accessed 2026-04-03): https://docs.betmakers.com/docs/grnr/introduction/index.html

## Incremental sourced findings added in this run (2026-04-03, pass 115)

### Racing Victoria's approved-WSP registry now exposes a fourth counterparty class (`Interstate Oncourse Bookmakers`) that should be modeled separately

- [A] Racing Victoria's approved WSP page now structures counterparties into at least four distinct published classes: `Australian Operators`, `Victorian Licensed Bookmakers`, `International Licensed Bookmakers`, and `Interstate Oncourse Bookmakers`.
- [A] The `International Licensed Bookmakers` list explicitly includes entities such as `Hong Kong Jockey Club`, `Japan Racing Association`, `PMU`, `Singapore Turf Club`, and `Woodbine Entertainment Group`.
- [A/B] Inference: treating RV approval as a single binary flag loses material counterparty-regime variation; `interstate_oncourse` should be a first-class compliance/latency segment alongside domestic/ Victorian / international classes.

Extracted data fields to add:
- `rv_approved_counterparty_snapshot.capture_ts`
- `rv_approved_counterparty_snapshot.counterparty_name`
- `rv_approved_counterparty_snapshot.counterparty_segment(australian_operator|victorian_licensed_bookmaker|international_licensed_bookmaker|interstate_oncourse_bookmaker)`
- `rv_approved_counterparty_snapshot.source_page_url`
- `rv_counterparty_segment_membership_event.event_ts`
- `rv_counterparty_segment_membership_event.counterparty_name`
- `rv_counterparty_segment_membership_event.old_segment`
- `rv_counterparty_segment_membership_event.new_segment`

Model ideas:
- Add `counterparty_segment` as a routing and compliance-risk feature in slippage/void-rate priors for Victorian race-field-linked flows.
- Add `international_counterparty_concentration` and `interstate_oncourse_exposure` diagnostics to detect governance concentration drift by segment.

Execution lessons:
- Snapshot the RV approved list frequently and treat segment changes as effective-dated events, not static metadata.
- Keep entitlement checks segment-aware so incident handling can branch by counterparty class.

Contradiction noted:
- Prior simplification: RV approved counterparties were modeled as a three-segment universe (Australian, Victorian-licensed, International). The primary page now shows a fourth live segment (`Interstate Oncourse Bookmakers`) that changes compliance-routing design.

### Racing Victoria policy index now publishes both clean and marked-up standard conditions concurrently, enabling deterministic policy-diff controls

- [A] Racing Victoria's race-fields policy page links both `Standard Conditions of Approval - Effective 1 March 2025` and a `marked up` version for the same effective date.
- [A] The same page links the `Guide to Provision of Information 2025-26` alongside current policy/conditions, establishing a visible clean-vs-marked-up policy bundle on one principal page.
- [A/B] Inference: this supports a deterministic dual-artifact ingest strategy (`clean` as canonical parser source, `marked_up` for clause-diff detection), mirroring the policy-artifact quality controls already identified for NSW.

Extracted data fields to add:
- `rv_policy_artifact_snapshot.capture_ts`
- `rv_policy_artifact_snapshot.effective_from`
- `rv_policy_artifact_snapshot.artifact_type(clean|marked_up|guide|policy_index)`
- `rv_policy_artifact_snapshot.artifact_url`
- `rv_policy_artifact_snapshot.parent_index_url`
- `rv_policy_diff_event.event_ts`
- `rv_policy_diff_event.effective_from`
- `rv_policy_diff_event.diff_detected_flag`
- `rv_policy_diff_event.clause_ids_changed_json`

Model ideas:
- Add `policy_diff_open_flag` to reduce confidence in fee/compliance-sensitive backtests until clean-vs-marked-up diffs are reconciled.
- Build a cross-jurisdiction `policy_artifact_pairing_score` feature (NSW + VIC) to rank policy-parser reliability.

Execution lessons:
- Promote RV policy changes to production only after clean/marked-up pair reconciliation and clause-level diff logging.
- Treat policy-index link changes as trigger events for parser regression tests.

Contradiction noted:
- Prior simplification: policy ingest promoted single-document snapshots once a new effective date was observed. RV now exposes explicit paired artifacts that should be processed as a linked set.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal additions this pass are Australian counterparty-segmentation and policy-artifact-governance mechanics, not syndicate model internals.

## Source notes (incremental additions for pass 115)

- Racing Victoria, `Approved Wagering Service Providers` (four-class counterparty segmentation including `Interstate Oncourse Bookmakers`, plus international approved-operator listings; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/wagering-service-providers
- Racing Victoria, `Race Fields Policy` (links to effective-date policy bundle including clean + marked-up standard conditions and 2025-26 guide; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/race-fields-policy

## Incremental sourced findings added in this run (2026-04-03, pass 116)

### Betfair order-placement contract adds deterministic stale-market and idempotency behavior that should be first-class in execution replay

- [A] Betfair `placeOrders` supports an optional `marketVersion`; if submitted against an older market version than current, the order is lapsed.
- [A] The same API call supports `customerRef` dedupe with an explicit 60-second duplicate-submission window and notes this field does not persist to Order Stream payloads.
- [A] `async=true` can return orders in `PENDING` state with no bet ID in the initial response; tracking then depends on stream updates or `customerOrderRef` tracing.
- [A] Betfair documents that with `Best Execution` disabled, one `placeOrders` request can return `PROCESSED_WITH_ERRORS` (partial acceptance/rejection), so batch atomicity is not guaranteed in that mode.
- [A/B] Inference: backtest/live parity requires explicit replay of `marketVersion_lapse`, `dedupe_window_sec`, and `partial_batch_acceptance` branches; otherwise simulated fill/error rates are biased.

Extracted data fields to add:
- `betfair_order_submission_snapshot.capture_ts`
- `betfair_order_submission_snapshot.market_id`
- `betfair_order_submission_snapshot.market_version_sent`
- `betfair_order_submission_snapshot.market_version_current`
- `betfair_order_submission_snapshot.version_lapse_flag`
- `betfair_order_submission_snapshot.customer_ref`
- `betfair_order_submission_snapshot.customer_ref_dedupe_window_sec`
- `betfair_order_submission_snapshot.best_execution_enabled_flag`
- `betfair_order_submission_snapshot.async_flag`
- `betfair_order_submission_snapshot.initial_order_status`
- `betfair_order_submission_snapshot.initial_bet_id_present_flag`
- `betfair_order_submission_snapshot.processed_with_errors_flag`

Model ideas:
- Add an `order_acceptance_probability` model conditioned on `market_version_gap` and `best_execution_enabled_flag`.
- Add a `dedupe_collision_risk` feature in order-throttle logic when strategy bursts are likely to reuse client refs inside 60 seconds.

Execution lessons:
- Attach immutable submission metadata (`marketVersion`, `customerRef`, async mode) to every order-attempt event for audit/replay.
- Treat `PROCESSED_WITH_ERRORS` as a first-class branch in risk/position reconciliation instead of a rare exception path.

Contradiction noted:
- Prior simplification: order-placement failures were treated mostly as latency/price-move effects. Betfair's primary API contract adds deterministic state/version/idempotency failure paths.

### Betfair Stream access docs now provide concrete delayed-key conflation and unfiltered-subscription behavior

- [A] Betfair states Stream API is available via delayed application keys, but delayed-key market data is conflated into one update every three minutes containing the prior three minutes of changes.
- [A] A newer Betfair support article (updated 2026-03-03) states that subscribing without a market filter publishes all newly activated markets, each with an `img=true` snapshot when activated.
- [A/B] Inference: delayed-key or unfiltered-subscription runs can contaminate latency-sensitive feature engineering and should be tagged as separate data regimes.

Extracted data fields to add:
- `betfair_stream_subscription_snapshot.capture_ts`
- `betfair_stream_subscription_snapshot.app_key_mode(delayed|live)`
- `betfair_stream_subscription_snapshot.conflation_window_sec`
- `betfair_stream_subscription_snapshot.market_filter_present_flag`
- `betfair_stream_subscription_snapshot.unfiltered_activation_feed_flag`
- `betfair_stream_subscription_snapshot.initial_image_on_activation_flag`

Model ideas:
- Add a `stream_regime_id` feature (`live_filtered`, `delayed_conflated`, `unfiltered_all_markets`) and forbid mixing regimes in latency-sensitive training splits.

Execution lessons:
- Block production-grade microstructure modeling when ingestion lineage indicates delayed-key conflation.
- Always persist subscription config and key mode so downstream jobs can exclude or downweight incompatible lineage.

Contradiction noted:
- Prior simplification: any Stream API feed was treated as near-real-time equivalent once schema matched. Delayed-key conflation and unfiltered-subscription behavior create materially different market-state observability.

### Queensland and GRNSW race-information conditions add new fee/reporting determinism across authority horizons

- [A] Racing Queensland's race-information authority page states the next authority period as 2025-07-01 to 2027-06-30, with mandatory authority application and a $250 fee for applicants that have not previously held authority.
- [A] The same RQ page links a formal FY26-27 vs FY24-25 conditions comparison artifact and publishes 2025-07-01 oncourse-specific submission templates/instructions, indicating an explicit split between standard and oncourse reporting pathways.
- [A] The RQ comparison document introduces/marks up `QOP Deductions` and `QOP Service` definitions tied to BetMakers DNA as the Queensland Official Price service provider for deduction calculation pathways.
- [A] GRNSW 2025-26 standard conditions (Version 1.1, effective 2025-07-01) set a one-year approval period (to 2026-06-30), require monthly fee instalments within 10 business days, and impose a $2,500 + GST application fee for new applicants and sub-$1m-turnover renewals.
- [A] GRNSW also codifies `Eligible Bet Back` evidence requirements and gross-margin/gross-revenue formulas that explicitly include treatment of eligible bet-backs and exchange commissions.
- [A/B] Inference: multi-jurisdiction AU fee simulation should be parameterized by authority horizon and operator class, not a single national schedule; deduction-source provenance (e.g., QOP-calculated vs operator-calculated) is now a core audit dimension.

Extracted data fields to add:
- `rq_authority_period_snapshot.capture_ts`
- `rq_authority_period_snapshot.effective_from`
- `rq_authority_period_snapshot.effective_to`
- `rq_authority_period_snapshot.new_applicant_fee_aud`
- `rq_reporting_pathway_snapshot.capture_ts`
- `rq_reporting_pathway_snapshot.pathway_type(standard|oncourse)`
- `rq_reporting_pathway_snapshot.template_url`
- `rq_reporting_pathway_snapshot.instructions_url`
- `rq_deduction_service_snapshot.capture_ts`
- `rq_deduction_service_snapshot.qop_provider`
- `rq_deduction_service_snapshot.qop_deduction_defined_flag`
- `grnsw_authority_period_snapshot.capture_ts`
- `grnsw_authority_period_snapshot.effective_from`
- `grnsw_authority_period_snapshot.effective_to`
- `grnsw_authority_period_snapshot.application_fee_aud_ex_gst`
- `grnsw_authority_period_snapshot.low_turnover_threshold_aud`
- `grnsw_fee_payment_timing_snapshot.capture_ts`
- `grnsw_fee_payment_timing_snapshot.monthly_due_business_days`
- `grnsw_betback_eligibility_snapshot.capture_ts`
- `grnsw_betback_eligibility_snapshot.counterparty_must_hold_grnsw_approval_flag`
- `grnsw_betback_eligibility_snapshot.documentary_evidence_required_flag`

Model ideas:
- Add a `jurisdiction_authority_clock` feature to fee/entitlement risk scoring so stale approvals are penalized by rulebook period.
- Add a `deduction_method_lineage` feature to isolate PnL shifts caused by official-price deduction services versus operator-side deduction methods.

Execution lessons:
- Maintain authority-period calendars by jurisdiction and fail closed when reporting templates/definitions mismatch active period.
- Store fee-engine inputs with deduction provenance (`operator`, `QOP`, or other prescribed mechanism) to support dispute-grade reconciliation.

Contradiction noted:
- Prior simplification: AU race-information obligations were treated as mostly harmonized at a state-policy headline level. Current RQ and GRNSW artifacts show materially different authority durations, application-fee thresholds, and deduction/reporting pathways.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW-team/microstructure signal this pass is execution-contract detail (Betfair order/version/idempotency + stream-conflation regimes), not new syndicate model internals.

## Source notes (incremental additions for pass 116)

- Betfair Exchange API docs, `placeOrders` (updated 2025-01-07; marketVersion lapse behavior, 60-second `customerRef` dedupe window, async `PENDING`, and best-execution caveat; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687496/placeOrders
- Betfair support, `How do I get access to the Stream API?` (updated 2024-06-21; delayed-key stream access and 3-minute conflation behavior; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003887871-How-do-I-get-access-to-the-Stream-API
- Betfair support, `What happens if you subscribe to the Stream API without a market filter?` (updated 2026-03-03; unfiltered activation feed and `img=true` initial snapshots; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/25874177103644-What-happens-if-you-subscribe-to-the-Stream-API-without-a-market-filter
- Racing Queensland, `Race Information` (authority period 2025-07-01 to 2027-06-30, application-fee note, authorised-WSP list link, and reporting-template links; accessed 2026-04-03): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland, `FY26-27 vs FY24-25 General Conditions Comparison` (marked-up comparison artifact including `QOP Deductions` / `QOP Service` definitions and prescribed-mechanism terms; accessed 2026-04-03): https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf
- GRNSW, `2025-26 RFIU Approval for Australian WSPs - Standard Conditions` (Version 1.1 dated 2025-06-24; approval period, fee timing, application-fee thresholds, eligible bet-back evidence, and margin/revenue definitions; accessed 2026-04-03): https://www.grnsw.com.au/attachments/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBCRFgwblFFPSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ%3D%3D--03efde82ee1bbbf899d10010754aa579ec9c791d/2025-26%20GRNSW%20RFIU%20Approval%20for%20Australian%20WSPs%20-%20Standard%20Conditions%20.pdf

## Incremental sourced findings added in this run (2026-04-03, pass 117)

### Betfair announcement metadata shows delay-policy regimes are still changing post-January 2026 and should be treated as a mutable execution surface

- [A/B] Betfair Developer Program announcement index snapshots show the long-running `No Delays on Passive Bets - Selected Events` thread remains active, with the latest post timestamp shown as `16-03-2026, 04:31 PM` and total posts increased to `262`.
- [A/B] The same announcement index shows a separate sticky thread, `Dynamic delay update - tennis testing`, with latest post `26-02-2026, 05:51 PM`, indicating ongoing dynamic-delay tuning activity after the January `betDelayModels` rollout.
- [A/B] Inference: delay-model assumptions are not static release artifacts; they are an evolving policy stream that can shift queue-position and fill behavior without endpoint-schema changes.

Extracted data fields to add:
- `betfair_delay_policy_thread_snapshot.capture_ts`
- `betfair_delay_policy_thread_snapshot.thread_title`
- `betfair_delay_policy_thread_snapshot.thread_url`
- `betfair_delay_policy_thread_snapshot.thread_posts_count`
- `betfair_delay_policy_thread_snapshot.last_post_local_ts`
- `betfair_delay_policy_thread_snapshot.last_post_author`
- `betfair_delay_policy_epoch_event.event_ts`
- `betfair_delay_policy_epoch_event.policy_surface(passive_no_delay|dynamic_delay_testing|other)`
- `betfair_delay_policy_epoch_event.event_source(announcement_index|thread_post)`

Model ideas:
- Add a `delay_policy_churn_score` feature derived from announcement-thread update frequency and recency.
- Add `delay_policy_epoch_id` as a hard segmentation key for fill/latency modeling around passive vs dynamic delay transitions.

Execution lessons:
- Snapshot Betfair announcement metadata daily and promote changes into execution-policy epochs even when APIs remain backward compatible.
- Block cross-epoch pooling of fill/slippage training rows unless delay-policy state is explicitly controlled.

Contradiction noted:
- Prior simplification: post-January 2026 `betDelayModels` rollout was treated as mostly stable. Current forum metadata indicates continued live policy churn.

### Racing Victoria interstate-oncourse approvals expose a multi-jurisdiction topology inside one segment and should not be modeled as a single homogeneous class

- [A] Racing Victoria's `Approved Wagering Service Providers` page lists `Interstate Oncourse Bookmakers` with explicit per-counterparty jurisdiction strings (for example `NSW & TAS`, `QLD, NT`, `NSW, ACT, NT`, `WA`), not just a flat segment label.
- [A] The same table includes both single-jurisdiction and multi-jurisdiction entities, implying heterogeneous entitlement and operational footprints within the interstate-oncourse segment.
- [A/B] Inference: segment-level features alone underfit counterparty compliance/execution risk; jurisdiction-span and venue-overlap should be first-class attributes.

Extracted data fields to add:
- `rv_interstate_oncourse_snapshot.capture_ts`
- `rv_interstate_oncourse_snapshot.counterparty_name`
- `rv_interstate_oncourse_snapshot.jurisdictions_raw`
- `rv_interstate_oncourse_snapshot.jurisdictions_json`
- `rv_interstate_oncourse_snapshot.jurisdiction_count`
- `rv_interstate_oncourse_snapshot.multi_jurisdiction_flag`
- `rv_interstate_oncourse_membership_event.event_ts`
- `rv_interstate_oncourse_membership_event.counterparty_name`
- `rv_interstate_oncourse_membership_event.old_jurisdictions_json`
- `rv_interstate_oncourse_membership_event.new_jurisdictions_json`

Model ideas:
- Add `counterparty_jurisdiction_span` and `venue_jurisdiction_overlap` features to compliance-risk and fill-quality priors.
- Add an `interstate_oncourse_fragmentation_index` feature to detect concentration shifts between single-state and multi-state counterparties.

Execution lessons:
- Resolve entitlement checks at `{counterparty, venue_jurisdiction}` grain rather than only `counterparty_segment`.
- Alert on jurisdiction-set changes for active counterparties because these can silently alter allowed routing and reconciliation scope.

Contradiction noted:
- Prior simplification: `interstate_oncourse_bookmaker` was modeled as one additional RV segment. Primary registry detail shows substantial within-segment jurisdiction heterogeneity.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW/microstructure-adjacent signal this pass is Betfair delay-policy churn telemetry, not new syndicate internal-method disclosures.

## Source notes (incremental additions for pass 117)

- Betfair Developer Program forum root listing (announcement activity snapshot; `No Delays on Passive Bets` latest-post date and announcement volume context; crawled 2026-04-03): https://forum.developer.betfair.com/
- Betfair Developer Program announcements index (sticky `Dynamic delay update - tennis testing` and active thread metadata with latest post dates; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements
- Racing Victoria, `Approved Wagering Service Providers` (interstate-oncourse counterparty rows with explicit jurisdiction strings; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/wagering-service-providers

## Incremental sourced findings added in this run (2026-04-03, pass 118)

### Betfair passive-delay thread posts provide dated rollout milestones beyond index metadata

- [A/B] Betfair's `No Delays on Passive Bets - Selected Events` thread (`#46`, 2025-05-22) states French Open main-draw tennis moved to a temporary `100%` passive-delay trial (odd and even event IDs), while qualifier logic remained odd-ID only until Sunday start.
- [A/B] The same thread (`#49`, 2025-07-28) states passive no-delay was enabled across `100%` of tennis and baseball from around midday, with the next milestone being API signposting expected in late August/early September and football testing to restart after that.
- [A/B] Inference: passive-delay regime state should be modeled as dated sport-coverage phases (`odd_id_subset` -> `tournament_full` -> `sport_full`) rather than a single binary `PASSIVE` switch.

Extracted data fields to add:
- `betfair_passive_delay_rollout_event.event_ts`
- `betfair_passive_delay_rollout_event.sport`
- `betfair_passive_delay_rollout_event.coverage_mode(odd_id_subset|tournament_full|sport_full)`
- `betfair_passive_delay_rollout_event.scope_note`
- `betfair_passive_delay_rollout_event.api_signposting_eta_note`
- `betfair_passive_delay_rollout_event.source_thread_post_id`

Model ideas:
- Add `passive_delay_coverage_phase` as a segmentation feature for pre-off fill/slippage modeling on tennis/baseball windows.
- Add rollout-transition event dummies around dated phase switches to isolate structural breaks in queue-position outcomes.

Execution lessons:
- Persist thread-post IDs and timestamps, not just announcement-index recency, for replay-grade policy chronology.
- Require explicit sport-level policy state in backtests before pooling passive-delay windows.

Contradiction noted:
- Prior simplification: passive-delay change tracking relied mainly on announcement-index churn. Thread-level posts provide materially richer dated scope transitions.

### Betfair `betDelayModels` announcement thread captures contract drift and correction in PASSIVE order handling semantics

- [A/B] Betfair's `UPDATE - Betfair API Release 4th September - New Field - betDelayModels` thread states initial PASSIVE constraints for in-play no-delay applicability: `LIMIT` orders, `persistenceType LAPSE`, and omission of `timeInForce`, `minFillSize`, and `betTargetType`.
- [A/B] The same thread records release-date shifts (from 2 September to 4 September 2025) and an edit note changing allowed persistence guidance (`deleted PERSIST`).
- [A/B] The same thread includes a later official correction (`#11`, 2025-09-02): orders not meeting PASSIVE requirements are **not** rejected and are instead accepted as normal in-play bets with standard delay, superseding earlier error-based interpretation.
- [A/B] Inference: announcement-thread contracts can materially revise execution assumptions intra-release and require precedence tracking by post timestamp.

Extracted data fields to add:
- `betfair_delay_contract_revision_event.event_ts`
- `betfair_delay_contract_revision_event.contract_surface(betDelayModels_passive)`
- `betfair_delay_contract_revision_event.order_requirement_snapshot_json`
- `betfair_delay_contract_revision_event.release_date_announced`
- `betfair_delay_contract_revision_event.release_date_revised`
- `betfair_delay_contract_revision_event.non_compliant_order_outcome(normal_delay|reject)`
- `betfair_delay_contract_revision_event.source_thread_post_id`

Model ideas:
- Add a `passive_requirement_compliance_flag` feature and test interaction with realized `betDelay` to separate no-delay vs normal-delay execution paths.
- Add a `contract_revision_epoch_id` feature to prevent training contamination across pre-correction and post-correction policy interpretations.

Execution lessons:
- Treat Betfair forum announcement threads as mutable contracts and snapshot edit/reply chronology before shipping executor rules.
- Gate order-validation hard-fails behind latest-source reconciliation so superseded guidance does not create false rejects.

Contradiction noted:
- Prior simplification: non-compliant PASSIVE order attributes implied deterministic API rejection. Later Betfair staff clarification states those orders are accepted with normal delay.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new CAW/microstructure-adjacent signal this pass is Betfair delay-policy rollout chronology and contract-revision behavior, not new syndicate internal-method disclosures.

## Source notes (incremental additions for pass 118)

- Betfair Developer Program thread, `No Delays on Passive Bets - Selected Events - PLEASE SUBSCRIBE FOR UPDATES` (thread-level rollout milestones: French Open full trial and 100% tennis/baseball enablement note; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements/40962-no-delays-on-passive-bets-selected-events-please-subscribe-for-updates/page4
- Betfair Developer Program thread, `UPDATE - Betfair API Release 4th September - New Field - betDelayModels` (order-requirement wording, release-date revisions, and later non-compliant-order clarification; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements/42128-betfair-api-release-28th-august-%E2%80%93-new-field-betdelaymodels
- Betfair Developer Program announcements index (context for dynamic-delay sticky recency and thread activity chronology; crawled 2026-04-03): https://forum.developer.betfair.com/forum/developer-program/announcements

## Incremental sourced findings added in this run (2026-04-03, pass 119)

### NYRA CAW guardrails show a temporary suspension/reinstatement pattern, not a strictly monotonic policy rollout

- [B] Equibase's 2026-02-06 item (relaying NYRA/BloodHorse reporting) states NYRA suspended the new one-minute-to-post CAW guardrails for one race day on Friday, 2026-02-06, to allow tote-system technical upgrades.
- [B] The same item states those new guardrails had taken effect on 2026-02-05 and were expected to return on 2026-02-11 (next scheduled racing day after weather-related cancellations), while win-pool/two-minute and certain legacy restricted pools remained in effect during the pause.
- [A/B] NYRA's official Aqueduct racing page calendar context for February 2026 explicitly notes "Racing returns Feb 11," which aligns with the reinstatement date window reported in the secondary item.
- [B] Inference: CAW-policy state should be modeled as a timeline with temporary override windows (`effective -> suspended -> reinstated`) rather than a single effective-date flag.

Extracted data fields to add:
- `caw_policy_state_event.event_ts`
- `caw_policy_state_event.jurisdiction`
- `caw_policy_state_event.policy_name`
- `caw_policy_state_event.transition_type(announced|effective|temporary_suspend|reinstated)`
- `caw_policy_state_event.expected_resume_date`
- `caw_policy_state_event.applies_to_pool_scope_json`
- `caw_policy_state_event.exception_reason`
- `caw_policy_state_event.source_quality(primary|secondary)`
- `caw_policy_state_event.source_url`

Model ideas:
- Add a `policy_exception_window_flag` to late-odds volatility and fill-quality models for CAW-regulated venues.
- Segment CAW-impact evaluations by policy-state epoch (`pre_effective`, `effective`, `temporary_suspend`, `reinstated`) to avoid attributing one-off operational overrides to persistent policy change.

Execution lessons:
- Maintain a policy-event ledger with explicit temporary-suspension and reinstatement events; do not infer continuity from announcement dates alone.
- Use lower-confidence tags for secondary-source policy events and require later primary corroboration before hardcoding permanent controls.

Contradiction noted:
- Prior simplification: CAW guardrail rollout was treated as a one-way policy transition after effective date. New evidence indicates temporary rollback windows can occur for operational reasons.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [B] Net-new CAW signal this pass is policy-state rollback/reinstatement behavior (operational exception windows), not syndicate-method disclosures.

## Source notes (incremental additions for pass 119)

- Equibase, `NYRA Suspends New CAW Restrictions During Feb. 6 Card` (submitted 2026-02-06; includes quoted NYRA timing details for one-day suspension and expected 2026-02-11 return): https://cms.equibase.com/node/313508
- NYRA Aqueduct racing page (February 2026 calendar context, "Racing returns Feb 11" header note): https://www.nyra.com/aqueduct/racing/?day=2026-02-21&limit=entries

## Incremental sourced findings added in this run (2026-04-03, pass 120)

### Racing Australia issued a one-time Late FOD amnesty window that creates a temporary ownership-data backfill regime

- [A] Racing Australia's media release index shows a new item dated `31 March 2026` titled `Statement on Late FOD Amnesty`.
- [A] The release text states a one-time amnesty for late Foal Ownership Declarations covering foals born in the `2024` and `2025` seasons, conditional on lodgement by `5:30pm AEST` on `14 April 2026`.
- [A] The same notice references enforcement context under `AR285`, `AR286`, and `AR287`, and says the amnesty follows improved rule adherence.
- [A/B] Inference: ownership/eligibility metadata has a defined temporary correction window (`amnesty_open` -> `amnesty_deadline`) that should be modeled as a regime event, not treated as ordinary steady-state completeness.

Extracted data fields to add:
- `ra_fod_amnesty_event.capture_ts`
- `ra_fod_amnesty_event.release_date`
- `ra_fod_amnesty_event.foal_seasons_scope_json`
- `ra_fod_amnesty_event.deadline_local_ts`
- `ra_fod_amnesty_event.rules_referenced_json`
- `ra_fod_amnesty_event.one_time_flag`
- `ra_fod_amnesty_event.source_url`
- `ra_fod_amnesty_impact_snapshot.event_date`
- `ra_fod_amnesty_impact_snapshot.ownership_declaration_lag_days`
- `ra_fod_amnesty_impact_snapshot.amnesty_window_flag`

Model ideas:
- Add `ownership_declaration_lag_days` and `amnesty_window_flag` as data-quality covariates for young-horse feature trust weighting.
- Run sensitivity checks on runner-level ownership/stable metadata features with and without amnesty-window rows.

Execution lessons:
- Snapshot ownership-declaration provenance before and after `14 April 2026` to preserve replay-grade lineage.
- Avoid promoting model changes driven by amnesty backfill bursts until post-window drift stabilizes.

Contradiction noted:
- Prior simplification: late Foal Ownership Declaration enforcement was treated as a steady hard-cutoff regime. New primary RA notice introduces a dated one-time amnesty exception window.

### Racing Australia monthly KPI publication lag now persists into April 2026 and should be treated as a live freshness constraint

- [A] Racing Australia's Monthly Service Standard Performance Report page, captured on `3 April 2026`, still lists `January 2026` as the latest report in the `2025-2026` section.
- [A] No `February 2026` entry is shown on that index at capture time, extending the previously observed publication gap into April.
- [A/B] Inference: monthly KPI ingestion should remain publication-gap-aware with explicit staleness handling, not month+1 availability assumptions.

Extracted data fields to add:
- `ra_monthly_kpi_publication_gap_snapshot.capture_ts`
- `ra_monthly_kpi_publication_gap_snapshot.fiscal_cycle`
- `ra_monthly_kpi_publication_gap_snapshot.latest_report_label`
- `ra_monthly_kpi_publication_gap_snapshot.expected_next_report_label`
- `ra_monthly_kpi_publication_gap_snapshot.report_missing_flag`
- `ra_monthly_kpi_publication_gap_snapshot.days_since_month_end`
- `ra_monthly_kpi_publication_gap_snapshot.source_url`

Model ideas:
- Add a `provider_kpi_staleness_penalty` feature to reliability-weighted training/serving controls.
- Segment provider-health backtests by `publication_gap_days` buckets to measure operational impact.

Execution lessons:
- Keep monthly KPI telemetry as advisory health input with explicit lag allowances.
- Trigger publication-gap alerts by elapsed days, not calendar-month rollover.

Contradiction noted:
- Prior simplification: month+1 Racing Australia KPI publication was treated as near-term expected cadence. As of 2026-04-03, latest visible artifact remains January 2026.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new signal this pass is Australian governance/provider-operability state (FOD amnesty exception window and KPI publication-gap persistence), not new syndicate-method internals.

## Source notes (incremental additions for pass 120)

- Racing Australia media releases index (includes `31 March 2026` `Statement on Late FOD Amnesty` entry with deadline text; accessed 2026-04-03): https://www.racingaustralia.horse/FreeServices/MediaReleases.aspx
- Racing Australia monthly performance report index (latest visible `2025-2026` entry remains `January 2026` at capture time; accessed 2026-04-03): https://www.racingaustralia.horse/FreeServices/PerformanceReport.aspx

## Incremental sourced findings added in this run (2026-04-03, pass 121)

### Betfair `listMarketBook` now contributes an explicit per-market polling ceiling that should be enforced as a hard microstructure guardrail

- [A] Betfair's official `listMarketBook` operation page (updated `2024-06-04`) states calls should be made at a maximum of `5` times per second to a single `marketId`.
- [A/B] Inference: request-weight budgeting alone is insufficient; collector safety also needs a `per_market_hz` limiter so a single hot market cannot create compliance or quality drift even when aggregate weight remains below hard caps.

Extracted data fields to add:
- `betfair_market_polling_contract_snapshot.capture_ts`
- `betfair_market_polling_contract_snapshot.operation_name(listMarketBook)`
- `betfair_market_polling_contract_snapshot.max_calls_per_market_per_second(5)`
- `betfair_market_polling_contract_snapshot.contract_updated_date(2024-06-04)`
- `betfair_market_polling_contract_snapshot.source_url`
- `market_poll_rate_violation_event.event_ts`
- `market_poll_rate_violation_event.market_id`
- `market_poll_rate_violation_event.observed_calls_per_second`
- `market_poll_rate_violation_event.allowed_calls_per_second`

Model ideas:
- Add `per_market_poll_rate_bucket` lineage tags so fill/slippage analyses can exclude or downweight windows captured above documented per-market cadence.
- Add a `collector_contract_compliance_score` combining request-weight and per-market-Hz adherence.

Execution lessons:
- Enforce per-market cadence before dispatch; do not rely on post-hoc error handling to catch over-polling.
- Persist per-market poll telemetry in replay so execution-quality regressions can be attributed to contract drift vs model drift.

Contradiction noted:
- Prior simplification: Betfair collector controls emphasized request-weight algebra and projection shape. Primary API docs add an explicit per-market frequency contract (`5/s`) that must be enforced independently.

### Racing NSW historical RFIU archive + Clause 5.6 PDF expose a long-lived, versioned bet-type policy surface that should be modeled explicitly

- [A] Racing NSW's `Previous Acts, Regulations and Standard Conditions` page publishes annual RFIU standard-condition artifacts across multiple seasons (for example `2015-2016` through `2023-2024`) and linked regulatory amendments.
- [A] The linked Clause `5.6` PDF (`RFIU Standard Conditions 2014-2015 ... Clause 5.6 Bet Types`) enumerates concrete `NOT APPROVED` categories (for example `Margin Betting`, `Spread Betting`, `A Horse to Lose`, `Favourite Versus the Field`, `Track Rating`) and conditionally approved categories requiring explicit rule constraints.
- [A/B] Inference: allowed-market-surface logic is a versioned policy object, not a static boolean by jurisdiction; historical backtests and live routing both need an effective-date bet-type permission registry.

Extracted data fields to add:
- `nsw_rfiu_policy_version_snapshot.capture_ts`
- `nsw_rfiu_policy_version_snapshot.policy_doc_label`
- `nsw_rfiu_policy_version_snapshot.effective_from`
- `nsw_rfiu_policy_version_snapshot.effective_to`
- `nsw_rfiu_policy_version_snapshot.source_url`
- `nsw_bet_type_policy_rule.capture_ts`
- `nsw_bet_type_policy_rule.policy_version`
- `nsw_bet_type_policy_rule.bet_type_name`
- `nsw_bet_type_policy_rule.policy_state(not_approved|approved_with_conditions)`
- `nsw_bet_type_policy_rule.qualification_text`
- `nsw_bet_type_policy_rule.source_url`

Model ideas:
- Add `bet_type_policy_state` as a hard feature-store gate so prohibited/conditional products are excluded from both training and execution candidate sets by date.
- Add `policy_version_change_event` regime markers for backtest segmentation around RFIU standard-condition updates.

Execution lessons:
- Validate strategy market-selection rules against date-effective bet-type policy maps before order creation.
- Treat policy archive deltas as first-class change events; run automatic diffs when new annual RFIU artifacts are published.

Contradiction noted:
- Prior simplification: race-field governance was mainly represented as fee/reporting and entitlement scope controls. Racing NSW primary artifacts show a separately versioned and operationally material bet-type permission layer.

### CHRB 2026 board calendar creates a deterministic governance-deadline feed (with observable data-quality anomalies) for CAW/ADW policy-watch automation

- [A] CHRB's published `2026 Meeting Schedule` lists board-meeting dates together with explicit cutoff fields: `Date for Request to be on Agenda`, `Date Notice of Meeting is Posted`, and `Date Board Materials and Public Comments are Due`.
- [A] The same schedule includes a visible date-format anomaly (`02/26/22026`) plus a `NEW MEETING LOCATION, DAY, and DATE` notice.
- [A/B] Inference: governance surveillance should ingest CHRB schedule metadata as a calendar contract and apply parser-level anomaly checks, because deadline/venue shifts can change expected timing of CAW/ADW-rule artifacts.

Extracted data fields to add:
- `chrb_board_calendar_event.capture_ts`
- `chrb_board_calendar_event.meeting_date`
- `chrb_board_calendar_event.location_text`
- `chrb_board_calendar_event.agenda_request_due_date`
- `chrb_board_calendar_event.notice_post_date`
- `chrb_board_calendar_event.public_comment_due_date`
- `chrb_board_calendar_event.location_change_notice_flag`
- `chrb_board_calendar_event.date_format_anomaly_flag`
- `chrb_board_calendar_event.source_url`

Model ideas:
- Add `governance_deadline_proximity_days` as a monitoring feature for policy-sensitive market regimes.
- Add `calendar_anomaly_flag` to policy-watch confidence scoring so malformed schedule rows trigger manual review before automation decisions.

Execution lessons:
- Run a weekly governance-calendar crawler that materializes expected document windows into alerting.
- Fail open but flag low confidence when schedule parsing detects malformed dates or location/day-change notices.

Contradiction noted:
- Prior simplification: CHRB policy discovery was modeled mostly as reactive artifact collection from agendas/transcripts. Primary schedule metadata supports proactive deadline-aware monitoring and requires data-quality checks.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is execution/governance contract detail (Betfair per-market call-rate ceiling, NSW bet-type policy versioning, CHRB deadline calendar mechanics), not new syndicate internal-method disclosures.

## Source notes (incremental additions for pass 121)

- Betfair Exchange API Documentation, `listMarketBook` (updated 2024-06-04; includes explicit `max 5 calls/sec` to a single `marketId`; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687510/listMarketBook
- Racing NSW, `Previous Acts, Regulations and Standard Conditions` (historical RFIU standard-condition archive and linked amendment artifacts; accessed 2026-04-03): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/previous-acts-regulations-and-standard-conditions/
- Racing NSW PDF, `RFIU Standard Conditions 2014-2015 ... Clause 5.6 Bet Types` (explicit prohibited/conditionally approved bet-type taxonomy; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/RFIU-Standard-Conditions-2014-2015-For-Australian-Wagering-Operators-2014-15-Clause-5.6-Bet-Types.pdf
- California Horse Racing Board, `2026 Meeting Schedule` (meeting calendar with agenda/notice/material deadlines and location/day/date change note; accessed 2026-04-03): https://www.chrb.ca.gov/meeting_schedule_2026.html

## Incremental sourced findings added in this run (2026-04-03, pass 122)

### Racing NSW `Bet Back` approval list adds a concrete counterparty-whitelist layer for rebate attribution and strategy eligibility

- [A] Racing NSW publishes a `Bet Back - Approved Licensed Wagering Operators ... (subject to conditions)` PDF listing approved counterparties with jurisdiction labels and an effective-date column (`1-Jul-20` in the captured artifact), including both domestic and offshore entities (for example `Betfair US LLC`, `Betfair International Plc`).
- [A/B] Inference: any model using net return after credits/rebates needs a separate `bet_back_eligibility` join keyed by operator identity and effective window; assuming universal or static rebate eligibility will bias realized-edge attribution.

Extracted data fields to add:
- `nsw_bet_back_approval_snapshot.capture_ts`
- `nsw_bet_back_approval_snapshot.period_label`
- `nsw_bet_back_approval_snapshot.source_url`
- `nsw_bet_back_operator_approval.capture_ts`
- `nsw_bet_back_operator_approval.operator_name`
- `nsw_bet_back_operator_approval.jurisdiction_label`
- `nsw_bet_back_operator_approval.effective_date`
- `nsw_bet_back_operator_approval.conditions_text_present_flag`

Model ideas:
- Add `counterparty_bet_back_eligible_flag` to post-trade PnL decomposition so rebate-credit assumptions are explicit by operator and period.
- Add `approval_roster_staleness_days` as a confidence feature when the latest published roster period is materially old.

Execution lessons:
- Treat counterparty lists as versioned policy data, not static metadata in strategy configs.
- Keep canonical operator-identity mapping (legal entity, trading-as label, jurisdiction) to avoid missed joins in settlement/rebate pipelines.

Contradiction noted:
- Prior simplification: rebate/bet-back effects were often modeled as venue-level constants. Racing NSW publishes operator-level approval rosters, implying counterparty-specific eligibility state.

### CHRB 2026 race-date allocation schedule adds a deterministic meet-window regime calendar distinct from board-meeting calendars

- [A] CHRB's `2026 Racing Schedule` publishes allocated date blocks by venue (for example Santa Anita, Del Mar, Los Alamitos) and states that actual live days are determined when applications are approved.
- [A] The same page notes allocation cadence provenance (`2026 Thoroughbred Race Dates were allocated at the October 16, 2025 regular meeting`), giving explicit governance anchors for when future date-block changes can emerge.
- [A/B] Inference: policy-watch and microstructure monitoring should include venue-level meet-window state (`allocated_date_block`) in addition to board-meeting deadlines, because CAW/ADW economics and late-liquidity behavior can shift at meet boundaries.

Extracted data fields to add:
- `chrb_race_date_block_snapshot.capture_ts`
- `chrb_race_date_block_snapshot.source_url`
- `chrb_race_date_block.venue_name`
- `chrb_race_date_block.allocated_start_date`
- `chrb_race_date_block.allocated_end_date`
- `chrb_race_date_block.code_type(thoroughbred|quarter_horse|harness|fair)`
- `chrb_race_date_block.allocation_meeting_date`
- `chrb_race_date_block.actual_live_days_determined_later_flag`

Model ideas:
- Add `meet_boundary_proximity_days` as a regime feature for odds-drift and late-pool-volatility models.
- Segment CAW-impact analyses by CHRB allocated meet windows rather than calendar month buckets.

Execution lessons:
- Calendar ingestion should merge two CHRB feeds: board/agenda deadlines and race-date allocations.
- Pre-compute expected boundary dates and trigger intensified monitoring in the final 3-5 days of each allocated block.

Contradiction noted:
- Prior simplification: governance timing was represented mainly with board-meeting schedules. CHRB also publishes a separate allocated-meet calendar that can drive observable market-regime shifts.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is policy/topology structure (NSW operator-level bet-back approvals and CHRB meet-window allocations), not new syndicate internal-method disclosures.

## Source notes (incremental additions for pass 122)

- Racing NSW, `Race Field Information Use` index page (current link hub for bet-back/standard-condition artifacts; accessed 2026-04-03): https://www.racingnsw.com.au/race-field-information-use/
- Racing NSW PDF, `Bet Back - Approved Licensed Wagering Operators ... (subject to conditions)` (operator/jurisdiction/effective-date roster; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Bet-Back-Approvals-2020-21.pdf
- California Horse Racing Board, `2026 Racing Schedule` (venue-level allocated date blocks and allocation provenance note; accessed 2026-04-03): https://chrb.ca.gov/racing_schedule_2026.html

## Incremental sourced findings added in this run (2026-04-03, pass 123)

### Racing NSW approved-operator page adds a publication-health signal and explicit bet-back eligibility constraints that should be machine-enforced

- [A] Racing NSW's `Approved Licensed Wagering Operators` page states the roster is "updated regularly" but the visible linked rosters are still `2020-21` (`Sole Trader Bookmakers 2020-21` and `Company Bookmakers, Corporates, TABs and Betting Exchange 2020-21`).
- [A] The same page provides an explicit bet-back qualification definition: the bet-back must be a genuine liability layoff, on the same contingency, and with win amount not exceeding the pre-existing lay-side loss exposure.
- [A] The same page adds counterparty/payment constraints: bet-back claims require account-based betting with operators that hold prior Racing NSW approval and satisfy the fee-payment qualification; cash bet-backs and non-qualifying operators are explicitly excluded.
- [A/B] Inference: rebate/credit attribution needs two independent controls: `eligibility_logic` (claim-qualification rules) and `publication_health` (age/staleness of published roster artifacts).

Extracted data fields to add:
- `nsw_bet_back_page_snapshot.capture_ts`
- `nsw_bet_back_page_snapshot.page_url`
- `nsw_bet_back_page_snapshot.updated_regularly_claim_flag`
- `nsw_bet_back_page_snapshot.visible_roster_period_min`
- `nsw_bet_back_page_snapshot.visible_roster_period_max`
- `nsw_bet_back_page_snapshot.visible_roster_count`
- `nsw_bet_back_roster_link.capture_ts`
- `nsw_bet_back_roster_link.roster_type(sole_trader|company_tab_exchange)`
- `nsw_bet_back_roster_link.period_label`
- `nsw_bet_back_roster_link.source_url`
- `nsw_bet_back_claim_rule.capture_ts`
- `nsw_bet_back_claim_rule.same_contingency_required_flag`
- `nsw_bet_back_claim_rule.genuine_layoff_required_flag`
- `nsw_bet_back_claim_rule.win_leq_existing_liability_flag`
- `nsw_bet_back_claim_rule.account_based_required_flag`
- `nsw_bet_back_claim_rule.cash_claim_disallowed_flag`
- `nsw_bet_back_claim_rule.operator_approval_required_flag`
- `nsw_bet_back_claim_rule.fee_payment_qualification_required_flag`
- `nsw_bet_back_publication_health.days_since_latest_period_end`
- `nsw_bet_back_publication_health.staleness_level(green|amber|red)`

Model ideas:
- Add `bet_back_claim_feasibility_flag` to post-trade economics so rebate assumptions are disallowed when claim-qualification predicates are not satisfied.
- Add `bet_back_roster_freshness_score` as a confidence weight for rebate-adjusted edge and for provider-level attribution diagnostics.

Execution lessons:
- Treat bet-back as rule-constrained hedging credit, not a generic rebate multiplier.
- Alert when the governing page claims regular updates but linked roster periods remain old; stale roster windows should force conservative eligibility handling.
- Preserve roster type (`sole_trader` vs `company/tab/exchange`) because matching logic and identity normalization workflows differ.

Contradiction noted:
- Prior simplification: operator-level bet-back approval was modeled mostly as a static whitelist by period. Racing NSW primary text adds explicit claim-qualification predicates and a page-level publication-staleness risk that can invalidate naive rebate assumptions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is regulatory-operational: bet-back claim-rule formalization and publication-staleness controls from Racing NSW primary artifacts.

## Source notes (incremental additions for pass 123)

- Racing NSW, `Approved Licensed Wagering Operators` page (states regular updates, links current visible `2020-21` rosters, and defines bet-back qualification conditions; accessed 2026-04-03): https://www.racingnsw.com.au/industry-forms-stakes-payment/race-field-copyright/approved-licensed-wagering-operators/
- Racing NSW PDF, `Sole Trader Bookmakers 2020-21` (roster-type-specific operator/jurisdiction/effective-date artifact; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Sole-Trader-Bookmakers-2020-2021.pdf
- Racing NSW PDF, `Company Bookmakers, Corporates, TABs and Betting Exchange 2020-21` (roster-type-specific operator/jurisdiction/effective-date artifact; accessed 2026-04-03): https://www.racingnsw.com.au/wp-content/uploads/Company-Bookmakers-2020-2021.pdf

## Incremental sourced findings added in this run (2026-04-03, pass 124)

### Betfair market-microstructure docs add a measurable raw-vs-displayed ladder lag and explicit stream-heartbeat state semantics

- [A] Betfair's market-data article (updated `2026-03-27`) states the displayed virtual stream (`EX_BEST_OFFERS_DISP`) is updated around `~150ms` after non-virtual prices.
- [A] Betfair's stream heartbeat article (updated `2024-04-23`) states heartbeats always include `clk`, contain no data payload, and are sent only when no other traffic occurs in the interval (default `5000ms`).
- [A/B] Inference: training and execution should not treat displayed/virtual ladder updates as time-identical to raw ladder updates; replay/state recovery must persist `clk` transitions and heartbeat gaps as first-class sequence metadata.

Extracted data fields to add:
- `betfair_stream_filter_contract_snapshot.capture_ts`
- `betfair_stream_filter_contract_snapshot.filter_name(EX_BEST_OFFERS_DISP)`
- `betfair_stream_filter_contract_snapshot.virtual_price_lag_ms_approx(150)`
- `betfair_stream_heartbeat_contract_snapshot.capture_ts`
- `betfair_stream_heartbeat_contract_snapshot.default_heartbeat_ms(5000)`
- `betfair_stream_heartbeat_contract_snapshot.clk_required_flag`
- `betfair_stream_heartbeat_contract_snapshot.heartbeat_contains_data_flag(false)`
- `betfair_stream_message_audit.event_ts`
- `betfair_stream_message_audit.market_id`
- `betfair_stream_message_audit.clk`
- `betfair_stream_message_audit.message_type(sub_image|update|heartbeat)`
- `betfair_stream_message_audit.gap_since_last_message_ms`
- `betfair_stream_message_audit.virtualised_view_flag`

Model ideas:
- Add `raw_vs_virtual_lag_bucket_ms` features for late-window drift and fill/slippage attribution.
- Add `stream_clock_continuity_score` to downweight windows with heartbeat/clock irregularity.

Execution lessons:
- Use raw-ladder feeds for trigger logic and treat displayed/virtual views as derived UX-context layers.
- Store every `clk` transition and heartbeat interval for deterministic stream replay and outage diagnostics.

Contradiction noted:
- Prior simplification: virtual/displayed and non-virtual ladders were often treated as equivalent late-market inputs. Primary Betfair docs add a documented timing offset (`~150ms`) that can matter in high-frequency late execution.

### Betfair key-tier and in-play timing docs impose hard entitlement/freshness limits that invalidate naive delayed-key research assumptions

- [A] Betfair `Application Keys` docs state two keys are issued (`Live` and `Delayed`), delayed keys are for development, and delayed data can vary from `1-180` seconds.
- [A] The same docs state delayed keys do not return `totalMatched` by selection or `EX_ALL_OFFERS` via `listMarketBook`.
- [A] The same docs state app-key generation is for personal betting use and commercial usage requires explicit Betfair approval.
- [A] Betfair in-play delay docs state in-play order placement is subject to `1-12` second delay and expose this via `betDelay` in `listMarketBook` and stream market definition.
- [A/B] Inference: delayed-key data is unsuitable as execution-quality truth for microstructure research; live-trading and production simulations need entitlement-aware data lineage and delay-state conditioning.

Extracted data fields to add:
- `betfair_app_key_capability_snapshot.capture_ts`
- `betfair_app_key_capability_snapshot.key_type(live|delayed)`
- `betfair_app_key_capability_snapshot.price_delay_min_sec`
- `betfair_app_key_capability_snapshot.price_delay_max_sec`
- `betfair_app_key_capability_snapshot.ex_all_offers_available_flag`
- `betfair_app_key_capability_snapshot.total_matched_by_selection_available_flag`
- `betfair_app_key_capability_snapshot.commercial_approval_required_flag`
- `betfair_market_delay_state.event_ts`
- `betfair_market_delay_state.market_id`
- `betfair_market_delay_state.bet_delay_sec`
- `betfair_market_delay_state.in_play_flag`

Model ideas:
- Add `key_capability_regime` as a required lineage feature so model diagnostics can exclude delayed-key windows for microstructure calibration.
- Add `effective_bet_delay_sec` into fill-probability and queue-position models for in-play segments.

Execution lessons:
- For production research, reject delayed-key captures as primary execution telemetry.
- Always route stake and timing logic through observed `betDelay` rather than fixed assumptions.

Contradiction noted:
- Prior simplification: delayed-key streams were treated as mostly interchangeable for market-structure experiments. Primary docs show materially different field availability and variable delay windows.

### CAW policy disclosures from NYRA and Keeneland now provide machine-readable control and composition signals for late-odds volatility monitoring

- [A] NYRA's `2026-01-30` announcement defines CAW as wager execution speed exceeding `six bets per second` and sets a one-minute-to-post cutoff for pools not previously restricted, while retaining the existing two-minute win-pool rule.
- [A] Keeneland's wagering-experience page discloses two-year wagering mix (`23%` CAW, `44%` ADW, `25%` brick-and-mortar, `8%` on-track), notes odds refresh every `5` seconds in the final two minutes, and states CAW participation is not restricted by wager type/participant.
- [A/B] Inference: CAW-aware modeling should ingest both rule controls (cutoff windows and threshold definitions) and venue composition snapshots (CAW share by meet/period) because volatility dynamics can diverge across policy regimes.

Extracted data fields to add:
- `us_caw_policy_snapshot.capture_ts`
- `us_caw_policy_snapshot.venue_id`
- `us_caw_policy_snapshot.caw_speed_threshold_bets_per_sec`
- `us_caw_policy_snapshot.caw_cutoff_sec_to_post_all_pools`
- `us_caw_policy_snapshot.caw_cutoff_sec_to_post_win_pool`
- `venue_wager_mix_snapshot.capture_ts`
- `venue_wager_mix_snapshot.venue_id`
- `venue_wager_mix_snapshot.caw_share_pct`
- `venue_wager_mix_snapshot.adw_share_pct`
- `venue_wager_mix_snapshot.ontrack_share_pct`
- `venue_wager_mix_snapshot.brick_mortar_share_pct`
- `venue_wager_ui_refresh_contract.odds_refresh_sec_final_window`

Model ideas:
- Add `caw_policy_regime_id` and `venue_caw_share_pct` as regime features in late-drift and odds-jump models.
- Add `ui_refresh_alias_risk` features for public-odds divergence monitoring where display cadence can mask pending pool updates.

Execution lessons:
- Keep venue-specific cutoff calendars rather than a global CAW cutoff assumption.
- Segment odds-volatility diagnostics by declared CAW-share regime before attributing model errors to feature weakness.

Contradiction noted:
- Prior simplification: CAW effects were often treated as generic industry behavior. New primary track disclosures expose venue-specific thresholds, cutoff times, and participation mix.

### Australian provider contract additions: Punting Form exposes useful coverage signals, but entitlement boundaries differ across retail and commercial pathways

- [A] Punting Form's sectional-data docs state raw sectionals have been captured for `92%+` of races since `2012` and wide-position data since `2014`, with minimum marker coverage described explicitly.
- [A] Punting Form's endpoint docs state sectionals endpoints are available to `Modeller` and commercial subscriptions and require token authentication.
- [A] Punting Form's developer API page states Pro-member API access is for personal use only.
- [A/B] Inference: provider comparison must separate `coverage quality` from `deployment rights`; high-coverage feeds can still be unusable for production if entitlement tier is personal-use only.

Extracted data fields to add:
- `provider_coverage_claim_snapshot.capture_ts`
- `provider_coverage_claim_snapshot.provider_name`
- `provider_coverage_claim_snapshot.metric_name(raw_sectional_coverage_pct)`
- `provider_coverage_claim_snapshot.metric_value(92_plus)`
- `provider_coverage_claim_snapshot.coverage_start_year`
- `provider_coverage_claim_snapshot.wide_position_start_year`
- `provider_endpoint_entitlement_snapshot.capture_ts`
- `provider_endpoint_entitlement_snapshot.endpoint_name`
- `provider_endpoint_entitlement_snapshot.required_subscription_tier`
- `provider_endpoint_entitlement_snapshot.personal_use_only_flag`
- `provider_endpoint_entitlement_snapshot.token_auth_required_flag`

Model ideas:
- Add `provider_rights_score` and `provider_coverage_score` as separate procurement gates in source-selection optimization.
- Add feature-lineage tags tying every derived sectional feature to provider entitlement tier at extraction time.

Execution lessons:
- Do not promote provider-dependent features to live if contractual tier is personal-use only.
- Maintain automated entitlement checks that block strategy promotion when rights downgrade or tier mismatch is detected.

Contradiction noted:
- Prior simplification: provider readiness was often inferred from data richness alone. Punting Form primary docs show coverage and legal usability are separate dimensions.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is market-microstructure and entitlement mechanics (Betfair stream/key contracts, venue-level CAW controls, provider rights/coverage constraints), not new internal model details from those operators.

## Source notes (incremental additions for pass 124)

- Betfair Developer Program, `What Betfair Exchange market data is available from listMarketBook & Stream API?` (updated 2026-03-27; includes `EX_BEST_OFFERS_DISP` note that virtual prices are updated ~150ms after non-virtual stream; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/6540502258077-What-Betfair-Exchange-market-data-is-available-from-listMarketBook-Stream-API
- Betfair Developer Program, `Market Streaming - How do the Heartbeat and Conflation requests work?` (updated 2024-04-23; heartbeat semantics and default interval; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360000402611-Market-Streaming-How-do-the-Heartbeat-and-Conflation-requests-work
- Betfair Exchange API docs, `Additional Information` (Betfair price increments and `INVALID_ODDS` behavior; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/pages/viewpage.action?pageId=2691053
- Betfair Exchange API docs, `Application Keys` (live vs delayed capabilities, delay windows, commercial-usage approval requirement; accessed 2026-04-03): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687105/Application%20Keys
- Betfair Developer Program, `Why do you have a delay on placing bets on a market that is in-play` (in-play delay range and `betDelay` fields; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360002825652-Why-do-you-have-a-delay-on-placing-bets-on-a-market-that-is-in-play
- NYRA, `NYRA to implement new guardrails for CAW activity` (published 2026-01-30; CAW threshold and timing restrictions; accessed 2026-04-03): https://www.nyra.com/aqueduct/news/nyra-to-implement-new-guardrails-for-caw-activity/
- Keeneland, `Wagering Experience` (venue CAW-share disclosure and odds refresh cadence; accessed 2026-04-03): https://www.keeneland.com/wagering-experience
- Punting Form docs, `Sectional Data` (coverage claims and marker/wide-position coverage windows; accessed 2026-04-03): https://docs.puntingform.com.au/docs/sectional-data
- Punting Form docs, `Sectionals` endpoint (subscription-tier and auth requirements; accessed 2026-04-03): https://docs.puntingform.com.au/reference/meetingsectionals
- Punting Form, `Developer API` (Pro-member API and personal-use-only statement; accessed 2026-04-03): https://www.puntingform.com.au/developer/api/

## Incremental sourced findings added in this run (2026-04-03, pass 125)

### Podium's horse-racing API product page adds a first-party rights-topology constraint that changes provider onboarding design

- [A/B] Podium's official horse-racing API page states coverage across `300+` international racecourses and offers both `RESTful` and `PUSH` delivery options.
- [A/B] The same page states that `multiple rights owner agreements are needed` to access full coverage.
- [A/B] Inference: AU provider onboarding should treat rights topology as a first-class graph (rights-owner agreements by jurisdiction/feed family), not a single binary provider entitlement flag.

Extracted data fields to add:
- `provider_rights_topology_snapshot.capture_ts`
- `provider_rights_topology_snapshot.provider_name`
- `provider_rights_topology_snapshot.claimed_racecourse_count`
- `provider_rights_topology_snapshot.delivery_modes(rest|push)`
- `provider_rights_topology_snapshot.multiple_rights_owner_agreements_required_flag`
- `provider_rights_topology_snapshot.full_coverage_requires_multi_agreement_flag`
- `provider_rights_owner_agreement_status.rights_owner_id`
- `provider_rights_owner_agreement_status.jurisdiction`
- `provider_rights_owner_agreement_status.agreement_state(missing|pending|active|expired)`
- `provider_rights_owner_agreement_status.coverage_scope`

Model ideas:
- Add `rights_topology_completeness_score` as a hard gate on feature families sourced via multi-rights-owner providers.
- Add `agreement_state_regime` features so training/serving lineage can exclude windows where rights coverage is partial.

Execution lessons:
- Separate `transport capability` (REST/PUSH) from `rights completeness`; both are required for production promotion.
- Route provider fallback logic by rights-owner gap (which races/features are legally unavailable), not only by endpoint uptime.

Contradiction noted:
- Prior simplification: provider entitlement was modeled mostly as one contract per provider. Podium's own product page explicitly signals multi-rights-owner agreement dependencies for full coverage.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is AU provider entitlement topology (multi-rights-owner dependency), not new syndicate internal-method disclosures.

## Source notes (incremental additions for pass 125)

- Podium, `Horse Racing API - Real-Time Data & Betting Markets` (claims `300+` racecourses, REST/PUSH delivery, and explicit multi-rights-owner agreement requirement for full coverage; accessed 2026-04-03): https://podiumsports.com/horse-racing-api/

## Incremental sourced findings added in this run (2026-04-03, pass 126)

### Betfair operational entitlement controls add account-state and geolocation regimes that can invalidate market-availability assumptions

- [A] Betfair support states a Live Application Key can still return delayed data when the account is not funded or when an override is applied.
- [A] Betfair support states Live App Key activation currently requires KYC-complete account status and a one-off `GBP 299` activation fee.
- [A] Betfair support states certain market visibility is location-constrained (for example, Germany returns empty market responses for affected endpoints) and that Singapore horse-racing markets are returned only to AUS/NZ customers.
- [A/B] Inference: "live key" is not a sufficient execution-fidelity guarantee by itself; effective data regime is a function of key type, account state, and legal location filters.

Extracted data fields to add:
- `betfair_account_runtime_state.capture_ts`
- `betfair_account_runtime_state.account_funded_flag`
- `betfair_account_runtime_state.delay_override_applied_flag`
- `betfair_account_runtime_state.effective_price_delay_regime(live|delayed|override_delayed)`
- `betfair_app_key_activation_contract.capture_ts`
- `betfair_app_key_activation_contract.activation_fee_gbp`
- `betfair_app_key_activation_contract.kyc_required_flag`
- `betfair_app_key_activation_contract.live_read_only_permitted_flag`
- `betfair_geo_market_visibility_rule.capture_ts`
- `betfair_geo_market_visibility_rule.country_or_ip_scope`
- `betfair_geo_market_visibility_rule.endpoint_name`
- `betfair_geo_market_visibility_rule.empty_response_expected_flag`
- `betfair_geo_market_visibility_rule.market_scope_text`

Model ideas:
- Add `effective_data_regime` as a mandatory lineage feature so CLV/slippage calibration excludes account-delayed windows even on nominally live keys.
- Add `geo_visibility_regime` flags to market-universe coverage diagnostics to distinguish true liquidity absence from legally filtered responses.

Execution lessons:
- Add pre-session checks for funded state and override status; fail closed if execution environment is unintentionally delayed.
- Separate "no markets returned" failures into transport errors vs legal/geolocation filtering outcomes.
- Treat live-key activation requirements and cost as explicit onboarding gates in environment promotion checklists.

Contradiction noted:
- Prior simplification: a Live App Key implied live, full-fidelity execution conditions. Primary Betfair support evidence shows account and location controls can still force delayed or empty-response regimes.

### Racing Queensland authority artifacts now provide stronger, machine-usable entitlement and reporting topology

- [A] Racing Queensland's race-information page states the current authority period runs from `2025-07-01` to `2027-06-30`, and includes direct links for updated FY26-27 general conditions and submission templates.
- [A] The same page publishes distinct reporting-template pathways for operators above and below `A$5M` submission thresholds, including FTP instructions.
- [A] The FY26-27 vs FY24-25 comparison PDF includes an explicit `Approved Supplier` definition list (Racing Australia, AAP, Live Datacast/BettorData, GRV, RISE, RWWA, BetMakers), which is directly useful for source-contract normalization.
- [A/B] Inference: Queensland entitlement compliance is not just provider-level; it is period-, turnover-band-, and approved-supplier-graph dependent.

Extracted data fields to add:
- `qld_authority_period.capture_ts`
- `qld_authority_period.effective_from`
- `qld_authority_period.effective_to`
- `qld_authority_period.application_fee_aud`
- `qld_submission_pathway.capture_ts`
- `qld_submission_pathway.turnover_band(under_5m|over_5m)`
- `qld_submission_pathway.template_effective_from`
- `qld_submission_pathway.delivery_channel(ftp|portal)`
- `qld_approved_supplier_snapshot.capture_ts`
- `qld_approved_supplier_snapshot.authority_period`
- `qld_approved_supplier.provider_name`
- `qld_approved_supplier.provider_abn`

Model ideas:
- Add jurisdiction-band-aware fee/reporting transforms so post-fee edge and reconciliation logic branch correctly by QLD turnover template band.
- Add provider-normalization features keyed to approved-supplier membership to reduce source-lineage ambiguity in AU multi-feed merges.

Execution lessons:
- Version-control Queensland authority artifacts by period and turnover band, then replay backtests under period-correct reporting pathways.
- Use approved-supplier snapshots as a contract-validation input before enabling new upstream feeds in production environments.

Contradiction noted:
- Prior simplification: Queensland compliance was represented mostly as a single authority flag. Current primary artifacts show multi-axis compliance (period + submission band + supplier definitions).

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is operational/regulatory microstructure (Betfair account-state and geolocation regimes) plus Queensland entitlement topology.

## Source notes (incremental additions for pass 126)

- Betfair Developer Program, `Why am I receiving delayed data when using a 'live' Application Key?` (updated 2025-10-30; account-funded/override delayed-data condition; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003886711-Why-am-I-receiving-delayed-data-when-using-a-live-Application-Key
- Betfair Developer Program, `How do I activate my Live App Key?` (updated 2026-01-02; KYC and one-off `GBP 299` activation fee; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/115003860331-How-do-I-activate-my-Live-App-Key
- Betfair Developer Program, `Why do markets not appear in the listEvents, listMarketCatalogue or listMarketBook API response?` (updated 2025-11-28; legal-location filtering and Singapore horse-market AUS/NZ availability note; accessed 2026-04-03): https://support.developer.betfair.com/hc/en-us/articles/360004831131-Why-do-markets-not-appear-in-the-listMarketCatalogue-API-response
- Racing Queensland, `Race Information` page (current authority-period, conditions, and template pathways; accessed 2026-04-03): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information
- Racing Queensland, `General Conditions for the use of Queensland Race Information` FY26-27 vs FY24-25 comparison PDF (contains `Approved Supplier` definition list and clause-level updates; published 2025-06-03; accessed 2026-04-03): https://www.racingqueensland.com.au/getmedia/941172be-704a-4f85-ad38-4288ad9d6346/20250603-FY26-27-RFF-General-Conditions-vs-FY24-25-RFF-General-Conditions-Comparison.pdf

## Incremental sourced findings added in this run (2026-04-03, pass 127)

### Racing Victoria integrity-sharing clauses now expose concrete disclosure timing and scope controls that should be machine-enforced

- [A] RV Standard Conditions (effective `2025-03-01`) specify explicit permitted-use and disclosure pathways for integrity data, including allowed disclosures to law-enforcement, regulators, PRAs, clubs, and advisers under confidentiality constraints.
- [A] Clause `5.9.1` requires RVL to notify the Approved WSP of disclosure "as soon as practicable" and no later than `3 Business Days` after disclosure.
- [A/B] Inference: integrity-data governance is not a binary "shared/not shared" state; it is a timed disclosure-control workflow that should be auditable as a first-class operational contract.

Extracted data fields to add:
- `rv_integrity_disclosure_event.capture_ts`
- `rv_integrity_disclosure_event.request_id`
- `rv_integrity_disclosure_event.disclosure_recipient_type(law_enforcement|gambling_regulator|pra|club|advisor|auditor|other_confidential_body)`
- `rv_integrity_disclosure_event.disclosure_ts`
- `rv_integrity_disclosure_event.notification_sent_ts`
- `rv_integrity_disclosure_event.notification_within_3bd_flag`
- `rv_integrity_disclosure_event.confidentiality_agreement_required_flag`

Model ideas:
- Add an `integrity_disclosure_governance_state` feature to downweight records with unresolved disclosure/audit metadata.
- Add a compliance-latency feature (`disclosure_to_notification_lag_business_days`) to monitor policy-process drift.

Execution lessons:
- Persist every integrity disclosure as an auditable event and enforce the 3-business-day notification check.
- Treat confidentiality-agreement requirements as contract gates in data-sharing pipelines, not legal footnotes.

Contradiction noted:
- Prior simplification: integrity sharing was modeled mostly as on-demand requests. RV clauses show a structured disclosure graph with explicit timing duties.

### RV minimum-bet exclusions include identity-validation and delegated-account pathways that should change account-level execution policy

- [A] RV clause `12.3.2` allows ongoing exclusion from minimum-bet obligations for specific risk/integrity cases, including non-beneficial ownership suspicion supported by verifiable signals (for example public records, IP tracking, unique-device tracking), prior fraud, self-exclusion, and unauthorized scraping.
- [A] RV clause `12.3.3` states approved delegated-account use for non-recreational account holders should not be unreasonably denied or unduly delayed when notice/ID/conditions are satisfied.
- [A/B] Inference: minimum-bet eligibility is an evidence-backed account-state machine, not only a static customer classification.

Extracted data fields to add:
- `rv_min_bet_exclusion_event.capture_ts`
- `rv_min_bet_exclusion_event.account_id`
- `rv_min_bet_exclusion_event.exclusion_reason_code`
- `rv_min_bet_exclusion_event.evidence_source(ip_tracking|device_tracking|public_record|fraud_history|self_exclusion|scraping|legal_block|rvl_notice)`
- `rv_min_bet_exclusion_event.permanent_or_ongoing_flag`
- `rv_delegated_account_approval.capture_ts`
- `rv_delegated_account_approval.primary_account_id`
- `rv_delegated_account_approval.delegate_identity_verified_flag`
- `rv_delegated_account_approval.approval_outcome(approved|denied|pending)`
- `rv_delegated_account_approval.unreasonable_delay_flag`

Model ideas:
- Add `minimum_bet_eligibility_state` features to execution simulation so expected fill and hedge capacity incorporate policy-driven account eligibility.
- Train a separate policy-risk model for exclusion-trigger propensity by account behavior/metadata quality.

Execution lessons:
- Keep a verifiable-evidence ledger for every exclusion decision used in routing or reporting.
- Treat delegated-account approval states as active execution constraints, not compliance-only records.

Contradiction noted:
- Prior simplification: minimum-bet logic was mostly amount/time thresholds. RV terms add explicit evidence and approval-process semantics.

### RV fee algebra defines turnover components (including promotional and cash-out handling) that materially affect edge accounting

- [A] RV Schedule 1 definitions state `Bets Taken` includes amounts paid or contracted, includes certain lay-off-linked transactions, and is not reduced for promotional/non-winning returns except validly cancelled bets.
- [A] The same schedule separately defines `Cash Out Bets Paid` and related treatment, with exclusions for combinations involving free bets and multi-leg constructs.
- [A/B] Inference: naive turnover/payout transforms can materially misstate assessable revenue unless schedule-level inclusion/exclusion logic is encoded exactly.

Extracted data fields to add:
- `rv_fee_algebra_snapshot.capture_ts`
- `rv_fee_algebra_snapshot.bets_taken_includes_promotional_nonwinning_flag`
- `rv_fee_algebra_snapshot.valid_cancellation_refund_adjustment_flag`
- `rv_fee_algebra_snapshot.free_bet_excluded_flag`
- `rv_fee_algebra_snapshot.commission_rebate_incentive_excluded_flag`
- `rv_fee_algebra_snapshot.pooling_fee_excluded_flag`
- `rv_fee_algebra_snapshot.jackpot_allocated_excluded_flag`
- `rv_fee_algebra_snapshot.seeding_excluded_flag`
- `rv_cashout_treatment_snapshot.cashout_component_defined_flag`

Model ideas:
- Add a jurisdiction-specific `assessable_revenue_formula_version` feature to post-fee edge analytics.
- Run sensitivity tests comparing naive turnover formulas vs schedule-accurate formulas for profitability attribution.

Execution lessons:
- Compute fee-exposed economics from clause-level formula contracts, not shorthand turnover metrics.
- Version fee algebra by effective date and replay backtests with period-correct formulas.

Contradiction noted:
- Prior simplification: fee modeling relied on coarse turnover-minus-payout transformations. RV Schedule 1 definitions impose finer inclusion/exclusion rules.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is Australian policy/fee contract detail (RV integrity disclosure protocol, minimum-bet exclusion state machine, and schedule-level fee algebra).

## Source notes (incremental additions for pass 127)

- Racing Victoria, `Standard Conditions of Approval - Effective 1 March 2025` (integrity disclosure timing/recipient pathways, minimum-bet exclusion/delegated-account clauses, and Schedule 1 fee algebra definitions; accessed 2026-04-03): https://dxp-cdn.racing.com/api/public/content/20250217-Standard-Conditions_Effective-1-March-2025-%28clean%29-923694.pdf?v=8a80950f
- Racing Victoria, `Race Fields Policy` page (current policy bundle index linking clean/marked-up standard conditions and FY25/26 guide; accessed 2026-04-03): https://www.racingvictoria.com.au/wagering/race-fields-policy

## Incremental sourced findings added in this run (2026-04-03, pass 128)

### ACT race-field approval pack (2024-2027) adds a distinct fee and audit regime that should be modeled separately from NSW/QLD/RV

- [A] Canberra Racing Club's ACT Race Field Information application/renewal pack (2024-2027) states operators commit an offence if they use ACT race-field information without approval, and applications should be lodged at least `30 days` before intended use.
- [A] The same document sets explicit ACT fee formulas with `no exempt turnover threshold`: `3.0%` turnover for totalisator and fixed-odds, `3.5%` turnover for non-totalisator/non-fixed derivations, and `2.0%` of betting-exchange `net customer winnings` (negative net deemed zero).
- [A] The pack requires monthly certified returns by the `14th` day after the turnover month, states initial approvals run to `30 June 2027`, and reserves audit rights over the preceding `three financial years`.
- [A] Conditions also require operators to maintain a proper wager record/audit trail and notify significant events (for example control or financial-position changes, or prosecutions/disciplinary actions).
- [A/B] Inference: ACT should be treated as a standalone cost/compliance regime with its own fee algebra, filing calendar, and audit-depth assumptions, not folded into generic east-coast defaults.

Extracted data fields to add:
- `act_rfi_approval_snapshot.capture_ts`
- `act_rfi_approval_snapshot.approval_required_flag`
- `act_rfi_approval_snapshot.apply_min_lead_days`
- `act_rfi_fee_formula_snapshot.capture_ts`
- `act_rfi_fee_formula_snapshot.totalisator_turnover_rate`
- `act_rfi_fee_formula_snapshot.fixed_odds_turnover_rate`
- `act_rfi_fee_formula_snapshot.derived_non_totalisator_turnover_rate`
- `act_rfi_fee_formula_snapshot.betting_exchange_net_winnings_rate`
- `act_rfi_fee_formula_snapshot.negative_net_customer_winnings_floor_zero_flag`
- `act_rfi_reporting_snapshot.return_due_day_of_following_month`
- `act_rfi_reporting_snapshot.exempt_turnover_threshold_flag`
- `act_rfi_audit_snapshot.audit_lookback_years`
- `act_rfi_approval_snapshot.approval_period_end`

Model ideas:
- Add an ACT-specific post-fee transform for exchange and fixed-odds paths using the published fee basis differences (turnover vs net winnings).
- Add a compliance-latency risk feature keyed to ACT monthly return due dates and audit-trail completeness.

Execution lessons:
- Keep ACT fee and reporting transforms in a jurisdiction-specific module; do not reuse NSW/QLD/RV defaults.
- Require immutable wager-level audit trails for ACT-tagged turnover before promoting strategies that rely on ACT race information.

Contradiction noted:
- Prior simplification: ACT was treated as a minor extension of broader AU race-field settings. Primary ACT pack evidence shows materially distinct formulas, deadlines, and audit rights.

### ACT minimum-bet framework defines race-tier limits, product exclusions, and complaint clocks that impact execution feasibility

- [A] Canberra Racing Club's ACT Minimum Bet Limits Conditions and FAQ state fixed-odds obligations apply to ACT thoroughbred races with race-tier caps of `A$2,000` win/each-way (`A$800` place component) for carnival/Black Opal class meetings and `A$1,000` (`A$400` place component) for standard meetings.
- [A] The same documents specify scope exclusions including betting-exchange bets, place-only bets, free/bonus bets, multi bets, and pre-9am race-day bets.
- [A] They also define operational exceptions (for example insufficient funds, stale price transitions, and integrity-linked account actions such as fraud/AML/non-beneficial-owner concerns) and clarify the limit applies once per horse per customer/related customers.
- [A] Complaint handling is explicitly time-bounded: complaints should be lodged within `14 days` of the relevant incident.
- [A/B] Inference: ACT minimum-bet eligibility is a state machine with race-tier and product-type gating; naive fixed-odds "always lay to limit" assumptions will overstate executable capacity.

Extracted data fields to add:
- `act_mbl_limit_snapshot.capture_ts`
- `act_mbl_limit_snapshot.race_tier(carnival_black_opal|standard)`
- `act_mbl_limit_snapshot.win_each_way_limit_aud`
- `act_mbl_limit_snapshot.place_component_limit_aud`
- `act_mbl_scope_rule.product_type`
- `act_mbl_scope_rule.in_scope_flag`
- `act_mbl_scope_rule.pre_9am_excluded_flag`
- `act_mbl_account_exception.reason_code`
- `act_mbl_account_exception.integrity_reason_flag`
- `act_mbl_once_per_horse_rule.enabled_flag`
- `act_mbl_complaint_window.days_from_incident`

Model ideas:
- Add ACT race-tier-aware expected-fill caps in fixed-odds simulation.
- Add product-scope filters so excluded bet families are removed before computing minimum-bet constrained opportunity size.

Execution lessons:
- Evaluate minimum-bet feasibility after product/race-tier filters, not only at account level.
- Store evidence for ACT account-level exceptions and related-customer checks to support dispute/review workflows.

Contradiction noted:
- Prior simplification: minimum-bet logic was handled as mostly jurisdiction-wide fixed thresholds. ACT evidence adds race-tier limits, explicit product exclusions, and a strict complaint timeline.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new high-signal this pass is ACT policy/entitlement contract detail, not new internal model disclosures from named operators.

## Source notes (incremental additions for pass 128)

- Canberra Racing Club, `Information on and Application to Use ACT Race Field Information (2024-2027)` (approval requirement, fee formulas, reporting deadlines, approval horizon, and audit rights; accessed 2026-04-03): https://admin.thoroughbredpark.com.au/sites/default/files/2024-04/ACT%20RFL%20Information%20%26%20%20Application%20Renewal%20%202024-2027.pdf
- Canberra Racing Club, `ACT Thoroughbred Race Field Information Use Minimum Bet Limits Conditions` (race-tier minimum-bet limits, exclusions, and operational exceptions; accessed 2026-04-03): https://admin.thoroughbredpark.com.au/sites/default/files/2021-09/ACT_Thoroughbred_Race_Field_Information_Use_Minimum_Bet_Limits_Conditions.pdf
- Canberra Racing Club, `ACT Thoroughbred Race Field Information Use Minimum Bet Limits Frequently Asked Questions` (commencement, scope clarifications, one-bet-to-limit semantics, and complaint timing; accessed 2026-04-03): https://thoroughbredpark.com.au/sites/default/files/2021-08/2017_Frequently_Asked_Questions.pdf
- Canberra Racing Club, `ACT Thoroughbred Race Field Information Use Minimum Bet Limits Complaint Form` (complaint taxonomy and required evidence fields; accessed 2026-04-03): https://thoroughbredpark.com.au/sites/default/files/2021-10/ACT-THOROUGHBRED-RACE-FIELD-INFORMATION-USE-MINIMUM-BET-LIMITS-COMPLAINTS-FORM.pdf

## Incremental sourced findings added in this run (2026-04-04, pass 129)

### HKJC outbound commingling notice adds explicit fallback semantics when partner-pool merge fails

- [A] HKJC's outbound-commingling notice states Win/Place bets on designated French simulcast races are merged into PMU pools under modified PMU rules.
- [A] The same notice states if outbound bets cannot be included in PMU pools, dividends are calculated from Hong Kong pool-only bets, still using PMU calculation formula.
- [A] HKJC also notes Place odds shown are minimum-in-range values until the partner-pool process finalizes.
- [A/B] Inference: commingled pools need an explicit runtime `merge_success` state; otherwise modeled pool depth and realized payout logic can diverge from expected partner-pool behavior.

Extracted data fields to add:
- `commingling_runtime_state.capture_ts`
- `commingling_runtime_state.partner_pool_operator`
- `commingling_runtime_state.merge_success_flag`
- `commingling_runtime_state.fallback_to_local_pool_flag`
- `commingling_runtime_state.partner_formula_applied_flag`
- `commingling_runtime_state.place_odds_min_range_flag`

Model ideas:
- Add a commingling-fallback feature for payout and slippage attribution in tote/commingled contexts.
- Add confidence penalties for snapshots captured while place odds are minimum-range placeholders.

Execution lessons:
- Log a pool-regime event whenever commingling fails so post-race reconciliation uses the correct payout branch.
- Separate pre-off and final-dividend quality checks for place pools where displayed odds are range minima.

Contradiction noted:
- Prior simplification: commingled pools were handled as always-merged partner pools. HKJC primary text documents a real fallback branch with local-pool dividend computation.

### Punting Form Modeller page adds deployability-relevant detail on PIT and Betfair flucs under personal-vs-commercial scope split

- [A] Punting Form Modeller page states API access includes historical Betfair prices/flucs data and point-in-time modelling data options.
- [A] The same page states Modeller is for personal use only and company use requires separate commercial pricing/terms.
- [A/B] Inference: feature availability and legal deployment rights are separable dimensions that should be tracked independently in provider readiness.

Extracted data fields to add:
- `provider_capability_snapshot.includes_historical_betfair_flucs_flag`
- `provider_capability_snapshot.includes_point_in_time_pack_flag`
- `provider_scope_snapshot.personal_use_only_flag`
- `provider_scope_snapshot.commercial_terms_required_flag`

Model ideas:
- Add feature-value ablations comparing PIT + flucs bundles against baseline sectionals-only features, gated by deployable entitlement state.

Execution lessons:
- Permit personal-scope datasets only in sandbox/offline experiments and hard-block production promotion without commercial entitlement artifacts.

Contradiction noted:
- Prior simplification: provider capability and provider deployability were frequently treated as one readiness dimension. This source reinforces capability/rights separation.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec internals.
- [A/B] Net-new this pass is commingled-pool fallback mechanics and provider scope/capability separation, not fresh internal model disclosures from named operators.

## Source notes (incremental additions for pass 129)

- Hong Kong Jockey Club, `Outbound commingling on designated simulcast races from France commences` (PMU merge rules, fallback branch, and place-odds range behavior; accessed 2026-04-04): https://racingnews.hkjc.com/english/2019/10/04/outbound-commingling-on-designated-simulcast-races-from-france-commences/
- Punting Form, `Modeller` product page (historical Betfair flucs/PIT option signal and personal-vs-commercial scope split; accessed 2026-04-04): https://puntingform.com.au/products/modeller

## Incremental sourced findings added in this run (2026-04-04, pass 130)

### Benter's primary exotic-order correction adds explicit parameterized de-biasing beyond naive Harville

- [A] Benter (1994) shows Harville-order estimates are significantly biased for second/third-place conditionals, with low-probability horses occurring more often than Harville predicts and high-probability horses less often.
- [A] On Benter's cited sample (`3,198` races), he fits maximum-likelihood correction parameters (`gamma=0.81` for second-place conditioning and `delta=0.65` for third-place conditioning) and reports materially improved expected-vs-actual fit after applying the correction equations.
- [A/B] Inference: exotic pricing should treat finish-order randomness as a calibrated, venue-dependent process; fixed textbook Harville assumptions are structurally misspecified for production staking.

Extracted data fields to add:
- `exotic_order_model_snapshot.capture_ts`
- `exotic_order_model_snapshot.base_formula(harville|harville_corrected)`
- `exotic_order_model_snapshot.gamma_second_place`
- `exotic_order_model_snapshot.delta_third_place`
- `exotic_order_model_snapshot.fit_sample_races`
- `exotic_order_model_snapshot.fit_sample_horses_second`
- `exotic_order_model_snapshot.fit_sample_horses_third`
- `exotic_order_model_snapshot.calibration_track_group`
- `exotic_order_model_snapshot.effective_from`
- `exotic_order_model_snapshot.effective_to`

Model ideas:
- Train `gamma`/`delta` as time-varying jurisdiction-track parameters rather than global constants.
- Add an `exotic_model_misspecification_risk` feature triggered when live runner-distribution drift exceeds the fitted Harville-correction regime.

Execution lessons:
- Block exotic deployment unless corrected-order calibration is fit and validated on jurisdiction-matched data.
- Re-estimate correction parameters on schedule and during regime changes (track configuration or market-participant shifts).

Contradiction noted:
- Prior simplification: "conditional finish-order simulation" was treated as sufficient directionally. The primary paper provides concrete parameterized correction mechanics that should be explicitly persisted and monitored.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A] Net-new primary methodological detail this pass is from Benter's own 1994 paper on exotic-order bias correction and fitted parameterization.
- [A/B] No net-new primary internal-method disclosures were identified this pass for Alan Woods, David Walsh, Zeljko Ranogajec, or named CAW-team internals.

## Source notes (incremental additions for pass 130)

- William Benter, `Computer Based Horse Race Handicapping and Wagering Systems: A Report` (Harville-bias discussion, corrected-order equations, and fitted `gamma=0.81`, `delta=0.65` on `3,198`-race sample; accessed 2026-04-04): https://gwern.net/doc/statistics/decision/1994-benter.pdf

## Incremental sourced findings added in this run (2026-04-04, pass 131)

### Racing Australia Materials page adds explicit publication-latency and manual-operations signals for results and form production

- [A] Racing Australia's `Materials` page states race results are usually received on race day within `40 minutes` of each race, with the majority now within `20 minutes`.
- [A] The same page states the team runs a full seven-day roster to monitor result receipt/accuracy for evening and weekend meetings and supports growing commercial clients.
- [A] The page also states RA records `Positions in-Running` for all TAB meetings and produces race summaries, speed maps, and form comments using stewards comments, vet checks, and first-up/second-up stats.
- [A/B] Inference: key upstream provider artifacts in the AU stack are operationally curated with non-zero publication lag, so PIT/settlement assumptions must model receipt latency and manual-operations windows directly.

Extracted data fields to add:
- `ra_materials_operating_snapshot.capture_ts`
- `ra_materials_operating_snapshot.results_received_within_20m_majority_flag`
- `ra_materials_operating_snapshot.results_received_within_40m_typical_flag`
- `ra_materials_operating_snapshot.seven_day_roster_flag`
- `ra_materials_operating_snapshot.positions_in_running_all_tab_flag`
- `ra_materials_operating_snapshot.form_comment_input_set(stewards|vet|first_up|second_up|racing_pattern)`
- `provider_publication_latency_observation.provider(ra_materials)`
- `provider_publication_latency_observation.artifact(results|positions_in_running|form_comments)`
- `provider_publication_latency_observation.observed_lag_minutes`

Model ideas:
- Add `provider_publication_lag` features to penalize training labels/features sourced before declared publication windows.
- Build a source-reliability prior that downweights near-off strategies reliant on artifacts with manual curation and delayed receipt semantics.

Execution lessons:
- Gate settlement- and replay-ready states on observed provider publication clocks, not only race completion timestamps.
- Keep manual-operations metadata in lineage so latency spikes can be attributed to provider workflow regimes rather than model drift.

Contradiction noted:
- Prior simplification: race results/form-adjacent artifacts were often treated as near-immediate feed outputs. RA Materials language explicitly documents meaningful same-day lag and staffed manual operations.

### KeenelandSelect wagering FAQ adds channel-level odds-refresh and host-track early-close semantics that should be modeled separately from pool-close rules

- [A/B] KeenelandSelect's `General Wager FAQ` states current odds are updated every `60` seconds or less, increasing frequency closer to post.
- [A/B] The same FAQ states wagers can be shut out before post because some host tracks close wagering early, and recommends placing bets as early as possible.
- [A/B] Inference: customer-facing ADW clock behavior (odds refresh and acceptance windows) is a separate microstructure layer from official pool-close/tote computation; both must be captured in execution simulation.

Extracted data fields to add:
- `adw_channel_clock_snapshot.capture_ts`
- `adw_channel_clock_snapshot.channel_name`
- `adw_channel_clock_snapshot.odds_refresh_interval_sec_max`
- `adw_channel_clock_snapshot.refresh_accelerates_near_post_flag`
- `adw_channel_clock_snapshot.host_track_early_close_possible_flag`
- `adw_channel_clock_snapshot.shut_out_guidance_present_flag`
- `adw_acceptance_window_observation.channel_name`
- `adw_acceptance_window_observation.race_id`
- `adw_acceptance_window_observation.last_accept_ts`
- `adw_acceptance_window_observation.official_post_ts`

Model ideas:
- Add an `adw_visibility_gap` feature family measuring stale displayed odds risk versus official pool dynamics near jump.
- Train a `shut_out_probability` model using channel + host-track + seconds-to-post context for realistic expected-fill simulation.

Execution lessons:
- Do not assume customer-facing odds cadence matches tote microstructure cadence near post.
- Route late execution through channels with empirically tighter acceptance windows and faster refresh behavior.

Contradiction noted:
- Prior simplification: pre-off execution cutoffs were treated mostly as pool-level policy times. ADW FAQ evidence shows channel-specific display and acceptance clocks can truncate executable windows earlier.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Net-new high-signal this pass is provider/channel microstructure-operability detail (publication latency and wagering-channel clocks) that constrains deployable execution assumptions.

## Source notes (incremental additions for pass 131)

- Racing Australia, `Materials` page (results receipt latency, seven-day operations model, positions-in-running coverage, and form-comment production inputs; accessed 2026-04-04): https://www.racingaustralia.horse/AboutUs/Materials.aspx
- KeenelandSelect, `General Wager FAQ` (odds refresh cadence and early host-track closure/shut-out semantics; updated 2023-02-03; accessed 2026-04-04): https://support.keenelandselect.com/hc/en-us/articles/360055881472-General-Wager-FAQ

## Incremental sourced findings added in this run (2026-04-04, pass 132)

### Betfair traded-volume updates include an FX-rate reconciliation channel with hourly cadence constraints

- [A] Betfair Developer Support (updated 2025-02-25) states some traded-volume (`trd`) updates are emitted due to foreign-currency exchange-rate changes in cross-currency matches, including nominal decreases in previously reported traded amounts.
- [A] The same source points to `listCurrencyRates` and states currency-rate updates occur once per hour (a few seconds after the hour), Monday-Friday, and are subject to forex-market opening times.
- [A/B] Inference: traded-volume deltas are not purely order-flow events; a distinct FX-reconciliation channel can perturb microstructure features unless volume-change attribution is stateful and currency-aware.

Extracted data fields to add:
- `betfair_traded_volume_reconciliation_event.capture_ts`
- `betfair_traded_volume_reconciliation_event.market_id`
- `betfair_traded_volume_reconciliation_event.selection_id`
- `betfair_traded_volume_reconciliation_event.trd_delta_signed`
- `betfair_traded_volume_reconciliation_event.fx_reconciliation_candidate_flag`
- `betfair_currency_rate_snapshot.capture_ts`
- `betfair_currency_rate_snapshot.rate_effective_ts`
- `betfair_currency_rate_snapshot.update_cadence_hourly_weekday_flag`

Model ideas:
- Add an `fx_reconciliation_window_flag` feature so abrupt `trd` reversals near top-of-hour boundaries are not overfit as liquidity shocks.
- Split traded-volume momentum signals into `order_flow_component` vs `fx_reconciliation_component` before late-window volatility modeling.

Execution lessons:
- Do not trigger aggressiveness increases solely from negative/positive `trd` jumps without checking FX reconciliation state.
- Persist currency-rate snapshots and annotate replay windows so backtests can isolate microstructure-alpha from accounting revaluation artifacts.

Contradiction noted:
- Prior simplification: traded-volume monotonicity was treated as an orderbook-only property. Betfair's own support note documents non-monotonic updates from FX revaluation mechanics.

### BetMakers Core API FAQ adds hard paging-window constraints (`Races` default limit and `MeetingsDated` horizon) that affect AU backfill design

- [A/B] BetMakers Core API FAQ states the `Races` query is limited to 10 races by default unless the query `limit` filter is changed.
- [A/B] The same FAQ states `MeetingsDated` is limited to a 5-day date window.
- [A/B] Inference: AU provider ingestion must include explicit pagination/window tiling logic; otherwise silent under-coverage can occur even when subscriptions and auth are healthy.

Extracted data fields to add:
- `betmakers_query_contract_snapshot.capture_ts`
- `betmakers_query_contract_snapshot.races_default_limit`
- `betmakers_query_contract_snapshot.meetings_dated_max_days`
- `betmakers_query_contract_snapshot.query_limit_override_used_flag`
- `betmakers_backfill_window_audit.capture_ts`
- `betmakers_backfill_window_audit.requested_date_start`
- `betmakers_backfill_window_audit.requested_date_end`
- `betmakers_backfill_window_audit.window_split_count`
- `betmakers_backfill_window_audit.coverage_gap_detected_flag`

Model ideas:
- Add a `provider_window_truncation_risk` feature that downweights samples from ingestion periods lacking full window-tiling evidence.
- Train data-quality classifiers using `coverage_gap_detected_flag` to prevent false alpha from sparse-meeting slices.

Execution lessons:
- Enforce deterministic window tiling (`<=5 days`) and explicit race-limit overrides in every historical catch-up job.
- Block promotion of features derived from BetMakers history when audit logs show unresolved paging/window truncation.

Contradiction noted:
- Prior simplification: provider under-coverage risk was mostly tied to disconnects/throttling. BetMakers FAQ adds deterministic query-shape limits that can truncate datasets without transport failure.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Net-new high-signal this pass is execution-data integrity detail (Betfair FX-driven traded-volume revisions) and AU provider query-window contracts (BetMakers), which constrain deployable microstructure research and ingestion reliability.

## Source notes (incremental additions for pass 132)

- Betfair Developer Program, `Why does traded volume decrease as well as increase?` (updated 2025-02-25; FX-rate-driven `trd` revisions and `listCurrencyRates` hourly weekday cadence note; accessed 2026-04-04): https://support.developer.betfair.com/hc/en-us/articles/360006560978-Why-does-traded-volume-decrease-as-well-as-increase
- BetMakers Docs, `Core API FAQ` (`Races` default limit and `MeetingsDated` 5-day limit; captured 2026-04-04): https://docs.betmakers.com/docs/core-api/faq/index.html

## Incremental sourced findings added in this run (2026-04-04, pass 133)

### Racing Australia's 2024 annual report adds a provider-change-risk channel via NZTR SNS project closure and team redeployment

- [A] Racing Australia's 2024 Annual Report states the NZTR Single National System project was paused in February 2023 and later closed, with Racing Australia recognizing a `$2.356m` impairment tied to the New Zealand development work.
- [A] The same report states the dedicated development team was rationalised and redeployed to other internal projects (including mobile horse-identification tooling and My Horse Racing redevelopment).
- [A/B] Inference: upstream provider/platform capability can change because of portfolio-level capital allocation and project shutdown decisions, not only because of runtime outages or API contract drift.

Extracted data fields to add:
- `provider_change_event.capture_ts`
- `provider_change_event.provider(ra)`
- `provider_change_event.event_type(project_pause|project_closure|team_redeployment|impairment_recognized)`
- `provider_change_event.project_name`
- `provider_change_event.event_effective_date`
- `provider_change_event.capex_or_impairment_amount_aud`
- `provider_change_event.affected_service_domains_json`
- `provider_change_event.source_url`

Model ideas:
- Add a `provider_change_risk_state` feature that elevates expected incident probability and release-lag uncertainty after major project-closure/redeployment events.
- Add event-window robustness checks so model-performance regressions are not misattributed to market behavior when upstream platform governance is shifting.

Execution lessons:
- Treat provider annual reports as first-class telemetry inputs for reliability priors and roadmap-risk scoring.
- Add change-event lineage to postmortems so release-quality shifts can be attributed to platform portfolio changes, not only collector code.

Contradiction noted:
- Prior simplification: provider reliability risk was modeled mainly through live status pages and monthly SLA-style artifacts. Annual-report disclosures add a strategic change channel (project closure + team redeployment) that can move service risk without immediate outage signals.

### Racing Australia's 2024 service-standard tables add throughput baselines and subsystem-specific uptime asymmetry that should shape AU collector SLOs

- [A] Racing Australia's 2024 Annual Report service-standard section reports high annual operational volumes (for example `10,427` registration applications received/completed and `131,313` telephone transactions) and timeliness KPIs with some misses (for example nominations `96.21%` against a `98%` target).
- [A] The same report publishes system-level uptime rows showing heterogeneity across subsystems (for example SNS/StableAssist listed at `100.00%` actual uptime while PABX is listed at `99.08%` on the same table).
- [A/B] Inference: AU ingestion/execution architecture should avoid single aggregate-provider uptime assumptions and instead model channel/subsystem-specific reliability and fallback behavior.

Extracted data fields to add:
- `ra_service_standard_snapshot.capture_ts`
- `ra_service_standard_snapshot.metric_name`
- `ra_service_standard_snapshot.target_pct`
- `ra_service_standard_snapshot.actual_pct`
- `ra_service_standard_snapshot.variation_pct`
- `ra_service_standard_snapshot.annual_volume`
- `ra_system_uptime_snapshot.system_name`
- `ra_system_uptime_snapshot.target_uptime_pct`
- `ra_system_uptime_snapshot.actual_uptime_pct`
- `ra_system_uptime_snapshot.unplanned_downtime_minutes`

Model ideas:
- Add subsystem-weighted provider reliability priors (SNS vs website vs telephony/PABX) rather than a single provider-availability scalar.
- Build throughput-stress scenarios using annual volume baselines to test ingestion headroom and alert thresholds under peak-processing conditions.

Execution lessons:
- Route critical workflows through channels with higher observed uptime or faster fallback paths.
- Maintain per-subsystem error budgets and failover tests; do not let aggregate provider uptime hide weak links.

Contradiction noted:
- Prior simplification: provider uptime and service quality were often treated as near-uniform across channels. Annual-report table evidence shows meaningful subsystem asymmetry and KPI-level misses despite strong aggregate signals.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team methodological disclosure was identified this pass beyond existing venue-policy/operator-process corpus.
- [A] Net-new high-signal this pass is Australian upstream-provider governance/operations evidence from Racing Australia's 2024 audited reporting.

## Source notes (incremental additions for pass 133)

- Racing Australia, `Annual Report 2024` (CEO/project-portfolio disclosures, NZTR SNS closure + impairment, service-standard throughput and subsystem uptime tables; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/newsletters/2024_Racing_Australia_Annual_Report/
- Racing Australia, `Annual Report 2024` service-standard section (registration/timeliness volumes and system uptime rows, including subsystem-level variance; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/newsletters/2024_Racing_Australia_Annual_Report/20/

## Incremental sourced findings added in this run (2026-04-04, pass 134)

### The Jockey Club 2018 transcript adds explicit CAW-share saturation and participant-mix constraints for pari-mutuel modeling

- [A/B] The Jockey Club's 2018 Round Table transcript states computer-assisted wagering had almost doubled in seven years at five analyzed tracks and was estimated at `16-19%` of total handle.
- [A/B] The same transcript states experts cited a natural limit near `20%` because CAW/professional participants require recreational money in the pools to remain profitable.
- [A/B] The transcript also states one analyzed ADW showed `6%` of accounts generating `72%` of handle.
- [A/B] Inference: model and execution assumptions should treat CAW participation as a regime variable with saturation behavior and explicit dependence on non-CAW liquidity share, not a monotonic growth trend.

Extracted data fields to add:
- `market_participant_mix_snapshot.capture_ts`
- `market_participant_mix_snapshot.jurisdiction(us_reference)`
- `market_participant_mix_snapshot.sample_scope_desc(five_tracks_mckinsey_2018)`
- `market_participant_mix_snapshot.caw_handle_share_low_pct`
- `market_participant_mix_snapshot.caw_handle_share_high_pct`
- `market_participant_mix_snapshot.caw_share_natural_limit_est_pct`
- `adw_account_concentration_snapshot.capture_ts`
- `adw_account_concentration_snapshot.top_account_pct`
- `adw_account_concentration_snapshot.handle_share_pct`
- `participant_mix_regime_state.capture_ts`
- `participant_mix_regime_state.recreational_share_proxy_pct`
- `participant_mix_regime_state.caw_saturation_risk_flag`

Model ideas:
- Add a `caw_share_saturation_curve` prior to late-odds-volatility and fill-quality models so CAW-share effects are not extrapolated linearly beyond observed ranges.
- Add a `recreational_liquidity_dependency` feature family that penalizes forecasts when participant-mix concentration suggests reduced non-CAW pool depth.

Execution lessons:
- Segment pool-volatility diagnostics by participant-mix regime before attributing pre-off instability to strategy logic alone.
- Add concentration-aware throttles for late execution when account/participant concentration metrics imply fragile liquidity composition.

Contradiction noted:
- Prior simplification: CAW growth was often treated as an unbounded structural trend. The Jockey Club transcript provides an explicit saturation hypothesis and participant-mix dependency that should be encoded in regime modeling.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Net-new high-signal this pass is participant-mix and concentration structure that bounds CAW-driven microstructure assumptions.

## Source notes (incremental additions for pass 134)

- The Jockey Club, `Round Table Conference (2018) - McKinsey Report Situation Analysis` (CAW share estimate `16-19%`, natural-limit commentary near `20%`, and ADW account concentration example `6%` accounts driving `72%` handle; accessed 2026-04-04): https://jockeyclub.com/default.asp?area=4&section=RT&year=2018

## Incremental sourced findings added in this run (2026-04-04, pass 135)

### Racing Australia's January 2026 service report adds contact-center regime and outbound-communication intensity signals missing from current provider-risk models

- [A] Racing Australia's January 2026 monthly service-standard report records `9,391` inbound and `2,002` outbound Trainers & Racing Services calls, with transaction mix shown as `88.61%` online and `11.39%` phone.
- [A] The same report shows call-service distribution for January 2026 with `85.09%` answered in `<60s`, `7.29%` in `60-120s`, `7.62%` over `120s`, and only `0.26%` abandoned before answer.
- [A] The report also records high outbound communications volume in the same month (`123,937` SMS and `259,777` emails sent by Racing Australia).
- [A/B] Inference: AU provider reliability and publication-latency risk should include `operations-load-state` features derived from call-center and outbound-notification intensity, not only platform uptime/timeliness percentages.

Extracted data fields to add:
- `ra_contact_centre_snapshot.capture_ts`
- `ra_contact_centre_snapshot.calls_inbound_count`
- `ra_contact_centre_snapshot.calls_outbound_count`
- `ra_contact_centre_snapshot.transaction_online_pct`
- `ra_contact_centre_snapshot.transaction_phone_pct`
- `ra_contact_centre_snapshot.answer_lt_60s_pct`
- `ra_contact_centre_snapshot.answer_60_120s_pct`
- `ra_contact_centre_snapshot.answer_gt_120s_pct`
- `ra_contact_centre_snapshot.abandon_before_answer_pct`
- `ra_notification_volume_snapshot.capture_ts`
- `ra_notification_volume_snapshot.sms_sent_count`
- `ra_notification_volume_snapshot.email_sent_count`
- `provider_operations_load_state.capture_ts`
- `provider_operations_load_state.provider(ra)`
- `provider_operations_load_state.contact_load_zscore`
- `provider_operations_load_state.notification_load_zscore`

Model ideas:
- Add a `provider_operations_load_state` feature family to latency/slippage and feature-freshness models so high operational-intensity periods are separated from model-performance drift.
- Add notification-load-conditioned priors for publication latency, with higher uncertainty bands when outbound comms and call-traffic both spike.

Execution lessons:
- Do not use system uptime alone as a proxy for near-off data readiness; operations-channel pressure can rise while uptime remains near-perfect.
- Add runbooks that gate aggressive late execution when provider operations-load states exceed historical p95.

Contradiction noted:
- Prior simplification: provider risk was dominated by system-uptime and publication-timeliness tables. January 2026 operational telemetry shows a distinct contact/communications load regime that can shift operational behavior without infrastructure outage.

### Racing Australia's January 2026 report also exposes genetics-lab throughput and backup-panel turnaround behavior useful for upstream data-quality priors

- [A] The January 2026 report includes Ely 201S Genetics Research Centre throughput counts (`333` thoroughbred parentage testing samples, `130` thoroughbred DNA self-comparison samples, `563` other-breed DNA profiling samples, `1,102` other-breed diagnostics).
- [A] The same section shows turnaround targets vs actuals, including `Tokyo (Backup) panel testing` target `28 days` with actual `4.50 days` (December comparator `18.20 days`).
- [A/B] Inference: upstream identity/registry data dependencies should carry laboratory-turnaround state metadata because turnaround regime shifts can change registration/identity update latency and downstream feature freshness.

Extracted data fields to add:
- `ra_genetics_service_snapshot.capture_ts`
- `ra_genetics_service_snapshot.sample_category`
- `ra_genetics_service_snapshot.samples_processed_count`
- `ra_genetics_service_snapshot.turnaround_target_days`
- `ra_genetics_service_snapshot.turnaround_actual_days`
- `ra_genetics_service_snapshot.turnaround_prior_month_days`
- `ra_genetics_service_snapshot.backup_panel_flag`
- `identity_data_latency_prior.capture_ts`
- `identity_data_latency_prior.provider(ra)`
- `identity_data_latency_prior.source_domain(genetics_registry)`
- `identity_data_latency_prior.turnaround_state(normal|elevated|degraded)`

Model ideas:
- Add `identity_data_latency_prior` as a gating feature for models consuming registry/identity-adjacent inputs (ownership, breeding, or verification-linked covariates).
- Build a lag-adjusted freshness score that penalizes joins to identity artifacts during elevated lab-turnaround regimes.

Execution lessons:
- Keep genetics/registry service telemetry in data lineage so delays in identity-linked attributes are not misdiagnosed as collector failure.
- When identity-lag risk is elevated, prefer model variants that are less dependent on recent registry changes.

Contradiction noted:
- Prior simplification: registration/identity support channels were treated as mostly static background processes. The January 2026 service-standard report shows measurable month-to-month throughput and turnaround variation that should be modeled explicitly.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team methodological disclosure was identified this pass beyond existing venue-policy/operator-process corpus.
- [A] Net-new high-signal this pass is Australian provider operations telemetry that adds non-uptime regime variables for execution-risk and data-freshness controls.

## Source notes (incremental additions for pass 135)

- Racing Australia, `Monthly Service Standard Performance Report - January 2026` (contact-center service distribution, SMS/email volumes, and genetics-service throughput/turnaround rows; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-January-2026.pdf

## Incremental sourced findings added in this run (2026-04-04, pass 136)

### Racing Australia Fact Book 2025 adds state-level TAB/non-TAB concentration and operator-topology priors that should be first-class in liquidity and routing models

- [A] Racing Australia's Fact Book 2025 (Table 2, 2024/25 season) reports national TAB coverage concentration at meeting/race/start granularity: `2,214` TAB meetings vs `355` non-TAB meetings, `17,100` TAB races vs `1,934` non-TAB races, and `165,790` TAB starts vs `14,213` non-TAB starts.
- [A] The same table shows non-TAB activity is highly state-concentrated, with Queensland contributing `212/355` non-TAB meetings and `1,110/1,934` non-TAB races.
- [A] Fact Book Table 1 (continued) reports national wagering-counterparty topology for 2024/25 as `343` bookmakers, `39` corporate bookmakers, and `1` betting exchange.
- [A/B] Inference: AU liquidity/fill and data-freshness priors should be conditioned on `TAB coverage class` and state topology, not treated as one homogeneous national pre-off surface.

Extracted data fields to add:
- `au_market_topology_snapshot.capture_ts`
- `au_market_topology_snapshot.season`
- `au_market_topology_snapshot.state_code`
- `au_market_topology_snapshot.tab_meetings_count`
- `au_market_topology_snapshot.non_tab_meetings_count`
- `au_market_topology_snapshot.tab_races_count`
- `au_market_topology_snapshot.non_tab_races_count`
- `au_market_topology_snapshot.tab_starts_count`
- `au_market_topology_snapshot.non_tab_starts_count`
- `au_market_topology_snapshot.bookmakers_count`
- `au_market_topology_snapshot.corporate_bookmakers_count`
- `au_market_topology_snapshot.betting_exchanges_count`
- `market_context.tab_coverage_class(tab|non_tab)`
- `market_context.state_non_tab_concentration_share`

Model ideas:
- Add a `tab_coverage_regime` feature family to late-liquidity and slippage models so non-TAB windows are not calibrated with TAB-dominant priors.
- Add state-level interaction terms (`state x tab_coverage_class`) for fill-probability and market-impact models, with special handling for high non-TAB concentration regimes.

Execution lessons:
- Route initial live execution toward market segments with stable `tab_coverage_class=tab` priors before scaling into non-TAB-heavy state slices.
- Segment monitoring and risk limits by `state + tab_coverage_class` so non-TAB volatility does not pollute TAB execution diagnostics.

Contradiction noted:
- Prior simplification: Australian pre-off market quality was often treated as broadly uniform after jurisdiction normalization. Fact Book 2025 shows strong TAB/non-TAB and state concentration asymmetry that should be encoded explicitly.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team methodology disclosure was identified this pass beyond existing policy and operator-process corpus.
- [A] Net-new high-signal this pass is Australian market-topology structure (TAB concentration and operator topology) from Racing Australia's 2024/25 Fact Book.

## Source notes (incremental additions for pass 136)

- Racing Australia, `Fact Book 2025 - Page 12` (Table 2: TAB/non-TAB meetings, races, starts by state for 2024/25; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/12/
- Racing Australia, `Fact Book 2025 - Page 11` (Table 1 continued: national bookmaker/corporate bookmaker/betting exchange counts for 2024/25; accessed 2026-04-04): https://publishingservices.racingaustralia.horse/Newsletters/2025_Racing_Australia_Fact_Book/11/

## Incremental sourced findings added in this run (2026-04-04, pass 137)

### Racing Australia's August and September 2025 reports expose non-monotonic provider regimes that single-month monitoring can miss

- [A] August 2025 report shows Trainers & Racing Services inbound calls `9,382`, outbound `2,326`, `<60s` answered `87.66%`, abandon-before-answer `0.20%`, with nominations timeliness `95.50%` vs `98%` target and acceptances `97.30%`.
- [A] September 2025 report shifts to inbound calls `9,122`, outbound `2,105`, `<60s` answered `88.29%`, abandon-before-answer `0.71%`, while nominations remain below target at `95.58%` but acceptances jump to `99.97%` and scratchings to `98.99%` (no emergencies) / `100.00%` (with emergencies).
- [A] September 2025 system rows show channel-decoupled outages despite strong aggregate uptime: Racing Australia Website `29` minutes unplanned downtime and Stud Book Websites `17` minutes, while SNS/StableAssist/REINS remain at `0` minutes.
- [A] September 2025 genetics rows show `Tokyo (Backup) panel testing` turnaround `17.50` days versus `8.00` days in August, indicating month-to-month backup-path volatility independent of many front-end service rows.
- [A/B] Inference: provider risk state should be modeled as a regime-transition process (with cross-channel divergence and derivative features), not as a single uptime/timeliness scalar.

Extracted data fields to add:
- `ra_monthly_service_metric.period_month`
- `ra_monthly_service_metric.metric_family(contact|compilation|uptime|genetics)`
- `ra_monthly_service_metric.metric_name`
- `ra_monthly_service_metric.target_value`
- `ra_monthly_service_metric.actual_value`
- `ra_monthly_service_metric.previous_month_value`
- `ra_monthly_service_metric.delta_month_over_month`
- `provider_channel_divergence_state.period_month`
- `provider_channel_divergence_state.compilation_divergence_score`
- `provider_channel_divergence_state.contact_vs_compilation_divergence_score`
- `provider_channel_divergence_state.uptime_asymmetry_score`
- `genetics_backup_turnaround_state.period_month`
- `genetics_backup_turnaround_state.turnaround_days`
- `genetics_backup_turnaround_state.delta_month_over_month_days`

Model ideas:
- Add a `provider_regime_transition` feature family built from first differences (for example, abandon-rate delta, nominations/acceptances divergence delta, backup-turnaround delta) rather than level-only metrics.
- Add a `channel_decoupling_indicator` so models detect months where call-center, compilation, and uptime surfaces move in opposite directions.

Execution lessons:
- Do not gate late execution on one provider health scalar; require agreement across contact, compilation, system, and genetics/identity channels.
- Trigger conservative sizing/freshness haircuts when `compilation_divergence_score` and `genetics_backup_turnaround_delta` both rise, even if aggregate uptime remains high.

Contradiction noted:
- Prior simplification: provider stress was often treated as a monotonic load/uptime trajectory. August-to-September data shows reversals and cross-channel decoupling, so derivative and divergence states are required.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team methodological disclosure was identified this pass beyond existing venue-policy and operator-process corpus.
- [A] Net-new high-signal this pass is month-over-month Australian provider-regime transition evidence from Racing Australia primary reports.

## Source notes (incremental additions for pass 137)

- Racing Australia, `Monthly Service Standard Performance Report - August 2025` (contact-center, compilation timeliness, uptime asymmetry, and genetics turnaround rows; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-August-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report - September 2025` (contact, compilation divergence, subsystem downtime, and backup-panel turnaround rows; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-September-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report index` (publication chronology for FY2025-26 monthly reports; accessed 2026-04-04): https://www.racingaustralia.horse/freeservices/performancereport.aspx

## Incremental sourced findings added in this run (2026-04-04, pass 138)

### Betfair's passive-delay rollout thread now gives concrete API-signposted regime-churn evidence through February 2026

- [A/B] Betfair's official `No Delays on Passive Bets` announcement thread records expansion from full tennis/baseball rollout (`2025-07-28`, post `#49`) to football testing windows (`2025-11-26` onward), then additional league additions in January-February 2026 (`#52-#55`), while repeatedly retaining odd-event-ID test constraints.
- [A/B] The same thread states competitions with passive-delay logic are API signposted, and that users can query a current list through the API-linked workflow.
- [A/B] Betfair's announcements index snapshot (crawled 2026-04-04) shows the thread at `55` responses with latest post `2026-02-04 06:14 PM`, plus a separate sticky `Dynamic delay update - tennis testing` thread with latest post `2026-02-26 05:51 PM`.
- [A/B] Inference: delay-policy state is an active control-plane regime (not a one-time change), so horse-racing execution research should maintain dated policy epochs and API-signposted state snapshots even when immediate changes are observed first in non-racing competitions.

Extracted data fields to add:
- `betfair_delay_policy_rollout_event.capture_ts`
- `betfair_delay_policy_rollout_event.thread_post_number`
- `betfair_delay_policy_rollout_event.event_date`
- `betfair_delay_policy_rollout_event.sport`
- `betfair_delay_policy_rollout_event.competition_scope`
- `betfair_delay_policy_rollout_event.odd_event_id_test_flag`
- `betfair_delay_policy_rollout_event.api_signposted_flag`
- `betfair_delay_policy_rollout_event.source_url`
- `betfair_announcements_snapshot.capture_ts`
- `betfair_announcements_snapshot.thread_title`
- `betfair_announcements_snapshot.responses_count`
- `betfair_announcements_snapshot.latest_post_ts`
- `betfair_announcements_snapshot.sticky_thread_latest_post_ts`
- `execution_policy_epoch.provider(betfair)`
- `execution_policy_epoch.delay_policy_state(dynamic_rollout|stable)`

Model ideas:
- Add a `delay_policy_epoch` feature to order-fill and slippage models so calibration windows align with documented rollout phases rather than assuming a stationary delay regime.
- Add `policy_signposting_freshness_hours` as a confidence modifier for live execution logic when current API-signposted competition lists are stale.

Execution lessons:
- Snapshot Betfair announcement metadata and API-signposted policy lists daily; treat unexplained fill drift near policy change windows as potential regime mismatch before retuning models.
- Keep policy chronology as first-class state in replay so historical backtests can reproduce delay-mode assumptions active at execution time.

Contradiction noted:
- Prior simplification: passive-delay behavior was often modeled as a mostly settled contract after initial rollout. Betfair's own thread chronology through February 2026 shows continuing expansion/testing cadence and active signposting workflows.

### Racing and Sports provider pages add scale and product-surface signals not captured by RA wholesaler status alone

- [B] Racing and Sports' Investor Centre page describes `20+ years` of data coverage across all three codes and `30+` jurisdictions, and references an internal corpus of `15+ billion` data points.
- [B] The same page adds delivery-surface breadth (`Enhanced Information Services`, `Wagering Technology`, `Digital and Media`) and demand-surface telemetry (`3+ million` annual unique users and `60+ million` annual page views).
- [B] Racing and Sports public product pages state `33+` jurisdiction content coverage and reiterate `approved distributor under Racing Australia for Australian Race Fields`.
- [A/B] Inference: AU provider ranking should include provider-scale and delivery-surface dimensions as separate variables from wholesaler authorization/equal-terms status.

Extracted data fields to add:
- `provider_capability_scale_snapshot.capture_ts`
- `provider_capability_scale_snapshot.provider_name`
- `provider_capability_scale_snapshot.jurisdictions_count_claim`
- `provider_capability_scale_snapshot.racing_codes_scope_count`
- `provider_capability_scale_snapshot.database_points_count_claim`
- `provider_capability_scale_snapshot.annual_unique_users_count_claim`
- `provider_capability_scale_snapshot.annual_pageviews_count_claim`
- `provider_capability_scale_snapshot.years_of_coverage_claim`
- `provider_product_surface_snapshot.capture_ts`
- `provider_product_surface_snapshot.provider_name`
- `provider_product_surface_snapshot.enhanced_info_flag`
- `provider_product_surface_snapshot.wagering_technology_flag`
- `provider_product_surface_snapshot.digital_media_flag`
- `provider_product_surface_snapshot.ra_approved_distributor_flag`
- `provider_claim_confidence_tag.source_type(vendor_marketing|corporate_investor_page)`

Model ideas:
- Add `provider_scale_prior` features to ingestion-risk and fallback-selection models, with confidence-weighting by source type.
- Add `product_surface_overlap_score` so concentration-risk models can detect when one provider simultaneously supplies official materials and downstream wagering-tech layers.

Execution lessons:
- Keep contract/authorization checks (`A`) separate from scale/capability claims (`B`) to avoid over-weighting marketing disclosures in production routing.
- Use provider-scale claims as soft priors for failover planning, then validate against measured latency/completeness telemetry before promotion.

Contradiction noted:
- Prior simplification: Australian provider comparison was mostly rights-lineage and policy status. New provider pages indicate materially different operational scale and surface breadth that should be represented explicitly, albeit with lower evidence weight.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Net-new CAW-adjacent signal this pass is Betfair delay-policy regime churn and signposting behavior through February 2026, not new syndicate-model internals.
- [A/B] Net-new AU provider signal this pass is Racing and Sports scale/surface disclosure that strengthens wholesaler-era provider comparison design.

## Source notes (incremental additions for pass 138)

- Betfair Developer Program forum thread, `No Delays on Passive Bets - Selected Events - PLEASE SUBSCRIBE FOR UPDATES` (posts `#49` to `#55`, rollout chronology and API-signposting references through 2026-02-04; crawled 2026-04-04): https://forum.developer.betfair.com/forum/developer-program/announcements/40962-no-delays-on-passive-bets-selected-events-please-subscribe-for-updates?p=41579
- Betfair Developer Program forum index, `Announcements` (thread response/latest-post metadata including 55-response passive-delay thread and latest dated sticky update context; crawled 2026-04-04): https://forum.developer.betfair.com/forum/developer-program/announcements
- Racing and Sports, `Investor Centre` (provider-scale claims including jurisdictions/data-point corpus/product lines and audience metrics; accessed 2026-04-04): https://racingandsports.company/investor-centre/
- Racing and Sports, `Home` (jurisdiction coverage statement and solution-surface framing; accessed 2026-04-04): https://racingandsports.company/
- Racing and Sports, `Enhanced Information Services` (approved distributor claim and product artifact list; accessed 2026-04-04): https://racingandsports.company/enhanced-information-services/

## Incremental sourced findings added in this run (2026-04-04, pass 139)

### InForm's official rebrand release adds partner-footprint and audience-scale claims that were not yet encoded in our AU wholesaler/provider profile

- [A/B] InForm's official 2025-03-26 release states the rebranded business works with named industry partners including `Sportsbet`, `TAB`, `Racing Victoria`, and `Racing Queensland`.
- [A/B] The same release states InForm reaches `1.5m` users per month across racing and sports and describes itself as serving Australia's largest racing and sports audience.
- [A/B] Inference: provider comparisons should explicitly separate `entity-lineage certainty` (already tracked) from `distribution-footprint` and `audience-scale` priors, with lower confidence weights until corroborated by contract/SLA telemetry.

Extracted data fields to add:
- `provider_partner_footprint_snapshot.capture_ts`
- `provider_partner_footprint_snapshot.provider_name`
- `provider_partner_footprint_snapshot.partner_name`
- `provider_partner_footprint_snapshot.partner_type(bookmaker|pra|media|other)`
- `provider_audience_claim_snapshot.capture_ts`
- `provider_audience_claim_snapshot.provider_name`
- `provider_audience_claim_snapshot.monthly_users_count_claim`
- `provider_audience_claim_snapshot.audience_scope_claim`
- `provider_claim_confidence.source_type(provider_media_release)`

Model ideas:
- Add a confidence-weighted `provider_distribution_footprint_prior` feature for fallback routing decisions during provider outages.
- Add `partner_type_diversity_score` (bookmaker + PRA + media presence) as a soft prior for resilience planning, not a direct quality guarantee.

Execution lessons:
- Keep partner/audience claims in a separate confidence tier from entitlement and uptime/latency telemetry.
- Require measured completeness/freshness telemetry before any routing uplift tied to footprint claims.

Contradiction noted:
- Prior simplification: InForm evidence was mainly identity/alias mapping (`News Perform -> InForm`). The release also contributes operational-footprint and audience-scale dimensions that should be modeled separately.

### Mediality's file-delivery page adds a concrete transport-regime change signal and credential-gating pathway

- [A/B] Mediality's official `digital file delivery` page states that from early `2025` its file-delivery service changed, and directs users to credentials onboarding via a dedicated file-delivery contact.
- [A/B] Inference: even when upstream rights remain stable under RA wholesaler framework, provider transport channels can shift (portal/process/auth flow), creating operational break risk if ingestion assumes static delivery pathways.

Extracted data fields to add:
- `provider_transport_change_event.capture_ts`
- `provider_transport_change_event.provider_name`
- `provider_transport_change_event.transport_surface(file_delivery_portal)`
- `provider_transport_change_event.change_effective_period_desc`
- `provider_transport_change_event.credentials_required_flag`
- `provider_transport_change_event.onboarding_contact_channel`
- `provider_transport_change_event.source_url`
- `provider_transport_contract_snapshot.capture_ts`
- `provider_transport_contract_snapshot.provider_name`
- `provider_transport_contract_snapshot.auth_mode(credentials_login)`

Model ideas:
- Add `provider_transport_change_risk` as an ingestion-failure prior that temporarily widens freshness uncertainty during and after delivery-channel transitions.
- Add a `credential_lifecycle_state` feature to provider-health models so expired/rotated credential incidents are separated from network or parser failures.

Execution lessons:
- Snapshot provider delivery-surface pages and trigger runbook checks when login/onboarding language changes.
- Keep transport-change events versioned in replay so historical missingness is not mislabeled as market-behavior drift.

Contradiction noted:
- Prior simplification: RA wholesaler-era provider pathways were treated as operationally steady once authorised. Mediality's own page shows delivery-channel changes can occur independently of entitlement framework changes.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No net-new primary CAW-team methodological disclosure was identified this pass beyond existing venue/operator policy corpus.
- [A/B] No net-new higher-signal Betfair horse-racing microstructure contract was identified this pass beyond already captured support/docs corpus; this pass is provider-operations focused.

## Source notes (incremental additions for pass 139)

- InForm, `News Perform Rebrands as InForm, Introducing Inform Connect and Inform Media` (published 2025-03-26; named partner footprint and monthly audience claims; accessed 2026-04-04): https://www.informsportsracing.com.au/media/news-perform-rebrands-as-inform/
- Mediality Racing, `digital file delivery` page (early-2025 file-delivery change and credential/onboarding pathway language; accessed 2026-04-04): https://medialityracing.com.au/filedelivery/

## Incremental sourced findings added in this run (2026-04-04, pass 140)

### November-December 2025 RA monthly reports expose a hidden October baseline and a three-stage operational-telemetry transition

- [A] Racing Australia's November 2025 report includes October 2025 prior-month comparators that were not yet extracted into this knowledge base, including contact SLA profile (`<60s 85.69%`, `60-120s 7.02%`, `>120s 7.01%`, abandoned `0.29%`), compilation timeliness (`Nominations 97.85%`, `Acceptances 96.49%`), and genetics backup-panel turnaround (`Tokyo (Backup) 19.80 days`).
- [A] November 2025 actuals then shift to inbound/outbound calls `8,860`/`2,089`, `<60s` answer rate `86.52%`, abandon rate `0.06%`, communications volume `148,182` SMS and `328,965` emails, while nominations miss target at `95.95%` and all listed core systems show `0 minutes` unplanned downtime.
- [A] December 2025 actuals show another state change: inbound/outbound `9,652`/`2,269`, `<60s` answer rate `87.30%`, abandon rate `0.21%`, nominations recovery to `99.58%`, RA website downtime `9 minutes`, communications volume `147,631` SMS and `274,418` emails, and `Tokyo (Backup)` turnaround `18.20 days` with November marked `N/A`.
- [A/B] Inference: October->November->December evidences a non-monotonic tri-axis regime (contact SLA, compilation timeliness, and communications intensity) where improvements in one surface can coincide with deterioration in another, so monthly state should be represented as a vector trajectory rather than scalar "good/bad" health.

Extracted data fields to add:
- `ra_monthly_transition_vector.period_month`
- `ra_monthly_transition_vector.prev_month_reference_month`
- `ra_monthly_transition_vector.contact_lt_60s_pct`
- `ra_monthly_transition_vector.contact_abandon_pct`
- `ra_monthly_transition_vector.calls_inbound`
- `ra_monthly_transition_vector.calls_outbound`
- `ra_monthly_transition_vector.nominations_timeliness_pct`
- `ra_monthly_transition_vector.acceptances_timeliness_pct`
- `ra_monthly_transition_vector.sms_sent_count`
- `ra_monthly_transition_vector.email_sent_count`
- `ra_monthly_transition_vector.ra_website_unplanned_downtime_min`
- `ra_monthly_transition_vector.tokyo_backup_turnaround_days`
- `ra_monthly_transition_vector.missing_prior_value_flag`

Model ideas:
- Add a `provider_transition_state_machine` feature family with discrete states (for example `contact_up+compilation_down+comms_high`) derived from monthly vectors and their first differences.
- Add a `missing_prior_value_penalty` in transition models when prior-month reference fields are `N/A` (for example Tokyo backup), so confidence widens automatically during continuity breaks.

Execution lessons:
- Keep previous-month comparator columns as first-class data; they provide recoverable history even when direct older-month documents are unavailable.
- Apply conservative sizing when contact-SLA and compilation metrics move in opposite directions, even if uptime appears healthy.

Contradiction noted:
- Prior simplification: monthly provider telemetry was often consumed as single-point snapshots. November and December reports show that embedded prior-month columns materially change interpretation and should be modeled as trajectory evidence.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team internals were identified this pass beyond existing venue-policy/process corpus.
- [A/B] Net-new high-signal this pass is Australian provider regime-transition telemetry granularity from RA monthly reports (including October baseline recovery through November prior-month columns).

## Source notes (incremental additions for pass 140)

- Racing Australia, `Monthly Service Standard Performance Report - November 2025` (includes October 2025 comparator metrics across contact SLA, compilation timeliness, uptime, and genetics backup turnaround; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-November-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report - December 2025` (contact/comms/compilation/uptime/genetics metrics with November comparators; accessed 2026-04-04): https://www.racingaustralia.horse/FreeServices/Reports/Monthly-Service-Standard-Performance-Report-Racing-Australia-December-2025.pdf
- Racing Australia, `Monthly Service Standard Performance Report index` (2025-2026 monthly listing and chronology context; accessed 2026-04-04): https://www.racingaustralia.horse/freeservices/performancereport.aspx

## Incremental sourced findings added in this run (2026-04-04, pass 141)

### Racing Australia's Jan-Mar 2026 planned-outage sequence adds a new maintenance-cluster regime signal

- [A] Racing Australia's independent systems-status channel lists a dense sequence of planned maintenance windows across Jan-Mar 2026, including: 12 Jan (website + SNS/StableAssist window), 15 Jan (Reports module), 27 Jan (ASB/ROR plus RoR web path), 2 Feb (Acceptances/RMM/Colours), 2 Mar (myhorseracing plus multiple SNS modules), and 5 Mar (myhorseracing plus RoR/StableAssist).
- [A] The listed windows are module-targeted and time-bounded (for example 5-15 minute windows for selected surfaces and separate evening SNS windows), not a single platform-wide maintenance state.
- [A/B] Inference: provider-operational risk should include a short-horizon maintenance-cluster feature (frequency + affected-surface breadth), because ingestion and execution reliability can degrade during repeated planned-window bursts even when monthly uptime remains high.

Extracted data fields to add:
- `provider_planned_window_snapshot.capture_ts`
- `provider_planned_window_snapshot.provider`
- `provider_planned_window_snapshot.notice_date`
- `provider_planned_window_snapshot.window_start_local_ts`
- `provider_planned_window_snapshot.window_end_local_ts`
- `provider_planned_window_snapshot.affected_surface`
- `provider_planned_window_snapshot.affected_module`
- `provider_planned_window_snapshot.source_url`
- `provider_maintenance_cluster_state.lookback_days`
- `provider_maintenance_cluster_state.window_count`
- `provider_maintenance_cluster_state.unique_surface_count`
- `provider_maintenance_cluster_state.cluster_state(normal|elevated|clustered)`

Model ideas:
- Add a `maintenance_cluster_state` feature family to slippage and fill-quality models, keyed to recent planned-window density and surface breadth.
- Add a `surface_specific_risk` interaction between affected module class (for example `acceptances`, `reports`, `stableassist`) and feature dependencies used at execution time.

Execution lessons:
- Do not rely on monthly uptime PDFs alone for operational gating; include independent status-window schedules in daily risk checks.
- Apply temporary freshness and sizing haircuts during elevated maintenance clusters, especially when affected modules overlap ingestion-critical surfaces.

Contradiction noted:
- Prior simplification: planned maintenance was mostly handled as isolated one-off windows. Jan-Mar 2026 listings show clustered, module-scoped windows that merit explicit regime modeling.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus; strongest net-new signal is provider maintenance-cluster telemetry.

## Source notes (incremental additions for pass 141)

- Racing Australia, `Systems Status Updates` (independent status channel and Jan-Mar 2026 planned maintenance listing; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status post, `Planned Maintenance - Thursday 5th March 2026` (module/time-window example in the Jan-Mar sequence; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/planned-maintenance-thursday-5th-march-2026.html

## Incremental sourced findings added in this run (2026-04-04, pass 142)

### HKJC's May 2025 commingling failure shows an explicit pool-isolation fallback regime with measurable pricing distortion risk

- [A] HKJC's official club statement (2025-05-25) says an intermittent database connectivity issue with commingling partners was detected at `16:40`, unresolved by the start of Race 9, and led to removing commingling-partner investment and recalculating Race 9 final odds for payout.
- [A] The same statement says HKJC then proceeded with `local investment only` for Races 10 and 11 and delayed those starts to complete payout processing accurately.
- [B] Secondary race-operations reporting records stark pool-size and dividend divergence during the local-only window (for example, AU tote win pool about `$49k` in Race 9 versus about `$4.8m` in prior race; visible HK vs AU dividend gaps), consistent with liquidity-fragmentation shock.
- [A/B] Inference: commingled pool strategies require an explicit `commingled -> local-only` fallback state in execution and replay; assuming continuity of global liquidity through incident windows overstates fill certainty and misprices edge.

Extracted data fields to add:
- `pool_connectivity_incident.capture_ts`
- `pool_connectivity_incident.venue`
- `pool_connectivity_incident.detected_local_ts`
- `pool_connectivity_incident.partner_connectivity_state(intermittent|down|unknown)`
- `pool_connectivity_incident.commingled_investment_removed_flag`
- `pool_connectivity_incident.local_only_window_start_ts`
- `pool_connectivity_incident.local_only_window_end_ts`
- `pool_connectivity_incident.affected_race_numbers_json`
- `pool_connectivity_incident.final_odds_recalculated_flag`
- `pool_liquidity_fragmentation_snapshot.win_pool_local`
- `pool_liquidity_fragmentation_snapshot.win_pool_reference_prev`
- `pool_liquidity_fragmentation_snapshot.dividend_gap_local_vs_host`

Model ideas:
- Add a `pool_fragmentation_state` feature family that activates when commingling links degrade or local-only mode is declared.
- Add incident-conditional priors for slippage and CLV where pool depth shocks are expected (especially late-window orders).

Execution lessons:
- Gate stake sizing on live pool-connectivity state; apply hard caps or pause when commingling is disabled.
- Persist incident chronology (`detect`, `fallback`, `restore`) for replay-grade reconstruction of price/liquidity conditions.

Contradiction noted:
- Prior simplification: commingled pools were treated as continuously available liquidity surfaces during active meetings. HKJC's statement provides a concrete live-session fallback where commingled flow is removed and pricing is recomputed.

### Racing Australia's status channel adds uncaptured unplanned-incident classes beyond planned-maintenance clustering

- [A] Racing Australia's 2025-06-02 planned-maintenance post includes an explicit `data.racingaustralia.horse API` outage window (`7:30pm-8:00pm AEST`) plus broader SNS module impacts (`7:00pm-8:15pm AEST`).
- [A] Racing Australia's unplanned-outage post (`2020-08-31`) states a telecommunications-provider network outage made both the Racing Australia website and Single National System unavailable.
- [A/B] The Systems Status home feed and indexed outage snippets also show additional unplanned classes (for example, software deployment/template error causing mass SMS misfire and rapid rollback; prior network and phone-carrier incidents).
- [A/B] Inference: provider-operational risk should include `incident class` and `dependency class` (deployment, telecom carrier, module maintenance), not only planned-window density and monthly uptime.

Extracted data fields to add:
- `provider_incident_event.capture_ts`
- `provider_incident_event.provider`
- `provider_incident_event.event_type(planned|unplanned)`
- `provider_incident_event.incident_class(maintenance|telecom_carrier|deployment|phone_carrier)`
- `provider_incident_event.affected_surface`
- `provider_incident_event.window_start_local_ts`
- `provider_incident_event.window_end_local_ts`
- `provider_incident_event.api_surface(data.racingaustralia.horse|none)`
- `provider_incident_event.rollback_performed_flag`
- `provider_incident_event.customer_impact_channel(web|sns|sms|phone)`
- `provider_incident_event.source_url`

Model ideas:
- Add `incident_class_risk` and `dependency_class_risk` features to freshness/slippage reliability models.
- Add incident-recurrence hazard features by class (`telecom_carrier`, `deployment`) for short-horizon throttling policy.

Execution lessons:
- Maintain separate runbooks for planned API windows versus carrier outages versus deployment rollbacks.
- Do not infer resilience from planned maintenance alone; unplanned dependency incidents must be first-class gating inputs.

Contradiction noted:
- Prior simplification: provider risk around Racing Australia was primarily modeled as planned-maintenance clustering and monthly KPI trajectory. Status-channel evidence adds distinct unplanned dependency-failure modes with different response requirements.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] Strongest net-new high-signal this pass is market-operations microstructure under incident fallback (`commingled -> local-only`) and expanded provider incident-class taxonomy for Australian upstream systems.

## Source notes (incremental additions for pass 142)

- HKJC Racing News, `Club Statement` (published 2025-05-25; commingling connectivity issue, removal of commingling investment, local-only Races 10-11, and delayed starts; accessed 2026-04-04): https://racingnews.hkjc.com/english/2025/05/25/club-statement/
- The Straight, `Commingling issue delivers a $69 million hit to Hong Kong turnover` (published 2025-05-26; secondary pool-size/dividend divergence context and quoted club statement lines; accessed 2026-04-04): https://thestraight.com.au/commingling-issue-delivers-a-69-million-hit-to-hong-kong-turnover/
- Racing Australia Systems Status, `Planned Maintenance - Monday 2nd June 2025` (module-level maintenance and explicit `data.racingaustralia.horse API` outage window; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/planned-maintenance-monday-2nd-june-2025.html
- Racing Australia Systems Status, `Network Outage` (published 2020-08-31; telecommunications-provider outage affecting website + SNS; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/unplanned-interruptions-to-website-and-sns.html
- Racing Australia Systems Status home feed (unplanned outage class listing including deployment/SMS and carrier/phone incidents; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status, `Software Deployment Issue triggering SMS notifications` (2024-07-30 listing/snippet context; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/software-deployment-issue-triggering-sms-notifications.html

## Incremental sourced findings added in this run (2026-04-04, pass 143)

### Northern Territory tote and licensing structure adds a new cross-jurisdiction dependency surface for AU execution planning

- [A] The NT Government's totalisator licence page states that in `2015` UBET NT received a `20-year` exclusive NT totalisator licence and that UBET NT pools with `Queensland`, `South Australia`, and `Tasmania`.
- [A] The same NT source states licensing roles are split: sports bookmakers and betting exchanges are licensed by the Racing and Wagering Commission, while totalisator operators are licensed by the Director of Totalisator Licensing and Regulation.
- [A] NT's official licensed-operators register (list marker `last updated: 26 Mar 2026`) shows bookmaker/exchange/totalisator approvals as a living roster including active and `Not currently trading` statuses.
- [A] NT's Racing NT Board page states Racing NT Limited will be approved under the Racing and Wagering Act 2024 as the race control body for thoroughbred and greyhound racing, with operations commencing in `late 2026`.
- [A/B] Inference: NT should be modeled as a dynamic control-plane jurisdiction where entitlement state, operator roster, and governance authority are mutable inputs; cross-jurisdiction tote pooling means NT tote behavior is not isolated from QLD/SA/TAS operational conditions.

Extracted data fields to add:
- `jurisdiction_operator_registry_snapshot.capture_ts`
- `jurisdiction_operator_registry_snapshot.jurisdiction`
- `jurisdiction_operator_registry_snapshot.list_updated_date`
- `jurisdiction_operator_registry_snapshot.operator_company`
- `jurisdiction_operator_registry_snapshot.trading_as`
- `jurisdiction_operator_registry_snapshot.license_surface(bookmaker|exchange|totalisator)`
- `jurisdiction_operator_registry_snapshot.trading_status(active|not_currently_trading)`
- `jurisdiction_operator_registry_snapshot.license_authority`
- `jurisdiction_totalisator_structure.effective_from_year`
- `jurisdiction_totalisator_structure.exclusive_license_holder`
- `jurisdiction_totalisator_structure.exclusive_license_term_years`
- `jurisdiction_totalisator_structure.pooled_with_jurisdictions_json`
- `jurisdiction_governance_transition_event.capture_ts`
- `jurisdiction_governance_transition_event.jurisdiction`
- `jurisdiction_governance_transition_event.future_rcb_name`
- `jurisdiction_governance_transition_event.transition_target_period`
- `jurisdiction_governance_transition_event.legal_basis_ref`

Model ideas:
- Add a `jurisdiction_entitlement_churn_state` feature family that scores jurisdictional operator-list churn and governance-transition proximity.
- Add a `pooling_dependency_risk` feature that widens tote-liquidity uncertainty when any linked pooling jurisdiction is in incident or maintenance state.

Execution lessons:
- Snapshot NT licensed-operator lists as first-class compliance evidence, not static reference data.
- Keep regulator-authority mappings versioned (`commission` vs `director` vs forthcoming `Racing NT`) and gate deployment by effective period.

Contradiction noted:
- Prior simplification: AU tote/provider entitlement state was treated mainly as east-coast policy and monthly-service-report drift. NT sources show a distinct licensing architecture, explicit inter-jurisdiction pooling links, and an announced governance transition window.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass; strongest net-new signal is Australian jurisdiction-control and entitlement-structure evidence from NT government sources.

## Source notes (incremental additions for pass 143)

- NT Government, `NT totalisator licence` (2015 20-year UBET NT licence, exclusive rights framing, and pool links to QLD/SA/TAS; accessed 2026-04-04): https://nt.gov.au/industry/gambling/licences/nt-totalisator-licence
- NT Department of Tourism and Hospitality, `Sports bookmakers, betting exchange operators and totalisators` (official operator register with `List last updated: 26 Mar 2026`, including active vs not-currently-trading status markers; accessed 2026-04-04): https://dth.nt.gov.au/boards-and-committees/racing-commission/sports-bookmakers-and-betting-exchange-operators?affiliate=365_01165385
- NT Department of Tourism and Hospitality, `Racing NT Board` (Racing NT Limited late-2026 race-control-body transition statement under Racing and Wagering Act 2024 references; accessed 2026-04-04): https://dth.nt.gov.au/racing-gaming-and-licensing/racing-nt-board

## Incremental sourced findings added in this run (2026-04-04, pass 144)

### South Australia's interstate-operator regime adds event-driven compliance state and annual-return cadence not captured in existing race-fields-only models

- [A] South Australia's interstate betting operators page sets a distinct operating test for authorised interstate operators: betting must be by remote channels, no part of operations can be in SA or assisted by an SA operation, betting must be limited to races held by licensed racing clubs and approved contingencies, and the operator must remain currently authorised in another state and not suspended/prohibited.
- [A] The same source sets a hard annual reporting deadline (`30 September`) for SA betting-operation details and states all interstate operators receive an annual-return workflow.
- [A] South Australia also imposes event-driven notification obligations: authorised operators must notify detail changes within `14 days`, and must notify criminal/disciplinary proceedings involving the operator or close associates within `14 days`.
- [A] SA's approved contingencies page confirms operators can only accept bets on commissioner-approved contingencies and publishes approved-contingency/rule artifacts as a separate control surface.
- [A] The CBS current authorised interstate betting operators register exposes operator-level status metadata (`name`, `domicile`, `operative date`, `date of notice`) and includes recent 2026 operative-date entries, making this a high-signal entitlement-churn feed.
- [A/B] Inference: SA introduces a notification-driven compliance regime (event-triggered + annual) that is operationally different from pure monthly levy-return regimes; entitlement freshness should be modeled as `registry state + event-obligation state + contingency-scope state`.

Extracted data fields to add:
- `sa_authorised_operator_snapshot.capture_ts`
- `sa_authorised_operator_snapshot.operator_name`
- `sa_authorised_operator_snapshot.notice_id`
- `sa_authorised_operator_snapshot.domicile_jurisdiction`
- `sa_authorised_operator_snapshot.operative_date`
- `sa_authorised_operator_snapshot.notice_date`
- `sa_authorised_operator_snapshot.source_url`
- `sa_operator_obligation_event.capture_ts`
- `sa_operator_obligation_event.operator_name`
- `sa_operator_obligation_event.event_type(change_of_particulars|disciplinary_or_criminal_proceeding|cessation_notice)`
- `sa_operator_obligation_event.event_date`
- `sa_operator_obligation_event.notification_due_date`
- `sa_operator_obligation_event.submitted_date`
- `sa_operator_obligation_event.within_14_day_window_flag`
- `sa_annual_return_requirement_snapshot.capture_ts`
- `sa_annual_return_requirement_snapshot.return_due_date_fixed(30_september)`
- `sa_annual_return_requirement_snapshot.reporting_scope(sa_operations_and_australia_financials)`
- `sa_contingency_scope_snapshot.capture_ts`
- `sa_contingency_scope_snapshot.approved_contingencies_version`
- `sa_contingency_scope_snapshot.wagering_rules_version`

Model ideas:
- Add an `event_obligation_breach_risk` feature that increases operational/compliance risk when 14-day notification windows are at risk or missed.
- Add `jurisdiction_entitlement_freshness_score` for SA based on roster recency, operator-entry completeness, and annual-return cycle proximity.
- Add `contingency_scope_mismatch_flag` when strategy markets map outside approved contingency/rule coverage.

Execution lessons:
- Do not treat SA access as static once an operator is initially onboarded; monitor event-driven obligations and annual-return state as ongoing gates.
- Snapshot the CBS authorised-operator roster on a fixed cadence and diff operator-level changes (new entrants, domicile shifts, missing operative dates) before routing.
- Keep approved-contingency artifacts versioned alongside strategy metadata so market-universe selection remains jurisdiction-valid.

Contradiction noted:
- Prior simplification: Australian jurisdiction gating was mostly modeled as fee formulas plus monthly returns. SA primary sources add event-triggered 14-day obligations and a fixed annual-return cycle that require separate compliance-state modeling.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No higher-signal CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond the existing NYRA/Del Mar/CHRB/Betfair corpus.
- [A] Strongest net-new high-signal this pass is Australian jurisdiction-control evidence for SA authorised-operator state and event-driven compliance obligations.

## Source notes (incremental additions for pass 144)

- SA.GOV.AU, `Interstate betting operators` (operating test, annual return by 30 September, 14-day obligations; page last updated 2025-12-02; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/interstate-betting-operators
- SA.GOV.AU, `Notify of proceedings for authorised betting operator` (14-day proceedings notification obligation and required data fields; page last updated 2025-12-02; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/interstate-betting-operators/notify-of-proceedings-for-authorised-betting-operator
- SA.GOV.AU, `Change of particulars for an authorised betting operator` (14-day change notification obligation; page last updated 2025-12-02; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/interstate-betting-operators/change-of-particulars-for-an-authorised-betting-operator
- SA.GOV.AU, `Approved contingencies and wagering rules` (approved-contingency scope and wagering-rule artifacts; accessed 2026-04-04): https://www.sa.gov.au/topics/business-and-trade/gambling/racing-betting-bookmakers/approved-contingencies-and-wagering-rules
- Consumer and Business Services (SA), `Current authorised interstate betting operators` (operator roster with domicile/operative-date/date-of-notice metadata; captured 2026-04-04): https://www.cbs.sa.gov.au/sections/LGL/current-authorised-interstate-betting-operators

## Incremental sourced findings added in this run (2026-04-04, pass 145)

### HRNSW approval conditions convert previously provisional NSW harness fee/compliance assumptions into primary contract controls

- [A] HRNSW's 2024-25 Approval Conditions PDF formalizes a dual deadline clock: monthly fees are payable within `7 days` after month-end, while monthly turnover returns are due within `5 days` after month-end.
- [A] The same conditions allow HRNSW to require `weekly` turnover returns (week ending Sunday) in addition to monthly returns, and require race-by-race, venue-by-venue, and day-by-day turnover breakdowns including TDO vs non-TDO split and exotics.
- [A] The same conditions define annual final-certification controls: lodgement within `90 days` after 30 June, with registered-auditor verification by default and statutory-declaration allowance when annual NSW harness turnover is below `$2.5m`.
- [A] The same conditions add explicit late-payment economics (`90-day bank bill rate + 2%` interest and `$500` monthly late-payment fee while unpaid), which creates deterministic compliance-cost drift beyond headline fee percentages.
- [A] Bet-back credits are formalized as account-based and approved-counterparty dependent, with explicit allocation order by wagering type (same-type first, then nearest-fee type with fee-difference adjustment).
- [A/B] Inference: NSW harness should be modeled as a multi-clock compliance regime (`D+5 reporting`, `D+7 payment`, `weekly-on-demand`, `FY+90 certification`) rather than a single monthly obligation.

Extracted data fields to add:
- `hrnsw_fee_due_event.capture_ts`
- `hrnsw_fee_due_event.period_end_date`
- `hrnsw_fee_due_event.payment_due_date(d_plus_7)`
- `hrnsw_reporting_due_event.capture_ts`
- `hrnsw_reporting_due_event.period_end_date`
- `hrnsw_reporting_due_event.return_due_date(d_plus_5)`
- `hrnsw_reporting_due_event.weekly_return_requested_flag`
- `hrnsw_reporting_due_event.week_end_day(sunday)`
- `hrnsw_final_certification_event.capture_ts`
- `hrnsw_final_certification_event.financial_year_end_date`
- `hrnsw_final_certification_event.cert_due_date(fy_plus_90_days)`
- `hrnsw_final_certification_event.audit_required_flag`
- `hrnsw_final_certification_event.stat_dec_allowed_turnover_threshold_aud`
- `hrnsw_late_payment_policy_snapshot.capture_ts`
- `hrnsw_late_payment_policy_snapshot.interest_basis(rba_90_day_bank_bill_plus_2pct)`
- `hrnsw_late_payment_policy_snapshot.monthly_penalty_fee_aud`
- `hrnsw_betback_allocation_rule_snapshot.capture_ts`
- `hrnsw_betback_allocation_rule_snapshot.account_only_flag`
- `hrnsw_betback_allocation_rule_snapshot.approved_counterparty_required_flag`
- `hrnsw_betback_allocation_rule_snapshot.same_wager_type_first_flag`
- `hrnsw_betback_allocation_rule_snapshot.fee_difference_adjustment_required_flag`

Model ideas:
- Add `compliance_clock_distance` features for `report_due`, `payment_due`, and `final_cert_due` as separate risk drivers rather than one merged "month-end" state.
- Add a `betback_credit_realizability_score` that depends on approved-counterparty status, account-path evidence, and wagering-type allocation fit.

Execution lessons:
- Separate D+5 reporting and D+7 payment runbooks; bundling them into one control can create false "compliant" states.
- Persist auditor/stat-dec pathway choice at FY close so compliance-cost and failure-mode simulations are reproducible.
- Treat late-payment economics (`interest + fixed monthly fee`) as part of net-edge accounting when testing high-turnover harness strategies.

Contradiction noted:
- Prior simplification: HRNSW harness logic was treated as summary-page fee percentages pending direct-condition capture. Primary PDF clauses show materially richer control semantics (multi-clock deadlines, weekly return escalation, verification thresholds, and explicit penalty economics).

### HRNSW approved-operator roster artifact adds a publication-lineage signal (filename vintage vs content recency)

- [A] HRNSW's approved-wagering-operators PDF URL includes a static-style filename (`Approved Wagering Operators_010720_v3.pdf`) but contains approval entries dated through `March 2025`.
- [A/B] Inference: filename/version tokens are weak freshness proxies; entitlement monitoring should rely on parsed row-level dates and snapshot diffs, not file naming conventions.

Extracted data fields to add:
- `hrnsw_operator_registry_snapshot.capture_ts`
- `hrnsw_operator_registry_snapshot.file_name_token`
- `hrnsw_operator_registry_snapshot.operator_name`
- `hrnsw_operator_registry_snapshot.category(cat1|cat2|cat3)`
- `hrnsw_operator_registry_snapshot.approval_code`
- `hrnsw_operator_registry_snapshot.approval_date`
- `hrnsw_operator_registry_snapshot.latest_row_date_in_file`
- `hrnsw_operator_registry_snapshot.filename_content_recency_gap_days`

Model ideas:
- Add `registry_recency_conflict_flag` when filename/version tokens suggest older vintage than parsed row dates.
- Add a `counterparty_approval_freshness_score` based on parsed approval-date maxima and snapshot-diff cadence.

Execution lessons:
- Gate counterparty entitlement off parsed roster rows and effective dates; never off file naming alone.
- Store both file-token metadata and parsed latest-date metadata for audit-grade lineage.

Contradiction noted:
- Prior simplification: publication filename/version labels were assumed to be a reliable indicator of registry recency. HRNSW roster artifact shows content recency can materially exceed filename cues.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary methodological disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus.
- [A] Strongest net-new high-signal this pass is Australian harness-provider compliance microstructure from direct HRNSW condition and operator-registry artifacts.

## Source notes (incremental additions for pass 145)

- HRNSW, `Approval Conditions 2025` (PDF link on Race Fields page; 2024-25 conditions with fee/reporting/certification/penalty and bet-back clauses; accessed 2026-04-04): https://www.hrnsw.com.au/Uploads/files/Race%20Fields%20Legislation/2025%2007%2001%20-%20HRNSW%20Approval%20Conditions%202024-2025%20Final.pdf
- HRNSW, `Approved Wagering Operators` roster PDF (category/approval-code/approval-date rows with entries through 2025 in captured artifact; accessed 2026-04-04): https://www.hrnsw.com.au/Uploads/files/Race%20Fields%20Legislation/Approved%20Wagering%20Operators_010720_v3.pdf
- HRNSW, `Race Fields and Corporate Wagering Operators` page (anchor page for annual condition and roster artifacts; accessed 2026-04-04): https://www.hrnsw.com.au/hrnsw/race-fields-and-corporate-wagering-operators

## Incremental sourced findings added in this run (2026-04-04, pass 146)

### Ziemba's 2020 parimutuel survey adds additional Benter/Woods implementation signals that were not yet encoded

- [A/B] Ziemba's LSE discussion paper states Benter's Hong Kong operation used `80+` factor models and a two-path setup: estimate fair probabilities vs public odds, or include track odds as an input variable to improve probability estimation, then stake with Kelly/probability-weighting/tree methods.
- [A/B] The same source states Benter's team adapted away from baseline Dr Z assumptions in Hong Kong, and highlights discounted-Harville style corrections for second/third-place bias as a practical response to local pool-bias structure.
- [A/B] The source links Alan Woods to the Hong Kong methodology lineage via joint work references (Lo/Bacon-Shone context) and notes Woods later ran a separate smaller team in the Philippines.
- [A/B] The source describes execution context claims that are operationally relevant for portability scoring: periodic tote-feed cadence (`12s` then `1m`), deep pools/low impact, electronic pool access, and high setup/organizational barriers (quoted setup-cost and staffing scale claims).
- [A/B] Inference: some high-value details about Benter/Woods remain available mainly as survey/participant narrative rather than reproducible technical appendices; these should be treated as scenario priors with source-bias flags, not hard defaults.

Extracted data fields to add:
- `syndicate_method_claim.capture_ts`
- `syndicate_method_claim.operator_or_team`
- `syndicate_method_claim.source_type(survey|participant_narrative|primary_equation)`
- `syndicate_method_claim.factor_count_claim`
- `syndicate_method_claim.probability_pipeline_mode(private_vs_public|market_as_feature)`
- `syndicate_method_claim.ordering_model_variant(discounted_harville|other)`
- `syndicate_method_claim.feed_cadence_seconds`
- `syndicate_method_claim.market_depth_claim`
- `syndicate_method_claim.team_scale_claim`
- `syndicate_method_claim.setup_cost_claim_usd`
- `syndicate_method_claim.claim_confidence_grade`

Model ideas:
- Add a `market_as_feature_toggle` challenger branch that explicitly compares private-only probability models vs private+market-input models by regime.
- Add a `source_bias_weight` feature in prior-construction so survey/participant claims initialize priors but do not dominate parameter selection without direct replication.
- Add `jurisdiction_bias_profile` toggles for ordering models (baseline Harville vs discounted corrections) keyed by observed place/show bias diagnostics.

Execution lessons:
- Keep Benter/Woods-inspired design choices as hypothesis seeds; require modern AU replay confirmation before production adoption.
- Treat staffing/setup-cost claims as organizational constraints for roadmap realism, not direct alpha forecasts.
- Preserve provenance and confidence tags for all non-equation methodological claims used in model/backlog decisions.

Contradiction noted:
- Prior simplification: core Benter/Woods transferable detail was mostly exhausted by Benter (1994) and journalism. This survey adds extra method-lineage and implementation claims, but with mixed source-type confidence that must be modeled explicitly.

### Ladbrokes AU Affiliates API docs add a new provider-contract surface with explicit legal-use and schema-evolution constraints

- [A] The Ladbrokes Affiliates API documentation states the feed covers thoroughbred/harness/greyhound with live and historical data, but endpoints are `personal use only` and must not be republished without written permission from Entain ANZ.
- [A] The same docs define an `open schema` contract (server may append response properties; clients should ignore unexpected fields) and mark `Beta` endpoints as subject to change at any time.
- [A] Authentication guidance requires partner-identifying headers (`From`, `X-Partner`, `X-Partner-ID`) to avoid blocking/inappropriate rate limiting.
- [A] Endpoint-level constraints include pagination/shape limits (`Default 100`, `Max 200` on list endpoints) and explicit query-window bounds for extras endpoints (date ranges constrained to within 2 days).
- [A/B] Inference: this provider can be useful for enrichment/research prototyping, but entitlement and schema-volatility controls must be first-class before any production use.

Extracted data fields to add:
- `provider_contract_snapshot.provider`
- `provider_contract_snapshot.allowed_use_scope(personal_only|commercial_allowed)`
- `provider_contract_snapshot.republication_allowed_flag`
- `provider_contract_snapshot.schema_mode(open_schema_appenditive)`
- `provider_contract_snapshot.beta_endpoint_change_risk_flag`
- `provider_auth_contract.required_headers_json`
- `provider_auth_contract.missing_header_block_risk_flag`
- `provider_endpoint_contract.endpoint_path`
- `provider_endpoint_contract.default_limit`
- `provider_endpoint_contract.max_limit`
- `provider_endpoint_contract.date_window_max_days`
- `provider_endpoint_contract.response_format_set`

Model ideas:
- Add `provider_schema_volatility_score` to downweight features from feeds with additive-schema and beta-surface churn.
- Add `provider_entitlement_gate` hard checks to prevent accidental model-training on data with personal-use-only restrictions.

Execution lessons:
- Treat partner-header compliance as part of transport reliability, not optional metadata.
- Build parser contracts that are additive-field safe by default and emit drift metrics when new fields appear.
- Keep provider-contract snapshots versioned so replay and compliance checks use period-correct terms.

Contradiction noted:
- Prior simplification: AU provider comparisons were concentrated on RA wholesalers and BetMakers/Mediality/PuntingForm surfaces. This docs-native Entain affiliate API adds a separate contract class with explicit personal-use and schema-volatility constraints.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] Net-new named-operator signal this pass is Benter/Woods methodology-lineage detail from Ziemba's 2020 survey; these remain mixed-confidence narrative/summary claims rather than fresh first-principles equations.
- [A/B] No net-new primary methodological disclosures were identified this pass for David Walsh or Zeljko Ranogajec internals.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond the existing NYRA/Del Mar/CHRB/Betfair corpus.

## Source notes (incremental additions for pass 146)

- William T. Ziemba, `Parimutuel betting markets: racetracks and lotteries revisited` (LSE Systemic Risk Centre Discussion Paper 103; Sept 2020; sections covering Benter/Woods/Dr Z lineage, rebate economics, and syndicate-scale claims; accessed 2026-04-04): https://www.fmg.ac.uk/sites/default/files/2020-09/dp-103.pdf
- LSE Research Online record for Ziemba paper (metadata and archive context; accessed 2026-04-04): https://researchonline.lse.ac.uk/id/eprint/118873/
- Ladbrokes Australia `Affiliates API` documentation (v1.0.0; personal-use/republication clause, open-schema contract, beta volatility note, header requirements, list limits, and extras date-window constraints; accessed 2026-04-04): https://api-affiliates.ladbrokes.com.au/

## Incremental sourced findings added in this run (2026-04-04, pass 147)

### Queensland's full FY25-27 conditions add clause-level fee, timing, audit, and minimum-bet mechanics that materially tighten execution/compliance modeling

- [A] Racing Queensland's FY25-27 General Conditions specify a two-path charging base: for betting exchanges, fees are based on `Betting Exchange Revenue`; for non-exchange operators, fees are based on `Assessable Turnover`, with `Total Race Field Fees = Betting Fee + Betting Exchange Fee + Post-Race Meeting Day MJML Bet Fee`.
- [A] The same conditions include explicit rate ladders for non-exchange betting fees: `1.00%` when aggregate assessable turnover is `<= A$5m`, and above `A$5m` rates of `2.10%` (greyhound), `2.40%` (harness), and `2.60%` (thoroughbred).
- [A] The same document formalizes a multi-clock monthly workflow: statement due within `5 business days` after month-end, invoice issued by RQ after approval, and payment due within `10 business days` after invoice receipt.
- [A] The same conditions add deterministic overdue economics and authority-risk triggers: compound interest at `RBA cash rate target +2%` (daily compounding) and potential authority cancellation if overdue amounts remain unpaid `30 days` after reminder.
- [A] RQ's wagering-information obligations introduce turnover-band submission channels: operators over `A$5m` expected/actual assessable turnover must provide wagering information each day via `FTP`, while under-`A$5m` operators submit previous-month data by the `5th business day`.
- [A] Annual assurance is split by scale: operators over `A$100m` aggregate assessable turnover (or operating a betting exchange) must provide an independent-auditor-certified annual statement within `45 days` of FY end; at/under `A$100m`, a statutory declaration path applies when requested, also at `45 days`.
- [A] Minimum-bet-limit clauses include race-code-specific loss-to-accept floors (thoroughbred `A$1,000`/place `A$400`; harness `A$500`/place `A$200`; greyhound `A$500`/place `A$200`) and require operators to publicly display limits and final-field markets by `10am` local race-day time.
- [A] The same minimum-bet section explicitly requires operators to `allow customers to use automation to select a market and add to their bet slip`, while separately stating operators are not obliged to accept a bet transaction completed by automation.
- [A/B] Inference: QLD's current contract is not just entitlement + periodic reporting; it encodes execution-relevant mechanics (exchange-vs-turnover fee bases, multi-clock payment/reporting, deterministic arrears economics, and automation-related minimum-bet behavior) that should be represented as first-class state in strategy and compliance engines.

Extracted data fields to add:
- `qld_fee_basis_snapshot.capture_ts`
- `qld_fee_basis_snapshot.operator_mode(exchange|non_exchange)`
- `qld_fee_basis_snapshot.fee_base_type(betting_exchange_revenue|assessable_turnover)`
- `qld_fee_rate_ladder_snapshot.capture_ts`
- `qld_fee_rate_ladder_snapshot.turnover_threshold_aud`
- `qld_fee_rate_ladder_snapshot.rate_greyhound_bps`
- `qld_fee_rate_ladder_snapshot.rate_harness_bps`
- `qld_fee_rate_ladder_snapshot.rate_thoroughbred_bps`
- `qld_monthly_compliance_clock.period_end_date`
- `qld_monthly_compliance_clock.statement_due_date(d_plus_5_business_days)`
- `qld_monthly_compliance_clock.invoice_received_date`
- `qld_monthly_compliance_clock.payment_due_date(invoice_plus_10_business_days)`
- `qld_arrears_policy_snapshot.interest_basis(rba_cash_target_plus_2pct_daily_compound)`
- `qld_arrears_policy_snapshot.authority_cancellation_after_reminder_days(30)`
- `qld_wagering_info_channel_rule.turnover_band(under_5m|over_5m_or_expected_over_5m)`
- `qld_wagering_info_channel_rule.submission_channel(ftp|monthly_return)`
- `qld_wagering_info_channel_rule.submission_due_rule`
- `qld_annual_assurance_rule.turnover_band(over_100m_or_exchange|at_or_under_100m)`
- `qld_annual_assurance_rule.assurance_type(audited_statement|stat_dec_if_requested)`
- `qld_annual_assurance_rule.due_days_after_fy_end(45)`
- `qld_min_bet_limit_snapshot.race_code`
- `qld_min_bet_limit_snapshot.win_or_each_way_to_lose_aud`
- `qld_min_bet_limit_snapshot.place_component_to_lose_aud`
- `qld_min_bet_limit_snapshot.final_field_display_deadline_local(10am)`
- `qld_min_bet_limit_automation_rule.allow_market_select_add_to_betslip_flag`
- `qld_min_bet_limit_automation_rule.must_accept_completed_automation_bet_flag`

Model ideas:
- Add `jurisdiction_fee_basis_state` so exchange strategies are normalized on revenue-based fee clocks while fixed-odds strategies stay turnover-based.
- Add `compliance_clock_distance_qld` features for statement due, invoice-to-payment due, and arrears reminder elapsed days.
- Add `mb_limited_execution_state` features to quantify whether a strategy depends on automation-assisted bet construction vs full automated bet submission acceptance.

Execution lessons:
- Separate QLD month-end controls into at least three states (`statement submitted`, `invoice received`, `invoice paid`) instead of one monthly compliance flag.
- Include arrears-interest and potential authority-cancellation state in net-edge stress tests; these are deterministic costs, not rare legal tail events.
- Treat minimum-bet automation semantics as a routing nuance: UI/selection automation support does not imply guaranteed acceptance of completed automated transactions.

Contradiction noted:
- Prior simplification: QLD was modeled mainly as authority-period and template-path governance. Full FY25-27 clauses show materially richer fee-basis, deadline, arrears, and minimum-bet automation semantics that change both execution and compliance-state design.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus.
- [A] Strongest net-new signal this pass is clause-level Australian jurisdiction control from Racing Queensland's current General Conditions.

## Source notes (incremental additions for pass 147)

- Racing Queensland, `General Conditions for Race Information Authority (1 July 2025 - 30 June 2027)` (fee-basis definitions, rate ladders, monthly/arrears clocks, wagering-information channels, annual-assurance thresholds, minimum-bet clauses; accessed 2026-04-04): https://www.racingqueensland.com.au/getmedia/d3bc5b41-5150-483f-b0b9-ede6f4733ba4/25-0610-General-Conditions-for-Race-Information-Authority-1-July-2025-30-June-2027-FINAL.pdf
- Racing Queensland, `Race Information` page (authority period and current authorised-WSP list marker `as at March 30, 2026`; accessed 2026-04-04): https://www.racingqueensland.com.au/about/clubs-venues-wagering/wagering-licencing/race-information

## Incremental sourced findings added in this run (2026-04-04, pass 148)

### Tasmania's post-Act-2024 integrity stack adds a machine-enforceable control plane beyond fee formulas

- [A] Tasracing's one-page `Integrity Conditions` artifact is explicitly dated `as at 1 July 2025`, cites the `Racing Regulation and Integrity Act 2024 (Tas), s 128(4)`, and enumerates 10 mandatory conditions for race-field publication approvals.
- [A] Tasmania's `Racing Regulation and Integrity Regulations 2024` (Part 5, reg 56) prescribes those controls as integrity conditions for `section 128(4)(a)` and defines `specified body` scope that includes Tasracing, interstate control bodies, Australian Racing Board, Harness Racing Australia, and Greyhounds Australasia.
- [A] Reg 56 / Integrity Conditions include controls we had not yet encoded as explicit state variables: prohibition on accounts for warned-off/disqualified persons, AML/CTF identity verification standards for account opening, secure-system audit trail requirements, participation in online wagering monitoring systems (where able), and immediate notification of prosecutions/disciplinary actions.
- [A] The Act-level contract in section 128 requires Tasracing to impose prescribed integrity conditions and publish conditions on a website, creating a directly auditable publication/update surface for approval-state governance.
- [A/B] Inference: Tasmania should be modeled with a dedicated integrity-control state machine (`identity`, `monitoring`, `warning_off`, `licence_continuity`, `disciplinary_notice`) rather than as a fee-only jurisdiction.

Extracted data fields to add:
- `tas_integrity_conditions_snapshot.capture_ts`
- `tas_integrity_conditions_snapshot.as_at_date`
- `tas_integrity_conditions_snapshot.condition_count`
- `tas_integrity_condition_rule.rule_id(1_to_10)`
- `tas_integrity_condition_rule.rule_family(info_access|inquiry_cooperation|wager_monitoring|warning_off_account_block|kyc_aml|secure_audit_trail|online_monitoring_participation|licence_continuity|disciplinary_notice)`
- `tas_integrity_condition_rule.immediacy_required_flag`
- `tas_integrity_condition_rule.where_able_clause_flag`
- `tas_integrity_condition_rule.cross_jurisdiction_licence_required_flag`
- `tas_integrity_condition_rule.source_reference(reg56|integrity_pdf)`
- `tas_specified_body_registry.body_name`
- `tas_specified_body_registry.body_type(tas|interstate_control|national_code_body)`

Model ideas:
- Add `integrity_enforcement_pressure_score` for Tasmania based on active condition coverage (`10/10` controls), prosecution/disciplinary events, and monitoring-system participation state.
- Add `counterparty_warning_off_exposure_flag` and `disciplinary_notice_freshness_hours` to routing-risk priors for Tas-linked execution.

Execution lessons:
- Separate fee compliance from integrity compliance in Tasmania; passing fee/payment checks alone is insufficient for entitlement confidence.
- Snapshot and hash the integrity-conditions artifact on cadence; this is now a compact, high-signal policy surface with explicit `as at` dating.
- Treat `where able` monitoring participation as a measurable capability state, not a soft narrative clause.

Contradiction noted:
- Prior simplification: Tasmania was largely treated as a fee/reporting jurisdiction anchored to 2019 standard conditions. New primary sources show an explicit 2025 integrity-condition control plane under the 2024 Act that must be modeled independently.

### Tasracing's domestic application form now functions as a structured compliance disclosure contract, not just onboarding paperwork

- [A] Tasracing's current domestic application form (under the 2024 Act) requires section-128(2)-scoped disclosure of wagering channels/products (including betting-exchange flag), publication manner/frequency, and a `past 5 years` publication-history consistency declaration.
- [A] The form requires code-level assessable-turnover disclosure for FY2023-FY2025, explicit bet-back share disclosure by code, and FY2026 forecast turnover with expected bet-back regime-change commentary.
- [A] Integrity/compliance sections require applicants to describe policies for identity verification, suspect-betting reporting, and warning-off/disqualification screening, and collect expansive key-employee/business-associate disclosures tied to operational influence.
- [A/B] Inference: Tasmania has a high-utility pre-approval data surface for `expected turnover`, `bet-back intensity`, and `integrity-process maturity` that can feed both compliance-state estimation and capacity planning.

Extracted data fields to add:
- `tas_application_snapshot.capture_ts`
- `tas_application_snapshot.form_version_ref`
- `tas_application_snapshot.requires_5y_publication_consistency_flag`
- `tas_application_wagering_mode.oncourse_flag`
- `tas_application_wagering_mode.offcourse_fixed_odds_flag`
- `tas_application_wagering_mode.totalizator_flag`
- `tas_application_wagering_mode.betting_exchange_flag`
- `tas_application_turnover_history.fin_year`
- `tas_application_turnover_history.code(thoroughbred|harness|greyhound)`
- `tas_application_turnover_history.assessable_turnover_aud`
- `tas_application_betback_history.fin_year`
- `tas_application_betback_history.code`
- `tas_application_betback_history.turnover_share_pct`
- `tas_application_forecast.fin_year(2026)`
- `tas_application_forecast.code`
- `tas_application_forecast.assessable_turnover_aud`
- `tas_application_integrity_policy.declared_policy_type(kyc|suspicious_betting|warning_off_screening)`
- `tas_application_personnel_disclosure.key_employee_count`
- `tas_application_personnel_disclosure.business_associate_count`

Model ideas:
- Add an `application_vs_realized_turnover_drift_score` to compare ex-ante forecast disclosures with realized turnover by code.
- Add an `integrity_process_maturity_proxy` using declared policy completeness and personnel-governance breadth.

Execution lessons:
- Treat Tasmania application artifacts as reusable structured inputs for pre-trade compliance priors and forecast sanity checks.
- Capture bet-back history/forecast as a first-class input to net-edge simulations rather than relying only on settled-period reports.
- Version application schema expectations; form structure is part of operational contract risk.

Contradiction noted:
- Prior simplification: application forms were treated as low-signal onboarding admin. Tasmania's current form includes quantitative and control-process disclosures that materially inform execution/compliance modeling.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus.
- [A] Strongest net-new signal this pass is Tasmania's post-2024 statutory integrity-control surface and application-disclosure contract.

## Source notes (incremental additions for pass 148)

- Tasracing, `Race Fields Information` index page (links to current Integrity Conditions, domestic application, and Standard Conditions artifacts; accessed 2026-04-04): https://tasracing.com.au/documents/race-fields-information
- Tasracing PDF, `Integrity Conditions` (`as at 1 July 2025`, s128(4) control list with 10 clauses; accessed 2026-04-04): https://tasracing.com.au/hubfs/Corporate%20Documents/Integrity%20Conditions.pdf
- Tasracing PDF, `Application to Publish - Domestic` (section 128(2) disclosure requirements, turnover/bet-back history, FY2026 forecast, and integrity/personnel sections; accessed 2026-04-04): https://tasracing.com.au/hubfs/Corporate%20Documents/Application%20to%20Publish%20-%20Domestic.pdf
- Tasmanian Legislation PDF, `Racing Regulation and Integrity Regulations 2024` (Part 5 reg 56 integrity conditions prescribed for section 128(4)(a); accessed 2026-04-04): https://www.legislation.tas.gov.au/view/pdf/asmade/sr-2024-078
- Tasmanian Legislation, `Racing Regulation and Integrity Act 2024` (section 128 approval-condition and publication obligations; accessed 2026-04-04): https://www.legislation.tas.gov.au/view/whole/html/inforce/2025-05-16/act-2024-016

## Incremental sourced findings added in this run (2026-04-04, pass 149)

### HKJC season-total turnover disclosures add a stronger commingling-intensity signal than prior summary releases

- [A] HKJC's official `Horse Racing Fixture - Season Total` PDF (published 2025-07-17) reports 2024/25 local-racing commingling turnover of `HK$31,755m` (`+10.1% YoY`) and total commingling turnover of `HK$34,004m` (`+9.9% YoY`), while Hong Kong customer turnover rose `+1.0%` to `HK$104,847m`.
- [A] The same artifact reports total horse-racing turnover of `HK$138,851m` (`+3.0% YoY`), implying commingling growth outpaced total and domestic-customer growth in that season snapshot.
- [A] HKJC also reports retained betting-income components where commingling income rose to `HK$1,649m` (`+16.7% YoY`) while Hong Kong-customer betting income declined `-0.7%` to `HK$4,647m`.
- [A/B] Inference: for Hong Kong-linked transfer assumptions, pool economics appear increasingly commingling-sensitive; strategy portability checks should treat commingling share and commingling-income share as regime variables rather than background context.

Extracted data fields to add:
- `hkjc_season_turnover_snapshot.capture_ts`
- `hkjc_season_turnover_snapshot.season_label`
- `hkjc_season_turnover_snapshot.local_commingling_turnover_hkm`
- `hkjc_season_turnover_snapshot.total_commingling_turnover_hkm`
- `hkjc_season_turnover_snapshot.hk_customer_turnover_hkm`
- `hkjc_season_turnover_snapshot.total_turnover_hkm`
- `hkjc_season_turnover_snapshot.local_commingling_yoy_pct`
- `hkjc_season_turnover_snapshot.total_commingling_yoy_pct`
- `hkjc_season_turnover_snapshot.hk_customer_turnover_yoy_pct`
- `hkjc_season_turnover_snapshot.total_turnover_yoy_pct`
- `hkjc_betting_income_snapshot.total_commingling_income_hkm`
- `hkjc_betting_income_snapshot.hk_customer_income_hkm`
- `hkjc_betting_income_snapshot.total_commingling_income_yoy_pct`
- `hkjc_betting_income_snapshot.hk_customer_income_yoy_pct`
- `hkjc_turnover_mix_ratio.comm_turnover_share_pct`
- `hkjc_turnover_mix_ratio.comm_income_share_pct`

Model ideas:
- Add `commingling_intensity_regime_hk` features for transfer-learning guards when importing Hong Kong microstructure priors.
- Add `pool_mix_drift_penalty` to reduce confidence in historical priors when commingling-share delta exceeds threshold.

Execution lessons:
- Version HKJC season-total turnover snapshots and derive year-over-year commingling-share deltas as a first-class market-state signal.
- Separate `turnover growth` from `income growth` decomposition in economics checks; commingling mix can move income sensitivity faster than total-handle growth.

Contradiction noted:
- Prior simplification: HK-linked signals were tracked mainly via incident/news updates. Official season-total tables provide direct commingling/retained-income deltas that materially sharpen pool-economics state modeling.

### Betfair non-interactive login docs add certificate-lifecycle constraints that should be treated as production controls

- [A] Betfair's non-interactive login documentation states certificate-based login requires a linked self-signed certificate and explicitly requires a `2048-bit RSA` certificate for API bot authentication.
- [A] The same documentation states website 2-step authentication does not affect non-interactive certificate login flows, so bot auth controls and website interactive controls must be governed separately.
- [A/B] Inference: this is not just onboarding detail; certificate issuance/linkage/expiry is an execution availability dependency and should be monitored as auth infrastructure state.

Extracted data fields to add:
- `betfair_cert_auth_profile.capture_ts`
- `betfair_cert_auth_profile.app_key`
- `betfair_cert_auth_profile.cert_key_type`
- `betfair_cert_auth_profile.cert_key_bits`
- `betfair_cert_auth_profile.cert_linked_flag`
- `betfair_cert_auth_profile.cert_expiry_ts`
- `betfair_cert_auth_profile.auth_mode(non_interactive_cert|interactive)`
- `betfair_cert_auth_profile.website_2fa_independent_flag`
- `betfair_cert_auth_event.event_ts`
- `betfair_cert_auth_event.event_type(cert_login_success|cert_login_fail|cert_expiring)`
- `betfair_cert_auth_event.error_code`

Model ideas:
- Add an `auth_infra_health_score` feature to downweight live execution confidence when certificate expiry/linkage risk increases.
- Add an `auth_mode_capability_flag` so environments without valid cert-login are automatically excluded from low-latency production paths.

Execution lessons:
- Treat certificate lifecycle management as SRE-owned trading infrastructure with explicit expiry alarms and failover runbooks.
- Keep non-interactive bot auth and website-user auth controls in separate policy tracks to avoid false assumptions from 2FA posture.

Contradiction noted:
- Prior simplification: Betfair auth risk was modeled mostly as session TTL and keep-alive cadence. Non-interactive cert prerequisites add a distinct, certificate-lifecycle failure domain.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team disclosure was identified this pass beyond the existing NYRA/Del Mar/CHRB corpus.
- [A] Strongest net-new signal this pass is HKJC commingling/intake economics granularity plus Betfair certificate-auth operational constraints.

## Source notes (incremental additions for pass 149)

- HKJC, `Horse Racing Turnover - Season Total` PDF (published 2025-07-17; local/simulcast turnover, commingling mix, and retained-income components through 2024/25; accessed 2026-04-04): https://res.hkjc.com/racingnews/wp-content/uploads/sites/3/2025/07/20250717-seasontotalracingTurnover-E.pdf
- HKJC Racing News index item for the turnover PDF (`Horse Racing Turnover - Season Total`, 2025-07-17; accessed 2026-04-04): https://racingnews.hkjc.com/english/2025/07/17/horse-racing-turnover-season-total-4/
- Betfair Exchange API docs, `Non-Interactive (bot) login` (certificate-linked non-interactive auth requirements including 2048-bit RSA and 2FA interaction note; accessed 2026-04-04): https://betfair-developer-docs.atlassian.net/wiki/spaces/1smk3cen4v3lu3yomq5qye0ni/pages/2687915/Non-Interactive%20bot%20login

## Incremental sourced findings added in this run (2026-04-04, pass 150)

### Racing Australia status notices expose a repeatable maintenance-shape regime (not just isolated outages)

- [A] Racing Australia's independent systems-status page currently lists six planned outages across `12 Jan 2026` to `5 Mar 2026` (12 Jan, 15 Jan, 27 Jan, 2 Feb, 2 Mar, 5 Mar), establishing a dense planned-maintenance burst over ~`53` days.
- [A] Four of those six notices are Monday events (`12 Jan`, `2 Feb`, `2 Mar`, `5 Mar` is Thursday), and two notices (`2 Mar`, `5 Mar`) share a coupled-window pattern: a short `5:00pm` myhorseracing window followed by a longer `7:30pm` SNS module window.
- [A] Declared outage durations on the same listing range from `5` minutes to `120` minutes (`7pm-9pm AEDT` on 12 Jan), with a mixed module scope from narrow (`Reports` only on 15 Jan) to broad (`Online Print Package, Stewards, ROR, ASB, TOR, Acceptances, Reports, Licensing` on 2 Mar).
- [A/B] The same listing mixes explicit timezone-labelled text (`AEDT` on 12 Jan) with unlabeled local clock windows on later cards, creating a non-trivial parsing/clock-normalization risk if these notices are used directly for automated gating.
- [A/B] Inference: a single planned-window flag is too coarse; we need `maintenance shape` features (window count, coupling pattern, duration spread, module breadth, timezone-confidence) for reliability-aware execution controls.

Extracted data fields to add:
- `provider_maintenance_shape_snapshot.capture_ts`
- `provider_maintenance_shape_snapshot.provider`
- `provider_maintenance_shape_snapshot.lookback_start_date`
- `provider_maintenance_shape_snapshot.lookback_end_date`
- `provider_maintenance_shape_snapshot.notice_count`
- `provider_maintenance_shape_snapshot.monday_notice_count`
- `provider_maintenance_shape_snapshot.coupled_window_notice_count`
- `provider_maintenance_shape_snapshot.min_declared_window_minutes`
- `provider_maintenance_shape_snapshot.max_declared_window_minutes`
- `provider_maintenance_shape_snapshot.median_declared_window_minutes`
- `provider_maintenance_shape_snapshot.module_breadth_max`
- `provider_maintenance_shape_snapshot.timezone_label_coverage_ratio`
- `provider_maintenance_shape_snapshot.source_url`
- `provider_maintenance_notice_window.notice_date`
- `provider_maintenance_notice_window.window_seq`
- `provider_maintenance_notice_window.start_local_time_text`
- `provider_maintenance_notice_window.end_local_time_text`
- `provider_maintenance_notice_window.declared_timezone_text`
- `provider_maintenance_notice_window.duration_minutes_declared`
- `provider_maintenance_notice_window.affected_modules_json`

Model ideas:
- Add a `maintenance_shape_pressure_score` from notice density, duration spread, and module breadth rather than binary maintenance flags.
- Add a `timezone_confidence_penalty` feature when status notices omit timezone labels or mix timezone conventions across recent windows.

Execution lessons:
- Parse and persist each declared outage window as a separate event when a notice contains multiple windows; do not collapse to one record per notice.
- Apply stricter freshness and execution-capability guards during `coupled_window` days where afternoon and evening windows both exist.
- Treat missing timezone labels as a confidence downgrade in automated gating and incident replay alignment.

Contradiction noted:
- Prior simplification: Jan-Mar 2026 maintenance was modeled mainly as a clustered sequence. New extraction shows recurring shape properties (day-of-week concentration, coupled-window pattern, duration dispersion, timezone-label inconsistency) that materially improve operational-risk modeling.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus.
- [A] Strongest net-new signal this pass is Racing Australia's maintenance-shape telemetry (cadence, coupling, duration spread, and timezone-label confidence).

## Source notes (incremental additions for pass 150)

- Racing Australia Systems Status homepage (planned-outage cards covering Jan-Mar 2026 with per-card module/time-window summaries; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/
- Racing Australia Systems Status post, `Planned Maintenance - Thursday 5th March 2026` (example of coupled-window card structure and module-level scope; accessed 2026-04-04): https://racingaustraliasystemsstatus.horse/planned-maintenance-thursday-5th-march-2026.html

## Incremental sourced findings added in this run (2026-04-04, pass 151)

### Topaz migration and access gates add a concrete Australian provider-entitlement contract for greyhound quant pipelines

- [A/B] Betfair's Automation Hub states the legacy FastTrack workflow is deprecated and replaced by Topaz (`"The FastTrack API has changed to the Topaz API"`).
- [A/B] The Topaz tutorial states Topaz is provided by Greyhound Racing Victoria (GRV) to Betfair Australia/NZ customers and access is restricted to active AU/NZ Betfair accounts, with possible screening calls for new/no-automation-history accounts.
- [A/B] The same tutorial documents bulk historical access structure not previously encoded in the knowledge base: data availability from `2020-01-01`, monthly-or-daily block retrieval, and a recency boundary of `today - 1` for bulk pulls.
- [A/B] The published implementation pattern includes explicit handling for `429`/rate-limit and timeout errors with bounded retries, indicating that provider throttling/retry semantics are first-class ingestion constraints.
- [A/B] The tutorial's upcoming-race workflow explicitly discards Topaz `boxNumber` and replaces it with Betfair market-clarification derived box mappings for final fields, which implies a known late-field alignment gap between upstream form data and exchange execution surfaces.
- [A/B] Inference: AU greyhound execution research should treat Topaz as an entitlement-scoped, lagged bulk-history source plus a separate pre-race reconciliation problem, not as a single always-final authority.

Extracted data fields to add:
- `topaz_access_policy_snapshot.capture_ts`
- `topaz_access_policy_snapshot.provider_owner`
- `topaz_access_policy_snapshot.au_nz_active_account_required_flag`
- `topaz_access_policy_snapshot.screening_call_possible_flag`
- `topaz_access_policy_snapshot.key_request_channel`
- `topaz_coverage_window_snapshot.capture_ts`
- `topaz_coverage_window_snapshot.history_start_date`
- `topaz_coverage_window_snapshot.bulk_recency_lag_days`
- `topaz_coverage_window_snapshot.block_granularity_set(monthly|daily)`
- `topaz_coverage_window_snapshot.jurisdiction_codes_json`
- `topaz_bulk_pull_event.event_ts`
- `topaz_bulk_pull_event.owning_authority_code`
- `topaz_bulk_pull_event.block_type(month|day)`
- `topaz_bulk_pull_event.block_key`
- `topaz_bulk_pull_event.retry_count`
- `topaz_bulk_pull_event.failure_family(rate_limit|timeout|other)`
- `topaz_topology_reconciliation_event.event_ts`
- `topaz_topology_reconciliation_event.track_name`
- `topaz_topology_reconciliation_event.race_number`
- `topaz_topology_reconciliation_event.rug_number`
- `topaz_topology_reconciliation_event.topaz_box_number`
- `topaz_topology_reconciliation_event.betfair_box_number`
- `topaz_topology_reconciliation_event.box_override_applied_flag`

Model ideas:
- Add `provider_entitlement_readiness_score` features so Topaz-dependent pipelines are downweighted/blocked when account-status prerequisites are unmet.
- Add `field_topology_drift_rate` (Topaz vs Betfair rug/box mismatch share near jump) as a pre-trade confidence penalty for greyhound models.
- Add `lag_aware_training_cutoff` so model training windows respect Topaz bulk recency lag (`today-1`) and avoid accidental forward-looking leakage.

Execution lessons:
- Gate production jobs on explicit Topaz entitlement checks (active AU/NZ account state + key availability) before scheduling ingestion.
- Split backfill into monthly historical blocks and daily nearline blocks to reduce runtime and simplify idempotent retries.
- Treat race-day runner topology as a two-source reconciliation task; do not assume upstream form box assignment is final for exchange execution.

Contradiction noted:
- Prior simplification: Australian provider risk was modeled mostly as API uptime/maintenance and licensing-condition clocks. Topaz evidence adds a distinct entitlement-and-field-reconciliation failure domain for deployable greyhound strategies.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus.
- [A/B] Strongest net-new high-signal this pass is Australian data-provider contract structure (Topaz entitlement gates, bulk-window lag, and Topaz-vs-Betfair final-field reconciliation workflow).

## Source notes (incremental additions for pass 151)

- Betfair Automation Hub, `Greyhound Topaz API (Python)` (Topaz ownership/access gating, requirements, bulk-history structure, retry/error handling pattern, and upcoming-race reconciliation workflow; accessed 2026-04-04): https://betfair-datascientists.github.io/modelling/topazTutorial/
- Betfair Automation Hub, `Greyhound FastTrack API (Python)` (explicit deprecation note that FastTrack API changed to Topaz API; accessed 2026-04-04): https://betfair-datascientists.github.io/modelling/fasttrackTutorial/

## Incremental sourced findings added in this run (2026-04-05, pass 152)

### Racing Australia FOD compliance FAQ + appeal guidelines add deterministic fee/clock/evidence mechanics that materially affect registration-state reliability

- [A] Racing Australia's `Foal Ownership Compliance FAQs` page states baseline timing obligations and consequence ladders: live-foal Mare Return + FOD due within `30 days` of birth; late lodgement `31-60 days` incurs a `$360` fee; after `60 days` the foal is flagged `not eligible to race` unless appeal succeeds.
- [A] The same FAQ adds non-live and not-served branches with separate late-fee clocks (`$135`), and codifies post-flag constraints/permissions (horse may remain in breeding/export/training contexts while ineligible to register to race in Australia).
- [A] Racing Australia's `Appeal Guidelines in respect of Late Lodgement of Foal Ownership Declarations` PDF (dated `10 September 2025`) anchors the appeal process to Rules `AR 286`/`AR 287`, clarifies the `61-90 day` practical appeal window, and states appeals are not accepted more than `90 days` after the managing-owner notification email.
- [A] The same guidelines split fee treatment in a way not previously encoded: lodgement after `60 days` is accepted with current applicable fee (`$140 in 2025` as stated), horse is flagged ineligible, then a separate `$500` appeal fee applies (refunded if successful), with the current applicable late fee (`$360 in 2025`) still charged on success.
- [A] The guidelines define adjudication/process constraints that matter for state-transition timing: written-only submissions, no hearing/direct contact with adjudicator, independent legal expert decision-maker, and outcome generally advised within `21 days` of lodgement unless otherwise advised.
- [A/B] Inference: this is a multi-clock compliance regime (`birth-based due clock`, `notification-based appeal clock`, `decision SLA clock`) with evidence-quality gates, so foal eligibility should be modeled as a timed state machine rather than a binary late/not-late flag.

Extracted data fields to add:
- `ra_fod_rule_contract_snapshot.capture_ts`
- `ra_fod_rule_contract_snapshot.rules_referenced_json(AR286|AR287)`
- `ra_fod_rule_contract_snapshot.live_fod_due_days(30)`
- `ra_fod_rule_contract_snapshot.live_fod_late_band_1_start_days(31)`
- `ra_fod_rule_contract_snapshot.live_fod_late_band_1_end_days(60)`
- `ra_fod_rule_contract_snapshot.live_fod_late_fee_band_1_aud`
- `ra_fod_rule_contract_snapshot.live_fod_ineligible_threshold_days(>60)`
- `ra_fod_rule_contract_snapshot.after_60_lodgement_fee_aud_2025`
- `ra_fod_rule_contract_snapshot.appeal_fee_aud`
- `ra_fod_rule_contract_snapshot.appeal_fee_refundable_on_success_flag`
- `ra_fod_rule_contract_snapshot.appeal_hard_stop_days_from_notification(90)`
- `ra_fod_rule_contract_snapshot.appeal_decision_target_days(21)`
- `ra_fod_submission_event.event_ts`
- `ra_fod_submission_event.foal_id`
- `ra_fod_submission_event.days_from_birth_at_lodgement`
- `ra_fod_submission_event.ineligible_flag_assigned`
- `ra_fod_submission_event.after_60_lodgement_fee_aud`
- `ra_fod_appeal_event.event_ts`
- `ra_fod_appeal_event.foal_id`
- `ra_fod_appeal_event.days_from_notification`
- `ra_fod_appeal_event.accepted_for_consideration_flag`
- `ra_fod_appeal_event.decision_outcome(success|fail|rejected_insufficient_info)`
- `ra_fod_appeal_event.decision_turnaround_days`
- `ra_fod_appeal_event.appeal_fee_refund_applied_flag`
- `ra_fod_appeal_evidence_item.event_ts`
- `ra_fod_appeal_evidence_item.evidence_family(medical|weather|telecom|utility|engineering|financial|stat_dec|other)`

Model ideas:
- Add an `eligibility_transition_hazard` feature family using `days_from_birth`, `days_from_notification`, and evidence-completeness flags to model registration-state uncertainty.
- Add an `appeal_acceptance_prior` calibrated by evidence-family completeness and submission timing bucket (`<=60`, `61-90`, `>90`).
- Add a `registration_state_lock_risk` penalty for runners with unresolved/late FOD appeal states near intended execution windows.

Execution lessons:
- Persist both `birth-date` and `notification-email` timestamps; the appeal clock is notification-anchored, not purely birth-anchored.
- Treat `$360`, `$140 (2025 stated)`, and `$500` as versioned schedule values with effective-date tracking, not constants.
- Block production features that assume race-eligibility finality until FOD appeal state reaches terminal outcome.

Contradiction noted:
- Prior simplification: late FOD handling was treated mainly as one-time amnesty and coarse publication-lag signal. New RA FAQ + guidelines show a standing, rule-bound, multi-clock adjudication process with explicit fee layering and evidence thresholds.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond existing corpus.
- [A] Strongest net-new signal this pass is Racing Australia's clause-level FOD eligibility/appeal mechanics (clock structure, fee layering, and adjudication process constraints).

## Source notes (incremental additions for pass 152)

- Racing Australia, `Foal Ownership Compliance FAQs` (deadline/fee ladder, ineligibility consequences, and appeal-clock text; accessed 2026-04-05): https://www.racingaustralia.horse/RoR/Foal-Ownership-Compliance-FAQS.aspx
- Racing Australia PDF, `Appeal Guidelines in respect of Late Lodgement of Foal Ownership Declarations` (dated 10 September 2025; AR286/AR287 references, fee stack, 90-day appeal hard stop, and 21-day decision target; accessed 2026-04-05): https://www.racingaustralia.horse/RoR/Appeal-Guidelines-for-Late-Lodgement-of-Foal-Ownership-Declarations.pdf

## Incremental sourced findings added in this run (2026-04-05, pass 153)

### Racing NSW now exposes a concrete dual-surface signposting conflict for RFIU "current" conditions

- [A] The Racing NSW `Race Fields Legislation` page currently labels `RFIU Standard Conditions ... 2025-2026 Effective 1 July 2025` as the `Current` standard set and references `Betting and Racing Regulation 2022`.
- [A] The Racing NSW `Race Field Information Use` page (separate URL path on the same domain) still labels `RFIU Standard Conditions ... 2017-2018` as `Current` and references `Betting and Racing Regulation 2012` in the same section.
- [A/B] Inference: NSW race-fields policy ingestion has a real canonical-source ambiguity risk. A crawler or analyst selecting the wrong entry point can silently inherit outdated fee/condition assumptions while still reading a page marked `Current`.

Extracted data fields to add:
- `policy_source_surface_snapshot.capture_ts`
- `policy_source_surface_snapshot.provider`
- `policy_source_surface_snapshot.surface_url`
- `policy_source_surface_snapshot.surface_label(rfiu_legacy|race_fields_legislation)`
- `policy_source_surface_snapshot.current_conditions_label_text`
- `policy_source_surface_snapshot.current_effective_date_text`
- `policy_source_surface_snapshot.regulation_reference_text`
- `policy_source_surface_snapshot.version_conflict_flag`
- `policy_source_surface_snapshot.canonical_rank_score`
- `policy_source_surface_snapshot.last_verified_ts`

Model ideas:
- Add a `policy_source_conflict_risk` feature that downweights entitlement- and fee-sensitive outputs when provider "current" pages disagree.
- Add a `canonical_source_ranker` that scores candidate policy pages by recency markers (`effective date`, regulation version, condition vintage) before applying any contract updates.

Execution lessons:
- Treat provider-document URL selection as a first-class control-plane problem, not a documentation task.
- Require a two-source confirmation step before promoting new fee/condition parameters into production runtime config.
- Quarantine updates when source surfaces disagree on "current" versions until manual adjudication is complete.

Contradiction noted:
- Prior simplification: each jurisdiction/provider had a single practical "current policy" surface. Racing NSW now provides at least two active surfaces with conflicting `Current` version signals.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond the existing corpus.
- [A] Strongest net-new signal this pass is Australian provider-policy signposting integrity (Racing NSW dual-surface "Current" conflict).

## Source notes (incremental additions for pass 153)

- Racing NSW, `Race Fields Legislation` (shows `Current` links to 2025-2026 RFIU conditions and Regulation 2022 references; accessed 2026-04-05): https://www.racingnsw.com.au/rules-policies-whs/race-fields-legislation/
- Racing NSW, `Race Field Information Use` (separate surface showing `Current` links to 2017-2018 artifacts and Regulation 2012 references; accessed 2026-04-05): https://www.racingnsw.com.au/race-field-information-use/

## Incremental sourced findings added in this run (2026-04-05, pass 154)

### Keeneland now publishes an explicit pool-level takeout matrix that should be modeled alongside CAW participation and odds-refresh mechanics

- [A] Keeneland's official `Wagering Experience` page publishes pool-level minimum/takeout settings that were not previously encoded in this knowledge base, including: `Win 16%`, `Place 16%`, `Exacta 19.5%`, `Trifecta/Superfecta/Toyota Super High 5 22%`, `Daily Double 15%`, `Pick 5 15%`, and a split show-rate path (`10%` on-track show bonus vs `16%` off-track).
- [A] The same page retains venue-disclosed participation mix (`23%` CAW) and states odds refresh every `5 seconds` in the final two minutes before post, with wagering locked at the break of the gate.
- [A/B] Inference: CAW-share and late-odds behavior should be normalized by pool-specific takeout and channel-specific refresh contracts; a single venue-level takeout assumption will bias cross-pool edge and volatility estimates.

Extracted data fields to add:
- `venue_pool_takeout_snapshot.capture_ts`
- `venue_pool_takeout_snapshot.venue`
- `venue_pool_takeout_snapshot.wager_type`
- `venue_pool_takeout_snapshot.min_bet_amount`
- `venue_pool_takeout_snapshot.takeout_pct`
- `venue_pool_takeout_snapshot.channel_scope(on_track|off_track|all)`
- `venue_pool_takeout_snapshot.bonus_program_flag`
- `venue_pool_takeout_snapshot.source_url`
- `venue_odds_refresh_contract_snapshot.capture_ts`
- `venue_odds_refresh_contract_snapshot.venue`
- `venue_odds_refresh_contract_snapshot.final_window_seconds`
- `venue_odds_refresh_contract_snapshot.refresh_interval_seconds`
- `venue_odds_refresh_contract_snapshot.lock_event_definition`
- `venue_caw_mix_snapshot.capture_ts`
- `venue_caw_mix_snapshot.venue`
- `venue_caw_mix_snapshot.caw_share_pct`

Model ideas:
- Add a `pool_specific_post_takeout_edge` feature so expected value is calculated per wager type using venue-published takeout rather than one blended takeout prior.
- Add a `refresh_interval_pressure` feature using final-window refresh cadence (for example, 5-second cycles) to calibrate late-odds jump probability.
- Add a `caw_share_x_takeout_interaction` feature so CAW participation effects are estimated conditionally on pool economics.

Execution lessons:
- Persist pool-level takeout schedules as versioned contracts and replay backtests against the historically active schedule.
- Keep separate assumptions for on-track and off-track payout economics where bonus programs alter effective takeout.
- Do not compare CAW-share effects across venues without normalizing for pool-type mix and takeout structure.

Contradiction noted:
- Prior simplification: venue CAW-share and cutoff policy were treated as the dominant cross-venue comparators. Keeneland's published pool-level takeout matrix shows wagering economics are materially pool-specific inside the same venue.

### Daily Sectionals provider surfaces now expose practical AU scope and publication-lag contracts for sectional-data availability

- [A/B] Daily Sectionals' official FAQ states Race Speed Profiles are primarily focused on `Sydney and Melbourne Saturdays`, with additional selective carnival coverage.
- [A/B] The same FAQ states individual race reports are generally made available within `48 hours` after the last race at a major metropolitan or professional meeting.
- [A/B] Daily Sectionals' homepage states report coverage across major tracks in `Victoria` and `NSW` and major country meetings, and states data is collated via `live streaming captured technology`.
- [A/B] Inference: this provider should be modeled as a selective-coverage, T+48h publication source rather than a universal near-real-time sectional feed.

Extracted data fields to add:
- `sectional_provider_scope_snapshot.capture_ts`
- `sectional_provider_scope_snapshot.provider`
- `sectional_provider_scope_snapshot.primary_meeting_focus`
- `sectional_provider_scope_snapshot.secondary_coverage_note`
- `sectional_provider_scope_snapshot.state_coverage_json`
- `sectional_provider_scope_snapshot.capture_method_text`
- `sectional_provider_availability_contract_snapshot.capture_ts`
- `sectional_provider_availability_contract_snapshot.provider`
- `sectional_provider_availability_contract_snapshot.report_lag_hours_typical`
- `sectional_provider_availability_contract_snapshot.meeting_class_scope`
- `sectional_report_publication_event.event_ts`
- `sectional_report_publication_event.provider`
- `sectional_report_publication_event.meeting_id`
- `sectional_report_publication_event.last_race_ts`
- `sectional_report_publication_event.publish_ts`
- `sectional_report_publication_event.publish_lag_hours`

Model ideas:
- Add a `sectional_source_readiness_flag` and `sectional_publish_lag_hours` feature so models do not consume unavailable or stale sectionals in late pre-off windows.
- Add provider-coverage priors that downweight transfer assumptions for meetings outside the provider's declared focus slice.
- Add a `capture_method_regime` categorical feature to separate streaming-captured sectionals from other timing methodologies.

Execution lessons:
- Treat provider-declared publication lag as a hard freshness gate in feature assembly.
- Build fallback feature paths for meetings outside provider scope instead of assuming missing sectionals are random.
- Persist provider self-declared scope and lag contracts with capture dates, then verify against observed publication events.

Contradiction noted:
- Prior simplification: post-2026 Tasmanian sectional-provider changes were the main sectional regime risk. Daily Sectionals' own contracts add a separate scope-and-lag regime (meeting-focus plus T+48h publication) for AU sectional feature reliability.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary Betfair horse-racing microstructure contract was identified this pass beyond the existing corpus.
- [A/B] Strongest net-new signal this pass is venue-level wagering-economics structure (Keeneland pool takeout matrix) plus AU sectional-provider scope/lag contracts (Daily Sectionals).

## Source notes (incremental additions for pass 154)

- Keeneland, `Wagering Experience` (pool-level takeout matrix, CAW share disclosure, final-window odds refresh cadence, and lock-at-gate wording; accessed 2026-04-05): https://www.keeneland.com/wagering-experience
- Daily Sectionals, `FAQ` (meeting focus and `generally within 48 hours` report availability wording; accessed 2026-04-05): https://dailysectionals.com.au/faq/
- Daily Sectionals, `Home` (coverage across VIC/NSW major tracks/country meetings and live-stream capture method statement; accessed 2026-04-05): https://dailysectionals.com.au/

## Incremental sourced findings added in this run (2026-04-05, pass 155)

### RISE API access terms introduce a hard provider-contract regime (approval gate, key-scope limits, and revocable content rights)

- [A/B] RISE's official API product page positions the offering as a `Harness Racing API` for Australian harness-racing data and routes users to a controlled-access documentation/key workflow.
- [A/B] RISE's API-key request terms state `specific written approval` is required before use, and only one API key is issued per commercial service (not per end customer), creating an explicit tenancy/entitlement constraint.
- [A/B] The same terms require users to provide RISE temporary free access to public apps/sites for compliance checks, and require removal/deletion of obtained content within `30 days` if requested.
- [A/B] The same terms disclaim availability/performance undertakings, reserve rights to modify/turn off the API without notice, reserve call-limiting rights, and do not guarantee backward compatibility of new versions.
- [A/B] Inference: for AU harness data, provider risk is not only uptime/latency; it includes explicit `approval-state`, `key-tenancy`, `content-retention revocation`, and `schema/service volatility` controls that must be modeled in both research replay and production execution.

Extracted data fields to add:
- `provider_contract_snapshot.capture_ts`
- `provider_contract_snapshot.provider`
- `provider_contract_snapshot.product_surface`
- `provider_contract_snapshot.written_approval_required_flag`
- `provider_contract_snapshot.key_scope(one_per_commercial_service)`
- `provider_contract_snapshot.end_customer_direct_keys_allowed_flag`
- `provider_contract_snapshot.publisher_compliance_access_required_flag`
- `provider_contract_snapshot.content_removal_on_request_flag`
- `provider_contract_snapshot.content_removal_sla_days`
- `provider_contract_snapshot.backward_compatibility_guaranteed_flag`
- `provider_contract_snapshot.service_availability_guarantee_flag`
- `provider_contract_snapshot.rate_limit_discretionary_flag`
- `provider_access_state_event.event_ts`
- `provider_access_state_event.provider`
- `provider_access_state_event.approval_state(pending|approved|revoked)`
- `provider_access_state_event.api_key_scope`
- `provider_content_removal_event.event_ts`
- `provider_content_removal_event.provider`
- `provider_content_removal_event.dataset_family`
- `provider_content_removal_event.request_received_ts`
- `provider_content_removal_event.removal_completed_ts`

Model ideas:
- Add a `provider_contract_stability_score` feature that downweights provider-dependent signals when backward-compatibility and availability are non-guaranteed.
- Add a `provider_entitlement_state` feature family (`pending`, `approved`, `revoked`) so models/execution can fail closed when approval/key state changes.
- Add a `content_revocation_risk` feature to suppress reliance on datasets subject to active removal requests.

Execution lessons:
- Treat provider approval and key-scope checks as startup preflight gates, not manual onboarding notes.
- Persist versioned provider-contract snapshots and block deployment when key-scope or removal clauses change.
- Implement a deletion workflow with evidence logs to satisfy 30-day removal obligations.
- Separate `provider schema drift` alerts from transport-health alerts; both can independently invalidate replay/live parity.

Contradiction noted:
- Prior simplification: AU provider reliability was weighted mostly toward transport, maintenance windows, and statutory authority clocks. RISE terms add a stronger contractual-control plane (approval/key tenancy/revocation/compatibility risk) that can disable valid pipelines even when transport health is normal.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond the existing NYRA/Del Mar/CHRB/Betfair corpus.
- [A/B] Strongest net-new signal this pass is AU provider-contract mechanics from RISE API access terms.

## Source notes (incremental additions for pass 155)

- RISE Racing, `RISE Racing API` (product surface framing for Australian harness racing API and gated docs/key workflow; accessed 2026-04-05): https://www.riseracing.com/products/rise-api/
- RISE Digital, `Request an API Key` (terms covering written approval gate, one-key-per-service scope, content-removal obligation, and service/backward-compatibility disclaimers; accessed 2026-04-05): https://www.rise-digital.com.au/products/rise-api/request-an-api-key/

## Incremental sourced findings added in this run (2026-04-05, pass 156)

### Daily Sectionals product surfaces add a dual-edition timing contract and broader state scope that tightens freshness/coverage assumptions

- [A/B] Daily Sectionals `Race Speed Profile Early Edition` product page states reports are available on `Thursdays or Fridays`, `24-48hrs prior` to meeting, establishing a pre-meeting feed contract not previously encoded as a provider-level timing surface.
- [A/B] Daily Sectionals subscription pages for Early Edition (`4`, `10`, `20` week variants) state coverage is `Saturday metro meetings only` and can be selected per state from `VIC/NSW/QLD/WA/SA`, plus a race-morning update `prior to 9.30am`.
- [A/B] Daily Sectionals `Race Speed Profile Final Edition` page states finals are available `race morning after scratchings`, which conflicts with a strict-only reading of FAQ wording that individual reports are generally available within `48 hours` after the meeting.
- [A/B] Inference: Daily Sectionals should be modeled as a dual-latency provider (`pre-off/race-morning product layer` + `post-meeting report layer`) with product-scoped coverage constraints, not as a single T+48h-only sectional source.

Extracted data fields to add:
- `sectional_product_contract_snapshot.capture_ts`
- `sectional_product_contract_snapshot.provider`
- `sectional_product_contract_snapshot.product_name(rsp_early|rsp_final|subscription_early)`
- `sectional_product_contract_snapshot.coverage_scope_text`
- `sectional_product_contract_snapshot.coverage_meeting_class(saturday_metro_only|other)`
- `sectional_product_contract_snapshot.coverage_state_set_json`
- `sectional_product_contract_snapshot.pre_meeting_release_window_text`
- `sectional_product_contract_snapshot.race_morning_update_cutoff_local_time`
- `sectional_product_contract_snapshot.after_scratchings_release_flag`
- `sectional_product_contract_snapshot.delivery_channel(email_download|store_download|other)`
- `sectional_publication_event.event_ts`
- `sectional_publication_event.provider`
- `sectional_publication_event.product_name`
- `sectional_publication_event.meeting_id`
- `sectional_publication_event.publish_phase(pre_meeting|race_morning|post_meeting)`
- `sectional_publication_event.publish_local_ts`
- `sectional_publication_event.hours_to_first_race`
- `sectional_publication_event.after_scratchings_flag`

Model ideas:
- Add a `sectional_phase_availability` feature family (`pre_meeting`, `race_morning_after_scratchings`, `post_meeting`) so feature eligibility is phase-aware rather than provider-wide.
- Add a `state_scope_match` feature to penalize transfer assumptions when meeting state/class falls outside product-declared scope.
- Add a `scratchings_sync_gap` feature measuring time between latest scratchings event and sectional publication timestamp.

Execution lessons:
- Separate product-level SLAs from provider-level FAQ statements; ingest both and resolve conflicts explicitly.
- Gate pre-off models on race-morning publication and scratchings-sync checks, not only on generic provider freshness windows.
- Persist product/cadence contract snapshots because e-commerce copy can drift without versioned API changelogs.

Contradiction noted:
- Prior simplification: Daily Sectionals was treated primarily as a selective-coverage source with typical post-meeting (`<=48h`) availability. Product/subscription pages show an additional pre-meeting and race-morning delivery regime with Saturday-metro state packs (`VIC/NSW/QLD/WA/SA`) and after-scratchings finals.

### Named-operator delta check (Benter, Woods, Walsh, Ranogajec, CAW teams, Betfair microstructure)

- [A/B] No net-new primary internal-method disclosures were identified this pass for Bill Benter, Alan Woods, David Walsh, or Zeljko Ranogajec.
- [A/B] No stronger primary CAW-team or Betfair horse-racing microstructure contract was identified this pass beyond the existing corpus.
- [A/B] Strongest net-new signal this pass is Australian sectional-provider contract stratification (Daily Sectionals dual-edition timing and scope mechanics).

## Source notes (incremental additions for pass 156)

- Daily Sectionals, `Race Speed Profile Early Edition` (Thursday/Friday availability and 24-48h pre-meeting timing statement; accessed 2026-04-05): https://dailysectionals.com.au/product/race-speed-profile-early-edition/
- Daily Sectionals, `Race Speed Profile Final Edition` (race-morning after-scratchings availability statement; accessed 2026-04-05): https://dailysectionals.com.au/product/race-speed-profile-final-edition/
- Daily Sectionals, `Subscription - Early Edition Reports 4 Weeks` (Saturday-metro-only state coverage set and race-morning pre-9:30am update statement; accessed 2026-04-05): https://dailysectionals.com.au/product/subscription-package-early-edition-reports-4-weeks/
- Daily Sectionals, `Subscription - Early Edition Reports 10 Weeks` (same coverage/timing contract replicated across term variants; accessed 2026-04-05): https://dailysectionals.com.au/product/subscription-package-early-edition-reports-10-weeks/
- Daily Sectionals, `Subscription - Early Edition Reports 20 Weeks` (same coverage/timing contract replicated across term variants; accessed 2026-04-05): https://dailysectionals.com.au/product/subscription-package-early-edition-reports-20-weeks/

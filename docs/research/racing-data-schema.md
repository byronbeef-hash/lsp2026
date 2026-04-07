# Racing Data Schema

Last updated: 2026-03-28

## Schema principles

- Preserve raw provider payloads.
- Normalize into canonical internal tables.
- Version important derived artifacts.
- Keep everything point-in-time safe.
- Separate model inputs from post-race outcomes.

## Naming convention

- Singular conceptual entities use plural table names.
- Provider-specific identifiers are stored alongside internal IDs.
- Timestamp columns are UTC.
- Monetary columns are decimal, never float, in AUD unless noted.

## Core entities

### providers

Purpose:

- Reference table for external systems.

Columns:

- `id`
- `code` such as `betfair`, `punting_form`, `official_results`
- `name`
- `created_at`

### meetings

Purpose:

- Meeting-level metadata.

Columns:

- `id`
- `meeting_date`
- `jurisdiction`
- `venue_code`
- `venue_name`
- `country_code`
- `race_type`
- `surface`
- `provider_primary_id`
- `created_at`
- `updated_at`

### races

Purpose:

- Canonical race record.

Columns:

- `id`
- `meeting_id`
- `race_number`
- `scheduled_jump_at`
- `actual_jump_at`
- `race_name`
- `class_name`
- `distance_m`
- `track_condition`
- `rail_position`
- `prize_money`
- `age_restriction`
- `sex_restriction`
- `min_weight_kg`
- `max_weight_kg`
- `status`
- `created_at`
- `updated_at`

### runners

Purpose:

- Canonical runner identity within a race.

Columns:

- `id`
- `race_id`
- `horse_id`
- `runner_number`
- `barrier`
- `allocated_weight_kg`
- `jockey_id`
- `trainer_id`
- `apprentice_claim_kg`
- `gear_changes_text`
- `is_scratched`
- `scratched_at`
- `created_at`
- `updated_at`

### horses

Purpose:

- Horse-level identity and relatively stable attributes.

Columns:

- `id`
- `horse_name`
- `sex`
- `foaling_year`
- `country_of_origin`
- `sire_name`
- `dam_name`
- `color`
- `created_at`
- `updated_at`

### people

Purpose:

- Shared identity table for jockeys, trainers, and others if needed.

Columns:

- `id`
- `person_type`
- `display_name`
- `country_code`
- `created_at`
- `updated_at`

## Provider mapping tables

### provider_meetings

Columns:

- `id`
- `provider_id`
- `meeting_id`
- `provider_meeting_id`
- `provider_payload`
- `created_at`

### provider_races

Columns:

- `id`
- `provider_id`
- `race_id`
- `provider_race_id`
- `provider_payload`
- `created_at`

### provider_runners

Columns:

- `id`
- `provider_id`
- `runner_id`
- `provider_runner_id`
- `provider_payload`
- `created_at`

### providers_markets

Purpose:

- Maps a canonical race to provider-specific market identifiers.

Columns:

- `id`
- `provider_id`
- `race_id`
- `market_type`
- `provider_market_id`
- `market_status`
- `market_start_at`
- `created_at`
- `updated_at`

## Raw ingest tables

### raw_provider_events

Purpose:

- Append-only storage of fetched payloads for replay and debugging.

Columns:

- `id`
- `provider_id`
- `endpoint_name`
- `requested_at`
- `response_status`
- `request_key`
- `payload_json`

### raw_market_snapshots

Purpose:

- Raw ladder snapshots before normalization.

Columns:

- `id`
- `provider_id`
- `provider_market_id`
- `captured_at`
- `payload_json`

## Normalized market tables

### market_snapshots

Purpose:

- One record per market snapshot time.

Columns:

- `id`
- `race_id`
- `provider_id`
- `market_type`
- `provider_market_id`
- `captured_at`
- `seconds_to_jump`
- `market_status`
- `in_play`
- `total_matched_aud`
- `source_latency_ms`
- `created_at`

### runner_market_snapshots

Purpose:

- One record per runner within a snapshot.

Columns:

- `id`
- `market_snapshot_id`
- `runner_id`
- `best_back_price`
- `best_back_size`
- `best_lay_price`
- `best_lay_size`
- `last_traded_price`
- `traded_volume_aud`
- `implied_probability_raw`
- `book_percentage_raw`
- `created_at`

### tote_probables

Purpose:

- Tote win/place and exotic probable dividends when available.

Columns:

- `id`
- `race_id`
- `provider_id`
- `captured_at`
- `runner_id`
- `pool_type`
- `dividend_decimal`
- `pool_size_aud`
- `created_at`

## Race-performance tables

### race_results

Columns:

- `id`
- `race_id`
- `official_time_seconds`
- `winning_margin_lengths`
- `stewards_report_text`
- `created_at`

### runner_results

Columns:

- `id`
- `runner_id`
- `finish_position`
- `finish_margin_lengths`
- `settle_position`
- `running_line_text`
- `official_weight_kg`
- `starting_price_decimal`
- `tote_win_dividend`
- `tote_place_dividend`
- `did_not_finish`
- `created_at`

### sectional_results

Purpose:

- Flexible sectional breakdown.

Columns:

- `id`
- `runner_result_id`
- `section_order`
- `distance_from_finish_m`
- `split_seconds`
- `split_rank`
- `created_at`

## Historical form tables

### runner_form_lines

Purpose:

- Prior starts denormalized for feature generation.

Columns:

- `id`
- `horse_id`
- `race_id`
- `runner_id`
- `historical_race_id`
- `historical_race_date`
- `days_ago`
- `finish_position`
- `margin_lengths`
- `distance_m`
- `track_condition`
- `class_name`
- `barrier`
- `weight_kg`
- `speed_rating_raw`
- `pace_rating_raw`
- `finish_rating_raw`
- `created_at`

### track_bias_observations

Purpose:

- Regime and lane-bias tracking.

Columns:

- `id`
- `meeting_id`
- `race_id`
- `captured_at`
- `inside_bias_score`
- `onpace_bias_score`
- `wide_lane_penalty_score`
- `notes`
- `created_at`

## Feature store tables

### feature_sets

Purpose:

- Named feature group versions.

Columns:

- `id`
- `feature_set_name`
- `version`
- `description`
- `created_at`

### feature_snapshots

Purpose:

- Point-in-time feature bundle for a runner.

Columns:

- `id`
- `race_id`
- `runner_id`
- `feature_set_id`
- `decision_ts`
- `decision_offset_seconds`
- `created_at`

### feature_values

Purpose:

- Sparse or wide-store companion for feature snapshots.

Columns:

- `id`
- `feature_snapshot_id`
- `feature_name`
- `feature_value_numeric`
- `feature_value_text`
- `created_at`

### feature_snapshot_labels

Purpose:

- Post-race outcomes joined later for training.

Columns:

- `id`
- `feature_snapshot_id`
- `won`
- `placed`
- `finish_position`
- `final_best_back_price`
- `final_tote_price`
- `created_at`

## Modeling tables

### model_registry

Columns:

- `id`
- `model_name`
- `model_family`
- `version`
- `feature_set_id`
- `training_window_start`
- `training_window_end`
- `status`
- `artifact_uri`
- `created_at`

### model_runs

Columns:

- `id`
- `model_registry_id`
- `started_at`
- `completed_at`
- `run_status`
- `params_json`
- `metrics_json`

### evaluation_runs

Columns:

- `id`
- `model_registry_id`
- `evaluation_type`
- `window_start`
- `window_end`
- `metrics_json`
- `created_at`

## Live pricing and recommendation tables

### live_runner_prices

Purpose:

- Current private and blended prices produced by the signal service.

Columns:

- `id`
- `race_id`
- `runner_id`
- `decision_ts`
- `private_probability`
- `market_probability`
- `blended_probability`
- `uncertainty_penalty`
- `fair_odds`
- `best_back_price`
- `net_expected_value`
- `robust_expected_value`
- `confidence_score`
- `created_at`

### bet_recommendations

Columns:

- `id`
- `race_id`
- `runner_id`
- `decision_ts`
- `recommendation_status`
- `reason_codes_json`
- `recommended_stake_aud`
- `fractional_kelly`
- `max_slippage_bps`
- `created_at`

## Execution tables

### orders

Columns:

- `id`
- `provider_id`
- `race_id`
- `runner_id`
- `bet_recommendation_id`
- `submitted_at`
- `order_status`
- `side`
- `price_requested`
- `size_requested_aud`
- `price_matched`
- `size_matched_aud`
- `provider_order_id`
- `response_payload_json`
- `created_at`

### bets

Purpose:

- Settled bet ledger.

Columns:

- `id`
- `order_id`
- `settled_at`
- `outcome_status`
- `gross_pnl_aud`
- `commission_aud`
- `rebate_aud`
- `net_pnl_aud`
- `clv_vs_final_exchange`
- `clv_vs_final_tote`
- `created_at`

### daily_risk_state

Columns:

- `id`
- `trading_date`
- `mode`
- `bankroll_start_aud`
- `bankroll_end_aud`
- `turnover_aud`
- `realized_pnl_aud`
- `open_exposure_aud`
- `max_loss_limit_aud`
- `max_turnover_limit_aud`
- `status`
- `created_at`

### risk_events

Columns:

- `id`
- `trading_date`
- `race_id`
- `runner_id`
- `event_type`
- `severity`
- `details_json`
- `created_at`

## Metrics tables

### model_metrics_daily

Columns:

- `id`
- `trading_date`
- `model_registry_id`
- `sample_size`
- `log_loss`
- `brier_score`
- `roi`
- `clv`
- `max_drawdown`
- `metrics_json`
- `created_at`

### execution_metrics_daily

Columns:

- `id`
- `trading_date`
- `provider_id`
- `bets_count`
- `turnover_aud`
- `average_slippage_bps`
- `average_seconds_to_jump`
- `created_at`

## Canonical feature families for v1

### Private form features

- `speed_last_3_mean`
- `speed_last_3_best`
- `finish_rating_last_3_mean`
- `pace_rating_last_3_mean`
- `days_since_last_start`
- `first_up_flag`
- `second_up_flag`
- `class_delta`
- `distance_delta_m`
- `track_condition_suitability`
- `distance_suitability`
- `barrier_win_rate_context`
- `jockey_trainer_combo_score`

### Race-context features

- `field_size`
- `rail_position_code`
- `track_condition_code`
- `weather_code`
- `wind_strength`
- `track_bias_inside_score`
- `track_bias_onpace_score`

### Market features

- `market_prob_t_minus_30`
- `market_prob_t_minus_10`
- `market_prob_t_minus_5`
- `market_prob_t_minus_2`
- `market_drift_30_to_5`
- `market_drift_5_to_2`
- `matched_volume_share_t_minus_2`
- `exchange_spread_t_minus_2`
- `market_rank_t_minus_2`

### Execution features

- `seconds_to_jump`
- `liquidity_at_best_back`
- `estimated_slippage_ticks`
- `overround_normalized`
- `commission_rate`

## Point-in-time rules

- Every feature snapshot is keyed by `decision_ts`.
- Only data available on or before `decision_ts` may populate that snapshot.
- Final SP, final tote, settled results, and post-jump commentary are never available to the live feature builder.
- Backtests must reconstruct recommendations using historical snapshots, not hindsight joins.

## Recommended first implementation subset

Build these tables first:

- `meetings`
- `races`
- `runners`
- `providers_markets`
- `market_snapshots`
- `runner_market_snapshots`
- `runner_results`
- `feature_sets`
- `feature_snapshots`
- `feature_values`
- `live_runner_prices`
- `bet_recommendations`
- `orders`
- `bets`
- `daily_risk_state`

That subset is enough to support:

- market collection
- baseline control model
- first private model
- paper trading
- CLV and settlement analytics

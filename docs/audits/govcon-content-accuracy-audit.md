# GovCon Content Accuracy Audit — 2026-06-04

## Why this audit happened

A recent GovCon post stated the federal micro-purchase threshold (MPT) was **$10,000**. That value is outdated. Per **FAR 2.101**, the general MPT was raised to **$15,000** effective **2025-10-01** (with exceptions, including a lower threshold for construction subject to wage-rate requirements). The outdated post drew negative public comments. This audit documents the structural fix.

## What was repaired

### 1. Hard-coded outdated `$10K` micro-purchase claims (4 sites)

| File | Where | Old | New |
|---|---|---|---|
| `content/banks/content-pillars.json` | `pillar_micro_purchase_readiness.description` | "under-$10K actions" | "at or below the general FAR micro-purchase threshold (currently $15,000; exceptions apply). The general MPT was raised from $10,000 to $15,000 effective 2025-10-01 per FAR 2.101." |
| `content/banks/content-pillars.json` | `pillar_micro_purchase_readiness.proof_signals[]` | "Stated under-$10K response posture" | "Stated response posture at or below the general FAR micro-purchase threshold (currently $15,000; exceptions apply)" |
| `content/banks/hook-bank.json` | `hook_028.hook` | "Under $10K: documented, certified, responsive. That's the only filter that matters." | "At or below the general FAR micro-purchase threshold (currently $15,000; exceptions apply): documented, certified, responsive. Those filters move first." |
| `content/govcon-30-day-posting-schedule.json` | Day 26 `post_copy` | "ready for under-$10K actions" | "ready for purchases at or below the general FAR micro-purchase threshold (currently $15,000; exceptions apply). Many micro-purchases are not publicly posted on SAM.gov…" |

Each repaired record now carries `fact_authority_used` (fact_ids from `content/govcon/fact-authority.mjs`), `source_checked_at: 2026-06-04`, and a `review_status` of `BLOCKED_FACT_CHECK_REPAIRED` or `NEEDS_REVIEW_FACT_REPAIRED` so it is excluded from any scheduled run until a human re-verifies and clears it.

### 2. Unverified Simplified Acquisition Threshold ($250K) pairings (4 sites)

| File | Where | Treatment |
|---|---|---|
| `content/banks/content-pillars.json` | `pillar_simplified_acquisition_support.description` | Reframed: "ARCG specializes in under-$250K work as a stated operator preference. The legal SAT value must be verified against FAR 2.101 before any public claim quotes a dollar value." |
| `content/banks/content-pillars.json` | `pillar_simplified_acquisition_support.sample_angles` + `proof_signals` | Same caveat added. |
| `content/banks/hook-bank.json` | `hook_030` (`$250K obligation`), `hook_032` (`Under $250K`) | Hooks reworded; legal-dollar-value caveat added; `fact_authority_required` set; `risk_level: medium`. |
| `content/govcon-30-day-posting-schedule.json` | Day 13, Day 20 | Rewritten to remove the legal SAT-value framing; reframed as ARCG operator preference + verify-current-SAT caveat. Marked `NEEDS_REVIEW_FACT_REPAIRED`. |

The fact checker now blocks any post that pairs "$250K" with "Simplified Acquisition Threshold" + "threshold" unless the operator has run source verification.

### 3. Stale statutory goal percentages (1 site)

| File | Where | Old | New |
|---|---|---|---|
| `content/banks/content-pillars.json` | `pillar_certified_small_business_advantage.sample_angles[]` | "Set-aside quotas: SDVOSB 3%, small business 23%, and how ARCG helps" | "Government-wide statutory small-business and SDVOSB procurement goals (verify current percentages with SBA before quoting) and how ARCG helps" |

Background: government-wide statutory procurement goal percentages under **15 U.S.C. § 644(g)** have been amended by Congress in recent NDAA cycles. Asserting a specific percentage publicly without re-verifying the current value against the SBA primary source is a fact-check risk. The fact checker now unconditionally blocks `SDVOSB 3%` / `3% SDVOSB` / `3 percent SDVOSB`.

## New modules added

### `content/govcon/fact-authority.mjs`

Source-of-truth fact table. 9 fact records with:
- `fact_id`
- `canonical_claim`
- `current_value` / `old_value` / `effective_date`
- `exceptions[]`
- `primary_sources[]` (acquisition.gov, sba.gov, sam.gov, gsa.gov only)
- `last_verified_date`
- `risk_level` (`legal_or_procurement_rule` / `agency_or_program_policy` / `operational_claim`)
- `required_disclaimer`
- `allowed_post_language[]`
- `blocked_post_language[]`

Fact records:

1. `FAR_MICRO_PURCHASE_THRESHOLD_GENERAL` — $15,000 effective 2025-10-01 (FAR 2.101)
2. `FAR_MICRO_PURCHASE_CONSTRUCTION_EXCEPTION` — $2,000 for wage-rate construction (FAR 2.101)
3. `FAR_MICRO_PURCHASE_PREFERRED_PAYMENT_METHOD` — Governmentwide commercial purchase card preferred (FAR 13.201)
4. `FAR_MICRO_PURCHASE_COMPETITION` — may be awarded without competitive quotations if price reasonable (FAR 13.203)
5. `FAR_SMALL_BUSINESS_SET_ASIDE_ABOVE_MPT_TO_SAT` — generally reserved for small business above MPT and not over SAT (FAR 19.502-2)
6. `FAR_PUBLICIZING_NOT_ALWAYS_SAM` — not all micro-purchases are publicly posted on SAM.gov (FAR Part 5)
7. `SAM_API_SEARCH_LIMITATION` — SAM.gov ≠ all federal buying
8. `FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL` — must verify current SAT against FAR 2.101 before quoting a value
9. `STATUTORY_SMALL_BUSINESS_PROCUREMENT_GOAL_PERCENTAGES` — verify with SBA / 15 U.S.C. § 644(g) before publicly quoting any percentage

`LAST_HUMAN_VERIFICATION`: `2026-06-04`. **Operators must re-verify before each campaign cycle.**

### `content/govcon/fact-checker.mjs`

Pre-publication gate. Exports `checkPost(input)`, `checkBatch(posts)`, `buildSafeRewrite(text)`, `ALWAYS_BLOCKED_PHRASES`, `RISKY_TERMS`. Behavior:

- Detects risky terms (micro-purchase, FAR, SAM.gov, set-aside, SDVOSB, HUBZone, sole source, GPC, RFQ/RFP, etc.).
- Unconditionally blocks hype phrases (`guaranteed award`, `we guarantee`, `easy money`, `easiest federal revenue`, `automatic award`, `no competition ever`, `always posted on SAM.gov`, `must buy`, `award-winning`, `preferred vendor of`, etc.).
- Blocks the outdated `$10K` / `$10,000` / `under $10` patterns when they appear within ~80 characters of micropurchase context.
- Requires the `general threshold; exceptions apply` disclaimer when `$15,000` / `$15K` appears in micropurchase context.
- Requires `source_checked_at` + `authority_used` (fact_ids) in post metadata for any post asserting a regulated claim.
- Blocks `$250K` + `Simplified Acquisition Threshold` + `threshold` pairing without source check.
- Output: `{ status: APPROVED | NEEDS_REVIEW | BLOCKED_FACT_CHECK, issues, required_edits, source_notes, safe_rewrite, authority_used, last_verified_date, platform }`.
- `buildSafeRewrite(text)` produces a corrected draft starting point.

## Tests added

`test/govcon-fact-checker.test.mjs` — **30 tests, all passing**.

Coverage:
- 5 hype/illegal-claim block tests
- 5 outdated-$10K-MPT detection tests (incl. confirms it does NOT block `$10K` away from micropurchase context)
- 3 current-$15K-MPT tests (block without disclaimer, approve with disclaimer, approve `$15K` with disclaimer)
- 3 source-check-metadata tests
- 1 SAT dollar-value block
- 1 `SDVOSB 3%` outright block
- 4 safe-rewrite tests (rewrites $10K→$15K+disclaimer, rewritten post passes checker, scrubs hype phrases)
- 6 fact-authority structural tests (every fact has contract fields, $15K + 2025-10-01 effective date, blocked-phrase list, source-check-required facts, recent verification date, recheck reminder content)
- 2 batch-check tests (live 30-day schedule has no outdated $10K post; `checkBatch` returns per-post verdicts)

## Posts blocked / repaired in this audit

| Post | File | Status | Required action |
|---|---|---|---|
| Day 26 micro-purchase ($10K) | `govcon-30-day-posting-schedule.json` | **REPAIRED** → `BLOCKED_FACT_CHECK_REPAIRED` | Operator must re-run checker after re-verifying FAR MPT |
| Day 13 SDVOSB sole-source ($250K SAT) | `govcon-30-day-posting-schedule.json` | **REPAIRED** → `NEEDS_REVIEW_FACT_REPAIRED` | Operator must re-verify current SAT at FAR 2.101 |
| Day 20 SDVOSB under $250K (SAT) | `govcon-30-day-posting-schedule.json` | **REPAIRED** → `NEEDS_REVIEW_FACT_REPAIRED` | Operator must re-verify current SAT at FAR 2.101 |
| `pillar_micro_purchase_readiness` description + proof_signals | `content/banks/content-pillars.json` | **REPAIRED** | New content carries `fact_authority_required` |
| `pillar_simplified_acquisition_support` description + sample_angles + proof_signals | `content/banks/content-pillars.json` | **REPAIRED** | Reframed as operator preference; SAT value caveated |
| `pillar_certified_small_business_advantage` sample_angles | `content/banks/content-pillars.json` | **REPAIRED** | SDVOSB/small-business goal percentages removed; verify-with-SBA caveat added |
| `hook_028` ($10K) | `content/banks/hook-bank.json` | **REPAIRED** | New hook + `fact_authority_required` |
| `hook_030` ($250K SAT) | `content/banks/hook-bank.json` | **REPAIRED** | Reworded; risk_level raised to medium |
| `hook_032` (Under $250K SAT) | `content/banks/hook-bank.json` | **REPAIRED** | Reworded; risk_level raised to medium |

No live posts were published during this audit (per the critical rule).

## Remaining manual review items

1. **Re-verify FAR 2.101 micro-purchase threshold and exceptions** against acquisition.gov before scheduling the repaired Day 26 post or any future MPT-mentioning content. Update `LAST_HUMAN_VERIFICATION` in `content/govcon/fact-authority.mjs` when re-checked.
2. **Re-verify the current Simplified Acquisition Threshold** against FAR 2.101 before scheduling the repaired Day 13 and Day 20 posts. If the value remains $250K, the operator can lift the verify-current-SAT caveat from public copy after recording the verification date.
3. **Re-verify the current statutory small-business / SDVOSB procurement goal percentages** with the SBA before any new content quotes a number.
4. **Apply `checkBatch` over `content/govcon-90-day-calendar.json`** before generating any month's content. The 90-day calendar is strategic-only and does not include `post_copy`, so no repair was needed today; but every future generated post must pass the checker.
5. **Wire `fact-checker.mjs` into the pre-Buffer flow** so that `buffer-schedule-calendar.mjs` refuses to schedule any post whose verdict is `BLOCKED_FACT_CHECK` and surfaces `NEEDS_REVIEW` posts for manual approval. (Wiring is out of scope for this audit — module exists and is testable; integration is a follow-up.)

## Source-backed rule table (snapshot of `fact-authority.mjs` as of 2026-06-04)

| fact_id | canonical_claim | current_value | primary_sources |
|---|---|---|---|
| FAR_MICRO_PURCHASE_THRESHOLD_GENERAL | The general FAR micro-purchase threshold is $15,000. | $15,000 (effective 2025-10-01) | acquisition.gov/far/2.101, acquisition.gov/content/section-19006-threshold-changes |
| FAR_MICRO_PURCHASE_CONSTRUCTION_EXCEPTION | Construction subject to wage-rate requirements has a lower MPT. | $2,000 | acquisition.gov/far/2.101 |
| FAR_MICRO_PURCHASE_PREFERRED_PAYMENT_METHOD | GPC is preferred for micro-purchases. | GPC preferred | acquisition.gov/far/13.201 |
| FAR_MICRO_PURCHASE_COMPETITION | Micro-purchases may be awarded without competitive quotations if price is reasonable. | No competition required, equitable distribution applies | acquisition.gov/far/13.203 |
| FAR_SMALL_BUSINESS_SET_ASIDE_ABOVE_MPT_TO_SAT | Above MPT and not over SAT generally reserved for small business. | Generally reserved subject to CO determination | acquisition.gov/far/19.502-2, acquisition.gov/far/subpart-19.5 |
| FAR_PUBLICIZING_NOT_ALWAYS_SAM | Not all small purchases are publicly posted on SAM.gov. | Publicizing requirements vary | acquisition.gov/far/part-5, sam.gov |
| SAM_API_SEARCH_LIMITATION | SAM.gov ≠ all federal buying. | Partial view | sam.gov/content/api, open.gsa.gov/api |
| FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL | SAT must be verified against FAR 2.101 before quoting. | Verify before quoting | acquisition.gov/far/2.101 |
| STATUTORY_SMALL_BUSINESS_PROCUREMENT_GOAL_PERCENTAGES | Verify current goal percentages with SBA before quoting. | Verify with SBA | sba.gov/federal-contracting, 15 U.S.C. § 644(g) |

## Audit metadata

- **Date:** 2026-06-04
- **Auditor commit hash:** see `git log -1` post-commit
- **Tests:** 30/30 passing (`node test/govcon-fact-checker.test.mjs`)
- **Posts published during audit:** zero
- **Buffer/social workflows touched:** zero
- **`.env` files touched:** zero
- **Authoritative reminder:** FAR / statutory rules must be re-checked against primary sources before each campaign cycle. Do not use prior posts, blog posts, LinkedIn posts, YouTube videos, or AI-generated summaries as authority.

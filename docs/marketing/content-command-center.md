# ARCG Content Command Center

## Purpose

The Content Command Center generates, validates, exports, and schedules monthly social posts for the ARCG product family:

- ARCG Systems
- SourceDeck
- ChartNav
- Rezy

Buffer is the posting pipe. ARCG owns the content strategy and calendar.

## Security Rules

- Never commit `BUFFER_API_KEY`.
- Never put Buffer secrets in React or `VITE_` variables.
- Never call Buffer from the browser.
- Use Node scripts or GitHub Actions only.
- Default scheduling mode is dry-run.
- Live scheduling requires `--execute` locally or `SCHEDULE_TO_BUFFER` in GitHub Actions.

## Required Buffer Secrets

Add these as GitHub Actions repository secrets:

```text
BUFFER_API_KEY
BUFFER_ORGANIZATION_ID
BUFFER_CHANNEL_LINKEDIN
BUFFER_CHANNEL_INSTAGRAM
BUFFER_CHANNEL_FACEBOOK
```

Local-only optional env values:

```text
BUFFER_TIMEZONE=America/New_York
BUFFER_SCHEDULE_MODE=draft
```

## Mobile Setup With GitHub Secrets

Charlie can add secrets from mobile by asking Codex to run:

```bash
gh secret set BUFFER_API_KEY --repo thekidd2227/ARCGSystems
```

Paste the secret only into the interactive prompt. Do not put it in `.env`, chat logs, commits, or workflow YAML.

## Run `list_orgs` From Mobile

1. Open GitHub mobile or browser.
2. Go to `thekidd2227/ARCGSystems`.
3. Open Actions.
4. Select `Buffer Content Pipeline`.
5. Tap `Run workflow`.
6. Set mode to `list_orgs`.
7. Run.
8. Copy the organization id from the workflow log.
9. Add it as `BUFFER_ORGANIZATION_ID`.

## Run `list_channels` From Mobile

After `BUFFER_ORGANIZATION_ID` is set:

1. Open Actions.
2. Select `Buffer Content Pipeline`.
3. Run workflow with mode `list_channels`.
4. Copy the channel ids.
5. Add:
   - `BUFFER_CHANNEL_LINKEDIN`
   - `BUFFER_CHANNEL_INSTAGRAM`
   - `BUFFER_CHANNEL_FACEBOOK`

## Generate Next Month

Local:

```bash
npm run content:generate:next
```

Specific month:

```bash
npm run content:generate:month -- --month 2026-07
```

Dry-run:

```bash
node scripts/generate-monthly-content-calendar.mjs --month 2026-07 --dry-run
```

Custom product mix:

```bash
node scripts/generate-monthly-content-calendar.mjs --month 2026-07 --product-mix arcg=35,sourcedeck=30,chartnav=25,rezy=10
```

## Rotation Strategy

Monthly calendar:

- 30 days
- 3 platforms per day
- 90 records total
- one record per platform per day

Product mix:

- ARCG Systems: 35%
- SourceDeck: 30%
- ChartNav: 25%
- Rezy: 10%

Platforms:

- linkedin
- instagram
- facebook

## Product Guardrails

ARCG Systems:

- operational intelligence
- diagnose operational leaks
- blueprint before build
- do not automate broken logic
- Operational Waste Diagnostic
- `arcgsystems.com/diagnostics`

SourceDeck:

- `sourcedeck.app`
- command center for GovCon and small businesses
- source of truth for bids, vendors, documents, follow-up, pipeline, reporting, and next actions
- not generic project management

ChartNav:

- ophthalmology workflow/documentation platform
- document the exam, stay with the patient
- technician-to-physician handoff
- intake, charting, imaging, orders, signoff, export readiness
- billing-aware, not a billing engine
- no autonomous diagnosis claims
- no guaranteed billing claims
- no HIPAA certification or FDA status claims

Rezy:

- coming soon only
- property management command layer
- maintenance, tenants, vendors, tasks, documents, reporting
- waitlist / early access only
- do not claim launched unless repo copy says launched

## Validate And Export

```bash
npm run content:validate
npm run content:export
npm run content:build
```

Exports:

```text
exports/master-calendar.csv
exports/buffer-calendar.csv
exports/metricool-calendar.csv
```

## Dry-Run Scheduling

Local:

```bash
npm run buffer:dry-run
```

With filters:

```bash
node scripts/buffer-schedule-calendar.mjs --dry-run --limit 3
node scripts/buffer-schedule-calendar.mjs --dry-run --month 2026-07
node scripts/buffer-schedule-calendar.mjs --dry-run --platform linkedin
node scripts/buffer-schedule-calendar.mjs --dry-run --product sourcedeck
```

GitHub Actions:

- mode: `dry_run`
- optional filters: month, platform, product, limit

## Live Scheduling

Local:

```bash
node scripts/buffer-schedule-calendar.mjs --execute
```

GitHub Actions:

- mode: `schedule`
- `execute_confirm`: `SCHEDULE_TO_BUFFER`

Without that exact confirmation, the workflow fails safely.

## Queue Checking

Local log check:

```bash
npm run buffer:queue
```

This checks `logs/buffer-schedule-log.jsonl`. It does not fake live Buffer queue data. Live queue checks require confirming Buffer's posts query schema.

## If Instagram Scheduling Fails

1. Confirm the Instagram channel id is correct.
2. Confirm the Buffer channel is connected and not paused.
3. Try text-only first.
4. If media fails, remove `assetUrl` and schedule text-only.
5. Reconnect the Instagram channel in Buffer if authorization expired.

## Rotate The API Key If Exposed

1. Revoke or rotate the key in Buffer.
2. Update GitHub secret `BUFFER_API_KEY`.
3. Confirm workflows still run.
4. Search the repo and logs for accidental exposure.
5. Do not paste the replacement key into files or chat logs.

## Why No Browser Buffer Calls

The admin UI is a review surface. Browser calls would expose credentials and create accidental posting risk. All Buffer API calls are Node scripts or GitHub Actions only.

## Buffer Schedule Mode

`BUFFER_SCHEDULE_MODE=schedule` (default). Buffer's public GraphQL schema
does not expose a reliable `saveToDraft` toggle, so the pipeline does not
pretend to create drafts. Live schedule mode actually schedules posts at
the recommended time. For review-only output, use `npm run buffer:dry-run`
or `npm run buffer:dry-run:media`.

## Product-Aware LinkedIn Marketing Agent

The LinkedIn lane of the content calendar is product-aware. Every LinkedIn
post is grounded in `docs/product-marketing-evidence-inventory.md` via
`scripts/product-marketing-strategy.mjs` — a single source of truth that
defines, per product (ARCG / SourceDeck / ChartNav / Rezy):

- positioning
- buyer profiles
- pain points
- confirmed features (each row tied to repo / i18n evidence)
- benefits
- use cases
- proof-safe talking points
- CTA rules per lane
- blocked claims
- LinkedIn post formats
- hashtag schema (brand + theme + audience pools, blocked tags, required
  category coverage)

### Lane Mix

- 75% `feature_benefit` — product/service features, benefits, use cases,
  workflows, buyer value, product education
- 25% `diagnostic_pov` — operator essays, contrarian POVs, mini case
  studies, polls, founder notes, comment-led questions

The audit warns outside [65%, 85%] feature_benefit and fails below 50%.

### Formats

Ten formats per lane (20 total) — the generator picks deterministically
per (product, position):

- feature_benefit: product_feature_spotlight, benefit_breakdown,
  workflow_walkthrough, use_case_post, feature_to_outcome,
  product_education, buyer_problem_solution,
  product_comparison_without_named_competitors, release_or_build_update,
  document_pdf_prompt
- diagnostic_pov: text_diagnostic, leak_breakdown, contrarian_pov,
  mini_case_study, before_after, checklist, founder_note, poll_prompt,
  website_traffic_cta, comment_led_question

`document_pdf_prompt` maps to `format: "document"`. All other LinkedIn
formats map to `format: "text"`. Non-media LinkedIn posts (text only,
document prompt, poll prompt) are first-class — `assetType: "none"` is a
valid, non-skipped state for LinkedIn.

### Hashtag Schema

Per LinkedIn post: 10–12 product-specific hashtags. The composer always
includes the four brand tags, fills required category buckets (e.g.
ChartNav needs ≥2 ophthalmology/retina + ≥2 EMR/EHR/documentation;
SourceDeck needs ≥2 GovCon; Rezy needs ≥2 property + ≥2 coming-soon;
ARCG needs ≥2 operations/diagnostic), and rotates theme + audience tags
deterministically so duplicates don't pile up across the month.

Each product has a `blockedTags` list — generic spam tags (`#AI`,
`#Automation`, `#Business`, `#Success`, etc.) plus product-specific
no-fly tags (`#FDA`, `#HIPAA`, `#SOC2` for ChartNav; named-competitor
tags for SourceDeck; named property-management vendors for Rezy).

### Validation + Audit

- `npm run content:validate` — enforces hashtag count, blocked tags,
  required categories, lane ratio (warn outside 65–85%, fail below 50%
  feature_benefit). Posts that carry a `bufferPostId` are treated as
  preserved live content — bound errors downgrade to warnings so we
  don't fail validation on copy we deliberately won't overwrite.
- `npm run content:audit:linkedin` — prints a JSON report of lane mix
  per product, format distribution, and per-post hashtag issues. Exits
  non-zero on errors.

### Preserve-Scheduled Default

`scripts/generate-monthly-content-calendar.mjs` defaults to
`--preserve-scheduled`: posts with a `bufferPostId` keep their
hook/caption/hashtags/imagePrompt/videoPrompt/cta/notes/theme/format/
audience/sourceAngle/assetUrl/mediaStatus state from the prior calendar.
This guarantees the repo always reflects what Buffer actually has. Use
`--no-preserve-scheduled` only for a true clean regen.

### Evidence Inventory Discipline

Every claim in `scripts/product-marketing-strategy.mjs` must trace to a
row in `docs/product-marketing-evidence-inventory.md`. New product
evidence (e.g. once a sibling repo is inspected) goes into the inventory
first, then into the strategy module — never the other way around.

## OpenAI Media Pipeline

See `docs/content-command-center-media.md` for the full media pipeline:

- OpenAI image generation (`OPENAI_IMAGE_MODEL=gpt-image-2` by default)
- Hook-specific prompt builder + validator (zero-random-image rule)
- Cloudinary / Vercel Blob storage adapters
- GitHub Actions media generation persists as workflow artifacts only; it
  does not auto-commit generated assets or calendar mutations
- Mobile GitHub Actions sequence: `media_plan` → `generate_media_dry_run`
  → `generate_media` (requires `execute_confirm=GENERATE_MEDIA`) →
  `validate_assets` → `dry_run_with_media` → `schedule_with_media`
  (requires `execute_confirm=SCHEDULE_TO_BUFFER`)
- Carousel posts default to "skip" unless `--allow-carousel-single-image`
  is passed

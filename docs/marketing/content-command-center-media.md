# Content Command Center — OpenAI media generation

Supplements `docs/content-command-center.md`. Covers the hook-specific
OpenAI media pipeline added to the Buffer pipeline branch.

## Provider

- Primary image provider: **OpenAI image generation**.
- Default model env: `OPENAI_IMAGE_MODEL=gpt-image-2`.
- Defaults: `OPENAI_IMAGE_QUALITY=high`, `OPENAI_IMAGE_FORMAT=png`.
- `OPENAI_IMAGE_FORMAT` maps to the `output_format` request field (not `response_format`, which is unsupported by GPT image models and causes HTTP 400).
- GPT image models return `b64_json` by default; `response_format` is never sent.
- Server-side only. **Never** imported by the React app.

> **Note** the model name is set via the `OPENAI_IMAGE_MODEL` env var so we
> can roll forward without code changes. Treat that env var as the source
> of truth — do not hard-code marketing names in code or docs.

## Zero random image rule

Every image must tie to:

- the exact hook (or a 4-word phrase derived from the hook)
- the product visual system (ARCG / SourceDeck / ChartNav / Rezy)
- the audience
- the platform (LinkedIn / Instagram / Facebook)
- the CTA / campaign intent
- a visual metaphor that names the broken workflow
- a plain-English reason the visual belongs to that exact post

A prompt that misses any of those fails the validator. Generation is
blocked when `MEDIA_REQUIRE_HOOK_SPECIFIC=true` (default) and the
relevance score falls below `MEDIA_MIN_RELEVANCE_SCORE` (default 85).

## Buffer-ready storage required

Buffer needs a stable public URL. Local files (`file://…`) are **not**
Buffer-ready. The pipeline only marks `mediaStatus="ready"` when the
asset is uploaded to one of:

- **Cloudinary** — set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET` and `ASSET_STORAGE_PROVIDER=cloudinary`.
- **Vercel Blob** — set `BLOB_READ_WRITE_TOKEN` and
  `ASSET_STORAGE_PROVIDER=vercel_blob`.

If neither is configured (`ASSET_STORAGE_PROVIDER=local_dry_run`), assets
generate locally but stay at `mediaStatus="generated"`. They are never
attached to Buffer posts.

`file://` paths and local dry-run assets are stripped before Buffer input
is built. A post only becomes Buffer-ready when `mediaStatus="ready"` and
the asset URL is a stable public Cloudinary or Vercel Blob URL.

## What persists in GitHub Actions

GitHub Actions runs are disposable. The `generate_media` workflow updates
`src/content/arcg/calendar.json` inside the runner and may write files
under `.generated-media/`, but those changes are **not committed back to
the repo**.

Instead, the workflow uploads artifacts:

- `media-plan-*` for `exports/media-plan.json` and `exports/media-plan.csv`
- `media-dry-run-*` for dry-run planning output when present
- `generated-media-*` for the generated media folder and updated calendar snapshot
- `asset-validation-snapshot-*` for the calendar/media validation snapshot

To persist media URLs in the repository, run the media generation locally,
review `calendar.json`, then commit intentionally. The workflow does not
auto-commit generated assets or calendar mutations.

## Mobile GitHub Actions sequence (Charlie's path)

Run via the `Buffer Content Pipeline` workflow_dispatch:

1. `generate_only` — author/regenerate the calendar.
2. `media_plan` — build prompts, validate, upload `exports/media-plan.{json,csv}` as an artifact.
3. `generate_media_dry_run` — preview the prompts that would go to OpenAI.
4. `generate_media` with `execute_confirm=GENERATE_MEDIA` — live OpenAI
   generation + upload.
5. `validate_assets` — re-validate calendar after generation.
6. `dry_run_with_media` — preview the Buffer scheduling, asset attached.
7. `schedule_with_media` with `execute_confirm=SCHEDULE_TO_BUFFER` — live
   schedule.

## Buffer org / channel setup

Run once when wiring a fresh Buffer account:

1. `list_orgs` → add `BUFFER_ORGANIZATION_ID` to repo secrets.
2. `list_channels` → add `BUFFER_CHANNEL_LINKEDIN`,
   `BUFFER_CHANNEL_INSTAGRAM`, `BUFFER_CHANNEL_FACEBOOK`.

## Schedule mode is "schedule", not "draft"

Buffer's public GraphQL schema does not expose a reliable `saveToDraft`
toggle. `BUFFER_SCHEDULE_MODE=schedule` (the default) reflects what the
pipeline actually does: **live schedule mode schedules posts at the
recommended time, it does not save drafts**. For review-only, use the
dry-run scripts.

## Non-media LinkedIn posts are first-class

LinkedIn posts in the calendar can ship without any media — `assetType:
"none"` is a valid, non-skipped state for LinkedIn. The
product-aware marketing agent uses three non-media formats by design:

- text formats (text_diagnostic, founder_note, contrarian_pov,
  before_after, checklist, leak_breakdown, mini_case_study, etc.)
- `document_pdf_prompt` (LinkedIn document post)
- `poll_prompt` (text post that invites poll-style comments)

`buffer:dry-run:media` and `buffer:schedule:media` accept
`--media-optional` (the default) so non-media posts ship as text.
`--require-media` is for the visual lanes (Instagram, Facebook image/
reel/carousel); do not use it when LinkedIn text posts are in scope.

## Carousel posts

Multi-image Instagram carousels are not fully proven through Buffer's
public GraphQL surface yet. Default behavior:

- `dry_run` prints `bufferReadyMedia: false` for carousels and notes the
  unverified state.
- `execute` skips carousel posts.
- Pass `--allow-carousel-single-image` to attach only the first slide
  as a fallback.

## Product visual rules (enforced by validator)

- **ARCG** — dark navy/charcoal/gold. Operational leak maps, blueprints,
  dashboards, vendor dispatch, reporting visibility. **No** robots,
  handshakes, conference rooms, generic office scenes.
- **SourceDeck** — control-tower aesthetic. Command center, pipeline,
  bid/document/task dashboards, source-of-truth screens. **No** generic
  project-management positioning.
- **ChartNav** — clean clinical, navy + gold. Intake, imaging, exam,
  orders, signoff, export readiness, technician-to-physician handoff.
  **No** patient-identifiable imagery, autonomous diagnosis, fake
  certifications, guaranteed-billing claims.
- **Rezy** — operations layer mockups framed as "coming soon / early
  access / waitlist". **No** launched-product claims.

## Security warning

Never paste API keys (OPENAI, BUFFER, CLOUDINARY, BLOB) into:

- source code
- PR descriptions
- issue comments
- workflow logs
- docs

If a key is exposed, rotate it in the provider's dashboard, update the
repo secret, and search the repo + logs to confirm no residue.

# GovCon Content System

ARCG Systems GovCon content strategy — the master playbook for how the content banks, calendars, validation, and Buffer pipeline work together. This document is paired with `docs/marketing/content-command-center.md` (the runbook) and the JSON source-of-truth assets under `content/banks/` and `content/`.

---

## Content Strategy Objective

Generate compliant, on-brand, procurement-aware content that:

1. Builds recognition with the four GovCon avatars (Federal CO, State/Local Procurement Lead, Prime PM, Facilities Director).
2. Reinforces ARCG's positioning as a documented, certified, responsive under-$250K SDVOSB.
3. Produces inbound conversations — capability statement downloads, capabilities calls, vendor pool adds, teaming discussions, quote requests.
4. Never overclaims. No fake clients, no guaranteed-result language, no uncertified compliance claims.
5. Stays dry-run by default. Nothing reaches a Buffer queue until a human reviews and confirms.

---

## Weekly Content Rhythm

Per week (5 posting days, M–F):

- **2 LinkedIn posts** — procurement-aware, documentation-first, target Federal CO + Prime PM
- **2 Facebook posts** — community-facing facility / pest / emergency / translation, target State/Local PL + Facilities Director
- **1 Instagram post** — visual proof posture (uniformed crew, vehicles, equipment, safety gear), target Facilities Director + State/Local PL
- 1 mid-week content review checkpoint (manual)
- 1 end-of-week dry-run Buffer export

## Monthly Content Rhythm

Per month:

- **30-day posting schedule** (`content/govcon-30-day-posting-schedule.json`) — fully drafted posts with pillar / hook / CTA references
- **90-day calendar** (`content/govcon-90-day-calendar.json`) — strategic-level theming, avatar rotation, lane rotation, buyer-stage rotation
- 1 capability statement refresh
- 1 LinkedIn About refresh
- 1 review of cert expiration dates and reps & certs in SAM.gov
- 1 content audit against blocked-claims list

---

## Platform Strategy

### LinkedIn

- **Primary audience:** Federal CO, Prime PM, State/Local PL
- **Tone:** procurement-aware, direct, documentation-first
- **Post types:** capability spotlights, SDVOSB / set-aside education, micro-purchase readiness, teaming-discussion prompts, vendor documentation primers
- **Hashtag policy:** 6–10 per post, GovCon-relevant only (`#SDVOSB`, `#GovCon`, `#FederalContracting`, `#SmallBusiness`, `#FacilitiesManagement`, `#PestControl`, etc.). No generic spam tags (`#Business`, `#Success`).
- **Cadence:** 8–10 posts per month

### Facebook

- **Primary audience:** State/Local PL, Facilities Director, community / local agency followers
- **Tone:** operational, community-aware, trust-building
- **Post types:** service-lane spotlights, behind-the-scenes posture (crew, vehicles, equipment), community / agency relevance, seasonal facility readiness
- **Hashtag policy:** 3–5 per post
- **Cadence:** 8–10 posts per month

### Instagram

- **Primary audience:** Facilities Director, State/Local PL, broader recognition
- **Tone:** visual, calm, professional, proof-of-readiness
- **Post types:** photos of uniformed crew, vehicles, equipment, safety gear, lane-specific imagery, capability statement excerpt graphics
- **Hashtag policy:** 8–15 per post
- **Cadence:** 4–6 posts per month
- **Constraint:** no client names, no client locations without consent

---

## Buyer-Stage Map

| Stage | Goal | Sample Pillars | Sample CTAs |
|---|---|---|---|
| **Awareness** | Get noticed by the right buyers. Establish ARCG exists, is certified, is multi-lane. | certified small business advantage, veteran-owned operational discipline, fast compliant response | "Follow ARCG", "Visit arivergroup.com" |
| **Trust** | Convince the buyer ARCG is documented, responsive, real. | facility readiness, vendor documentation and compliance, simplified acquisition support | "Download capability statement", "View certifications" |
| **Action** | Convert into a call, quote, or vendor pool add. | micro-purchase readiness, prime subcontracting support, emergency response / rapid mobilization | "Request a capabilities call", "Request a quote", "Open a teaming discussion" |
| **Follow-up** | Stay top of mind between procurement cycles. | facility readiness, pest control and safety, simplified acquisition support | "Add ARCG to your vendor pool", "Schedule a seasonal walkthrough" |

---

## Pillar-to-Avatar Mapping

| Pillar | Federal CO | State/Local PL | Prime PM | Facilities Director |
|---|---|---|---|---|
| fast compliant response | ✓ | ✓ | ✓ | ✓ |
| certified small business advantage | ✓ | ✓ | ✓ |  |
| facility readiness |  | ✓ |  | ✓ |
| pest control and safety |  | ✓ |  | ✓ |
| prime subcontracting support |  |  | ✓ |  |
| micro-purchase readiness | ✓ |  |  |  |
| simplified acquisition support | ✓ | ✓ | ✓ |  |
| emergency response / rapid mobilization |  | ✓ |  | ✓ |
| vendor documentation and compliance | ✓ | ✓ | ✓ |  |
| veteran-owned operational discipline | ✓ | ✓ | ✓ | ✓ |

---

## CTA Rules

- Every post maps to one CTA from `content/banks/cta-bank.json`.
- CTAs must match the buyer stage. Awareness posts don't push a quote request; action-stage posts don't bury the ask.
- Destinations must be safe and current — only `https://www.arivergroup.com` and approved anchors.
- No CTA may reference a contract, award, or client by name unless documented and consented.
- LinkedIn CTAs lean toward "capabilities call" and "download capability statement"; Facebook/Instagram CTAs lean toward "request a quote" or "visit our site."

## Claim Safety Rules

- No "guaranteed" anything (award, savings, ROI, response, results).
- No "award-winning" without a named, documented award.
- No "trusted by federal agencies" or "current federal client" without documented written consent.
- No HIPAA / SOC 2 / FDA / clearance claims unless verifiably true.
- No bonded-amount claims unless verified.
- No state license claims unless verified for that state and lane.
- "SDVOSB" must always be paired with "certified through SBA VetCert" when in procurement context.
- "MBE / SBE / DBE" must cite the issuing jurisdiction when in procurement context.
- All scans are gated by:

  ```bash
  grep -RIn "guaranteed award\|guaranteed savings\|guaranteed ROI\|we guarantee\|award-winning\|trusted by agencies\|current federal client\|proven federal results\|HIPAA certified\|SOC 2 certified\|FDA approved" docs/strategy docs/marketing content
  ```

---

## How the Content Banks Feed the Calendar

```
content/banks/content-pillars.json   ─┐
content/banks/hook-bank.json         ─┼─►  content/govcon-30-day-posting-schedule.json
content/banks/cta-bank.json          ─┘    content/govcon-90-day-calendar.json
                                          │
                                          ▼
                                   manual review checklist
                                          │
                                          ▼
                            scripts/buffer-schedule-calendar.mjs --dry-run
                                          │
                                          ▼
                                  exports/buffer-calendar.csv
                                          │
                                          ▼
                              (manual human confirmation)
                                          │
                                          ▼
                                   Buffer (manual schedule)
```

- Pillars define the strategic themes (10 pillars).
- Hooks (60+) reference a pillar, an avatar, a platform, a buyer stage, and a tone.
- CTAs (30+) reference best-fit avatars, buyer stage, and platform.
- The 30-day posting schedule pulls one hook + one CTA per post; every post is mapped to a pillar and service lane.
- The 90-day calendar is strategic — theme, week, lane, platform focus, avatar, content type, objective, CTA — not yet drafted post copy.

## How Dry-Run Buffer Export Should Be Used

1. Generate or update the 30-day schedule.
2. Run `npm run content:validate` to enforce hashtag, blocked-tag, and lane-ratio rules.
3. Run `npm run content:export` to produce `exports/buffer-calendar.csv`.
4. Run `npm run buffer:dry-run` to simulate scheduling. No Buffer API call goes live.
5. Open the resulting `logs/buffer-schedule-log.jsonl` and the CSV for human review.
6. Only after a human signs off may anyone run live scheduling — and that requires `--execute` locally or `execute_confirm=SCHEDULE_TO_BUFFER` in GitHub Actions, both of which are out of scope for the routine content cycle.

## Manual Review Checklist (Before Anything Gets Scheduled)

- [ ] Every post in the 30-day schedule maps to a pillar in `content-pillars.json`
- [ ] Every post references a real `hook_id` in `hook-bank.json`
- [ ] Every post references a real `cta_id` in `cta-bank.json`
- [ ] Platform field is one of: `linkedin`, `facebook`, `instagram`
- [ ] Avatar field is one of: `federal_co`, `state_local_pl`, `prime_pm`, `facilities_director`
- [ ] Service lane field is one of the five lanes
- [ ] No post contains any item from the blocked-claims list (grep run, output clean)
- [ ] No post names a client, agency, or contract without documented consent
- [ ] CTAs point only to approved arivergroup.com destinations
- [ ] LinkedIn posts include 6–10 GovCon-relevant hashtags; Facebook 3–5; Instagram 8–15
- [ ] At least 15 of 30 posts are LinkedIn
- [ ] All 5 service lanes appear at least once in the 30-day schedule
- [ ] All 4 avatars appear at least once in the 30-day schedule
- [ ] `review_status` set to `approved` before any export/schedule step
- [ ] Buffer remains dry-run / manual-only unless explicitly confirmed

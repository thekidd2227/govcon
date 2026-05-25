# GovCon / COR Outreach Analysis Prompt — Upgrade

**Date:** 2026-04-08
**Scope:** GovCon / Contracting Officer's Representative (COR) outreach intelligence prompt. New function added to the LCC mobile and desktop surfaces. No changes to Make scenarios, Instantly routing, or unrelated UI.

## What changed

Prior to this upgrade, the LCC surfaces had no dedicated COR / federal contracting officer outreach analysis prompt. GovCon outreach relied on the generic Reply Analyzer and the marketing content prompts (e.g., `GovCon Backend Failure` ad copy), neither of which produced relationship intelligence suitable for procurement-safe federal outreach.

A new function `corOutreachAnalysis(officerName, agency, programOrOffice, notes)` was added to every active LCC HTML surface. It calls OpenAI (or Claude as fallback) with a structured prompt that produces a publicly-sourced, procurement-safe outreach brief.

The function is exposed on `window.corOutreachAnalysis` so it can be invoked from the browser console, wired to a future button, or called programmatically. It is designed to populate DOM elements with ids `cor-btn`, `cor-status`, and `cor-out` if they exist — but all DOM lookups are optional, so the function works whether or not a matching UI pane is present on the page.

## Where it was added

| File | Location | Purpose |
|---|---|---|
| `public/ARCG_LCC_Mobile.html` | before the `DOMContentLoaded` init block | Active mobile LCC |
| `dist/ARCG_LCC_Mobile.html` | before the `DOMContentLoaded` init block | Built mobile mirror |
| `public/ARCG_Lead_Command_Center_v4_FINAL.html` | before the `// ─── INIT ───` block | Active desktop LCC |
| `dist/ARCG_Lead_Command_Center_v4_FINAL.html` | before the `// ─── INIT ───` block | Built desktop mirror |

## Required intelligence sections

The prompt instructs the model to return exactly these labeled sections, in this order:

1. **`---LINKEDIN_PROFILE---`** — URL, summary, current positions, previous positions, education, certifications, skills, groups, recent public activity, publicly visible recommendations, connection/context clues
2. **`---SOCIAL_MEDIA---`** — Facebook, Twitter/X, other public professional platforms (YouTube, Medium, Substack, SlideShare, public speaking pages)
3. **`---TOP_3_ICEBREAKERS---`** — each with specific detail, why it works, how to use it
4. **`---ADDITIONAL_ICEBREAKERS---`** — mutual context, shared interests, shared agencies/programs/events/associations
5. **`---CONTACT_METHOD_RANK---`** — three methods ranked with rationale
6. **`---PERSONALIZED_EMAIL_DRAFT---`** — subject + 3-4 paragraph body, ready to send
7. **`---LINKEDIN_CONNECTION_REQUEST---`** — max 300 characters, personalized, ready to send
8. **`---PHONE_CALL_OPENING_SCRIPT---`** — 30 seconds, ready to speak
9. **`---INTELLIGENCE_GATHERING---`** — likely priorities, communication style, decision-making style/process
10. **`---RELATIONSHIP_NURTURING_PLAN---`** — Month 1 / 2 / 3 with week-by-week actions, plus ongoing monthly rhythm
11. **`---COMPETITIVE_INTELLIGENCE---`** — other vendors engaging them, incumbent dynamics, ARCG differentiation
12. **`---RED_FLAGS_AND_ETHICAL_BOUNDARIES---`** — blackout periods, conflicts, agency-specific rules
13. **`---SUCCESS_METRICS_AND_STAGE---`** — current stage, metrics to track, next milestone
14. **`---SOURCE_URLS---`** — every public source used, required for every factual claim

## Ethical and procurement-safety rules enforced by the prompt

The prompt opens with a **HARD STOP** ethical block that the model must obey:

- No private or non-public personal data (home address, family, personal phone, non-work accounts)
- No harassment tactics, deceptive pretexts, or manufactured urgency
- No invented affiliations, fake mutual contacts, fabricated personal details, or guessed quotes
- No guessed emails, invented LinkedIn URLs, handles, certifications, or activity
- If a claim cannot be publicly verified with a source URL, the model must write `"not publicly verified"` and move on
- Every section must be professional and procurement-safe — the prompt explicitly instructs the model to assume a federal ethics officer will review the brief before use

## Calling the function

```js
// From browser console or wired UI button:
await window.corOutreachAnalysis(
  'Jane Doe',               // officer name
  'GSA',                    // agency
  'FAS PMO',                // program or office (optional)
  'Met briefly at ACT-IAC'  // additional context (optional)
);
```

The function returns the model's full labeled response as a plain string, or `null` on error or missing API key.

## Anti-fabrication guarantees

The prompt strengthens ARCG's existing anti-fabrication discipline:

- No guessed emails ✅
- No invented contacts ✅
- No made-up LinkedIn profiles ✅
- No made-up social accounts ✅
- No fabricated certifications, quotes, or activity ✅
- Every factual claim requires a public source URL in the `---SOURCE_URLS---` block ✅
- Any unverifiable claim must be labeled `"not publicly verified"` rather than invented ✅
- No competing rules introduced — existing validation, routing, and sending logic untouched ✅

## What was NOT changed

- Existing Reply Analyzer prompt (kept intact)
- Existing ad content / visual prompt logic (kept intact)
- Make scenarios
- Instantly campaign / sender config
- Airtable schema
- Commercial lead generation prompt (covered in `commercial_lead_prompt_upgrade.md`)
- Validation, routing, or sending logic

# GovCon / COR Prompt — Active Runtime Verification

**Date:** 2026-04-08

## Scope

Verify that the GovCon / COR outreach intelligence function (`corOutreachAnalysis`) is present and callable in every active LCC runtime file, covering both the desktop and mobile LCC, and all three deployment surfaces (`public/`, `dist/`, `ios/App/App/public/`).

## Required markers per file

| Marker | What it proves |
|---|---|
| `corOutreachAnalysis` (3 hits expected) | Function header, `window.corOutreachAnalysis = corOutreachAnalysis` export, and comment reference are all present |
| `---LINKEDIN_PROFILE---` | LinkedIn profile section is in the prompt |
| `---SOCIAL_MEDIA---` | Social media research section |
| `---TOP_3_ICEBREAKERS---` | Top-3 icebreakers section |
| `---ADDITIONAL_ICEBREAKERS---` | Additional icebreakers section |
| `---CONTACT_METHOD_RANK---` | Ranked initial contact methods |
| `---PERSONALIZED_EMAIL_DRAFT---` | Personalized email draft section |
| `---LINKEDIN_CONNECTION_REQUEST---` | LinkedIn connection request (≤300 chars) |
| `---PHONE_CALL_OPENING_SCRIPT---` | 30-second phone opening script |
| `---INTELLIGENCE_GATHERING---` | Intelligence gathering section |
| `---RELATIONSHIP_NURTURING_PLAN---` | 3-month nurturing plan with weekly breakdown |
| `---COMPETITIVE_INTELLIGENCE---` | Competitive intelligence section |
| `---RED_FLAGS_AND_ETHICAL_BOUNDARIES---` | Red flags and ethical boundaries |
| `---SUCCESS_METRICS_AND_STAGE---` | Success metrics and relationship stage |
| `---SOURCE_URLS---` | Source URLs required for every factual claim |

## Audit (post-repair)

```
file                                                               COR  SOURCE_URLS
public/ARCG_LCC_Mobile.html                                          3     3
dist/ARCG_LCC_Mobile.html                                            3     3
ios/App/App/public/ARCG_LCC_Mobile.html                              3     3
public/ARCG_Lead_Command_Center_v4_FINAL.html                        3     1
dist/ARCG_Lead_Command_Center_v4_FINAL.html                          3     1
ios/App/App/public/ARCG_Lead_Command_Center_v4_FINAL.html            3     1
```

All six active runtime files contain 3 `corOutreachAnalysis` hits (function definition + window export + header comment).

The mobile files show 3 `source_urls`/`SOURCE_URLS` hits because they contain **both** the commercial prompt's `source_urls` schema field **and** the COR prompt's `---SOURCE_URLS---` section. The desktop files show 1 hit — the COR prompt's `---SOURCE_URLS---` section only, as expected (no commercial lead-gen prompt in desktop LCC).

## All 14 required sections verified in every active runtime file

For each of the six active runtime files, a grep for the 14 section headers returned 14 matches each — confirming the full COR prompt structure is deployed symmetrically across:

- `public/ARCG_LCC_Mobile.html`
- `dist/ARCG_LCC_Mobile.html`
- `ios/App/App/public/ARCG_LCC_Mobile.html`
- `public/ARCG_Lead_Command_Center_v4_FINAL.html`
- `dist/ARCG_Lead_Command_Center_v4_FINAL.html`
- `ios/App/App/public/ARCG_Lead_Command_Center_v4_FINAL.html`

## Ethical hard-stop block — present in all six

Every active runtime file carries the ethical hard-stop block:

- No private or non-public personal data
- No harassment tactics, deceptive pretexts, or manufactured urgency
- No invented affiliations, fake mutual contacts, fabricated personal details, or guessed quotes
- No guessed emails, invented LinkedIn URLs, handles, certifications, or activity
- Unverified claims must be labeled `"not publicly verified"` rather than invented
- Every section must be professional and procurement-safe — the model is told to assume a federal ethics officer will review the brief before use

## Callable entrypoint — live on every surface

The function is exposed globally:

```js
window.corOutreachAnalysis = corOutreachAnalysis;
```

on every active runtime file, so it can be invoked from the browser console or any later-wired UI control on the desktop LCC, mobile LCC, and the iOS app — whether the operator is on the web deployment or inside the native iOS build.

Invocation:

```js
await window.corOutreachAnalysis('Jane Doe', 'GSA', 'FAS PMO', 'Met at ACT-IAC');
```

## Verdict

GovCon / COR outreach intelligence prompt upgrade is **LIVE on every active runtime surface** — desktop LCC and mobile LCC, across `public/`, `dist/`, and `ios/App/App/public/`.

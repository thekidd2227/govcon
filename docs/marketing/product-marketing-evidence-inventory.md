# Product marketing evidence inventory

Source-of-truth check before the LinkedIn marketing agent writes
copy about any product. Every claim in `productMarketingStrategy.mjs`
or `productMarketingStrategy.ts` must trace back to a row in this
inventory — verified, inferred-from-code, or marked candidate.

Generated: 2026-05-23.

## Repos / paths inspected

| Path | State |
| --- | --- |
| `~/arcg-live` (this repo) | ✅ inspected |
| `~/Desktop/ARCG/chartnav-platform` | ❌ not present on this sandbox |
| `~/chartnav-platform` | ❌ not present |
| `~/Desktop/ARCG/sourcedeck` | ❌ not present |
| `~/Desktop/ARCG/sourcedeck-app` | ❌ not present |
| `~/sourcedeck` | ❌ not present |
| `~/sourcedeck-app` | ❌ not present |
| `~/Desktop/ARCG/rezy` | ❌ not present |
| `~/rezy` | ❌ not present |

For products without a local repo, ChartNav messaging is grounded in the
ARCG website's `src/pages/chartnav/*.tsx` pages and `src/i18n/en.json`;
SourceDeck messaging is grounded in operator-stated positioning and the
`/sourcedeck` redirect to sourcedeck.app; Rezy messaging is held to the
"coming soon / waitlist / early access" frame only.

---

## ARCG Systems — confirmed surface

Source: `src/i18n/en.json` (`capabilities.*`), `src/pages/Capabilities.tsx`,
`src/pages/Diagnostics.tsx`, `src/pages/FederalAccess.tsx`,
`src/pages/ComplianceReporting.tsx`, `src/pages/FacilitiesSupport.tsx`.

| Claim | Status | Source |
| --- | --- | --- |
| Operational Waste Diagnostic (named offering) | ✅ verified | `i18n.assessment.sub` + Diagnostics page |
| Six core diagnostic flows: intake, handoffs, reporting, accountability gaps, revenue leakage, scheduling | ✅ verified | `i18n.howItWorks.s1desc` + `i18n.diagnostics.f1desc` |
| AI Automation & Lead Systems — 24/7 intake/qualification | ✅ verified | `i18n.capabilities.cap1*` |
| Operational Intelligence & Reporting — automated reporting | ✅ verified | `i18n.capabilities.cap2*` |
| Facilities & Property Support — vendor dispatch / SLA tracking | ✅ verified | `i18n.capabilities.cap3*` + FacilitiesSupport page |
| Federal Compliance & GovCon Systems — SAM.gov + capability statements + subcontracting plans | ✅ verified | `i18n.capabilities.cap4*` + FederalAccess page |
| Data Management & Processing — structured intake + CRM integration | ✅ verified | `i18n.capabilities.cap5*` |
| Teaming & Subcontract Strategy — set-aside positioning | ✅ verified | `i18n.capabilities.cap6*` |
| Certifications: SDVOSB, HUBZone, MBE, DBE, SBE | ✅ verified | `i18n.capabilities.d2body` |
| Methodology: Diagnose → Prioritize → Design → Build → Test → Launch → Stabilize → Expand | ✅ verified | `i18n.howItWorks.h2` |
| Content Command Center as internal operating proof | ✅ verified | `docs/content-command-center.md`, `src/components/content/ContentCommandCenter.tsx` |

**Buyer profiles (from `whoWeHelp` in i18n):** small-business-owners, property-managers, service-companies, government-contractors, caribbean-latam-operators.

**ARCG blocked claims:** guaranteed ROI, fake case studies, fake clients/testimonials, "we automate everything overnight". (Source: existing `safety/claim_safety.py` + `scripts/media-utils.mjs` `ARCG_REQUIRED`.)

---

## ChartNav — confirmed surface

Source: `src/pages/chartnav/*.tsx` (Platform, WhyChartnav, Ophthalmology,
Implementation), `src/pages/chartnav/RedirectToChartnavMd.tsx` (canonical
home is chartnavmd.com).

| Claim | Status | Source |
| --- | --- | --- |
| Ophthalmology workflow positioning | ✅ verified | `Ophthalmology.tsx`, `Platform.tsx` `#ophthalmology` section |
| Module-based architecture | ✅ verified | `Platform.tsx` `#modules` section |
| Role-aware: technician + physician | ✅ verified | `Platform.tsx` `#roles` section |
| Flow: intake → exam → imaging → orders → signoff → export | ✅ verified | `Platform.tsx` `#flow` section + existing media-utils CHARTNAV_REQUIRED concept list |
| Continuity / handoff support | ✅ verified | `Platform.tsx` `#continuity` section |
| Implementation guidance | ✅ verified | `Implementation.tsx`, `Platform.tsx` `#implementation` section |
| Billing-aware workflow (not a billing engine) | ✅ verified | existing safety claim list in `quality.ts` |
| Retina-specific workflow support | 🟡 candidate (needs repo confirm) | site/positioning, no in-repo retina-feature module surfaced here |
| EMR/EHR integration specifics (which systems, which fields) | 🟡 candidate | mentioned at concept level only; do NOT name specific EMR vendors without confirmation |

**ChartNav blocked claims (load-bearing):**
- ❌ autonomous diagnosis
- ❌ AI diagnoses patients
- ❌ FDA approved / FDA cleared / FDA certified
- ❌ HIPAA compliant / HIPAA certified
- ❌ SOC 2 compliant
- ❌ guaranteed billing / guaranteed reimbursement
- ❌ replaces EMR / EHR
- ❌ replaces physician judgment
- ❌ patient-identifiable imagery in any prompt

---

## SourceDeck — operator-stated + needs sibling-repo confirmation

No SourceDeck source present in this sandbox. Routing:
`src/App.tsx` redirects `/sourcedeck` and `/sourcedeck/app` to
`https://sourcedeck.app/` and `https://sourcedeck.app/app/`.

**Operator-stated positioning** (safe to use, marked as candidate until
the SourceDeck repo is inspected):

| Claim | Status |
| --- | --- |
| SourceDeck is a GovCon / small-business command center | 🟡 operator-stated |
| Source-of-truth for bids, vendors, documents, follow-up, pipeline, reporting, next actions | 🟡 operator-stated |
| Not generic project management | 🟡 operator-stated + enforced in `quality.ts` |
| Opportunity / bid pipeline | 🟡 candidate |
| Document tracking | 🟡 candidate |
| Vendor tracking | 🟡 candidate |
| Compliance reminders | 🟡 candidate |
| Capture / proposal workflow | 🟡 candidate |

**SourceDeck blocked claims:** generic project management positioning,
"another Asana/Trello" framing, named-competitor comparisons.

---

## Rezy — coming soon only

No Rezy source present. Navbar carries a "Rezy" label as future product.
**All Rezy posts must use coming-soon / waitlist / early-access language
exclusively.** Enforced in `src/content/arcg/quality.ts`:

```
if (post.product === "rezy" && !/coming soon|early access|waitlist|preview|not launched|pre-launch/i.test(combined)) {
  push("caption", "error", "Rezy posts must stay coming soon, early access, waitlist, or similar");
}
```

**Rezy blocked claims:**
- ❌ Launched / Now Available
- ❌ Active customer claims
- ❌ Production availability
- ❌ Named integrations until confirmed
- ❌ Any specific feature claim without "coming soon" framing

---

## How this inventory is used

`scripts/product-marketing-strategy.mjs` is grounded in this inventory
at the conceptual level — every feature/benefit/claim/CTA in that module
traces back to a row here. New product evidence (e.g. once the
SourceDeck or Rezy repos are inspected) goes here first, THEN gets added
to the strategy module.

Update cadence: re-run the evidence sweep monthly or whenever a sibling
repo is added to the sandbox.

## Downstream consumers

- `scripts/product-marketing-strategy.mjs` — per-product positioning,
  pain points, confirmed features, benefits, use cases, blocked claims,
  LinkedIn post format library (20 formats), hashtag schema.
- `scripts/generate-monthly-content-calendar.mjs` — LinkedIn lane
  generator (75% feature_benefit / 25% diagnostic_pov).
- `scripts/audit-linkedin-strategy.mjs` — post-build LinkedIn audit
  (hashtag bounds, required categories, blocked tags, lane ratio).
- `src/content/arcg/quality.ts` — in-app validator that mirrors the
  LinkedIn hashtag rules so the website surface flags the same issues.

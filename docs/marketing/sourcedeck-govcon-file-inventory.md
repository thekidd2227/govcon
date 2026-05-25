# SourceDeck GovCon File Inventory

Status: analysis + copy-first migration pass.
Source repo: `thekidd2227/sourcedeck-app` on `main`.
Target repo: `thekidd2227/GOVCON` on `main`.

## Rule used

Copy only. Nothing should be deleted or moved from SourceDeck in this pass.

- Strategy, positioning, prompts, campaign docs, playbooks, capture scripts, demo narratives, and marketing/capture assets belong in GOVCON.
- SourceDeck product code, tests, services, schemas, and implementation files stay in SourceDeck.
- Mixed strategy/product docs can be copied into GOVCON as reference material.

## Classification table

| SourceDeck file | Classification | Action | GOVCON target | Reason |
|---|---:|---|---|---|
| `docs/architecture-web-first-roadmap.md` | COPY_TO_GOVCON_REFERENCE_ONLY | Copied | `docs/marketing/sourcedeck/reference/architecture-web-first-roadmap.md` | Contains GovCon SaaS roadmap, enterprise blockers, credential/security risks, and target architecture. Useful for positioning and execution planning, but still tied to SourceDeck product architecture. |
| `docs/workflow-engine-foundation.md` | COPY_TO_GOVCON_REFERENCE_ONLY | Copied | `docs/marketing/sourcedeck/reference/workflow-engine-foundation.md` | Describes platform-neutral workflow foundation and GovCon workflow template. Useful for campaign/product narrative. |
| `docs/release/privacy-first-run-verification.md` | COPY_TO_GOVCON_RECORDS | Copied | `records/sourcedeck/privacy-first-run-verification.md` | Release/audit evidence showing SourceDeck privacy repair and first-run safety. Useful as product trust/compliance record. |
| `release/notes/v1.0.0.md` | COPY_TO_GOVCON_RECORDS | Copied | `records/sourcedeck/release-notes/v1.0.0.md` | Withdrawn release record. Keep as evidence/history, not marketing copy. |
| `release/notes/v1.1.0.md` | COPY_TO_GOVCON_RECORDS | Copied | `records/sourcedeck/release-notes/v1.1.0.md` | Privacy repair release record. Useful as trust/compliance evidence. |
| `services/workflow/templates/govcon.js` | COPY_TO_GOVCON_REFERENCE_ONLY | Summarized only | `docs/marketing/sourcedeck/reference/sourcedeck-govcon-product-surface.md` | Product implementation template. Do not copy executable code into GOVCON; extract product narrative and guardrail facts only. |
| `services/govcon/sam-search.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | SourceDeck product implementation for SAM search. |
| `services/govcon/compliance-matrix.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | SourceDeck product implementation for compliance matrix. |
| `services/govcon/pre-rfp.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | SourceDeck product implementation for pre-RFP support. |
| `services/govcon/past-performance.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | SourceDeck product implementation for past-performance support. |
| `services/govcon/stakeholder-graph.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | SourceDeck product implementation for stakeholder mapping. |
| `services/govcon/targeting-profile.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | SourceDeck product implementation for targeting profile. |
| `services/sam/index.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product service wrapper. |
| `services/capture/index.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product service wrapper. |
| `services/proposal/index.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product service wrapper. |
| `services/compliance/index.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product service wrapper. |
| `services/stakeholders/index.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product service wrapper. |
| `test/govcon-core.test.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product test; not strategy/campaign content. |
| `test/workflow-engine.test.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product test; not strategy/campaign content. |
| `demo/fixtures.json` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | Product demo data excluded from packaged app; not copied unless explicitly needed as sanitized sample evidence. |
| `qa/capture-screens.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | QA screenshot capture script, not a GovCon marketing artifact by itself. |
| `qa/capture-bearer.js` | LEAVE_IN_SOURCEDECK_PRODUCT | Leave in SourceDeck | n/a | QA/security capture script, not strategy content. |

## Copy decision

Copy was the correct move. Moving SourceDeck GovCon files would break product code and test boundaries. GOVCON should own strategy, records, and reference narratives; SourceDeck should retain executable product implementation.

## Follow-up

Next useful pass: author a real SourceDeck GovCon campaign page in GOVCON using the copied reference docs, not implementation source code.

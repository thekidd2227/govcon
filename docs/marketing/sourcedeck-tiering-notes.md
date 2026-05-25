# SourceDeck Tiering — Premium Content Agent Placement

> **Status:** Pre-implementation guidance. SourceDeck does not currently ship a published tier table in this repo, so this document captures the intended placement of the Premium Content Agent across tiers when a pricing structure is wired.

## Tier placement

| Tier | Premium Content Agent access |
|---|---|
| Free | No access. No drafts, no analysis. |
| Basic / Starter | No access. |
| Pro (mid tier) | Optional limited templates only, if desired. No repository or document ingestion. No watsonx-powered analysis. |
| Highest paid tier | Full Premium Content Agent: document and repository ingestion, watsonx-powered analysis, LinkedIn and Facebook drafts, claim confidence labeling, approval workflow. |

## Rationale

The Premium Content Agent belongs at the highest tier because it consumes:

- SourceDeck's stored business context (services, pipeline, vendors, opportunities)
- Uploaded documents (PDFs, decks, capability statements, SOPs)
- Connected repositories (GitHub, GitLab, Bitbucket — planned)
- Public URLs the user supplies (product pages, landing pages, documentation)

…and uses watsonx-powered analysis to produce evidence-grounded LinkedIn and Facebook drafts that the user can review and approve. The cost basis (analysis tokens + ingestion + storage + audit) plus the workflow value (replaces a marketing function the user would otherwise outsource at significantly higher cost) justify a top-tier placement.

## What lower tiers should *not* include

- Repository ingestion (GitHub, GitLab, Bitbucket)
- Document upload for AI analysis
- watsonx-powered claim classification
- Multi-platform planning (LinkedIn + Facebook coordinated calendar)
- 75/25 content ratio enforcement across a planning window

If a user on a lower tier asks for the Premium Content Agent, the upgrade path should be visible in the UI, but the feature itself must be gated server-side, not just hidden client-side.

## Open questions for product

- Should the Pro tier include the intake questionnaire and content angle suggestions without document ingestion, as a teaser for upgrading?
- Should highest-tier users get a per-month draft cap (e.g., 60 drafts/month) or unlimited drafts?
- Should repository ingestion be available add-on for Pro at additional cost, or strictly top-tier only?

These are out of scope for this document. They are flagged so product can decide before launch.

## What this document does *not* claim

- A live pricing table does not exist in this repo today.
- No payments integration is asserted.
- No tier-enforcement code currently gates the agent — gating must be implemented when the agent itself is built.

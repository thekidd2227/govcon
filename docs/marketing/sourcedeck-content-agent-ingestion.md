# Repository and Document Ingestion for SourceDeck Premium Content Agent

> **Status:** Planned premium feature. Connector-based ingestion of GitHub, GitLab, Bitbucket, and document storage is **not** wired today. This document specifies what the ingestion layer should do when implemented.

## Purpose

Allow paying users on the highest tier to attach documents and provide links so the Premium Content Agent can understand the user's actual business before generating LinkedIn or Facebook content. The agent should ground every draft in evidence the user supplied, never in fabricated context.

## Supported input types

The ingestion layer must accept and parse the following:

- Uploaded PDFs
- Uploaded Word documents (.docx)
- Uploaded markdown documents
- Uploaded plain text files
- Uploaded CSV exports
- Pitch decks (PDF or exported slide deck)
- Capability statements
- Standard operating procedures (SOPs)
- Product documentation
- GitHub repository links
- GitLab repository links
- Bitbucket repository links
- Website URLs
- Public documentation URLs

Connectors for private/authenticated repositories are **planned** and require an authenticated connection step. The agent must not attempt to scrape private repositories without explicit user authorization through a supported connector.

## Planned repository analysis

For linked repositories, the agent should inspect (in order of value):

- README at repository root
- `docs/` folder content
- Changelog files (CHANGELOG.md, RELEASES.md)
- Package metadata (package.json, pyproject.toml, Cargo.toml, etc.)
- App routes and feature names (when inferable from file structure)
- Product copy in marketing pages within the repo (when present)
- API documentation
- Screenshot assets in `docs/` or `marketing/` directories
- Issue and roadmap exports if the user has connected them
- Release notes

The agent should never:

- Pull or surface code that contains secrets, tokens, credentials, or environment files
- Pull or surface private customer data found in fixtures or test files
- Pull or surface license violations
- Pull or surface third-party copyrighted content

## Content mapping

The agent should map evidence from the ingested material into the following content types:

- Feature posts (grounded in a specific feature shipped or documented)
- Benefit posts (grounded in a specific benefit a user or buyer cares about)
- Use case posts (grounded in a specific scenario the material describes)
- Release update posts (grounded in changelog or release-notes evidence)
- Authority posts (grounded in operational, technical, or domain expertise)
- Website CTA posts (grounded in a real, indexed landing page)
- Comparison-without-competitor posts (positioning without naming competitors)
- Educational posts (grounded in documentation or domain knowledge)

## watsonx role

When watsonx integration is implemented, watsonx should:

- Summarize uploaded evidence into a structured business profile
- Detect features and feature changes from changelogs and release notes
- Classify each extracted claim as `verified`, `inferred`, or `candidate`
- Suggest post angles tied to the user's stated goal (traffic, authority, leads, trust)
- Produce drafts in the tone and audience profile the user has set
- Flag any claim that looks unsupported by the supplied material
- Recommend hashtags and CTAs per the platform's hashtag schema
- Maintain tone and audience alignment across a multi-post plan

watsonx must be called server-side from a SourceDeck backend with rate limiting, audit logging, and per-user usage attribution. It must not be called directly from the client.

## Claim levels

Every extracted claim presented to the user must be labeled with a claim level so the user knows what they are approving:

- **verified** — directly supported by attached material (e.g., a feature listed in the README, a number reported in the user's own changelog)
- **inferred** — reasonable inference based on the code or documentation, but should be reviewed by the user before publishing (e.g., a benefit not stated outright but implied by the code structure)
- **candidate** — a marketing idea the agent is proposing for the user to consider; requires the user to confirm the claim is true before it goes into a draft

The agent must not silently promote `candidate` claims to `verified` without an explicit user action.

## Human approval

No post may be published without user approval. This rule is not configurable; there is no "post automatically" toggle in the highest tier. Approval is per-post, not bulk.

## Security

The ingestion and generation pipeline must enforce:

- Never publish secrets, tokens, API keys, or credentials, even if they appear in attached material
- Never publish raw private repository code; only summaries the user has approved
- Never publish confidential proposal details, bid amounts, or unannounced pricing
- Never publish customer credentials or private customer data
- Redact tokens and credential patterns at ingestion time
- Never include customer-identifying information unless the user explicitly opts in for that specific post and the information is safe to share
- Warn the user before drafting any GovCon content that touches CUI, ITAR, EAR, or other regulated categories — the agent must refuse to draft such content automatically

## Out of scope for this spec

- Private repository OAuth connector implementation
- watsonx API client implementation
- Document storage and retrieval architecture
- Per-user usage metering and billing
- Audit log schema

Each of the above is tracked separately and implemented in its own change.

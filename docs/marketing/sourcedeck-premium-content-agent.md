# SourceDeck Premium Content Agent

> **Status:** Product specification. Not yet implemented. No customer-facing product currently auto-posts to LinkedIn or Facebook on behalf of SourceDeck users. This document defines what the feature should be when built.

## One-line description

An AI-powered LinkedIn and Facebook content strategist that turns a company's services, pipeline, documents, repositories, GovCon activity, and operational wins into credibility-building content.

## Tier

**Highest paid tier only.** Not part of the free tier. Not part of any starter, basic, or pro tier.

## Core idea

SourceDeck should help users turn what their business is already doing — proposals, vendor work, project execution, GovCon pipeline activity, code commits, release notes, SOPs — into LinkedIn and Facebook content that builds trust, traffic, and sales conversations.

The agent does the strategy and drafting work. The human reviews, edits, and approves before anything is published.

## Why this matters

Small businesses and contractors often know they need visibility, but do not know what to post beyond photos, announcements, and generic AI captions. They have evidence of what they do well — but no system to translate that evidence into content that earns trust.

The Premium Content Agent closes that gap by analyzing the user's own business context (with explicit attachments and connected sources) and proposing content that is grounded in real work, not invented marketing claims.

## Supported platforms

- LinkedIn
- Facebook

Instagram is intentionally excluded from this feature. Instagram requires a media attachment for every post, so it is not a fit for the text-first, evidence-driven content the Premium Content Agent produces. Instagram remains supported elsewhere in SourceDeck only when the user supplies a media asset.

## Powered by watsonx

The Premium Content Agent is **planned** to use IBM watsonx for business-context analysis, content reasoning, summarization, and content generation. This document describes the intended role of watsonx; it does **not** claim that a live watsonx integration is wired today. Live integration will be added in a separate implementation effort and gated behind explicit feature flags.

## Context sources users can attach or connect

Users on the highest tier should be able to provide any of the following:

- GitHub repository links
- GitLab repository links
- Bitbucket repository links
- Public documentation links
- Product website links
- Landing page links
- Uploaded PDFs
- Uploaded Word documents
- Uploaded markdown files
- Uploaded plain text files
- Capability statements
- Pitch decks
- Service menus
- Standard operating procedures (SOPs)
- Proposal templates (de-identified)
- Project writeups
- Case study drafts
- Product screenshots
- Markdown documentation
- Source code repositories
- README files
- API documentation
- Changelogs
- Feature lists
- Issue or roadmap exports

All inputs are subject to the safety rules below. The agent does not publish raw uploaded material; it extracts evidence and uses it to inform draft content the user reviews.

## What the agent analyzes

When the user attaches material, the agent should extract:

- Product and service features
- Concrete benefits
- Buyer problems the business solves
- Target audience and ICP signals
- Proof-safe claims (claims supported by the supplied material)
- Feature updates and release activity
- Common use cases
- Industry-specific language
- Technical differentiators
- Compliance-sensitive topics (so they can be flagged, not amplified)
- Calls to action present in the material
- Blocked claims (claims that look unsupported or risky)
- Content opportunities the user has not yet exploited

## What the agent generates

The agent drafts content across the post types below. All drafts require human approval before publishing.

### LinkedIn

- Text-only authority posts
- Polls
- Document and PDF post outlines
- Feature and benefit posts
- Service explainer posts
- GovCon credibility posts
- Pipeline lesson posts
- Website CTA posts
- Founder and owner notes
- Operational lesson posts
- Build-in-public updates
- Comment-led question posts

### Facebook

- Service education posts
- Community and local trust posts
- Owner update posts
- Project update posts
- Customer problem and solution posts
- Business tip posts
- Website CTA posts
- Soft offer posts

## 75/25 content strategy

The agent biases toward content that builds product credibility and trust, balanced by a smaller share of perspective-driven content that demonstrates operational thinking.

- **75% feature and benefit content:** product value, service education, pipeline visibility, website traffic, GovCon authority, business credibility, customer problem and solution, use cases.
- **25% diagnostic and POV content:** operational leak, bottleneck, contrarian business insight, lessons learned, build-in-public reflection.

The ratio is enforced at the planning layer (the agent's monthly suggestion mix), not on every individual post.

## Approval model

- The agent suggests and drafts content.
- The user reviews, edits, and approves.
- The agent does not auto-post.
- No content is sent to Buffer, LinkedIn, or Facebook without an explicit user approval step.

## Safety rules

The agent must enforce all of the following when reasoning over uploaded material:

- No fake metrics
- No fake clients
- No confidential bid details
- No Controlled Unclassified Information (CUI)
- No private proposal details
- No personally identifiable information (PII)
- No unsupported compliance claims
- No exaggerated wins
- No secret or code leakage
- No publication of repository secrets, tokens, or credentials
- No publication of private customer data
- No claims of certifications, clearances, or contract vehicles unless the user has explicitly supplied evidence and approved the claim

## Premium gating rationale

This feature belongs in the highest paid tier because it:

- Consumes SourceDeck business context (services, pipeline, vendors, opportunities)
- Ingests uploaded documents and connected repositories
- Uses watsonx-powered analysis to produce drafted, evidence-grounded content
- Replaces a marketing function that small businesses otherwise outsource at significantly higher cost

See `docs/sourcedeck-tiering-notes.md` for full tier guidance.

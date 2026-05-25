/**
 * SourceDeck Premium Content Agent — product specification module.
 *
 * Source of truth for the feature spec consumed by SourceDeck's customer-
 * facing premium content tooling. This module declares:
 *
 *   • Tier gating
 *   • Supported platforms (LinkedIn and Facebook only)
 *   • Permitted context inputs (uploads, repos, public URLs)
 *   • Content types, ratio, and per-platform guidance
 *   • Approval workflow and safety rules
 *   • Hashtag schemas (10–12 LinkedIn, 3–6 Facebook) and blocked hashtags
 *   • Example intake prompts
 *
 * NOTE — Separation of concerns:
 *   This module describes a *customer-facing* SourceDeck product feature. It
 *   does not control ARCG's internal Content Command Center, which lives in
 *   the rest of `src/content/arcg/`. Keep them separate. The Premium Content
 *   Agent does not auto-publish; every draft requires user approval.
 *
 * NOTE — Implementation status:
 *   This file is a specification consumed by the UI, planning, and audit
 *   layers. It does not perform any live calls (no watsonx, no GitHub, no
 *   Buffer). When those integrations are implemented, they must read from
 *   this module so the spec stays the single source of truth.
 */

export const FEATURE_NAME = "SourceDeck Premium Content Agent" as const;
export const TIER_REQUIREMENT = "highest_paid_tier_only" as const;
export const POWERED_BY = "watsonx" as const;

export type SupportedPlatform = "linkedin" | "facebook";

export type ClaimLevel = "verified" | "inferred" | "candidate";

export type ContentGoal = "traffic" | "authority" | "leads" | "trust";

export interface ContentRatio {
  /** Percentage of posts in a planning window dedicated to feature/benefit/credibility content. */
  featureBenefit: number;
  /** Percentage of posts dedicated to diagnostic/POV/operational content. */
  diagnosticPOV: number;
}

export interface PlatformGuidance {
  platform: SupportedPlatform;
  tone: string;
  preferredLengthChars: { min: number; max: number };
  hashtagCount: { min: number; max: number };
  ctaStyle: string;
  formatsAllowed: ReadonlyArray<string>;
}

export interface HashtagSchema {
  platform: SupportedPlatform;
  recommended: ReadonlyArray<string>;
  countRange: { min: number; max: number };
}

export interface PremiumContentAgentSpec {
  featureName: typeof FEATURE_NAME;
  tierRequirement: typeof TIER_REQUIREMENT;
  positioning: string;
  poweredBy: typeof POWERED_BY;
  supportedPlatforms: ReadonlyArray<SupportedPlatform>;
  contextInputs: ReadonlyArray<string>;
  repositoryLinkInputs: ReadonlyArray<string>;
  documentInputs: ReadonlyArray<string>;
  analysisOutputs: ReadonlyArray<string>;
  contentTypes: {
    linkedin: ReadonlyArray<string>;
    facebook: ReadonlyArray<string>;
  };
  contentRatio: ContentRatio;
  platformGuidance: ReadonlyArray<PlatformGuidance>;
  approvalWorkflow: {
    autoPublish: false;
    perPostApprovalRequired: true;
    bulkApprovalAllowed: false;
    description: string;
  };
  safetyRules: ReadonlyArray<string>;
  blockedClaims: ReadonlyArray<string>;
  hashtagSchemas: ReadonlyArray<HashtagSchema>;
  blockedHashtags: ReadonlyArray<string>;
  ctaRules: ReadonlyArray<string>;
  examplePrompts: ReadonlyArray<string>;
}

export const sourcedeckPremiumContentAgent: PremiumContentAgentSpec = {
  featureName: FEATURE_NAME,
  tierRequirement: TIER_REQUIREMENT,
  positioning:
    "Turn your pipeline, documents, repositories, GovCon activity, and operational wins into LinkedIn and Facebook content that builds trust, traffic, and sales conversations.",
  poweredBy: POWERED_BY,

  supportedPlatforms: ["linkedin", "facebook"],

  contextInputs: [
    "uploadedDocuments",
    "linkedRepositories",
    "publicUrls",
    "productPages",
    "businessProfile",
    "services",
    "pipelineItems",
    "opportunityRecords",
    "vendorRecords",
    "proposalDocuments",
    "capabilityStatements",
    "releaseNotes",
    "changelogs",
    "codeRepositories",
    "readmeFiles",
    "apiDocs",
  ],

  repositoryLinkInputs: [
    "GitHub",
    "GitLab",
    "Bitbucket",
    "public repository URLs",
    "private repository connection planned, requires auth",
  ],

  documentInputs: [
    "PDF",
    "DOCX",
    "markdown",
    "plain text",
    "CSV",
    "pitch deck (PDF or exported slide deck)",
    "capability statement",
    "SOP",
    "product documentation",
    "service menu",
    "proposal template (de-identified)",
    "project writeup",
    "case study draft",
    "product screenshots",
    "README files",
    "API docs",
    "changelogs",
    "feature lists",
    "issue or roadmap exports",
  ],

  analysisOutputs: [
    "product and service features",
    "concrete benefits",
    "buyer problems",
    "target audience signals",
    "proof-safe claims",
    "feature updates",
    "release notes summary",
    "common use cases",
    "industry-specific language",
    "technical differentiators",
    "compliance-sensitive flags",
    "candidate CTAs",
    "blocked or risky claims",
    "content opportunities",
  ],

  contentTypes: {
    linkedin: [
      "text_authority",
      "poll",
      "document_pdf_outline",
      "product_feature_spotlight",
      "service_explainer",
      "govcon_authority",
      "pipeline_lesson",
      "website_cta",
      "founder_note",
      "operational_lesson",
      "build_in_public",
      "comment_led_question",
    ],
    facebook: [
      "service_education",
      "community_trust",
      "owner_update",
      "project_update",
      "customer_problem_solution",
      "business_tip",
      "website_cta",
      "soft_offer",
    ],
  },

  contentRatio: {
    featureBenefit: 75,
    diagnosticPOV: 25,
  },

  platformGuidance: [
    {
      platform: "linkedin",
      tone: "Authoritative, plain-language, evidence-led. No hype. No emoji-heavy hooks.",
      preferredLengthChars: { min: 600, max: 1600 },
      hashtagCount: { min: 10, max: 12 },
      ctaStyle:
        "End with a concrete next step (visit page, take poll, comment with a single word, download the document).",
      formatsAllowed: [
        "text_authority",
        "poll",
        "document_pdf_outline",
        "product_feature_spotlight",
        "service_explainer",
        "govcon_authority",
        "pipeline_lesson",
        "website_cta",
        "founder_note",
        "operational_lesson",
        "build_in_public",
        "comment_led_question",
      ],
    },
    {
      platform: "facebook",
      tone: "Approachable, practical, community-aware. Service-led, not viral.",
      preferredLengthChars: { min: 200, max: 800 },
      hashtagCount: { min: 3, max: 6 },
      ctaStyle:
        "End with one clear ask: visit the site, message the page, or reply with a specific question.",
      formatsAllowed: [
        "service_education",
        "community_trust",
        "owner_update",
        "project_update",
        "customer_problem_solution",
        "business_tip",
        "website_cta",
        "soft_offer",
      ],
    },
  ],

  approvalWorkflow: {
    autoPublish: false,
    perPostApprovalRequired: true,
    bulkApprovalAllowed: false,
    description:
      "The agent drafts content. SourceDeck presents each draft with claim confidence and CTA destination. The user must approve each draft individually before it is queued for scheduling. There is no auto-post toggle in this feature.",
  },

  safetyRules: [
    "no fake metrics",
    "no fake clients",
    "no confidential bid details",
    "no CUI (Controlled Unclassified Information)",
    "no private proposal details",
    "no PII",
    "no unsupported compliance claims",
    "no exaggerated wins",
    "no secret or code leakage",
    "no publication of repository secrets, tokens, or credentials",
    "no publication of private customer data",
    "no Instagram drafts under this feature",
    "no auto-posting",
  ],

  blockedClaims: [
    "unverified certifications",
    "unverified clearances",
    "unverified contract vehicles",
    "unverified set-aside status",
    "unverified revenue figures",
    "unverified client logos",
    "guaranteed-outcome language",
    "get-rich-quick framing",
    "competitor disparagement",
  ],

  hashtagSchemas: [
    {
      platform: "linkedin",
      countRange: { min: 10, max: 12 },
      recommended: [
        "#SourceDeck",
        "#GovCon",
        "#GovernmentContracting",
        "#GovConPipeline",
        "#BidReadiness",
        "#ProposalOperations",
        "#CaptureManagement",
        "#DocumentControl",
        "#VendorTracking",
        "#ComplianceTracking",
        "#OpportunityPipeline",
        "#SmallBusinessContractors",
        "#FederalContracting",
        "#VeteranOwnedBusiness",
        "#HUBZone",
        "#OperationsLeaders",
      ],
    },
    {
      platform: "facebook",
      countRange: { min: 3, max: 6 },
      recommended: [
        "#SourceDeck",
        "#SmallBusiness",
        "#GovernmentContracting",
        "#BusinessGrowth",
        "#FederalContracting",
        "#Operations",
      ],
    },
  ],

  blockedHashtags: [
    "#Viral",
    "#Trending",
    "#FollowForFollow",
    "#LikeForLike",
    "#GuaranteedResults",
    "#GetRichQuick",
  ],

  ctaRules: [
    "Every draft must include exactly one CTA.",
    "CTA destinations must be real URLs the user has supplied or verified.",
    "Polls count as a CTA on LinkedIn.",
    "Comment-led question posts count as a CTA when paired with a specific prompt.",
    "Website CTAs must point to an indexed page, not a placeholder URL.",
    "No 'DM me' CTAs without a supporting reason in the post body.",
  ],

  examplePrompts: [
    "What business are you trying to grow?",
    "What service or product do you want to promote right now?",
    "Do you want to attach documents or links?",
    "Do you want to connect a GitHub, GitLab, or Bitbucket repository?",
    "What audience should this post reach?",
    "Should this post drive website traffic, build authority, generate leads, or build trust?",
    "Should this be LinkedIn, Facebook, or both?",
    "Should this be text-only, a poll, a checklist, a document outline, or media-supported?",
  ],
};

export default sourcedeckPremiumContentAgent;

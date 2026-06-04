// content/govcon/fact-authority.mjs
//
// GovCon Fact Authority — the single source of truth for legal/procurement
// claims the GovCon content/posting agent is allowed to make. The
// pre-publication fact checker (content/govcon/fact-checker.mjs) reads
// from this table and BLOCKS any draft post that contradicts it or that
// asserts a regulated fact without an authoritative match.
//
// Why this exists:
//   A recent GovCon post used "$10K" for the FAR micro-purchase
//   threshold. The general MPT was raised to $15,000 effective
//   2025-10-01 (FAR 2.101). That outdated post triggered negative
//   public comments. The fact authority + checker + tests + audit are
//   the structural fix so it cannot recur.
//
// Discipline:
//   - Primary sources only. acquisition.gov FAR pages, SAM.gov
//     official docs, SBA.gov, GSA.gov, and agency-official acquisition
//     policy for agency-specific claims. NEVER blogs, LinkedIn posts,
//     YouTube videos, or AI-generated summaries as authority.
//   - Every fact carries: current_value, effective_date, exceptions,
//     primary_sources, last_verified_date, risk_level,
//     required_disclaimer, allowed_post_language, blocked_post_language.
//   - last_verified_date is the date a human re-checked the primary
//     source. Operators MUST re-check before each campaign cycle.
//   - When a primary source cannot be verified for a claim a draft
//     wants to make, the checker returns BLOCKED_FACT_CHECK — never
//     "assume current" or "use prior post as authority".

'use strict';

// ISO date string of when an operator last re-checked the primary
// sources for the FAR threshold facts. Update this whenever you do a
// real re-verification against acquisition.gov.
export const LAST_HUMAN_VERIFICATION = '2026-06-04';

// Risk levels used by the checker to tier the response.
export const RISK_LEVELS = Object.freeze({
  LEGAL: 'legal_or_procurement_rule',  // FAR / statute / regulation
  POLICY: 'agency_or_program_policy',  // SBA / GSA / agency-specific
  OPERATIONAL: 'operational_claim',    // not legal but easily wrong
});

export const FACTS = Object.freeze([
  {
    fact_id: 'FAR_MICRO_PURCHASE_THRESHOLD_GENERAL',
    canonical_claim:
      'The general FAR micro-purchase threshold is $15,000.',
    current_value: '$15,000',
    old_value: '$10,000',
    effective_date: '2025-10-01',
    exceptions: [
      'Construction subject to wage-rate requirements has a lower threshold (FAR 2.101).',
      'Acquisitions of services subject to the Service Contract Labor Standards have a lower threshold (FAR 2.101).',
      'Contingency operations, defense or recovery from cyber/nuclear/biological/chemical/radiological attack, or specified declared emergencies have higher thresholds (FAR 2.101).',
    ],
    primary_sources: [
      'https://www.acquisition.gov/far/2.101',
      'https://www.acquisition.gov/content/section-19006-threshold-changes',
    ],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'General threshold; exceptions apply.',
    allowed_post_language: [
      'The general FAR micro-purchase threshold is currently $15,000, with important exceptions.',
      'Federal micro-purchases are generally at or below $15,000 under the FAR, with exceptions.',
      'Some categories — including certain construction and wage-rate-covered services — have different thresholds.',
    ],
    blocked_post_language: [
      'micro-purchase threshold is $10,000',
      'micro-purchase threshold is $10K',
      'under $10K micro-purchase',
      'below $10K',
      'under-$10K',
      '$10,000 micro-purchase',
      'micro-purchases are always available',
      'every micro-purchase is competed',
      'every micro-purchase is posted on SAM.gov',
    ],
  },
  {
    fact_id: 'FAR_MICRO_PURCHASE_CONSTRUCTION_EXCEPTION',
    canonical_claim:
      'Micro-purchase threshold for construction subject to the Wage Rate Requirements (Construction) statute is lower than the general threshold.',
    current_value:
      '$2,000 for construction subject to the Wage Rate Requirements (Construction) statute (formerly Davis-Bacon Act)',
    old_value: null,
    effective_date: null,
    exceptions: [
      'Other special-case exceptions exist; consult FAR 2.101 definition of "micro-purchase threshold".',
    ],
    primary_sources: ['https://www.acquisition.gov/far/2.101'],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'Construction exception; verify current value at FAR 2.101 before relying.',
    allowed_post_language: [
      'Construction subject to wage-rate requirements has a lower micro-purchase threshold than the general MPT.',
    ],
    blocked_post_language: [
      'all construction is under the same micro-purchase threshold',
    ],
  },
  {
    fact_id: 'FAR_MICRO_PURCHASE_PREFERRED_PAYMENT_METHOD',
    canonical_claim:
      'The Governmentwide commercial purchase card is the preferred method for micro-purchases.',
    current_value: 'Governmentwide commercial purchase card (GPC) preferred',
    old_value: null,
    effective_date: null,
    exceptions: [
      'Other authorized simplified acquisition methods may be used at or below the MPT.',
    ],
    primary_sources: ['https://www.acquisition.gov/far/13.201'],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'GPC preferred but not exclusive; other authorized methods are allowed.',
    allowed_post_language: [
      'Purchase cards are often used for micro-purchases; FAR 13.201 names the Governmentwide commercial purchase card as the preferred method.',
    ],
    blocked_post_language: [
      'only purchase cards can be used for micro-purchases',
      'purchase cards are required for every micro-purchase',
    ],
  },
  {
    fact_id: 'FAR_MICRO_PURCHASE_COMPETITION',
    canonical_claim:
      'Micro-purchases may be awarded without soliciting competitive quotations if the contracting officer or other authorized individual considers the price reasonable.',
    current_value:
      'May be awarded without soliciting competitive quotations (FAR 13.203)',
    old_value: null,
    effective_date: null,
    exceptions: [
      'Micro-purchases should be distributed equitably among qualified suppliers to the extent practicable (FAR 13.203).',
    ],
    primary_sources: ['https://www.acquisition.gov/far/13.203'],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'No competition is required, but equitable distribution applies; do not imply guaranteed access.',
    allowed_post_language: [
      'Micro-purchases may be awarded without competitive quotations if the price is considered reasonable, with equitable distribution among qualified suppliers.',
    ],
    blocked_post_language: [
      'micro-purchases require full competition',
      'no competition ever',
      'guaranteed micro-purchase award',
    ],
  },
  {
    fact_id: 'FAR_SMALL_BUSINESS_SET_ASIDE_ABOVE_MPT_TO_SAT',
    canonical_claim:
      'Acquisitions above the micro-purchase threshold but not over the simplified acquisition threshold are generally reserved for small business unless the contracting officer determines otherwise.',
    current_value:
      'Generally reserved for small business above MPT and not over SAT (FAR 19.502-2)',
    old_value: null,
    effective_date: null,
    exceptions: [
      'A contracting officer may determine that there is not a reasonable expectation of obtaining offers from two or more responsible small business concerns that are competitive in terms of fair market prices, quality, and delivery (FAR 19.502-2).',
    ],
    primary_sources: [
      'https://www.acquisition.gov/far/19.502-2',
      'https://www.acquisition.gov/far/subpart-19.5',
    ],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'Subject to contracting officer determination; do not imply automatic small-business set-aside.',
    allowed_post_language: [
      'Between MPT and SAT, acquisitions are generally reserved for small business unless the contracting officer determines otherwise.',
    ],
    blocked_post_language: [
      'always set aside for small business',
      'automatic small business set-aside',
      'guaranteed set-aside',
    ],
  },
  {
    fact_id: 'FAR_PUBLICIZING_NOT_ALWAYS_SAM',
    canonical_claim:
      'Not all small purchases or micro-purchases are publicly posted on SAM.gov. Publicizing requirements vary by dollar value, acquisition type, agency practice, and exceptions in FAR Part 5.',
    current_value:
      'Publicizing requirements vary; many micro-purchases are not posted publicly',
    old_value: null,
    effective_date: null,
    exceptions: [
      'FAR Part 5 governs publicizing requirements; specific thresholds and exemptions apply.',
    ],
    primary_sources: [
      'https://www.acquisition.gov/far/part-5',
      'https://sam.gov/',
    ],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'SAM.gov does not list every federal buying action; many micro-purchases are not publicly posted.',
    allowed_post_language: [
      'Many federal micro-purchases are not publicly posted on SAM.gov.',
      'SAM.gov opportunity data does not reflect every federal buying action.',
    ],
    blocked_post_language: [
      'always posted on SAM.gov',
      'every micro-purchase is on SAM.gov',
      'all federal opportunities are on SAM.gov',
    ],
  },
  {
    fact_id: 'SAM_API_SEARCH_LIMITATION',
    canonical_claim:
      'SAM.gov opportunity data does not equal all federal buying activity.',
    current_value:
      'SAM.gov shows only opportunities that are required or chosen to be publicly posted',
    old_value: null,
    effective_date: null,
    exceptions: [],
    primary_sources: [
      'https://sam.gov/content/api',
      'https://open.gsa.gov/api/get-opportunities-public-api/',
    ],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.POLICY,
    required_disclaimer:
      'SAM.gov is a partial view of federal buying.',
    allowed_post_language: [
      'SAM.gov is one input — not the entire federal procurement surface.',
    ],
    blocked_post_language: [
      'every federal opportunity flows through SAM.gov',
      'SAM.gov shows all federal buying',
    ],
  },
  {
    fact_id: 'FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL',
    canonical_claim:
      'The simplified acquisition threshold (SAT) is defined in FAR 2.101 and must be verified against the current FAR text before any campaign asserts a dollar value.',
    current_value:
      'See FAR 2.101 — operator must re-verify the current SAT before any campaign that quotes a dollar value.',
    old_value: '$250,000 (commonly cited historical value; verify before use)',
    effective_date: null,
    exceptions: [
      'Higher SATs apply for contingency operations, defense or recovery from cyber/nuclear/biological/chemical/radiological attack, and certain declared emergencies (FAR 2.101).',
    ],
    primary_sources: ['https://www.acquisition.gov/far/2.101'],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'Verify current SAT against FAR 2.101 before publishing any dollar-value claim.',
    allowed_post_language: [
      'Acquisitions at or below the simplified acquisition threshold use simplified procedures under FAR Part 13; verify the current dollar value before quoting it.',
      'ARCG specializes in under-$250K work as a stated operator preference; the legal SAT must be verified at FAR 2.101 before any external claim about its value.',
    ],
    blocked_post_language: [
      'SAT is exactly $X without source verification',
    ],
  },
  {
    fact_id: 'STATUTORY_SMALL_BUSINESS_PROCUREMENT_GOAL_PERCENTAGES',
    canonical_claim:
      'Government-wide statutory small-business and socioeconomic procurement goal percentages are defined by statute (15 U.S.C. § 644(g)) and amended by Congress periodically. Operator must verify current goal percentages from the SBA before publicly quoting them.',
    current_value:
      'Verify current statutory goal percentages from sba.gov / 15 U.S.C. § 644(g). The SDVOSB statutory government-wide goal was amended by Congress in recent NDAA cycles.',
    old_value:
      'Prior content asserted "SDVOSB 3%, small business 23%". Treat as REQUIRES_VERIFICATION until re-checked against SBA primary source for the current period.',
    effective_date: null,
    exceptions: [
      'Agency-specific goal percentages may differ from the government-wide statutory minimum.',
    ],
    primary_sources: [
      'https://www.sba.gov/federal-contracting/contracting-guide/types-contracts',
      'https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title15-section644&num=0&edition=prelim',
    ],
    last_verified_date: LAST_HUMAN_VERIFICATION,
    risk_level: RISK_LEVELS.LEGAL,
    required_disclaimer:
      'Verify current goal percentages against the SBA primary source before quoting; goal percentages have been amended by Congress.',
    allowed_post_language: [
      'Government-wide small-business procurement goals are set by statute and updated by Congress; verify the current percentage with the SBA before quoting.',
      'Federal agencies have small-business procurement goals; check SBA for the current government-wide and socioeconomic percentages.',
    ],
    blocked_post_language: [
      'SDVOSB 3%',
      '3% SDVOSB goal',
      '3 percent SDVOSB',
    ],
  },
]);

// Quick-lookup helpers.
export function getFactById(factId) {
  return FACTS.find((f) => f.fact_id === factId) || null;
}

export function listFacts() {
  return FACTS.slice();
}

// Returns the set of blocked phrases across all facts (lowercased).
export function getAllBlockedPhrases() {
  const out = new Set();
  for (const f of FACTS) {
    for (const p of (f.blocked_post_language || [])) {
      out.add(String(p).toLowerCase());
    }
  }
  return [...out];
}

// Returns the list of facts whose risk level requires a source-check
// metadata note on any post that references them.
export function getSourceCheckRequiredFacts() {
  return FACTS.filter((f) => f.risk_level === RISK_LEVELS.LEGAL || f.risk_level === RISK_LEVELS.POLICY);
}

// Operator-facing reminder: re-verify the facts before each campaign
// cycle. The checker emits this in its source_notes when it approves a
// post that asserts a regulated claim.
export const RECHECK_REMINDER =
  `Operator must re-verify FAR/statutory facts against primary sources (acquisition.gov, sba.gov, gsa.gov, sam.gov) before each campaign cycle. Last human verification: ${LAST_HUMAN_VERIFICATION}.`;

export default {
  FACTS,
  RISK_LEVELS,
  LAST_HUMAN_VERIFICATION,
  RECHECK_REMINDER,
  getFactById,
  listFacts,
  getAllBlockedPhrases,
  getSourceCheckRequiredFacts,
};

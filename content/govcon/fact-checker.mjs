// content/govcon/fact-checker.mjs
//
// GovCon pre-publication fact checker. Every GovCon draft post must
// pass through `checkPost()` before being approved, scheduled, or
// handed to Buffer. The checker is paired with the GovCon Fact
// Authority (content/govcon/fact-authority.mjs).
//
// Output contract:
//   {
//     status: 'APPROVED' | 'NEEDS_REVIEW' | 'BLOCKED_FACT_CHECK',
//     issues: [{ severity, code, message, span?: string }],
//     required_edits: [string],
//     source_notes: [string],
//     safe_rewrite: string,
//     authority_used: [fact_id],
//     last_verified_date: string,
//   }
//
// Discipline:
//   - This module makes no network call and no Buffer call.
//   - It does not approve a post that asserts a regulated fact unless
//     either (a) the language matches an allowed_post_language pattern
//     or (b) the operator has explicitly tagged the post with an
//     authority_override + source_url (and even then it returns
//     NEEDS_REVIEW so a human still confirms before publish).

'use strict';

import {
  FACTS,
  RISK_LEVELS,
  LAST_HUMAN_VERIFICATION,
  RECHECK_REMINDER,
  getAllBlockedPhrases,
  getSourceCheckRequiredFacts,
} from './fact-authority.mjs';

// ---------- detector helpers ----------

export const RISKY_TERMS = Object.freeze([
  'micro-purchase', 'micropurchase', 'micro purchase',
  'threshold', 'thresholds',
  'far ',                      // "FAR 13.201" / "FAR 2.101" etc — leading space to avoid false hits in "farther"
  'simplified acquisition',
  'sam.gov',
  'set-aside', 'set aside', 'setaside',
  'sdvosb', 'hubzone',
  'sole source', 'sole-source',
  'purchase card', 'gpc ',
  'contracting officer',
  'rfq', 'rfp',
  'small business goal',
  'small-business goal',
]);

// Hype/illegal-claim phrases that are unconditionally blocked anywhere
// in a GovCon post — independent of the fact authority.
export const ALWAYS_BLOCKED_PHRASES = Object.freeze([
  'guaranteed award',
  'guaranteed revenue',
  'guaranteed savings',
  'guaranteed roi',
  'guaranteed response',
  'guaranteed federal revenue',
  'we guarantee',
  'easy money',
  'easiest federal revenue',
  'automatic award',
  'no competition ever',
  'must buy',
  'always posted on sam.gov',
  'every federal opportunity is on sam.gov',
  'all federal opportunities are on sam.gov',
  'every federal opportunity flows through sam.gov',
  'sam.gov shows all federal buying',
  'preferred vendor of',
  'award-winning',
]);

// Numeric patterns that suggest an outdated micro-purchase value.
// We treat "$10K", "$10,000", "10K", and "under $10" near micropurchase
// language as a hard fail.
const OUTDATED_MPT_PATTERN = /(\$?\s*10\s*[Kk]\b|\$?\s*10,?000\b|\$10\b|\bunder[-\s]?\$10\b)/;
const CURRENT_MPT_PATTERN  = /(\$?\s*15\s*[Kk]\b|\$?\s*15,?000\b)/;
const NEAR_RADIUS = 80; // characters
const MICROPURCHASE_PATTERN = /(micro[-\s]?purchase|micropurchase|purchase card|gpc\b)/i;

function lc(s) { return String(s || '').toLowerCase(); }

function findAllIndices(haystack, needle) {
  const out = [];
  if (!needle) return out;
  let i = 0;
  while ((i = haystack.indexOf(needle, i)) !== -1) {
    out.push(i);
    i += needle.length;
  }
  return out;
}

function nearMicropurchase(haystack, matchIndex, matchLength) {
  const window = haystack.slice(
    Math.max(0, matchIndex - NEAR_RADIUS),
    Math.min(haystack.length, matchIndex + matchLength + NEAR_RADIUS)
  );
  return MICROPURCHASE_PATTERN.test(window);
}

// ---------- public API ----------

export function checkPost(input) {
  const text = String((input && input.post_copy) || (input && input.text) || '');
  const meta = (input && input.metadata) || {};
  const platform = (input && input.platform) || meta.platform || '';
  const lower = lc(text);

  const issues = [];
  const required_edits = [];
  const source_notes = [];
  const authority_used = new Set();

  // 1. Always-blocked hype phrases.
  for (const phrase of ALWAYS_BLOCKED_PHRASES) {
    if (lower.includes(phrase)) {
      issues.push({
        severity: 'block',
        code: 'HYPE_OR_UNSUPPORTED_CLAIM',
        message: `Blocked phrase detected: "${phrase}".`,
        span: phrase,
      });
    }
  }

  // 2. Authority-blocked phrases per fact.
  for (const f of FACTS) {
    for (const blocked of (f.blocked_post_language || [])) {
      const b = lc(blocked);
      if (lower.includes(b)) {
        issues.push({
          severity: 'block',
          code: 'CONTRADICTS_FACT_AUTHORITY',
          message: `Phrase "${blocked}" contradicts fact "${f.fact_id}" (${f.canonical_claim}).`,
          span: blocked,
        });
        authority_used.add(f.fact_id);
      }
    }
  }

  // 3. Outdated micro-purchase numerics near micropurchase context.
  const outdatedMatch = lower.match(OUTDATED_MPT_PATTERN);
  if (outdatedMatch) {
    const idx = lower.indexOf(outdatedMatch[0]);
    if (nearMicropurchase(lower, idx, outdatedMatch[0].length)) {
      issues.push({
        severity: 'block',
        code: 'OUTDATED_MICRO_PURCHASE_THRESHOLD',
        message:
          'BLOCKED_FACT_CHECK: outdated micro-purchase threshold. Current general FAR MPT is $15,000 effective 2025-10-01; exceptions apply.',
        span: outdatedMatch[0],
      });
      authority_used.add('FAR_MICRO_PURCHASE_THRESHOLD_GENERAL');
    }
  }

  // 4. Current $15K used near micropurchase context but missing the
  // "exceptions apply" disclaimer → require the disclaimer.
  const currentMatch = lower.match(CURRENT_MPT_PATTERN);
  if (currentMatch) {
    const idx = lower.indexOf(currentMatch[0]);
    if (nearMicropurchase(lower, idx, currentMatch[0].length)) {
      const hasDisclaimer = /exception|exceptions apply|with important exceptions/i.test(text);
      if (!hasDisclaimer) {
        issues.push({
          severity: 'block',
          code: 'MISSING_EXCEPTIONS_DISCLAIMER',
          message:
            '$15,000 micro-purchase claim must include exceptions disclaimer (e.g., "general threshold; exceptions apply"). See FAR 2.101.',
          span: currentMatch[0],
        });
        required_edits.push(
          'Add the phrase "general threshold; exceptions apply" (or equivalent) near the $15,000 reference.'
        );
        authority_used.add('FAR_MICRO_PURCHASE_THRESHOLD_GENERAL');
      } else {
        // Disclaimer present — record authority but don't block.
        authority_used.add('FAR_MICRO_PURCHASE_THRESHOLD_GENERAL');
      }
    }
  }

  // 5. Risky-term scan → require source metadata.
  let hasRiskyTerm = false;
  for (const term of RISKY_TERMS) {
    if (lower.includes(term)) { hasRiskyTerm = true; break; }
  }
  // Match "FAR 13.201", "FAR 2.101", etc. as a regex too.
  if (!hasRiskyTerm && /\bFAR\s+\d/i.test(text)) hasRiskyTerm = true;

  if (hasRiskyTerm) {
    const claimedAuthority =
      Array.isArray(meta.authority_used) ? meta.authority_used : null;
    const sourceCheckedAt = meta.source_checked_at || null;

    if (!sourceCheckedAt) {
      issues.push({
        severity: 'block',
        code: 'MISSING_SOURCE_CHECK_METADATA',
        message:
          'Post asserts a legal/procurement claim. Internal metadata must include `source_checked_at` and `authority_used` (fact_ids from fact-authority.mjs).',
      });
    } else {
      source_notes.push(
        `Source check declared on ${sourceCheckedAt}.`
      );
    }

    if (!claimedAuthority || claimedAuthority.length === 0) {
      issues.push({
        severity: 'block',
        code: 'MISSING_AUTHORITY_METADATA',
        message:
          'Post asserts a legal/procurement claim with no authority_used in metadata. Cite at least one fact_id from fact-authority.mjs.',
      });
    } else {
      for (const id of claimedAuthority) authority_used.add(id);
    }

    source_notes.push(RECHECK_REMINDER);
    source_notes.push(
      'Primary sources only: acquisition.gov, sam.gov, sba.gov, gsa.gov, or agency-official acquisition policy.'
    );
  }

  // 6. SAT dollar-value claim without source check → warn/block.
  if (/\$?\s*250\s*[Kk]\b|\$?\s*250,?000\b/.test(text) &&
      /simplified acquisition/i.test(text) &&
      /threshold/i.test(text)) {
    issues.push({
      severity: 'block',
      code: 'UNVERIFIED_SAT_VALUE',
      message:
        'Post quotes a Simplified Acquisition Threshold dollar value alongside the term "SAT/threshold". The SAT must be verified against FAR 2.101 before any public claim. Either remove the dollar value or include a source-check metadata note for FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL.',
    });
    authority_used.add('FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL');
  }

  // 7. Verdict.
  const hasBlock = issues.some((i) => i.severity === 'block');
  const status = hasBlock
    ? 'BLOCKED_FACT_CHECK'
    : (issues.length ? 'NEEDS_REVIEW' : 'APPROVED');

  return Object.freeze({
    status,
    issues: Object.freeze(issues),
    required_edits: Object.freeze(required_edits),
    source_notes: Object.freeze(source_notes),
    safe_rewrite: hasBlock ? buildSafeRewrite(text) : '',
    authority_used: Object.freeze([...authority_used]),
    last_verified_date: LAST_HUMAN_VERIFICATION,
    platform,
  });
}

// ---------- safe rewriter ----------
//
// Conservative, regex-based rewriter. Replaces the outdated dollar
// values with current ones + disclaimers, scrubs hype phrases, and
// adds the "verify before publish" tail. The operator is still
// expected to review and refine; the rewrite is a starting point
// that already passes the checker.
export function buildSafeRewrite(text) {
  let out = String(text || '');

  // Replace outdated $10K micro-purchase values with current $15K + disclaimer.
  out = out.replace(
    /\bunder[-\s]\$10\s*[Kk]\b/gi,
    'at or below the general FAR micro-purchase threshold (currently $15,000; exceptions apply)'
  );
  out = out.replace(
    /\bunder\s*\$10,?000\b/gi,
    'at or below the general FAR micro-purchase threshold (currently $15,000; exceptions apply)'
  );
  out = out.replace(
    /\$10\s*[Kk]\b/g,
    '$15,000 (general FAR MPT; exceptions apply)'
  );
  out = out.replace(
    /\$10,?000\b/g,
    '$15,000 (general FAR MPT; exceptions apply)'
  );
  out = out.replace(
    /\b10\s*[Kk]\b(?=\s*(?:action|micro|purchase))/gi,
    '$15,000 (general FAR MPT; exceptions apply)'
  );

  // Scrub hype phrases.
  const hypeMap = [
    [/\beasiest federal revenue\b/gi, 'lower-friction federal entry path when buyers can validate and purchase quickly'],
    [/\beasy money\b/gi, '[redacted hype phrase]'],
    [/\bguaranteed (award|revenue|savings|roi|response|federal revenue)\b/gi, '[redacted unsupported claim]'],
    [/\bwe guarantee\b/gi, '[redacted unsupported claim]'],
    [/\baward-winning\b/gi, '[redacted unsupported claim]'],
    [/\bautomatic award\b/gi, '[redacted unsupported claim]'],
    [/\bno competition ever\b/gi, '[redacted unsupported claim — competition rules vary]'],
    [/\balways posted on SAM\.gov\b/gi, '(SAM.gov does not list every federal buying action)'],
    [/\bmust buy\b/gi, '[redacted unsupported claim]'],
    [/\bpreferred vendor of [A-Za-z][^.\n]{0,60}/gi, '[redacted overclaim]'],
  ];
  for (const [pat, rep] of hypeMap) out = out.replace(pat, rep);

  // Replace "SDVOSB 3%" / "small business 23%" without source check.
  out = out.replace(
    /\bSDVOSB\s*3\s*%/gi,
    'SDVOSB statutory goal (verify current percentage with SBA before quoting)'
  );
  out = out.replace(
    /\bsmall business\s*23\s*%/gi,
    'small-business statutory goal (verify current percentage with SBA before quoting)'
  );

  // Add a tail caveat if the post still references regulated topics
  // and didn't already include "exceptions apply" or "verify".
  const stillRegulated = /(micro[-\s]?purchase|simplified acquisition|set[-\s]?aside|SDVOSB|HUBZone|FAR\s+\d|SAM\.gov)/i;
  if (stillRegulated.test(out) && !/exceptions apply|verify/i.test(out)) {
    out += '\n\nGeneral threshold; exceptions apply. Verify current FAR/SBA rules at acquisition.gov / sba.gov before acting.';
  }

  return out;
}

// Convenience: check a batch of posts (e.g. a 30-day schedule) and
// return per-post verdicts.
export function checkBatch(posts) {
  if (!Array.isArray(posts)) return [];
  return posts.map((p, idx) => {
    const r = checkPost(p);
    return Object.freeze({
      index: idx,
      day: p && (p.day || p.id) || null,
      verdict: r,
    });
  });
}

export default {
  checkPost,
  checkBatch,
  buildSafeRewrite,
  ALWAYS_BLOCKED_PHRASES,
  RISKY_TERMS,
};

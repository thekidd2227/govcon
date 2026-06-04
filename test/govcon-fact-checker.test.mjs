// test/govcon-fact-checker.test.mjs
//
// GovCon fact-checker test suite. Pure node assert; no external test
// framework. Mirrors the test style used elsewhere in this repo.
//
// Run:   node test/govcon-fact-checker.test.mjs
//
// Exits non-zero on any failure so `npm test` (when wired) fails.

'use strict';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  checkPost,
  checkBatch,
  buildSafeRewrite,
  ALWAYS_BLOCKED_PHRASES,
} from '../content/govcon/fact-checker.mjs';

import {
  FACTS,
  LAST_HUMAN_VERIFICATION,
  RECHECK_REMINDER,
  getAllBlockedPhrases,
  getSourceCheckRequiredFacts,
} from '../content/govcon/fact-authority.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✅ ' + name); }
  catch (e) {
    failed++;
    console.log('  ❌ ' + name + ': ' + (e && e.message));
    if (e && e.stack) console.log(e.stack);
  }
}

// Minimal valid source-check metadata to satisfy the "regulated claim
// must carry source metadata" rule on tests that aren't testing that
// rule itself.
const SOURCED_META = {
  metadata: {
    source_checked_at: '2026-06-04',
    authority_used: ['FAR_MICRO_PURCHASE_THRESHOLD_GENERAL'],
  },
};

console.log('\n--- always-blocked hype phrases ---');
test('blocks "guaranteed federal revenue"', () => {
  const r = checkPost({ post_copy: 'This is guaranteed federal revenue for SDVOSBs.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'HYPE_OR_UNSUPPORTED_CLAIM'));
});
test('blocks "we guarantee"', () => {
  const r = checkPost({ post_copy: 'We guarantee award on every micro-purchase.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});
test('blocks "award-winning"', () => {
  const r = checkPost({ post_copy: 'ARCG is an award-winning SDVOSB.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});
test('blocks "micro-purchases are always posted on SAM.gov"', () => {
  const r = checkPost({ post_copy: 'Micro-purchases are always posted on SAM.gov so just check there.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});
test('blocks "no competition ever" near micro-purchase context', () => {
  const r = checkPost({ post_copy: 'Micro-purchase pathway: no competition ever, just buy.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});

console.log('\n--- outdated $10K micro-purchase threshold ---');
test('blocks "micro-purchase threshold is $10K"', () => {
  const r = checkPost({ post_copy: 'The micro-purchase threshold is $10K.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'OUTDATED_MICRO_PURCHASE_THRESHOLD'
                              || i.code === 'CONTRADICTS_FACT_AUTHORITY'));
});
test('blocks "under $10K" near micro-purchase context', () => {
  const r = checkPost({ post_copy: 'Ready for under $10K micro-purchase actions today.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'OUTDATED_MICRO_PURCHASE_THRESHOLD'
                              || i.code === 'CONTRADICTS_FACT_AUTHORITY'));
});
test('blocks "$10,000 micro-purchase"', () => {
  const r = checkPost({ post_copy: 'Vendors should target the $10,000 micro-purchase lane.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});
test('blocks "under-$10K" (hyphenated)', () => {
  const r = checkPost({ post_copy: 'ARCG is ready for under-$10K actions on the micro-purchase bench.', ...SOURCED_META });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});
test('does NOT block "$10K" when not near micropurchase context', () => {
  const r = checkPost({ post_copy: 'A $10K janitorial scope still needs documentation.', ...SOURCED_META });
  // No outdated-MPT block. Other checks may still apply, but not this one.
  const hasMptBlock = r.issues.some(i => i.code === 'OUTDATED_MICRO_PURCHASE_THRESHOLD');
  assert.equal(hasMptBlock, false);
});

console.log('\n--- current $15K micro-purchase threshold ---');
test('blocks "$15,000" near micro-purchase WITHOUT exceptions disclaimer', () => {
  const r = checkPost({
    post_copy: 'The micro-purchase threshold is $15,000.',
    ...SOURCED_META,
  });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'MISSING_EXCEPTIONS_DISCLAIMER'));
  assert.ok(r.required_edits.some(e => /exceptions apply/i.test(e)));
});
test('approves "$15,000 general micro-purchase threshold; exceptions apply" WITH source metadata', () => {
  const r = checkPost({
    post_copy: 'The general FAR micro-purchase threshold is currently $15,000; exceptions apply.',
    ...SOURCED_META,
  });
  assert.equal(r.status, 'APPROVED');
  assert.ok(r.authority_used.includes('FAR_MICRO_PURCHASE_THRESHOLD_GENERAL'));
});
test('approves "$15K" near micro-purchase WITH disclaimer + source metadata', () => {
  const r = checkPost({
    post_copy: 'Micro-purchase lane: at or below $15K (exceptions apply for construction and wage-rate services).',
    ...SOURCED_META,
  });
  assert.equal(r.status, 'APPROVED');
});

console.log('\n--- source-check metadata ---');
test('blocks regulated claim without source_checked_at metadata', () => {
  const r = checkPost({
    post_copy: 'SDVOSB sole-source under simplified acquisition procedures.',
    metadata: { authority_used: ['FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL'] },
  });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'MISSING_SOURCE_CHECK_METADATA'));
});
test('blocks regulated claim without authority_used metadata', () => {
  const r = checkPost({
    post_copy: 'Vendors should be ready for micro-purchase actions.',
    metadata: { source_checked_at: '2026-06-04' },
  });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'MISSING_AUTHORITY_METADATA'));
});
test('approves educational post WITH FAR source metadata', () => {
  const r = checkPost({
    post_copy:
      'The general FAR micro-purchase threshold is currently $15,000; exceptions apply. Many micro-purchases are not publicly posted on SAM.gov. Always verify current FAR rules at acquisition.gov before acting.',
    metadata: {
      source_checked_at: '2026-06-04',
      authority_used: ['FAR_MICRO_PURCHASE_THRESHOLD_GENERAL', 'FAR_PUBLICIZING_NOT_ALWAYS_SAM'],
    },
  });
  assert.equal(r.status, 'APPROVED', `expected APPROVED, got ${r.status}: ${JSON.stringify(r.issues)}`);
  assert.ok(r.source_notes.length > 0);
});

console.log('\n--- SAT dollar value ---');
test('blocks "$250K Simplified Acquisition Threshold" without source check', () => {
  const r = checkPost({
    post_copy: 'The Simplified Acquisition Threshold is $250K — the cleanest path.',
    metadata: { source_checked_at: '2026-06-04', authority_used: ['FAR_SIMPLIFIED_ACQUISITION_THRESHOLD_GENERAL'] },
  });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
  assert.ok(r.issues.some(i => i.code === 'UNVERIFIED_SAT_VALUE'));
});

console.log('\n--- stale statutory goal percentages ---');
test('blocks "SDVOSB 3%" outright', () => {
  const r = checkPost({
    post_copy: 'Government-wide SDVOSB 3% goal makes this a great opportunity.',
    metadata: { source_checked_at: '2026-06-04', authority_used: ['STATUTORY_SMALL_BUSINESS_PROCUREMENT_GOAL_PERCENTAGES'] },
  });
  assert.equal(r.status, 'BLOCKED_FACT_CHECK');
});

console.log('\n--- safe rewrite ---');
test('rewrites "$10K micro-purchase" into $15K + disclaimer', () => {
  const rewrite = buildSafeRewrite('Ready for under-$10K micro-purchase actions.');
  assert.ok(/\$15,000/.test(rewrite), `expected $15,000 in rewrite, got: ${rewrite}`);
  assert.ok(/exceptions apply/i.test(rewrite));
  assert.ok(!/\$10\b|\$10K|10,000/i.test(rewrite.replace(/\$15,?000/g, '').replace(/\$15\b/g, '')),
    `rewrite still contains $10 reference: ${rewrite}`);
});
test('rewritten post passes the checker (with source metadata)', () => {
  const rewrite = buildSafeRewrite('Ready for under-$10K micro-purchase actions.');
  const r = checkPost({
    post_copy: rewrite,
    metadata: {
      source_checked_at: '2026-06-04',
      authority_used: ['FAR_MICRO_PURCHASE_THRESHOLD_GENERAL', 'FAR_PUBLICIZING_NOT_ALWAYS_SAM'],
    },
  });
  assert.notEqual(r.status, 'BLOCKED_FACT_CHECK',
    `safe rewrite still blocked: ${JSON.stringify(r.issues)}`);
});
test('rewrite scrubs hype phrase "easiest federal revenue"', () => {
  const rewrite = buildSafeRewrite('Micro-purchases are the easiest federal revenue.');
  assert.equal(/easiest federal revenue/i.test(rewrite), false);
  assert.ok(/lower-friction/i.test(rewrite) || /\[redacted/i.test(rewrite));
});
test('rewrite scrubs "guaranteed federal revenue"', () => {
  const rewrite = buildSafeRewrite('This is guaranteed federal revenue.');
  assert.equal(/guaranteed federal revenue/i.test(rewrite), false);
});

console.log('\n--- fact authority structure ---');
test('every fact has the documented contract fields', () => {
  for (const f of FACTS) {
    for (const k of ['fact_id', 'canonical_claim', 'current_value', 'primary_sources', 'last_verified_date', 'risk_level', 'allowed_post_language', 'blocked_post_language']) {
      assert.ok(k in f, `fact ${f.fact_id} missing field ${k}`);
    }
    assert.ok(Array.isArray(f.primary_sources) && f.primary_sources.length > 0,
      `fact ${f.fact_id} must list at least one primary source`);
  }
});
test('FAR_MICRO_PURCHASE_THRESHOLD_GENERAL carries the current $15,000 value and 2025-10-01 effective date', () => {
  const f = FACTS.find(x => x.fact_id === 'FAR_MICRO_PURCHASE_THRESHOLD_GENERAL');
  assert.equal(f.current_value, '$15,000');
  assert.equal(f.effective_date, '2025-10-01');
  assert.equal(f.old_value, '$10,000');
});
test('blocked-phrase list is non-empty and includes outdated $10K phrases', () => {
  const blocked = getAllBlockedPhrases();
  assert.ok(blocked.length > 0);
  assert.ok(blocked.some(p => /\$10,000/.test(p)));
});
test('source-check-required facts include FAR MPT', () => {
  const required = getSourceCheckRequiredFacts();
  assert.ok(required.some(f => f.fact_id === 'FAR_MICRO_PURCHASE_THRESHOLD_GENERAL'));
});
test('LAST_HUMAN_VERIFICATION is a recent ISO date', () => {
  assert.ok(/^20\d{2}-\d{2}-\d{2}$/.test(LAST_HUMAN_VERIFICATION));
});
test('RECHECK_REMINDER mentions primary sources', () => {
  assert.ok(/acquisition\.gov/i.test(RECHECK_REMINDER));
});

console.log('\n--- batch checker against the in-repo 30-day schedule ---');
test('no live 30-day post asserts an outdated $10K MPT', () => {
  const file = path.resolve(__dirname, '..', 'content', 'govcon-30-day-posting-schedule.json');
  const posts = JSON.parse(fs.readFileSync(file, 'utf8'));
  // Only run the outdated-MPT detector (not the metadata requirement)
  // because the schedule entries are reviewed via review_status — we
  // care that no post still carries the outdated dollar value.
  const offenders = posts.filter(p => {
    const lower = String(p.post_copy || '').toLowerCase();
    return /\$10\b|\$10,?000\b|under[-\s]\$10/.test(lower) && /micro/.test(lower);
  });
  assert.equal(offenders.length, 0,
    `Found posts still asserting outdated $10K MPT: ${offenders.map(p => p.day).join(', ')}`);
});
test('checkBatch returns one verdict per post', () => {
  const sample = [
    { day: 1, post_copy: 'plain marketing copy with no regulated terms.' },
    { day: 2, post_copy: 'Micro-purchase at or below $15K (exceptions apply).',
      metadata: { source_checked_at: '2026-06-04', authority_used: ['FAR_MICRO_PURCHASE_THRESHOLD_GENERAL'] } },
  ];
  const out = checkBatch(sample);
  assert.equal(out.length, 2);
  assert.ok(out[0].verdict);
  assert.ok(out[1].verdict);
});

// ---- Finalize ----
setTimeout(() => {
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed) process.exit(1);
}, 50);

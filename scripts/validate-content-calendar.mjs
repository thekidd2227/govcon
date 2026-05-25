#!/usr/bin/env node
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const calendarPath = resolve(__dirname, '../src/content/arcg/calendar.json');

const VALID_PLATFORMS = ['linkedin', 'instagram', 'facebook'];
const VALID_STATUSES = ['draft', 'scheduled', 'published', 'approved'];
const REQUIRED = ['hook', 'caption', 'cta', 'imagePrompt', 'platform', 'date', 'recommendedTime'];
const PAIN_KEYWORDS = [
  'leak', 'waste', 'handoff', 'visibility', 'accountability', 'diagnosis',
  'blueprint', 'compliance', 'dispatch', 'sla', 'revenue', 'reporting',
  'bottleneck', 'gap', 'breakdown', 'failure', 'blind spot', 'drop',
  'miss', 'delay', 'drift', 'erosion', 'loss', 'overhead',
];
const AI_FIRST = [/^ai automation/i, /^automate your/i, /^unlock ai/i, /^supercharge/i, /^leverage ai/i, /^ai-powered/i, /^ai solution/i];

let calendar;
try {
  calendar = JSON.parse(readFileSync(calendarPath, 'utf-8'));
} catch (e) {
  console.error(`ERROR: Cannot read ${calendarPath}: ${e.message}`);
  process.exit(1);
}

const posts = calendar.posts || [];
const errors = [];
const warnings = [];
const seenIds = new Set();
const seenDatePlatform = new Set();

for (const p of posts) {
  for (const field of REQUIRED) {
    if (!p[field] || (typeof p[field] === 'string' && !p[field].trim())) {
      errors.push(`[${p.id}] Missing required: ${field}`);
    }
  }
  if (p.platform && !VALID_PLATFORMS.includes(p.platform)) {
    errors.push(`[${p.id}] Invalid platform: ${p.platform}`);
  }
  if (p.status && !VALID_STATUSES.includes(p.status)) {
    errors.push(`[${p.id}] Invalid status: ${p.status}`);
  }
  if (seenIds.has(p.id)) {
    errors.push(`[${p.id}] Duplicate ID`);
  }
  seenIds.add(p.id);

  const dpKey = `${p.date}-${p.platform}`;
  if (seenDatePlatform.has(dpKey)) {
    errors.push(`[${p.id}] Duplicate date/platform: ${dpKey}`);
  }
  seenDatePlatform.add(dpKey);

  if (p.hook) {
    for (const pat of AI_FIRST) {
      if (pat.test(p.hook)) {
        warnings.push(`[${p.id}] AI-first hook: "${p.hook.slice(0, 50)}..."`);
      }
    }
  }
  if (p.caption) {
    const lower = p.caption.toLowerCase();
    if (!PAIN_KEYWORDS.some(k => lower.includes(k))) {
      warnings.push(`[${p.id}] Caption missing buyer pain keyword`);
    }
  }
  if (!p.videoPrompt) {
    warnings.push(`[${p.id}] Missing videoPrompt`);
  }
}

const score = Math.max(0, 100 - errors.length * 5 - warnings.length);

console.log(`\n=== ARCG Content Calendar Validation ===`);
console.log(`Posts: ${posts.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log(`Score: ${score}/100\n`);

if (errors.length) {
  console.log('ERRORS:');
  errors.forEach(e => console.log(`  ✗ ${e}`));
}
if (warnings.length) {
  console.log('\nWARNINGS:');
  warnings.forEach(w => console.log(`  ⚠ ${w}`));
}

if (errors.length === 0) {
  console.log('\n✓ Validation PASSED');
  process.exit(0);
} else {
  console.log('\n✗ Validation FAILED');
  process.exit(1);
}

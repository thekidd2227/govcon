#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const calendarPath = resolve(__dirname, '../src/content/arcg/calendar.json');
const exportsDir = resolve(__dirname, '../exports');

function escapeCSV(value) {
  if (!value) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toRow(cells) {
  return cells.map(escapeCSV).join(',');
}

function exportPosts(posts, format) {
  const headers = ['Date', 'Time', 'Platform', 'Caption', 'Media Prompt', 'Video Prompt', 'CTA', 'Hashtags', 'Status', 'Notes'];
  if (format === 'buffer') headers.push('Publish');
  if (format === 'metricool') headers.push('Channel');

  const rows = [toRow(headers)];
  for (const p of posts) {
    const cells = [
      p.date, p.recommendedTime, p.platform, p.caption,
      p.imagePrompt, p.videoPrompt || '', p.cta,
      (p.hashtags || []).join(' '), p.status, p.notes || '',
    ];
    if (format === 'buffer') cells.push(p.status === 'approved' || p.status === 'scheduled' ? 'Yes' : 'No');
    if (format === 'metricool') {
      const map = { linkedin: 'LinkedIn', instagram: 'Instagram', facebook: 'Facebook' };
      cells.push(map[p.platform] || p.platform);
    }
    rows.push(toRow(cells));
  }
  return rows.join('\n') + '\n';
}

let calendar;
try {
  calendar = JSON.parse(readFileSync(calendarPath, 'utf-8'));
} catch (e) {
  console.error(`ERROR: Cannot read ${calendarPath}: ${e.message}`);
  process.exit(1);
}

const posts = calendar.posts || [];
mkdirSync(exportsDir, { recursive: true });

const exports_list = [
  { format: 'master', filename: 'master-calendar.csv' },
  { format: 'buffer', filename: 'buffer-calendar.csv' },
  { format: 'metricool', filename: 'metricool-calendar.csv' },
];

console.log(`\n=== ARCG Content Calendar Export ===`);
console.log(`Posts: ${posts.length}\n`);

for (const { format, filename } of exports_list) {
  const csv = exportPosts(posts, format);
  const outPath = resolve(exportsDir, filename);
  writeFileSync(outPath, csv, 'utf-8');
  const lines = csv.split('\n').filter(l => l.trim()).length;
  console.log(`  ✓ ${filename} — ${lines} rows (${(csv.length / 1024).toFixed(1)} KB)`);
}

console.log('\n✓ Export complete');

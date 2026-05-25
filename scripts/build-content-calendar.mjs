#!/usr/bin/env node
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

console.log('=== ARCG Content Calendar Build ===\n');

try {
  console.log('Step 1: Validate...');
  execSync('node scripts/validate-content-calendar.mjs', { cwd: root, stdio: 'inherit' });
} catch (e) {
  console.error('\n✗ Validation failed. Export skipped.');
  process.exit(1);
}

try {
  console.log('\nStep 2: Export...');
  execSync('node scripts/export-content-calendar.mjs', { cwd: root, stdio: 'inherit' });
} catch (e) {
  console.error('\n✗ Export failed.');
  process.exit(1);
}

console.log('\n✓ Build complete — calendar validated and exported.');

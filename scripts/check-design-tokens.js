/**
 * Design System Smoke Check
 * Verifies that critical legacy design tokens remain in tailwind.config.ts
 * and .cursorrules. Runs as part of the pre-commit build gate.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_TOKENS = [
  { file: 'tailwind.config.ts', patterns: ['"Fanwood Text"', '#533e27', '#7c2c00', '#faf6ef', '#e8dcc8', 'legacyTokens'] },
  { file: '.cursorrules', patterns: ['Fanwood Text', '#533e27', '#7c2c00', 'prose-legacy', 'NEVER push directly to'] },
];

let failures = 0;

for (const { file, patterns } of REQUIRED_TOKENS) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`FAIL: ${file} is missing`);
    failures++;
    continue;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const pattern of patterns) {
    if (!content.includes(pattern)) {
      console.error(`FAIL: ${file} is missing required token: "${pattern}"`);
      failures++;
    }
  }
}

if (failures > 0) {
  console.error(`\n${failures} design system check(s) failed. Fix before committing.`);
  process.exit(1);
} else {
  console.log('Design system tokens verified.');
}

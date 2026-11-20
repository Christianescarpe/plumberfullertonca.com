import fs from 'node:fs';
import path from 'node:path';

const cov = JSON.parse(fs.readFileSync('fullerton-plumbing-site/source/content/coverage.json', 'utf8'));
let failed = 0;
for (const row of cov) {
  const p = path.join('fullerton-plumbing-site/source/content/pages', row.path.replace(/^\//, '').replace(/\/$/, '') + '.md');
  const src = fs.readFileSync(p, 'utf8');
  const anchorTag = `{#${row.anchor}}`;
  const idx = src.indexOf(anchorTag);
  if (idx === -1) {
    console.log(`FAIL anchor tag: #${row.anchor} in ${row.path}`);
    failed++;
    continue;
  }
  // Check in 600 chars of anchor
  const chunk = src.slice(Math.max(0, idx - 100), idx + 600);
  const visible = row.topic;
  if (!chunk.includes(visible)) {
    console.log(`FAIL chunk: #${row.anchor} | Topic: "${row.topic}" in ${row.path}`);
    failed++;
  } else {
    console.log(`OK: #${row.anchor}`);
  }
}
console.log(`Total: ${cov.length}, Failed: ${failed}`);

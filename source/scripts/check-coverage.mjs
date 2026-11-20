import fs from 'node:fs';
import path from 'node:path';

const cov = JSON.parse(fs.readFileSync('fullerton-plumbing-site/source/content/coverage.json', 'utf8'));
let failed = 0;
for (const row of cov) {
  const p = path.join('fullerton-plumbing-site/source/content/pages', row.path.replace(/^\//, '').replace(/\/$/, '') + '.md');
  const src = fs.readFileSync(p, 'utf8');
  const hasTopic = src.includes(row.topic);
  const hasAnchor = src.includes(`{#${row.anchor}}`) || src.includes(`{# ${row.anchor}}`) || src.includes(`id="${row.anchor}"`);
  if (!hasTopic || !hasAnchor) {
    console.log(`FAIL: ${row.path} -> #${row.anchor} | Topic: "${row.topic}" | hasTopic: ${hasTopic}, hasAnchor: ${hasAnchor}`);
    failed++;
  } else {
    console.log(`OK: #${row.anchor}`);
  }
}
console.log(`Total checked: ${cov.length}, Failed: ${failed}`);

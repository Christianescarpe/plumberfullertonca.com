import fs from 'node:fs';
import path from 'node:path';
import { parseMarkdown, renderDocument } from '../src/engine.mjs';

const root = path.resolve('fullerton-plumbing-site/source');
const pagesDir = path.join(root, 'content/pages');
const coverage = JSON.parse(fs.readFileSync(path.join(root, 'content/coverage.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));
const photosRaw = JSON.parse(fs.readFileSync(path.join(root, 'src/assets/photos/manifest.json'), 'utf8'));
const photos = Object.fromEntries(photosRaw.map(p => [p.filename_1600.replace(/-1600\.jpg$/, ''), p]));

// Render all pages
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.md')) pages.push(full);
  }
}
walk(pagesDir);

const rendered = pages.map(p => {
  const content = fs.readFileSync(p, 'utf8');
  const doc = parseMarkdown(content, path.basename(p));
  const html = renderDocument(doc, config, photos);
  return { doc, html };
});

const byPath = new Map(rendered.map(item => [item.doc.front.path, item.html]));

let failed = 0;
for (const row of coverage) {
  const html = byPath.get(row.path);
  if (!html) {
    console.log(`ERROR: Path missing ${row.path}`);
    failed++;
    continue;
  }
  if (!html.includes(`id="${row.anchor}"`)) {
    console.log(`ERROR: Missing anchor ${row.anchor} in ${row.path}`);
    failed++;
    continue;
  }
  const chunk = html.split(`id="${row.anchor}"`)[1]?.slice(0, 500) || "";
  const visible = row.topic.replaceAll("&", "&amp;");
  if (!chunk.includes(visible)) {
    console.log(`ERROR: Anchor #${row.anchor} in ${row.path} does not show topic "${row.topic}" (visible: "${visible}")`);
    console.log(`CHUNK: ${chunk.slice(0, 150)}...\n`);
    failed++;
  } else {
    console.log(`OK: #${row.anchor}`);
  }
}
console.log(`\nCoverage check complete. Total: ${coverage.length}, Failed: ${failed}`);

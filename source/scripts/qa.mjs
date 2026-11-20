import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.resolve(root, "../website");
const failures = [];
const notes = [];
const fail = (message) => failures.push(message);

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

if (!fs.existsSync(dist)) {
  console.error(`Dist directory ${dist} does not exist. Run build first.`);
  process.exit(1);
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const pages = htmlFiles.filter((file) => path.basename(file) === "index.html");
if (pages.length !== 28) fail(`Expected 28 index.html pages, found ${pages.length}`);
if (!htmlFiles.some((file) => file.endsWith(`${path.sep}404.html`))) fail("Missing 404.html");

const robots = fs.readFileSync(path.join(dist, "robots.txt"), "utf8");
if (!/Disallow:\s*\//.test(robots)) fail("Preview robots.txt does not disallow /");
if (/^Allow:\s*\/$/m.test(robots)) fail("Preview robots.txt allows crawling");
const sitemap = fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8");
if (sitemap.includes("<loc>")) fail("Preview sitemap lists URLs");

// Permitted public utility / safety emergency numbers in Fullerton
const allowTel = new Set([
  "tel:+17147386897",
  "tel:+17147386890",
  "tel:+18004272200",
  "tel:+18006554555",
  "tel:811",
  "tel:911",
]);
const titles = new Map();
const h1s = new Map();
const descriptions = new Map();
const idsByPath = new Map();
const hrefs = [];

function rel(file) {
  const relative = path.relative(dist, file).split(path.sep).join("/");
  if (relative === "index.html") return "/";
  if (relative === "404.html") return "/404.html";
  return `/${relative.replace(/index\.html$/, "")}`;
}

for (const file of htmlFiles) {
  const url = rel(file);
  const html = fs.readFileSync(file, "utf8");
  if (!html.startsWith("<!DOCTYPE html>")) fail(`${url} missing doctype`);
  if (!html.includes('lang="en"')) fail(`${url} missing lang`);
  if (!html.includes('content="noindex, nofollow, noarchive"')) fail(`${url} missing preview robots`);
  if (/rel="canonical"/i.test(html)) fail(`${url} has a canonical in preview`);
  if (/<form[\s>]/i.test(html)) fail(`${url} contains a form`);
  if (/FAQPage|LocalBusiness|aggregateRating|reviewCount/i.test(html)) fail(`${url} has forbidden schema`);
  if (/our plumbers|our technicians|our crew|licensed and insured/i.test(html)) {
    fail(`${url} contains a forbidden claim`);
  }
  for (const pattern of ["testimonial", "5-star", "five-star", "24/7", "24-hour", "guaranteed arrival", "best plumber"]) {
    const re = new RegExp(pattern, "ig");
    for (const match of html.matchAll(re)) {
      const start = Math.max(html.lastIndexOf(">", match.index), html.lastIndexOf(".", match.index));
      const end = html.indexOf("<", match.index);
      const sentence = html.slice(start, end === -1 ? match.index + 80 : end);
      if (!/\b(no|not|never|without)\b/i.test(sentence)) fail(`${url} states “${pattern}” as a claim`);
    }
  }
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const h1 = [...html.matchAll(/<h1>([^<]*)<\/h1>/g)].map((match) => match[1]);
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1];
  if (!title) fail(`${url} missing title`);
  if (h1.length !== 1) fail(`${url} has ${h1.length} h1 elements`);
  if (!description) fail(`${url} missing description`);
  if (titles.has(title)) fail(`Duplicate title ${title}`);
  if (url !== "/404.html" && h1s.has(h1[0])) fail(`Duplicate h1 ${h1[0]}`);
  if (descriptions.has(description)) fail(`Duplicate description ${description}`);
  titles.set(title, url);
  h1s.set(h1[0], url);
  descriptions.set(description, url);
  if (url !== "/404.html") {
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const data = JSON.parse(match[1]);
        const graph = data["@graph"] || [data];
        for (const node of graph) {
          if (["LocalBusiness", "FAQPage", "Plumber"].includes(node["@type"])) fail(`${url} schema type ${node["@type"]}`);
          if (node.telephone || node.address || node.openingHours || node.aggregateRating) {
            fail(`${url} schema includes a contact fact`);
          }
        }
      } catch (error) {
        fail(`${url} JSON-LD did not parse: ${error.message}`);
      }
    }
  }
  idsByPath.set(url, new Set([...html.matchAll(/id="([a-z0-9-]+)"/g)].map((match) => match[1])));
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    hrefs.push([url, match[1]]);
  }
  for (const match of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of match[1].split(",")) {
      const asset = part.trim().split(/\s+/)[0];
      if (asset) hrefs.push([url, asset]);
    }
  }
  for (const match of html.matchAll(/href="(tel:[^"]+)"/g)) {
    if (!allowTel.has(match[1])) fail(`${url} unexpected tel ${match[1]}`);
  }
}

const coverage = JSON.parse(fs.readFileSync(path.join(root, "content/coverage.json"), "utf8"));
if (coverage.length !== 44) fail(`Coverage file has ${coverage.length} rows`);
for (const row of coverage) {
  const { topic, path: url, anchor } = row;
  const file = url === "/" ? path.join(dist, "index.html") : path.join(dist, url, "index.html");
  const html = fs.readFileSync(file, "utf8");
  const visible = topic.replaceAll("&", "&amp;");
  if (!html.includes(`id="${anchor}"`) || !html.includes(visible)) fail(`Topic not visible: ${topic}`);
}

const areas = fs.readFileSync(path.join(dist, "areas/index.html"), "utf8");
for (const zip of ["92831", "92832", "92833", "92835"]) {
  if (!areas.includes(zip)) fail(`Areas index missing ${zip}`);
}

for (const [from, href] of hrefs) {
  if (href.startsWith("http://")) fail(`${from} insecure URL ${href}`);
  if (href.startsWith("tel:") || href.startsWith("https://") || href.startsWith("#") || href.startsWith("data:")) continue;
  const [pathname, hash] = href.split("#");
  if (pathname.startsWith("/assets/")) {
    const asset = path.join(dist, pathname);
    if (!fs.existsSync(asset)) fail(`${from} missing asset ${pathname}`);
    continue;
  }
  const target = pathname === "/" ? path.join(dist, "index.html") : path.join(dist, pathname, "index.html");
  if (!fs.existsSync(target)) fail(`${from} broken link ${pathname}`);
  if (hash && !idsByPath.get(pathname)?.has(hash)) fail(`${from} broken anchor ${pathname}#${hash}`);
}

const home = fs.readFileSync(path.join(dist, "index.html"), "utf8");
if (!home.includes("Phone setup pending")) fail("Home does not show the pending phone state");
if (!home.includes("<h1>Plumbing help in Fullerton, CA</h1>")) fail("Home missing its helpful H1");
if (!home.includes("Plumber Fullerton CA")) fail("Home title missing 'Plumber Fullerton CA'");
const servicePages = [...titles.values()].filter((url) => url.startsWith("/services/") && url !== "/services/");
for (const url of servicePages) {
  const html = fs.readFileSync(path.join(dist, url, "index.html"), "utf8");
  if (html.includes("<h1>Plumbing help in Fullerton, CA</h1>")) fail(`${url} uses the homepage H1`);
  if (!html.includes("Fullerton context") && !html.includes("context")) notes.push(`${url} local-context heading check is loose`);
}

// AEO llms.txt validation
const llmsPath = path.join(dist, "llms.txt");
if (!fs.existsSync(llmsPath)) fail("Missing llms.txt");
else {
  const llms = fs.readFileSync(llmsPath, "utf8");
  if (!llms.includes("Fullerton Plumbing Referral")) fail("llms.txt missing brand name");
  if (!llms.includes("92831")) fail("llms.txt missing Fullerton ZIP coverage");
}

if (notes.length) {
  console.log(`QA notes (${notes.length}):`);
  for (const note of notes) console.log(`  - ${note}`);
}

if (failures.length) {
  console.error(`QA failed with ${failures.length} issues:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`QA passed cleanly for all ${pages.length} pages, 44 coverage sub-niches, and assets.`);

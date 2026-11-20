import { diagrams } from "./diagrams.mjs";
import { canDial } from "./gates.mjs";
import { crumbFor, primaryNav, sectionNav, services, districts, cities } from "./nav.mjs";
import { pageEndBackgrounds, sectionMedia } from "./section-media.mjs";

const TEL = new Set([
  "tel:+17147386897",
  "tel:+17147386890",
  "tel:+17147386541",
  "tel:+18004272200",
  "tel:+18006554555",
  "tel:811",
]);

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fillTokens(text, config) {
  const brand = config.brand.publicName;
  const live = canDial(config);
  const operator = live ? config.brand.operatorLegalName : "not published";
  const phone = live ? config.phone.display : "phone setup pending";
  const hours = config.mode === "production" && config.hours.verified
    ? config.hours.summary
    : "Answering hours are not confirmed";
  const domain = config.mode === "production" && config.domain.verified
    ? config.domain.hostname
    : "no domain configured";
  return String(text)
    .replaceAll("{{brand}}", brand)
    .replaceAll("{{operator}}", operator)
    .replaceAll("{{phone}}", phone)
    .replaceAll("{{hours}}", hours)
    .replaceAll("{{domain}}", domain);
}

function checkHref(href) {
  if (href.startsWith("tel:")) {
    if (!TEL.has(href)) throw new Error(`Telephone link is not an allowlisted official number: ${href}`);
    return;
  }
  if (href.startsWith("https://")) return;
  if (href.startsWith("#")) {
    if (!/^#[a-z0-9-]+$/.test(href)) throw new Error(`Bad anchor ${href}`);
    return;
  }
  if (href.startsWith("/")) {
    const path = href.split("#")[0];
    if (path !== "/" && !path.endsWith("/")) throw new Error(`Internal link needs a trailing slash: ${href}`);
    if (href.includes("?")) throw new Error(`Query links are not used: ${href}`);
    return;
  }
  throw new Error(`Unsupported link: ${href}`);
}

function inline(raw, config) {
  const text = fillTokens(raw, config);
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let out = "";
  let i = 0;
  for (const match of text.matchAll(re)) {
    out += escapeHtml(text.slice(i, match.index));
    if (match[3]) out += `<strong>${escapeHtml(match[3])}</strong>`;
    else {
      checkHref(match[2]);
      const external = match[2].startsWith("https://");
      const rel = external ? ` rel="noreferrer"` : "";
      out += `<a href="${escapeHtml(match[2])}"${rel}>${escapeHtml(match[1])}</a>`;
    }
    i = match.index + match[0].length;
  }
  out += escapeHtml(text.slice(i));
  return out;
}

function parseHeading(line) {
  const level = line.startsWith("### ") ? 3 : 2;
  let text = line.replace(/^###?\s+/, "").trim();
  let id = "";
  const match = text.match(/^(.*)\{#([a-z0-9-]+)\}\s*$/);
  if (match) {
    text = match[1].trim();
    id = match[2];
  }
  return { type: "h", level, text, id };
}

function parseKeyBlock(raw) {
  const data = {};
  const prose = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z]+):\s*(.*)$/);
    if (match && ["base", "alt", "caption", "kind", "id", "Heading"].includes(match[1])) {
      data[match[1]] = match[2];
    } else prose.push(line);
  }
  return { data, prose: prose.join("\n").trim() };
}

export function parseMarkdown(fileText, filename) {
  const text = fileText.replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) throw new Error(`${filename}: missing front matter`);
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) throw new Error(`${filename}: unclosed front matter`);
  const front = {};
  for (const line of text.slice(4, end).split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx < 0) throw new Error(`${filename}: bad front matter line ${line}`);
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value === "true") value = true;
    else if (value === "false") value = false;
    front[key] = value;
  }
  const body = text.slice(end + 5);
  return { front, blocks: parseBlocks(body, filename), filename };
}

function parseBlocks(body, filename) {
  const lines = body.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (!lines[i].trim()) {
      i += 1;
      continue;
    }
    const line = lines[i];
    if (line.startsWith(":::")) {
      const fence = line.slice(3).trim();
      i += 1;
      const buf = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        buf.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) throw new Error(`${filename}: unclosed fence ${fence}`);
      i += 1;
      blocks.push({ type: "fence", fence, raw: buf.join("\n").trim() });
      continue;
    }
    if (line.startsWith("## ") || line.startsWith("### ")) {
      blocks.push(parseHeading(line));
      i += 1;
      continue;
    }
    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2).trim());
        i += 1;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    const buf = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("- ") &&
      !lines[i].startsWith(":::")
    ) {
      buf.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "p", text: buf.join(" ") });
  }
  return blocks;
}

function words(text) {
  const plain = String(text).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");
  return plain.trim().split(/\s+/).filter(Boolean);
}

function paragraphHtml(blocks, config) {
  return blocks.filter((block) => block.type === "p").map((block) => `<p>${inline(block.text, config)}</p>`).join("\n");
}

function listHtml(items, config) {
  return `<ul>\n${items.map((item) => `<li>${inline(item, config)}</li>`).join("\n")}\n</ul>`;
}

function cardItems(items) {
  return items.map((item) => {
    const match = item.match(/^\[([^\]]+)\]\(([^)\s]+)\)\s+—\s+(.+)$/);
    if (!match) throw new Error(`Card item needs [Label](/path/) — text: ${item}`);
    checkHref(match[2]);
    return { label: match[1], href: match[2], text: match[3] };
  });
}

export function countedWords(doc, config) {
  const mode = config.mode === "production" ? "production" : "preview";
  let bag = [];
  const takeBlocks = (blocks) => {
    for (const block of blocks) {
      if (block.type === "p") bag.push(block.text);
      else if (block.type === "h") bag.push(block.text);
      else if (block.type === "list") bag.push(...block.items);
      else if (block.type === "fence") {
        if (block.fence === "if-preview" && mode !== "preview") continue;
        if (block.fence === "if-production" && mode !== "production") continue;
        if (block.fence === "safety") continue;
        if (["local", "context", "conditional", "note", "if-preview", "if-production"].includes(block.fence)) {
          takeBlocks(parseBlocks(block.raw, doc.filename));
        } else if (block.fence === "takeaway") {
          bag.push(block.raw);
        } else if (block.fence === "faq") {
          for (const faq of parseFaqs(block.raw)) bag.push(faq.q, faq.a);
        } else if (block.fence === "steps") {
          for (const step of parseSteps(block.raw)) bag.push(step.title, step.text);
        } else if (block.fence === "symptoms" || block.fence === "related" || block.fence === "sources") {
          bag.push(...block.raw.split("\n").map((line) => line.replace(/^- /, "")));
        } else if (block.fence === "table") {
          bag.push(...block.raw.split("\n"));
        } else if (block.fence === "figure" || block.fence === "diagram") {
          const { data } = parseKeyBlock(block.raw);
          if (data.caption) bag.push(data.caption);
          if (data.alt) bag.push(data.alt);
        }
      }
    }
  };
  takeBlocks(doc.blocks);
  return words(bag.join(" ")).length;
}

function parseFaqs(raw) {
  const faqs = [];
  let current = null;
  const flush = () => {
    if (current) faqs.push(current);
    current = null;
  };
  for (const line of raw.split("\n")) {
    if (line.startsWith("Q:")) {
      flush();
      current = { q: line.slice(2).trim(), a: "" };
    } else if (line.startsWith("A:")) {
      if (!current) throw new Error(`Answer without question: ${line}`);
      current.a = line.slice(2).trim();
    } else if (current && line.trim()) {
      current.a = `${current.a} ${line.trim()}`.trim();
    }
  }
  flush();
  return faqs;
}

function parseSteps(raw) {
  return raw.split("\n").filter((line) => line.trim()).map((line) => {
    const idx = line.indexOf("|");
    if (idx < 0) throw new Error(`Step needs Title | text: ${line}`);
    return { title: line.slice(0, idx).trim(), text: line.slice(idx + 1).trim() };
  });
}

function renderFaqs(raw, config, heading) {
  const faqs = parseFaqs(raw);
  const items = faqs.map((faq) => `<details class="qa">\n<summary>${inline(faq.q, config)}</summary>\n<p>${inline(faq.a, config)}</p>\n</details>`).join("\n");
  return `<section class="faq">\n<h2>${escapeHtml(heading)}</h2>\n${items}\n</section>`;
}

function safetyBox() {
  return `<aside class="shared-safety" data-shared="true">
  <h2>If there is danger, use the utility line</h2>
  <p>For a suspected natural gas leak in Fullerton, get everyone out of the building. From a safe location, call Southern California Gas Company (SoCalGas) at <a href="tel:+18004272200">(800) 427-2200</a> or dial 911. Do not operate light switches, open flames, or mobile phones near a suspected leak. This referral site is not an emergency dispatch line.</p>
  <p>For water main breaks, street flooding, or municipal sewer overflows, call the City of Fullerton Water Division / Public Works emergency standby line at <a href="tel:+17147386897">(714) 738-6897</a>. For general public works inquiries, call <a href="tel:+17147386890">(714) 738-6890</a>. Those numbers are official municipal contacts, checked November 2026. They are not this website’s referral number.</p>
</aside>`;
}

function renderFence(block, config, photos, faqHeading) {
  const mode = config.mode === "production" ? "production" : "preview";
  if (block.fence === "if-preview" && mode !== "preview") return "";
  if (block.fence === "if-production" && mode !== "production") return "";
  if (block.fence === "safety") return safetyBox();
  if (["if-preview", "if-production", "note"].includes(block.fence)) {
    return renderFlow(parseBlocks(block.raw, "fence"), config, photos, faqHeading);
  }
  if (block.fence === "takeaway") {
    return `<div class="takeaway-box"><p><strong>Key Takeaway:</strong> ${inline(block.raw, config)}</p></div>`;
  }
  if (block.fence === "context" || block.fence === "local") {
    const lines = block.raw.split("\n");
    let heading = "Fullerton context";
    let rest = block.raw;
    if (lines[0].startsWith("Heading:")) {
      heading = lines[0].slice(8).trim();
      rest = lines.slice(1).join("\n").trim();
    }
    const inner = renderFlow(parseBlocks(rest, "context"), config, photos, faqHeading);
    return `<aside class="local-context">\n<h2>${escapeHtml(heading)}</h2>\n${inner}\n</aside>`;
  }
  if (block.fence === "conditional") {
    const lines = block.raw.split("\n");
    let heading = "Availability has to be confirmed";
    let rest = block.raw;
    if (lines[0].startsWith("Heading:")) {
      heading = lines[0].slice(8).trim();
      rest = lines.slice(1).join("\n").trim();
    }
    const inner = renderFlow(parseBlocks(rest, "conditional"), config, photos, faqHeading);
    return `<aside class="conditional">\n<h3>${escapeHtml(heading)}</h3>\n${inner}\n</aside>`;
  }
  if (block.fence === "faq") return renderFaqs(block.raw, config, faqHeading);
  if (block.fence === "steps") {
    const steps = parseSteps(block.raw);
    return `<ol class="steps">\n${steps.map((step, index) => `<li><span class="num">${String(index + 1).padStart(2, "0")}</span><h3>${inline(step.title, config)}</h3><p>${inline(step.text, config)}</p></li>`).join("\n")}\n</ol>`;
  }
  if (block.fence === "symptoms" || block.fence === "related") {
    let raw = block.raw;
    let label = block.fence === "symptoms" ? "Ways to describe the problem" : "Related guides";
    const lines = raw.split("\n");
    if (lines[0].startsWith("Heading:")) {
      label = lines[0].slice(8).trim();
      raw = lines.slice(1).join("\n");
    }
    const cards = cardItems(raw.split("\n").filter((line) => line.trim()).map((line) => line.replace(/^- /, "")));
    return `<section class="${block.fence === "symptoms" ? "symptom-block" : "related"}">\n<h2>${escapeHtml(label)}</h2>\n<ul class="link-cards">\n${cards.map((card) => `<li><a href="${escapeHtml(card.href)}"><strong>${escapeHtml(card.label)}</strong><span>${inline(card.text, config)}</span></a></li>`).join("\n")}\n</ul>\n</section>`;
  }
  if (block.fence === "sources") {
    const items = block.raw.split("\n").filter((line) => line.trim()).map((line) => line.replace(/^- /, ""));
    return `<section class="sources">\n<h2>Sources and limits</h2>\n<ul>\n${items.map((item) => `<li>${inline(item, config)}</li>`).join("\n")}\n</ul>\n<p>Checked November 2026, unless a source itself is older. Municipal guidelines and utility policies change. Nothing here is a permit determination, a coverage promise, or legal advice.</p>\n</section>`;
  }
  if (block.fence === "table") {
    const rows = block.raw.split("\n").filter((line) => line.trim());
    const caption = rows[0];
    const head = rows[1].split("|").map((cell) => cell.trim());
    const body = rows.slice(2).map((row) => row.split("|").map((cell) => cell.trim()));
    return `<div class="table-wrap"><table>\n<caption>${inline(caption, config)}</caption>\n<thead><tr>${head.map((cell) => `<th scope="col">${inline(cell, config)}</th>`).join("")}</tr></thead>\n<tbody>\n${body.map((row) => `<tr>${row.map((cell) => `<td>${inline(cell, config)}</td>`).join("")}</tr>`).join("\n")}\n</tbody>\n</table></div>`;
  }
  if (block.fence === "figure") return renderPhoto(parseKeyBlock(block.raw).data, photos, config, false);
  if (block.fence === "diagram") {
    const { data } = parseKeyBlock(block.raw);
    const diagram = diagrams[data.id];
    if (!diagram) throw new Error(`Unknown diagram ${data.id}`);
    const caption = data.caption || diagram.caption;
    return `<figure class="diagram">\n${diagram.svg}\n<figcaption><span class="label">${escapeHtml(diagram.title)}</span>${inline(caption, config)} Original illustration for this site, November 2026.</figcaption>\n</figure>`;
  }
  throw new Error(`Unknown fence ${block.fence}`);
}

function renderPhoto(data, photos, config, eager) {
  const meta = photos[data.base];
  if (!meta) throw new Error(`Unknown photo ${data.base}`);
  if (!data.alt || !data.caption) throw new Error(`Photo ${data.base} needs alt and caption`);
  const src800 = `/assets/photos/${meta.filename_800}`;
  const src1600 = `/assets/photos/${meta.filename_1600}`;
  return `<figure class="photo">\n<img src="${src800}" srcset="${src800} ${meta.width_800}w, ${src1600} ${meta.width_1600}w" sizes="(min-width: 960px) 640px, 100vw" width="${meta.width_1600}" height="${meta.height_1600}" alt="${escapeHtml(data.alt)}" ${eager ? `loading="eager" fetchpriority="high"` : `loading="lazy"`} decoding="async">\n</figure>`;
}

function renderFlow(blocks, config, photos, faqHeading, pagePath = "") {
  let html = "";
  let paraBuf = [];
  const flush = () => {
    if (!paraBuf.length) return;
    html += paraBuf.map((text) => `<p>${inline(text, config)}</p>\n`).join("");
    paraBuf = [];
  };
  const mediaMap = pagePath ? sectionMedia[pagePath] : null;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "p") {
      paraBuf.push(block.text);
      continue;
    }
    flush();
    if (block.type === "h" && block.level === 2 && mediaMap && mediaMap[block.id]) {
      const spec = mediaMap[block.id];
      const meta = photos[spec.image];
      if (!meta) throw new Error(`Unknown section media photo ${spec.image}`);
      const subBlocks = [block];
      while (
        i + 1 < blocks.length &&
        (blocks[i + 1].type === "p" ||
          blocks[i + 1].type === "list" ||
          (blocks[i + 1].type === "fence" && blocks[i + 1].fence === "conditional"))
      ) {
        subBlocks.push(blocks[++i]);
      }
      const innerHtml = renderFlow(subBlocks, config, photos, faqHeading, "");
      if (spec.type === "bg") {
        html += `</div></div>\n<section class="bg-band" style="--bg-img: url('/assets/photos/${meta.filename_1600}')">\n  <div class="wrap">\n${innerHtml}  </div>\n</section>\n<div class="content-band"><div class="wrap">\n`;
      } else {
        const side = spec.side === "left" ? "left" : "right";
        html += `<section class="media-split media-split--${side}">\n  <div class="media-split__text">\n${innerHtml}  </div>\n  <figure class="media-split__photo">\n    <img src="/assets/photos/${meta.filename_800}" srcset="/assets/photos/${meta.filename_800} ${meta.width_800}w, /assets/photos/${meta.filename_1600} ${meta.width_1600}w" sizes="(min-width: 960px) 560px, 100vw" width="${meta.width_1600}" height="${meta.height_1600}" alt="${escapeHtml(spec.alt)}" loading="lazy" decoding="async">\n  </figure>\n</section>\n`;
      }
      continue;
    }
    if (block.type === "h") {
      const id = block.id ? ` id="${block.id}"` : "";
      html += `<h${block.level}${id}>${inline(block.text, config)}</h${block.level}>\n`;
    } else if (block.type === "list") html += `${listHtml(block.items, config)}\n`;
    else if (block.type === "fence") html += `${renderFence(block, config, photos, faqHeading)}\n`;
  }
  flush();
  return html;
}

function assignIds(blocks, filename) {
  const used = new Set();
  const walk = (list) => {
    for (const block of list) {
      if (block.type === "h") {
        if (!block.id) block.id = block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
        if (used.has(block.id)) throw new Error(`${filename}: duplicate id ${block.id}`);
        used.add(block.id);
      }
    }
  };
  walk(blocks);
  return used;
}

function jsonLd(doc, config) {
  const path = doc.front.path;
  const origin = config.mode === "production" ? `https://${config.domain.hostname}` : "";
  const graph = [];
  const org = {
    "@type": "Organization",
    name: config.brand.publicName,
    description: "Independent referral service that publishes plumbing decision guides and connects callers with third-party licensed providers in Fullerton, CA. Not a plumbing contractor.",
  };
  if (origin) org.url = origin + "/";
  graph.push(org);
  if (path === "/") {
    const site = { "@type": "WebSite", name: config.brand.publicName, description: org.description };
    if (origin) site.url = origin + "/";
    graph.push(site);
  }
  if (doc.front.kind === "service") {
    graph.push({
      "@type": "Service",
      name: doc.front.h1,
      serviceType: "Referral introduction",
      provider: { "@type": "Organization", name: config.brand.publicName },
      description: doc.front.description,
    });
  }
  const crumbs = crumbFor(path, doc.front.crumb || doc.front.h1);
  if (crumbs.length) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map(([name, href], index) => {
        const item = { "@type": "ListItem", position: index + 1, name };
        if (origin) item.item = origin + href;
        return item;
      }),
    });
  }
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replaceAll("<", "\\u003c");
}

const REFERRAL_LINE = "Independent referral service. Calls connect to third-party providers; availability and pricing vary.";

function callControl(config, className) {
  if (canDial(config)) {
    const hours = config.hours?.verified ? `<p class="referral-line">${escapeHtml(config.hours.summary)} Pacific Time.</p>` : "";
    return `<a class="call-btn ${className}" href="tel:${escapeHtml(config.phone.e164)}">Call ${escapeHtml(config.phone.display)}</a>${hours}`;
  }
  return `<button type="button" class="call-btn is-pending ${className}" disabled aria-disabled="true">Phone setup pending</button>`;
}

function heroActions(config) {
  return `<div class="hero-actions">${callControl(config, "hero-call")}<p class="referral-line">${REFERRAL_LINE}</p></div>`;
}

function headerCall(config) {
  return callControl(config, "header-call-btn");
}

function stickyCall(config) {
  return `<div class="sticky-call">${callControl(config, "sticky-btn")}</div>`;
}

function desktopNavHtml(current, currentPath) {
  const link = ([name, href]) => `<a href="${escapeHtml(href)}"${href === currentPath ? ` aria-current="page"` : ""}>${escapeHtml(name)}</a>`;
  return `<nav class="desktop-nav" aria-label="Primary">${primaryNav.map(([name, href]) => {
    const currentAttr = href === current ? ` aria-current="page"` : "";
    if (href === "/services/") {
      return `<div class="nav-dropdown"><a href="/services/" class="nav-dropdown__trigger"${currentAttr}>${escapeHtml(name)} <span class="nav-caret" aria-hidden="true">▾</span></a><div class="nav-dropdown__menu"><a href="/services/" class="nav-dropdown__all">All Services</a>${services.map(link).join("")}</div></div>`;
    }
    if (href === "/areas/") {
      return `<div class="nav-dropdown"><a href="/areas/" class="nav-dropdown__trigger"${currentAttr}>${escapeHtml(name)} <span class="nav-caret" aria-hidden="true">▾</span></a><div class="nav-dropdown__menu nav-dropdown__menu--wide"><div class="nav-dropdown__group"><span class="nav-dropdown__label">Fullerton Districts</span>${districts.map(link).join("")}</div><div class="nav-dropdown__group"><span class="nav-dropdown__label">Nearby Cities</span>${cities.map(link).join("")}<a href="/areas/" class="nav-dropdown__all">All Coverage Areas</a></div></div></div>`;
    }
    return `<a href="${escapeHtml(href)}"${currentAttr}>${escapeHtml(name)}</a>`;
  }).join("")}</nav>`;
}

function mobileNavHtml(current, currentPath) {
  const link = ([name, href]) => `<a href="${escapeHtml(href)}"${href === currentPath ? ` aria-current="page"` : ""}>${escapeHtml(name)}</a>`;
  return `<nav aria-label="Primary mobile">${primaryNav.map(([name, href]) => {
    const currentAttr = href === current ? ` aria-current="page"` : "";
    if (href === "/services/") {
      return `<details class="mobile-sub"><summary>${escapeHtml(name)}</summary><div class="mobile-sub__links"><a href="/services/">All Services</a>${services.map(link).join("")}</div></details>`;
    }
    if (href === "/areas/") {
      return `<details class="mobile-sub"><summary>${escapeHtml(name)}</summary><div class="mobile-sub__links"><a href="/areas/">All Coverage Areas</a>${districts.map(link).join("")}${cities.map(link).join("")}</div></details>`;
    }
    return `<a href="${escapeHtml(href)}"${currentAttr}>${escapeHtml(name)}</a>`;
  }).join("")}</nav>`;
}

function subnav(path) {
  const items = sectionNav(path);
  if (!items.length) return "";
  const links = items.map(([name, href]) => `<li><a href="${escapeHtml(href)}"${href === path ? ` aria-current="page"` : ""}>${escapeHtml(name)}</a></li>`).join("");
  return `<ul class="subnav">${links}</ul>`;
}

function toc(blocks) {
  const heads = blocks.filter((block) => block.type === "h" && block.level === 2);
  if (heads.length < 4) return "";
  return `<nav class="toc" aria-label="On this page"><strong>On this page</strong><ol>${heads.map((head) => `<li><a href="#${head.id}">${escapeHtml(head.text)}</a></li>`).join("")}</ol></nav>`;
}

function splitIntro(blocks) {
  const intro = [];
  const rest = [];
  let started = false;
  for (const block of blocks) {
    const starts = block.type === "h" || (block.type === "fence" && ["faq", "sources", "related", "symptoms"].includes(block.fence));
    if (starts) started = true;
    (started ? rest : intro).push(block);
  }
  return { intro, rest };
}

export function renderDocument(doc, config, photos) {
  const front = doc.front;
  for (const key of ["path", "title", "h1", "description", "intent", "kind", "crumb"]) {
    if (!front[key]) throw new Error(`${doc.filename}: missing ${key}`);
  }
  assignIds(doc.blocks, doc.filename);
  const faqHeading = front.faqHeading || "Questions that change the next step";
  const { intro, rest } = splitIntro(doc.blocks);
  const lead = intro.find((block) => block.type === "p");
  const introRest = intro.filter((block) => block !== lead);
  const hero = front.hero ? renderPhoto({
    base: front.hero,
    alt: front.heroAlt,
    caption: front.heroCaption,
    kind: front.heroKind || "illustrative",
  }, photos, config, true) : "";
  const crumbs = crumbFor(front.path, front.crumb);
  const crumbHtml = crumbs.length ? `<ol class="crumbs">${crumbs.map(([name, href], index) => {
    const last = index === crumbs.length - 1;
    return `<li>${last ? escapeHtml(name) : `<a href="${escapeHtml(href)}">${escapeHtml(name)}</a>`}</li>`;
  }).join("")}</ol>` : "";
  const robots = config.mode === "production" ? "index, follow" : "noindex, nofollow, noarchive";
  const canonical = config.mode === "production" ? `<link rel="canonical" href="https://${escapeHtml(config.domain.hostname)}${escapeHtml(front.path)}">` : "";
  const ogUrl = config.mode === "production" ? `<meta property="og:url" content="https://${escapeHtml(config.domain.hostname)}${escapeHtml(front.path)}">` : "";
  const banner = "";
  const currentNav = primaryNav.find(([, href]) => front.path === href || (href !== "/" && front.path.startsWith(href)))?.[1] || "";
  const endBgSlug = pageEndBackgrounds[front.path];
  const endBgMeta = endBgSlug ? photos[endBgSlug] : null;
  const endBgStyle = endBgMeta ? ` style="--bg-img: url('/assets/photos/${endBgMeta.filename_1600}')"` : "";
  const article = `<article data-wordcount>
<section class="hero-band">
  <div class="wrap">
    <header class="page-head${hero ? " has-media" : ""}">
      <div>
        <h1>${escapeHtml(front.h1)}</h1>
        ${lead ? `<p class="lead">${inline(lead.text, config)}</p>` : ""}
        ${heroActions(config)}
      </div>
      ${hero}
    </header>
  </div>
</section>
<div class="content-band">
  <div class="wrap">
    ${renderFlow(introRest, config, photos, faqHeading)}
    ${toc(rest)}
    ${renderFlow(rest, config, photos, faqHeading, front.path)}
  </div>
</div>
<section class="page-end${endBgMeta ? " has-bg" : ""}"${endBgStyle}>
  <div class="wrap">
    <h2>Ask about this job by phone</h2>
    <p>Have your Fullerton address and a short description of the problem. The receiving contractor sets pricing and scheduling.</p>
    ${heroActions(config)}
  </div>
</section>
</article>`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(front.title)}</title>
  <meta name="description" content="${escapeHtml(front.description)}">
  <meta name="robots" content="${robots}">
  ${canonical}
  <meta property="og:title" content="${escapeHtml(front.title)}">
  <meta property="og:description" content="${escapeHtml(front.description)}">
  <meta property="og:type" content="website">
  ${ogUrl}
  <meta name="theme-color" content="#111317">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/site.css">
  <script type="application/ld+json">${jsonLd(doc, config)}</script>
</head>
<body>
  <a class="skip" href="#main">Skip to content</a>
  ${banner}
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="/">
        <img src="/assets/logo.png" alt="${escapeHtml(config.brand.publicName)}" width="872" height="181" class="brand-logo" decoding="async">
        <span class="sr-only">${escapeHtml(config.brand.publicName)}</span>
      </a>
      ${desktopNavHtml(currentNav, front.path)}
      <div class="header-call">${headerCall(config)}</div>
      <details class="mobile-nav">
        <summary>Menu</summary>
        ${mobileNavHtml(currentNav, front.path)}
      </details>
    </div>
  </header>
  <main id="main">
    ${article}
  </main>
  ${footer(config)}
  ${stickyCall(config)}
  <script src="/assets/site.js" defer></script>
</body>
</html>`;
  return html;
}

function footer(config) {
  const col = (title, items) => `<div><h2>${title}</h2><ul>${items.map(([name, href]) => `<li><a href="${href}">${escapeHtml(name)}</a></li>`).join("")}</ul></div>`;
  return `<footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <h2>${escapeHtml(config.brand.publicName)}</h2>
        <p>An independent referral service for plumbing questions in Fullerton and North Orange County. Not a plumbing contractor, and not a city department.</p>
      </div>
      ${col("Services", services)}
      ${col("Fullerton Areas", districts)}
      ${col("More", [["Nearby cities", "/areas/"], ["Guides", "/plumbing-guides/"], ["How referrals work", "/how-referrals-work/"], ["About", "/about/"], ["Contact", "/contact/"], ["Privacy", "/privacy/"]])}
    </div>
    <div class="wrap legal">
      <p>We are an independent referral service, not a plumbing contractor. Calls are introduced to third-party providers. Availability, pricing, contractor licensing (C-36), and service terms are determined by the provider. You contract with and pay that provider directly.</p>
      <p>© 2026 ${escapeHtml(config.brand.publicName)}. Original text and diagrams prepared for this site. Photographs retain their respective creative licenses. ${config.mode === "preview" ? "Setup note: this private preview has no live referral phone number, answering hours, legal operator name, or verified production domain." : `Operator: ${escapeHtml(config.brand.operatorLegalName)}.`} No customer reviews are displayed because none have been verified for an active provider.</p>
    </div>
  </footer>`;
}

export function faqStats(doc) {
  const stats = [];
  const walk = (blocks) => {
    for (const block of blocks) {
      if (block.type === "fence" && block.fence === "faq") {
        for (const faq of parseFaqs(block.raw)) stats.push({ q: faq.q, words: words(faq.a).length, answer: faq.a });
      }
    }
  };
  walk(doc.blocks);
  return stats;
}

export function collectParagraphs(doc, config) {
  const mode = config.mode === "production" ? "production" : "preview";
  const paras = [];
  const walk = (blocks) => {
    for (const block of blocks) {
      if (block.type === "p") paras.push(block.text);
      if (block.type === "fence" && ["context", "local", "conditional", "note"].includes(block.fence)) {
        const raw = block.raw.split("\n").filter((line) => !line.startsWith("Heading:")).join("\n");
        walk(parseBlocks(raw, doc.filename));
      }
      if (block.type === "fence" && block.fence === "takeaway") paras.push(block.raw);
      if (block.type === "fence" && block.fence === "if-preview" && mode === "preview") walk(parseBlocks(block.raw, doc.filename));
      if (block.type === "fence" && block.fence === "if-production" && mode === "production") walk(parseBlocks(block.raw, doc.filename));
      if (block.type === "fence" && block.fence === "faq") {
        for (const faq of parseFaqs(block.raw)) paras.push(faq.a);
      }
    }
  };
  walk(doc.blocks);
  return paras.map((text) => words(fillTokens(text, config)).join(" "));
}

export { paragraphHtml, services, districts, cities };

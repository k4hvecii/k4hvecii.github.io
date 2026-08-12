import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const errors = [];
const notes = [];

function fail(message) {
  errors.push(message);
}

function note(message) {
  notes.push(message);
}

function read(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf8");
}

function exists(relative) {
  return fs.existsSync(path.join(ROOT, relative));
}

function parseJson(relative) {
  try {
    return JSON.parse(read(relative));
  } catch (error) {
    fail(`${relative}: invalid JSON (${error.message})`);
    return null;
  }
}

function flatten(value, prefix = "", out = new Map()) {
  if (Array.isArray(value)) {
    out.set(prefix, "array");
    return out;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, out);
    }
    return out;
  }

  out.set(prefix, typeof value);
  return out;
}

function deepGet(value, key) {
  return key.split(".").reduce((current, part) => current?.[part], value);
}

const requiredFiles = [
  "index.html",
  "404.html",
  "offline.html",
  "service-worker.js",
  "site.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "assets/css/main.css",
  "assets/js/main.js",
  "assets/data/projects.json",
  "assets/data/socials.json",
  "assets/data/status.json",
  "assets/i18n/languages.json",
  "assets/i18n/tr.json",
  "assets/i18n/en.json",
  "assets/images/og-card.png",
];

for (const file of requiredFiles) {
  if (!exists(file)) fail(`Missing required file: ${file}`);
}

const languages = parseJson("assets/i18n/languages.json") || [];
const locales = new Map();

for (const language of languages.filter((item) => item.enabled !== false)) {
  const localePath = `assets/i18n/${language.code}.json`;
  if (!exists(localePath)) {
    fail(`Language ${language.code} is enabled but ${localePath} is missing`);
    continue;
  }
  locales.set(language.code, parseJson(localePath));
}

const localeEntries = [...locales.entries()].filter(([, value]) => value);
if (localeEntries.length >= 2) {
  const [baseCode, baseLocale] = localeEntries[0];
  const baseKeys = flatten(baseLocale);

  for (const [code, locale] of localeEntries.slice(1)) {
    const keys = flatten(locale);

    for (const [key, type] of baseKeys) {
      if (!keys.has(key)) fail(`${code}: missing translation key ${key}`);
      else if (keys.get(key) !== type) fail(`${code}: type mismatch for ${key}`);
    }

    for (const key of keys.keys()) {
      if (!baseKeys.has(key)) fail(`${code}: extra translation key ${key} not found in ${baseCode}`);
    }
  }
}

const projects = parseJson("assets/data/projects.json") || [];
const projectIds = new Set();
const projectNumbers = new Set();

for (const project of projects) {
  if (projectIds.has(project.id)) fail(`Duplicate project id: ${project.id}`);
  if (projectNumbers.has(project.number)) fail(`Duplicate project number: ${project.number}`);
  projectIds.add(project.id);
  projectNumbers.add(project.number);

  const translationKeys = [
    project.statusKey,
    project.descriptionKey,
    project.longDescriptionKey,
    project.featuresKey,
    project.visibilityKey,
    ...(project.facts || []).flatMap((fact) => [fact.labelKey, fact.valueKey]),
    ...(project.links || []).map((link) => link.labelKey),
  ].filter(Boolean);

  for (const [localeCode, locale] of localeEntries) {
    for (const key of translationKeys) {
      if (deepGet(locale, key) === undefined) {
        fail(`Project ${project.id}: ${localeCode} missing ${key}`);
      }
    }
  }
}

const status = parseJson("assets/data/status.json");
if (status) {
  for (const key of [status.labelKey, status.descriptionKey]) {
    for (const [localeCode, locale] of localeEntries) {
      if (deepGet(locale, key) === undefined) {
        fail(`Status: ${localeCode} missing ${key}`);
      }
    }
  }
}

const html = read("index.html");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const idSet = new Set();

for (const id of ids) {
  if (idSet.has(id)) fail(`Duplicate HTML id: ${id}`);
  idSet.add(id);
}

for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!idSet.has(match[1])) fail(`Broken internal anchor: #${match[1]}`);
}

for (const match of html.matchAll(/aria-controls="([^"]+)"/g)) {
  if (!idSet.has(match[1])) fail(`aria-controls points to missing id: ${match[1]}`);
}

const htmlAssetRegex = /(?:src|href)="(\.\/[^"#?]+)"/g;
for (const match of html.matchAll(htmlAssetRegex)) {
  const ref = match[1].replace(/^\.\//, "");
  if (!exists(ref)) fail(`index.html references missing file: ${ref}`);
}

function validateJsImports(relative) {
  const content = read(relative);
  const baseDir = path.dirname(relative);

  for (const match of content.matchAll(/(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']/g)) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) continue;

    const resolved = path.normalize(path.join(baseDir, specifier));
    if (!exists(resolved)) fail(`${relative}: missing JS import ${specifier}`);
  }
}

for (const file of fs.readdirSync(path.join(ROOT, "assets/js"), { recursive: true })) {
  const relative = path.join("assets/js", file.toString());
  if (relative.endsWith(".js") && fs.statSync(path.join(ROOT, relative)).isFile()) {
    validateJsImports(relative);
  }
}

for (const cssFile of fs.readdirSync(path.join(ROOT, "assets/css"))) {
  if (!cssFile.endsWith(".css")) continue;
  const relative = `assets/css/${cssFile}`;
  const content = read(relative);

  for (const match of content.matchAll(/@import\s+url\(["']([^"']+)["']\)/g)) {
    const resolved = path.normalize(path.join("assets/css", match[1]));
    if (!exists(resolved)) fail(`${relative}: missing CSS import ${match[1]}`);
  }
}

const sw = read("service-worker.js");
for (const match of sw.matchAll(/"\.\/([^"]+)"/g)) {
  const ref = match[1];
  if (!exists(ref)) fail(`service-worker.js caches missing file: ${ref}`);
}

note(`Validated ${requiredFiles.length} required files`);
note(`Validated ${localeEntries.length} locales`);
note(`Validated ${projects.length} projects`);
note(`Validated ${ids.length} HTML IDs`);

for (const message of notes) {
  console.log(`✓ ${message}`);
}

if (errors.length) {
  console.error("\nPortfolio validation failed:\n");
  for (const error of errors) console.error(`✗ ${error}`);
  process.exit(1);
}

console.log("\n✓ Portfolio validation passed");

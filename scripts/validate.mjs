import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "index.html", "404.html", "offline.html", "privacy.html", "terms.html",
  "service-worker.js", "site.webmanifest", "robots.txt", "sitemap.xml",
  "assets/css/main.css", "assets/css/404.css", "assets/css/legal.css",
  "assets/js/main.js", "assets/icons/favicon.svg", "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png", "assets/icons/icon-512.png", "assets/images/og-k4-terminal-31.png"
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Missing files:\n" + missing.map((file) => `- ${file}`).join("\n"));
  process.exit(1);
}

JSON.parse(fs.readFileSync(path.join(root, "site.webmanifest"), "utf8"));
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) {
  console.error("Duplicate ids: " + [...new Set(duplicates)].join(", "));
  process.exit(1);
}
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.includes(match[1])) {
    console.error(`Broken anchor: #${match[1]}`);
    process.exit(1);
  }
}
for (const ref of ["assets/css/main.css?v=3.1.0", "assets/js/main.js?v=3.1.0", "assets/images/og-k4-terminal-31.png"]) {
  if (!html.includes(ref)) {
    console.error(`Expected reference missing: ${ref}`);
    process.exit(1);
  }
}
console.log(`✓ ${required.length} required files`);
console.log(`✓ ${ids.length} unique HTML ids`);
console.log("✓ internal anchors and versioned assets");
console.log("✓ Coffee Terminal v3.1 validation passed");

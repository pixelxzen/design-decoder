import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRESETS } from "../scripts/presets.js";
import { buildDesignMd, buildTokensCss, buildTokensJson } from "../scripts/exporter.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

// 1. Manifest V3 & minimal permissions check
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ["activeTab", "scripting", "sidePanel", "storage"]);
assert.equal(manifest.host_permissions, undefined, "host_permissions must be omitted so activeTab is used");

// 2. Locales check
for (const locale of ["zh_CN", "en"]) {
  const msgFile = path.join(root, "_locales", locale, "messages.json");
  assert.ok(fs.existsSync(msgFile), `missing ${msgFile}`);
  const msgs = JSON.parse(fs.readFileSync(msgFile, "utf8"));
  assert.ok(msgs.extName?.message?.length > 0);
  assert.ok(msgs.extDesc?.message?.length > 0 && msgs.extDesc.message.length <= 132, `${locale} summary must be <= 132 chars`);
}

// 3. CSS motion tokens & reduced-motion guard check
const panelCss = fs.readFileSync(path.join(root, "styles/panel.css"), "utf8");
assert.ok(panelCss.includes(".t-tabs-pill"), "sliding tabs class present");
assert.ok(panelCss.includes(".t-icon-swap"), "icon swap class present");
assert.ok(panelCss.includes(".t-toast"), "toast class present");
assert.ok(panelCss.includes("prefers-reduced-motion: reduce"), "reduced-motion guard present");
assert.ok(panelCss.includes("tabular-nums"), "tabular-nums present");

// 4. Exporter verification
for (const [key, preset] of Object.entries(PRESETS)) {
  const md = buildDesignMd(preset);
  const css = buildTokensCss(preset);
  const jsonText = buildTokensJson(preset);
  assert.ok(md.includes(`# DESIGN.md — ${preset.domain}`), `MD header for ${key}`);
  assert.ok(css.includes(":root {"), `CSS root for ${key}`);
  const parsed = JSON.parse(jsonText);
  assert.equal(parsed.meta.domain, preset.domain);
}

console.log("✔ Design Decoder verification passed (manifest, locales, transitions.dev CSS, exporter).");

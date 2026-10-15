// In-page DOM & CSSOM telemetry probe + Interactive Precision HUD Inspector.
// Runs inside the target webpage when the user clicks the extension or toggles Inspect Mode.

export function decodePageDesignSystem() {
  const t0 = performance.now();
  const css = (el) => window.getComputedStyle(el);

  function parseRgb(str) {
    if (!str) return null;
    const m = str.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,/\s]+([\d.]+))?\s*\)/i);
    if (!m) return null;
    const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
    if (a < 0.08) return null;
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  }

  function rgbToHex([r, g, b]) {
    return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }

  function srgbToLinear(x) {
    const v = x / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function rgbToOklch([r, g, b]) {
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    const C = Math.sqrt(A * A + B * B);
    let H = (Math.atan2(B, A) * 180) / Math.PI;
    if (H < 0) H += 360;
    return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${C < 0.002 ? 0 : Math.round(H)})`;
  }

  function luminance([r, g, b]) {
    const [lr, lg, lb] = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  }

  function contrastRatio(rgb1, rgb2) {
    const l1 = luminance(rgb1);
    const l2 = luminance(rgb2);
    return +((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(1);
  }

  const varNames = new Set();
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule.style && /(^|,)\s*(:root|html|body)\b/.test(rule.selectorText || "")) {
          for (const prop of rule.style) {
            if (prop.startsWith("--")) varNames.add(prop);
          }
        }
      }
    } catch {}
  }
  const rootStyle = css(document.documentElement);
  const cssVars = [];
  for (const name of [...varNames].slice(0, 48)) {
    const val = rootStyle.getPropertyValue(name).trim();
    if (val && val.length < 120) cssVars.push({ name, value: val });
  }

  const bgArea = new Map();
  const textFreq = new Map();
  const borderFreq = new Map();
  const radiiMap = new Map();
  const shadowSet = new Set();
  const weightsSet = new Set();
  const fontFamilies = new Map();

  const allNodes = [...document.querySelectorAll("body *")].slice(0, 1800);
  let totalArea = 0;

  for (const el of allNodes) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    const st = css(el);
    if (st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0) continue;

    const area = Math.min(rect.width, window.innerWidth) * Math.min(rect.height, window.innerHeight * 2);
    const bgRgb = parseRgb(st.backgroundColor);
    if (bgRgb && area > 20) {
      const hex = rgbToHex(bgRgb);
      totalArea += area;
      const prev = bgArea.get(hex) || { rgb: bgRgb, area: 0 };
      prev.area += area;
      bgArea.set(hex, prev);
    }

    const txtRgb = parseRgb(st.color);
    if (txtRgb && el.childNodes.length) {
      const hex = rgbToHex(txtRgb);
      const prev = textFreq.get(hex) || { rgb: txtRgb, count: 0 };
      prev.count += 1;
      textFreq.set(hex, prev);
    }

    if (parseFloat(st.borderTopWidth) > 0) {
      const bRgb = parseRgb(st.borderTopColor);
      if (bRgb) {
        const hex = rgbToHex(bRgb);
        borderFreq.set(hex, { rgb: bRgb, count: (borderFreq.get(hex)?.count || 0) + 1 });
      }
    }

    const r = st.borderTopLeftRadius;
    if (r && r !== "0px") {
      radiiMap.set(r, (radiiMap.get(r) || 0) + 1);
    }

    if (st.boxShadow && st.boxShadow !== "none" && shadowSet.size < 4) {
      shadowSet.add(st.boxShadow);
    }

    const fw = parseInt(st.fontWeight, 10);
    if (fw) weightsSet.add(fw);
    const ff = (st.fontFamily || "").trim();
    if (ff) fontFamilies.set(ff, (fontFamilies.get(ff) || 0) + 1);
  }

  const bodyBg = parseRgb(css(document.body).backgroundColor) || parseRgb(rootStyle.backgroundColor) || [255, 255, 255];
  const bodyHex = rgbToHex(bodyBg);
  if (!bgArea.has(bodyHex)) {
    const vpArea = window.innerWidth * window.innerHeight;
    totalArea += vpArea;
    bgArea.set(bodyHex, { rgb: bodyBg, area: vpArea });
  }

  const sortedBgs = [...bgArea.entries()].sort((a, b) => b[1].area - a[1].area);
  const sortedTexts = [...textFreq.entries()].sort((a, b) => b[1].count - a[1].count);
  const sortedBorders = [...borderFreq.entries()].sort((a, b) => b[1].count - a[1].count);

  const primaryBgRgb = sortedBgs[0]?.[1]?.rgb || bodyBg;
  const palette = [];
  const seenHex = new Set();

  function pushColor(role, varName, hex, rgb, shareVal) {
    if (!hex || seenHex.has(hex)) return;
    seenHex.add(hex);
    const ratio = contrastRatio(rgb, primaryBgRgb);
    const grade = role.includes("Border") || role.includes("Ground") ? "BASE" : ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "UI";
    palette.push({
      role,
      varName,
      hex,
      oklch: rgbToOklch(rgb),
      share: +Math.max(1.2, Math.min(99, shareVal)).toFixed(1),
      contrast: ratio,
      grade
    });
  }

  if (sortedBgs[0]) pushColor("Ground / Paper", "--paper", sortedBgs[0][0], sortedBgs[0][1].rgb, (sortedBgs[0][1].area / Math.max(1, totalArea)) * 100);
  if (sortedBgs[1]) pushColor("Elevated Surface", "--surface", sortedBgs[1][0], sortedBgs[1][1].rgb, (sortedBgs[1][1].area / Math.max(1, totalArea)) * 100);
  if (sortedTexts[0]) pushColor("Primary Ink", "--ink", sortedTexts[0][0], sortedTexts[0][1].rgb, 11.4);
  if (sortedTexts[1]) pushColor("Muted Copy", "--muted", sortedTexts[1][0], sortedTexts[1][1].rgb, 6.2);
  if (sortedBgs[2]) pushColor("Brand / Accent", "--action", sortedBgs[2][0], sortedBgs[2][1].rgb, 4.1);
  if (sortedBorders[0]) pushColor("Hairline Border", "--line", sortedBorders[0][0], sortedBorders[0][1].rgb, 2.4);

  const sumShare = palette.reduce((acc, item) => acc + item.share, 0) || 100;
  palette.forEach((item) => { item.share = +((item.share / sumShare) * 100).toFixed(1); });

  const scaleRoles = [
    { role: "Display H1", sel: "h1" },
    { role: "Section H2", sel: "h2" },
    { role: "Subhead H3", sel: "h3" },
    { role: "Body Copy", sel: "p, li" },
    { role: "Code / Mono", sel: "code, pre, kbd" }
  ];
  const scale = [];
  for (const item of scaleRoles) {
    const el = document.querySelector(item.sel);
    if (!el) continue;
    const st = css(el);
    const fs = parseFloat(st.fontSize) || 16;
    const lh = parseFloat(st.lineHeight);
    scale.push({
      role: item.role,
      tag: el.tagName.toLowerCase(),
      size: st.fontSize,
      lineHeight: Number.isFinite(lh) ? (lh / fs).toFixed(2) : "1.45",
      tracking: st.letterSpacing === "normal" ? "0em" : st.letterSpacing,
      weight: parseInt(st.fontWeight, 10) || 400,
      sample: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 56) || item.role
    });
  }

  const topFont = [...fontFamilies.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || css(document.body).fontFamily;
  const radii = [...radiiMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([radius, count], idx) => ({
      label: ["Primary Container", "Control / Button", "Input / Chip", "Badge / Pill"][idx] || "Surface",
      radius,
      usage: `${count} elements`,
      count
    }));

  const assets = [];
  const iconLink = document.querySelector('link[rel*="icon"]');
  if (iconLink?.href) assets.push({ name: "Site Favicon", kind: "Icon Asset", dimensions: "32×32", detail: iconLink.href });
  const ogImg = document.querySelector('meta[property="og:image"]')?.content;
  if (ogImg) assets.push({ name: "OpenGraph Cover", kind: "OG Image", dimensions: "1200×630", detail: ogImg });
  const svgEl = document.querySelector("header svg, nav svg, a svg");
  if (svgEl) {
    const vb = svgEl.getAttribute("viewBox") || `${Math.round(svgEl.clientWidth || 24)}×${Math.round(svgEl.clientHeight || 24)}`;
    assets.push({ name: "Header Vector Logo", kind: "Inline SVG", dimensions: vb, detail: "Vector mark in header/nav" });
  }

  return {
    domain: location.hostname || "local-page",
    url: location.href,
    title: document.title || location.hostname || "Untitled Page",
    scannedNodes: allNodes.length,
    scanMs: Math.max(4, Math.round(performance.now() - t0)),
    palette,
    typography: {
      primaryFont: topFont,
      monoFont: 'ui-monospace, "SF Mono", "JetBrains Mono", monospace',
      weights: [...weightsSet].sort((a, b) => a - b).slice(0, 5),
      scale
    },
    radii: radii.length ? radii : [{ label: "Sharp Square", radius: "0px", usage: "Default", count: allNodes.length }],
    shadows: [...shadowSet].map((value, i) => ({ name: `Elevation ${i + 1}`, value })),
    cssVars: cssVars.length ? cssVars : palette.map((p) => ({ name: p.varName, value: p.hex })),
    assets
  };
}

export function togglePageElementInspector() {
  const ID = "__design_decoder_hud__";
  const existing = document.getElementById(ID);
  if (existing) {
    existing.remove();
    window.__designDecoderCleanup?.();
    return { active: false };
  }

  const host = document.createElement("div");
  host.id = ID;
  host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483646;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;";
  host.innerHTML = `
    <div id="__dd_box__" style="position:fixed;border:1.5px solid #5e6ad2;background:rgba(94,106,210,0.08);border-radius:4px;transition:all 60ms cubic-bezier(0.22,1,0.36,1);display:none;"></div>
    <div id="__dd_card__" style="position:fixed;background:#0b0c0e;color:#f2f3f5;border:1px solid #22242a;border-radius:8px;padding:8px 10px;font-size:11px;line-height:1.45;box-shadow:0 12px 32px rgba(0,0,0,0.45);display:none;min-width:220px;">
      <div id="__dd_tag__" style="font-family:ui-monospace,monospace;font-weight:600;color:#5e6ad2;margin-bottom:4px;"></div>
      <div id="__dd_rows__" style="font-family:ui-monospace,monospace;font-variant-numeric:tabular-nums;color:#8a8f98;display:grid;gap:2px;"></div>
    </div>
  `;
  document.documentElement.appendChild(host);

  const box = host.querySelector("#__dd_box__");
  const card = host.querySelector("#__dd_card__");
  const tagEl = host.querySelector("#__dd_tag__");
  const rowsEl = host.querySelector("#__dd_rows__");

  function onMove(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || host.contains(el)) return;
    const r = el.getBoundingClientRect();
    const st = window.getComputedStyle(el);
    box.style.display = "block";
    box.style.left = `${r.left}px`;
    box.style.top = `${r.top}px`;
    box.style.width = `${r.width}px`;
    box.style.height = `${r.height}px`;

    const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/)[0] : "";
    tagEl.textContent = `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : cls}  (${Math.round(r.width)}×${Math.round(r.height)})`;
    rowsEl.innerHTML = [
      `color: <span style="color:#f2f3f5">${st.color}</span>`,
      `bg: <span style="color:#f2f3f5">${st.backgroundColor}</span>`,
      `font: <span style="color:#f2f3f5">${st.fontSize} / ${st.fontWeight}</span>`,
      `radius: <span style="color:#f2f3f5">${st.borderRadius || "0px"}</span>`
    ].map((line) => `<div>${line}</div>`).join("");

    card.style.display = "block";
    const left = Math.min(window.innerWidth - 240, Math.max(12, r.left));
    const top = r.bottom + 10 + 110 < window.innerHeight ? r.bottom + 10 : Math.max(12, r.top - 105);
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  function onKey(e) {
    if (e.key === "Escape") togglePageElementInspector();
  }

  window.addEventListener("mousemove", onMove, true);
  window.addEventListener("keydown", onKey, true);
  window.__designDecoderCleanup = () => {
    window.removeEventListener("mousemove", onMove, true);
    window.removeEventListener("keydown", onKey, true);
  };
  return { active: true };
}

import { PRESETS } from "./presets.js";
import { decodePageDesignSystem, togglePageElementInspector } from "./decoder-probe.js";
import { buildDesignMd, buildTokensCss, buildTokensJson } from "./exporter.js";

const I18N = {
  zh: {
    subtitle: "实时计算样式解构",
    inspectBtn: "探针",
    copyMdBtn: "复制 MD",
    spectrumTitle: "面积加权色彩分布",
    nodesUnit: "节点",
    tabs: {
      palette: "色板",
      typography: "字体",
      tokens: "令牌",
      assets: "资产",
      export: "导出"
    },
    paletteHeader: "页面计算色板 (点击复制)",
    typeFamilyHeader: "主字体栈与激活字重",
    typeScaleHeader: "排版阶梯实测 (Type Scale)",
    radiiHeader: "圆角几何分布 (Concentric Radii)",
    varsHeader: "根级 CSS 变量 (:root)",
    varsFilterPlaceholder: "筛选 --token 变量名或色值…",
    assetsHeader: "品牌标识与媒体资产",
    exportHeader: "一键导出规范文档",
    copyAction: "复制内容",
    downloadAction: "下载文件",
    copiedToast: "已复制到剪贴板",
    hudOnToast: "页内十字探针已开启 (按 Esc 退出)",
    hudOffToast: "页内十字探针已关闭"
  },
  en: {
    subtitle: "Live Computed Design System",
    inspectBtn: "Inspect",
    copyMdBtn: "Copy MD",
    spectrumTitle: "Area-Weighted Spectrum",
    nodesUnit: "nodes",
    tabs: {
      palette: "Palette",
      typography: "Type",
      tokens: "Tokens",
      assets: "Assets",
      export: "Export"
    },
    paletteHeader: "Computed Palette (Click to copy)",
    typeFamilyHeader: "Font Stack & Active Weights",
    typeScaleHeader: "Measured Type Scale",
    radiiHeader: "Surface Geometry & Radii",
    varsHeader: "Root CSS Custom Properties",
    varsFilterPlaceholder: "Filter --token name or value…",
    assetsHeader: "Brand & Vector Assets",
    exportHeader: "Export Specification",
    copyAction: "Copy Code",
    downloadAction: "Download File",
    copiedToast: "Copied to clipboard",
    hudOnToast: "In-page HUD inspector active (Esc to exit)",
    hudOffToast: "In-page HUD inspector off"
  }
};

function detectLang() {
  const ui = (globalThis.chrome?.i18n?.getUILanguage?.() || navigator.language || "zh_CN").toLowerCase();
  return ui.startsWith("zh") ? "zh" : "en";
}

const state = {
  lang: detectLang(),
  presetKey: "linear.app",
  data: PRESETS["linear.app"],
  activeTab: "palette",
  colorFormat: "hex", // "hex" | "oklch"
  exportFormat: "md", // "md" | "css" | "json"
  varFilter: "",
  hudActive: false,
  theme: ""
};

// ── transitions.dev: 16-tabs-sliding orchestration ──
function movePillTo(tabEl, animate) {
  const bar = document.querySelector(".t-tabs");
  const pill = bar?.querySelector(".t-tabs-pill");
  if (!bar || !pill || !tabEl) return;
  if (!animate) {
    const prev = pill.style.transition;
    pill.style.transition = "none";
    pill.style.transform = `translateX(${tabEl.offsetLeft}px)`;
    pill.style.width = `${tabEl.offsetWidth}px`;
    void pill.offsetWidth;
    pill.style.transition = prev;
  } else {
    pill.style.transform = `translateX(${tabEl.offsetLeft}px)`;
    pill.style.width = `${tabEl.offsetWidth}px`;
  }
}

let toastTimer = null;
function showToast(message, detail = "") {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  const detEl = document.getElementById("toast-detail");
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  if (detEl) detEl.textContent = detail;
  toast.classList.add("is-open");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-open");
  }, 1800);
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
  const t = I18N[state.lang];
  showToast(t.copiedToast, label || text.slice(0, 28));
}

function renderStaticLabels() {
  const t = I18N[state.lang];
  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setTxt("target-subtitle", t.subtitle);
  setTxt("inspect-label", t.inspectBtn);
  setTxt("copy-md-label", t.copyMdBtn);
  setTxt("spectrum-title", t.spectrumTitle);
  setTxt("tab-palette", t.tabs.palette);
  setTxt("tab-typography", t.tabs.typography);
  setTxt("tab-tokens", t.tabs.tokens);
  setTxt("tab-assets", t.tabs.assets);
  setTxt("tab-export", t.tabs.export);
  setTxt("lbl-palette-head", t.paletteHeader);
  setTxt("lbl-type-family", t.typeFamilyHeader);
  setTxt("lbl-type-scale", t.typeScaleHeader);
  setTxt("lbl-radii-head", t.radiiHeader);
  setTxt("lbl-vars-head", t.varsHeader);
  setTxt("lbl-assets-head", t.assetsHeader);
  setTxt("lbl-export-head", t.exportHeader);
  setTxt("btn-export-copy-txt", t.copyAction);
  setTxt("btn-export-dl-txt", t.downloadAction);
  const filterInput = document.getElementById("var-filter");
  if (filterInput) filterInput.placeholder = t.varsFilterPlaceholder;
}

function renderData() {
  const d = state.data;
  const t = I18N[state.lang];

  // Site bar & Spectrum
  document.getElementById("site-domain").textContent = d.domain;
  document.getElementById("spectrum-stats").textContent = `${d.scannedNodes} ${t.nodesUnit} · ${d.scanMs}ms`;

  const barEl = document.getElementById("spectrum-bar");
  const legEl = document.getElementById("spectrum-legend");
  barEl.innerHTML = "";
  legEl.innerHTML = "";

  (d.palette || []).forEach((c) => {
    const seg = document.createElement("div");
    seg.className = "spectrum-seg";
    seg.style.width = `${c.share}%`;
    seg.style.backgroundColor = c.hex;
    seg.title = `${c.role}: ${c.hex} (${c.share}%)`;
    seg.addEventListener("click", () => copyText(state.colorFormat === "oklch" ? c.oklch : c.hex, `${c.role} (${c.hex})`));
    barEl.appendChild(seg);

    const chip = document.createElement("span");
    chip.className = "legend-chip";
    chip.innerHTML = `<span class="legend-dot" style="background:${c.hex}"></span><span>${c.hex}</span><span>${c.share}%</span>`;
    legEl.appendChild(chip);
  });

  // 1. Palette list
  const swatchList = document.getElementById("swatch-list");
  swatchList.innerHTML = "";
  (d.palette || []).forEach((c) => {
    const row = document.createElement("div");
    row.className = "swatch-row";
    const primaryCode = state.colorFormat === "oklch" ? c.oklch : c.hex;
    const secondaryCode = state.colorFormat === "oklch" ? c.hex : c.oklch;
    row.innerHTML = `
      <div class="swatch-chip" style="background:${c.hex}"></div>
      <div class="swatch-info">
        <div class="swatch-role-line">
          <span class="swatch-role">${c.role}</span>
          <span class="swatch-var">${c.varName}</span>
        </div>
        <div class="swatch-values">
          <span style="color:var(--ink);font-weight:500">${primaryCode}</span>
          <span>${secondaryCode}</span>
        </div>
      </div>
      <div class="swatch-right">
        <span class="swatch-share">${c.share}%</span>
        <span class="contrast-badge" data-grade="${c.grade}">${c.contrast}:1 ${c.grade}</span>
      </div>
    `;
    row.addEventListener("click", () => copyText(primaryCode, `${c.varName}: ${primaryCode}`));
    swatchList.appendChild(row);
  });

  // 2. Typography
  document.getElementById("primary-font-val").textContent = d.typography?.primaryFont || "system-ui";
  document.getElementById("mono-font-val").textContent = d.typography?.monoFont || "ui-monospace";
  const wp = document.getElementById("weight-pills");
  wp.innerHTML = (d.typography?.weights || [400, 500, 600])
    .map((w) => `<span class="weight-pill">w${w}</span>`)
    .join("");

  const scaleList = document.getElementById("type-scale-list");
  scaleList.innerHTML = "";
  (d.typography?.scale || []).forEach((s) => {
    const card = document.createElement("div");
    card.className = "type-card";
    const previewPx = Math.min(22, Math.max(12, parseInt(s.size, 10) || 15));
    card.innerHTML = `
      <div class="type-card-head">
        <span class="type-role-tag">${s.role} · &lt;${s.tag}&gt;</span>
        <span class="type-metrics">${s.size} / ${s.lineHeight} / ${s.tracking} · w${s.weight}</span>
      </div>
      <div class="type-specimen" style="font-size:${previewPx}px;font-weight:${s.weight <= 400 ? 400 : s.weight >= 600 ? 600 : 500}">${s.sample}</div>
    `;
    card.addEventListener("click", () =>
      copyText(`font-size: ${s.size}; line-height: ${s.lineHeight}; letter-spacing: ${s.tracking}; font-weight: ${s.weight};`, s.role)
    );
    scaleList.appendChild(card);
  });

  // 3. Tokens & Surface
  const radiiGrid = document.getElementById("radii-grid");
  radiiGrid.innerHTML = "";
  (d.radii || []).forEach((r) => {
    const card = document.createElement("div");
    card.className = "radius-card";
    const px = Math.min(14, parseInt(r.radius, 10) || 0);
    card.innerHTML = `
      <div class="radius-preview" style="border-radius:${px}px"></div>
      <div class="swatch-info">
        <span class="swatch-role">${r.label}</span>
        <span class="swatch-values"><span style="color:var(--ink);font-weight:500">${r.radius}</span> · ${r.usage}</span>
      </div>
    `;
    card.addEventListener("click", () => copyText(`border-radius: ${r.radius};`, r.label));
    radiiGrid.appendChild(card);
  });

  renderCssVars();

  // 4. Assets
  const assetsList = document.getElementById("assets-list");
  assetsList.innerHTML = "";
  (d.assets || []).forEach((a) => {
    const item = document.createElement("div");
    item.className = "asset-card";
    item.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        <div class="asset-thumb">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L7 20"/></svg>
        </div>
        <div class="swatch-info">
          <span class="swatch-role">${a.name}</span>
          <span class="swatch-values"><span>${a.kind}</span> · <span>${a.dimensions}</span></span>
        </div>
      </div>
      <button class="icon-btn" type="button">Copy</button>
    `;
    item.querySelector("button").addEventListener("click", () => copyText(a.detail || a.name, a.name));
    assetsList.appendChild(item);
  });

  // 5. Export preview
  renderExportPreview();
}

function renderCssVars() {
  const varsTable = document.getElementById("vars-table");
  if (!varsTable) return;
  const q = state.varFilter.trim().toLowerCase();
  const rows = (state.data.cssVars || []).filter(
    (v) => !q || v.name.toLowerCase().includes(q) || v.value.toLowerCase().includes(q)
  );
  varsTable.innerHTML = "";
  rows.forEach((v) => {
    const row = document.createElement("div");
    row.className = "var-row";
    const isHex = /^#[0-9a-f]{3,8}$/i.test(v.value);
    row.innerHTML = `
      <span class="var-name">${v.name}</span>
      <span class="var-val">
        ${isHex ? `<span class="legend-dot" style="background:${v.value}"></span>` : ""}
        <span>${v.value}</span>
      </span>
    `;
    row.addEventListener("click", () => copyText(`${v.name}: ${v.value};`, v.name));
    varsTable.appendChild(row);
  });
}

function getExportContent() {
  if (state.exportFormat === "css") return buildTokensCss(state.data);
  if (state.exportFormat === "json") return buildTokensJson(state.data);
  return buildDesignMd(state.data);
}

function renderExportPreview() {
  const pre = document.getElementById("export-preview");
  if (pre) pre.textContent = getExportContent();
}

function selectTab(tabKey, animate = true) {
  state.activeTab = tabKey;
  const tabs = [...document.querySelectorAll(".t-tab")];
  let activeEl = null;
  tabs.forEach((btn) => {
    const match = btn.dataset.tab === tabKey;
    btn.setAttribute("aria-selected", match ? "true" : "false");
    if (match) activeEl = btn;
  });
  if (activeEl) movePillTo(activeEl, animate);

  document.querySelectorAll(".view-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `panel-${tabKey}`);
  });
}

function selectPreset(key) {
  if (!PRESETS[key]) return;
  state.presetKey = key;
  state.data = PRESETS[key];
  const sel = document.getElementById("preset-select");
  if (sel) sel.value = key;
  renderData();
}

async function tryDecodeActiveTab() {
  try {
    if (!globalThis.chrome?.tabs?.query || !globalThis.chrome?.scripting?.executeScript) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url || !/^https?:/i.test(tab.url)) return;
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: decodePageDesignSystem
    });
    const liveData = results?.[0]?.result;
    if (liveData && liveData.palette && liveData.palette.length >= 2) {
      state.data = liveData;
      chrome.storage?.local?.set?.({ lastSnapshot: liveData });
      renderData();
    }
  } catch {
    // Restricted page or offline stub mode: keep preset data
  }
}

async function toggleInspector() {
  state.hudActive = !state.hudActive;
  const btn = document.getElementById("btn-inspect");
  const swap = document.getElementById("inspect-icon-swap");
  if (btn) btn.setAttribute("data-active", state.hudActive ? "true" : "false");
  if (swap) swap.setAttribute("data-state", state.hudActive ? "b" : "a");
  try {
    if (globalThis.chrome?.tabs?.query && globalThis.chrome?.scripting?.executeScript) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id && /^https?:/i.test(tab.url || "")) {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: togglePageElementInspector
        });
      }
    }
  } catch {}
  const t = I18N[state.lang];
  showToast(state.hudActive ? t.hudOnToast : t.hudOffToast);
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  state.theme = next;
  const swap = document.getElementById("theme-icon-swap");
  if (swap) swap.setAttribute("data-state", next === "dark" ? "b" : "a");
  globalThis.chrome?.storage?.local?.set?.({ theme: next });
}

function init() {
  renderStaticLabels();
  renderData();

  // Wire sliding tabs
  document.querySelectorAll(".t-tab").forEach((btn) => {
    btn.addEventListener("click", () => selectTab(btn.dataset.tab, true));
  });
  requestAnimationFrame(() => {
    const active = document.querySelector('.t-tab[aria-selected="true"]') || document.querySelector(".t-tab");
    movePillTo(active, false);
  });
  window.addEventListener("resize", () => {
    const active = document.querySelector('.t-tab[aria-selected="true"]') || document.querySelector(".t-tab");
    movePillTo(active, false);
  });

  // Wire preset selector
  document.getElementById("preset-select")?.addEventListener("change", (e) => {
    selectPreset(e.target.value);
  });

  // Wire HEX / OKLCH toggle
  document.querySelectorAll("[data-color-fmt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.colorFormat = btn.dataset.colorFmt;
      document.querySelectorAll("[data-color-fmt]").forEach((b) =>
        b.setAttribute("aria-pressed", b === btn ? "true" : "false")
      );
      renderData();
    });
  });

  // Wire Export format toggle
  document.querySelectorAll("[data-export-fmt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.exportFormat = btn.dataset.exportFmt;
      document.querySelectorAll("[data-export-fmt]").forEach((b) =>
        b.setAttribute("aria-pressed", b === btn ? "true" : "false")
      );
      renderExportPreview();
    });
  });

  // Wire CSS var filter
  document.getElementById("var-filter")?.addEventListener("input", (e) => {
    state.varFilter = e.target.value;
    renderCssVars();
  });

  // Wire top buttons
  document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);
  document.getElementById("btn-inspect")?.addEventListener("click", toggleInspector);
  document.getElementById("btn-copy-md")?.addEventListener("click", () => {
    const swap = document.getElementById("copy-md-swap");
    if (swap) {
      swap.setAttribute("data-state", "b");
      setTimeout(() => swap.setAttribute("data-state", "a"), 1400);
    }
    copyText(buildDesignMd(state.data), `DESIGN.md (${state.data.domain})`);
  });

  // Wire export panel buttons
  document.getElementById("btn-export-copy")?.addEventListener("click", () => {
    copyText(getExportContent(), `${state.data.domain} (${state.exportFormat.toUpperCase()})`);
  });
  document.getElementById("btn-export-dl")?.addEventListener("click", () => {
    const ext = state.exportFormat === "css" ? "tokens.css" : state.exportFormat === "json" ? "design-tokens.json" : "DESIGN.md";
    const blob = new Blob([getExportContent()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.data.domain.replace(/[^a-z0-9.-]/gi, "-")}-${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("已生成下载文件", a.download);
  });

  // Keyboard shortcuts 1-5 for tabs
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
    const map = { "1": "palette", "2": "typography", "3": "tokens", "4": "assets", "5": "export" };
    if (map[e.key]) selectTab(map[e.key], true);
  });

  tryDecodeActiveTab();
}

// Expose deterministic controller for automated store-screenshot scenarios (`shots.json`)
window.__DESIGN_DECODER__ = {
  selectTab: (tabKey) => selectTab(tabKey, false),
  selectPreset: (key) => selectPreset(key),
  setColorFormat: (fmt) => {
    state.colorFormat = fmt;
    document.querySelectorAll("[data-color-fmt]").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.colorFmt === fmt ? "true" : "false")
    );
    renderData();
  },
  setExportFormat: (fmt) => {
    state.exportFormat = fmt;
    document.querySelectorAll("[data-export-fmt]").forEach((b) =>
      b.setAttribute("aria-pressed", b.dataset.exportFmt === fmt ? "true" : "false")
    );
    renderExportPreview();
  },
  setLang: (lang) => {
    state.lang = lang === "en" ? "en" : "zh";
    renderStaticLabels();
    renderData();
    const active = document.querySelector('.t-tab[aria-selected="true"]') || document.querySelector(".t-tab");
    movePillTo(active, false);
  },
  triggerToast: (msg, detail) => showToast(msg, detail)
};

document.addEventListener("DOMContentLoaded", init);

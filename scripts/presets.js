// Built-in reference design benchmarks (used when comparing or when active tab is a restricted chrome:// URL)
export const PRESETS = {
  "linear.app": {
    domain: "linear.app",
    url: "https://linear.app/features",
    title: "Linear — Plan and build products",
    scannedNodes: 1420,
    scanMs: 38,
    palette: [
      { role: "Ground / Paper", varName: "--bg-primary", hex: "#08090a", oklch: "oklch(0.141 0.005 264)", share: 58.4, contrast: 19.2, grade: "AAA" },
      { role: "Elevated Surface", varName: "--bg-elevated", hex: "#121316", oklch: "oklch(0.186 0.008 264)", share: 21.6, contrast: 16.8, grade: "AAA" },
      { role: "Primary Ink", varName: "--text-primary", hex: "#f7f8f8", oklch: "oklch(0.978 0.002 247)", share: 8.5, contrast: 19.2, grade: "AAA" },
      { role: "Muted Telemetry", varName: "--text-tertiary", hex: "#8a8f98", oklch: "oklch(0.648 0.014 264)", share: 5.2, contrast: 6.1, grade: "AA" },
      { role: "Brand Accent", varName: "--accent-indigo", hex: "#5e6ad2", oklch: "oklch(0.562 0.164 274)", share: 3.8, contrast: 4.7, grade: "AA" },
      { role: "Hairline Border", varName: "--border-subtle", hex: "#222326", oklch: "oklch(0.256 0.006 264)", share: 2.5, contrast: 1.4, grade: "LINE" }
    ],
    typography: {
      primaryFont: 'InterVariable, "SF Pro Display", -apple-system, sans-serif',
      monoFont: '"Berkeley Mono", "JetBrains Mono", ui-monospace, monospace',
      weights: [400, 500, 600],
      scale: [
        { role: "Display H1", tag: "h1", size: "56px", lineHeight: "1.05", tracking: "-0.032em", weight: 600, sample: "Purpose-built for product development" },
        { role: "Section H2", tag: "h2", size: "32px", lineHeight: "1.15", tracking: "-0.022em", weight: 600, sample: "Designed for speed and precision" },
        { role: "Card Title H3", tag: "h3", size: "18px", lineHeight: "1.35", tracking: "-0.012em", weight: 500, sample: "Sub-millisecond keyboard navigation" },
        { role: "Body Copy", tag: "p", size: "15px", lineHeight: "1.60", tracking: "-0.005em", weight: 400, sample: "Linear streamlines issues, projects, and product roadmaps." },
        { role: "Telemetry Mono", tag: "code", size: "12px", lineHeight: "1.40", tracking: "0.01em", weight: 500, sample: "ENG-204 · 99.98% · 16.6ms" }
      ]
    },
    radii: [
      { label: "Panel / Card", radius: "8px", usage: "Containers & Modals", count: 84 },
      { label: "Control / Button", radius: "6px", usage: "Buttons & Inputs", count: 142 },
      { label: "Badge / Kbd", radius: "4px", usage: "Shortcut Keys & Tags", count: 96 },
      { label: "Status Pill", radius: "9999px", usage: "Cycle & Status Chips", count: 38 }
    ],
    shadows: [
      { name: "Hairline Specular", value: "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 2px rgba(0,0,0,0.4)" },
      { name: "Floating Command", value: "0 16px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)" }
    ],
    cssVars: [
      { name: "--bg-primary", value: "#08090a" },
      { name: "--bg-elevated", value: "#121316" },
      { name: "--text-primary", value: "#f7f8f8" },
      { name: "--text-tertiary", value: "#8a8f98" },
      { name: "--accent-indigo", value: "#5e6ad2" },
      { name: "--border-hairline", value: "rgba(255, 255, 255, 0.08)" },
      { name: "--radius-card", value: "8px" },
      { name: "--ease-out-expo", value: "cubic-bezier(0.22, 1, 0.36, 1)" }
    ],
    assets: [
      { name: "Linear Logomark", kind: "SVG Vector", dimensions: "24×24", detail: "Geometric diagonal eclipse" },
      { name: "OpenGraph Social Card", kind: "OG Image", dimensions: "1200×630", detail: "linear.app/og-home.png" },
      { name: "Shortcut Badge Set", kind: "UI Component", dimensions: "20×20", detail: "⌘K / C / V keycaps" }
    ]
  },
  "claude.ai": {
    domain: "claude.ai (CDS)",
    url: "https://claude.ai",
    title: "Claude Design System — Warm Humanist AI Interface",
    scannedNodes: 980,
    scanMs: 31,
    palette: [
      { role: "Warm Parchment", varName: "--cds-bg-base", hex: "#f5f5f3", oklch: "oklch(0.968 0.004 95)", share: 61.2, contrast: 16.4, grade: "AAA" },
      { role: "Composer Surface", varName: "--cds-surface", hex: "#ffffff", oklch: "oklch(1.000 0.000 0)", share: 22.0, contrast: 18.1, grade: "AAA" },
      { role: "Charcoal Ink", varName: "--cds-ink", hex: "#141413", oklch: "oklch(0.191 0.004 95)", share: 8.4, contrast: 16.4, grade: "AAA" },
      { role: "Stone Muted", varName: "--cds-muted", hex: "#6b6a65", oklch: "oklch(0.524 0.009 95)", share: 4.3, contrast: 5.2, grade: "AA" },
      { role: "Terracotta Clay", varName: "--cds-clay", hex: "#d97757", oklch: "oklch(0.668 0.142 38)", share: 2.6, contrast: 3.4, grade: "AA" },
      { role: "Hairline Ring", varName: "--cds-border", hex: "#e4e3de", oklch: "oklch(0.916 0.006 95)", share: 1.5, contrast: 1.2, grade: "LINE" }
    ],
    typography: {
      primaryFont: '"Tiempos Text", "Copernicus", Georgia, "Songti SC", serif',
      monoFont: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
      weights: [400, 500, 600],
      scale: [
        { role: "Editorial Greeting", tag: "h1", size: "36px", lineHeight: "1.18", tracking: "-0.018em", weight: 500, sample: "What can I help you refine today?" },
        { role: "Artifact Header", tag: "h2", size: "22px", lineHeight: "1.30", tracking: "-0.012em", weight: 600, sample: "Interactive Design System Specification" },
        { role: "Prose Message", tag: "p", size: "16px", lineHeight: "1.65", tracking: "0em", weight: 400, sample: "Single closed hairline ring with spring physics (stiffness 320, damping 28)." },
        { role: "Composer Pill", tag: "span", size: "13px", lineHeight: "1.40", tracking: "0em", weight: 500, sample: "Claude 4 Sonnet · Extended Thinking" }
      ]
    },
    radii: [
      { label: "Chat Composer", radius: "20px", usage: "Prompt Input Box", count: 4 },
      { label: "Message Bubble", radius: "18px", usage: "Conversation Turns", count: 28 },
      { label: "Artifact Panel", radius: "10px", usage: "Side Drawer & Cards", count: 46 },
      { label: "Action Button", radius: "8px", usage: "Toolbar Controls", count: 92 }
    ],
    shadows: [
      { name: "0.5px Hairline Ring", value: "0 0 0 0.5px rgba(20, 20, 19, 0.12), 0 4px 16px rgba(20, 20, 19, 0.04)" }
    ],
    cssVars: [
      { name: "--cds-clay", value: "#d97757" },
      { name: "--cds-bg-base", value: "#f5f5f3" },
      { name: "--cds-radius-composer", value: "20px" },
      { name: "--cds-spring-snappy", value: "320 / 28 / 1" },
      { name: "--cds-spring-bouncy", value: "600 / 30 / 1" }
    ],
    assets: [
      { name: "Claude Spark Mark", kind: "SVG Vector", dimensions: "24×24", detail: "Terracotta radial burst" },
      { name: "Artifact Code Badge", kind: "UI Component", dimensions: "32×32", detail: "Single-border container" }
    ]
  },
  "vercel.com": {
    domain: "vercel.com (Geist)",
    url: "https://vercel.com/design",
    title: "Geist Design System — Vercel Precision UI",
    scannedNodes: 1540,
    scanMs: 35,
    palette: [
      { role: "Geist Obsidian", varName: "--ds-background-100", hex: "#000000", oklch: "oklch(0.000 0.000 0)", share: 56.0, contrast: 21.0, grade: "AAA" },
      { role: "Geist Surface", varName: "--ds-background-200", hex: "#0a0a0a", oklch: "oklch(0.145 0.000 0)", share: 24.5, contrast: 19.4, grade: "AAA" },
      { role: "Geist Foreground", varName: "--ds-gray-1000", hex: "#ededed", oklch: "oklch(0.946 0.000 0)", share: 9.8, contrast: 18.1, grade: "AAA" },
      { role: "Secondary Gray", varName: "--ds-gray-900", hex: "#a1a1a1", oklch: "oklch(0.711 0.000 0)", share: 5.1, contrast: 8.2, grade: "AAA" },
      { role: "Geist Signal Blue", varName: "--ds-blue-700", hex: "#0070f3", oklch: "oklch(0.580 0.211 256)", share: 3.2, contrast: 4.6, grade: "AA" },
      { role: "Grid Hairline", varName: "--ds-gray-alpha-200", hex: "#1f1f1f", oklch: "oklch(0.239 0.000 0)", share: 1.4, contrast: 1.3, grade: "LINE" }
    ],
    typography: {
      primaryFont: '"Geist", "Inter", -apple-system, sans-serif',
      monoFont: '"Geist Mono", "SF Mono", ui-monospace, monospace',
      weights: [400, 500, 600],
      scale: [
        { role: "Hero Display", tag: "h1", size: "60px", lineHeight: "1.04", tracking: "-0.035em", weight: 600, sample: "Develop. Preview. Ship." },
        { role: "Section Header", tag: "h2", size: "32px", lineHeight: "1.20", tracking: "-0.02em", weight: 600, sample: "Geist Typography & Grid System" },
        { role: "Body Copy", tag: "p", size: "16px", lineHeight: "1.60", tracking: "0em", weight: 400, sample: "Engineered for swiss-grid precision, high contrast, and zero visual noise." }
      ]
    },
    radii: [
      { label: "Geist Card", radius: "8px", usage: "Grid Containers", count: 112 },
      { label: "Control Button", radius: "6px", usage: "Action Buttons", count: 64 }
    ],
    shadows: [
      { name: "Geist Border Ring", value: "0 0 0 1px rgba(255,255,255,0.14)" }
    ],
    cssVars: [
      { name: "--ds-background-100", value: "#000000" },
      { name: "--ds-gray-1000", value: "#ededed" },
      { name: "--ds-blue-700", value: "#0070f3" },
      { name: "--ds-radius", value: "6px" }
    ],
    assets: [
      { name: "Vercel Delta Mark", kind: "SVG Vector", dimensions: "24×24", detail: "Equilateral triangle logomark" }
    ]
  }
};

# DESIGN.md — Design Decoder（设计解构卡）

## Concept Card
- **Idea**: 把任意网页真实渲染后的计算样式（Computed Styles），解构为一张 Linear 级精密工程规格卡与可一键导出的 `DESIGN.md`。
- **Metaphor**: 精密光学分光仪 × Linear 工程遥测面板（Optical Spectrometer × Precision Telemetry HUD）。
- **Signature**: 面积加权色板条（Area-Weighted Spectrum Bar）+ `transitions.dev` 丝滑胶囊分段器（Sliding Pill Tabs）+ 网页内联十字准星实时取样 HUD。
- **Emotion**: 打开前 3 秒感受到「克制、锋利、零废话的专业仪器感」。
- **Motion verb**: Snap & Glide（`cubic-bezier(0.22, 1, 0.36, 1)` 平滑归位 + 按压 `scale(0.96)` 物理回弹）。
- **Screenshot**: 右侧 400px 精密侧边栏展示面积加权色板（HEX + OKLCH + WCAG 对比度）与排版阶梯，左侧宿主网页叠加实时元素探针 HUD。

## Palette (Role-Based Tokens)

| Role | Variable | Light Mode | Dark Mode | OKLCH (Light / Dark) |
|---|---|---|---|---|
| Ground / Paper | `--paper` | `#f8f9fb` | `#0b0c0e` | `oklch(0.982 0.003 264)` / `oklch(0.152 0.006 264)` |
| Surface Card | `--surface` | `#ffffff` | `#121317` | `oklch(1 0 0)` / `oklch(0.186 0.008 264)` |
| Primary Ink | `--ink` | `#111215` | `#f2f3f5` | `oklch(0.182 0.007 264)` / `oklch(0.962 0.003 264)` |
| Muted Text | `--muted` | `#636772` | `#8a8f98` | `oklch(0.514 0.016 264)` / `oklch(0.648 0.014 264)` |
| Hairline Border | `--line` | `#e3e5ea` | `#22242a` | `oklch(0.918 0.006 264)` / `oklch(0.258 0.011 264)` |
| Subtle Wash | `--wash` | `#f0f2f6` | `#181a20` | `oklch(0.958 0.005 264)` / `oklch(0.218 0.009 264)` |
| Primary Action | `--action` | `#5e6ad2` | `#5e6ad2` | `oklch(0.562 0.164 274)` |

## Typography & Hierarchy
- **UI Sans**: `-apple-system, BlinkMacSystemFont, "Inter", "PingFang SC", sans-serif`
- **Telemetry Mono**: `"SF Mono", "JetBrains Mono", ui-monospace, monospace`（全量启用 `font-variant-numeric: tabular-nums`）
- **Allowed Weights**: Strictly `400` (Regular), `500` (Medium), `600` (Semibold).
- **Concentric Geometry**: 外层卡片 `--radius: 8px`（内边距 `3px`），内嵌胶囊/色块 `5px`（严格满足 `outerRadius = innerRadius + padding`）。
- **Single Closed Hairline Ring**: 遵循 `open-claude-ui` 单闭合边框原则，容器仅保留一层 1px 结构细边，禁止多层套娃边框。

## Motion Choreography (`transitions.dev`)
1. **Sliding Pill Tabs (`16-tabs-sliding`)**: 顶部 5 栏导航胶囊（色板 / 字体 / 令牌 / 资产 / 导出）采用 JS 测量 `offsetLeft`/`offsetWidth` + CSS `cubic-bezier(0.22, 1, 0.36, 1)` 滑动，首帧 `transition: none` 瞬时落位。
2. **Icon Swap (`09-icon-swap`)**: 主题切换（日/夜）、页内探针开关、以及每一行令牌复制按钮（Copy ↔ Check）采用双图标同格 `blur(2px) + scale(0.25 -> 1)` 交叉淡入淡出。
3. **Toast Notification (`22-toast`)**: 底部状态回执采用非对称时钟（`350ms` 展开 / `250ms` 收起）。
4. **Reduced Motion Guard**: 全局保留 `@media (prefers-reduced-motion: reduce)` 归零守卫。

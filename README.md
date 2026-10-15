# 设计解构卡 · Design Decoder

**一键解构任意网页的真实渲染设计系统（Area-Weighted Palette · OKLCH · Type Scale · Root Tokens），直接导出 `DESIGN.md`。**

## 核心特性

1. **面积加权色彩系统（Area-Weighted Palette）**：基于 `getBoundingClientRect()` 与 `getComputedStyle()` 计算视口真实渲染像素面积权重，归纳背景纸色、卡片表面、主文字墨色、次要灰阶、品牌强调色与发丝边框，支持 **HEX / OKLCH** 切换与 **WCAG 2.1 对比度评级（AAA / AA）**。
2. **排版阶梯实测（Measured Typography Scale）**：提取主字体族、等宽字体族、激活字重（400/500/600）及 H1–H3、正文、代码块的字号、无单位行高、字距与真实文本样本。
3. **表面几何与根级变量（Concentric Radii & `:root` Tokens）**：统计同心圆角分布、阴影层级与 `:root` CSS 变量，支持实时过滤与单击复制。
4. **页内十字准星探针（In-Page HUD Reticle）**：开启后在宿主页面实时高亮悬停元素并浮层显示尺寸、色值、字重与圆角。
5. **一键导出 `DESIGN.md` / `tokens.css` / `JSON`**：直接生成可喂给 Claude Code、Hermes、Cursor 的结构化设计系统规范文档。

## 本地加载方式（Chrome / Edge）

1. 打开 `chrome://extensions`
2. 开启右上角「**开发者模式**」
3. 点击左上角「**加载已解压的扩展程序**」，选择本扩展解压目录。

## 开发与校验

```bash
npm run check
xxd-chrome-publish listing . --check
xxd-chrome-publish images .
xxd-chrome-publish pack .
```

MIT License

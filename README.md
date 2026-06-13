# deepseek-agent.com

一个介绍 **DeepSeek Agent（由 DeepSeek-V4 驱动）** 的艺术品级单页落地页：从加载 → 声呐 → 鲸鱼描边 → 逐字标题 → 滚动驱动的九段叙事，用 [anime.js v4](https://animejs.com) 编排一条从头到尾的完整开场动画。深海蓝图美学（abyssal blueprint），暗色暖蓝 + 青色声呐 + 红点签名。

## 运行（推荐用本地服务，别直接双击）

页面用 ES module 加载动画引擎，`file://` 直接打开会被浏览器 CORS 拦截（已有兜底会在 4s 后强制显示静态版，但拿不到动画）。请起一个静态服务：

```bash
pnpm install          # 仅测试需要
pnpm run serve        # → http://localhost:4173
# 或：npx serve . / uv run python -m http.server 4173
```

## 结构

```
index.html      # 结构：loader / nav / hero / 9 段 section / footer
styles.css      # 深海蓝图样式 + 设计 token + 响应式 + 动画显隐脚手架
app.js          # anime.js v4 开场时间线 + IntersectionObserver 滚动揭示 + 计数/打字/滑块/粒子
vendor/
  anime.esm.js  # 本地内置的 anime.js v4.4.1（离线可用，CDN 为兜底）
research/
  RESEARCH.md   # DeepSeek-V4 研究资料汇编（含数据出处与“厂商自报/需复核”标注）
tests/          # Playwright e2e（9 个用例，覆盖加载/计数/滚动揭示/导航/复制/滑块/打字）
serve.mjs       # 零依赖静态服务器（供 e2e 与本地预览）
```

## 设计与降级

- **配色**：`#070d1a` 深海近黑底、`#4d6bff` 品牌蓝、`#26f2d5` 声呐青、`#00ffaa` 暗流绿、`#ff4b4b` 红点签名。
- **字体**：Space Grotesk（展示）+ JetBrains Mono（代码/数值/蓝图标签），来自 Google Fonts，离线回退系统字体。
- **鲁棒降级**：若 anime.js 加载失败或 `prefers-reduced-motion`，页面切到 `.no-anim`，内容、数字滚动、数值条、滑块、复制等仍正常（计数用 rAF、条形用 CSS 过渡，均不依赖 anime）。

## 测试

```bash
pnpm exec playwright test                 # 全量
pnpm exec playwright test -g "screenshots" # 仅生成 tests/__screenshots__/{hero,full}.png
```

## 数据免责

页面数字取自 DeepSeek 官方文档 / GitHub / Hugging Face / 媒体（截至 2026-06）。**V4 多为预览版、厂商自报跑分**，请以官方控制台与自有 harness 为准。本页为独立致敬展示，与 DeepSeek 无隶属关系。

# 项目避坑规则（deepseek-agent.com）

> 本文件由 agent 在开发中沉淀，供后续 agent 复用，避免重蹈覆辙。

## 环境 / Bash
- **不要直接调用 `python` / `python3`**：本机有 hook 拦截并报 `always use uv`，整条命令会失败。需要 Python 时用 `uv run ...`；起静态服务优先用 `node serve.mjs` 或 `npx serve`。
- 沙箱内的**无头浏览器没有外网**：加载 `https://cdn.jsdelivr.net`、Google Fonts 等会 `net::ERR_NETWORK_ACCESS_DENIED`。但 **Bash 本身可以联网**（`curl` 能下载），所以依赖要**本地 vendored**（见 `vendor/anime.esm.js`），CDN 只作兜底。

## anime.js v4（重要）
- **时间线相对位置字符串 `'-=N'` / `'+=N'` 在本 bundle 里不会按预期重叠**，会退化成顺序排队，导致开场动画被拉长到 ~11s。
  → 用 **绝对延时**：`animate(el,{ ..., delay: N })`，逐字交错用 `delay: stagger(18, { start: N })`。本项目 `app.js` 的 `heroStart()` 即此写法，整段开场压缩到 ~3.4s。
- v4 回调名是 `onBegin/onUpdate/onComplete`（不是 v3 的 `begin/update/complete`）；缓动参数名是 `ease`（不是 `easing`）。
- `svg.createDrawable(sel)` 返回数组，配合 `draw: ['0 0','0 1']` 做描边动画；`createSpring({stiffness,damping})` 可直接传给 `ease`。
- 动 `.sonar` 这类 CSS 里带 `transform: translate(-50%,-50%)` 的元素时，**只动 `opacity`**，否则 anime 会覆盖 transform 导致定位错乱。

## 显隐脚手架 / 降级
- 预隐藏内容的 `.anim` 只在「支持 ES module」时由 head 内联脚本添加；并配 **4s 安全定时器**：若 `app.js` 未打上 `booted` 标记就强制 `.no-anim` 显示内容。否则 `file://` 直开（module 被 CORS 拦）会永久空白。
- 计数用 rAF、数值条用 CSS `transition: width`，**都不依赖 anime**，保证降级时仍有数字滚动与条形填充。

## Playwright e2e
- **点击很薄（如 8px 高）的元素时，裸 `page.mouse.click(x,y)` 打在极边缘（如 +4px）会丢事件**（hit-test 落空，handler 收不到）。
  → 用 `locator.click({ position:{x,y} })` 在元素内部定位点击；并给可交互元素加扩展点击区（本项目 `.effort-track::before { inset:-16px 0 }`）。
- 滑块等交互同时绑 `pointer*` 与 `click` 兜底，对「只发鼠标事件」的环境也鲁棒。
- loader 是否消失用 `toBeHidden()` 断言（看 visibility），比 `toHaveClass(/done/)` 稳。
- 断言要选「无论 anime 是否加载都成立」的行为（内容可见、计数、滚动揭示），因为 CI/沙箱可能无外网。

## 交互改动后
- 按全局规范：**改交互细节必须补对应 e2e**（`tests/home.spec.mjs`）。改完跑 `pnpm exec playwright test`。

## 部署 GitHub Pages（本网络环境关键）
- **`git push` 到 github.com 会被重置/连不上**（`Recv failure: Connection was reset` / `Couldn't connect to github.com:443`），但 **`api.github.com` 可通**（`gh api` 正常）。
  → 用 **Git Data API 推送**：`node push.mjs`（blobs→tree→commit→ref，走 api.github.com）。本仓库已带该脚本（已 gitignore）。
- **空仓库**直接调 Git Data API 建 blob 会 `409 Git Repository is empty`。
  → 先用 **Contents API**（`PUT .../contents/.nojekyll`）引导一次初始提交，再走 Git Data API。push.mjs 已自动处理。
- **`gh api` 端点别带前导 `/`**：MSYS 会把 `/repos/...` 误转成 `C:/Program Files/Git/repos/...`。写成 `gh api repos/owner/repo/...`，并加 `MSYS_NO_PATHCONV=1`。
- 启用 Pages：`echo '{"source":{"branch":"main","path":"/"}}' | MSYS_NO_PATHCONV=1 gh api --method POST repos/OWNER/REPO/pages --input -`。仓库根放 `.nojekyll` 跳过 Jekyll。
- **WebSearch/WebFetch 抓不了 github.com / raw.githubusercontent.com**（返回 "Unable to verify if domain is safe"）。读仓库内容用 `gh api repos/OWNER/REPO/contents/PATH --jq .content | base64 -d`；查 star/列表用 `gh api orgs/OWNER/repos`。
- 站点地址：`https://redreamality.com/deepseek-agent/`（账号绑定了自定义域 redreamality.com）。

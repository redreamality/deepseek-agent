# DeepSeek Agent / DeepSeek-V4 — 研究资料汇编

> 采集日期：2026-06-12 ｜ 来源：官方 api-docs.deepseek.com、GitHub deepseek-ai、Hugging Face、arXiv，及 TechCrunch/VentureBeat/Wikipedia 等。
> ⚠️ V4 的多数跑分为**厂商自报 / 预览版**，缺独立标准化复现（Scale SEAL 暂无 V4 条目）。首页引用均按"vendor-reported / preview"标注，已验证基线请用 V3.2。

## 一句话定位
DeepSeek Agent = 运行在 **DeepSeek-V4** 上的自主推理智能体：会规划、调用工具、做深度研究、跨多步执行，并在百万 token 上下文中保持完整任务记忆。

## DeepSeek-V4（2026-04-24 预览版发布，MIT 开源）
- **V4-Pro**：1.6T 总参数 / 49B 激活（MoE），33T tokens 预训练，权重约 865GB。
- **V4-Flash**：284B 总参数 / 13B 激活，权重约 160GB。
- **上下文 1,000,000 token（默认）**，最大输出 384K token。
- 架构：MoE + 混合稀疏注意力 **CSA + HCA**；1M 上下文下单 token 推理 FLOPs 降至 V3.2 的 **27%**、KV cache 降至 **10%**。
- 原生 agentic：Function Calling（单次最多 **128** 个函数 + 并行调用）、strict JSON-schema 校验、`reasoning_effort`（high/max）、跨 **100+ 轮**工具调用保持完整推理历史。
- 跑分（厂商自报）：SWE-bench Verified **80.6%**（开源权重最高，平 Gemini 3.1 Pro）、LiveCodeBench **93.5%**、Codeforces **3206**（约人类前 25）、MMLU-Pro 87.5、GPQA Diamond 90.1、BrowseComp 83.4、MCPAtlas 73.6、Terminal-Bench 2.0 67.9。

## API
- OpenAI 兼容：`base_url = https://api.deepseek.com`；另有 Anthropic 兼容端点 `/anthropic`。
- 模型名：`deepseek-v4-pro` / `deepseek-v4-flash`；旧别名 `deepseek-chat`/`deepseek-reasoner` 于 **2026-07-24 15:59 UTC** 弃用（透明路由到 V4-Flash）。
- 硬盘上下文缓存默认开启，缓存命中按约 **1/10** 输入价计费；128K prompt 首 token 延迟 13s → ~0.5s。
- 开箱即用作为 Claude Code / OpenCode / OpenClaw 后端。

## 定价（USD / 百万 token，官方）
| 模型 | 输入(未命中) | 缓存命中 | 输出 |
|---|---|---|---|
| V4-Flash | $0.14 | $0.0028 | $0.28 |
| V4-Pro | $0.435 | $0.003625 | $0.87 |

对比 GPT-4o 约 $2.5/$10、Claude 约 $3/$15（旗舰输出 $25–30）→ 约 **10–35×** 更便宜。新账户赠 **500 万**免费 token，无需信用卡。

## 公司 & 影响
- 杭州深度求索，幻方量化（High-Flyer）孵化，2023-07-17 独立；创始人 CEO 梁文锋；研究优先、坚持 MIT 开源；团队约 150–200 人。
- 时间线：V2(2024-05) → V3(2024-12, 671B/37B) → R1(2025-01-20) → V3.1 → V3.2-Exp(DSA 稀疏注意力) → V3.2(2025-12) → **V4(2026-04-24)**。
- R1 发布致英伟达单日市值蒸发约 $589B；App 曾登顶全球 51 国 App Store 免费榜第一。
- V4-Pro Hugging Face 近一月下载约 338 万（单一来源，谨慎引用）。

## ⚠️ 不确定 / 需谨慎
- V4 多数 benchmark 厂商自报、预览阶段，建议自行用 harness 复核；V4-Flash 参数各来源不一（158B vs 284B vs 292B-Base）。
- 不存在独立品牌"DeepSeek Agent"产品；最接近的是官方 App 的 Expert Mode + Search/Code Agent，及 `deepseek-ai/awesome-deepseek-agent` 生态。
- 价格/上下文随版本与渠道变动，以官方控制台为准。

---

## 附录 · GitHub 生态（star 经 GitHub API 实测，2026-06-13）

> ⚠️ 官方文档站与 github.com 在采集环境被网络策略拦截；star 数通过 `gh api` / GitHub REST API 实时获取，非二手文章。star 随时间变动。

### 官方 `deepseek-ai`（34 个公开仓库，组织关注者 ~93k）
| repo | ~star | 说明 |
|---|---|---|
| DeepSeek-V3 | 104k | 671B MoE 旗舰基座（组织最高） |
| DeepSeek-R1 | 92k | 开源强推理（RL） |
| awesome-deepseek-integration | 38k | 集成总入口 |
| DeepSeek-Coder | 24k | 一代代码模型 |
| DeepSeek-OCR | 23k | 上下文光学压缩 |
| Janus | 18k | 统一多模态理解+生成 |
| FlashMLA | 13k | MLA 推理 kernel（开源周） |
| 3FS | 10k | 高性能分布式文件系统 |
| DeepEP | 9.7k | 专家并行（EP）通信库 |
| open-infra-index | 8k | 开源周索引 |
| DeepGEMM | 7.4k | FP8 GEMM kernel |
| DeepSeek-Coder-V2 | 6.8k | MoE 代码模型 |
| Engram | 4.4k | 条件记忆（2026 新作） |
| awesome-deepseek-agent | 3.6k | agent 接入指南（每日活跃） |
| DeepSeek-V3.2-Exp | 1.6k | DSA 稀疏注意力（**最新开源架构 repo**） |
| DeepSeek-Prover-V2 | 1.3k | Lean4 形式化证明，子目标分解=长程规划 |

**注：组织下无独立 `DeepSeek-V4` 权重 repo——V4 仅作为线上服务/API 模型存在。**

### 社区 agent / 框架（接 DeepSeek）
| repo | ~star | 与 DeepSeek 的关系 |
|---|---|---|
| sst/opencode | 174k | OpenAI 兼容，填 DeepSeek base_url+key |
| ollama/ollama | 174k | `ollama pull deepseek-*` 本地跑 |
| langgenius/dify | 145k | provider 接 DeepSeek |
| langchain | 139k | `langchain-deepseek` 集成包 |
| ChatGPTNextWeb/NextChat | 88k | 内置 DeepSeek 配置 |
| vllm | 83k | V4 Day-0 支持 |
| infiniflow/ragflow | 83k | 原生 V4 + MCP + agent memory |
| lobe-chat | 79k | DeepSeek 一等 provider |
| All-Hands-AI/OpenHands | 77k | DeepSeek 低成本后端 |
| OpenInterpreter/open-interpreter | 64k | 为 DeepSeek 等开放模型而造 |
| cline/cline | 63k | 内置 DeepSeek provider |
| llama_index | 50k | `llama-index-llms-deepseek` |
| block/goose | 49k | 任意 LLM，配 DeepSeek 端点 |
| aider-ai/aider | 46k | 原生 `deepseek/deepseek-chat` |
| **Hmbown/DeepSeek-TUI** | **38k** | 「DeepSeek 版 Claude Code」，2026-05 Trending #1 |
| musistudio/claude-code-router | 35k | 把 Claude Code 路由到 DeepSeek |
| continuedev/continue | 34k | 原生 deepseek provider + FIM |
| sgl-project/sglang | 29k | V4 Day-0，MoE ~3× vLLM |
| Fosowl/agenticSeek | 27k | 全本地 DeepSeek-R1 自治 agent |
| RooCodeInc/Roo-Code | 24k | DeepSeek provider |
| **esengine/DeepSeek-Reasonix** | **22k** | DeepSeek 原生终端 agent，prefix-cache 稳定性 |
| Kilo-Org/kilocode | 20k | OpenAI 兼容接 DeepSeek |

### MCP × DeepSeek（star 普遍偏低）
- `DMontgomery40/deepseek-mcp-server`（~341）— 把 DeepSeek V4 暴露为 MCP
- `LSTM-Kirigaya/openmcp-client` — 一体化 MCP 插件（VS Code/Cursor/Trae）
- 实践更常见：**通用 MCP server + 把上层 agent 的模型换成 DeepSeek**，而非专用 MCP 仓库。

### 官方精选清单收录（节选）
- **awesome-deepseek-agent**（22 项）：DeepSeek-TUI、Deep Code(`lessweb/deepcode-cli`)、Reasonix、Claude Code、OpenCode、OpenClaw、Crush、Codex、Copilot CLI、Cline、Qwen Code、Pi、Cherry Studio、AstrBot、LobeHub 等。
- **awesome-deepseek-integration**（~38k）：smolagents、RAGFlow、DB-GPT、Continue、Cline、OpenMCP、LiteLLM、Eino、BotSharp、agentUniverse、Youtu-Agent、DeepSearcher、KAG 等框架/RAG/IDE/MCP 集成。

### 集成方式（官方）
- 切后端到 DeepSeek（最干净）：`ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic` + `ANTHROPIC_MODEL=deepseek-v4-pro[1m]`（Claude Code / OpenCode / OpenClaw 等）。
- OpenAI 兼容：`base_url=https://api.deepseek.com`，模型名 `deepseek-v4-pro` / `deepseek-v4-flash`。

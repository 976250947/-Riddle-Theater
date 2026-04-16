# 谜语剧场

谜语剧场是一个 Web 端剧情交互游戏平台原型，当前版本已经从最早的静态概念稿演进为“多剧本内容包 + 前端叙事引擎 + 本地 Node API + 可选 LLM 互动”的可运行项目。

## 当前状态

截至 2026 年 4 月，仓库内已经完成的核心范围包括：

- 多剧本入口：内置 5 个故事包，支持首页推荐、剧本库筛选、详情页与进入设置。
- 剧情引擎：支持 stage / scene 驱动、固定选项推进、动态扩展操作、结局判定与结局图鉴。
- 互动模式：支持固定选项、自由行动、自由探索、NPC 对话，并通过 sceneCard / visualState / forbiddenReveals 约束 LLM 输出边界。
- 演出体验：支持 VN 式逐句播放、打字机效果、对话历史回看、背景切换、结局回顾与关键节点回溯。
- 数据能力：支持自动存档、6 个本地存档位、游客 / 注册登录、本地文件型“云存档”接口。
- 平台页面：已包含图鉴、排行榜、社区、创作工坊、个人中心等页面原型。

当前项目已经不是单页剧情 Demo，但也还不是生产级平台。社区、榜单、创作工坊、个人中心等页面目前以展示型原型和本地模拟数据为主。

## 已实现模块

### 1. 平台层

- 首页 / 推荐位
- 剧本库筛选与搜索
- 剧本详情与进入设置
- 剧情图鉴 / 分支总览
- 排行榜页
- 社区页
- 创作工坊页
- 个人中心页

### 2. 剧情层

- 多剧本 story pack 配置
- 场景目标、风险、视觉状态、角色话题配置
- 固定剧情推进与多结局判定
- 结局回顾与未解锁结局提示
- 检查点回滚

### 3. 互动层

- 固定选项
- 半开放扩展操作
- 自由探索
- NPC 多轮对话
- 自由输入兜底
- LLM 启用 / 关闭切换

### 4. 数据与接口层

- 本地 localStorage 会话存档
- 6 格存档位
- 注册、登录、游客登录
- 基于 data/users.json 和 data/saves/ 的本地文件型 API
- OpenAI 兼容 LLM 直连配置
- 后端 LLM 代理接口预留

## 当前内容规模

当前内置故事包：

- 雾城谜影 mistycity
- 校园恋歌 campuslove
- 董事会博弈 boardroom
- 赛博潜行 cyberpunk
- 听晚 tingwan

其中《听晚》已接入前四章内容，共 13 个 scene，并已补充 sceneCard、visualState、角色话题、线索、结局与素材规划文档。

## 技术栈与实现方式

- 前端：原生 JavaScript ES Modules
- 样式：多份 CSS 分层组织，含 refactor 与 UX 强化样式
- 服务端：Node.js 原生 http 模块
- 数据存储：JSON 文件 + localStorage
- 测试：Node 脚本测试

项目没有使用 React / Vue / Vite；当前形态更适合课程项目、比赛原型、作品集展示与后续快速迭代。

## 目录结构

```text
ai_game/
├─ public/
│  └─ index.html
├─ src/
│  ├─ app.js
│  ├─ assets/
│  ├─ config/
│  │  ├─ constants.js
│  │  ├─ llm-config.js
│  │  ├─ story-display.js
│  │  ├─ story-packs.js
│  │  └─ stories/
│  ├─ core/
│  │  ├─ api-client.js
│  │  ├─ llm-client.js
│  │  ├─ llm-narrator.js
│  │  ├─ perform-controller.js
│  │  ├─ story-engine.js
│  │  ├─ story-storage.js
│  │  └─ utils.js
│  ├─ styles/
│  │  ├─ base.css
│  │  ├─ refactor.css
│  │  ├─ site-pages.css
│  │  └─ ux-pro.css
│  └─ ui/
│     ├─ animations.js
│     ├─ dom.js
│     ├─ icons.js
│     ├─ llm-settings.js
│     ├─ site-pages.js
│     └─ story-renderers.js
├─ scripts/
│  ├─ api.js
│  ├─ server.js
│  ├─ test-runner.js
│  └─ test.js
├─ docs/
│  ├─ project/
│  └─ stories/
├─ references/
│  └─ design/
├─ tools/
│  └─ skills/
├─ archive/
│  └─ legacy-src/
├─ data/
│  ├─ users.json
│  └─ saves/
├─ package.json
└─ README.md
```

## 目录说明

- src：当前运行中的前端源码。
- src/styles：集中管理样式文件，避免样式散落在 src 根目录。
- docs/project：项目文档、PRD、玩法说明等正式说明文档。
- docs/stories：按剧本整理的原始设定、素材脚本等内容文档。
- references/design：设计参考稿和视觉草图，不参与运行。
- tools/skills：设计辅助 skill 文件与相关资源。
- archive/legacy-src：旧版原型代码归档，仅作历史参考，不参与当前运行。

## 本地运行

安装依赖后直接启动：

```bash
npm start
```

默认访问地址：

```text
http://localhost:4173
```

运行核心测试：

```bash
npm test
```

## 本地 API

当前内置的 Node API 由 scripts/api.js 提供，主要包含：

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/guest
- GET /api/auth/me
- GET /api/saves
- POST /api/saves
- DELETE /api/saves/:slotId
- POST /api/llm/chat

## 文档索引

- 项目现状与技术结构：docs/project/项目文档_谜语剧场剧情交互游戏平台.md
- 目标产品需求：docs/project/需求文档_PRD_谜语剧场剧情交互游戏平台.md
- 玩法与 LLM 协作模式：docs/project/平台游戏操作模式说明_谜语剧场_LLM版.md
- 《听晚》素材生成脚本：docs/stories/tingwan/听晚_NanoBanana_素材脚本与提示词.md

## 当前限制

- 排行榜、社区、创作工坊、个人中心目前仍以展示型原型和本地数据为主。
- 没有接入真实数据库、对象存储和生产级账号体系。
- LLM 直连模式下，配置保存在浏览器本地，仅适合开发和演示环境。
- 美术、角色立绘、音效资源仍在补充阶段，当前以文本和界面原型为主。

## 适用场景

这个仓库当前适合用于：

- 课程设计 / 比赛展示
- 互动叙事产品原型
- 剧情引擎与内容配置实验
- LLM 受控叙事交互研究
- 前端作品集与平台化 Demo

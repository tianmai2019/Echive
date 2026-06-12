# Echive MVP 执行计划

## 1. MVP 核心目标

Echive 第一阶段只验证一个核心闭环：

> 想法输入 → AI 澄清 → 任务拆解 → 素材沉淀 → 草稿生成

MVP 不追求功能完整，而是优先证明：

1. 用户能快速记录一个模糊想法。
2. AI 能把想法整理成标题、摘要、澄清问题、下一步行动。
3. 系统能基于想法生成任务。
4. 用户能补充素材。
5. 系统能基于想法和素材生成内容草稿。

---

## 2. MVP 范围边界

### 2.1 本期做

- 单用户、自用优先
- 桌面 Web 优先
- Idea 创建、列表、详情
- AI 标题、摘要、澄清问题
- Project 创建与 Idea 关联
- Task 自动生成与状态管理
- Material 创建、关联与状态管理
- Draft 生成与编辑
- Home 总览页

### 2.2 本期不做

- 多用户团队协作
- 复杂权限系统
- 自动发布
- 高级 Agent 编排
- 完整知识图谱
- 实时协作
- 支付系统
- 移动端深度适配

---

## 3. 推荐技术假设

| 层级 | 技术 |
|---|---|
| Web 框架 | Next.js App Router |
| 语言 | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| AI | 先封装 LLM Provider，具体供应商可替换 |
| 认证 | MVP 可暂不做，使用固定 demo user |

### 3.1 重要建议

- 使用 `projectStart/4. Echive 的 Prisma Schema 第二版.md` 作为数据模型起点。
- `Conversation`、`Message`、`AIActionLog` 建议保留，因为 AI 产品需要可追溯。
- `PublishRecord` 可以先建表，但暂不做页面和 API。
- MVP 阶段保留 `User` 表，但先使用固定 demo user，避免认证拖慢进度。

---

## 4. 里程碑规划

## Milestone 1：Foundation

### 目标

项目能跑起来，数据库能连通，基础结构稳定。

### 任务

- [ ] 初始化 Next.js + TypeScript
- [ ] 配置 Tailwind CSS
- [ ] 配置 shadcn/ui
- [ ] 配置 ESLint / Prettier
- [ ] 初始化 Prisma
- [ ] 使用第二版 Prisma Schema
- [ ] 配置 PostgreSQL
- [ ] 创建初始 migration
- [ ] 封装 Prisma Client
- [ ] 建立基础 layout
- [ ] 建立左侧主导航
- [ ] 建立统一 API response helper
- [ ] 编写 seed 数据

### 交付物

- 可启动的 Web 项目
- 可迁移的数据库 schema
- 基础页面框架

---

## Milestone 2：Idea Flow

### 目标

完成想法输入和 AI 澄清。

### 任务

- [ ] Inbox 页面
- [ ] Quick Capture 输入框
- [ ] Idea 列表
- [ ] Idea 状态筛选
- [ ] Idea 详情页
- [ ] `POST /api/ideas`
- [ ] `GET /api/ideas`
- [ ] `GET /api/ideas/:id`
- [ ] `PATCH /api/ideas/:id`
- [ ] LLM Provider 封装
- [ ] AI 生成标题
- [ ] AI 生成摘要
- [ ] AI 生成澄清问题
- [ ] AI 生成 nextAction
- [ ] `POST /api/ideas/:id/clarify`
- [ ] 保存 Conversation / Message
- [ ] 保存 AIActionLog

### 交付物

- 用户可以输入一个想法
- 系统可以生成标题、摘要、澄清问题和下一步行动
- Idea 状态可以从 `CAPTURED` 变为 `CLARIFIED`

---

## Milestone 3：Planning

### 目标

把 Idea 转为 Project 和 Task。

### 任务

- [ ] Projects 页面
- [ ] Project 创建 / 编辑
- [ ] Project 详情页
- [ ] Project 聚合 Ideas / Tasks
- [ ] `POST /api/projects`
- [ ] `GET /api/projects`
- [ ] `GET /api/projects/:id`
- [ ] `PATCH /api/projects/:id`
- [ ] Idea 关联 Project
- [ ] AI 生成 Task 建议
- [ ] `POST /api/ideas/:id/tasks/generate`
- [ ] 保存 Task
- [ ] Tasks 页面
- [ ] Task 状态更新
- [ ] Task 优先级设置
- [ ] Today / This Week 视图

### 交付物

- 一个 Idea 能被放入 Project
- 一个 Idea 能生成多个 Task
- 用户能管理任务状态

---

## Milestone 4：Vault

### 目标

实现素材沉淀。

### 任务

- [ ] Vault 页面
- [ ] Material 创建表单
- [ ] Material 类型选择
- [ ] Material 列表
- [ ] Material 状态切换
- [ ] Material 关联 Idea
- [ ] Material 关联 Project
- [ ] `POST /api/materials`
- [ ] `GET /api/materials`
- [ ] `PATCH /api/materials/:id`
- [ ] 简单搜索
- [ ] 标签系统轻量版

### 交付物

- 用户能添加素材
- 素材能关联到 Idea / Project
- 素材能被后续 Draft 使用

---

## Milestone 5：Studio

### 目标

基于 Idea + Material 生成草稿。

### 任务

- [ ] Studio 页面
- [ ] Draft 列表
- [ ] Draft 生成面板
- [ ] 选择来源 Idea
- [ ] 选择关联 Materials
- [ ] 选择输出格式：Blog / Weibo / Vlog / Script
- [ ] AI 生成 outline
- [ ] AI 生成 content
- [ ] `POST /api/drafts/generate`
- [ ] `GET /api/drafts`
- [ ] `GET /api/drafts/:id`
- [ ] `PATCH /api/drafts/:id`
- [ ] Draft 编辑区
- [ ] Draft 状态更新
- [ ] DraftMaterial 关联保存

### 交付物

- 用户能基于一个 Idea 和若干素材生成草稿
- 草稿可编辑、可保存

---

## Milestone 6：Home & Polish

### 目标

把系统变成可用工作台。

### 任务

- [ ] Home Quick Capture
- [ ] 今日任务卡片
- [ ] 最近想法
- [ ] 待澄清事项
- [ ] 最近草稿
- [ ] 全局搜索入口
- [ ] Toast 反馈
- [ ] Loading 状态
- [ ] Empty 状态
- [ ] Error 状态
- [ ] 完整闭环演示测试

### 交付物

- 用户进入首页即可看到当前工作流状态
- MVP 能完整演示

---

## 5. 推荐执行顺序

```text
Foundation
  ↓
Idea Flow
  ↓
Planning
  ↓
Vault
  ↓
Studio
  ↓
Home & Polish
```

说明：

- Planning 和 Vault 在 Idea Flow 完成后可以部分并行。
- 单人开发时建议仍然顺序推进，避免上下文切换。
- 每个 Milestone 完成后都应保证项目可运行、可演示。

---

## 6. 第一批可执行任务

建议从 `Milestone 1：Foundation` 开始。

### 6.1 项目初始化

- [ ] 创建 Next.js + TypeScript 项目
- [ ] 安装 Tailwind CSS
- [ ] 安装和初始化 shadcn/ui
- [ ] 安装 Prisma
- [ ] 配置 PostgreSQL 连接
- [ ] 落地 Prisma Schema 第二版
- [ ] 创建 `.env.example`
- [ ] 创建 Prisma Client 单例
- [ ] 创建基础 layout
- [ ] 创建左侧导航
- [ ] 添加基础 README
- [ ] 推送初始化代码到 GitHub 和 Gitee

---

## 7. 第一周建议安排

### Day 1：项目基础

- [ ] 初始化 Next.js
- [ ] 配置 TypeScript / Tailwind
- [ ] 配置 ESLint / Prettier
- [ ] 安装 Prisma
- [ ] 添加 `.env.example`

### Day 2：数据库

- [ ] 写入第二版 schema
- [ ] 创建 migration
- [ ] 创建 seed
- [ ] 封装 db client
- [ ] 验证数据库连接

### Day 3：布局

- [ ] 建立 App Router 页面结构
- [ ] 左侧导航
- [ ] Home / Inbox / Projects / Tasks / Vault / Studio 空页面
- [ ] 基础 UI 组件

### Day 4：Idea API

- [ ] `POST /api/ideas`
- [ ] `GET /api/ideas`
- [ ] `GET /api/ideas/:id`
- [ ] `PATCH /api/ideas/:id`
- [ ] 基础测试

### Day 5：Inbox UI

- [ ] 输入框
- [ ] Idea 列表
- [ ] 状态筛选
- [ ] Idea 详情入口

### Day 6：AI Provider

- [ ] 封装 LLM Provider
- [ ] 标题生成
- [ ] 摘要生成
- [ ] 澄清问题生成
- [ ] AIActionLog 保存

### Day 7：闭环小验收

- [ ] 输入一个想法
- [ ] 生成标题、摘要、澄清问题
- [ ] 保存澄清结果
- [ ] 修复阻塞问题
- [ ] 更新 README

---

## 8. 关键风险与缓解

### 8.1 AI 输出不稳定

缓解：

- 所有 AI 输出使用结构化 JSON
- 使用 schema 校验结果
- 失败时返回清晰错误
- AI 输出必须允许用户编辑

### 8.2 MVP 范围膨胀

缓解：

- 先只做端到端闭环
- 标签、搜索、发布记录可以后置
- 不提前做复杂 Agent 编排

### 8.3 数据模型过早复杂

缓解：

- 第二版 schema 可以保留完整结构
- UI/API 只实现 P0
- PublishRecord 暂不开发页面

### 8.4 认证拖慢进度

缓解：

- MVP 先使用固定 demo user
- 保留 User 表
- 后续再接 Auth.js

---

## 9. 建议的开发工作流

每个功能按以下流程推进：

1. 明确功能验收标准。
2. 先写测试或最小验证脚本。
3. 实现最小功能。
4. 运行测试、类型检查、构建。
5. 进行代码审查。
6. 修复高优先级问题。
7. 推送到 GitHub 和 Gitee。

---

## 10. 下一步

下一步建议直接开始：

> 初始化 Next.js + TypeScript + Tailwind + Prisma，并把第二版 Prisma Schema 落地。

实施前需要确认：

- PostgreSQL 使用本地 Docker、已有数据库，还是远程数据库？
- AI Provider 使用哪一家？
- MVP 是否先跳过认证，使用固定 demo user？

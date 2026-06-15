# Echive 第二周 Planning 执行计划

## 1. 阶段定位

第二周进入 `Milestone 3：Planning`，目标是把第一周已经完成的 Idea Flow 向下推进一层：

> 已澄清 Idea → Project → Task → 可执行计划

第一周已经完成：

- Foundation 基础工程、数据库 schema、seed、App Shell。
- Inbox / Quick Capture / Idea 列表 / Idea 详情页。
- Idea API：`POST /api/ideas`、`GET /api/ideas`、`GET /api/ideas/:id`、`PATCH /api/ideas/:id`。
- 本地规则型 LLM Provider：标题、摘要、澄清问题、nextAction。
- `POST /api/ideas/:id/clarify`。
- Conversation / Message / AIActionLog 澄清记录保存。
- Idea 状态从 `CAPTURED` 到 `CLARIFIED` 的闭环验证。

第二周不扩展到 Vault / Studio，不提前做素材沉淀和草稿生成。只聚焦 Planning 闭环。

---

## 2. 第二周核心目标

### 2.1 产品目标

让用户能把一个已经澄清的想法变成可执行任务集合：

1. 用户可以创建 Project。
2. 用户可以把 Idea 关联到 Project。
3. 系统可以基于 Idea 生成 Task 建议。
4. 用户可以查看、筛选、更新 Task。
5. Idea 可以从 `CLARIFIED` 推进到 `PLANNED`。

### 2.2 技术目标

1. 建立 Project 数据访问层、API 与 UI。
2. 建立 Task 数据访问层、API 与 UI。
3. 增加本地规则型 Task Generator。
4. 沿用第一周已建立的 demo user、api-response、AIActionLog 模式。
5. 保持每个阶段都可运行、可验证、可演示。

---

## 3. 范围边界

### 3.1 本阶段做

- Project 列表、创建、详情、更新。
- Project 与 Idea / Task 的聚合展示。
- Idea 关联 Project。
- 基于 Idea 生成 Task 建议并保存。
- Task 列表、状态更新、优先级设置。
- Today / This Week 任务视图。
- Planning 闭环验收。

### 3.2 本阶段不做

- 多用户认证和权限系统。
- 真实外部 LLM 接入。
- 复杂 Agent 编排。
- Project 高级看板。
- Task 拖拽排序。
- 通知提醒。
- Material / Vault。
- Draft / Studio。
- 自动发布。

---

## 4. 复用现有基础

### 4.1 数据模型

复用当前 Prisma schema 中已有模型：

- `Project`
  - `title`
  - `description`
  - `goal`
  - `status`: `ACTIVE` / `PAUSED` / `DONE` / `ARCHIVED`
  - 关联：`ideas`、`tasks`、`materials`、`drafts`

- `Task`
  - `title`
  - `description`
  - `status`: `TODO` / `DOING` / `BLOCKED` / `DONE`
  - `priority`: `LOW` / `MEDIUM` / `HIGH`
  - `dueDate`
  - 关联：`project`、`idea`

- `Idea`
  - 第二周重点使用 `projectId` 和 `status`
  - 目标状态推进：`CLARIFIED` → `PLANNED`

- `AIActionLog`
  - Task 生成时记录 `GENERATE_TASKS`

### 4.2 既有代码模式

第二周实现应延续第一周模式：

- `src/lib/db.ts`：Prisma Client 单例。
- `src/lib/demo-user.ts`：固定 demo user。
- `src/lib/api-response.ts`：统一 API 响应格式。
- `src/lib/ideas.ts`：数据访问层风格参考。
- `src/lib/ai/idea-clarifier.ts`：本地规则型 AI Provider 风格参考。
- `src/app/api/ideas/**`：API route 风格参考。
- `src/app/inbox/**`：页面与交互风格参考。

---

## 5. 第二周按天拆解

## Day 8：Project API 基础

### 目标

建立 Project 的服务层和 API，确保前端可以创建、读取、更新 Project。

### 任务

- [x] 创建 `src/lib/projects.ts`。
- [x] 定义 Project 创建输入类型。
- [x] 定义 Project 更新输入类型。
- [x] 实现 `createProject`。
- [x] 实现 `listProjects`，支持按 `status` 筛选。
- [x] 实现 `getProjectById`，包含关联 Ideas / Tasks。
- [x] 实现 `updateProject`。
- [x] 新增 `POST /api/projects`。
- [x] 新增 `GET /api/projects`。
- [x] 新增 `GET /api/projects/:id`。
- [x] 新增 `PATCH /api/projects/:id`。
- [x] 增加 Project 相关单元测试或最小验证脚本。

### 验收标准

- [x] 可以通过 API 创建 Project。
- [x] 可以通过 API 获取 Project 列表。
- [x] 可以通过 API 获取 Project 详情和关联数据。
- [x] 可以通过 API 更新 Project。
- [x] 非法 status / 空标题有明确错误响应。

---

## Day 9：Project UI

### 目标

把 Projects 占位页替换为可用的 Project 管理页面。

### 任务

- [x] 实现 `/projects` 页面 Project 列表。
- [x] 创建 Project 创建表单组件。
- [x] 创建 Project 卡片或列表项组件。
- [x] 创建 Project 状态 Badge。
- [x] 实现 `/projects/[id]` Project 详情页。
- [x] 在 Project 详情页展示基础信息、关联 Ideas、关联 Tasks。
- [x] 增加空状态、加载状态、错误状态。

### 验收标准

- [x] 用户可以在 UI 中创建 Project。
- [x] 用户可以看到 Project 列表。
- [x] 用户可以进入 Project 详情页。
- [x] Project 详情页能展示关联 Ideas / Tasks 的占位或真实数据。

---

## Day 10：Idea 关联 Project + Task Generator

### 目标

让已澄清 Idea 可以被放入 Project，并生成 Task 建议。

### 任务

- [x] 在 Idea 详情页增加 Project 关联入口。
- [x] 支持选择已有 Project。
- [x] 支持从 Idea 快速创建 Project。
- [x] 更新 `updateIdea`，允许设置 `projectId`。
- [x] 创建 `src/lib/ai/task-generator.ts`。
- [x] 定义 `TaskSuggestion`、`TaskGenerationResult`、`TaskGenerator` 类型。
- [x] 实现本地规则型 Task Generator。
- [x] 新增 `POST /api/ideas/:id/tasks/generate`。
- [x] 生成 Task 后保存到数据库。
- [x] 保存 `AIActionLog`，类型为 `GENERATE_TASKS`。

### 建议的 Task Generator 输出

本地规则型生成 3-5 个任务：

1. 明确目标与验收标准，优先级 `HIGH`。
2. 收集必要素材，优先级 `MEDIUM`。
3. 拆解最小可行版本，优先级 `HIGH`。
4. 完成第一轮验证，优先级 `HIGH`。
5. 复盘并沉淀记录，优先级 `LOW`。

### 验收标准

- [x] Idea 可以关联到 Project。
- [x] 已澄清 Idea 可以生成多个 Task。
- [x] 生成结果写入 `Task` 表。
- [x] 生成过程写入 `AIActionLog`。
- [x] 用户可以在 Project 详情页或 Tasks 页面看到生成任务。

---

## Day 11：Tasks API 基础

### 目标

建立 Task 的服务层和 API，支持列表、筛选和更新。

### 任务

- [x] 创建 `src/lib/tasks.ts`。
- [x] 定义 Task 查询参数类型。
- [x] 定义 Task 更新输入类型。
- [x] 实现 `listTasks`。
- [x] 支持按 `status` 筛选。
- [x] 支持按 `priority` 筛选。
- [x] 支持按 `projectId` 筛选。
- [x] 支持 Today 过滤。
- [x] 支持 This Week 过滤。
- [x] 实现 `updateTask`。
- [x] 新增 `GET /api/tasks`。
- [x] 新增 `PATCH /api/tasks/:id`。
- [x] 增加 Task 相关单元测试或最小验证脚本。

### 验收标准

- [x] 可以通过 API 获取 Task 列表。
- [x] 可以按状态、优先级、Project 筛选 Task。
- [x] 可以更新 Task 状态。
- [x] 可以更新 Task 优先级。
- [x] 可以更新 Task dueDate。

---

## Day 12：Tasks UI - 列表与管理

### 目标

把 Tasks 占位页替换成可管理任务的页面。

### 任务

- [x] 实现 `/tasks` 页面。
- [x] 创建 Task 卡片或列表项组件。
- [x] 展示任务标题、描述、状态、优先级、截止日期。
- [x] 实现状态切换：`TODO` → `DOING` → `BLOCKED` → `DONE`。
- [x] 实现优先级切换。
- [x] 实现基础排序：优先级 → dueDate → 创建时间。
- [x] 增加空状态、错误状态。

### 验收标准

- [x] 用户可以看到所有任务。
- [x] 用户可以切换任务状态。
- [x] 用户可以调整任务优先级。
- [x] 任务列表排序稳定、可理解。

---

## Day 13：Tasks UI - 视图与过滤器

### 目标

让任务页面能支持简单执行视图，帮助用户知道今天和本周要做什么。

### 任务

- [x] 增加 Today 视图。
- [x] 增加 This Week 视图。
- [x] 增加状态筛选。
- [x] 增加优先级筛选。
- [x] 增加 Project 筛选。
- [x] 增加 URL search params，同步当前筛选状态。
- [ ] 可选：增加简单 Task 详情区域。

### 验收标准

- [x] 用户可以切换 All / Today / This Week。
- [x] 用户可以通过 URL 分享当前筛选视图。
- [x] 筛选条件组合后结果正确。
- [x] 无任务时显示清晰空状态。

---

## Day 14：Planning 闭环验收

### 目标

验证第二周完整闭环，确保系统从 Idea 澄清推进到可执行任务。

### 任务

- [x] 端到端手动验证：创建 Idea。
- [x] 澄清 Idea。
- [x] 创建或选择 Project。
- [x] 将 Idea 关联到 Project。
- [x] 从 Idea 生成 Task。
- [x] 更新 Idea 状态为 `PLANNED`。
- [x] 在 Tasks 页面查看并更新任务状态。
- [x] 在 Project 详情页查看关联 Ideas / Tasks。
- [x] 修复阻塞问题。
- [x] 更新 `README.md` 当前已完成部分。
- [x] 更新 `plan/Echive MVP 执行计划.md` Milestone 3 状态。
- [x] 运行质量检查。
- [ ] 推送到 GitHub 和 Gitee。

### 验收标准

- [x] 一个 Idea 可以从 `CAPTURED` → `CLARIFIED` → `PLANNED`。
- [x] 一个 Project 可以聚合 Idea 和 Task。
- [x] 一个 Idea 可以生成 3-5 个 Task。
- [x] 用户可以管理任务状态。
- [x] `pnpm lint` 通过。
- [x] `pnpm typecheck` 通过。
- [x] `pnpm test` 通过。
- [x] `pnpm prisma:validate` 通过。
- [x] `pnpm build` 通过。

---

## 6. 推荐实现顺序

```text
Project API
  ↓
Project UI
  ↓
Idea 关联 Project
  ↓
Task Generator
  ↓
Tasks API
  ↓
Tasks UI
  ↓
Today / This Week
  ↓
Planning 闭环验收
```

说明：

- Project API 和 Task Generator 不要并行推进，先确保 Project 基础可用。
- Task UI 不要早于 Tasks API。
- Today / This Week 是第二周后半段能力，不要抢在 Task 状态更新前做。
- 每天结束后都更新本计划和主执行计划中的任务状态。

---

## 7. 测试与验证策略

### 7.1 单元测试

优先覆盖：

- Project 创建输入校验。
- Project 状态筛选。
- Task 查询过滤。
- Task 状态更新。
- Task Generator 输出结构。
- API response helper 复用不回归。

### 7.2 集成验证

至少手动或脚本验证：

1. 创建 Project。
2. 创建 Idea 并澄清。
3. 关联 Idea 到 Project。
4. 生成 Task。
5. 查询 Tasks。
6. 更新 Task 状态。

### 7.3 页面验证

至少验证：

- `/projects`
- `/projects/[id]`
- `/inbox/[id]`
- `/tasks`

### 7.4 每日质量检查

每天结束前至少运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
```

Day 14 必须额外运行：

```bash
pnpm build
```

---

## 8. 环境要求

当前公司电脑不依赖本地 Docker。开发前先启动 Aliyun dev PostgreSQL SSH tunnel：

```powershell
ssh -o ExitOnForwardFailure=yes -N -L 5433:127.0.0.1:5432 aliyun-dev
```

本机 `.env` 应指向：

```text
127.0.0.1:5433 / echive_dev_remote / echive_dev
```

验证命令：

```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 5433
pnpm prisma migrate status
```

不要在这台电脑上把本地 Docker 作为默认数据库依赖。

---

## 9. 风险与缓解

### 9.1 Planning 范围膨胀

风险：Project、Task、视图筛选容易扩展成复杂项目管理系统。

缓解：

- 不做拖拽看板。
- 不做复杂依赖关系。
- 不做提醒通知。
- 只实现从 Idea 到 Task 的最小闭环。

### 9.2 Task Generator 输出质量不足

风险：本地规则型生成的任务可能不够智能。

缓解：

- 先保证结构稳定。
- 输出允许用户后续编辑。
- 记录 `AIActionLog`，后续替换真实 LLM 时可追踪。

### 9.3 UI 工作量超出预期

风险：Project 和 Task 页面同时开发，可能导致视觉和交互分散。

缓解：

- Project UI 做基础聚合。
- Task UI 做列表优先。
- 把高级交互推迟到 Home & Polish。

### 9.4 远程数据库隧道中断

风险：SSH tunnel 断开后 Prisma 报 `ECONNREFUSED`。

缓解：

- 开发前先检查 `127.0.0.1:5433`。
- 若 `/inbox` 或 API 报 Prisma 连接错误，先重启 SSH tunnel。
- 不优先排查业务代码，先确认数据库连通。

---

## 10. 第二周完成定义

第二周完成时，Echive 应具备以下能力：

- [ ] 用户可以创建 Project。
- [ ] 用户可以在 Project 中看到关联 Ideas。
- [ ] 用户可以把已澄清 Idea 放入 Project。
- [ ] 用户可以从 Idea 生成 Task。
- [ ] 用户可以在 Tasks 页面查看任务。
- [ ] 用户可以更新任务状态和优先级。
- [ ] 用户可以使用 Today / This Week 视图。
- [ ] Idea 状态可以推进到 `PLANNED`。
- [ ] README 和主执行计划已更新。
- [ ] 质量检查通过。
- [ ] 代码已推送到 GitHub 和 Gitee。

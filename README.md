# Echive

Echive 是一个面向个人创作者与独立开发者的 AI 数字管家，用于将用户的想法转化为可执行计划、任务、素材资产与可发布内容。

当前阶段：**第一周 Idea Flow 闭环完成，准备进入 Planning**。

## MVP 闭环

```text
想法输入 → AI 澄清 → 任务拆解 → 素材沉淀 → 草稿生成
```

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma 7
- PostgreSQL
- pnpm
- Vitest

## 数据库部署原则

Echive 是 local-first 产品：默认部署方式是应用和数据库都运行在用户自己的设备上。远程数据库只用于开发者个人跨设备开发，不作为产品默认架构，也不要求公网域名。

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并按需修改本地数据库连接：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

### 3. 启动本地 PostgreSQL

需要 Docker Desktop 可用：

```bash
pnpm db:up
```

### 4. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 5. 执行数据库迁移和 seed

```bash
pnpm db:migrate -- --name init
pnpm db:seed
```

### 6. 启动开发服务器

```bash
pnpm dev
```

打开 http://localhost:3000。

## 个人远程开发数据库

当需要跨设备开发，但当前设备无法运行本地 PostgreSQL 时，可以临时使用阿里云 ECS 或 RDS 上的开发数据库。该数据库只用于个人开发，不能和生产数据或用户本地数据混用。

推荐连接方式是 SSH tunnel，而不是把 PostgreSQL 端口直接暴露到公网：

```bash
ssh -L 5433:127.0.0.1:5432 user@your-server-ip
```

然后在本机 `.env` 中把 `DATABASE_URL` 临时改为 tunnel 地址：

```env
DATABASE_URL="postgresql://echive_dev:change_me@127.0.0.1:5433/echive_dev_remote?schema=public"
```

之后照常执行 Prisma 命令，迁移会作用到远程开发数据库：

```bash
pnpm prisma:generate
pnpm db:migrate
pnpm db:seed
```

远程开发库约束：

- 数据库名建议使用 `echive_dev_remote`，明确区别于本地默认库。
- 不开放 `0.0.0.0:5432` 给公网；如必须直连，只允许固定 IP 白名单。
- 不存放真实隐私数据；需要调试时使用假数据或脱敏数据。
- 定期备份，且可以随时销毁重建。

## 常用命令

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm prisma:validate
pnpm build
pnpm check
pnpm audit --audit-level moderate
```

## 当前已完成

- Next.js + TypeScript + Tailwind 初始化
- shadcn/ui 基础组件
- Prisma 第二版 Schema 落地
- Prisma Client 生成配置
- Docker Compose PostgreSQL 配置
- 初始 Prisma migration SQL
- Seed 脚本
- 统一 API response helper 和单元测试
- App Shell 和主导航
- Home 页面 Foundation 占位
- Inbox Quick Capture、Idea 列表、状态筛选和详情页
- `POST /api/ideas`、`GET /api/ideas`、`GET /api/ideas/:id`、`PATCH /api/ideas/:id`
- 本地规则型 LLM Provider，用于第一周标题、摘要、澄清问题和 nextAction 生成
- `POST /api/ideas/:id/clarify`
- Conversation / Message / AIActionLog 澄清记录保存
- Projects / Tasks / Vault / Studio 占位页
- Day 1 到 Day 7 第一周验证链路

## 已知本地环境事项

- 当前开发临时使用阿里云 ECS 上的远程 dev PostgreSQL，通过 SSH tunnel 连接。
- PostgreSQL 只监听 ECS 本机 `127.0.0.1:5432`，不暴露公网数据库端口。
- 已完成远程 dev 数据库 migration、seed、Idea 创建、PATCH、澄清闭环验证。
- 已完成 Prisma schema validate、单元测试、类型检查、lint 和生产构建验证。

## 规划文档

- [PRD](projectStart/Echive%20PRD%20v0.md)
- [MVP 执行计划](plan/Echive%20MVP%20%E6%89%A7%E8%A1%8C%E8%AE%A1%E5%88%92.md)

# Echive

Echive 是一个面向个人创作者与独立开发者的 AI 数字管家，用于将用户的想法转化为可执行计划、任务、素材资产与可发布内容。

当前阶段：**Day 1 Foundation**。

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

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并填写数据库连接：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

### 3. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 4. 启动开发服务器

```bash
pnpm dev
```

打开 http://localhost:3000。

## 常用命令

```bash
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm build
pnpm check
```

## 当前已完成

- Next.js + TypeScript + Tailwind 初始化
- shadcn/ui 基础组件
- Prisma 第二版 Schema 落地
- Prisma Client 生成配置
- App Shell 和主导航
- Home 页面 Foundation 占位
- Inbox / Projects / Tasks / Vault / Studio 占位页
- Day 1 验证脚本

## 规划文档

- [PRD](projectStart/Echive%20PRD%20v0.md)
- [MVP 执行计划](plan/Echive%20MVP%20%E6%89%A7%E8%A1%8C%E8%AE%A1%E5%88%92.md)

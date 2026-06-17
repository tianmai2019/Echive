# 开发环境配置

本文档包含 Echive 项目的完整技术开发指南。

---

## 目录

- [数据库部署原则](#数据库部署原则)
- [开发环境配置](#开发环境配置)
- [SSH 隧道配置](#ssh-隧道配置只需配置一次)
- [环境变量配置](#环境变量配置)
- [启动项目](#启动项目)
- [日常开发流程](#日常开发流程)
- [常用命令](#常用命令)
- [远程开发库约束](#远程开发库约束)
- [问题排查](#问题排查)

---

## 数据库部署原则

Echive 是 local-first 产品：默认部署方式是应用和数据库都运行在用户自己的设备上。远程数据库只用于开发者个人跨设备开发，不作为产品默认架构，也不要求公网域名。

**重要：所有开发环境统一使用阿里云远程数据库**，不再使用本地 Docker PostgreSQL。这样确保：
- 公司电脑和家里电脑共享同一个开发数据库
- 配置不会互相覆盖（使用 `.env.local` 本地专属配置）
- 无需在每台机器上维护独立的 Docker PostgreSQL

---

## 开发环境配置

### 1. 安装依赖

```bash
pnpm install
```

---

## SSH 隧道配置（只需配置一次）

在 `~/.ssh/config` 中添加以下内容：

```ssh-config
Host aliyun-dev
  HostName 121.40.165.144
  User root
  IdentityFile ~/.ssh/echive_aliyun_dev
  Port 22
  ServerAliveInterval 60
  ServerAliveCountMax 3
```

**Windows**: 配置文件位于 `C:\Users\你的用户名\.ssh\config`
**macOS/Linux**: 配置文件位于 `~/.ssh/config`

确保你的 SSH 私钥文件 `echive_aliyun_dev` 已放置在正确位置，并设置了正确的权限：

```bash
# macOS/Linux
chmod 600 ~/.ssh/echive_aliyun_dev
```

---

## 环境变量配置

复制 `.env.example` 为 `.env.local`（**本地专属，不提交 Git**）：

```bash
cp .env.example .env.local
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env.local
```

编辑 `.env.local`，确保 `DATABASE_URL` 指向阿里云远程数据库（`.env.example` 中已包含正确模板）：

```env
DATABASE_URL="postgresql://echive_dev:Echive@2025@127.0.0.1:5433/echive_dev_remote?schema=public"
```

---

## 启动项目

### 1. 启动 SSH 隧道

每次开发前在终端运行：

```bash
ssh -N aliyun-dev
```

保持此终端打开，不要关闭。

### 2. 验证数据库连接

新开一个终端，运行：

**PowerShell**:
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 5433
```

**macOS/Linux**:
```bash
nc -zv 127.0.0.1 5433
```

Prisma 验证：
```bash
pnpm prisma migrate status
```

### 3. 生成 Prisma Client

```bash
pnpm prisma:generate
```

### 4. 执行数据库迁移和 seed（首次或 schema 更新时）

```bash
pnpm db:migrate -- --name init
pnpm db:seed
```

### 5. 启动开发服务器

```bash
pnpm dev
```

打开 http://localhost:3000。

---

## 日常开发流程

```mermaid
graph LR
    A[打开终端 1] --> B[启动 SSH 隧道]
    B --> C[ssh -N aliyun-dev]
    D[打开终端 2] --> E[启动开发服务器]
    E --> F[pnpm dev]
    F --> G[开始编码 ✨]
```

简洁版：
1. 打开终端 1，启动 SSH 隧道：`ssh -N aliyun-dev`
2. 打开终端 2，启动开发服务器：`pnpm dev`
3. 开始编码 ✨

---

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm lint` | 运行 ESLint 代码检查 |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm test` | 运行单元测试 |
| `pnpm prisma:validate` | 验证 Prisma Schema |
| `pnpm build` | 生产环境构建 |
| `pnpm check` | 运行所有质量检查（lint + typecheck + test + validate） |
| `pnpm audit --audit-level moderate` | 安全漏洞扫描 |
| `pnpm prisma:generate` | 生成 Prisma Client |
| `pnpm db:migrate -- --name <name>` | 创建数据库迁移 |
| `pnpm db:seed` | 运行种子数据 |
| `pnpm prisma migrate status` | 查看迁移状态 |

---

## 远程开发库约束

- 数据库名建议使用 `echive_dev_remote`，明确区别于本地默认库。
- 不开放 `0.0.0.0:5432` 给公网；如必须直连，只允许固定 IP 白名单。
- 不存放真实隐私数据；需要调试时使用假数据或脱敏数据。
- 定期备份，且可以随时销毁重建。

---

## 问题排查

### 隧道断开重连

如果 Prisma 报 `ECONNREFUSED`，说明 SSH 隧道断开了，重新运行：

```bash
ssh -N aliyun-dev
```

### 数据库连接失败

1. 确认 SSH 隧道正在运行（终端没有报错）
2. 确认端口 5433 正在监听：
   ```powershell
   netstat -an | Select-String "5433"
   ```
3. 检查 `.env.local` 中的 `DATABASE_URL` 是否正确
4. 验证 SSH 配置：`ssh aliyun-dev echo "连接成功"`

### 其他问题

- **类型检查失败**：运行 `pnpm prisma:generate` 重新生成 Prisma Client
- **构建失败**：先运行 `pnpm install` 确保依赖完整
- **Lint 报错**：运行 `pnpm lint --fix` 自动修复可修复的问题

# Echive

> 面向个人创作者与独立开发者的 AI 数字管家

将你的想法转化为可执行计划、任务、素材资产与可发布内容。

---

## 📋 目录

- [项目简介](#项目简介)
- [MVP 核心闭环](#mvp-核心闭环)
- [技术栈](#技术栈)
- [当前进度](#当前进度)
- [快速开始](#快速开始)
- [📖 新用户指南](#新用户指南)
- [项目规划](#项目规划)
- [已完成功能](#已完成功能)

---

## 项目简介

Echive 是一个 local-first 的 AI 生产力工具，帮助个人创作者：
- 💡 快速捕捉和澄清模糊想法
- 🎯 将想法拆解为可执行任务
- 📚 管理和沉淀素材资产
- ✍️ 基于上下文生成内容草稿

**核心理念：** 让创意从想法到发布的整个流程更流畅、高效。

---

## MVP 核心闭环

```text
想法输入 → AI 澄清 → 任务拆解 → 素材沉淀 → 草稿生成
```

---

## 技术栈

| 层级 | 技术选型 |
|------|---------|
| Web 框架 | Next.js App Router |
| 语言 | TypeScript |
| UI 框架 | Tailwind CSS |
| 组件库 | shadcn/ui |
| ORM | Prisma |
| 数据库 | PostgreSQL |
| 包管理器 | pnpm |
| 测试框架 | Vitest |

---

## 当前进度

**阶段：MVP 核心模块全部完成，进入 Home & Polish 阶段**

```mermaid
graph LR
    A[Foundation] --> B[Idea Flow]
    B --> C[Planning]
    C --> D[Vault]
    D --> E[Studio]
    E --> F[Home & Polish]
    
    style A fill:#4CAF50,color:white
    style B fill:#4CAF50,color:white
    style C fill:#4CAF50,color:white
    style D fill:#4CAF50,color:white
    style E fill:#4CAF50,color:white
    style F fill:#FFC107,color:black
```

✅ **已完成：** Foundation → Idea Flow → Planning → Vault → Studio  
🔄 **进行中：** Home & Polish

---

## 快速开始

### 开发者

完整的开发环境配置请查看：

👉 **[开发环境配置指南](SETUP.md)**

**快速启动 TL;DR:**

```bash
# 1. 启动 SSH 隧道（保持终端打开）
ssh -N aliyun-dev

# 2. 新开终端，安装依赖并启动
pnpm install
pnpm dev
```

打开 http://localhost:3000 即可查看项目。

---

## 📖 新用户指南

👉 **[点击查看完整新用户使用指南](USER_GUIDE.md)**

新用户指南包含：
- 30 秒快速上手
- 核心工作流详解
- 6 大模块功能介绍
- 完整创作流程演示
- 常见问题解答
- 效率提升技巧

---

## 项目规划

详细的项目规划文档位于 `plan/` 目录：

- [MVP 执行计划](plan/Echive%20MVP%20%E6%89%A7%E8%A1%8C%E8%AE%A1%E5%88%92.md) - 整体里程碑规划
- [第二周 Planning 执行计划](plan/Echive%20第二周%20Planning%20执行计划.md) - Planning 阶段详细安排

PRD 文档：
- [Echive PRD v0](projectStart/Echive%20PRD%20v0.md)

---

## 已完成功能

### Foundation ✅
- Next.js + TypeScript + Tailwind 初始化
- shadcn/ui 基础组件
- Prisma 第二版 Schema 落地
- Docker Compose PostgreSQL 配置
- 初始 Prisma migration 和 Seed 脚本
- 统一 API response helper
- App Shell 和左侧主导航

### Idea Flow ✅
- Inbox 页面与 Quick Capture
- Idea 列表、状态筛选、详情页
- Idea API：创建、查询、更新
- 本地规则型 LLM Provider（标题、摘要、澄清问题、nextAction）
- `POST /api/ideas/:id/clarify` 澄清接口
- Conversation / Message / AIActionLog 澄清记录保存
- Idea 状态流转：CAPTURED → CLARIFIED

### Planning ✅
- Project API：创建、查询、更新
- Projects 列表、创建表单、详情页
- Project 聚合展示 Ideas / Tasks
- Idea 关联 Project、快速创建并关联
- 本地规则型 Task Generator（从 Idea 生成 5 个任务建议）
- `POST /api/ideas/:id/tasks/generate` 生成接口
- Tasks API：查询、更新状态/优先级
- Tasks 页面、Today / This Week / Project 筛选
- Idea 状态推进到 PLANNED

### Vault ✅
- Material API：创建、查询、更新
- Material 列表、状态切换
- 素材关联 Idea / Project
- 标签系统轻量版

### Studio ✅
- Draft API：生成、查询、更新
- Draft 生成面板
- 选择来源 Idea 和关联 Materials
- 支持多种输出格式
- AI 生成 outline/content
- Draft 编辑区
- DraftMaterial 关联保存

---

## 已知本地环境事项

- 当前开发临时使用阿里云 ECS 上的远程 dev PostgreSQL，通过 SSH tunnel 连接
- PostgreSQL 只监听 ECS 本机 `127.0.0.1:5432`，不暴露公网数据库端口
- 已完成所有核心模块的端到端验证
- 所有质量检查已通过：lint、typecheck、test、prisma:validate、build

---

## 许可证

MIT

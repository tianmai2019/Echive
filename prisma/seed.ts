import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
  max: 5,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: { email: "demo@echive.app" },
    update: { name: "Demo User" },
    create: {
      email: "demo@echive.app",
      name: "Demo User",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project-echive" },
    update: {
      title: "Echive MVP",
      description: "验证想法输入、AI 澄清、任务拆解、素材沉淀与草稿生成闭环。",
      goal: "完成个人 AI 数字管家的 MVP 闭环。",
      userId: user.id,
    },
    create: {
      id: "demo-project-echive",
      userId: user.id,
      title: "Echive MVP",
      description: "验证想法输入、AI 澄清、任务拆解、素材沉淀与草稿生成闭环。",
      goal: "完成个人 AI 数字管家的 MVP 闭环。",
    },
  });

  const idea = await prisma.idea.upsert({
    where: { id: "demo-idea-digital-butler" },
    update: {
      userId: user.id,
      projectId: project.id,
      title: "个人 AI 数字管家",
      rawInput: "我想做一个自己的数字管家，帮我管理创作工作流。",
      summary: "面向个人创作者的 AI 工作流中枢。",
      nextAction: "先完成想法输入到任务拆解的最小闭环。",
    },
    create: {
      id: "demo-idea-digital-butler",
      userId: user.id,
      projectId: project.id,
      title: "个人 AI 数字管家",
      rawInput: "我想做一个自己的数字管家，帮我管理创作工作流。",
      summary: "面向个人创作者的 AI 工作流中枢。",
      nextAction: "先完成想法输入到任务拆解的最小闭环。",
    },
  });

  await prisma.task.upsert({
    where: { id: "demo-task-foundation" },
    update: {
      userId: user.id,
      projectId: project.id,
      ideaId: idea.id,
      title: "完成 Foundation 数据库基础",
      description: "配置 PostgreSQL、Prisma migration、seed 和 API response helper。",
    },
    create: {
      id: "demo-task-foundation",
      userId: user.id,
      projectId: project.id,
      ideaId: idea.id,
      title: "完成 Foundation 数据库基础",
      description: "配置 PostgreSQL、Prisma migration、seed 和 API response helper。",
      priority: "HIGH",
    },
  });

  await prisma.material.upsert({
    where: { id: "demo-material-prd" },
    update: {
      userId: user.id,
      projectId: project.id,
      ideaId: idea.id,
      title: "Echive PRD 摘要",
      content: "Echive 帮助用户把灵感变成行动，把素材变成输出。",
    },
    create: {
      id: "demo-material-prd",
      userId: user.id,
      projectId: project.id,
      ideaId: idea.id,
      title: "Echive PRD 摘要",
      type: "NOTE",
      content: "Echive 帮助用户把灵感变成行动，把素材变成输出。",
      status: "USABLE",
    },
  });

  await prisma.draft.upsert({
    where: { id: "demo-draft-intro" },
    update: {
      userId: user.id,
      projectId: project.id,
      ideaId: idea.id,
      title: "为什么需要一个个人 AI 数字管家",
      outline: "1. 想法容易丢失\n2. 素材难以复用\n3. Echive 的 MVP 闭环",
      content: "这是一篇用于验证 Studio 数据关系的示例草稿。",
    },
    create: {
      id: "demo-draft-intro",
      userId: user.id,
      projectId: project.id,
      ideaId: idea.id,
      title: "为什么需要一个个人 AI 数字管家",
      format: "BLOG",
      outline: "1. 想法容易丢失\n2. 素材难以复用\n3. Echive 的 MVP 闭环",
      content: "这是一篇用于验证 Studio 数据关系的示例草稿。",
    },
  });
}

main()
  .catch((error: unknown) => {
    process.exitCode = 1;
    process.stderr.write(
      error instanceof Error ? `${error.message}\n` : "Seed failed with an unknown error.\n"
    );
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

import { TaskPriority } from "@/generated/prisma/enums";
import { describe, expect, test } from "vitest";

import { LocalTaskGenerator } from "./task-generator";

describe("LocalTaskGenerator", () => {
  test("generates five structured task suggestions", async () => {
    const generator = new LocalTaskGenerator();

    const result = await generator.generateTasks({
      ideaTitle: "个人 AI 数字管家",
      ideaSummary: "一个管理创作工作流的 AI 助手",
      ideaRawInput: "帮我把想法转成计划和任务。",
    });

    expect(result.tasks).toHaveLength(5);
    expect(result.tasks[0]).toEqual(
      expect.objectContaining({
        priority: TaskPriority.HIGH,
        title: expect.stringContaining("明确目标"),
        description: expect.stringContaining("个人 AI 数字管家"),
      })
    );
  });

  test("covers planning, material collection, validation, and review steps", async () => {
    const generator = new LocalTaskGenerator();

    const result = await generator.generateTasks({
      ideaTitle: "Test Idea",
      ideaSummary: "Test Summary",
    });
    const titles = result.tasks.map((task) => task.title);

    expect(titles.some((title) => title.includes("明确目标"))).toBe(true);
    expect(titles.some((title) => title.includes("收集必要素材"))).toBe(true);
    expect(titles.some((title) => title.includes("最小可行"))).toBe(true);
    expect(titles.some((title) => title.includes("第一轮验证"))).toBe(true);
    expect(titles.some((title) => title.includes("复盘"))).toBe(true);
  });

  test("uses the expected priority pattern", async () => {
    const generator = new LocalTaskGenerator();

    const result = await generator.generateTasks({
      ideaTitle: "Test Idea",
    });

    expect(result.tasks.map((task) => task.priority)).toEqual([
      TaskPriority.HIGH,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
      TaskPriority.HIGH,
      TaskPriority.LOW,
    ]);
  });
});

import { describe, expect, test } from "vitest";

import { LocalIdeaClarifier } from "./idea-clarifier";

describe("LocalIdeaClarifier", () => {
  test("generates structured clarification output", async () => {
    const clarifier = new LocalIdeaClarifier();

    const result = await clarifier.clarify({
      rawInput: "做一个个人 AI 数字管家，帮我管理创作工作流。",
    });

    expect(result.title).toBeTruthy();
    expect(result.summary).toContain("个人 AI 数字管家");
    expect(result.questions).toHaveLength(4);
    expect(result.nextAction).toContain("30 分钟");
  });
});

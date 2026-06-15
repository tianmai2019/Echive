import { IdeaStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { POST } from "./route";

const TEST_PREFIX = "[generate-tasks-route-test]";

async function deleteTestData(): Promise<void> {
  await db.task.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  await db.aIActionLog.deleteMany({ where: { input: { contains: TEST_PREFIX } } });
  await db.idea.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
}

async function createTestIdea(status: IdeaStatus = IdeaStatus.CLARIFIED) {
  const user = await getDemoUser();

  return db.idea.create({
    data: {
      userId: user.id,
      title: `${TEST_PREFIX} Idea`,
      rawInput: `${TEST_PREFIX} Raw input`,
      summary: `${TEST_PREFIX} Summary`,
      status,
    },
  });
}

function contextFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/ideas/[id]/tasks/generate", () => {
  beforeEach(async () => {
    await deleteTestData();
  });

  afterAll(async () => {
    await deleteTestData();
  });

  test("returns 404 for a missing idea", async () => {
    const response = await POST(
      new Request("http://localhost/api/ideas/missing/tasks/generate", { method: "POST" }),
      contextFor("missing-idea")
    );

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Idea not found",
    });
    expect(response.status).toBe(404);
  });

  test("rejects task generation before clarification", async () => {
    const idea = await createTestIdea(IdeaStatus.CAPTURED);

    const response = await POST(
      new Request(`http://localhost/api/ideas/${idea.id}/tasks/generate`, {
        method: "POST",
      }),
      contextFor(idea.id)
    );

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Idea must be clarified before generating tasks",
    });
    expect(response.status).toBe(400);
  });

  test("generates tasks for a clarified idea", async () => {
    const idea = await createTestIdea();

    const response = await POST(
      new Request(`http://localhost/api/ideas/${idea.id}/tasks/generate`, {
        method: "POST",
      }),
      contextFor(idea.id)
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload).toEqual({
      success: true,
      data: expect.objectContaining({
        idea: expect.objectContaining({ id: idea.id, status: IdeaStatus.PLANNED }),
        tasks: expect.arrayContaining([
          expect.objectContaining({ title: expect.stringContaining("明确目标") }),
        ]),
      }),
      error: null,
    });
  });
});

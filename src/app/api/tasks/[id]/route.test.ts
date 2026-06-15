import { TaskPriority, TaskStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { PATCH } from "./route";

const TEST_PREFIX = "[task-id-route-test]";

async function deleteTestTasks(): Promise<void> {
  await db.task.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
}

async function createTask() {
  const user = await getDemoUser();

  return db.task.create({
    data: {
      userId: user.id,
      title: `${TEST_PREFIX} Task`,
    },
  });
}

function contextFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown): Request {
  return new Request("http://localhost/api/tasks/task-id", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("PATCH /api/tasks/[id]", () => {
  beforeEach(async () => {
    await deleteTestTasks();
  });

  afterAll(async () => {
    await deleteTestTasks();
  });

  test("updates task fields", async () => {
    const task = await createTask();

    const response = await PATCH(
      patchRequest({
        title: `  ${TEST_PREFIX} Updated  `,
        description: "  Updated description  ",
        status: TaskStatus.DOING,
        priority: TaskPriority.HIGH,
        dueDate: "2026-06-20T00:00:00.000Z",
      }),
      contextFor(task.id)
    );

    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        id: task.id,
        title: `${TEST_PREFIX} Updated`,
        description: "Updated description",
        status: TaskStatus.DOING,
        priority: TaskPriority.HIGH,
      }),
      error: null,
    });
    expect(response.status).toBe(200);
  });

  test("rejects invalid status", async () => {
    const task = await createTask();

    const response = await PATCH(patchRequest({ status: "INVALID" }), contextFor(task.id));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Invalid task status",
    });
    expect(response.status).toBe(400);
  });

  test("returns 404 for missing task", async () => {
    const response = await PATCH(
      patchRequest({ status: TaskStatus.DONE }),
      contextFor("missing-task")
    );

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Task not found",
    });
    expect(response.status).toBe(404);
  });
});

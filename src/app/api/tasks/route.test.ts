import { TaskPriority, TaskStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { GET } from "./route";

const TEST_PREFIX = "[tasks-route-test]";

async function deleteTestTasks(): Promise<void> {
  await db.task.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
}

function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function createTask(input: {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  projectId?: string | null;
}) {
  const user = await getDemoUser();

  return db.task.create({
    data: {
      userId: user.id,
      title: input.title,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      dueDate: input.dueDate,
      projectId: input.projectId,
    },
  });
}

describe("GET /api/tasks", () => {
  beforeEach(async () => {
    await deleteTestTasks();
  });

  afterAll(async () => {
    await deleteTestTasks();
  });

  test("returns tasks filtered by status and priority", async () => {
    const matchingTask = await createTask({
      title: `${TEST_PREFIX} Matching`,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    });
    await createTask({
      title: `${TEST_PREFIX} Other`,
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
    });

    const response = await GET(
      new Request(`http://localhost/api/tasks?status=${TaskStatus.TODO}&priority=${TaskPriority.HIGH}`)
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: matchingTask.id })])
    );
  });

  test("returns tasks filtered by today and this week views", async () => {
    const todayTask = await createTask({
      title: `${TEST_PREFIX} Today`,
      dueDate: new Date(),
    });
    const weekTask = await createTask({
      title: `${TEST_PREFIX} This Week`,
      dueDate: addDays(3),
    });
    await createTask({
      title: `${TEST_PREFIX} Later`,
      dueDate: addDays(10),
    });

    const todayResponse = await GET(new Request("http://localhost/api/tasks?view=today"));
    const todayPayload = await todayResponse.json();
    const weekResponse = await GET(new Request("http://localhost/api/tasks?view=thisWeek"));
    const weekPayload = await weekResponse.json();

    expect(todayResponse.status).toBe(200);
    expect(todayPayload.data.map((task: { id: string }) => task.id)).toContain(todayTask.id);
    expect(todayPayload.data.map((task: { id: string }) => task.id)).not.toContain(
      weekTask.id
    );
    expect(weekResponse.status).toBe(200);
    expect(weekPayload.data.map((task: { id: string }) => task.id)).toEqual(
      expect.arrayContaining([todayTask.id, weekTask.id])
    );
  });

  test("returns tasks filtered by projectId", async () => {
    const user = await getDemoUser();
    const project = await db.project.create({
      data: {
        userId: user.id,
        title: `${TEST_PREFIX} Project`,
      },
    });
    const projectTask = await createTask({
      title: `${TEST_PREFIX} Project Task`,
      projectId: project.id,
    });
    await createTask({ title: `${TEST_PREFIX} Unassigned` });

    const response = await GET(
      new Request(`http://localhost/api/tasks?projectId=${project.id}`)
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.data.map((task: { id: string }) => task.id)).toEqual([
      projectTask.id,
    ]);

    await db.project.delete({ where: { id: project.id } });
  });

  test("rejects invalid view", async () => {
    const response = await GET(new Request("http://localhost/api/tasks?view=INVALID"));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Invalid task view",
    });
    expect(response.status).toBe(400);
  });

  test("rejects invalid status", async () => {
    const response = await GET(new Request("http://localhost/api/tasks?status=INVALID"));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Invalid task status",
    });
    expect(response.status).toBe(400);
  });

  test("rejects invalid priority", async () => {
    const response = await GET(new Request("http://localhost/api/tasks?priority=INVALID"));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Invalid task priority",
    });
    expect(response.status).toBe(400);
  });
});

import { TaskPriority, TaskStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import { createProject } from "@/lib/projects";
import {
  isTaskPriority,
  isTaskStatus,
  listTasks,
  updateTask,
} from "@/lib/tasks";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

const TEST_PREFIX = "[tasks-test]";

function addDays(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function deleteTestData(): Promise<void> {
  await db.task.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  await db.idea.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  await db.project.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
}

async function createTask(input: {
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string | null;
  dueDate?: Date | null;
}) {
  const user = await getDemoUser();

  return db.task.create({
    data: {
      userId: user.id,
      title: input.title,
      status: input.status ?? TaskStatus.TODO,
      priority: input.priority ?? TaskPriority.MEDIUM,
      projectId: input.projectId,
      dueDate: input.dueDate,
    },
  });
}

describe("tasks", () => {
  beforeEach(async () => {
    await deleteTestData();
  });

  afterAll(async () => {
    await deleteTestData();
  });

  test("validates task status and priority values", () => {
    expect(isTaskStatus(TaskStatus.TODO)).toBe(true);
    expect(isTaskStatus(TaskStatus.DOING)).toBe(true);
    expect(isTaskStatus("INVALID")).toBe(false);

    expect(isTaskPriority(TaskPriority.HIGH)).toBe(true);
    expect(isTaskPriority(TaskPriority.LOW)).toBe(true);
    expect(isTaskPriority("INVALID")).toBe(false);
  });

  test("lists tasks with status, priority, and project filters", async () => {
    const project = await createProject({ title: `${TEST_PREFIX} Project` });
    const matchingTask = await createTask({
      title: `${TEST_PREFIX} Matching`,
      status: TaskStatus.DOING,
      priority: TaskPriority.HIGH,
      projectId: project.id,
    });
    await createTask({
      title: `${TEST_PREFIX} Other Status`,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      projectId: project.id,
    });

    const tasks = await listTasks({
      status: TaskStatus.DOING,
      priority: TaskPriority.HIGH,
      projectId: project.id,
    });

    expect(tasks).toEqual([
      expect.objectContaining({ id: matchingTask.id, status: TaskStatus.DOING }),
    ]);
  });

  test("filters today and this week tasks", async () => {
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

    const todayTasks = await listTasks({ view: "today" });
    const weekTasks = await listTasks({ view: "thisWeek" });

    expect(todayTasks.map((task) => task.id)).toContain(todayTask.id);
    expect(todayTasks.map((task) => task.id)).not.toContain(weekTask.id);
    expect(weekTasks.map((task) => task.id)).toEqual(
      expect.arrayContaining([todayTask.id, weekTask.id])
    );
  });

  test("updates task status, priority, and due date", async () => {
    const task = await createTask({ title: `${TEST_PREFIX} Update` });
    const dueDate = addDays(1);

    const updatedTask = await updateTask(task.id, {
      title: `  ${TEST_PREFIX} Updated  `,
      description: "  Updated description  ",
      status: TaskStatus.DOING,
      priority: TaskPriority.HIGH,
      dueDate,
    });

    expect(updatedTask).toEqual(
      expect.objectContaining({
        id: task.id,
        title: `${TEST_PREFIX} Updated`,
        description: "Updated description",
        status: TaskStatus.DOING,
        priority: TaskPriority.HIGH,
      })
    );
    expect(updatedTask?.dueDate?.toISOString()).toBe(dueDate.toISOString());
  });

  test("returns null when updating a missing task", async () => {
    await expect(updateTask("missing-task", { status: TaskStatus.DONE })).resolves.toBeNull();
  });
});

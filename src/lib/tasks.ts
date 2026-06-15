import type { Task } from "@/generated/prisma/client";
import {
  type TaskPriority as TaskPriorityValue,
  type TaskStatus as TaskStatusValue,
} from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import type { TaskView } from "@/lib/task-metadata";

export type { TaskView } from "@/lib/task-metadata";
export interface ListTasksFilters {
  status?: TaskStatusValue;
  priority?: TaskPriorityValue;
  projectId?: string;
  view?: TaskView;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatusValue;
  priority?: TaskPriorityValue;
  dueDate?: Date | null;
}

export interface TaskListItem {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatusValue;
  priority: TaskPriorityValue;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  project: {
    id: string;
    title: string;
  } | null;
  idea: {
    id: string;
    title: string;
  } | null;
}

export { isTaskPriority, isTaskStatus } from "@/lib/task-metadata";
function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfTomorrow(): Date {
  const date = startOfToday();
  date.setDate(date.getDate() + 1);
  return date;
}

function startOfNextWeek(): Date {
  const date = startOfToday();
  const day = date.getDay();
  const daysUntilNextWeek = day === 0 ? 1 : 8 - day;
  date.setDate(date.getDate() + daysUntilNextWeek);
  return date;
}

function buildDueDateFilter(view?: TaskView) {
  if (view === "today") {
    return {
      gte: startOfToday(),
      lt: startOfTomorrow(),
    };
  }

  if (view === "thisWeek") {
    return {
      gte: startOfToday(),
      lt: startOfNextWeek(),
    };
  }

  return undefined;
}

export async function listTasks(filters: ListTasksFilters = {}): Promise<TaskListItem[]> {
  const user = await getDemoUser();
  const dueDate = buildDueDateFilter(filters.view);

  return db.task.findMany({
    where: {
      userId: user.id,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(dueDate ? { dueDate } : {}),
    },
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          id: true,
          title: true,
        },
      },
      idea: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
  const user = await getDemoUser();
  const existingTask = await db.task.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existingTask) {
    return null;
  }

  return db.task.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() ?? null }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    },
  });
}

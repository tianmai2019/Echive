import type { Project } from "@/generated/prisma/client";
import {
  ProjectStatus,
  type IdeaStatus,
  type IdeaType,
  type ProjectStatus as ProjectStatusValue,
  type TaskPriority,
  type TaskStatus,
} from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";

export const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatus);

export interface ProjectListItem {
  id: string;
  title: string;
  description: string | null;
  goal: string | null;
  status: ProjectStatusValue;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    ideas: number;
    tasks: number;
  };
}

export interface ProjectDetailIdea {
  id: string;
  title: string;
  status: IdeaStatus;
  type: IdeaType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDetailTask {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectDetail =
  | (Project & {
      ideas: ProjectDetailIdea[];
      tasks: ProjectDetailTask[];
    })
  | null;

export interface CreateProjectInput {
  title: string;
  description?: string | null;
  goal?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string | null;
  goal?: string | null;
  status?: ProjectStatusValue;
}

export function isProjectStatus(value: string): value is ProjectStatusValue {
  return PROJECT_STATUS_OPTIONS.includes(value as ProjectStatusValue);
}

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(value?: string | null): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return normalizeText(value);
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const user = await getDemoUser();

  return db.project.create({
    data: {
      userId: user.id,
      title: normalizeText(input.title),
      description: normalizeOptionalText(input.description),
      goal: normalizeOptionalText(input.goal),
      status: ProjectStatus.ACTIVE,
    },
  });
}

export async function listProjects(status?: ProjectStatusValue): Promise<ProjectListItem[]> {
  const user = await getDemoUser();

  return db.project.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      goal: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          ideas: true,
          tasks: true,
        },
      },
    },
  });
}

export async function getProjectById(id: string): Promise<ProjectDetail> {
  const user = await getDemoUser();

  return db.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      ideas: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<Project | null> {
  const user = await getDemoUser();
  const existingProject = await db.project.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existingProject) {
    return null;
  }

  return db.project.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: normalizeText(input.title) } : {}),
      ...(input.description !== undefined
        ? { description: normalizeOptionalText(input.description) }
        : {}),
      ...(input.goal !== undefined ? { goal: normalizeOptionalText(input.goal) } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });
}

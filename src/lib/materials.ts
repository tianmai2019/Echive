import type { Material } from "@/generated/prisma/client";
import {
  MaterialStatus,
  type MaterialStatus as MaterialStatusValue,
  type MaterialType as MaterialTypeValue,
} from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";

export { isMaterialStatus, isMaterialType } from "@/lib/material-metadata";

export interface MaterialListItem {
  id: string;
  title: string;
  type: MaterialTypeValue;
  content: string;
  source: string | null;
  status: MaterialStatusValue;
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

export interface CreateMaterialInput {
  title: string;
  type: MaterialTypeValue;
  content: string;
  source?: string | null;
  status?: MaterialStatusValue;
  projectId?: string | null;
  ideaId?: string | null;
}

export interface UpdateMaterialInput {
  title?: string;
  type?: MaterialTypeValue;
  content?: string;
  source?: string | null;
  status?: MaterialStatusValue;
  projectId?: string | null;
  ideaId?: string | null;
}

export interface ListMaterialsFilters {
  status?: MaterialStatusValue;
  type?: MaterialTypeValue;
  projectId?: string;
  ideaId?: string;
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

export async function createMaterial(input: CreateMaterialInput): Promise<Material> {
  const user = await getDemoUser();

  return db.material.create({
    data: {
      userId: user.id,
      title: normalizeText(input.title),
      type: input.type,
      content: normalizeText(input.content),
      source: normalizeOptionalText(input.source),
      status: input.status ?? MaterialStatus.RAW,
      projectId: input.projectId,
      ideaId: input.ideaId,
    },
  });
}

export async function listMaterials(filters: ListMaterialsFilters = {}): Promise<MaterialListItem[]> {
  const user = await getDemoUser();

  return db.material.findMany({
    where: {
      userId: user.id,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.ideaId ? { ideaId: filters.ideaId } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      type: true,
      content: true,
      source: true,
      status: true,
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

export async function getMaterialById(id: string): Promise<Material | null> {
  const user = await getDemoUser();

  return db.material.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput
): Promise<Material | null> {
  const user = await getDemoUser();
  const existingMaterial = await db.material.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existingMaterial) {
    return null;
  }

  return db.material.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: normalizeText(input.title) } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.content !== undefined ? { content: normalizeText(input.content) } : {}),
      ...(input.source !== undefined ? { source: normalizeOptionalText(input.source) } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.ideaId !== undefined ? { ideaId: input.ideaId } : {}),
    },
  });
}

import type { Draft } from "@/generated/prisma/client";
import {
  DraftFormat,
  DraftStatus,
  type DraftFormat as DraftFormatValue,
  type DraftStatus as DraftStatusValue,
} from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";

export interface DraftListItem {
  id: string;
  title: string;
  format: DraftFormatValue;
  status: DraftStatusValue;
  outline: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  idea: {
    id: string;
    title: string;
  } | null;
  project: {
    id: string;
    title: string;
  } | null;
}

export interface DraftDetail {
  id: string;
  title: string;
  format: DraftFormatValue;
  status: DraftStatusValue;
  outline: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  ideaId: string | null;
  projectId: string | null;
}

export interface CreateDraftInput {
  title: string;
  format: DraftFormatValue;
  outline?: string | null;
  content: string;
  status?: DraftStatusValue;
  ideaId?: string | null;
  projectId?: string | null;
}

export interface UpdateDraftInput {
  title?: string;
  format?: DraftFormatValue;
  outline?: string | null;
  content?: string;
  status?: DraftStatusValue;
}

export interface GenerateDraftInput {
  ideaId: string;
  format: DraftFormatValue;
  materialIds?: string[];
}

export function isDraftStatus(value: string): value is DraftStatusValue {
  return Object.values(DraftStatus).includes(value as DraftStatusValue);
}

export function isDraftFormat(value: string): value is DraftFormatValue {
  return Object.values(DraftFormat).includes(value as DraftFormatValue);
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

export async function createDraft(input: CreateDraftInput): Promise<Draft> {
  const user = await getDemoUser();

  return db.draft.create({
    data: {
      userId: user.id,
      title: normalizeText(input.title),
      format: input.format,
      outline: normalizeOptionalText(input.outline),
      content: normalizeText(input.content),
      status: input.status ?? DraftStatus.DRAFT,
      ideaId: input.ideaId,
      projectId: input.projectId,
    },
  });
}

export async function listDrafts(status?: DraftStatusValue): Promise<DraftListItem[]> {
  const user = await getDemoUser();

  return db.draft.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : {}),
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      format: true,
      status: true,
      outline: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      idea: {
        select: {
          id: true,
          title: true,
        },
      },
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

export async function getDraftById(id: string): Promise<DraftDetail | null> {
  const user = await getDemoUser();

  return db.draft.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      format: true,
      status: true,
      outline: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      ideaId: true,
      projectId: true,
    },
  });
}

export async function updateDraft(
  id: string,
  input: UpdateDraftInput
): Promise<Draft | null> {
  const user = await getDemoUser();
  const existingDraft = await db.draft.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existingDraft) {
    return null;
  }

  return db.draft.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: normalizeText(input.title) } : {}),
      ...(input.format !== undefined ? { format: input.format } : {}),
      ...(input.outline !== undefined ? { outline: normalizeOptionalText(input.outline) } : {}),
      ...(input.content !== undefined ? { content: normalizeText(input.content) } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    },
  });
}

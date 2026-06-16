import { DraftFormat, DraftStatus } from "@/generated/prisma/enums";

export const MAX_DRAFT_TITLE_LENGTH = 200;
export const MAX_DRAFT_CONTENT_LENGTH = 50_000;
export const MAX_DRAFT_OUTLINE_LENGTH = 5_000;

type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

export function parseDraftTitle(value: unknown): ValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "title must be a non-empty string" };
  }

  if (value.length > MAX_DRAFT_TITLE_LENGTH) {
    return {
      ok: false,
      error: `title must be ${MAX_DRAFT_TITLE_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() };
}

export function parseDraftFormat(value: unknown): ValidationResult<DraftFormat> {
  if (typeof value !== "string") {
    return { ok: false, error: "format must be a string" };
  }

  if (!Object.values(DraftFormat).includes(value as DraftFormat)) {
    return { ok: false, error: `invalid draft format: ${value}` };
  }

  return { ok: true, value: value as DraftFormat };
}

export function parseDraftContent(value: unknown): ValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "content must be a non-empty string" };
  }

  if (value.length > MAX_DRAFT_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `content must be ${MAX_DRAFT_CONTENT_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() };
}

export function parseDraftOptionalOutline(
  value: unknown
): ValidationResult<string | null | undefined> {
  if (value === undefined || value === null) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== "string") {
    return { ok: false, error: "outline must be a string or null" };
  }

  if (value.length > MAX_DRAFT_OUTLINE_LENGTH) {
    return {
      ok: false,
      error: `outline must be ${MAX_DRAFT_OUTLINE_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() || null };
}

export function parseDraftOptionalStatus(value: unknown): ValidationResult<DraftStatus | undefined> {
  if (value === undefined || value === null) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== "string") {
    return { ok: false, error: "status must be a string" };
  }

  if (!Object.values(DraftStatus).includes(value as DraftStatus)) {
    return { ok: false, error: `invalid draft status: ${value}` };
  }

  return { ok: true, value: value as DraftStatus };
}

export function parseDraftOptionalId(value: unknown, field: string): ValidationResult<string | null | undefined> {
  if (value === undefined || value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== "string") {
    return { ok: false, error: `${field} must be a string or null` };
  }

  return { ok: true, value };
}

import { MaterialStatus, MaterialType } from "@/generated/prisma/enums";

export const MAX_MATERIAL_TITLE_LENGTH = 200;
export const MAX_MATERIAL_CONTENT_LENGTH = 10_000;
export const MAX_MATERIAL_SOURCE_LENGTH = 500;

type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

export function parseMaterialTitle(value: unknown): ValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "title must be a non-empty string" };
  }

  if (value.length > MAX_MATERIAL_TITLE_LENGTH) {
    return {
      ok: false,
      error: `title must be ${MAX_MATERIAL_TITLE_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() };
}

export function parseMaterialType(value: unknown): ValidationResult<MaterialType> {
  if (typeof value !== "string") {
    return { ok: false, error: "type must be a string" };
  }

  if (!Object.values(MaterialType).includes(value as MaterialType)) {
    return { ok: false, error: `invalid material type: ${value}` };
  }

  return { ok: true, value: value as MaterialType };
}

export function parseMaterialContent(value: unknown): ValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "content must be a non-empty string" };
  }

  if (value.length > MAX_MATERIAL_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `content must be ${MAX_MATERIAL_CONTENT_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() };
}

export function parseMaterialOptionalText(
  input: Record<string, unknown>,
  key: "source" | "projectId" | "ideaId"
): ValidationResult<string | null | undefined> {
  if (!(key in input)) {
    return { ok: true, value: undefined };
  }

  const value = input[key];

  if (value !== null && typeof value !== "string") {
    return { ok: false, error: `${key} must be a string or null` };
  }

  const maxLength = key === "source" ? MAX_MATERIAL_SOURCE_LENGTH : 100;
  if (typeof value === "string" && value.length > maxLength) {
    return {
      ok: false,
      error: `${key} must be ${maxLength} characters or fewer`,
    };
  }

  return { ok: true, value: typeof value === "string" ? value.trim() : null };
}

export function parseMaterialOptionalStatus(value: unknown): ValidationResult<MaterialStatus | undefined> {
  if (value === undefined || value === null) {
    return { ok: true, value: undefined };
  }

  if (typeof value !== "string") {
    return { ok: false, error: "status must be a string" };
  }

  if (!Object.values(MaterialStatus).includes(value as MaterialStatus)) {
    return { ok: false, error: `invalid material status: ${value}` };
  }

  return { ok: true, value: value as MaterialStatus };
}

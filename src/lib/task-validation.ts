export const MAX_TASK_TITLE_LENGTH = 200;
export const MAX_TASK_DESCRIPTION_LENGTH = 2_000;

type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

export function parseTaskTitle(value: unknown): ValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "title must be a non-empty string" };
  }

  if (value.length > MAX_TASK_TITLE_LENGTH) {
    return {
      ok: false,
      error: `title must be ${MAX_TASK_TITLE_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() };
}

export function parseTaskOptionalText(
  input: Record<string, unknown>,
  key: "description"
): ValidationResult<string | null | undefined> {
  if (!(key in input)) {
    return { ok: true, value: undefined };
  }

  const value = input[key];

  if (value !== null && typeof value !== "string") {
    return { ok: false, error: `${key} must be a string or null` };
  }

  if (typeof value === "string" && value.length > MAX_TASK_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `${key} must be ${MAX_TASK_DESCRIPTION_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: typeof value === "string" ? value.trim() : null };
}

export function parseTaskOptionalDate(
  input: Record<string, unknown>,
  key: "dueDate"
): ValidationResult<Date | null | undefined> {
  if (!(key in input)) {
    return { ok: true, value: undefined };
  }

  const value = input[key];

  if (value === null) {
    return { ok: true, value: null };
  }

  if (typeof value !== "string") {
    return { ok: false, error: `${key} must be an ISO date string or null` };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: `${key} must be a valid date` };
  }

  return { ok: true, value: date };
}

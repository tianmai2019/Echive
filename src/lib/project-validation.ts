export const MAX_PROJECT_TITLE_LENGTH = 200;
export const MAX_PROJECT_TEXT_LENGTH = 2_000;

type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: string;
    };

export function parseProjectTitle(value: unknown): ValidationResult<string> {
  if (typeof value !== "string" || value.trim().length === 0) {
    return { ok: false, error: "title must be a non-empty string" };
  }

  if (value.length > MAX_PROJECT_TITLE_LENGTH) {
    return {
      ok: false,
      error: `title must be ${MAX_PROJECT_TITLE_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: value.trim() };
}

export function parseProjectOptionalText(
  input: Record<string, unknown>,
  key: "description" | "goal"
): ValidationResult<string | null | undefined> {
  if (!(key in input)) {
    return { ok: true, value: undefined };
  }

  const value = input[key];

  if (value !== null && typeof value !== "string") {
    return { ok: false, error: `${key} must be a string or null` };
  }

  if (typeof value === "string" && value.length > MAX_PROJECT_TEXT_LENGTH) {
    return {
      ok: false,
      error: `${key} must be ${MAX_PROJECT_TEXT_LENGTH} characters or fewer`,
    };
  }

  return { ok: true, value: typeof value === "string" ? value.trim() : null };
}

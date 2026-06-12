import { describe, expect, test } from "vitest";

import {
  createErrorPayload,
  createSuccessPayload,
  errorResponse,
  paginatedResponse,
  successResponse,
} from "./api-response";

describe("api response payload helpers", () => {
  test("creates a success envelope", () => {
    const payload = createSuccessPayload({ id: "idea_1" });

    expect(payload).toEqual({
      success: true,
      data: { id: "idea_1" },
      error: null,
    });
  });

  test("creates an error envelope", () => {
    const payload = createErrorPayload("Validation failed");

    expect(payload).toEqual({
      success: false,
      data: null,
      error: "Validation failed",
    });
  });

  test("keeps pagination metadata when provided", () => {
    const payload = createSuccessPayload(["a", "b"], {
      total: 2,
      page: 1,
      limit: 10,
    });

    expect(payload.meta).toEqual({
      total: 2,
      page: 1,
      limit: 10,
    });
  });

  test("creates a JSON success response", async () => {
    const response = successResponse({ ok: true }, { status: 201 });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: { ok: true },
      error: null,
    });
  });

  test("creates a JSON error response", async () => {
    const response = errorResponse("Not found", { status: 404 });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Not found",
    });
  });

  test("creates a JSON paginated response", async () => {
    const response = paginatedResponse(["a"], {
      total: 1,
      page: 1,
      limit: 10,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: ["a"],
      error: null,
      meta: {
        total: 1,
        page: 1,
        limit: 10,
      },
    });
  });
});

import { ProjectStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { GET, POST } from "./route";

const TEST_PREFIX = "[projects-route-test]";

async function deleteTestProjects(): Promise<void> {
  await db.project.deleteMany({
    where: {
      title: {
        startsWith: TEST_PREFIX,
      },
    },
  });
}

function jsonRequest(body: unknown): Request {
  return new Request("http://localhost/api/projects", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("/api/projects", () => {
  beforeEach(async () => {
    await deleteTestProjects();
  });

  afterAll(async () => {
    await deleteTestProjects();
  });

  test("creates a project", async () => {
    const response = await POST(
      jsonRequest({
        title: `  ${TEST_PREFIX} Created  `,
        description: "  Description  ",
        goal: "  Goal  ",
      })
    );

    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        title: `${TEST_PREFIX} Created`,
        description: "Description",
        goal: "Goal",
        status: ProjectStatus.ACTIVE,
      }),
      error: null,
    });
    expect(response.status).toBe(201);
  });

  test("rejects an empty project title", async () => {
    const response = await POST(jsonRequest({ title: "   " }));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "title must be a non-empty string",
    });
    expect(response.status).toBe(400);
  });

  test("lists projects and supports status filtering", async () => {
    await POST(jsonRequest({ title: `${TEST_PREFIX} Active` }));
    const pausedResponse = await POST(jsonRequest({ title: `${TEST_PREFIX} Paused` }));
    const pausedProject = (await pausedResponse.json()).data as { id: string };
    await db.project.update({
      where: { id: pausedProject.id },
      data: { status: ProjectStatus.PAUSED },
    });

    const response = await GET(
      new Request(`http://localhost/api/projects?status=${ProjectStatus.PAUSED}`)
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: pausedProject.id, status: ProjectStatus.PAUSED }),
      ])
    );
    expect(
      (payload.data as Array<{ title: string; status: string }>).filter((project) =>
        project.title.startsWith(TEST_PREFIX)
      )
    ).toEqual([expect.objectContaining({ status: ProjectStatus.PAUSED })]);
  });

  test("rejects an invalid status filter", async () => {
    const response = await GET(new Request("http://localhost/api/projects?status=INVALID"));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Invalid project status",
    });
    expect(response.status).toBe(400);
  });
});

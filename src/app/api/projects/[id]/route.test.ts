import { ProjectStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import { createProject } from "@/lib/projects";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { GET, PATCH } from "./route";

const TEST_PREFIX = "[project-id-route-test]";

async function deleteTestProjects(): Promise<void> {
  await db.project.deleteMany({
    where: {
      title: {
        startsWith: TEST_PREFIX,
      },
    },
  });
}

function contextFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown): Request {
  return new Request("http://localhost/api/projects/project-id", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("/api/projects/[id]", () => {
  beforeEach(async () => {
    await deleteTestProjects();
  });

  afterAll(async () => {
    await deleteTestProjects();
  });

  test("gets a project with relations", async () => {
    const user = await getDemoUser();
    const project = await createProject({ title: `${TEST_PREFIX} Detail` });
    const idea = await db.idea.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: `${TEST_PREFIX} Idea`,
        rawInput: "Idea raw input",
      },
    });

    const response = await GET(new Request("http://localhost/api/projects/id"), contextFor(project.id));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      success: true,
      data: expect.objectContaining({
        id: project.id,
        ideas: expect.arrayContaining([expect.objectContaining({ id: idea.id })]),
      }),
      error: null,
    });
  });

  test("returns 404 for a missing project", async () => {
    const response = await GET(
      new Request("http://localhost/api/projects/missing"),
      contextFor("missing-project")
    );

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Project not found",
    });
    expect(response.status).toBe(404);
  });

  test("updates a project", async () => {
    const project = await createProject({ title: `${TEST_PREFIX} Before` });

    const response = await PATCH(
      patchRequest({
        title: `  ${TEST_PREFIX} After  `,
        description: "  Updated description  ",
        status: ProjectStatus.PAUSED,
      }),
      contextFor(project.id)
    );

    await expect(response.json()).resolves.toEqual({
      success: true,
      data: expect.objectContaining({
        id: project.id,
        title: `${TEST_PREFIX} After`,
        description: "Updated description",
        status: ProjectStatus.PAUSED,
      }),
      error: null,
    });
    expect(response.status).toBe(200);
  });

  test("rejects unsupported update fields", async () => {
    const project = await createProject({ title: `${TEST_PREFIX} Unsupported` });

    const response = await PATCH(patchRequest({ unsupported: true }), contextFor(project.id));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "No supported fields provided",
    });
    expect(response.status).toBe(400);
  });

  test("rejects invalid project status", async () => {
    const project = await createProject({ title: `${TEST_PREFIX} Invalid Status` });

    const response = await PATCH(patchRequest({ status: "INVALID" }), contextFor(project.id));

    await expect(response.json()).resolves.toEqual({
      success: false,
      data: null,
      error: "Invalid project status",
    });
    expect(response.status).toBe(400);
  });
});

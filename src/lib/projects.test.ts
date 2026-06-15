import { ProjectStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import {
  createProject,
  getProjectById,
  isProjectStatus,
  listProjects,
  updateProject,
} from "@/lib/projects";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

const TEST_PREFIX = "[projects-test]";

async function deleteTestProjects(): Promise<void> {
  await db.project.deleteMany({
    where: {
      title: {
        startsWith: TEST_PREFIX,
      },
    },
  });
}

describe("projects", () => {
  beforeEach(async () => {
    await deleteTestProjects();
  });

  afterAll(async () => {
    await deleteTestProjects();
  });

  test("validates project status values", () => {
    expect(isProjectStatus(ProjectStatus.ACTIVE)).toBe(true);
    expect(isProjectStatus(ProjectStatus.PAUSED)).toBe(true);
    expect(isProjectStatus("INVALID")).toBe(false);
  });

  test("creates a project for the demo user", async () => {
    const user = await getDemoUser();

    const project = await createProject({
      title: `  ${TEST_PREFIX} Create Project  `,
      description: "  Project description  ",
      goal: "  Project goal  ",
    });

    expect(project.title).toBe(`${TEST_PREFIX} Create Project`);
    expect(project.description).toBe("Project description");
    expect(project.goal).toBe("Project goal");
    expect(project.status).toBe(ProjectStatus.ACTIVE);
    expect(project.userId).toBe(user.id);
  });

  test("lists projects for the demo user by newest first", async () => {
    const olderProject = await createProject({ title: `${TEST_PREFIX} Older Project` });
    const newerProject = await createProject({ title: `${TEST_PREFIX} Newer Project` });

    const projects = await listProjects();
    const ids = projects.map((project) => project.id);

    expect(ids.indexOf(newerProject.id)).toBeLessThan(ids.indexOf(olderProject.id));
    expect(projects.some((project) => project.title === `${TEST_PREFIX} Newer Project`)).toBe(
      true
    );
  });

  test("filters projects by status", async () => {
    await createProject({ title: `${TEST_PREFIX} Active Project` });
    const pausedProject = await createProject({ title: `${TEST_PREFIX} Paused Project` });
    await updateProject(pausedProject.id, { status: ProjectStatus.PAUSED });

    const projects = await listProjects(ProjectStatus.PAUSED);

    expect(projects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: pausedProject.id, status: ProjectStatus.PAUSED }),
      ])
    );
    expect(projects.every((project) => project.status === ProjectStatus.PAUSED)).toBe(true);
  });

  test("gets a project with related ideas and tasks", async () => {
    const user = await getDemoUser();
    const project = await createProject({ title: `${TEST_PREFIX} Detail Project` });
    const idea = await db.idea.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: `${TEST_PREFIX} Related Idea`,
        rawInput: "Related idea raw input",
      },
    });
    const task = await db.task.create({
      data: {
        userId: user.id,
        projectId: project.id,
        title: `${TEST_PREFIX} Related Task`,
      },
    });

    const projectDetail = await getProjectById(project.id);

    expect(projectDetail?.id).toBe(project.id);
    expect(projectDetail?.ideas).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: idea.id })])
    );
    expect(projectDetail?.tasks).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: task.id })])
    );
  });

  test("returns null when updating a missing project", async () => {
    await expect(
      updateProject("missing-project-id", { title: `${TEST_PREFIX} Missing` })
    ).resolves.toBeNull();
  });
});

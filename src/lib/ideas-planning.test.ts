import { AIActionType, IdeaStatus } from "@/generated/prisma/enums";
import { getDemoUser } from "@/lib/demo-user";
import { db } from "@/lib/db";
import {
  IDEA_UPDATE_PROJECT_NOT_FOUND,
  generateTasksForIdea,
  updateIdea,
} from "@/lib/ideas";
import { createProject } from "@/lib/projects";
import { afterAll, beforeEach, describe, expect, test } from "vitest";

const TEST_PREFIX = "[ideas-planning-test]";

async function deleteTestData(): Promise<void> {
  await db.task.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  await db.aIActionLog.deleteMany({ where: { input: { contains: TEST_PREFIX } } });
  await db.idea.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
  await db.project.deleteMany({ where: { title: { startsWith: TEST_PREFIX } } });
}

async function createTestIdea(projectId?: string) {
  const user = await getDemoUser();

  return db.idea.create({
    data: {
      userId: user.id,
      projectId,
      title: `${TEST_PREFIX} Idea`,
      rawInput: `${TEST_PREFIX} Raw input for planning`,
      summary: `${TEST_PREFIX} Summary`,
      status: IdeaStatus.CLARIFIED,
    },
  });
}

describe("idea planning", () => {
  beforeEach(async () => {
    await deleteTestData();
  });

  afterAll(async () => {
    await deleteTestData();
  });

  test("associates an idea with a project", async () => {
    const project = await createProject({ title: `${TEST_PREFIX} Project` });
    const idea = await createTestIdea();

    const updatedIdea = await updateIdea(idea.id, { projectId: project.id });

    expect(updatedIdea?.projectId).toBe(project.id);
  });

  test("does not associate an idea with a missing project", async () => {
    const idea = await createTestIdea();

    await expect(updateIdea(idea.id, { projectId: "missing-project" })).rejects.toThrow(
      IDEA_UPDATE_PROJECT_NOT_FOUND
    );
  });

  test("generates tasks for a clarified idea and marks it planned", async () => {
    const project = await createProject({ title: `${TEST_PREFIX} Task Project` });
    const idea = await createTestIdea(project.id);

    const result = await generateTasksForIdea(idea.id);

    expect(result?.idea.status).toBe(IdeaStatus.PLANNED);
    expect(result?.tasks).toHaveLength(5);
    expect(result?.tasks.every((task) => task.projectId === project.id)).toBe(true);

    const actionLog = await db.aIActionLog.findFirst({
      where: {
        ideaId: idea.id,
        actionType: AIActionType.GENERATE_TASKS,
      },
    });

    expect(actionLog?.output).toContain("明确目标");
  });
});

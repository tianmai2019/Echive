import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(): void {
  const envPath = resolve(process.cwd(), ".env");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    process.env[key] ??= rawValue.trim().replace(/^["']|["']$/g, "");
  }
}

async function main(): Promise<void> {
  loadEnv();

  const { IdeaStatus, TaskPriority, TaskStatus } = await import(
    "../src/generated/prisma/enums"
  );
  const { db } = await import("../src/lib/db");
  const { createIdea, clarifyIdea, generateTasksForIdea, getIdeaById, updateIdea } =
    await import("../src/lib/ideas");
  const { createProject, getProjectById } = await import("../src/lib/projects");
  const { listTasks, updateTask } = await import("../src/lib/tasks");

  const tag = `[acceptance-day14] ${new Date().toISOString()}`;
  const idea = await createIdea(`${tag} Idea raw input`);

  if (idea.status !== IdeaStatus.CAPTURED) {
    throw new Error("Idea was not created as CAPTURED");
  }

  const clarified = await clarifyIdea(idea.id);

  if (!clarified || clarified.idea.status !== IdeaStatus.CLARIFIED) {
    throw new Error("Idea was not clarified to CLARIFIED");
  }

  const project = await createProject({
    title: `${tag} Project`,
    description: "Acceptance project for Week 2 Planning closure.",
  });
  const linkedIdea = await updateIdea(idea.id, { projectId: project.id });

  if (!linkedIdea || linkedIdea.projectId !== project.id) {
    throw new Error("Idea was not linked to the project");
  }

  const generated = await generateTasksForIdea(idea.id);

  if (!generated || generated.idea.status !== IdeaStatus.PLANNED) {
    throw new Error("Idea was not moved to PLANNED after task generation");
  }

  if (generated.tasks.length < 3 || generated.tasks.length > 5) {
    throw new Error("Task generator did not create 3-5 tasks");
  }

  const firstTask = generated.tasks[0];
  const updatedTask = await updateTask(firstTask.id, {
    status: TaskStatus.DOING,
    priority: TaskPriority.HIGH,
  });

  if (
    !updatedTask ||
    updatedTask.status !== TaskStatus.DOING ||
    updatedTask.priority !== TaskPriority.HIGH
  ) {
    throw new Error("Task status/priority update failed");
  }

  const projectDetail = await getProjectById(project.id);

  if (!projectDetail) {
    throw new Error("Project detail was not found");
  }

  if (projectDetail.ideas.length < 1) {
    throw new Error("Project does not aggregate the linked idea");
  }

  if (projectDetail.tasks.length < generated.tasks.length) {
    throw new Error("Project does not aggregate generated tasks");
  }

  const projectTasks = await listTasks({ projectId: project.id });

  if (projectTasks.length < generated.tasks.length) {
    throw new Error("Tasks projectId filter did not return generated tasks");
  }

  const finalIdea = await getIdeaById(idea.id);

  console.log(
    JSON.stringify(
      {
        ok: true,
        ideaId: idea.id,
        projectId: project.id,
        taskCount: generated.tasks.length,
        finalIdeaStatus: finalIdea?.status,
        updatedTaskStatus: updatedTask.status,
        updatedTaskPriority: updatedTask.priority,
        projectIdeas: projectDetail.ideas.length,
        projectTasks: projectDetail.tasks.length,
      },
      null,
      2
    )
  );

  await db.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Planning verification failed");
  process.exit(1);
});

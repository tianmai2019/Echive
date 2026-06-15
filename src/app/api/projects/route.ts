import { errorResponse, successResponse } from "@/lib/api-response";
import { parseProjectOptionalText, parseProjectTitle } from "@/lib/project-validation";
import { createProject, isProjectStatus, listProjects } from "@/lib/projects";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const selectedStatus = status && isProjectStatus(status) ? status : undefined;

  if (status && !selectedStatus) {
    return errorResponse("Invalid project status", { status: 400 });
  }
  const projects = await listProjects(selectedStatus);

  return successResponse(projects);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", { status: 400 });
  }

  if (!body || typeof body !== "object" || !("title" in body)) {
    return errorResponse("title is required", { status: 400 });
  }

  const input = body as Record<string, unknown>;

  const title = parseProjectTitle(input.title);

  if (!title.ok) {
    return errorResponse(title.error, { status: 400 });
  }

  const description = parseProjectOptionalText(input, "description");
  if (!description.ok) {
    return errorResponse(description.error, { status: 400 });
  }

  const goal = parseProjectOptionalText(input, "goal");
  if (!goal.ok) {
    return errorResponse(goal.error, { status: 400 });
  }

  const project = await createProject({
    title: title.value,
    description: description.value,
    goal: goal.value,
  });

  return successResponse(project, { status: 201 });
}

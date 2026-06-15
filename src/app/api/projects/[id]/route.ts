import { errorResponse, successResponse } from "@/lib/api-response";
import { parseProjectOptionalText, parseProjectTitle } from "@/lib/project-validation";
import { getProjectById, isProjectStatus, updateProject } from "@/lib/projects";

interface ProjectRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: ProjectRouteContext) {
  const { id } = await context.params;
  const project = await getProjectById(id);

  if (!project) {
    return errorResponse("Project not found", { status: 404 });
  }

  return successResponse(project);
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { id } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return errorResponse("Request body is required", { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updateData: Parameters<typeof updateProject>[1] = {};

  if ("title" in input) {
    const title = parseProjectTitle(input.title);

    if (!title.ok) {
      return errorResponse(title.error, { status: 400 });
    }

    updateData.title = title.value;
  }

  const description = parseProjectOptionalText(input, "description");
  if (!description.ok) {
    return errorResponse(description.error, { status: 400 });
  }
  if (description.value !== undefined) {
    updateData.description = description.value;
  }

  const goal = parseProjectOptionalText(input, "goal");
  if (!goal.ok) {
    return errorResponse(goal.error, { status: 400 });
  }
  if (goal.value !== undefined) {
    updateData.goal = goal.value;
  }

  if ("status" in input) {
    if (typeof input.status !== "string" || !isProjectStatus(input.status)) {
      return errorResponse("Invalid project status", { status: 400 });
    }

    updateData.status = input.status;
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No supported fields provided", { status: 400 });
  }

  const project = await updateProject(id, updateData);

  if (!project) {
    return errorResponse("Project not found", { status: 404 });
  }

  return successResponse(project);
}

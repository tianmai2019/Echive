import { errorResponse, successResponse } from "@/lib/api-response";
import { getIdeaById, isIdeaStatus, updateIdea } from "@/lib/ideas";

interface IdeaRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: IdeaRouteContext) {
  const { id } = await context.params;
  const idea = await getIdeaById(id);

  if (!idea) {
    return errorResponse("Idea not found", { status: 404 });
  }

  return successResponse(idea);
}

export async function PATCH(request: Request, context: IdeaRouteContext) {
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
  const updateData: Parameters<typeof updateIdea>[1] = {};

  if ("title" in input) {
    if (typeof input.title !== "string" || input.title.trim().length === 0) {
      return errorResponse("title must be a non-empty string", { status: 400 });
    }

    updateData.title = input.title.trim();
  }

  if ("summary" in input) {
    if (input.summary !== null && typeof input.summary !== "string") {
      return errorResponse("summary must be a string or null", { status: 400 });
    }

    updateData.summary = typeof input.summary === "string" ? input.summary.trim() : null;
  }

  if ("nextAction" in input) {
    if (input.nextAction !== null && typeof input.nextAction !== "string") {
      return errorResponse("nextAction must be a string or null", { status: 400 });
    }

    updateData.nextAction =
      typeof input.nextAction === "string" ? input.nextAction.trim() : null;
  }

  if ("status" in input) {
    if (typeof input.status !== "string" || !isIdeaStatus(input.status)) {
      return errorResponse("Invalid idea status", { status: 400 });
    }

    updateData.status = input.status;
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No supported fields provided", { status: 400 });
  }

  const idea = await updateIdea(id, updateData);

  if (!idea) {
    return errorResponse("Idea not found", { status: 404 });
  }

  return successResponse(idea);
}

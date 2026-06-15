import { errorResponse, successResponse } from "@/lib/api-response";
import {
  IDEA_TASK_GENERATION_INVALID_STATUS,
  generateTasksForIdea,
} from "@/lib/ideas";

interface GenerateTasksRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: GenerateTasksRouteContext) {
  const { id } = await context.params;
  let result: Awaited<ReturnType<typeof generateTasksForIdea>>;

  try {
    result = await generateTasksForIdea(id);
  } catch (error) {
    if (error instanceof Error && error.message === IDEA_TASK_GENERATION_INVALID_STATUS) {
      return errorResponse("Idea must be clarified before generating tasks", {
        status: 400,
      });
    }

    throw error;
  }

  if (!result) {
    return errorResponse("Idea not found", { status: 404 });
  }

  return successResponse(result, { status: 201 });
}

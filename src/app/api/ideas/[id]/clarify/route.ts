import { errorResponse, successResponse } from "@/lib/api-response";
import { clarifyIdea } from "@/lib/ideas";

interface ClarifyRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: ClarifyRouteContext) {
  const { id } = await context.params;
  const result = await clarifyIdea(id);

  if (!result) {
    return errorResponse("Idea not found", { status: 404 });
  }

  return successResponse(result);
}

import { errorResponse, successResponse } from "@/lib/api-response";
import { createIdea, isIdeaStatus, listIdeas } from "@/lib/ideas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  if (status && !isIdeaStatus(status)) {
    return errorResponse("Invalid idea status", { status: 400 });
  }

  const selectedStatus = status && isIdeaStatus(status) ? status : undefined;
  const ideas = await listIdeas(selectedStatus);

  return successResponse(ideas);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", { status: 400 });
  }

  if (!body || typeof body !== "object" || !("rawInput" in body)) {
    return errorResponse("rawInput is required", { status: 400 });
  }

  const rawInput = (body as { rawInput: unknown }).rawInput;

  if (typeof rawInput !== "string" || rawInput.trim().length === 0) {
    return errorResponse("rawInput must be a non-empty string", { status: 400 });
  }

  if (rawInput.length > 4_000) {
    return errorResponse("rawInput must be 4000 characters or fewer", {
      status: 400,
    });
  }

  const idea = await createIdea(rawInput);

  return successResponse(idea, { status: 201 });
}

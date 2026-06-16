import { errorResponse, successResponse } from "@/lib/api-response";
import {
  parseDraftContent,
  parseDraftFormat,
  parseDraftOptionalOutline,
  parseDraftOptionalStatus,
  parseDraftTitle,
} from "@/lib/draft-validation";
import { getDraftById, updateDraft } from "@/lib/drafts";

interface DraftRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: DraftRouteContext) {
  const { id } = await context.params;
  const draft = await getDraftById(id);

  if (!draft) {
    return errorResponse("Draft not found", { status: 404 });
  }

  return successResponse(draft);
}

export async function PATCH(request: Request, context: DraftRouteContext) {
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
  const updateData: Parameters<typeof updateDraft>[1] = {};

  if ("title" in input) {
    const title = parseDraftTitle(input.title);
    if (!title.ok) {
      return errorResponse(title.error, { status: 400 });
    }
    updateData.title = title.value;
  }

  if ("format" in input) {
    const format = parseDraftFormat(input.format);
    if (!format.ok) {
      return errorResponse(format.error, { status: 400 });
    }
    updateData.format = format.value;
  }

  if ("content" in input) {
    const content = parseDraftContent(input.content);
    if (!content.ok) {
      return errorResponse(content.error, { status: 400 });
    }
    updateData.content = content.value;
  }

  const outline = parseDraftOptionalOutline(input.outline);
  if (!outline.ok) {
    return errorResponse(outline.error, { status: 400 });
  }
  if (outline.value !== undefined) {
    updateData.outline = outline.value;
  }

  const status = parseDraftOptionalStatus(input.status);
  if (!status.ok) {
    return errorResponse(status.error, { status: 400 });
  }
  if (status.value !== undefined) {
    updateData.status = status.value;
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No supported fields provided", { status: 400 });
  }

  const draft = await updateDraft(id, updateData);

  if (!draft) {
    return errorResponse("Draft not found", { status: 404 });
  }

  return successResponse(draft);
}

import { errorResponse, successResponse } from "@/lib/api-response";
import {
  parseDraftContent,
  parseDraftFormat,
  parseDraftOptionalId,
  parseDraftOptionalOutline,
  parseDraftOptionalStatus,
  parseDraftTitle,
} from "@/lib/draft-validation";
import { createDraft, isDraftFormat, isDraftStatus, listDrafts } from "@/lib/drafts";
import { getDraftGenerator } from "@/lib/ai/draft-generator";
import { db } from "@/lib/db";
import { getDemoUser } from "@/lib/demo-user";
import { AIActionType } from "@/generated/prisma/enums";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const format = searchParams.get("format");

  const selectedStatus = status && isDraftStatus(status) ? status : undefined;
  const selectedFormat = format && isDraftFormat(format) ? format : undefined;

  if (status && !selectedStatus) {
    return errorResponse("Invalid draft status", { status: 400 });
  }

  if (format && !selectedFormat) {
    return errorResponse("Invalid draft format", { status: 400 });
  }

  const drafts = await listDrafts(selectedStatus);

  return successResponse(drafts);
}

export async function POST(request: Request) {
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

  if (!("title" in input) || !("format" in input) || !("content" in input)) {
    return errorResponse("title, format, and content are required", { status: 400 });
  }

  const title = parseDraftTitle(input.title);
  if (!title.ok) {
    return errorResponse(title.error, { status: 400 });
  }

  const format = parseDraftFormat(input.format);
  if (!format.ok) {
    return errorResponse(format.error, { status: 400 });
  }

  const content = parseDraftContent(input.content);
  if (!content.ok) {
    return errorResponse(content.error, { status: 400 });
  }

  const outline = parseDraftOptionalOutline(input.outline);
  if (!outline.ok) {
    return errorResponse(outline.error, { status: 400 });
  }

  const status = parseDraftOptionalStatus(input.status);
  if (!status.ok) {
    return errorResponse(status.error, { status: 400 });
  }

  const ideaId = parseDraftOptionalId(input.ideaId, "ideaId");
  if (!ideaId.ok) {
    return errorResponse(ideaId.error, { status: 400 });
  }

  const projectId = parseDraftOptionalId(input.projectId, "projectId");
  if (!projectId.ok) {
    return errorResponse(projectId.error, { status: 400 });
  }

  const draft = await createDraft({
    title: title.value,
    format: format.value,
    content: content.value,
    outline: outline.value,
    status: status.value,
    ideaId: ideaId.value,
    projectId: projectId.value,
  });

  return successResponse(draft, { status: 201 });
}

export async function GENERATE(request: Request) {
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

  if (!("ideaId" in input) || !("format" in input)) {
    return errorResponse("ideaId and format are required", { status: 400 });
  }

  if (typeof input.ideaId !== "string") {
    return errorResponse("ideaId must be a string", { status: 400 });
  }

  const format = parseDraftFormat(input.format);
  if (!format.ok) {
    return errorResponse(format.error, { status: 400 });
  }

  const user = await getDemoUser();
  const generator = getDraftGenerator();

  const result = await generator.generate({
    ideaId: input.ideaId,
    format: format.value,
  });

  const draft = await createDraft({
    title: result.title,
    format: format.value,
    outline: result.outline,
    content: result.content,
    ideaId: input.ideaId,
  });

  await db.aIActionLog.create({
    data: {
      userId: user.id,
      draftId: draft.id,
      actionType: AIActionType.GENERATE_DRAFT,
      input: JSON.stringify({ ideaId: input.ideaId, format: format.value }),
      output: JSON.stringify(result),
    },
  });

  return successResponse(draft, { status: 201 });
}

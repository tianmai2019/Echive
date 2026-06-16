import { errorResponse, successResponse } from "@/lib/api-response";
import {
  parseMaterialContent,
  parseMaterialOptionalStatus,
  parseMaterialOptionalText,
  parseMaterialTitle,
  parseMaterialType,
} from "@/lib/material-validation";
import { createMaterial, isMaterialStatus, isMaterialType, listMaterials } from "@/lib/materials";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const projectId = searchParams.get("projectId");
  const ideaId = searchParams.get("ideaId");

  const selectedStatus = status && isMaterialStatus(status) ? status : undefined;
  const selectedType = type && isMaterialType(type) ? type : undefined;

  if (status && !selectedStatus) {
    return errorResponse("Invalid material status", { status: 400 });
  }

  if (type && !selectedType) {
    return errorResponse("Invalid material type", { status: 400 });
  }

  const materials = await listMaterials({
    status: selectedStatus,
    type: selectedType,
    projectId: projectId ?? undefined,
    ideaId: ideaId ?? undefined,
  });

  return successResponse(materials);
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

  if (!("title" in input) || !("type" in input) || !("content" in input)) {
    return errorResponse("title, type, and content are required", { status: 400 });
  }

  const title = parseMaterialTitle(input.title);
  if (!title.ok) {
    return errorResponse(title.error, { status: 400 });
  }

  const type = parseMaterialType(input.type);
  if (!type.ok) {
    return errorResponse(type.error, { status: 400 });
  }

  const content = parseMaterialContent(input.content);
  if (!content.ok) {
    return errorResponse(content.error, { status: 400 });
  }

  const source = parseMaterialOptionalText(input, "source");
  if (!source.ok) {
    return errorResponse(source.error, { status: 400 });
  }

  const status = parseMaterialOptionalStatus(input.status);
  if (!status.ok) {
    return errorResponse(status.error, { status: 400 });
  }

  const projectId = parseMaterialOptionalText(input, "projectId");
  if (!projectId.ok) {
    return errorResponse(projectId.error, { status: 400 });
  }

  const ideaId = parseMaterialOptionalText(input, "ideaId");
  if (!ideaId.ok) {
    return errorResponse(ideaId.error, { status: 400 });
  }

  const material = await createMaterial({
    title: title.value,
    type: type.value,
    content: content.value,
    source: source.value,
    status: status.value,
    projectId: projectId.value,
    ideaId: ideaId.value,
  });

  return successResponse(material, { status: 201 });
}

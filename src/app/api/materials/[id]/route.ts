import { errorResponse, successResponse } from "@/lib/api-response";
import {
  parseMaterialContent,
  parseMaterialOptionalStatus,
  parseMaterialOptionalText,
  parseMaterialTitle,
  parseMaterialType,
} from "@/lib/material-validation";
import { updateMaterial } from "@/lib/materials";

interface MaterialRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: MaterialRouteContext) {
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
  const updateData: Parameters<typeof updateMaterial>[1] = {};

  if ("title" in input) {
    const title = parseMaterialTitle(input.title);
    if (!title.ok) {
      return errorResponse(title.error, { status: 400 });
    }
    updateData.title = title.value;
  }

  if ("type" in input) {
    const type = parseMaterialType(input.type);
    if (!type.ok) {
      return errorResponse(type.error, { status: 400 });
    }
    updateData.type = type.value;
  }

  if ("content" in input) {
    const content = parseMaterialContent(input.content);
    if (!content.ok) {
      return errorResponse(content.error, { status: 400 });
    }
    updateData.content = content.value;
  }

  const source = parseMaterialOptionalText(input, "source");
  if (!source.ok) {
    return errorResponse(source.error, { status: 400 });
  }
  if (source.value !== undefined) {
    updateData.source = source.value;
  }

  if ("status" in input) {
    const status = parseMaterialOptionalStatus(input.status);
    if (!status.ok) {
      return errorResponse(status.error, { status: 400 });
    }
    if (status.value !== undefined) {
      updateData.status = status.value;
    }
  }

  const projectId = parseMaterialOptionalText(input, "projectId");
  if (!projectId.ok) {
    return errorResponse(projectId.error, { status: 400 });
  }
  if (projectId.value !== undefined) {
    updateData.projectId = projectId.value;
  }

  const ideaId = parseMaterialOptionalText(input, "ideaId");
  if (!ideaId.ok) {
    return errorResponse(ideaId.error, { status: 400 });
  }
  if (ideaId.value !== undefined) {
    updateData.ideaId = ideaId.value;
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No supported fields provided", { status: 400 });
  }

  const material = await updateMaterial(id, updateData);

  if (!material) {
    return errorResponse("Material not found", { status: 404 });
  }

  return successResponse(material);
}

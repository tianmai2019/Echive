import { errorResponse, successResponse } from "@/lib/api-response";
import {
  parseTaskOptionalDate,
  parseTaskOptionalText,
  parseTaskTitle,
} from "@/lib/task-validation";
import { isTaskPriority, isTaskStatus, updateTask } from "@/lib/tasks";

interface TaskRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: TaskRouteContext) {
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
  const updateData: Parameters<typeof updateTask>[1] = {};

  if ("title" in input) {
    const title = parseTaskTitle(input.title);

    if (!title.ok) {
      return errorResponse(title.error, { status: 400 });
    }

    updateData.title = title.value;
  }

  const description = parseTaskOptionalText(input, "description");
  if (!description.ok) {
    return errorResponse(description.error, { status: 400 });
  }
  if (description.value !== undefined) {
    updateData.description = description.value;
  }

  if ("status" in input) {
    if (typeof input.status !== "string" || !isTaskStatus(input.status)) {
      return errorResponse("Invalid task status", { status: 400 });
    }

    updateData.status = input.status;
  }

  if ("priority" in input) {
    if (typeof input.priority !== "string" || !isTaskPriority(input.priority)) {
      return errorResponse("Invalid task priority", { status: 400 });
    }

    updateData.priority = input.priority;
  }

  const dueDate = parseTaskOptionalDate(input, "dueDate");
  if (!dueDate.ok) {
    return errorResponse(dueDate.error, { status: 400 });
  }
  if (dueDate.value !== undefined) {
    updateData.dueDate = dueDate.value;
  }

  if (Object.keys(updateData).length === 0) {
    return errorResponse("No supported fields provided", { status: 400 });
  }

  const task = await updateTask(id, updateData);

  if (!task) {
    return errorResponse("Task not found", { status: 404 });
  }

  return successResponse(task);
}

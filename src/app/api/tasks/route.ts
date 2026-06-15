import { errorResponse, successResponse } from "@/lib/api-response";
import { isTaskPriority, isTaskStatus, listTasks, type TaskView } from "@/lib/tasks";

function parseTaskView(value: string | null): TaskView | undefined | Response {
  if (!value) {
    return undefined;
  }

  if (value === "today" || value === "thisWeek") {
    return value;
  }

  return errorResponse("Invalid task view", { status: 400 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const projectId = searchParams.get("projectId");
  const view = parseTaskView(searchParams.get("view"));

  if (view instanceof Response) {
    return view;
  }

  const selectedStatus = status && isTaskStatus(status) ? status : undefined;
  const selectedPriority = priority && isTaskPriority(priority) ? priority : undefined;

  if (status && !selectedStatus) {
    return errorResponse("Invalid task status", { status: 400 });
  }

  if (priority && !selectedPriority) {
    return errorResponse("Invalid task priority", { status: 400 });
  }

  const tasks = await listTasks({
    status: selectedStatus,
    priority: selectedPriority,
    projectId: projectId || undefined,
    view,
  });

  return successResponse(tasks);
}

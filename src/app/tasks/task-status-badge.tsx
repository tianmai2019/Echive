import type { TaskStatus as TaskStatusValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABELS } from "@/lib/task-metadata";

const taskStatusVariants: Record<
  TaskStatusValue,
  "default" | "secondary" | "destructive" | "outline"
> = {
  TODO: "secondary",
  DOING: "default",
  BLOCKED: "destructive",
  DONE: "outline",
};

interface TaskStatusBadgeProps {
  status: TaskStatusValue;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return <Badge variant={taskStatusVariants[status]}>{TASK_STATUS_LABELS[status]}</Badge>;
}

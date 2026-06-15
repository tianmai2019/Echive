import type { TaskPriority as TaskPriorityValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITY_LABELS } from "@/lib/task-metadata";

const taskPriorityVariants: Record<
  TaskPriorityValue,
  "default" | "secondary" | "outline"
> = {
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "default",
};

interface TaskPriorityBadgeProps {
  priority: TaskPriorityValue;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  return <Badge variant={taskPriorityVariants[priority]}>优先级 {TASK_PRIORITY_LABELS[priority]}</Badge>;
}

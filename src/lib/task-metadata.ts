import {
  TaskPriority,
  TaskStatus,
  type TaskPriority as TaskPriorityValue,
  type TaskStatus as TaskStatusValue,
} from "@/generated/prisma/enums";

export const TASK_STATUS_OPTIONS = Object.values(TaskStatus);
export const TASK_PRIORITY_OPTIONS = Object.values(TaskPriority);

export const TASK_STATUS_LABELS: Record<TaskStatusValue, string> = {
  TODO: "待办",
  DOING: "进行中",
  BLOCKED: "阻塞",
  DONE: "完成",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriorityValue, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};

export type TaskView = "today" | "thisWeek";

export const TASK_VIEW_LABELS: Record<TaskView, string> = {
  today: "今日",
  thisWeek: "本周",
};

export function isTaskStatus(value: string): value is TaskStatusValue {
  return TASK_STATUS_OPTIONS.includes(value as TaskStatusValue);
}

export function isTaskPriority(value: string): value is TaskPriorityValue {
  return TASK_PRIORITY_OPTIONS.includes(value as TaskPriorityValue);
}

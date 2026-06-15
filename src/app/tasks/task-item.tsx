"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";

import type {
  TaskPriority as TaskPriorityValue,
  TaskStatus as TaskStatusValue,
} from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import type { TaskListItem } from "@/lib/tasks";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/task-metadata";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
});

function toDateInputValue(date: Date | null): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDueDatePayload(dateValue: string): string | null {
  if (!dateValue) {
    return null;
  }

  return new Date(`${dateValue}T00:00:00`).toISOString();
}

interface TaskItemProps {
  task: TaskListItem;
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatusValue>(task.status);
  const [priority, setPriority] = useState<TaskPriorityValue>(task.priority);
  const [dueDate, setDueDate] = useState(toDateInputValue(task.dueDate));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function patchTask(payload: Record<string, unknown>): Promise<boolean> {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(result.error ?? "更新任务失败。");
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setError("更新任务失败。");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(nextStatus: string) {
    if (!isTaskStatus(nextStatus)) {
      setError("无效任务状态。");
      return;
    }

    const previous = status;
    setStatus(nextStatus);

    const ok = await patchTask({ status: nextStatus });
    if (!ok) {
      setStatus(previous);
    }
  }

  async function handlePriorityChange(nextPriority: string) {
    if (!isTaskPriority(nextPriority)) {
      setError("无效任务优先级。");
      return;
    }

    const previous = priority;
    setPriority(nextPriority);

    const ok = await patchTask({ priority: nextPriority });
    if (!ok) {
      setPriority(previous);
    }
  }

  async function handleDueDateChange(nextDueDate: string) {
    const previous = dueDate;
    setDueDate(nextDueDate);

    const ok = await patchTask({ dueDate: toDueDatePayload(nextDueDate) });
    if (!ok) {
      setDueDate(previous);
    }
  }

  return (
    <article className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md hover:shadow-slate-950/8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={status} />
            <TaskPriorityBadge priority={priority} />
            {task.dueDate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                <CalendarDays className="size-3" />
                {dateFormatter.format(task.dueDate)}
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">
              {task.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {task.description ?? "暂无任务描述。"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {task.project ? (
              <Link
                href={`/projects/${task.project.id}`}
                className="rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
              >
                Project · {task.project.title}
              </Link>
            ) : null}
            {task.idea ? (
              <Link
                href={`/inbox/${task.idea.id}`}
                className="rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
              >
                Idea · {task.idea.title}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:w-md">
          <label className="space-y-1 text-xs font-medium text-slate-600">
            状态
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {TASK_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TASK_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-slate-600">
            优先级
            <select
              value={priority}
              onChange={(event) => handlePriorityChange(event.target.value)}
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {TASK_PRIORITY_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-slate-600">
            截止日期
            <input
              type="date"
              value={dueDate}
              onChange={(event) => handleDueDateChange(event.target.value)}
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          </label>
        </div>
      </div>

      <div className="mt-3 flex min-h-5 items-center justify-between gap-3">
        <p className="text-xs text-destructive" aria-live="polite">
          {error}
        </p>
        {isSaving ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Loader2 className="size-3 animate-spin" />
            保存中
          </span>
        ) : dueDate ? (
          <Button type="button" size="xs" variant="ghost" onClick={() => handleDueDateChange("")}>清除日期</Button>
        ) : null}
      </div>
    </article>
  );
}

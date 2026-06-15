import Link from "next/link";
import { connection } from "next/server";
import { CheckSquare, ListChecks } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listProjects } from "@/lib/projects";
import { listTasks, type TaskView } from "@/lib/tasks";
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_LABELS,
  TASK_STATUS_OPTIONS,
  TASK_VIEW_LABELS,
  isTaskPriority,
  isTaskStatus,
} from "@/lib/task-metadata";
import { TaskItem } from "./task-item";

interface TasksPageProps {
  searchParams: Promise<{
    status?: string | string[];
    priority?: string | string[];
    projectId?: string | string[];
    view?: string | string[];
  }>;
}

function getParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isTaskView(value?: string): value is TaskView {
  return value === "today" || value === "thisWeek";
}

function buildTasksHref(params: {
  status?: string;
  priority?: string;
  view?: string;
  projectId?: string;
}): string {
  const searchParams = new URLSearchParams();

  if (params.view) {
    searchParams.set("view", params.view);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.priority) {
    searchParams.set("priority", params.priority);
  }

  if (params.projectId) {
    searchParams.set("projectId", params.projectId);
  }

  const query = searchParams.toString();
  return query ? `/tasks?${query}` : "/tasks";
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  await connection();

  const params = await searchParams;
  const statusParam = getParam(params.status);
  const priorityParam = getParam(params.priority);
  const viewParam = getParam(params.view);
  const projectIdParam = getParam(params.projectId);
  const selectedStatus = statusParam && isTaskStatus(statusParam) ? statusParam : undefined;
  const selectedPriority =
    priorityParam && isTaskPriority(priorityParam) ? priorityParam : undefined;
  const selectedView = isTaskView(viewParam) ? viewParam : undefined;
  const projects = await listProjects();
  const selectedProjectId = projects.some((project) => project.id === projectIdParam)
    ? projectIdParam
    : undefined;
  const tasks = await listTasks({
    status: selectedStatus,
    priority: selectedPriority,
    projectId: selectedProjectId,
    view: selectedView,
  });

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div>
          <Badge className="w-fit">Milestone 3</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Tasks
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            把澄清后的想法拆解成可执行任务，并通过状态、优先级和截止日期推进执行。
          </p>
        </div>

        <Card className="min-h-128 border-none bg-white/84 shadow-xl shadow-slate-950/10">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="size-5 text-primary" />
                  Task 列表
                </CardTitle>
                <CardDescription className="mt-2">
                  当前共 {tasks.length} 个
                  {selectedView ? ` ${TASK_VIEW_LABELS[selectedView]}` : ""}任务。
                </CardDescription>
              </div>

              <div className="space-y-3 xl:max-w-2xl">
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedView ? "outline" : "default"}
                  >
                    <Link
                      href={buildTasksHref({
                        status: selectedStatus,
                        priority: selectedPriority,
                        projectId: selectedProjectId,
                      })}
                    >
                      全部
                    </Link>
                  </Button>
                  {(["today", "thisWeek"] as const).map((view) => (
                    <Button
                      key={view}
                      asChild
                      size="sm"
                      variant={selectedView === view ? "default" : "outline"}
                    >
                      <Link
                        href={buildTasksHref({
                          view,
                          status: selectedStatus,
                          priority: selectedPriority,
                          projectId: selectedProjectId,
                        })}
                      >
                        {TASK_VIEW_LABELS[view]}
                      </Link>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedStatus ? "outline" : "secondary"}
                  >
                    <Link
                      href={buildTasksHref({
                        view: selectedView,
                        priority: selectedPriority,
                        projectId: selectedProjectId,
                      })}
                    >
                      全部状态
                    </Link>
                  </Button>
                  {TASK_STATUS_OPTIONS.map((status) => (
                    <Button
                      key={status}
                      asChild
                      size="sm"
                      variant={selectedStatus === status ? "default" : "outline"}
                    >
                      <Link
                        href={buildTasksHref({
                          view: selectedView,
                          status,
                          priority: selectedPriority,
                          projectId: selectedProjectId,
                        })}
                      >
                        {TASK_STATUS_LABELS[status]}
                      </Link>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedPriority ? "outline" : "secondary"}
                  >
                    <Link
                      href={buildTasksHref({
                        view: selectedView,
                        status: selectedStatus,
                        projectId: selectedProjectId,
                      })}
                    >
                      全部优先级
                    </Link>
                  </Button>
                  {TASK_PRIORITY_OPTIONS.map((priority) => (
                    <Button
                      key={priority}
                      asChild
                      size="sm"
                      variant={selectedPriority === priority ? "default" : "outline"}
                    >
                      <Link
                        href={buildTasksHref({
                          view: selectedView,
                          status: selectedStatus,
                          priority,
                          projectId: selectedProjectId,
                        })}
                      >
                        {TASK_PRIORITY_LABELS[priority]}
                      </Link>
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedProjectId ? "outline" : "secondary"}
                  >
                    <Link
                      href={buildTasksHref({
                        view: selectedView,
                        status: selectedStatus,
                        priority: selectedPriority,
                      })}
                    >
                      全部项目
                    </Link>
                  </Button>
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      asChild
                      size="sm"
                      variant={selectedProjectId === project.id ? "default" : "outline"}
                    >
                      <Link
                        href={buildTasksHref({
                          view: selectedView,
                          status: selectedStatus,
                          priority: selectedPriority,
                          projectId: project.id,
                        })}
                      >
                        {project.title}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-8 text-center">
                <CheckSquare className="size-10 text-slate-400" />
                <p className="mt-4 text-sm font-medium text-slate-950">
                  暂无任务
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  从已澄清的 Idea 生成 Task 后，这里会展示可执行任务列表。
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

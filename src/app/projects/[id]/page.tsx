import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  CalendarClock,
  CheckSquare,
  FileText,
  Inbox,
  Layers3,
  Target,
} from "lucide-react";

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
import { getProjectById } from "@/lib/projects";
import { ProjectStatusBadge } from "../project-status-badge";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const compactDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
});

const ideaStatusLabels: Record<string, string> = {
  CAPTURED: "待澄清",
  CLARIFIED: "已澄清",
  PLANNED: "已规划",
  ARCHIVED: "已归档",
};

const taskStatusLabels: Record<string, string> = {
  TODO: "待办",
  DOING: "进行中",
  BLOCKED: "阻塞",
  DONE: "完成",
};

const taskPriorityLabels: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  await connection();

  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <AppShell>
        <section className="flex flex-1 items-center justify-center p-5 md:p-8">
          <Card className="w-full max-w-xl border-none bg-white/84 text-center shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle>Project 不存在</CardTitle>
              <CardDescription>
                这个项目可能已被删除，或不属于当前 demo user。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/projects">返回 Projects</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <Button asChild variant="outline">
            <Link href="/projects">
              <ArrowLeft />
              返回 Projects
            </Link>
          </Button>
          <ProjectStatusBadge status={project.status} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.16fr_0.84fr]">
          <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="gap-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <CalendarClock className="size-4" />
                创建于 {dateFormatter.format(project.createdAt)}
                <span className="text-slate-300">/</span>
                更新于 {dateFormatter.format(project.updatedAt)}
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl leading-tight tracking-tight">
                  {project.title}
                </CardTitle>
                <CardDescription className="text-base leading-7">
                  {project.description ?? "尚未补充项目描述。"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-950">
                  <Target className="size-4 text-primary" />
                  阶段目标
                </p>
                <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-sm leading-7 text-slate-700">
                  {project.goal ?? "等待补充一个可验收的阶段目标。"}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ideas
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">
                    {project.ideas.length}
                  </p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Tasks
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">
                    {project.tasks.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Inbox className="size-5 text-primary" />
                  关联 Ideas
                </CardTitle>
                <CardDescription>
                  来自 Inbox 的想法会在 Day 10 支持主动关联到 Project。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.ideas.length > 0 ? (
                  <div className="space-y-2">
                    {project.ideas.map((idea) => (
                      <Link
                        key={idea.id}
                        href={`/inbox/${idea.id}`}
                        className="block rounded-lg bg-slate-100 p-3 transition hover:bg-slate-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-slate-950">
                              {idea.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {ideaStatusLabels[idea.status]} · {compactDateFormatter.format(idea.createdAt)}
                            </p>
                          </div>
                          <Badge variant="secondary">{idea.type}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                    尚未关联 Idea。下一步会在 Idea 详情页增加关联 Project 能力。
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckSquare className="size-5 text-primary" />
                  关联 Tasks
                </CardTitle>
                <CardDescription>
                  Day 10 将从已澄清 Idea 生成任务，并聚合到项目中。
                </CardDescription>
              </CardHeader>
              <CardContent>
                {project.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="rounded-lg bg-slate-100 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-slate-950">
                              {task.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {taskStatusLabels[task.status]} · 优先级 {taskPriorityLabels[task.priority]}
                              {task.dueDate
                                ? ` · ${compactDateFormatter.format(task.dueDate)}`
                                : ""}
                            </p>
                          </div>
                          <Badge variant="outline">{task.priority}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                    尚未生成任务。完成 Task Generator 后，这里会展示项目执行列表。
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers3 className="size-5 text-primary" />
                  下一步
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 rounded-lg bg-slate-100 p-4 text-sm leading-6 text-slate-700">
                  <p className="flex gap-2">
                    <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                    Day 10：在 Idea 详情页关联 Project，并从 Idea 生成 Task。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, FolderPlus, Layers3 } from "lucide-react";

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
import { PROJECT_STATUS_OPTIONS, isProjectStatus, listProjects } from "@/lib/projects";
import { ProjectCreateForm } from "./project-create-form";
import { PROJECT_STATUS_LABELS, ProjectStatusBadge } from "./project-status-badge";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface ProjectsPageProps {
  searchParams: Promise<{ status?: string | string[] }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  await connection();

  const { status } = await searchParams;
  const statusParam = Array.isArray(status) ? status[0] : status;
  const selectedStatus = statusParam && isProjectStatus(statusParam) ? statusParam : undefined;
  const projects = await listProjects(selectedStatus);

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div>
          <Badge className="w-fit">Milestone 3</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Projects
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            把已澄清的 Idea 放入长期主题容器，并逐步沉淀为可执行任务集合。
          </p>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Card className="h-fit border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="size-5 text-primary" />
                创建 Project
              </CardTitle>
              <CardDescription>
                先定义一个清晰项目容器，再把 Ideas 和 Tasks 聚合到同一个执行上下文中。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectCreateForm />
            </CardContent>
          </Card>

          <Card className="min-h-128 border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Project 列表</CardTitle>
                  <CardDescription className="mt-2">
                    当前共 {projects.length} 个
                    {selectedStatus ? ` ${PROJECT_STATUS_LABELS[selectedStatus]}` : ""}项目。
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedStatus ? "outline" : "default"}
                  >
                    <Link href="/projects">全部</Link>
                  </Button>
                  {PROJECT_STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      asChild
                      size="sm"
                      variant={selectedStatus === option ? "default" : "outline"}
                    >
                      <Link href={`/projects?status=${option}`}>
                        {PROJECT_STATUS_LABELS[option]}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {projects.length > 0 ? (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="group block rounded-lg border bg-white p-4 transition hover:border-primary/40 hover:shadow-md hover:shadow-slate-950/8"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <ProjectStatusBadge status={project.status} />
                            <span className="text-xs text-slate-500">
                              {dateFormatter.format(project.createdAt)}
                            </span>
                          </div>
                          <div>
                            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">
                              {project.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                              {project.description ?? project.goal ?? "尚未补充项目描述。"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {project._count.ideas} Ideas
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-1">
                              {project._count.tasks} Tasks
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-8 text-center">
                  <Layers3 className="size-10 text-slate-400" />
                  <p className="mt-4 text-sm font-medium text-slate-950">
                    暂无项目
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                    使用左侧表单创建第一个 Project，为后续任务拆解建立容器。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </AppShell>
  );
}

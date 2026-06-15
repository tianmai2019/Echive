import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  CalendarClock,
  CheckSquare,
  Layers3,
  Library,
  MessageSquareText,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { IdeaStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIdeaById, parseClarificationOutput } from "@/lib/ideas";
import { listProjects } from "@/lib/projects";
import { ClarifyButton } from "./clarify-button";
import { GenerateTasksButton } from "./generate-tasks-button";
import { ProjectSelector } from "./project-selector";

const statusLabels: Record<string, string> = {
  CAPTURED: "待澄清",
  CLARIFIED: "已澄清",
  PLANNED: "已规划",
  ARCHIVED: "已归档",
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface IdeaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  await connection();

  const { id } = await params;
  const idea = await getIdeaById(id);

  if (!idea) {
    return (
      <AppShell>
        <section className="flex flex-1 items-center justify-center p-5 md:p-8">
          <Card className="w-full max-w-xl border-none bg-white/84 text-center shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle>Idea 不存在</CardTitle>
              <CardDescription>
                这条记录可能已被删除，或不属于当前 demo user。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/inbox">返回 Inbox</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </AppShell>
    );
  }

  const latestClarification = parseClarificationOutput(
    idea.aiActionLogs[0]?.output
  );
  const projects = await listProjects();

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <Button asChild variant="outline">
            <Link href="/inbox">
              <ArrowLeft />
              返回 Inbox
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-end gap-3">
            <Badge variant="secondary">{statusLabels[idea.status]}</Badge>
            <ClarifyButton ideaId={idea.id} />
            <GenerateTasksButton
              ideaId={idea.id}
              canGenerate={
                idea.status === IdeaStatus.CLARIFIED || idea.status === IdeaStatus.PLANNED
              }
              hasExistingTasks={idea.tasks.length > 0}
            />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarClock className="size-4" />
                {dateFormatter.format(idea.createdAt)}
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl leading-tight tracking-tight">
                  {idea.title}
                </CardTitle>
                <CardDescription className="text-base leading-7">
                  {idea.summary ?? "尚未生成摘要。"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-slate-950">原始输入</p>
                <div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-100 p-4 text-sm leading-7 text-slate-700">
                  {idea.rawInput}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-950">下一步行动</p>
                <div className="mt-3 rounded-lg bg-slate-100 p-4 text-sm leading-7 text-slate-700">
                  {idea.nextAction ?? "等待 AI 澄清后生成。"}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-950">澄清问题</p>
                {latestClarification ? (
                  <div className="mt-3 space-y-2">
                    {latestClarification.questions.map((question, index) => (
                      <div
                        key={question}
                        className="flex gap-3 rounded-lg bg-slate-100 p-4 text-sm leading-7 text-slate-700"
                      >
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span>{question}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg bg-slate-100 p-4 text-sm leading-7 text-slate-700">
                    等待 AI 澄清后生成。
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquareText className="size-5 text-primary" />
                  澄清记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                {idea.conversations[0] ? (
                  <div className="space-y-2">
                    {idea.conversations[0].messages.map((message) => (
                      <div key={message.id} className="rounded-lg bg-slate-100 p-3">
                        <p className="text-xs font-medium text-slate-500">
                          {message.role}
                        </p>
                        <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {message.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                    尚未生成澄清记录。
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Layers3 className="size-5 text-primary" />
                  关联项目
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {idea.project ? (
                  <Link
                    href={`/projects/${idea.project.id}`}
                    className="block rounded-lg bg-slate-100 p-4 transition hover:bg-slate-200"
                  >
                    <p className="font-medium text-slate-950">{idea.project.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {idea.project.status}
                    </p>
                  </Link>
                ) : (
                  <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                    尚未关联项目。
                  </p>
                )}
                <ProjectSelector
                  ideaId={idea.id}
                  currentProjectId={idea.project?.id ?? null}
                  projects={projects.map((project) => ({
                    id: project.id,
                    title: project.title,
                  }))}
                />
              </CardContent>
            </Card>

            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckSquare className="size-5 text-primary" />
                  关联任务
                </CardTitle>
              </CardHeader>
              <CardContent>
                {idea.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {idea.tasks.map((task) => (
                      <div key={task.id} className="rounded-lg bg-slate-100 p-3">
                        <p className="text-sm font-medium text-slate-950">
                          {task.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {task.status} · {task.priority}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                    尚未生成任务。
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Library className="size-5 text-primary" />
                  关联素材
                </CardTitle>
              </CardHeader>
              <CardContent>
                {idea.materials.length > 0 ? (
                  <div className="space-y-2">
                    {idea.materials.map((material) => (
                      <div key={material.id} className="rounded-lg bg-slate-100 p-3">
                        <p className="text-sm font-medium text-slate-950">
                          {material.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {material.type} · {material.status}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-600">
                    尚未关联素材。
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

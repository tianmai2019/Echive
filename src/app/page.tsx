import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  Inbox,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IdeaStatus } from "@/generated/prisma/enums";
import { listIdeas } from "@/lib/ideas";
import { listTasks } from "@/lib/tasks";
import { TASK_PRIORITY_LABELS } from "@/lib/task-metadata";
import { listDrafts } from "@/lib/drafts";
import { QuickCaptureForm } from "@/app/inbox/quick-capture-form";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const DRAFT_FORMAT_LABELS: Record<string, string> = {
  BLOG: "博客",
  WEIBO: "微博",
  VLOG: "Vlog",
  SCRIPT: "脚本",
};

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW: "bg-green-100 text-green-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[priority] || "bg-slate-100 text-slate-700"}`}>
      {TASK_PRIORITY_LABELS[priority as keyof typeof TASK_PRIORITY_LABELS] || priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    TODO: "bg-slate-100 text-slate-700",
    DOING: "bg-blue-100 text-blue-700",
    BLOCKED: "bg-orange-100 text-orange-700",
    DONE: "bg-green-100 text-green-700",
  };

  const labels: Record<string, string> = {
    TODO: "待办",
    DOING: "进行中",
    BLOCKED: "阻塞",
    DONE: "已完成",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-700"}`}>
      {labels[status] || status}
    </span>
  );
}

export default async function Home() {
  await connection();

  // 并行获取所有数据
  const [allTasks, allIdeas, recentDrafts] = await Promise.all([
    listTasks({ view: "today" }),
    listIdeas(),
    listDrafts().then((drafts) => drafts.slice(0, 5)),
  ]);

  const todayTasks = allTasks.slice(0, 5);
  const recentIdeas = allIdeas.slice(0, 5);
  const pendingIdeas = allIdeas.filter((idea) => idea.status === IdeaStatus.CAPTURED).slice(0, 5);

  const stats = {
    todayTasks: allTasks.length,
    recentIdeas: allIdeas.length,
    pendingClarify: pendingIdeas.length,
    drafts: recentDrafts.length,
  };

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        {/* 头部欢迎区 + Quick Capture */}
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl shadow-slate-950/15">
            <CardHeader className="relative z-10 gap-4 p-8">
              <Badge className="w-fit bg-emerald-400 text-slate-950 hover:bg-emerald-400">
                <Sparkles className="mr-1 size-3" />
                MVP 已完成 5/6
              </Badge>
              <div className="max-w-2xl space-y-4">
                <CardTitle className="text-4xl leading-tight tracking-tight md:text-5xl">
                  欢迎回来，创作者。
                </CardTitle>
                <CardDescription className="text-base leading-7 text-slate-300 md:text-lg">
                  从这里开始今天的创作工作流 — 捕捉想法、推进任务、完成草稿。
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-8 pb-8 sm:grid-cols-4">
              {[
                { label: "今日任务", value: stats.todayTasks, icon: Calendar },
                { label: "最近想法", value: stats.recentIdeas, icon: Inbox },
                { label: "待澄清", value: stats.pendingClarify, icon: MessageSquare },
                { label: "草稿", value: stats.drafts, icon: FileText },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/8 p-5"
                >
                  <item.icon className="size-4 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-300">{item.label}</p>
                  <p className="mt-1 text-3xl font-semibold">{item.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Capture - 真实可用 */}
          <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Quick Capture
              </CardTitle>
              <CardDescription>
                快速记录一个新想法，它会出现在 Inbox 中等待澄清。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickCaptureForm />
            </CardContent>
          </Card>
        </div>

        {/* 任务 + 想法 + 草稿 三列布局 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 今日任务 */}
          <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  今日任务
                </span>
                <Badge variant="secondary">{todayTasks.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayTasks.length > 0 ? (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border bg-white p-3 transition hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="line-clamp-2 text-sm font-medium text-slate-950">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.project && (
                          <span className="text-xs text-slate-500">
                            {task.project.title}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                  <Clock className="size-6 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-950">
                    今日暂无任务
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-600">
                    从已澄清的想法生成任务，或者直接创建任务。
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/tasks">
                  查看全部任务
                  <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* 最近想法 */}
          <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <Inbox className="size-4 text-primary" />
                  最近想法
                </span>
                <Badge variant="secondary">{recentIdeas.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentIdeas.length > 0 ? (
                <div className="space-y-3">
                  {recentIdeas.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`/inbox/${idea.id}`}
                      className="group block rounded-lg border bg-white p-3 transition hover:border-primary/30 hover:shadow-sm"
                    >
                      <h4 className="line-clamp-2 text-sm font-medium text-slate-950 group-hover:text-primary">
                        {idea.title}
                      </h4>
                      {idea.summary && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {idea.summary}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="secondary" className="text-[10px]">
                          {idea.status === IdeaStatus.CAPTURED && "待澄清"}
                          {idea.status === IdeaStatus.CLARIFIED && "已澄清"}
                          {idea.status === IdeaStatus.PLANNED && "已规划"}
                          {idea.status === IdeaStatus.ARCHIVED && "已归档"}
                        </Badge>
                        <span className="text-[10px] text-slate-400">
                          {dateFormatter.format(idea.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                  <Inbox className="size-6 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-950">
                    还没有想法
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-600">
                    使用上方 Quick Capture 记录你的第一个想法。
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/inbox">
                  浏览 Inbox
                  <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* 最近草稿 */}
          <Card className="border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  最近草稿
                </span>
                <Badge variant="secondary">{recentDrafts.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentDrafts.length > 0 ? (
                <div className="space-y-3">
                  {recentDrafts.map((draft) => (
                    <Link
                      key={draft.id}
                      href={`/studio/${draft.id}`}
                      className="group block rounded-lg border bg-white p-3 transition hover:border-primary/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="line-clamp-2 flex-1 text-sm font-medium text-slate-950 group-hover:text-primary">
                          {draft.title}
                        </h4>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {DRAFT_FORMAT_LABELS[draft.format] || draft.format}
                        </Badge>
                      </div>
                      {draft.outline && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {draft.outline}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        {draft.idea && (
                          <span className="line-clamp-1 max-w-32 text-[10px] text-slate-500">
                            来自: {draft.idea.title}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {dateFormatter.format(draft.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-6 text-center">
                  <FileText className="size-6 text-slate-400" />
                  <p className="mt-3 text-sm font-medium text-slate-950">
                    还没有草稿
                  </p>
                  <p className="mt-1 max-w-sm text-xs leading-5 text-slate-600">
                    基于已规划的想法和素材生成你的第一篇草稿。
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/studio">
                  进入 Studio
                  <ArrowRight className="ml-1 size-3" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 待澄清想法 - 横条区域 */}
        {pendingIdeas.length > 0 && (
          <Card className="border-none bg-amber-50/60 shadow-xl shadow-amber-950/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="size-4 text-amber-600" />
                待澄清的想法
                <Badge className="bg-amber-200 text-amber-800 hover:bg-amber-200">
                  {pendingIdeas.length} 个需要处理
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pendingIdeas.map((idea) => (
                  <Link
                    key={idea.id}
                    href={`/inbox/${idea.id}`}
                    className="group rounded-lg border border-amber-200 bg-white p-4 transition hover:border-amber-400 hover:shadow-sm"
                  >
                    <h4 className="line-clamp-2 text-sm font-medium text-slate-950 group-hover:text-amber-700">
                      {idea.title}
                    </h4>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                      {idea.rawInput}
                    </p>
                    <div className="mt-3 flex items-center justify-end">
                      <span className="text-xs font-medium text-amber-600 group-hover:translate-x-0.5 transition-transform">
                        开始澄清 →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </AppShell>
  );
}

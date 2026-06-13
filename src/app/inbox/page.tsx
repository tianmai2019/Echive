import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Inbox, Plus } from "lucide-react";

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
import { IDEA_STATUS_OPTIONS, isIdeaStatus, listIdeas } from "@/lib/ideas";
import { QuickCaptureForm } from "./quick-capture-form";

const statusLabels: Record<string, string> = {
  CAPTURED: "待澄清",
  CLARIFIED: "已澄清",
  PLANNED: "已规划",
  ARCHIVED: "已归档",
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface InboxPageProps {
  searchParams: Promise<{ status?: string | string[] }>;
}

export default async function InboxPage({ searchParams }: InboxPageProps) {
  await connection();

  const { status } = await searchParams;
  const statusParam = Array.isArray(status) ? status[0] : status;
  const selectedStatus = statusParam && isIdeaStatus(statusParam) ? statusParam : undefined;
  const ideas = await listIdeas(selectedStatus);

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge className="w-fit">Milestone 2</Badge>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Inbox
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              先把模糊输入沉淀为可追踪的 Idea，后续再进入 AI 澄清和任务拆解。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/inbox">
              <Inbox />
              全部想法
            </Link>
          </Button>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <Card className="h-fit border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5 text-primary" />
                Quick Capture
              </CardTitle>
              <CardDescription>
                快速记录一个新想法，系统会先生成默认标题并标记为待澄清。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickCaptureForm />
            </CardContent>
          </Card>

          <Card className="min-h-[32rem] border-none bg-white/84 shadow-xl shadow-slate-950/10">
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Idea 列表</CardTitle>
                  <CardDescription className="mt-2">
                    当前共 {ideas.length} 条{selectedStatus ? ` ${statusLabels[selectedStatus]}` : ""}想法。
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant={selectedStatus ? "outline" : "default"}
                  >
                    <Link href="/inbox">全部</Link>
                  </Button>
                  {IDEA_STATUS_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      asChild
                      size="sm"
                      variant={selectedStatus === option ? "default" : "outline"}
                    >
                      <Link href={`/inbox?status=${option}`}>
                        {statusLabels[option]}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ideas.length > 0 ? (
                <div className="space-y-3">
                  {ideas.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`/inbox/${idea.id}`}
                      className="group block rounded-lg border bg-white p-4 transition hover:border-primary/40 hover:shadow-md hover:shadow-slate-950/8"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                              {statusLabels[idea.status]}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {dateFormatter.format(idea.createdAt)}
                            </span>
                          </div>
                          <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">
                            {idea.title}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                            {idea.summary ?? idea.rawInput}
                          </p>
                        </div>
                        <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-8 text-center">
                  <Inbox className="size-10 text-slate-400" />
                  <p className="mt-4 text-sm font-medium text-slate-950">
                    暂无想法
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                    使用左侧 Quick Capture 创建第一条 Idea。
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

import Link from "next/link";
import { connection } from "next/server";
import { Archive } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listDrafts } from "@/lib/drafts";
import {
  DRAFT_STATUS_LABELS,
  DRAFT_STATUS_OPTIONS,
} from "@/lib/draft-metadata";
import { listIdeas } from "@/lib/ideas";
import { DraftItem } from "./draft-item";
import { DraftGeneratePanel } from "./draft-generate-panel";

interface StudioPageProps {
  searchParams: Promise<{
    status?: string | string[];
  }>;
}

function getParam(value?: string | string[]): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  await connection();

  const params = await searchParams;
  const statusParam = getParam(params.status);

  const selectedStatus = DRAFT_STATUS_OPTIONS.find((s) => s === statusParam);
  const drafts = await listDrafts(selectedStatus);
  const ideas = await listIdeas();

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div>
          <Badge className="w-fit">Milestone 5</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Studio 创作工作室
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            基于你的想法和素材，AI 辅助生成多种格式的内容草稿。
          </p>
        </div>

        <DraftGeneratePanel ideas={ideas} />

        <Card className="min-h-128 border-none bg-white/84 shadow-xl shadow-slate-950/10">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="size-5 text-primary" />
                  草稿列表
                </CardTitle>
                <CardDescription className="mt-2">
                  当前共 {drafts.length} 个草稿。
                </CardDescription>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/studio"
                  className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition ${
                    !selectedStatus
                      ? "bg-primary text-primary-foreground"
                      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  全部
                </Link>
                {DRAFT_STATUS_OPTIONS.map((status) => (
                  <Link
                    key={status}
                    href={`/studio?status=${status}`}
                    className={`inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition ${
                      selectedStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {DRAFT_STATUS_LABELS[status]}
                  </Link>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <div className="rounded-2xl bg-slate-100 p-8 text-center">
                <p className="text-sm text-slate-600">暂无草稿。</p>
                <p className="mt-2 text-xs text-slate-500">
                  在上方使用 AI 生成你的第一个草稿。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <DraftItem key={draft.id} draft={draft} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

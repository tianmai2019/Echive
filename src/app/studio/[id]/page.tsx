"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Save, ArrowLeft, Edit3 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { DraftDetail } from "@/lib/drafts";
import { DraftStatusBadge } from "../draft-status-badge";
import { DraftFormatBadge } from "../draft-format-badge";
import {
  DRAFT_STATUS_LABELS,
  DRAFT_STATUS_OPTIONS,
} from "@/lib/draft-metadata";

export default function DraftDetailPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as string;

  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editOutline, setEditOutline] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    async function fetchDraft() {
      try {
        const response = await fetch(`/api/drafts/${draftId}`);
        const result = await response.json() as { ok: boolean; data?: DraftDetail; error?: string };

        if (!response.ok || !result.ok || !result.data) {
          setError(result.error ?? "加载草稿失败。");
          return;
        }

        setDraft(result.data);
        setEditTitle(result.data.title);
        setEditOutline(result.data.outline || "");
        setEditContent(result.data.content);
        setEditStatus(result.data.status);
      } catch {
        setError("加载草稿失败，请稍后重试。");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDraft();
  }, [draftId]);

  async function handleSave() {
    if (!draft) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          outline: editOutline || null,
          content: editContent,
          status: editStatus,
        }),
      });

      const result = await response.json() as { ok: boolean; data?: DraftDetail; error?: string };

      if (!response.ok || !result.ok || !result.data) {
        setError(result.error ?? "保存失败。");
        return;
      }

      setDraft(result.data);
      setIsEditing(false);
      router.refresh();
    } catch {
      setError("保存失败，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    if (!draft || newStatus === draft.status) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json() as { ok: boolean; data?: DraftDetail; error?: string };

      if (!response.ok || !result.ok || !result.data) {
        setError(result.error ?? "更新状态失败。");
        return;
      }

      setDraft(result.data);
      setEditStatus(newStatus);
      router.refresh();
    } catch {
      setError("更新状态失败，请稍后重试。");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-1 items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (error || !draft) {
    return (
      <AppShell>
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <p className="text-destructive">{error || "草稿不存在。"}</p>
          <Button asChild className="mt-4">
            <Link href="/studio">返回 Studio</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="flex flex-1 flex-col gap-6 p-5 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/studio")}>
            <ArrowLeft className="mr-2 size-4" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <DraftStatusBadge status={draft.status} />
            <DraftFormatBadge format={draft.format} />
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">标题</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="草稿标题"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">大纲</label>
              <Textarea
                value={editOutline}
                onChange={(e) => setEditOutline(e.target.value)}
                placeholder="草稿大纲（可选）"
                className="min-h-24 resize-none"
                maxLength={5000}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">内容</label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="草稿内容"
                className="min-h-96 resize-none font-mono"
                maxLength={50000}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => {
                setEditTitle(draft.title);
                setEditOutline(draft.outline || "");
                setEditContent(draft.content);
                setIsEditing(false);
              }}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    保存中
                  </>
                ) : (
                  <>
                    <Save className="mr-2 size-4" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-slate-950">{draft.title}</h1>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="mr-2 size-4" />
                编辑
              </Button>
            </div>

            {draft.outline && (
              <div className="rounded-lg border bg-slate-50 p-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">大纲</h3>
                <pre className="whitespace-pre-wrap text-sm text-slate-600 font-mono">
                  {draft.outline}
                </pre>
              </div>
            )}

            <div className="rounded-lg border bg-white p-6">
              <h3 className="text-sm font-medium text-slate-700 mb-4">内容</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-slate-800 font-mono text-sm leading-relaxed">
                  {draft.content}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600">状态</label>
                <select
                  value={editStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isSaving}
                  className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {DRAFT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {DRAFT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                {isSaving && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Loader2 className="size-3 animate-spin" />
                    保存中
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                更新于 {new Date(draft.updatedAt).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </section>
    </AppShell>
  );
}

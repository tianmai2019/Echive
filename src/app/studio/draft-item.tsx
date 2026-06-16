"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import type {
  DraftStatus as DraftStatusValue,
} from "@/generated/prisma/enums";
import type { DraftListItem } from "@/lib/drafts";
import {
  DRAFT_STATUS_LABELS,
  DRAFT_STATUS_OPTIONS,
  isDraftStatus,
} from "@/lib/draft-metadata";
import { DraftStatusBadge } from "./draft-status-badge";
import { DraftFormatBadge } from "./draft-format-badge";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface DraftItemProps {
  draft: DraftListItem;
}

export function DraftItem({ draft }: DraftItemProps) {
  const router = useRouter();
  const [status, setStatus] = useState<DraftStatusValue>(draft.status);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleStatusChange(nextStatus: string) {
    if (!isDraftStatus(nextStatus)) {
      setError("无效草稿状态。");
      return;
    }

    const previous = status;
    setStatus(nextStatus);

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const result = await response.json() as { error?: string };
        setError(result.error ?? "更新草稿状态失败。");
        setStatus(previous);
        return;
      }

      router.refresh();
    } catch {
      setError("更新草稿状态失败。");
      setStatus(previous);
    } finally {
      setIsSaving(false);
    }
  }

  const contentPreview = draft.content.length > 100
    ? `${draft.content.slice(0, 100)}...`
    : draft.content;

  return (
    <article className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md hover:shadow-slate-950/8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <DraftStatusBadge status={status} />
            <DraftFormatBadge format={draft.format} />
          </div>

          <div>
            <Link
              href={`/studio/${draft.id}`}
              className="text-base font-semibold leading-6 text-slate-950 hover:text-primary"
            >
              {draft.title}
            </Link>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 whitespace-pre-wrap">
              {contentPreview}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {draft.idea ? (
              <Link
                href={`/inbox/${draft.idea.id}`}
                className="rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
              >
                Idea · {draft.idea.title}
              </Link>
            ) : null}
            {draft.project ? (
              <Link
                href={`/projects/${draft.project.id}`}
                className="rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
              >
                Project · {draft.project.title}
              </Link>
            ) : null}
          </div>

          <p className="text-xs text-slate-400">
            更新于 {dateFormatter.format(draft.updatedAt)}
          </p>
        </div>

        <div className="sm:w-48">
          <label className="space-y-1 text-xs font-medium text-slate-600">
            状态
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {DRAFT_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {DRAFT_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          {isSaving && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <Loader2 className="size-3 animate-spin" />
              保存中
            </span>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </article>
  );
}

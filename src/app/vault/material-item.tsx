"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Link2 } from "lucide-react";

import type {
  MaterialStatus as MaterialStatusValue,
  MaterialType as MaterialTypeValue,
} from "@/generated/prisma/enums";
import type { MaterialListItem } from "@/lib/materials";
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_OPTIONS,
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_OPTIONS,
  isMaterialStatus,
  isMaterialType,
} from "@/lib/material-metadata";
import { MaterialStatusBadge } from "./material-status-badge";
import { MaterialTypeBadge } from "./material-type-badge";

interface MaterialItemProps {
  material: MaterialListItem;
}

export function MaterialItem({ material }: MaterialItemProps) {
  const router = useRouter();
  const [status, setStatus] = useState<MaterialStatusValue>(material.status);
  const [type, setType] = useState<MaterialTypeValue>(material.type);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function patchMaterial(payload: Record<string, unknown>): Promise<boolean> {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/materials/${material.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(result.error ?? "更新素材失败。");
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setError("更新素材失败。");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleStatusChange(nextStatus: string) {
    if (!isMaterialStatus(nextStatus)) {
      setError("无效素材状态。");
      return;
    }

    const previous = status;
    setStatus(nextStatus);

    const ok = await patchMaterial({ status: nextStatus });
    if (!ok) {
      setStatus(previous);
    }
  }

  async function handleTypeChange(nextType: string) {
    if (!isMaterialType(nextType)) {
      setError("无效素材类型。");
      return;
    }

    const previous = type;
    setType(nextType);

    const ok = await patchMaterial({ type: nextType });
    if (!ok) {
      setType(previous);
    }
  }

  return (
    <article className="rounded-lg border bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md hover:shadow-slate-950/8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <MaterialStatusBadge status={status} />
            <MaterialTypeBadge type={type} />
            {material.source ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                <Link2 className="size-3" />
                有来源
              </span>
            ) : null}
          </div>

          <div>
            <h3 className="line-clamp-2 text-base font-semibold leading-6 text-slate-950">
              {material.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {material.content}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {material.project ? (
              <Link
                href={`/projects/${material.project.id}`}
                className="rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
              >
                Project · {material.project.title}
              </Link>
            ) : null}
            {material.idea ? (
              <Link
                href={`/inbox/${material.idea.id}`}
                className="rounded-full bg-slate-100 px-2 py-1 transition hover:bg-slate-200"
              >
                Idea · {material.idea.title}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-md">
          <label className="space-y-1 text-xs font-medium text-slate-600">
            状态
            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {MATERIAL_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MATERIAL_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-xs font-medium text-slate-600">
            类型
            <select
              value={type}
              onChange={(event) => handleTypeChange(event.target.value)}
              disabled={isSaving}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {MATERIAL_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MATERIAL_TYPE_LABELS[option]}
                </option>
              ))}
            </select>
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
        ) : null}
      </div>
    </article>
  );
}

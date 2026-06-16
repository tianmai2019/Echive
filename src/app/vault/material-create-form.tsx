"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MaterialStatus, MaterialType } from "@/generated/prisma/enums";
import {
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_OPTIONS,
  MATERIAL_TYPE_LABELS,
  MATERIAL_TYPE_OPTIONS,
} from "@/lib/material-metadata";
import type { CreateMaterialInput } from "@/lib/materials";

interface MaterialCreateFormProps {
  defaultProjectId?: string;
  defaultIdeaId?: string;
}

export function MaterialCreateForm({ defaultProjectId, defaultIdeaId }: MaterialCreateFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MaterialType>(MaterialType.NOTE);
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<MaterialStatus>(MaterialStatus.RAW);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("请填写标题和内容。");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload: CreateMaterialInput = {
        title: trimmedTitle,
        type,
        content: trimmedContent,
        source: source.trim() || undefined,
        status,
        projectId: defaultProjectId || undefined,
        ideaId: defaultIdeaId || undefined,
      };

      const response = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(result.error ?? "保存失败。");
        return;
      }

      setTitle("");
      setContent("");
      setSource("");
      setType("NOTE");
      setStatus("RAW");
      router.refresh();
    } catch {
      setError("保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">标题</p>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="素材标题"
            maxLength={200}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">类型</p>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MaterialType)}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {MATERIAL_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MATERIAL_TYPE_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">状态</p>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as MaterialStatus)}
              className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              {MATERIAL_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {MATERIAL_STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">内容</p>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="素材内容"
          className="min-h-24 resize-none bg-white"
          maxLength={10000}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">来源（可选）</p>
        <Input
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="来源链接或说明"
          maxLength={500}
        />
      </div>

      <div className="flex min-h-9 items-center justify-between gap-3">
        <p className="text-xs text-destructive" aria-live="polite">
          {error}
        </p>
        <Button type="submit" disabled={isSaving} className="shrink-0">
          {isSaving ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
          添加素材
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DRAFT_FORMAT_LABELS,
  DRAFT_FORMAT_OPTIONS,
} from "@/lib/draft-metadata";
interface DraftGeneratePanelProps {
  ideas: Array<{ id: string; title: string }>;
}

export function DraftGeneratePanel({ ideas }: DraftGeneratePanelProps) {
  const router = useRouter();
  const [selectedIdeaId, setSelectedIdeaId] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("BLOG");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!selectedIdeaId) {
      setError("请选择一个想法作为来源。");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/drafts", {
        method: "GENERATE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId: selectedIdeaId,
          format: selectedFormat,
        }),
      });

      const result = await response.json() as { ok: boolean; data?: { id: string }; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "生成草稿失败。");
        return;
      }

      router.push(`/studio/${result.data!.id}`);
      router.refresh();
    } catch {
      setError("生成草稿失败，请稍后重试。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950 flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        AI 生成草稿
      </h3>

      <div className="mt-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            选择来源想法 *
          </label>
          <select
            value={selectedIdeaId}
            onChange={(e) => setSelectedIdeaId(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">请选择一个想法</option>
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id}>
                {idea.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            输出格式
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DRAFT_FORMAT_OPTIONS.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setSelectedFormat(format)}
                className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
                  selectedFormat === format
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-white hover:border-primary/50"
                }`}
              >
                {DRAFT_FORMAT_LABELS[format]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              生成草稿
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

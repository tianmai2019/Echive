"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckSquare, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface GenerateTasksButtonProps {
  ideaId: string;
  canGenerate: boolean;
  hasExistingTasks: boolean;
}

export function GenerateTasksButton({
  ideaId,
  canGenerate,
  hasExistingTasks,
}: GenerateTasksButtonProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/tasks/generate`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(payload.error ?? "生成任务失败。");
        return;
      }

      router.refresh();
    } catch {
      setError("生成任务失败。");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant={hasExistingTasks ? "outline" : "default"}
        onClick={handleClick}
        disabled={isGenerating || !canGenerate}
      >
        {isGenerating ? <Loader2 className="animate-spin" /> : <CheckSquare />}
        {hasExistingTasks ? "重新生成任务" : "生成任务"}
      </Button>
      <p className="min-h-4 max-w-48 text-right text-xs text-destructive" aria-live="polite">
        {error || (!canGenerate ? "请先完成 AI 澄清。" : "")}
      </p>
    </div>
  );
}

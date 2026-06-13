"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function QuickCaptureForm() {
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = rawInput.trim();

    if (!trimmedInput) {
      setError("请输入想法内容。");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: trimmedInput }),
      });

      const payload = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(payload.error ?? "保存失败。");
        return;
      }

      setRawInput("");
      router.refresh();
    } catch {
      setError("保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={rawInput}
        onChange={(event) => setRawInput(event.target.value)}
        placeholder="记录一个新想法，例如：做一个个人数字管家，帮我管理创作工作流。"
        className="min-h-36 resize-none bg-white"
        maxLength={4000}
      />
      <div className="flex min-h-9 items-center justify-between gap-3">
        <p className="text-xs text-destructive" aria-live="polite">
          {error}
        </p>
        <Button type="submit" disabled={isSaving} className="shrink-0">
          {isSaving ? <Loader2 className="animate-spin" /> : <Send />}
          保存
        </Button>
      </div>
    </form>
  );
}

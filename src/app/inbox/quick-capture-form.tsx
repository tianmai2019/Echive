"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function QuickCaptureForm() {
  const router = useRouter();
  const [rawInput, setRawInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = rawInput.trim();

    if (!trimmedInput) {
      toast.warning("请输入想法内容。");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: trimmedInput }),
      });

      const payload = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        toast.error(payload.error ?? "保存失败，请稍后重试。");
        return;
      }

      setRawInput("");
      router.refresh();
      toast.success("想法已保存！", {
        description: "已添加到 Inbox，等待澄清。",
      });
    } catch {
      toast.error("保存失败，请检查网络连接。");
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
      <div className="flex min-h-9 items-center justify-end">
        <Button type="submit" disabled={isSaving} className="shrink-0">
          {isSaving ? <Loader2 className="animate-spin" /> : <Send />}
          保存
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ProjectCreatePayload {
  title: string;
  description?: string;
  goal?: string;
}

export function ProjectCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedGoal = goal.trim();

    if (!trimmedTitle) {
      setError("请输入项目名称。");
      return;
    }

    const payload: ProjectCreatePayload = {
      title: trimmedTitle,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
      ...(trimmedGoal ? { goal: trimmedGoal } : {}),
    };

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(result.error ?? "创建项目失败。");
        return;
      }

      setTitle("");
      setDescription("");
      setGoal("");
      router.refresh();
    } catch {
      setError("创建项目失败。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="project-title" className="text-sm font-medium text-slate-950">
          项目名称
        </label>
        <Input
          id="project-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="例如：Echive MVP"
          maxLength={200}
          className="bg-white"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="project-description" className="text-sm font-medium text-slate-950">
          项目描述
        </label>
        <Textarea
          id="project-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="这个项目解决什么问题？当前阶段关注什么？"
          maxLength={2000}
          className="min-h-24 resize-none bg-white"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="project-goal" className="text-sm font-medium text-slate-950">
          阶段目标
        </label>
        <Textarea
          id="project-goal"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="定义一个可验收的阶段目标。"
          maxLength={2000}
          className="min-h-24 resize-none bg-white"
        />
      </div>

      <div className="flex min-h-9 items-center justify-between gap-3">
        <p className="text-xs text-destructive" aria-live="polite">
          {error}
        </p>
        <Button type="submit" disabled={isSaving} className="shrink-0">
          {isSaving ? <Loader2 className="animate-spin" /> : <FolderPlus />}
          创建 Project
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderPlus, Loader2, Link2, Unlink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProjectOption {
  id: string;
  title: string;
}

interface ProjectSelectorProps {
  ideaId: string;
  currentProjectId: string | null;
  projects: ProjectOption[];
}

export function ProjectSelector({
  ideaId,
  currentProjectId,
  projects,
}: ProjectSelectorProps) {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState(currentProjectId ?? "");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function updateIdeaProject(projectId: string | null): Promise<boolean> {
    const response = await fetch(`/api/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    });
    const payload = (await response.json()) as { error?: string | null };

    if (!response.ok) {
      setError(payload.error ?? "关联项目失败。");
      return false;
    }

    return true;
  }

  async function handleAttach() {
    if (!selectedProjectId) {
      setError("请选择一个 Project。");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const isUpdated = await updateIdeaProject(selectedProjectId);

      if (isUpdated) {
        router.refresh();
      }
    } catch {
      setError("关联项目失败。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDetach() {
    setIsSaving(true);
    setError(null);

    try {
      const isUpdated = await updateIdeaProject(null);

      if (isUpdated) {
        setSelectedProjectId("");
        router.refresh();
      }
    } catch {
      setError("取消关联失败。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCreateAndAttach() {
    const trimmedTitle = newProjectTitle.trim();

    if (!trimmedTitle) {
      setError("请输入新项目名称。");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      const payload = (await response.json()) as {
        data?: { id: string } | null;
        error?: string | null;
      };

      if (!response.ok || !payload.data) {
        setError(payload.error ?? "创建项目失败。");
        return;
      }

      const isUpdated = await updateIdeaProject(payload.data.id);

      if (isUpdated) {
        setNewProjectTitle("");
        setSelectedProjectId(payload.data.id);
        router.refresh();
      }
    } catch {
      setError("创建并关联项目失败。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="project-selector" className="text-sm font-medium text-slate-950">
          选择已有 Project
        </label>
        <select
          id="project-selector"
          value={selectedProjectId}
          onChange={(event) => setSelectedProjectId(event.target.value)}
          disabled={isSaving}
          className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">未关联项目</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleAttach} disabled={isSaving}>
          {isSaving ? <Loader2 className="animate-spin" /> : <Link2 />}
          关联
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleDetach}
          disabled={isSaving || !currentProjectId}
        >
          <Unlink />
          取消关联
        </Button>
      </div>

      <div className="space-y-2 rounded-lg bg-slate-100 p-3">
        <label htmlFor="new-project-title" className="text-sm font-medium text-slate-950">
          或快速创建 Project
        </label>
        <div className="flex gap-2">
          <Input
            id="new-project-title"
            value={newProjectTitle}
            onChange={(event) => setNewProjectTitle(event.target.value)}
            placeholder="输入新项目名称"
            maxLength={200}
            disabled={isSaving}
            className="bg-white"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleCreateAndAttach}
            disabled={isSaving}
            className="shrink-0"
          >
            <FolderPlus />
            创建并关联
          </Button>
        </div>
      </div>

      <p className="min-h-4 text-xs text-destructive" aria-live="polite">
        {error}
      </p>
    </div>
  );
}

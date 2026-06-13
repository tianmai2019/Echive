"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ClarifyButtonProps {
  ideaId: string;
}

export function ClarifyButton({ ideaId }: ClarifyButtonProps) {
  const router = useRouter();
  const [isClarifying, setIsClarifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsClarifying(true);
    setError(null);

    try {
      const response = await fetch(`/api/ideas/${ideaId}/clarify`, {
        method: "POST",
      });
      const payload = (await response.json()) as { error?: string | null };

      if (!response.ok) {
        setError(payload.error ?? "澄清失败。");
        return;
      }

      router.refresh();
    } catch {
      setError("澄清失败。");
    } finally {
      setIsClarifying(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button type="button" onClick={handleClick} disabled={isClarifying}>
        {isClarifying ? <Loader2 className="animate-spin" /> : <Sparkles />}
        AI 澄清
      </Button>
      <p className="min-h-4 text-xs text-destructive" aria-live="polite">
        {error}
      </p>
    </div>
  );
}

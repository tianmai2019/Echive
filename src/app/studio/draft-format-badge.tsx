import type { DraftFormat as DraftFormatValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { DRAFT_FORMAT_LABELS } from "@/lib/draft-metadata";

const draftFormatVariants: Record<
  DraftFormatValue,
  "default" | "secondary" | "destructive" | "outline"
> = {
  BLOG: "default",
  WEIBO: "secondary",
  VLOG: "outline",
  SCRIPT: "default",
};

interface DraftFormatBadgeProps {
  format: DraftFormatValue;
}

export function DraftFormatBadge({ format }: DraftFormatBadgeProps) {
  return <Badge variant={draftFormatVariants[format]}>{DRAFT_FORMAT_LABELS[format]}</Badge>;
}

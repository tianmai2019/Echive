import type { DraftStatus as DraftStatusValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { DRAFT_STATUS_LABELS } from "@/lib/draft-metadata";

const draftStatusVariants: Record<
  DraftStatusValue,
  "default" | "secondary" | "destructive" | "outline"
> = {
  DRAFT: "secondary",
  REVIEWING: "default",
  READY: "default",
  PUBLISHED: "outline",
};

interface DraftStatusBadgeProps {
  status: DraftStatusValue;
}

export function DraftStatusBadge({ status }: DraftStatusBadgeProps) {
  return <Badge variant={draftStatusVariants[status]}>{DRAFT_STATUS_LABELS[status]}</Badge>;
}

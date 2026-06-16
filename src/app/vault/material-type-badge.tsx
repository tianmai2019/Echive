import type { MaterialType as MaterialTypeValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { MATERIAL_TYPE_LABELS } from "@/lib/material-metadata";

const materialTypeVariants: Record<
  MaterialTypeValue,
  "default" | "secondary" | "destructive" | "outline"
> = {
  NOTE: "default",
  LINK: "secondary",
  QUOTE: "outline",
  IMAGE: "default",
  VOICE: "secondary",
  CHAT: "outline",
};

interface MaterialTypeBadgeProps {
  type: MaterialTypeValue;
}

export function MaterialTypeBadge({ type }: MaterialTypeBadgeProps) {
  return <Badge variant={materialTypeVariants[type]}>{MATERIAL_TYPE_LABELS[type]}</Badge>;
}

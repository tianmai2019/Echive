import type { MaterialStatus as MaterialStatusValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { MATERIAL_STATUS_LABELS } from "@/lib/material-metadata";

const materialStatusVariants: Record<
  MaterialStatusValue,
  "default" | "secondary" | "destructive" | "outline"
> = {
  RAW: "secondary",
  SORTED: "default",
  USABLE: "default",
  USED: "outline",
};

interface MaterialStatusBadgeProps {
  status: MaterialStatusValue;
}

export function MaterialStatusBadge({ status }: MaterialStatusBadgeProps) {
  return <Badge variant={materialStatusVariants[status]}>{MATERIAL_STATUS_LABELS[status]}</Badge>;
}

import { ProjectStatus, type ProjectStatus as ProjectStatusValue } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

const projectStatusLabels: Record<ProjectStatusValue, string> = {
  ACTIVE: "进行中",
  PAUSED: "已暂停",
  DONE: "已完成",
  ARCHIVED: "已归档",
};

const projectStatusVariants: Record<
  ProjectStatusValue,
  "default" | "secondary" | "outline" | "ghost"
> = {
  ACTIVE: "default",
  PAUSED: "secondary",
  DONE: "outline",
  ARCHIVED: "ghost",
};

interface ProjectStatusBadgeProps {
  status: ProjectStatusValue;
}

export const PROJECT_STATUS_LABELS = projectStatusLabels;

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return <Badge variant={projectStatusVariants[status]}>{projectStatusLabels[status]}</Badge>;
}

export { ProjectStatus };

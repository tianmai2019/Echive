import {
  DraftFormat,
  DraftStatus,
  type DraftFormat as DraftFormatValue,
  type DraftStatus as DraftStatusValue,
} from "@/generated/prisma/enums";

export const DRAFT_STATUS_OPTIONS = Object.values(DraftStatus);
export const DRAFT_FORMAT_OPTIONS = Object.values(DraftFormat);

export const DRAFT_STATUS_LABELS: Record<DraftStatusValue, string> = {
  DRAFT: "草稿",
  REVIEWING: "审核中",
  READY: "已完成",
  PUBLISHED: "已发布",
};

export const DRAFT_FORMAT_LABELS: Record<DraftFormatValue, string> = {
  BLOG: "博客文章",
  WEIBO: "微博",
  VLOG: "视频脚本",
  SCRIPT: "通用脚本",
};

export function isDraftStatus(value: string): value is DraftStatusValue {
  return DRAFT_STATUS_OPTIONS.includes(value as DraftStatusValue);
}

export function isDraftFormat(value: string): value is DraftFormatValue {
  return DRAFT_FORMAT_OPTIONS.includes(value as DraftFormatValue);
}

import {
  MaterialStatus,
  MaterialType,
  type MaterialStatus as MaterialStatusValue,
  type MaterialType as MaterialTypeValue,
} from "@/generated/prisma/enums";

export const MATERIAL_STATUS_OPTIONS = Object.values(MaterialStatus);
export const MATERIAL_TYPE_OPTIONS = Object.values(MaterialType);

export const MATERIAL_STATUS_LABELS: Record<MaterialStatusValue, string> = {
  RAW: "原始",
  SORTED: "已整理",
  USABLE: "可使用",
  USED: "已使用",
};

export const MATERIAL_TYPE_LABELS: Record<MaterialTypeValue, string> = {
  NOTE: "笔记",
  LINK: "链接",
  QUOTE: "摘录",
  IMAGE: "图片",
  VOICE: "语音",
  CHAT: "聊天",
};

export function isMaterialStatus(value: string): value is MaterialStatusValue {
  return MATERIAL_STATUS_OPTIONS.includes(value as MaterialStatusValue);
}

export function isMaterialType(value: string): value is MaterialTypeValue {
  return MATERIAL_TYPE_OPTIONS.includes(value as MaterialTypeValue);
}

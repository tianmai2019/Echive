import { describe, expect, it } from "vitest";

import {
  MAX_DRAFT_CONTENT_LENGTH,
  MAX_DRAFT_OUTLINE_LENGTH,
  MAX_DRAFT_TITLE_LENGTH,
  parseDraftContent,
  parseDraftFormat,
  parseDraftOptionalOutline,
  parseDraftOptionalStatus,
  parseDraftTitle,
} from "@/lib/draft-validation";

describe("draft validation", () => {
  describe("parseDraftTitle", () => {
    it("rejects non-string values", () => {
      expect(parseDraftTitle(null).ok).toBe(false);
      expect(parseDraftTitle(undefined).ok).toBe(false);
      expect(parseDraftTitle(123).ok).toBe(false);
      expect(parseDraftTitle({}).ok).toBe(false);
    });

    it("rejects empty or whitespace-only strings", () => {
      expect(parseDraftTitle("").ok).toBe(false);
      expect(parseDraftTitle("   ").ok).toBe(false);
    });

    it("rejects strings exceeding max length", () => {
      const longTitle = "a".repeat(MAX_DRAFT_TITLE_LENGTH + 1);
      expect(parseDraftTitle(longTitle).ok).toBe(false);
    });

    it("accepts valid titles and trims them", () => {
      const result = parseDraftTitle("  Test Title  ");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: string }).value).toBe("Test Title");
    });
  });

  describe("parseDraftFormat", () => {
    it("rejects non-string values", () => {
      expect(parseDraftFormat(null).ok).toBe(false);
      expect(parseDraftFormat(undefined).ok).toBe(false);
      expect(parseDraftFormat(123).ok).toBe(false);
    });

    it("rejects invalid formats", () => {
      expect(parseDraftFormat("INVALID").ok).toBe(false);
    });

    it("accepts valid formats", () => {
      expect(parseDraftFormat("BLOG").ok).toBe(true);
      expect(parseDraftFormat("WEIBO").ok).toBe(true);
      expect(parseDraftFormat("VLOG").ok).toBe(true);
      expect(parseDraftFormat("SCRIPT").ok).toBe(true);
    });
  });

  describe("parseDraftContent", () => {
    it("rejects non-string values", () => {
      expect(parseDraftContent(null).ok).toBe(false);
      expect(parseDraftContent(undefined).ok).toBe(false);
      expect(parseDraftContent(123).ok).toBe(false);
    });

    it("rejects empty or whitespace-only strings", () => {
      expect(parseDraftContent("").ok).toBe(false);
      expect(parseDraftContent("   ").ok).toBe(false);
    });

    it("rejects strings exceeding max length", () => {
      const longContent = "a".repeat(MAX_DRAFT_CONTENT_LENGTH + 1);
      expect(parseDraftContent(longContent).ok).toBe(false);
    });

    it("accepts valid content and trims them", () => {
      const result = parseDraftContent("  Test content  ");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: string }).value).toBe("Test content");
    });
  });

  describe("parseDraftOptionalOutline", () => {
    it("returns undefined when value is undefined or null", () => {
      const result1 = parseDraftOptionalOutline(undefined);
      expect(result1.ok).toBe(true);
      expect((result1 as { ok: true; value: undefined }).value).toBeUndefined();

      const result2 = parseDraftOptionalOutline(null);
      expect(result2.ok).toBe(true);
      expect((result2 as { ok: true; value: undefined }).value).toBeUndefined();
    });

    it("rejects non-string values", () => {
      expect(parseDraftOptionalOutline(123).ok).toBe(false);
      expect(parseDraftOptionalOutline({}).ok).toBe(false);
    });

    it("rejects strings exceeding max length", () => {
      const longOutline = "a".repeat(MAX_DRAFT_OUTLINE_LENGTH + 1);
      expect(parseDraftOptionalOutline(longOutline).ok).toBe(false);
    });

    it("accepts valid values and trims them", () => {
      const result = parseDraftOptionalOutline("  Outline content  ");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: string }).value).toBe("Outline content");
    });

    it("returns null for empty string", () => {
      const result = parseDraftOptionalOutline("");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: null }).value).toBeNull();
    });
  });

  describe("parseDraftOptionalStatus", () => {
    it("returns undefined when value is undefined or null", () => {
      const result1 = parseDraftOptionalStatus(undefined);
      expect(result1.ok).toBe(true);
      expect((result1 as { ok: true; value: undefined }).value).toBeUndefined();

      const result2 = parseDraftOptionalStatus(null);
      expect(result2.ok).toBe(true);
      expect((result2 as { ok: true; value: undefined }).value).toBeUndefined();
    });

    it("rejects non-string values", () => {
      expect(parseDraftOptionalStatus(123).ok).toBe(false);
      expect(parseDraftOptionalStatus({}).ok).toBe(false);
    });

    it("rejects invalid status values", () => {
      expect(parseDraftOptionalStatus("INVALID").ok).toBe(false);
    });

    it("accepts valid status values", () => {
      expect(parseDraftOptionalStatus("DRAFT").ok).toBe(true);
      expect(parseDraftOptionalStatus("REVIEWING").ok).toBe(true);
      expect(parseDraftOptionalStatus("READY").ok).toBe(true);
      expect(parseDraftOptionalStatus("PUBLISHED").ok).toBe(true);
    });
  });
});

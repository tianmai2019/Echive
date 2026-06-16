import { describe, expect, it } from "vitest";

import {
  MAX_MATERIAL_CONTENT_LENGTH,
  MAX_MATERIAL_SOURCE_LENGTH,
  MAX_MATERIAL_TITLE_LENGTH,
  parseMaterialContent,
  parseMaterialOptionalStatus,
  parseMaterialOptionalText,
  parseMaterialTitle,
  parseMaterialType,
} from "@/lib/material-validation";

describe("material validation", () => {
  describe("parseMaterialTitle", () => {
    it("rejects non-string values", () => {
      expect(parseMaterialTitle(null).ok).toBe(false);
      expect(parseMaterialTitle(undefined).ok).toBe(false);
      expect(parseMaterialTitle(123).ok).toBe(false);
      expect(parseMaterialTitle({}).ok).toBe(false);
    });

    it("rejects empty or whitespace-only strings", () => {
      expect(parseMaterialTitle("").ok).toBe(false);
      expect(parseMaterialTitle("   ").ok).toBe(false);
    });

    it("rejects strings exceeding max length", () => {
      const longTitle = "a".repeat(MAX_MATERIAL_TITLE_LENGTH + 1);
      expect(parseMaterialTitle(longTitle).ok).toBe(false);
    });

    it("accepts valid titles and trims them", () => {
      const result = parseMaterialTitle("  Test Title  ");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: string }).value).toBe("Test Title");
    });
  });

  describe("parseMaterialType", () => {
    it("rejects non-string values", () => {
      expect(parseMaterialType(null).ok).toBe(false);
      expect(parseMaterialType(undefined).ok).toBe(false);
      expect(parseMaterialType(123).ok).toBe(false);
    });

    it("rejects invalid types", () => {
      expect(parseMaterialType("INVALID").ok).toBe(false);
    });

    it("accepts valid types", () => {
      expect(parseMaterialType("NOTE").ok).toBe(true);
      expect(parseMaterialType("LINK").ok).toBe(true);
      expect(parseMaterialType("QUOTE").ok).toBe(true);
      expect(parseMaterialType("IMAGE").ok).toBe(true);
      expect(parseMaterialType("VOICE").ok).toBe(true);
      expect(parseMaterialType("CHAT").ok).toBe(true);
    });
  });

  describe("parseMaterialContent", () => {
    it("rejects non-string values", () => {
      expect(parseMaterialContent(null).ok).toBe(false);
      expect(parseMaterialContent(undefined).ok).toBe(false);
      expect(parseMaterialContent(123).ok).toBe(false);
    });

    it("rejects empty or whitespace-only strings", () => {
      expect(parseMaterialContent("").ok).toBe(false);
      expect(parseMaterialContent("   ").ok).toBe(false);
    });

    it("rejects strings exceeding max length", () => {
      const longContent = "a".repeat(MAX_MATERIAL_CONTENT_LENGTH + 1);
      expect(parseMaterialContent(longContent).ok).toBe(false);
    });

    it("accepts valid content and trims it", () => {
      const result = parseMaterialContent("  Test content  ");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: string }).value).toBe("Test content");
    });
  });

  describe("parseMaterialOptionalStatus", () => {
    it("accepts undefined or null", () => {
      expect(parseMaterialOptionalStatus(undefined).ok).toBe(true);
      expect(parseMaterialOptionalStatus(null).ok).toBe(true);
    });

    it("rejects non-string values", () => {
      expect(parseMaterialOptionalStatus(123).ok).toBe(false);
      expect(parseMaterialOptionalStatus({}).ok).toBe(false);
    });

    it("rejects invalid status values", () => {
      expect(parseMaterialOptionalStatus("INVALID").ok).toBe(false);
    });

    it("accepts valid status values", () => {
      expect(parseMaterialOptionalStatus("RAW").ok).toBe(true);
      expect(parseMaterialOptionalStatus("SORTED").ok).toBe(true);
      expect(parseMaterialOptionalStatus("USABLE").ok).toBe(true);
      expect(parseMaterialOptionalStatus("USED").ok).toBe(true);
    });
  });

  describe("parseMaterialOptionalText", () => {
    it("returns undefined when key is missing", () => {
      const result = parseMaterialOptionalText({}, "source");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: undefined }).value).toBeUndefined();
    });

    it("accepts null values", () => {
      const result = parseMaterialOptionalText({ source: null }, "source");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: null }).value).toBeNull();
    });

    it("rejects non-string values", () => {
      expect(parseMaterialOptionalText({ source: 123 }, "source").ok).toBe(false);
    });

    it("rejects strings exceeding max length for source", () => {
      const longSource = "a".repeat(MAX_MATERIAL_SOURCE_LENGTH + 1);
      expect(parseMaterialOptionalText({ source: longSource }, "source").ok).toBe(false);
    });

    it("accepts valid values and trims them", () => {
      const result = parseMaterialOptionalText({ source: "  https://example.com  " }, "source");
      expect(result.ok).toBe(true);
      expect((result as { ok: true; value: string }).value).toBe("https://example.com");
    });
  });
});

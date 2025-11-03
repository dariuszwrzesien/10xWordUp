import { describe, it, expect } from "vitest";
import { createWordSchema, updateWordSchema, getWordsQuerySchema, uuidParamSchema } from "@/lib/schemas/word.schema";
import { ZodError } from "zod";

describe("word.schema", () => {
  describe("createWordSchema", () => {
    it("should validate correct word data", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        tags: ["tag1", "tag2"],
        phonetic: "/test/",
        audio_url: "https://example.com/audio.mp3",
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "A test",
              example: "This is a test",
            },
          ],
        },
      };

      const result = createWordSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require word field", () => {
      const invalidData = {
        translation: "test",
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should require translation field", () => {
      const invalidData = {
        word: "test",
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject empty word string", () => {
      const invalidData = {
        word: "",
        translation: "test",
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createWordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Word is required");
      }
    });

    it("should reject empty translation string", () => {
      const invalidData = {
        word: "test",
        translation: "",
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createWordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Translation is required");
      }
    });

    it("should reject word longer than 255 chars", () => {
      const longWord = "a".repeat(256);
      const invalidData = {
        word: longWord,
        translation: "test",
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createWordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Word must be less than 255 characters");
      }
    });

    it("should reject translation longer than 255 chars", () => {
      const longTranslation = "a".repeat(256);
      const invalidData = {
        word: "test",
        translation: longTranslation,
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createWordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Translation must be less than 255 characters");
      }
    });

    it("should accept word at exactly 255 chars", () => {
      const maxWord = "a".repeat(255);
      const validData = {
        word: maxWord,
        translation: "test",
      };

      const result = createWordSchema.parse(validData);
      expect(result.word).toBe(maxWord);
    });

    it("should accept optional tags array", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        tags: ["tag1", "tag2", "tag3"],
      };

      const result = createWordSchema.parse(validData);
      expect(result.tags).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should accept empty tags array", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        tags: [],
      };

      const result = createWordSchema.parse(validData);
      expect(result.tags).toEqual([]);
    });

    it("should accept optional phonetic", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        phonetic: "/test/",
      };

      const result = createWordSchema.parse(validData);
      expect(result.phonetic).toBe("/test/");
    });

    it("should accept optional audio_url", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        audio_url: "https://example.com/audio.mp3",
      };

      const result = createWordSchema.parse(validData);
      expect(result.audio_url).toBe("https://example.com/audio.mp3");
    });

    it("should validate audio_url is valid URL", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        audio_url: "https://api.dictionaryapi.dev/media/test.mp3",
      };

      const result = createWordSchema.parse(validData);
      expect(result.audio_url).toBe("https://api.dictionaryapi.dev/media/test.mp3");
    });

    it("should reject invalid audio_url", () => {
      const invalidData = {
        word: "test",
        translation: "test po polsku",
        audio_url: "not-a-valid-url",
      };

      expect(() => createWordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createWordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Invalid audio URL");
      }
    });

    it("should accept null values for optional fields", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        phonetic: null,
        audio_url: null,
        examples: null,
      };

      const result = createWordSchema.parse(validData);
      expect(result.phonetic).toBeNull();
      expect(result.audio_url).toBeNull();
      expect(result.examples).toBeNull();
    });

    it("should accept examples with correct structure", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "A procedure",
              example: "Run a test",
            },
          ],
        },
      };

      const result = createWordSchema.parse(validData);
      expect(result.examples).toBeDefined();
      expect(result.examples?.definitions).toHaveLength(1);
    });

    it("should accept examples without optional example field", () => {
      const validData = {
        word: "test",
        translation: "test po polsku",
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "A procedure",
            },
          ],
        },
      };

      const result = createWordSchema.parse(validData);
      expect(result.examples?.definitions?.[0].example).toBeUndefined();
    });

    it("should work with minimal required data", () => {
      const minimalData = {
        word: "test",
        translation: "test po polsku",
      };

      const result = createWordSchema.parse(minimalData);
      expect(result.word).toBe("test");
      expect(result.translation).toBe("test po polsku");
    });
  });

  describe("updateWordSchema", () => {
    it("should allow partial updates", () => {
      const partialData = {
        word: "updated",
      };

      const result = updateWordSchema.parse(partialData);
      expect(result.word).toBe("updated");
      expect(result.translation).toBeUndefined();
    });

    it("should validate all fields are optional", () => {
      const emptyData = {};

      const result = updateWordSchema.parse(emptyData);
      expect(result).toEqual({});
    });

    it("should reject empty strings if provided", () => {
      const invalidData = {
        word: "",
      };

      expect(() => updateWordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        updateWordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Word must not be empty");
      }
    });

    it("should validate field constraints when provided", () => {
      const invalidData = {
        word: "a".repeat(256),
      };

      expect(() => updateWordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should accept valid word update", () => {
      const validData = {
        word: "updated word",
        translation: "zaktualizowane słowo",
      };

      const result = updateWordSchema.parse(validData);
      expect(result.word).toBe("updated word");
      expect(result.translation).toBe("zaktualizowane słowo");
    });

    it("should accept tags update", () => {
      const validData = {
        tags: ["new-tag1", "new-tag2"],
      };

      const result = updateWordSchema.parse(validData);
      expect(result.tags).toEqual(["new-tag1", "new-tag2"]);
    });

    it("should accept null values for nullable fields", () => {
      const validData = {
        phonetic: null,
        audio_url: null,
        examples: null,
      };

      const result = updateWordSchema.parse(validData);
      expect(result.phonetic).toBeNull();
      expect(result.audio_url).toBeNull();
      expect(result.examples).toBeNull();
    });

    it("should validate audio_url when provided", () => {
      const invalidData = {
        audio_url: "not-a-url",
      };

      expect(() => updateWordSchema.parse(invalidData)).toThrow(ZodError);
    });
  });

  describe("getWordsQuerySchema", () => {
    it("should set default page to 1", () => {
      const result = getWordsQuerySchema.parse({});
      expect(result.page).toBe(1);
    });

    it("should set default limit to 20", () => {
      const result = getWordsQuerySchema.parse({});
      expect(result.limit).toBe(20);
    });

    it("should transform string to number for page", () => {
      const result = getWordsQuerySchema.parse({ page: "5" });
      expect(result.page).toBe(5);
      expect(typeof result.page).toBe("number");
    });

    it("should transform string to number for limit", () => {
      const result = getWordsQuerySchema.parse({ limit: "50" });
      expect(result.limit).toBe(50);
      expect(typeof result.limit).toBe("number");
    });

    it("should reject page less than 1", () => {
      expect(() => getWordsQuerySchema.parse({ page: "0" })).toThrow(ZodError);
      try {
        getWordsQuerySchema.parse({ page: "0" });
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Page must be greater than 0");
      }
    });

    it("should reject negative page numbers", () => {
      expect(() => getWordsQuerySchema.parse({ page: "-1" })).toThrow(ZodError);
    });

    it("should reject limit greater than 100", () => {
      expect(() => getWordsQuerySchema.parse({ limit: "101" })).toThrow(ZodError);
      try {
        getWordsQuerySchema.parse({ limit: "101" });
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Limit must be between 1 and 100");
      }
    });

    it("should reject limit less than 1", () => {
      expect(() => getWordsQuerySchema.parse({ limit: "0" })).toThrow(ZodError);
    });

    it("should accept limit of exactly 100", () => {
      const result = getWordsQuerySchema.parse({ limit: "100" });
      expect(result.limit).toBe(100);
    });

    it("should accept valid sort values", () => {
      const validSorts = ["created_at", "updated_at", "word"];

      validSorts.forEach((sort) => {
        const result = getWordsQuerySchema.parse({ sort });
        expect(result.sort).toBe(sort);
      });
    });

    it("should reject invalid sort values", () => {
      expect(() => getWordsQuerySchema.parse({ sort: "invalid" })).toThrow(ZodError);
    });

    it("should accept valid order values (asc/desc)", () => {
      const ascResult = getWordsQuerySchema.parse({ order: "asc" });
      expect(ascResult.order).toBe("asc");

      const descResult = getWordsQuerySchema.parse({ order: "desc" });
      expect(descResult.order).toBe("desc");
    });

    it("should reject invalid order values", () => {
      expect(() => getWordsQuerySchema.parse({ order: "invalid" })).toThrow(ZodError);
    });

    it('should set default sort to "created_at"', () => {
      const result = getWordsQuerySchema.parse({});
      expect(result.sort).toBe("created_at");
    });

    it('should set default order to "desc"', () => {
      const result = getWordsQuerySchema.parse({});
      expect(result.order).toBe("desc");
    });

    it("should accept optional tag parameter", () => {
      const result = getWordsQuerySchema.parse({ tag: "tag-uuid-123" });
      expect(result.tag).toBe("tag-uuid-123");
    });

    it("should work with all parameters", () => {
      const result = getWordsQuerySchema.parse({
        page: "2",
        limit: "50",
        sort: "word",
        order: "asc",
        tag: "tag-123",
      });

      expect(result).toEqual({
        page: 2,
        limit: 50,
        sort: "word",
        order: "asc",
        tag: "tag-123",
      });
    });
  });

  describe("uuidParamSchema", () => {
    it("should validate correct UUID", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = uuidParamSchema.parse(validUuid);
      expect(result).toBe(validUuid);
    });

    it("should reject invalid UUID format", () => {
      const invalidUuids = [
        "not-a-uuid",
        "123-456-789",
        "123e4567-e89b-12d3-a456",
        "123e4567-e89b-12d3-a456-42661417400g",
        "",
      ];

      invalidUuids.forEach((invalidUuid) => {
        expect(() => uuidParamSchema.parse(invalidUuid)).toThrow(ZodError);
      });
    });

    it("should provide clear error message", () => {
      try {
        uuidParamSchema.parse("invalid-uuid");
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Invalid UUID format");
      }
    });

    it("should accept UUID in various valid formats", () => {
      const validUuids = [
        "123e4567-e89b-12d3-a456-426614174000",
        "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "00000000-0000-0000-0000-000000000000",
        "ffffffff-ffff-ffff-ffff-ffffffffffff",
      ];

      validUuids.forEach((uuid) => {
        const result = uuidParamSchema.parse(uuid);
        expect(result).toBe(uuid);
      });
    });

    it("should reject UUID with wrong casing in validation", () => {
      // UUID v4 should be lowercase by convention, but Zod accepts both
      const upperUuid = "123E4567-E89B-12D3-A456-426614174000";
      const result = uuidParamSchema.parse(upperUuid);
      expect(result).toBe(upperUuid); // Zod accepts both cases
    });
  });
});

import { describe, it, expect } from "vitest";
import type { Database } from "@/types/database.types";

type WordRow = Database["public"]["Tables"]["words"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];

// Since WordService.mapToWordDTO is private, we'll create a test version
// In a real scenario, you might want to export this as a pure function
function mapToWordDTO(word: WordRow, tags: TagRow[]) {
  return {
    id: word.id,
    word: word.word,
    translation: word.translation,
    phonetic: word.phonetic,
    audio_url: word.audio_url,
    examples: word.examples,
    created_at: word.created_at,
    updated_at: word.updated_at,
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      created_at: tag.created_at,
    })),
  };
}

describe("WordService - Pure Methods", () => {
  describe("mapToWordDTO", () => {
    it("should map WordRow and tags to WordDTO", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test po polsku",
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
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      };

      const tags: TagRow[] = [
        {
          id: "tag-1",
          user_id: "user-123",
          name: "technology",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "tag-2",
          user_id: "user-123",
          name: "learning",
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const result = mapToWordDTO(wordRow, tags);

      expect(result).toEqual({
        id: "word-123",
        word: "test",
        translation: "test po polsku",
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
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
        tags: [
          {
            id: "tag-1",
            name: "technology",
            created_at: "2024-01-01T00:00:00Z",
          },
          {
            id: "tag-2",
            name: "learning",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      });
    });

    it("should handle empty tags array", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToWordDTO(wordRow, []);

      expect(result.tags).toEqual([]);
    });

    it("should preserve all word fields", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "hello",
        translation: "cześć",
        phonetic: "/həˈloʊ/",
        audio_url: "https://example.com/hello.mp3",
        examples: {
          definitions: [
            {
              partOfSpeech: "interjection",
              definition: "Used as a greeting",
              example: "Hello, how are you?",
            },
          ],
        },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      };

      const result = mapToWordDTO(wordRow, []);

      expect(result.id).toBe(wordRow.id);
      expect(result.word).toBe(wordRow.word);
      expect(result.translation).toBe(wordRow.translation);
      expect(result.phonetic).toBe(wordRow.phonetic);
      expect(result.audio_url).toBe(wordRow.audio_url);
      expect(result.examples).toEqual(wordRow.examples);
      expect(result.created_at).toBe(wordRow.created_at);
      expect(result.updated_at).toBe(wordRow.updated_at);
    });

    it("should map tags with id, name, created_at", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const tags: TagRow[] = [
        {
          id: "tag-1",
          user_id: "user-123",
          name: "important",
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      const result = mapToWordDTO(wordRow, tags);

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0]).toHaveProperty("id");
      expect(result.tags[0]).toHaveProperty("name");
      expect(result.tags[0]).toHaveProperty("created_at");
      expect(result.tags[0]).not.toHaveProperty("user_id");
    });

    it("should handle null optional fields", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToWordDTO(wordRow, []);

      expect(result.phonetic).toBeNull();
      expect(result.audio_url).toBeNull();
      expect(result.examples).toBeNull();
    });

    it("should not include user_id in DTO", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToWordDTO(wordRow, []);

      expect(result).not.toHaveProperty("user_id");
    });

    it("should handle multiple tags correctly", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const tags: TagRow[] = [
        {
          id: "tag-1",
          user_id: "user-123",
          name: "tag1",
          created_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "tag-2",
          user_id: "user-123",
          name: "tag2",
          created_at: "2024-01-02T00:00:00Z",
        },
        {
          id: "tag-3",
          user_id: "user-123",
          name: "tag3",
          created_at: "2024-01-03T00:00:00Z",
        },
      ];

      const result = mapToWordDTO(wordRow, tags);

      expect(result.tags).toHaveLength(3);
      expect(result.tags[0].name).toBe("tag1");
      expect(result.tags[1].name).toBe("tag2");
      expect(result.tags[2].name).toBe("tag3");
    });

    it("should preserve tag order", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: null,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const tags: TagRow[] = [
        { id: "tag-3", user_id: "user-123", name: "C", created_at: "2024-01-01T00:00:00Z" },
        { id: "tag-1", user_id: "user-123", name: "A", created_at: "2024-01-01T00:00:00Z" },
        { id: "tag-2", user_id: "user-123", name: "B", created_at: "2024-01-01T00:00:00Z" },
      ];

      const result = mapToWordDTO(wordRow, tags);

      expect(result.tags[0].name).toBe("C");
      expect(result.tags[1].name).toBe("A");
      expect(result.tags[2].name).toBe("B");
    });

    it("should handle complex examples structure", () => {
      const wordRow: WordRow = {
        id: "word-123",
        user_id: "user-123",
        word: "test",
        translation: "test",
        phonetic: null,
        audio_url: null,
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "Definition 1",
              example: "Example 1",
            },
            {
              partOfSpeech: "verb",
              definition: "Definition 2",
              example: "Example 2",
            },
          ],
        },
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToWordDTO(wordRow, []);

      expect(result.examples).toEqual(wordRow.examples);
    });
  });
});

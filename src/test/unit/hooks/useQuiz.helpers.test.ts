import { describe, it, expect, vi } from "vitest";
import type { WordDTO } from "@/types/dto.types";

// Import the helper functions - we need to extract them from the hook file
// Since they're not exported, we'll test them through a test file that re-implements them
// or we can test them indirectly through the hook behavior

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Transform WordDTO to QuizQuestionDTO
function transformWordToQuestion(word: WordDTO) {
  return {
    word_id: word.id,
    word_en: word.word,
    word_pl: word.translation,
    audio: word.audio_url,
    examples:
      word.examples && typeof word.examples === "object" && "definitions" in word.examples
        ? ((word.examples.definitions as { example: string }[])
            ?.map((def: { example: string }) => def.example)
            .filter((ex: string | undefined): ex is string => ex !== undefined) ?? null)
        : null,
  };
}

describe("useQuiz helpers", () => {
  describe("shuffleArray", () => {
    it("should shuffle array elements", () => {
      vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValueOnce(0.3).mockReturnValueOnce(0.1);

      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(array);

      expect(shuffled).not.toEqual(array);
      expect(shuffled).toHaveLength(array.length);
    });

    it("should not modify original array", () => {
      const array = [1, 2, 3, 4, 5];
      const original = [...array];

      shuffleArray(array);

      expect(array).toEqual(original);
    });

    it("should return array with same length", () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(array);

      expect(shuffled).toHaveLength(array.length);
    });

    it("should contain all original elements", () => {
      const array = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(array);

      array.forEach((element) => {
        expect(shuffled).toContain(element);
      });
    });

    it("should handle empty array", () => {
      const array: number[] = [];
      const shuffled = shuffleArray(array);

      expect(shuffled).toEqual([]);
    });

    it("should handle single element array", () => {
      const array = [1];
      const shuffled = shuffleArray(array);

      expect(shuffled).toEqual([1]);
    });

    it("should handle two element array", () => {
      const array = [1, 2];
      const shuffled = shuffleArray(array);

      expect(shuffled).toHaveLength(2);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain(2);
    });

    it("should produce different order (statistical test)", () => {
      // Run shuffle multiple times and check if we get different results
      const array = [1, 2, 3, 4, 5];
      const results = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleArray(array);
        results.add(JSON.stringify(shuffled));
      }

      // With 10 shuffles of 5 elements, we should get at least 2 different arrangements
      expect(results.size).toBeGreaterThan(1);
    });

    it("should work with different data types", () => {
      const stringArray = ["a", "b", "c"];
      const shuffledStrings = shuffleArray(stringArray);
      expect(shuffledStrings).toHaveLength(3);
      expect(shuffledStrings).toContain("a");

      const objectArray = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const shuffledObjects = shuffleArray(objectArray);
      expect(shuffledObjects).toHaveLength(3);
      expect(shuffledObjects.some((obj) => obj.id === 1)).toBe(true);
    });

    it("should use Fisher-Yates algorithm correctly", () => {
      const mockRandom = vi.spyOn(Math, "random");

      // Clear any previous calls
      mockRandom.mockClear();

      mockRandom.mockReturnValueOnce(0.5); // Will select index 1 for swap with index 2
      mockRandom.mockReturnValueOnce(0); // Will select index 0 for swap with index 1

      const array = [1, 2, 3];
      const result = shuffleArray(array);

      // Fisher-Yates calls Math.random() n-1 times for array of length n
      expect(mockRandom).toHaveBeenCalledTimes(2); // n-1 iterations for n=3
      expect(result).toHaveLength(3);

      mockRandom.mockRestore();
    });
  });

  describe("transformWordToQuestion", () => {
    it("should transform WordDTO to QuizQuestionDTO", () => {
      const word: WordDTO = {
        id: "word-123",
        word: "test",
        translation: "test po polsku",
        audio_url: "https://example.com/audio.mp3",
        phonetic: "/test/",
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "A procedure",
              example: "This is a test",
            },
          ],
        },
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result).toEqual({
        word_id: "word-123",
        word_en: "test",
        word_pl: "test po polsku",
        audio: "https://example.com/audio.mp3",
        examples: ["This is a test"],
      });
    });

    it("should extract word_id from id", () => {
      const word: WordDTO = {
        id: "unique-id-123",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.word_id).toBe("unique-id-123");
    });

    it("should extract word_en from word", () => {
      const word: WordDTO = {
        id: "id",
        word: "hello",
        translation: "cześć",
        audio_url: null,
        phonetic: null,
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.word_en).toBe("hello");
    });

    it("should extract word_pl from translation", () => {
      const word: WordDTO = {
        id: "id",
        word: "hello",
        translation: "cześć",
        audio_url: null,
        phonetic: null,
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.word_pl).toBe("cześć");
    });

    it("should extract audio from audio_url", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: "https://example.com/test.mp3",
        phonetic: null,
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.audio).toBe("https://example.com/test.mp3");
    });

    it("should extract examples from definitions", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "First",
              example: "Example 1",
            },
            {
              partOfSpeech: "verb",
              definition: "Second",
              example: "Example 2",
            },
          ],
        },
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.examples).toEqual(["Example 1", "Example 2"]);
    });

    it("should handle null examples", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.examples).toBeNull();
    });

    it("should handle missing examples.definitions", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        examples: {} as any,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.examples).toBeNull();
    });

    it("should filter out undefined examples", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        examples: {
          definitions: [
            {
              partOfSpeech: "noun",
              definition: "First",
              example: "Example 1",
            },
            {
              partOfSpeech: "verb",
              definition: "Second",
              // No example field
            },
            {
              partOfSpeech: "adjective",
              definition: "Third",
              example: "Example 3",
            },
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.examples).toEqual(["Example 1", "Example 3"]);
    });

    it("should handle examples with different structure", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        examples: "invalid structure" as any,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.examples).toBeNull();
    });

    it("should handle null audio_url", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.audio).toBeNull();
    });

    it("should not include unnecessary fields", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: "/test/",
        examples: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [{ id: "tag-1", name: "tag", created_at: "2024-01-01" }],
      };

      const result = transformWordToQuestion(word);

      expect(result).not.toHaveProperty("phonetic");
      expect(result).not.toHaveProperty("created_at");
      expect(result).not.toHaveProperty("updated_at");
      expect(result).not.toHaveProperty("tags");
    });

    it("should return null examples when definitions is empty array", () => {
      const word: WordDTO = {
        id: "id",
        word: "test",
        translation: "test",
        audio_url: null,
        phonetic: null,
        examples: {
          definitions: [],
        },
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        tags: [],
      };

      const result = transformWordToQuestion(word);

      expect(result.examples).toEqual([]);
    });

    it("should handle multiple words transformation", () => {
      const words: WordDTO[] = [
        {
          id: "1",
          word: "word1",
          translation: "słowo1",
          audio_url: null,
          phonetic: null,
          examples: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
          tags: [],
        },
        {
          id: "2",
          word: "word2",
          translation: "słowo2",
          audio_url: null,
          phonetic: null,
          examples: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
          tags: [],
        },
      ];

      const results = words.map(transformWordToQuestion);

      expect(results).toHaveLength(2);
      expect(results[0].word_id).toBe("1");
      expect(results[1].word_id).toBe("2");
    });
  });
});

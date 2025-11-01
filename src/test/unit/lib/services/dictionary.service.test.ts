import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DictionaryService, type EnrichedWordData } from "@/lib/services/dictionary.service";

describe("DictionaryService", () => {
  let service: DictionaryService;

  beforeEach(() => {
    service = new DictionaryService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchWordData", () => {
    it("should fetch word data from API", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetic: "/test/",
          phonetics: [
            {
              text: "/test/",
              audio: "https://example.com/test-us.mp3",
            },
          ],
          meanings: [
            {
              partOfSpeech: "noun",
              definitions: [
                {
                  definition: "A procedure intended to establish the quality",
                  example: "A test of your knowledge",
                },
              ],
            },
          ],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result).toBeDefined();
      expect(result?.phonetic).toBe("/test/");
      expect(result?.audio_url).toBe("https://example.com/test-us.mp3");
      expect(result?.examples).toBeDefined();
    });

    it("should return cached data on subsequent calls", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetic: "/test/",
          phonetics: [],
          meanings: [],
        },
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      global.fetch = fetchMock;

      // First call - should fetch from API
      await service.fetchWordData("test");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call - should return from cache
      await service.fetchWordData("test");
      expect(fetchMock).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it("should cache by lowercase word", async () => {
      const mockApiResponse = [
        {
          word: "Test",
          phonetic: "/test/",
          phonetics: [],
          meanings: [],
        },
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      global.fetch = fetchMock;

      // Different casing should use same cache
      await service.fetchWordData("Test");
      await service.fetchWordData("TEST");
      await service.fetchWordData("test");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should return null for 404 responses", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await service.fetchWordData("nonexistentword");

      expect(result).toBeNull();
    });

    it("should return null on timeout after 3 seconds", async () => {
      // Mock a slow fetch that never resolves
      global.fetch = vi.fn().mockImplementation(
        (_url, options) =>
          new Promise((_, reject) => {
            // Simulate abort after timeout
            setTimeout(() => {
              const error = new Error("The operation was aborted");
              error.name = "AbortError";
              reject(error);
            }, 100);
          })
      );

      const result = await service.fetchWordData("slowword");

      expect(result).toBeNull();
    });

    it("should return null on API errors", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const result = await service.fetchWordData("test");

      expect(result).toBeNull();
    });

    it("should handle empty API response", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [],
      });

      const result = await service.fetchWordData("test");

      expect(result).toBeNull();
    });

    it("should prefer US audio pronunciation", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetics: [
            {
              audio: "https://example.com/test-uk.mp3",
            },
            {
              audio: "https://example.com/test-us.mp3",
            },
            {
              audio: "https://example.com/test-au.mp3",
            },
          ],
          meanings: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.audio_url).toBe("https://example.com/test-us.mp3");
    });

    it("should fallback to first audio if no US available", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetics: [
            {
              audio: "https://example.com/test-uk.mp3",
            },
            {
              audio: "https://example.com/test-au.mp3",
            },
          ],
          meanings: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.audio_url).toBe("https://example.com/test-uk.mp3");
    });

    it("should extract phonetic from phonetics array if not in root", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetics: [
            {
              text: "/test/",
              audio: "",
            },
          ],
          meanings: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.phonetic).toBe("/test/");
    });

    it("should limit definitions to 2 per meaning", async () => {
      const mockApiResponse = [
        {
          word: "test",
          meanings: [
            {
              partOfSpeech: "noun",
              definitions: [
                { definition: "Definition 1", example: "Example 1" },
                { definition: "Definition 2", example: "Example 2" },
                { definition: "Definition 3", example: "Example 3" },
                { definition: "Definition 4", example: "Example 4" },
              ],
            },
          ],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.examples?.definitions).toHaveLength(2);
    });

    it("should handle missing phonetics", async () => {
      const mockApiResponse = [
        {
          word: "test",
          meanings: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.phonetic).toBeNull();
    });

    it("should handle missing audio", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetics: [
            {
              text: "/test/",
            },
          ],
          meanings: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.audio_url).toBeNull();
    });

    it("should handle missing examples", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetic: "/test/",
          meanings: [],
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      const result = await service.fetchWordData("test");

      expect(result?.examples).toBeNull();
    });

    it("should encode URI components in API calls", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => [{ word: "test word" }],
      });

      global.fetch = fetchMock;

      await service.fetchWordData("test word");

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("test%20word"),
        expect.any(Object)
      );
    });

    it("should handle AbortError on timeout", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      global.fetch = vi.fn().mockRejectedValue(
        Object.assign(new Error("The operation was aborted"), { name: "AbortError" })
      );

      const result = await service.fetchWordData("test");

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('timeout for word "test"')
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("transformApiResponse", () => {
    it("should transform full API response correctly", () => {
      const mockApiResponse = {
        word: "test",
        phonetic: "/test/",
        phonetics: [
          {
            text: "/test/",
            audio: "https://example.com/test-us.mp3",
          },
        ],
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: "A procedure intended to establish quality",
                example: "A test of knowledge",
              },
            ],
          },
        ],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.phonetic).toBe("/test/");
      expect(result.audio_url).toBe("https://example.com/test-us.mp3");
      expect(result.examples).toBeDefined();
      expect(result.examples?.definitions).toHaveLength(1);
      expect(result.examples?.definitions?.[0]).toEqual({
        partOfSpeech: "noun",
        definition: "A procedure intended to establish quality",
        example: "A test of knowledge",
      });
    });

    it("should handle missing phonetic gracefully", () => {
      const mockApiResponse = {
        word: "test",
        meanings: [],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.phonetic).toBeNull();
    });

    it("should handle missing audio gracefully", () => {
      const mockApiResponse = {
        word: "test",
        phonetics: [],
        meanings: [],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.audio_url).toBeNull();
    });

    it("should handle missing meanings gracefully", () => {
      const mockApiResponse = {
        word: "test",
        phonetic: "/test/",
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.examples).toBeNull();
    });

    it("should prefer US audio over other pronunciations", () => {
      const mockApiResponse = {
        word: "test",
        phonetics: [
          {
            audio: "https://example.com/test-uk.mp3",
          },
          {
            audio: "https://example.com/test-us.mp3",
          },
        ],
        meanings: [],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.audio_url).toBe("https://example.com/test-us.mp3");
    });

    it("should extract examples from definitions", () => {
      const mockApiResponse = {
        word: "test",
        meanings: [
          {
            partOfSpeech: "verb",
            definitions: [
              {
                definition: "Put to the test",
                example: "Testing the waters",
              },
              {
                definition: "Try out",
                example: "Test your skills",
              },
            ],
          },
        ],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.examples?.definitions).toHaveLength(2);
      expect(result.examples?.definitions?.[0].example).toBe("Testing the waters");
      expect(result.examples?.definitions?.[1].example).toBe("Test your skills");
    });

    it("should handle definitions without examples", () => {
      const mockApiResponse = {
        word: "test",
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition: "A procedure",
              },
            ],
          },
        ],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.examples?.definitions).toHaveLength(1);
      expect(result.examples?.definitions?.[0].example).toBeUndefined();
    });

    it("should handle multiple meanings", () => {
      const mockApiResponse = {
        word: "test",
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [{ definition: "Noun definition" }],
          },
          {
            partOfSpeech: "verb",
            definitions: [{ definition: "Verb definition" }],
          },
        ],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.examples?.definitions).toHaveLength(2);
      expect(result.examples?.definitions?.[0].partOfSpeech).toBe("noun");
      expect(result.examples?.definitions?.[1].partOfSpeech).toBe("verb");
    });

    it("should prefer root phonetic over phonetics array", () => {
      const mockApiResponse = {
        word: "test",
        phonetic: "/root-phonetic/",
        phonetics: [
          {
            text: "/array-phonetic/",
          },
        ],
        meanings: [],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.phonetic).toBe("/root-phonetic/");
    });

    it("should return null examples when no meanings", () => {
      const mockApiResponse = {
        word: "test",
        phonetic: "/test/",
        meanings: [],
      };

      const result = service["transformApiResponse"](mockApiResponse);

      expect(result.examples).toBeNull();
    });
  });

  describe("clearCache", () => {
    it("should clear specific word from cache", async () => {
      const mockApiResponse = [
        {
          word: "test",
          phonetic: "/test/",
          meanings: [],
        },
      ];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      global.fetch = fetchMock;

      // Fetch and cache
      await service.fetchWordData("test");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Verify it's cached
      await service.fetchWordData("test");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Clear cache for this word
      service.clearCache("test");

      // Should fetch again
      await service.fetchWordData("test");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("should clear entire cache when no word specified", async () => {
      const mockApiResponse = [{ word: "test", meanings: [] }];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      global.fetch = fetchMock;

      // Cache multiple words
      await service.fetchWordData("word1");
      await service.fetchWordData("word2");
      expect(fetchMock).toHaveBeenCalledTimes(2);

      // Verify they're cached
      await service.fetchWordData("word1");
      await service.fetchWordData("word2");
      expect(fetchMock).toHaveBeenCalledTimes(2);

      // Clear entire cache
      service.clearCache();

      // Should fetch again
      await service.fetchWordData("word1");
      await service.fetchWordData("word2");
      expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it("should handle clearing non-existent word from cache", () => {
      expect(() => service.clearCache("nonexistent")).not.toThrow();
    });

    it("should use lowercase for cache key when clearing", async () => {
      const mockApiResponse = [{ word: "Test", meanings: [] }];

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      });

      global.fetch = fetchMock;

      // Cache with uppercase
      await service.fetchWordData("Test");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Clear with different casing
      service.clearCache("TEST");

      // Should fetch again
      await service.fetchWordData("test");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});


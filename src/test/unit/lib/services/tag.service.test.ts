import { describe, it, expect } from "vitest";
import type { Database } from "@/types/database.types";

type TagRow = Database["public"]["Tables"]["tags"]["Row"];

// Since TagService.mapToTagDTO is private, we'll create a test version
// In a real scenario, you might want to export this as a pure function
function mapToTagDTO(tag: TagRow) {
  return {
    id: tag.id,
    name: tag.name,
    created_at: tag.created_at,
  };
}

describe("TagService - Pure Methods", () => {
  describe("mapToTagDTO", () => {
    it("should map TagRow to TagDTO", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "technology",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result).toEqual({
        id: "tag-123",
        name: "technology",
        created_at: "2024-01-01T00:00:00Z",
      });
    });

    it("should preserve all tag fields", () => {
      const tagRow: TagRow = {
        id: "tag-456",
        user_id: "user-456",
        name: "learning",
        created_at: "2024-02-01T12:30:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.id).toBe(tagRow.id);
      expect(result.name).toBe(tagRow.name);
      expect(result.created_at).toBe(tagRow.created_at);
    });

    it("should not include user_id in DTO", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "important",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result).not.toHaveProperty("user_id");
    });

    it("should handle tag with spaces in name", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "my important tag",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.name).toBe("my important tag");
    });

    it("should handle tag with hyphens in name", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "work-related",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.name).toBe("work-related");
    });

    it("should handle tag with underscores in name", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "to_review",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.name).toBe("to_review");
    });

    it("should handle tag with numbers in name", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "level-1",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.name).toBe("level-1");
    });

    it("should handle multiple tags mapping", () => {
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

      const results = tags.map(mapToTagDTO);

      expect(results).toHaveLength(3);
      expect(results[0].id).toBe("tag-1");
      expect(results[1].id).toBe("tag-2");
      expect(results[2].id).toBe("tag-3");
    });

    it("should preserve ISO 8601 timestamp format", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "test",
        created_at: "2024-11-01T15:30:45.123Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.created_at).toBe("2024-11-01T15:30:45.123Z");
    });

    it("should have exactly 3 properties", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "test",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(Object.keys(result)).toHaveLength(3);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("created_at");
    });

    it("should maintain referential integrity of id", () => {
      const tagRow: TagRow = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        user_id: "user-123",
        name: "test",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.id).toBe(tagRow.id);
    });

    it("should handle edge case with empty-like but valid name", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "   ", // Spaces (though this would fail validation)
        created_at: "2024-01-01T00:00:00Z",
      };

      const result = mapToTagDTO(tagRow);

      expect(result.name).toBe("   ");
    });

    it("should be a pure function", () => {
      const tagRow: TagRow = {
        id: "tag-123",
        user_id: "user-123",
        name: "test",
        created_at: "2024-01-01T00:00:00Z",
      };

      const result1 = mapToTagDTO(tagRow);
      const result2 = mapToTagDTO(tagRow);

      expect(result1).toEqual(result2);
    });
  });
});


import { describe, it, expect } from "vitest";
import { createTagSchema, updateTagSchema, uuidParamSchema } from "@/lib/schemas/tag.schema";
import { ZodError } from "zod";

describe("tag.schema", () => {
  describe("createTagSchema", () => {
    it("should validate correct tag data", () => {
      const validData = {
        name: "my-tag",
      };

      const result = createTagSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require name field", () => {
      const invalidData = {};

      expect(() => createTagSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject empty tag name", () => {
      const invalidData = {
        name: "",
      };

      expect(() => createTagSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createTagSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Tag name is required");
      }
    });

    it("should reject tag name longer than 50 chars", () => {
      const invalidData = {
        name: "a".repeat(51),
      };

      expect(() => createTagSchema.parse(invalidData)).toThrow(ZodError);
      try {
        createTagSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Tag name must be less than 50 characters");
      }
    });

    it("should accept tag name at exactly 50 chars", () => {
      const validData = {
        name: "a".repeat(50),
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe("a".repeat(50));
    });

    it("should accept letters in tag name", () => {
      const validData = {
        name: "abcdefghijklmnopqrstuvwxyzABCD", // 30 chars, under the 50 limit
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe(validData.name);
    });

    it("should accept numbers in tag name", () => {
      const validData = {
        name: "tag123",
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe("tag123");
    });

    it("should accept spaces in tag name", () => {
      const validData = {
        name: "my tag name",
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe("my tag name");
    });

    it("should accept hyphens in tag name", () => {
      const validData = {
        name: "my-tag-name",
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe("my-tag-name");
    });

    it("should accept underscores in tag name", () => {
      const validData = {
        name: "my_tag_name",
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe("my_tag_name");
    });

    it("should reject special characters in tag name", () => {
      const invalidChars = ["tag@name", "tag#name", "tag!name", "tag$name", "tag%name", "tag&name"];

      invalidChars.forEach((name) => {
        expect(() => createTagSchema.parse({ name })).toThrow(ZodError);
        try {
          createTagSchema.parse({ name });
        } catch (error) {
          expect((error as ZodError).errors[0].message).toBe(
            "Tag name can only contain letters, numbers, spaces, hyphens and underscores"
          );
        }
      });
    });

    it("should accept mixed valid characters", () => {
      const validData = {
        name: "Tag_123-Test Name",
      };

      const result = createTagSchema.parse(validData);
      expect(result.name).toBe("Tag_123-Test Name");
    });
  });

  describe("updateTagSchema", () => {
    it("should validate correct tag data", () => {
      const validData = {
        name: "updated-tag",
      };

      const result = updateTagSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require name field", () => {
      const invalidData = {};

      expect(() => updateTagSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject empty tag name", () => {
      const invalidData = {
        name: "",
      };

      expect(() => updateTagSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject tag name longer than 50 chars", () => {
      const invalidData = {
        name: "a".repeat(51),
      };

      expect(() => updateTagSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should validate same rules as createTagSchema", () => {
      const validData = {
        name: "Valid_Tag-123",
      };

      const result = updateTagSchema.parse(validData);
      expect(result.name).toBe("Valid_Tag-123");
    });

    it("should reject special characters", () => {
      const invalidData = {
        name: "invalid@tag",
      };

      expect(() => updateTagSchema.parse(invalidData)).toThrow(ZodError);
      try {
        updateTagSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe(
          "Tag name can only contain letters, numbers, spaces, hyphens and underscores"
        );
      }
    });

    it("should have same validation as create schema", () => {
      const testCases = [
        { name: "valid-tag", shouldPass: true },
        { name: "a".repeat(50), shouldPass: true },
        { name: "a".repeat(51), shouldPass: false },
        { name: "", shouldPass: false },
        { name: "tag@name", shouldPass: false },
        { name: "Tag 123_test-name", shouldPass: true },
      ];

      testCases.forEach(({ name, shouldPass }) => {
        if (shouldPass) {
          expect(() => updateTagSchema.parse({ name })).not.toThrow();
        } else {
          expect(() => updateTagSchema.parse({ name })).toThrow(ZodError);
        }
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

    it("should accept various valid UUID formats", () => {
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
  });
});

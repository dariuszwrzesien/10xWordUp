import { describe, it, expect } from "vitest";
import { requireAuth, AuthenticationError, type AuthenticatedUser } from "@/lib/helpers/auth.helper";

describe("auth.helper", () => {
  describe("AuthenticationError", () => {
    it("should create error with default message", () => {
      const error = new AuthenticationError();

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Unauthorized");
      expect(error.name).toBe("AuthenticationError");
    });

    it("should create error with custom message", () => {
      const error = new AuthenticationError("Custom auth error");

      expect(error.message).toBe("Custom auth error");
      expect(error.name).toBe("AuthenticationError");
    });

    it("should have correct name property", () => {
      const error = new AuthenticationError();

      expect(error.name).toBe("AuthenticationError");
    });

    it("should be throwable", () => {
      expect(() => {
        throw new AuthenticationError("Test error");
      }).toThrow(AuthenticationError);
    });

    it("should be catchable as Error", () => {
      try {
        throw new AuthenticationError("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AuthenticationError);
      }
    });
  });

  describe("requireAuth", () => {
    it("should return user data when user is authenticated", () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      const locals = {
        user: mockUser,
      } as App.Locals;

      const result = requireAuth(locals);

      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
      });
    });

    it("should return correct user structure", () => {
      const mockUser = {
        id: "user-456",
        email: "another@example.com",
      };

      const locals = {
        user: mockUser,
      } as App.Locals;

      const result = requireAuth(locals);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(Object.keys(result)).toHaveLength(2);
    });

    it("should throw AuthenticationError when user is null", () => {
      const locals = {
        user: null,
      } as App.Locals;

      expect(() => requireAuth(locals)).toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError when user is undefined", () => {
      const locals = {} as App.Locals;

      expect(() => requireAuth(locals)).toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError with Polish message", () => {
      const locals = {
        user: null,
      } as App.Locals;

      expect(() => requireAuth(locals)).toThrow("Musisz być zalogowany aby wykonać tę akcję");
    });

    it("should throw error that can be caught and handled", () => {
      const locals = {
        user: null,
      } as App.Locals;

      try {
        requireAuth(locals);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(AuthenticationError);
        if (error instanceof AuthenticationError) {
          expect(error.message).toBe("Musisz być zalogowany aby wykonać tę akcję");
          expect(error.name).toBe("AuthenticationError");
        }
      }
    });

    it("should preserve email format", () => {
      const testEmails = ["user@example.com", "test.user+tag@example.co.uk", "user123@test-domain.com"];

      testEmails.forEach((email) => {
        const locals = {
          user: {
            id: "test-id",
            email,
          },
        } as App.Locals;

        const result = requireAuth(locals);
        expect(result.email).toBe(email);
      });
    });

    it("should preserve user ID format", () => {
      const testIds = ["uuid-123-456", "12345678-1234-1234-1234-123456789012", "user_abc123"];

      testIds.forEach((id) => {
        const locals = {
          user: {
            id,
            email: "test@example.com",
          },
        } as App.Locals;

        const result = requireAuth(locals);
        expect(result.id).toBe(id);
      });
    });

    it("should return only id and email properties", () => {
      const locals = {
        user: {
          id: "user-123",
          email: "test@example.com",
          // These extra properties should not be in the result
          role: "admin",
          createdAt: "2024-01-01",
        },
      } as unknown as App.Locals;

      const result = requireAuth(locals);

      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
      });
      expect(result).not.toHaveProperty("role");
      expect(result).not.toHaveProperty("createdAt");
    });

    it("should satisfy AuthenticatedUser type", () => {
      const locals = {
        user: {
          id: "user-123",
          email: "test@example.com",
        },
      } as App.Locals;

      const result: AuthenticatedUser = requireAuth(locals);

      expect(result.id).toBeDefined();
      expect(result.email).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(typeof result.email).toBe("string");
    });
  });
});

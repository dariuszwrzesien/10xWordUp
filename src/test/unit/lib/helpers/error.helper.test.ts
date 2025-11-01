import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createErrorResponse,
  createValidationErrorResponse,
  badRequest,
  unauthorized,
  notFound,
  internalServerError,
  success,
  created,
  noContent,
  mapSupabaseAuthError,
  type ApiError,
} from "@/lib/helpers/error.helper";
import { ZodError, z } from "zod";

describe("error.helper", () => {
  describe("createErrorResponse", () => {
    it("should create error response with correct structure", async () => {
      const response = createErrorResponse(400, "Bad Request", "Invalid data");

      expect(response.status).toBe(400);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const body: ApiError = await response.json();
      expect(body).toEqual({
        error: "Bad Request",
        message: "Invalid data",
      });
    });

    it("should include details when provided", async () => {
      const details = { field: "email", issue: "invalid format" };
      const response = createErrorResponse(400, "Bad Request", "Invalid data", details);

      const body: ApiError = await response.json();
      expect(body.details).toEqual(details);
    });

    it("should not include details when not provided", async () => {
      const response = createErrorResponse(400, "Bad Request", "Invalid data");

      const body: ApiError = await response.json();
      expect(body.details).toBeUndefined();
    });
  });

  describe("createValidationErrorResponse", () => {
    it("should create validation error from ZodError", async () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      try {
        schema.parse({ email: "invalid", age: 10 });
      } catch (error) {
        const response = createValidationErrorResponse(error as ZodError);

        expect(response.status).toBe(400);

        const body: ApiError = await response.json();
        expect(body.error).toBe("Validation Error");
        expect(body.message).toBe("Invalid request data");
        expect(body.details).toBeDefined();
        expect(Array.isArray(body.details)).toBe(true);
      }
    });

    it("should map error paths correctly", async () => {
      const schema = z.object({
        user: z.object({
          email: z.string().email(),
        }),
      });

      try {
        schema.parse({ user: { email: "invalid" } });
      } catch (error) {
        const response = createValidationErrorResponse(error as ZodError);
        const body: ApiError = await response.json();
        const errors = body.details as { path: string; message: string }[];

        expect(errors[0].path).toBe("user.email");
      }
    });
  });

  describe("badRequest", () => {
    it("should create 400 response with correct status", async () => {
      const response = badRequest("Invalid request");

      expect(response.status).toBe(400);

      const body: ApiError = await response.json();
      expect(body.error).toBe("Bad Request");
      expect(body.message).toBe("Invalid request");
    });

    it("should include details when provided", async () => {
      const details = { reason: "missing field" };
      const response = badRequest("Invalid request", details);

      const body: ApiError = await response.json();
      expect(body.details).toEqual(details);
    });
  });

  describe("unauthorized", () => {
    it("should create 401 response with default message", async () => {
      const response = unauthorized();

      expect(response.status).toBe(401);

      const body: ApiError = await response.json();
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toBe("Unauthorized access");
    });

    it("should create 401 response with custom message", async () => {
      const response = unauthorized("Token expired");

      expect(response.status).toBe(401);

      const body: ApiError = await response.json();
      expect(body.message).toBe("Token expired");
    });
  });

  describe("notFound", () => {
    it("should create 404 response with correct message", async () => {
      const response = notFound("Word");

      expect(response.status).toBe(404);

      const body: ApiError = await response.json();
      expect(body.error).toBe("Not Found");
      expect(body.message).toBe("Word not found");
    });

    it("should format resource name in message", async () => {
      const response = notFound("User Profile");

      const body: ApiError = await response.json();
      expect(body.message).toBe("User Profile not found");
    });
  });

  describe("internalServerError", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    beforeEach(() => {
      consoleErrorSpy.mockClear();
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should create 500 response with default message", async () => {
      const response = internalServerError();

      expect(response.status).toBe(500);

      const body: ApiError = await response.json();
      expect(body.error).toBe("Internal Server Error");
      expect(body.message).toBe("Internal server error");
    });

    it("should create 500 response with custom message", async () => {
      const response = internalServerError("Database connection failed");

      const body: ApiError = await response.json();
      expect(body.message).toBe("Database connection failed");
    });

    it("should log errors to console", () => {
      const error = new Error("Test error");
      internalServerError("Error occurred", error);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Internal server error:", error);
    });

    it("should include error details in dev mode", async () => {
      vi.stubEnv("DEV", true);

      const error = new Error("Test error");
      const response = internalServerError("Error occurred", error);

      const body: ApiError = await response.json();
      expect(body.details).toBeDefined();
      expect(body.details).toEqual({ error: "Error: Test error" });
    });

    it("should hide error details in production", async () => {
      vi.stubEnv("DEV", false);

      const error = new Error("Test error");
      const response = internalServerError("Error occurred", error);

      const body: ApiError = await response.json();
      expect(body.details).toBeUndefined();
    });
  });

  describe("success", () => {
    it("should create success response with correct status", async () => {
      const data = { id: "123", name: "Test" };
      const response = success(data);

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/json");

      const body = await response.json();
      expect(body).toEqual(data);
    });

    it("should accept custom status code", async () => {
      const data = { message: "Updated" };
      const response = success(data, 202);

      expect(response.status).toBe(202);

      const body = await response.json();
      expect(body).toEqual(data);
    });

    it("should handle empty objects", async () => {
      const response = success({});

      const body = await response.json();
      expect(body).toEqual({});
    });

    it("should handle arrays", async () => {
      const data = [1, 2, 3];
      const response = success(data);

      const body = await response.json();
      expect(body).toEqual(data);
    });
  });

  describe("created", () => {
    it("should create 201 response", async () => {
      const data = { id: "123", name: "New Resource" };
      const response = created(data);

      expect(response.status).toBe(201);

      const body = await response.json();
      expect(body).toEqual(data);
    });
  });

  describe("noContent", () => {
    it("should create 204 response with no body", async () => {
      const response = noContent();

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });
  });

  describe("mapSupabaseAuthError", () => {
    const genericError = "Nieprawidłowy e-mail lub hasło";

    it('should map "Invalid login credentials" to generic message', () => {
      const error = { message: "Invalid login credentials" };
      expect(mapSupabaseAuthError(error)).toBe(genericError);
    });

    it('should map "Email not confirmed" to Polish message', () => {
      const error = { message: "Email not confirmed" };
      expect(mapSupabaseAuthError(error)).toBe(
        "Adres e-mail nie został potwierdzony. Sprawdź swoją skrzynkę e-mail."
      );
    });

    it('should map "User already registered" to Polish message', () => {
      const error = { message: "User already registered" };
      expect(mapSupabaseAuthError(error)).toBe("Użytkownik o tym adresie e-mail już istnieje");
    });

    it('should map "already been registered" to Polish message', () => {
      const error = { message: "This email has already been registered" };
      expect(mapSupabaseAuthError(error)).toBe("Użytkownik o tym adresie e-mail już istnieje");
    });

    it('should map "Password should be at least" to Polish message', () => {
      const error = { message: "Password should be at least 8 characters" };
      expect(mapSupabaseAuthError(error)).toBe("Hasło musi mieć minimum 8 znaków");
    });

    it('should map "Signup requires a valid password" to Polish message', () => {
      const error = { message: "Signup requires a valid password" };
      expect(mapSupabaseAuthError(error)).toBe("Hasło jest wymagane");
    });

    it('should map "Unable to validate email address" to Polish message', () => {
      const error = { message: "Unable to validate email address" };
      expect(mapSupabaseAuthError(error)).toBe("Nieprawidłowy format adresu e-mail");
    });

    it('should map "Email rate limit exceeded" to Polish message', () => {
      const error = { message: "Email rate limit exceeded" };
      expect(mapSupabaseAuthError(error)).toBe("Zbyt wiele prób rejestracji. Spróbuj ponownie za chwilę.");
    });

    it('should map "same as the old password" to Polish message', () => {
      const error = { message: "New password should not be the same as the old password" };
      expect(mapSupabaseAuthError(error)).toBe("Nowe hasło nie może być takie samo jak stare");
    });

    it('should map expired reset link errors to Polish message', () => {
      const error1 = { message: "For security purposes, you can only request this once every 60 seconds" };
      expect(mapSupabaseAuthError(error1)).toBe("Link resetujący wygasł. Poproś o nowy link.");

      const error2 = { message: "Token has expired, please try again" };
      expect(mapSupabaseAuthError(error2)).toBe("Link resetujący wygasł. Poproś o nowy link.");
    });

    it("should return generic message for unknown errors", () => {
      const error = { message: "Some random unknown error" };
      expect(mapSupabaseAuthError(error)).toBe(genericError);
    });

    it("should not reveal if user exists in error messages", () => {
      const error1 = { message: "User not found" };
      const error2 = { message: "Invalid login credentials" };

      // Both should return generic message for security
      expect(mapSupabaseAuthError(error1)).toBe(genericError);
      expect(mapSupabaseAuthError(error2)).toBe(genericError);
    });

    it("should handle errors with status codes", () => {
      const error = { message: "Invalid login credentials", status: 401 };
      expect(mapSupabaseAuthError(error)).toBe(genericError);
    });

    it("should handle case-sensitive messages", () => {
      const error = { message: "INVALID LOGIN CREDENTIALS" };
      // Should not match because Supabase returns specific casing
      expect(mapSupabaseAuthError(error)).toBe(genericError);
    });
  });
});


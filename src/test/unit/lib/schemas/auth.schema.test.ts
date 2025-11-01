import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/schemas/auth.schema";
import { ZodError } from "zod";

describe("auth.schema", () => {
  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require email field", () => {
      const invalidData = {
        password: "password123",
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should require password field", () => {
      const invalidData = {
        email: "test@example.com",
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should validate email format", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
      try {
        loginSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Nieprawidłowy format adresu e-mail");
      }
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
      try {
        loginSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Hasło jest wymagane");
      }
    });

    it("should accept any non-empty password on login", () => {
      const validData = {
        email: "test@example.com",
        password: "x", // Short password is OK for login
      };

      const result = loginSchema.parse(validData);
      expect(result.password).toBe("x");
    });

    it("should accept various valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "test.user+tag@example.co.uk",
        "user123@test-domain.com",
        "test@example.co",
      ];

      validEmails.forEach((email) => {
        const result = loginSchema.parse({ email, password: "pass" });
        expect(result.email).toBe(email);
      });
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require email field", () => {
      const invalidData = {
        password: "password123",
        confirmPassword: "password123",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should require password field", () => {
      const invalidData = {
        email: "test@example.com",
        confirmPassword: "password123",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should require confirmPassword field", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should validate email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
      try {
        registerSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Nieprawidłowy format adresu e-mail");
      }
    });

    it("should require password minimum 8 characters", () => {
      const invalidData = {
        email: "test@example.com",
        password: "pass",
        confirmPassword: "pass",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
      try {
        registerSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Hasło musi mieć minimum 8 znaków");
      }
    });

    it("should accept password at exactly 8 characters", () => {
      const validData = {
        email: "test@example.com",
        password: "12345678",
        confirmPassword: "12345678",
      };

      const result = registerSchema.parse(validData);
      expect(result.password).toBe("12345678");
    });

    it("should reject when passwords don't match", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password456",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
      try {
        registerSchema.parse(invalidData);
      } catch (error) {
        const zodError = error as ZodError;
        const confirmPasswordError = zodError.errors.find((e) => e.path.includes("confirmPassword"));
        expect(confirmPasswordError?.message).toBe("Hasła nie są zgodne");
      }
    });

    it("should validate passwords match with Polish error message", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different123",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow(ZodError);
      try {
        registerSchema.parse(invalidData);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.errors.some((e) => e.message === "Hasła nie są zgodne")).toBe(true);
      }
    });

    it("should accept long passwords", () => {
      const longPassword = "a".repeat(100);
      const validData = {
        email: "test@example.com",
        password: longPassword,
        confirmPassword: longPassword,
      };

      const result = registerSchema.parse(validData);
      expect(result.password).toBe(longPassword);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate correct forgot password data", () => {
      const validData = {
        email: "test@example.com",
      };

      const result = forgotPasswordSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require email field", () => {
      const invalidData = {};

      expect(() => forgotPasswordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should validate email format", () => {
      const invalidData = {
        email: "not-an-email",
      };

      expect(() => forgotPasswordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        forgotPasswordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Nieprawidłowy format adresu e-mail");
      }
    });

    it("should reject empty email", () => {
      const invalidData = {
        email: "",
      };

      expect(() => forgotPasswordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should accept various valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "test.user+tag@example.co.uk",
        "user123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = forgotPasswordSchema.parse({ email });
        expect(result.email).toBe(email);
      });
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate correct reset password data", () => {
      const validData = {
        password: "newpassword123",
        confirmPassword: "newpassword123",
      };

      const result = resetPasswordSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it("should require password field", () => {
      const invalidData = {
        confirmPassword: "password123",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should require confirmPassword field", () => {
      const invalidData = {
        password: "password123",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(ZodError);
    });

    it("should require password minimum 8 characters", () => {
      const invalidData = {
        password: "short",
        confirmPassword: "short",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        resetPasswordSchema.parse(invalidData);
      } catch (error) {
        expect((error as ZodError).errors[0].message).toBe("Hasło musi mieć minimum 8 znaków");
      }
    });

    it("should accept password at exactly 8 characters", () => {
      const validData = {
        password: "12345678",
        confirmPassword: "12345678",
      };

      const result = resetPasswordSchema.parse(validData);
      expect(result.password).toBe("12345678");
    });

    it("should reject when passwords don't match", () => {
      const invalidData = {
        password: "password123",
        confirmPassword: "password456",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        resetPasswordSchema.parse(invalidData);
      } catch (error) {
        const zodError = error as ZodError;
        const confirmPasswordError = zodError.errors.find((e) => e.path.includes("confirmPassword"));
        expect(confirmPasswordError?.message).toBe("Hasła nie są zgodne");
      }
    });

    it("should validate passwords match with Polish error message", () => {
      const invalidData = {
        password: "password123",
        confirmPassword: "different123",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow(ZodError);
      try {
        resetPasswordSchema.parse(invalidData);
      } catch (error) {
        const zodError = error as ZodError;
        expect(zodError.errors.some((e) => e.message === "Hasła nie są zgodne")).toBe(true);
      }
    });

    it("should have same validation rules as registerSchema for passwords", () => {
      const testCases = [
        { password: "12345678", confirmPassword: "12345678", shouldPass: true },
        { password: "short", confirmPassword: "short", shouldPass: false },
        { password: "password123", confirmPassword: "different", shouldPass: false },
        { password: "a".repeat(100), confirmPassword: "a".repeat(100), shouldPass: true },
      ];

      testCases.forEach(({ password, confirmPassword, shouldPass }) => {
        if (shouldPass) {
          expect(() => resetPasswordSchema.parse({ password, confirmPassword })).not.toThrow();
        } else {
          expect(() => resetPasswordSchema.parse({ password, confirmPassword })).toThrow(ZodError);
        }
      });
    });
  });
});


import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu e-mail"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Nieprawidłowy format adresu e-mail"),
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu e-mail"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są zgodne",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

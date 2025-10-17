import { z } from "zod";

/**
 * Schema walidacji dla tworzenia nowego tagu
 */
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name can only contain letters, numbers, spaces, hyphens and underscores"),
});

/**
 * Schema walidacji dla aktualizacji tagu
 */
export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name can only contain letters, numbers, spaces, hyphens and underscores"),
});

/**
 * Schema walidacji dla UUID w parametrach ścieżki
 */
export const uuidParamSchema = z.string().uuid("Invalid UUID format");

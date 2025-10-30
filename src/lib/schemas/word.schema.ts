import { z } from "zod";

/**
 * Schema dla przykładów z dictionary API
 */
const examplesSchema = z
  .object({
    definitions: z
      .array(
        z.object({
          partOfSpeech: z.string(),
          definition: z.string(),
          example: z.string().optional(),
        })
      )
      .optional(),
  })
  .nullable()
  .optional();

/**
 * Schema walidacji dla tworzenia nowego słowa
 * Wymaga: word (string), translation (string)
 * Opcjonalnie: tags (array stringów), phonetic, audio_url, examples
 */
export const createWordSchema = z.object({
  word: z.string().min(1, "Word is required").max(255, "Word must be less than 255 characters"),
  translation: z.string().min(1, "Translation is required").max(255, "Translation must be less than 255 characters"),
  tags: z.array(z.string()).optional(),
  phonetic: z.string().nullable().optional(),
  audio_url: z.string().url("Invalid audio URL").nullable().optional(),
  examples: examplesSchema,
});

/**
 * Schema walidacji dla aktualizacji słowa
 * Wszystkie pola opcjonalne, aby umożliwić częściową aktualizację
 */
export const updateWordSchema = z.object({
  word: z.string().min(1, "Word must not be empty").max(255, "Word must be less than 255 characters").optional(),
  translation: z
    .string()
    .min(1, "Translation must not be empty")
    .max(255, "Translation must be less than 255 characters")
    .optional(),
  tags: z.array(z.string()).optional(),
  phonetic: z.string().nullable().optional(),
  audio_url: z.string().url("Invalid audio URL").nullable().optional(),
  examples: examplesSchema,
});

/**
 * Schema walidacji dla parametrów zapytania GET /api/words
 */
export const getWordsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100"),
  tag: z.string().optional(),
  sort: z.enum(["created_at", "updated_at", "word"]).optional().default("created_at"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

/**
 * Schema walidacji dla UUID w parametrach ścieżki
 */
export const uuidParamSchema = z.string().uuid("Invalid UUID format");

import type { APIRoute } from "astro";

import { requireAuth, AuthenticationError } from "../../../lib/helpers/auth.helper";
import {
  badRequest,
  createValidationErrorResponse,
  internalServerError,
  noContent,
  notFound,
  success,
  unauthorized,
} from "../../../lib/helpers/error.helper";
import { updateWordSchema, uuidParamSchema } from "../../../lib/schemas/word.schema";
import { WordService } from "../../../lib/services/word.service";

export const prerender = false;

/**
 * GET /api/words/[id]
 * Pobiera szczegóły słowa
 */
export const GET: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = requireAuth(context.locals);

    // 2. Walidacja ID
    const wordId = context.params.id;
    const idValidation = uuidParamSchema.safeParse(wordId);
    if (!idValidation.success) {
      return badRequest("Invalid word ID format");
    }

    // 3. Pobranie słowa
    const wordService = new WordService(context.locals.supabase);
    const word = await wordService.getWordById(user.id, idValidation.data);

    if (!word) {
      return notFound("Word");
    }

    // 4. Zwrócenie odpowiedzi
    return success({ data: word });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorized(error.message);
    }
    console.error("Error fetching word:", error);
    return internalServerError("Failed to fetch word", error);
  }
};

/**
 * PUT /api/words/[id]
 * Aktualizuje słowo
 */
export const PUT: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = requireAuth(context.locals);

    // 2. Walidacja ID
    const wordId = context.params.id;
    const idValidation = uuidParamSchema.safeParse(wordId);
    if (!idValidation.success) {
      return badRequest("Invalid word ID format");
    }

    // 3. Parsowanie body
    let body;
    try {
      body = await context.request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    // 4. Walidacja danych wejściowych
    const validation = updateWordSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    // 5. Aktualizacja słowa
    const wordService = new WordService(context.locals.supabase);
    const word = await wordService.updateWord(user.id, idValidation.data, validation.data);

    if (!word) {
      return notFound("Word");
    }

    // 6. Zwrócenie odpowiedzi
    return success({ data: word });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorized(error.message);
    }
    console.error("Error updating word:", error);
    return internalServerError("Failed to update word", error);
  }
};

/**
 * DELETE /api/words/[id]
 * Usuwa słowo
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = requireAuth(context.locals);

    // 2. Walidacja ID
    const wordId = context.params.id;
    const idValidation = uuidParamSchema.safeParse(wordId);
    if (!idValidation.success) {
      return badRequest("Invalid word ID format");
    }

    // 3. Usunięcie słowa
    const wordService = new WordService(context.locals.supabase);
    const deleted = await wordService.deleteWord(user.id, idValidation.data);

    if (!deleted) {
      return notFound("Word");
    }

    // 4. Zwrócenie odpowiedzi (204 No Content)
    return noContent();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorized(error.message);
    }
    console.error("Error deleting word:", error);
    return internalServerError("Failed to delete word", error);
  }
};

import type { APIRoute } from "astro";

import { requireAuth } from "../../../lib/helpers/auth.helper";
import {
  badRequest,
  created,
  createValidationErrorResponse,
  internalServerError,
  success,
} from "../../../lib/helpers/error.helper";
import { createWordSchema, getWordsQuerySchema } from "../../../lib/schemas/word.schema";
import { WordService } from "../../../lib/services/word.service";

export const prerender = false;

/**
 * POST /api/words
 * Tworzy nowe słowo
 */
export const POST: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = await requireAuth();

    // 2. Parsowanie body
    let body;
    try {
      body = await context.request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    // 3. Walidacja danych wejściowych
    const validation = createWordSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    // 4. Utworzenie słowa
    const wordService = new WordService(context.locals.supabase);
    const word = await wordService.createWord(user.id, validation.data);

    // 5. Zwrócenie odpowiedzi
    return created({ data: word });
  } catch (error) {
    console.error("Error creating word:", error);
    return internalServerError("Failed to create word", error);
  }
};

/**
 * GET /api/words
 * Pobiera listę słów z paginacją i filtrowaniem
 */
export const GET: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = await requireAuth();

    // 2. Parsowanie i walidacja parametrów query
    const url = new URL(context.request.url);
    const queryParams = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "20",
      tag: url.searchParams.get("tag") || undefined,
      sort: url.searchParams.get("sort") || "created_at",
      order: url.searchParams.get("order") || "desc",
    };

    const validation = getWordsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    // 3. Pobranie słów
    const wordService = new WordService(context.locals.supabase);
    const result = await wordService.getWords(user.id, validation.data);

    // 4. Zwrócenie odpowiedzi
    return success(result);
  } catch (error) {
    console.error("Error fetching words:", error);
    return internalServerError("Failed to fetch words", error);
  }
};

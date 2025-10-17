import type { APIRoute } from "astro";

import { requireAuth } from "../../../lib/helpers/auth.helper";
import {
  badRequest,
  created,
  createValidationErrorResponse,
  internalServerError,
  success,
} from "../../../lib/helpers/error.helper";
import { createTagSchema } from "../../../lib/schemas/tag.schema";
import { TagService } from "../../../lib/services/tag.service";

export const prerender = false;

/**
 * POST /api/tags
 * Tworzy nowy tag
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
    const validation = createTagSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    // 4. Utworzenie tagu
    const tagService = new TagService(context.locals.supabase);
    try {
      const tag = await tagService.createTag(user.id, validation.data);
      return created(tag);
    } catch (error) {
      // Obsługa duplikatu nazwy tagu
      if (error instanceof Error && error.message.includes("already exists")) {
        return badRequest(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating tag:", error);
    return internalServerError("Failed to create tag", error);
  }
};

/**
 * GET /api/tags
 * Pobiera wszystkie tagi użytkownika
 */
export const GET: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = await requireAuth();

    // 2. Pobranie tagów
    const tagService = new TagService(context.locals.supabase);
    const tags = await tagService.getTags(user.id);

    // 3. Zwrócenie odpowiedzi
    return success(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return internalServerError("Failed to fetch tags", error);
  }
};

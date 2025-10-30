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
import { updateTagSchema, uuidParamSchema } from "../../../lib/schemas/tag.schema";
import { TagService } from "../../../lib/services/tag.service";

export const prerender = false;

/**
 * GET /api/tags/[id]
 * Pobiera szczegóły tagu
 */
export const GET: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = requireAuth(context.locals);

    // 2. Walidacja ID
    const tagId = context.params.id;
    console.log("tagId", tagId);
    const idValidation = uuidParamSchema.safeParse(tagId);
    if (!idValidation.success) {
      return badRequest("Invalid tag ID format");
    }

    console.log("idValidation.data", idValidation.data);

    // 3. Pobranie tagu
    const tagService = new TagService(context.locals.supabase);
    const tag = await tagService.getTagById(user.id, idValidation.data);

    if (!tag) {
      return notFound("Tag");
    }

    // 4. Zwrócenie odpowiedzi
    return success({ data: tag });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorized(error.message);
    }
    console.error("Error fetching tag:", error);
    return internalServerError("Failed to fetch tag", error);
  }
};

/**
 * PUT /api/tags/[id]
 * Aktualizuje tag
 */
export const PUT: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = requireAuth(context.locals);

    // 2. Walidacja ID
    const tagId = context.params.id;
    const idValidation = uuidParamSchema.safeParse(tagId);
    if (!idValidation.success) {
      return badRequest("Invalid tag ID format");
    }

    // 3. Parsowanie body
    let body;
    try {
      body = await context.request.json();
    } catch {
      return badRequest("Invalid JSON body");
    }

    // 4. Walidacja danych wejściowych
    const validation = updateTagSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    // 5. Aktualizacja tagu
    const tagService = new TagService(context.locals.supabase);
    try {
      const tag = await tagService.updateTag(user.id, idValidation.data, validation.data);

      if (!tag) {
        return notFound("Tag");
      }

      return success({ data: tag });
    } catch (error) {
      // Obsługa duplikatu nazwy tagu
      if (error instanceof Error && error.message.includes("already exists")) {
        return badRequest(error.message);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorized(error.message);
    }
    console.error("Error updating tag:", error);
    return internalServerError("Failed to update tag", error);
  }
};

/**
 * DELETE /api/tags/[id]
 * Usuwa tag
 */
export const DELETE: APIRoute = async (context) => {
  try {
    // 1. Uwierzytelnienie
    const user = requireAuth(context.locals);

    // 2. Walidacja ID
    const tagId = context.params.id;
    const idValidation = uuidParamSchema.safeParse(tagId);
    if (!idValidation.success) {
      return badRequest("Invalid tag ID format");
    }

    // 3. Usunięcie tagu
    const tagService = new TagService(context.locals.supabase);
    const deleted = await tagService.deleteTag(user.id, idValidation.data);

    if (!deleted) {
      return notFound("Tag");
    }

    // 4. Zwrócenie odpowiedzi (204 No Content)
    return noContent();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return unauthorized(error.message);
    }
    console.error("Error deleting tag:", error);
    return internalServerError("Failed to delete tag", error);
  }
};

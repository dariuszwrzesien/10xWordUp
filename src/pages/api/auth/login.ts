import type { APIRoute } from "astro";
import { loginSchema } from "@/lib/schemas/auth.schema";
import {
  createValidationErrorResponse,
  unauthorized,
  internalServerError,
  success,
  mapSupabaseAuthError,
} from "@/lib/helpers/error.helper";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const { email, password } = validation.data;

    // Get Supabase client from locals (provided by middleware)
    const supabase = locals.supabase;

    // Attempt to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication errors
    if (error) {
      const errorMessage = mapSupabaseAuthError(error);
      return unauthorized(errorMessage);
    }

    // Return success with user data
    return success({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      message: "Logowanie pomyślne",
    });
  } catch (error) {
    console.error("Login error:", error);
    return internalServerError("Wystąpił błąd podczas logowania", error);
  }
};

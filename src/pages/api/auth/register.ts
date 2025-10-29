import type { APIRoute } from "astro";
import { registerSchema } from "@/lib/schemas/auth.schema";
import {
  createValidationErrorResponse,
  badRequest,
  internalServerError,
  created,
  mapSupabaseAuthError,
} from "@/lib/helpers/error.helper";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const { email, password } = validation.data;

    // Get Supabase client from locals (provided by middleware)
    const supabase = locals.supabase;

    // Attempt to register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Email confirmation is required by default in Supabase
        // User will receive an email with confirmation link
        emailRedirectTo: `${new URL(request.url).origin}/login`,
      },
    });

    // Handle registration errors
    if (error) {
      const errorMessage = mapSupabaseAuthError(error);
      return badRequest(errorMessage);
    }

    // Check if email confirmation is required
    const emailConfirmationRequired = data.user && !data.user.email_confirmed_at;

    // Return success with user data and confirmation status
    return created({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      message: emailConfirmationRequired
        ? "Konto utworzone pomyślnie! Sprawdź swoją skrzynkę e-mail i potwierdź adres, aby się zalogować."
        : "Konto utworzone pomyślnie! Możesz się teraz zalogować.",
      emailConfirmationRequired,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return internalServerError("Wystąpił błąd podczas rejestracji", error);
  }
};

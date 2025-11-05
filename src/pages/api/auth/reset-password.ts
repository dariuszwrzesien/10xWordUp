import type { APIRoute } from "astro";
import { resetPasswordSchema } from "@/lib/schemas/auth.schema";
import {
  createValidationErrorResponse,
  badRequest,
  unauthorized,
  internalServerError,
  success,
} from "@/lib/helpers/error.helper";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input (including password confirmation match)
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const { password, confirmPassword } = validation.data;

    // Double-check passwords match (schema already validates this, but extra safety)
    if (password !== confirmPassword) {
      return badRequest("Hasła nie są zgodne");
    }

    // Extract token from headers
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return unauthorized("Brak tokenu uwierzytelniającego");
    }

    // Create a Supabase client
    const supabase = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY);

    // For PKCE flow, we need to verify the token and exchange it for a session
    // The token is a recovery token (PKCE code) that needs to be verified
    const {
      data: { user: verifiedUser, session },
      error: verifyError,
    } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "recovery",
    });

    if (verifyError || !verifiedUser || !session) {
      console.error("Token verification error:", verifyError);
      return unauthorized("Link resetujący jest nieprawidłowy lub wygasł");
    }

    // Now set the session to be able to update the password
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (sessionError) {
      console.error("Session error:", sessionError);
      return unauthorized("Nie udało się utworzyć sesji");
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      console.error("Password update error:", updateError);

      // Handle specific error cases
      if (updateError.message.includes("same as the old password")) {
        return badRequest("Nowe hasło nie może być takie samo jak stare");
      }

      if (updateError.message.includes("Password should be at least")) {
        return badRequest("Hasło musi mieć minimum 8 znaków");
      }

      return badRequest("Wystąpił błąd podczas resetowania hasła");
    }

    // Password updated successfully
    // User is already logged in with the new session from the reset link
    return success({
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
      },
      message: "Hasło zostało zmienione pomyślnie",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return internalServerError("Wystąpił błąd podczas resetowania hasła", error);
  }
};

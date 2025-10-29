import type { APIRoute } from "astro";
import { forgotPasswordSchema } from "@/lib/schemas/auth.schema";
import { createValidationErrorResponse, badRequest, internalServerError, success } from "@/lib/helpers/error.helper";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const { email } = validation.data;

    // Get Supabase client from locals (provided by middleware)
    const supabase = locals.supabase;

    // Send password reset email
    // Note: redirectTo should be the URL where user will be redirected after clicking the reset link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });

    // Handle errors from Supabase
    if (error) {
      console.error("Password reset error:", error);
      return badRequest("Wystąpił błąd podczas wysyłania linku resetującego");
    }

    // Always return success to prevent email enumeration attacks
    // This prevents attackers from knowing if an email exists in the system
    return success({
      message: "Jeśli konto istnieje, link został wysłany",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return internalServerError("Wystąpił błąd podczas wysyłania linku resetującego", error);
  }
};

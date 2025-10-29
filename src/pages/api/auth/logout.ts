import type { APIRoute } from "astro";
import { internalServerError, success } from "@/lib/helpers/error.helper";

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  try {
    // Get Supabase client from locals (provided by middleware)
    const supabase = locals.supabase;

    // Sign out from Supabase - this will automatically handle cookies through setAll
    // The setAll callback in supabase.client.ts will properly delete cookies when value is empty
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return internalServerError("Wystąpił błąd podczas wylogowania");
    }

    // Return success response
    return success({
      message: "Wylogowano pomyślnie",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return internalServerError("Wystąpił błąd podczas wylogowania", error);
  }
};

import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "../types/database.types.ts";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  // Set secure to false to allow cookies over HTTP (localhost)
  // In production with HTTPS, you should set this to true
  secure: false,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          // If value is empty or maxAge is 0, delete the cookie
          if (!value || options.maxAge === 0) {
            context.cookies.delete(name, { path: options.path || "/" });
          } else {
            context.cookies.set(name, value, options);
          }
        });
      },
    },
  });

  return supabase;
};

export type SupabaseServerClient = ReturnType<typeof createSupabaseServerInstance>;

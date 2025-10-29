import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.client.ts";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
// These paths redirect logged-in users to home
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/login",
  "/register",
  "/forgot-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
];

// Paths that should always be accessible (no redirect logic)
const UNRESTRICTED_PATHS = [
  "/api/auth/logout", // Logout must work for logged-in users
  "/reset-password", // Password reset creates a temporary session, must complete flow
  "/api/auth/reset-password", // Password reset API endpoint
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Create Supabase server instance
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // Store supabase instance in locals
  locals.supabase = supabase;

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      email: user.email ?? "",
      id: user.id,
    };
  } else {
    locals.user = null;
  }

  // Check if current path is unrestricted (should always pass through)
  const isUnrestrictedPath = UNRESTRICTED_PATHS.includes(url.pathname);
  if (isUnrestrictedPath) {
    return next();
  }

  // Check if current path is public
  const isPublicPath = PUBLIC_PATHS.includes(url.pathname);

  // Redirect logic
  if (user && isPublicPath) {
    // Logged in user trying to access public auth pages -> redirect to home
    return redirect("/");
  }

  if (!user && !isPublicPath) {
    // Not logged in user trying to access protected routes -> redirect to login
    return redirect("/login");
  }

  return next();
});

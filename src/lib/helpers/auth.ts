import type { AstroGlobal } from "astro";

/**
 * Ensures the user is authenticated by checking locals.user.
 * If not authenticated, redirects to the login page.
 * Returns the authenticated user object.
 *
 * @param Astro - The Astro global object
 * @returns The authenticated user object
 * @throws Redirects to /login if user is not authenticated
 *
 * @example
 * ```astro
 * ---
 * import { requireAuth } from "@/lib/helpers/auth";
 * const user = requireAuth(Astro);
 * ---
 * <h1>Welcome, {user.email}!</h1>
 * ```
 */
export function requireAuth(Astro: AstroGlobal) {
  const { user } = Astro.locals;

  if (!user) {
    return Astro.redirect("/login");
  }

  return user;
}

/**
 * Checks if a user is authenticated.
 * Returns true if user exists in locals, false otherwise.
 *
 * @param Astro - The Astro global object
 * @returns Boolean indicating authentication status
 *
 * @example
 * ```astro
 * ---
 * import { isAuthenticated } from "@/lib/helpers/auth";
 * const authenticated = isAuthenticated(Astro);
 * ---
 * {authenticated && <p>You are logged in</p>}
 * ```
 */
export function isAuthenticated(Astro: AstroGlobal): boolean {
  return Astro.locals.user !== null;
}

/**
 * Gets the current user from locals if authenticated.
 * Returns null if not authenticated.
 *
 * @param Astro - The Astro global object
 * @returns The user object or null
 *
 * @example
 * ```astro
 * ---
 * import { getCurrentUser } from "@/lib/helpers/auth";
 * const user = getCurrentUser(Astro);
 * ---
 * {user ? <p>Welcome, {user.email}!</p> : <p>Please log in</p>}
 * ```
 */
export function getCurrentUser(Astro: AstroGlobal) {
  return Astro.locals.user;
}

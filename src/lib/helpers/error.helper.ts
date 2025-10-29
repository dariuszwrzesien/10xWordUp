import { ZodError } from "zod";

/**
 * Standardowa struktura błędu API
 */
export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Tworzy standardową odpowiedź błędu
 */
export function createErrorResponse(status: number, error: string, message: string, details?: unknown): Response {
  const body: ApiError = {
    error,
    message,
    ...(details && { details }),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Tworzy odpowiedź dla błędu walidacji Zod
 */
export function createValidationErrorResponse(zodError: ZodError): Response {
  const errors = zodError.errors.map((err) => ({
    path: err.path.join("."),
    message: err.message,
  }));

  return createErrorResponse(400, "Validation Error", "Invalid request data", errors);
}

/**
 * Tworzy odpowiedź dla błędu 400 (Bad Request)
 */
export function badRequest(message: string, details?: unknown): Response {
  return createErrorResponse(400, "Bad Request", message, details);
}

/**
 * Tworzy odpowiedź dla błędu 401 (Unauthorized)
 */
export function unauthorized(message = "Unauthorized access"): Response {
  return createErrorResponse(401, "Unauthorized", message);
}

/**
 * Tworzy odpowiedź dla błędu 404 (Not Found)
 */
export function notFound(resource: string): Response {
  return createErrorResponse(404, "Not Found", `${resource} not found`);
}

/**
 * Tworzy odpowiedź dla błędu 500 (Internal Server Error)
 */
export function internalServerError(message = "Internal server error", error?: unknown): Response {
  // W środowisku produkcyjnym nie wysyłamy szczegółów błędu
  const isDev = import.meta.env.DEV;
  const details = isDev && error ? { error: String(error) } : undefined;

  console.error("Internal server error:", error);

  return createErrorResponse(500, "Internal Server Error", message, details);
}

/**
 * Tworzy odpowiedź sukcesu
 */
export function success<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Tworzy odpowiedź sukcesu dla utworzenia zasobu (201)
 */
export function created<T>(data: T): Response {
  return success(data, 201);
}

/**
 * Tworzy odpowiedź sukcesu dla usunięcia zasobu (204)
 */
export function noContent(): Response {
  return new Response(null, {
    status: 204,
  });
}

/**
 * Mapuje błędy Supabase Auth na polskie komunikaty
 * Zwraca generyczny komunikat dla bezpieczeństwa
 */
export function mapSupabaseAuthError(error: { message: string; status?: number }): string {
  // Generic error message for security - nie ujawniamy czy użytkownik istnieje
  const genericLoginError = "Nieprawidłowy e-mail lub hasło";

  // Mapowanie na podstawie komunikatu błędu Supabase
  if (error.message.includes("Invalid login credentials")) {
    return genericLoginError;
  }

  if (error.message.includes("Email not confirmed")) {
    return "Adres e-mail nie został potwierdzony";
  }

  if (error.message.includes("User already registered")) {
    return "Użytkownik o tym adresie e-mail już istnieje";
  }

  if (error.message.includes("Password should be at least")) {
    return "Hasło musi mieć minimum 8 znaków";
  }

  // Domyślny generyczny komunikat
  return genericLoginError;
}

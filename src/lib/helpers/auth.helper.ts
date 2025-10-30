/**
 * Interfejs dla uwierzytelnionego użytkownika
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Błąd uwierzytelnienia
 */
export class AuthenticationError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Wymaga uwierzytelnienia użytkownika
 * Rzuca AuthenticationError jeśli użytkownik nie jest zalogowany
 *
 * @param locals - Obiekt locals z Astro zawierający informacje o użytkowniku
 * @returns Dane uwierzytelnionego użytkownika
 * @throws AuthenticationError jeśli użytkownik nie jest zalogowany
 */
export function requireAuth(locals: App.Locals): AuthenticatedUser {
  // Sprawdź czy użytkownik jest zalogowany (ustawione przez middleware)
  if (!locals.user) {
    throw new AuthenticationError("Musisz być zalogowany aby wykonać tę akcję");
  }

  return {
    id: locals.user.id,
    email: locals.user.email,
  };
}

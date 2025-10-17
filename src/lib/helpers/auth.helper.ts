import { DEFAULT_USER_ID } from "../../db/supabase.client";

/**
 * Interfejs dla uwierzytelnionego użytkownika
 */
export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * TYMCZASOWE: Zwraca mockowanego użytkownika dla celów rozwoju
 * TODO: Zintegrować z prawdziwym Supabase Auth w przyszłości
 *
 * @returns Dane mockowanego użytkownika
 */
export async function authenticateUser(): Promise<AuthenticatedUser> {
  // Na razie ignorujemy token i zawsze zwracamy DEFAULT_USER_ID
  // W przyszłości tutaj będzie prawdziwa weryfikacja JWT przez Supabase Auth

  return {
    id: DEFAULT_USER_ID,
    email: "dev@10xwordup.com", // Mockowany email
  };
}

/**
 * TYMCZASOWE: Guard middleware - na razie zawsze zwraca mockowanego użytkownika
 * TODO: Dodać prawdziwą walidację tokenu w przyszłości
 *
 * @returns Zawsze mockowanego użytkownika (nigdy nie zwraca błędu 401)
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  return await authenticateUser();
}

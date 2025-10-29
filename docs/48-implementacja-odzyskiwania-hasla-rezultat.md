# Implementacja Mechanizmu Odzyskiwania Hasła

## Status: ✅ Ukończone

Pełny mechanizm odzyskiwania hasła został zaimplementowany zgodnie z wytycznymi Supabase Auth i utrzymuje spójność z istniejącą implementacją logowania.

## Zaimplementowane Komponenty

### 1. Backend API Endpoints

#### `/api/auth/forgot-password` (POST)

**Plik:** `src/pages/api/auth/forgot-password.ts`

**Funkcjonalność:**

- Przyjmuje adres e-mail użytkownika
- Waliduje dane wejściowe za pomocą Zod schema
- Wysyła link resetujący hasło za pomocą `supabase.auth.resetPasswordForEmail()`
- Zawsze zwraca sukces (security best practice - nie ujawnia czy e-mail istnieje)
- Obsługuje błędy z odpowiednimi komunikatami

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (zawsze 200):**

```json
{
  "message": "Jeśli konto istnieje, link został wysłany"
}
```

#### `/api/auth/reset-password` (POST)

**Plik:** `src/pages/api/auth/reset-password.ts`

**Funkcjonalność:**

- Sprawdza czy użytkownik ma aktywną sesję z tokenu resetującego
- Waliduje nowe hasło za pomocą Zod schema
- Aktualizuje hasło używając `supabase.auth.updateUser()`
- Automatycznie loguje użytkownika po pomyślnej zmianie hasła
- Obsługuje błędy (wygasły token, za słabe hasło, itp.)

**Request:**

```json
{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response (200):**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "message": "Hasło zostało zmienione pomyślnie"
}
```

**Error (401):**

```json
{
  "error": "Unauthorized",
  "message": "Link resetujący jest nieprawidłowy lub wygasł"
}
```

### 2. Frontend Components

#### `ForgotPasswordForm.tsx`

**Plik:** `src/components/auth/ForgotPasswordForm.tsx`

**Aktualizacje:**

- Zintegrowano z API endpoint `/api/auth/forgot-password`
- Dodano obsługę błędów z backendu
- Zachowano ten sam styl komunikatów co w LoginForm
- Po wysłaniu pokazuje ekran potwierdzający z możliwością ponownego wysłania

**Flow:**

1. Użytkownik wprowadza e-mail
2. Formularz wysyła request do API
3. Pokazuje ekran sukcesu (zawsze, dla bezpieczeństwa)
4. Użytkownik może ponownie wysłać lub wrócić do logowania

#### `ResetPasswordForm.tsx`

**Plik:** `src/components/auth/ResetPasswordForm.tsx`

**Aktualizacje:**

- Dodano sprawdzanie tokenu w URL przy załadowaniu komponentu
- Zintegrowano z API endpoint `/api/auth/reset-password`
- Dodano 3 stany:
  1. **Loading** - Sprawdzanie tokenu
  2. **Invalid Token** - Token wygasł/nieprawidłowy (możliwość wysłania nowego)
  3. **Success** - Hasło zmienione, automatyczne przekierowanie do aplikacji
- Po pomyślnej zmianie hasła przekierowuje do strony głównej (użytkownik jest zalogowany)

**Flow:**

1. Użytkownik klika link z e-maila (zawiera token w hash URL)
2. Komponent sprawdza czy token istnieje
3. Jeśli token nieprawidłowy → pokazuje błąd i link do nowego resetu
4. Jeśli token OK → pokazuje formularz nowego hasła
5. Po zmianie hasła → przekierowanie do aplikacji (użytkownik zalogowany)

### 3. Astro Pages

#### `forgot-password.astro`

**Plik:** `src/pages/forgot-password.astro`

Bez zmian - strona już była gotowa.

#### `reset-password.astro`

**Plik:** `src/pages/reset-password.astro`

**Aktualizacje:**

- Dodano `export const prerender = false` - wymagane dla SSR
- Dodano komentarze wyjaśniające obsługę tokenów po stronie klienta
- Token Supabase jest w hash URL (#access_token=...), dostępny tylko client-side

### 4. Middleware

#### `src/middleware/index.ts`

**Aktualizacje:**

- Przeniesiono `/reset-password` i `/api/auth/reset-password` do `UNRESTRICTED_PATHS`
- **Powód:** Supabase tworzy tymczasową sesję po kliknięciu w link resetujący, więc użytkownik jest technicznie "zalogowany" i musi dokończyć proces resetowania hasła
- Bez tej zmiany middleware przekierowywałby użytkownika ze strony reset-password

**Struktura ścieżek:**

```typescript
// PUBLIC_PATHS - Przekierowują zalogowanych użytkowników do home
const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/forgot-password",
];

// UNRESTRICTED_PATHS - Zawsze dostępne, bez przekierowań
const UNRESTRICTED_PATHS = [
  "/api/auth/logout",
  "/reset-password", // ← NOWE
  "/api/auth/reset-password", // ← NOWE
];
```

## Bezpieczeństwo

### 1. Email Enumeration Protection

- Endpoint `/api/auth/forgot-password` **zawsze** zwraca sukces
- Nie ujawnia czy e-mail istnieje w systemie
- Chroni przed atakami enumeracji użytkowników

### 2. Token Security

- Tokeny resetujące są ważne przez 1 godzinę (konfiguracja Supabase)
- Token jest w hash URL, nie w query params (bardziej bezpieczne)
- Backend weryfikuje sesję przed zmianą hasła

### 3. Password Validation

- Minimum 8 znaków (walidacja Zod + Supabase)
- Weryfikacja że hasła się zgadzają (confirmPassword)
- Sprawdzenie że nowe hasło różni się od starego (Supabase)

### 4. Error Handling

- Generyczne komunikaty błędów (bezpieczeństwo)
- Szczegółowe logi po stronie serwera (debugging)
- Walidacja po stronie klienta i serwera

## Flow Użytkownika

### Krok 1: Zapomniałem hasła

```
Strona logowania → "Nie pamiętasz hasła?" → /forgot-password
```

### Krok 2: Wysłanie linku

```
Wprowadzenie e-maila → Submit →
API call do /api/auth/forgot-password →
Supabase wysyła e-mail →
Ekran potwierdzenia
```

### Krok 3: E-mail

```
Użytkownik otrzymuje e-mail z linkiem:
https://yourdomain.com/reset-password#access_token=...&type=recovery
```

### Krok 4: Reset hasła

```
Kliknięcie linku → /reset-password →
Supabase tworzy sesję z tokenu →
Sprawdzenie tokenu (client-side) →
Formularz nowego hasła →
Submit → API call do /api/auth/reset-password →
Sukces → Przekierowanie do / (zalogowany)
```

## Testowanie

### ⚠️ WAŻNE: Testowanie Lokalne z Inbucket

**W wersji lokalnej e-maile NIE są wysyłane na prawdziwe adresy!**

Supabase Local używa **Inbucket** - lokalnego serwera testowego e-maili.

**Dostęp do Inbucket:** http://localhost:54324

**Szczegółowa instrukcja:** Zobacz `docs/49-testowanie-lokalne-email-inbucket.md`

### Test 1: Podstawowy Flow (Lokalnie)

1. Uruchom Supabase lokalnie: `supabase start`
2. Uruchom aplikację: `npm run dev`
3. Otwórz Inbucket w nowej zakładce: http://localhost:54324
4. Przejdź do aplikacji: http://localhost:4321/login (lub twój port)
5. Kliknij "Nie pamiętasz hasła?"
6. Wprowadź e-mail użytkownika (który istnieje w lokalnej bazie)
7. Kliknij "Wyślij link resetujący"
8. **Przełącz się na zakładkę z Inbucket** (http://localhost:54324)
9. Kliknij na adres e-mail na liście (np. test@example.com)
10. Zobaczysz e-mail z linkiem resetującym - kliknij go
11. Wprowadź nowe hasło (min. 8 znaków)
12. Zatwierdź - powinno przekierować do `/` jako zalogowany użytkownik

### Test 2: Nieistniejący E-mail

1. Wprowadź e-mail który nie istnieje
2. Powinien pokazać ten sam komunikat sukcesu (security)
3. E-mail nie powinien zostać wysłany

### Test 3: Wygasły Token

1. Użyj starego/nieprawidłowego linku resetującego
2. Powinien pokazać błąd "Link jest nieprawidłowy"
3. Opcja wysłania nowego linku

### Test 4: Za słabe hasło

1. Wprowadź hasło < 8 znaków
2. Walidacja formularza powinna zatrzymać submit
3. Komunikat "Hasło musi mieć minimum 8 znaków"

### Test 5: Niezgodne hasła

1. Wprowadź różne hasła w oba pola
2. Walidacja powinna pokazać błąd
3. Komunikat "Hasła nie są zgodne"

## Konfiguracja Supabase

### Email Templates

Upewnij się że w Supabase Dashboard są skonfigurowane szablony e-mail:

1. **Dashboard:** Authentication → Email Templates
2. **Reset Password Template:** Powinien zawierać link z `{{ .ConfirmationURL }}`
3. **Redirect URL:** Skonfiguruj w Authentication → URL Configuration

### Ustawienia (jeśli potrzebne)

- **Password requirements:** Authentication → Policies
- **Email rate limiting:** Authentication → Rate Limits
- **Token expiry:** Domyślnie 1 godzina

## Spójność z Istniejącym Kodem

### 1. Używane Helper Functions

- `createValidationErrorResponse()` - walidacja Zod
- `success()` - odpowiedzi sukcesu
- `unauthorized()` - błędy 401
- `badRequest()` - błędy 400
- `internalServerError()` - błędy 500

### 2. Walidacja Formularzy

- Zod schemas z `src/lib/schemas/auth.schema.ts`
- React Hook Form z zodResolver
- Spójne komunikaty błędów po polsku

### 3. Style i Komponenty

- Shadcn/ui components (Card, Button, Input, Form)
- Lucide icons
- Toast notifications (sonner)
- Spójna kolorystyka i layout

### 4. Struktura Kodu

- Backend: `/src/pages/api/auth/*.ts`
- Components: `/src/components/auth/*.tsx`
- Pages: `/src/pages/*.astro`
- Middleware: `/src/middleware/index.ts`

## Następne Kroki (Opcjonalne)

### 1. Email Customization

- Dostosuj szablony e-mail w Supabase Dashboard
- Dodaj logo aplikacji
- Personalizuj treść wiadomości

### 2. Rate Limiting

- Dodaj rate limiting dla endpointu forgot-password
- Zabezpieczenie przed spamem

### 3. Multi-factor Authentication (MFA)

- Rozważ dodanie 2FA dla dodatkowego bezpieczeństwa

### 4. Password Strength Indicator

- Dodaj wizualny wskaźnik siły hasła w formularzu
- Podpowiedzi dla użytkownika

### 5. Analytics

- Śledzenie użycia funkcji resetowania hasła
- Monitoring błędów i problemów

## Troubleshooting

### Problem: E-mail nie przychodzi (LOKALNIE - Najczęstszy!)

**Rozwiązanie:**

1. **SPRAWDŹ INBUCKET:** http://localhost:54324 ← E-maile są TAM!
2. Sprawdź czy Supabase jest uruchomiony: `supabase status`
3. Sprawdź console w przeglądarce - czy są błędy?
4. Sprawdź terminal Astro - czy endpoint zwrócił sukces?
5. Upewnij się że użytkownik istnieje w lokalnej bazie danych
6. Odśwież stronę Inbucket (F5)

### Problem: E-mail nie przychodzi (PRODUKCJA)

**Rozwiązanie:**

1. Sprawdź Supabase Dashboard → Authentication → Email Templates
2. Sprawdź czy projekt Supabase ma skonfigurowany SMTP (lub używa built-in)
3. Sprawdź folder SPAM
4. Sprawdź logs w Supabase Dashboard

### Problem: "Link jest nieprawidłowy"

**Rozwiązanie:**

1. Sprawdź czy link nie wygasł (1h limit)
2. Sprawdź czy URL jest poprawny (hash fragment musi być zachowany)
3. Sprawdź console przeglądarki (errors)

### Problem: Redirect po zmianie hasła nie działa

**Rozwiązanie:**

1. Sprawdź czy middleware jest poprawnie skonfigurowany
2. Sprawdź console - czy są błędy JavaScript
3. Sprawdź network tab - czy request do API sukces

### Problem: Walidacja hasła zawsze failuje

**Rozwiązanie:**

1. Sprawdź konfigurację password policy w Supabase
2. Sprawdź czy schema w `auth.schema.ts` jest zgodna z Supabase
3. Sprawdź console - szczegóły błędu walidacji

## Pliki Zmodyfikowane/Utworzone

### Nowe pliki:

- `src/pages/api/auth/forgot-password.ts`
- `src/pages/api/auth/reset-password.ts`

### Zmodyfikowane pliki:

- `src/components/auth/ForgotPasswordForm.tsx`
- `src/components/auth/ResetPasswordForm.tsx`
- `src/pages/reset-password.astro`
- `src/middleware/index.ts`

### Dokumentacja:

- `docs/48-implementacja-odzyskiwania-hasla-rezultat.md` (ten plik)
- `docs/49-testowanie-lokalne-email-inbucket.md` (instrukcja Inbucket)

## Podsumowanie

✅ Backend endpoints dla forgot/reset password  
✅ Frontend komponenty z pełną obsługą błędów  
✅ Integracja z Supabase Auth  
✅ Middleware configuration  
✅ Bezpieczeństwo (email enumeration protection)  
✅ Spójność z istniejącym kodem  
✅ Walidacja formularzy  
✅ Komunikaty po polsku  
✅ Automatyczne logowanie po resecie  
✅ Kompletny user flow

Wszystkie komponenty są gotowe do użycia i przetestowane pod kątem linterów. System jest bezpieczny, user-friendly i zgodny z best practices Supabase Auth.

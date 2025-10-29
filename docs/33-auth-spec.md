# Specyfikacja Architektury Modułu Autentykacji - 10xWordUp

## 1. Wprowadzenie

Niniejszy dokument opisuje architekturę techniczną modułu autentykacji dla aplikacji 10xWordUp. Specyfikacja bazuje na wymaganiach zdefiniowanych w PRD (US-001, US-002, US-003) oraz na istniejącym stosie technologicznym (Astro, React, Supabase). Celem jest zaprojektowanie bezpiecznego, spójnego i wydajnego systemu do zarządzania tożsamością użytkownika.

## 2. Architektura Interfejsu Użytkownika (Frontend)

Architektura frontendu opiera się na stronach generowanych przez Astro, które hostują interaktywne komponenty React do obsługi formularzy i logiki po stronie klienta.

### 2.1. Layouty

- **`src/layouts/Layout.astro` (Rozszerzenie)**
  - **Cel:** Główny layout aplikacji dla zalogowanych użytkowników.
  - **Zmiany:**
    - Dodanie logiki warunkowej sprawdzającej stan autentykacji użytkownika (na podstawie sesji odczytanej po stronie serwera).
    - Jeśli użytkownik jest zalogowany, w nagłówku wyświetlany będzie nowy komponent `UserMenu.tsx` z adresem e-mail użytkownika i przyciskiem "Wyloguj".
    - Jeśli użytkownik nie jest zalogowany, ten layout nie będzie używany (przekierowanie przez middleware).

- **`src/layouts/AuthLayout.astro` (Nowy)**
  - **Cel:** Layout dla publicznych stron, takich jak logowanie, rejestracja i resetowanie hasła.
  - **Struktura:** Minimalistyczny layout zawierający miejsce na formularz, bez nawigacji i dodatkowych elementów interfejsu dostępnych dla zalogowanych użytkowników.

### 2.2. Strony (Astro)

Wszystkie strony aplikacji (poza wymienionymi poniżej) stają się chronione i wymagają aktywnej sesji użytkownika.

- **`src/pages/login.astro` (Nowa)**
  - **Cel:** Strona logowania.
  - **Layout:** `AuthLayout.astro`.
  - **Komponent:** Osadza komponent `LoginForm.tsx`.
  - **Logika Server-Side:** Sprawdza, czy użytkownik nie jest już zalogowany. Jeśli tak, przekierowuje go na stronę główną (`/`).

- **`src/pages/register.astro` (Nowa)**
  - **Cel:** Strona rejestracji.
  - **Layout:** `AuthLayout.astro`.
  - **Komponent:** Osadza komponent `RegisterForm.tsx`.
  - **Logika Server-Side:** Analogicznie do strony logowania, przekierowuje zalogowanych użytkowników.

- **`src/pages/forgot-password.astro` (Nowa)**
  - **Cel:** Strona do inicjowania procesu resetowania hasła.
  - **Layout:** `AuthLayout.astro`.
  - **Komponent:** Osadza komponent `ForgotPasswordForm.tsx`.

- **`src/pages/reset-password.astro` (Nowa)**
  - **Cel:** Strona, na którą użytkownik jest przekierowywany z linku w e-mailu w celu ustawienia nowego hasła.
  - **Layout:** `AuthLayout.astro`.
  - **Komponent:** Osadza komponent `ResetPasswordForm.tsx`.

- **`src/pages/index.astro` (refaktoryzacja istniejącej strony głównej)**
  - **Cel:** Główna strona aplikacji po zalogowaniu (lista słówek).
  - **Layout:** `Layout.astro`.
  - **Logika Server-Side:** Strona renderowana tylko dla zalogowanych użytkowników. Dane użytkownika (np. ID) są pobierane z sesji i przekazywane do komponentów w celu pobrania spersonalizowanych danych.

### 2.3. Komponenty (React)

Komponenty formularzy będą odpowiedzialne za stan, walidację i komunikację z API. Zalecane jest użycie bibliotek `react-hook-form` do zarządzania formularzem i `zod` do walidacji schematów.

- **`src/components/auth/LoginForm.tsx` (Nowy)**
  - **Odpowiedzialność:** Zarządzanie stanem formularza logowania, walidacja po stronie klienta, obsługa zdarzenia `onSubmit`, wywołanie endpointu `POST /api/auth/login` i obsługa odpowiedzi (sukces/błąd).
  - **Walidacja:**
    - E-mail: poprawny format.
    - Hasło: pole wymagane.
  - **Komunikaty:** "Nieprawidłowy e-mail lub hasło.", "Wystąpił błąd logowania."

- **`src/components/auth/RegisterForm.tsx` (Nowy)**
  - **Odpowiedzialność:** Zarządzanie formularzem rejestracji, walidacja, wywołanie `POST /api/auth/register`.
  - **Walidacja:**
    - E-mail: poprawny format.
    - Hasło: minimum 8 znaków.
    - Potwierdzenie hasła: musi być identyczne z hasłem.
  - **Komunikaty:** "Użytkownik o tym adresie e-mail już istnieje.", "Hasła nie są zgodne."

- **`src/components/auth/ForgotPasswordForm.tsx` (Nowy)**
  - **Odpowiedzialność:** Formularz z jednym polem (e-mail), wywołanie `POST /api/auth/forgot-password`.
  - **Komunikaty:** "Jeśli konto istnieje, link do resetowania hasła został wysłany." (ze względów bezpieczeństwa, nie informujemy, czy e-mail istnieje w bazie).

- **`src/components/auth/ResetPasswordForm.tsx` (Nowy)**
  - **Odpowiedzialność:** Formularz z polem na nowe hasło i jego potwierdzenie, wywołanie `POST /api/auth/reset-password`.
  - **Walidacja:** Hasło (min. 8 znaków) i potwierdzenie muszą być zgodne.

- **`src/components/layout/UserMenu.tsx` (Nowy)**
  - **Odpowiedzialność:** Wyświetlanie informacji o zalogowanym użytkowniku i przycisk wylogowania, który wywołuje `POST /api/auth/logout`.

### 2.4. Scenariusze Użytkownika

- **Logowanie:** Użytkownik wypełnia formularz -> `LoginForm` wysyła dane do `/api/auth/login` -> API komunikuje się z Supabase -> Supabase ustawia ciasteczka sesji -> API zwraca sukces -> Strona (`login.astro`) odświeża się lub przekierowuje na `/`.
- **Ochrona stron:** Użytkownik próbuje wejść na `/` bez sesji -> Middleware Astro przechwytuje żądanie -> Przekierowuje na `/login`.
- **Wylogowanie:** Użytkownik klika "Wyloguj" -> `UserMenu` wysyła żądanie do `/api/auth/logout` -> API niszczy sesję w Supabase -> Strona przekierowuje na `/login`.

## 3. Logika Backendowa

Logika backendowa zostanie zrealizowana przy użyciu Astro API Routes oraz Middleware, co jest idealnym rozwiązaniem przy SSR.

### 3.1. Middleware

- **`src/middleware/index.ts` (Nowy lub rozszerzenie)**
  - **Cel:** Centralny punkt do ochrony tras (route protection).
  - **Logika:**
    1. Middleware jest uruchamiane dla każdego żądania serwerowego.
    2. Tworzy serwerowy klient Supabase przy użyciu ciasteczek z żądania.
    3. Pobiera aktualną sesję użytkownika (`supabase.auth.getSession()`).
    4. Definiuje listy chronionych (`/`, `/quiz`, itp.) i publicznych (`/login`, `/register`, `/api/auth/*`) ścieżek.
    5. **Reguły przekierowań:**
       - Jeśli użytkownik **nie ma sesji** i próbuje uzyskać dostęp do **chronionej** ścieżki, jest przekierowywany na `/login`.
       - Jeśli użytkownik **ma sesję** i próbuje uzyskać dostęp do **publicznej** ścieżki (np. `/login`), jest przekierowywany na `/`.
    6. Przechowuje sesję i klienta Supabase w `Astro.locals`, aby były dostępne wewnątrz stron `.astro` i endpointów API.

### 3.2. API Endpoints (Astro API Routes)

Endpointy te będą działać jako warstwa pośrednicząca (BFF) między frontendem a Supabase Auth.

- **`POST /api/auth/login`**
  - **Model Danych (Request):** `{ email: string, password: string }`
  - **Logika:**
    1. Pobiera klienta Supabase z `Astro.locals`.
    2. Waliduje dane wejściowe.
    3. Wywołuje `supabase.auth.signInWithPassword()`.
    4. W przypadku błędu (np. nieprawidłowe dane) zwraca status 401.
    5. W przypadku sukcesu zwraca status 200. Supabase automatycznie zarządza ustawieniem ciasteczek sesji w odpowiedzi.

- **`POST /api/auth/register`**
  - **Model Danych (Request):** `{ email: string, password: string }`
  - **Logika:**
    1. Wywołuje `supabase.auth.signUp()`. Aby być zgodnym z PRD (błyskawiczne zalogowanie po rejestracji), funkcja ta powinna tworzyć sesję użytkownika natychmiastowo. Wymaga to wyłączenia opcji potwierdzenia e-mail w ustawieniach Supabase.
    2. W przypadku błędu (np. użytkownik już istnieje) zwraca status 409.
    3. W przypadku sukcesu, Supabase automatycznie zarządza ustawieniem ciasteczek sesji, a API zwraca status 201.

- **`POST /api/auth/logout`**
  - **Logika:**
    1. Wywołuje `supabase.auth.signOut()`.
    2. Zwraca status 200.

- **`POST /api/auth/forgot-password`**
  - **Model Danych (Request):** `{ email: string }`
  - **Logika:**
    1. Wywołuje `supabase.auth.resetPasswordForEmail()`, podając URL do strony resetowania hasła.
    2. Zawsze zwraca status 200, aby uniemożliwić weryfikację istnienia konta.

- **`POST /api/auth/reset-password`**
  - **Logika:**
    1. Ten endpoint jest wywoływany przez frontend po tym, jak użytkownik trafi na stronę z linku resetującego.
    2. Sesja jest automatycznie odświeżana przez Supabase na podstawie tokenu z URL.
    3. Endpoint wywołuje `supabase.auth.updateUser()` z nowym hasłem.
    4. Zwraca 200 w przypadku sukcesu, 401 jeśli sesja wygasła, 400 jeśli hasło jest nieprawidłowe.

### 3.3. Renderowanie Server-Side

Dzięki `output: "server"` w `astro.config.mjs`, cała logika w middleware i po stronie serwera w plikach `.astro` jest wykonywana na serwerze przed wysłaniem odpowiedzi do klienta. Pozwala to na bezpieczne zarządzanie sesją i ochronę stron bez ryzyka "mignięcia" chronionej treści u niezalogowanego użytkownika.

## 4. System Autentykacji (Integracja z Supabase)

### 4.1. Konfiguracja Supabase

- **Biblioteka:** Wykorzystana zostanie biblioteka `@supabase/ssr`, która jest przeznaczona do integracji Supabase Auth z frameworkami renderującymi po stronie serwera, takimi jak Astro.
- **Zmienne Środowiskowe:** Klucze Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) muszą być bezpiecznie przechowywane jako zmienne środowiskowe i dostępne dla aplikacji Astro.

### 4.2. Zarządzanie Sesją

- **Server-Side:** Głównym mechanizmem zarządzania sesją będą ciasteczka (`httpOnly`, `secure`). Biblioteka `@supabase/ssr` ułatwia tworzenie serwerowego klienta Supabase, który potrafi odczytywać i zapisywać sesje na podstawie ciasteczek przekazanych w żądaniu (`Request`).
- **Client-Side:** Po stronie klienta (w komponentach React) również zostanie utworzony klient Supabase, który automatycznie synchronizuje swój stan z ciasteczkami w przeglądarce. Pozwoli to na odczytanie stanu zalogowania, jeśli będzie to potrzebne w logice komponentu.

### 4.3. Proces Odzyskiwania Konta

1.  Użytkownik na stronie `/forgot-password` podaje swój e-mail.
2.  Frontend wysyła żądanie do `POST /api/auth/forgot-password`.
3.  Backend wywołuje funkcję Supabase, która generuje unikalny token i wysyła e-mail z linkiem do użytkownika. Link ten kieruje na stronę `/reset-password`.
4.  Gdy użytkownik otworzy link, Supabase SSR po stronie serwera zweryfikuje token i utworzy tymczasową sesję autoryzującą do zmiany hasła.
5.  Użytkownik w komponencie `ResetPasswordForm.tsx` wprowadza nowe hasło.
6.  Frontend wysyła żądanie do `POST /api/auth/reset-password`.
7.  Backend, korzystając z aktywnej sesji, wywołuje funkcję `updateUser`, aby finalnie zmienić hasło w Supabase.
8.  Użytkownik jest informowany o sukcesie i przekierowywany na stronę logowania, gdzie może zalogować się nowym hasłem.

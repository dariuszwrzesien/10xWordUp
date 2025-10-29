# Instrukcja Testowania Logowania - 10xWordUp

## Przed testowaniem

### 1. Wyłącz Email Confirmation w Supabase

**KRYTYCZNE!** Bez tego logowanie nie będzie działać poprawnie.

1. Zaloguj się do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz projekt **10xWordUp**
3. Przejdź do: **Authentication** → **Providers** → **Email**
4. Znajdź sekcję **"Confirm email"**
5. **Wyłącz** toggle "Confirm email" (OFF)
6. Kliknij **Save**

### 2. Utwórz użytkownika testowego

Jeśli nie masz użytkownika w systemie:

**Opcja A: Przez Supabase Dashboard**

1. Przejdź do: **Authentication** → **Users**
2. Kliknij **"Add user"** → **"Create new user"**
3. Wypełnij:
   - Email: `test@example.com`
   - Password: `testpassword123`
   - Auto Confirm User: **YES** (zaznacz)
4. Kliknij **Create user**

**Opcja B: Przez SQL**

```sql
-- W Supabase Dashboard → SQL Editor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  raw_app_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  'test@example.com',
  crypt('testpassword123', gen_salt('bf')),
  NOW(),
  '{}',
  '{}',
  NOW(),
  NOW(),
  '',
  ''
);
```

### 3. Sprawdź zmienne środowiskowe

Upewnij się, że `.env` zawiera poprawne klucze:

```bash
cat .env
```

Powinno wyświetlić:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## Testowanie Logowania

### 1. Uruchom serwer deweloperski

```bash
npm run dev
```

Aplikacja powinna wystartować na: `http://localhost:3000`

### 2. Test 1: Przekierowanie z chronionej strony

**Oczekiwany rezultat**: Automatyczne przekierowanie na `/login`

1. Otwórz przeglądarkę w trybie incognito
2. Wejdź na: `http://localhost:3000/`
3. ✅ **Powinno przekierować Cię na** `http://localhost:3000/login`

**Jeśli nie działa**:

- Sprawdź konsole przeglądarki (F12)
- Sprawdź logi serwera w terminalu
- Upewnij się, że middleware jest aktywny

### 3. Test 2: Wyświetlenie formularza logowania

**Oczekiwany rezultat**: Formularz logowania jest widoczny

1. Na stronie `/login` powinieneś zobaczyć:
   - Logo/ikonę LogIn
   - Tytuł "Witaj ponownie!"
   - Pole "Adres e-mail"
   - Pole "Hasło"
   - Link "Nie pamiętasz hasła?"
   - Przycisk "Zaloguj się"
   - Link "Zarejestruj się"

### 4. Test 3: Walidacja formularza (puste pola)

1. Pozostaw pola puste
2. Kliknij "Zaloguj się"
3. ✅ **Powinien pojawić się toast**: "Wszystkie pola są wymagane"

### 5. Test 4: Walidacja formularza (nieprawidłowy email)

1. Wpisz w pole email: `nieprawidlowy-email`
2. Wpisz hasło: `cokolwiek123`
3. Kliknij "Zaloguj się"
4. ✅ **Powinien pojawić się toast**: "Nieprawidłowy format adresu e-mail"

### 6. Test 5: Nieprawidłowe dane logowania

1. Wpisz email: `test@example.com`
2. Wpisz hasło: `zle-haslo`
3. Kliknij "Zaloguj się"
4. ✅ **Powinien pojawić się toast**: "Nieprawidłowy e-mail lub hasło"

**Uwaga**: Komunikat jest generyczny dla bezpieczeństwa (nie ujawniamy czy użytkownik istnieje)

### 7. Test 6: Poprawne logowanie

1. Wpisz email: `test@example.com`
2. Wpisz hasło: `testpassword123` (lub hasło Twojego użytkownika testowego)
3. Kliknij "Zaloguj się"
4. ✅ **Powinno się zdarzyć**:
   - Przycisk pokazuje spinner i tekst "Logowanie..."
   - Po chwili pojawia się toast: "Logowanie pomyślne! Przekierowywanie..."
   - Po 500ms następuje przekierowanie na `/`

### 8. Test 7: Dostęp do chronionej strony po zalogowaniu

**Oczekiwany rezultat**: Strona główna jest dostępna

1. Po zalogowaniu powinieneś zobaczyć stronę główną
2. URL powinien być: `http://localhost:3000/`
3. ✅ **Strona powinna się załadować** (lista słówek lub ekran powitalny)

### 9. Test 8: Ponowna próba wejścia na /login

**Oczekiwany rezultat**: Przekierowanie na stronę główną

1. Będąc zalogowanym, wpisz w przeglądarce: `http://localhost:3000/login`
2. ✅ **Powinno przekierować Cię z powrotem na** `http://localhost:3000/`

### 10. Test 9: Sprawdzenie ciasteczek sesji

1. Otwórz DevTools (F12)
2. Przejdź do zakładki **Application** (Chrome) lub **Storage** (Firefox)
3. W lewym menu wybierz **Cookies** → `http://localhost:3000`
4. ✅ **Powinny być widoczne ciasteczka** zaczynające się od `sb-` (np. `sb-localhost-auth-token`)
   - `HttpOnly`: true
   - `Secure`: false (w dev), true (w production)
   - `SameSite`: Lax

### 11. Test 10: Wylogowanie (ręczne usunięcie ciasteczek)

**Tymczasowo (endpoint /logout jeszcze nie istnieje)**

1. W DevTools → Cookies, usuń wszystkie ciasteczka `sb-*`
2. Odśwież stronę (F5)
3. ✅ **Powinno przekierować Cię na** `/login`

## Sprawdzenie Logów Backendu

### Terminal - Logi serwera deweloperskiego

Podczas logowania powinieneś zobaczyć w terminalu:

```
21:30:45 [middleware] Creating Supabase instance
21:30:45 [middleware] Checking user session
21:30:45 [middleware] User logged in: test@example.com
```

(lub podobne logi w zależności od konfiguracji)

### Supabase Dashboard - Logi autentykacji

1. Przejdź do: **Logs** → **Auth Logs**
2. Powinieneś zobaczyć wpisy typu:
   - `user_signedin` - pomyślne logowanie
   - `login_failed` - nieudane próby logowania

## Problemy i Rozwiązania

### Problem: "Invalid login credentials" mimo poprawnych danych

**Rozwiązanie**:

1. Sprawdź czy użytkownik ma `email_confirmed_at` ustawione (nie null)
2. W Supabase Dashboard → Authentication → Users
3. Jeśli jest null, kliknij na użytkownika → **Confirm email**

### Problem: Przekierowanie nie działa

**Rozwiązanie**:

1. Sprawdź konsolę przeglądarki - mogą być błędy JavaScript
2. Sprawdź czy `setTimeout` w `LoginForm.tsx` jest wykonywany
3. Sprawdź czy middleware jest poprawnie skonfigurowany w `astro.config.mjs`

### Problem: Middleware nie wykrywa sesji

**Rozwiązanie**:

1. Sprawdź czy ciasteczka są ustawiane (DevTools → Cookies)
2. Sprawdź czy `createSupabaseServerInstance` jest wywoływany w middleware
3. Sprawdź logi w terminalu

### Problem: Strona główna nadal przekierowuje na /login po zalogowaniu

**Rozwiązanie**:

1. Wyczyść cache przeglądarki
2. Wyloguj się i zaloguj ponownie
3. Sprawdź czy middleware poprawnie ustawia `locals.user`

## Podsumowanie Testów

Zaznacz wykonane testy:

- [ ] Test 1: Przekierowanie z chronionej strony
- [ ] Test 2: Wyświetlenie formularza
- [ ] Test 3: Walidacja (puste pola)
- [ ] Test 4: Walidacja (nieprawidłowy email)
- [ ] Test 5: Nieprawidłowe dane logowania
- [ ] Test 6: Poprawne logowanie
- [ ] Test 7: Dostęp do chronionej strony
- [ ] Test 8: Blokada dostępu do /login po zalogowaniu
- [ ] Test 9: Sprawdzenie ciasteczek
- [ ] Test 10: Wylogowanie (ręczne)

## Następne kroki po udanych testach

Po pomyślnym przetestowaniu logowania, możesz przejść do implementacji:

1. **Endpoint `/api/auth/logout`** (US-003)
2. **Komponent `UserMenu.tsx`** z przyciskiem wylogowania
3. **Endpoint `/api/auth/register`** (US-001)
4. **Endpoint `/api/auth/forgot-password`** i `/api/auth/reset-password`\*\*

---

**Data utworzenia**: 29 października 2025  
**Status**: Gotowy do testów  
**Autor**: AI Assistant

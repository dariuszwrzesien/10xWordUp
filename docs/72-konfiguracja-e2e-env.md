# Konfiguracja Zmiennych Środowiskowych dla Testów E2E

## Cel
Dokument opisuje jak skonfigurować zmienne środowiskowe potrzebne do uruchomienia testów E2E.

## Wymagania

### 1. Utwórz użytkownika testowego

Zanim uruchomisz testy E2E, musisz mieć użytkownika w bazie danych Supabase.

**Opcja A: Przez interfejs aplikacji**
1. Uruchom aplikację lokalnie: `npm run dev`
2. Przejdź do `/register`
3. Zarejestruj nowego użytkownika (np. `test.user@10xwordup.com`)
4. Zanotuj email i hasło

**Opcja B: Przez Supabase Dashboard**
1. Przejdź do Supabase Dashboard → Authentication → Users
2. Kliknij "Add user"
3. Wprowadź email i hasło
4. Zapisz UUID użytkownika

### 2. Utwórz plik `.env.test`

W głównym katalogu projektu utwórz plik `.env.test`:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_ACCESS_TOKEN=your-access-token

# E2E Test User Credentials
E2E_USERNAME=test.user@10xwordup.com
E2E_PASSWORD=YourSecurePassword123!
E2E_USERNAME_ID=123e4567-e89b-12d3-a456-426614174000
```

### 3. Zmienne Środowiskowe

| Zmienna | Wymagana | Opis |
|---------|----------|------|
| `E2E_USERNAME` | ✅ Tak | Email użytkownika testowego (musi istnieć w bazie) |
| `E2E_PASSWORD` | ✅ Tak | Hasło użytkownika testowego |
| `E2E_USERNAME_ID` | ⚪ Nie | UUID użytkownika testowego (opcjonalne) |
| `SUPABASE_URL` | ✅ Tak | URL projektu Supabase |
| `SUPABASE_KEY` | ✅ Tak | Klucz anon Supabase |
| `SUPABASE_ACCESS_TOKEN` | ✅ Tak | Token dostępu Supabase |

## Jak Znaleźć Dane

### UUID Użytkownika (E2E_USERNAME_ID)

**Opcja 1: Przez Supabase Dashboard**
1. Supabase Dashboard → Authentication → Users
2. Znajdź swojego użytkownika testowego
3. Kolumna "ID" zawiera UUID

**Opcja 2: Przez SQL Editor**
```sql
SELECT id, email 
FROM auth.users 
WHERE email = 'test.user@10xwordup.com';
```

**Opcja 3: Pomijanie UUID**
UUID jest opcjonalne. Jeśli nie potrzebujesz go w testach, możesz pominąć `E2E_USERNAME_ID`.

### Dane Supabase

1. Przejdź do Supabase Dashboard
2. Settings → API
3. Skopiuj:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`
   - **service_role key** → `SUPABASE_ACCESS_TOKEN` (używaj ostrożnie!)

## Przykładowa Konfiguracja

### `.env.test` - Development/Local

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

E2E_USERNAME=test@example.com
E2E_PASSWORD=testpassword123
E2E_USERNAME_ID=550e8400-e29b-41d4-a716-446655440000
```

### `.env.test` - Production/Staging

```bash
SUPABASE_URL=https://xxxyyyzzzz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

E2E_USERNAME=e2e.tester@10xwordup.com
E2E_PASSWORD=E2eSecurePass123!
E2E_USERNAME_ID=742e1234-a89b-12d3-b456-556677889900
```

## Weryfikacja Konfiguracji

### Test 1: Sprawdź połączenie z Supabase

```bash
# Uruchom prosty test logowania
npx playwright test e2e/auth/login-pom.spec.ts --grep "TC-AUTH-005"
```

Jeśli test przejdzie, konfiguracja jest poprawna! ✅

### Test 2: Sprawdź zmienne środowiskowe

Dodaj tymczasowy test:

```typescript
import { test } from '@playwright/test';

test('Check env vars', async () => {
  console.log('E2E_USERNAME:', process.env.E2E_USERNAME);
  console.log('E2E_PASSWORD:', process.env.E2E_PASSWORD ? '✅ Set' : '❌ Not set');
  console.log('E2E_USERNAME_ID:', process.env.E2E_USERNAME_ID || 'Not set (optional)');
});
```

```bash
npx playwright test check-env.spec.ts
```

## Bezpieczeństwo

### ⚠️ WAŻNE

1. **NIE COMMITUJ** pliku `.env.test` do repozytorium
2. Dodaj `.env.test` do `.gitignore`:
   ```
   .env.test
   ```
3. Używaj różnych haseł dla środowisk dev/staging/production
4. Regularnie rotuj hasła użytkowników testowych
5. Ograniczaj uprawnienia użytkowników testowych (tylko to, co potrzebne)

### W CI/CD

Ustaw zmienne środowiskowe w ustawieniach CI/CD:

**GitHub Actions:**
```yaml
env:
  E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
  E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
  E2E_USERNAME_ID: ${{ secrets.E2E_USERNAME_ID }}
```

**GitLab CI:**
```yaml
variables:
  E2E_USERNAME: $E2E_USERNAME
  E2E_PASSWORD: $E2E_PASSWORD
  E2E_USERNAME_ID: $E2E_USERNAME_ID
```

## Rozwiązywanie Problemów

### Problem: "E2E_USERNAME and E2E_PASSWORD must be set"

**Rozwiązanie:**
1. Upewnij się, że plik `.env.test` istnieje w głównym katalogu
2. Sprawdź, czy zmienne są ustawione: `cat .env.test`
3. Zrestartuj serwer testowy

### Problem: "Invalid credentials" lub test nie może się zalogować

**Rozwiązanie:**
1. Zweryfikuj, że użytkownik istnieje w bazie danych
2. Sprawdź, czy email i hasło są poprawne
3. Zaloguj się ręcznie przez aplikację z tymi samymi danymi
4. Sprawdź, czy użytkownik nie jest zablokowany w Supabase

### Problem: Testy timeout lub nie znajdują elementów

**Rozwiązanie:**
1. Uruchom testy w trybie debug: `npx playwright test --debug`
2. Sprawdź, czy serwer działa: `npm run dev:e2e`
3. Upewnij się, że port 3000 nie jest zajęty

## Dokumentacja Powiązana

- [Testy E2E - README](/e2e/README.md)
- [Page Object Model](/e2e/pages/README.md)
- [Migracja do zmiennych środowiskowych](/docs/71-migracja-zmiennych-srodowiskowych-e2e.md)
- [Scenariusze testowe E2E](/docs/64-scenariusze-testowania-e2e.md)

## Szybki Start

```bash
# 1. Skopiuj przykładowy plik
cp .env.example .env.test

# 2. Edytuj i wprowadź swoje dane
nano .env.test

# 3. Uruchom serwer testowy
npm run dev:e2e

# 4. W nowym terminalu uruchom testy
npm run test:e2e
```

---

**Ostatnia aktualizacja:** 2025-11-02


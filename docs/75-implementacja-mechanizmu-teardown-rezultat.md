# Implementacja mechanizmu teardown dla testów E2E

## Przegląd

Zaimplementowano mechanizm automatycznego czyszczenia bazy danych Supabase po zakończeniu wszystkich testów E2E. Mechanizm wykorzystuje funkcję `globalTeardown` w Playwright, która uruchamia się raz po wykonaniu wszystkich testów.

## Pliki zmodyfikowane i utworzone

### 1. `e2e/global-teardown.ts` (NOWY)

Główny plik implementujący logikę czyszczenia bazy danych.

**Funkcjonalność:**

- Łączy się z bazą danych Supabase używając zmiennych środowiskowych z `.env.test`
- Usuwa dane testowe z tabel w odpowiedniej kolejności (uwzględniając foreign key constraints):
  1. `word_tags` - tabela pośrednia (najpierw ze względu na klucze obce)
  2. `words` - słówka użytkownika testowego
  3. `tags` - tagi użytkownika testowego

**Kluczowe cechy:**

- ✅ Bezpieczne usuwanie - tylko dane użytkownika testowego (na podstawie `E2E_USERNAME_ID`)
- ✅ Walidacja zmiennych środowiskowych z informatywnymi komunikatami błędów
- ✅ Szczegółowe logowanie operacji czyszczenia
- ✅ Obsługa błędów bez przerywania procesu testowania
- ✅ Wykorzystuje typy TypeScript z `database.types.ts`

**Zmienne środowiskowe wymagane:**

```bash
SUPABASE_URL=           # URL instancji Supabase
SUPABASE_KEY=           # Klucz API Supabase (anon key lub service role key)
E2E_USERNAME_ID=        # UUID użytkownika testowego
```

### 2. `playwright.config.ts` (ZMODYFIKOWANY)

Zaktualizowano konfigurację Playwright o:

**Dodane:**

```typescript
// Ścieżka do pliku globalTeardown
globalTeardown: path.resolve(process.cwd(), "./e2e/global-teardown.ts"),

// Zmienne środowiskowe dla Supabase
env: {
  // ... istniejące zmienne
  SUPABASE_URL: process.env.SUPABASE_URL || "",
  SUPABASE_KEY: process.env.SUPABASE_KEY || "",
}
```

## Jak to działa?

### Sekwencja wykonania

1. **Przed testami:** Playwright ładuje konfigurację z `playwright.config.ts`
2. **Podczas testów:** Testy wykonują się normalnie, dodając dane do bazy
3. **Po wszystkich testach:** Playwright automatycznie uruchamia `global-teardown.ts`
4. **Czyszczenie:**
   - Pobiera wszystkie słówka użytkownika testowego
   - Usuwa powiązania z tabeli `word_tags`
   - Usuwa słówka z tabeli `words`
   - Usuwa tagi z tabeli `tags`
5. **Logowanie:** Wyświetla szczegółowe informacje o procesie czyszczenia

### Przykładowy output z konsoli

```
🧹 Starting database cleanup...
✅ Deleted word_tags entries for 15 words
✅ Deleted 15 words
✅ Deleted 5 tags
✨ Database cleanup completed successfully!
```

## Konfiguracja środowiska testowego

### Plik `.env.test`

Upewnij się, że plik `.env.test` zawiera wszystkie wymagane zmienne:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-or-service-key
SUPABASE_ACCESS_TOKEN=your-access-token

# Test User Credentials
E2E_USERNAME_ID=uuid-of-test-user
E2E_USERNAME=test@example.com
E2E_PASSWORD=test-password
```

### Ważne uwagi

1. **E2E_USERNAME_ID jest krytyczny** - bez niego czyszczenie nie będzie wykonane (zabezpieczenie przed przypadkowym usunięciem produkcyjnych danych)

2. **SUPABASE_KEY** - może być:
   - `anon key` - jeśli RLS policies pozwalają na usuwanie własnych danych
   - `service role key` - jeśli potrzebujesz pełnych uprawnień (zalecane dla testów)

3. **Bezpieczeństwo** - plik `.env.test` powinien być w `.gitignore` i nigdy nie commitowany

## Uruchamianie testów z teardown

### Standardowe uruchomienie testów

```bash
npm run test:e2e
```

Teardown wykona się automatycznie po zakończeniu wszystkich testów.

### Tryb debugowania

```bash
npm run test:e2e:debug
```

Teardown wykona się również w trybie debugowania.

### Uruchomienie z UI

```bash
npm run test:e2e:ui
```

Teardown wykona się po zamknięciu UI Playwright.

## Rozwiązywanie problemów

### Problem: "Missing required environment variables"

**Przyczyna:** Brak zmiennych `SUPABASE_URL` lub `SUPABASE_KEY` w `.env.test`

**Rozwiązanie:** Upewnij się, że plik `.env.test` istnieje i zawiera poprawne wartości

### Problem: "E2E_USERNAME_ID not set. Database cleanup will be skipped."

**Przyczyna:** Brak zmiennej `E2E_USERNAME_ID` w `.env.test`

**Rozwiązanie:** Dodaj UUID użytkownika testowego do `.env.test`

### Problem: "Error deleting words/tags/word_tags"

**Przyczyna:** Niewystarczające uprawnienia lub problemy z RLS policies

**Rozwiązanie:**

- Użyj `service role key` zamiast `anon key`
- Sprawdź czy RLS policies pozwalają na usuwanie danych
- Sprawdź czy użytkownik testowy ma odpowiednie uprawnienia

### Problem: Dane nie są usuwane

**Przyczyna:** Niepoprawne `E2E_USERNAME_ID` lub problemy z połączeniem do bazy

**Rozwiązanie:**

- Zweryfikuj czy `E2E_USERNAME_ID` odpowiada rzeczywistemu użytkownikowi w bazie
- Sprawdź połączenie do Supabase (URL i klucz)
- Przejrzyj logi z konsoli podczas wykonywania teardown

## Testowanie mechanizmu teardown

### Ręczne testowanie

1. Uruchom testy E2E:

```bash
npm run test:e2e
```

2. Sprawdź logi w konsoli - powinny pojawić się komunikaty o czyszczeniu bazy

3. Zweryfikuj w Supabase Dashboard czy dane zostały usunięte:
   - Otwórz Table Editor w Supabase
   - Sprawdź tabele `words`, `tags`, `word_tags`
   - Potwierdź że dane użytkownika testowego zostały usunięte

### Weryfikacja w kodzie testu

Możesz dodać test weryfikacyjny po teardown (jeśli jest potrzebny):

```typescript
// e2e/verify-cleanup.spec.ts
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

test.describe("Verify database cleanup", () => {
  test("should have no test data after teardown", async () => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

    const testUserId = process.env.E2E_USERNAME_ID;

    const { data: words } = await supabase.from("words").select("*").eq("user_id", testUserId);

    expect(words).toHaveLength(0);
  });
});
```

## Integracja z CI/CD

Mechanizm teardown działa automatycznie w środowisku CI/CD. Upewnij się, że:

1. Zmienne środowiskowe są ustawione w konfiguracji CI/CD (GitHub Actions, GitLab CI, itp.)
2. Używasz dedykowanej instancji Supabase dla testów (nie produkcyjnej!)
3. `service role key` jest przechowywany jako secret w CI/CD

### Przykład dla GitHub Actions

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        env:
          SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
          E2E_USERNAME: ${{ secrets.TEST_USERNAME }}
          E2E_PASSWORD: ${{ secrets.TEST_PASSWORD }}
          E2E_USERNAME_ID: ${{ secrets.TEST_USER_ID }}
        run: npm run test:e2e
```

## Przyszłe ulepszenia

Potencjalne rozszerzenia mechanizmu teardown:

1. **Selektywne czyszczenie** - opcja czyszczenia tylko konkretnych tabel
2. **Backup przed czyszczeniem** - opcjonalny backup danych przed usunięciem
3. **Czyszczenie po każdym teście** - fixture dla izolacji między testami
4. **Statystyki czyszczenia** - raport z liczby usuniętych rekordów
5. **Rollback na błąd** - przywracanie danych jeśli testy się nie powiodły

## Podsumowanie

Mechanizm teardown zapewnia:

- ✅ Automatyczne czyszczenie bazy po testach E2E
- ✅ Bezpieczne usuwanie tylko danych testowych
- ✅ Szczegółowe logowanie operacji
- ✅ Obsługę błędów bez przerywania testów
- ✅ Łatwą konfigurację przez zmienne środowiskowe
- ✅ Gotowość do integracji z CI/CD

Implementacja jest zgodna z najlepszymi praktykami Playwright i zapewnia czystość środowiska testowego po każdym uruchomieniu testów.

np

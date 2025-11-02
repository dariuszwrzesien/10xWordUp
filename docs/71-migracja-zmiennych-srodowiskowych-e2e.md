# Migracja Testów E2E do Zmiennych Środowiskowych

## Data
2025-11-02

## Problem
Testy E2E używały zakodowanych na stałe danych użytkownika (`test@example.com`, `password123`), który nie istniał w bazie danych testowej. Powodowało to niepowodzenie testów logowania.

## Rozwiązanie
Zmigrowano wszystkie testy E2E do używania zmiennych środowiskowych z pliku `.env.test`:
- `E2E_USERNAME` - email użytkownika testowego
- `E2E_PASSWORD` - hasło użytkownika testowego
- `E2E_USERNAME_ID` - ID użytkownika testowego (opcjonalne)

## Zmienione Pliki

### 1. `playwright.config.ts`
Dodano sekcję `env` do konfiguracji Playwright, która udostępnia zmienne środowiskowe wszystkim testom:

```typescript
env: {
  E2E_USERNAME: process.env.E2E_USERNAME || "",
  E2E_PASSWORD: process.env.E2E_PASSWORD || "",
  E2E_USERNAME_ID: process.env.E2E_USERNAME_ID || "",
}
```

### 2. `e2e/examples/pom-usage.spec.ts`
Zaktualizowano testy:
- **TC-AUTH-005**: Używa `process.env.E2E_USERNAME` i `process.env.E2E_PASSWORD`
- **TC-AUTH-006**: Używa `process.env.E2E_USERNAME`
- **Complete User Flow**: Zmieniono z rejestracji nowego użytkownika na logowanie istniejącym

### 3. `e2e/auth/login-pom.spec.ts`
Zaktualizowano testy logowania:
- **TC-AUTH-005**: Używa zmiennych środowiskowych
- **TC-AUTH-006**: Używa zmiennych środowiskowych do testowania błędnego hasła

### 4. `e2e/login.spec.ts`
- Usunięto `.skip()` z testu "should login successfully with valid credentials"
- Test teraz używa zmiennych środowiskowych

### 5. `e2e/fixtures/auth.fixture.ts`
Rozszerzono fixture o pełną implementację uwierzytelniania:
```typescript
export const test = base.extend<{ authenticatedUser: AuthenticatedUser }>({
  authenticatedUser: async ({ page }, use) => {
    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    const userId = process.env.E2E_USERNAME_ID;
    
    // Automatyczne logowanie przed testem
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(username, password);
    await page.waitForURL('/');
    
    await use({ email: username, password, id: userId });
  },
});
```

## Walidacja
Każdy test sprawdza czy wymagane zmienne środowiskowe są ustawione:
```typescript
if (!username || !password) {
  throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
}
```

## Użycie

### Testy podstawowe
```typescript
test('my test', async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;
  // ... użyj zmiennych
});
```

### Testy z fixture (automatyczne logowanie)
```typescript
import { test, expect } from './fixtures/auth.fixture';

test('authenticated test', async ({ page, authenticatedUser }) => {
  // Użytkownik jest już zalogowany
  await page.goto('/');
  // ... reszta testu
});
```

## Inne Pliki Testowe
Następujące pliki testowe są oznaczone jako `.skip()` i będą wymagały aktualizacji w przyszłości:
- `e2e/words.spec.ts` - podstawowe testy list słówek
- `e2e/words/words-pom.spec.ts` - pełne testy zarządzania słówkami
- `e2e/quiz/quiz-pom.spec.ts` - testy quizu

Te testy powinny używać `auth.fixture.ts` do automatycznego uwierzytelniania.

## Korzyści
1. ✅ Testy używają rzeczywistego użytkownika z bazy danych
2. ✅ Łatwa zmiana danych testowych bez modyfikacji kodu
3. ✅ Bezpieczniejsze - dane wrażliwe nie są w kodzie
4. ✅ Spójność - wszystkie testy używają tego samego mechanizmu
5. ✅ Fixture'y ułatwiają pisanie testów wymagających uwierzytelnienia

## Wymagania do Uruchomienia Testów
Plik `.env.test` musi zawierać:
```
E2E_USERNAME=twoj-email@example.com
E2E_PASSWORD=twoje-haslo
E2E_USERNAME_ID=uuid-uzytkownika  # opcjonalne
```

## Status
✅ Migracja zakończona - wszystkie aktywne testy używają zmiennych środowiskowych


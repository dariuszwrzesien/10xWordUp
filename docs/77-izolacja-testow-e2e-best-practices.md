## Problem

Przy równoległym uruchamianiu testów E2E (Playwright `fullyParallel: true`) mogą występować problemy z izolacją:

1. **Współdzielona sesja uwierzytelniania** - testy używają tego samego kontekstu przeglądarki i sesji
2. **Race conditions w danych** - testy modyfikują te same dane w bazie jednocześnie
3. **Niespójny stan aplikacji** - test oczekuje pustego stanu, ale inny test dodał dane
4. **Konflikty w cookies/localStorage** - stan aplikacji jest współdzielony między testami

## Objawy problemów z izolacją

```
Error: expect(locator).toBeVisible() failed
Locator: getByTestId('empty-state')
Expected: visible
Error: element(s) not found
```

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
waiting for navigation to "/" until "load"
navigated to "http://localhost:3000/login"
```

Te błędy występują **tylko przy równoległym uruchamianiu**, a nie przy sekwencyjnym.

## Rozwiązania

### 1. Izolacja Kontekstu Przeglądarki

#### ❌ Źle - Współdzielony kontekst

```typescript
// fixtures/auth.fixture.ts - ZŁA IMPLEMENTACJA
export const test = base.extend<{ authenticatedUser: AuthenticatedUser }>({
  authenticatedUser: async ({ page }, use) => {
    // Problem: wszystkie równoległe testy używają tego samego 'page'
    // co prowadzi do konfliktu sesji
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
    await use(user);
  },
});
```

#### ✅ Dobrze - Izolowany kontekst per test

```typescript
// fixtures/auth.fixture.ts - DOBRA IMPLEMENTACJA
export const test = base.extend<{ authenticatedUser: AuthenticatedUser }>({
  // Override context: każdy test dostaje nowy, izolowany kontekst
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    await use(context);
    await context.close();
  },

  // Override page: używa izolowanego kontekstu
  page: async ({ context }, use) => {
    const page = await context.newPage();
    await use(page);
  },

  // Authenticate: wykonuje logowanie w izolowanym kontekście
  authenticatedUser: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);
    await page.waitForURL("/", { timeout: 10000 });
    await use(user);
  },
});
```

**Kluczowe różnice:**

- Każdy test ma **własny browser context** (`browser.newContext()`)
- Każdy test ma **własne cookies i localStorage** (`storageState: { cookies: [], origins: [] }`)
- **Automatyczny cleanup** po teście (`context.close()`)
- **Brak race conditions** w sesji uwierzytelniania

### 2. Izolacja Danych w Bazie

#### Problem: Współdzielone dane użytkownika

Wszystkie testy używają tego samego użytkownika testowego z `.env.test`:

```bash
E2E_USERNAME=test@example.com
E2E_USERNAME_ID=123e4567-e89b-12d3-a456-426614174000
```

Gdy testy działają równolegle, jeden test tworzy słówka, a drugi oczekuje pustego stanu.

#### ✅ Rozwiązanie: Cleanup before/after każdego testu

```typescript
import { cleanupUserData } from "../helpers/db-cleanup.helper";
import { seedQuizTestData } from "../helpers/db-seed.helper";

test.describe("Quiz Tests", () => {
  // ⚠️ WAŻNE: beforeEach/afterEach hooks NIE MOGĄ używać fixture parameters
  // Używamy zmiennych środowiskowych bezpośrednio
  authenticatedTest.beforeEach(async () => {
    const userId = process.env.E2E_USERNAME_ID;
    if (!userId) {
      throw new Error("E2E_USERNAME_ID must be set in .env.test");
    }

    const config = {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    };

    // 1. Wyczyść istniejące dane
    await cleanupUserData(userId, config);

    // 2. Zaseeduj świeże dane dla testu
    await seedQuizTestData(userId, config);
  });

  authenticatedTest.afterEach(async () => {
    const userId = process.env.E2E_USERNAME_ID;
    if (!userId) return;

    const config = {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    };

    // 3. Wyczyść dane po teście
    await cleanupUserData(userId, config);
  });

  // Sama funkcja testowa MOŻE używać fixture parameters
  authenticatedTest("TC-QUIZ-001: Start quiz", async ({ page, authenticatedUser }) => {
    // Test ma zagwarantowane 10 słówek w bazie
    // Nie ma konfliktów z innymi testami
    console.log(authenticatedUser.email); // To działa!
  });
});
```

#### Strategia cleanup dla różnych typów testów

**A. Testy wymagające pustego stanu (empty state):**

```typescript
authenticatedTest("Display empty state", async ({ page }) => {
  // Cleanup NA POCZĄTKU testu
  await cleanupUserData(userId, config);
  await page.reload();
  await page.waitForLoadState("networkidle");

  await wordsListPage.expectEmptyState();
});
```

**B. Testy tworzące dane (create):**

```typescript
test.describe("Words Management - Create", () => {
  authenticatedTest.afterEach(async () => {
    // Cleanup PO KAŻDYM teście
    await cleanupUserData(userId, config);
  });

  authenticatedTest("Add new word", async ({ page }) => {
    // Test tworzy dane
    // afterEach sprząta po nim
  });
});
```

**C. Testy wymagające określonych danych (quiz, pagination):**

```typescript
test.describe("Quiz Tests", () => {
  authenticatedTest.beforeEach(async () => {
    // Cleanup + seed PRZED każdym testem
    await cleanupUserData(userId, config);
    await seedQuizTestData(userId, config);
  });

  authenticatedTest.afterEach(async () => {
    // Cleanup PO każdym teście
    await cleanupUserData(userId, config);
  });

  authenticatedTest("Start quiz", async ({ page }) => {
    // Test ma zagwarantowane 10 słówek
  });
});
```

### 3. Izolacja dla testów login/logout

Testy logowania nie powinny używać `authenticatedTest` fixture, tylko czysty `test`:

```typescript
test.describe("Authentication - Login Flow", () => {
  // Każdy test startuje bez sesji
  test.use({ storageState: { cookies: [], origins: [] } });

  test("Successful login", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(username, password);
    await expect(page).toHaveURL("/");
  });
});
```

## Podsumowanie Strategii Izolacji

| Aspekt               | Technika                                | Cel                                          |
| -------------------- | --------------------------------------- | -------------------------------------------- |
| **Browser Context**  | `browser.newContext()` per test         | Izolacja cookies/localStorage między testami |
| **Authentication**   | Login w fixture z override context/page | Każdy test ma własną sesję                   |
| **Database State**   | `beforeEach` cleanup + seed             | Każdy test startuje ze znanym stanem         |
| **Database Cleanup** | `afterEach` cleanup                     | Dane nie leakują między testami              |
| **Login Tests**      | `test.use({ storageState: {} })`        | Testy logowania startują bez sesji           |

## Weryfikacja izolacji

### Test izolacji lokalnie

```bash
# Uruchom testy równolegle (domyślnie)
npm run test:e2e

# Uruchom testy sekwencyjnie (dla porównania)
npm run test:e2e -- --workers=1
```

### Sprawdzanie logów

Testy poprawnie izolowane powinny:

- ✅ Przechodzić zarówno równolegle jak i sekwencyjnie
- ✅ Nie mieć race conditions w logowaniu
- ✅ Nie pokazywać błędów typu "element not found" dla empty state
- ✅ Nie mieć timeout errors przy navigation

## Dodatkowe Best Practices

### 1. Nie używaj globalnego setup/teardown dla danych testowych

❌ **Źle:**

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: "./e2e/global-setup.ts", // Seeduje dane raz dla wszystkich testów
});
```

✅ **Dobrze:**

```typescript
// Każdy test sam zarządza swoimi danymi
authenticatedTest.beforeEach(async () => {
  await seedTestData();
});
```

### 2. Używaj test.describe.configure dla testów wymagających kolejności

```typescript
test.describe("Sequential tests", () => {
  // Te testy muszą działać po kolei
  test.describe.configure({ mode: "serial" });

  test("Step 1: Setup", async () => {});
  test("Step 2: Main action", async () => {});
  test("Step 3: Verify", async () => {});
});
```

### 3. Timeout considerations

```typescript
// Zwiększ timeout dla operacji bazodanowych
authenticatedTest.beforeEach(async () => {
  test.setTimeout(30000); // 30s dla cleanup + seed
  await cleanupUserData(userId, config);
  await seedQuizTestData(userId, config);
});
```

## Troubleshooting

### Problem: "beforeEach hook has unknown parameter"

```
beforeEach hook has unknown parameter "authenticatedUser".
  at quiz/quiz-pom.spec.ts:31
> 31 |   authenticatedTest.beforeEach(async ({ authenticatedUser }) => {
```

**Przyczyna:** Playwright nie pozwala na używanie fixture parameters w hookach `beforeEach`/`afterEach`

**Rozwiązanie:**

```typescript
// ❌ ŹLE - fixture parameter w hook
authenticatedTest.beforeEach(async ({ authenticatedUser }) => {
  const userId = authenticatedUser.id;
});

// ✅ DOBRZE - używaj env variables
authenticatedTest.beforeEach(async () => {
  const userId = process.env.E2E_USERNAME_ID;
  // ...
});

// ✅ DOBRZE - fixture parameters działają w testach
authenticatedTest("My test", async ({ page, authenticatedUser }) => {
  console.log(authenticatedUser.email); // To działa!
});
```

### Problem: Testy nadal failują równolegle

**Możliwe przyczyny:**

1. Brak cleanup w `beforeEach`/`afterEach`
2. Używanie współdzielonego `page` fixture zamiast izolowanego kontekstu
3. Race conditions w API endpoints
4. Zbyt krótkie timeouty

**Rozwiązanie:**

- Dodaj logi w cleanup helpers: `console.log('Cleaned up X words')`
- Sprawdź czy fixture używa `browser.newContext()`
- Zwiększ timeouty dla operacji I/O

### Problem: Login timeout przy równoległym uruchamianiu

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
```

**Przyczyna:** Współdzielona sesja lub konflikt w middleware

**Rozwiązanie:**

- Upewnij się że fixture używa izolowanego kontekstu
- Sprawdź czy middleware poprawnie obsługuje równoległe requesty
- Zwiększ timeout w `page.waitForURL('/', { timeout: 15000 })`

## Pliki do przejrzenia

- `e2e/fixtures/auth.fixture.ts` - Implementacja izolacji kontekstu
- `e2e/helpers/db-cleanup.helper.ts` - Funkcje cleanup
- `e2e/helpers/db-seed.helper.ts` - Funkcje seed
- `e2e/words/words-pom.spec.ts` - Przykład izolacji dla testów words
- `e2e/quiz/quiz-pom.spec.ts` - Przykład izolacji dla testów quiz
- `e2e/auth/login-pom.spec.ts` - Przykład izolacji dla testów auth

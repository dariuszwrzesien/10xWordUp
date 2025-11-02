# Implementacja data-testid dla Testów E2E

Data utworzenia: 2025-11-02

## 1. Wprowadzenie

Dokument zawiera kompletne mapowanie atrybutów `data-testid` dodanych do komponentów aplikacji 10xWordUp w celu ułatwienia pisania testów End-to-End przy użyciu Playwright.

Atrybuty zostały dodane systematycznie do wszystkich kluczowych komponentów zgodnie z scenariuszami testowymi z dokumentu `64-scenariusze-testowania-e2e.md`.

## 2. Konwencja nazewnictwa

### Zasady ogólne:

- Używamy kebab-case dla wartości data-testid
- Nazwy są opisowe i odzwierciedlają funkcję elementu
- Dla elementów dynamicznych (np. listy) używamy wzorca: `{prefix}-{identifier}`
- Przykłady:
  - `login-form` - formularz logowania
  - `word-row-{id}` - wiersz w tabeli słówek z konkretnym ID
  - `tag-filter-{name}` - opcja filtra z konkretną nazwą taga

## 3. Mapowanie data-testid do Scenariuszy Testowych

### 3.1. Autentykacja

#### RegisterForm (TC-AUTH-001 do TC-AUTH-004)

**Plik:** `src/components/auth/RegisterForm.tsx`

| data-testid                       | Element     | Scenariusz      | Opis                                    |
| --------------------------------- | ----------- | --------------- | --------------------------------------- |
| `register-form-card`              | Card        | TC-AUTH-001-004 | Główna karta formularza rejestracji     |
| `register-form`                   | form        | TC-AUTH-001-004 | Element formularza                      |
| `register-email-input`            | Input       | TC-AUTH-001-004 | Pole email                              |
| `register-email-error`            | FormMessage | TC-AUTH-002-003 | Komunikat błędu dla email               |
| `register-password-input`         | Input       | TC-AUTH-001-004 | Pole hasła                              |
| `register-password-error`         | FormMessage | TC-AUTH-003     | Komunikat błędu dla hasła               |
| `register-confirm-password-input` | Input       | TC-AUTH-001-004 | Pole potwierdzenia hasła                |
| `register-confirm-password-error` | FormMessage | TC-AUTH-004     | Komunikat błędu dla potwierdzenia hasła |
| `register-submit-button`          | Button      | TC-AUTH-001-004 | Przycisk "Utwórz konto"                 |
| `register-login-link`             | Link        | TC-AUTH-001-004 | Link do strony logowania                |

#### LoginForm (TC-AUTH-005 do TC-AUTH-007)

**Plik:** `src/components/auth/LoginForm.tsx`

| data-testid                  | Element     | Scenariusz      | Opis                              |
| ---------------------------- | ----------- | --------------- | --------------------------------- |
| `login-form-card`            | Card        | TC-AUTH-005-007 | Główna karta formularza logowania |
| `login-form`                 | form        | TC-AUTH-005-007 | Element formularza                |
| `login-email-input`          | Input       | TC-AUTH-005-007 | Pole email                        |
| `login-email-error`          | FormMessage | TC-AUTH-006-007 | Komunikat błędu dla email         |
| `login-password-input`       | Input       | TC-AUTH-005-007 | Pole hasła                        |
| `login-password-error`       | FormMessage | TC-AUTH-006     | Komunikat błędu dla hasła         |
| `login-forgot-password-link` | Link        | TC-AUTH-009     | Link "Nie pamiętasz hasła?"       |
| `login-submit-button`        | Button      | TC-AUTH-005-007 | Przycisk "Zaloguj się"            |
| `login-register-link`        | Link        | TC-AUTH-005-007 | Link do strony rejestracji        |

#### ForgotPasswordForm (TC-AUTH-009)

**Plik:** `src/components/auth/ForgotPasswordForm.tsx`

| data-testid                          | Element         | Scenariusz  | Opis                                      |
| ------------------------------------ | --------------- | ----------- | ----------------------------------------- |
| `forgot-password-form-card`          | Card            | TC-AUTH-009 | Główna karta formularza                   |
| `forgot-password-form`               | form            | TC-AUTH-009 | Element formularza                        |
| `forgot-password-email-input`        | Input           | TC-AUTH-009 | Pole email                                |
| `forgot-password-email-error`        | FormMessage     | TC-AUTH-009 | Komunikat błędu dla email                 |
| `forgot-password-submit-button`      | Button          | TC-AUTH-009 | Przycisk "Wyślij link resetujący"         |
| `forgot-password-login-link`         | Link            | TC-AUTH-009 | Link powrotu do logowania                 |
| `forgot-password-success-card`       | Card            | TC-AUTH-009 | Karta po wysłaniu linku                   |
| `forgot-password-success-message`    | CardDescription | TC-AUTH-009 | Komunikat sukcesu                         |
| `forgot-password-resend-button`      | Button          | TC-AUTH-009 | Przycisk "Wyślij ponownie"                |
| `forgot-password-back-to-login-link` | Link            | TC-AUTH-009 | Link powrotu do logowania (success state) |

#### ResetPasswordForm (TC-AUTH-010 do TC-AUTH-011)

**Plik:** `src/components/auth/ResetPasswordForm.tsx`

| data-testid                              | Element         | Scenariusz      | Opis                              |
| ---------------------------------------- | --------------- | --------------- | --------------------------------- |
| `reset-password-checking-card`           | Card            | TC-AUTH-010-011 | Karta sprawdzania tokenu          |
| `reset-password-invalid-token-card`      | Card            | TC-AUTH-011     | Karta niepoprawnego tokenu        |
| `reset-password-invalid-token-message`   | CardDescription | TC-AUTH-011     | Komunikat o niepoprawnym tokenie  |
| `reset-password-request-new-link-button` | Button          | TC-AUTH-011     | Przycisk "Wyślij nowy link"       |
| `reset-password-back-to-login-link`      | Link            | TC-AUTH-011     | Link powrotu do logowania         |
| `reset-password-form-card`               | Card            | TC-AUTH-010     | Główna karta formularza           |
| `reset-password-form`                    | form            | TC-AUTH-010     | Element formularza                |
| `reset-password-password-input`          | Input           | TC-AUTH-010     | Pole nowego hasła                 |
| `reset-password-password-error`          | FormMessage     | TC-AUTH-010     | Komunikat błędu dla hasła         |
| `reset-password-confirm-password-input`  | Input           | TC-AUTH-010     | Pole potwierdzenia hasła          |
| `reset-password-confirm-password-error`  | FormMessage     | TC-AUTH-010     | Komunikat błędu dla potwierdzenia |
| `reset-password-submit-button`           | Button          | TC-AUTH-010     | Przycisk "Zmień hasło"            |
| `reset-password-login-link`              | Link            | TC-AUTH-010     | Link do logowania                 |
| `reset-password-success-card`            | Card            | TC-AUTH-010     | Karta sukcesu                     |
| `reset-password-success-message`         | CardDescription | TC-AUTH-010     | Komunikat sukcesu                 |
| `reset-password-go-to-app-button`        | Button          | TC-AUTH-010     | Przycisk "Przejdź do aplikacji"   |

#### UserMenu (TC-AUTH-008)

**Plik:** `src/components/layout/UserMenu.tsx`

| data-testid         | Element             | Scenariusz      | Opis                                  |
| ------------------- | ------------------- | --------------- | ------------------------------------- |
| `user-menu-trigger` | Button              | TC-AUTH-008     | Przycisk otwierający menu użytkownika |
| `user-email`        | span                | TC-AUTH-001-008 | Wyświetlany email użytkownika         |
| `user-menu-content` | DropdownMenuContent | TC-AUTH-008     | Rozwinięte menu                       |
| `logout-button`     | DropdownMenuItem    | TC-AUTH-008     | Przycisk "Wyloguj się"                |

### 3.2. Zarządzanie Słówkami

#### WordsListView (TC-WORDS-001 do TC-WORDS-004)

**Plik:** `src/components/views/WordsListView.tsx`

| data-testid          | Element | Scenariusz       | Opis                         |
| -------------------- | ------- | ---------------- | ---------------------------- |
| `words-list-view`    | div     | TC-WORDS-001-004 | Główny kontener widoku listy |
| `words-count`        | span    | TC-WORDS-002     | Liczba słówek w bazie        |
| `add-word-button`    | Button  | TC-WORDS-005-008 | Przycisk "Dodaj słówko"      |
| `start-quiz-button`  | Button  | TC-QUIZ-001      | Przycisk "Rozpocznij Quiz"   |
| `tags-loading`       | div     | TC-WORDS-004     | Stan ładowania tagów         |
| `words-error-state`  | div     | TC-WORDS - Error | Stan błędu ładowania         |
| `reload-page-button` | Button  | TC-WORDS - Error | Przycisk odświeżania strony  |

#### EmptyState (TC-WORDS-001)

**Plik:** `src/components/views/EmptyState.tsx`

| data-testid                         | Element | Scenariusz   | Opis                                  |
| ----------------------------------- | ------- | ------------ | ------------------------------------- |
| `empty-state`                       | div     | TC-WORDS-001 | Pusty stan (brak słówek)              |
| `empty-state-message`               | p       | TC-WORDS-001 | Komunikat o braku słówek              |
| `empty-state-add-first-word-button` | Button  | TC-WORDS-001 | Przycisk "Dodaj pierwsze słówko"      |
| `empty-state-filtered`              | div     | TC-WORDS-004 | Pusty stan (brak wyników filtrowania) |
| `empty-state-add-word-button`       | Button  | TC-WORDS-004 | Przycisk "Dodaj słówko" (filtrowany)  |

#### WordsTable & WordsTableRow (TC-WORDS-002 do TC-WORDS-014)

**Plik:** `src/components/views/WordsTable.tsx` i `WordsTableRow.tsx`

| data-testid           | Element   | Scenariusz       | Opis                         |
| --------------------- | --------- | ---------------- | ---------------------------- |
| `words-table-loading` | div       | TC-WORDS-002     | Stan ładowania tabeli        |
| `words-table`         | div       | TC-WORDS-002-004 | Tabela ze słówkami           |
| `word-row-{id}`       | TableRow  | TC-WORDS-002-014 | Wiersz z konkretnym słówkiem |
| `word-cell`           | TableCell | TC-WORDS-002     | Komórka ze słówkiem EN       |
| `translation-cell`    | TableCell | TC-WORDS-002     | Komórka z tłumaczeniem PL    |
| `phonetic-cell`       | TableCell | TC-WORDS-005-006 | Komórka z wymową fonetyczną  |
| `tags-cell`           | TableCell | TC-WORDS-004,008 | Komórka z tagami             |
| `word-tag-{name}`     | span      | TC-WORDS-004,008 | Pojedynczy tag przy słówku   |
| `created-at-cell`     | TableCell | TC-WORDS-002     | Komórka z datą utworzenia    |
| `actions-cell`        | TableCell | TC-WORDS-009-014 | Komórka z akcjami            |
| `play-audio-button`   | Button    | TC-WORDS-005-006 | Przycisk odtwarzania audio   |
| `edit-word-button`    | Button    | TC-WORDS-009-011 | Przycisk edycji słówka       |
| `delete-word-button`  | Button    | TC-WORDS-012-014 | Przycisk usuwania słówka     |

#### WordFormDialog (TC-WORDS-005 do TC-WORDS-010,015,016)

**Plik:** `src/components/views/WordFormDialog.tsx`

| data-testid               | Element       | Scenariusz           | Opis                           |
| ------------------------- | ------------- | -------------------- | ------------------------------ |
| `word-form-dialog`        | DialogContent | TC-WORDS-005-010     | Dialog dodawania/edycji słówka |
| `word-form-dialog-title`  | DialogTitle   | TC-WORDS-005-010     | Tytuł dialogu                  |
| `word-form`               | form          | TC-WORDS-005-010     | Formularz słówka               |
| `word-input`              | Input         | TC-WORDS-005-010     | Pole słówka EN                 |
| `word-error`              | FormMessage   | TC-WORDS-007         | Błąd walidacji słówka          |
| `translation-input`       | Input         | TC-WORDS-005-010     | Pole tłumaczenia PL            |
| `translation-error`       | FormMessage   | TC-WORDS-007         | Błąd walidacji tłumaczenia     |
| `tag-input`               | Input         | TC-WORDS-008,015-016 | Pole dodawania taga            |
| `add-tag-button`          | Button        | TC-WORDS-008,015-016 | Przycisk "Dodaj" tag           |
| `selected-tags`           | div           | TC-WORDS-008,015     | Kontener wybranych tagów       |
| `selected-tag-{name}`     | span          | TC-WORDS-008,015     | Pojedynczy wybrany tag         |
| `remove-tag-{name}`       | button        | TC-WORDS-008,015     | Przycisk usunięcia taga        |
| `available-tags`          | div           | TC-WORDS-008,015     | Kontener dostępnych tagów      |
| `available-tag-{name}`    | button        | TC-WORDS-008,015     | Pojedynczy dostępny tag        |
| `word-form-cancel-button` | Button        | TC-WORDS-005-010     | Przycisk "Anuluj"              |
| `word-form-submit-button` | Button        | TC-WORDS-005-010     | Przycisk "Zapisz"              |

#### DeleteWordDialog (TC-WORDS-012 do TC-WORDS-014)

**Plik:** `src/components/views/DeleteWordDialog.tsx`

| data-testid                      | Element                | Scenariusz       | Opis                           |
| -------------------------------- | ---------------------- | ---------------- | ------------------------------ |
| `delete-word-dialog`             | AlertDialogContent     | TC-WORDS-012-014 | Dialog potwierdzenia usunięcia |
| `delete-word-dialog-title`       | AlertDialogTitle       | TC-WORDS-012     | Tytuł dialogu                  |
| `delete-word-dialog-description` | AlertDialogDescription | TC-WORDS-012     | Opis operacji                  |
| `delete-word-name`               | span                   | TC-WORDS-012     | Nazwa usuwanego słówka         |
| `delete-word-cancel-button`      | AlertDialogCancel      | TC-WORDS-013     | Przycisk "Anuluj"              |
| `delete-word-confirm-button`     | AlertDialogAction      | TC-WORDS-012     | Przycisk "Usuń"                |

#### TagFilter (TC-WORDS-004)

**Plik:** `src/components/views/TagFilter.tsx`

| data-testid          | Element       | Scenariusz   | Opis                     |
| -------------------- | ------------- | ------------ | ------------------------ |
| `tag-filter-trigger` | SelectTrigger | TC-WORDS-004 | Trigger filtra tagów     |
| `tag-filter-content` | SelectContent | TC-WORDS-004 | Rozwinięta lista tagów   |
| `tag-filter-all`     | SelectItem    | TC-WORDS-004 | Opcja "Wszystkie słówka" |
| `tag-filter-{name}`  | SelectItem    | TC-WORDS-004 | Opcja konkretnego taga   |

#### WordsPagination (TC-WORDS-003,014)

**Plik:** `src/components/views/WordsPagination.tsx`

| data-testid                | Element            | Scenariusz       | Opis                       |
| -------------------------- | ------------------ | ---------------- | -------------------------- |
| `words-pagination`         | Pagination         | TC-WORDS-003,014 | Komponent paginacji        |
| `pagination-previous`      | PaginationPrevious | TC-WORDS-003     | Przycisk "Poprzednia"      |
| `pagination-page-{number}` | PaginationLink     | TC-WORDS-003     | Przycisk konkretnej strony |
| `pagination-next`          | PaginationNext     | TC-WORDS-003     | Przycisk "Następna"        |

### 3.3. Quiz

#### QuizSetup (TC-QUIZ-001 do TC-QUIZ-004)

**Plik:** `src/components/views/quiz/QuizSetup.tsx`

| data-testid                 | Element       | Scenariusz      | Opis                         |
| --------------------------- | ------------- | --------------- | ---------------------------- |
| `quiz-setup`                | div           | TC-QUIZ-001-004 | Główny kontener konfiguracji |
| `quiz-back-to-words-button` | Button        | TC-QUIZ-001-004 | Przycisk powrotu do słówek   |
| `quiz-setup-card`           | Card          | TC-QUIZ-001-004 | Karta konfiguracji           |
| `quiz-direction-en-pl`      | div           | TC-QUIZ-001     | Opcja kierunku EN→PL         |
| `quiz-direction-pl-en`      | div           | TC-QUIZ-001     | Opcja kierunku PL→EN         |
| `quiz-scope-all`            | div           | TC-QUIZ-001     | Opcja "Wszystkie słówka"     |
| `quiz-scope-tag`            | div           | TC-QUIZ-003     | Opcja "Według tagu"          |
| `quiz-tag-selector`         | div           | TC-QUIZ-003     | Kontener selektora tagów     |
| `quiz-tags-loading`         | div           | TC-QUIZ-003     | Stan ładowania tagów         |
| `quiz-no-tags-message`      | p             | TC-QUIZ-002     | Komunikat o braku tagów      |
| `quiz-tag-select-trigger`   | SelectTrigger | TC-QUIZ-003     | Trigger wyboru taga          |
| `quiz-tag-select-content`   | SelectContent | TC-QUIZ-003     | Lista tagów                  |
| `quiz-tag-option-{name}`    | SelectItem    | TC-QUIZ-003     | Opcja konkretnego taga       |
| `quiz-start-button`         | Button        | TC-QUIZ-001-004 | Przycisk "Rozpocznij Quiz"   |
| `quiz-validation-message`   | p             | TC-QUIZ-001,004 | Komunikat walidacji          |

#### QuizSession (TC-QUIZ-005 do TC-QUIZ-008)

**Plik:** `src/components/views/quiz/QuizSession.tsx`

| data-testid                | Element  | Scenariusz      | Opis                             |
| -------------------------- | -------- | --------------- | -------------------------------- |
| `quiz-session`             | div      | TC-QUIZ-005-008 | Główny kontener sesji quizu      |
| `quiz-progress-text`       | span     | TC-QUIZ-005-008 | Tekst postępu (np. "3/5")        |
| `quiz-progress-percent`    | span     | TC-QUIZ-005-008 | Procent postępu                  |
| `quiz-progress-bar`        | Progress | TC-QUIZ-005-008 | Pasek postępu                    |
| `quiz-quit-button`         | Button   | TC-QUIZ-011     | Przycisk przerwania quizu        |
| `quiz-direction-display`   | p        | TC-QUIZ-001,005 | Wyświetlany kierunek tłumaczenia |
| `quiz-question-number`     | p        | TC-QUIZ-005-008 | Numer bieżącego pytania          |
| `quiz-remaining-questions` | p        | TC-QUIZ-005-008 | Liczba pozostałych pytań         |

#### QuestionCard (TC-QUIZ-005 do TC-QUIZ-008)

**Plik:** `src/components/views/quiz/QuestionCard.tsx`

| data-testid                        | Element | Scenariusz      | Opis                                   |
| ---------------------------------- | ------- | --------------- | -------------------------------------- |
| `question-card`                    | Card    | TC-QUIZ-005-008 | Karta pytania                          |
| `question-prompt`                  | p       | TC-QUIZ-005-006 | Prompt pytania                         |
| `question-word`                    | h2      | TC-QUIZ-005-006 | Słówko do przetłumaczenia              |
| `question-play-audio-button`       | Button  | TC-QUIZ-008     | Przycisk odtwarzania audio (pytanie)   |
| `question-reveal-button`           | Button  | TC-QUIZ-005-006 | Przycisk "Pokaż odpowiedź"             |
| `question-answer-section`          | div     | TC-QUIZ-005-006 | Sekcja z odpowiedzią (po reveal)       |
| `question-answer`                  | h3      | TC-QUIZ-005-006 | Poprawna odpowiedź                     |
| `answer-play-audio-button`         | Button  | TC-QUIZ-008     | Przycisk odtwarzania audio (odpowiedź) |
| `question-examples`                | div     | TC-QUIZ-005-006 | Sekcja z przykładami                   |
| `question-answer-dont-know-button` | Button  | TC-QUIZ-006-007 | Przycisk "Nie znałem"                  |
| `question-answer-know-button`      | Button  | TC-QUIZ-005     | Przycisk "Znałem"                      |

#### QuizSummary (TC-QUIZ-009 do TC-QUIZ-011)

**Plik:** `src/components/views/quiz/QuizSummary.tsx`

| data-testid                 | Element | Scenariusz      | Opis                             |
| --------------------------- | ------- | --------------- | -------------------------------- |
| `quiz-summary`              | div     | TC-QUIZ-009-010 | Główny kontener podsumowania     |
| `quiz-summary-title`        | h1      | TC-QUIZ-009     | Tytuł "Gratulacje!"              |
| `quiz-summary-message`      | p       | TC-QUIZ-009     | Komunikat o ukończeniu           |
| `quiz-summary-card`         | Card    | TC-QUIZ-009-010 | Karta z opcjami                  |
| `quiz-repeat-button`        | Button  | TC-QUIZ-010     | Przycisk "Powtórz quiz"          |
| `quiz-new-button`           | Button  | TC-QUIZ-010     | Przycisk "Skonfiguruj nowy quiz" |
| `quiz-back-to-words-button` | Button  | TC-QUIZ-010     | Przycisk "Wróć do słówek"        |

## 4. Przykłady użycia w testach Playwright

### 4.1. Przykład testu logowania

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test("TC-AUTH-005: Pomyślne logowanie", async ({ page }) => {
  await page.goto("/login");

  // Wypełnienie formularza
  await page.getByTestId("login-email-input").fill("test@example.com");
  await page.getByTestId("login-password-input").fill("password123");

  // Wysłanie formularza
  await page.getByTestId("login-submit-button").click();

  // Weryfikacja przekierowania
  await expect(page).toHaveURL("/");

  // Weryfikacja widoczności UserMenu
  await expect(page.getByTestId("user-menu-trigger")).toBeVisible();
  await expect(page.getByTestId("user-email")).toContainText("test@example.com");
});
```

### 4.2. Przykład testu dodawania słówka

```typescript
// e2e/words/create.spec.ts
import { test, expect } from "@playwright/test";

test("TC-WORDS-005: Dodanie nowego słówka", async ({ page }) => {
  await page.goto("/");

  // Kliknięcie przycisku dodawania
  await page.getByTestId("add-word-button").click();

  // Weryfikacja otwarcia dialogu
  await expect(page.getByTestId("word-form-dialog")).toBeVisible();

  // Wypełnienie formularza
  await page.getByTestId("word-input").fill("apple");
  await page.getByTestId("translation-input").fill("jabłko");

  // Dodanie taga
  await page.getByTestId("tag-input").fill("food");
  await page.getByTestId("add-tag-button").click();

  // Weryfikacja dodanego taga
  await expect(page.getByTestId("selected-tag-food")).toBeVisible();

  // Zapisanie słówka
  await page.getByTestId("word-form-submit-button").click();

  // Weryfikacja zamknięcia dialogu i pojawienia się słówka
  await expect(page.getByTestId("word-form-dialog")).not.toBeVisible();
  await expect(page.getByTestId("words-table")).toContainText("apple");
});
```

### 4.3. Przykład testu quizu

```typescript
// e2e/quiz/session.spec.ts
import { test, expect } from "@playwright/test";

test("TC-QUIZ-005: Odpowiadanie na pytanie - poprawna odpowiedź", async ({ page }) => {
  await page.goto("/quiz");

  // Konfiguracja quizu
  await page.getByTestId("quiz-direction-en-pl").click();
  await page.getByTestId("quiz-scope-all").click();
  await page.getByTestId("quiz-start-button").click();

  // Weryfikacja rozpoczęcia sesji
  await expect(page.getByTestId("quiz-session")).toBeVisible();
  await expect(page.getByTestId("question-card")).toBeVisible();

  // Ujawnienie odpowiedzi
  await page.getByTestId("question-reveal-button").click();

  // Weryfikacja widoczności sekcji odpowiedzi
  await expect(page.getByTestId("question-answer-section")).toBeVisible();

  // Kliknięcie "Znałem"
  await page.getByTestId("question-answer-know-button").click();

  // Weryfikacja postępu
  await expect(page.getByTestId("quiz-progress-text")).toContainText("1 /");
});
```

## 5. Dobre praktyki

### 5.1. Pisanie selektorów

```typescript
// ✅ DOBRZE - używanie getByTestId
await page.getByTestId("login-submit-button").click();

// ❌ ŹLE - używanie selektorów CSS
await page.click("button.submit-btn");

// ❌ ŹLE - używanie tekstu (niestabilne dla i18n)
await page.click("text=Zaloguj się");
```

### 5.2. Weryfikacja stanu

```typescript
// ✅ DOBRZE - weryfikacja widoczności
await expect(page.getByTestId("word-form-dialog")).toBeVisible();

// ✅ DOBRZE - weryfikacja tekstu
await expect(page.getByTestId("user-email")).toContainText("test@example.com");

// ✅ DOBRZE - weryfikacja atrybutu disabled
await expect(page.getByTestId("login-submit-button")).toBeDisabled();
```

### 5.3. Czekanie na elementy

```typescript
// ✅ DOBRZE - Playwright automatycznie czeka
await page.getByTestId("word-form-dialog").waitFor({ state: "visible" });
await page.getByTestId("word-input").fill("apple");

// ❌ ŹLE - niepotrzebne sleep
await page.waitForTimeout(1000);
```

## 6. Podsumowanie

Wszystkie kluczowe komponenty aplikacji zostały oznaczone atrybutami `data-testid`, co umożliwia:

- ✅ **Stabilne selektory** - niezależne od struktury DOM i stylów
- ✅ **Czytelność testów** - opisowe nazwy elementów
- ✅ **Łatwość w utrzymaniu** - jednoznaczne identyfikatory
- ✅ **Kompletne pokrycie** - wszystkie scenariusze z dokumentu 64

### Statystyki implementacji:

- **Komponenty autentykacji:** 7 komponentów, ~40 identyfikatorów
- **Komponenty słówek:** 8 komponentów, ~50 identyfikatorów
- **Komponenty quizu:** 4 komponenty, ~30 identyfikatorów
- **Komponenty nawigacji:** 3 komponenty, ~10 identyfikatorów

**Łącznie: ~130 unikalnych identyfikatorów data-testid**

## 7. Następne kroki

1. ✅ Dodanie atrybutów data-testid do komponentów - **ZAKOŃCZONE**
2. 📝 Implementacja testów E2E zgodnie ze scenariuszami z dokumentu 64
3. 🔄 Uruchomienie testów lokalnie i w CI/CD
4. 📊 Monitoring pokrycia testowego
5. 🐛 Iteracyjne poprawki i rozszerzenia

---

**Autor:** AI Assistant  
**Data utworzenia:** 2025-11-02  
**Wersja:** 1.0

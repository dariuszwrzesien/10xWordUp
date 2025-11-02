# Page Object Model (POM) Documentation

Data utworzenia: 2025-11-02

## 1. Wprowadzenie

Ten dokument opisuje implementację wzorca Page Object Model (POM) dla testów E2E aplikacji 10xWordUp przy użyciu Playwright.

Wszystkie klasy POM wykorzystują atrybuty `data-testid` zaimplementowane zgodnie z dokumentem `66-implementacja-data-testid-dla-testow-e2e.md`.

## 2. Struktura katalogów

```
e2e/
├── pages/
│   ├── base.page.ts                           # Klasa bazowa dla wszystkich POM
│   ├── index.ts                               # Centralny eksport wszystkich klas
│   │
│   ├── login.page.ts                          # Strona logowania
│   ├── register.page.ts                       # Strona rejestracji
│   ├── forgot-password.page.ts                # Strona zapomnienia hasła
│   ├── reset-password.page.ts                 # Strona resetowania hasła
│   ├── words-list.page.ts                     # Główna strona ze słówkami
│   ├── quiz.page.ts                           # Strona quizu
│   │
│   └── components/
│       ├── user-menu.component.ts             # Komponent menu użytkownika
│       ├── word-form-dialog.component.ts      # Dialog dodawania/edycji słówka
│       ├── delete-word-dialog.component.ts    # Dialog usuwania słówka
│       ├── tag-filter.component.ts            # Filtr tagów
│       ├── words-pagination.component.ts      # Paginacja
│       ├── quiz-setup.component.ts            # Konfiguracja quizu
│       ├── quiz-session.component.ts          # Sesja quizu
│       ├── question-card.component.ts         # Karta pytania
│       └── quiz-summary.component.ts          # Podsumowanie quizu
│
└── examples/
    └── pom-usage.spec.ts                      # Przykłady użycia POM
```

## 3. Architektura POM

### 3.1. BasePage

Klasa bazowa dostarczająca wspólną funkcjonalność:

- `getByTestId(testId: string)` - Główna metoda do lokalizacji elementów
- `goto(path: string)` - Nawigacja do URL
- `waitForPageLoad()` - Czekanie na załadowanie strony
- `isVisible(testId: string)` - Sprawdzenie widoczności elementu

### 3.2. Konwencje nazewnictwa

#### Page Classes (Strony)
- Nazwa: `{Feature}Page`
- Przykład: `LoginPage`, `WordsListPage`, `QuizPage`
- Plik: `{feature}.page.ts`

#### Component Classes (Komponenty)
- Nazwa: `{Feature}Component`
- Przykład: `UserMenuComponent`, `WordFormDialogComponent`
- Plik: `components/{feature}.component.ts`

### 3.3. Struktura klasy POM

Każda klasa POM zawiera:

1. **Locators (gettery)** - Metody zwracające lokatory elementów
2. **Actions (metody async)** - Akcje wykonywane na stronie
3. **Assertions (metody expect)** - Asercje weryfikujące stan

```typescript
export class ExamplePage extends BasePage {
  // 1. Locators
  get elementLocator() {
    return this.getByTestId('element-test-id');
  }

  // 2. Actions
  async performAction(): Promise<void> {
    await this.elementLocator.click();
  }

  // 3. Assertions
  async expectElementVisible(): Promise<void> {
    await expect(this.elementLocator).toBeVisible();
  }
}
```

## 4. Opis klas POM

### 4.1. Authentication Pages

#### LoginPage
**Plik:** `pages/login.page.ts`

**Odpowiedzialność:** Obsługa formularza logowania

**Kluczowe metody:**
- `navigate()` - Przejście do `/login`
- `login(email, password)` - Wypełnienie i wysłanie formularza
- `expectFormVisible()` - Weryfikacja widoczności formularza
- `expectEmailError()` - Weryfikacja błędu email

**Scenariusze testowe:** TC-AUTH-005 do TC-AUTH-007

---

#### RegisterPage
**Plik:** `pages/register.page.ts`

**Odpowiedzialność:** Obsługa formularza rejestracji

**Kluczowe metody:**
- `navigate()` - Przejście do `/register`
- `register(email, password, confirmPassword)` - Pełny proces rejestracji
- `expectPasswordError()` - Weryfikacja błędu hasła
- `expectConfirmPasswordError()` - Weryfikacja błędu potwierdzenia

**Scenariusze testowe:** TC-AUTH-001 do TC-AUTH-004

---

#### ForgotPasswordPage
**Plik:** `pages/forgot-password.page.ts`

**Odpowiedzialność:** Obsługa żądania resetu hasła

**Kluczowe metody:**
- `navigate()` - Przejście do `/forgot-password`
- `requestPasswordReset(email)` - Wysłanie żądania
- `expectSuccessState()` - Weryfikacja stanu sukcesu
- `clickResend()` - Ponowne wysłanie

**Scenariusze testowe:** TC-AUTH-009

---

#### ResetPasswordPage
**Plik:** `pages/reset-password.page.ts`

**Odpowiedzialność:** Obsługa zmiany hasła z tokenem

**Kluczowe metody:**
- `navigate(token?)` - Przejście z tokenem
- `resetPassword(password, confirmPassword)` - Zmiana hasła
- `expectInvalidTokenState()` - Weryfikacja niepoprawnego tokenu
- `expectSuccessState()` - Weryfikacja sukcesu

**Scenariusze testowe:** TC-AUTH-010 do TC-AUTH-011

---

### 4.2. Words Management Pages

#### WordsListPage
**Plik:** `pages/words-list.page.ts`

**Odpowiedzialność:** Główny dashboard ze słówkami

**Kluczowe metody:**
- `navigate()` - Przejście do `/`
- `clickAddWord()` - Otworzenie dialogu dodawania
- `getWordRow(wordId)` - Pobranie wiersza słówka
- `clickEdit(wordId)` - Kliknięcie edycji
- `clickDelete(wordId)` - Kliknięcie usunięcia
- `expectEmptyState()` - Weryfikacja pustego stanu
- `expectTableVisible()` - Weryfikacja widoczności tabeli

**Scenariusze testowe:** TC-WORDS-001 do TC-WORDS-004

---

### 4.3. Components

#### UserMenuComponent
**Plik:** `pages/components/user-menu.component.ts`

**Odpowiedzialność:** Menu użytkownika w headerze

**Kluczowe metody:**
- `openMenu()` - Otwarcie menu
- `logout()` - Wylogowanie
- `expectUserEmail(email)` - Weryfikacja emaila

**Scenariusze testowe:** TC-AUTH-008

---

#### WordFormDialogComponent
**Plik:** `pages/components/word-form-dialog.component.ts`

**Odpowiedzialność:** Dialog dodawania/edycji słówka

**Kluczowe metody:**
- `fillWordForm(word, translation, tags)` - Wypełnienie formularza
- `createWord(word, translation, tags)` - Utworzenie słówka
- `addTag(tagName)` - Dodanie taga
- `removeTag(tagName)` - Usunięcie taga
- `expectDialogVisible()` - Weryfikacja widoczności

**Scenariusze testowe:** TC-WORDS-005 do TC-WORDS-010, TC-WORDS-015

---

#### DeleteWordDialogComponent
**Plik:** `pages/components/delete-word-dialog.component.ts`

**Odpowiedzialność:** Potwierdzenie usunięcia słówka

**Kluczowe metody:**
- `confirmDeletion()` - Potwierdzenie usunięcia
- `cancelDeletion()` - Anulowanie
- `expectWordName(word)` - Weryfikacja nazwy słówka

**Scenariusze testowe:** TC-WORDS-012 do TC-WORDS-014

---

#### TagFilterComponent
**Plik:** `pages/components/tag-filter.component.ts`

**Odpowiedzialność:** Filtrowanie słówek po tagach

**Kluczowe metody:**
- `selectTag(tagName)` - Wybór taga
- `selectAllWords()` - Wybór wszystkich słówek
- `expectTagOption(tagName)` - Weryfikacja opcji

**Scenariusze testowe:** TC-WORDS-004

---

#### WordsPaginationComponent
**Plik:** `pages/components/words-pagination.component.ts`

**Odpowiedzialność:** Nawigacja po stronach

**Kluczowe metody:**
- `clickNext()` - Następna strona
- `clickPrevious()` - Poprzednia strona
- `goToPage(number)` - Przejście do konkretnej strony
- `expectCurrentPage(number)` - Weryfikacja aktualnej strony

**Scenariusze testowe:** TC-WORDS-003, TC-WORDS-014

---

### 4.4. Quiz Components

#### QuizSetupComponent
**Plik:** `pages/components/quiz-setup.component.ts`

**Odpowiedzialność:** Konfiguracja quizu

**Kluczowe metody:**
- `setupQuiz(direction, scope, tagName?)` - Pełna konfiguracja
- `selectDirectionEnPl()` - Wybór kierunku EN→PL
- `selectScopeTag()` - Wybór zakresu po tagu
- `selectTag(tagName)` - Wybór konkretnego taga
- `clickStart()` - Rozpoczęcie quizu

**Scenariusze testowe:** TC-QUIZ-001 do TC-QUIZ-004

---

#### QuizSessionComponent
**Plik:** `pages/components/quiz-session.component.ts`

**Odpowiedzialność:** Aktywna sesja quizu

**Kluczowe metody:**
- `clickQuit()` - Przerwanie quizu
- `expectProgress(current, total)` - Weryfikacja postępu
- `expectProgressPercent(percent)` - Weryfikacja procentu

**Scenariusze testowe:** TC-QUIZ-005 do TC-QUIZ-008

---

#### QuestionCardComponent
**Plik:** `pages/components/question-card.component.ts`

**Odpowiedzialność:** Pojedyncze pytanie w quizie

**Kluczowe metody:**
- `clickReveal()` - Pokazanie odpowiedzi
- `answerQuestion(knew)` - Odpowiedź na pytanie
- `clickPlayAudio()` - Odtworzenie audio
- `expectAnswerSectionVisible()` - Weryfikacja sekcji odpowiedzi

**Scenariusze testowe:** TC-QUIZ-005 do TC-QUIZ-008

---

#### QuizSummaryComponent
**Plik:** `pages/components/quiz-summary.component.ts`

**Odpowiedzialność:** Podsumowanie quizu

**Kluczowe metody:**
- `clickRepeat()` - Powtórzenie quizu
- `clickNewQuiz()` - Nowy quiz
- `clickBackToWords()` - Powrót do słówek
- `expectSummaryVisible()` - Weryfikacja podsumowania

**Scenariusze testowe:** TC-QUIZ-009 do TC-QUIZ-011

---

## 5. Przykłady użycia

### 5.1. Prosty test logowania

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage, WordsListPage, UserMenuComponent } from './pages';

test('User can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const wordsListPage = new WordsListPage(page);
  const userMenu = new UserMenuComponent(page);

  await loginPage.navigate();
  await loginPage.login('test@example.com', 'password123');

  await expect(page).toHaveURL('/');
  await userMenu.expectUserEmail('test@example.com');
});
```

### 5.2. Test dodawania słówka z tagami

```typescript
test('User can add word with tags', async ({ page }) => {
  const wordsListPage = new WordsListPage(page);
  const wordFormDialog = new WordFormDialogComponent(page);

  await wordsListPage.navigate();
  await wordsListPage.clickAddWord();

  await wordFormDialog.createWord('apple', 'jabłko', ['food', 'fruits']);
  
  await wordFormDialog.expectDialogHidden();
  await wordsListPage.expectTableVisible();
});
```

### 5.3. Test filtrowania i paginacji

```typescript
test('User can filter and paginate', async ({ page }) => {
  const wordsListPage = new WordsListPage(page);
  const tagFilter = new TagFilterComponent(page);
  const pagination = new WordsPaginationComponent(page);

  await wordsListPage.navigate();
  
  // Filter by tag
  await tagFilter.selectTag('business');
  await expect(page).toHaveURL(/tag=business/);

  // Navigate pagination
  await pagination.clickNext();
  await pagination.expectCurrentPage(2);
});
```

### 5.4. Test quizu

```typescript
test('User can complete quiz', async ({ page }) => {
  const quizPage = new QuizPage(page);
  const quizSetup = new QuizSetupComponent(page);
  const questionCard = new QuestionCardComponent(page);
  const quizSummary = new QuizSummaryComponent(page);

  await quizPage.navigate();
  
  // Setup quiz
  await quizSetup.setupQuiz('en-pl', 'all');

  // Answer first question
  await questionCard.waitForCard();
  await questionCard.answerQuestion(true);

  // ... answer remaining questions

  // Verify summary
  await quizSummary.expectSummaryVisible();
  await quizSummary.expectTitle('Gratulacje!');
});
```

## 6. Dobre praktyki

### 6.1. Używanie getByTestId

✅ **DOBRZE:**
```typescript
get submitButton() {
  return this.getByTestId('login-submit-button');
}
```

❌ **ŹLE:**
```typescript
get submitButton() {
  return this.page.locator('button[type="submit"]');
}
```

### 6.2. Grupowanie metod

Zawsze grupuj metody według typu:
1. Locators (gettery)
2. Actions (metody async)
3. Assertions (metody expect)

### 6.3. Nazewnictwo metod

- **Actions:** czasowniki (`click`, `fill`, `select`, `navigate`)
- **Assertions:** `expect` prefix (`expectVisible`, `expectError`)
- **Getters:** rzeczowniki (`submitButton`, `emailInput`)

### 6.4. Composition over Inheritance

Komponenty mogą być używane w różnych kontekstach:

```typescript
test('Test with multiple components', async ({ page }) => {
  const wordsListPage = new WordsListPage(page);
  const userMenu = new UserMenuComponent(page);
  const wordFormDialog = new WordFormDialogComponent(page);

  // Use components together
  await wordsListPage.navigate();
  await userMenu.expectUserEmail('test@example.com');
  await wordsListPage.clickAddWord();
  await wordFormDialog.createWord('test', 'test');
});
```

## 7. Mapowanie data-testid → POM

Każdy `data-testid` z dokumentu 66 ma odpowiadający getter w klasie POM:

| data-testid | Klasa POM | Getter |
|-------------|-----------|--------|
| `login-email-input` | LoginPage | `emailInput` |
| `word-form-dialog` | WordFormDialogComponent | `dialog` |
| `quiz-start-button` | QuizSetupComponent | `startButton` |
| `user-menu-trigger` | UserMenuComponent | `menuTrigger` |

## 8. Rozszerzanie POM

Aby dodać nową klasę POM:

1. Utwórz plik `{feature}.page.ts` lub `components/{feature}.component.ts`
2. Rozszerz `BasePage`
3. Dodaj locators, actions, assertions
4. Dodaj eksport do `pages/index.ts`
5. Dodaj dokumentację do tego pliku

## 9. Podsumowanie

✅ **Zaimplementowano:**
- 6 klas Page Object Model (strony)
- 9 klas Component Object Model (komponenty)
- Pełne pokrycie atrybutów data-testid z dokumentu 66
- Przykłady użycia w testach
- Dokumentacja

✅ **Korzyści:**
- Stabilne testy dzięki data-testid
- Łatwe utrzymanie kodu
- Reużywalność komponentów
- Czytelne testy
- Zgodność z best practices Playwright

---

**Autor:** AI Assistant  
**Data utworzenia:** 2025-11-02  
**Wersja:** 1.0


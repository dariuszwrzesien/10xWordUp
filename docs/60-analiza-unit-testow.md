Na podstawie wygenerowanej struktury zależności przeprowadz analizę które elementy tego projektu warto przetestować z wykorzystaniem unit testów i dlaczego?

# Analiza priorytetów testowania jednostkowego

Data utworzenia: 2025-11-01

## Spis treści

1. [Metodologia analizy](#metodologia-analizy)
2. [Komponenty wysokiego priorytetu](#komponenty-wysokiego-priorytetu)
3. [Komponenty średniego priorytetu](#komponenty-średniego-priorytetu)
4. [Komponenty niskiego priorytetu](#komponenty-niskiego-priorytetu)
5. [Co NIE testować unit testami](#co-nie-testować-unit-testami)
6. [Rekomendowane narzędzia](#rekomendowane-narzędzia)

## Metodologia analizy

Priorytety testowania zostały określone na podstawie następujących kryteriów:

### Wysokie ryzyko = Wysoki priorytet

- ✅ **Złożoność logiki biznesowej** - algorytmy, transformacje danych
- ✅ **Krytyczność funkcjonalności** - błędy wpływają na core funkcje
- ✅ **Izolacja od zależności** - łatwe do mockowania
- ✅ **Częstość zmian** - kod często modyfikowany
- ✅ **Podatność na błędy** - edge cases, walidacja, obliczenia

### Niskie ryzyko = Niski priorytet

- ❌ **Proste operacje CRUD** - delegacja do ORM/Supabase
- ❌ **Komponenty UI** - lepiej testować E2E
- ❌ **Konfiguracja** - testowane przez użycie
- ❌ **Kod generowany** - np. typy z bazy

---

## Komponenty wysokiego priorytetu

### 1. 🔴 **Helper Functions** (`src/lib/helpers/`)

#### `error.helper.ts` ⭐⭐⭐⭐⭐

**Dlaczego testować:**

- ✅ **Czysta logika** - brak side effects, łatwe do testowania
- ✅ **Krytyczna dla UX** - błędy w mapowaniu komunikatów wpływają na doświadczenie użytkownika
- ✅ **Wiele edge cases** - różne typy błędów Supabase
- ✅ **Bezpieczeństwo** - nie powinno ujawniać czy user istnieje
- ✅ **Łatwe do mock** - nie wymaga zewnętrznych zależności

**Scenariusze testowe:**

```typescript
describe("error.helper", () => {
  // Response creators
  it("should create error response with correct structure");
  it("should create validation error from ZodError");
  it("should create 400, 401, 404, 500 responses with correct status");
  it("should include details in dev mode, hide in production");

  // Success responses
  it("should create success response with correct status");
  it("should create 201 created response");
  it("should create 204 no content response");

  // Supabase error mapping
  it('should map "Invalid login credentials" to generic message');
  it('should map "Email not confirmed" to Polish message');
  it('should map "User already registered" to Polish message');
  it('should map "Password should be at least" to Polish message');
  it("should return generic message for unknown errors");
  it("should handle password reset specific errors");

  // Security
  it("should not reveal if user exists in error messages");
  it("should log errors to console for 500 responses");
});
```

**Priorytet:** 🔴 **Krytyczny**

---

#### `auth.helper.ts` ⭐⭐⭐⭐

**Dlaczego testować:**

- ✅ **Bezpieczeństwo** - krytyczna funkcja autoryzacji
- ✅ **Prosta logika** - łatwe do testowania
- ✅ **Używana w wielu miejscach** - wysokie ryzyko regresu

**Scenariusze testowe:**

```typescript
describe("auth.helper", () => {
  describe("requireAuth", () => {
    it("should return user data when user is authenticated");
    it("should throw AuthenticationError when user is null");
    it("should throw AuthenticationError with Polish message");
    it("should return correct user structure (id, email)");
  });

  describe("AuthenticationError", () => {
    it("should create error with default message");
    it("should create error with custom message");
    it("should have correct name property");
  });
});
```

**Priorytet:** 🔴 **Krytyczny**

---

### 2. 🔴 **Dictionary Service** (`src/lib/services/dictionary.service.ts`)

#### `DictionaryService` ⭐⭐⭐⭐⭐

**Dlaczego testować:**

- ✅ **Złożona transformacja danych** - API response → EnrichedWordData
- ✅ **Logika cache** - potencjalne wycieki pamięci, błędy cache
- ✅ **Handling timeout** - AbortController logic
- ✅ **Preferencje audio** - logika wyboru US vs inne
- ✅ **Edge cases** - brak danych, timeout, 404, błędy API

**Scenariusze testowe:**

```typescript
describe("DictionaryService", () => {
  describe("fetchWordData", () => {
    it("should fetch word data from API");
    it("should return cached data on subsequent calls");
    it("should return null for 404 responses");
    it("should return null on timeout after 3 seconds");
    it("should return null on API errors");
    it("should prefer US audio pronunciation");
    it("should fallback to first audio if no US available");
    it("should extract phonetic from phonetics array if not in root");
    it("should limit definitions to 2 per meaning");
    it("should handle empty API response");
    it("should handle missing phonetics");
    it("should handle missing audio");
    it("should handle missing examples");
  });

  describe("transformApiResponse", () => {
    it("should transform full API response correctly");
    it("should handle missing phonetic gracefully");
    it("should handle missing audio gracefully");
    it("should handle missing meanings gracefully");
    it("should prefer US audio over other pronunciations");
    it("should extract examples from definitions");
  });

  describe("cache", () => {
    it("should cache results by lowercase word");
    it("should return cached data without API call");
    it("should clear specific word from cache");
    it("should clear entire cache");
  });
});
```

**Priorytet:** 🔴 **Krytyczny**

---

### 3. 🟡 **Validation Schemas** (`src/lib/schemas/`)

#### `word.schema.ts` ⭐⭐⭐⭐

**Dlaczego testować:**

- ✅ **Walidacja danych wejściowych** - pierwsza linia obrony
- ✅ **Wiele reguł walidacji** - min/max, url, uuid
- ✅ **Transformacje** - string → number
- ✅ **Edge cases** - puste stringi, nieprawidłowe wartości

**Scenariusze testowe:**

```typescript
describe("word.schema", () => {
  describe("createWordSchema", () => {
    it("should validate correct word data");
    it("should require word field");
    it("should require translation field");
    it("should reject word longer than 255 chars");
    it("should reject translation longer than 255 chars");
    it("should accept optional tags array");
    it("should accept optional phonetic");
    it("should accept optional audio_url");
    it("should validate audio_url is valid URL");
    it("should reject invalid audio_url");
    it("should accept null values for optional fields");
    it("should accept examples with correct structure");
  });

  describe("updateWordSchema", () => {
    it("should allow partial updates");
    it("should validate all fields are optional");
    it("should reject empty strings if provided");
    it("should validate field constraints when provided");
  });

  describe("getWordsQuerySchema", () => {
    it("should set default page to 1");
    it("should set default limit to 20");
    it("should transform string to number");
    it("should reject page less than 1");
    it("should reject limit greater than 100");
    it("should accept valid sort values");
    it("should reject invalid sort values");
    it("should accept valid order values (asc/desc)");
    it('should set default sort to "created_at"');
    it('should set default order to "desc"');
  });

  describe("uuidParamSchema", () => {
    it("should validate correct UUID");
    it("should reject invalid UUID format");
    it("should provide clear error message");
  });
});
```

**Priorytet:** 🟡 **Wysoki**

---

### 4. 🟡 **React Hooks - useQuiz** (`src/hooks/useQuiz.ts`)

#### Helper Functions ⭐⭐⭐⭐⭐

**Dlaczego testować:**

- ✅ **Algorytm Fisher-Yates** - matematyczna poprawność
- ✅ **Transformacja danych** - WordDTO → QuizQuestionDTO
- ✅ **Złożona logika** - ekstraktowanie examples z nested object
- ✅ **Izolowane pure functions** - idealne do unit testów

**Scenariusze testowe:**

```typescript
describe("useQuiz helpers", () => {
  describe("shuffleArray", () => {
    it("should shuffle array elements");
    it("should not modify original array");
    it("should return array with same length");
    it("should contain all original elements");
    it("should handle empty array");
    it("should handle single element array");
    it("should produce different order (statistical test)");
  });

  describe("transformWordToQuestion", () => {
    it("should transform WordDTO to QuizQuestionDTO");
    it("should extract word_id from id");
    it("should extract word_en from word");
    it("should extract word_pl from translation");
    it("should extract audio from audio_url");
    it("should extract examples from definitions");
    it("should handle null examples");
    it("should handle missing examples.definitions");
    it("should filter out undefined examples");
    it("should handle examples with different structure");
  });
});
```

**Priorytet:** 🟡 **Wysoki**

---

### 5. 🟢 **Utility Functions** (`src/lib/utils.ts`)

#### `cn()` ⭐⭐⭐

**Dlaczego testować:**

- ✅ **Używana wszędzie** - we wszystkich komponentach
- ✅ **Prosta logika** - ale ważna dla stylowania
- ✅ **Edge cases** - undefined, null, conditional classes

**Scenariusze testowe:**

```typescript
describe("utils", () => {
  describe("cn", () => {
    it("should merge classes correctly");
    it("should handle conditional classes");
    it("should override Tailwind classes correctly");
    it("should handle undefined values");
    it("should handle null values");
    it("should handle empty strings");
    it("should handle arrays of classes");
  });
});
```

**Priorytet:** 🟢 **Średni**

---

## Komponenty średniego priorytetu

### 6. 🟢 **Service Classes - Business Logic**

#### `WordService` (częściowo) ⭐⭐⭐

**Dlaczego testować TYLKO helper methods:**

- ✅ **mapToWordDTO** - transformacja danych, czysta funkcja
- ✅ **Logika paginacji** - obliczenia matematyczne
- ❌ **CRUD operations** - lepiej testować integracją lub E2E

**Scenariusze testowe:**

```typescript
describe("WordService - Pure Methods", () => {
  describe("mapToWordDTO", () => {
    it("should map WordRow and tags to WordDTO");
    it("should handle empty tags array");
    it("should preserve all word fields");
    it("should map tags with id, name, created_at");
  });

  // Pagination logic (if extracted to pure function)
  describe("calculatePagination", () => {
    it("should calculate correct totalPages");
    it("should calculate correct from/to range");
    it("should handle edge case when total is 0");
    it("should handle edge case when total < limit");
  });
});
```

**Priorytet:** 🟢 **Średni**

---

#### `TagService` (częściowo) ⭐⭐

**Dlaczego testować TYLKO helper methods:**

- ✅ **mapToTagDTO** - transformacja danych
- ❌ **CRUD operations** - lepiej testować integracją

**Scenariusze testowe:**

```typescript
describe("TagService - Pure Methods", () => {
  describe("mapToTagDTO", () => {
    it("should map TagRow to TagDTO");
    it("should preserve all tag fields");
  });
});
```

**Priorytet:** 🟢 **Średni**

---

## Komponenty niskiego priorytetu

### 7. 🟡 **React Hooks - State Management**

#### `useWordsManagement` ⭐⭐

**Dlaczego niski priorytet:**

- ⚠️ **Wymaga mockowania TanStack Query** - skomplikowane
- ⚠️ **Dużo state management** - lepiej testować E2E
- ⚠️ **Integracja z API** - testowane w integration tests

**Uwaga:** Jeśli chcesz testować, użyj `@testing-library/react-hooks` + mock TanStack Query.

**Priorytet:** 🟡 **Niski** (lepiej E2E)

---

#### `useQuiz` - State Machine ⭐⭐

**Dlaczego niski priorytet:**

- ⚠️ **Złożony state machine** - trudne do testowania jednostkowo
- ⚠️ **Wymaga mockowania fetch** - integracja z API
- ⚠️ **Lepiej testować E2E** - cały przepływ quizu

**Priorytet:** 🟡 **Niski** (lepiej E2E, ale helpers MUSZĄ być testowane)

---

## Co NIE testować unit testami

### ❌ **Komponenty React UI**

**Dlaczego:**

- Lepiej testować E2E (Playwright)
- Trudne do izolacji (wiele zależności)
- Zmieniają się często (UI/UX iterations)
- Testing Library wymaga dużego setup

**Przykłady:**

- `WordsListView.tsx`
- `QuizView.tsx`
- `WordsTable.tsx`
- `UserMenu.tsx`
- Wszystkie komponenty Shadcn/ui

**Alternatywa:** E2E testy w Playwright

---

### ❌ **API Endpoints** (`src/pages/api/`)

**Dlaczego:**

- Wymagają pełnego kontekstu Astro
- Testują integrację z Supabase
- Lepiej testować integration tests lub E2E

**Przykłady:**

- `/api/auth/*`
- `/api/words/*`
- `/api/tags/*`

**Alternatywa:** Integration tests + E2E

---

### ❌ **Supabase Client** (`src/db/supabase.client.ts`)

**Dlaczego:**

- Konfiguracja, nie logika biznesowa
- Testowana przez użycie w integration tests

---

### ❌ **Middleware** (`src/middleware/index.ts`)

**Dlaczego:**

- Testowane przez E2E testy autoryzacji
- Wymaga pełnego kontekstu Astro

**Alternatywa:** E2E testy (login, protected routes)

---

### ❌ **Typy TypeScript** (`src/types/`)

**Dlaczego:**

- TypeScript compiler je weryfikuje
- Nie ma logiki do testowania

---

### ❌ **Astro Pages** (`src/pages/*.astro`)

**Dlaczego:**

- SSR components, testowane E2E
- Brak logiki biznesowej

---

### ❌ **Layouts** (`src/layouts/`)

**Dlaczego:**

- Proste wrapper components
- Testowane przez E2E

---

## Rekomendowane narzędzia

### Testing Stack

```json
{
  "unit": "Vitest",
  "ui-component": "@testing-library/react",
  "e2e": "Playwright",
  "coverage": "vitest coverage"
}
```

### Mockowanie

```typescript
// Vitest built-in mocking
import { vi } from "vitest";

// Mock fetch
global.fetch = vi.fn();

// Mock Supabase (dla integration tests)
vi.mock("@/db/supabase.client");

// Mock TanStack Query (dla React hooks)
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
```

---

## Podsumowanie - Plan działania

### Faza 1: Krytyczne (Start tutaj) 🔴

1. ✅ `error.helper.ts` - wszystkie funkcje
2. ✅ `auth.helper.ts` - requireAuth + AuthenticationError
3. ✅ `dictionary.service.ts` - fetchWordData + transformApiResponse + cache

**Szacowany czas:** 4-6 godzin  
**Pokrycie krytycznych ścieżek:** ~70%

---

### Faza 2: Wysoka wartość 🟡

4. ✅ `word.schema.ts` - wszystkie schemas
5. ✅ `tag.schema.ts` - wszystkie schemas
6. ✅ `auth.schema.ts` - wszystkie schemas
7. ✅ `useQuiz.ts` - helper functions (shuffleArray, transformWordToQuestion)

**Szacowany czas:** 3-4 godziny  
**Pokrycie:** +20%

---

### Faza 3: Nice to have 🟢

8. ✅ `utils.ts` - cn()
9. ✅ `WordService` - mapToWordDTO
10. ✅ `TagService` - mapToTagDTO

**Szacowany czas:** 2-3 godziny  
**Pokrycie:** +10%

---

### Całkowite pokrycie docelowe: ~80-90% krytycznej logiki biznesowej

**Uwagi końcowe:**

- ✅ Priorytetyzuj testy, które łapią **rzeczywiste bugi**
- ✅ Nie dąż do 100% coverage - testuj **zachowanie**, nie linijki kodu
- ✅ Integration tests + E2E są **równie ważne** jak unit tests
- ✅ Utrzymuj testy **szybkie** (< 1s per suite)
- ✅ Refaktoruj kod, aby był **łatwiejszy do testowania** (extract pure functions)

---

## Metryki sukcesu

```
✅ Wszystkie helper functions pokryte testami (100%)
✅ Wszystkie validation schemas pokryte testami (100%)
✅ Dictionary service pokryty testami (90%+)
✅ Pure functions w hooks pokryte testami (100%)
✅ Testy działają < 5 sekund
✅ CI/CD pipeline z automatycznym uruchamianiem testów
```

**Końcowy rezultat:**  
Solidna podstawa unit testów dla krytycznej logiki biznesowej, uzupełniona E2E testami dla user flows.


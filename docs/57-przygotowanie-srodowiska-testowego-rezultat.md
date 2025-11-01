# Przygotowanie środowiska testowego

## Podsumowanie implementacji

Środowisko testowe zostało w pełni skonfigurowane zgodnie z planem technicznym projektu. Zaimplementowano wsparcie dla testów jednostkowych (Vitest) oraz testów E2E (Playwright).

## Zainstalowane zależności

### Vitest (Testy jednostkowe)

- `vitest` - Framework testowy
- `@vitest/ui` - Interfejs webowy do przeglądania testów
- `@vitest/coverage-v8` - Generowanie raportów pokrycia kodu
- `@vitejs/plugin-react` - Plugin React dla Vite/Vitest
- `happy-dom` - Środowisko DOM do testów (szybsza alternatywa dla jsdom)
- `jsdom` - Alternatywne środowisko DOM
- `@testing-library/react` - Narzędzia do testowania komponentów React
- `@testing-library/jest-dom` - Dodatkowe matchery dla testów DOM
- `@testing-library/user-event` - Symulacja interakcji użytkownika

### Playwright (Testy E2E)

- `@playwright/test` - Framework testowy E2E
- Chromium browser (zainstalowany z zależnościami systemowymi)

## Utworzone pliki konfiguracyjne

### 1. `vitest.config.ts`

Konfiguracja Vitest z:

- Środowiskiem happy-dom dla testów komponentów React (szybsza i bardziej stabilna alternatywa dla jsdom)
- Wsparciem dla path alias `@/*`
- Setupem globalnym (`src/test/setup.ts`)
- Konfiguracją pokrycia kodu
- Wykluczeniem katalogu `e2e` z testów jednostkowych

### 2. `playwright.config.ts`

Konfiguracja Playwright z:

- Chromium jako jedyną przeglądarką (zgodnie z wytycznymi)
- Automatycznym uruchamianiem serwera deweloperskiego
- Trybem trace przy ponownych próbach
- Screenshot'ami przy błędach
- Równoległym uruchamianiem testów

### 3. `src/test/setup.ts`

Plik setupu dla Vitest zawierający:

- Import `@testing-library/jest-dom`
- Automatyczne czyszczenie po każdym teście
- Mocki dla `window.matchMedia`
- Mocki dla `IntersectionObserver` i `ResizeObserver`

## Struktura katalogów

```
/e2e
  /fixtures          # Fixtures dla testów E2E (np. auth.fixture.ts)
  /pages             # Page Object Models (przygotowane na przyszłość)
  *.spec.ts          # Pliki testów E2E
  README.md          # Dokumentacja struktury testów

/src/test
  /unit              # Testy jednostkowe
  /integration       # Testy integracyjne
  setup.ts           # Setup globalny dla Vitest
  helpers.ts         # Pomocnicze funkcje testowe
```

## Przykładowe pliki testów

### Testy E2E

1. **`e2e/login.spec.ts`** - Przykładowy test logowania z Page Object Model
2. **`e2e/words.spec.ts`** - Przykładowy test listy słów
3. **`e2e/fixtures/auth.fixture.ts`** - Fixture dla autentykacji

### Testy jednostkowe

1. **`src/test/unit/example.test.tsx`** - Przykładowe testy pokazujące:
   - Testowanie komponentów React
   - Użycie `vi.fn()` i `vi.spyOn()`
   - Interakcje użytkownika z `@testing-library/user-event`

## Skrypty NPM

Dodano następujące skrypty do `package.json`:

### Testy jednostkowe (Vitest)

- `npm test` - Uruchamia testy jednostkowe
- `npm run test:watch` - Uruchamia testy w trybie watch
- `npm run test:ui` - Otwiera interfejs webowy Vitest
- `npm run test:coverage` - Generuje raport pokrycia kodu

### Testy E2E (Playwright)

- `npm run test:e2e` - Uruchamia testy E2E
- `npm run test:e2e:ui` - Otwiera interfejs UI Playwright
- `npm run test:e2e:debug` - Uruchamia testy w trybie debug
- `npm run test:e2e:report` - Wyświetla raport z testów

## Aktualizacja .gitignore

Dodano wpisy ignorujące:

- `coverage/` - Raporty pokrycia kodu
- `test-results/` - Wyniki testów Playwright
- `playwright-report/` - Raporty HTML Playwright
- `playwright/.cache/` - Cache Playwright
- `.vitest/` - Cache Vitest

## Best Practices zaimplementowane

### Vitest

✅ Wykorzystanie obiektu `vi` do mocków  
✅ Konfiguracja setupu w osobnym pliku  
✅ Środowisko jsdom dla testów DOM  
✅ TypeScript w pełni wspierany  
✅ Struktura Arrange-Act-Assert w przykładach

### Playwright

✅ Inicjalizacja tylko z przeglądarką Chromium  
✅ Page Object Model w przykładach  
✅ Użycie locatorów dla odporności  
✅ Trace viewer przy błędach  
✅ Automatyczne uruchamianie serwera dev

## Następne kroki

1. **Napisać testy dla istniejących komponentów** - Wykorzystaj przykładowe testy jako szablon
2. **Skonfigurować CI/CD** - Dodaj uruchamianie testów w GitHub Actions
3. **Zwiększyć pokrycie kodu** - Stopniowo dodawać testy do krytycznych funkcji
4. **Utworzyć więcej Page Object Models** - Dla pozostałych stron aplikacji (quiz, rejestracja, etc.)
5. **Skonfigurować authentication state** - Dla Playwright, aby uniknąć logowania w każdym teście

## Użycie

### Uruchomienie testów jednostkowych

```bash
npm test                # Pojedyncze uruchomienie
npm run test:watch      # Tryb watch z hot reload
npm run test:ui         # Interfejs webowy
```

### Uruchomienie testów E2E

```bash
npm run test:e2e        # Headless mode
npm run test:e2e:ui     # Interaktywny UI mode
npm run test:e2e:debug  # Debug mode z Playwright Inspector
```

### Generowanie raportów

```bash
npm run test:coverage        # Pokrycie kodu (Vitest)
npm run test:e2e:report      # Raport HTML (Playwright)
```

## Dodatkowe zasoby

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Events](https://testing-library.com/docs/user-event/intro)

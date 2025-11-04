# Implementacja Pull Request Workflow

## Data: 2025-11-04

## Cel

Utworzenie scenariusza GitHub Actions `pull-request.yml` dla automatycznej weryfikacji Pull Requestów przed ich mergowaniem do brancha `master`.

## Struktura Workflow

### 1. Trigger

Workflow uruchamia się automatycznie przy każdym Pull Request do brancha `master`.

```yaml
on:
  pull_request:
    branches: [master]
```

### 2. Jobs

#### Job 1: `lint` (Lintowanie kodu)

**Zadania:**

- Checkout kodu
- Konfiguracja Node.js (wersja z `.nvmrc`: 22.14.0)
- Instalacja zależności (`npm ci`)
- Uruchomienie ESLint (`npm run lint`)
- Sprawdzenie formatowania kodu (`npm run format -- --check`)

**Akcje użyte:**

- `actions/checkout@v5` - najnowsza wersja
- `actions/setup-node@v6` - najnowsza wersja

#### Job 2: `unit-tests` (Testy jednostkowe)

**Zależności:** `needs: lint`

**Zadania:**

- Checkout kodu
- Konfiguracja Node.js
- Instalacja zależności
- Uruchomienie testów z pokryciem kodu (`npm run test:coverage`)
- Upload raportu pokrycia kodu jako artefakt

**Artefakty:**

- `unit-test-coverage` - raport pokrycia kodu (7 dni retencji)

**Akcje użyte:**

- `actions/checkout@v5`
- `actions/setup-node@v6`
- `actions/upload-artifact@v5`

#### Job 3: `e2e-tests` (Testy End-to-End)

**Zależności:** `needs: lint`

**Środowisko:** `test`

**Zadania:**

- Checkout kodu
- Konfiguracja Node.js
- Instalacja zależności
- Instalacja przeglądarek Playwright (tylko Chromium zgodnie z `playwright.config.ts`)
- Uruchomienie testów E2E z raportowaniem

**Zmienne środowiskowe (z sekretów):**

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_ACCESS_TOKEN`
- `E2E_USERNAME_ID`
- `E2E_USERNAME`
- `E2E_PASSWORD`

**Artefakty:**

- `playwright-report` - raport testów Playwright (7 dni retencji)

**Akcje użyte:**

- `actions/checkout@v5`
- `actions/setup-node@v6`
- `actions/upload-artifact@v5`

#### Job 4: `status-comment` (Komentarz ze statusem)

**Zależności:** `needs: [lint, unit-tests, e2e-tests]`

**Warunki uruchomienia:**

- `if: always()` - uruchamia się zawsze, nawet gdy poprzednie joby zakończą się niepowodzeniem

**Uprawnienia:**

- `pull-requests: write` - do dodawania komentarzy do PR

**Zadania:**

1. Pobranie artefaktów z testów (z obsługą błędów)
   - `unit-test-coverage`
   - `playwright-report`

2. Sprawdzenie statusu wszystkich poprzednich jobów
   - Odczytanie statusów: `lint`, `unit-tests`, `e2e-tests`
   - Określenie ogólnego statusu (✅ lub ❌)
   - Zapisanie wyników do `GITHUB_OUTPUT`

3. Dodanie komentarza do PR z tabelą statusów
   - Emoji dla każdego kroku (✅/❌/⏸️/⚠️)
   - Link do workflow run

**Akcje użyte:**

- `actions/download-artifact@v6` - najnowsza wersja
- `actions/github-script@v8` - najnowsza wersja

## Równoległe Wykonywanie

Jobs `unit-tests` i `e2e-tests` uruchamiają się **równolegle** po zakończeniu joba `lint`, co przyspiesza czas wykonania całego workflow.

```yaml
unit-tests:
  needs: lint

e2e-tests:
  needs: lint
```

## Coverage Reports

### Unit Tests Coverage

- Generowany przez: `vitest --coverage`
- Ścieżka: `coverage/`
- Zachowywany jako artefakt: `unit-test-coverage`

### E2E Tests Coverage

- Generowany automatycznie przez Playwright
- Ścieżka: `playwright-report/`
- Zachowywany jako artefakt: `playwright-report`

## Weryfikacja Akcji GitHub

Wszystkie użyte akcje zostały zweryfikowane pod kątem:

1. **Aktualności wersji** - użyto najnowszych major versions
2. **Statusu deprecation** - żadna akcja nie jest archived/deprecated

| Akcja                       | Wersja | Status    |
| --------------------------- | ------ | --------- |
| `actions/checkout`          | v5     | ✅ Active |
| `actions/setup-node`        | v6     | ✅ Active |
| `actions/upload-artifact`   | v5     | ✅ Active |
| `actions/download-artifact` | v6     | ✅ Active |
| `actions/github-script`     | v8     | ✅ Active |

## Best Practices Zastosowane

1. ✅ **Używanie `npm ci`** zamiast `npm install` dla deterministycznej instalacji zależności
2. ✅ **Cache dla npm** - `cache: "npm"` w `actions/setup-node`
3. ✅ **Używanie `.nvmrc`** - `node-version-file: ".nvmrc"` dla spójności wersji Node.js
4. ✅ **Zmienne środowiskowe na poziomie jobów** zamiast globalnie
5. ✅ **Sekrety dla wrażliwych danych** - wszystkie credentials z GitHub Secrets
6. ✅ **Tylko major versions dla akcji** - łatwiejsze utrzymanie i automatyczne minor updates
7. ✅ **`if: always()`** dla job `status-comment` - zawsze tworzy komentarz, nawet przy błędach
8. ✅ **Minimal permissions** - tylko `pull-requests: write` tam gdzie potrzebne
9. ✅ **Artefakty z odpowiednim retention** - 7 dni dla testów, wystarczająco dla debugowania
10. ✅ **Równoległe wykonywanie** - `unit-tests` i `e2e-tests` równolegle po `lint`

## Przykładowy Komentarz PR

```markdown
## ✅ Pull Request Checks

| Check      | Status     |
| ---------- | ---------- |
| Lint       | ✅ success |
| Unit Tests | ✅ success |
| E2E Tests  | ✅ success |

**Overall Status:** ✅ All checks passed

---

_Workflow run: [1234567890](https://github.com/user/repo/actions/runs/1234567890)_
```

## Plik Workflow

Plik został utworzony w lokalizacji:
`.github/workflows/pull-request.yml`

## Zgodność z Projektem

Workflow jest w pełni zgodny z:

- ✅ Tech stackiem projektu (Astro 5, React 19, TypeScript 5, Playwright, Vitest)
- ✅ Strukturą `package.json` i dostępnymi skryptami
- ✅ Konfiguracją `playwright.config.ts` (chromium only)
- ✅ Zasadami z `github-action.mdc`
- ✅ Branching strategy (master branch)

## Następne Kroki

1. Dodaj niezbędne sekrety w GitHub Repository Settings:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_ACCESS_TOKEN`
   - `E2E_USERNAME_ID`
   - `E2E_USERNAME`
   - `E2E_PASSWORD`

2. Utwórz environment "test" w GitHub Repository Settings

3. Przetestuj workflow tworząc Pull Request do mastera

## Uwagi Końcowe

Workflow został zaprojektowany zgodnie z best practices GitHub Actions i jest gotowy do użycia w środowisku CI/CD projektu 10xWordUp.

# Plan implementacji widoku: Lista Słówek

## 1. Przegląd

Widok "Lista Słówek" jest głównym interfejsem dla zalogowanego użytkownika, służącym do zarządzania jego kolekcją słówek. Umożliwia przeglądanie, dodawanie, edytowanie i usuwanie słówek, a także filtrowanie ich po tagach. Wszystkie operacje modyfikujące dane odbywają się w oknach modalnych, aby zapewnić płynne i nieprzerwane doświadczenie użytkownika.

## 2. Routing widoku

Widok będzie dostępny pod główną ścieżką aplikacji dla zalogowanych użytkowników:

- **Ścieżka**: `/`

## 3. Struktura komponentów

Hierarchia komponentów zostanie zaimplementowana w technologii React (`.tsx`) i osadzona na stronie Astro (`.astro`). Komponenty UI będą pochodzić z biblioteki `shadcn/ui`.

```
/src/pages/index.astro
└── /src/components/views/WordsListView.tsx (Komponent główny)
    ├── Header (zawiera przycisk "Dodaj słówko" i filtr)
    │   └── TagFilter.tsx (Komponent Select do filtrowania)
    ├── WordsTable.tsx (Tabela wyświetlająca słówka)
    │   ├── Skeleton (wyświetlany podczas ładowania)
    │   ├── WordsTableRow.tsx (Pojedynczy wiersz w tabeli)
    │   │   └── Przyciski akcji (Edytuj, Usuń, Odtwórz audio)
    │   └── EmptyState.tsx (wyświetlany, gdy brak słówek)
    ├── WordFormDialog.tsx (Modal z formularzem do dodawania/edycji)
    └── DeleteWordDialog.tsx (Modal potwierdzający usunięcie)
```

## 4. Szczegóły komponentów

### WordsListView.tsx

- **Opis**: Główny, interaktywny komponent React, który zarządza stanem całego widoku. Odpowiada za pobieranie danych (słówka, tagi), obsługę filtrowania oraz kontrolowanie widoczności okien modalnych.
- **Główne elementy**: Komponenty `Header`, `WordsTable`, `WordFormDialog`, `DeleteWordDialog`.
- **Obsługiwane interakcje**: Inicjalizacja pobierania danych, otwieranie modali w odpowiedzi na akcje użytkownika z komponentów podrzędnych.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `WordDTO[]`, `TagDTO[]`.
- **Propsy**: Brak.

### WordsTable.tsx

- **Opis**: Prezentuje listę słówek w tabeli. Wyświetla stan ładowania (`Skeleton`) lub komponent `EmptyState`, gdy lista jest pusta.
- **Główne elementy**: `<table>`, `<thead>`, `<tbody>`. Renderuje komponent `WordsTableRow` dla każdego słówka.
- **Obsługiwane interakcje**: Przekazuje zdarzenia `onEdit`, `onDelete`, `onPlayAudio` od `WordsTableRow` do `WordsListView`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `WordDTO`.
- **Propsy**:
  - `words: WordDTO[]`
  - `isLoading: boolean`
  - `onEdit: (word: WordDTO) => void`
  - `onDelete: (word: WordDTO) => void`
  - `onPlayAudio: (word: WordDTO) => void`

### TagFilter.tsx

- **Opis**: Komponent `Select` umożliwiający filtrowanie listy słówek na podstawie wybranego tagu.
- **Główne elementy**: Komponent `Select` z `shadcn/ui`.
- **Obsługiwane interakcje**: `onValueChange` - wywołuje funkcję zwrotną przy zmianie wybranego tagu.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `TagDTO`.
- **Propsy**:
  - `tags: TagDTO[]`
  - `selectedTagId: string | null`
  - `onTagChange: (tagId: string | null) => void`

### WordFormDialog.tsx

- **Opis**: Modal zawierający formularz do dodawania nowego lub edycji istniejącego słówka.
- **Główne elementy**: Komponent `Dialog` i `Form` z `shadcn/ui`, `Input` dla słówka i tłumaczenia, pole do wprowadzania tagów.
- **Obsługiwane interakcje**: Zapis formularza (`onSubmit`), zamknięcie modala.
- **Obsługiwana walidacja**:
  - `word` (słówko angielskie): pole wymagane.
  - `translation` (tłumaczenie): pole wymagane.
  - Walidacja będzie realizowana po stronie klienta z użyciem biblioteki `zod` i schematu `createWordSchema`.
- **Typy**: `WordDTO`, `TagDTO`, `CreateWordCommand`, `UpdateWordCommand`.
- **Propsy**:
  - `isOpen: boolean`
  - `wordToEdit?: WordDTO`
  - `allTags: TagDTO[]`
  - `onClose: () => void`
  - `onSave: (data: CreateWordCommand | UpdateWordCommand) => void`

### DeleteWordDialog.tsx

- **Opis**: Modal `AlertDialog` do potwierdzenia operacji usunięcia słówka.
- **Główne elementy**: Komponent `AlertDialog` z `shadcn/ui`.
- **Obsługiwane interakcje**: Potwierdzenie usunięcia, anulowanie operacji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `WordDTO`.
- **Propsy**:
  - `isOpen: boolean`
  - `word: WordDTO | null`
  - `onClose: () => void`
  - `onConfirm: () => void`

## 5. Typy

Implementacja będzie bazować na istniejących typach DTO zdefiniowanych w `src/types/dto.types.ts`. Nie ma potrzeby tworzenia nowych, niestandardowych typów ani modeli widoku (ViewModels).

- **`WordDTO`**: Główny obiekt do wyświetlania danych słówka.
  - `id: string`
  - `word: string`
  - `translation: string`
  - `phonetic: string | null`
  - `audio_url: string | null`
  - `examples: unknown` (JSON)
  - `created_at: string`
  - `tags?: TagDTO[]`
- **`TagDTO`**: Obiekt do wyświetlania tagów i zasilania filtra.
  - `id: string`
  - `name: string`
- **`CreateWordCommand`**: Typ danych wysyłanych do API przy tworzeniu słówka.
  - `word: string`
  - `translation: string`
  - `tags?: string[]`
- **`UpdateWordCommand`**: Typ danych wysyłanych do API przy aktualizacji słówka.
  - `word?: string`
  - `translation?: string`
  - `tags?: string[]`

## 6. Zarządzanie stanem

Zarządzanie stanem zostanie scentralizowane w niestandardowym hooku `useWordsManagement`, co zapewni separację logiki od prezentacji. Hook ten będzie wykorzystywał bibliotekę **TanStack Query (React Query)** do obsługi zapytań API, buforowania, odświeżania danych i zarządzania stanami ładowania/błędów.

**`useWordsManagement()` hook:**

- **Stan**:
  - `wordsQuery`: Zarządzany przez `useQuery`, przechowuje dane słówek, stan ładowania i błędy.
  - `tagsQuery`: Zarządzany przez `useQuery`, przechowuje listę wszystkich tagów.
  - `createWordMutation`, `updateWordMutation`, `deleteWordMutation`: Zarządzane przez `useMutation`, obsługują operacje zapisu i ich stany.
  - `filterTagId`: Stan lokalny (`useState`) do przechowywania ID wybranego tagu filtra.
  - Stan do zarządzania widocznością modali i wybranym słówkiem do edycji/usunięcia.
- **Logika**:
  - Funkcje do wywoływania mutacji (dodawanie, aktualizacja, usuwanie słówka).
  - W `onSuccess` każdej mutacji nastąpi unieważnienie zapytania o listę słówek (`wordsQuery`), co spowoduje automatyczne odświeżenie danych.
  - Funkcje do otwierania i zamykania modali.

## 7. Integracja API

Integracja z backendem będzie opierać się na wywołaniach do endpointów REST API.

- **`GET /api/words`**:
  - **Użycie**: Pobieranie listy słówek przy pierwszym renderowaniu oraz przy zmianie filtra tagów.
  - **Parametry**: `tag` (opcjonalny, ID tagu).
  - **Typ odpowiedzi**: `WordDTO[]`.

- **`GET /api/tags`**:
  - **Użycie**: Pobieranie listy wszystkich dostępnych tagów do zasilenia filtra.
  - **Typ odpowiedzi**: `TagDTO[]`.

- **`POST /api/words`**:
  - **Użycie**: Tworzenie nowego słówka.
  - **Typ żądania**: `CreateWordCommand`.
  - **Typ odpowiedzi**: `WordDTO`.

- **`PUT /api/words/{id}`**:
  - **Użycie**: Aktualizacja istniejącego słówka.
  - **Typ żądania**: `UpdateWordCommand`.
  - **Typ odpowiedzi**: `WordDTO`.

- **`DELETE /api/words/{id}`**:
  - **Użycie**: Usuwanie słówka.
  - **Typ odpowiedzi**: Potwierdzenie sukcesu.

## 8. Interakcje użytkownika

- **Dodawanie słówka**: Użytkownik klika przycisk "Dodaj słówko", co otwiera `WordFormDialog`. Po wypełnieniu i zapisaniu formularza, modal jest zamykany, wyświetlany jest toast o sukcesie, a tabela odświeża się, pokazując nowy wpis.
- **Edycja słówka**: Użytkownik klika ikonę "Edytuj" w wierszu tabeli. `WordFormDialog` otwiera się z danymi tego słówka. Po zapisaniu zmian, modal jest zamykany, toast informuje o sukcesie, a tabela aktualizuje wiersz.
- **Usuwanie słówka**: Użytkownik klika ikonę "Usuń". `DeleteWordDialog` prosi o potwierdzenie. Po potwierdzeniu, słówko jest usuwane, modal znika, pojawia się toast, a wpis jest usuwany z tabeli.
- **Filtrowanie**: Użytkownik wybiera tag z `TagFilter`. Tabela `WordsTable` jest natychmiast aktualizowana, aby wyświetlić tylko słówka z wybranym tagiem.
- **Odtwarzanie audio**: Użytkownik klika ikonę "Odtwórz audio". Jeśli `audio_url` jest dostępne, odtwarzany jest dźwięk. Przycisk jest nieaktywny, jeśli `audio_url` ma wartość `null`.

## 9. Warunki i walidacja

- **Formularz dodawania/edycji (`WordFormDialog`)**:
  - Pole "Słówko" (`word`) nie może być puste.
  - Pole "Tłumaczenie" (`translation`) nie może być puste.
  - Przycisk "Zapisz" jest nieaktywny, dopóki formularz nie przejdzie walidacji. Stan walidacji będzie zarządzany z użyciem `react-hook-form` w połączeniu z resolverem `zod`.

## 10. Obsługa błędów

- **Błąd pobierania danych (słówka, tagi)**: W miejscu tabeli zostanie wyświetlony komunikat o błędzie z opcją ponowienia próby.
- **Błąd zapisu (dodawanie, edycja, usuwanie)**: Modal, w którym wystąpił błąd, pozostanie otwarty. Pod przyciskiem zapisu lub w formie toastu pojawi się komunikat o błędzie (np. "Nie udało się zapisać słówka. Spróbuj ponownie.").
- **Brak słówek (pusty stan)**: Komponent `EmptyState` zostanie wyświetlony w `WordsTable`, zachęcając użytkownika do dodania pierwszego słówka.
- **Brak połączenia sieciowego**: Globalny system powiadomień (toast) poinformuje użytkownika o problemie z połączeniem.
- **Brak audio**: Przycisk odtwarzania audio będzie nieaktywny (`disabled`).

## 11. Kroki implementacji

1.  **Utworzenie struktury plików**: Stworzenie plików dla wszystkich zidentyfikowanych komponentów React (`.tsx`) w katalogu `src/components/views/` oraz strony głównej `src/pages/index.astro`.
2.  **Instalacja zależności**: Dodanie `react-hook-form`, `zod`, `@hookform/resolvers` i `lucide-react` (dla ikon) do projektu.
3.  **Implementacja hooka `useWordsManagement`**: Zdefiniowanie logiki pobierania danych i mutacji przy użyciu TanStack Query.
4.  **Budowa komponentów statycznych**: Implementacja wyglądu `WordsTable`, `WordsTableRow`, `TagFilter`, `WordFormDialog` i `DeleteWordDialog` z użyciem komponentów `shadcn/ui`.
5.  **Połączenie logiki ze stanem**: Zintegrowanie hooka `useWordsManagement` z komponentem `WordsListView` w celu przekazania danych i funkcji do komponentów podrzędnych.
6.  **Implementacja formularza**: Podłączenie `react-hook-form` i `zod` do `WordFormDialog` w celu obsługi walidacji i przesyłania danych.
7.  **Obsługa interakcji**: Implementacja logiki otwierania/zamykania modali i obsługi zdarzeń (kliknięcia przycisków, zmiana filtra).
8.  **Dopracowanie UX**: Dodanie stanów ładowania (`Skeleton`), obsługi błędów i pustego stanu (`EmptyState`).
9.  **Ostylowanie i testowanie**: Finalne poprawki w Tailwind CSS i manualne przetestowanie wszystkich historyjek użytkownika (User Stories).
10. **Zabezpieczenie widoku**: Upewnienie się, że strona `/` jest dostępna tylko dla zalogowanych użytkowników (może wymagać konfiguracji middleware Astro).

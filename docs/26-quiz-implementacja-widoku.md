# Plan implementacji widoku Quiz

## 1. Przegląd

Celem tego dokumentu jest szczegółowe zaplanowanie implementacji widoku `/quiz`. Widok ten będzie stanowił centrum interaktywnej nauki słówek dla użytkownika. Składa się z trzech głównych stanów: konfiguracji sesji (Quiz Setup), aktywnej sesji nauki (Quiz Session) oraz podsumowania wyników (Quiz Summary). Cała logika związana z przebiegiem quizu będzie zarządzana po stronie klienta, zapewniając płynne i dynamiczne doświadczenie użytkownika.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką `/quiz`. Dostęp do tej ścieżki powinien być chroniony i możliwy tylko dla zalogowanych użytkowników. Niezalogowany użytkownik próbujący uzyskać dostęp do `/quiz` zostanie przekierowany na stronę logowania.

## 3. Struktura komponentów

Implementacja zostanie oparta na architekturze komponentowej z wykorzystaniem React i Shadcn/ui. Główny komponent React będzie zarządzał stanem i renderował odpowiednie sub-komponenty w zależności od etapu quizu.

```
/src/pages/quiz.astro
└── /src/components/features/quiz/QuizView.tsx (React, client:load)
    ├── (stan === 'setup') => QuizSetup.tsx
    │   ├── RadioGroup (shadcn)
    │   ├── Select (shadcn)
    │   └── Button (shadcn)
    ├── (stan === 'session') => QuizSession.tsx
    │   ├── Progress (shadcn)
    │   └── QuestionCard.tsx
    │       ├── Card (shadcn)
    │       └── Button (shadcn)
    └── (stan === 'summary') => QuizSummary.tsx
        ├── Card (shadcn)
        └── Button (shadcn)
```

## 4. Szczegóły komponentów

### `QuizView.tsx`

- **Opis komponentu**: Główny komponent-kontener, który orkiestruje całym widokiem quizu. Odpowiada za zarządzanie stanem (który z trzech widoków jest aktywny), pobieranie danych (tagi, słówka) oraz przekazywanie ich do komponentów podrzędnych.
- **Główne elementy**: Logika warunkowego renderowania komponentów `QuizSetup`, `QuizSession`, lub `QuizSummary`.
- **Obsługiwane interakcje**: Przejścia pomiędzy stanami quizu.
- **Typy**: `QuizState`, `QuizSettings`, `QuizQuestionDTO`, `TagDTO`.
- **Propsy**: Brak.

### `QuizSetup.tsx`

- **Opis komponentu**: Formularz konfiguracji nowej sesji quizu. Umożliwia wybór kierunku tłumaczenia i zakresu słówek.
- **Główne elementy**: `Card`, `RadioGroup` (dla kierunku), `Select` (dla tagów), `Button` ("Rozpocznij Quiz").
- **Obsługiwane interakcje**: `onDirectionChange`, `onTagChange`, `onStartQuiz`.
- **Warunki walidacji**: Przycisk "Rozpocznij Quiz" jest nieaktywny do momentu wybrania kierunku i zakresu. Wyświetla komunikat, jeśli dla wybranego zakresu nie ma dostępnych słówek.
- **Typy**: `TagDTO`.
- **Propsy**:
  - `tags: TagDTO[]`: Lista tagów do wyświetlenia w selektorze.
  - `isCheckingWords: boolean`: Informuje, czy trwa sprawdzanie dostępności słówek.
  - `wordCount: number | null`: Liczba dostępnych słówek dla wybranego zakresu.
  - `onSubmit: (settings: QuizSettings) => void`: Funkcja wywoływana po kliknięciu "Rozpocznij Quiz".

### `QuizSession.tsx`

- **Opis komponentu**: Komponent zarządzający aktywną sesją quizu. Wyświetla pasek postępu oraz aktualną kartę z pytaniem.
- **Główne elementy**: `Progress` (wskaźnik postępu), `QuestionCard`.
- **Obsługiwane interakcje**: Przejście do następnego pytania po otrzymaniu odpowiedzi od `QuestionCard`.
- **Typy**: `QuizQuestionDTO[]`, `QuizSettings`.
- **Propsy**:
  - `questions: QuizQuestionDTO[]`: Lista wszystkich pytań w tej sesji.
  - `settings: QuizSettings`: Ustawienia quizu (potrzebne do `QuestionCard`).
  - `onQuizComplete: () => void`: Funkcja wywoływana po ukończeniu quizu.

### `QuestionCard.tsx`

- **Opis komponentu**: Wyświetla pojedyncze pytanie. Początkowo widoczne jest tylko słówko-pytanie. Po interakcji użytkownika odsłaniana jest pełna odpowiedź wraz z przyciskami samooceny.
- **Główne elementy**: `Card`, `Button` ("Pokaż odpowiedź"), warstwowo wyświetlane elementy pytania i odpowiedzi (tłumaczenie, fonetyka, audio, przykłady), `Button` ("Znam"), `Button` ("Nie znam").
- **Obsługiwane interakcje**: `onRevealAnswer`, `onMarkAsKnown`, `onMarkAsUnknown`.
- **Typy**: `QuizQuestionDTO`, `QuizDirection`.
- **Propsy**:
  - `question: QuizQuestionDTO`: Aktualne pytanie do wyświetlenia.
  - `direction: QuizDirection`: Kierunek tłumaczenia.
  - `onAnswer: (knew: boolean) => void`: Funkcja zwrotna informująca, czy użytkownik znał odpowiedź.

### `QuizSummary.tsx`

- **Opis komponentu**: Wyświetla podsumowanie po zakończonej sesji. Zawiera gratulacje oraz przyciski do wykonania następnych akcji.
- **Główne elementy**: `Card`, `Button` ("Powtórz Quiz"), `Button` ("Nowy Quiz"), `Button` ("Wróć do moich słówek").
- **Obsługiwane interakcje**: `onRepeatQuiz`, `onNewQuiz`, `onGoToWords`.
- **Propsy**:
  - `onRepeat: () => void`: Funkcja wywoływana po kliknięciu "Powtórz Quiz".
  - `onNew: () => void`: Funkcja wywoływana po kliknięciu "Nowy Quiz".

## 5. Typy

Do implementacji widoku potrzebne będą następujące, nowe typy i modele widoku:

```typescript
// Stan widoku, zarządza tym, co jest renderowane
export type QuizState = "setup" | "loading" | "session" | "summary" | "error";

// Kierunek tłumaczenia w quizie
export type QuizDirection = "en_pl" | "pl_en";

// Zakres słówek wybrany przez użytkownika
export interface QuizScope {
  type: "all" | "tag";
  tagId?: string; // Ustawione tylko gdy type === 'tag'
  tagName?: string; // Nazwa tagu do wyświetlenia
}

// Kompletne ustawienia sesji quizu
export interface QuizSettings {
  direction: QuizDirection;
  scope: QuizScope;
}
```

## 6. Zarządzanie stanem

Złożoność logiki quizu (zarządzanie stanem widoku, kolejką pytań, ustawieniami, błędami) uzasadnia stworzenie dedykowanego, customowego hooka `useQuiz`.

- **Hook `useQuiz` (`/src/lib/hooks/useQuiz.ts`)**:
  - **Cel**: Hermetyzacja całej logiki biznesowej i stanu związanego z quizem.
  - **Zarządzany stan**: `quizState`, `tags`, `questions`, `questionQueue`, `settings`, `error`.
  - **Udostępniane funkcje**:
    - `startQuiz(settings: QuizSettings)`: Inicjuje pobieranie słówek, tworzy kolejkę pytań i przełącza stan na 'session'.
    - `answerQuestion(questionId: string, knew: boolean)`: Aktualizuje kolejkę pytań. Jeśli `knew` jest `false`, pytanie wraca na koniec kolejki.
    - `repeatQuiz()`: Resetuje kolejkę pytań i ponownie uruchamia sesję z tymi samymi ustawieniami.
    - `resetQuiz()`: Wraca do stanu 'setup'.
- Komponent `QuizView.tsx` będzie korzystał z tego hooka, aby uzyskać wszystkie potrzebne dane i funkcje, które następnie przekaże jako propsy do swoich dzieci.

## 7. Integracja API

Integracja z backendem będzie opierać się na istniejących endpointach. Kluczowe jest zrozumienie, że **logika przygotowania quizu leży po stronie frontendu**.

1.  **Pobieranie tagów**:
    - **Endpoint**: `GET /api/tags`
    - **Akcja**: Wywoływane przy pierwszym załadowaniu `QuizView` w celu zapełnienia selektora tagów w `QuizSetup`.
    - **Typ odpowiedzi**: `TagDTO[]`

2.  **Pobieranie słówek do quizu**:
    - **Endpoint**: `GET /api/words`
    - **Akcja**: Wywoływane po zatwierdzeniu ustawień w `QuizSetup`. Frontend wywoła ten endpoint z odpowiednimi parametrami (`tag`, `limit`). Aby pobrać wszystkie słówka, zostanie użyty duży `limit` (np. 1000).
    - **Typ odpowiedzi**: `WordDTO[]`
    - **Frontend**: Po otrzymaniu `WordDTO[]`, frontend przekształci te dane na `QuizQuestionDTO[]`, przetasuje je (algorytmem Fisher-Yates) i rozpocznie sesję.

## 8. Interakcje użytkownika

- **Użytkownik wybiera opcje w `QuizSetup`**: Stan formularza jest aktualizowany lokalnie. Przycisk "Rozpocznij" staje się aktywny.
- **Użytkownik klika "Rozpocznij Quiz"**: Wywoływana jest funkcja `startQuiz`. Aplikacja przechodzi w stan `loading`, pobiera słówka, a następnie w stan `session`.
- **Użytkownik klika "Pokaż odpowiedź"**: Karta `QuestionCard` odsłania odpowiedź i przyciski oceny.
- **Użytkownik klika "Znam"**: Pytanie jest usuwane z kolejki. Wyświetlane jest następne pytanie lub, jeśli to było ostatnie, widok `QuizSummary`.
- **Użytkownik klika "Nie znam"**: Pytanie jest przenoszone na koniec kolejki. Wyświetlane jest następne pytanie.
- **Użytkownik w `QuizSummary` wybiera akcję**: Aplikacja przechodzi do odpowiedniego stanu (`session` dla "Powtórz", `setup` dla "Nowy Quiz") lub nawiguje do strony głównej.

## 9. Warunki i walidacja

- **Ochrona widoku**: Strona `/quiz.astro` sprawdzi po stronie serwera, czy użytkownik jest zalogowany. Jeśli nie, nastąpi przekierowanie.
- **Aktywacja startu quizu**: W `QuizSetup.tsx`, przycisk "Rozpocznij Quiz" będzie miał atrybut `disabled` powiązany ze stanem formularza (`disabled={!settings.direction || !settings.scope.type}`).
- **Sprawdzenie dostępności słówek**: Po wybraniu zakresu, a przed rozpoczęciem quizu, hook `useQuiz` wykona zapytanie do API, aby sprawdzić, czy istnieją słówka spełniające kryteria. Jeśli nie, w komponencie `QuizSetup` pojawi się odpowiedni komunikat, a start będzie niemożliwy.

## 10. Obsługa błędów

- **Błąd pobierania tagów (`GET /api/tags`)**: W `QuizSetup` zostanie wyświetlony komunikat o błędzie. Opcja wyboru tagu będzie niedostępna, ale użytkownik wciąż będzie mógł wybrać "Wszystkie słówka".
- **Błąd pobierania słówek (`GET /api/words`)**: Hook `useQuiz` przechwyci błąd, ustawi stan `error`. Komponent `QuizView` wyświetli stosowny komunikat (np. globalny Toast) i pozostanie w widoku `setup`.
- **Brak słówek dla danego zakresu**: Po pomyślnym zapytaniu API, które zwróci pustą tablicę, hook `useQuiz` ustawi specjalny stan, który `QuizView` wykorzysta do wyświetlenia komunikatu informacyjnego w `QuizSetup` (np. "Brak słówek dla tego tagu.").

## 11. Kroki implementacji

1.  **Stworzenie struktury plików**: Utworzenie strony `/src/pages/quiz.astro` oraz katalogu `/src/components/features/quiz` z plikami dla komponentów: `QuizView.tsx`, `QuizSetup.tsx`, `QuizSession.tsx`, `QuestionCard.tsx`, `QuizSummary.tsx`.
2.  **Zdefiniowanie typów**: Dodanie typów `QuizState`, `QuizDirection`, `QuizScope`, `QuizSettings` do pliku `/src/types/dto.types.ts` lub dedykowanego pliku typów dla quizu.
3.  **Implementacja `useQuiz` hook**: Stworzenie logiki w `/src/lib/hooks/useQuiz.ts`, włączając w to zarządzanie stanem, funkcje do obsługi API i logikę kolejki pytań.
4.  **Implementacja komponentu `QuizView.tsx`**: Podłączenie hooka `useQuiz` i zaimplementowanie logiki warunkowego renderowania poszczególnych widoków.
5.  **Implementacja `QuizSetup.tsx`**: Zbudowanie formularza z komponentów Shadcn/ui, obsługa stanu formularza i komunikacja z `QuizView` poprzez propsy.
6.  **Implementacja `QuizSession.tsx` i `QuestionCard.tsx`**: Stworzenie logiki wyświetlania pytań, odsłaniania odpowiedzi i obsługi samooceny.
7.  **Implementacja `QuizSummary.tsx`**: Stworzenie widoku podsumowania z przyciskami akcji.
8.  **Ochrona trasy**: Dodanie logiki weryfikacji sesji użytkownika w `quiz.astro`.
9.  **Stylowanie i animacje**: Dopracowanie wyglądu komponentów za pomocą Tailwind CSS oraz dodanie płynnych przejść (np. animacja odwracania karty).
10. **Testowanie manualne**: Przetestowanie wszystkich ścieżek użytkownika, w tym przypadków brzegowych i obsługi błędów.

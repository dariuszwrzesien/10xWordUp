# Architektura UI dla 10xWordUp

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji 10xWordUp została zaprojektowana w celu zapewnienia prostego, intuicyjnego i skoncentrowanego na zadaniach doświadczenia dla użytkowników. Opiera się na jasno zdefiniowanych widokach, które odpowiadają kluczowym funkcjonalnościom produktu: zarządzaniu słówkami i nauce w trybie quizu.

Struktura dzieli się na dwie główne części:

1.  **Widoki autoryzacji** (`/login`, `/register`): Minimalistyczne strony, które umożliwiają użytkownikom dostęp do aplikacji.
2.  **Główny interfejs aplikacji** (`/`, `/quiz`): Dostępny po zalogowaniu, zorganizowany wokół stałego układu (layout) z globalną nawigacją, co zapewnia spójność i łatwy dostęp do wszystkich funkcji.

Architektura kładzie nacisk na interaktywność i natychmiastową informację zwrotną, wykorzystując modale do operacji CRUD w celu utrzymania kontekstu użytkownika oraz powiadomienia typu "toast" do komunikacji o wynikach akcji.

## 2. Lista widoków

### Widok: Logowanie (Login)

- **Ścieżka widoku**: `/login`
- **Główny cel**: Umożliwienie powracającym użytkownikom bezpiecznego dostępu do ich konta.
- **Kluczowe informacje do wyświetlenia**:
  - Formularz z polami na adres e-mail i hasło.
  - Opcja "Zapamiętaj mnie" (checkbox).
  - Link do strony rejestracji.
  - Komunikaty o błędach walidacji lub niepoprawnych danych logowania.
- **Kluczowe komponenty widoku**: `Card`, `Form`, `Input`, `Checkbox`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Przycisk logowania powinien pokazywać stan ładowania. Po pomyślnym zalogowaniu, użytkownik jest przekierowywany do widoku "Moje Słówka" (`/`).
  - **Dostępność**: Pola formularza muszą mieć powiązane etykiety (`label`).
  - **Bezpieczeństwo**: Niezalogowany użytkownik próbujący uzyskać dostęp do chronionych stron jest automatycznie przekierowywany tutaj.

### Widok: Rejestracja (Register)

- **Ścieżka widoku**: `/register`
- **Główny cel**: Umożliwienie nowym użytkownikom stworzenia konta w aplikacji.
- **Kluczowe informacje do wyświetlenia**:
  - Formularz z polami na adres e-mail, hasło i potwierdzenie hasła.
  - Link do strony logowania.
  - Wymagania dotyczące hasła (np. minimalna długość 5 znaków).
  - Komunikaty o błędach (np. e-mail jest już zajęty, hasła się nie zgadzają).
- **Kluczowe komponenty widoku**: `Card`, `Form`, `Input`, `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Walidacja pól w czasie rzeczywistym. Po pomyślnej rejestracji, użytkownik jest automatycznie logowany i przekierowywany do widoku "Moje Słówka" (`/`).
  - **Dostępność**: Wszystkie pola formularza muszą mieć powiązane etykiety.
  - **Bezpieczeństwo**: Hasła muszą być przesyłane w bezpieczny sposób.

### Widok: Moje Słówka (My Words)

- **Ścieżka widoku**: `/`
- **Główny cel**: Wyświetlanie, filtrowanie i zarządzanie kolekcją słówek użytkownika.
- **Kluczowe informacje do wyświetlenia**:
  - Tabela ze słówkami (słówko, tłumaczenie, tagi).
  - Przyciski akcji dla każdego słówka (Edytuj, Usuń, Odtwórz audio).
  - Pole do filtrowania listy słówek po tagach.
  - Komunikat "pustego stanu", jeśli użytkownik nie dodał jeszcze żadnych słówek, z wezwaniem do działania.
- **Kluczowe komponenty widoku**: `Table`, `Select` (filtr tagów), `Button` (z ikonami), `Dialog` (dla modala dodawania/edycji), `AlertDialog` (dla potwierdzenia usunięcia), `Skeleton` (stan ładowania).
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Operacje dodawania i edycji odbywają się w modalu, aby nie opuszczać widoku listy. Lista odświeża się automatycznie po każdej zmianie.
  - **Dostępność**: Tabela musi być semantycznie poprawna. Przyciski-ikony muszą mieć tekstowe etykiety dla czytników ekranu.
  - **Bezpieczeństwo**: Widok jest chroniony i dostępny tylko dla zalogowanych użytkowników.

### Widok: Ustawienia Quizu (Quiz Setup)

- **Ścieżka widoku**: `/quiz`
- **Główny cel**: Umożliwienie użytkownikowi skonfigurowania i rozpoczęcia nowej sesji quizu.
- **Kluczowe informacje do wyświetlenia**:
  - Opcje wyboru kierunku tłumaczenia (np. EN → PL / PL → EN).
  - Opcje wyboru zakresu materiału (wszystkie słówka lub słówka z konkretnego tagu).
  - Przycisk do rozpoczęcia quizu.
- **Kluczowe komponenty widoku**: `Card`, `RadioGroup` (wybór kierunku), `Select` (wybór tagu), `Button`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Prosty i klarowny interfejs. Przycisk "Rozpocznij" staje się aktywny dopiero po dokonaniu wyboru opcji. W przypadku braku słówek w danym zakresie, wyświetlany jest odpowiedni komunikat.
  - **Dostępność**: Wszystkie elementy interaktywne muszą być dostępne z klawiatury i poprawnie opisane.
  - **Bezpieczeństwo**: Widok jest chroniony i dostępny tylko dla zalogowanych użytkowników.

### Stan: Sesja Quizu (Quiz Session)

- **Ścieżka widoku**: Stan zarządzany wewnątrz widoku `/quiz`
- **Główny cel**: Interaktywna nauka słówek w formie quizu.
- **Kluczowe informacje do wyświetlenia**:
  - Karta z pytaniem (słówko w jednym języku).
  - Po interakcji użytkownika, karta odsłania pełną odpowiedź (tłumaczenie, fonetyka, przykłady użycia, przycisk audio).
  - Przyciski samooceny ("Znam", "Nie znam").
  - Wskaźnik postępu sesji.
- **Kluczowe komponenty widoku**: `Card`, `Button`, `Progress`.
- **UX, dostępność i względy bezpieczeństwa**:
  - **UX**: Płynne animacje przejścia między pytaniem a odpowiedzią oraz między kolejnymi kartami. Słówka "Nie znam" wracają do puli pytań w tej samej sesji.
  - **Dostępność**: Treść na karcie musi być czytelna dla czytników ekranu na każdym etapie.
  - **Bezpieczeństwo**: Cała logika i stan sesji quizu są zarządzane po stronie klienta.

### Stan: Podsumowanie Quizu (Quiz Summary)

- **Ścieżka widoku**: Stan zarządzany wewnątrz widoku `/quiz`
- **Główny cel**: Przedstawienie wyników po zakończeniu sesji quizu i umożliwienie podjęcia kolejnych kroków.
- **Kluczowe informacje do wyświetlenia**:
  - Proste podsumowanie (np. "Gratulacje! Ukończyłeś quiz.").
  - Przyciski akcji: "Powtórz Quiz" (z tymi samymi ustawieniami), "Nowy Quiz" (powrót do ustawień), "Wróć do moich słówek" (powrót do `/`).
- **Kluczowe komponenty widoku**: `Card`, `Button`.

## 3. Mapa podróży użytkownika

1.  **Nowy użytkownik**:
    - Przechodzi na stronę główną -> jest przekierowany na `/login`.
    - Klika "Zarejestruj się" -> przechodzi na `/register`.
    - Wypełnia formularz rejestracji -> zostaje zalogowany i przekierowany na `/` (Moje Słówka).
    - Widzi pustą listę i zachętę do dodania słówka.

2.  **Główny przepływ (dodawanie i nauka)**:
    - Użytkownik jest na `/` (Moje Słówka).
    - Klika "Dodaj Słówko" -> otwiera się modal.
    - Wpisuje słówko, tłumaczenie, tagi i zatwierdza.
    - Modal się zamyka, lista się odświeża, pojawia się powiadomienie "toast".
    - Użytkownik nawiguje do `/quiz` (Ustawienia Quizu).
    - Wybiera kierunek i zakres, klika "Rozpocznij".
    - Przechodzi przez kolejne karty w **Sesji Quizu**, oceniając swoją wiedzę.
    - Po zakończeniu widzi **Podsumowanie Quizu**.
    - Klika "Wróć do moich słówek", wracając na `/`.

3.  **Wylogowanie**:
    - Z dowolnego widoku w aplikacji, użytkownik klika na swoje menu profilowe i wybiera "Wyloguj".
    - Sesja jest kończona, a użytkownik jest przekierowywany na `/login`.

## 4. Układ i struktura nawigacji

- **Układ Chroniony (Authenticated Layout)**:
  - Stosowany dla widoków `/` i `/quiz`.
  - Składa się ze stałego, globalnego nagłówka (Header) i obszaru na treść widoku.
  - **Nagłówek zawiera**:
    - Logo/nazwę aplikacji.
    - Linki nawigacyjne: "Moje Słówka" (do `/`) i "Quiz" (do `/quiz`).
    - Globalny przycisk "Dodaj Słówko".
    - Menu użytkownika z opcją wylogowania.

- **Układ Autoryzacji (Auth Layout)**:
  - Stosowany dla widoków `/login` i `/register`.
  - Jest to minimalistyczny layout, wyśrodkowany na ekranie, zawierający jedynie komponent `Card` z formularzem, aby maksymalnie skupić uwagę użytkownika na procesie logowania/rejestracji.

- **Przepływ nawigacyjny**: Nawigacja jest prosta i płaska. Użytkownik może swobodnie przełączać się między głównymi sekcjami ("Moje Słówka", "Quiz") za pomocą globalnego nagłówka.

## 5. Kluczowe komponenty

Poniżej znajduje się lista kluczowych, reużywalnych komponentów (głównie z biblioteki shadcn/ui), które będą stanowić podstawę interfejsu:

- **`Button`**: Standardowe przyciski do akcji, linków i w formularzach.
- **`Input`**: Pola tekstowe w formularzach.
- **`Form`**: Komponenty do budowy i walidacji formularzy.
- **`Table`**: Do wyświetlania listy słówek w sposób uporządkowany.
- **`Select`**: Rozwijane listy do filtrowania po tagach i wyboru opcji w ustawieniach quizu.
- **`Dialog`**: Modal wykorzystywany do dodawania i edycji słówek bez opuszczania bieżącego widoku.
- **`AlertDialog`**: Specjalny typ modala do uzyskiwania potwierdzenia od użytkownika przed wykonaniem destrukcyjnej akcji (np. usunięcie słówka).
- **`Card`**: Używany do grupowania treści w widokach autoryzacji oraz do prezentacji pytań i podsumowań w quizie.
- **`Toast`**: Globalne, dyskretne powiadomienia o wyniku operacji.
- **`Combobox`**: Pole tekstowe z autouzupełnianiem, używane do wprowadzania tagów.
- **`Skeleton`**: Elementy zastępcze wyświetlane podczas ładowania danych (np. tabeli słówek).

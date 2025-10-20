<conversation_summary>
<decisions>

1. Aplikacja w wersji MVP nie musi być responsywna (RWD); priorytetem jest wersja desktopowa.
2. Zaakceptowano wszystkie pozostałe rekomendacje dotyczące architektury UI, komponentów, zarządzania stanem i przepływów użytkownika.
   </decisions>
   <matched_recommendations>
3. Zastosowanie stałego paska nawigacyjnego z linkami do kluczowych widoków ("Moje Słówka", "Quiz") i przyciskiem "Dodaj Słówko".
4. Implementacja formularza dodawania/edycji słówek jako modal (okno dialogowe) przy użyciu `Dialog` z `shadcn/ui`.
5. Wykorzystanie `TanStack Query` do zarządzania stanem serwera oraz `React Context API` lub `Zustand` do globalnego stanu UI.
6. Użycie komponentu `Toast` do globalnych powiadomień i walidacji błędów bezpośrednio przy polach formularzy.
7. Zarządzanie logiką i stanem sesji quizu w całości po stronie klienta (frontend).
8. Implementacja pola tagów z autouzupełnianiem przy użyciu komponentu `Combobox`.
9. Ochrona widoków za pomocą middleware w Astro, który będzie weryfikował status autentykacji.
10. Projektowanie dedykowanych widoków dla "pustych stanów" (np. brak słówek) z wyraźnym wezwaniem do działania.
11. Użycie komponentu `Table` z `shadcn/ui` do wyświetlania listy słówek, z dedykowanymi przyciskami akcji w każdym wierszu.
12. Zastosowanie komponentu `Select` do filtrowania listy słówek po tagach.
13. Dwuetapowa prezentacja pytania i odpowiedzi w interfejsie quizu na komponencie `Card`.
14. Stworzenie dedykowanego widoku `/quiz` do konfiguracji sesji quizu.
15. Utworzenie osobnych stron `/login` i `/register` dla procesów autentykacji.
16. Zdefiniowanie podstawowego systemu wizualnego (kolory, typografia) w oparciu o `shadcn/ui` i globalne style CSS.
17. Komunikowanie stanu ładowania danych za pomocą komponentów `Skeleton` oraz wyłączania przycisków z dodaniem `spinnera`.
18. Stworzenie ekranu podsumowania po zakończeniu quizu z prostymi statystykami i opcjami nawigacji.
19. Zarządzanie odtwarzaniem audio za pomocą globalnej instancji `Audio`, aby uniknąć konfliktów.
    </matched_recommendations>
    <ui_architecture_planning_summary>

### Główne wymagania dotyczące architektury UI

Architektura UI dla MVP 10xWordUp ma na celu dostarczenie funkcjonalnego i intuicyjnego interfejsu dla użytkowników desktopowych. Główne założenia opierają się na wykorzystaniu biblioteki `shadcn/ui` w celu zapewnienia spójności i dostępności komponentów oraz `TanStack Query` do efektywnej synchronizacji z API Supabase.

### Kluczowe widoki, ekrany i przepływy użytkownika

- **Autentykacja**:
  - `/login`: Strona logowania z formularzem (e-mail, hasło, "Zapamiętaj mnie").
  - `/register`: Strona rejestracji z formularzem (e-mail, hasło, powtórz hasło).
  - _Przepływ_: Użytkownik niezalogowany jest przekierowywany na `/login`. Po pomyślnej autentykacji trafia do głównego widoku aplikacji.
- **Główna aplikacja**:
  - **Layout**: Stały nagłówek z nawigacją do "Moje Słówka", "Quiz", przyciskiem "Dodaj Słówko" i menu wylogowania.
  - **Moje Słówka (`/`)**: Główny widok po zalogowaniu. Zawiera tabelę ze słówkami (`Table`), pole do filtrowania po tagach (`Select`) oraz przyciski akcji (edycja, usuwanie, audio) dla każdego słówka. Dodawanie/edycja odbywa się przez modal (`Dialog`).
  - **Ustawienia Quizu (`/quiz`)**: Widok konfiguracji sesji quizu z opcjami wyboru kierunku (`Radio Group`) i zakresu materiału (`Select`).
  - **Sesja Quizu**: Interaktywny widok prezentujący pytania na kartach (`Card`) z logiką odsłaniania odpowiedzi i samooceny ("Znam" / "Nie znam").
  - **Podsumowanie Quizu**: Ekran wyświetlany po zakończeniu sesji, zawierający proste statystyki i przyciski do powtórzenia quizu lub powrotu do listy słówek.
- **Puste stany**: Aplikacja będzie wyświetlać przyjazne komunikaty i wezwania do działania (np. "Dodaj pierwsze słówko"), gdy listy (słówka, tagi) są puste.

### Strategia integracji z API i zarządzania stanem

- **Zarządzanie stanem serwera**: `TanStack Query` będzie odpowiedzialny za pobieranie, cache'owanie, synchronizację i mutacje danych (słówka, tagi) z API. Zapewni to automatyczne odświeżanie danych i obsługę stanów ładowania/błędu.
- **Zarządzanie stanem UI**: Proste, globalne stany UI (np. stan otwartego modala) będą zarządzane przez `React Context API` lub `Zustand`. Stan sesji quizu będzie w całości zarządzany po stronie klienta w stanie komponentu React.
- **Komunikacja z API**: Operacje CRUD będą inicjowane z komponentów UI. Stany ładowania będą wizualizowane przez `Skeletons` i dezaktywację przycisków. Informacje zwrotne (sukces, błąd) będą komunikowane globalnie przez komponent `Toast`.

### Kwestie dotyczące responsywności, dostępności i bezpieczeństwa

- **Responsywność**: Zgodnie z decyzją, aplikacja w wersji MVP nie będzie responsywna i jest projektowana z myślą o urządzeniach desktopowych.
- **Dostępność**: Wykorzystanie komponentów z biblioteki `shadcn/ui` zapewni wysoki standard dostępności (a11y) bez potrzeby dodatkowych implementacji.
- **Bezpieczeństwo**: Ochrona ścieżek aplikacji będzie realizowana przez middleware w Astro, który zweryfikuje sesję użytkownika z Supabase i przekieruje niezalogowanych użytkowników do strony logowania.

</ui_architecture_planning_summary>
<unresolved_issues>
Brak. Wszystkie przedstawione kwestie zostały omówione, a rekomendacje zaakceptowane. Architektura UI jest gotowa do dalszych prac implementacyjnych.
</unresolved_issues>
</conversation_summary>

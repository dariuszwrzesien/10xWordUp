<conversation_summary>
<decisions>
1. System uwierzytelniania użytkowników będzie oparty na adresie e-mail i haśle, z 30-dniową sesją ("pamiętaj mnie").
2. Aplikacja umożliwi dodawanie, edycję i usuwanie słówek (angielski-polski) wraz z opcjonalnymi tagami. Duplikaty słów będą dozwolone jako osobne wpisy.
3. Nastąpi integracja z `dictionaryapi.dev` w celu automatycznego pobierania wymowy, zapisu fonetycznego i przykładów użycia. Aplikacja będzie zawsze używać pierwszego wyniku zwróconego przez API.
4. Zostanie zaimplementowany tryb nauki (quiz), w którym użytkownik sam ocenia znajomość słówek. Stan sesji quizu nie będzie zapisywany.
5. Wersja MVP nie będzie zawierać paginacji listy słówek, procesu onboardingu dla nowych użytkowników ani trybu ciemnego.
6. Tagi będą przechowywane jako atrybut tekstowy przypisany do słówka, a nie jako osobna encja w bazie danych.
7. Komunikacja z użytkownikiem (np. potwierdzenie dodania słówka) będzie realizowana za pomocą prostych powiadomień typu "toast".
</decisions>

<matched_recommendations>
1. **Zdefiniuj problem i grupę docelową:** Rekomendacja została wdrożona w sekcji "Główny Problem i Użytkownik Docelowy", która jasno określa problem zapamiętywania słownictwa i grupę docelową jako osoby uczące się języka angielskiego.
2. **Opisz kluczowe funkcjonalności:** Zgodnie z zaleceniem, dokument szczegółowo opisuje zarządzanie słownictwem, system kont, integrację z zewnętrznym API oraz tryb nauki (quiz).
3. **Określ przepływy użytkownika:** Chociaż nie są sformalizowane jako "user stories", dokument w sekcjach "Zarządzanie Słownictwem" i "Tryb Nauki" opisuje kroki, jakie użytkownik podejmuje, aby dodać słówko czy odbyć sesję nauki.
4. **Ustal mierzalne kryteria sukcesu:** Rekomendacja została zrealizowana w sekcji "Kryteria Sukcesu", która definiuje konkretne, mierzalne cele dla MVP (np. % aktywnych użytkowników posiadających >10 słówek, % quizów ukończonych bez błędów technicznych).
5. **Rozważ przypadki brzegowe i obsługę błędów:** Zgodnie z zaleceniem, dokument omawia obsługę błędów API `dictionaryapi.dev`, brak słówek do quizu oraz jawnie wyklucza pewne funkcje z MVP (np. zapisywanie sesji quizu).
</matched_recommendations>

<prd_planning_summary>
### a. Główne wymagania funkcjonalne produktu

*   **System Kont:** Rejestracja i logowanie użytkownika za pomocą adresu e-mail i hasła. Sesja użytkownika jest utrzymywana przez 30 dni.
*   **Zarządzanie Słownictwem:** Użytkownicy mogą dodawać słówka (angielski, tłumaczenie, tagi) poprzez dedykowany formularz z walidacją wymaganych pól. Możliwa jest edycja i usuwanie (z potwierdzeniem) każdego wpisu. Zmiana słowa w języku angielskim powoduje ponowne pobranie danych z API.
*   **Lista Słówek:** Główny interfejs aplikacji to lista słówek użytkownika, sortowana chronologicznie od najnowszego. MVP nie obejmuje paginacji.
*   **Tagi:** Użytkownicy mogą przypisywać tagi do słówek, wpisując je w jednym polu (oddzielone przecinkiem lub spacją), z systemem autouzupełniania na podstawie istniejących tagów.
*   **Integracja z API `dictionaryapi.dev`:** Po dodaniu słówka aplikacja automatycznie pobiera wymowę, zapis fonetyczny i przykłady użycia. W przypadku błędu API, zapisywane są tylko dane od użytkownika, a funkcje audio są nieaktywne.
*   **Tryb Nauki (Quiz):** Interaktywny quiz do nauki słówek z możliwością wyboru kierunku (EN → PL, PL → EN) i zakresu materiału (wszystkie słówka lub z wybranego taga). Mechanika opiera się na samoocenie ("Znam" / "Nie znam"). Sesja quizu jest losowa i nie jest zapisywana po odświeżeniu strony.
*   **UI/UX:** Aplikacja posiada jeden dopracowany motyw graficzny (tryb jasny). Interfejs jest prosty, bez onboardingu, a do komunikacji z użytkownikiem wykorzystywane są powiadomienia typu "toast".

### b. Kluczowe historie użytkownika i ścieżki korzystania

*   **Rejestracja i logowanie:** Jako nowy użytkownik, chcę założyć konto używając e-maila i hasła, aby móc zapisywać swoje słówka. Jako powracający użytkownik, chcę się zalogować i pozostać zalogowanym, aby mieć szybki dostęp do mojej listy.
*   **Zarządzanie słownictwem:** Jako użytkownik, chcę dodać nowe angielskie słówko z tłumaczeniem na polski i tagami, aby rozbudowywać swoją bazę wiedzy. Po dodaniu słówka, chcę zobaczyć dla niego wymowę i przykłady użycia. Chcę mieć możliwość edycji i usuwania moich słówek.
*   **Nauka i utrwalanie:** Jako użytkownik, chcę uruchomić quiz, aby sprawdzić i utrwalić znajomość moich słówek. Chcę móc wybrać, czy odpytywać się ze wszystkich słówek, czy tylko z wybranej kategorii (taga).

### c. Ważne kryteria sukcesu i sposoby ich mierzenia

*   **Zaangażowanie użytkowników:** 90% aktywnych użytkowników w ciągu pierwszych 14 dni od rejestracji posiada więcej niż 10 słówek w swojej kolekcji.
*   **Stabilność techniczna:** 80% użytkowników kończy quiz bez błędów technicznych. Metryka będzie mierzona za pomocą zintegrowanego narzędzia do monitorowania błędów (np. Sentry).

</prd_planning_summary>

<unresolved_issues>
*   **Polityka bezpieczeństwa haseł:** Dokument nie precyzuje wymagań dotyczących haseł użytkowników (np. minimalna długość, złożoność).
*   **Ograniczenia API:** Nie zdefiniowano strategii postępowania w przypadku osiągnięcia limitów zapytań do `dictionaryapi.dev` ani sposobu zarządzania ewentualnymi kluczami API.
*   **Skalowalność tagów:** Obecne rozwiązanie (tagi jako tekst) jest wystarczające dla MVP, ale może wymagać przeprojektowania w przyszłości przy dużej liczbie tagów i potrzebie zaawansowanego zarządzania nimi.
</unresolved_issues>
</conversation_summary>
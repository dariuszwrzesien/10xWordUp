Podsumowanie Wymagań dla Aplikacji 10xWordUp (MVP)

1. Główny Problem i Użytkownik Docelowy
   Aplikacja rozwiązuje problem zapominania nowo poznanych angielskich słów i zwrotów oraz niepewności co do ich poprawnej wymowy. Jest skierowana do osób, które uczą się języka angielskiego poprzez czytanie i chcą w systematyczny sposób utrwalać zdobyte słownictwo.
2. System Kont Użytkowników
   Rejestracja i Logowanie: System oparty na adresie e-mail i haśle.
   Sesja: Użytkownik pozostaje zalogowany przez 30 dni ("pamiętaj mnie"), aby uniknąć konieczności logowania przy każdej wizycie.
3. Zarządzanie Słownictwem
   Dodawanie Słówek:
   Formularz zawiera pola: "Słowo (angielski)" (wymagane), "Tłumaczenie (polski)" (wymagane) i "Tagi" (opcjonalne).
   System pozwala na dodawanie tych samych słów wielokrotnie (duplikaty są traktowane jako osobne wpisy).
   Walidacja formularza sprawdza, czy wymagane pola nie są puste i usuwa skrajne spacje z wprowadzanych danych.
   Edycja i Usuwanie:
   Użytkownik może edytować każdy wpis. Zmiana słowa w języku angielskim powoduje ponowne odpytanie zewnętrznego API o dane.
   Usuwanie słówka wymaga dodatkowego potwierdzenia w oknie dialogowym.
   Lista Słówek:
   Główny widok po zalogowaniu to pusta lista słówek z przyciskiem "Dodaj".
   Lista jest sortowana chronologicznie od najnowszego do najstarszego wpisu.
   Każdy wiersz wyświetla słowo, tłumaczenie, tagi oraz ikony do edycji i usunięcia.
   MVP nie zawiera paginacji (stronicowania).
   Tagi:
   Użytkownik może dodać wiele tagów w jednym polu, oddzielając je przecinkiem lub spacją, z systemem autouzupełniania na podstawie już istniejących tagów.
   Tagi nie są osobnymi bytami w bazie; istnieją tylko jako atrybut słówka.
4. Integracja z API dictionaryapi.dev
   Pobieranie Danych: Po dodaniu nowego słówka, aplikacja w tle pobiera i zapisuje w bazie link do pliku audio z wymową, zapis fonetyczny i przykłady użycia.
   Obsługa Wyników: System zawsze wybiera i zapisuje pierwszy wynik zwrócony przez API.
   Obsługa Błędów:
   Jeśli API nie odpowie lub nie znajdzie słówka, aplikacja zapisuje tylko dane wprowadzone przez użytkownika.
   Na liście słówek i w quizie, ikona głośnika jest nieaktywna (wyszarzona) dla słów bez pobranej wymowy.
5. Tryb Nauki (Quiz)
   Rozpoczęcie Sesji:
   Przed startem użytkownik wybiera kierunek nauki (angielski → polski lub polski → angielski).
   Może rozpocząć quiz ze wszystkimi swoimi słówkami lub wybrać jeden konkretny tag do odpytywania.
   Mechanika Quizu:
   Interfejs pokazuje jedno słowo oraz dwa przyciski: zielony (✓ - "Znam") i czerwony (X - "Nie znam"). Użytkownik sam ocenia swoją wiedzę.
   Naciśnięcie zielonego przycisku usuwa słowo z puli pytań w bieżącej sesji.
   Naciśnięcie czerwonego przycisku sprawia, że słowo wraca do puli i pojawi się ponownie losowo po kilku innych pytaniach.
   Kolejność słówek w sesji jest losowa.
   Feedback:
   Po naciśnięciu dowolnego przycisku, na ekranie pojawia się pełna odpowiedź (tłumaczenie, przykłady, zapis fonetyczny) oraz przycisk "OK", który losuje kolejne pytanie.
   Zakończenie Sesji:
   Quiz kończy się, gdy użytkownik poprawnie odpowie na wszystkie pytania z wybranej puli.
   Po zakończeniu wyświetlany jest ekran gratulacyjny z opcjami "Zagraj jeszcze raz" i "Wróć do mojej listy słówek".
   Przypadki Brzegowe:
   Sesja quizu nie jest zapisywana – odświeżenie strony oznacza jej utratę.
   System poprawnie obsługuje quizy z małą liczbą słówek (nawet z jednym).
   Jeśli użytkownik nie ma słówek (lub słówek z danym tagiem), widzi odpowiedni komunikat.
6. Doświadczenie Użytkownika (UI/UX)
   Onboarding: Brak. Użytkownik po rejestracji widzi pustą listę słówek.
   Powiadomienia: Aplikacja używa prostych, znikających powiadomień "toast" do informowania o wynikach akcji (np. "Słówko dodane poprawnie").
   Wygląd: Aplikacja w wersji MVP będzie posiadać tylko jeden, dopracowany motyw wizualny (tryb jasny).
   Obsługa Znaków: Pełne wsparcie dla kodowania UTF-8 we wszystkich polach tekstowych.
7. Kryteria Sukcesu
   90% aktywnych użytkowników w ciągu pierwszych 14 dni od rejestracji posiada więcej niż 10 słówek w swojej kolekcji.
   80% użytkowników kończy quiz bez błędów technicznych (mierzone za pomocą zintegrowanego narzędzia do monitorowania błędów, np. Sentry).

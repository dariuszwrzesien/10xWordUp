# Aplikacja - 10xWordUp (MVP)

## Główny problem

Podczas czytania książek, artykułów lub korzystania z internetu często napotykam nieznane mi słowa lub zwroty w języku angielskim. Zazwyczaj w takim momencie sprawdzam ich znaczenie, jednak po krótkim czasie zapominam o nich — głównie dlatego, że nie mam systematycznego sposobu na ich utrwalenie.
Dodatkowym wyzwaniem jest wymowa: często wiem, co dane słowo znaczy, ale nie mam pewności, jak poprawnie je wymawiać.

Chciałbym stworzyć aplikację, która rozwiąże te problemy, pozwalając mi:

- zapisywać nowo poznane słowa i zwroty wraz z tłumaczeniem oraz przykładami użycia,
- pobierać wymowę (w formie fonetycznej i audio) oraz dodatkowe przykłady z zewnętrznego API https://dictionaryapi.dev/
- utrwalać słownictwo dzięki systemowi powtórek opartemu o fiszki.

Mechanizm fiszek działałby w oparciu o zasadę powtórek i błędów — jeśli użytkownik poda błędną odpowiedź, słowo zostaje ponownie włączone do puli i może pojawić się w kolejnych rundach. Użytkownik przed rozpoczęciem nauki wybiera kierunek: angielski → polski lub polski → angielski.

## Najmniejszy zestaw funkcjonalności

- System kont użytkowników z możliwością rejestracji aby umożliwić korzystanie z aplikacji przez wielu użytkowników.
- Zarządzanie słownictwem – dodawanie, edycja i usuwanie słówek w bazie danych.
- Dodawanie i usuwanie tagów do słówek, aby organizować słowa tematycznie lub na podstawie źródła z którego pochodzą (np. tytuł książki w którym się na nie natknąłem)
- Integracja z zewnętrzym API https://dictionaryapi.dev/ w celu pobrania poprawnej wymowy oraz dodatkowych przykładów.
- Tryb nauki (quiz),
  - użytkownik może uruchomić sesję nauki, w której aplikacja losuje słowa z bazy, jeśli wybrany zostanie dodatkowo tag, losowanie uwzględnia jedynie słowa oznaczone wskazanym tagiem.
  - możliwość wyboru kierunku nauki: angielski → polski lub polski → angielski,
  - w przypadku błędnej odpowiedzi słowo wraca do puli.

## Co NIE wchodzi w zakres MVP

- Zaawansowany algorytm powtórek np. oparty o Leitnera lub SM-2
- Tryb Offline - aplikacja wymaga połączenia z internetem.
- Integracje z zewnętrznymi narzędziami (np. rozszerzenia przeglądarki umożliwiające zapisywanie słów jednym kliknięciem).
- Powiadomienia i przypomnienia o konieczności powtórzenia słownictwa.
- Analiza postępów i statystyki nauki.
- Tryb wymowy – np. nagrywanie własnej wymowy i porównywanie z oryginałem.
- Import i eksport słówek (np. w formacie CSV lub JSON).

## Kryteria sukcesu

90% użytkowników posiada więcej niz 10 słówek w swojej kolekcji
80% użytkowników kończy quiz bez błędów technicznych

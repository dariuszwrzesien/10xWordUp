# Dokument wymagań produktu (PRD) - 10xWordUp

## 1. Przegląd produktu

10xWordUp to aplikacja webowa umożliwiająca użytkownikom zapisywanie i utrwalanie słownictwa angielskiego poprzez system fiszek, integrację z zewnętrznym API do pozyskiwania wymowy i przykładów użycia oraz tryb quizu oparty na samoocenie. Aplikacja wspiera rejestrację i logowanie użytkowników, zarządzanie słówkami z tagami oraz interaktywny quiz bez zapisu stanu sesji.

## 2. Problem użytkownika

Użytkownicy napotykają podczas czytania tekstów nieznane słowa lub zwroty, a po sprawdzeniu ich znaczenia szybko je zapominają z braku metody utrwalania. Dodatkowo często nie wiedzą, jak poprawnie wymawiać nowo poznane słowa. 10xWordUp adresuje te problemy przez centralne przechowywanie słówek z tłumaczeniami, wymową fonetyczną i audio oraz mechanizm powtórek oparty na quizie.

## 3. Wymagania funkcjonalne

- Rejestracja i logowanie użytkownika za pomocą adresu e-mail i hasła.
- Dodawanie nowych słówek (język angielski, tłumaczenie na polski) z opcjonalnymi tagami, walidacja pól.
- Automatyczne pobieranie wymowy fonetycznej, linku do pliku audio i przykładów użycia z API dictionaryapi.dev (pierwszy wynik).
- Edycja słówek, przy czym zmiana słowa angielskiego powoduje ponowne pobranie danych z API.
- Usuwanie słówek z potwierdzeniem.
- Wyświetlanie listy słówek posortowanej od najnowszych (z paginacji).
- System tagów jako pole tekstowe z autouzupełnianiem istniejących tagów.
- Tryb nauki (quiz) z wyborem kierunku (EN→PL lub PL→EN) i zakresu (wszystkie słówka lub z wybranego taga), mechanika samooceny ("Znam"/"Nie znam"), losowe kolejności, brak zapisu stanu sesji.
- Powiadomienia typu toast potwierdzające sukces lub informujące o błędach operacji.
- Obsługa błędów API (zatkanie lub błędne dane) – w razie niepowodzenia zapisywane są tylko dane wprowadzone ręcznie, a funkcje audio pozostają wyłączone.

## 4. Granice produktu

- Nie jest obsługiwany zaawansowany algorytm powtórek (np. SM-2).
- Brak trybu offline – aplikacja wymaga połączenia internetowego.
- Brak procesu onboardingu dla nowych użytkowników.
- Brak trybu ciemnego i tej opcji w ustawieniach.
- Brak importu i eksportu słówek.
- Brak nagrywania i porównywania wymowy użytkownika.
- Brak analizy postępów i statystyk.
- Brak integracji z zewnętrznymi rozszerzeniami przeglądarki.

## 5. Historyjki użytkowników

- ID: US-001  
  Tytuł: Rejestracja użytkownika  
  Opis: Jako nowy użytkownik, chcę założyć konto przy użyciu e-maila i hasła, aby zapisywać swoje słówka.  
  Kryteria akceptacji:
  - Rejestracja odbywa się na dedykowanej stronie.
  - Formularz rejestracji zawiera pola e-mail i hasło oraz pole w którym należy ponownie wpisać hasło w celu weryfikacji.
  - Pola są walidowane: e-mail w poprawnym formacie, hasło min. 8 znaków.
  - Po poprawnym wypełnieniu i przesłaniu tworzone jest konto i użytkownik jest przekierowany na listę słówek.
  - W przypadku użycia już zarejestrowanego e-maila wyświetlany jest komunikat o błędzie.

- ID: US-002  
  Tytuł: Logowanie użytkownika  
  Opis: Jako zarejestrowany użytkownik, chcę zalogować się za pomocą e-maila i hasła, aby uzyskać dostęp do mojego konta.  
  Kryteria akceptacji:
  - Logowanie odbywa się na dedykowanej stronie
  - Formularz logowania zawiera pola e-mail, hasło i opcję "pamiętaj mnie".
  - Poprawne dane logowania powodują utworzenie sesji trwającej do 30 dni.
  - Niepoprawne dane wyświetlają komunikat o błędnych poświadczeniach.
  - Po zalogowaniu użytkownik jest przekierowany na listę słówek.
  - Użytkownik NIE MOŻE korzystać z żadnych funkcji aplikacji oprócz logowania i rejestracji.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Reset hasła powinien być możliwy.

- ID: US-003  
  Tytuł: Wylogowanie użytkownika  
  Opis: Jako zalogowany użytkownik, chcę wylogować się, aby zakończyć sesję.  
  Kryteria akceptacji:
  - Przyciski lub opcja wylogowania widoczna na każdym widoku po zalogowaniu.
  - Po wylogowaniu sesja zostaje zakończona i użytkownik przekierowywany jest do ekranu logowania.

- ID: US-004  
  Tytuł: Dodawanie słówka  
  Opis: Jako zalogowany użytkownik, chcę dodać nowe słówko z tłumaczeniem i tagami, aby budować moją bazę słówek.  
  Kryteria akceptacji:
  - Formularz dodawania zawiera pola słówko angielskie, tłumaczenie i tagi.
  - Pola słówko i tłumaczenie są wymagane.
  - Po zatwierdzeniu następuje wywołanie API dictionaryapi.dev, pobranie wymowy fonetycznej, linku do audio i przykładów.
  - Nowe słówko wyświetla się na liście z pobranymi danymi.
  - Pokazywane są powiadomienia toast o powodzeniu lub błędzie.

- ID: US-005  
  Tytuł: Edycja słówka  
  Opis: Jako użytkownik, chcę edytować istniejące słówko, aby poprawić lub uzupełnić dane.  
  Kryteria akceptacji:
  - Formularz edycji jest wstępnie wypełniony danymi istniejącego słówka.
  - Zmiana pola angielskiego powoduje ponowne pobranie danych z API.
  - Po zapisaniu zmienione dane są widoczne na liście.
  - Wyświetlane jest powiadomienie toast potwierdzające zapis.

- ID: US-006  
  Tytuł: Usuwanie słówka  
  Opis: Jako użytkownik, chcę usunąć słówko, aby zarządzać nieaktualnymi wpisami.  
  Kryteria akceptacji:
  - Przy każdym słówku dostępna jest opcja usunięcia.
  - Po wybraniu opcji wyświetla się modal z potwierdzeniem.
  - Po potwierdzeniu słówko zostaje usunięte, a na liście nie jest już widoczne.
  - Pojawia się powiadomienie toast potwierdzające usunięcie.

- ID: US-007  
  Tytuł: Przegląd listy słówek  
  Opis: Jako użytkownik, chcę zobaczyć listę moich słówek posortowaną od najnowszych, aby szybko odnaleźć ostatnio dodane.  
  Kryteria akceptacji:
  - Lista słówek wyświetla się chronologicznie od najnowszych.
  - Jeśli nie ma słówek, wyświetlany jest komunikat zachęcający do dodania.

- ID: US-008  
  Tytuł: Wybór zakresu do quizu  
  Opis: Jako użytkownik, chcę wybrać zakres materiału do quizu (wszystkie słówka lub wybrany tag), aby skupić się na konkretnych tematach.  
  Kryteria akceptacji:
  - Na ekranie quizu dostępna jest lista tagów oraz opcja "wszystkie słówka".
  - Wybranie wybranego taga ogranicza pulę pytań do słówek z tym tagiem.

- ID: US-009  
  Tytuł: Wybór kierunku quizu  
  Opis: Jako użytkownik, chcę wybrać kierunek nauki (EN→PL lub PL→EN), aby ćwiczyć oba tryby.  
  Kryteria akceptacji:
  - Na ekranie quizu dostępne są opcje wyboru kierunku.
  - Wybrana opcja wpływa na sposób wyświetlania pytania i oczekiwanej odpowiedzi.

- ID: US-010  
  Tytuł: Rozpoczęcie quizu  
  Opis: Jako użytkownik, chcę rozpocząć sesję quizu, aby utrwalić słownictwo.  
  Kryteria akceptacji:
  - Po wybraniu zakresu i kierunku można rozpocząć quiz.
  - Pojawia się pierwsze pytanie; quiz trwa do wyczerpania puli słówek.

- ID: US-011  
  Tytuł: Odpowiadanie w quizie  
  Opis: Jako użytkownik, chcę zaznaczyć, czy znam słówko, aby mechanika powtórek działała poprawnie.  
  Kryteria akceptacji:
  - Użytkownik może wybrać opcję "Znam" lub "Nie znam".
  - W przypadku "Nie znam" słówko wraca do puli i może pojawić się ponownie.
  - Quiz kończy się po przejściu wszystkich słówek.

- ID: US-012  
  Tytuł: Obsługa błędów API  
  Opis: Jako użytkownik, chcę, aby aplikacja obsługiwała błędy podczas pobierania danych z API, aby możliwość dodania słówka była możliwa nawet przy awarii zewnętrznego serwisu.  
  Kryteria akceptacji:
  - Jeśli API zwraca błąd lub przekroczenie limitu, dane użytkownika są zapisywane bez uzupełnień fonetycznych i linku do audio.
  - Wyświetlane jest powiadomienie toast informujące o niepełnych danych.

- ID: US-013  
  Tytuł: Powiadomienia toast  
  Opis: Jako użytkownik, chcę otrzymywać powiadomienia o sukcesach i błędach, aby wiedzieć, czy operacja się powiodła.  
  Kryteria akceptacji:
  - Po każdej operacji CRUD i quizie wyświetlane jest krótkie powiadomienie.
  - Powiadomienia znikają automatycznie po kilku sekundach.

## 6. Metryki sukcesu

- Zaangażowanie użytkowników: 90% aktywnych użytkowników w ciągu pierwszych 14 dni od rejestracji posiada więcej niż 10 słówek w swojej kolekcji.
- Stabilność techniczna: 80% użytkowników kończy sesję quizu bez błędów technicznych, mierzona przez narzędzie do monitorowania błędów.

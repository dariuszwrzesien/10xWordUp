# Scenariusze Testowania E2E dla Aplikacji 10xWordUp

Data utworzenia: 2025-11-02

## 1. Wprowadzenie i Analiza

### 1.1. Cel dokumentu

Dokument ten zawiera dogłębną analizę aplikacji 10xWordUp pod kątem testowania End-to-End (E2E) oraz szczegółowe scenariusze testowe dla wszystkich kluczowych funkcjonalności. Analiza opiera się na:
- Strukturze aplikacji opisanej w `59-struktura-aplikacji-ASCII.md`
- Planie testów z dokumentu `54-test-plan.md`
- Architekturze warstw i przepływie danych w aplikacji

### 1.2. Kluczowe ścieżki użytkownika do przetestowania

Na podstawie analizy architektury aplikacji zidentyfikowano następujące kluczowe ścieżki użytkownika:

1. **Ścieżka Rejestracji i Pierwszego Logowania**
   - Middleware → AuthLayout → RegisterForm → API Auth → Supabase Auth → Redirect do Dashboard

2. **Ścieżka Zarządzania Słówkami**
   - Middleware → Layout → WordsListView → useWordsManagement → API Words → word.service → Supabase DB

3. **Ścieżka Quizu**
   - Middleware → Layout → QuizView → useQuiz → API Words → word.service → Supabase DB

4. **Ścieżka Resetowania Hasła**
   - AuthLayout → ForgotPasswordForm → API Auth → Supabase Auth → Email → ResetPasswordForm

### 1.3. Warstwy testowane w E2E

Testy E2E weryfikują poprawność działania całego stosu technologicznego:

```
Browser/Playwright
      ↓
UI Components (React)
      ↓
Custom Hooks (TanStack Query)
      ↓
API Endpoints (Astro)
      ↓
Service Layer
      ↓
Supabase Client
      ↓
PostgreSQL + RLS
```

### 1.4. Założenia dla testów E2E

- Testy wykonywane są na dedykowanej instancji bazy danych Supabase
- Przed każdym testem baza jest czyszczona i seedowana testowymi danymi
- Testy są niezależne od siebie i mogą być uruchamiane równolegle
- Używamy Playwright jako głównego narzędzia do testów E2E
- Testy pokrywają zarówno happy paths jak i edge cases
- Responsywność (RWD) jest testowana na różnych viewport'ach

---

## 2. Scenariusze Testowe - Autentykacja

### 2.1. Rejestracja Użytkownika

#### TC-AUTH-001: Pomyślna rejestracja nowego użytkownika

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Auth → Supabase Auth → Database

**Kroki:**
1. Użytkownik otwiera stronę `/register`
2. Użytkownik wpisuje unikalny email (np. `newuser@test.com`)
3. Użytkownik wpisuje hasło spełniające wymagania (min. 8 znaków)
4. Użytkownik potwierdza hasło (identyczne jak hasło)
5. Użytkownik klika przycisk "Zarejestruj się"
6. System tworzy konto w Supabase Auth
7. System tworzy rekord w tabeli `users`
8. System przekierowuje użytkownika na stronę główną `/`

**Oczekiwany rezultat:**
- Użytkownik widzi toast z sukcesem rejestracji
- Użytkownik jest zalogowany automatycznie
- Użytkownik znajduje się na stronie głównej
- W bazie danych istnieje nowy użytkownik

**Weryfikacja:**
- URL: `http://localhost:4321/`
- Widoczny UserMenu w headerze
- Brak błędów w konsoli

---

#### TC-AUTH-002: Rejestracja z istniejącym adresem e-mail

**Priorytet:** Wysoki  
**Warstwy:** UI → API Auth → Supabase Auth

**Kroki:**
1. Użytkownik otwiera stronę `/register`
2. Użytkownik wpisuje email już zarejestrowany w systemie
3. Użytkownik wpisuje hasło
4. Użytkownik potwierdza hasło
5. Użytkownik klika przycisk "Zarejestruj się"

**Oczekiwany rezultat:**
- Formularz wyświetla błąd walidacji
- Toast notification: "Ten adres e-mail jest już zarejestrowany"
- Użytkownik pozostaje na stronie `/register`
- Nie tworzy się nowy rekord w bazie danych

**Weryfikacja:**
- Widoczny komunikat błędu pod polem email
- Przycisk submit jest nadal aktywny
- URL: `http://localhost:4321/register`

---

#### TC-AUTH-003: Rejestracja z niepoprawnym hasłem (za krótkie)

**Priorytet:** Średni  
**Warstwy:** UI → Zod Validation

**Kroki:**
1. Użytkownik otwiera stronę `/register`
2. Użytkownik wpisuje poprawny email
3. Użytkownik wpisuje hasło krótsze niż 8 znaków (np. `pass123`)
4. Użytkownik próbuje przejść do następnego pola

**Oczekiwany rezultat:**
- Walidacja Zod blokuje formularz
- Pod polem hasła wyświetla się błąd: "Hasło musi mieć minimum 8 znaków"
- Przycisk submit jest nieaktywny lub blokuje wysłanie

**Weryfikacja:**
- Widoczny komunikat błędu
- Formularz nie zostaje wysłany

---

#### TC-AUTH-004: Rejestracja z niezgodnymi hasłami

**Priorytet:** Średni  
**Warstwy:** UI → Zod Validation

**Kroki:**
1. Użytkownik otwiera stronę `/register`
2. Użytkownik wpisuje poprawny email
3. Użytkownik wpisuje hasło: `password123`
4. Użytkownik wpisuje potwierdzenie hasła: `password456`
5. Użytkownik klika przycisk "Zarejestruj się"

**Oczekiwany rezultat:**
- Walidacja Zod wykrywa niezgodność
- Komunikat błędu: "Hasła muszą być identyczne"
- Formularz nie zostaje wysłany

**Weryfikacja:**
- Widoczny komunikat błędu pod polem potwierdzenia hasła
- Użytkownik pozostaje na stronie `/register`

---

### 2.2. Logowanie Użytkownika

#### TC-AUTH-005: Pomyślne logowanie z poprawnymi danymi

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Auth → Supabase Auth → Middleware

**Kroki:**
1. Użytkownik otwiera stronę `/login`
2. Użytkownik wpisuje zarejestrowany email
3. Użytkownik wpisuje poprawne hasło
4. Użytkownik klika przycisk "Zaloguj się"
5. System weryfikuje dane w Supabase Auth
6. System tworzy sesję (JWT token)
7. Middleware przekierowuje na stronę główną

**Oczekiwany rezultat:**
- Toast notification: "Zalogowano pomyślnie"
- Użytkownik jest przekierowany na `/`
- W headerze widoczny UserMenu z emailem użytkownika
- Session token zapisany w cookie/localStorage

**Weryfikacja:**
- URL: `http://localhost:4321/`
- Widoczny UserMenu
- Możliwość dostępu do chronionych zasobów

---

#### TC-AUTH-006: Logowanie z niepoprawnym hasłem

**Priorytet:** Wysoki  
**Warstwy:** UI → API Auth → Supabase Auth

**Kroki:**
1. Użytkownik otwiera stronę `/login`
2. Użytkownik wpisuje zarejestrowany email
3. Użytkownik wpisuje niepoprawne hasło
4. Użytkownik klika przycisk "Zaloguj się"

**Oczekiwany rezultat:**
- Toast notification: "Niepoprawny email lub hasło"
- Użytkownik pozostaje na stronie `/login`
- Formularz jest czysty lub pola pozostają wypełnione (zależnie od UX decision)
- Nie tworzy się sesja

**Weryfikacja:**
- Widoczny komunikat błędu
- URL: `http://localhost:4321/login`
- Brak session token

---

#### TC-AUTH-007: Logowanie z niezarejestrowanym adresem e-mail

**Priorytet:** Wysoki  
**Warstwy:** UI → API Auth → Supabase Auth

**Kroki:**
1. Użytkownik otwiera stronę `/login`
2. Użytkownik wpisuje email nieistniejący w systemie
3. Użytkownik wpisuje dowolne hasło
4. Użytkownik klika przycisk "Zaloguj się"

**Oczekiwany rezultat:**
- Toast notification: "Niepoprawny email lub hasło"
- Użytkownik pozostaje na stronie `/login`
- Nie tworzy się sesja

**Weryfikacja:**
- Widoczny komunikat błędu
- Brak przekierowania

---

### 2.3. Wylogowanie

#### TC-AUTH-008: Pomyślne wylogowanie użytkownika

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Auth → Supabase Auth → Middleware

**Kroki:**
1. Użytkownik jest zalogowany i znajduje się na `/`
2. Użytkownik klika na UserMenu w headerze
3. Z rozwijanego menu użytkownik wybiera "Wyloguj"
4. System wywołuje endpoint `/api/auth/logout`
5. System usuwa sesję w Supabase Auth
6. Middleware przekierowuje na `/login`

**Oczekiwany rezultat:**
- Toast notification: "Wylogowano pomyślnie"
- Session token jest usunięty
- Użytkownik jest przekierowany na `/login`
- Próba dostępu do chronionych tras skutkuje przekierowaniem

**Weryfikacja:**
- URL: `http://localhost:4321/login`
- Brak UserMenu w headerze
- Brak dostępu do `/` bez logowania

---

### 2.4. Reset Hasła

#### TC-AUTH-009: Poprawny przepływ resetowania hasła (część 1 - żądanie)

**Priorytet:** Wysoki  
**Warstwy:** UI → API Auth → Supabase Auth → Email Service

**Kroki:**
1. Użytkownik otwiera stronę `/forgot-password`
2. Użytkownik wpisuje zarejestrowany email
3. Użytkownik klika przycisk "Wyślij link resetujący"
4. System wywołuje endpoint `/api/auth/forgot-password`
5. Supabase wysyła email z linkiem resetującym

**Oczekiwany rezultat:**
- Toast notification: "Link resetujący został wysłany na email"
- Użytkownik widzi informację o sprawdzeniu skrzynki email
- Email z linkiem resetującym zostaje wysłany (weryfikacja w test inbox)

**Weryfikacja:**
- Widoczna informacja zwrotna
- W test inbox pojawia się email z linkiem

---

#### TC-AUTH-010: Poprawny przepływ resetowania hasła (część 2 - zmiana hasła)

**Priorytet:** Wysoki  
**Warstwy:** UI → API Auth → Supabase Auth

**Kroki:**
1. Użytkownik klika w link z emaila (z tokenem resetującym)
2. Użytkownik jest przekierowany na `/reset-password?token=...`
3. Użytkownik wpisuje nowe hasło (min. 8 znaków)
4. Użytkownik potwierdza nowe hasło
5. Użytkownik klika przycisk "Zresetuj hasło"
6. System weryfikuje token i aktualizuje hasło

**Oczekiwany rezultat:**
- Toast notification: "Hasło zostało zmienione"
- Użytkownik jest przekierowany na `/login`
- Stare hasło nie działa
- Nowe hasło umożliwia logowanie

**Weryfikacja:**
- Możliwość zalogowania się nowym hasłem
- Brak możliwości zalogowania starym hasłem

---

#### TC-AUTH-011: Reset hasła z niepoprawnym/wygasłym tokenem

**Priorytet:** Średni  
**Warstwy:** UI → API Auth → Supabase Auth

**Kroki:**
1. Użytkownik próbuje otworzyć `/reset-password?token=invalid_token`
2. System weryfikuje token w Supabase

**Oczekiwany rezultat:**
- Toast notification: "Link resetujący jest niepoprawny lub wygasł"
- Użytkownik jest przekierowany na `/forgot-password`
- Możliwość ponownego wysłania linku

**Weryfikacja:**
- Widoczny komunikat błędu
- Przekierowanie na właściwą stronę

---

### 2.5. Ochrona Tras (Middleware)

#### TC-AUTH-012: Próba dostępu do chronionej trasy bez logowania

**Priorytet:** Krytyczny  
**Warstwy:** Middleware → Supabase Auth

**Kroki:**
1. Użytkownik nie jest zalogowany (brak session)
2. Użytkownik próbuje otworzyć chronioną trasę `/` (dashboard)
3. Middleware sprawdza sesję
4. Brak ważnej sesji → redirect

**Oczekiwany rezultat:**
- Użytkownik jest automatycznie przekierowany na `/login`
- Toast notification (opcjonalnie): "Musisz się zalogować"

**Weryfikacja:**
- URL: `http://localhost:4321/login`
- Brak dostępu do treści strony głównej

---

#### TC-AUTH-013: Próba dostępu do strony logowania gdy użytkownik jest już zalogowany

**Priorytet:** Średni  
**Warstwy:** Middleware → Supabase Auth

**Kroki:**
1. Użytkownik jest zalogowany
2. Użytkownik próbuje otworzyć `/login` przez wpisanie URL
3. Middleware sprawdza sesję
4. Sesja istnieje → redirect

**Oczekiwany rezultat:**
- Użytkownik jest automatycznie przekierowany na `/`
- Nie widzi formularza logowania

**Weryfikacja:**
- URL: `http://localhost:4321/`
- Widoczny dashboard z listą słówek

---

## 3. Scenariusze Testowe - Zarządzanie Słówkami (CRUD)

### 3.1. Wyświetlanie Listy Słówek

#### TC-WORDS-001: Wyświetlanie pustej listy dla nowego użytkownika

**Priorytet:** Wysoki  
**Warstwy:** UI → API Words → word.service → Supabase DB

**Kroki:**
1. Nowy użytkownik loguje się do systemu (brak słówek w DB)
2. System wykonuje query `GET /api/words`
3. word.service filtruje po `user_id` (RLS)
4. Zwracana jest pusta tablica

**Oczekiwany rezultat:**
- Widoczny komponent EmptyState
- Komunikat: "Nie masz jeszcze żadnych słówek"
- Przycisk "Dodaj pierwsze słówko"
- Brak tabeli WordsTable

**Weryfikacja:**
- Widoczny EmptyState component
- Przycisk CTA jest klikalny
- Brak błędów w konsoli

---

#### TC-WORDS-002: Wyświetlanie listy słówek z paginacją

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Words → word.service → Supabase DB

**Preconditions:**
- Użytkownik ma 25 słówek w bazie danych
- Limit na stronie: 10 słówek

**Kroki:**
1. Użytkownik otwiera stronę główną `/`
2. System wykonuje query `GET /api/words?page=1&limit=10`
3. word.service zwraca pierwsze 10 słówek + metadata paginacji
4. Komponent WordsListView renderuje WordsTable i WordsPagination

**Oczekiwany rezultat:**
- Widoczna tabela z 10 słówkami
- Kolumny: Słówko (EN), Tłumaczenie (PL), Tagi, Audio, Akcje
- Komponent paginacji pokazuje "Strona 1 z 3"
- Przyciski: "Poprzednia" (disabled), "Następna" (enabled)

**Weryfikacja:**
- Dokładnie 10 wierszy w tabeli
- Paginacja działa poprawnie
- Dane są posortowane (np. po dacie dodania, DESC)

---

#### TC-WORDS-003: Nawigacja po stronach paginacji

**Priorytet:** Wysoki  
**Warstwy:** UI → API Words → TanStack Query

**Preconditions:**
- Użytkownik ma 25 słówek w bazie danych
- Użytkownik jest na stronie 1

**Kroki:**
1. Użytkownik klika przycisk "Następna" w paginacji
2. URL zmienia się na `/?page=2`
3. useWordsManagement wykonuje nowe query `GET /api/words?page=2&limit=10`
4. TanStack Query cachuje wyniki

**Oczekiwany rezultat:**
- Tabela wyświetla słówka 11-20
- Paginacja pokazuje "Strona 2 z 3"
- Przyciski "Poprzednia" i "Następna" są enabled
- Przejście między stronami jest płynne (dzięki cachowaniu)

**Weryfikacja:**
- URL zawiera `?page=2`
- Inne słówka niż na stronie 1
- Brak flickera przy przełączaniu

---

#### TC-WORDS-004: Filtrowanie słówek po tagach

**Priorytet:** Wysoki  
**Warstwy:** UI → API Words → word.service

**Preconditions:**
- Użytkownik ma słówka z różnymi tagami: "business", "travel", "food"

**Kroki:**
1. Użytkownik otwiera dropdown TagFilter
2. Użytkownik wybiera tag "business"
3. useWordsManagement wykonuje query `GET /api/words?page=1&limit=10&tag=business`
4. word.service filtruje słówka przez join z word_tags

**Oczekiwany rezultat:**
- Tabela wyświetla tylko słówka z tagiem "business"
- Liczba stron w paginacji może się zmienić
- Aktywny filtr jest wizualnie zaznaczony
- Przycisk "Wyczyść filtr" jest widoczny

**Weryfikacja:**
- URL zawiera `?tag=business`
- Wszystkie wyświetlone słówka mają tag "business"
- Możliwość wyczyszczenia filtra

---

### 3.2. Dodawanie Słówka

#### TC-WORDS-005: Pomyślne dodanie nowego słówka (podstawowe dane)

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Words → word.service → Dictionary API → Supabase DB

**Kroki:**
1. Użytkownik klika przycisk "Dodaj słówko"
2. Otwiera się modal WordFormDialog
3. Użytkownik wpisuje słówko (EN): `apple`
4. Użytkownik wpisuje tłumaczenie (PL): `jabłko`
5. Użytkownik wybiera tag: `food` (lub tworzy nowy)
6. Użytkownik klika "Zapisz"
7. Formularz wysyła `POST /api/words`
8. word.service:
   - Wywołuje Dictionary API dla słowa "apple"
   - Pobiera phonetic, audio_url, examples
   - Zapisuje słówko do DB z user_id
9. TanStack Query invaliduje cache i refetchuje listę

**Oczekiwany rezultat:**
- Toast notification: "Słówko zostało dodane"
- Modal się zamyka
- Nowe słówko pojawia się na liście
- Słówko ma automatycznie uzupełnione dane z Dictionary API:
  - Phonetic: `/ˈæp.əl/`
  - Audio URL (ikona głośnika jest aktywna)
  - Examples (jeśli dostępne)

**Weryfikacja:**
- Nowy wiersz w tabeli WordsTable
- Dane są kompletne
- Audio można odtworzyć (Howler.js)
- W bazie danych nowy rekord z poprawnym user_id

---

#### TC-WORDS-006: Dodanie słówka bez połączenia z Dictionary API

**Priorytet:** Średni  
**Warstwy:** UI → API Words → word.service → Dictionary API (error) → Supabase DB

**Kroki:**
1. Symulacja: Dictionary API jest niedostępne lub słowo nie istnieje w API
2. Użytkownik dodaje słówko "xyzabc" z tłumaczeniem "test"
3. word.service próbuje pobrać dane z Dictionary API
4. API zwraca 404 Not Found
5. word.service zapisuje słówko z pustymi polami phonetic/audio/examples

**Oczekiwany rezultat:**
- Toast notification: "Słówko dodane, ale nie udało się pobrać danych fonetycznych"
- Słówko zostaje zapisane do DB
- Pola phonetic, audio_url, examples są puste/null
- Użytkownik może ręcznie uzupełnić te dane później (edycja)

**Weryfikacja:**
- Słówko jest na liście
- Brak ikony audio
- Brak danych fonetycznych

---

#### TC-WORDS-007: Walidacja formularza dodawania słówka (puste pola)

**Priorytet:** Wysoki  
**Warstwy:** UI → Zod Validation

**Kroki:**
1. Użytkownik klika "Dodaj słówko"
2. Użytkownik pozostawia pole "Słówko (EN)" puste
3. Użytkownik wpisuje tylko tłumaczenie
4. Użytkownik próbuje zapisać

**Oczekiwany rezultat:**
- Walidacja Zod blokuje wysłanie formularza
- Pod pustym polem wyświetla się błąd: "Pole jest wymagane"
- Przycisk "Zapisz" może być disabled lub kliknięcie nie wysyła requesta
- Modal pozostaje otwarty

**Weryfikacja:**
- Widoczny komunikat błędu
- Formularz nie zostaje wysłany
- Żaden request POST nie jest wykonany

---

#### TC-WORDS-008: Dodanie słówka z wieloma tagami

**Priorytet:** Średni  
**Warstwy:** UI → API Words → word.service → Supabase DB (word_tags)

**Kroki:**
1. Użytkownik otwiera modal dodawania słówka
2. Użytkownik wpisuje słówko i tłumaczenie
3. Użytkownik wybiera wiele tagów: `business`, `formal`, `vocabulary`
4. Użytkownik zapisuje słówko
5. word.service zapisuje słówko i tworzy powiązania w word_tags

**Oczekiwany rezultat:**
- Słówko jest zapisane w tabeli `words`
- W tabeli `word_tags` powstają 3 rekordy (word_id + tag_id)
- W liście słówek widoczne są wszystkie 3 tagi przy danym słówku
- Filtrowanie po dowolnym z tych tagów pokaże to słówko

**Weryfikacja:**
- Kolumna "Tagi" pokazuje badges: "business", "formal", "vocabulary"
- Słówko pojawia się przy filtrowaniu po każdym z tych tagów

---

### 3.3. Edycja Słówka

#### TC-WORDS-009: Pomyślna edycja istniejącego słówka

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Words → word.service → Supabase DB

**Kroki:**
1. Użytkownik klika ikonę "Edytuj" przy słówku na liście
2. Modal WordFormDialog otwiera się z wypełnionymi danymi
3. Użytkownik zmienia tłumaczenie z "jabłko" na "jabłko owoc"
4. Użytkownik dodaje dodatkowy tag
5. Użytkownik klika "Zapisz"
6. Formularz wysyła `PUT /api/words/{id}`
7. word.service aktualizuje rekord w DB
8. TanStack Query invaliduje cache

**Oczekiwany rezultat:**
- Toast notification: "Słówko zostało zaktualizowane"
- Modal się zamyka
- Zaktualizowane dane są widoczne w tabeli
- Nie zmienia się kolejność słówka na liście (o ile sort nie jest po updated_at)

**Weryfikacja:**
- Nowe tłumaczenie jest widoczne
- Nowy tag jest widoczny w kolumnie Tagi
- Timestamp `updated_at` jest zaktualizowany w DB

---

#### TC-WORDS-010: Edycja słówka EN - ponowne pobranie danych z Dictionary API

**Priorytet:** Wysoki  
**Warstwy:** UI → API Words → word.service → Dictionary API → Supabase DB

**Kroki:**
1. Użytkownik edytuje słówko "apple"
2. Użytkownik zmienia słówko EN na "orange"
3. Użytkownik zapisuje
4. word.service wykrywa zmianę słówka EN
5. Ponownie wywołuje Dictionary API dla "orange"
6. Aktualizuje phonetic, audio_url, examples

**Oczekiwany rezultat:**
- Nowe dane fonetyczne dla słowa "orange"
- Nowy audio URL
- Nowe przykłady (jeśli dostępne)
- Toast notification: "Słówko zaktualizowane"

**Weryfikacja:**
- Phonetic: `/ˈɒr.ɪndʒ/` (lub podobne)
- Audio można odtworzyć (nowy plik)
- Examples są zaktualizowane

---

#### TC-WORDS-011: Edycja słówka - brak uprawnień (próba edycji cudzego słówka)

**Priorytet:** Krytyczny (Security)  
**Warstwy:** API Words → word.service → Supabase RLS

**Kroki:**
1. User A jest zalogowany
2. Symulacja: User A próbuje wywołać `PUT /api/words/{id_slowka_user_b}`
3. word.service wykonuje query do Supabase
4. RLS (Row Level Security) blokuje operację (user_id nie pasuje)

**Oczekiwany rezultat:**
- Request zwraca błąd 403 Forbidden lub 404 Not Found (zależnie od implementacji)
- Toast notification: "Nie masz uprawnień do edycji tego słówka"
- Żadne dane nie są zmieniane w DB
- User A nie widzi słówek User B na swojej liście

**Weryfikacja:**
- Brak zmian w bazie danych
- Odpowiedni kod błędu HTTP
- RLS działa poprawnie

---

### 3.4. Usuwanie Słówka

#### TC-WORDS-012: Pomyślne usunięcie słówka

**Priorytet:** Krytyczny  
**Warstwy:** UI → API Words → word.service → Supabase DB

**Kroki:**
1. Użytkownik klika ikonę "Usuń" przy słówku
2. Otwiera się modal DeleteWordDialog z potwierdzeniem
3. Modal wyświetla: "Czy na pewno chcesz usunąć słówko: apple?"
4. Użytkownik klika "Usuń"
5. Wykonuje się `DELETE /api/words/{id}`
6. word.service usuwa rekord z DB (cascade delete w word_tags)
7. TanStack Query invaliduje cache i refetchuje listę

**Oczekiwany rezultat:**
- Toast notification: "Słówko zostało usunięte"
- Modal się zamyka
- Słówko znika z listy
- W DB rekord jest usunięty
- Powiązania w word_tags są automatycznie usunięte (cascade)

**Weryfikacja:**
- Brak usuniętego słówka na liście
- Paginacja się przelicza (jeśli było 11 słówek, teraz jest 10)
- W DB brak rekordu

---

#### TC-WORDS-013: Anulowanie usuwania słówka

**Priorytet:** Średni  
**Warstwy:** UI

**Kroki:**
1. Użytkownik klika ikonę "Usuń" przy słówku
2. Otwiera się modal DeleteWordDialog
3. Użytkownik klika "Anuluj" lub X (zamknięcie modala)

**Oczekiwany rezultat:**
- Modal się zamyka
- Żaden request nie jest wysyłany
- Słówko pozostaje na liście
- Brak zmian w DB

**Weryfikacja:**
- Słówko nadal widoczne
- Brak requestu DELETE w network tab

---

#### TC-WORDS-014: Usuwanie ostatniego słówka na stronie (paginacja)

**Priorytet:** Średni  
**Warstwy:** UI → API Words → Paginacja

**Preconditions:**
- Użytkownik ma 21 słówek (strona 1: 10, strona 2: 10, strona 3: 1)
- Użytkownik jest na stronie 3 (widzi 1 słówko)

**Kroki:**
1. Użytkownik usuwa jedyne słówko na stronie 3
2. useWordsManagement wykrywa pustą stronę
3. Automatycznie przekierowuje na stronę 2 (ostatnią niepustą)

**Oczekiwany rezultat:**
- Słówko zostaje usunięte
- Użytkownik jest automatycznie przekierowany na stronę 2
- URL: `/?page=2`
- Widocznych 10 słówek

**Weryfikacja:**
- Brak błędu "brak słówek"
- Płynne przekierowanie

---

### 3.5. Zarządzanie Tagami

#### TC-WORDS-015: Tworzenie nowego taga podczas dodawania słówka

**Priorytet:** Wysoki  
**Warstwy:** UI → API Tags → tag.service → Supabase DB

**Kroki:**
1. Użytkownik otwiera modal dodawania słówka
2. W polu "Tagi" użytkownik wpisuje nowy tag: "medicine"
3. System pokazuje opcję "Utwórz tag: medicine"
4. Użytkownik klika na opcję
5. Wykonuje się `POST /api/tags` z `{ name: "medicine" }`
6. tag.service tworzy nowy tag z user_id
7. Nowy tag jest automatycznie przypisany do tworzonego słówka

**Oczekiwany rezultat:**
- Nowy tag "medicine" jest tworzony w tabeli `tags`
- Tag jest unikalny per user (walidacja)
- Tag jest natychmiast dostępny w dropdownie TagFilter
- Słówko ma przypisany nowy tag

**Weryfikacja:**
- W DB nowy rekord w tabeli `tags`
- Tag widoczny w filterze
- Powiązanie w `word_tags`

---

#### TC-WORDS-016: Próba utworzenia duplikatu taga

**Priorytet:** Średni  
**Warstwy:** API Tags → tag.service → Supabase DB

**Kroki:**
1. Użytkownik próbuje utworzyć tag "business", który już istnieje
2. tag.service wykrywa duplikat (unique constraint per user_id)

**Oczekiwany rezultat:**
- Toast notification: "Tag o tej nazwie już istnieje"
- Formularz nie tworzy duplikatu
- Istniejący tag jest używany zamiast tworzenia nowego

**Weryfikacja:**
- Brak duplikatu w bazie
- Unique constraint działa

---

## 4. Scenariusze Testowe - Quiz

### 4.1. Konfiguracja Quizu

#### TC-QUIZ-001: Rozpoczęcie quizu - konfiguracja parametrów

**Priorytet:** Krytyczny  
**Warstwy:** UI → useQuiz → API Words

**Preconditions:**
- Użytkownik ma co najmniej 10 słówek w bazie

**Kroki:**
1. Użytkownik klika "Quiz" w menu nawigacyjnym
2. Otwiera się strona `/quiz` w stanie "setup"
3. Komponent QuizSetup wyświetla formularz konfiguracji:
   - Kierunek: EN→PL (default) lub PL→EN
   - Liczba pytań: slider/input (default 10)
   - Filtr po tagu: dropdown (opcjonalnie)
4. Użytkownik wybiera kierunek: EN→PL
5. Użytkownik ustawia liczbę pytań: 5
6. Użytkownik NIE wybiera taga (wszystkie słówka)
7. Użytkownik klika "Rozpocznij Quiz"

**Oczekiwany rezultat:**
- useQuiz przełącza stan z "setup" na "session"
- Wykonuje się query `GET /api/words?limit=all` (lub z parametrami)
- word.service zwraca słówka użytkownika
- useQuiz losuje 5 słówek z dostępnych
- Renderuje się komponent QuizSession z pierwszym pytaniem

**Weryfikacja:**
- Stan: "session"
- Widoczny QuizHeader z postępem: "Pytanie 1/5"
- Widoczny QuizCard z pierwszym słówkiem (EN)
- Input do wpisania odpowiedzi (PL)

---

#### TC-QUIZ-002: Próba rozpoczęcia quizu bez słówek w bazie

**Priorytet:** Wysoki  
**Warstwy:** UI → useQuiz → API Words

**Preconditions:**
- Użytkownik NIE MA żadnych słówek w bazie

**Kroki:**
1. Użytkownik otwiera `/quiz`
2. useQuiz wykonuje query po słówka
3. Zwracana jest pusta tablica

**Oczekiwany rezultat:**
- Widoczny komunikat: "Nie masz jeszcze słówek. Dodaj słówka, aby rozpocząć quiz."
- Przycisk CTA: "Dodaj słówka" → przekierowanie na `/`
- Przycisk "Rozpocznij Quiz" jest disabled lub niewidoczny

**Weryfikacja:**
- Brak możliwości rozpoczęcia quizu
- Pomocny komunikat dla użytkownika

---

#### TC-QUIZ-003: Rozpoczęcie quizu z filtrem po tagu

**Priorytet:** Wysoki  
**Warstwy:** UI → useQuiz → API Words

**Preconditions:**
- Użytkownik ma słówka z różnymi tagami: "business" (5 słówek), "travel" (3 słówka)

**Kroki:**
1. Użytkownik otwiera `/quiz`
2. Użytkownik wybiera filtr po tagu: "business"
3. Użytkownik ustawia liczbę pytań: 5
4. Użytkownik klika "Rozpocznij Quiz"
5. useQuiz wykonuje query `GET /api/words?tag=business`
6. Zwracanych jest 5 słówek z tagu "business"

**Oczekiwany rezultat:**
- Quiz zawiera tylko słówka z tagu "business"
- Liczba pytań: 5
- Kierunek zgodnie z wyborem

**Weryfikacja:**
- Wszystkie pytania dotyczą słówek z tagu "business"
- Weryfikacja w DB: word_tags join

---

#### TC-QUIZ-004: Próba rozpoczęcia quizu - liczba pytań większa niż dostępnych słówek

**Priorytet:** Średni  
**Warstwy:** UI → useQuiz

**Preconditions:**
- Użytkownik ma tylko 3 słówka

**Kroki:**
1. Użytkownik otwiera `/quiz`
2. Użytkownik próbuje ustawić liczbę pytań: 10
3. useQuiz wykrywa, że dostępnych jest tylko 3 słówka

**Oczekiwany rezultat:**
- Slider/input automatycznie ogranicza max do 3
- LUB
- Toast notification: "Masz tylko 3 słówka. Quiz będzie miał 3 pytania."
- Quiz rozpoczyna się z 3 pytaniami

**Weryfikacja:**
- Quiz ma tyle pytań, ile jest dostępnych słówek
- Brak błędu

---

### 4.2. Sesja Quizu

#### TC-QUIZ-005: Odpowiadanie na pytania - poprawna odpowiedź

**Priorytet:** Krytyczny  
**Warstwy:** UI → useQuiz

**Preconditions:**
- Quiz rozpoczęty, kierunek: EN→PL
- Pierwsze pytanie: "apple"

**Kroki:**
1. Użytkownik widzi pytanie: "apple"
2. Użytkownik wpisuje tłumaczenie: "jabłko"
3. Użytkownik wybiera self-assessment: "Wiem" (przycisk zielony)
4. useQuiz zapisuje odpowiedź jako poprawną
5. useQuiz przechodzi do następnego pytania

**Oczekiwany rezultat:**
- Licznik poprawnych odpowiedzi: +1
- Progress bar się aktualizuje: "Pytanie 2/5"
- Widoczne następne pytanie
- Poprzednia odpowiedź jest zapisana w stanie

**Weryfikacja:**
- Stan quizu zawiera: `{ wordId: "...", userAnswer: "jabłko", selfAssessment: "knows" }`
- Progress: 1/5 → 2/5

---

#### TC-QUIZ-006: Odpowiadanie na pytania - niepoprawna odpowiedź (self-assessment)

**Priorytet:** Krytyczny  
**Warstwy:** UI → useQuiz

**Preconditions:**
- Quiz rozpoczęty
- Pytanie: "orange"

**Kroki:**
1. Użytkownik wpisuje: "pomarańcza"
2. Użytkownik wybiera self-assessment: "Nie wiem" (przycisk czerwony)
3. useQuiz zapisuje odpowiedź jako niepoprawną

**Oczekiwany rezultat:**
- Licznik niepoprawnych odpowiedzi: +1
- Progress bar się aktualizuje
- Następne pytanie

**Weryfikacja:**
- Stan: `{ selfAssessment: "doesNotKnow" }`
- Licznik błędów: 1

---

#### TC-QUIZ-007: Pomijanie pytania (skip)

**Priorytet:** Średni  
**Warstwy:** UI → useQuiz

**Kroki:**
1. Użytkownik widzi pytanie
2. Użytkownik nie wpisuje odpowiedzi
3. Użytkownik klika przycisk "Pomiń" (jeśli dostępny)
4. LUB użytkownik klika "Nie wiem" bez wpisywania odpowiedzi

**Oczekiwany rezultat:**
- Pytanie jest traktowane jako pominięte/błędne
- useQuiz przechodzi do następnego pytania
- W stanie zapisane: `{ userAnswer: "", selfAssessment: "doesNotKnow" }`

**Weryfikacja:**
- Możliwość przejścia dalej bez wpisania odpowiedzi
- Pytanie jest liczone jako błędne w podsumowaniu

---

#### TC-QUIZ-008: Odtwarzanie audio podczas quizu (jeśli dostępne)

**Priorytet:** Średni  
**Warstwy:** UI → Howler.js

**Preconditions:**
- Quiz w trakcie
- Aktualne słówko ma wypełnione `audio_url`

**Kroki:**
1. Użytkownik widzi pytanie z ikoną audio (głośnik)
2. Użytkownik klika ikonę audio
3. Howler.js odtwarza audio

**Oczekiwany rezultat:**
- Audio jest odtwarzane
- Użytkownik słyszy wymowę słówka
- Możliwość wielokrotnego odsłuchania

**Weryfikacja:**
- Audio działa (brak błędów)
- Ikona zmienia stan (loading/playing/stopped)

---

### 4.3. Podsumowanie Quizu

#### TC-QUIZ-009: Zakończenie quizu - wyświetlenie podsumowania

**Priorytet:** Krytyczny  
**Warstwy:** UI → useQuiz

**Preconditions:**
- Użytkownik odpowiedział na wszystkie 5 pytań
- Wyniki: 3 poprawne, 2 niepoprawne

**Kroki:**
1. Użytkownik odpowiada na ostatnie (5.) pytanie
2. useQuiz przełącza stan z "session" na "summary"
3. Renderuje się komponent QuizSummary

**Oczekiwany rezultat:**
- Widoczny ekran podsumowania
- Nagłówek: "Gratulacje! Quiz zakończony"
- Statystyki:
  - Poprawne odpowiedzi: 3/5 (60%)
  - Niepoprawne odpowiedzi: 2/5 (40%)
- Progress bar lub wykres kołowy z wynikiem
- Lista odpowiedzi (opcjonalnie):
  - Pytanie | Twoja odpowiedź | Poprawna odpowiedź | Status (✓/✗)
- Przyciski akcji:
  - "Powtórz quiz" (reset i powrót do setup)
  - "Powrót do listy słówek" (navigate to `/`)

**Weryfikacja:**
- Poprawne obliczenie procentu
- Widoczne wszystkie odpowiedzi
- Przyciski działają poprawnie

---

#### TC-QUIZ-010: Powtórzenie quizu po zakończeniu

**Priorytet:** Średni  
**Warstwy:** UI → useQuiz

**Kroki:**
1. Użytkownik jest na ekranie podsumowania
2. Użytkownik klika "Powtórz quiz"
3. useQuiz resetuje stan
4. Użytkownik wraca do ekranu QuizSetup

**Oczekiwany rezultat:**
- Stan quizu: "setup"
- Formularz konfiguracji jest widoczny
- Poprzednie ustawienia mogą być zapamiętane (opcjonalnie)
- Możliwość rozpoczęcia nowego quizu

**Weryfikacja:**
- Czysty stan quizu
- Możliwość wyboru nowych parametrów

---

#### TC-QUIZ-011: Opuszczenie quizu w trakcie sesji (przerwanie)

**Priorytet:** Średni  
**Warstwy:** UI → useQuiz → Router

**Kroki:**
1. Użytkownik jest w trakcie quizu (pytanie 3/5)
2. Użytkownik klika "Zakończ quiz" lub nawiguje do innej strony (np. `/`)
3. (Opcjonalnie) Wyświetla się modal potwierdzenia: "Czy na pewno chcesz przerwać quiz?"

**Oczekiwany rezultat:**
- Quiz zostaje przerwany
- Stan quizu jest resetowany
- Użytkownik jest przekierowany na wybraną stronę
- Brak zapisywania częściowych wyników (zgodnie z PRD: stateless quiz)

**Weryfikacja:**
- Możliwość opuszczenia quizu
- Brak błędów przy nawigacji

---

## 5. Scenariusze Testowe - Bezpieczeństwo i Wydajność

### 5.1. Bezpieczeństwo (Row-Level Security)

#### TC-SEC-001: Weryfikacja RLS - użytkownik widzi tylko swoje słówka

**Priorytet:** Krytyczny  
**Warstwy:** API Words → word.service → Supabase RLS

**Preconditions:**
- User A ma 10 słówek
- User B ma 5 słówek

**Kroki:**
1. User A loguje się i otwiera `/`
2. useWordsManagement wykonuje `GET /api/words`
3. RLS filtruje: `WHERE user_id = User A`

**Oczekiwany rezultat:**
- User A widzi tylko swoje 10 słówek
- User A NIE WIDZI słówek User B
- Query zwraca tylko rekordy z `user_id = User A`

**Weryfikacja:**
- Liczba słówek: 10
- Weryfikacja w DB: wszystkie mają user_id = User A
- Brak przecieków danych

---

#### TC-SEC-002: Próba bezpośredniego dostępu do API innego użytkownika

**Priorytet:** Krytyczny  
**Warstwy:** API Words → Supabase RLS

**Preconditions:**
- User A zna ID słówka należącego do User B

**Kroki:**
1. User A jest zalogowany
2. User A próbuje wykonać request: `GET /api/words/{id_slowka_user_b}`
3. RLS blokuje dostęp

**Oczekiwany rezultat:**
- Response: 404 Not Found (słówko "nie istnieje" z perspektywy User A)
- LUB Response: 403 Forbidden
- Żadne dane User B nie są zwracane

**Weryfikacja:**
- Brak dostępu do cudzych danych
- RLS działa poprawnie

---

#### TC-SEC-003: Weryfikacja RLS dla tagów

**Priorytet:** Wysoki  
**Warstwy:** API Tags → tag.service → Supabase RLS

**Kroki:**
1. User A loguje się
2. Wykonuje query `GET /api/tags`
3. RLS: `WHERE user_id = User A`

**Oczekiwany rezultat:**
- User A widzi tylko swoje tagi
- Tagi innych użytkowników są niewidoczne

**Weryfikacja:**
- Liczba tagów zgodna z własnymi
- Brak przecieków

---

### 5.2. Wydajność

#### TC-PERF-001: Wydajność ładowania listy słówek (100+ słówek)

**Priorytet:** Średni  
**Warstwy:** API Words → word.service → Paginacja

**Preconditions:**
- Użytkownik ma 500 słówek w bazie

**Kroki:**
1. Użytkownik otwiera `/`
2. Query: `GET /api/words?page=1&limit=10`
3. Czas odpowiedzi API

**Oczekiwany rezultat:**
- Czas odpowiedzi < 500ms
- Zwracanych tylko 10 słówek (nie 500)
- Paginacja działa efektywnie
- UI renderuje się płynnie (brak lagów)

**Weryfikacja:**
- Network tab: response time
- Brak obciążenia przeglądarki
- Indeksy DB na user_id i created_at

---

#### TC-PERF-002: Cachowanie zapytań przez TanStack Query

**Priorytet:** Średni  
**Warstwy:** UI → TanStack Query

**Kroki:**
1. Użytkownik otwiera `/` (query: fetch words)
2. Użytkownik nawiguje do `/quiz`
3. Użytkownik wraca do `/`
4. TanStack Query sprawdza cache

**Oczekiwany rezultat:**
- Przy powrocie na `/` dane są ładowane z cache
- Brak ponownego requesta (jeśli cache jest świeży)
- Szybkie wyświetlenie listy (instant)

**Weryfikacja:**
- Network tab: brak nowego requesta
- UI renderuje się natychmiast
- Cache działa poprawnie

---

## 6. Scenariusze Testowe - Responsywność (RWD)

### 6.1. Mobile View

#### TC-RWD-001: Wyświetlanie listy słówek na urządzeniu mobilnym

**Priorytet:** Wysoki  
**Warstwy:** UI (Tailwind CSS)

**Viewport:** 375x667 (iPhone SE)

**Kroki:**
1. Użytkownik otwiera `/` na urządzeniu mobilnym
2. Lista słówek renderuje się w widoku mobile

**Oczekiwany rezultat:**
- Tabela WordsTable jest responsywna (karty zamiast tabeli?)
- LUB tabela ma horizontal scroll
- Przyciski są dobrze widoczne i klikalne (min. 44x44px)
- UserMenu działa poprawnie
- Paginacja jest czytelna

**Weryfikacja:**
- Brak overflow
- UI jest użyteczny na małym ekranie
- Touch targets są odpowiednie

---

#### TC-RWD-002: Formularz dodawania słówka na mobile

**Priorytet:** Średni  
**Viewport:** 375x667

**Kroki:**
1. Użytkownik otwiera modal dodawania słówka na mobile
2. Formularz WordFormDialog renderuje się

**Oczekiwany rezultat:**
- Modal zajmuje odpowiednią część ekranu (fullscreen lub 90% height)
- Input fields są dobrze widoczne
- Klawiatura nie zasłania inputów (auto-scroll)
- Przyciski "Zapisz" i "Anuluj" są dostępne

**Weryfikacja:**
- Formularze działają na mobile
- UX jest płynny

---

### 6.2. Tablet & Desktop

#### TC-RWD-003: Widok na tablecie (768px)

**Priorytet:** Średni  
**Viewport:** 768x1024 (iPad)

**Oczekiwany rezultat:**
- Layout wykorzystuje dostępną przestrzeń
- Tabela WordsTable jest czytelna
- Brak nadmiernych marginesów

---

#### TC-RWD-004: Widok desktop (1920px)

**Priorytet:** Średni  
**Viewport:** 1920x1080

**Oczekiwany rezultat:**
- Zawartość jest wycentrowana lub ma max-width
- Nie rozciąga się na całą szerokość (poor UX)
- Wszystkie elementy są dobrze widoczne

---

## 7. User Stories dla Implementacji Testów E2E

### Epic 1: Autentykacja

#### US-TEST-001: Jako tester, chcę przetestować flow rejestracji

**Story:**
Jako tester, chcę mieć zautomatyzowane testy E2E dla procesu rejestracji użytkownika, aby zapewnić, że nowi użytkownicy mogą bez problemów założyć konto.

**Acceptance Criteria:**
- [ ] Test TC-AUTH-001: Pomyślna rejestracja nowego użytkownika
- [ ] Test TC-AUTH-002: Rejestracja z istniejącym emailem
- [ ] Test TC-AUTH-003: Rejestracja z za krótkim hasłem
- [ ] Test TC-AUTH-004: Rejestracja z niezgodnymi hasłami
- [ ] Testy przechodzą w CI/CD
- [ ] Dane testowe są automatycznie czyszczone po testach

**Tasks:**
- [ ] Utworzenie pliku `e2e/auth/register.spec.ts`
- [ ] Implementacja fixtures dla testowych użytkowników
- [ ] Mockowanie emaili (test inbox)
- [ ] Setup/teardown bazy danych testowej

**Priority:** P0 (Must Have)

---

#### US-TEST-002: Jako tester, chcę przetestować flow logowania i wylogowania

**Story:**
Jako tester, chcę mieć testy E2E dla logowania i wylogowania, aby upewnić się, że mechanizmy sesji działają poprawnie.

**Acceptance Criteria:**
- [ ] Test TC-AUTH-005: Pomyślne logowanie
- [ ] Test TC-AUTH-006: Logowanie z niepoprawnym hasłem
- [ ] Test TC-AUTH-007: Logowanie z niezarejestrowanym emailem
- [ ] Test TC-AUTH-008: Pomyślne wylogowanie
- [ ] Test TC-AUTH-012: Ochrona tras (middleware)
- [ ] Test TC-AUTH-013: Redirect gdy użytkownik już zalogowany

**Tasks:**
- [ ] Utworzenie `e2e/auth/login.spec.ts`
- [ ] Utworzenie `e2e/auth/logout.spec.ts`
- [ ] Fixture dla zalogowanego użytkownika (auth.fixture.ts - już istnieje?)
- [ ] Test middleware redirects

**Priority:** P0 (Must Have)

---

#### US-TEST-003: Jako tester, chcę przetestować reset hasła

**Story:**
Jako tester, chcę mieć testy E2E dla procesu resetowania hasła, aby sprawdzić, że użytkownicy mogą odzyskać dostęp do konta.

**Acceptance Criteria:**
- [ ] Test TC-AUTH-009: Żądanie resetu hasła
- [ ] Test TC-AUTH-010: Zmiana hasła przez link
- [ ] Test TC-AUTH-011: Niepoprawny/wygasły token
- [ ] Mockowanie email service (test inbox)

**Tasks:**
- [ ] Utworzenie `e2e/auth/password-reset.spec.ts`
- [ ] Integracja z test email service
- [ ] Ekstrakcja tokenu z emaila w teście

**Priority:** P1 (Should Have)

---

### Epic 2: Zarządzanie Słówkami (CRUD)

#### US-TEST-004: Jako tester, chcę przetestować wyświetlanie listy słówek

**Story:**
Jako tester, chcę mieć testy E2E dla wyświetlania listy słówek, aby upewnić się, że paginacja i filtrowanie działają poprawnie.

**Acceptance Criteria:**
- [ ] Test TC-WORDS-001: Pusta lista (EmptyState)
- [ ] Test TC-WORDS-002: Lista z paginacją
- [ ] Test TC-WORDS-003: Nawigacja po stronach
- [ ] Test TC-WORDS-004: Filtrowanie po tagach
- [ ] Seedowanie DB testowymi słówkami

**Tasks:**
- [ ] Utworzenie `e2e/words/list.spec.ts`
- [ ] Seed script dla testowych słówek
- [ ] Test helpers: createTestWord(), createTestTag()
- [ ] Weryfikacja paginacji i filtrów

**Priority:** P0 (Must Have)

---

#### US-TEST-005: Jako tester, chcę przetestować dodawanie słówek

**Story:**
Jako tester, chcę mieć testy E2E dla dodawania nowych słówek, włączając integrację z Dictionary API.

**Acceptance Criteria:**
- [ ] Test TC-WORDS-005: Dodanie słówka (z Dictionary API)
- [ ] Test TC-WORDS-006: Dodanie słówka (Dictionary API offline)
- [ ] Test TC-WORDS-007: Walidacja pustych pól
- [ ] Test TC-WORDS-008: Dodanie słówka z wieloma tagami
- [ ] Test TC-WORDS-015: Tworzenie nowego taga

**Tasks:**
- [ ] Utworzenie `e2e/words/create.spec.ts`
- [ ] Mockowanie Dictionary API (MSW lub Playwright intercept)
- [ ] Test formularza WordFormDialog
- [ ] Weryfikacja toastów i refetch listy

**Priority:** P0 (Must Have)

---

#### US-TEST-006: Jako tester, chcę przetestować edycję słówek

**Story:**
Jako tester, chcę mieć testy E2E dla edycji słówek, włączając re-fetch z Dictionary API przy zmianie słówka EN.

**Acceptance Criteria:**
- [ ] Test TC-WORDS-009: Edycja słówka
- [ ] Test TC-WORDS-010: Zmiana słówka EN (re-fetch API)
- [ ] Test TC-WORDS-011: Próba edycji cudzego słówka (security)

**Tasks:**
- [ ] Utworzenie `e2e/words/edit.spec.ts`
- [ ] Test permissions (multi-user scenario)
- [ ] Weryfikacja RLS

**Priority:** P0 (Must Have)

---

#### US-TEST-007: Jako tester, chcę przetestować usuwanie słówek

**Story:**
Jako tester, chcę mieć testy E2E dla usuwania słówek, włączając edge case'y z paginacją.

**Acceptance Criteria:**
- [ ] Test TC-WORDS-012: Usunięcie słówka
- [ ] Test TC-WORDS-013: Anulowanie usunięcia
- [ ] Test TC-WORDS-014: Usunięcie ostatniego słówka na stronie

**Tasks:**
- [ ] Utworzenie `e2e/words/delete.spec.ts`
- [ ] Test DeleteWordDialog
- [ ] Test paginacji po usunięciu

**Priority:** P0 (Must Have)

---

### Epic 3: Quiz

#### US-TEST-008: Jako tester, chcę przetestować konfigurację quizu

**Story:**
Jako tester, chcę mieć testy E2E dla konfiguracji quizu, aby upewnić się, że użytkownicy mogą dostosować parametry.

**Acceptance Criteria:**
- [ ] Test TC-QUIZ-001: Konfiguracja i rozpoczęcie quizu
- [ ] Test TC-QUIZ-002: Brak słówek w bazie
- [ ] Test TC-QUIZ-003: Quiz z filtrem po tagu
- [ ] Test TC-QUIZ-004: Liczba pytań > dostępnych słówek

**Tasks:**
- [ ] Utworzenie `e2e/quiz/setup.spec.ts`
- [ ] Seed słówek z różnymi tagami
- [ ] Test formularza QuizSetup

**Priority:** P1 (Should Have)

---

#### US-TEST-009: Jako tester, chcę przetestować sesję quizu

**Story:**
Jako tester, chcę mieć testy E2E dla przebiegu quizu, aby sprawdzić poprawność logiki odpowiedzi i self-assessment.

**Acceptance Criteria:**
- [ ] Test TC-QUIZ-005: Poprawna odpowiedź
- [ ] Test TC-QUIZ-006: Niepoprawna odpowiedź
- [ ] Test TC-QUIZ-007: Pomijanie pytania
- [ ] Test TC-QUIZ-008: Odtwarzanie audio (jeśli dostępne)

**Tasks:**
- [ ] Utworzenie `e2e/quiz/session.spec.ts`
- [ ] Test QuizCard interactions
- [ ] Test progress bar
- [ ] Mockowanie audio (opcjonalnie)

**Priority:** P1 (Should Have)

---

#### US-TEST-010: Jako tester, chcę przetestować podsumowanie quizu

**Story:**
Jako tester, chcę mieć testy E2E dla ekranu podsumowania quizu, aby sprawdzić poprawność obliczeń i akcji po quizie.

**Acceptance Criteria:**
- [ ] Test TC-QUIZ-009: Wyświetlenie podsumowania
- [ ] Test TC-QUIZ-010: Powtórzenie quizu
- [ ] Test TC-QUIZ-011: Przerwanie quizu w trakcie

**Tasks:**
- [ ] Utworzenie `e2e/quiz/summary.spec.ts`
- [ ] Test QuizSummary component
- [ ] Test akcji: "Powtórz quiz", "Powrót"

**Priority:** P1 (Should Have)

---

### Epic 4: Bezpieczeństwo i Wydajność

#### US-TEST-011: Jako tester, chcę przetestować Row-Level Security (RLS)

**Story:**
Jako tester, chcę mieć testy E2E weryfikujące RLS, aby zapewnić, że użytkownicy nie mają dostępu do cudzych danych.

**Acceptance Criteria:**
- [ ] Test TC-SEC-001: User widzi tylko swoje słówka
- [ ] Test TC-SEC-002: Próba dostępu do cudzego słówka (API)
- [ ] Test TC-SEC-003: User widzi tylko swoje tagi

**Tasks:**
- [ ] Utworzenie `e2e/security/rls.spec.ts`
- [ ] Multi-user scenario (2 użytkowników w teście)
- [ ] Weryfikacja response codes (403/404)
- [ ] Weryfikacja DB queries

**Priority:** P0 (Must Have)

---

#### US-TEST-012: Jako tester, chcę przetestować wydajność aplikacji

**Story:**
Jako tester, chcę mieć testy E2E sprawdzające wydajność kluczowych operacji, aby upewnić się, że aplikacja działa płynnie.

**Acceptance Criteria:**
- [ ] Test TC-PERF-001: Ładowanie listy (100+ słówek)
- [ ] Test TC-PERF-002: Cachowanie przez TanStack Query
- [ ] Metryki: response time, render time

**Tasks:**
- [ ] Utworzenie `e2e/performance/load-time.spec.ts`
- [ ] Seed 500 słówek
- [ ] Pomiar czasów w Playwright
- [ ] Assertions na czas odpowiedzi (<500ms)

**Priority:** P2 (Nice to Have)

---

### Epic 5: Responsywność (RWD)

#### US-TEST-013: Jako tester, chcę przetestować responsywność na różnych urządzeniach

**Story:**
Jako tester, chcę mieć testy E2E sprawdzające RWD, aby upewnić się, że aplikacja działa na mobile, tablet i desktop.

**Acceptance Criteria:**
- [ ] Test TC-RWD-001: Lista słówek na mobile (375px)
- [ ] Test TC-RWD-002: Formularz na mobile
- [ ] Test TC-RWD-003: Widok tablet (768px)
- [ ] Test TC-RWD-004: Widok desktop (1920px)

**Tasks:**
- [ ] Utworzenie `e2e/responsive/mobile.spec.ts`
- [ ] Utworzenie `e2e/responsive/tablet.spec.ts`
- [ ] Utworzenie `e2e/responsive/desktop.spec.ts`
- [ ] Playwright viewport configurations
- [ ] Testy touch interactions na mobile

**Priority:** P2 (Nice to Have)

---

## 8. Priorytetyzacja Implementacji

### Faza 1: Krytyczne (P0) - Tydzień 1-2

**Must Have - Core Functionality**

1. **Autentykacja:**
   - US-TEST-001: Flow rejestracji (TC-AUTH-001 do 004)
   - US-TEST-002: Flow logowania/wylogowania (TC-AUTH-005 do 008, 012, 013)

2. **Zarządzanie słówkami:**
   - US-TEST-004: Wyświetlanie listy (TC-WORDS-001 do 004)
   - US-TEST-005: Dodawanie słówek (TC-WORDS-005 do 008, 015)
   - US-TEST-006: Edycja słówek (TC-WORDS-009 do 011)
   - US-TEST-007: Usuwanie słówek (TC-WORDS-012 do 014)

3. **Bezpieczeństwo:**
   - US-TEST-011: RLS (TC-SEC-001 do 003)

**Estimated effort:** 40-50 godzin

---

### Faza 2: Ważne (P1) - Tydzień 3

**Should Have - Extended Functionality**

1. **Quiz:**
   - US-TEST-008: Konfiguracja quizu (TC-QUIZ-001 do 004)
   - US-TEST-009: Sesja quizu (TC-QUIZ-005 do 008)
   - US-TEST-010: Podsumowanie quizu (TC-QUIZ-009 do 011)

2. **Reset hasła:**
   - US-TEST-003: Reset hasła (TC-AUTH-009 do 011)

**Estimated effort:** 20-25 godzin

---

### Faza 3: Dodatkowe (P2) - Tydzień 4

**Nice to Have - Quality & UX**

1. **Responsywność:**
   - US-TEST-013: RWD (TC-RWD-001 do 004)

2. **Wydajność:**
   - US-TEST-012: Performance tests (TC-PERF-001 do 002)

**Estimated effort:** 15-20 godzin

---

## 9. Infrastruktura Testowa

### 9.1. Struktura Plików E2E (Proponowana)

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts         (session management, login helpers)
│   ├── db.fixture.ts           (seed, cleanup helpers)
│   └── api.fixture.ts          (mock Dictionary API)
│
├── helpers/
│   ├── test-users.ts           (predefined test users)
│   ├── test-data.ts            (seed data generators)
│   └── assertions.ts           (custom assertions)
│
├── pages/                      (Page Object Model)
│   ├── login.page.ts
│   ├── register.page.ts
│   ├── words-list.page.ts
│   ├── word-form.page.ts
│   └── quiz.page.ts
│
├── auth/
│   ├── register.spec.ts        (TC-AUTH-001 to 004)
│   ├── login.spec.ts           (TC-AUTH-005 to 008)
│   ├── logout.spec.ts          (TC-AUTH-008)
│   ├── password-reset.spec.ts  (TC-AUTH-009 to 011)
│   └── route-protection.spec.ts (TC-AUTH-012, 013)
│
├── words/
│   ├── list.spec.ts            (TC-WORDS-001 to 004)
│   ├── create.spec.ts          (TC-WORDS-005 to 008, 015, 016)
│   ├── edit.spec.ts            (TC-WORDS-009 to 011)
│   └── delete.spec.ts          (TC-WORDS-012 to 014)
│
├── quiz/
│   ├── setup.spec.ts           (TC-QUIZ-001 to 004)
│   ├── session.spec.ts         (TC-QUIZ-005 to 008)
│   └── summary.spec.ts         (TC-QUIZ-009 to 011)
│
├── security/
│   └── rls.spec.ts             (TC-SEC-001 to 003)
│
├── performance/
│   └── load-time.spec.ts       (TC-PERF-001, 002)
│
└── responsive/
    ├── mobile.spec.ts          (TC-RWD-001, 002)
    ├── tablet.spec.ts          (TC-RWD-003)
    └── desktop.spec.ts         (TC-RWD-004)
```

---

### 9.2. Konfiguracja Playwright

**playwright.config.ts:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    // Mobile
    {
      name: 'mobile-chrome',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### 9.3. Environment Setup

**`.env.test`:**

```bash
# Supabase Test Instance
PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key

# Test Database
SUPABASE_DB_URL=postgresql://...test-db-url

# Dictionary API (mockowane lub test instance)
DICTIONARY_API_URL=https://api.dictionaryapi.dev/api/v2/entries/en

# Test Users
TEST_USER_EMAIL=test@10xwordup.com
TEST_USER_PASSWORD=testpassword123
```

---

### 9.4. Database Seeding & Cleanup

**e2e/fixtures/db.fixture.ts:**

```typescript
import { test as base } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

export const test = base.extend({
  // Clean DB before each test
  cleanDb: async ({}, use) => {
    const supabase = createClient(
      process.env.PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY! // Service role key for admin access
    );
    
    // Cleanup
    await supabase.from('word_tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('words').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    await use();
    
    // Cleanup after test (optional)
  },
  
  // Seed test data
  seedWords: async ({ cleanDb }, use) => {
    const supabase = createClient(...);
    
    // Create test user
    const { data: { user } } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpass123',
    });
    
    // Seed words
    await supabase.from('words').insert([
      { user_id: user.id, word: 'apple', translation: 'jabłko' },
      // ... more test data
    ]);
    
    await use({ userId: user.id, supabase });
  },
});
```

---

## 10. Metryki i Monitoring

### 10.1. Test Coverage Goals

- **Krytyczne ścieżki (P0):** 100% coverage
- **Ważne funkcjonalności (P1):** 90% coverage
- **Dodatkowe (P2):** 70% coverage

### 10.2. Kryteria Akceptacji

Aplikacja jest gotowa do wdrożenia, gdy:

- [ ] **100% testów P0 przechodzi** (autentykacja, CRUD, security)
- [ ] **90% testów P1 przechodzi** (quiz, reset hasła)
- [ ] **Brak krytycznych błędów** zgłoszonych podczas testów manualnych
- [ ] **CI/CD pipeline** uruchamia testy automatycznie
- [ ] **Test reports** są generowane i dostępne
- [ ] **RLS jest w pełni przetestowane** (bezpieczeństwo danych)

### 10.3. Continuous Integration

**GitHub Actions Workflow (`.github/workflows/e2e-tests.yml`):**

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 11. Podsumowanie

Niniejszy dokument przedstawia kompleksowy plan testowania E2E dla aplikacji 10xWordUp. Szczegółowe scenariusze testowe pokrywają wszystkie kluczowe funkcjonalności:

- **Autentykacja:** 13 przypadków testowych
- **Zarządzanie słówkami:** 16 przypadków testowych
- **Quiz:** 11 przypadków testowych
- **Bezpieczeństwo:** 3 przypadki testowe
- **Wydajność:** 2 przypadki testowe
- **Responsywność:** 4 przypadki testowe

**Łącznie: 49 szczegółowych scenariuszy testowych E2E**

User stories zostały podzielone na 13 zadań implementacyjnych, spriorytetyzowane w 3 fazach (P0, P1, P2), co umożliwia iteracyjne podejście do testowania zgodne z harmonogramem projektu.

---

**Następne kroki:**
1. Review dokumentu z zespołem
2. Akceptacja scenariuszy i user stories
3. Setup infrastruktury testowej (fixtures, helpers, Page Objects)
4. Implementacja testów zgodnie z priorytetyzacją (Faza 1 → Faza 2 → Faza 3)
5. Integracja z CI/CD pipeline
6. Monitoring i utrzymanie testów

**Autor:** AI Assistant  
**Data:** 2025-11-02  
**Wersja:** 1.0


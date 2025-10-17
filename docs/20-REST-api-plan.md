# API Endpoint Implementation Plan: REST API Endpoint for Words and Tags

## 1. Przegląd punktu końcowego

Endpoint dedykowany operacjom na słowach i tagach, umożliwiający tworzenie, odczyt, modyfikację oraz usuwanie zasobów. Dodatkowo, punkt końcowy odpowiada za integrację z zewnętrzną usługą słownikową w celu uzupełnienia danych (fonetyka, audio, przykłady) przy tworzeniu lub aktualizacji wpisu.

## 2. Szczegóły żądania

- Metoda HTTP: POST (dla tworzenia) / PUT (dla aktualizacji) / GET (dla odczytu) / DELETE (dla usunięcia)
- Struktura URL: /api/words (or /api/tags lub /api/quiz w zależności od zasobu)
- Parametry:
  - Wymagane (dla słów):
    - word (string)
    - translation (string)
    - w przypadku tagów: name (string)
  - Opcjonalne:
    - tags (lista stringów, dla słów)
    - phonetic (string, opcjonalnie)
    - audio_url (string, opcjonalnie)
    - examples (obiekt JSON, opcjonalnie)
- Request Body: JSON zgodny z modelem CreateWordCommand lub UpdateWordCommand (lub CreateTagCommand/UpdateTagCommand dla tagów)

## 3. Wykorzystywane typy

- DTO dla odczytu słowa: WordDTO (zależny od WordRow wraz z opcjonalnymi tagami)
- DTO dla tagu: TagDTO
- Command Modele:
  - CreateWordCommand
  - UpdateWordCommand
  - CreateTagCommand
  - UpdateTagCommand
- Dla quizu: QuizQuestionDTO

## 4. Szczegóły odpowiedzi

Oczekiwana struktura odpowiedzi zależy od operacji:

- 200 – dla pomyślnego odczytu lub modyfikacji
- 201 – dla pomyślnego utworzenia zasobu
- Struktura odpowiedzi: JSON zawierający dane utworzonego lub zaktualizowanego zasobu, lub potwierdzenie usunięcia.

## 5. Przepływ danych

1. Odbiór żądania API wraz z tokenem autoryzacyjnym (Bearer token).
2. Walidacja danych wejściowych przy użyciu Zod zgodnie z modelami Command (np. CreateWordCommand).
3. Sprawdzenie autentyczności użytkownika oraz uprawnień przy użyciu Supabase Auth oraz RLS w bazie.
4. Dla operacji tworzenia/aktualizacji słowa - jeżeli pole "word" zmienia się, wykonanie synchronizacji z zewnętrzną usługą słownikową (dictionaryapi.dev) w celu uzupełnienia brakujących danych.
5. Interakcja z bazą danych PostgreSQL poprzez klienta Supabase (supabaseClient) oraz odpowiednie zapytania SQL.
6. Zwrócenie odpowiedzi w formacie JSON, zawierającej dane zasobu lub potwierdzenie wykonania operacji.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: Wymagany token JWT przekazany w nagłówku Authorization w formacie Bearer.
- Autoryzacja: Użycie mechanizmu Row-Level Security w Supabase do ograniczenia dostępu tylko do zasobów przypisanych do użytkownika.
- Walidacja danych wejściowych: Zastosowanie schematów walidacji (Zod) dla wszystkich żądań.
- Ochrona przed atakami: Odpowiedni limit zapytań i zabezpieczenia przed SQL injection (poprzez parametryzowanie zapytań).

## 7. Obsługa błędów

- 400 – Nieprawidłowe dane wejściowe (np. błąd walidacji Zod).
- 401 – Nieautoryzowany dostęp, brak tokena lub nieprawidłowy token.
- 404 – Zasób nie znaleziony (np. słowo lub tag z danym identyfikatorem).
- 500 – Błąd po stronie serwera (problem z bazą danych, błędy w integracjach z zewnętrznymi API).

Każdy błąd powinien być logowany oraz odpowiednio przekazywany do klienta z jasnym komunikatem.

## 8. Rozważania dotyczące wydajności

- Wprowadzenie stronicowania przy zapytaniach GET dla kolekcji (np. lista słów lub tagów)
- Caching wyników zapytań do zewnętrznego API (dictionaryapi.dev) w celu ograniczenia liczby zapytań.
- Optymalizacja zapytań SQL poprzez indeksowanie odpowiednich kolumn (np. user_id).

## 9. Etapy wdrożenia

1. Implementacja walidacji wejścia dla żądań API przy użyciu Zod.
2. Integracja z Supabase Auth i konfiguracja mechanizmu RLS.
3. Implementacja warstwy service odpowiedzialnej za logikę biznesową, w tym synchronizację z dictionary API.
4. Implementacja endpointów API (POST, GET, PUT, DELETE) w katalogu /src/pages/api z wykorzystaniem modułów serwisowych.

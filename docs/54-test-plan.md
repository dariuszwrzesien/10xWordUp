# Plan Testów dla Aplikacji 10xWordUp

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji `10xWordUp`, platformy do nauki słówek. Celem planu jest zapewnienie wysokiej jakości, stabilności i bezpieczeństwa aplikacji przed jej wdrożeniem produkcyjnym. Plan obejmuje strategię, zakres, harmonogram oraz zasoby potrzebne do przeprowadzenia testów.

### 1.2. Cele testowania

- **Weryfikacja funkcjonalności:** Upewnienie się, że wszystkie funkcje aplikacji działają zgodnie z wymaganiami.
- **Zapewnienie jakości:** Identyfikacja i eliminacja błędów, aby zapewnić płynne i pozytywne doświadczenie użytkownika.
- **Weryfikacja bezpieczeństwa:** Sprawdzenie, czy dane użytkowników są bezpieczne i czy aplikacja jest odporna na podstawowe ataki.
- **Ocena wydajności:** Upewnienie się, że aplikacja działa wydajnie nawet przy większym obciążeniu.
- **Zapewnienie kompatybilności:** Sprawdzenie poprawnego działania aplikacji na różnych przeglądarkach i urządzeniach.

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

- Moduł autentykacji użytkowników (rejestracja, logowanie, wylogowywanie, reset hasła).
- Zarządzanie słówkami (CRUD - tworzenie, odczyt, aktualizacja, usuwanie).
- Moduł quizu (konfiguracja, przebieg, podsumowanie).
- Filtrowanie i paginacja słówek.
- Ochrona tras i autoryzacja dostępu do zasobów.
- Responsywność interfejsu użytkownika (RWD).

### 2.2. Funkcjonalności wyłączone z testów

- Testowanie wewnętrznej funkcjonalności bibliotek zewnętrznych (np. Shadcn/ui).
- Testowanie infrastruktury Supabase (zakładamy jej niezawodność).
- Zaawansowane testy penetracyjne (w ramach MVP).

## 3. Typy testów do przeprowadzenia

- **Testy jednostkowe (Unit Tests):** Skupione na weryfikacji małych, izolowanych fragmentów kodu, takich jak komponenty React, hooki, funkcje pomocnicze i schematy walidacji.
- **Testy integracyjne (Integration Tests):** Weryfikacja współpracy pomiędzy różnymi modułami aplikacji, np. interakcja komponentu z serwisem API lub komunikacja między backendem a bazą danych.
- **Testy End-to-End (E2E Tests):** Symulacja rzeczywistych scenariuszy użytkowania aplikacji z perspektywy użytkownika końcowego, obejmująca cały przepływ od interfejsu po bazę danych.
- **Testy bezpieczeństwa (Security Tests):** Podstawowa weryfikacja mechanizmów bezpieczeństwa, głównie kontroli dostępu (Row Level Security w Supabase).
- **Testy manualne (Manual Testing):** Ręczne testy eksploracyjne w celu znalezienia błędów, których nie wykryły testy automatyczne.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1. Autentykacja

- Pomyślna rejestracja nowego użytkownika.
- Próba rejestracji z zajętym adresem e-mail.
- Pomyślne logowanie z poprawnymi danymi.
- Próba logowania z niepoprawnym hasłem/e-mailem.
- Pomyślne wylogowanie i unieważnienie sesji.
- Poprawny przepływ resetowania hasła.
- Próba dostępu do chronionej trasy bez zalogowania (przekierowanie na stronę logowania).

### 4.2. Zarządzanie słówkami (CRUD)

- Pomyślne dodanie nowego słówka z poprawnymi danymi.
- Próba dodania słówka z niepoprawnymi danymi (walidacja).
- Poprawne wyświetlanie listy słówek z paginacją.
- Pomyślna edycja istniejącego słówka.
- Pomyślne usunięcie słówka.
- Weryfikacja, czy użytkownik A nie widzi i nie może modyfikować słówek użytkownika B.

### 4.3. Quiz

- Poprawne rozpoczęcie quizu po skonfigurowaniu liczby pytań.
- Poprawne wyświetlanie pytań i odpowiedzi.
- Prawidłowe zliczanie punktów za dobre i złe odpowiedzi.
- Poprawne wyświetlanie ekranu podsumowania z wynikiem.
- Weryfikacja, czy quiz losuje słówka tylko należące do zalogowanego użytkownika.

## 5. Środowisko testowe

- **Baza danych:** Oddzielna instancja bazy danych Supabase na potrzeby testów E2E i integracyjnych, regularnie czyszczona i seedowana danymi testowymi.
- **Frontend/Backend:** Aplikacja uruchamiana lokalnie lub w odizolowanym środowisku CI/CD.
- **Przeglądarki:** Testy automatyczne na Chrome. Testy manualne na najnowszych wersjach Chrome, Firefox, Safari.

## 6. Narzędzia do testowania

- **Testy jednostkowe i integracyjne:** Vitest, React Testing Library.
- **Testy E2E:** Playwright (rekomendowany) lub Cypress.
- **Mockowanie API/serwisów:** Mock Service Worker (MSW), `vi.mock` z Vitest.
- **CI/CD:** Github Actions do automatycznego uruchamiania testów po każdym pushu do repozytorium.
- **Zarządzanie zadaniami i błędami:** GitHub Issues.

### 6.1. Pakiety do instalacji

Poniższa komenda instaluje wszystkie niezbędne zależności deweloperskie do przeprowadzenia testów:

```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom @playwright/test msw
```

## 7. Harmonogram testów

Testy będą przeprowadzane w sposób ciągły i iteracyjny, równolegle do cyklu deweloperskiego. Proces testowania został podzielony na następujące fazy:

- **Faza 1: Fundamenty i Autentykacja**
  - **Zadania deweloperskie:** Implementacja autentykacji (rejestracja, logowanie).
  - **Zadania QA:** Przygotowanie i konfiguracja środowiska testowego (Playwright, Vitest). Stworzenie pierwszych testów E2E dla przepływu rejestracji i logowania.

- **Faza 2: Zarządzanie Słówkami (CRUD)**
  - **Zadania deweloperskie:** Implementacja podstawowego CRUD dla słówek.
  - **Zadania QA:** Pisanie testów jednostkowych i integracyjnych dla logiki biznesowej i komponentów CRUD. Rozbudowa testów E2E o scenariusze dodawania i listowania słówek.

- **Faza 3: Implementacja Quizu**
  - **Zadania deweloperskie:** Implementacja modułu Quizu (start, odpowiadanie).
  - **Zadania QA:** Stworzenie testów E2E dla pełnego cyklu quizu. Testy jednostkowe dla logiki zliczania punktów i losowania pytań.

- **Faza 4: Stabilizacja i Testy Regresji**
  - **Zadania deweloperskie:** Stabilizacja, poprawki, refaktoryzacja.
  - **Zadania QA:** Faza intensywnych testów manualnych i eksploracyjnych. Weryfikacja wszystkich zgłoszonych błędów. Testy regresji przed wdrożeniem wersji MVP.

## 8. Kryteria akceptacji testów

- **Kryterium wejścia:** Nowa funkcjonalność jest gotowa do testów, gdy przejdzie code review i zostanie zmergowana do głównej gałęzi deweloperskiej.
- **Kryterium wyjścia:** Aplikacja jest gotowa do wdrożenia, gdy:
  - 100% testów automatycznych (jednostkowych, integracyjnych, E2E) przechodzi pomyślnie.
  - Nie występują żadne krytyczne lub blokujące błędy zgłoszone podczas testów manualnych.
  - Wszystkie zidentyfikowane błędy o wysokim priorytecie zostały naprawione.

## 9. Role i odpowiedzialności w procesie testowania

- **Deweloperzy:**
  - Pisanie testów jednostkowych i integracyjnych dla tworzonego kodu.
  - Naprawa błędów zgłoszonych przez QA.
- **Inżynier QA (rola):**
  - Tworzenie i utrzymanie testów E2E.
  - Przeprowadzanie testów manualnych i eksploracyjnych.
  - Zarządzanie procesem zgłaszania i śledzenia błędów.
  - Ostateczna akceptacja funkcjonalności i wersji aplikacji.

## 10. Procedury raportowania błędów

Wszystkie znalezione błędy będą raportowane jako "Issue" w repozytorium GitHub projektu. Każde zgłoszenie powinno zawierać:

- Tytuł jasno opisujący problem.
- Szczegółowy opis błędu wraz z krokami do jego odtworzenia.
- Oczekiwany vs. rzeczywisty rezultat.
- Informacje o środowisku (np. przeglądarka, system operacyjny).
- Zrzuty ekranu lub nagrania wideo (jeśli to możliwe).
- Priorytet błędu (np. Krytyczny, Wysoki, Średni, Niski).
- Etykiety (np. `bug`, `frontend`, `backend`).

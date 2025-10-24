Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
   <prd>
   @5-prd.md
   </prd>

2. Opis widoku:
   <view_description>

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
  </view_description>

3. User Stories:
   <user_stories>
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

  </user_stories>

4. Endpoint Description:
   <endpoint_description>

- **GET /api/tags**
  - Description: Retrieve all tags for the authenticated user.
  - Response: An array of tag objects.

- **POST /api/tags**
  - Description: Create a new tag.
  - Request Payload: { "name": "string" }
  - Response: Created tag object.
  - Validation: Ensure the tag name is unique for the user.

  - **GET /api/quiz**
  - Description: Initialize a quiz session for the user.
  - Query Parameters: direction (EN→PL or PL→EN), tag (optional for filtering), mode (all words vs. tagged subset).
  - Response: A randomized list of questions, for example:

    ```json
    {
      "questions": [
        {
          "word_id": "uuid",
          "word_en": "string",
          "word_pl": "string",
          "audio": "string",
          "examples": {}
        }
      ]
    }
    ```

    - **GET /api/words**

  - Description: Retrieve a list of words
  - Query Parameters: sort (by creation date), and optional filter (by tag).
  - Response: { "data": [ word objects ] }

- **GET /api/words/{id}**
  - Description: Retrieve details for a specific word, including any associated tags.
  - Response: Word object.

  </endpoint_description>

5. Endpoint Implementation:
   <endpoint_implementation>
   @index.ts
   @index.ts
   </endpoint_implementation>

6. Type Definitions:
   <type_definitions>
   @dto.types.ts
   </type_definitions>

7. Tech Stack:
   <tech_stack>
   @6-tech-stack.md
   </tech_stack>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia. Ta sekcja może być dość długa, ponieważ ważne jest, aby być dokładnym.

W swoim podziale implementacji wykonaj następujące kroki:

1. Dla każdej sekcji wejściowej (PRD, User Stories, Endpoint Description, Endpoint Implementation, Type Definitions, Tech Stack):

- Podsumuj kluczowe punkty
- Wymień wszelkie wymagania lub ograniczenia
- Zwróć uwagę na wszelkie potencjalne wyzwania lub ważne kwestie

2. Wyodrębnienie i wypisanie kluczowych wymagań z PRD
3. Wypisanie wszystkich potrzebnych głównych komponentów, wraz z krótkim opisem ich opisu, potrzebnych typów, obsługiwanych zdarzeń i warunków walidacji
4. Stworzenie wysokopoziomowego diagramu drzewa komponentów
5. Zidentyfikuj wymagane DTO i niestandardowe typy ViewModel dla każdego komponentu widoku. Szczegółowo wyjaśnij te nowe typy, dzieląc ich pola i powiązane typy.
6. Zidentyfikuj potencjalne zmienne stanu i niestandardowe hooki, wyjaśniając ich cel i sposób ich użycia
7. Wymień wymagane wywołania API i odpowiadające im akcje frontendowe
8. Zmapuj każdej historii użytkownika do konkretnych szczegółów implementacji, komponentów lub funkcji
9. Wymień interakcje użytkownika i ich oczekiwane wyniki
10. Wymień warunki wymagane przez API i jak je weryfikować na poziomie komponentów
11. Zidentyfikuj potencjalne scenariusze błędów i zasugeruj, jak sobie z nimi poradzić
12. Wymień potencjalne wyzwania związane z wdrożeniem tego widoku i zasugeruj możliwe rozwiązania

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z następującymi sekcjami:

1. Przegląd: Krótkie podsumowanie widoku i jego celu.
2. Routing widoku: Określenie ścieżki, na której widok powinien być dostępny.
3. Struktura komponentów: Zarys głównych komponentów i ich hierarchii.
4. Szczegóły komponentu: Dla każdego komponentu należy opisać:

- Opis komponentu, jego przeznaczenie i z czego się składa
- Główne elementy HTML i komponenty dzieci, które budują komponent
- Obsługiwane zdarzenia
- Warunki walidacji (szczegółowe warunki, zgodnie z API)
- Typy (DTO i ViewModel) wymagane przez komponent
- Propsy, które komponent przyjmuje od rodzica (interfejs komponentu)

5. Typy: Szczegółowy opis typów wymaganych do implementacji widoku, w tym dokładny podział wszelkich nowych typów lub modeli widoku według pól i typów.
6. Zarządzanie stanem: Szczegółowy opis sposobu zarządzania stanem w widoku, określenie, czy wymagany jest customowy hook.
7. Integracja API: Wyjaśnienie sposobu integracji z dostarczonym punktem końcowym. Precyzyjnie wskazuje typy żądania i odpowiedzi.
8. Interakcje użytkownika: Szczegółowy opis interakcji użytkownika i sposobu ich obsługi.
9. Warunki i walidacja: Opisz jakie warunki są weryfikowane przez interfejs, których komponentów dotyczą i jak wpływają one na stan interfejsu
10. Obsługa błędów: Opis sposobu obsługi potencjalnych błędów lub przypadków brzegowych.
11. Kroki implementacji: Przewodnik krok po kroku dotyczący implementacji widoku.

Upewnij się, że Twój plan jest zgodny z PRD, historyjkami użytkownika i uwzględnia dostarczony stack technologiczny.

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie docs/26-{view-name}-implementacja-widoku.md. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.

Oto przykład tego, jak powinien wyglądać plik wyjściowy (treść jest do zastąpienia):

```markdown
# Plan implementacji widoku [Nazwa widoku]

## 1. Przegląd

[Krótki opis widoku i jego celu]

## 2. Routing widoku

[Ścieżka, na której widok powinien być dostępny]

## 3. Struktura komponentów

[Zarys głównych komponentów i ich hierarchii]

## 4. Szczegóły komponentów

### [Nazwa komponentu 1]

- Opis komponentu [opis]
- Główne elementy: [opis]
- Obsługiwane interakcje: [lista]
- Obsługiwana walidacja: [lista, szczegółowa]
- Typy: [lista]
- Propsy: [lista]

### [Nazwa komponentu 2]

[...]

## 5. Typy

[Szczegółowy opis wymaganych typów]

## 6. Zarządzanie stanem

[Opis zarządzania stanem w widoku]

## 7. Integracja API

[Wyjaśnienie integracji z dostarczonym endpointem, wskazanie typów żądania i odpowiedzi]

## 8. Interakcje użytkownika

[Szczegółowy opis interakcji użytkownika]

## 9. Warunki i walidacja

[Szczegółowy opis warunków i ich walidacji]

## 10. Obsługa błędów

[Opis obsługi potencjalnych błędów]

## 11. Kroki implementacji

1. [Krok 1]
2. [Krok 2]
3. [...]
```

Rozpocznij analizę i planowanie już teraz. Twój ostateczny wynik powinien składać się wyłącznie z planu wdrożenia w języku polskim w formacie markdown.
Zapis w pliku docs/26-{view-name}-implementacja-widoku.md i nie powinien powielać ani powtarzać żadnej pracy wykonanej w podziale implementacji.

<conversation_summary>
<decisions>

1. Relacja między encjami "users" i "words" ustalona jako jeden-do-wielu (jeden użytkownik ma wiele słów).
2. Encja "words" zawiera atrybut "tags", w którym przechowywane są tagi jako stringi, zamiast definiowania osobnej encji dla tagów.
3. Na etapie MVP nie wprowadzamy mechanizmu przechowywania stanu sesji nauki.
4. Linki do plików audio oraz dane dotyczące wymowy fonetycznej będą przechowywane jako typ "varchar" z odpowiednimi limitami.
5. Pole "email" w encji "users" musi posiadać ograniczenie unikalności.
6. Dodanie indeksów na kolumnach związanych z datą dodania oraz atrybutem "tags" dla poprawy wydajności.
7. Wdrożenie polityki bezpieczeństwa na poziomie wierszy (RLS) w encji "words", aby zapewnić, że każdy użytkownik ma dostęp tylko do swoich danych.
8. Na obecny etap MVP nie wdrażamy strategi partycjonowania tabeli "words".
9. Na etapie MVP stosujemy jedynie podstawowe ograniczenia bazy danych, bez dodatkowych walidatorów.
10. Warto wdrożyć mechanizm audytu do rejestrowania operacji CRUD dla encji "users" i "words".
    </decisions>

<matched_recommendations>

1. Użycie relacji jeden-do-wielu pomiędzy "users" i "words".
2. Przechowywanie tagów w atrybucie "tags" jako stringi w encji "words".
3. Pominięcie mechanizmu przechowywania stanu sesji nauki w MVP.
4. Zastosowanie typu "varchar" z limitami dla danych URL i informacji fonetycznych.
5. Wprowadzenie ograniczenia unikalności dla pola "email" w encji "users".
6. Dodanie indeksów na kolumnach "data_dodania" oraz "tags" w encji "words".
7. Wdrożenie RLS w encji "words" dla zabezpieczenia dostępu do danych użytkownika.
8. Brak wdrażania partycjonowania tabeli "words" na etapie MVP.
9. Użycie podstawowych ograniczeń bazy danych bez dodatkowych walidatorów na tym etapie.
10. Implementacja mechanizmu audytu dla operacji na danych.
    </matched_recommendations>

<database_planning_summary>
Główne wymagania dotyczące schematu bazy danych obejmują stworzenie dwóch kluczowych encji: "users" i "words". Encja "users" przechowuje dane użytkowników z unikalnym polem "email" oraz innymi niezbędnymi informacjami. Encja "words" rejestrowana jest jako słowa dodane przez użytkowników i zawiera atrybuty takie jak "ang" słowo w języku angielskim (varchar), "pol" tłumaczenie na język polski (varchar), "example" przykład użycia słowa (varchar), "tags" (przechowywane jako stringi), datę dodania, URL-e dla plików audio oraz dane fonetyczne, używając typu "varchar".  
Relacja między "users" i "words" jest określona jako jeden-do-wielu, co umożliwia przypisanie wielu words do jednego użytkownika. Dla poprawy wydajności zapytań, szczególnie przy sortowaniu i filtrowaniu, planuje się użycie indeksów na kluczowych kolumnach, takich jak data dodania oraz atrybut "tags".  
W zakresie bezpieczeństwa, planuje się wdrożenie polityki na poziomie wierszy (RLS) w encji "words", aby użytkownicy mieli dostęp wyłącznie do swoich danych. Dodatkowo, mechanizm audytu będzie rejestrował operacje CRUD, co ułatwi monitorowanie i debugowanie systemu. Potencjalne skalowalność i wydajność będą wspierane przez odpowiednio dobrane typy danych i indeksy, a ewentualne zmiany w architekturze (np. partycjonowanie) mogą być rozważone w przyszłości.
</database_planning_summary>

<unresolved_issues>
Nie stwierdzono istotnych nierozwiązanych kwestii – obecne decyzje i zalecenia są wystarczające na etapie MVP.
</unresolved_issues>
</conversation_summary>

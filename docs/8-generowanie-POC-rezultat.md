Poniżej propozycja gotowego promptu, który możesz wklejać do swojego generatora PoC:

---

**Kontekst**  
Masz za zadanie wygenerować prosty Proof-of-Concept aplikacji webowej „10xWordUp” w technologii Astro 5 + React 19 + TypeScript 5 + Tailwind 4 + Shadcn/ui z backendem opartym o Supabase (PostgreSQL + SDK + BaaS).

**Zakres PoC**

1. Dodawanie nowych słówek (angielskie słowo + tłumaczenie).
   - Proste formularze bez autoryzacji.
   - Walidacja pól (pole angielskie i polskie wymagane).
   - Automatyczne pobranie: wymowy fonetycznej, linku do audio i przykładów użycia z API dictionaryapi.dev (pierwszy wynik).
   - Zapis do Supabase.
   - Wyświetlenie listy słówek posortowanej od najnowszych.

2. Tryb quizu:
   - Wybór kierunku: EN→PL albo PL→EN.
   - Zakres: wszystkie zapisane słówka.
   - Losowa kolejność.
   - Mechanika samooceny: „Znam” / „Nie znam”.
   - Brak zapisu stanu sesji (po odświeżeniu rozpoczyna się od nowa).

**Wykluczone funkcje (poza zakresem PoC)**

- Rejestracja / logowanie / uprawnienia użytkowników
- Edycja / usuwanie słówek
- System tagów i autouzupełnianie
- Powiadomienia toast
- Paginacja, ciemny motyw, import/eksport, zaawansowany algorytm powtórek (SM-2), offline mode itp.

**Zadanie dla generatora**

1. Najpierw przygotuj szczegółowy plan pracy (task breakdown), w którym:
   - Wypunktujesz poszczególne etapy (konfiguracja projektu, modele danych, serwis Supabase, UI formularza, fetch API, lista, quiz, testowanie).
   - Oszacujesz krótko czas lub złożoność każdego etapu.
2. Wyślij mi ten plan do akceptacji.
3. Po mojej akceptacji przejdź do wygenerowania kodu PoC zgodnego z powyższym zakresem i stosowaną technologią.

**Format odpowiedzi generatora**

- Sekcja “Plan pracy” (task list).
- Po zatwierdzeniu: kod projektu z krótkimi komentarzami.

---

Możesz skopiować i wkleić powyższy prompt do swojego narzędzia, by wygenerować zweryfikowany Proof-of-Concept.

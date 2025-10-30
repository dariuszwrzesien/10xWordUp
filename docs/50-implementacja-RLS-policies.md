# Implementacja Polityk RLS (Row Level Security)

## 📋 Podsumowanie

Dodano polityki Row Level Security do tabel `words`, `tags` i `word_tags`, aby zapewnić izolację danych użytkowników na poziomie bazy danych.

## 🔍 Co to jest RLS?

**Row Level Security (RLS)** to mechanizm bezpieczeństwa PostgreSQL/Supabase, który automatycznie filtruje wiersze na poziomie bazy danych w zależności od kontekstu użytkownika.

### Jak działa:

1. **Bez RLS:** Każdy może zobaczyć wszystkie dane (niebezpieczne!)
2. **RLS włączony bez polityk:** Nikt nie widzi niczego (zbyt restrykcyjne!)
3. **RLS włączony z politykami:** ✅ Każdy użytkownik widzi tylko swoje dane

### Kluczowe funkcje:

- `auth.uid()` - zwraca ID zalogowanego użytkownika z Supabase Auth
- `USING` - określa które wiersze użytkownik może zobaczyć/zmodyfikować
- `WITH CHECK` - określa jakie dane użytkownik może wstawić/zaktualizować

## 📊 Implementowane Polityki

### Tabela: `words`

| Operacja | Polityka                           | Opis                   |
| -------- | ---------------------------------- | ---------------------- |
| SELECT   | `Users can view their own words`   | `auth.uid() = user_id` |
| INSERT   | `Users can insert their own words` | `auth.uid() = user_id` |
| UPDATE   | `Users can update their own words` | `auth.uid() = user_id` |
| DELETE   | `Users can delete their own words` | `auth.uid() = user_id` |

### Tabela: `tags`

| Operacja | Polityka                          | Opis                   |
| -------- | --------------------------------- | ---------------------- |
| SELECT   | `Users can view their own tags`   | `auth.uid() = user_id` |
| INSERT   | `Users can insert their own tags` | `auth.uid() = user_id` |
| UPDATE   | `Users can update their own tags` | `auth.uid() = user_id` |
| DELETE   | `Users can delete their own tags` | `auth.uid() = user_id` |

### Tabela: `word_tags`

| Operacja | Polityka                               | Opis                                     |
| -------- | -------------------------------------- | ---------------------------------------- |
| SELECT   | `Users can view their own word_tags`   | Sprawdza czy słowo należy do użytkownika |
| INSERT   | `Users can insert their own word_tags` | Sprawdza czy słowo należy do użytkownika |
| DELETE   | `Users can delete their own word_tags` | Sprawdza czy słowo należy do użytkownika |

**Uwaga:** Polityki dla `word_tags` są bardziej złożone, bo tabela nie ma kolumny `user_id`. Sprawdzają one własność przez relację z tabelą `words`.

## 🚀 Jak Zastosować Migrację

### Opcja 1: Supabase CLI (Lokalne środowisko)

```bash
# Zastosuj migrację do lokalnej bazy
npx supabase db push

# Lub zresetuj bazę i zastosuj wszystkie migracje
npx supabase db reset
```

### Opcja 2: Supabase Dashboard (Produkcja)

1. Otwórz projekt w [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Przejdź do **SQL Editor**
3. Skopiuj zawartość pliku `supabase/migrations/20251030120000_add_rls_policies.sql`
4. Wklej i wykonaj SQL
5. Sprawdź w **Database** → **Policies** czy polityki zostały dodane

### Opcja 3: Automatyczna migracja (CI/CD)

Jeśli używasz Supabase CLI w pipeline:

```bash
npx supabase db push --linked
```

## 🔧 Zmiany w Kodzie

### ✅ Nie wymaga zmian!

Twój obecny kod już jest dobrze napisany. Filtry `.eq("user_id", userId)` w `WordService` są **dodatkoą warstwą bezpieczeństwa** i mogą zostać:

**Opcja A: Pozostaw filtry (Rekomendowane - Defense in Depth)**

Zalety:

- Dodatkowa warstwa bezpieczeństwa
- Jasny intent w kodzie
- Bezpieczniejsze przy ewentualnych błędach w politykach

```typescript
// Kod pozostaje bez zmian
const { data: word } = await this.supabase
  .from("words")
  .select("*")
  .eq("id", wordId)
  .eq("user_id", userId) // ← Pozostaw to
  .single();
```

**Opcja B: Usuń redundantne filtry (Opcjonalne - Cleaner Code)**

Zalety:

- Mniej kodu
- Pełne zaufanie do RLS
- Łatwiejsze zapytania

```typescript
// Jeśli chcesz usunąć redundancję
const { data: word } = await this.supabase
  .from("words")
  .select("*")
  .eq("id", wordId)
  // .eq("user_id", userId)  // ← RLS robi to automatycznie
  .single();
```

## ⚠️ Ważne: Sprawdź Klucz API

**KRYTYCZNE:** Musisz używać klucza `anon` a NIE `service_role`!

### Sprawdź w `.env`:

```env
# ✅ POPRAWNIE - używaj tego klucza
SUPABASE_KEY=eyJhbGc...  # klucz "anon" (public)

# ❌ ŹLE - ten klucz omija RLS!
SUPABASE_KEY=eyJhbGc...  # klucz "service_role" (omija RLS)
```

### Jak sprawdzić który klucz masz?

1. Przejdź do [Supabase Dashboard](https://supabase.com/dashboard)
2. **Settings** → **API**
3. Znajdź sekcję **Project API keys**
   - **anon** / **public** - używaj tego ✅
   - **service_role** - NIE używaj w aplikacji klienckiej ❌

### Gdzie znaleźć klucze?

Zobacz: `docs/17-gdzie-znalezc-klucze-do-supabase.md`

## 🧪 Testowanie

### 1. Zastosuj migrację

```bash
npx supabase db push
```

### 2. Utwórz dwóch użytkowników

```bash
# Użytkownik 1
curl -X POST http://localhost:4321/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}'

# Użytkownik 2
curl -X POST http://localhost:4321/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user2@test.com","password":"password123"}'
```

### 3. Dodaj słówka dla każdego użytkownika

```bash
# Zaloguj się jako user1
curl -X POST http://localhost:4321/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}'

# Dodaj słówko jako user1
curl -X POST http://localhost:4321/api/words \
  -H "Content-Type: application/json" \
  -H "Cookie: <session_cookie_user1>" \
  -d '{"word":"hello","translation":"cześć","tags":["greetings"]}'

# Zaloguj się jako user2 i dodaj inne słówko
# ... powtórz proces
```

### 4. Sprawdź izolację danych

Zaloguj się jako `user1` i wywołaj:

```bash
GET http://localhost:4321/api/words
```

**Oczekiwany rezultat:** Widzisz TYLKO słówka dodane przez `user1` ✅

### 5. Sprawdź w Supabase Dashboard

1. Przejdź do **Database** → **Tables** → `words`
2. Zobacz wszystkie wiersze (jako admin)
3. Sprawdź czy każde słowo ma poprawny `user_id`

## 🔒 Bezpieczeństwo

### Przed RLS (bez polityk):

```
❌ User A może zobaczyć słówka User B
❌ User A może usunąć słówka User B
❌ Dane są "chronione" tylko w kodzie aplikacji
```

### Po RLS (z politykami):

```
✅ User A widzi TYLKO swoje słówka
✅ User A może modyfikować TYLKO swoje słówka
✅ Ochrona na poziomie BAZY DANYCH (nie do obejścia)
✅ Nawet jeśli ktoś zrobi bezpośrednie zapytanie SQL - RLS zadziała
```

## 📚 Dodatkowe Zasoby

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Best Practices for RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## ✅ Checklist

- [ ] Zastosowano migrację `20251030120000_add_rls_policies.sql`
- [ ] Sprawdzono że używany jest klucz `anon` w `.env`
- [ ] Przetestowano z dwoma użytkownikami
- [ ] Zweryfikowano że każdy użytkownik widzi tylko swoje dane
- [ ] (Opcjonalnie) Usunięto redundantne filtry `.eq("user_id", userId)` z kodu

## 🎯 Rezultat

Po zastosowaniu tych zmian:

1. ✅ **Automatyczna izolacja danych** - każdy użytkownik widzi tylko swoje słówka
2. ✅ **Bezpieczeństwo na poziomie bazy** - nie do ominięcia w kodzie
3. ✅ **Zgodność z best practices** - używasz natywnych mechanizmów Supabase
4. ✅ **Zero zmian w kodzie** - wszystko działa automatycznie

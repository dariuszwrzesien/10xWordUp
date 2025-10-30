# Diagramy RLS - Row Level Security

## 📊 Diagram 1: Jak działa RLS?

```mermaid
sequenceDiagram
    participant Client as Klient (Przeglądarka)
    participant API as API Endpoint
    participant Supabase as Supabase Client
    participant RLS as RLS Engine
    participant DB as PostgreSQL

    Note over Client,DB: Scenariusz: User 1 próbuje pobrać słówka

    Client->>API: GET /api/words (Cookie: user1_session)
    API->>API: requireAuth() → userId = "uuid-user1"
    API->>Supabase: supabase.from("words").select()
    Supabase->>RLS: Zapytanie SQL + auth.uid() = "uuid-user1"

    Note over RLS: RLS dodaje automatycznie:<br/>WHERE user_id = auth.uid()

    RLS->>DB: SELECT * FROM words<br/>WHERE user_id = 'uuid-user1'
    DB-->>RLS: [tylko słówka user1]
    RLS-->>Supabase: Dane po filtracji
    Supabase-->>API: WordDTO[]
    API-->>Client: { data: [słówka user1] }
```

---

## 🔒 Diagram 2: RLS blokuje nieautoryzowany dostęp

```mermaid
sequenceDiagram
    participant User2 as User 2<br/>(Zalogowany)
    participant API as API Endpoint
    participant Supabase as Supabase
    participant RLS as RLS Engine
    participant DB as PostgreSQL

    Note over User2,DB: Scenariusz: User 2 próbuje pobrać słówko User 1

    User2->>API: GET /api/words/{word1-id}<br/>(Cookie: user2_session)
    API->>API: requireAuth() → userId = "uuid-user2"
    API->>Supabase: supabase.from("words")<br/>.select().eq("id", word1-id)
    Supabase->>RLS: Zapytanie + auth.uid() = "uuid-user2"

    Note over RLS: RLS sprawdza politykę:<br/>USING (auth.uid() = user_id)

    RLS->>DB: SELECT * FROM words<br/>WHERE id = 'word1-id'<br/>AND user_id = 'uuid-user2'
    DB-->>RLS: [] (brak wyników)

    Note over RLS: word1-id należy do user1,<br/>nie user2 → brak dostępu

    RLS-->>Supabase: null (brak danych)
    Supabase-->>API: null
    API-->>User2: 404 Not Found
```

---

## 🛡️ Diagram 3: Warstwy bezpieczeństwa (Defense in Depth)

```mermaid
graph TB
    subgraph "Warstwa 1: Autentykacja"
        A[Client Request] --> B{Zalogowany?}
        B -->|Nie| C[401 Unauthorized]
        B -->|Tak| D[userId z tokenu]
    end

    subgraph "Warstwa 2: Kod Aplikacji"
        D --> E[WordService]
        E --> F[".eq('user_id', userId)"]
        F --> G[Filtrowanie w kodzie]
    end

    subgraph "Warstwa 3: RLS (Baza Danych)"
        G --> H[Supabase Client]
        H --> I[RLS Policies]
        I --> J{auth.uid() = user_id?}
        J -->|Nie| K[Brak dostępu]
        J -->|Tak| L[Dostęp przyznany]
    end

    L --> M[PostgreSQL]
    M --> N[Zwrot danych]

    style A fill:#e1f5ff
    style C fill:#ffe1e1
    style K fill:#ffe1e1
    style N fill:#e1ffe1
    style I fill:#fff4e1
```

---

## 📋 Diagram 4: Polityki RLS dla różnych operacji

```mermaid
graph LR
    subgraph "Tabela: words"
        W[words table]
    end

    subgraph "Polityki SELECT"
        S1["Policy: view_own_words<br/>USING (auth.uid() = user_id)"]
    end

    subgraph "Polityki INSERT"
        I1["Policy: insert_own_words<br/>WITH CHECK (auth.uid() = user_id)"]
    end

    subgraph "Polityki UPDATE"
        U1["Policy: update_own_words<br/>USING (auth.uid() = user_id)<br/>WITH CHECK (auth.uid() = user_id)"]
    end

    subgraph "Polityki DELETE"
        D1["Policy: delete_own_words<br/>USING (auth.uid() = user_id)"]
    end

    W --> S1
    W --> I1
    W --> U1
    W --> D1

    style W fill:#e1f5ff
    style S1 fill:#e1ffe1
    style I1 fill:#fff4e1
    style U1 fill:#ffe1f5
    style D1 fill:#ffe1e1
```

---

## 🔍 Diagram 5: Różnica między USING i WITH CHECK

```mermaid
graph TB
    subgraph "USING - Filtrowanie wierszy"
        U1[SELECT] --> U2["USING (auth.uid() = user_id)"]
        U3[UPDATE] --> U2
        U4[DELETE] --> U2
        U2 --> U5["Które wiersze użytkownik<br/>MOŻE ZOBACZYĆ/ZMODYFIKOWAĆ?"]
    end

    subgraph "WITH CHECK - Walidacja danych"
        W1[INSERT] --> W2["WITH CHECK (auth.uid() = user_id)"]
        W3[UPDATE] --> W2
        W2 --> W4["Czy nowe/zmienione dane<br/>SPEŁNIAJĄ WYMAGANIA?"]
    end

    style U5 fill:#e1ffe1
    style W4 fill:#fff4e1
```

---

## 🎯 Diagram 6: Przepływ danych przed i po RLS

### Przed RLS (Niebezpieczne)

```mermaid
graph LR
    U1[User 1] -->|GET /words| API[API]
    U2[User 2] -->|GET /words| API

    API -->|SELECT * FROM words| DB[(Database)]

    DB -->|ALL words| API

    API -->|Filter w kodzie| F1[Words User 1]
    API -->|Filter w kodzie| F2[Words User 2]

    F1 --> U1
    F2 --> U2

    style API fill:#ffe1e1
    Note1[Niebezpieczne!<br/>Dane wszystkich w DB query]
```

### Po RLS (Bezpieczne)

```mermaid
graph LR
    U1[User 1] -->|GET /words<br/>auth.uid() = user1| API[API]
    U2[User 2] -->|GET /words<br/>auth.uid() = user2| API

    API -->|Query + RLS| RLS{RLS Engine}

    RLS -->|SELECT WHERE user_id=user1| DB[(Database)]
    RLS -->|SELECT WHERE user_id=user2| DB

    DB -->|ONLY User 1 words| RLS
    DB -->|ONLY User 2 words| RLS

    RLS --> U1
    RLS --> U2

    style RLS fill:#e1ffe1
    Note1[Bezpieczne!<br/>Izolacja na poziomie DB]
```

---

## 📊 Diagram 7: Polityka dla word_tags (relacyjna)

```mermaid
graph TB
    subgraph "word_tags (bez user_id)"
        WT[word_tags]
        WT1[word_id]
        WT2[tag_id]
    end

    subgraph "Polityka SELECT"
        P1["Policy: view_own_word_tags<br/><br/>USING (<br/>  EXISTS (<br/>    SELECT 1 FROM words<br/>    WHERE words.id = word_tags.word_id<br/>    AND words.user_id = auth.uid()<br/>  )<br/>)"]
    end

    subgraph "Sprawdzenie własności"
        C1[Czy słowo należy<br/>do zalogowanego<br/>użytkownika?]
    end

    WT --> P1
    P1 --> C1
    C1 -->|Tak| A[Dostęp przyznany]
    C1 -->|Nie| D[Dostęp zablokowany]

    style WT fill:#e1f5ff
    style P1 fill:#fff4e1
    style A fill:#e1ffe1
    style D fill:#ffe1e1
```

---

## 🎓 Kluczowe Pojęcia

| Pojęcie        | Opis                                                        | Przykład                                      |
| -------------- | ----------------------------------------------------------- | --------------------------------------------- |
| **RLS**        | Row Level Security - filtrowanie wierszy na poziomie bazy   | Automatyczne `WHERE user_id = auth.uid()`     |
| **auth.uid()** | Funkcja Supabase zwracająca ID zalogowanego użytkownika     | `'550e8400-e29b-41d4-a716-446655440000'`      |
| **USING**      | Określa które wiersze użytkownik może zobaczyć/zmodyfikować | `USING (auth.uid() = user_id)`                |
| **WITH CHECK** | Waliduje czy nowe/zmienione dane spełniają wymagania        | `WITH CHECK (auth.uid() = user_id)`           |
| **Policy**     | Reguła RLS definiująca uprawnienia                          | `create policy "name" on table for select...` |

---

## 🔐 Porównanie: Z RLS vs Bez RLS

| Aspekt             | Bez RLS                           | Z RLS                            |
| ------------------ | --------------------------------- | -------------------------------- |
| **Bezpieczeństwo** | ⚠️ Tylko w kodzie aplikacji       | ✅ Na poziomie bazy danych       |
| **Omijanie**       | ❌ Możliwe przez błędy w kodzie   | ✅ Niemożliwe                    |
| **Zapytania SQL**  | ❌ Zwracają wszystkie dane        | ✅ Automatycznie filtrowane      |
| **Kod aplikacji**  | ⚠️ Musi zawsze filtrować          | ✅ Może, ale nie musi            |
| **Testy**          | ⚠️ Trzeba testować każdy endpoint | ✅ Wystarczy przetestować RLS    |
| **Wydajność**      | ⚠️ Filtrowanie w aplikacji        | ✅ Filtrowanie w bazie (szybsze) |

---

## 📚 Dodatkowe Zasoby

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [RLS Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)

# Struktura aplikacji 10xWordUp

Data utworzenia: 2025-11-01

## Architektura ASCII

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ARCHITEKTURA APLIKACJI                          │
│                              10xWordUp                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────┐
│                            WARSTWA MIDDLEWARE                             │
├───────────────────────────────────────────────────────────────────────────┤
│  src/middleware/index.ts                                                  │
│  ├─ Uwierzytelnianie użytkowników                                         │
│  ├─ Zarządzanie sesjami (Supabase Auth)                                   │
│  ├─ Przekierowania (public/protected routes)                              │
│  └─ Inicjalizacja Supabase Client w locals                                │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                          WARSTWA ROUTINGU (ASTRO)                         │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─ PAGES (Server-Rendered) ─────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  src/pages/                                                         │  │
│  │  ├─ index.astro            → Layout → WordsListView               │  │
│  │  ├─ quiz.astro             → Layout → QuizView                    │  │
│  │  ├─ login.astro            → AuthLayout → LoginForm               │  │
│  │  ├─ register.astro         → AuthLayout → RegisterForm            │  │
│  │  ├─ forgot-password.astro  → AuthLayout → ForgotPasswordForm      │  │
│  │  └─ reset-password.astro   → AuthLayout → ResetPasswordForm       │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─ API ENDPOINTS (REST) ─────────────────────────────────────────────┐  │
│  │                                                                     │  │
│  │  src/pages/api/                                                     │  │
│  │  ├─ auth/                                                           │  │
│  │  │  ├─ login.ts          [POST]                                    │  │
│  │  │  ├─ register.ts       [POST]                                    │  │
│  │  │  ├─ logout.ts         [POST]                                    │  │
│  │  │  ├─ forgot-password.ts [POST]                                   │  │
│  │  │  └─ reset-password.ts  [POST]                                   │  │
│  │  │                                                                  │  │
│  │  ├─ words/                                                          │  │
│  │  │  ├─ index.ts          [GET, POST]                               │  │
│  │  │  └─ [id].ts           [GET, PUT, DELETE]                        │  │
│  │  │                                                                  │  │
│  │  └─ tags/                                                           │  │
│  │     ├─ index.ts          [GET, POST]                               │  │
│  │     └─ [id].ts           [PUT, DELETE]                             │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                      WARSTWA LAYOUTS (ASTRO STATIC)                       │
├───────────────────────────────────────────────────────────────────────────┤
│  src/layouts/                                                             │
│  ├─ Layout.astro          → Główny layout (header z UserMenu)            │
│  └─ AuthLayout.astro      → Layout dla stron autoryzacji                 │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                    WARSTWA WIDOKÓW (REACT INTERACTIVE)                    │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─ WORDS LIST VIEW ──────────────────────────────────────────────────┐  │
│  │  src/components/views/WordsListView.tsx                            │  │
│  │  └─ Providers                                                       │  │
│  │     └─ useWordsManagement (Hook)                                    │  │
│  │        ├─ WordsTable                                                │  │
│  │        │  └─ WordsTableRow                                          │  │
│  │        ├─ TagFilter                                                 │  │
│  │        ├─ WordFormDialog                                            │  │
│  │        ├─ DeleteWordDialog                                          │  │
│  │        ├─ WordsPagination                                           │  │
│  │        └─ EmptyState                                                │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─ QUIZ VIEW ────────────────────────────────────────────────────────┐  │
│  │  src/components/views/quiz/QuizView.tsx                            │  │
│  │  └─ Providers                                                       │  │
│  │     └─ useQuiz (Hook)                                               │  │
│  │        ├─ QuizSetup          (State: setup)                         │  │
│  │        ├─ QuizSession        (State: session)                       │  │
│  │        │  ├─ QuizHeader                                             │  │
│  │        │  └─ QuizCard                                               │  │
│  │        └─ QuizSummary        (State: summary)                       │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─ AUTH FORMS ───────────────────────────────────────────────────────┐  │
│  │  src/components/auth/                                               │  │
│  │  ├─ LoginForm.tsx                                                   │  │
│  │  ├─ RegisterForm.tsx                                                │  │
│  │  ├─ ForgotPasswordForm.tsx                                          │  │
│  │  └─ ResetPasswordForm.tsx                                           │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  ┌─ LAYOUT COMPONENTS ────────────────────────────────────────────────┐  │
│  │  src/components/layout/                                             │  │
│  │  └─ UserMenu.tsx          → Dropdown z menu użytkownika             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                     WARSTWA HOOKÓW (REACT LOGIC)                          │
├───────────────────────────────────────────────────────────────────────────┤
│  src/hooks/                                                               │
│  ├─ useWordsManagement.ts                                                │
│  │  ├─ useQuery (TanStack Query)                                         │
│  │  │  ├─ Fetch words (paginated, filtered)                              │
│  │  │  └─ Fetch tags                                                     │
│  │  ├─ useMutation                                                        │
│  │  │  ├─ Create word                                                    │
│  │  │  ├─ Update word                                                    │
│  │  │  └─ Delete word                                                    │
│  │  └─ State Management (modals, filters, pagination)                    │
│  │                                                                        │
│  └─ useQuiz.ts                                                            │
│     ├─ useQuery (TanStack Query)                                          │
│     │  └─ Fetch words for quiz                                           │
│     └─ State Management (quiz state machine, answers, progress)          │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                      WARSTWA USŁUG (BUSINESS LOGIC)                       │
├───────────────────────────────────────────────────────────────────────────┤
│  src/lib/services/                                                        │
│  ├─ word.service.ts                                                       │
│  │  ├─ getWords()           → DB query z filtrowaniem i paginacją        │
│  │  ├─ getWordById()        → DB query pojedynczego słowa                │
│  │  ├─ createWord()         → DB insert + dictionary API integration     │
│  │  ├─ updateWord()         → DB update + re-fetch dictionary            │
│  │  └─ deleteWord()         → DB delete                                  │
│  │                                                                        │
│  ├─ tag.service.ts                                                        │
│  │  ├─ getTags()            → DB query tagów użytkownika                 │
│  │  ├─ createTag()          → DB insert (unique per user)                │
│  │  ├─ updateTag()          → DB update                                  │
│  │  └─ deleteTag()          → DB delete + cleanup word_tags              │
│  │                                                                        │
│  └─ auth.service.ts (via helpers)                                         │
│     ├─ login()              → Supabase Auth                              │
│     ├─ register()           → Supabase Auth                              │
│     ├─ logout()             → Supabase Auth                              │
│     ├─ forgotPassword()     → Supabase Auth                              │
│     └─ resetPassword()      → Supabase Auth                              │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                         WARSTWA WALIDACJI (ZOD)                           │
├───────────────────────────────────────────────────────────────────────────┤
│  src/lib/schemas/                                                         │
│  ├─ auth.schema.ts         → LoginSchema, RegisterSchema, etc.           │
│  ├─ word.schema.ts         → WordFormSchema, WordCreateDTO, etc.         │
│  └─ tag.schema.ts          → TagFormSchema, TagDTO, etc.                 │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                        WARSTWA BAZY DANYCH                                │
├───────────────────────────────────────────────────────────────────────────┤
│  src/db/supabase.client.ts                                                │
│  └─ createSupabaseServerInstance()                                        │
│                                                                           │
│  SUPABASE (PostgreSQL + Auth)                                             │
│  ├─ Tables:                                                               │
│  │  ├─ users         (auth.users - managed by Supabase)                  │
│  │  ├─ words         (user_id, word, translation, phonetic, etc.)        │
│  │  ├─ tags          (user_id, name)                                     │
│  │  └─ word_tags     (word_id, tag_id) [join table]                      │
│  │                                                                        │
│  └─ RLS Policies:    (Row Level Security - każdy user widzi swoje dane)  │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                       WARSTWA TYPÓW (TYPESCRIPT)                          │
├───────────────────────────────────────────────────────────────────────────┤
│  src/types/                                                               │
│  ├─ database.types.ts      → Typy generowane z Supabase schema           │
│  └─ dto.types.ts           → DTOs, Entities dla frontend/backend         │
└───────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌───────────────────────────────────────────────────────────────────────────┐
│                        WARSTWA UI (SHADCN/UI)                             │
├───────────────────────────────────────────────────────────────────────────┤
│  src/components/ui/                                                       │
│  ├─ button.tsx                                                            │
│  ├─ card.tsx                                                              │
│  ├─ dialog.tsx                                                            │
│  ├─ form.tsx                                                              │
│  ├─ input.tsx                                                             │
│  ├─ select.tsx                                                            │
│  ├─ table.tsx                                                             │
│  ├─ alert-dialog.tsx                                                      │
│  ├─ dropdown-menu.tsx                                                     │
│  ├─ pagination.tsx                                                        │
│  ├─ radio-group.tsx                                                       │
│  ├─ progress.tsx                                                          │
│  ├─ skeleton.tsx                                                          │
│  └─ sonner.tsx            (Toast notifications)                           │
└───────────────────────────────────────────────────────────────────────────┘
```

## Przepływ danych

```
USER REQUEST
     ↓
MIDDLEWARE (Auth Check)
     ↓
ASTRO PAGE (SSR)
     ↓
REACT VIEW (client:load)
     ↓
CUSTOM HOOK (TanStack Query)
     ↓
API ENDPOINT (/api/*)
     ↓
SERVICE LAYER (Business Logic)
     ↓
ZOD VALIDATION
     ↓
SUPABASE CLIENT (DB Operations)
     ↓
POSTGRESQL + RLS
     ↓
RESPONSE
     ↓
REACT STATE UPDATE
     ↓
UI RE-RENDER
```

## Zewnętrzne integracje

```
┌────────────────────┐
│ Dictionary API     │  ← word.service.ts (fetch phonetic, audio, examples)
│ dictionaryapi.dev  │
└────────────────────┘

┌────────────────────┐
│ Supabase Auth      │  ← auth endpoints (register, login, reset password)
│ (JWT Sessions)     │
└────────────────────┘

┌────────────────────┐
│ Howler.js          │  ← Audio playback w WordsTable
└────────────────────┘
```

## Kluczowe zależności

### Frontend

- **React 19** - Komponenty interaktywne
- **TanStack Query** - Data fetching, caching, mutations
- **React Hook Form** - Zarządzanie formularzami
- **Zod** - Walidacja form (z RHF)
- **Tailwind CSS 4** - Stylowanie
- **Shadcn/ui** - Komponenty UI
- **Lucide React** - Ikony
- **Howler.js** - Audio player

### Backend

- **Astro 5** - SSR, routing, API endpoints
- **Supabase Client** - DB operations + Auth
- **Zod** - Walidacja API payloads

### Testing

- **Vitest** - Unit tests
- **Playwright** - E2E tests

## Legenda

- `→` - Zawiera/Używa
- `├─` - Część struktury
- `↓` - Przepływ danych w dół
- `[]` - HTTP Methods
- `()` - Dodatkowe informacje

## Kluczowe zasady architektury

### Separacja warstw

1. **Middleware** - obsługa autoryzacji i sesji
2. **Routing** - Astro pages (SSR) + API endpoints
3. **Views** - React components (interaktywność)
4. **Hooks** - logika biznesowa front-endu
5. **Services** - logika biznesowa back-endu
6. **Database** - Supabase z RLS

### Wzorce projektowe

- **Repository Pattern** - services dla dostępu do danych
- **Custom Hooks Pattern** - hermetyzacja logiki React
- **Provider Pattern** - TanStack Query dla state management
- **Composition Pattern** - małe, reużywalne komponenty UI

### Bezpieczeństwo

- **RLS (Row Level Security)** - każdy user widzi tylko swoje dane
- **JWT Authentication** - Supabase Auth
- **Zod Validation** - walidacja na granicy systemu (API endpoints)
- **CSRF Protection** - poprzez Supabase session cookies

### Wydajność

- **Server-Side Rendering** - Astro pages
- **Client-Side Hydration** - React `client:load`
- **Query Caching** - TanStack Query
- **Code Splitting** - automatyczne przez Astro
- **Image Optimization** - Astro Image



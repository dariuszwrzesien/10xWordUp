Wykorzystując @supabase-auth.mdc zaimplementuj backend pod stronę @register.astro i komponent @RegisterForm.tsx

Logika powinna być spójna z @login.astro oraz @LoginForm.tsx

Weź pod uwagę że Supabase po rejestracji wysyła link do potwierdzenia konta przez użytkownika - obsłużyć ten komunikat w interfejsie formularza (np. przez wyświetlenie powiadomienia po submit).

Upewnij się, że:
dane użytkownika są walidowane po stronie klienta i serwera,
błędy z Supabase są poprawnie przechwytywane i prezentowane w UI,
kod jest napisany w sposób czysty, modułowy i zgodny z konwencjami.

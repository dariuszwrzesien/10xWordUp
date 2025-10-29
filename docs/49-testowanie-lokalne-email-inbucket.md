# Testowanie E-maili Lokalnie z Inbucket

## Problem

W lokalnej wersji Supabase e-maile **NIE są wysyłane na prawdziwe adresy**. Zamiast tego są przechwytywane przez **Inbucket** - lokalny serwer testowy e-maili.

## Rozwiązanie: Inbucket Web Interface

### 1. Dostęp do Inbucket

Kiedy masz uruchomiony lokalny Supabase (`supabase start`), Inbucket jest dostępny pod adresem:

```
http://localhost:54324
```

lub

```
http://127.0.0.1:54324
```

### 2. Jak Testować Reset Hasła Lokalnie

#### Krok po kroku:

1. **Uruchom Supabase lokalnie:**

   ```bash
   supabase start
   ```

2. **Uruchom aplikację:**

   ```bash
   npm run dev
   ```

3. **Otwórz Inbucket w przeglądarce:**

   ```
   http://localhost:54324
   ```

4. **Przejdź do formularza resetowania hasła:**

   ```
   http://localhost:4321/forgot-password
   ```

   (lub port który używasz - może być 3000)

5. **Wprowadź e-mail użytkownika:**
   - Użyj e-maila użytkownika który istnieje w lokalnej bazie danych
   - Przykład: `test@example.com`

6. **Kliknij "Wyślij link resetujący"**

7. **Sprawdź Inbucket:**
   - Wróć do zakładki z `http://localhost:54324`
   - Zobaczysz listę "skrzynek pocztowych"
   - Kliknij na adres e-mail do którego wysłałeś link (np. `test@example.com`)
   - Zobaczysz e-mail z linkiem resetującym hasło

8. **Kliknij link w e-mailu:**
   - Link będzie wyglądał mniej więcej tak:

   ```
   http://127.0.0.1:3000/reset-password#access_token=...&type=recovery
   ```

   - **UWAGA:** Port może być inny (3000, 4321, itp.) w zależności od twojej konfiguracji w `supabase/config.toml`

9. **Ustaw nowe hasło**

10. **Zaloguj się używając nowego hasła**

## Konfiguracja (już skonfigurowane)

W pliku `supabase/config.toml` sekcja Inbucket:

```toml
# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
```

### Dostępne porty dla Inbucket (opcjonalne):

Możesz odkomentować dodatkowe porty jeśli chcesz testować aplikacje które wysyłają e-maile:

```toml
# smtp_port = 54325
# pop3_port = 54326
```

## Konfiguracja URL w Auth

W `supabase/config.toml` sprawdź/zaktualizuj sekcję `[auth]`:

```toml
[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
```

### ⚠️ WAŻNE: Dopasuj port do swojej aplikacji

Jeśli twoja aplikacja Astro działa na innym porcie (np. 4321), **MUSISZ** zaktualizować `site_url`:

```toml
site_url = "http://127.0.0.1:4321"
additional_redirect_urls = ["https://127.0.0.1:4321"]
```

**Po zmianie config.toml, zrestartuj Supabase:**

```bash
supabase stop
supabase start
```

## Dodatkowe Wskazówki

### 1. Sprawdzanie który port używa Astro

Kiedy uruchamiasz `npm run dev`, sprawdź output w terminalu:

```
  🚀  astro  v5.x.x started in Xms

  ┃ Local    http://localhost:4321/
  ┃ Network  use --host to expose
```

Użyj tego portu w konfiguracji Supabase.

### 2. Lista wszystkich portów Supabase Local

Kiedy uruchamiasz `supabase start`, zobaczysz listę wszystkich dostępnych usług:

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324    <-- TO JEST TO!
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJ...
service_role key: eyJ...
```

### 3. Debugowanie problemów z linkami

Jeśli link w e-mailu prowadzi do złego portu:

1. Sprawdź `site_url` w `supabase/config.toml`
2. Zrestartuj Supabase (`supabase stop && supabase start`)
3. Wyślij nowy request resetowania hasła
4. Sprawdź nowy e-mail w Inbucket

### 4. Ręczne testowanie tokenu

Jeśli chcesz zobaczyć surowy token, w Inbucket kliknij "View Source" lub "View HTML" aby zobaczyć pełną treść e-maila z tokenem.

## Produkcja vs Lokalne Środowisko

### Lokalne (Development):

- ✅ Inbucket przechwytuje wszystkie e-maile
- ✅ Dostęp do wszystkich e-maili przez http://localhost:54324
- ✅ Nie potrzeba konfiguracji SMTP
- ✅ Idealne do testowania

### Produkcja:

- ❌ Inbucket NIE jest dostępny
- ✅ Supabase wysyła prawdziwe e-maile
- ✅ Możesz skonfigurować własny SMTP (opcjonalnie)
- ✅ Możesz dostosować szablony e-maili w Supabase Dashboard

## Konfiguracja SMTP dla Produkcji (opcjonalnie)

Jeśli chcesz używać własnego serwera SMTP w produkcji, odkomentuj i skonfiguruj:

```toml
# Use a production-ready SMTP server
[auth.email.smtp]
enabled = true
host = "smtp.sendgrid.net"
port = 587
user = "apikey"
pass = "env(SENDGRID_API_KEY)"
admin_email = "admin@email.com"
sender_name = "Admin"
```

Popularne opcje SMTP:

- **SendGrid** - 100 e-maili/dzień za darmo
- **Mailgun** - 1000 e-maili/miesiąc za darmo
- **AWS SES** - bardzo tanie, wymaga weryfikacji domeny
- **Resend** - nowoczesne, developer-friendly

## Częste Problemy i Rozwiązania

### Problem 1: "Nie widzę e-maila w Inbucket"

**Rozwiązanie:**

1. Sprawdź czy Supabase jest uruchomiony: `supabase status`
2. Sprawdź czy Inbucket jest enabled w config.toml
3. Sprawdź console log - czy jest błąd w endpoincie?
4. Sprawdź czy e-mail użytkownika istnieje w bazie
5. Odśwież stronę Inbucket (F5)

### Problem 2: "Link w e-mailu prowadzi do złego portu"

**Rozwiązanie:**

1. Zaktualizuj `site_url` w `supabase/config.toml`
2. Zrestartuj Supabase: `supabase stop && supabase start`
3. Wyślij nowy request resetowania hasła

### Problem 3: "Strona Inbucket nie ładuje się"

**Rozwiązanie:**

1. Sprawdź czy port 54324 nie jest zajęty: `lsof -i :54324`
2. Sprawdź czy Supabase działa: `supabase status`
3. Spróbuj inną przeglądarkę
4. Sprawdź firewall/antywirus

### Problem 4: "Token expired" po kliknięciu linku

**Rozwiązanie:**

1. Tokeny resetujące są ważne 1 godzinę (konfiguracja w config.toml)
2. Wyślij nowy link resetujący
3. Sprawdź `otp_expiry` w sekcji `[auth.email]`

## Podsumowanie

✅ Inbucket działa automatycznie z lokalnym Supabase  
✅ Dostęp: http://localhost:54324  
✅ Wszystkie e-maile są tam widoczne  
✅ Nie potrzeba konfiguracji SMTP  
✅ Idealne do testowania  
✅ Zero kosztów  
✅ Natychmiastowe dostarczanie

**Następny krok:** Otwórz http://localhost:54324 i przetestuj reset hasła! 🚀

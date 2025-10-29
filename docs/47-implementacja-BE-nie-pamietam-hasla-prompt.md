Wykorzystując instrukcje z @supabase-auth.mdc zaimplementuj pełny mechanizm odzyskiwania hasła:

Utwórz backendową obsługę dla strony @forgot-password.astro oraz komponentu @ForgotPasswordForm.tsx – formularz powinien przyjmować adres e-mail użytkownika i wysyłać link resetujący hasło przy użyciu supabase.

Zmodyfikuj stronę @reset-password.astro oraz komponent @ResetPasswordForm.tsx który:
Odczytuje token resetu z URL,
Pozwala użytkownikowi ustawić nowe hasło za pomocą supabase
Po pomyślnym ustawieniu nowego hasła automatycznie loguje użytkownika.
Zachowaj spójność logiki i stylu z istniejącymi plikami @login.astro oraz @LoginForm.tsx

Używaj tych samych funkcji pomocniczych i metod obsługi błędów,
Zachowaj ten sam system walidacji formularzy i komunikatów.

Zadbaj o:
Czytelny flow: użytkownik → formularz → e-mail → reset → nowy password → sukces,
Obsługę błędów (np. nieistniejący e-mail, przeterminowany token),
Komunikaty sukcesu i porażki,

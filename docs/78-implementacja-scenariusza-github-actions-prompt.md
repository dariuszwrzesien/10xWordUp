Jesteś specjalistą GitHub Actions w stacku @tech-stack.md @package.json

Utwórz scenariusz "pull-request.yml" na podstawie @github-action.mdc

Workflow:
Scenariusz "pull-request.yml" powinien działać następująco:

- Lintowanie kodu
- Następnie dwa równoległe - unit-test i e2e-test
- Finalnie - status-comment (komentarz do PRa o statusie całości)

Dodatkowe uwagi:

- status-comment uruchamia się tylko kiedy poprzedni zestaw 3 przejdzie poprawnie
- w jobie e2e pobieraj przeglądarki wg @playwright.config.ts
- w jobie e2e ustaw środowisko "test" i zmienne z sekretów wg:
  SUPABASE_URL=
  SUPABASE_KEY=
  SUPABASE_ACCESS_TOKEN=

E2E_USERNAME_ID=
E2E_USERNAME=
E2E_PASSWORD=

- zbieraj coverage unit testów i testów e2e

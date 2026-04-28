# Playwright + Cucumber + TypeScript Automation Framework

Scalable UI automation framework using:
- Playwright (UI interactions + assertions)
- Cucumber (BDD feature files)
- TypeScript (typed, maintainable test code)
- Page Object Model (POM)

## Tech Stack
- Node.js
- TypeScript
- `@playwright/test`
- `@cucumber/cucumber`
- `@faker-js/faker`

## Project Structure

```text
src/
  bdd/
    features/               # Gherkin feature files
      home.feature
      login.feature
      search.feature
      signup.feature
    step-definitions/       # Cucumber step implementations
      login.steps.ts
    support/                # Cucumber hooks and custom world
      hooks.ts
      world.ts

  fixtures/                 # Static test data (JSON)
    auth/
      loginUsers.json
      phones.json
    signup/
      users.json

  pages/                    # Page Object Model classes
    BasePage.ts
    PageManager.ts
    HomePage.ts
    LoginPage.ts
    SearchPage.ts
    SignUpPage.ts

  utils/                    # Reusable helpers
    dataFactory.ts
    env.ts
    fixtureLoader.ts

tests/                      # Playwright spec tests
  home.spec.ts
  login.spec.ts
  search.spec.ts
  signup.spec.ts
```

## Framework Design

### 1. Page Object Model
- All selectors and page actions live in `src/pages/*`.
- Step files and test files should call page methods, not raw selectors.

### 2. Custom World (Cucumber)
- `src/bdd/support/world.ts` shares:
  - `browser`
  - `context`
  - `page`
  - `pages` (from `PageManager`)
  - scenario-scoped transient data

### 3. Hooks
- `src/bdd/support/hooks.ts` handles lifecycle:
  - browser/context/page setup
  - screenshot on scenario failure
  - cleanup

### 4. Data Management
- Static data from JSON fixtures in `src/fixtures`.
- Dynamic data via Faker in `src/utils/dataFactory.ts`.
- Fixture loading via `src/utils/fixtureLoader.ts`.

## Setup

```bash
npm install
npx playwright install
```

## Run Tests

### Playwright tests
```bash
npm run test:pw
```

### Cucumber BDD tests
```bash
npm run bdd
```

### Run tagged BDD tests
```bash
npm run bdd:login
```

### Run both
```bash
npm run test:all
```

## Reports

### Playwright report
- Generated at: `reports/playwright/`
- Open with:
```bash
npm run report:pw
```

### Cucumber report
- Generated at: `reports/cucumber/cucumber-report.html`
- Open with:
```bash
npm run report:cucumber
```

## Environment Variables

Configured in `src/utils/env.ts`:
- `BASE_URL` (default: `https://6valley-testing.6amdev.xyz`)
- `HEADLESS` (`false` to run headed)
- `DEFAULT_TIMEOUT_MS` (default timeout for cucumber steps)

Example:
```bash
BASE_URL="https://example.com" HEADLESS=false npm run bdd
```

## Best Practices
- Keep selectors inside page classes only.
- Keep step definitions readable and business-focused.
- Reuse page methods for common actions/assertions.
- Use fixtures for stable data and Faker for dynamic values.
- Prefer adding new scenarios in `.feature` files first, then implement steps.

## Notes
- Current BDD step implementation exists for login scenarios in `src/bdd/step-definitions/login.steps.ts`.
- `home.feature`, `search.feature`, and `signup.feature` are added and ready for step definition implementation.

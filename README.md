# [10xWordUp](https://10xwordup-vercel.vercel.app/)

A web application for saving and learning English vocabulary using a flashcard system. It helps users memorize new words by providing translations, phonetic pronunciation, audio examples, and an interactive quiz mode.

**https://10xwordup-vercel.vercel.app/**


## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Tech Stack

### Frontend

- **Astro 5**: For building fast, content-focused websites.
- **React 19**: For creating interactive user interface components.
- **TypeScript 5**: For strong typing and improved developer experience.
- **Tailwind 4**: A utility-first CSS framework for rapid UI development.
- **Shadcn/ui**: A collection of accessible and reusable UI components.

### Backend

- **Supabase**: An open-source Firebase alternative providing:
  - PostgreSQL Database
  - Backend-as-a-Service (BaaS) SDK
  - User Authentication

### CI/CD & Hosting

- **GitHub Actions**: For automating CI/CD pipelines.
- **DigitalOcean**: For hosting the application via a Docker image.

### Testing

- **Vitest**: For fast unit and integration testing.
- **React Testing Library**: For testing React components in a user-centric way.
- **Playwright**: For reliable end-to-end testing across all modern browsers.

## Getting Started Locally

Follow these steps to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) version **22.14.0**. We recommend using a version manager like [nvm](https://github.com/nvm-sh/nvm).

  ```bash
  nvm use
  ```

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/10xWordUp.git
    cd 10xWordUp
    ```

2.  **Install dependencies:**

    This project uses npm as its package manager.

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the root of the project and add the necessary environment variables for Supabase. You can get these from your Supabase project dashboard.

    ```env
    PUBLIC_SUPABASE_URL="your-supabase-project-url"
    PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
    ```

    The application also uses the [Free Dictionary API](https://dictionaryapi.dev/), which does not require an API key.

### Running the Application

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

## Available Scripts

The following scripts are available in the `package.json`:

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Lints the codebase for errors.
- `npm run lint:fix`: Lints the codebase and automatically fixes issues.
- `npm run format`: Formats the code using Prettier.

### Testing Commands

- `npm test`: Runs unit tests with Vitest.
- `npm run test:watch`: Runs unit tests in watch mode.
- `npm run test:ui`: Opens Vitest UI for interactive testing.
- `npm run test:coverage`: Generates code coverage report.
- `npm run test:e2e`: Runs end-to-end tests with Playwright.
- `npm run test:e2e:ui`: Opens Playwright UI for interactive E2E testing.
- `npm run test:e2e:debug`: Runs E2E tests in debug mode.
- `npm run test:e2e:report`: Shows the Playwright test report.

## Project Scope

### Key Features

- **User Authentication**: Secure user registration and login with email and password.
- **Word Management**: Add, edit, and delete English words with Polish translations and optional tags.
- **API Integration**: Automatically fetches phonetic pronunciation, audio files, and usage examples from `dictionaryapi.dev`.
- **Word List**: Displays all saved words, sorted from newest to oldest.
- **Tagging System**: Organize words with tags, with autocomplete for existing tags.
- **Quiz Mode**:
  - Two directions: English to Polish (EN→PL) and Polish to English (PL→EN).
  - Filter words for the quiz by tag or include all words.
  - Self-assessment mechanic ("I know" / "I don't know").
- **Notifications**: Toast notifications to provide feedback on user actions.

## Project Status

This project is currently **in development**. It is not yet ready for production use.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

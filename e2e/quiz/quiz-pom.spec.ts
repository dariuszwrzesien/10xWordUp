import { test, expect } from "@playwright/test";
import { test as authenticatedTest } from "../fixtures/auth.fixture";
import {
  QuizPage,
  QuizSetupComponent,
  QuizSessionComponent,
  QuestionCardComponent,
  QuizSummaryComponent,
} from "../pages";
import { seedQuizTestData, seedWords } from "../helpers/db-seed.helper";
import { cleanupUserData } from "../helpers/db-cleanup.helper";

/**
 * Quiz E2E Tests using Page Object Model
 * Based on scenarios from docs/64-scenariusze-testowania-e2e.md
 *
 * Test Isolation Strategy:
 * - Each test gets isolated browser context via authenticatedTest fixture
 * - beforeEach: Clean existing data + seed fresh test data
 * - afterEach: Clean up all test data
 * - This ensures each test starts with known state and doesn't affect others
 * - Tests use 1 worker globally to prevent race conditions with shared test user
 */

test.describe("Quiz - Setup and Configuration", () => {
  /**
   * Setup: Seed test data before each test
   * Note: beforeEach hooks cannot use fixture parameters
   * We get userId from environment variables directly
   */
  authenticatedTest.beforeEach(async () => {
    const userId = process.env.E2E_USERNAME_ID;
    if (!userId) {
      throw new Error("E2E_USERNAME_ID must be set in .env.test");
    }

    const config = {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    };

    // Clean up existing data first to ensure clean slate
    await cleanupUserData(userId, config);

    // Seed test data for quiz (10 words with tags)
    await seedQuizTestData(userId, config);
  });

  /**
   * Cleanup: Remove test data after each test
   * This prevents data leakage between tests
   */
  authenticatedTest.afterEach(async () => {
    const userId = process.env.E2E_USERNAME_ID;
    if (!userId) return;

    const config = {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    };

    await cleanupUserData(userId, config);
  });
  /**
   * TC-QUIZ-001: Rozpoczęcie quizu - konfiguracja parametrów
   * 
   * Preconditions: Użytkownik ma co najmniej 10 słówek w bazie
   * 
   * Steps:
   * 1. Użytkownik klika "Quiz" w menu nawigacyjnym
   * 2. Otwiera się strona `/quiz` w stanie "setup"
   * 3. Komponent QuizSetup wyświetla formularz konfiguracji
   * 4. Użytkownik wybiera kierunek: EN→PL
   * 5. Użytkownik ustawia zakres: wszystkie słówka (bez filtra po tagu)
   * 6. Użytkownik klika "Rozpocznij Quiz"
   * 
   * Expected Result:
   * - useQuiz przełącza stan z "setup" na "session"
   * - Wykonuje się query po słówka użytkownika
   * - Renderuje się komponent QuizSession z pierwszym pytaniem
   * - Widoczny QuizHeader z postępem
   * - Widoczny QuizCard z pytaniem
   */
  authenticatedTest("TC-QUIZ-001: Configure and start quiz", async ({ page, authenticatedUser }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);

    // Step 1 & 2: Navigate to /quiz page
    await quizPage.navigate();
    
    // Step 3: Verify setup form is visible
    await quizSetup.expectSetupVisible();
    
    // Verify setup card components are present
    await expect(quizSetup.setupCard).toBeVisible();
    await expect(quizSetup.directionEnPl).toBeVisible();
    await expect(quizSetup.directionPlEn).toBeVisible();
    await expect(quizSetup.scopeAll).toBeVisible();
    await expect(quizSetup.startButton).toBeVisible();

    // Step 4: Select direction EN→PL
    await quizSetup.selectDirectionEnPl();
    
    // Step 5: Select scope "all words" (no tag filter)
    await quizSetup.selectScopeAll();
    
    // Verify tag selector is not visible when "all" is selected
    await quizSetup.expectTagSelectorHidden();
    
    // Verify start button is enabled
    await quizSetup.expectStartButtonEnabled();

    // Step 6: Click "Start Quiz"
    await quizSetup.clickStart();

    // Expected Result: Quiz session should start
    // Wait for state transition from "setup" to "loading" to "session"
    // The quiz goes through: setup -> loading -> session states
    await quizSession.waitForSession();
    
    // Verify quiz session is now visible
    await quizSession.expectSessionVisible();
    
    // Verify session state is active
    expect(await quizPage.isSessionState()).toBe(true);
    
    // Verify setup is no longer visible
    expect(await quizPage.isSetupState()).toBe(false);
    
    // Verify progress bar and header are displayed
    await expect(quizSession.progressBar).toBeVisible();
    await expect(quizSession.progressText).toBeVisible();
    await expect(quizSession.directionDisplay).toBeVisible();
    
    // Verify direction is displayed correctly (EN → PL)
    await quizSession.expectDirection("Angielski → Polski");
    
    // Verify first question is displayed
    await expect(quizSession.questionNumber).toBeVisible();
    
    // Verify quit button is available
    await expect(quizSession.quitButton).toBeVisible();
    
    // Additional verification: Check that we have progress tracking
    const progressText = await quizSession.getProgressText();
    expect(progressText).toMatch(/Postęp: 0 \/ \d+/);
  });

  /**
   * TC-QUIZ-002: Próba rozpoczęcia quizu bez słówek w bazie
   * 
   * Preconditions: Użytkownik NIE MA żadnych słówek w bazie
   * 
   * Steps:
   * 1. Użytkownik otwiera `/quiz`
   * 2. Użytkownik konfiguruje quiz (kierunek EN→PL, zakres: wszystkie słówka)
   * 3. Użytkownik klika "Rozpocznij Quiz"
   * 4. useQuiz wykonuje query po słówka i zwraca pustą tablicę
   * 5. System wyświetla błąd i pozostaje w stanie setup
   * 
   * Expected Result:
   * - Toast notification: "Brak słówek dla wybranego zakresu"
   * - Quiz pozostaje w stanie setup (nie przechodzi do session)
   * - Użytkownik może kliknąć "Powrót do listy słówek" aby dodać słówka
   * 
   * Note: Current implementation checks for empty words AFTER user clicks Start,
   * not before. This is different from the original scenario but matches actual behavior.
   */
  authenticatedTest("TC-QUIZ-002: No words available", async ({ page, authenticatedUser }) => {
    // This test requires empty words database
    const userId = process.env.E2E_USERNAME_ID;
    if (!userId) {
      throw new Error("E2E_USERNAME_ID must be set in .env.test");
    }

    const config = {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    };

    // Clean up all user data to ensure empty state (no words, no tags)
    await cleanupUserData(userId, config);

    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);

    // Step 1: Navigate to /quiz page
    await quizPage.navigate();
    
    // Wait for setup to load
    await quizSetup.expectSetupVisible();

    // Step 2: Configure quiz - select direction EN→PL
    await quizSetup.selectDirectionEnPl();
    
    // Select scope "all words"
    await quizSetup.selectScopeAll();
    
    // Verify start button is enabled (user can try to start)
    await quizSetup.expectStartButtonEnabled();

    // Step 3: Click "Start Quiz"
    // We need to handle this differently because clicking will trigger navigation
    // and we want to verify the error state
    await quizSetup.startButton.click();
    
    // Step 4 & 5: System queries for words, gets empty array, shows error
    // Wait for loading state to complete
    await page.waitForTimeout(1000); // Brief wait for API call
    
    // Expected Result: Quiz should stay in setup state (not transition to session)
    // The error handling in useQuiz sets state back to 'setup' when no words found
    await quizSetup.expectSetupVisible();
    expect(await quizPage.isSetupState()).toBe(true);
    expect(await quizPage.isSessionState()).toBe(false);
    
    // Expected Result: Verify "Back to words" button is visible (CTA to add words)
    await expect(quizSetup.backToWordsButton).toBeVisible();
    
    // Verify clicking "Back to words" navigates to home page
    await quizSetup.clickBackToWords();
    await expect(page).toHaveURL('/');
  });

  /**
   * TC-QUIZ-003: Rozpoczęcie quizu z filtrem po tagu
   * 
   * Preconditions: Użytkownik ma słówka z różnymi tagami: "business" (5 słówek), "greetings" (4 słówka)
   * Note: Test data is seeded in beforeEach - we use "greetings" tag which has 4 words
   * 
   * Steps:
   * 1. Użytkownik otwiera `/quiz`
   * 2. Użytkownik wybiera kierunek: EN→PL
   * 3. Użytkownik wybiera zakres: z tagiem
   * 4. Użytkownik wybiera tag: "greetings"
   * 5. Użytkownik klika "Rozpocznij Quiz"
   * 
   * Expected Result:
   * - Quiz zawiera tylko słówka z tagu "greetings"
   * - Kierunek zgodnie z wyborem (EN → PL)
   * - Quiz session się rozpoczyna
   * 
   * Verification:
   * - Quiz przechodzi do stanu "session"
   * - Widoczne są komponenty sesji quizu
   * - Kierunek jest poprawnie wyświetlony
   */
  authenticatedTest("TC-QUIZ-003: Start quiz with tag filter", async ({ page, authenticatedUser }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);

    // Step 1: Navigate to /quiz page
    await quizPage.navigate();
    
    // Wait for setup to load
    await quizSetup.expectSetupVisible();

    // Step 2: Select direction EN→PL
    await quizSetup.selectDirectionEnPl();
    
    // Step 3: Select scope "tag" (filtered by tag)
    await quizSetup.selectScopeTag();
    
    // Verify tag selector becomes visible when "tag" scope is selected
    await quizSetup.expectTagSelectorVisible();
    
    // Step 4: Select tag "greetings" (from seeded test data)
    // The seedQuizTestData helper creates tags: "basic", "greetings", "nouns", "common"
    // and associates first 4 words with "greetings" tag
    await quizSetup.selectTag("greetings");
    
    // Verify start button is enabled
    await quizSetup.expectStartButtonEnabled();

    // Step 5: Click "Start Quiz"
    await quizSetup.clickStart();

    // Expected Result: Quiz session should start with filtered words
    // Wait for state transition from "setup" to "loading" to "session"
    await quizSession.waitForSession();
    
    // Verify quiz session is now visible
    await quizSession.expectSessionVisible();
    
    // Verify session state is active
    expect(await quizPage.isSessionState()).toBe(true);
    
    // Verify setup is no longer visible
    expect(await quizPage.isSetupState()).toBe(false);
    
    // Verify direction is displayed correctly (EN → PL)
    await expect(quizSession.directionDisplay).toBeVisible();
    await quizSession.expectDirection("Angielski → Polski");
    
    // Verify quiz components are visible
    await expect(quizSession.progressBar).toBeVisible();
    await expect(quizSession.progressText).toBeVisible();
    await expect(quizSession.questionNumber).toBeVisible();
    
    // Additional verification: Progress should show we have questions from the filtered set
    // With "greetings" tag, we should have 4 words available
    const progressText = await quizSession.getProgressText();
    // Progress should be in format "Postęp: 0 / N" where N is number of filtered words
    expect(progressText).toMatch(/Postęp: 0 \/ \d+/);
  });

  /**
   * TC-QUIZ-004: Próba rozpoczęcia quizu - liczba pytań większa niż dostępnych słówek
   * 
   * Note: The current implementation doesn't have a "number of questions" input.
   * Instead, it uses ALL available words automatically. This test verifies that
   * the quiz works correctly when user has very few words (3 words).
   * 
   * Preconditions: Użytkownik ma tylko 3 słówka
   * 
   * Steps:
   * 1. Użytkownik otwiera `/quiz`
   * 2. Użytkownik konfiguruje quiz (kierunek: EN→PL, zakres: wszystkie słówka)
   * 3. Użytkownik klika "Rozpocznij Quiz"
   * 4. Quiz automatycznie używa wszystkich dostępnych słówek (3 pytania)
   * 
   * Expected Result:
   * - Quiz rozpoczyna się z 3 pytaniami (wszystkie dostępne słówka)
   * - Brak błędu
   * - Progress pokazuje: "Postęp: 0 / 3"
   * 
   * Verification:
   * - Quiz ma tyle pytań, ile jest dostępnych słówek (3)
   * - Session state is active
   * - Progress tracking works correctly
   */
  authenticatedTest("TC-QUIZ-004: Quiz with limited words (3 words available)", async ({ page, authenticatedUser }) => {
    // This test requires exactly 3 words in database
    const userId = process.env.E2E_USERNAME_ID;
    if (!userId) {
      throw new Error("E2E_USERNAME_ID must be set in .env.test");
    }

    const config = {
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    };

    // Clean up all existing data
    await cleanupUserData(userId, config);

    // Seed exactly 3 words (no tags needed for this test)
    const testWords = [
      { word: "hello", translation: "cześć" },
      { word: "goodbye", translation: "do widzenia" },
      { word: "thank you", translation: "dziękuję" },
    ];
    await seedWords(userId, testWords, config);

    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);

    // Step 1: Navigate to /quiz page
    await quizPage.navigate();
    
    // Wait for setup to load
    await quizSetup.expectSetupVisible();

    // Step 2: Configure quiz - select direction EN→PL
    await quizSetup.selectDirectionEnPl();
    
    // Select scope "all words"
    await quizSetup.selectScopeAll();
    
    // Verify start button is enabled
    await quizSetup.expectStartButtonEnabled();

    // Step 3: Click "Start Quiz"
    await quizSetup.clickStart();

    // Step 4: Expected Result - Quiz should start with 3 questions
    // Wait for state transition from "setup" to "loading" to "session"
    await quizSession.waitForSession();
    
    // Verify quiz session is now visible
    await quizSession.expectSessionVisible();
    
    // Verify session state is active
    expect(await quizPage.isSessionState()).toBe(true);
    
    // Verify setup is no longer visible
    expect(await quizPage.isSetupState()).toBe(false);
    
    // Verify progress shows 3 total questions (all available words)
    const progressText = await quizSession.getProgressText();
    expect(progressText).toBe("Postęp: 0 / 3");
    
    // Verify direction is displayed correctly
    await expect(quizSession.directionDisplay).toBeVisible();
    await quizSession.expectDirection("Angielski → Polski");
    
    // Verify all session components are visible
    await expect(quizSession.progressBar).toBeVisible();
    await expect(quizSession.progressText).toBeVisible();
    await expect(quizSession.questionNumber).toBeVisible();
    await expect(quizSession.quitButton).toBeVisible();
  });
});

test.describe("Quiz - Session and Questions", () => {
  test.skip("TC-QUIZ-005: Answer question correctly", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);
    const questionCard = new QuestionCardComponent(page);

    // Start quiz
    await quizPage.navigate();
    await quizSetup.setupQuiz("en-pl", "all");

    // Verify session started
    await quizSession.expectSessionVisible();
    await quizSession.expectProgress(1, 5);

    // Answer question
    await questionCard.expectCardVisible();
    await questionCard.clickReveal();
    await questionCard.expectAnswerSectionVisible();
    await questionCard.clickKnow();

    // Verify progress
    await quizSession.expectProgress(2, 5);
  });

  test.skip("TC-QUIZ-006: Answer question incorrectly", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const questionCard = new QuestionCardComponent(page);

    await quizPage.navigate();
    await quizSetup.setupQuiz("en-pl", "all");

    // Answer as "don't know"
    await questionCard.waitForCard();
    await questionCard.clickReveal();
    await questionCard.clickDontKnow();

    // Continue to next question or summary
    expect((await quizPage.isSessionState()) || (await quizPage.isSummaryState())).toBe(true);
  });

  test.skip("TC-QUIZ-008: Play audio during quiz", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const questionCard = new QuestionCardComponent(page);

    await quizPage.navigate();
    await quizSetup.setupQuiz("en-pl", "all");

    await questionCard.waitForCard();

    // Check if audio button is visible (depends on word data)
    const audioVisible = await questionCard.playAudioButton.isVisible();

    if (audioVisible) {
      await questionCard.clickPlayAudio();
      // Audio should play (verify by checking button state or audio events)
    }
  });

  test.skip("TC-QUIZ-011: Quit quiz mid-session", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);

    await quizPage.navigate();
    await quizSetup.setupQuiz("en-pl", "all");

    // Quit during session
    await quizSession.expectSessionVisible();
    await quizSession.clickQuit();

    // Verify returned to setup or words list
    expect((await quizPage.isSetupState()) || page.url().includes("/words") || page.url() === "/").toBe(true);
  });
});

test.describe("Quiz - Summary and Completion", () => {
  test.skip("TC-QUIZ-009: Display quiz summary after completion", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const questionCard = new QuestionCardComponent(page);
    const quizSummary = new QuizSummaryComponent(page);

    // Start quiz
    await quizPage.navigate();
    await quizSetup.setupQuiz("en-pl", "all");

    // Answer all questions (assuming 5 questions)
    for (let i = 0; i < 5; i++) {
      await questionCard.waitForCard();
      await questionCard.answerQuestion(true);
    }

    // Verify summary
    await quizSummary.expectSummaryVisible();
    await quizSummary.expectTitle("Gratulacje!");
    await quizSummary.expectAllButtonsVisible();
  });

  test.skip("TC-QUIZ-010: Repeat quiz from summary", async ({ page }) => {
    // This test requires completing a quiz first
    const quizPage = new QuizPage(page);
    const quizSummary = new QuizSummaryComponent(page);
    const quizSetup = new QuizSetupComponent(page);

    // Assume we're at summary page after completing quiz
    await quizSummary.expectSummaryVisible();

    // Click repeat
    await quizSummary.clickRepeat();

    // Verify back to setup
    await quizSetup.expectSetupVisible();
  });

  test.skip("TC-QUIZ-010: Start new quiz from summary", async ({ page }) => {
    const quizSummary = new QuizSummaryComponent(page);
    const quizSetup = new QuizSetupComponent(page);

    // From summary, click new quiz
    await quizSummary.expectSummaryVisible();
    await quizSummary.clickNewQuiz();

    // Verify back to setup
    await quizSetup.expectSetupVisible();
  });

  test.skip("TC-QUIZ-010: Return to words from summary", async ({ page }) => {
    const quizSummary = new QuizSummaryComponent(page);

    await quizSummary.expectSummaryVisible();
    await quizSummary.clickBackToWords();

    // Verify navigation
    await expect(page).toHaveURL("/");
  });
});

test.describe("Quiz - Different Directions", () => {
  test.skip("Quiz with EN→PL direction", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);

    await quizPage.navigate();
    await quizSetup.selectDirectionEnPl();
    await quizSetup.selectScopeAll();
    await quizSetup.clickStart();

    // Verify direction display
    await quizSession.expectDirection("EN → PL");
  });

  test.skip("Quiz with PL→EN direction", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);
    const quizSession = new QuizSessionComponent(page);

    await quizPage.navigate();
    await quizSetup.selectDirectionPlEn();
    await quizSetup.selectScopeAll();
    await quizSetup.clickStart();

    // Verify direction display
    await quizSession.expectDirection("PL → EN");
  });
});



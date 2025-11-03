import { test, expect } from "@playwright/test";
import { test as authenticatedTest } from "../fixtures/auth.fixture";
import {
  QuizPage,
  QuizSetupComponent,
  QuizSessionComponent,
  QuestionCardComponent,
  QuizSummaryComponent,
} from "../pages";
import { seedQuizTestData } from "../helpers/db-seed.helper";
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

  test.skip("TC-QUIZ-002: No words available", async ({ page }) => {
    // This test requires empty words database
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);

    await quizPage.navigate();

    // Verify no tags message
    await quizSetup.expectNoTagsMessage();
    await quizSetup.expectStartButtonDisabled();
  });

  test.skip("TC-QUIZ-003: Start quiz with tag filter", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);

    await quizPage.navigate();

    // Setup quiz with tag
    await quizSetup.setupQuiz("en-pl", "tag", "business");

    // Verify quiz started
    expect(await quizPage.isSessionState()).toBe(true);
  });

  test.skip("TC-QUIZ-004: Question count exceeds available words", async ({ page }) => {
    // This test requires specific number of words in database
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);

    await quizPage.navigate();

    // Try to setup quiz with more questions than words available
    await quizSetup.setupQuiz("en-pl", "all");

    // Expect validation message
    await quizSetup.expectValidationMessage();
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



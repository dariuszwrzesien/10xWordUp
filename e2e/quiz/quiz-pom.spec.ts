import { test, expect } from "@playwright/test";
import {
  QuizPage,
  QuizSetupComponent,
  QuizSessionComponent,
  QuestionCardComponent,
  QuizSummaryComponent,
} from "../pages";

/**
 * Quiz E2E Tests using Page Object Model
 * Based on scenarios from docs/64-scenariusze-testowania-e2e.md
 *
 * Note: These tests require authenticated user with words in database
 */

test.describe("Quiz - Setup and Configuration", () => {
  test.skip("TC-QUIZ-001: Configure and start quiz", async ({ page }) => {
    const quizPage = new QuizPage(page);
    const quizSetup = new QuizSetupComponent(page);

    await quizPage.navigate();
    await quizSetup.expectSetupVisible();

    // Configure quiz
    await quizSetup.selectDirectionEnPl();
    await quizSetup.selectScopeAll();
    await quizSetup.clickStart();

    // Verify quiz started
    expect(await quizPage.isSessionState()).toBe(true);
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



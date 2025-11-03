import { Page, expect } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Component Object Model for Question Card
 * Handles individual quiz questions and answers
 */
export class QuestionCardComponent extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  get card() {
    return this.getByTestId('question-card');
  }

  get prompt() {
    return this.getByTestId('question-prompt');
  }

  get word() {
    return this.getByTestId('question-word');
  }

  get playAudioButton() {
    return this.getByTestId('question-play-audio-button');
  }

  get revealButton() {
    return this.getByTestId('question-reveal-button');
  }

  get answerSection() {
    return this.getByTestId('question-answer-section');
  }

  get answer() {
    return this.getByTestId('question-answer');
  }

  get answerPlayAudioButton() {
    return this.getByTestId('answer-play-audio-button');
  }

  get examples() {
    return this.getByTestId('question-examples');
  }

  get dontKnowButton() {
    return this.getByTestId('question-answer-dont-know-button');
  }

  get knowButton() {
    return this.getByTestId('question-answer-know-button');
  }

  // Actions
  async waitForCard(): Promise<void> {
    await this.waitForElement('question-card');
  }

  async getQuestionWord(): Promise<string> {
    return await this.word.textContent() || '';
  }

  async getAnswer(): Promise<string> {
    return await this.answer.textContent() || '';
  }

  async clickPlayAudio(): Promise<void> {
    await this.playAudioButton.click();
  }

  async clickReveal(): Promise<void> {
    await this.revealButton.click();
  }

  async clickPlayAnswerAudio(): Promise<void> {
    await this.answerPlayAudioButton.click();
  }

  async clickDontKnow(): Promise<void> {
    await this.dontKnowButton.click();
  }

  async clickKnow(): Promise<void> {
    await this.knowButton.click();
  }

  async answerQuestion(knew: boolean): Promise<void> {
    await this.clickReveal();
    
    if (knew) {
      await this.clickKnow();
    } else {
      await this.clickDontKnow();
    }
  }

  // Assertions
  async expectCardVisible(): Promise<void> {
    await expect(this.card).toBeVisible();
    await expect(this.prompt).toBeVisible();
    await expect(this.word).toBeVisible();
  }

  async expectQuestionWord(word: string): Promise<void> {
    await expect(this.word).toContainText(word);
  }

  async expectRevealButtonVisible(): Promise<void> {
    await expect(this.revealButton).toBeVisible();
  }

  async expectAnswerSectionVisible(): Promise<void> {
    await expect(this.answerSection).toBeVisible();
    await expect(this.answer).toBeVisible();
  }

  async expectAnswerSectionHidden(): Promise<void> {
    await expect(this.answerSection).not.toBeVisible();
  }

  async expectAnswer(answer: string): Promise<void> {
    await expect(this.answer).toContainText(answer);
  }

  async expectPlayAudioVisible(): Promise<void> {
    await expect(this.playAudioButton).toBeVisible();
  }

  async expectPlayAudioHidden(): Promise<void> {
    await expect(this.playAudioButton).not.toBeVisible();
  }

  async expectAnswerPlayAudioVisible(): Promise<void> {
    await expect(this.answerPlayAudioButton).toBeVisible();
  }

  async expectExamplesVisible(): Promise<void> {
    await expect(this.examples).toBeVisible();
  }

  async expectKnowButtonsVisible(): Promise<void> {
    await expect(this.dontKnowButton).toBeVisible();
    await expect(this.knowButton).toBeVisible();
  }
}





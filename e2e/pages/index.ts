/**
 * Central export file for all Page Object Models and Component Object Models
 * This file makes it easy to import POM classes in test files
 */

// Base
export { BasePage } from "./base.page";

// Authentication Pages
export { LoginPage } from "./login.page";
export { RegisterPage } from "./register.page";
export { ForgotPasswordPage } from "./forgot-password.page";
export { ResetPasswordPage } from "./reset-password.page";

// Words Management Pages
export { WordsListPage } from "./words-list.page";

// Quiz Pages
export { QuizPage } from "./quiz.page";

// Components - Authentication
export { UserMenuComponent } from "./components/user-menu.component";

// Components - Words Management
export { WordFormDialogComponent } from "./components/word-form-dialog.component";
export { DeleteWordDialogComponent } from "./components/delete-word-dialog.component";
export { TagFilterComponent } from "./components/tag-filter.component";
export { WordsPaginationComponent } from "./components/words-pagination.component";

// Components - Quiz
export { QuizSetupComponent } from "./components/quiz-setup.component";
export { QuizSessionComponent } from "./components/quiz-session.component";
export { QuestionCardComponent } from "./components/question-card.component";
export { QuizSummaryComponent } from "./components/quiz-summary.component";

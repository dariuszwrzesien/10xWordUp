import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import QuestionCard from "./QuestionCard";
import type { QuizQuestionDTO, QuizSettings } from "@/types/dto.types";

interface QuizSessionProps {
  currentQuestion: QuizQuestionDTO;
  settings: QuizSettings;
  progress: number;
  totalQuestions: number;
  remainingQuestions: number;
  currentQuestionIndex: number;
  onAnswer: (knew: boolean) => void;
  onQuit: () => void;
}

export default function QuizSession({
  currentQuestion,
  settings,
  progress,
  totalQuestions,
  remainingQuestions,
  currentQuestionIndex,
  onAnswer,
  onQuit,
}: QuizSessionProps) {
  const answeredCount = totalQuestions - remainingQuestions;

  return (
    <div className="container mx-auto py-8 px-4" data-testid="quiz-session">
      <div className="max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground" data-testid="quiz-progress-text">
                  Postęp: {answeredCount} / {totalQuestions}
                </span>
                <span className="text-sm font-medium text-muted-foreground" data-testid="quiz-progress-percent">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" data-testid="quiz-progress-bar" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onQuit}
              className="ml-4"
              aria-label="Zakończ quiz"
              data-testid="quiz-quit-button"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Direction indicator and question counter */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground" data-testid="quiz-direction-display">
              Kierunek:{" "}
              <span className="font-semibold text-foreground">
                {settings.direction === "en_pl" ? "Angielski → Polski" : "Polski → Angielski"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground" data-testid="quiz-question-number">
              Pytanie nr {currentQuestionIndex + 1} w tej sesji
            </p>
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          key={currentQuestionIndex}
          question={currentQuestion}
          direction={settings.direction}
          onAnswer={onAnswer}
        />

        {/* Remaining questions info */}
        {remainingQuestions > 1 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground" data-testid="quiz-remaining-questions">
              Pozostało pytań do opanowania: <span className="font-semibold text-foreground">{remainingQuestions}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

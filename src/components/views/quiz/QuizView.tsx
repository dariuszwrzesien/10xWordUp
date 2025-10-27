import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/hooks/useQuiz";
import Providers from "@/components/Providers";
import QuizSetup from "./QuizSetup";
import QuizSession from "./QuizSession";
import QuizSummary from "./QuizSummary";

function QuizContent() {
  const {
    quizState,
    settings,
    currentQuestion,
    progress,
    error,
    tags,
    isLoadingTags,
    totalQuestions,
    remainingQuestions,
    currentQuestionIndex,
    startQuiz,
    answerQuestion,
    repeatQuiz,
    resetQuiz,
  } = useQuiz();

  // Loading state
  if (quizState === "loading") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <h3 className="text-xl font-semibold mb-2">Przygotowuję quiz...</h3>
          <p className="text-muted-foreground text-center max-w-md">Ładuję słówka i tasuję pytania</p>
        </div>
      </div>
    );
  }

  // Error state
  if (quizState === "error") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Wystąpił błąd</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-md">
            {error || "Nie udało się załadować quizu. Spróbuj ponownie."}
          </p>
          <div className="flex gap-3">
            <Button onClick={resetQuiz} variant="default">
              Wróć do ustawień
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Powrót do listy słówek
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Setup state
  if (quizState === "setup") {
    return <QuizSetup tags={tags} isLoadingTags={isLoadingTags} onSubmit={startQuiz} />;
  }

  // Session state
  if (quizState === "session" && settings && currentQuestion) {
    return (
      <QuizSession
        currentQuestion={currentQuestion}
        settings={settings}
        progress={progress}
        totalQuestions={totalQuestions}
        remainingQuestions={remainingQuestions}
        currentQuestionIndex={currentQuestionIndex}
        onAnswer={answerQuestion}
        onQuit={resetQuiz}
      />
    );
  }

  // Summary state
  if (quizState === "summary") {
    return <QuizSummary totalQuestions={totalQuestions} onRepeat={repeatQuiz} onNew={resetQuiz} />;
  }

  // Fallback - should never reach here
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-muted-foreground mb-4">Nieoczekiwany stan aplikacji</p>
        <div className="flex gap-3">
          <Button onClick={resetQuiz} variant="default">
            Rozpocznij od nowa
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Powrót do listy słówek
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function QuizView() {
  return (
    <Providers>
      <QuizContent />
    </Providers>
  );
}

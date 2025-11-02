import { useState, useCallback, useMemo } from "react";
import { Volume2, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Howl } from "howler";
import { toast } from "sonner";
import type { QuizQuestionDTO, QuizDirection } from "@/types/dto.types";

interface QuestionCardProps {
  question: QuizQuestionDTO;
  direction: QuizDirection;
  onAnswer: (knew: boolean) => void;
}

export default function QuestionCard({ question, direction, onAnswer }: QuestionCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  // Determine which word to show as question and answer based on direction
  const questionWord = useMemo(
    () => (direction === "en_pl" ? question.word_en : question.word_pl),
    [direction, question]
  );

  const answerWord = useMemo(
    () => (direction === "en_pl" ? question.word_pl : question.word_en),
    [direction, question]
  );

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleAnswer = useCallback(
    (knew: boolean) => {
      // Reset state for next question
      setIsRevealed(false);
      // Call parent handler
      onAnswer(knew);
    },
    [onAnswer]
  );

  const handlePlayAudio = useCallback(() => {
    if (!question.audio) {
      toast.error("Brak dostępnego audio dla tego słówka");
      return;
    }

    const sound = new Howl({
      src: [question.audio],
      html5: true,
      format: ["mp3", "ogg", "wav", "webm", "aac", "m4a"],
      onloaderror: () => {
        toast.error("Nie udało się załadować pliku audio");
      },
      onplayerror: () => {
        toast.error("Nie udało się odtworzyć audio");
      },
    });

    sound.play();
  }, [question.audio]);

  return (
    <Card className="relative overflow-hidden" data-testid="question-card">
      <CardContent className="p-8">
        {/* Question Section - Always visible */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-2" data-testid="question-prompt">
            {direction === "en_pl" ? "Jak przetłumaczysz:" : "Jak powiedzieć po angielsku:"}
          </p>
          <h2 className="text-4xl font-bold mb-4" data-testid="question-word">{questionWord}</h2>

          {/* Audio button - only for English words */}
          {direction === "en_pl" && question.audio && (
            <Button variant="outline" size="sm" onClick={handlePlayAudio} className="gap-2" data-testid="question-play-audio-button">
              <Volume2 className="h-4 w-4" />
              Posłuchaj wymowy
            </Button>
          )}
        </div>

        {/* Reveal Button - shown when answer is hidden */}
        {!isRevealed && (
          <div className="text-center">
            <Button onClick={handleReveal} size="lg" className="gap-2" data-testid="question-reveal-button">
              <Eye className="h-5 w-5" />
              Pokaż odpowiedź
            </Button>
          </div>
        )}

        {/* Answer Section - shown after reveal */}
        {isRevealed && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300" data-testid="question-answer-section">
            {/* Divider */}
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground text-center mb-2">Poprawna odpowiedź:</p>
              <h3 className="text-3xl font-bold text-center text-primary mb-4" data-testid="question-answer">{answerWord}</h3>
              {/* Audio for answer (Polish->English direction) */}
              {direction === "pl_en" && question.audio && (
                <div className="flex justify-center mb-4">
                  <Button variant="outline" size="sm" onClick={handlePlayAudio} className="gap-2" data-testid="answer-play-audio-button">
                    <Volume2 className="h-4 w-4" />
                    Posłuchaj wymowy
                  </Button>
                </div>
              )}

              {/* Examples section */}
              {question.examples?.length ? (
                <div data-testid="question-examples">
                  <p className="text-sm font-medium mb-2">Przykłady użycia:</p>
                  <div className="space-y-2">
                    {question.examples.map((example: string, idx: number) => (
                      <p key={idx} className="text-sm text-muted-foreground italic">
                        • {example}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Self-assessment buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                size="lg"
                className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                data-testid="question-answer-dont-know-button"
              >
                <XCircle className="h-5 w-5" />
                Nie znałem
              </Button>
              <Button
                onClick={() => handleAnswer(true)}
                variant="default"
                size="lg"
                className="gap-2 bg-green-600 hover:bg-green-700"
                data-testid="question-answer-know-button"
              >
                <CheckCircle2 className="h-5 w-5" />
                Znałem
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">Oceń szczerze swoją znajomość tego słówka</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

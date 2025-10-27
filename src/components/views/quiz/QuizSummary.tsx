import { Trophy, RotateCcw, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizSummaryProps {
  totalQuestions: number;
  onRepeat: () => void;
  onNew: () => void;
}

export default function QuizSummary({ totalQuestions, onRepeat, onNew }: QuizSummaryProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Congratulations Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Trophy className="h-24 w-24 text-yellow-500 animate-in zoom-in duration-500" />
              <div className="absolute inset-0 animate-ping">
                <Trophy className="h-24 w-24 text-yellow-500 opacity-20" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            Gratulacje!
          </h1>
          <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            Ukończyłeś quiz z {totalQuestions}{" "}
            {totalQuestions === 1 ? "słówkiem" : totalQuestions < 5 ? "słówkami" : "słówkami"}
          </p>
        </div>

        {/* Summary Card */}
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardHeader>
            <CardTitle>Co dalej?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground mb-6">
              Świetna robota! Wybrałeś poprawnie wszystkie słówka. Wybierz jedną z poniższych opcji, aby kontynuować
              naukę:
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={onRepeat} size="lg" className="w-full gap-2" variant="default">
                <RotateCcw className="h-5 w-5" />
                Powtórz quiz z tymi samymi słówkami
              </Button>

              <Button onClick={onNew} size="lg" className="w-full gap-2" variant="outline">
                <Plus className="h-5 w-5" />
                Skonfiguruj nowy quiz
              </Button>

              <Button onClick={() => (window.location.href = "/")} size="lg" className="w-full gap-2" variant="ghost">
                <Home className="h-5 w-5" />
                Wróć do moich słówek
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <div className="mt-8 text-center animate-in fade-in duration-500 delay-300">
          <p className="text-sm text-muted-foreground italic">
            "Powtórzenie jest matką wiedzy" - Im więcej ćwiczysz, tym lepiej zapamiętasz!
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Play, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { QuizSettings, QuizDirection, TagDTO } from "@/types/dto.types";

interface QuizSetupProps {
  tags: TagDTO[];
  isLoadingTags: boolean;
  onSubmit: (settings: QuizSettings) => void;
}

export default function QuizSetup({ tags, isLoadingTags, onSubmit }: QuizSetupProps) {
  const [direction, setDirection] = useState<QuizDirection | null>(null);
  const [scopeType, setScopeType] = useState<"all" | "tag">("all");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  // Reset tag selection when switching to "all"
  useEffect(() => {
    if (scopeType === "all") {
      setSelectedTagId(null);
    }
  }, [scopeType]);

  const handleSubmit = () => {
    if (!direction) return;

    const settings: QuizSettings = {
      direction,
      scope: {
        type: scopeType,
        tagId: scopeType === "tag" ? selectedTagId || undefined : undefined,
        tagName: scopeType === "tag" && selectedTagId ? tags.find((t) => t.id === selectedTagId)?.name : undefined,
      },
    };

    onSubmit(settings);
  };

  const isValid = direction && (scopeType === "all" || (scopeType === "tag" && selectedTagId));

  return (
    <div className="container mx-auto py-8 px-4" data-testid="quiz-setup">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="gap-2"
            data-testid="quiz-back-to-words-button"
          >
            <ArrowLeft className="h-4 w-4" />
            Powrót do listy słówek
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Quiz - Test swojej wiedzy</h1>
          <p className="text-muted-foreground">Skonfiguruj quiz, wybierając kierunek tłumaczenia i zakres słówek</p>
        </div>

        {/* Setup Form */}
        <Card data-testid="quiz-setup-card">
          <CardHeader>
            <CardTitle>Ustawienia quizu</CardTitle>
            <CardDescription>Wybierz kierunek tłumaczenia oraz zakres słówek do nauki</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Direction Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Kierunek tłumaczenia</Label>
              <RadioGroup value={direction || ""} onValueChange={(value) => setDirection(value as QuizDirection)}>
                <div
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  data-testid="quiz-direction-en-pl"
                >
                  <RadioGroupItem value="en_pl" id="en_pl" />
                  <Label htmlFor="en_pl" className="flex-1 cursor-pointer">
                    <div className="font-medium">Angielski → Polski</div>
                    <div className="text-sm text-muted-foreground">Słówko po angielsku, odpowiedź po polsku</div>
                  </Label>
                </div>
                <div
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  data-testid="quiz-direction-pl-en"
                >
                  <RadioGroupItem value="pl_en" id="pl_en" />
                  <Label htmlFor="pl_en" className="flex-1 cursor-pointer">
                    <div className="font-medium">Polski → Angielski</div>
                    <div className="text-sm text-muted-foreground">Słówko po polsku, odpowiedź po angielsku</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Scope Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Zakres słówek</Label>
              <RadioGroup value={scopeType} onValueChange={(value) => setScopeType(value as "all" | "tag")}>
                <div
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  data-testid="quiz-scope-all"
                >
                  <RadioGroupItem value="all" id="scope_all" />
                  <Label htmlFor="scope_all" className="flex-1 cursor-pointer">
                    <div className="font-medium">Wszystkie słówka</div>
                    <div className="text-sm text-muted-foreground">Quiz obejmie całą twoją bazę słówek</div>
                  </Label>
                </div>
                <div
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  data-testid="quiz-scope-tag"
                >
                  <RadioGroupItem value="tag" id="scope_tag" />
                  <Label htmlFor="scope_tag" className="flex-1 cursor-pointer">
                    <div className="font-medium">Wybrane słówka (według tagu)</div>
                    <div className="text-sm text-muted-foreground">Ogranicz quiz do słówek z konkretnego tagu</div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Tag Selector - shown when "tag" is selected */}
              {scopeType === "tag" && (
                <div className="mt-4 pl-7" data-testid="quiz-tag-selector">
                  <Label htmlFor="tag-select" className="text-sm font-medium mb-2 block">
                    Wybierz tag
                  </Label>
                  {isLoadingTags ? (
                    <div
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                      data-testid="quiz-tags-loading"
                    >
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Ładowanie tagów...</span>
                    </div>
                  ) : tags.length === 0 ? (
                    <p className="text-sm text-muted-foreground" data-testid="quiz-no-tags-message">
                      Brak dostępnych tagów. Dodaj najpierw słówka z tagami.
                    </p>
                  ) : (
                    <Select value={selectedTagId || ""} onValueChange={setSelectedTagId}>
                      <SelectTrigger id="tag-select" className="w-full" data-testid="quiz-tag-select-trigger">
                        <SelectValue placeholder="Wybierz tag..." />
                      </SelectTrigger>
                      <SelectContent data-testid="quiz-tag-select-content">
                        {tags.map((tag) => (
                          <SelectItem key={tag.id} value={tag.id} data-testid={`quiz-tag-option-${tag.name}`}>
                            {tag.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                size="lg"
                className="w-full"
                data-testid="quiz-start-button"
              >
                <Play className="h-5 w-5 mr-2" />
                Rozpocznij Quiz
              </Button>
              {!isValid && direction && scopeType === "tag" && !selectedTagId && (
                <p className="text-sm text-muted-foreground mt-2 text-center" data-testid="quiz-validation-message">
                  Wybierz tag, aby rozpocząć quiz
                </p>
              )}
              {!isValid && !direction && (
                <p className="text-sm text-muted-foreground mt-2 text-center" data-testid="quiz-validation-message">
                  Wybierz kierunek tłumaczenia, aby kontynuować
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

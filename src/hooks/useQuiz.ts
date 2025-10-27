import { useQuery } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { QuizState, QuizSettings, QuizQuestionDTO, TagDTO, WordDTO } from "@/types/dto.types";

interface TagsResponse {
  data: TagDTO[];
}

interface WordsResponse {
  data: WordDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Transform WordDTO to QuizQuestionDTO
function transformWordToQuestion(word: WordDTO): QuizQuestionDTO {
  return {
    word_id: word.id,
    word_en: word.word,
    word_pl: word.translation,
    audio: word.audio_url,
    examples:
      word.examples && typeof word.examples === "object" && "definitions" in word.examples
        ? ((word.examples.definitions as { example: string }[])
            ?.map((def: { example: string }) => def.example)
            .filter((ex: string | undefined): ex is string => ex !== undefined) ?? null)
        : null,
  };
}

// API helper functions
async function fetchTags(): Promise<TagDTO[]> {
  const response = await fetch("/api/tags");
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  const result: TagsResponse = await response.json();
  return result.data;
}

async function fetchWords(tagId?: string, limit = 100): Promise<WordDTO[]> {
  const params = new URLSearchParams();
  if (tagId) {
    params.append("tag", tagId);
  }
  params.append("limit", limit.toString());

  const response = await fetch(`/api/words?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch words");
  }

  const result: WordsResponse = await response.json();
  return result.data;
}

export function useQuiz() {
  // State management
  const [quizState, setQuizState] = useState<QuizState>("setup");
  const [settings, setSettings] = useState<QuizSettings | null>(null);
  const [questionQueue, setQuestionQueue] = useState<QuizQuestionDTO[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [initialQuestions, setInitialQuestions] = useState<QuizQuestionDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Query for fetching tags
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  // Current question
  const currentQuestion = useMemo(() => (questionQueue.length > 0 ? questionQueue[0] : null), [questionQueue]);

  // Progress calculation
  const progress = useMemo(() => {
    if (initialQuestions.length === 0) return 0;
    const answeredCount = initialQuestions.length - questionQueue.length;
    return (answeredCount / initialQuestions.length) * 100;
  }, [questionQueue.length, initialQuestions.length]);

  // Start quiz function
  const startQuiz = useCallback(async (newSettings: QuizSettings) => {
    setError(null);
    setQuizState("loading");
    setSettings(newSettings);

    try {
      // Fetch words based on settings
      const tagId = newSettings.scope.type === "tag" ? newSettings.scope.tagId : undefined;
      const words = await fetchWords(tagId);

      // Check if words are available
      if (words.length === 0) {
        setError("Brak słówek dla wybranego zakresu");
        setQuizState("setup");
        toast.error("Brak słówek dla wybranego zakresu");
        return;
      }

      // Transform words to questions and shuffle
      const questions = words.map(transformWordToQuestion);
      const shuffledQuestions = shuffleArray(questions);

      setInitialQuestions(shuffledQuestions);
      setQuestionQueue(shuffledQuestions);
      setCurrentQuestionIndex(0);
      setQuizState("session");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się załadować słówek";
      setError(errorMessage);
      setQuizState("error");
      toast.error(errorMessage);
    }
  }, []);

  // Answer question function
  const answerQuestion = useCallback(
    (knew: boolean) => {
      if (questionQueue.length === 0) return;

      const [currentQ, ...rest] = questionQueue;

      if (knew) {
        // User knew the answer - remove from queue
        if (rest.length === 0) {
          // Quiz completed
          setQuizState("summary");
        } else {
          setQuestionQueue(rest);
        }
      } else {
        // User didn't know - move to end of queue
        setQuestionQueue([...rest, currentQ]);
      }

      setCurrentQuestionIndex((prev) => prev + 1);
    },
    [questionQueue]
  );

  // Repeat quiz with same settings
  const repeatQuiz = useCallback(() => {
    if (!initialQuestions.length) return;

    const shuffledQuestions = shuffleArray(initialQuestions);
    setQuestionQueue(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setQuizState("session");
  }, [initialQuestions]);

  // Reset quiz to setup
  const resetQuiz = useCallback(() => {
    setQuizState("setup");
    setSettings(null);
    setQuestionQueue([]);
    setInitialQuestions([]);
    setCurrentQuestionIndex(0);
    setError(null);
  }, []);

  return {
    // State
    quizState,
    settings,
    currentQuestion,
    questionQueue,
    progress,
    error,

    // Data
    tags: tagsQuery.data || [],
    isLoadingTags: tagsQuery.isLoading,
    tagsError: tagsQuery.error,

    // Statistics
    totalQuestions: initialQuestions.length,
    remainingQuestions: questionQueue.length,
    answeredQuestions: initialQuestions.length - questionQueue.length,
    currentQuestionIndex, // Current question number in the session (includes repeated questions)

    // Actions
    startQuiz,
    answerQuestion,
    repeatQuiz,
    resetQuiz,
  };
}

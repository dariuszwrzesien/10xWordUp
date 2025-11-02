import { BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddWord: () => void;
  hasActiveFilter?: boolean;
}

export default function EmptyState({ onAddWord, hasActiveFilter = false }: EmptyStateProps) {
  if (hasActiveFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state-filtered">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Filter className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Brak wyników</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Nie znaleziono słówek pasujących do wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania lub dodaj nowe
          słówko.
        </p>
        <Button onClick={onAddWord} data-testid="empty-state-add-word-button">Dodaj słówko</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
      <div className="rounded-full bg-muted p-6 mb-4">
        <BookOpen className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Brak słówek</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md" data-testid="empty-state-message">
        Zacznij budować swoją kolekcję słówek. Dodaj pierwsze słowo i rozpocznij naukę!
      </p>
      <Button onClick={onAddWord} data-testid="empty-state-add-first-word-button">Dodaj pierwsze słówko</Button>
    </div>
  );
}

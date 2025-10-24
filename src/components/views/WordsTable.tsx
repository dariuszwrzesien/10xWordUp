import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { WordDTO } from "@/types/dto.types";
import WordsTableRow from "./WordsTableRow";
import EmptyState from "./EmptyState";

interface WordsTableProps {
  words: WordDTO[];
  isLoading: boolean;
  onEdit: (word: WordDTO) => void;
  onDelete: (word: WordDTO) => void;
  onPlayAudio: (word: WordDTO) => void;
  onAddWord: () => void;
  hasActiveFilter?: boolean;
}

export default function WordsTable({
  words,
  isLoading,
  onEdit,
  onDelete,
  onPlayAudio,
  onAddWord,
  hasActiveFilter = false,
}: WordsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (words.length === 0) {
    return <EmptyState onAddWord={onAddWord} hasActiveFilter={hasActiveFilter} />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Słówko</TableHead>
            <TableHead className="w-[180px]">Tłumaczenie</TableHead>
            <TableHead className="w-[140px]">Wymowa</TableHead>
            <TableHead>Tagi</TableHead>
            <TableHead className="w-[120px]">Data dodania</TableHead>
            <TableHead className="w-[140px]">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {words.map((word) => (
            <WordsTableRow key={word.id} word={word} onEdit={onEdit} onDelete={onDelete} onPlayAudio={onPlayAudio} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

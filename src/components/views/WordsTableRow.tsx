import { Edit, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import type { WordDTO } from "@/types/dto.types";

interface WordsTableRowProps {
  word: WordDTO;
  onEdit: (word: WordDTO) => void;
  onDelete: (word: WordDTO) => void;
  onPlayAudio: (word: WordDTO) => void;
}

export default function WordsTableRow({ word, onEdit, onDelete, onPlayAudio }: WordsTableRowProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TableRow data-testid={`word-row-${word.id}`}>
      <TableCell className="font-medium" data-testid="word-cell">{word.word}</TableCell>
      <TableCell data-testid="translation-cell">{word.translation}</TableCell>
      <TableCell data-testid="phonetic-cell">{word.phonetic && <span className="text-muted-foreground">{word.phonetic}</span>}</TableCell>
      <TableCell data-testid="tags-cell">
        {word.tags && word.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {word.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                data-testid={`word-tag-${tag.name}`}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell className="text-muted-foreground text-sm" data-testid="created-at-cell">{formatDate(word.created_at)}</TableCell>
      <TableCell data-testid="actions-cell">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPlayAudio(word)}
            disabled={!word.audio_url}
            title={word.audio_url ? "Odtwórz audio" : "Brak audio"}
            data-testid="play-audio-button"
          >
            {word.audio_url ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(word)} title="Edytuj słówko" data-testid="edit-word-button">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(word)} title="Usuń słówko" data-testid="delete-word-button">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

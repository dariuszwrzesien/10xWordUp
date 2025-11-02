import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { WordDTO } from "@/types/dto.types";

interface DeleteWordDialogProps {
  isOpen: boolean;
  word: WordDTO | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteWordDialog({
  isOpen,
  word,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteWordDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="delete-word-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="delete-word-dialog-title">Czy na pewno chcesz usunąć?</AlertDialogTitle>
          <AlertDialogDescription data-testid="delete-word-dialog-description">
            {word && (
              <>
                Zamierzasz usunąć słówko <span className="font-semibold" data-testid="delete-word-name">&ldquo;{word.word}&rdquo;</span> (
                {word.translation}). Ta operacja jest nieodwracalna.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} data-testid="delete-word-cancel-button">Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} data-testid="delete-word-confirm-button">
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

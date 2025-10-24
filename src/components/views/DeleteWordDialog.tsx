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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć?</AlertDialogTitle>
          <AlertDialogDescription>
            {word && (
              <>
                Zamierzasz usunąć słówko <span className="font-semibold">&ldquo;{word.word}&rdquo;</span> (
                {word.translation}). Ta operacja jest nieodwracalna.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateWordCommand, TagDTO, WordDTO } from "@/types/dto.types";

// Client-side validation schema
const wordFormSchema = z.object({
  word: z.string().min(1, "Słówko jest wymagane").max(255, "Maksymalnie 255 znaków"),
  translation: z.string().min(1, "Tłumaczenie jest wymagane").max(255, "Maksymalnie 255 znaków"),
});

type WordFormValues = z.infer<typeof wordFormSchema>;

interface WordFormDialogProps {
  isOpen: boolean;
  wordToEdit?: WordDTO;
  allTags: TagDTO[];
  isLoadingTags?: boolean;
  onClose: () => void;
  onSave: (data: CreateWordCommand) => void;
  isSaving?: boolean;
}

export default function WordFormDialog({
  isOpen,
  wordToEdit,
  allTags,
  isLoadingTags = false,
  onClose,
  onSave,
  isSaving = false,
}: WordFormDialogProps) {
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const form = useForm<WordFormValues>({
    resolver: zodResolver(wordFormSchema),
    defaultValues: {
      word: "",
      translation: "",
    },
  });

  // Reset form when dialog opens or wordToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (wordToEdit) {
        form.reset({
          word: wordToEdit.word,
          translation: wordToEdit.translation,
        });
        setSelectedTags(wordToEdit.tags?.map((t) => t.name) || []);
      } else {
        form.reset({
          word: "",
          translation: "",
        });
        setSelectedTags([]);
      }
    }
  }, [isOpen, wordToEdit, form]);

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      setSelectedTags(newTags);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setSelectedTags(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    }
  };

  const onSubmit = (data: WordFormValues) => {
    onSave({
      word: data.word,
      translation: data.translation,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
  };

  const handleClose = () => {
    form.reset();
    setSelectedTags([]);
    setTagInput("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]" data-testid="word-form-dialog">
        <DialogHeader>
          <DialogTitle data-testid="word-form-dialog-title">{wordToEdit ? "Edytuj słówko" : "Dodaj nowe słówko"}</DialogTitle>
          <DialogDescription>
            {wordToEdit
              ? "Wprowadź zmiany w słówku poniżej."
              : "Wypełnij formularz, aby dodać nowe słówko do swojej kolekcji."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="word-form">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Słówko (angielski)</FormLabel>
                  <FormControl>
                    <Input placeholder="np. hello" {...field} disabled={isSaving} data-testid="word-input" />
                  </FormControl>
                  <FormMessage data-testid="word-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="translation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tłumaczenie (polski)</FormLabel>
                  <FormControl>
                    <Input placeholder="np. cześć" {...field} disabled={isSaving} data-testid="translation-input" />
                  </FormControl>
                  <FormMessage data-testid="translation-error" />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Tagi</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Dodaj tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSaving}
                  data-testid="tag-input"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAddTag(tagInput)}
                  disabled={!tagInput.trim() || isSaving}
                  data-testid="add-tag-button"
                >
                  Dodaj
                </Button>
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3" data-testid="selected-tags">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                      data-testid={`selected-tag-${tag}`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isSaving}
                        className="hover:text-primary/80"
                        data-testid={`remove-tag-${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {isLoadingTags ? (
                <div className="text-sm text-muted-foreground mt-2">
                  <p className="mb-1">Dostępne tagi:</p>
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                    <Skeleton className="h-6 w-18" />
                  </div>
                </div>
              ) : allTags.length > 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  <p className="mb-1">Dostępne tagi:</p>
                  <div className="flex flex-wrap gap-1" data-testid="available-tags">
                    {allTags
                      .filter((tag) => !selectedTags.includes(tag.name))
                      .map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleAddTag(tag.name)}
                          disabled={isSaving}
                          className="text-xs px-2 py-1 rounded border border-border hover:bg-accent transition-colors"
                          data-testid={`available-tag-${tag.name}`}
                        >
                          {tag.name}
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving} data-testid="word-form-cancel-button">
                Anuluj
              </Button>
              <Button type="submit" disabled={isSaving} data-testid="word-form-submit-button">
                {isSaving ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

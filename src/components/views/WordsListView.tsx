import { AlertCircle, Plus, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWordsManagement } from "@/hooks/useWordsManagement";
import Providers from "@/components/Providers";
import WordsTable from "./WordsTable";
import TagFilter from "./TagFilter";
import WordFormDialog from "./WordFormDialog";
import DeleteWordDialog from "./DeleteWordDialog";
import WordsPagination from "./WordsPagination";

function WordsListContent() {
  const {
    // Data
    words,
    totalWords,
    tags,
    pagination,
    // Loading states
    isLoadingWords,
    isLoadingTags,
    // Error states
    wordsError,
    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,
    // Filter state
    filterTagId,
    // Modal states
    isAddDialogOpen,
    isEditDialogOpen,
    isDeleteDialogOpen,
    selectedWord,
    // Handlers
    handleFilterChange,
    handlePageChange,
    handleAddWord,
    handleEditWord,
    handleDeleteWord,
    handleSaveWord,
    handleConfirmDelete,
    handleCloseAddDialog,
    handleCloseEditDialog,
    handleCloseDeleteDialog,
    handlePlayAudio,
  } = useWordsManagement();

  return (
    <div className="container mx-auto py-8 px-4" data-testid="words-list-view">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted-foreground mt-1">
              Zarządzaj swoją kolekcją słówek angielskich
              {!isLoadingWords && totalWords > 0 && (
                <span className="ml-2 text-sm font-medium text-primary" data-testid="words-count">
                  ({totalWords} {totalWords === 1 ? "słówko" : totalWords < 5 ? "słówka" : "słówek"} w bazie)
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleAddWord} size="lg" variant="outline" data-testid="add-word-button">
              <Plus className="h-5 w-5 mr-2" />
              Dodaj słówko
            </Button>
            <Button asChild size="lg" data-testid="start-quiz-button">
              <a href="/quiz">
                <Play className="h-5 w-5 mr-2" />
                Rozpocznij Quiz
              </a>
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtruj:</span>
          {isLoadingTags ? (
            <div className="flex items-center gap-2" data-testid="tags-loading">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-muted-foreground">Ładowanie tagów...</span>
            </div>
          ) : (
            <TagFilter tags={tags} selectedTagId={filterTagId} onTagChange={handleFilterChange} />
          )}
        </div>
      </div>

      {/* Error handling for data fetching */}
      {wordsError && (
        <div className="container mx-auto py-8 px-4" data-testid="words-error-state">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Wystąpił błąd</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Nie udało się załadować słówek. Sprawdź połączenie internetowe i spróbuj ponownie.
            </p>
            <Button onClick={() => window.location.reload()} data-testid="reload-page-button">
              Odśwież stronę
            </Button>
          </div>
        </div>
      )}

      {!wordsError && (
        <div>
          {/* Words Table */}
          <WordsTable
            words={words}
            isLoading={isLoadingWords}
            onEdit={handleEditWord}
            onDelete={handleDeleteWord}
            onPlayAudio={handlePlayAudio}
            onAddWord={handleAddWord}
            hasActiveFilter={filterTagId !== null}
          />

          {/* Pagination */}
          {!isLoadingWords && (
            <WordsPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}

          {/* Add/Edit Word Dialog */}
          <WordFormDialog
            isOpen={isAddDialogOpen || isEditDialogOpen}
            wordToEdit={isEditDialogOpen ? selectedWord || undefined : undefined}
            allTags={tags}
            isLoadingTags={isLoadingTags}
            onClose={isEditDialogOpen ? handleCloseEditDialog : handleCloseAddDialog}
            onSave={handleSaveWord}
            isSaving={isCreating || isUpdating}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteWordDialog
            isOpen={isDeleteDialogOpen}
            word={selectedWord}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        </div>
      )}
    </div>
  );
}

export default function WordsListView() {
  return (
    <Providers>
      <WordsListContent />
    </Providers>
  );
}

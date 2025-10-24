import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Howl } from "howler";
import type { CreateWordCommand, TagDTO, UpdateWordCommand, WordDTO } from "@/types/dto.types";

interface WordsResponse {
  data: WordDTO[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

interface TagsResponse {
  data: TagDTO[];
}

// API helper functions
async function fetchWords(tagId?: string | null, page = 1, limit = 20): Promise<WordsResponse> {
  const params = new URLSearchParams();
  if (tagId) {
    params.append("tag", tagId);
  }
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const response = await fetch(`/api/words?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch words");
  }

  const result: WordsResponse = await response.json();
  return result;
}

async function fetchTags(): Promise<TagDTO[]> {
  const response = await fetch("/api/tags");
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }

  const result: TagsResponse = await response.json();
  return result.data;
}

async function createWord(data: CreateWordCommand): Promise<WordDTO> {
  const response = await fetch("/api/words", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create word");
  }

  const result = await response.json();
  return result.data;
}

async function updateWord(id: string, data: UpdateWordCommand): Promise<WordDTO> {
  const response = await fetch(`/api/words/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update word");
  }

  const result = await response.json();
  return result.data;
}

async function deleteWord(id: string): Promise<void> {
  const response = await fetch(`/api/words/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete word");
  }
}

export function useWordsManagement() {
  const queryClient = useQueryClient();

  // Local state for filtering and modal management
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDTO | null>(null);

  // Ref to store the current audio instance for cleanup
  const audioRef = useRef<Howl | null>(null);

  // Query for fetching words
  const wordsQuery = useQuery({
    queryKey: ["words", filterTagId, currentPage, pageSize],
    queryFn: () => fetchWords(filterTagId, currentPage, pageSize),
  });

  // Query for fetching tags
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const tags = await fetchTags();
      return tags;
    },
  });

  // Mutation for creating a word
  const createWordMutation = useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsAddDialogOpen(false);
      toast.success("Słówko zostało dodane pomyślnie!");
    },
    onError: (error: Error) => {
      toast.error(`Nie udało się dodać słówka: ${error.message}`);
    },
  });

  // Mutation for updating a word
  const updateWordMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWordCommand }) => updateWord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsEditDialogOpen(false);
      setSelectedWord(null);
      toast.success("Słówko zostało zaktualizowane!");
    },
    onError: (error: Error) => {
      toast.error(`Nie udało się zaktualizować słówka: ${error.message}`);
    },
  });

  // Mutation for deleting a word
  const deleteWordMutation = useMutation({
    mutationFn: deleteWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["words"] });
      setIsDeleteDialogOpen(false);
      setSelectedWord(null);
      toast.success("Słówko zostało usunięte!");
    },
    onError: (error: Error) => {
      toast.error(`Nie udało się usunąć słówka: ${error.message}`);
    },
  });

  // Handler functions
  const handleFilterChange = (tagId: string | null) => {
    setFilterTagId(tagId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddWord = () => {
    // Refresh tags when opening dialog to ensure we have the latest list
    queryClient.invalidateQueries({ queryKey: ["tags"] });
    setIsAddDialogOpen(true);
  };

  const handleEditWord = (word: WordDTO) => {
    // Refresh tags when opening dialog to ensure we have the latest list
    queryClient.invalidateQueries({ queryKey: ["tags"] });
    setSelectedWord(word);
    setIsEditDialogOpen(true);
  };

  const handleDeleteWord = (word: WordDTO) => {
    setSelectedWord(word);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveWord = (data: CreateWordCommand | UpdateWordCommand) => {
    if (selectedWord && isEditDialogOpen) {
      // Update existing word
      updateWordMutation.mutate({ id: selectedWord.id, data: data as UpdateWordCommand });
    } else {
      // Create new word
      createWordMutation.mutate(data as CreateWordCommand);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedWord) {
      deleteWordMutation.mutate(selectedWord.id);
    }
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedWord(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedWord(null);
  };

  const handlePlayAudio = (word: WordDTO) => {
    if (!word.audio_url) {
      return;
    }

    // Stop and cleanup previous audio if it's playing
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.unload();
      audioRef.current = null;
    }

    // Create new Howl instance with multiple format support
    const sound = new Howl({
      src: [word.audio_url],
      html5: true, // Use HTML5 Audio for streaming
      format: ["mp3", "ogg", "wav", "webm", "aac", "m4a"], // Supported formats
      onloaderror: (e) => {
        toast.error(`Nie udało się załadować pliku audio: ${e}`);
      },
      onplayerror: (e) => {
        toast.error(`Nie udało się odtworzyć audio: ${e}`);
      },
      onend: () => {
        // Cleanup after playback finishes
        audioRef.current?.unload();
        audioRef.current = null;
      },
    });

    audioRef.current = sound;
    sound.play();
  };

  return {
    // Data
    words: wordsQuery.data?.data || [],
    totalWords: wordsQuery.data?.pagination.total || 0,
    tags: tagsQuery.data || [],

    // Pagination
    pagination: {
      currentPage: wordsQuery.data?.pagination.currentPage || currentPage,
      totalPages: wordsQuery.data?.pagination.totalPages || 1,
      total: wordsQuery.data?.pagination.total || 0,
      pageSize,
    },

    // Loading states
    isLoadingWords: wordsQuery.isLoading,
    isLoadingTags: tagsQuery.isLoading,

    // Error states
    wordsError: wordsQuery.error,
    tagsError: tagsQuery.error,

    // Mutation states
    isCreating: createWordMutation.isPending,
    isUpdating: updateWordMutation.isPending,
    isDeleting: deleteWordMutation.isPending,
    createError: createWordMutation.error,
    updateError: updateWordMutation.error,
    deleteError: deleteWordMutation.error,

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
  };
}

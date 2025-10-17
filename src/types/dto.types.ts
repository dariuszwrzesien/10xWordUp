import type { Database } from "./database.types";

// Wyodrębniamy typy wierszy z odpowiednich tabel
type WordRow = Database["public"]["Tables"]["words"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];

// DTO dla odczytu słowa wraz z powiązanymi tagami
export interface WordDTO extends Omit<WordRow, "user_id"> {
  tags?: TagDTO[];
}

// DTO dla odczytu tagu
export type TagDTO = Omit<TagRow, "user_id">;

// Command Model dla tworzenia nowego słowa
export interface CreateWordCommand {
  word: string;
  translation: string;
  // Lista tagów jako nazwy tagów, które mają zostać powiązane ze słowem
  tags?: string[];
  phonetic?: string | null;
  audio_url?: string | null;
  // Przechowuje dodatkowe przykłady w formacie JSON
  examples?: unknown;
}

// Command Model dla aktualizacji słowa
// Wszystkie pola są opcjonalne, aby umożliwić częściową aktualizację
export interface UpdateWordCommand {
  word?: string;
  translation?: string;
  tags?: string[];
  phonetic?: string | null;
  audio_url?: string | null;
  examples?: unknown;
}

// Command Model dla tworzenia nowego tagu
export interface CreateTagCommand {
  name: string;
}

// Command Model dla aktualizacji tagu
export interface UpdateTagCommand {
  name: string;
}

// DTO dla pojedynczego pytania w quizie
export interface QuizQuestionDTO {
  word_id: string;
  // Odpowiada polu 'word' w bazie, traktowany jako angielska wersja
  word_en: string;
  // Odpowiada polu 'translation' w bazie, traktowany jako wersja polska
  word_pl: string;
  // Adres URL audio, może być null, jeśli nie dostępny
  audio: string | null;
  // Dodatkowe przykłady w formacie JSON
  examples: unknown;
}

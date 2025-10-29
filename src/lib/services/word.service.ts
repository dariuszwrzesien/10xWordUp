import type { CreateWordCommand, UpdateWordCommand, WordDTO } from "../../types/dto.types";
import type { Database } from "../../types/database.types";
import type { SupabaseServerClient } from "../../db/supabase.client";

import { dictionaryService } from "./dictionary.service";

type WordRow = Database["public"]["Tables"]["words"]["Row"];
type TagRow = Database["public"]["Tables"]["tags"]["Row"];

/**
 * Serwis do zarządzania słowami w bazie danych
 */
export class WordService {
  constructor(private supabase: SupabaseServerClient) {}

  /**
   * Tworzy nowe słowo wraz z powiązaniami do tagów
   */
  async createWord(userId: string, command: CreateWordCommand): Promise<WordDTO> {
    // 1. Wzbogać dane o informacje ze słownika (jeśli nie podano)
    let enrichedData = {
      phonetic: command.phonetic,
      audio_url: command.audio_url,
      examples: command.examples,
    };

    if (!command.phonetic || !command.audio_url || !command.examples) {
      const dictionaryData = await dictionaryService.fetchWordData(command.word);
      if (dictionaryData) {
        enrichedData = {
          phonetic: command.phonetic ?? dictionaryData.phonetic,
          audio_url: command.audio_url ?? dictionaryData.audio_url,
          examples: command.examples ?? dictionaryData.examples,
        };
      }
    }

    // 2. Utwórz słowo
    const { data: word, error: wordError } = await this.supabase
      .from("words")
      .insert({
        user_id: userId,
        word: command.word,
        translation: command.translation,
        phonetic: enrichedData.phonetic,
        audio_url: enrichedData.audio_url,
        examples: enrichedData.examples as never,
      })
      .select()
      .single();

    if (wordError || !word) {
      throw new Error(`Failed to create word: ${wordError?.message || "Unknown error"}`);
    }

    // 3. Obsłuż tagi (jeśli istnieją)
    let tags: TagRow[] = [];
    if (command.tags && command.tags.length > 0) {
      tags = await this.handleTags(userId, command.tags, word.id);
    }

    // 4. Zwróć WordDTO
    return this.mapToWordDTO(word, tags);
  }

  /**
   * Pobiera słowo po ID
   */
  async getWordById(userId: string, wordId: string): Promise<WordDTO | null> {
    // Pobierz słowo
    const { data: word, error: wordError } = await this.supabase
      .from("words")
      .select("*")
      .eq("id", wordId)
      .eq("user_id", userId)
      .single();

    if (wordError || !word) {
      return null;
    }

    // Pobierz powiązane tagi
    const tags = await this.getWordTags(wordId);

    return this.mapToWordDTO(word, tags);
  }

  /**
   * Pobiera listę słów z paginacją i filtrowaniem
   */
  async getWords(
    userId: string,
    options: {
      page: number;
      limit: number;
      sort?: string;
      order?: "asc" | "desc";
      tag?: string;
    }
  ): Promise<{ data: WordDTO[]; pagination: { currentPage: number; totalPages: number; total: number } }> {
    const { page, limit, sort = "created_at", order = "desc", tag } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.supabase.from("words").select("*", { count: "exact" }).eq("user_id", userId);

    // Filtrowanie po tagu (jeśli podano)
    if (tag) {
      // Znajdź IDs słów powiązanych z tym tagiem (tag jest już ID-kiem)
      const { data: wordTagsData } = await this.supabase.from("word_tags").select("word_id").eq("tag_id", tag);

      if (wordTagsData && wordTagsData.length > 0) {
        const wordIds = wordTagsData.map((wt: { word_id: string }) => wt.word_id);
        query = query.in("id", wordIds);
      } else {
        // Brak słów z tym tagiem
        return {
          data: [],
          pagination: { currentPage: page, totalPages: 0, total: 0 },
        };
      }
    }

    // Sortowanie
    query = query.order(sort, { ascending: order === "asc" });

    // Paginacja
    const { data: words, error, count } = await query.range(from, to);

    if (error) {
      throw new Error(`Failed to fetch words: ${error.message}`);
    }

    // Pobierz tagi dla wszystkich słów
    const wordsWithTags = await Promise.all(
      (words || []).map(async (word: WordRow) => {
        const tags = await this.getWordTags(word.id);
        return this.mapToWordDTO(word, tags);
      })
    );

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: wordsWithTags,
      pagination: {
        currentPage: page,
        totalPages,
        total,
      },
    };
  }

  /**
   * Aktualizuje słowo
   */
  async updateWord(userId: string, wordId: string, command: UpdateWordCommand): Promise<WordDTO | null> {
    // 1. Sprawdź czy słowo istnieje
    const existingWord = await this.getWordById(userId, wordId);
    if (!existingWord) {
      return null;
    }

    // 2. Jeśli słowo (ang) się zmienia, pobierz nowe dane ze słownika
    let enrichedData = {
      phonetic: command.phonetic,
      audio_url: command.audio_url,
      examples: command.examples,
    };

    if (command.word && command.word !== existingWord.word) {
      const dictionaryData = await dictionaryService.fetchWordData(command.word);
      if (dictionaryData) {
        enrichedData = {
          phonetic: command.phonetic ?? dictionaryData.phonetic,
          audio_url: command.audio_url ?? dictionaryData.audio_url,
          examples: command.examples ?? dictionaryData.examples,
        };
      } else {
        enrichedData = {
          phonetic: null,
          audio_url: null,
          examples: null,
        };
      }
    }

    // 3. Zaktualizuj słowo
    const updateData: Partial<Database["public"]["Tables"]["words"]["Update"]> = {};
    if (command.word !== undefined) updateData.word = command.word;
    if (command.translation !== undefined) updateData.translation = command.translation;
    if (enrichedData.phonetic !== undefined) updateData.phonetic = enrichedData.phonetic;
    if (enrichedData.audio_url !== undefined) updateData.audio_url = enrichedData.audio_url;
    if (enrichedData.examples !== undefined) updateData.examples = enrichedData.examples as never;

    const { data: word, error: wordError } = await this.supabase
      .from("words")
      .update(updateData)
      .eq("id", wordId)
      .eq("user_id", userId)
      .select()
      .single();

    if (wordError || !word) {
      throw new Error(`Failed to update word: ${wordError?.message || "Unknown error"}`);
    }

    // 4. Obsłuż tagi (jeśli podano)
    let tags: TagRow[] = [];
    if (command.tags !== undefined) {
      // Usuń stare powiązania
      await this.supabase.from("word_tags").delete().eq("word_id", wordId);

      // Dodaj nowe
      if (command.tags.length > 0) {
        tags = await this.handleTags(userId, command.tags, wordId);
      }
    } else {
      // Pobierz istniejące tagi
      tags = await this.getWordTags(wordId);
    }

    return this.mapToWordDTO(word, tags);
  }

  /**
   * Usuwa słowo
   */
  async deleteWord(userId: string, wordId: string): Promise<boolean> {
    // 1. Pobierz tagi przypisane do tego słowa przed jego usunięciem
    const tagsToCheck = await this.getWordTags(wordId);

    // 2. Usuń powiązania z tagami (kaskada powinna to obsłużyć, ale dla pewności)
    await this.supabase.from("word_tags").delete().eq("word_id", wordId);

    // 3. Usuń słowo
    const { error } = await this.supabase.from("words").delete().eq("id", wordId).eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete word: ${error.message}`);
    }

    // 4. Sprawdź czy które z tagów stały się osierocone i usuń je
    await this.deleteOrphanedTags(tagsToCheck);

    return true;
  }

  /**
   * Pomocnicza funkcja do obsługi tagów
   */
  private async handleTags(userId: string, tagNames: string[], wordId: string): Promise<TagRow[]> {
    const tags: TagRow[] = [];

    for (const tagName of tagNames) {
      // Spróbuj znaleźć istniejący tag
      let { data: tag } = await this.supabase
        .from("tags")
        .select("*")
        .eq("user_id", userId)
        .eq("name", tagName)
        .single();

      // Jeśli nie istnieje, utwórz
      if (!tag) {
        const { data: newTag, error: tagError } = await this.supabase
          .from("tags")
          .insert({
            user_id: userId,
            name: tagName,
          })
          .select()
          .single();

        if (tagError || !newTag) {
          throw new Error(`Failed to create tag ${tagName}: ${tagError?.message || "Unknown error"}`);
        }

        tag = newTag;
      }

      tags.push(tag);

      // Utwórz powiązanie słowo-tag
      await this.supabase.from("word_tags").insert({
        word_id: wordId,
        tag_id: tag.id,
      });
    }

    return tags;
  }

  /**
   * Pobiera tagi dla słowa
   */
  private async getWordTags(wordId: string): Promise<TagRow[]> {
    const { data: wordTags } = await this.supabase.from("word_tags").select("tag_id").eq("word_id", wordId);

    if (!wordTags || wordTags.length === 0) {
      return [];
    }

    const tagIds = wordTags.map((wt: { tag_id: string }) => wt.tag_id);

    const { data: tags } = await this.supabase.from("tags").select("*").in("id", tagIds);

    return tags || [];
  }

  /**
   * Usuwa tagi, które nie są już przypisane do żadnego słowa
   */
  private async deleteOrphanedTags(tags: TagRow[]): Promise<void> {
    for (const tag of tags) {
      // Sprawdź czy tag jest jeszcze przypisany do jakiegokolwiek słowa
      const { data: wordTags, error } = await this.supabase
        .from("word_tags")
        .select("word_id")
        .eq("tag_id", tag.id)
        .limit(1);

      if (error) {
        throw new Error(`Failed to check orphaned tag ${tag.name}: ${error.message}`);
      }

      // Jeśli tag nie jest przypisany do żadnego słowa, usuń go
      if (!wordTags || wordTags.length === 0) {
        const { error: deleteError } = await this.supabase.from("tags").delete().eq("id", tag.id);

        if (deleteError) {
          throw new Error(`Failed to delete orphaned tag ${tag.name}: ${deleteError.message}`);
        }
      }
    }
  }

  /**
   * Mapuje WordRow i tagi do WordDTO
   */
  private mapToWordDTO(word: WordRow, tags: TagRow[]): WordDTO {
    return {
      id: word.id,
      word: word.word,
      translation: word.translation,
      phonetic: word.phonetic,
      audio_url: word.audio_url,
      examples: word.examples,
      created_at: word.created_at,
      updated_at: word.updated_at,
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        created_at: tag.created_at,
      })),
    };
  }
}

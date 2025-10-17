import type { SupabaseClient } from "../../db/supabase.client";

import type { CreateTagCommand, TagDTO, UpdateTagCommand } from "../../types/dto.types";
import type { Database } from "../../types/database.types";

type TagRow = Database["public"]["Tables"]["tags"]["Row"];

/**
 * Serwis do zarządzania tagami w bazie danych
 */
export class TagService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Tworzy nowy tag
   */
  async createTag(userId: string, command: CreateTagCommand): Promise<TagDTO> {
    // 1. Sprawdź czy tag o takiej nazwie już istnieje dla tego użytkownika
    const { data: existingTag } = await this.supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .eq("name", command.name)
      .single();

    if (existingTag) {
      throw new Error(`Tag with name "${command.name}" already exists`);
    }

    // 2. Utwórz tag
    const { data: tag, error } = await this.supabase
      .from("tags")
      .insert({
        user_id: userId,
        name: command.name,
      })
      .select()
      .single();

    if (error || !tag) {
      throw new Error(`Failed to create tag: ${error?.message || "Unknown error"}`);
    }

    return this.mapToTagDTO(tag);
  }

  /**
   * Pobiera tag po ID
   */
  async getTagById(userId: string, tagId: string): Promise<TagDTO | null> {
    const { data: tag, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("id", tagId)
      .eq("user_id", userId)
      .single();

    if (error || !tag) {
      return null;
    }

    return this.mapToTagDTO(tag);
  }

  /**
   * Pobiera wszystkie tagi użytkownika
   */
  async getTags(userId: string): Promise<TagDTO[]> {
    const { data: tags, error } = await this.supabase
      .from("tags")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch tags: ${error.message}`);
    }

    return (tags || []).map((tag) => this.mapToTagDTO(tag));
  }

  /**
   * Aktualizuje tag
   */
  async updateTag(userId: string, tagId: string, command: UpdateTagCommand): Promise<TagDTO | null> {
    // 1. Sprawdź czy tag istnieje
    const existingTag = await this.getTagById(userId, tagId);
    if (!existingTag) {
      return null;
    }

    // 2. Sprawdź czy nowa nazwa nie koliduje z innym tagiem
    if (command.name !== existingTag.name) {
      const { data: duplicateTag } = await this.supabase
        .from("tags")
        .select("*")
        .eq("user_id", userId)
        .eq("name", command.name)
        .neq("id", tagId)
        .single();

      if (duplicateTag) {
        throw new Error(`Tag with name "${command.name}" already exists`);
      }
    }

    // 3. Zaktualizuj tag
    const { data: tag, error } = await this.supabase
      .from("tags")
      .update({ name: command.name })
      .eq("id", tagId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !tag) {
      throw new Error(`Failed to update tag: ${error?.message || "Unknown error"}`);
    }

    return this.mapToTagDTO(tag);
  }

  /**
   * Usuwa tag
   */
  async deleteTag(userId: string, tagId: string): Promise<boolean> {
    // 1. Usuń powiązania z słowami (kaskada powinna to obsłużyć, ale dla pewności)
    await this.supabase.from("word_tags").delete().eq("tag_id", tagId);

    // 2. Usuń tag
    const { error } = await this.supabase.from("tags").delete().eq("id", tagId).eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete tag: ${error.message}`);
    }

    return true;
  }

  /**
   * Mapuje TagRow do TagDTO
   */
  private mapToTagDTO(tag: TagRow): TagDTO {
    return {
      id: tag.id,
      name: tag.name,
      created_at: tag.created_at,
    };
  }
}

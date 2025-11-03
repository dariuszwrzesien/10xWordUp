import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/types/database.types";

/**
 * Database cleanup helper for E2E tests
 * 
 * This helper provides utility functions for cleaning up test data
 * during or after E2E tests.
 */

interface SupabaseConfig {
  url: string;
  key: string;
}

interface CleanupStats {
  wordTagsDeleted: number;
  wordsDeleted: number;
  tagsDeleted: number;
}

/**
 * Creates a Supabase client for database operations
 */
export function createSupabaseClient(config: SupabaseConfig) {
  return createClient<Database>(config.url, config.key);
}

/**
 * Cleans up all test data for a specific user
 * 
 * @param userId - The UUID of the test user
 * @param config - Supabase configuration (URL and key)
 * @returns Statistics about deleted records
 */
export async function cleanupUserData(
  userId: string,
  config: SupabaseConfig
): Promise<CleanupStats> {
  const supabase = createSupabaseClient(config);

  const stats: CleanupStats = {
    wordTagsDeleted: 0,
    wordsDeleted: 0,
    tagsDeleted: 0,
  };

  try {
    // Step 1: Get all word IDs for the user
    const { data: userWords, error: wordsError } = await supabase
      .from("words")
      .select("id")
      .eq("user_id", userId);

    if (wordsError) {
      throw new Error(`Error fetching user words: ${wordsError.message}`);
    }

    // Step 2: Delete word_tags if words exist
    if (userWords && userWords.length > 0) {
      const wordIds = userWords.map((word) => word.id);

      const { error: wordTagsError, count: wordTagsCount } = await supabase
        .from("word_tags")
        .delete({ count: "exact" })
        .in("word_id", wordIds);

      if (wordTagsError) {
        throw new Error(`Error deleting word_tags: ${wordTagsError.message}`);
      }

      stats.wordTagsDeleted = wordTagsCount ?? 0;
    }

    // Step 3: Delete words
    const { error: deleteWordsError, count: wordsCount } = await supabase
      .from("words")
      .delete({ count: "exact" })
      .eq("user_id", userId);

    if (deleteWordsError) {
      throw new Error(`Error deleting words: ${deleteWordsError.message}`);
    }

    stats.wordsDeleted = wordsCount ?? 0;

    // Step 4: Delete tags
    const { error: deleteTagsError, count: tagsCount } = await supabase
      .from("tags")
      .delete({ count: "exact" })
      .eq("user_id", userId);

    if (deleteTagsError) {
      throw new Error(`Error deleting tags: ${deleteTagsError.message}`);
    }

    stats.tagsDeleted = tagsCount ?? 0;

    return stats;
  } catch (error) {
    console.error("Database cleanup failed:", error);
    throw error;
  }
}

/**
 * Deletes all words for a specific user
 * 
 * @param userId - The UUID of the test user
 * @param config - Supabase configuration (URL and key)
 * @returns Number of deleted words
 */
export async function cleanupWords(
  userId: string,
  config: SupabaseConfig
): Promise<number> {
  const supabase = createSupabaseClient(config);

  // First delete word_tags
  const { data: userWords } = await supabase
    .from("words")
    .select("id")
    .eq("user_id", userId);

  if (userWords && userWords.length > 0) {
    const wordIds = userWords.map((word) => word.id);
    await supabase.from("word_tags").delete().in("word_id", wordIds);
  }

  // Then delete words
  const { error, count } = await supabase
    .from("words")
    .delete({ count: "exact" })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error deleting words: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Deletes all tags for a specific user
 * 
 * @param userId - The UUID of the test user
 * @param config - Supabase configuration (URL and key)
 * @returns Number of deleted tags
 */
export async function cleanupTags(
  userId: string,
  config: SupabaseConfig
): Promise<number> {
  const supabase = createSupabaseClient(config);

  const { error, count } = await supabase
    .from("tags")
    .delete({ count: "exact" })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error deleting tags: ${error.message}`);
  }

  return count ?? 0;
}

/**
 * Verifies that all test data has been cleaned up
 * 
 * @param userId - The UUID of the test user
 * @param config - Supabase configuration (URL and key)
 * @returns True if no test data exists, false otherwise
 */
export async function verifyCleanup(
  userId: string,
  config: SupabaseConfig
): Promise<boolean> {
  const supabase = createSupabaseClient(config);

  const [wordsResult, tagsResult] = await Promise.all([
    supabase.from("words").select("id", { count: "exact" }).eq("user_id", userId),
    supabase.from("tags").select("id", { count: "exact" }).eq("user_id", userId),
  ]);

  const wordsCount = wordsResult.count ?? 0;
  const tagsCount = tagsResult.count ?? 0;

  return wordsCount === 0 && tagsCount === 0;
}


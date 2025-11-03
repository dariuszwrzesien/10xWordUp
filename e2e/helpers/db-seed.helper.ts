import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/types/database.types";

/**
 * Database seeding helper for E2E tests
 * 
 * This helper provides utility functions for creating test data
 * for E2E tests.
 */

interface SupabaseConfig {
  url: string;
  key: string;
}

interface TestWord {
  word: string;
  translation: string;
  phonetic?: string;
  audio_url?: string;
  examples?: Record<string, unknown>;
}

interface TestTag {
  name: string;
}

/**
 * Creates a Supabase client for database operations
 */
export function createSupabaseClient(config: SupabaseConfig) {
  return createClient<Database>(config.url, config.key);
}

/**
 * Creates test words for a user
 * 
 * @param userId - The UUID of the test user
 * @param words - Array of test words to create
 * @param config - Supabase configuration (URL and key)
 * @returns Array of created word IDs
 */
export async function seedWords(
  userId: string,
  words: TestWord[],
  config: SupabaseConfig
): Promise<string[]> {
  const supabase = createSupabaseClient(config);

  const wordsToInsert = words.map((word) => ({
    user_id: userId,
    word: word.word,
    translation: word.translation,
    phonetic: word.phonetic || null,
    audio_url: word.audio_url || null,
    examples: word.examples || null,
  }));

  const { data, error } = await supabase
    .from("words")
    .insert(wordsToInsert)
    .select("id");

  if (error) {
    throw new Error(`Error creating test words: ${error.message}`);
  }

  return data?.map((w) => w.id) || [];
}

/**
 * Creates test tags for a user
 * 
 * @param userId - The UUID of the test user
 * @param tags - Array of test tags to create
 * @param config - Supabase configuration (URL and key)
 * @returns Array of created tag IDs
 */
export async function seedTags(
  userId: string,
  tags: TestTag[],
  config: SupabaseConfig
): Promise<string[]> {
  const supabase = createSupabaseClient(config);

  const tagsToInsert = tags.map((tag) => ({
    user_id: userId,
    name: tag.name,
  }));

  const { data, error } = await supabase
    .from("tags")
    .insert(tagsToInsert)
    .select("id");

  if (error) {
    throw new Error(`Error creating test tags: ${error.message}`);
  }

  return data?.map((t) => t.id) || [];
}

/**
 * Associates words with tags
 * 
 * @param wordIds - Array of word IDs
 * @param tagIds - Array of tag IDs
 * @param config - Supabase configuration (URL and key)
 */
export async function seedWordTags(
  wordIds: string[],
  tagIds: string[],
  config: SupabaseConfig
): Promise<void> {
  const supabase = createSupabaseClient(config);

  const wordTagsToInsert = wordIds.flatMap((wordId) =>
    tagIds.map((tagId) => ({
      word_id: wordId,
      tag_id: tagId,
    }))
  );

  const { error } = await supabase.from("word_tags").insert(wordTagsToInsert);

  if (error) {
    throw new Error(`Error creating word-tag associations: ${error.message}`);
  }
}

/**
 * Creates a complete test dataset with words and tags
 * 
 * @param userId - The UUID of the test user
 * @param config - Supabase configuration (URL and key)
 * @returns Object with created word and tag IDs
 */
export async function seedQuizTestData(
  userId: string,
  config: SupabaseConfig
): Promise<{ wordIds: string[]; tagIds: string[] }> {
  // Create test words
  const testWords: TestWord[] = [
    { word: "hello", translation: "cześć", phonetic: "həˈləʊ" },
    { word: "goodbye", translation: "do widzenia", phonetic: "ɡʊdˈbaɪ" },
    { word: "thank you", translation: "dziękuję" },
    { word: "please", translation: "proszę" },
    { word: "yes", translation: "tak" },
    { word: "no", translation: "nie" },
    { word: "water", translation: "woda" },
    { word: "food", translation: "jedzenie" },
    { word: "house", translation: "dom" },
    { word: "car", translation: "samochód" },
  ];

  const wordIds = await seedWords(userId, testWords, config);

  // Create test tags
  const testTags: TestTag[] = [
    { name: "basic" },
    { name: "greetings" },
    { name: "nouns" },
    { name: "common" },
  ];

  const tagIds = await seedTags(userId, testTags, config);

  // Associate first 4 words with "greetings" tag
  if (wordIds.length >= 4 && tagIds.length >= 2) {
    await seedWordTags(wordIds.slice(0, 4), [tagIds[1]], config);
  }

  // Associate last 6 words with "nouns" tag
  if (wordIds.length >= 6 && tagIds.length >= 3) {
    await seedWordTags(wordIds.slice(4), [tagIds[2]], config);
  }

  return { wordIds, tagIds };
}


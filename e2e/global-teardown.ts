import dotenv from "dotenv";
import path from "path";
import { cleanupUserData } from "./helpers/db-cleanup.helper";

// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * Global teardown function for Playwright E2E tests
 *
 * This function runs once after all tests complete and cleans up
 * test data from the Supabase database.
 *
 * It deletes entries from the following tables:
 * - word_tags (must be deleted first due to foreign key constraints)
 * - words
 * - tags
 *
 * The function uses the E2E_USERNAME_ID to ensure only test user's data is deleted.
 */
async function globalTeardown() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const testUserId = process.env.E2E_USERNAME_ID;

  // Validate required environment variables
  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing required environment variables: SUPABASE_URL or SUPABASE_KEY");
    console.error("Please ensure .env.test file is properly configured");
    return;
  }

  if (!testUserId) {
    console.warn("⚠️  Warning: E2E_USERNAME_ID not set. Database cleanup will be skipped.");
    console.warn("To enable database cleanup, set E2E_USERNAME_ID in .env.test");
    return;
  }

  console.log("🧹 Starting database cleanup...");

  try {
    const stats = await cleanupUserData(testUserId, {
      url: supabaseUrl,
      key: supabaseKey,
    });

    console.log(`✅ Deleted ${stats.wordTagsDeleted} word_tags entries`);
    console.log(`✅ Deleted ${stats.wordsDeleted} words`);
    console.log(`✅ Deleted ${stats.tagsDeleted} tags`);
    console.log("✨ Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Database cleanup failed:", error);
    // Don't throw the error to prevent test suite from failing
    // Cleanup failures should be logged but not block the test results
  }
}

export default globalTeardown;

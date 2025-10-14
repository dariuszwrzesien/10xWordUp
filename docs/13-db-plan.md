# Database Schema for 10xWordUp

## 1. Tables

### `users`

This table is managed by Supabase Auth.

Stores user authentication information. This table will be managed by Supabase Auth, but its schema is defined here for clarity. The actual management of this table should be left to Supabase.

| Column Name  | Data Type                  | Constraints                         | Description                                          |
| ------------ | -------------------------- | ----------------------------------- | ---------------------------------------------------- |
| `id`         | `uuid`                     | `PRIMARY KEY`, `DEFAULT auth.uid()` | Unique identifier for the user (from Supabase Auth). |
| `email`      | `text`                     | `UNIQUE`, `NOT NULL`                | User's email address.                                |
| `created_at` | `timestamp with time zone` | `DEFAULT now()`, `NOT NULL`         | Timestamp of when the user was created.              |

### `words`

Stores the words and their translations added by users.

| Column Name   | Data Type                  | Constraints                                | Description                                  |
| ------------- | -------------------------- | ------------------------------------------ | -------------------------------------------- |
| `id`          | `uuid`                     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the word.              |
| `user_id`     | `uuid`                     | `REFERENCES users(id)`, `NOT NULL`         | Foreign key to the `users` table.            |
| `word`        | `text`                     | `NOT NULL`                                 | The English word.                            |
| `translation` | `text`                     | `NOT NULL`                                 | The Polish translation of the word.          |
| `phonetic`    | `text`                     |                                            | Phonetic representation of the word.         |
| `audio_url`   | `text`                     |                                            | URL to an audio file with the pronunciation. |
| `examples`    | `jsonb`                    |                                            | Examples of the word's usage from the API.   |
| `created_at`  | `timestamp with time zone` | `DEFAULT now()`, `NOT NULL`                | Timestamp of when the word was created.      |
| `updated_at`  | `timestamp with time zone` | `DEFAULT now()`, `NOT NULL`                | Timestamp of when the word was last updated. |

### `tags`

Stores tags created by users to categorize their words.

| Column Name  | Data Type                  | Constraints                                | Description                                |
| ------------ | -------------------------- | ------------------------------------------ | ------------------------------------------ |
| `id`         | `uuid`                     | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique identifier for the tag.             |
| `user_id`    | `uuid`                     | `REFERENCES users(id)`, `NOT NULL`         | Foreign key to the `users` table.          |
| `name`       | `text`                     | `NOT NULL`                                 | The name of the tag.                       |
| `created_at` | `timestamp with time zone` | `DEFAULT now()`, `NOT NULL`                | Timestamp of when the tag was created.     |
|              |                            | `UNIQUE(user_id, name)`                    | Ensures a user cannot have duplicate tags. |

### `word_tags`

A join table to create a many-to-many relationship between `words` and `tags`.

| Column Name | Data Type | Constraints                        | Description                           |
| ----------- | --------- | ---------------------------------- | ------------------------------------- |
| `word_id`   | `uuid`    | `REFERENCES words(id)`, `NOT NULL` | Foreign key to the `words` table.     |
| `tag_id`    | `uuid`    | `REFERENCES tags(id)`, `NOT NULL`  | Foreign key to the `tags` table.      |
|             |           | `PRIMARY KEY (word_id, tag_id)`    | Ensures unique word-tag combinations. |

## 2. Relationships

- **`users` to `words`**: One-to-Many. A user can have many words, but each word belongs to a single user.
- **`users` to `tags`**: One-to-Many. A user can create many tags, but each tag belongs to a single user.
- **`words` to `tags`**: Many-to-Many. A word can have multiple tags, and a tag can be applied to multiple words. This is facilitated by the `word_tags` join table.

## 3. Indexes

To optimize query performance, the following indexes should be created:

- `CREATE INDEX idx_words_user_id ON words(user_id);`
- `CREATE INDEX idx_tags_user_id ON tags(user_id);`
- `CREATE INDEX idx_word_tags_word_id ON word_tags(word_id);`
- `CREATE INDEX idx_word_tags_tag_id ON word_tags(tag_id);`

## 4. Row-Level Security (RLS)

RLS will be enabled on all tables to ensure that users can only access their own data.

### `words` Table Policies

- **SELECT**: Users can only select their own words.
  ```sql
  CREATE POLICY "Enable read access for users on their own words"
  ON words FOR SELECT
  USING (auth.uid() = user_id);
  ```
- **INSERT**: Users can only insert words with their own `user_id`.
  ```sql
  CREATE POLICY "Enable insert for users on their own words"
  ON words FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  ```
- **UPDATE**: Users can only update their own words.
  ```sql
  CREATE POLICY "Enable update for users on their own words"
  ON words FOR UPDATE
  USING (auth.uid() = user_id);
  ```
- **DELETE**: Users can only delete their own words.
  ```sql
  CREATE POLICY "Enable delete for users on their own words"
  ON words FOR DELETE
  USING (auth.uid() = user_id);
  ```

### `tags` Table Policies

- **SELECT**: Users can only select their own tags.
  ```sql
  CREATE POLICY "Enable read access for users on their own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);
  ```
- **INSERT**: Users can only insert tags with their own `user_id`.
  ```sql
  CREATE POLICY "Enable insert for users on their own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  ```
- **UPDATE**: Users can only update their own tags.
  ```sql
  CREATE POLICY "Enable update for users on their own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);
  ```
- **DELETE**: Users can only delete their own tags.
  ```sql
  CREATE POLICY "Enable delete for users on their own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);
  ```

### `word_tags` Table Policies

- **SELECT**: Users can only select associations for their own words.
  ```sql
  CREATE POLICY "Enable read access for users on their own word_tags"
  ON word_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM words WHERE words.id = word_tags.word_id AND words.user_id = auth.uid()));
  ```
- **INSERT**: Users can only insert associations for their own words.
  ```sql
  CREATE POLICY "Enable insert for users on their own word_tags"
  ON word_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM words WHERE words.id = word_tags.word_id AND words.user_id = auth.uid()));
  ```
- **DELETE**: Users can only delete associations for their own words.
  ```sql
  CREATE POLICY "Enable delete for users on their own word_tags"
  ON word_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM words WHERE words.id = word_tags.word_id AND words.user_id = auth.uid()));
  ```

## 5. Additional Notes

- **UUIDs**: The schema uses `uuid` for primary keys, which is a good practice for distributed systems and helps to obscure sequential data.
- **Timestamps**: `created_at` and `updated_at` timestamps are included to track when records are created and modified.
- **Normalization**: The schema is in 3NF, which reduces data redundancy and improves data integrity. The use of a join table (`word_tags`) for the many-to-many relationship is a standard practice.
- **Supabase Auth**: The `users` table is designed to integrate with Supabase Authentication. The `user_id` in other tables will reference `auth.users.id`.
- **Automatic Timestamp Updates**: An additional trigger should be created to automatically update the `updated_at` column in the `words` table whenever a row is updated.

  ```sql
  CREATE OR REPLACE FUNCTION handle_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER on_word_update
    BEFORE UPDATE ON words
    FOR EACH ROW
    EXECUTE PROCEDURE handle_updated_at();
  ```

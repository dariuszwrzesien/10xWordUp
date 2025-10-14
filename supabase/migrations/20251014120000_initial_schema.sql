-- Migration: Initial Schema for 10xWordUp
-- Description: Creates the core database schema including words, tags, and word_tags tables
-- Tables affected: words, tags, word_tags
-- Special notes: 
--   - This migration assumes Supabase Auth manages the users table
--   - Row Level Security (RLS) is enabled on all tables
--   - Includes indexes for performance optimization
--   - Includes trigger for automatic updated_at timestamp updates

-- ============================================================================
-- Table: words
-- Description: Stores English words with Polish translations and metadata
-- ============================================================================

create table words (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  word text not null,
  translation text not null,
  phonetic text,
  audio_url text,
  examples jsonb,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS on words table to ensure users can only access their own data
alter table words enable row level security;

-- Index to optimize queries filtering by user_id
create index idx_words_user_id on words(user_id);

-- Comment on the table for documentation
comment on table words is 'Stores English words with Polish translations and associated metadata for each user';

-- ============================================================================
-- Table: tags
-- Description: Stores user-defined tags for categorizing words
-- ============================================================================

create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default now() not null,
  -- Ensure each user cannot create duplicate tag names
  constraint unique_user_tag unique(user_id, name)
);

-- Enable RLS on tags table to ensure users can only access their own tags
alter table tags enable row level security;

-- Index to optimize queries filtering by user_id
create index idx_tags_user_id on tags(user_id);

-- Comment on the table for documentation
comment on table tags is 'Stores user-defined tags for categorizing words';

-- ============================================================================
-- Table: word_tags
-- Description: Junction table for many-to-many relationship between words and tags
-- ============================================================================

create table word_tags (
  word_id uuid references words(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  -- Composite primary key ensures unique word-tag combinations
  primary key (word_id, tag_id)
);

-- Enable RLS on word_tags table to ensure users can only access their own associations
alter table word_tags enable row level security;

-- Indexes to optimize queries on the junction table
create index idx_word_tags_word_id on word_tags(word_id);
create index idx_word_tags_tag_id on word_tags(tag_id);

-- Comment on the table for documentation
comment on table word_tags is 'Junction table managing many-to-many relationships between words and tags';

-- ============================================================================
-- Function: handle_updated_at
-- Description: Automatically updates the updated_at timestamp on row updates
-- ============================================================================

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Comment on the function for documentation
comment on function handle_updated_at() is 'Trigger function to automatically update the updated_at column on row modifications';

-- ============================================================================
-- Trigger: on_word_update
-- Description: Executes handle_updated_at function before updating words table
-- ============================================================================

create trigger on_word_update
  before update on words
  for each row
  execute procedure handle_updated_at();

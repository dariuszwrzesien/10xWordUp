-- Migration: Add RLS Policies
-- Description: Adds Row Level Security policies to ensure users can only access their own data
-- Tables affected: words, tags, word_tags
-- Special notes: 
--   - These policies work with Supabase Auth (auth.uid())
--   - Each policy is named descriptively for easy management
--   - Policies enforce strict user isolation

-- ============================================================================
-- RLS Policies for: words
-- Description: Users can only CRUD their own words
-- ============================================================================

-- Policy: Users can view only their own words
create policy "Users can view their own words"
  on words
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own words
create policy "Users can insert their own words"
  on words
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update only their own words
create policy "Users can update their own words"
  on words
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete only their own words
create policy "Users can delete their own words"
  on words
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for: tags
-- Description: Users can only CRUD their own tags
-- ============================================================================

-- Policy: Users can view only their own tags
create policy "Users can view their own tags"
  on tags
  for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own tags
create policy "Users can insert their own tags"
  on tags
  for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update only their own tags
create policy "Users can update their own tags"
  on tags
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policy: Users can delete only their own tags
create policy "Users can delete their own tags"
  on tags
  for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for: word_tags
-- Description: Users can only manage associations for their own words/tags
-- ============================================================================

-- Policy: Users can view word_tags for their own words
create policy "Users can view their own word_tags"
  on word_tags
  for select
  using (
    exists (
      select 1 from words
      where words.id = word_tags.word_id
      and words.user_id = auth.uid()
    )
  );

-- Policy: Users can insert word_tags for their own words
create policy "Users can insert their own word_tags"
  on word_tags
  for insert
  with check (
    exists (
      select 1 from words
      where words.id = word_tags.word_id
      and words.user_id = auth.uid()
    )
  );

-- Policy: Users can delete word_tags for their own words
create policy "Users can delete their own word_tags"
  on word_tags
  for delete
  using (
    exists (
      select 1 from words
      where words.id = word_tags.word_id
      and words.user_id = auth.uid()
    )
  );

-- Comments for documentation
comment on policy "Users can view their own words" on words is 'Allows users to SELECT only their own words';
comment on policy "Users can insert their own words" on words is 'Allows users to INSERT words with their own user_id';
comment on policy "Users can update their own words" on words is 'Allows users to UPDATE only their own words';
comment on policy "Users can delete their own words" on words is 'Allows users to DELETE only their own words';

comment on policy "Users can view their own tags" on tags is 'Allows users to SELECT only their own tags';
comment on policy "Users can insert their own tags" on tags is 'Allows users to INSERT tags with their own user_id';
comment on policy "Users can update their own tags" on tags is 'Allows users to UPDATE only their own tags';
comment on policy "Users can delete their own tags" on tags is 'Allows users to DELETE only their own tags';

comment on policy "Users can view their own word_tags" on word_tags is 'Allows users to SELECT word_tags for their own words';
comment on policy "Users can insert their own word_tags" on word_tags is 'Allows users to INSERT word_tags for their own words';
comment on policy "Users can delete their own word_tags" on word_tags is 'Allows users to DELETE word_tags for their own words';


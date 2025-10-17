# REST API Plan

## 1. Resources

- **Users**
  - Database Table: `users`
  - Description: Managed by Supabase Auth; stores user authentication information including unique ID, email, and creation timestamp.

- **Words**
  - Database Table: `words`
  - Description: Contains user-added words with translations, optional phonetic representations, audio URLs, and usage examples. References the `users` table via `user_id`.

- **Tags**
  - Database Table: `tags`
  - Description: Contains user-created tags to categorize words, ensuring that tag names are unique per user.

- **WordTags**
  - Database Table: `word_tags`
  - Description: A join table representing the many-to-many relationship between words and tags.

## 2. Endpoints

### Words Endpoints

- **GET /api/words**
  - Description: Retrieve a list of words for the authenticated user without pagination.
  - Query Parameters: sort (by creation date), and optional filter (by tag).
  - Response: { "data": [ word objects ] }

- **GET /api/words/{id}**
  - Description: Retrieve details for a specific word, including any associated tags.
  - Response: Word object.

- **POST /api/words**
  - Description: Create a new word entry.
  - Request Payload:
    ```json
    {
      "word": "string",
      "translation": "string",
      "tags": ["tag1", "tag2"],
      "phonetic": "string (optional)",
      "audio_url": "string (optional)",
      "examples": {}
    }
    ```
  - Response: Created word object with success code.
  - Business Logic: On creation, trigger a fetch from a dictionary API (e.g., dictionaryapi.dev) to enrich the word data (phonetic, audio, examples). Error in enrichment should still allow word creation with a notification to the client.

- **PUT /api/words/{id}**
  - Description: Update an existing word. If the English word is modified, re-fetch enrichment data from the dictionary API.
  - Request Payload: Same as POST /api/words.
  - Response: Updated word object.
  - Validation: Ensure required fields are provided and the user making the request owns the word.

- **DELETE /api/words/{id}**
  - Description: Delete an existing word.
  - Response: Success message or error if the word is not found.

### Tags Endpoints

- **GET /api/tags**
  - Description: Retrieve all tags for the authenticated user.
  - Response: An array of tag objects.

- **POST /api/tags**
  - Description: Create a new tag.
  - Request Payload: { "name": "string" }
  - Response: Created tag object.
  - Validation: Ensure the tag name is unique for the user.

- **PUT /api/tags/{id}**
  - Description: Update an existing tag’s name.
  - Request Payload: { "name": "string" }
  - Response: Updated tag object.

- **DELETE /api/tags/{id}**
  - Description: Delete a tag.
  - Response: Success message. Optionally, clean-up related associations in the join table.

### Quiz Endpoints (Business Logic)

- **GET /api/quiz**
  - Description: Initialize a quiz session for the user.
  - Query Parameters: direction (EN→PL or PL→EN), tag (optional for filtering), mode (all words vs. tagged subset).
  - Response: A randomized list of questions, for example:
    ```json
    {
      "questions": [
        {
          "word_id": "uuid",
          "word_en": "string",
          "word_pl": "string",
          "audio": "string",
          "examples": {}
        }
      ]
    }
    ```

## 4. Validation and Business Logic

### Validation

- **Users**:
  - Email format validation.
  - Password minimum length (8 characters).

- **Words**:
  - Required fields: "word" and "translation".
  - On creation/update, the API integrates with the dictionary API to enrich data if not overridden.
  - Must ensure the word belongs to the authenticated user.

- **Tags**:
  - Tag name is required and must be unique per user.

### Business Logic Implementation

- **Dictionary API Integration**: For word creation or update when the English word changes, the API calls an external dictionary service to retrieve phonetic, audio, and example data. If the call fails, the word is still saved, but the client is notified about incomplete enrichment.

- **Quiz Flow**:
  - The API collects the user’s words (optionally filtered by tag) and returns them in randomized order.
  - Users provide self-assessment for each word which influences its repetition in the quiz session.
  - The quiz endpoints are stateless, with any necessary session state passed client-side or as part of the API request.

## Security and Performance

- **Security**:
  - Database RLS ensures users only access their own data.

- **Performance**:
  - Caching of dictionary API responses where applicable to minimize external API calls.

## Assumptions

- Word enrichment from the dictionary API is synchronous; this could be optimized asynchronously for high volume.
- Quiz endpoints are designed to be stateless, relying on client-side session management if necessary.

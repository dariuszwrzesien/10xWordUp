/**
 * Interfejs dla odpowiedzi z Dictionary API
 */
interface DictionaryApiResponse {
  word: string;
  phonetic?: string;
  phonetics?: {
    text?: string;
    audio?: string;
  }[];
  meanings?: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
}

/**
 * Interfejs dla wzbogaconych danych słowa
 */
export interface EnrichedWordData {
  phonetic: string | null;
  audio_url: string | null;
  examples: {
    definitions?: {
      partOfSpeech: string;
      definition: string;
      example?: string;
    }[];
  } | null;
}

/**
 * Serwis do pobierania danych z Dictionary API
 */
export class DictionaryService {
  private readonly apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en";
  private readonly cache = new Map<string, EnrichedWordData>();

  /**
   * Pobiera wzbogacone dane dla słowa z Dictionary API
   * @param word - Słowo do wyszukania (po angielsku)
   * @returns Wzbogacone dane lub null jeśli nie znaleziono
   */
  async fetchWordData(word: string): Promise<EnrichedWordData | null> {
    // Sprawdź cache
    const cacheKey = word.toLowerCase();
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.apiUrl}/${encodeURIComponent(word)}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Jeśli słowo nie zostało znalezione, zwracamy null
        if (response.status === 404) {
          console.log(`Word "${word}" not found in dictionary API`);
          return null;
        }
        throw new Error(`Dictionary API error: ${response.status}`);
      }

      const data = (await response.json()) as DictionaryApiResponse[];

      if (!data || data.length === 0) {
        return null;
      }

      const enrichedData = this.transformApiResponse(data[0]);

      // Zapisz w cache
      this.cache.set(cacheKey, enrichedData);

      return enrichedData;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.error(`Dictionary API request timeout for word "${word}"`);
      } else {
        console.error("Error fetching dictionary data:", error);
      }
      return null;
    }
  }

  /**
   * Transformuje odpowiedź z API do formatu używanego w aplikacji
   */
  private transformApiResponse(data: DictionaryApiResponse): EnrichedWordData {
    // Znajdź fonetykę
    const phonetic = data.phonetic || data.phonetics?.[0]?.text || null;

    // Znajdź URL audio (preferujemy US pronunciation)
    let audioUrl: string | null = null;
    if (data.phonetics && data.phonetics.length > 0) {
      // Szukaj US audio
      const usAudio = data.phonetics.find((p) => p.audio && p.audio.includes("-us"));
      if (usAudio?.audio) {
        audioUrl = usAudio.audio;
      } else {
        // Jeśli nie ma US, weź pierwsze dostępne
        const firstAudio = data.phonetics.find((p) => p.audio);
        audioUrl = firstAudio?.audio || null;
      }
    }

    // Zbierz przykłady i definicje
    const examples: EnrichedWordData["examples"] = null;
    if (data.meanings && data.meanings.length > 0) {
      const definitions = data.meanings.flatMap((meaning) =>
        meaning.definitions.slice(0, 2).map((def) => ({
          partOfSpeech: meaning.partOfSpeech,
          definition: def.definition,
          example: def.example,
        }))
      );

      if (definitions.length > 0) {
        return {
          phonetic,
          audio_url: audioUrl,
          examples: { definitions },
        };
      }
    }

    return {
      phonetic,
      audio_url: audioUrl,
      examples,
    };
  }

  /**
   * Czyści cache (opcjonalnie dla konkretnego słowa)
   */
  clearCache(word?: string): void {
    if (word) {
      this.cache.delete(word.toLowerCase());
    } else {
      this.cache.clear();
    }
  }
}

// Eksportujemy singleton instancję
export const dictionaryService = new DictionaryService();

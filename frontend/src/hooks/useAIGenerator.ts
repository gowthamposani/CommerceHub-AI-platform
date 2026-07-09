import { useCallback, useState } from "react";

import { getApiErrorMessage, notifyApiFailure } from "../lib/api";
import { generateProductDescription } from "../services/ai.service";
import type { AIProductDescription, AIProductDescriptionRequest } from "../types/ai";

export function useAIGenerator() {
  const [data, setData] = useState<AIProductDescription | null>(null);
  const [lastPayload, setLastPayload] = useState<AIProductDescriptionRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (payload: AIProductDescriptionRequest) => {
    setLoading(true);
    setError(null);

    try {
      const description = await generateProductDescription(payload);
      setLastPayload(payload);
      setData(description);
      return description;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError);
      setError(message);
      notifyApiFailure(requestError, "AI generation failed");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setLastPayload(null);
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    if (!lastPayload) {
      return;
    }

    await generate(lastPayload);
  }, [generate, lastPayload]);

  return { data, loading, error, refetch, generate, clear };
}

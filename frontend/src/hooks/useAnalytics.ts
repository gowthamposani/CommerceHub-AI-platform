import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage, notifyApiFailure } from "../lib/api";
import { getAnalytics } from "../services/admin.service";
import type { AnalyticsData } from "../types/admin";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const analytics = await getAnalytics();
      setData(analytics);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      notifyApiFailure(requestError, "Analytics unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

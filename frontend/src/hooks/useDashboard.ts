import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage, notifyApiFailure } from "../lib/api";
import { getDashboard } from "../services/admin.service";
import type { DashboardSummary } from "../types/admin";

export function useDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboard = await getDashboard();
      setData(dashboard);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
      notifyApiFailure(requestError, "Dashboard unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

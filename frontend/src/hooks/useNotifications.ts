import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "../lib/api";
import {
  getNotificationHistory,
  getNotificationTemplates,
  sendNotification,
} from "../services/admin.service";
import type {
  NotificationHistoryItem,
  NotificationTemplate,
  SendNotificationRequest,
} from "../types/admin";

export function useNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [templateData, historyData] = await Promise.all([
        getNotificationTemplates(),
        getNotificationHistory(),
      ]);
      setTemplates(templateData);
      setHistory(historyData);
    } catch (requestError) {
      setTemplates([]);
      setHistory([]);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(
    async (payload: SendNotificationRequest) => {
      setSending(true);
      setError(null);

      try {
        await sendNotification(payload);
        await refetch();
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setSending(false);
      }
    },
    [refetch],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { error, history, loading, refetch, send, sending, templates };
}

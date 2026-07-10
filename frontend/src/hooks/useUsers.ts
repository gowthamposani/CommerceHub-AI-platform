import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "../lib/api";
import { getUsers, updateUserStatus } from "../services/admin.service";
import type { AdminUser, UpdateUserStatusRequest } from "../types/admin";

export function useUsers() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const users = await getUsers();
      setData(users);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (userId: string, payload: UpdateUserStatusRequest) => {
      setError(null);

      try {
        const updatedUser = await updateUserStatus(userId, payload);
        setData((currentUsers) =>
          currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
        );
        return updatedUser;
      } catch (requestError) {
        const message = getApiErrorMessage(requestError);
        setError(message);
        throw requestError;
      }
    },
    [],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, loading, error, refetch, updateStatus };
}

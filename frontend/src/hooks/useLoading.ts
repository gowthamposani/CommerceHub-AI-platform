import { useState } from "react";

export function useLoading(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading);

  async function withLoading<T>(task: () => Promise<T>): Promise<T> {
    setLoading(true);
    try {
      return await task();
    } finally {
      setLoading(false);
    }
  }

  return { loading, setLoading, withLoading };
}

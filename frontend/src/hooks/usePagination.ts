import { useMemo, useState } from "react";

export function usePagination(initialPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  return useMemo(
    () => ({
      page,
      pageSize,
      setPage,
      setPageSize: (nextPageSize: number) => {
        setPage(1);
        setPageSize(nextPageSize);
      },
      offset: (page - 1) * pageSize
    }),
    [page, pageSize]
  );
}

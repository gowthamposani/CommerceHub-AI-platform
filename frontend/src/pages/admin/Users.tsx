import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { UserTable } from "../../components/admin/UserTable";
import { useUsers } from "../../hooks/useUsers";

export default function Users() {
  const { data: users, error, loading, refetch } = useUsers();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return users;
    }

    return users.filter((user) =>
      [user.fullName, user.email, user.role, user.status].some((value) =>
        value.toLowerCase().includes(search),
      ),
    );
  }, [query, users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Users</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor accounts, access, and status
          </p>
        </div>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 rounded-admin bg-admin-gold px-4 text-sm font-medium text-white transition hover:bg-[#B67B24]"
          type="button"
          onClick={() => void refetch()}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : error ? (
        <EmptyState title="Users unavailable" description={error} />
      ) : users.length > 0 ? (
        <UserTable
          users={filteredUsers}
          searchValue={query}
          currentPage={page}
          onSearchChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          onPageChange={setPage}
        />
      ) : (
        <EmptyState title="No users available" />
      )}
    </div>
  );
}

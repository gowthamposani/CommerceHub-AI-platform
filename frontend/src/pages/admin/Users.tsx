import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "../../components/admin/EmptyState";
import { LoadingSkeleton } from "../../components/admin/LoadingSkeleton";
import { Sidebar } from "../../components/admin/Sidebar";
import { TopNavbar } from "../../components/admin/TopNavbar";
import { UserTable } from "../../components/admin/UserTable";
import { getUsers, type AdminUser } from "../../services/admin.service";

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .finally(() => setIsLoading(false));
  }, []);

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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar />
      <div className="lg:pl-72">
        <TopNavbar title="Users" subtitle="Monitor accounts, access, and status" />
        <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {isLoading ? (
            <LoadingSkeleton rows={8} />
          ) : users.length ? (
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
            <EmptyState title="No users found" description="Mock users will appear here." />
          )}
        </main>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import type { AdminUser } from "../../services/admin.service";

type UserTableProps = {
  users: AdminUser[];
  searchValue: string;
  currentPage: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
};

const pageSize = 5;

const statusStyles: Record<AdminUser["status"], string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300",
  INACTIVE: "bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300",
  BLOCKED: "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950 dark:text-rose-300",
};

export function UserTable({
  users,
  searchValue,
  currentPage,
  onSearchChange,
  onPageChange,
}: UserTableProps) {
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const start = (currentPage - 1) * pageSize;
  const visibleUsers = users.slice(start, start + pageSize);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">User Management</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review user identity, role assignment, and account status.
          </p>
        </div>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <span className="sr-only">Search users</span>
          <input
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-slate-600 dark:focus:ring-slate-800 sm:w-72"
            placeholder="Search users"
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-950">
                <td className="whitespace-nowrap px-5 py-4 font-medium">{user.fullName}</td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-slate-300">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-5 py-4">{user.role}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusStyles[user.status]}`}>
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">
                  {user.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing {visibleUsers.length} of {users.length} users
        </p>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
            type="button"
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="text-sm font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300"
            type="button"
            aria-label="Next page"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

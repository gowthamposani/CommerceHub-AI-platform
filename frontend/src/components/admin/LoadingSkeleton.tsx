type LoadingSkeletonProps = {
  rows?: number;
};

export function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-admin border border-admin-border bg-white p-4 shadow-admin-soft dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-4 w-1/3 rounded-full bg-admin-cream dark:bg-slate-800" />
          <div className="mt-4 h-3 w-2/3 rounded-full bg-admin-cream/70 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

type LoadingSkeletonProps = {
  rows?: number;
};

export function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="mt-4 h-3 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={safeValue}>
      <div className="h-full rounded-full bg-brand-gold transition-all" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

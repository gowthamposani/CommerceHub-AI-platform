import { Spinner } from "@/components/ui/Spinner";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white">
      <Spinner />
      <span className="text-sm font-semibold text-gray-600">{label}</span>
    </div>
  );
}

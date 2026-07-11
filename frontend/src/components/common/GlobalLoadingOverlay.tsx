import { Spinner } from "@/components/ui/Spinner";
import { useAppState } from "@/hooks/useAppState";

export function GlobalLoadingOverlay() {
  const { globalLoading } = useAppState();

  if (!globalLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-panel">
        <Spinner />
        <span className="text-sm font-semibold text-gray-700">Processing</span>
      </div>
    </div>
  );
}

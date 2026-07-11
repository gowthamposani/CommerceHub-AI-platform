import { Spinner } from "@/components/ui/Spinner";

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

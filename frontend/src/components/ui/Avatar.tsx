import { initials } from "@/utils/strings";

export function Avatar({ name }: { name: string }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
      {initials(name)}
    </span>
  );
}

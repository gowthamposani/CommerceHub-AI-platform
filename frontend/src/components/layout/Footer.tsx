import { APP_NAME } from "@/constants/app";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-4 text-xs text-gray-500 lg:px-6">
      {APP_NAME} frontend foundation. Business modules plug in through routes, services, and reusable components.
    </footer>
  );
}

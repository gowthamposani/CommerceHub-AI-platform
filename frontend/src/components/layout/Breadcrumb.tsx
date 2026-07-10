import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500" aria-label="Breadcrumb">
      <Link to="/" className="inline-flex items-center gap-1 font-medium hover:text-gray-900">
        <Home className="h-4 w-4" />
        Home
      </Link>
      {segments.map((segment) => (
        <span key={segment} className="inline-flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <span className="capitalize">{segment.split("-").join(" ")}</span>
        </span>
      ))}
    </nav>
  );
}

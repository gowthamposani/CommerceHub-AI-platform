import { Link } from "react-router-dom";
import { ArrowRight, Home, SearchX } from "lucide-react";

import { ButtonLink, EmptyState } from "../components/ui";

export function NotFoundPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <EmptyState
          icon={<SearchX className="h-8 w-8" />}
          title="We could not find that page"
          description="The page may have moved or the URL may have been typed incorrectly."
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ButtonLink to="/home" variant="primary">
                <Home className="h-4 w-4" />
                Go home
              </ButtonLink>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-2xl border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-text transition hover:border-brand-primary/30"
              >
                Browse products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

import { ErrorState } from "@/components/common/ErrorState";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <PageLayout title="Page not found">
      <ErrorState title="404" message="The requested route does not exist in this frontend foundation." />
      <Link to="/">
        <Button>Back to foundation</Button>
      </Link>
    </PageLayout>
  );
}

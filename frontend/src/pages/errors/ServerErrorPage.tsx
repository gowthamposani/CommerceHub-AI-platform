import { ErrorState } from "@/components/common/ErrorState";
import { PageLayout } from "@/components/layout/PageLayout";

export default function ServerErrorPage() {
  return (
    <PageLayout title="Application error">
      <ErrorState title="500" message="The application encountered an unexpected error." />
    </PageLayout>
  );
}

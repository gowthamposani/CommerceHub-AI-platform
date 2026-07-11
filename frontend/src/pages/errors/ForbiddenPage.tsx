import { ErrorState } from "@/components/common/ErrorState";
import { PageLayout } from "@/components/layout/PageLayout";

export default function ForbiddenPage() {
  return (
    <PageLayout title="Access restricted">
      <ErrorState title="403" message="Permission handling will be connected by the authentication module." />
    </PageLayout>
  );
}

import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageLayout } from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { queryKeys } from "@/lib/queryKeys";
import { getHealth } from "@/services/healthService";

export default function StatusPage() {
  const healthQuery = useQuery({ queryKey: queryKeys.health, queryFn: getHealth });

  if (healthQuery.isLoading) {
    return <LoadingState label="Checking application status" />;
  }

  if (healthQuery.isError) {
    return <ErrorState title="Status unavailable" message="The API status endpoint could not be reached." />;
  }

  return (
    <PageLayout
      title="System Status"
      description="Frontend-ready status page connected to the backend health contract."
    >
      <Card>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500">Backend health</p>
            <p className="mt-1 text-xl font-extrabold text-gray-950">{healthQuery.data?.data?.status ?? "unknown"}</p>
          </div>
          <Badge tone={healthQuery.data?.success ? "success" : "danger"}>
            {healthQuery.data?.message ?? "Unknown"}
          </Badge>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

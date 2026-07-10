import { Clock } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { WarehouseActivity } from "@/types/warehouse";
import { formatDate } from "@/utils/formatters";

export function WarehouseActivityTimeline({ activities }: { activities: WarehouseActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-bold text-gray-950">Warehouse Activity Timeline</h2>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">No warehouse activity is available yet.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-50 text-brand-gold">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="min-w-0 border-b border-gray-100 pb-4 last:border-0">
                  <p className="text-sm font-bold text-gray-950">{activity.label}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="mt-1 text-xs font-semibold text-gray-500">{formatDate(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

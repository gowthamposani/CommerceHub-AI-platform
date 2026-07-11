import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
        <Inbox className="h-10 w-10 text-gray-400" aria-hidden="true" />
        <h2 className="mt-4 text-base font-bold text-gray-900">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
}

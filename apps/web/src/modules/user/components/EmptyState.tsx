import { BellRing } from "lucide-react";
import { Card } from "../../../components/ui";

export const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <Card className="rounded-2xl border-dashed text-center">
    <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
      <BellRing className="h-4 w-4" />
    </div>
    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{message}</p>
  </Card>
);

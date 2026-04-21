import clsx from "clsx";
import { formatDateTime, prettifyStatus, statusTone } from "../utils/user.helpers";

type TimelineItem = {
  title: string;
  description?: string;
  time?: string;
  status?: string;
};

const toneClasses: Record<string, string> = {
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-red-400",
  info: "bg-blue-400",
  neutral: "bg-slate-400"
};

export const Timeline = ({ items }: { items: TimelineItem[] }) => (
  <div className="space-y-4">
    {items.map((item, index) => {
      const tone = statusTone(item.status);
      return (
        <div key={`${item.title}-${index}`} className="relative pl-6">
          <span className={clsx("absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full", toneClasses[tone])} />
          <p className="text-sm font-semibold text-slate-900">{prettifyStatus(item.title)}</p>
          {item.description ? <p className="text-sm text-slate-600">{item.description}</p> : null}
          {item.time ? <p className="text-xs text-slate-500">{formatDateTime(item.time)}</p> : null}
        </div>
      );
    })}
  </div>
);

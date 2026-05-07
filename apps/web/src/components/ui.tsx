import clsx from "clsx";
import type React from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, TextareaHTMLAttributes } from "react";
import { MoreHorizontal, Search, X } from "lucide-react";

export const Button = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={clsx(
      "min-h-11 cursor-pointer rounded-xl bg-action px-4 py-2.5 text-sm font-semibold text-white shadow-premium transition duration-200 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-60",
      className
    )}
    {...props}
  />
);

export const SecondaryButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={clsx(
      "min-h-11 cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
      className
    )}
    {...props}
  />
);

export const Card = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <div className={clsx("rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm", className)}>{children}</div>
);

export const Input = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={clsx(
      "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200",
      className
    )}
  />
);

export const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={clsx(
      "min-h-28 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200",
      className
    )}
  />
);

export const Select = ({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={clsx(
      "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200",
      className
    )}
  >
    {children}
  </select>
);

export const PageContainer = ({ children }: PropsWithChildren) => (
  <div className="mx-auto w-full max-w-[90rem] px-4 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10">{children}</div>
);

export const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-6 space-y-1">
    <h2 className="text-fluid-h2 font-bold text-slate-900">{title}</h2>
    {subtitle && <p className="max-w-3xl text-sm text-slate-600">{subtitle}</p>}
  </div>
);

export const Badge = ({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) => {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700"
  };
  return <span className={clsx("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{label}</span>;
};

export const StatusBadge = ({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" | "info" }) => (
  <Badge label={label.replace(/_/g, " ")} tone={tone} />
);

export const StatCard = ({ title, value, hint }: { title: string; value: string | number; hint?: string }) => (
  <Card className="space-y-1">
    <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </Card>
);

export const EmptyState = ({ title, message }: { title: string; message: string }) => (
  <Card className="text-center">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-600">{message}</p>
  </Card>
);

export const SkeletonRows = ({ rows = 4 }: { rows?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="h-10 animate-pulse rounded-xl bg-slate-200" />
    ))}
  </div>
);

export const LoadingState = ({ rows = 6 }: { rows?: number }) => (
  <Card className="space-y-3">
    <div className="h-5 w-48 animate-pulse rounded-md bg-slate-200" />
    <SkeletonRows rows={rows} />
  </Card>
);

export const PageHeader = ({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) => (
  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur sm:p-5 md:flex-row md:items-start md:gap-4">
    <div className="min-w-0">
      <h2 className="truncate text-fluid-h3 font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 max-w-3xl text-sm text-slate-600">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div>}
  </div>
);

export const SectionCard = ({
  title,
  subtitle,
  actions,
  children,
  className
}: PropsWithChildren<{ title?: string; subtitle?: string; actions?: React.ReactNode; className?: string }>) => (
  <Card className={clsx("space-y-4", className)}>
    {(title || subtitle || actions) && (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </Card>
);

export const SearchInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <div className={clsx("relative", className)}>
    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
    <Input {...props} className="pl-9" />
  </div>
);

export const FilterBar = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 md:flex-row md:flex-wrap md:items-center">{children}</div>
);

export const DataTable = ({
  columns,
  rows,
  className,
  mobileCards = true
}: {
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  className?: string;
  mobileCards?: boolean;
}) => (
  <div className={clsx("overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}>
    {mobileCards ? (
      <div className="divide-y divide-slate-100 md:hidden">
        {rows.map((row, idx) => (
          <div key={idx} className="space-y-2 p-4">
            {row.map((cell, cellIdx) => (
              <div key={cellIdx} className="flex items-start justify-between gap-3">
                <span className="w-1/3 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">{columns[cellIdx]}</span>
                <span className="min-w-0 flex-1 text-right text-sm text-slate-700">{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ) : null}
    <div className="hidden overflow-x-auto md:block">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={idx} className="transition duration-200 hover:bg-slate-50/80">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 align-top text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ActionMenu = ({
  actions
}: {
  actions: Array<{ label: string; onClick: () => void; tone?: "normal" | "danger" }>;
}) => (
  <details className="group relative">
    <summary className="inline-flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100">
      <MoreHorizontal className="h-4 w-4" />
    </summary>
    <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={clsx(
            "block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition hover:bg-slate-100",
            action.tone === "danger" ? "text-red-600" : "text-slate-700"
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  </details>
);

export const Drawer = ({
  open,
  title,
  onClose,
  children
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

export const Modal = ({
  open,
  title,
  onClose,
  children
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export const DetailPanel = ({ title, children }: PropsWithChildren<{ title: string }>) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
    <h4 className="mb-2 text-sm font-semibold text-slate-900">{title}</h4>
    <div className="space-y-2 text-sm text-slate-600">{children}</div>
  </div>
);

export const Timeline = ({
  items
}: {
  items: Array<{ title: string; description?: string; time?: string; tone?: "neutral" | "success" | "warning" | "danger" }>;
}) => {
  const tones = {
    neutral: "bg-slate-300",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-red-400"
  };
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={`${item.title}-${idx}`} className="relative pl-6">
          <span className={clsx("absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full", tones[item.tone ?? "neutral"])} />
          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
          {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
          {item.time && <p className="text-xs text-slate-500">{item.time}</p>}
        </div>
      ))}
    </div>
  );
};

export const NotificationMenu = ({ notifications }: { notifications: Array<{ title: string; detail: string }> }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
    <h4 className="mb-2 text-sm font-semibold text-slate-900">Notifications</h4>
    <div className="space-y-2">
      {notifications.length ? (
        notifications.map((n, idx) => (
          <div key={`${n.title}-${idx}`} className="rounded-lg border border-slate-100 p-2">
            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
            <p className="text-xs text-slate-500">{n.detail}</p>
          </div>
        ))
      ) : (
        <p className="text-sm text-slate-500">No notifications</p>
      )}
    </div>
  </div>
);

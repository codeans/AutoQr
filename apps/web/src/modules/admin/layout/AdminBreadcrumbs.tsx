interface AdminBreadcrumbsProps {
  pathname: string;
}

export const AdminBreadcrumbs = ({ pathname }: AdminBreadcrumbsProps) => {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const breadcrumbs = ["Admin", ...parts.map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))];
  return (
    <p className="max-w-[58vw] truncate text-xs font-medium text-slate-500 sm:max-w-[48vw] lg:max-w-none">
      {breadcrumbs.join(" / ")}
    </p>
  );
};

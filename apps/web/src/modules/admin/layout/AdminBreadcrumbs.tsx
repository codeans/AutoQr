interface AdminBreadcrumbsProps {
  pathname: string;
}

export const AdminBreadcrumbs = ({ pathname }: AdminBreadcrumbsProps) => {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const breadcrumbs = ["Admin", ...parts.map((part) => part.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))];
  return <p className="text-xs font-medium text-slate-500">{breadcrumbs.join(" / ")}</p>;
};

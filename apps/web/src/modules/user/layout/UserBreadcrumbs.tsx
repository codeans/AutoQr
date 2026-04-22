import { Link, useLocation } from "react-router-dom";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  cars: "My cars",
  activate: "Activate a car tag",
  tags: "My car tags",
  alerts: "Car scan alerts",
  emergency: "Emergency contacts",
  incidents: "Car incidents",
  calls: "Contact calls",
  orders: "Orders",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings"
};

export const UserBreadcrumbs = () => {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  const segments = parts.map((part, index) => ({
    label: labelMap[part] || part,
    path: `/${parts.slice(0, index + 1).join("/")}`
  }));

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500" aria-label="Breadcrumb">
      {segments.map((segment, index) => (
        <span key={segment.path} className="inline-flex items-center gap-1">
          {index < segments.length - 1 ? (
            <Link to={segment.path} className="transition hover:text-slate-700">
              {segment.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-700">{segment.label}</span>
          )}
          {index < segments.length - 1 ? <span>/</span> : null}
        </span>
      ))}
    </nav>
  );
};

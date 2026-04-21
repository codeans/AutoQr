import {
  CreditCard,
  FileClock,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  QrCode,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  Bell,
  LucideIcon,
  X
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

interface AdminSidebarProps {
  collapsed: boolean;
  mobile?: boolean;
  onCloseMobile?: () => void;
}

interface AdminNavItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [{ path: "/admin", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    title: "Workspace",
    items: [
      { path: "/admin/users", label: "Users", icon: Users },
      { path: "/admin/vehicles", label: "Vehicles", icon: Truck },
      { path: "/admin/incidents", label: "Incidents", icon: LifeBuoy },
      { path: "/admin/calls", label: "Calls", icon: Bell }
    ]
  },
  {
    title: "Commerce",
    items: [
      { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { path: "/admin/payments", label: "Payments", icon: CreditCard },
      { path: "/admin/qrs", label: "QRs", icon: QrCode },
      { path: "/admin/shipments", label: "Shipments", icon: Package }
    ]
  },
  {
    title: "System",
    items: [
      { path: "/admin/content", label: "Content", icon: FileText },
      { path: "/admin/audit-logs", label: "Audit Logs", icon: FileClock }
    ]
  }
];

export const AdminSidebar = ({ collapsed, mobile = false, onCloseMobile }: AdminSidebarProps) => {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg shadow-slate-900/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <p className="text-sm font-semibold text-slate-900">AutoQr</p>
              <p className="text-xs text-slate-500">Admin Console</p>
            </div>
          )}
        </Link>
        {mobile && (
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {adminNavGroups.map((group) => (
          <div key={group.title}>
            {(!collapsed || mobile) && <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {(!collapsed || mobile) && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1 border-t border-slate-200/80 p-3">
        <NavLink
          to="/admin/settings"
          onClick={onCloseMobile}
          className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
        >
          <Settings className="h-4 w-4" />
          {(!collapsed || mobile) && "Settings"}
        </NavLink>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          {(!collapsed || mobile) && "Logout"}
        </button>
        {(!collapsed || mobile) && (
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "Admin User"}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? "admin@autoqr.app"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

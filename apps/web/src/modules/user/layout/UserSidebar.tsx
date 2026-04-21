import { Bell, CarFront, LayoutDashboard, LogOut, PhoneCall, ReceiptText, Settings, ShieldCheck, TriangleAlert, UserCircle2, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/dashboard/vehicles", label: "Vehicles", icon: CarFront },
  { path: "/dashboard/incidents", label: "Incidents", icon: TriangleAlert },
  { path: "/dashboard/calls", label: "Calls", icon: PhoneCall },
  { path: "/dashboard/orders", label: "Orders", icon: ReceiptText },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { path: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
  { path: "/dashboard/settings", label: "Settings", icon: Settings }
];

type UserSidebarProps = {
  collapsed: boolean;
  mobile?: boolean;
  onCloseMobile?: () => void;
};

export const UserSidebar = ({ collapsed, mobile = false, onCloseMobile }: UserSidebarProps) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-2 text-white shadow-lg shadow-slate-900/20">
            <ShieldCheck className="h-4 w-4" />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <p className="text-sm font-semibold text-slate-900">AutoQr</p>
              <p className="text-xs text-slate-500">Owner Panel</p>
            </div>
          )}
        </Link>
        {mobile ? (
          <button
            type="button"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={mobile ? onCloseMobile : undefined}
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
      </nav>

      <div className="space-y-2 border-t border-slate-200/80 p-3">
        <Link
          to="/dashboard/profile"
          onClick={mobile ? onCloseMobile : undefined}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <UserCircle2 className="h-4 w-4 text-slate-600" />
          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "Owner"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? "owner@autoqr.app"}</p>
            </div>
          )}
        </Link>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          onClick={() => logout()}
        >
          <LogOut className="h-4 w-4" />
          {(!collapsed || mobile) && "Logout"}
        </button>
      </div>
    </div>
  );
};

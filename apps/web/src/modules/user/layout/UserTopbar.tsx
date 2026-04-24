import { Bell, Menu, MoonStar, Search, Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { UserBreadcrumbs } from "./UserBreadcrumbs";

type UserTopbarProps = {
  onOpenDrawer: () => void;
  onToggleSidebar: () => void;
};

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/cars": "My cars",
  "/dashboard/activate": "Activate a car tag",
  "/dashboard/tags": "My car tags",
  "/dashboard/alerts": "Car scan alerts",
  "/dashboard/emergency": "Emergency contacts",
  "/dashboard/incidents": "Car incidents",
  "/dashboard/calls": "Contact calls",
  "/dashboard/orders": "Orders",
  "/dashboard/notifications": "Notifications",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings"
};

export const UserTopbar = ({ onOpenDrawer, onToggleSidebar }: UserTopbarProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const title = useMemo(() => titleMap[location.pathname] ?? "User Panel", [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            onClick={onOpenDrawer}
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:inline-flex"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar size"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div>
            <UserBreadcrumbs />
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden w-full max-w-sm lg:block">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search incidents, orders, calls..." className="pl-9" />
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Toggle theme"
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <div className="max-w-40">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "Owner User"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? "owner@autoqr.app"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

import { Bell, Menu, UserCog, Wrench } from "lucide-react";
import { Input } from "../../../components/ui";
import { useAuth } from "../../../context/AuthContext";
import { adminNavGroups } from "./AdminSidebar";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";

interface AdminTopbarProps {
  pathname: string;
  onOpenMobileSidebar: () => void;
  onToggleSidebar: () => void;
}

export const AdminTopbar = ({ pathname, onOpenMobileSidebar, onToggleSidebar }: AdminTopbarProps) => {
  const { user } = useAuth();
  const routeMap = adminNavGroups.flatMap((group) => group.items).reduce(
    (acc, item) => ({ ...acc, [item.path]: item.label }),
    {} as Record<string, string>
  );
  const currentPage = routeMap[pathname] ?? "Admin";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            onClick={onOpenMobileSidebar}
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
          <div className="min-w-0">
            <AdminBreadcrumbs pathname={pathname} />
            <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{currentPage}</h1>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden w-full max-w-md lg:block">
            <Input placeholder="Search users, orders, incidents..." className="pl-9" />
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
          >
            <Wrench className="h-4 w-4" />
            Quick Actions
          </button>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <UserCog className="h-4 w-4 text-slate-600" />
            <div className="max-w-40">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name ?? "Admin User"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? "admin@autoqr.app"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

import { useState } from "react";
import { Outlet } from "react-router-dom";
import { UserSidebar } from "./UserSidebar";
import { UserTopbar } from "./UserTopbar";

export const UserLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      {drawerOpen ? <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-slate-200/80 bg-white/95 shadow-xl backdrop-blur lg:block ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <UserSidebar collapsed={sidebarCollapsed} />
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white/95 shadow-xl backdrop-blur transition-transform lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <UserSidebar collapsed={false} mobile onCloseMobile={() => setDrawerOpen(false)} />
      </aside>

      <div className={`min-h-screen transition-all ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <UserTopbar onOpenDrawer={() => setDrawerOpen(true)} onToggleSidebar={() => setSidebarCollapsed((value) => !value)} />
        <main className="space-y-6 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

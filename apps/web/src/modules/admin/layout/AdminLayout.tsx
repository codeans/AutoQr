import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export const AdminLayout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100">
      {drawerOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={() => setDrawerOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-slate-200/80 bg-white/95 shadow-xl backdrop-blur lg:block ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <AdminSidebar collapsed={sidebarCollapsed} />
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 bg-white/95 shadow-xl backdrop-blur transition-transform lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar collapsed={false} mobile onCloseMobile={() => setDrawerOpen(false)} />
      </aside>

      <div className={`min-h-screen transition-all ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <AdminTopbar pathname={location.pathname} onOpenMobileSidebar={() => setDrawerOpen(true)} onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />
        <main className="mx-auto w-full max-w-[110rem] space-y-5 p-3 sm:space-y-6 sm:p-5 md:p-6 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

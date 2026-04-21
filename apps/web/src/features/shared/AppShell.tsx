import { Bell, CircleUserRound, QrCode, ShieldCheck } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button, PageContainer } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  `transition ${isActive ? "text-slate-900" : "text-slate-600 hover:text-slate-900"}`;

export const PublicShell = () => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(30,41,59,0.08),transparent_50%)]">
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
      <PageContainer>
        <div className="flex items-center justify-between py-2">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <QrCode className="h-5 w-5 text-action" />
            AutoQr
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <NavLink to="/how-it-works" className={navClassName}>
              How It Works
            </NavLink>
            <NavLink to="/pricing" className={navClassName}>
              Pricing
            </NavLink>
            <NavLink to="/faq" className={navClassName}>
              FAQ
            </NavLink>
            <NavLink to="/contact" className={navClassName}>
              Contact
            </NavLink>
            <NavLink to="/login" className={navClassName}>
              Login
            </NavLink>
            <Link to="/order">
              <Button className="py-2">Order Now</Button>
            </Link>
          </nav>
        </div>
      </PageContainer>
    </header>
    <PageContainer>
      <Outlet />
    </PageContainer>
    <footer className="border-t border-slate-200 bg-white/90">
      <PageContainer>
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs text-slate-500">
          <p>AutoQr - one-time paid, lifetime incident communication.</p>
          <div className="flex gap-4">
            <Link to="/faq" className="hover:text-slate-700">
              FAQ
            </Link>
            <Link to="/contact" className="hover:text-slate-700">
              Contact
            </Link>
            <Link to="/pricing" className="hover:text-slate-700">
              Pricing
            </Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  </div>
);

export const DashboardShell = () => {
  const { user, logout } = useAuth();
  const ownerLinks = [
    ["/dashboard", "Overview"],
    ["/dashboard/vehicle", "Vehicles/Items"],
    ["/dashboard/incidents", "Incidents"],
    ["/dashboard/calls", "Calls"],
    ["/dashboard/orders", "Orders & Payments"],
    ["/dashboard/profile", "Profile & Settings"],
    ["/dashboard/notifications", "Notifications"]
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck className="h-5 w-5 text-action" />
            <span className="font-semibold">AutoQr Owner Panel</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <Bell className="h-4 w-4" />
            <div className="flex items-center gap-2">
              <CircleUserRound className="h-4 w-4" />
              <span>{user?.name ?? "User"}</span>
            </div>
            <button className="cursor-pointer text-slate-700 underline-offset-2 hover:underline" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Workspace</h2>
          <div className="space-y-1 text-sm">
            {ownerLinks.map(([path, label]) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `block rounded-lg px-3 py-2 transition ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="space-y-6 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

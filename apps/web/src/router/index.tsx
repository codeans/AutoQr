import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ContactPage,
  FaqPage,
  ForCarOwnersPage,
  ForItemsPage,
  HomePage,
  HowItWorksPage,
  IncidentPage,
  LoginPage,
  OrderPage,
  PricingPage,
  RegisterPage
} from "../features/public/PublicPages";
import {
  AuditLogsPage,
  CallsPage,
  ContentPage,
  DashboardPage,
  IncidentsPage,
  OrdersPage,
  PaymentsPage,
  QRsPage,
  SettingsPage,
  ShipmentsPage,
  UsersPage,
  VehiclesPage
} from "../modules/admin/pages";
import { PublicShell } from "../features/shared/AppShell";
import { AdminLayout } from "../modules/admin/layout/AdminLayout";
import { UserLayout } from "../modules/user/layout/UserLayout";
import { CallsScreen } from "../modules/user/screens/Calls";
import { DashboardScreen } from "../modules/user/screens/Dashboard";
import { IncidentsScreen } from "../modules/user/screens/Incidents";
import { NotificationsScreen } from "../modules/user/screens/Notifications";
import { OrdersScreen } from "../modules/user/screens/Orders";
import { ProfileScreen } from "../modules/user/screens/Profile";
import { SettingsScreen } from "../modules/user/screens/Settings";
import { VehiclesScreen } from "../modules/user/screens/Vehicles";

const Protected = ({ role, children }: { role: "admin" | "owner"; children: React.ReactNode }) => {
  const { user, isBootstrapping } = useAuth();
  if (isBootstrapping) return <div className="p-8 text-sm text-slate-600">Loading workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppRouter = () => (
  <Routes>
    <Route element={<PublicShell />}>
      <Route index element={<HomePage />} />
      <Route path="how-it-works" element={<HowItWorksPage />} />
      <Route path="for-car-owners" element={<ForCarOwnersPage />} />
      <Route path="for-items" element={<ForItemsPage />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="faq" element={<FaqPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="order" element={<OrderPage />} />
      <Route path="incident/:token" element={<IncidentPage />} />
    </Route>

    <Route
      path="/dashboard"
      element={
        <Protected role="owner">
          <UserLayout />
        </Protected>
      }
    >
      <Route index element={<DashboardScreen />} />
      <Route path="vehicles" element={<VehiclesScreen />} />
      <Route path="vehicle" element={<Navigate to="/dashboard/vehicles" replace />} />
      <Route path="incidents" element={<IncidentsScreen />} />
      <Route path="incidents/:id" element={<Navigate to="/dashboard/incidents" replace />} />
      <Route path="calls" element={<CallsScreen />} />
      <Route path="orders" element={<OrdersScreen />} />
      <Route path="notifications" element={<NotificationsScreen />} />
      <Route path="profile" element={<ProfileScreen />} />
      <Route path="settings" element={<SettingsScreen />} />
    </Route>

    <Route
      path="/admin"
      element={
        <Protected role="admin">
          <AdminLayout />
        </Protected>
      }
    >
      <Route index element={<DashboardPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="vehicles" element={<VehiclesPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="qrs" element={<QRsPage />} />
      <Route path="incidents" element={<IncidentsPage />} />
      <Route path="calls" element={<CallsPage />} />
      <Route path="shipments" element={<ShipmentsPage />} />
      <Route path="content" element={<ContentPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="audit-logs" element={<AuditLogsPage />} />
    </Route>
  </Routes>
);

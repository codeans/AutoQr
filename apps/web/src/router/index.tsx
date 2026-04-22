import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MarketingLayout } from "../components/marketing/layout/MarketingLayout";
import { ContactPage } from "../pages/Contact";
import { FaqPage } from "../pages/FAQ";
import { ForCarOwnersPage } from "../pages/ForCarOwners";
import { HomePage } from "../pages/Home";
import { HowItWorksPage } from "../pages/HowItWorks";
import { IncidentPage } from "../pages/Incident";
import { LoginPage } from "../pages/Login";
import { OrderPage } from "../pages/Order";
import { PricingPage } from "../pages/Pricing";
import { RegisterPage } from "../pages/Register";
import { UseCasesPage } from "../pages/UseCases";
import { PartnerPage } from "../pages/Partner";
import { HelpCenterPage } from "../pages/HelpCenter";
import { PrivacyPage } from "../pages/Privacy";
import { TermsPage } from "../pages/Terms";
import {
  ActivationRecordsPage,
  AnalyticsPage,
  AuditLogsPage,
  CallsPage,
  CarsPage,
  ConsentPage,
  ContentPage,
  DashboardPage,
  IncidentsPage,
  OrdersPage,
  PaymentsPage,
  PlansPage,
  ScanAlertsPage,
  SettingsPage,
  ShipmentsPage,
  TagBatchesPage,
  TagsInventoryPage,
  UsersPage
} from "../modules/admin/pages";
import { AdminLayout } from "../modules/admin/layout/AdminLayout";
import { UserLayout } from "../modules/user/layout/UserLayout";
import { CallsScreen } from "../modules/user/screens/Calls";
import { DashboardScreen } from "../modules/user/screens/Dashboard";
import { IncidentsScreen } from "../modules/user/screens/Incidents";
import { NotificationsScreen } from "../modules/user/screens/Notifications";
import { OrdersScreen } from "../modules/user/screens/Orders";
import { ProfileScreen } from "../modules/user/screens/Profile";
import { SettingsScreen } from "../modules/user/screens/Settings";
import { ActivateScreen } from "../modules/user/screens/Activate";
import { TagsScreen } from "../modules/user/screens/Tags";
import { CarsScreen } from "../modules/user/screens/Cars";
import { EmergencyContactsScreen } from "../modules/user/screens/EmergencyContacts";
import { ScanAlertsScreen } from "../modules/user/screens/ScanAlerts";
import { PlansScreen } from "../modules/plans/screens/Plans";
import { PlanDetailScreen } from "../modules/plans/screens/PlanDetail";
import { OnboardingScreen } from "../modules/plans/screens/Onboarding";
import { OnboardingSuccessScreen } from "../modules/plans/screens/OnboardingSuccess";
import { ScanLandingScreen } from "../modules/scan/screens/ScanLanding";
import { ReporterCallScreen } from "../features/calls/ReporterCallScreen";

const Protected = ({ role, children }: { role: "admin" | "owner"; children: React.ReactNode }) => {
  const { user, isBootstrapping } = useAuth();
  if (isBootstrapping) return <div className="p-8 text-sm text-fog-300">Loading workspace...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const OnboardGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isBootstrapping } = useAuth();
  if (isBootstrapping) return <div className="p-8 text-sm text-fog-300">Loading...</div>;
  if (!user) {
    return <>{children}</>;
  }
  return <>{children}</>;
};

export const AppRouter = () => (
  <Routes>
    <Route path="scan/:token" element={<ScanLandingScreen />} />
    <Route path="call/reporter" element={<ReporterCallScreen />} />

    <Route element={<MarketingLayout />}>
      <Route index element={<HomePage />} />
      <Route path="how-it-works" element={<HowItWorksPage />} />
      <Route path="for-car-owners" element={<ForCarOwnersPage />} />
      <Route path="for-items" element={<Navigate to="/" replace />} />
      <Route path="use-cases" element={<UseCasesPage />} />
      <Route path="partner" element={<PartnerPage />} />
      <Route path="help" element={<HelpCenterPage />} />
      <Route path="privacy" element={<PrivacyPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="pricing" element={<PricingPage />} />
      <Route path="faq" element={<FaqPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route path="plans" element={<PlansScreen />} />
      <Route path="plans/:slug" element={<PlanDetailScreen />} />

      <Route path="shop" element={<Navigate to="/plans" replace />} />
      <Route path="shop/:slug" element={<Navigate to="/plans" replace />} />
      <Route path="cart" element={<Navigate to="/plans" replace />} />
      <Route path="checkout" element={<Navigate to="/plans" replace />} />

      <Route path="order" element={<OrderPage />} />
      <Route path="incident/:token" element={<IncidentPage />} />
    </Route>

    <Route
      path="/onboard/:slug"
      element={
        <OnboardGuard>
          <OnboardingScreen />
        </OnboardGuard>
      }
    />
    <Route path="/onboard/success" element={<OnboardingSuccessScreen />} />

    <Route
      path="/dashboard"
      element={
        <Protected role="owner">
          <UserLayout />
        </Protected>
      }
    >
      <Route index element={<DashboardScreen />} />
      <Route path="activate" element={<ActivateScreen />} />
      <Route path="tags" element={<TagsScreen />} />
      <Route path="cars" element={<CarsScreen />} />
      <Route path="vehicles" element={<Navigate to="/dashboard/cars" replace />} />
      <Route path="vehicle" element={<Navigate to="/dashboard/cars" replace />} />
      <Route path="vehicles-legacy" element={<Navigate to="/dashboard/cars" replace />} />
      <Route path="emergency" element={<EmergencyContactsScreen />} />
      <Route path="alerts" element={<ScanAlertsScreen />} />
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
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="cars" element={<CarsPage />} />
      <Route path="vehicles" element={<Navigate to="/admin/cars" replace />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="payments" element={<PaymentsPage />} />
      <Route path="plans" element={<PlansPage />} />
      <Route path="tag-batches" element={<TagBatchesPage />} />
      <Route path="tags" element={<TagsInventoryPage />} />
      <Route path="activations" element={<ActivationRecordsPage />} />
      <Route path="qrs" element={<Navigate to="/admin/tags" replace />} />
      <Route path="incidents" element={<IncidentsPage />} />
      <Route path="scan-alerts" element={<ScanAlertsPage />} />
      <Route path="calls" element={<CallsPage />} />
      <Route path="shipments" element={<ShipmentsPage />} />
      <Route path="consent" element={<ConsentPage />} />
      <Route path="content" element={<ContentPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="audit-logs" element={<AuditLogsPage />} />
    </Route>
  </Routes>
);

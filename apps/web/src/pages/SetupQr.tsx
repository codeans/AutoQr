import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ActivateScreen } from "../modules/user/screens/Activate";

export const SetupQrPage = () => {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) return <div className="p-8 text-sm text-content-muted">Loading…</div>;
  if (!user) return <Navigate to="/login?redirect=/setup-qr" replace />;
  if (user.role !== "owner") return <Navigate to="/" replace />;
  if (!user.phoneVerified) return <Navigate to="/register?redirect=/setup-qr" replace />;

  return <ActivateScreen />;
};


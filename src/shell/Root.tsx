import { AppErrorBoundary } from "../shared/components/AppErrorBoundary";
import { AuthScreen } from "../features/auth/AuthScreen";
import { AuthProvider, useAuth } from "../services/auth/AuthProvider";
import { initializeMonitoring } from "../services/monitoring/monitoring";

initializeMonitoring();
import App from "./App";

export default function Root() {
  return <AppErrorBoundary><AuthProvider><AppEntry /></AuthProvider></AppErrorBoundary>;
}

function AppEntry() {
  const auth = useAuth();
  if (!auth.ready) return null;
  if (auth.configured && !auth.user) return <AuthScreen />;
  return <App key={auth.user?.id ?? "local"} />;
}

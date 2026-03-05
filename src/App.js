import { Authenticator } from "@aws-amplify/ui-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ActivityLog from "./pages/ActivityLog";
import Analytics from "./pages/Analytics";
import { initAuthLogger } from "./services/authLogger";

// Initialize system logging listeners
initAuthLogger();

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <AuthProvider value={{ user, signOut }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute>
                    <ActivityLog />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      )}
    </Authenticator>
  );
}

export default App;

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";

// Guard for the OS (Must be logged in). Kicks back to Landing Page if not.
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

// Guard for Public Pages (Redirects to OS if already logged in)
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser) return <Navigate to="/app" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Landing />
              </PublicRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            }
          />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="roadmap"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Execution Timeline (Coming Soon)
                </div>
              }
            />
            <Route
              path="score"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Discotive Score (Coming Soon)
                </div>
              }
            />
            <Route
              path="finance"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Financial Ledger (Coming Soon)
                </div>
              }
            />
            <Route
              path="network"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Network & Hubs (Coming Soon)
                </div>
              }
            />
            <Route
              path="opportunities"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Opportunities (Coming Soon)
                </div>
              }
            />
            <Route
              path="vault"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Asset Vault (Coming Soon)
                </div>
              }
            />
            <Route
              path="settings"
              element={
                <div className="p-10 text-white font-bold text-2xl">
                  Settings (Coming Soon)
                </div>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

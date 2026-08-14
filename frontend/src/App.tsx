import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InterviewSetupPage } from "./pages/InterviewSetupPage";
import { InterviewScreenPage } from "./pages/InterviewScreenPage";
import { ResultPage } from "./pages/ResultPage";
import { PracticePage } from "./pages/PracticePage";
import { ResumeAnalyzerPage } from "./pages/ResumeAnalyzerPage";
import { ReportsPage } from "./pages/ReportsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?unregistered=true" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-[#090A0F] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 bg-mesh-pattern relative selection:bg-indigo-500 selection:text-white">
            <Navbar />
            <div className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute>
                      <InterviewSetupPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interview/:sessionId"
                  element={
                    <ProtectedRoute>
                      <InterviewScreenPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/result/:reportId"
                  element={
                    <ProtectedRoute>
                      <ResultPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/report/:reportId"
                  element={
                    <ProtectedRoute>
                      <ResultPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/practice"
                  element={
                    <ProtectedRoute>
                      <PracticePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume"
                  element={
                    <ProtectedRoute>
                      <ResumeAnalyzerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/leaderboard"
                  element={
                    <ProtectedRoute>
                      <LeaderboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

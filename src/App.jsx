import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import RoleRoute from '@/components/RoleRoute';
import { ThemeProvider } from '@/lib/theme';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Citizen pages
import CitizenLayout from '@/components/CitizenLayout';
import CitizenHome from '@/pages/citizen/CitizenHome';
import LiveMap from '@/pages/citizen/LiveMap';
import ReportIncident from '@/pages/citizen/ReportIncident';
import RouteCheck from '@/pages/citizen/RouteCheck';
import MyReports from '@/pages/citizen/MyReports';
import SafetyGuide from '@/pages/citizen/SafetyGuide';

// Authority pages
import AuthorityLayout from '@/components/AuthorityLayout';
import AuthorityOverview from '@/pages/authority/AuthorityOverview';
import AuthorityMap from '@/pages/authority/AuthorityMap';
import ReportsPage from '@/pages/authority/ReportsPage';
import VerificationQueue from '@/pages/authority/VerificationQueue';
import HotspotsPage from '@/pages/authority/HotspotsPage';
import WardsPage from '@/pages/authority/WardsPage';
import AnalyticsPage from '@/pages/authority/AnalyticsPage';
import ActionsPage from '@/pages/authority/ActionsPage';
import ComplianceReport from '@/pages/authority/ComplianceReport';
import DataLayers from '@/pages/authority/DataLayers';
import SettingsPage from '@/pages/authority/SettingsPage';
import AbcCampaigns from '@/pages/authority/AbcCampaigns';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#1a2744]">
        <div className="text-center text-white">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <div className="text-lg font-bold font-display">Pawlytics</div>
          <div className="text-blue-300 text-sm mt-1">Loading conflict intelligence...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        {/* Citizen PWA */}
        <Route element={<CitizenLayout />}>
          <Route path="/" element={<CitizenHome />} />
          <Route path="/map" element={<LiveMap />} />
          <Route path="/routes" element={<RouteCheck />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/safety" element={<SafetyGuide />} />
        </Route>

        {/* Report is full-screen (no bottom nav) */}
        <Route path="/report" element={<ReportIncident />} />

        {/* Authority Dashboard — admin role required */}
        <Route element={<RoleRoute requiredRole="admin" />}>
          <Route path="/authority" element={<AuthorityLayout />}>
            <Route index element={<AuthorityOverview />} />
            <Route path="map" element={<AuthorityMap />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="queue" element={<VerificationQueue />} />
            <Route path="hotspots" element={<HotspotsPage />} />
            <Route path="wards" element={<WardsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="actions" element={<ActionsPage />} />
            <Route path="compliance" element={<ComplianceReport />} />
            <Route path="abc-campaigns" element={<AbcCampaigns />} />
            <Route path="layers" element={<DataLayers />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContentPage from './pages/ContentPage';
import AuctionsPage from './pages/AuctionsPage';
import AuctionFormPage from './pages/AuctionFormPage';
import PracticeAreasPage from './pages/PracticeAreasPage';
import TeamMembersPage from './pages/TeamMembersPage';
import StudioContentPage from './pages/StudioContentPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import NewsletterPage from './pages/NewsletterPage';
import InformationPage from './pages/InformationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/backoffice">
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/auctions" element={<AuctionsPage />} />
                <Route path="/auctions/new" element={<AuctionFormPage />} />
                <Route
                  path="/auctions/:id/edit"
                  element={<AuctionFormPage />}
                />
                <Route path="/practice-areas" element={<PracticeAreasPage />} />
                <Route path="/team-members" element={<TeamMembersPage />} />
                <Route path="/studio-content" element={<StudioContentPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/newsletter" element={<NewsletterPage />} />
                <Route path="/information" element={<InformationPage />} />
              </Route>
            </Route>
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
              success: {
                iconTheme: {
                  primary: 'hsl(var(--primary))',
                  secondary: 'hsl(var(--primary-foreground))',
                },
              },
              error: {
                iconTheme: {
                  primary: 'hsl(var(--destructive))',
                  secondary: 'hsl(var(--destructive-foreground))',
                },
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

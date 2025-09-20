import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { AIProvider } from './contexts/AIContext';
import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Community from './pages/Community';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Wellness from './pages/Wellness';
import Mentorship from './pages/Mentorship';
import Auth from './pages/Auth';
import { Toaster } from './components/ui/Toaster';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import About from './pages/About';
import Terms from './pages/Terms';
import StudentRequests from './pages/StudentRequests';
import ResetPassword from './pages/ResetPassword';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<PublicLayout><Landing /></PublicLayout>} />
        <Route path="/auth" element={<PublicLayout><Auth /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/privacy-policy" element={<PublicLayout><PrivacyPolicy /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
        <Route path="/reset-password" element={<PublicLayout><ResetPassword /></PublicLayout>} />

        <Route path="/dashboard" element={<ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/roadmap/:id?" element={<ProtectedRoute><MainLayout><Roadmap /></MainLayout></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><MainLayout><Community /></MainLayout></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><MainLayout><Wallet /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/wellness" element={<ProtectedRoute><MainLayout><Wellness /></MainLayout></ProtectedRoute>} />
        <Route path="/mentorship" element={<ProtectedRoute><MainLayout><Mentorship /></MainLayout></ProtectedRoute>} />
        <Route path="/student-requests" element={<ProtectedRoute><MainLayout><StudentRequests /></MainLayout></ProtectedRoute>} />
      </Routes>
      <Toaster />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <AIProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AIProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;
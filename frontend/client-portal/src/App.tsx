import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientDashboard from './pages/ClientDashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import NewCasePage from './pages/NewCasePage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import PrivateRoute from './components/PrivateRoute';

// Role-based dashboard component
function RoleBasedDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case 'lawyer':
      return <LawyerDashboard />;
    case 'activist':
      return <DashboardPage />; // Can create ActivistDashboard later
    case 'client':
    default:
      return <ClientDashboard />;
  }
}

function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={
            <PrivateRoute>
              <RoleBasedDashboard />
            </PrivateRoute>
          } />
          <Route path="cases" element={
            <PrivateRoute>
              <CasesPage />
            </PrivateRoute>
          } />
          <Route path="cases/new" element={
            <PrivateRoute>
              <NewCasePage />
            </PrivateRoute>
          } />
          <Route path="cases/:id" element={
            <PrivateRoute>
              <CaseDetailPage />
            </PrivateRoute>
          } />
          <Route path="messages" element={
            <PrivateRoute>
              <MessagesPage />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';

// Public Shared Pages (Root of pages/)
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import FreelancerApply from './pages/workforce/FreelancerApply';
import NotFound from './pages/NotFound';

// FlexiStaff Admin Suite Pages (/pages/admin/*)
import DashboardLayout from './pages/admin/DashboardLayout';
import Dashboard from './pages/admin/Dashboard';
import CompanyManagement from './pages/admin/CompanyManagement';
import ClientManagement from './pages/admin/ClientManagement';
import PartnerManagement from './pages/admin/PartnerManagement';
import ManagerManagement from './pages/admin/ManagerManagement';
import WorkforceManagement from './pages/admin/WorkforceManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import ProjectDetails from './pages/admin/ProjectDetails';
import AdminAssignmentApprovals from './pages/admin/AdminAssignmentApprovals';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSupportTickets from './pages/admin/AdminSupportTickets';

// Enterprise Client Portal Pages (/client/*)
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProjectRequest from './pages/client/ClientProjectRequest';
import ClientProjects from './pages/client/ClientProjects';
import ClientProjectDetails from './pages/client/ClientProjectDetails';
import ClientWorkforce from './pages/client/ClientWorkforce';
import ClientProgress from './pages/client/ClientProgress';
import ClientMessages from './pages/client/ClientMessages';
import ClientNotifications from './pages/client/ClientNotifications';
import ClientProfile from './pages/client/ClientProfile';
import ClientSupport from './pages/client/ClientSupport';

// Partner Company Portal Pages (/partner/*)
import PartnerLayout from './pages/partner/PartnerLayout';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerProjects from './pages/partner/PartnerProjects';
import PartnerProjectDetails from './pages/partner/PartnerProjectDetails';
import PartnerProjectProgress from './pages/partner/PartnerProjectProgress';
import PartnerWorkforce from './pages/partner/PartnerWorkforce';
import PartnerAddWorkforce from './pages/partner/PartnerAddWorkforce';
import PartnerAvailability from './pages/partner/PartnerAvailability';
import PartnerWorkforceRequests from './pages/partner/PartnerWorkforceRequests';
import PartnerNotifications from './pages/partner/PartnerNotifications';
import PartnerProfile from './pages/partner/PartnerProfile';
import PartnerSupport from './pages/partner/PartnerSupport';

// Manager Portal Pages (/manager/*)
import ManagerLayout from './pages/manager/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerApprovedProjects from './pages/manager/ManagerApprovedProjects';
import ManagerProjectDetails from './pages/manager/ManagerProjectDetails';
import ManagerProjectProgress from './pages/manager/ManagerProjectProgress';
import ManagerWorkforce from './pages/manager/ManagerWorkforce';
import ManagerMatching from './pages/manager/ManagerMatching';
import ManagerAssignments from './pages/manager/ManagerAssignments';
import ManagerNotifications from './pages/manager/ManagerNotifications';
import ManagerProfile from './pages/manager/ManagerProfile';
import ManagerSupport from './pages/manager/ManagerSupport';

// Workforce Portal Pages (/workforce/*)
import WorkforceLayout from './pages/workforce/WorkforceLayout';
import WorkforceDashboard from './pages/workforce/WorkforceDashboard';
import WorkforceAssignments from './pages/workforce/WorkforceAssignments';
import WorkforceAvailability from './pages/workforce/WorkforceAvailability';
import WorkforceProfile from './pages/workforce/WorkforceProfile';
import WorkforceSupport from './pages/workforce/WorkforceSupport';

// Authentication & Protected Routes
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

// Smart Role-Based Dashboard Redirect
const DashboardRedirect = () => {
  const { user, role, isAuthenticated } = useAuth() || {};
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = (role || user?.role || '').toLowerCase();
  const uInfo = ((user?.name || '') + ' ' + (user?.companyName || '') + ' ' + (user?.email || '')).toLowerCase();

  if (currentRole.includes('partner') || uInfo.includes('infosys')) return <Navigate to="/partner/dashboard" replace />;
  if (currentRole.includes('manager')) return <Navigate to="/manager/dashboard" replace />;
  if (currentRole.includes('workforce') || currentRole.includes('freelancer') || currentRole.includes('professional')) {
    return <Navigate to="/workforce/dashboard" replace />;
  }
  if (currentRole.includes('client')) return <Navigate to="/client/dashboard" replace />;

  // Admin Role Smart Redirects
  const path = location.pathname;
  if (path === '/company') return <Navigate to="/admin/company" replace />;
  if (path === '/clients') return <Navigate to="/admin/clients" replace />;
  if (path === '/partners') return <Navigate to="/admin/partners" replace />;
  if (path === '/managers') return <Navigate to="/admin/managers" replace />;
  if (path === '/workforce') return <Navigate to="/admin/workforce" replace />;
  if (path === '/projects') return <Navigate to="/admin/projects" replace />;

  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <DataProvider>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Single Unified Multi-Role Login & Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/freelancer/apply" element={<FreelancerApply />} />
            <Route path="/forgot-password" element={<Login />} />

            {/* Smart /dashboard Router & Legacy Route Handlers */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/company" element={<DashboardRedirect />} />
            <Route path="/clients" element={<DashboardRedirect />} />
            <Route path="/partners" element={<DashboardRedirect />} />
            <Route path="/managers" element={<DashboardRedirect />} />
            <Route path="/workforce" element={<DashboardRedirect />} />
            <Route path="/projects" element={<DashboardRedirect />} />

            {/* ========================================================================= */}
            {/* DEDICATED ADMIN PORTAL SUITE (/admin/*) */}
            {/* ========================================================================= */}
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />

            <Route
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/company" element={<CompanyManagement />} />
              <Route path="/admin/clients" element={<ClientManagement />} />
              <Route path="/admin/partners" element={<PartnerManagement />} />
              <Route path="/admin/managers" element={<ManagerManagement />} />
              <Route path="/admin/workforce" element={<WorkforceManagement />} />
              <Route path="/admin/projects" element={<ProjectManagement />} />
              <Route path="/admin/projects/:id" element={<ProjectDetails />} />
              <Route path="/admin/assignment-approvals" element={<AdminAssignmentApprovals />} />
              <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
              <Route path="/admin/profile" element={<Navigate to="/admin/company" replace />} />
            </Route>

            {/* ========================================================================= */}
            {/* DEDICATED CLIENT PORTAL SUITE (/client/*) */}
            {/* ========================================================================= */}
            <Route path="/client/login" element={<Navigate to="/login" replace />} />
            <Route path="/client/register" element={<Navigate to="/register" replace />} />
            <Route path="/client" element={<Navigate to="/client/dashboard" replace />} />

            <Route
              element={
                <ProtectedRoute allowedRoles={['Client']}>
                  <ClientLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/submit-request" element={<ClientProjectRequest />} />
              <Route path="/client/request" element={<ClientProjectRequest />} />
              <Route path="/client/project-request" element={<ClientProjectRequest />} />
              <Route path="/client/new-project" element={<ClientProjectRequest />} />
              <Route path="/client/projects" element={<ClientProjects />} />
              <Route path="/client/projects/:projectId" element={<ClientProjectDetails />} />
              <Route path="/client/workforce" element={<ClientWorkforce />} />
              <Route path="/client/progress" element={<ClientProgress />} />
              <Route path="/client/messages" element={<ClientMessages />} />
              <Route path="/client/notifications" element={<ClientNotifications />} />
              <Route path="/client/profile" element={<ClientProfile />} />
              <Route path="/client/support" element={<ClientSupport />} />
            </Route>

            {/* ========================================================================= */}
            {/* DEDICATED PARTNER COMPANY PORTAL SUITE (/partner/*) */}
            {/* ========================================================================= */}
            <Route path="/partner/login" element={<Navigate to="/login" replace />} />
            <Route path="/partner" element={<Navigate to="/partner/dashboard" replace />} />

            <Route
              element={
                <ProtectedRoute allowedRoles={['Partner Company']}>
                  <PartnerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/partner/dashboard" element={<PartnerDashboard />} />
              <Route path="/partner/projects" element={<PartnerProjects />} />
              <Route path="/partner/projects/:id" element={<PartnerProjectDetails />} />
              <Route path="/partner/workforce" element={<PartnerWorkforce />} />
              <Route path="/partner/roster" element={<PartnerWorkforce />} />
              <Route path="/partner/workforce/register" element={<PartnerAddWorkforce />} />
              <Route path="/partner/workforce/new" element={<PartnerAddWorkforce />} />
              <Route path="/partner/add-workforce" element={<PartnerAddWorkforce />} />
              <Route path="/partner/workforce/:id" element={<PartnerWorkforce />} />
              <Route path="/partner/availability" element={<PartnerAvailability />} />
              <Route path="/partner/workforce-requests" element={<PartnerWorkforceRequests />} />
              <Route path="/partner/project-progress" element={<PartnerProjectProgress />} />
              <Route path="/partner/notifications" element={<PartnerNotifications />} />
              <Route path="/partner/profile" element={<PartnerProfile />} />
              <Route path="/partner/support" element={<PartnerSupport />} />
            </Route>

            {/* ========================================================================= */}
            {/* DEDICATED MANAGER PORTAL SUITE (/manager/*) */}
            {/* ========================================================================= */}
            <Route path="/manager/login" element={<Navigate to="/login" replace />} />
            <Route path="/manager" element={<Navigate to="/manager/dashboard" replace />} />

            <Route
              element={
                <ProtectedRoute allowedRoles={['Manager']}>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/projects" element={<ManagerApprovedProjects />} />
              <Route path="/manager/approved-projects" element={<ManagerApprovedProjects />} />
              <Route path="/manager/projects/:id" element={<ManagerProjectDetails />} />
              <Route path="/manager/workforce" element={<ManagerWorkforce />} />
              <Route path="/manager/workforce-pool" element={<ManagerWorkforce />} />
              <Route path="/manager/matching" element={<ManagerMatching />} />
              <Route path="/manager/matching/:projectId" element={<ManagerMatching />} />
              <Route path="/manager/assignments" element={<ManagerAssignments />} />
              <Route path="/manager/project-progress" element={<ManagerProjectProgress />} />
              <Route path="/manager/notifications" element={<ManagerNotifications />} />
              <Route path="/manager/profile" element={<ManagerProfile />} />
              <Route path="/manager/support" element={<ManagerSupport />} />
            </Route>

            {/* ========================================================================= */}
            {/* DEDICATED WORKFORCE (PROFESSIONAL / FREELANCER) PORTAL SUITE (/workforce/*) */}
            {/* ========================================================================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['Workforce']}>
                  <WorkforceLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/workforce/dashboard" element={<WorkforceDashboard />} />
              <Route path="/workforce/assignments" element={<WorkforceAssignments />} />
              <Route path="/workforce/availability" element={<WorkforceAvailability />} />
              <Route path="/workforce/profile" element={<WorkforceProfile />} />
              <Route path="/workforce/support" element={<WorkforceSupport />} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Global Toast Notifications */}
          <ToastContainer
            position="bottom-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { VolunteerProvider } from './contexts/VolunteerContext';
import { Toaster } from 'sonner';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { EmployeeLayout } from './components/layout/EmployeeLayout';
import { CompanyLayout } from './components/layout/CompanyLayout';

import { NgoLayout } from './components/layout/NgoLayout';
import { NgoDashboard } from './pages/NgoDashboard';
import { NgoTeam } from './pages/NgoTeam';
import { NgoSettings } from './pages/NgoSettings';
import { NgoProjects } from './pages/NgoProjects';
import { NgoGrants } from './pages/NgoGrants';
import { LandingPage } from './pages/LandingPage';
import { CompanyPortalLogin } from './pages/CompanyPortalLogin';
import { Dashboard } from './pages/Dashboard';
import { Charities } from './pages/Charities';
import { CharityOnboarding } from './pages/CharityOnboarding';
import { Companies } from './pages/Companies';
import { PlatformSettings } from './pages/PlatformSettings';
import { PlatformSupport } from './pages/PlatformSupport';
import { ComplianceAuditLog } from './pages/ComplianceAuditLog';

import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { DiscoverProjects } from './pages/DiscoverProjects';
import { Challenges } from './pages/Challenges';
import { MyImpact } from './pages/MyImpact';
import { EmployeeSettings } from './pages/EmployeeSettings';

import { CompanyDashboard } from './pages/CompanyDashboard';
import { CompanyEngagement } from './pages/CompanyEngagement';
import { CompanyCampaigns } from './pages/CompanyCampaigns';

import { CompanyImpactReports } from './pages/CompanyImpactReports';
import { CompanySettings } from './pages/CompanySettings';
import { PaymentAudit } from './pages/PaymentAudit';
import { CompanyOnboarding } from './pages/CompanyOnboarding';
import { CompanySkillVerification } from './pages/CompanySkillVerification';

import { EmployeeERGs } from './pages/EmployeeERGs';
import { CompanyEmployees } from './pages/CompanyEmployees';
import { CompanyGrants } from './pages/CompanyGrants';
import { CompanyERGs } from './pages/CompanyERGs';
import { CompanyGivingBudgets } from './pages/CompanyGivingBudgets';
import { CompanyCommitments } from './pages/CompanyCommitments';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ProjectReminders } from './components/ProjectReminders';
import { PaymentNotifications } from './components/PaymentNotifications';


export default function App() {
  return (
    <AuthProvider>
      <VolunteerProvider>
        <Toaster position="top-center" richColors expand={true} />
        <ProjectReminders />
        <PaymentNotifications />
        <BrowserRouter>
          <Routes>
        {/* Landing/Role Selection */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/portal/:companyId" element={<CompanyPortalLogin />} />

        {/* Platform Admin Portal */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['platform_admin', 'platform_staff']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="charities" element={<Charities />} />
          
          <Route path="companies" element={<Companies />} />
          <Route path="support" element={<PlatformSupport />} />
          <Route path="settings" element={<PlatformSettings />} />
          <Route path="payments" element={<PaymentAudit />} />
          <Route path="compliance" element={<ComplianceAuditLog />} />
        </Route>

        
        {/* NGO Portal */}
        <Route path="/ngo" element={<ProtectedRoute allowedRoles={['ngo_admin', 'ngo_employee']}><NgoLayout /></ProtectedRoute>}>
          <Route index element={<NgoDashboard />} />
          <Route path="projects" element={<NgoProjects />} />
          <Route path="grants" element={<NgoGrants />} />
          <Route path="team" element={<NgoTeam />} />
          <Route path="settings" element={<NgoSettings />} />
        </Route>
        {/* Employee Portal */}
        <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee', 'company_admin', 'platform_admin']}><EmployeeLayout /></ProtectedRoute>}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="projects" element={<DiscoverProjects />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="ergs" element={<EmployeeERGs />} />
          <Route path="impact" element={<MyImpact />} />
          <Route path="settings" element={<EmployeeSettings />} />
        </Route>

        {/* Charity Onboarding */}
        <Route path="/onboarding/charity" element={<ProtectedRoute><CharityOnboarding /></ProtectedRoute>} />
        {/* Company Onboarding */}
        <Route path="/onboarding/company" element={<ProtectedRoute><CompanyOnboarding /></ProtectedRoute>} />

        {/* Company Admin Portal */}
        <Route path="/company" element={<ProtectedRoute allowedRoles={['company_admin', 'platform_admin']}><CompanyLayout /></ProtectedRoute>}>
          <Route index element={<CompanyDashboard />} />
          <Route path="projects" element={<DiscoverProjects />} />
          <Route path="engagement" element={<CompanyEngagement />} />
          <Route path="skills" element={<CompanySkillVerification />} />
          <Route path="ergs" element={<CompanyERGs />} />
          <Route path="campaigns" element={<CompanyCampaigns />} />
          <Route path="grants" element={<CompanyGrants />} />
          <Route path="budgets" element={<CompanyGivingBudgets />} />
          <Route path="commitments" element={<CompanyCommitments />} />
          <Route path="reports" element={<CompanyImpactReports />} />
          <Route path="employees" element={<CompanyEmployees />} />
          <Route path="settings" element={<CompanySettings />} />
          <Route path="payments" element={<PaymentAudit />} />
          <Route path="compliance" element={<ComplianceAuditLog />} />
        </Route>
      </Routes>
        </BrowserRouter>
      </VolunteerProvider>
    </AuthProvider>
  );
}

/**
 * You Want Services - Central App Router & View Dispatcher
 * Phase 3 Architecture
 */

import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { canAccessRoute } from '../../types/navigation';
import { PublicHeader } from '../layout/PublicHeader';
import { PublicFooter } from '../layout/PublicFooter';
import { DashboardLayout } from '../layout/DashboardLayout';
import { UnauthorizedState } from '../common/StateViews';

// Public Views
import { HomeView } from '../../views/public/HomeView';
import { ServicesView } from '../../views/public/ServicesView';
import { HowItWorksView } from '../../views/public/HowItWorksView';
import { AboutView } from '../../views/public/AboutView';
import { ContactView } from '../../views/public/ContactView';
import { LoginView } from '../../views/public/LoginView';
import { RegisterView } from '../../views/public/RegisterView';
import { ForgotPasswordView } from '../../views/public/ForgotPasswordView';
import { ResetPasswordView } from '../../views/public/ResetPasswordView';
import { TermsView } from '../../views/public/TermsView';
import { PrivacyView } from '../../views/public/PrivacyView';
import { ContractorLandingView } from '../../views/public/ContractorLandingView';

// Contractor Onboarding & Registration (Phase 5)
import { ContractorRegistrationView } from '../../views/contractor/ContractorRegistrationView';

// Customer Views
import { CustomerDashboardView } from '../../views/customer/CustomerDashboardView';
import { RequestServiceView } from '../../views/customer/RequestServiceView';
import { MyRequestsView } from '../../views/customer/MyRequestsView';
import { CustomerRequestDetailView } from '../../views/customer/CustomerRequestDetailView';
import { CustomerMessagesView } from '../../views/customer/CustomerMessagesView';
import { CustomerProfileView } from '../../views/customer/CustomerProfileView';
import { CustomerSettingsView } from '../../views/customer/CustomerSettingsView';
import { CustomerOnboardingView } from '../../views/customer/CustomerOnboardingView';

// Contractor Views
import { ContractorDashboardView } from '../../views/contractor/ContractorDashboardView';
import { ContractorLeadsView } from '../../views/contractor/ContractorLeadsView';
import { ContractorLeadDetailView } from '../../views/contractor/ContractorLeadDetailView';
import { ContractorLeadHistoryView } from '../../views/contractor/ContractorLeadHistoryView';
import { ContractorNotificationsView } from '../../views/contractor/ContractorNotificationsView';
import { ContractorJobsView } from '../../views/contractor/ContractorJobsView';
import { ContractorProfileView } from '../../views/contractor/ContractorProfileView';
import { ContractorSettingsView } from '../../views/contractor/ContractorSettingsView';

// Admin Views
import { AdminDashboardView } from '../../views/admin/AdminDashboardView';
import { AdminCustomersView } from '../../views/admin/AdminCustomersView';
import { AdminContractorsView } from '../../views/admin/AdminContractorsView';
import { AdminContractorReviewView } from '../../views/admin/AdminContractorReviewView';
import { AdminServiceRequestsView } from '../../views/admin/AdminServiceRequestsView';
import { AdminCategoriesView } from '../../views/admin/AdminCategoriesView';
import { AdminLeadsView } from '../../views/admin/AdminLeadsView';
import { AdminJobsView } from '../../views/admin/AdminJobsView';
import { AdminMembershipsView } from '../../views/admin/AdminMembershipsView';
import { AdminPaymentsView } from '../../views/admin/AdminPaymentsView';
import { AdminRefundsView } from '../../views/admin/AdminRefundsView';
import { AdminPricingView } from '../../views/admin/AdminPricingView';
import { AdminReportsView } from '../../views/admin/AdminReportsView';
import { AdminNotificationsView } from '../../views/admin/AdminNotificationsView';
import { AdminAuditLogsView } from '../../views/admin/AdminAuditLogsView';
import { AdminSettingsView } from '../../views/admin/AdminSettingsView';

export const AppRouter: React.FC = () => {
  const { currentRoute } = useNavigation();
  const { currentUser } = useAuth();

  // Route authorization check
  const isAuthorized = canAccessRoute(currentRoute, currentUser?.role);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <PublicHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <UnauthorizedState />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Render Public Views
  const renderPublic = (content: React.ReactNode) => (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1">{content}</main>
      <PublicFooter />
    </div>
  );

  switch (currentRoute) {
    // Public Routes
    case 'home':
      return renderPublic(<HomeView />);
    case 'services':
      return renderPublic(<ServicesView />);
    case 'how-it-works':
      return renderPublic(<HowItWorksView />);
    case 'about':
      return renderPublic(<AboutView />);
    case 'contact':
      return renderPublic(<ContactView />);
    case 'terms':
      return renderPublic(<TermsView />);
    case 'privacy':
      return renderPublic(<PrivacyView />);
    case 'become-a-contractor':
    case 'contractor-landing' as any:
      return renderPublic(<ContractorLandingView />);
    case 'contractor-registration':
      return renderPublic(<ContractorRegistrationView />);
    case 'login':
      return <LoginView />;
    case 'register':
      return <RegisterView />;
    case 'forgot-password':
      return <ForgotPasswordView />;
    case 'reset-password':
      return <ResetPasswordView />;

    // Customer Onboarding Flow
    case 'customer-onboarding':
      return <CustomerOnboardingView />;

    // Customer Portal
    case 'customer-dashboard':
      return (
        <DashboardLayout role="CUSTOMER">
          <CustomerDashboardView />
        </DashboardLayout>
      );
    case 'customer-request-service':
      if (!currentUser) {
        return renderPublic(<RequestServiceView />);
      }
      return (
        <DashboardLayout role="CUSTOMER">
          <RequestServiceView />
        </DashboardLayout>
      );
    case 'customer-my-requests':
      return (
        <DashboardLayout role="CUSTOMER">
          <MyRequestsView />
        </DashboardLayout>
      );
    case 'customer-request-detail':
      return (
        <DashboardLayout role="CUSTOMER">
          <CustomerRequestDetailView />
        </DashboardLayout>
      );
    case 'customer-messages':
      return (
        <DashboardLayout role="CUSTOMER">
          <CustomerMessagesView />
        </DashboardLayout>
      );
    case 'customer-profile':
      return (
        <DashboardLayout role="CUSTOMER">
          <CustomerProfileView />
        </DashboardLayout>
      );
    case 'customer-settings':
      return (
        <DashboardLayout role="CUSTOMER">
          <CustomerSettingsView />
        </DashboardLayout>
      );

    // Contractor Portal
    case 'contractor-dashboard':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorDashboardView />
        </DashboardLayout>
      );
    case 'contractor-leads':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorLeadsView />
        </DashboardLayout>
      );
    case 'contractor-lead-detail':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorLeadDetailView />
        </DashboardLayout>
      );
    case 'contractor-lead-history':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorLeadHistoryView />
        </DashboardLayout>
      );
    case 'contractor-notifications':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorNotificationsView />
        </DashboardLayout>
      );
    case 'contractor-jobs':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorJobsView />
        </DashboardLayout>
      );
    case 'contractor-messages':
      return (
        <DashboardLayout role="CONTRACTOR">
          <CustomerMessagesView />
        </DashboardLayout>
      );
    case 'contractor-profile':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorProfileView />
        </DashboardLayout>
      );
    case 'contractor-settings':
      return (
        <DashboardLayout role="CONTRACTOR">
          <ContractorSettingsView />
        </DashboardLayout>
      );

    // Admin Portal
    case 'admin-dashboard':
      return (
        <DashboardLayout role="ADMIN">
          <AdminDashboardView />
        </DashboardLayout>
      );
    case 'admin-customers':
      return (
        <DashboardLayout role="ADMIN">
          <AdminCustomersView />
        </DashboardLayout>
      );
    case 'admin-contractors':
      return (
        <DashboardLayout role="ADMIN">
          <AdminContractorsView />
        </DashboardLayout>
      );
    case 'admin-contractor-review':
      return (
        <DashboardLayout role="ADMIN">
          <AdminContractorReviewView />
        </DashboardLayout>
      );
    case 'admin-service-requests':
      return (
        <DashboardLayout role="ADMIN">
          <AdminServiceRequestsView />
        </DashboardLayout>
      );
    case 'admin-categories':
      return (
        <DashboardLayout role="ADMIN">
          <AdminCategoriesView />
        </DashboardLayout>
      );
    case 'admin-leads':
      return (
        <DashboardLayout role="ADMIN">
          <AdminLeadsView />
        </DashboardLayout>
      );
    case 'admin-jobs':
      return (
        <DashboardLayout role="ADMIN">
          <AdminJobsView />
        </DashboardLayout>
      );
    case 'admin-memberships':
      return (
        <DashboardLayout role="ADMIN">
          <AdminMembershipsView />
        </DashboardLayout>
      );
    case 'admin-payments':
      return (
        <DashboardLayout role="ADMIN">
          <AdminPaymentsView />
        </DashboardLayout>
      );
    case 'admin-refunds':
      return (
        <DashboardLayout role="ADMIN">
          <AdminRefundsView />
        </DashboardLayout>
      );
    case 'admin-pricing':
      return (
        <DashboardLayout role="ADMIN">
          <AdminPricingView />
        </DashboardLayout>
      );
    case 'admin-reports':
      return (
        <DashboardLayout role="ADMIN">
          <AdminReportsView />
        </DashboardLayout>
      );
    case 'admin-notifications':
      return (
        <DashboardLayout role="ADMIN">
          <AdminNotificationsView />
        </DashboardLayout>
      );
    case 'admin-audit-logs':
      return (
        <DashboardLayout role="ADMIN">
          <AdminAuditLogsView />
        </DashboardLayout>
      );
    case 'admin-settings':
      return (
        <DashboardLayout role="ADMIN">
          <AdminSettingsView />
        </DashboardLayout>
      );

    default:
      return renderPublic(<HomeView />);
  }
};

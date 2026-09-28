// src/features/admin/pages/AdminDashboard.tsx
import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import type { AdminTab } from '../components/AdminSidebar';
import {
  OverviewTab,
  FeedsTab,
  JobsTab,
  UsersTab,
  ProfessionalsTab,
  ModerationTab,
  ReportsTab,
  TiersTab,
  PaymentsTab,
  AuditLogsTab,
  AdministratorsTab,
  ContactMessagesTab,
} from '../components/tabs';

const tabMeta: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: "Here's what's happening on the platform",
  },
  feeds: { title: 'Feeds', subtitle: 'Moderate community content' },
  jobs: { title: 'Jobs', subtitle: 'All jobs posted on the platform' },
  users: { title: 'Users', subtitle: 'Manage registered clients' },
  professionals: {
    title: 'Professionals',
    subtitle: 'Manage service providers',
  },
  moderation: {
    title: 'Moderation',
    subtitle: 'Review AI-flagged content awaiting decision',
  },
  reports: {
    title: 'Reports',
    subtitle: 'User-submitted abuse & safety reports',
  },
  tiers: {
    title: 'Subscription tiers',
    subtitle: 'Define pricing tiers and unlockable features',
  },
  payments: {
    title: 'Professional payments',
    subtitle: 'Monitor subscription charges and issue refunds',
  },
  audit_logs: {
    title: 'Audit Logs',
    subtitle: 'Administrator activity history',
  },
  administrators: {
    title: 'Administrators',
    subtitle: 'Manage admin team members',
  },
  contact_messages: {
    title: 'Contact Messages',
    subtitle: 'View and respond to messages from users',
  },
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'feeds':
        return <FeedsTab />;
      case 'jobs':
        return <JobsTab />;
      case 'users':
        return <UsersTab />;
      case 'professionals':
        return <ProfessionalsTab />;
      case 'moderation':
        return <ModerationTab />;
      case 'reports':
        return <ReportsTab />;
      case 'tiers':
        return <TiersTab />;
      case 'payments':
        return <PaymentsTab />;
      case 'audit_logs':
        return <AuditLogsTab />;
      case 'administrators':
        return <AdministratorsTab />;
      case 'contact_messages':
        return <ContactMessagesTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={tabMeta[activeTab].title}
      subtitle={tabMeta[activeTab].subtitle}
    >
      {renderTab()}
    </AdminLayout>
  );
};

export default AdminDashboard;
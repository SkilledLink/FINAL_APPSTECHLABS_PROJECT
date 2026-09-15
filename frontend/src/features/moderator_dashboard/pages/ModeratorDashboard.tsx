import React, { useState } from 'react';
import ModeratorLayout from '../components/ModeratorLayout';
import type { ModeratorTab } from '../components/ModeratorSidebar';
import {
  OverviewTab,
  FeedsTab,
  JobsTab,
  UsersTab,
  ProfessionalsTab,
  ModerationTab,
  AuditLogsTab,
  TeamTab,
} from '../components/tabs';

const tabMeta: Record<ModeratorTab, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Your moderation activity at a glance' },
  moderation: { title: 'Moderation', subtitle: 'Review reports and take action' },
  feeds: { title: 'Feeds', subtitle: 'Moderate community content' },
  users: { title: 'Users', subtitle: 'Review user accounts' },
  professionals: { title: 'Professionals', subtitle: 'Review provider accounts' },
  jobs: { title: 'Jobs', subtitle: 'Monitor platform jobs' },
  audit_logs: { title: 'My Activity', subtitle: 'Your moderation history' },
  team: { title: 'Team', subtitle: 'Your fellow moderators' },
};

const ModeratorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModeratorTab>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab />;
      case 'moderation': return <ModerationTab />;
      case 'feeds': return <FeedsTab />;
      case 'users': return <UsersTab />;
      case 'professionals': return <ProfessionalsTab />;
      case 'jobs': return <JobsTab />;
      case 'audit_logs': return <AuditLogsTab />;
      case 'team': return <TeamTab />;
      default: return <OverviewTab />;
    }
  };

  return (
    <ModeratorLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={tabMeta[activeTab].title}
      subtitle={tabMeta[activeTab].subtitle}
    >
      {renderTab()}
    </ModeratorLayout>
  );
};

export default ModeratorDashboard;
import React, { useState } from 'react';
import ModeratorLayout from '../components/ModeratorLayout';
import type { ModeratorTab } from '../components/ModeratorSidebar';
import {
  OverviewTab,
  ModerationTab,
  FeedsTab,
  UsersTab,
  ProfessionalsTab,
  JobsTab,
  MyActivityTab,
} from '../components/tabs';

const tabMeta: Record<ModeratorTab, { title: string; subtitle: string }> = {
  overview: { title: 'Overview', subtitle: 'Platform-wide metrics' },
  moderation: { title: 'Moderation', subtitle: 'Review AI-flagged content' },
  feeds: { title: 'Feeds', subtitle: 'Moderate community content' },
  users: { title: 'Users', subtitle: 'Review user accounts' },
  professionals: { title: 'Professionals', subtitle: 'Review provider accounts' },
  jobs: { title: 'Jobs', subtitle: 'Monitor platform jobs' },
  audit_logs: { title: 'My Activity', subtitle: 'Your moderation history' },
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
      case 'audit_logs': return <MyActivityTab />;
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
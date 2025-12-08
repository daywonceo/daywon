import React from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';

const Analytics: React.FC = () => {
  return (
    <PageLayout>
      <PageHeader 
        title="Analytics" 
        subtitle="Track your habit performance and trends"
      />
      <AnalyticsDashboard />
    </PageLayout>
  );
};

export default Analytics;
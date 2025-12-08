import React from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import Header from '@/components/Header';

const Analytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AnalyticsDashboard />
    </div>
  );
};

export default Analytics;
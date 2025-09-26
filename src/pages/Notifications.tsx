import React from 'react';
import { NotificationCenter } from '@/components/NotificationCenter';
import Header from '@/components/Header';

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NotificationCenter />
    </div>
  );
};

export default Notifications;
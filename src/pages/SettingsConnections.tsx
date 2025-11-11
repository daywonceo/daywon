import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ConnectionsSettings } from '@/components/settings/ConnectionsSettings';

const SettingsConnections: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <main className="pt-16 pb-safe-mobile">
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <ConnectionsSettings />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SettingsConnections;

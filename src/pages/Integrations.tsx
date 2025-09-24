import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IntegrationsPage } from '@/components/integrations/IntegrationsPage';

const Integrations: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Header />
      <main className="pt-16 pb-20">
        <IntegrationsPage />
      </main>
      <Footer />
    </div>
  );
};

export default Integrations;
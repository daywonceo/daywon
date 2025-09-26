import React from 'react';
import { HelpCenter } from '@/components/HelpCenter';
import Header from '@/components/Header';

const Help: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HelpCenter />
    </div>
  );
};

export default Help;
import React from 'react';
import { DataExportCenter } from '@/components/DataExportCenter';
import Header from '@/components/Header';

const DataExport: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DataExportCenter />
    </div>
  );
};

export default DataExport;
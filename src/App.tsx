/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { DashboardModule } from './components/modules/DashboardModule';
import { EquipmentModule } from './components/modules/EquipmentModule';
import { TransactionsModule } from './components/modules/TransactionsModule';
import { AuditModule } from './components/modules/AuditModule';
import { ConditionModule } from './components/modules/ConditionModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { AccountsModule } from './components/modules/AccountsModule';
import { BackupModule } from './components/modules/BackupModule';

const AppContent: React.FC = () => {
  const { currentModule } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f8] text-[#1e293b] select-none font-serif">
      {/* Top Banner Navigation Header */}
      <Header />

      {/* Center Layout with Sidebar & Active Module */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] flex flex-col justify-between">
          <div className="flex-1">
            {currentModule === 'dashboard' && <DashboardModule />}
            {currentModule === 'equipment' && <EquipmentModule />}
            {currentModule === 'transactions' && <TransactionsModule />}
            {currentModule === 'audit' && <AuditModule />}
            {currentModule === 'condition' && <ConditionModule />}
            {currentModule === 'reports' && <ReportsModule />}
            {currentModule === 'accounts' && <AccountsModule />}
            {currentModule === 'backup' && <BackupModule />}
          </div>

          {/* Footer Bar */}
          <Footer />
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

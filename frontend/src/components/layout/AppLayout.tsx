import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CopilotFloatingChat } from '@/components/copilot/CopilotFloatingChat';
import { Toaster } from 'sonner';

export const AppLayout: React.FC = () => {
  const [copilotOpen, setCopilotOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans antialiased">
      {/* Permanent Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          copilotOpen={copilotOpen}
          onToggleCopilot={() => setCopilotOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating Copilot AI Assistant */}
      <CopilotFloatingChat
        open={copilotOpen}
        onOpenChange={setCopilotOpen}
      />

      {/* Global Toast Alerts */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

import React from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { TooltipProvider } from '../ui/Tooltip';

export const MainLayout: React.FC = () => {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 bg-[#F1F1F1] p-8">
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  );
}; 
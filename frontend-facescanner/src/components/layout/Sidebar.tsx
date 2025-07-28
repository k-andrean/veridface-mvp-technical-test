import React from 'react';
import { NavItem } from '../ui/NavItem';
import { Home, Users } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-56 bg-[#2D6886] text-white flex flex-col py-8 px-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-8 text-center text-blue-300">VerIDFace</h2>
      <nav className="flex flex-col gap-4">
        <NavItem to="/dashboard" label="Dashboard">
          <Home className="w-6 h-6" />
        </NavItem>
        <NavItem to="/users" label="Users List">
          <Users className="w-6 h-6" />
        </NavItem>
      </nav>
    </aside>
  );
}; 
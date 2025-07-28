'use client';

import clsx from 'clsx';
import { Link, useLocation } from 'react-router-dom';

export function NavItem({
  to,
  label,
  children
}: {
  to: string;
  label: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={clsx(
        'flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors',
        'hover:bg-white/10 hover:text-white',
        isActive
          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
          : 'text-purple-100'
      )}
    >
      <span className="w-6 h-6 flex items-center justify-center">
        {children}
      </span>
      <span className={clsx('text-sm text-gray-300', isActive && 'text-white font-semibold')}>{label}</span>
    </Link>
  );
}

'use client';

import Navbar from '@/components/Navbar';
import RequireAuth from '@/components/RequireAuth';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }) {
  return (
    <RequireAuth>
      <Navbar />
      <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-6 pt-6 px-4 h-[calc(100vh-4rem)] overflow-hidden">
        <Sidebar />
        <div className="col-span-12 lg:col-span-9 order-first lg:order-none overflow-y-auto pb-12 pr-1 scrollbar-hide">
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}

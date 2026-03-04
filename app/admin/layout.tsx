'use client';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { Toaster } from "sonner";   // 👈 thêm

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Topbar />

      <div className="flex flex-1 min-h-0">
        <aside className="w-72 bg-white border-r overflow-y-auto">
          <Sidebar />
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* 👇 Toast góc dưới phải */}
      <Toaster position="bottom-right" richColors />
    </div>
  );
}

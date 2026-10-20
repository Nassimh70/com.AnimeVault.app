import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen text-text-primary relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom,rgba(245,158,11,0.08),transparent_22%)]" />
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        <Header />
        <main className="flex-1 relative">{children}</main>
      </div>
    </div>
  );
}

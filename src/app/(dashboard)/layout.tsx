import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

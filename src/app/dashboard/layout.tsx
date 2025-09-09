
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { BookingProvider } from '@/contexts/BookingContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <CurrencyProvider>
      <BookingProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <DashboardSidebar userRole={user?.role} />
              <main className="flex-1 overflow-auto p-4 sm:p-6">
                <div className="container mx-auto max-w-7xl">
                {children}
                </div>    
               <Toaster />
            </main>
          </div>
        </SidebarProvider>
      </BookingProvider>
    </CurrencyProvider>
  );

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;

}

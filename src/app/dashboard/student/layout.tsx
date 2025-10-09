// <<<<<<< admin2
// export default function StudentDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return <>{children}</>;
// }
// =======
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to student dashboard if user is not a student
    if (!isLoading && isAuthenticated && user?.role !== 'STUDENT') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user?.role, router]);

  if (isLoading) {
    return null; // Let parent layout handle loading
  }

  if (!isAuthenticated) {
    return null; // Let parent layout handle authentication
  }

  // Only handle role-specific logic, don't duplicate sidebar/layout
  if (user?.role !== 'STUDENT') {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}


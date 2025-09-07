export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-1 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {children}
    </div>
  );
}

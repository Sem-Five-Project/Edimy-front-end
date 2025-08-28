import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/layout/Sidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar userRole="admin" />
      <main className="w-full">
        <SidebarTrigger />
        <div className="p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
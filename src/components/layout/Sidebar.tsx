"use client";




import { NAV_DATA } from '@/components/Layouts/sidebar/data/index';


import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from "next/navigation";
import { 
  Home, 
  User, 
  Search, 
  BookOpen, 
  Users, 
  FileText, 
  BarChart3, 
  Menu, 
  X, 
  ChevronRight, 
  LogOut, 
  Settings,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface DashboardSidebarProps {
  userRole?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userRole = 'STUDENT' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const getHomePath = () => {
    switch (userRole) {
      case 'STUDENT': return '/dashboard/student';
      case 'TUTOR': return '/dashboard/tutor';
      case 'ADMIN': return '/dashboard/admin';
      default: return '/dashboard';
    }
  };

  const getNavItems = () => {
    const baseItems = [{ 
      id: 'home', 
      label: 'Home', 
      icon: Home, 
      path: getHomePath() 
    }];

    if (userRole === 'STUDENT') {
      return [
        ...baseItems,
        { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/student/profile' },
        { id: 'find-tutor', label: 'Find Tutor', icon: Search, path: '/dashboard/student/find-tutor' },
      ];
    }

    if (userRole === 'TUTOR') {
      return [
        ...baseItems,
        { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/tutor/profile' },
        { id: 'view-classes', label: 'My Classes', icon: BookOpen, path: '/dashboard/tutor/view-classes' },
        { id: 'students', label: 'Students', icon: Users, path: '/dashboard/tutor/students' }
      ];
    }

    if (userRole === 'ADMIN') {
      return [
        ...baseItems,
        { id: 'users', label: 'User Management', icon: Users, path: '/dashboard/admin/users' },
        { id: 'tutor-applications', label: 'Tutor Applications', icon: FileText, path: '/dashboard/admin/tutor-applications' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/admin/analytics' }
      ];
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const NavItem = ({ item }: { item: any }) => {
    // Fix: Exact match for home, prefix match for others
    const isActive = item.id === 'home' 
      ? pathname === item.path 
      : pathname.startsWith(item.path);
    
    return (
      <li>
        <button
          onClick={() => router.push(item.path)}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 group relative overflow-hidden",
            isActive
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          )}
        >
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-0 bottom-0 w-1 " />
          )}
          
          <item.icon 
            className={cn(
              "w-5 h-5 transition-transform duration-300 flex-shrink-0",
              isActive ? "scale-110" : "group-hover:scale-105"
            )} 
          />
          
          {!isCollapsed && (
            <>
              <span className="font-medium truncate">{item.label}</span>
              {isActive && (
                <ChevronRight 
                  className="w-4 h-4 ml-auto transition-all duration-300 opacity-100 translate-x-1" 
                />
              )}
            </>
          )}
        </button>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 text-slate-900 shadow-lg hover:bg-slate-50 transition-all"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 h-screen bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-40 shadow-lg",
          isCollapsed ? "w-20" : "w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Edimy
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">{userRole}</p>
                </div>
              </div>
            )}
            
            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 transition-all text-slate-600 hover:text-slate-900"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {isCollapsed && (
            <div className="mt-3 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 space-y-2 bg-slate-50">

          <button
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl text-left text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
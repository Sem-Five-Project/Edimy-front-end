// // import React from 'react';
// // import { useSidebar } from '@/components/ui/sidebar';

// // interface DashboardSidebarProps {
// //   userRole?: string;
// // }

// // const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userRole }) => {
// //   const { toggleSidebar } = useSidebar();

// //   return (
// //     <aside className="w-64 bg-gray-800 text-white min-h-screen">
// //       <div className="p-4">
// //         <h2 className="text-lg font-bold">Dashboard</h2>
// //         <button onClick={toggleSidebar} className="mt-2 text-sm">
// //           Toggle Sidebar
// //         </button>
// //       </div>
// //       <nav className="mt-4">
// //         <ul>
// //           <li>
// //             <a href="/dashboard" className="block p-2 hover:bg-gray-700">
// //               Home
// //             </a>
// //           </li>
// //           {userRole === 'STUDENT' && (
// //             <>
// //               <li>
// //                 <a href="/dashboard/student/profile" className="block p-2 hover:bg-gray-700">
// //                   Profile
// //                 </a>
// //               </li>
// //               <li>
// //                 <a href="/dashboard/student/find-tutor" className="block p-2 hover:bg-gray-700">
// //                   Find Tutor
// //                 </a>
// //               </li>
// //             </>
// //           )}
// //           {userRole === 'TUTOR' && (
// //             <>
// //               <li>
// //                 <a href="/dashboard/tutor/profile" className="block p-2 hover:bg-gray-700">
// //                   Profile
// //                 </a>
// //               </li>
// //               <li>
// //                 <a href="/dashboard/tutor/view-classes" className="block p-2 hover:bg-gray-700">
// //                   View Classes
// //                 </a>
// //               </li>
// //             </>
// //           )}
// //           {userRole === 'ADMIN' && (
// //             <>
// //               <li>
// //                 <a href="/dashboard/admin/users" className="block p-2 hover:bg-gray-700">
// //                   User Management
// //                 </a>
// //               </li>
// //               <li>
// //                 <a href="/dashboard/admin/tutor-applications" className="block p-2 hover:bg-gray-700">
// //                   Tutor Applications
// //                 </a>
// //               </li>
// //               <li>
// //                 <a href="/dashboard/admin/analytics" className="block p-2 hover:bg-gray-700">
// //                   System Analytics
// //                 </a>
// //               </li>
// //             </>
// //           )}
// //         </ul>
// //       </nav>
// //     </aside>
// //   );
// // };

// // export default DashboardSidebar;
// "use client";
// import React from 'react';
// import { useSidebar } from '@/components/ui/sidebar';
// import { useRouter } from 'next/navigation';

// interface DashboardSidebarProps {
//   userRole?: string;
// }

// const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userRole }) => {
//   const { toggleSidebar } = useSidebar();
//   const router = useRouter();

//   // Determine home path based on role
//   const getHomePath = () => {
//     switch (userRole) {
//       case 'STUDENT':
//         return '/dashboard/student';
//       case 'TUTOR':
//         return '/dashboard/tutor';
//       case 'ADMIN':
//         return '/dashboard/admin';
//       default:
//         return '/dashboard';
//     }
//   };

//   return (
//     <aside className="w-64 bg-gray-800 text-white min-h-screen">
//       <div className="p-4">
//         <h2 className="text-lg font-bold">Dashboard</h2>
//         <button onClick={toggleSidebar} className="mt-2 text-sm">
//           Toggle Sidebar
//         </button>
//       </div>
//       <nav className="mt-4">
//         <ul>
//           <li>
//             <button
//               onClick={() => router.push(getHomePath())}
//               className="block w-full text-left p-2 hover:bg-gray-700"
//             >
//               Home
//             </button>
//           </li>
          
//           {userRole === 'STUDENT' && (
//             <>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/student/profile')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   Profile
//                 </button>
//               </li>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/student/find-tutor')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   Find Tutor
//                 </button>
//               </li>
//             </>
//           )}

//           {userRole === 'TUTOR' && (
//             <>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/tutor/profile')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   Profile
//                 </button>
//               </li>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/tutor/view-classes')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   View Classes
//                 </button>
//               </li>
//             </>
//           )}

//           {userRole === 'ADMIN' && (
//             <>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/admin/users')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   User Management
//                 </button>
//               </li>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/admin/tutor-applications')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   Tutor Applications
//                 </button>
//               </li>
//               <li>
//                 <button
//                   onClick={() => router.push('/dashboard/admin/analytics')}
//                   className="block w-full text-left p-2 hover:bg-gray-700"
//                 >
//                   System Analytics
//                 </button>
//               </li>
//             </>
//           )}
//         </ul>
//       </nav>
//     </aside>
//   );
// };

// export default DashboardSidebar;"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation"; // ✅ import this
import { Home, User, Search, BookOpen, Users, FileText, BarChart3, Menu, X, ChevronRight, LogOut, Settings } from 'lucide-react';

interface DashboardSidebarProps {
  userRole?: string;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userRole = 'STUDENT' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const router = useRouter(); // ✅ use real Next router

  // Sidebar toggle (you can keep this or integrate with context)
  const toggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getHomePath = () => {
    switch (userRole) {
      case 'STUDENT': return '/dashboard/student';
      case 'TUTOR': return '/dashboard/tutor';
      case 'ADMIN': return '/dashboard/admin';
      default: return '/dashboard';
    }
  };

  const getNavItems = () => {
    const baseItems = [{ id: 'home', label: 'Home', icon: Home, path: getHomePath() }];
    if (userRole === 'STUDENT') {
      return [
        ...baseItems,
        { id: 'profile', label: 'Profile', icon: User, path: '/dashboard/student/profile' },
        { id: 'find-tutor', label: 'Find Tutor', icon: Search, path: '/dashboard/student/find-tutor' },
        { id: 'my-classes', label: 'My Classes', icon: BookOpen, path: '/dashboard/student/classes' }
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
    const isActive = activeItem === item.id || activeItem === item.path.split('/').pop();
    return (
      <li>
        <button
          onClick={() => {
            router.push(item.path); // ✅ real navigation
            setActiveItem(item.id);
            setIsMobileMenuOpen(false);
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 group ${
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="font-medium">{item.label}</span>
          </div>
          <ChevronRight className={`w-4 h-4 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
        </button>
      </li>
    );
  };

  return (
    <aside className="w-80 bg-gray-900 text-white">
      {/* ... keep rest of your code unchanged ... */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;

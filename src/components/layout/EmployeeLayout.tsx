import { Outlet, Link, useLocation } from 'react-router';
import { Target, Trophy, Heart, Search, UserCircle, Bell, Home, Settings, LogOut, Activity, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { useEffect, useState } from 'react';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';

export function EmployeeLayout() {
  const location = useLocation();
  const { user, roleInfo, signOut } = useAuth();
  

  const navItems = [
    { name: 'My Dashboard', path: '/employee', icon: Target },
    { name: 'Discover Projects', path: '/employee/projects', icon: Search },
    { name: 'Challenges', path: '/employee/challenges', icon: Trophy },
    { name: 'Resource Groups', path: '/employee/ergs', icon: Users },
    { name: 'My Impact', path: '/employee/impact', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar - Typical for Employee Intranet Feel */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {roleInfo?.company?.logoUrl ? (
                  <img src={roleInfo.company.logoUrl} alt="Logo" className="h-8 w-8 object-contain mr-2" />
                ) : (
                  <Heart className="h-6 w-6 text-blue-600 mr-2" />
                )}
                <span className="font-semibold text-lg text-gray-900 tracking-tight">
                  {roleInfo?.company?.name ? `${roleInfo.company.name} CSR` : 'CSR Portal'}
                </span>
              </div>
              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/employee' && location.pathname.startsWith(item.path));
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={cn(
                        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                        isActive
                          ? "border-blue-600 text-gray-900"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-400 hover:text-gray-500 mr-2" title="Back to Portal Selection">
                <Home className="h-5 w-5" />
              </Link>
              <Link to="/employee/settings" className="text-gray-400 hover:text-gray-500 mr-2" title="Settings">
                <Settings className="h-5 w-5" />
              </Link>
              <NotificationDrawer />
              <button onClick={signOut} className="text-gray-400 hover:text-red-600 transition-colors" title="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-700">{user?.displayName || 'Employee'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'User'} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <UserCircle className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

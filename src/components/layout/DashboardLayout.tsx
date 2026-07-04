import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, MessageSquare, HeartHandshake, Building2, UserCircle, Settings, Home, LogOut , CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';

export function DashboardLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Charities & CSR', path: '/admin/charities', icon: HeartHandshake },
    { name: 'Companies', path: '/admin/companies', icon: Building2 },
    { name: 'Support', path: '/admin/support', icon: MessageSquare },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Payment Audit', path: '/admin/payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <HeartHandshake className="h-6 w-6 text-blue-600 mr-2" />
          <span className="font-semibold text-lg text-gray-900 tracking-tight">Platform Admin</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-blue-700" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="h-8 w-8 text-gray-400" />
            )}
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.displayName || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Link to="/" className="text-gray-400 hover:text-gray-600" title="Back to Portal Selection">
                <Home className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className="text-gray-400 hover:text-red-600 transition-colors" title="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shadow-sm z-10">
          <NotificationDrawer />
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

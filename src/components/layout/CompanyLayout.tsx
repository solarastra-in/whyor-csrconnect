import { Outlet, Link, useLocation } from 'react-router';
import { LayoutDashboard, Users, HeartHandshake, Settings, Activity, FileSpreadsheet, Home, UserCircle, BadgeCheck, LogOut, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/src/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { NotificationDrawer } from './NotificationDrawer';
import { useEffect, useState } from 'react';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';

export function CompanyLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);

  useEffect(() => {
    if (user) {
      getUserRoleInfo(user).then(info => setRoleInfo(info));
    }
  }, [user]);

  const navItems = [
    { name: t('dashboard.overview'), path: '/company', icon: LayoutDashboard },
    { name: t('dashboard.discoverProjects'), path: '/company/projects', icon: HeartHandshake },
    { name: t('dashboard.employeeEngagement'), path: '/company/engagement', icon: Users },
    { name: 'Resource Groups', path: '/company/ergs', icon: Users },
    { name: t('dashboard.skillVerification'), path: '/company/skills', icon: BadgeCheck },
    { name: t('dashboard.matchingCampaigns'), path: '/company/campaigns', icon: Activity },
    { name: 'Giving Budgets', path: '/company/budgets', icon: Wallet },
    { name: 'Corporate Grants', path: '/company/grants', icon: FileSpreadsheet },
    { name: t('dashboard.impactReports'), path: '/company/reports', icon: FileSpreadsheet },
    { name: t('dashboard.settings'), path: '/company/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          {roleInfo?.company?.logoUrl ? (
            <img src={roleInfo.company.logoUrl} alt="Logo" className="h-8 w-8 object-contain mr-2 rounded bg-white p-0.5" />
          ) : (
            <Activity className="h-5 w-5 text-indigo-400 mr-2" />
          )}
          <span className="font-semibold text-lg text-white tracking-tight truncate">
            {roleInfo?.company?.name || 'Admin Console'}
          </span>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Admin</p>
          <p className="text-sm font-medium text-white mt-1">{roleInfo?.company?.name || 'Loading...'}</p>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/company' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-600/10 text-indigo-400" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5 flex-shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="h-8 w-8 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <UserCircle className="h-8 w-8 text-slate-400" />
            )}
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Admin User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <Link to="/" className="text-slate-400 hover:text-white" title="Back to Portal Selection">
                <Home className="h-5 w-5" />
              </Link>
              <button onClick={signOut} className="text-slate-400 hover:text-red-400 transition-colors" title="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 shadow-sm z-10">
          <NotificationDrawer />
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

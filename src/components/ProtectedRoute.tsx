import { Navigate } from 'react-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { getUserRoleInfo, UserRoleInfo } from '@/src/lib/userRole';

export function ProtectedRoute({ children, allowedRoles }: { children: ReactNode, allowedRoles?: string[] }) {
  const { user, roleInfo, loading } = useAuth();
  const checkingRole = false;

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && roleInfo) {
    if (!allowedRoles.includes(roleInfo.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

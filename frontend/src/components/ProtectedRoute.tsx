import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessPath, roleHome } from '../utils/permissions';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
          <span className="h-5 w-5 rounded-full border-2 border-red-200 border-t-red-600 animate-spin" />
          Securing your workspace...
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!canAccessPath(user.role, location.pathname)) return <Navigate to={roleHome(user.role)} replace />;
  return <Outlet />;
};

export default ProtectedRoute;
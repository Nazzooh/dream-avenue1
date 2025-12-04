import { motion } from 'motion/react';
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAdminGuard } from "../hooks/useAdminGuard";

/**
 * Extract role from session (utility for debugging)
 */
export function extractRoleFromSession(session: any) {
  if (!session) return null;
  // prefer root-level role if present
  const rootRole = session.user?.role ?? session?.user?.role ?? null;
  const metaRole = session.user?.user_metadata?.role ?? session?.user?.user_metadata?.role ?? null;
  return { rootRole, metaRole, finalIsAdmin: (rootRole === 'admin' || metaRole === 'admin') };
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { loading, isAdmin, user, profileError } = useAdminGuard();

  // Clean up any debug global variables
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Remove any leftover global debug vars (avoid typos like isAdsAdminn)
        delete (window as any).isAdsAdmin;
      }
    } catch (e) {
      console.warn('Admin guard init error', e);
    }
  }, []);

  // Show loading state while checking auth
  if (loading) {
    console.log('🛡️ ProtectedRoute: Loading auth state...');
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-cream)' }}>
        <div className="text-center">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"
          />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  console.log('🛡️ ProtectedRoute: Auth loaded', { hasUser: !!user, isAdmin, requireAdmin });

  // Show friendly error if there was a profile fetch problem
  if (profileError) {
    console.error('❌ ProtectedRoute: Profile error', profileError);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h2 className="text-xl mb-2 text-red-800">Authentication Error</h2>
            <p className="text-red-600 mb-4">
              There was a problem loading your profile. Please try logging in again.
            </p>
            <a 
              href="/admin/login"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Return to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🚫 ProtectedRoute: No user, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    console.log('🚫 ProtectedRoute: Admin required but user is not admin');
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-cream)' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl mb-2 text-yellow-800">Access Denied</h2>
            <p className="text-yellow-600 mb-4">
              Admin role required. Please login as admin.
            </p>
            <a 
              href="/admin/login"
              className="inline-block px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Login as Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: Access granted');
  // Render protected content
  return <>{children}</>;
}
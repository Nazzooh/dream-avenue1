// src/auth/useAdmin.ts — Simplified hook for admin access checking
import { useAdminGuard } from '../hooks/useAdminGuard';

/**
 * Simplified hook for checking admin access in components
 * Uses the robust useAdminGuard with proper token refresh handling
 */
export function useAdmin() {
  const { loading, isAdmin, user, profileError } = useAdminGuard();

  return {
    loading,
    isAdmin,
    user,
    error: profileError
  };
}
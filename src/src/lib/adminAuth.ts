// src/lib/adminAuth.ts
// SIMPLIFIED: Uses ONLY profile.role from database as source of truth
// NO JWT claims checking - profile.role is the single source of authority

import { supabase } from '../../utils/supabase/client';

export interface AdminProfile {
  id: string;
  email: string | null;
  role: string | null;
}

/**
 * Fetch user profile from database
 * This is the ONLY source of truth for role checking
 */
export async function fetchUserProfile(userId: string): Promise<AdminProfile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Failed to fetch profile:', error);
      return null;
    }

    console.log('📋 Profile fetched:', { id: profile.id, email: profile.email, role: profile.role });
    return profile;
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return null;
  }
}

/**
 * Check if current user is admin
 * SIMPLIFIED: Only checks profile.role === 'admin'
 * NO JWT claims, NO metadata, ONLY database profile.role
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      console.log('❌ No session');
      return false;
    }

    const profile = await fetchUserProfile(session.user.id);
    
    if (!profile) {
      console.log('❌ No profile found');
      return false;
    }

    const isAdminUser = profile.role === 'admin';
    console.log('🔐 Admin check:', { userId: profile.id, role: profile.role, isAdmin: isAdminUser });
    
    return isAdminUser;
  } catch (error) {
    console.error('❌ isAdmin check failed:', error);
    return false;
  }
}

/**
 * Assert admin access (throws if not admin)
 * Use before admin RPC calls
 */
export async function assertAdmin(action?: string): Promise<AdminProfile> {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    throw new Error('You are not logged in');
  }

  const profile = await fetchUserProfile(session.user.id);
  
  if (!profile) {
    throw new Error('Profile not found');
  }

  if (profile.role !== 'admin') {
    const message = action 
      ? `You are not authorized as admin to ${action}`
      : 'You are not authorized as admin';
    throw new Error(message);
  }

  console.log(`✅ Admin access granted for: ${action || 'action'}`);
  return profile;
}

/**
 * Get current user profile (without admin check)
 */
export async function getCurrentProfile(): Promise<AdminProfile | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return null;
    }

    return await fetchUserProfile(session.user.id);
  } catch (error) {
    console.error('Error getting current profile:', error);
    return null;
  }
}

/**
 * Get admin ID or throw (Patch 6)
 * Helper to check admin role before calling admin RPCs
 */
export async function getAdminIdOrThrow(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) throw new Error('Not signed in');
  const rootRole = (session.user as any).role;
  const metaRole = session.user?.user_metadata?.role;
  const isAdmin = rootRole === 'admin' || metaRole === 'admin';
  if (!isAdmin) throw new Error('Admin role required');
  return session.user.id;
}
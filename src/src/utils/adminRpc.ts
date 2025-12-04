// src/utils/adminRpc.ts - Admin RPC wrapper with JWT validation

import { supabase } from './supabase/client';

/**
 * Wrapper for admin RPC calls that ensures:
 * 1. Fresh JWT token is retrieved
 * 2. User has admin role
 * 3. Token is valid and not expired
 * 
 * @param fnName - RPC function name (e.g., 'admin_update_booking_details')
 * @param params - RPC function parameters
 * @returns RPC response data
 * @throws Error if not authenticated or not admin
 */
export async function adminRpc<T = any>(
  fnName: string,
  params: Record<string, any>
): Promise<{ data: T | null; error: any }> {
  // Always get fresh session (never use cached)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  // Check session exists
  if (sessionError || !session) {
    console.error('❌ Admin RPC failed: No active session', sessionError);
    throw new Error('No active session. Please log in again.');
  }

  // Verify token exists
  if (!session.access_token) {
    console.error('❌ Admin RPC failed: No access token in session');
    throw new Error('No access token found. Please log in again.');
  }

  // Check if token is expired
  const expiresAt = session.expires_at;
  if (expiresAt && expiresAt * 1000 < Date.now()) {
    console.error('❌ Admin RPC failed: Token expired');
    throw new Error('Session expired. Please log in again.');
  }

  // CRITICAL: Check admin role in JWT root (not just metadata)
  const jwtRole = session.user.role;
  const metadataRole = session.user.user_metadata?.role;

  console.log('🔐 Admin RPC Auth Check:', {
    fnName,
    jwtRole,
    metadataRole,
    userId: session.user.id,
    email: session.user.email,
  });

  // Backend checks jwt.role, so we must verify it here
  if (jwtRole !== 'admin') {
    console.error('❌ Admin RPC failed: JWT role is not "admin"', {
      jwtRole,
      metadataRole,
      message: 'JWT must have role: "admin" at root level',
    });
    throw new Error(
      `Access denied. Your JWT role is "${jwtRole}" but "admin" is required. ` +
      'Please log out and log in again, or contact support.'
    );
  }

  // Double-check metadata role for consistency
  if (metadataRole !== 'admin') {
    console.warn('⚠️ Warning: Metadata role is not admin, but JWT role is', {
      jwtRole,
      metadataRole,
    });
  }

  // Add admin_id to params if not already present
  const enrichedParams = {
    ...params,
    // Ensure p_admin_id is always set for audit trail
    p_admin_id: params.p_admin_id || session.user.id,
  };

  console.log('✅ Admin RPC calling:', fnName, enrichedParams);

  // Execute RPC with fresh token
  const result = await supabase.rpc(fnName, enrichedParams);

  if (result.error) {
    console.error('❌ Admin RPC error:', {
      fnName,
      error: result.error,
      params: enrichedParams,
    });
  } else {
    console.log('✅ Admin RPC success:', fnName);
  }

  return result;
}

/**
 * Verify current session has admin access
 * @returns true if admin, false otherwise
 */
export async function verifyAdminAccess(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return false;
    
    const jwtRole = session.user.role;
    return jwtRole === 'admin';
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}

/**
 * Get current admin user ID
 * @returns admin user ID or null
 */
export async function getAdminUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return null;
    
    const jwtRole = session.user.role;
    if (jwtRole !== 'admin') return null;
    
    return session.user.id;
  } catch (error) {
    console.error('Error getting admin user ID:', error);
    return null;
  }
}

/**
 * Debug utility - prints JWT claims to console
 */
export const debugJWT = {
  async print() {
    console.log('═══════════════════════════════════════');
    console.log('        JWT DEBUG UTILITY              ');
    console.log('═══════════════════════════════════════');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('❌ No active session:', error);
      return;
    }
    
    const user = session.user;
    const jwtRole = user.role;
    const metadataRole = user.user_metadata?.role;
    
    console.log('📧 Email:', user.email);
    console.log('🆔 User ID:', user.id);
    console.log('');
    console.log('🔐 Role Claims:');
    console.log('   jwt.role (root):         ', jwtRole);
    console.log('   user_metadata.role:      ', metadataRole);
    console.log('');
    console.log('✅ Admin Access:', jwtRole === 'admin' ? '✅ YES' : '❌ NO');
    console.log('');
    console.log('⏱️  Token Expiry:');
    if (session.expires_at) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const minutesLeft = Math.floor((expiresAt.getTime() - now.getTime()) / 60000);
      console.log('   Expires at:', expiresAt.toLocaleString());
      console.log('   Time left: ', minutesLeft, 'minutes');
    }
    console.log('');
    console.log('🔑 Access Token:');
    console.log('   ', session.access_token);
    console.log('');
    console.log('═══════════════════════════════════════');
    
    return {
      jwtRole,
      metadataRole,
      isAdmin: jwtRole === 'admin',
      userId: user.id,
      email: user.email,
    };
  },
  
  async testRPCs() {
    console.log('🧪 Testing Admin RPC Access...\n');
    
    const testBookingId = '00000000-0000-0000-0000-000000000000';
    
    const rpcs = [
      { name: 'admin_confirm_booking', params: { p_booking_id: testBookingId } },
      { name: 'admin_update_booking_details', params: { 
        p_booking_id: testBookingId,
        p_event_type: 'normal',
        p_admin_id: 'test',
      }},
      { name: 'admin_cancel_booking', params: { 
        p_booking_id: testBookingId, 
        p_reason: 'test',
        p_admin_id: 'test',
      }},
    ];
    
    let passCount = 0;
    
    for (const rpc of rpcs) {
      try {
        const result = await adminRpc(rpc.name, rpc.params);
        
        if (!result.error) {
          console.log(`✅ ${rpc.name}: Accessible (no auth error)`);
          passCount++;
        } else if (
          result.error.message?.includes('not found') || 
          result.error.message?.includes('does not exist')
        ) {
          console.log(`✅ ${rpc.name}: Accessible (booking not found is expected)`);
          passCount++;
        } else if (
          result.error.message?.includes('Admin role required') ||
          result.error.message?.includes('unauthenticated') ||
          result.error.message?.includes('unauthorised')
        ) {
          console.log(`❌ ${rpc.name}: AUTH FAILED -`, result.error.message);
        } else {
          console.log(`⚠️  ${rpc.name}: Other error -`, result.error.message);
        }
      } catch (error: any) {
        console.log(`❌ ${rpc.name}: EXCEPTION -`, error.message);
      }
    }
    
    console.log(`\n📊 Summary: ${passCount}/${rpcs.length} RPCs accessible\n`);
    
    return passCount === rpcs.length;
  },
};

// Make available globally in browser
if (typeof window !== 'undefined') {
  (window as any).debugJWT = debugJWT;
}

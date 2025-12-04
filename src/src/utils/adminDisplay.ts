// Utility functions for displaying admin information

/**
 * Formats admin profile for display
 * Returns name with email in parentheses, or fallback
 */
export function formatAdminName(
  profile: { full_name: string | null; email: string | null } | null | undefined,
  fallback = '(Unknown admin)'
): string {
  if (!profile) return fallback;
  
  const name = profile.full_name || profile.email || fallback;
  
  return name;
}

/**
 * Formats admin profile with email
 * Returns name and email separately for flexible rendering
 */
export function getAdminDisplayInfo(
  profile: { full_name: string | null; email: string | null } | null | undefined
): { name: string; email: string | null } {
  if (!profile) {
    return { name: '(Unknown admin)', email: null };
  }
  
  return {
    name: profile.full_name || profile.email || '(Unknown admin)',
    email: profile.email,
  };
}

/**
 * Formats admin name with email in parentheses
 */
export function formatAdminNameWithEmail(
  profile: { full_name: string | null; email: string | null } | null | undefined,
  fallback = '(Unknown admin)'
): string {
  if (!profile) return fallback;
  
  const name = profile.full_name || fallback;
  const email = profile.email;
  
  if (name !== fallback && email) {
    return `${name} (${email})`;
  }
  
  return name;
}

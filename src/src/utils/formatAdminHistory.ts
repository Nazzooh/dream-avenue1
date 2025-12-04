// src/utils/formatAdminHistory.ts — Format admin action history messages

export interface BookingAction {
  id: string;
  action: string;
  notes?: string | null;
  performed_at: string;
  performed_by?: string | null;
  performed_by_name?: string | null;
  performed_by_email?: string | null;
  actor?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
}

/**
 * Format admin history actions into clean, professional messages
 * Produces: "Nasooh confirmed this booking", "Ashraf updated pricing", etc.
 */
export function formatAdminHistory(action: BookingAction): string {
  const name = action.performed_by_name || action.actor_name || action.performed_by || "Admin";

  switch (action.action) {
    case "confirmed":
    case "booking_confirmed":
      return `${name} confirmed this booking`;
    
    case "updated_details":
    case "details_updated":
      return `${name} updated booking details`;
    
    case "updated_pricing":
    case "pricing_updated":
      return `${name} updated pricing`;
    
    case "cancelled":
    case "booking_cancelled":
      return `${name} cancelled this booking`;
    
    case "extras_updated":
      return `${name} updated extras`;
    
    case "completed":
    case "booking_completed":
      return `${name} marked booking as completed`;
    
    case "reopened":
    case "booking_reopened":
      return `${name} reopened this booking`;
    
    case "created":
    case "booking_created":
      return `${name} created this booking`;
    
    default:
      // Generic fallback - clean up underscores
      const cleanAction = action.action.replace(/_/g, " ");
      return `${name} ${cleanAction}`;
  }
}

/**
 * Get admin display name from booking action with fallback
 */
export function getAdminName(action: BookingAction): string {
  return action.performed_by_name || action.actor_name || action.performed_by || "Unknown admin";
}

/**
 * Get admin email from booking action with fallback
 */
export function getAdminEmail(action: BookingAction): string {
  return action.performed_by_email || action.actor_email || "";
}

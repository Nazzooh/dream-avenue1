// /src/components/admin/BookingDetailsModal.tsx
import React, { useEffect, useState } from "react";
import {
  confirmBooking,
  cancelBooking,
  updateBookingDetails,
  updateBookingExtras,
  getBookingActions
} from "@/api/adminBookings";
import { log } from "@/lib/logger";
import { supabase } from "@/lib/supabase";

type Props = {
  bookingId: string | null;
  adminId: string | null;
  onClose?: () => void;
};

export default function BookingDetailsModal({ bookingId, adminId, onClose }: Props) {
  const [actions, setActions] = useState<any[]>([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    setLoadingActions(true);
    getBookingActions(bookingId)
      .then((rows) => {
        setActions(rows ?? []);
        setLoadingActions(false);
      })
      .catch((err) => {
        log.error("Failed to load booking actions:", err);
        setError(err.message ?? "Failed to load booking actions");
        setLoadingActions(false);
      });
  }, [bookingId]);

  function handleConfirm() {
    if (!bookingId) {
      setError("Missing bookingId");
      return;
    }
    
    // Get session to use session.user.id as adminId
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          throw new Error("No active session");
        }
        return confirmBooking({ bookingId, adminId: session.user.id });
      })
      .then(() => {
        // refresh actions
        return getBookingActions(bookingId);
      })
      .then(setActions)
      .catch((err) => {
        log.error("Confirm booking error:", err);
        setError(err.message ?? "Confirm failed");
      });
  }

  // small helper to render actor name
  function actorName(row: any) {
    return row.actor_name ?? row.performed_by_name ?? row.performed_by ?? "Admin";
  }

  return (
    <div className="modal">
      <h3>Booking Details</h3>

      {loadingActions ? (
        <div>Loading actions...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <ul>
          {actions.map((a) => (
            <li key={a.id}>
              <strong>{actorName(a)}</strong> — {a.action} <small>({new Date(a.performed_at).toLocaleString()})</small>
              <div className="notes">{a.notes}</div>
            </li>
          ))}
        </ul>
      )}

      <div className="modal-actions">
        <button onClick={handleConfirm}>Confirm booking (admin)</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
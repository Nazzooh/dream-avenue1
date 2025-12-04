// src/components/admin/BookingActionsList.tsx
import React from "react";

interface BookingAction {
  id: string;
  booking_id: string;
  action: string;
  performed_by: string;
  performed_by_name?: string;
  actor_name?: string;
  performed_at: string;
  notes?: string | null;
}

interface Props {
  actions: BookingAction[];
}

export default function BookingActionsList({ actions }: Props) {
  if (!actions || actions.length === 0) {
    return (
      <div style={{ 
        padding: '1rem', 
        textAlign: 'center', 
        color: '#6c757d',
        fontSize: '0.875rem' 
      }}>
        No actions found
      </div>
    );
  }

  return (
    <ul style={{ 
      listStyle: 'none', 
      padding: 0, 
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }}>
      {actions.map((a) => (
        <li 
          key={a.id}
          style={{
            padding: '0.75rem 1rem',
            background: '#F9FAFB',
            borderRadius: '8px',
            border: '1px solid #E5E7EB'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.25rem'
          }}>
            <strong style={{ color: '#343A40', fontSize: '0.875rem' }}>
              {a.performed_by_name ?? a.actor_name ?? a.performed_by ?? "Admin"}
            </strong>
            <span style={{ 
              fontSize: '0.75rem', 
              color: '#6c757d' 
            }}>
              {new Date(a.performed_at).toLocaleString()}
            </span>
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: '#495057',
            marginBottom: a.notes ? '0.25rem' : 0
          }}>
            {a.action}
          </div>
          {a.notes && (
            <div style={{ 
              fontSize: '0.8125rem', 
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              {a.notes}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

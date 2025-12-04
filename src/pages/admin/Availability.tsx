import AdminLayout from '../../components/admin-v2/AdminLayout';
import { AdminAvailabilityCalendar } from '../../components/admin/AdminAvailabilityCalendar';

export function AdminAvailability() {
  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', fontWeight: '600', color: '#2A2A2A', marginBottom: '0.5rem' }}>
            Calendar & Availability
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666666' }}>
            Manage bookings, block dates, and create manual bookings
          </p>
        </div>
        <AdminAvailabilityCalendar />
      </div>
    </AdminLayout>
  );
}
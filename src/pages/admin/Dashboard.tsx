import { motion } from 'motion/react';
import { 
  Users, Calendar, CheckCircle, TrendingUp, 
  DollarSign, Star, Clock, Building2 
} from 'lucide-react';
import AdminLayout from '../../components/admin-v2/AdminLayout';
import { EnhancedAnalyticsDashboard } from '../../components/admin-v2/EnhancedAnalyticsDashboard';
import { useBookings } from '../../src/hooks/useBookings';
import { usePackages } from '../../src/hooks/usePackages';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  delay?: number;
}

function MetricCard({ title, value, change, icon, trend = 'up', delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="admin-metric-card"
      style={{
        padding: 'clamp(1rem,2.5vw,1.5rem)',
        borderRadius: 'clamp(0.75rem,2vw,1rem)'
      }}
    >
      <div className="admin-metric-header">
        <span 
          className="admin-metric-label"
          style={{
            fontSize: 'clamp(0.75rem,1.5vw,0.875rem)'
          }}
        >
          {title}
        </span>
        <div 
          className="admin-metric-icon"
          style={{
            width: 'clamp(2.5rem,6vw,3rem)',
            height: 'clamp(2.5rem,6vw,3rem)',
            fontSize: 'clamp(1rem,2vw,1.25rem)'
          }}
        >
          {icon}
        </div>
      </div>
      
      <div 
        className="admin-metric-value"
        style={{
          fontSize: 'clamp(1.75rem,4vw,2.5rem)'
        }}
      >
        {value}
      </div>
      
      {change && (
        <div 
          className={`admin-metric-change ${trend === 'up' ? 'positive' : 'negative'}`}
          style={{
            fontSize: 'clamp(0.75rem,1.25vw,0.875rem)'
          }}
        >
          <TrendingUp className="w-[1em] h-[1em]" style={{ 
            transform: trend === 'down' ? 'rotate(180deg)' : 'rotate(0deg)' 
          }} />
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
}

export function AdminDashboard() {
  const { data: bookings = [] } = useBookings();
  const { data: packages = [] } = usePackages();

  // Calculate metrics
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  
  // Calculate this month's bookings
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthBookings = bookings.filter(b => {
    const bookingDate = new Date(b.booking_date);
    return bookingDate.getMonth() === thisMonth && bookingDate.getFullYear() === thisYear;
  }).length;

  return (
    <AdminLayout>
      {/* Header with Gradient Background - Fluid */}
      <div 
        className="admin-gradient-bg rounded-b-3xl"
        style={{
          marginLeft: 'calc(clamp(1rem,4vw,3rem) * -1)',
          marginRight: 'calc(clamp(1rem,4vw,3rem) * -1)',
          marginTop: 'calc(clamp(1rem,3vw,3rem) * -1)',
          padding: 'clamp(1.5rem,4vw,2rem) clamp(1rem,4vw,3rem)',
          marginBottom: 'clamp(1.5rem,3vw,2rem)',
          borderBottom: '1px solid #E6E6E6',
          boxShadow: '0 4px 20px rgba(182, 245, 0, 0.1)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(1.5rem,4vw,2rem)',
              fontWeight: '600',
              color: '#2A2A2A',
              marginBottom: 'clamp(0.25rem,1vw,0.5rem)'
            }}
          >
            Welcome to Dream Avenue
          </h1>
          <p style={{ 
            color: '#666666', 
            fontSize: 'clamp(0.875rem,1.5vw,1rem)' 
          }}>
            Here's what's happening with your venue today
          </p>
        </motion.div>
      </div>

      {/* Enhanced Analytics Dashboard with Smart Metrics */}
      <div style={{ marginBottom: 'clamp(2rem,4vw,2.5rem)' }}>
        <EnhancedAnalyticsDashboard />
      </div>

      {/* Analytics Cards - Fluid Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: 'clamp(0.75rem,2vw,1.25rem)',
          marginBottom: 'clamp(1.5rem,3vw,2rem)'
        }}
      >
        <MetricCard
          title="Total Bookings"
          value={totalBookings}
          change="+12.5% this month"
          icon={<Calendar className="w-[1em] h-[1em]" />}
          trend="up"
          delay={0.1}
        />
        
        <MetricCard
          title="Confirmed Events"
          value={confirmedBookings}
          change="+8.2% this month"
          icon={<CheckCircle className="w-[1em] h-[1em]" />}
          trend="up"
          delay={0.2}
        />
        
        <MetricCard
          title="Pending Requests"
          value={pendingBookings}
          change={pendingBookings > 5 ? 'Needs attention' : 'On track'}
          icon={<Clock className="w-[1em] h-[1em]" />}
          trend={pendingBookings > 5 ? 'down' : 'up'}
          delay={0.3}
        />
      </div>

      {/* Secondary Metrics - Fluid Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: 'clamp(0.75rem,2vw,1.25rem)',
          marginBottom: 'clamp(1.5rem,3vw,2rem)'
        }}
      >
        <MetricCard
          title="Completed Events"
          value={completedBookings}
          change={`This month: ${thisMonthBookings}`}
          icon={<Star className="w-[1em] h-[1em]" />}
          trend="up"
          delay={0.4}
        />
        
        <MetricCard
          title="Active Packages"
          value={packages.length}
          change="All packages live"
          icon={<Building2 className="w-[1em] h-[1em]" />}
          trend="up"
          delay={0.5}
        />
        
        <MetricCard
          title="Monthly Events"
          value={thisMonthBookings}
          change={`Total: ${totalBookings}`}
          icon={<Users className="w-[1em] h-[1em]" />}
          trend="up"
          delay={0.6}
        />
      </div>

      {/* Recent Activity Section - Fluid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="admin-card"
        style={{
          padding: 'clamp(1rem,2.5vw,1.5rem)',
          borderRadius: 'clamp(0.75rem,2vw,1rem)'
        }}
      >
        <div 
          className="admin-card-header"
          style={{
            marginBottom: 'clamp(1rem,2vw,1.5rem)'
          }}
        >
          <h3 
            className="admin-card-title"
            style={{
              fontSize: 'clamp(1.125rem,2.5vw,1.5rem)'
            }}
          >
            Recent Bookings
          </h3>
          <a 
            href="/admin/bookings"
            style={{ 
              color: '#B6F500',
              fontWeight: '500',
              textDecoration: 'none',
              fontSize: 'clamp(0.875rem,1.5vw,1rem)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            View All →
          </a>
        </div>

        {bookings.length === 0 ? (
          <div className="admin-empty-state">
            <div 
              className="admin-empty-icon"
              style={{
                width: 'clamp(4rem,10vw,5rem)',
                height: 'clamp(4rem,10vw,5rem)'
              }}
            >
              <Calendar style={{ width: '50%', height: '50%' }} />
            </div>
            <h4 style={{ 
              fontSize: 'clamp(1rem,2vw,1.125rem)',
              marginBottom: 'clamp(0.25rem,1vw,0.5rem)'
            }}>
              No Bookings Yet
            </h4>
            <p style={{ 
              fontSize: 'clamp(0.875rem,1.5vw,1rem)',
              color: '#999'
            }}>
              Bookings will appear here as they come in
            </p>
          </div>
        ) : (
          <div 
            className="admin-table-wrapper"
            style={{
              overflowX: 'auto',
              marginLeft: 'calc(clamp(1rem,2.5vw,1.5rem) * -1)',
              marginRight: 'calc(clamp(1rem,2.5vw,1.5rem) * -1)',
              padding: '0 clamp(1rem,2.5vw,1.5rem)'
            }}
          >
            <table 
              className="admin-table"
              style={{
                width: '100%',
                minWidth: '600px'
              }}
            >
              <thead>
                <tr>
                  <th style={{ fontSize: 'clamp(0.75rem,1.5vw,0.875rem)' }}>Client</th>
                  <th style={{ fontSize: 'clamp(0.75rem,1.5vw,0.875rem)' }}>Event Date</th>
                  <th style={{ fontSize: 'clamp(0.75rem,1.5vw,0.875rem)' }}>Status</th>
                  <th style={{ fontSize: 'clamp(0.75rem,1.5vw,0.875rem)' }}>Guests</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontSize: 'clamp(0.875rem,1.5vw,1rem)' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#2A2A2A' }}>
                          {booking.full_name}
                        </div>
                        <div style={{ 
                          fontSize: 'clamp(0.75rem,1.25vw,0.875rem)', 
                          color: '#999' 
                        }}>
                          {booking.mobile}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 'clamp(0.875rem,1.5vw,1rem)' }}>
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </td>
                    <td>
                      <span 
                        className={`admin-status-badge admin-status-${booking.status}`}
                        style={{
                          fontSize: 'clamp(0.75rem,1.25vw,0.875rem)',
                          padding: 'clamp(0.25rem,0.5vw,0.375rem) clamp(0.5rem,1vw,0.75rem)',
                          borderRadius: 'clamp(0.375rem,1vw,0.5rem)'
                        }}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 'clamp(0.875rem,1.5vw,1rem)' }}>
                      {booking.guest_count || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}

export default AdminDashboard;
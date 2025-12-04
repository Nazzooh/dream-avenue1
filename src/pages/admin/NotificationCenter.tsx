// Dream Avenue — Admin Notification Center Page
// Comprehensive notification management and testing interface

import { useState } from 'react';
import { DashboardLayoutNew } from '../../components/admin-v2/DashboardLayoutNew';
import { PageHeader } from '../../components/admin-v2/PageHeader';
import { NotificationManagementPanel } from '../../components/admin-v2/NotificationManagementPanel';
import { NotificationSystemTest } from '../../components/admin-v2/NotificationSystemTest';
import { Bell, Zap } from 'lucide-react';

export default function NotificationCenter() {
  const [activeView, setActiveView] = useState<'management' | 'diagnostics'>('management');

  return (
    <DashboardLayoutNew title="Notification Center">
      <div>
        <PageHeader
          title="Notification Center"
          description="Manage and monitor your notification system"
          icon={Bell}
        />

        {/* View Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveView('management')}
            style={{
              padding: '12px 24px',
              background: activeView === 'management'
                ? 'linear-gradient(135deg, #B6F500, #98CD00)'
                : 'white',
              color: activeView === 'management' ? '#1a1a1a' : '#666666',
              border: '2px solid',
              borderColor: activeView === 'management' ? 'transparent' : 'rgba(182, 245, 0, 0.2)',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '0.938rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: activeView === 'management' ? '0 4px 12px rgba(182, 245, 0, 0.3)' : 'none',
            }}
          >
            <Bell size={18} />
            Management
          </button>
          <button
            onClick={() => setActiveView('diagnostics')}
            style={{
              padding: '12px 24px',
              background: activeView === 'diagnostics'
                ? 'linear-gradient(135deg, #B6F500, #98CD00)'
                : 'white',
              color: activeView === 'diagnostics' ? '#1a1a1a' : '#666666',
              border: '2px solid',
              borderColor: activeView === 'diagnostics' ? 'transparent' : 'rgba(182, 245, 0, 0.2)',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '0.938rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: activeView === 'diagnostics' ? '0 4px 12px rgba(182, 245, 0, 0.3)' : 'none',
            }}
          >
            <Zap size={18} />
            System Diagnostics
          </button>
        </div>

        {/* Content */}
        {activeView === 'management' ? (
          <NotificationManagementPanel />
        ) : (
          <NotificationSystemTest />
        )}
      </div>
    </DashboardLayoutNew>
  );
}

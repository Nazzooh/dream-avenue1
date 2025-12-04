// pages/admin/AnalyticsSettings.tsx — Analytics Settings Admin Page (Append-Only)
import React from 'react';
import AdminLayout from '../../components/admin-v2/AdminLayout';
import { AdminAnalyticsEditor } from '../../components/admin-v2/AdminAnalyticsEditor';

export function AnalyticsSettings() {
  return (
    <AdminLayout>
      <div className="p-6 md:p-10">
        <AdminAnalyticsEditor />
      </div>
    </AdminLayout>
  );
}

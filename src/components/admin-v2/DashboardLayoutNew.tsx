import { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { MobileBottomNav } from './MobileBottomNav';

interface DashboardLayoutNewProps {
  children: React.ReactNode;
  pageTitle: string;
  currentPage: string;
}

export function DashboardLayoutNew({ children, pageTitle, currentPage }: DashboardLayoutNewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <DashboardSidebar 
        currentPage={currentPage} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content Area */}
      <div className="admin-content">
        <DashboardTopbar 
          pageTitle={pageTitle} 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        
        {/* Scrollable Content */}
        <main className="admin-main">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentPage={currentPage} />
    </div>
  );
}

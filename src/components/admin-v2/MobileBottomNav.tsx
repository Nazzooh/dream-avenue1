import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  ClipboardList, 
  MoreHorizontal 
} from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
}

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'packages', label: 'Packages', icon: Package, path: '/admin/packages' },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList, path: '/admin/bookings' },
  { id: 'requests', label: 'Requests', icon: ClipboardList, path: '/admin/requests' },
  { id: 'more', label: 'More', icon: MoreHorizontal, path: '/admin/gallery' },
];

export function MobileBottomNav({ currentPage }: MobileBottomNavProps) {
  return (
    <nav className="mobile-bottom-nav">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <Link
            key={item.id}
            to={item.path}
            className={`mobile-bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
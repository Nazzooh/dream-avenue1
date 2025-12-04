import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'active' | 'inactive' | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusClass = () => {
    const normalized = status.toLowerCase();
    
    switch (normalized) {
      case 'confirmed':
      case 'completed':
      case 'active':
      case 'success':
        return 'admin-badge-success';
      
      case 'pending':
      case 'ongoing':
        return 'admin-badge-warning';
      
      case 'cancelled':
      case 'inactive':
      case 'rejected':
        return 'admin-badge-danger';
      
      case 'scheduled':
      case 'info':
        return 'admin-badge-info';
      
      default:
        return 'admin-badge-neon';
    }
  };

  return (
    <span className={`admin-badge ${getStatusClass()} ${className}`}>
      {status}
    </span>
  );
}

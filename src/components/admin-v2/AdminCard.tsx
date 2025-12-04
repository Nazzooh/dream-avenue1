import { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  className?: string;
}

export function AdminCard({ children, title, action, className = '' }: AdminCardProps) {
  return (
    <div className={`admin-card ${className}`}>
      {(title || action) && (
        <div className="admin-card-header">
          {title && <h3 className="admin-card-title">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

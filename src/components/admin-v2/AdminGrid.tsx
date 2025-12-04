import { ReactNode } from 'react';

interface AdminGridProps {
  children: ReactNode;
  columns?: 'auto' | '3';
  gap?: string;
  className?: string;
}

export function AdminGrid({ children, columns = '3', gap, className = '' }: AdminGridProps) {
  const gridClass = columns === '3' ? 'admin-grid admin-grid-3' : 'admin-grid admin-grid-auto';
  const style = gap ? { gap } : undefined;
  
  return (
    <div className={`${gridClass} ${className}`} style={style}>
      {children}
    </div>
  );
}

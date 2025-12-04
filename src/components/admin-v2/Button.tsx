import { motion } from 'framer-motion';
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  loading, 
  children, 
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  // Use admin-btn classes from admin-dashboard.css
  const baseClass = 'admin-btn';
  
  const variantClasses = {
    primary: 'admin-btn-primary',
    secondary: 'admin-btn-outline',
    outline: 'admin-btn-outline',
    danger: 'admin-btn-danger',
    gold: 'admin-btn-gold',
  };
  
  const sizeClasses = {
    sm: 'admin-btn-sm',
    md: '',
    lg: 'admin-btn-lg',
  };

  return (
    <button
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" 
        />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  );
}
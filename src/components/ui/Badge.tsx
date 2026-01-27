import React from 'react';
import { clsx } from 'clsx';
import { capitalize } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  const variants = {
    default: 'bg-background-tertiary text-text-secondary border-border',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    info: 'bg-status-info/10 text-status-info border-status-info/20',
  };

  return (
    <span className={clsx(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variants[variant],
      className
    )}>
      {typeof children === 'string' ? capitalize(children) : children}
    </span>
  );
};

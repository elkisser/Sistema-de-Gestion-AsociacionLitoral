import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  color?: 'brand' | 'blue' | 'purple' | 'orange';
}

export const StatsCard = ({ title, value, icon: Icon, trend, color = 'brand' }: StatsCardProps) => {
  const colorStyles = {
    brand: 'text-brand bg-brand/10',
    blue: 'text-status-info bg-status-info/10',
    purple: 'text-purple-400 bg-purple-400/10',
    orange: 'text-orange-400 bg-orange-400/10',
  };

  return (
    <div className="card hover:border-brand/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-text-secondary">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
        </div>
        <div className={clsx("p-3 rounded-xl", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={clsx(
            "font-medium",
            trend.isPositive ? "text-status-success" : "text-status-danger"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-text-secondary">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

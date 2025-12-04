import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  progressBar?: {
    value: number;
    color: string;
  };
}

export function StatCard({ icon: Icon, label, value, trend, progressBar }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-[#FFFADC] rounded-xl p-6 shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(182,245,0,0.2)] transition-all duration-300 border border-[#B6F500]/10">
      {/* Icon */}
      <div className="w-12 h-12 bg-gradient-to-br from-[#B6F500] to-[#A4DD00] rounded-lg flex items-center justify-center mb-4 shadow-md shadow-[#B6F500]/20">
        <Icon className="w-6 h-6 text-[#1a1a1a]" />
      </div>

      {/* Label */}
      <p className="text-[#1a1a1a]/60 text-sm mb-2">{label}</p>

      {/* Value */}
      <div className="flex items-baseline gap-3">
        <p className="text-[#1a1a1a] text-3xl font-medium">{value}</p>
        
        {trend && (
          <span className={`text-sm ${trend.isPositive ? 'text-[#10b981]' : 'text-[#E74C3C]'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {progressBar && (
        <div className="mt-4">
          <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progressBar.value}%`,
                background: progressBar.color 
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

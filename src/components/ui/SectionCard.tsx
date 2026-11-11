import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  badge?: number | string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  badge,
  actionLabel,
  actionHref,
  onAction,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#DBE5F1] shadow-station-card overflow-hidden flex flex-col ${className}`}
    >
      {/* Card Header Bar (often Navy or crisp white in screens) */}
      <div
        className={`px-5 py-3.5 flex items-center justify-between border-b border-[#EAEFF7] bg-white ${headerClassName}`}
      >
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-[#0B3A82] shrink-0">{icon}</span>}
          <h2 className="text-base font-bold text-[#0A285F] tracking-tight">{title}</h2>
          {badge !== undefined && (
            <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>

        {actionLabel && (
          actionHref ? (
            <Link
              to={actionHref}
              className="text-xs font-semibold text-[#0B3A82] hover:text-[#1668E3] flex items-center gap-1 transition-colors"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="text-xs font-semibold text-[#0B3A82] hover:text-[#1668E3] flex items-center gap-1 transition-colors"
            >
              <span>{actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )
        )}
      </div>

      {/* Card Body */}
      <div className={`p-5 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
};


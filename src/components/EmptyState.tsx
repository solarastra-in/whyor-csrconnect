import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  secondaryActionHref,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-10 px-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center ${className}`}>
      {Icon && (
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-2">
        {actionLabel && actionHref && (
          <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 rounded-lg px-4 font-medium shadow-xs">
            <Link to={actionHref}>{actionLabel}</Link>
          </Button>
        )}
        {actionLabel && !actionHref && onAction && (
          <Button size="sm" onClick={onAction} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs gap-1.5 rounded-lg px-4 font-medium shadow-xs">
            {actionLabel}
          </Button>
        )}

        {secondaryActionLabel && secondaryActionHref && (
          <Button asChild variant="outline" size="sm" className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 rounded-lg px-3 font-medium">
            <Link to={secondaryActionHref}>{secondaryActionLabel}</Link>
          </Button>
        )}
        {secondaryActionLabel && !secondaryActionHref && onSecondaryAction && (
          <Button variant="outline" size="sm" onClick={onSecondaryAction} className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs gap-1.5 rounded-lg px-3 font-medium">
            {secondaryActionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

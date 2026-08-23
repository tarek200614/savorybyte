import { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400">
        {icon || <Inbox className="w-6 h-6" />}
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-lg font-bold text-slate-200">{title}</h4>
        <p className="text-sm text-slate-400 font-light">{description}</p>
      </div>

      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

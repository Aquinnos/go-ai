import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AccountSettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AccountSettingsCard({
  title,
  description,
  children,
  className,
}: AccountSettingsCardProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg shadow-slate-950/30 backdrop-blur',
        className,
      )}
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        {description ? <p className="text-sm text-slate-400">{description}</p> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

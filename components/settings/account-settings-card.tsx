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
        'rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8 shadow-lg shadow-slate-950/40 backdrop-blur-xl',
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
        {description ? <p className="text-sm text-slate-300">{description}</p> : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

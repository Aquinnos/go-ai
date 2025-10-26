import { cn } from '@/lib/utils';

interface ChatGreetingProps {
  name?: string;
  className?: string;
}

export function ChatGreeting({ name, className }: ChatGreetingProps) {
  return (
    <div className={cn('space-y-4 text-center text-slate-200', className)}>
      <h1 className="text-3xl font-semibold tracking-tight text-sky-400 md:text-4xl">
        {name ? `Hello, ${name}!` : 'Hello!'}
      </h1>
      <p className="text-sm text-slate-400">
        Ask Gemini Clone anything – from quick ideas to deep dives.
      </p>
    </div>
  );
}

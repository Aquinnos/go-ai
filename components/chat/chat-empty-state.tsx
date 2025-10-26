import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface ChatEmptyStateProps {
  onNewChat?: () => void;
  className?: string;
  isCreating?: boolean;
}

export function ChatEmptyState({ onNewChat, className, isCreating }: ChatEmptyStateProps) {
  return (
    <div className={cn('flex flex-1 flex-col items-center justify-center gap-6 text-center', className)}>
      <Sparkles className="h-12 w-12 text-sky-400" />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-100">Start a new chat</h2>
        <p className="max-w-md text-sm text-slate-400">
          Explore ideas, generate content, or dive into topics. Ask anything and Gemini Clone will respond instantly.
        </p>
      </div>
      <Button onClick={onNewChat} disabled={isCreating}>
        {isCreating ? 'Creating…' : 'New chat'}
      </Button>
    </div>
  );
}

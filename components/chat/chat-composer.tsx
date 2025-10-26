'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatComposerProps {
  onSubmit?: (prompt: string) => Promise<void> | void;
  placeholder?: string;
  className?: string;
  isSubmitting?: boolean;
}

export function ChatComposer({ onSubmit, placeholder, className, isSubmitting }: ChatComposerProps) {
  const [value, setValue] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;

    try {
      setIsSending(true);
      await onSubmit?.(value.trim());
      setValue('');
    } finally {
      setIsSending(false);
    }
  };

  const disabled = isSubmitting || isSending;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full items-center gap-3 rounded-full border border-slate-800 bg-slate-900/70 px-5 py-3 text-slate-200 shadow-lg shadow-slate-950/40 backdrop-blur transition focus-within:border-slate-600 focus-within:bg-slate-900',
        className,
      )}
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder ?? 'Ask anything...'}
        className="flex-1 border-0 bg-transparent text-base text-slate-200 placeholder:text-slate-500 focus-visible:ring-0"
        disabled={disabled}
      />
      <Button type="button" size="icon" variant="ghost" disabled={disabled}>
        <Mic className="h-5 w-5" />
        <span className="sr-only">Voice input</span>
      </Button>
      <Button type="submit" size="icon" disabled={disabled}>
        <Send className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}

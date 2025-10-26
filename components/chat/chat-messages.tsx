import { formatChatTimestamp } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  className?: string;
}

export function ChatMessages({ messages, className }: ChatMessagesProps) {
  if (!messages.length) {
    return (
      <div className={cn('flex w-full max-w-3xl flex-col items-center justify-center gap-4 text-center text-sm text-slate-400', className)}>
        <p>No messages yet. Start the conversation below.</p>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full max-w-3xl flex-col gap-6', className)}>
      {messages.map((message) => {
        const isUser = message.role === 'user';
        return (
          <div
            key={message.id}
            className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-lg shadow-slate-950/40',
                isUser ? 'bg-sky-600 text-white' : 'bg-slate-800/90 text-slate-100',
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className={cn('mt-3 block text-xs', isUser ? 'text-sky-100/80' : 'text-slate-400')}>
                {formatChatTimestamp(message.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

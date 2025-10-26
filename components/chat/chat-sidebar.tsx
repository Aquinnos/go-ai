"use client";

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatChatTimestamp } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Clock, Plus, Search } from 'lucide-react';
import type { ChatSummary } from '@/types/chat';

interface ChatSidebarProps {
  chats: ChatSummary[];
  className?: string;
  activeChatId?: string | null;
  isCreating?: boolean;
  isLoading?: boolean;
  onNewChat?: () => void;
  onSelectChat?: (chatId: string) => void;
}

export function ChatSidebar({
  chats,
  className,
  activeChatId,
  isCreating,
  isLoading,
  onNewChat,
  onSelectChat,
}: ChatSidebarProps) {
  const isBusy = Boolean(isCreating) || Boolean(isLoading);

  return (
    <aside
      className={cn(
        'flex h-full w-full max-w-xs flex-col border-r border-slate-800 bg-slate-950/70 text-slate-200 backdrop-blur',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <Button
          className="w-full justify-start gap-2"
          variant="secondary"
          onClick={onNewChat}
          disabled={isBusy}
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
        <Button size="icon" variant="ghost" disabled>
          <Search className="h-4 w-4" />
          <span className="sr-only">Search chats</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <p className="px-2 text-xs font-medium uppercase tracking-wider text-slate-400">
          Recent
        </p>
        {isLoading ? (
          <ul className="mt-3 space-y-1">
            {Array.from({ length: 6 }).map((_, index) => (
              <li key={index}>
                <Skeleton className="h-12 w-full rounded-xl bg-slate-800/70" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-3 space-y-1">
            {chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const updatedLabel = chat.updatedAt
                ? formatChatTimestamp(chat.updatedAt)
                : undefined;

              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChat?.(chat.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                      isActive
                        ? 'bg-slate-800/90 text-slate-100'
                        : 'hover:bg-slate-800/80 text-slate-200',
                    )}
                  >
                    <Clock className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate font-medium text-slate-100">
                        {chat.title}
                      </span>
                      {updatedLabel ? (
                        <span className="truncate text-xs text-slate-500">
                          {updatedLabel}
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!isLoading && chats.length === 0 ? (
          <p className="mt-6 px-3 text-sm text-slate-500">
            No chats yet. Start a new conversation to see it here.
          </p>
        ) : null}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        <p>Activity</p>
        <p className="mt-1">Gdynia, Poland · Based on IP address</p>
      </div>
    </aside>
  );
}

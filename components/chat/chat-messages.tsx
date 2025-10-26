"use client";

import { useState, type HTMLAttributes, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatChatTimestamp } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  className?: string;
}

export function ChatMessages({ messages, className }: ChatMessagesProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message', error);
    }
  };

  if (!messages.length) {
    return (
      <div
        className={cn(
          'flex w-full max-w-3xl flex-col items-center justify-center gap-4 text-center text-sm text-slate-400',
          className,
        )}
      >
        <p>No messages yet. Start the conversation below.</p>
      </div>
    );
  }

  return (
    <div className={cn('flex w-full max-w-3xl flex-col gap-6', className)}>
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const isAssistant = message.role === 'assistant';
        const isCopied = copiedMessageId === message.id;

        type CodeProps = HTMLAttributes<HTMLElement> & {
          inline?: boolean;
          className?: string;
          children?: ReactNode;
        };

        const markdownComponents: Components = {
          a: ({ className: linkClassName, children, ...props }) => (
            <a
              {...props}
              className={cn(
                'font-medium underline underline-offset-4',
                linkClassName,
                isUser ? 'text-white' : 'text-sky-300 hover:text-sky-200',
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          code: ({ inline, className: codeClassName, children, ...props }: CodeProps) => (
            <code
              {...props}
              className={cn(
                'rounded-md bg-slate-900/70 px-1.5 py-0.5 text-xs font-mono',
                inline ? 'whitespace-nowrap' : 'block whitespace-pre-wrap',
                codeClassName,
              )}
            >
              {children}
            </code>
          ),
          ul: ({ className: listClassName, children, ...props }) => (
            <ul {...props} className={cn('list-disc space-y-1 pl-6', listClassName)}>
              {children}
            </ul>
          ),
          ol: ({ className: listClassName, children, ...props }) => (
            <ol {...props} className={cn('list-decimal space-y-1 pl-6', listClassName)}>
              {children}
            </ol>
          ),
          p: ({ className: paragraphClassName, children, ...props }) => (
            <p {...props} className={cn('mb-3 last:mb-0', paragraphClassName)}>
              {children}
            </p>
          ),
        };

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
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div
                    className={cn(
                      'prose prose-invert max-w-none text-sm',
                      isUser ? 'prose-headings:text-white prose-strong:text-white' : '',
                    )}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>

                {isAssistant ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn('h-8 w-8 shrink-0 rounded-full border border-slate-700 bg-slate-900/40 p-0 text-slate-200')}
                    onClick={() => handleCopy(message.id, message.content)}
                  >
                    {isCopied ? (
                      <ClipboardCheck className="h-4 w-4" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy response</span>
                  </Button>
                ) : null}
              </div>

              <span
                className={cn(
                  'mt-3 block text-xs',
                  isUser ? 'text-sky-100/80' : 'text-slate-400',
                )}
              >
                {formatChatTimestamp(message.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

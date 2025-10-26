'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';
import { ChatGreeting } from '@/components/chat/chat-greeting';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatMessages } from '@/components/chat/chat-messages';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  createChat,
  deleteChat,
  fetchChats,
  fetchMessages,
  renameChat,
  sendMessage,
} from '@/lib/api/chat';
import { cn } from '@/lib/utils';
import type { ChatMessage, ChatSummary } from '@/types/chat';

interface ChatShellProps {
  userName?: string | null;
}

interface SendMessageVariables {
  chatId: string;
  prompt: string;
}

function truncateTitle(source: string) {
  const trimmed = source.trim() || 'New chat';
  if (trimmed.length <= 60) {
    return trimmed;
  }
  return `${trimmed.slice(0, 57)}…`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function ChatShell({ userName }: ChatShellProps) {
  const queryClient = useQueryClient();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [managementError, setManagementError] = useState<string | null>(null);

  const {
    data: chats = [],
    isLoading: isChatsLoading,
    isError: isChatsError,
    error: chatsError,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  });

  useEffect(() => {
    if (!chats.length) {
      setActiveChatId(null);
      setIsSidebarOpen(false);
      return;
    }

    setActiveChatId((previous) => {
      if (previous && chats.some((chat) => chat.id === previous)) {
        return previous;
      }
      return chats[0].id;
    });
  }, [chats]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(
    () => setIsSidebarOpen((previous) => !previous),
    [],
  );

  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useQuery({
    queryKey: ['chat', activeChatId, 'messages'],
    queryFn: () => fetchMessages(activeChatId as string),
    enabled: Boolean(activeChatId),
  });

  const createChatMutation = useMutation({
    mutationFn: (title: string) => createChat(title),
    onSuccess: (chat) => {
      queryClient.setQueryData<ChatSummary[]>(['chats'], (previous = []) => [
        chat,
        ...previous.filter((item) => item.id !== chat.id),
      ]);
      setActiveChatId(chat.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, prompt }: SendMessageVariables) =>
      sendMessage(chatId, prompt),
    onSuccess: ({ messages: newMessages, remaining }, variables) => {
      const lastTimestamp = newMessages[newMessages.length - 1]?.createdAt;

      setRemainingQuota(remaining ?? null);

      queryClient.setQueryData<ChatMessage[]>(
        ['chat', variables.chatId, 'messages'],
        (previous = []) => [...previous, ...newMessages],
      );

      queryClient.setQueryData<ChatSummary[]>(['chats'], (previous = []) => {
        const rest = previous.filter((chat) => chat.id !== variables.chatId);
        const existing = previous.find((chat) => chat.id === variables.chatId);
        const updated: ChatSummary = existing
          ? {
              ...existing,
              updatedAt: lastTimestamp ?? existing.updatedAt,
            }
          : {
              id: variables.chatId,
              title: 'New chat',
              createdAt: lastTimestamp ?? new Date().toISOString(),
              updatedAt: lastTimestamp ?? new Date().toISOString(),
            };

        return [updated, ...rest];
      });
    },
  });

  const chatsErrorMessage = isChatsError ? getErrorMessage(chatsError) : null;
  const messagesErrorMessage = isMessagesError
    ? getErrorMessage(messagesError)
    : null;

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const handleNewChat = () => {
    if (createChatMutation.isPending) {
      return;
    }
    createChatMutation.mutate('New chat');
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setComposerError(null);
    closeSidebar();
  };

  const handleSendPrompt = async (prompt: string) => {
    if (!prompt.trim()) {
      return;
    }

    setComposerError(null);

    try {
      let chatId = activeChatId;

      if (!chatId) {
        const chat = await createChatMutation.mutateAsync(truncateTitle(prompt));
        chatId = chat.id;
        closeSidebar();
      }

      if (!chatId) {
        throw new Error('Unable to determine chat.');
      }

      await sendMessageMutation.mutateAsync({ chatId, prompt });
    } catch (error) {
      setComposerError(getErrorMessage(error));
    }
  };

  const renameChatMutation = useMutation({
    mutationFn: ({ chatId, title }: { chatId: string; title: string }) =>
      renameChat(chatId, title),
    onSuccess: (updatedChat) => {
      setManagementError(null);
      queryClient.setQueryData<ChatSummary[]>(['chats'], (previous = []) =>
        previous.map((chat) =>
          chat.id === updatedChat.id
            ? { ...chat, title: updatedChat.title, updatedAt: updatedChat.updatedAt }
            : chat,
        ),
      );
    },
    onError: (error) => {
      setManagementError(getErrorMessage(error));
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: (chatId: string) => deleteChat(chatId),
    onSuccess: (_, chatId) => {
      setManagementError(null);
      queryClient.setQueryData<ChatSummary[]>(['chats'], (previous = []) =>
        previous.filter((chat) => chat.id !== chatId),
      );
      queryClient.removeQueries({ queryKey: ['chat', chatId, 'messages'] });

      setActiveChatId((current) => {
        if (current === chatId) {
          const remainingChats = queryClient.getQueryData<ChatSummary[]>(['chats']) ?? [];
          const nextChat = remainingChats[0];
          return nextChat?.id ?? null;
        }
        return current;
      });
    },
    onError: (error) => {
      setManagementError(getErrorMessage(error));
    },
  });

  const isComposerBusy =
    createChatMutation.isPending || sendMessageMutation.isPending;
  const showEmptyState = !isChatsLoading && chats.length === 0;
  const isRenaming = renameChatMutation.isPending;
  const isDeleting = deleteChatMutation.isPending;
  const hasActiveChat = Boolean(activeChatId);

  const handleRenameChat = () => {
    if (!activeChatId || isRenaming) {
      return;
    }

    const currentChat = chats.find((chat) => chat.id === activeChatId);
    const defaultTitle = currentChat?.title ?? 'New chat';
    const newTitle = window.prompt('Rename chat', defaultTitle);

    if (newTitle === null) {
      return;
    }

    const trimmed = newTitle.trim();

    if (!trimmed) {
      setManagementError('Title cannot be empty.');
      return;
    }

    renameChatMutation.mutate({ chatId: activeChatId, title: trimmed });
  };

  const handleDeleteChat = () => {
    if (!activeChatId || isDeleting) {
      return;
    }

    const confirmDeletion = window.confirm(
      'Are you sure you want to delete this chat? This action cannot be undone.',
    );

    if (!confirmDeletion) {
      return;
    }

    deleteChatMutation.mutate(activeChatId, {
      onSuccess: () => {
        setComposerError(null);
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <ChatSidebar
        chats={chats}
        className="hidden lg:flex"
        activeChatId={activeChatId}
        isCreating={createChatMutation.isPending}
        isLoading={isChatsLoading}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
      />

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <button
            type="button"
            className="flex-1 bg-black/60"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          />
          <ChatSidebar
            chats={chats}
            className="flex w-72 flex-col bg-slate-950"
            activeChatId={activeChatId}
            isCreating={createChatMutation.isPending}
            isLoading={isChatsLoading}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col">
        <ChatHeader
          userName={userName ?? undefined}
          onToggleSidebar={toggleSidebar}
          onRenameChat={handleRenameChat}
          onDeleteChat={handleDeleteChat}
          isRenaming={isRenaming}
          isDeleting={isDeleting}
          hasActiveChat={hasActiveChat}
        />

        <main className="flex flex-1 flex-col px-4 py-8 md:px-10">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10">
            <ChatGreeting name={userName ?? undefined} />

            {managementError ? (
              <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-destructive">
                {managementError}
              </div>
            ) : null}

            {chatsErrorMessage ? (
              <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-destructive">
                {chatsErrorMessage}
              </div>
            ) : null}

            {isChatsLoading ? (
              <div className="flex flex-1 flex-col gap-6">
                <Skeleton className="h-12 w-64 rounded-3xl bg-slate-800/60" />
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-24 w-full rounded-3xl bg-slate-800/60"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {showEmptyState ? (
              <ChatEmptyState
                className="flex-1"
                onNewChat={handleNewChat}
                isCreating={createChatMutation.isPending}
              />
            ) : null}

            {!showEmptyState && !isChatsLoading ? (
              <div className="flex flex-1 flex-col items-center gap-6">
                <div className="flex w-full flex-1 flex-col">
                  {messagesErrorMessage ? (
                    <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-destructive">
                      {messagesErrorMessage}
                    </div>
                  ) : null}

                  {isMessagesLoading && activeChat ? (
                    <div className="flex flex-1 flex-col gap-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div
                          key={index}
                          className={cn(
                            'flex w-full justify-start',
                            index % 2 === 0 ? 'justify-end' : 'justify-start',
                          )}
                        >
                          <Skeleton className="h-24 w-3/4 rounded-3xl bg-slate-800/60" />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {!isMessagesLoading ? (
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <div className="flex-1 overflow-y-auto pb-8">
                        <ChatMessages
                          messages={messages}
                          className="flex-1 px-2"
                        />
                      </div>
                      {activeChat ? (
                        <div className="mt-auto flex flex-col gap-3 border-t border-slate-800 pt-6">
                          {composerError ? (
                            <p className="text-sm text-destructive">{composerError}</p>
                          ) : null}
                          <ChatComposer
                            onSubmit={handleSendPrompt}
                            placeholder="Ask Gemini Clone..."
                            className={cn('mx-auto w-full max-w-2xl')}
                            isSubmitting={isComposerBusy}
                          />
                          {typeof remainingQuota === 'number' ? (
                            <p className="text-center text-xs text-slate-500">
                              Daily requests remaining: {remainingQuota}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

import { ChatMessage, ChatSummary } from '@/types/chat';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data?.error || response.statusText;
    throw new Error(error);
  }

  return response.json() as Promise<T>;
}

export async function fetchChats(): Promise<ChatSummary[]> {
  const response = await fetch('/api/chats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<ChatSummary[]>(response);
}

export async function createChat(title: string): Promise<ChatSummary> {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  return handleResponse<ChatSummary>(response);
}

export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<ChatMessage[]>(response);
}

interface SendMessageResult {
  messages: ChatMessage[];
  remaining: number;
}

export async function sendMessage(chatId: string, prompt: string): Promise<SendMessageResult> {
  const response = await fetch(`/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  return handleResponse<SendMessageResult>(response);
}

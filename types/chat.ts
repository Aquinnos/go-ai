export interface ChatSummary {
  id: string;
  title: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

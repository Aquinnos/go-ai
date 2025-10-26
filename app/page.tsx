import { ChatComposer } from '@/components/chat/chat-composer';
import { ChatEmptyState } from '@/components/chat/chat-empty-state';
import { ChatGreeting } from '@/components/chat/chat-greeting';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatSidebar, type ChatSummary } from '@/components/chat/chat-sidebar';

const MOCK_CHATS: ChatSummary[] = [
  { id: '1', title: 'Najlepsze metody kryptografii', updatedAt: '2 days ago' },
  { id: '2', title: 'PHP Zadania z PDF: Wyjaśnienia', updatedAt: '3 days ago' },
  { id: '3', title: 'Czym jest socket w sieci?', updatedAt: '4 days ago' },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <ChatSidebar chats={MOCK_CHATS} className="hidden lg:flex" />

      <div className="flex flex-1 flex-col">
        <ChatHeader userName="Krystian" />

        <main className="flex flex-1 flex-col items-center gap-12 px-4 py-12 md:px-10">
          <ChatGreeting name="Krystian" />

          <ChatComposer className="max-w-2xl" placeholder="Ask Gemini Clone..." />

          <ChatEmptyState className="mt-16" />
        </main>
      </div>
    </div>
  );
}

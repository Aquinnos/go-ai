import { ChatShell } from '@/components/chat/chat-shell';
import { auth } from '@/lib/auth-helper';

export default async function HomePage() {
  const session = await auth();

  return <ChatShell userName={session?.user?.name ?? session?.user?.email ?? undefined} />;
}

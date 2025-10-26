import prisma from './prisma';

export async function getChatsForUser(userId: string) {
  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return chats.map((chat) => ({
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));
}

export async function getMessagesForChat(userId: string, chatId: string) {
  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
    select: { id: true },
  });

  if (!chat) {
    return [];
  }

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  return messages.map((message) => ({
    id: message.id,
    chatId: chat.id,
    role: message.role as 'user' | 'assistant',
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));
}

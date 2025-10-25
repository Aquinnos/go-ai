import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helper';
import prisma from '@/lib/prisma';
import { messageCreateSchema } from '@/lib/validation/chat';
import { generateChatResponse, type ChatMessage } from '@/lib/gemini';
import { consumeQuota } from '@/lib/quota';

interface RouteContext {
  params: {
    chatId: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await prisma.chat.findFirst({
    where: { id: context.params.chatId, userId: session.user.id },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await prisma.chat.findFirst({
    where: { id: context.params.chatId, userId: session.user.id },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = messageCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const quota = await consumeQuota(session.user.id);

  if (!quota.allowed) {
    return NextResponse.json({ error: 'Daily chat limit reached' }, { status: 429 });
  }

  const previousMessages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
  });

  const history: ChatMessage[] = previousMessages.map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  }));

  let assistantReply: string;

  try {
    assistantReply = await generateChatResponse(history, parsed.data.prompt);
  } catch (error) {
    console.error('Gemini response error', error);
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again later.' },
      { status: 502 },
    );
  }

  const userMessage = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: 'user',
      content: parsed.data.prompt,
    },
  });

  const assistantMessage = await prisma.message.create({
    data: {
      chatId: chat.id,
      role: 'assistant',
      content: assistantReply,
    },
  });

  await prisma.chat.update({
    where: { id: chat.id },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({
    messages: [userMessage, assistantMessage],
    remaining: quota.remaining,
  });
}

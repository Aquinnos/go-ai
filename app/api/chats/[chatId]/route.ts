import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helper';
import prisma from '@/lib/prisma';
import { chatUpdateSchema } from '@/lib/validation/chat';
import { logger } from '@/lib/logger';

interface RouteContext {
  params: {
    chatId: string;
  };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await prisma.chat.findFirst({
    where: { id: params.chatId, userId: session.user.id },
  });

  if (!chat) {
    logger.warn('Chat not found on GET', { chatId: params.chatId, userId: session.user.id });
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: chat.id,
    title: chat.title,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await prisma.chat.findFirst({
    where: { id: params.chatId, userId: session.user.id },
  });

  if (!chat) {
    logger.warn('Chat not found on PATCH', { chatId: params.chatId, userId: session.user.id });
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const payload = await request.json();
  const parsed = chatUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    logger.warn('Invalid chat update payload', { errors: parsed.error.flatten(), chatId: chat.id });
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updatedChat = await prisma.chat.update({
    where: { id: chat.id },
    data: {
      title: parsed.data.title.trim(),
    },
  });

  return NextResponse.json({
    id: updatedChat.id,
    title: updatedChat.title,
    createdAt: updatedChat.createdAt.toISOString(),
    updatedAt: updatedChat.updatedAt.toISOString(),
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await prisma.chat.findFirst({
    where: { id: params.chatId, userId: session.user.id },
  });

  if (!chat) {
    logger.warn('Chat not found on DELETE', { chatId: params.chatId, userId: session.user.id });
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  try {
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { chatId: chat.id } }),
      prisma.chat.delete({ where: { id: chat.id } }),
    ]);
  } catch (error) {
    logger.error('Failed to delete chat', { chatId: chat.id, error });
    return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

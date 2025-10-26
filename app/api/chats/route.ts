import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helper';
import prisma from '@/lib/prisma';
import { chatCreateSchema } from '@/lib/validation/chat';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(
    chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    })),
  );
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json();
  const parsed = chatCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const title = parsed.data.title.trim() || 'New chat';

  const chat = await prisma.chat.create({
    data: {
      title,
      userId: session.user.id,
    },
  });

  return NextResponse.json(
    {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}

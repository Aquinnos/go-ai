import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-helper';
import prisma from '@/lib/prisma';
import { profileUpdateSchema } from '@/lib/validation/auth';
import { logger } from '@/lib/logger';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    logger.warn('User not found during profile fetch', { userId: session.user.id });
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = profileUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    logger.warn('Invalid profile update payload', {
      userId: session.user.id,
      errors: parsed.error.flatten(),
    });
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, image } = parsed.data;
  const normalizedImage = image?.trim() ? image.trim() : undefined;

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      image: normalizedImage ?? null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return NextResponse.json(updatedUser);
}

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { auth } from '@/lib/auth-helper';
import prisma from '@/lib/prisma';
import { passwordUpdateSchema } from '@/lib/validation/auth';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = passwordUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    logger.warn('Invalid password update payload', {
      userId: session.user.id,
      errors: parsed.error.flatten(),
    });
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    logger.warn('User not found during password update', { userId: session.user.id });
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.passwordHash) {
    return NextResponse.json(
      { error: 'Password cannot be changed for users without local credentials.' },
      { status: 400 },
    );
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  logger.info('Password updated', { userId: user.id });

  return NextResponse.json({ success: true });
}

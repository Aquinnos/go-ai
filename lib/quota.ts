import prisma from './prisma';

const DEFAULT_DAILY_LIMIT = Number.parseInt(
  process.env.DAILY_CHAT_LIMIT ?? '20',
  10,
);

const MAX_SAFE_LIMIT = 1000;

function normalizeLimit(limit: number) {
  if (Number.isNaN(limit) || limit <= 0) {
    return DEFAULT_DAILY_LIMIT;
  }

  return Math.min(limit, MAX_SAFE_LIMIT);
}

export async function consumeQuota(userId: string) {
  const limit = normalizeLimit(DEFAULT_DAILY_LIMIT);

  if (limit <= 0) {
    return { allowed: true, remaining: Infinity };
  }

  const now = new Date();
  const existing = await prisma.usageQuota.findUnique({
    where: { userId },
  });

  if (!existing) {
    await prisma.usageQuota.create({
      data: {
        userId,
        requestsToday: 1, 
        requestsTotal: 1,
        lastResetAt: now,
      },
    });

    return { allowed: true, remaining: Math.max(limit - 1, 0) };
  }

  const lastResetAt = existing.lastResetAt ?? now;
  const shouldReset = !isSameDay(lastResetAt, now);

  if (shouldReset) {
    const reset = await prisma.usageQuota.update({
      where: { userId },
      data: {
        requestsToday: 0,
        lastResetAt: now,
      },
    });

    existing.requestsToday = reset.requestsToday;
    existing.lastResetAt = reset.lastResetAt;
  }

  if (existing.requestsToday >= limit) {
    return { allowed: false, remaining: 0 };
  }

  const updated = await prisma.usageQuota.update({
    where: { userId },
    data: {
      requestsToday: existing.requestsToday + 1,
      requestsTotal: existing.requestsTotal + 1,
      lastResetAt: now,
    },
  });

  const remaining = Math.max(limit - updated.requestsToday, 0);

  return { allowed: true, remaining };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

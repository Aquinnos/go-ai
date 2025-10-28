import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from './auth';

export async function auth(): Promise<Session | null> {
  return getServerSession(authOptions);
}

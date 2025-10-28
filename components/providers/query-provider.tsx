'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
  session?: unknown;
}

export function Providers({ children, session }: ProvidersProps) {
  const [client] = useState(() => new QueryClient());

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <SessionProvider session={session as any}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}

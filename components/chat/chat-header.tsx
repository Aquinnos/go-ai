"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronsRight, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface ChatHeaderProps {
  userName?: string;
  className?: string;
  onToggleSidebar?: () => void;
}

export function ChatHeader({ userName, className, onToggleSidebar }: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-slate-800 px-6 py-4 text-slate-100',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="hidden md:inline-flex"
        >
          <ChevronsRight className="h-5 w-5" />
          <span className="sr-only">Collapse sidebar</span>
        </Button>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Gemini Clone
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/signin' })}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-sm">
          <Image
            src="/avatar-placeholder.png"
            alt={userName ?? 'User avatar'}
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="hidden text-slate-200 md:inline">
            {userName ?? 'Guest'}
          </span>
        </div>
      </div>
    </header>
  );
}

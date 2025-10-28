"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, MoreHorizontal, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

interface ChatHeaderProps {
  userName?: string;
  className?: string;
  onToggleSidebar?: () => void;
  onRenameChat?: () => void;
  onDeleteChat?: () => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
  hasActiveChat?: boolean;
}

export function ChatHeader({
  userName,
  className,
  onToggleSidebar,
  onRenameChat,
  onDeleteChat,
  isRenaming,
  isDeleting,
  hasActiveChat,
}: ChatHeaderProps) {
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
          className="inline-flex lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Go AI
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!hasActiveChat}>
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">Chat options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              disabled={!hasActiveChat || isRenaming}
              onSelect={(event) => {
                event.preventDefault();
                if (hasActiveChat && !isRenaming) {
                  onRenameChat?.();
                }
              }}
            >
              {isRenaming ? 'Renaming…' : 'Rename chat'}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              disabled={!hasActiveChat || isDeleting}
              onSelect={(event) => {
                event.preventDefault();
                if (hasActiveChat && !isDeleting) {
                  onDeleteChat?.();
                }
              }}
            >
              {isDeleting ? 'Deleting…' : 'Delete chat'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/auth-helper';
import { AccountProfileForm } from '@/components/forms/account-profile-form';
import { AccountPasswordForm } from '@/components/forms/account-password-form';
import { AccountSettingsCard } from '@/components/settings/account-settings-card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Account settings | Go AI',
  description: 'Manage your profile details, avatar and password.',
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-16 text-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-[0_25px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur-xl sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-4 text-slate-200 hover:border-slate-600 hover:bg-slate-800/70"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to chats
              </Link>
            </Button>

            {session?.user?.email ? (
              <p className="hidden text-sm text-slate-400 sm:block">
                Signed in as <span className="text-slate-200">{session.user.email}</span>
              </p>
            ) : null}
          </div>

          <header className="space-y-3 text-center md:text-left">
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-50 md:text-4xl">
              Account settings
            </h1>
            <p className="text-balance text-base leading-relaxed text-slate-300 md:max-w-2xl">
              Update your personal information, manage your avatar and keep your password secure.
            </p>
          </header>

          <div className="flex flex-col gap-10">
            <AccountSettingsCard
              title="Profile information"
              description="Adjust how your name and avatar appear across Go AI."
            >
              <AccountProfileForm className="flex flex-col gap-6" />
            </AccountSettingsCard>

            <AccountSettingsCard
              title="Password"
              description={
                session?.user?.email
                  ? `Change the password associated with ${session.user.email}.`
                  : 'Change your password to keep your account secure.'
              }
            >
              <AccountPasswordForm className="flex flex-col gap-6" />
            </AccountSettingsCard>
          </div>
        </div>
      </div>
    </main>
  );
}

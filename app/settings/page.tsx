import type { Metadata } from 'next';
import { auth } from '@/lib/auth-helper';
import { AccountProfileForm } from '@/components/forms/account-profile-form';
import { AccountPasswordForm } from '@/components/forms/account-password-form';
import { AccountSettingsCard } from '@/components/settings/account-settings-card';

export const metadata: Metadata = {
  title: 'Account settings | Go AI',
  description: 'Manage your profile details, avatar and password.',
};

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-12 md:px-0">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
          Account settings
        </h1>
        <p className="text-sm text-slate-400">
          Update your personal information and keep your account secure.
        </p>
      </header>

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
  );
}

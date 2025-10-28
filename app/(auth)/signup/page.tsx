import Link from 'next/link';
import type { Metadata } from 'next';
import { SignUpForm } from '@/components/forms/sign-up-form';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Create account | Go AI',
};

export default function SignUpPage() {
  return (
    <div className={cn('space-y-8 rounded-3xl bg-slate-900/50 p-8 shadow-lg shadow-slate-950/50 backdrop-blur')}>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">Join Go AI</h1>
        <p className="text-sm text-slate-300">
          Create an account to save chats and continue your explorations.
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-slate-300">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}

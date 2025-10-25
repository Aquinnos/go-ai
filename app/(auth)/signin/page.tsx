import Link from 'next/link';
import { Metadata } from 'next';
import { SignInForm } from '@/components/forms/sign-in-form';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Sign in | Gemini Clone',
};

export default function SignInPage() {
  return (
    <div className={cn('space-y-8 rounded-3xl bg-slate-900/50 p-8 shadow-lg shadow-slate-950/50 backdrop-blur') }>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-50">
          Welcome back
        </h1>
        <p className="text-sm text-slate-300">
          Sign in to continue exploring ideas with Gemini.
        </p>
      </div>

      <SignInForm />

      <p className="text-center text-sm text-slate-300">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-sky-400 hover:text-sky-300">
          Create one
        </Link>
      </p>
    </div>
  );
}

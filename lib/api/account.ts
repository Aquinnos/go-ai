import { ProfileUpdateInput, PasswordUpdateInput } from '@/lib/validation/auth';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const error = data?.error || response.statusText;
    throw new Error(typeof error === 'string' ? error : 'Request failed');
  }

  return response.json() as Promise<T>;
}

export interface AccountProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export async function fetchAccountProfile(): Promise<AccountProfile> {
  const response = await fetch('/api/account/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return handleResponse<AccountProfile>(response);
}

export async function updateAccountProfile(payload: ProfileUpdateInput): Promise<AccountProfile> {
  const response = await fetch('/api/account/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AccountProfile>(response);
}

export async function updateAccountPassword(payload: PasswordUpdateInput): Promise<void> {
  const response = await fetch('/api/account/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  await handleResponse<{ success: boolean }>(response);
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AccountProfile,
  fetchAccountProfile,
  updateAccountProfile,
} from '@/lib/api/account';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validation/auth';

interface AccountProfileFormProps {
  className?: string;
}

export function AccountProfileForm({ className }: AccountProfileFormProps) {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery<AccountProfile>({
    queryKey: ['account', 'profile'],
    queryFn: fetchAccountProfile,
  });

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: '',
      image: '',
    } satisfies Partial<ProfileUpdateInput>,
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name ?? '',
        image: data.image ?? '',
      });
      setPreviewUrl(data.image ?? null);
    }
    // we intentionally omit form from deps to avoid reset loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: ProfileUpdateInput) => updateAccountProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(['account', 'profile'], profile);
      setPreviewUrl(profile.image ?? null);
    },
  });

  const onSubmit = (values: ProfileUpdateInput) => {
    const sanitized: ProfileUpdateInput = {
      name: values.name.trim(),
      image: values.image?.trim() ? values.image.trim() : undefined,
    };

    mutation.mutate(sanitized);
  };

  if (isLoading && !data) {
    return (
      <div className={className}>
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-4 h-48 w-48 rounded-full" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" autoComplete="name" disabled={mutation.isPending} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/avatar.png"
                    autoComplete="off"
                    disabled={mutation.isPending}
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      setPreviewUrl(event.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-800 bg-slate-900">
              {previewUrl ? (
                <Image src={previewUrl} alt="Avatar preview" fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">No image</div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Provide a direct image URL. Future versions could include file upload support.
            </p>
          </div>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>

          {mutation.isError ? (
            <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
          ) : null}

          {mutation.isSuccess ? (
            <p className="text-sm text-emerald-400">Profile updated successfully.</p>
          ) : null}
        </div>
      </form>
    </Form>
  );
}

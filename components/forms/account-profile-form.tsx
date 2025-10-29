'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useState } from 'react';
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

const MAX_AVATAR_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

interface AccountProfileFormProps {
  className?: string;
}

export function AccountProfileForm({ className }: AccountProfileFormProps) {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);

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

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      event.target.value = '';

      if (!file.type.startsWith('image/')) {
        form.setError('image', {
          type: 'manual',
          message: 'Please choose an image file.',
        });
        return;
      }

      if (file.size > MAX_AVATAR_FILE_SIZE) {
        form.setError('image', {
          type: 'manual',
          message: 'Image must be 2MB or smaller.',
        });
        return;
      }

      setIsImageProcessing(true);

      try {
        const dataUrl = await readFileAsDataUrl(file);

        form.clearErrors('image');
        onChange(dataUrl);
        setPreviewUrl(dataUrl);
      } catch (error) {
        form.setError('image', {
          type: 'manual',
          message: error instanceof Error ? error.message : 'We could not read that image. Try again.',
        });
      } finally {
        setIsImageProcessing(false);
      }
    },
    [form],
  );

  const handleRemoveImage = useCallback(
    (onChange: (value: string) => void) => {
      onChange('');
      form.clearErrors('image');
      setPreviewUrl(null);
    },
    [form],
  );

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
                <FormLabel>Avatar</FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <input
                      type="hidden"
                      name={field.name}
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      disabled={mutation.isPending || isImageProcessing}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        void handleFileChange(event, field.onChange)
                      }
                    />
                    {isImageProcessing ? (
                      <p className="text-xs text-slate-400">Processing image…</p>
                    ) : null}
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-800 bg-slate-900">
                        {previewUrl ? (
                          <Image
                            src={previewUrl}
                            alt="Avatar preview"
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-slate-500">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 text-xs text-slate-500">
                        <p>Upload a JPG, PNG, or GIF up to 2MB. We store it locally for your account only.</p>
                        {previewUrl ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="w-fit px-2"
                            onClick={() => handleRemoveImage(field.onChange)}
                            disabled={mutation.isPending || isImageProcessing}
                          >
                            Remove image
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

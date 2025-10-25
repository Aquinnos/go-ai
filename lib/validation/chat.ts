import { z } from 'zod';

export const chatCreateSchema = z.object({
  title: z.string().min(1).max(120),
});

export const messageCreateSchema = z.object({
  prompt: z.string().min(1).max(4000),
});

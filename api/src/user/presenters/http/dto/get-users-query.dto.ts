import { z } from 'zod';

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetUsersQueryDto = z.infer<typeof getUsersQuerySchema>;

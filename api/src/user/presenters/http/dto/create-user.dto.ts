import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullname: z.string().min(1),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

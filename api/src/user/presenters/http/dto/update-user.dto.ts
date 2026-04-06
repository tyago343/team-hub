import { z } from 'zod';

export const updateUserSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    fullname: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      data.email !== undefined ||
      data.password !== undefined ||
      data.fullname !== undefined,
    { message: 'At least one field is required' },
  );

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

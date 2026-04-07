import { z } from 'zod';

export const signupSchema = z
  .object({
    fullname: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    organizationName: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupDto = z.infer<typeof signupSchema>;

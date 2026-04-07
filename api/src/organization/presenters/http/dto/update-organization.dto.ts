import { z } from 'zod';

export const updateOrganizationSchema = z
  .object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
  })
  .refine((data) => data.name !== undefined || data.slug !== undefined, {
    message: 'At least one field is required',
  });

export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;

import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "email.error.invalid" }),
  password: z.string().min(1, { message: "password.error.required" }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

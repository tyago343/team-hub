import { z } from "zod";

export const signupSchema = z
  .object({
    fullname: z.string().min(1, { message: "fullname.error.required" }),
    email: z.email({ message: "email.error.invalid" }),
    password: z.string().min(8, { message: "password.error.minLength" }),
    confirmPassword: z
      .string()
      .min(8, { message: "confirmPassword.error.minLength" }),
    organizationName: z
      .string()
      .min(1, { message: "organizationName.error.required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "confirmPassword.error.match",
    path: ["confirmPassword"],
  });

export type SignupSchema = z.infer<typeof signupSchema>;

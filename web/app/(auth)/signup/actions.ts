import { z } from "zod";
import { signupSchema } from "./signup.schema";

async function createOrganization(formData: FormData) {
  const validatedFields = signupSchema.safeParse({
    fullname: formData.get("fullname"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    organizationName: formData.get("organizationName"),
  });

  if (!validatedFields.success) {
    return { errors: z.treeifyError(validatedFields.error) };
  }
  const { fullname, email, password, confirmPassword, organizationName } =
    validatedFields.data;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/organizations`,
    {
      method: "POST",
      body: JSON.stringify({
        fullname,
        email,
        password,
        confirmPassword,
        organizationName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    return { errors: await response.json() };
  }
  return { data: await response.json() };
}

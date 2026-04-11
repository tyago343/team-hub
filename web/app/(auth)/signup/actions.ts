"use server";

import { z } from "zod";
import { apiClient, ApiError } from "../../../lib/api-client";
import type { AuthSessionResponse } from "../../../lib/auth-types";
import { setAuthCookies } from "../../../lib/auth-cookies";
import { signupSchema, type SignupSchema } from "./signup.schema";

type SignupSuccess = {
  data: AuthSessionResponse;
};

type SignupFailure = {
  errors: unknown;
};

export async function signupAction(
  input: SignupSchema,
): Promise<SignupSuccess | SignupFailure> {
  const validated = signupSchema.safeParse(input);
  if (!validated.success) {
    return { errors: z.treeifyError(validated.error) };
  }

  const { fullname, email, password, confirmPassword, organizationName } =
    validated.data;

  try {
    const data = await apiClient<AuthSessionResponse>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        fullname,
        email,
        password,
        confirmPassword,
        organizationName,
      }),
    });
    await setAuthCookies(data.accessToken, data.refreshToken);
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { errors: err.body };
    }
    throw err;
  }
}

"use server";

import { z } from "zod";
import { apiClient, ApiError } from "../../../lib/api-client";
import { setAuthCookies } from "../../../lib/auth-cookies";
import type { AuthSessionResponse } from "../../../lib/auth-types";
import { loginSchema, type LoginSchema } from "./login.schema";

type LoginSuccess = {
  data: AuthSessionResponse;
};

type LoginFailure = {
  errors: unknown;
};

export async function loginAction(
  input: LoginSchema,
): Promise<LoginSuccess | LoginFailure> {
  const validated = loginSchema.safeParse(input);
  if (!validated.success) {
    return { errors: z.treeifyError(validated.error) };
  }

  const { email, password } = validated.data;

  try {
    const data = await apiClient<AuthSessionResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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

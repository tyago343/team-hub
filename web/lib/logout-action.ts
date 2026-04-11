"use server";

import { redirect } from "next/navigation";
import { apiClient } from "./api-client";
import { clearAuthCookies, getRefreshToken } from "./auth-cookies";

export async function logoutAction(): Promise<void> {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    try {
      await apiClient<void>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        auth: true,
        retryOn401: true,
      });
    } catch {
      // Still clear cookies locally
    }
  }
  await clearAuthCookies();
  redirect("/login");
}

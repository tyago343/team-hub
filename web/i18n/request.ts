import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "TEAMHUB_LOCALE";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value || "en";
  return {
    locale,
    messages: (await import(`./messages/${locale}/signup.json`)).default,
  };
});

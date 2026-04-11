import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "TEAMHUB_LOCALE";

const DEFAULT_LOCALE = "en";

async function loadMessagesForLocale(locale: string): Promise<{
  locale: string;
  messages: Record<string, unknown>;
}> {
  try {
    const [signup, login] = await Promise.all([
      import(`./messages/${locale}/signup.json`),
      import(`./messages/${locale}/login.json`),
    ]);
    return {
      locale,
      messages: {
        ...signup.default,
        ...login.default,
      },
    };
  } catch {
    if (locale === DEFAULT_LOCALE) {
      throw new Error(
        `Failed to load default locale messages (${DEFAULT_LOCALE})`,
      );
    }
    return loadMessagesForLocale(DEFAULT_LOCALE);
  }
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested =
    cookieStore.get(LOCALE_COOKIE_NAME)?.value || DEFAULT_LOCALE;
  return loadMessagesForLocale(requested);
});

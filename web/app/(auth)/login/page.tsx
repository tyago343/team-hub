import LoginForm from "./login.form";
import { useTranslations } from "next-intl";

const LoginPage = () => {
  const t = useTranslations("login");

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center bg-surface-page px-4 py-10 sm:px-6">
        <div className="flex w-[90%] max-w-[960px] flex-col overflow-hidden rounded-xl bg-surface-card shadow-lg lg:min-h-[520px] lg:flex-row">
          <aside className="relative flex w-full flex-col justify-between gap-10 bg-gradient-to-b from-primary-600 to-primary-900 px-10 py-12 text-white lg:w-1/2 lg:min-w-[320px] lg:gap-0">
            <div className="relative z-10 flex flex-col gap-6">
              <p className="text-h3 font-bold tracking-tight text-white">
                {t("marketing.teamhub")}
              </p>
              <h1 className="text-[clamp(1.75rem,4.2vw,2.75rem)] font-bold leading-[1.12] tracking-tight text-white">
                {t("marketing.title")}
              </h1>
              <p className="max-w-lg text-body leading-relaxed text-white/85">
                {t("marketing.description")}
              </p>
            </div>

            <figure className="relative z-10 mt-2 rounded-lg bg-white/[0.12] p-5 lg:mt-10">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-body font-semibold text-white">
                  {t("marketing.testimony.initials")}
                </div>
                <div className="min-w-0 flex-1">
                  <figcaption className="text-left">
                    <span className="text-body font-semibold text-white">
                      {t("marketing.testimony.name")}
                    </span>
                    <span className="mt-0.5 block text-body-sm text-white/80">
                      {t("marketing.testimony.title")}
                    </span>
                  </figcaption>
                  <blockquote className="mt-3 border-none p-0">
                    <p className="text-body-sm italic leading-relaxed text-white/95">
                      &ldquo;{t("marketing.testimony.text")}&rdquo;
                    </p>
                  </blockquote>
                </div>
              </div>
            </figure>
          </aside>

          <div className="flex w-full flex-col bg-surface-card px-10 py-12 lg:w-1/2">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "./login.schema";
import { loginAction } from "./actions";

function LoginForm() {
  const t = useTranslations("login.form");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    const result = await loginAction(data);
    if ("errors" in result) {
      const err = result.errors as { message?: string; statusCode?: number };
      const message =
        typeof err.message === "string" ? err.message : t("error.generic");
      setError("root", {
        type: "server",
        message,
      });
      return;
    }
    if (typeof window !== "undefined") {
      window.location.assign("/dashboard");
    }
  };

  const labelClass = "text-overline uppercase text-gray-500";
  const inputClass =
    "w-full rounded-md border border-border-default bg-surface-input px-3 py-2.5 pr-10 text-body text-gray-900 outline-none ring-primary-500 placeholder:text-gray-400 focus:border-primary-500 focus:ring-2";

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="space-y-1">
        <h2 className="text-h2 text-gray-900">{t("title")}</h2>
        <p className="text-body text-gray-500">{t("description")}</p>
      </header>

      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="login-email">
            {t("email.label")}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder={t("email.placeholder")}
            {...register("email")}
          />
          {errors.email?.message ? (
            <p
              id="login-email-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.email.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="login-password">
            {t("password.label")}
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            placeholder={t("password.placeholder")}
            {...register("password")}
          />
          {errors.password?.message ? (
            <p
              id="login-password-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.password.message)}
            </p>
          ) : null}
        </div>

        {errors.root?.message ? (
          <p
            className="text-caption text-error-500"
            role="alert"
            id="login-root-error"
          >
            {errors.root.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-3 text-body font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("submit")}
        </button>

        <p className="text-center text-body-sm text-gray-500">
          {t("noAccount")}
          <Link
            href="/signup"
            className="font-medium text-primary-600 hover:underline ml-2"
          >
            {t("signup")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;

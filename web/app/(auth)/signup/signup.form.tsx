"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupSchema } from "./signup.schema";

function SignupForm() {
  const t = useTranslations("signup.form");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
    },
  });

  const onSubmit = (data: SignupSchema) => {
    console.log(data);
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
          <label className={labelClass} htmlFor="fullname">
            {t("fullname.label")}
          </label>
          <input
            id="fullname"
            type="text"
            autoComplete="name"
            className={inputClass}
            placeholder={t("fullname.placeholder")}
            {...register("fullname")}
          />
          {errors.fullname?.message ? (
            <p
              id="fullname-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.fullname.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="email">
            {t("email.label")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder={t("email.placeholder")}
            {...register("email")}
          />
          {errors.email?.message ? (
            <p
              id="email-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.email.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="organizationName">
            {t("organizationName.label")}
          </label>
          <input
            id="organizationName"
            type="text"
            autoComplete="organization"
            className={inputClass}
            placeholder={t("organizationName.placeholder")}
            {...register("organizationName")}
          />
          {errors.organizationName?.message ? (
            <p
              id="organizationName-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.organizationName.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="password">
            {t("password.label")}
          </label>
          <div className="relative">
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              placeholder={t("password.placeholder")}
              {...register("password")}
            />
          </div>
          <p id="password-hint" className="text-caption text-gray-500">
            {t("password.hint")}
          </p>
          {errors.password?.message ? (
            <p
              id="password-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.password.message)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClass} htmlFor="confirmPassword">
            {t("confirmPassword.label")}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              placeholder={t("confirmPassword.placeholder")}
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword?.message ? (
            <p
              id="confirmPassword-error"
              className="text-caption text-error-500"
              role="alert"
            >
              {t(errors.confirmPassword.message)}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-3 text-body font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("submit")}
        </button>

        <p className="text-center text-body-sm text-gray-500">
          {t.rich("terms", {
            termsLink: (chunks) => (
              <Link
                href="/terms"
                className="font-medium text-primary-600 hover:underline"
              >
                {chunks}
              </Link>
            ),
            privacyLink: (chunks) => (
              <Link
                href="/privacy"
                className="font-medium text-primary-600 hover:underline"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>

        <p className="text-center text-body-sm text-gray-500">
          {t("alreadyHaveAccount")}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:underline ml-2"
          >
            {t("login")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;

import { useTranslations } from "next-intl";

const SignupPage = () => {
  const t = useTranslations("signup");
  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
};

export default SignupPage;

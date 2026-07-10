import { useMe } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";

export function Settings() {
  const { data: user } = useMe();
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">{t("settings")}</h2>

      <div className="bg-white rounded shadow-sm p-4 mb-6">
        <h3 className="text-lg font-medium mb-2">{t("account")}</h3>
        <p className="text-sm text-gray-600">
          {t("logged_in_as")} <strong>{user?.username || "..."}</strong>
        </p>
      </div>

      <div className="bg-white rounded shadow-sm p-4">
        <h2 className="text-lg font-medium mb-4">{t("change_password")}</h2>
        <p className="text-gray-500 text-sm">{t("password_change_unavailable")}</p>
      </div>
    </div>
  );
}


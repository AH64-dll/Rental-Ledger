import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useLogin();
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    login.mutate(
      { username, password },
      {
        onSuccess: (data: { access_token: string }) => {
          localStorage.setItem("token", data.access_token);
          const redirect = searchParams.get("redirect") || "/dashboard";
          navigate(redirect, { replace: true });
        },
        onError: () => {
          setError(t("invalid_credentials"));
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded shadow-sm w-full max-w-sm relative">
        <div className="absolute top-4 end-4">
          <button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded font-medium transition-colors"
          >
            {language === "ar" ? "English" : "العربية"}
          </button>
        </div>
        <h1 className="text-xl font-bold mb-6">{t("login_title")}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("username")}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={login.isPending}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {login.isPending ? t("signing_in") : t("sign_in")}
          </button>
        </form>
      </div>
    </div>
  );
}


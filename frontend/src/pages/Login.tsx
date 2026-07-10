import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { Card, CardBody } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ErrorBanner";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useLogin();
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState<boolean>(
    () => typeof window !== "undefined" && !!localStorage.getItem("token")
  );

  useEffect(() => {
    if (!redirecting && typeof window !== "undefined" && localStorage.getItem("token")) {
      setRedirecting(true);
    }
  }, [redirecting]);

  if (redirecting) return <Navigate to="/dashboard" replace />;

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
        onError: (err: unknown) => setError(String((err as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail || (err as { message?: string })?.message || t("invalid_credentials"))),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex justify-end mb-3">
          <button
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {language === "ar" ? "English" : "العربية"}
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="px-6 pt-8 pb-2 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xl mb-3">
              R
            </div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {t("login_title")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {language === "ar" ? "سجل دخولك للمتابعة" : "Sign in to continue"}
            </p>
          </div>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label={t("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
              <Input
                label={t("password")}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {error && <ErrorBanner error={error} />}
              <Button type="submit" className="w-full" loading={login.isPending}>
                {login.isPending ? t("signing_in") : t("sign_in")}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

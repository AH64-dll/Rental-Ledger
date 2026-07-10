import { useState } from "react";
import { useMe, useUpdateProfile } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../components/ui/Toast";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { User as UserIcon } from "../components/ui/AppIcon";

export function Settings() {
  const { data: user } = useMe();
  const { t } = useLanguage();
  const updateProfileMutation = useUpdateProfile();
  const toast = useToast();

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword && newPassword !== confirmNewPassword) {
      setError(t("passwords_dont_match"));
      return;
    }
    if (!newUsername && !newPassword) {
      setError(t("nothing_to_update"));
      return;
    }

    updateProfileMutation.mutate(
      {
        new_username: newUsername || undefined,
        new_password: newPassword || undefined,
        current_password: currentPassword,
      },
      {
        onSuccess: () => {
          toast.success(t("credentials_updated_success"));
          setNewUsername("");
          setNewPassword("");
          setConfirmNewPassword("");
          setCurrentPassword("");
        },
        onError: (err: { response?: { data?: { detail?: string } }; message?: string }) => {
          const msg = err?.response?.data?.detail || err?.message || t("operation_failed");
          setError(typeof msg === "string" ? msg : t("operation_failed"));
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t("settings")} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserIcon size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t("account")}</h3>
              <p className="text-xs text-slate-500">
                {t("logged_in_as")} <span className="font-semibold text-slate-700">{user?.username || "..."}</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                {t("username")}
              </div>
              <div className="text-slate-900 font-medium">{user?.username || "—"}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-base font-semibold text-slate-900">
            {t("change_password")} / {t("change_username")}
          </h3>
        </CardHeader>
        <CardBody>
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-sm"
            >
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={`${t("new_username")} (${t("optional")})`}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={user?.username || ""}
            />
            <Input
              label={`${t("new_password")} (${t("optional")})`}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            {newPassword && (
              <Input
                label={t("confirm_new_password")}
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            )}
            <Input
              label={`${t("current_password")} *`}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
